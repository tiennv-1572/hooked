#!/usr/bin/env bash
#
# Dong goi mot ban phat hanh Hooked de deploy len hosting cPanel (Setup Node.js App / Passenger).
#
#   ./scripts/release.sh                      # dung SITE_URL trong deploy.config
#   ./scripts/release.sh https://hooked.vn    # ghi de SITE_URL cho lan nay
#   ./scripts/release.sh --code-only          # chi goi code, KHONG dump database
#
# Tao ra trong thu muc releases/:
#   code_build_<timestamp>.zip  - ma nguon + ban build .next + storage/uploads + .env cho hosting
#                                 + package-lock.json (hosting cai bang npm; repo giu san, xem `pnpm lock:npm`)
#                                 (KHONG co node_modules, khong co do chi dung o may dev)
#   data_sql_<timestamp>.zip    - DUY NHAT mot file .sql (bo qua khi --code-only)
#
# Lan deploy DAU: nap data_sql. Cac lan SAU: dung --code-only va chay `npm run db:migrate`
# tren hosting — nap lai ban dump se GHI DE du lieu that tren hosting (dang ky tu van,
# noi dung sua trong CMS, tai khoan admin).
#
# Anh tai len qua CMS nam o storage/uploads (ngoai public/, xem src/server/cms/uploads.ts) va
# di kem goi code. Cap nhat lan sau bang `unzip -o` cung khong mat anh: no chi ghi de file
# trung ten, ma anh tai len deu mang ten rieng nen khong file nao trong goi trung voi chung.
#
# Dev server (`pnpm dev`) KHONG can tat: Next 16 de ban dev o .next/dev, script chi xoa phan
# build cua .next va giu nguyen .next/dev.

set -euo pipefail

# --- Luon chay tu thu muc goc du an, du goi script tu dau -------------------------
cd "$(dirname "${BASH_SOURCE[0]}")/.."
ROOT="$(pwd)"

RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; BOLD=$'\033[1m'; OFF=$'\033[0m'
step()  { printf '\n%s==> %s%s\n' "$BOLD" "$1" "$OFF"; }
ok()    { printf '    %s✓%s %s\n' "$GREEN" "$OFF" "$1"; }
warn()  { printf '    %s!%s %s\n' "$YELLOW" "$OFF" "$1"; }
# Xoa goi dang lam do neu dut giua chung: mot goi chua qua duoc buoc kiem tra ma con
# nam lai trong releases/ thi som muon cung co nguoi deploy nham no.
cleanup_partial() {
  [[ -n "${CODE_ZIP:-}" && -f "${CODE_ZIP:-}" ]] && rm -f "$CODE_ZIP"
  [[ -n "${DATA_ZIP:-}" && -f "${DATA_ZIP:-}" ]] && rm -f "$DATA_ZIP"
  return 0
}
die()   { cleanup_partial; printf '\n%sLoi:%s %s\n\n' "$RED" "$OFF" "$1" >&2; exit 1; }
# `set -e` dung script ma khong noi gi: bao ra lenh hong va xoa goi dang lam do.
trap 'die "Lenh that bai (dong $LINENO, ma $?): $BASH_COMMAND"' ERR

# --- 0. Doi so ----------------------------------------------------------------------
WITH_DB=1
SITE_URL_ARG=""
for arg in "$@"; do
  case "$arg" in
    --code-only) WITH_DB=0 ;;
    -h|--help) sed -n '2,25p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    -*) die "Khong hieu tuy chon: $arg  (dung --code-only hoac --help)" ;;
    *) SITE_URL_ARG="$arg" ;;
  esac
done

# --- 1. Doc cau hinh hosting -------------------------------------------------------
#
# Moi thong tin cua NOI DEN nam trong `deploy.config`. Con ban dump database van lay tu
# `.env` cua may local - hai thu nay co chu dich khong tron lan, de khong bao gio lo
# dump nham tu database that.
CONFIG="$ROOT/deploy.config"

if [[ ! -f "$CONFIG" ]]; then
  die "Chua co file deploy.config.

     Tao bang:   cp deploy.config.example deploy.config
     roi dien ten mien va thong tin database cua hosting vao."
fi

# shellcheck disable=SC1090
source "$CONFIG"

# Doi so tren dong lenh (neu co) ghi de SITE_URL - tien khi can build thu mot ten mien khac.
SITE_URL="${SITE_URL_ARG:-${SITE_URL:-}}"

need() {
  local name="$1" value="${2:-}" placeholder="${3:-}"
  [[ -n "$value" ]] || die "deploy.config thieu $name."
  [[ -z "$placeholder" || "$value" != "$placeholder" ]] \
    || die "deploy.config: $name van dang la gia tri mau, chua dien that."
}

# Gia tri mau phai TRUNG voi deploy.config.example.
need SITE_URL    "${SITE_URL:-}"    "https://tenmien.com"
need DB_NAME     "${DB_NAME:-}"     "taikhoan_hooked"
need DB_USER     "${DB_USER:-}"     "taikhoan_hooked"
need DB_PASS     "${DB_PASS:-}"     "dien-mat-khau-that"
need AUTH_SECRET "${AUTH_SECRET:-}" "sinh-chuoi-moi-truoc-khi-deploy"

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
REGISTRATION_RATE_LIMIT="${REGISTRATION_RATE_LIMIT:-5}"

[[ "$SITE_URL" =~ ^https?:// ]] || die "SITE_URL phai bat dau bang http:// hoac https://  (dang nhan: $SITE_URL)"

if [[ "$SITE_URL" == *localhost* || "$SITE_URL" == *127.0.0.1* ]]; then
  die "SITE_URL dang tro ve may local: $SITE_URL
     Open Graph, sitemap, robots va dia chi trong tai lieu API se tro ve localhost."
fi

[[ "$REGISTRATION_RATE_LIMIT" =~ ^[0-9]+$ ]] || die "REGISTRATION_RATE_LIMIT phai la so nguyen (dang nhan: $REGISTRATION_RATE_LIMIT)."
[[ "$REGISTRATION_RATE_LIMIT" != "0" ]] \
  || warn "REGISTRATION_RATE_LIMIT=0 tat chong spam form Dang ky tu van — chi nen dung khi chay e2e."

(( ${#AUTH_SECRET} >= 32 )) || die "AUTH_SECRET qua ngan (${#AUTH_SECRET} ky tu, can >= 32).
     Sinh moi: node -e \"console.log(require('crypto').randomBytes(32).toString('base64url'))\""

# Canh bao neu AUTH_SECRET trung voi may local - dung chung bi mat giua hai moi truong
# la mot phien danh cap o day dung duoc ca o kia.
if [[ -f .env ]] && grep -qF -- "$AUTH_SECRET" .env; then
  warn "AUTH_SECRET giong het gia tri trong .env cua may local. Nen dung chuoi rieng cho hosting."
fi

SITE_URL="${SITE_URL%/}"   # bo dau / thua o cuoi

# Ghep DATABASE_URL, CO ma hoa user/mat khau.
#
# Bat buoc phai ma hoa: mat khau cPanel tu sinh hay co @ # % & — ghep tho vao URL la
# mysql2 khong parse noi (vd "Ab#1@xy%z" lam URL hong hoan toan).
DATABASE_URL=$(node -e '
  const [u, p, h, port, d] = process.argv.slice(1);
  const e = encodeURIComponent;
  console.log(`mysql://${e(u)}:${e(p)}@${h}:${port}/${d}`);
' "$DB_USER" "$DB_PASS" "$DB_HOST" "$DB_PORT" "$DB_NAME")

# --- 2. Chuan bi ------------------------------------------------------------------
command -v zip  >/dev/null || die "Khong tim thay lenh 'zip'."
command -v pnpm >/dev/null || die "Khong tim thay lenh 'pnpm' (du an build bang pnpm)."
command -v npm  >/dev/null || die "Khong tim thay lenh 'npm' (can de kiem tra package-lock.json cho hosting)."

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$ROOT/releases"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

mkdir -p "$OUT"

CODE_ZIP="$OUT/code_build_${STAMP}.zip"
DATA_ZIP="$OUT/data_sql_${STAMP}.zip"
SQL_NAME="hooked_${STAMP}.sql"

printf '%s%s%s\n' "$BOLD" "Dong goi ban phat hanh Hooked — $STAMP" "$OFF"
printf '    Site:     %s\n' "$SITE_URL"
printf '    Database: %s@%s:%s/%s\n' "$DB_USER" "$DB_HOST" "$DB_PORT" "$DB_NAME"
(( WITH_DB )) || printf '    Che do:   --code-only (khong dump database)\n'

# --- 3. Xuat database -------------------------------------------------------------
if (( WITH_DB )); then
  step "Xuat database"

  DB_CONTAINER="hooked-mysql"   # docker-compose.yml

  docker ps --format '{{.Names}}' 2>/dev/null | grep -qx "$DB_CONTAINER" \
    || die "Container '$DB_CONTAINER' khong chay.
     Chay 'pnpm db:up' truoc, roi thu lai."

  # Doc thong tin ket noi tu .env de khong hardcode mat khau vao script.
  [[ -f .env ]] || die "Khong thay file .env de doc DATABASE_URL."

  # Ten bien co tien to LOCAL_: DB_NAME/DB_USER/DB_PASS la cua HOSTING (doc tu
  # deploy.config o tren), khong duoc ghi de len chung.
  eval "$(node -e '
    require("fs").readFileSync(".env", "utf8")
      .split("\n")
      .filter((l) => l.startsWith("DATABASE_URL"))
      .slice(-1)
      .forEach((l) => {
        const raw = l.slice(l.indexOf("=") + 1).trim().replace(/^["\x27]|["\x27]$/g, "");
        const u = new URL(raw);
        const q = (s) => "\x27" + String(s).replace(/\x27/g, "\x27\\\x27\x27") + "\x27";
        console.log(`LOCAL_DB_USER=${q(decodeURIComponent(u.username))}`);
        console.log(`LOCAL_DB_PASS=${q(decodeURIComponent(u.password))}`);
        console.log(`LOCAL_DB_NAME=${q(u.pathname.replace(/^\//, ""))}`);
      });
  ')"

  [[ -n "${LOCAL_DB_NAME:-}" ]] || die "Khong doc duoc DATABASE_URL trong .env."

  # Nap file dump vao database co ten khac (tien to tai khoan cPanel), nen KHONG kem lenh
  # CREATE DATABASE / USE: file chi chua bang + du lieu, nap vao database nao cung duoc.
  docker exec -i "$DB_CONTAINER" mysqldump \
    -u "$LOCAL_DB_USER" -p"$LOCAL_DB_PASS" \
    --single-transaction --no-tablespaces \
    --default-character-set=utf8mb4 --set-gtid-purged=OFF \
    "$LOCAL_DB_NAME" > "$WORK/$SQL_NAME" 2>"$WORK/dump.err" \
    || { grep -v "Using a password" "$WORK/dump.err" >&2; die "mysqldump that bai."; }

  ok "Dump tu container $DB_CONTAINER (database local: $LOCAL_DB_NAME -> se nap vao $DB_NAME)"

  # Kiem tra ban dump thay vi tin la no dung ---------------------------------------
  TABLES=$(grep -c '^CREATE TABLE' "$WORK/$SQL_NAME" || true)
  INSERTS=$(grep -c '^INSERT INTO' "$WORK/$SQL_NAME" || true)

  [[ "$TABLES" -gt 0 ]] || die "Ban dump khong co bang nao — dung lai de khong mang di file rong."
  # Bang lich su migration cua Drizzle: nho no ma `npm run db:migrate` tren hosting biet
  # migration nao da chay, khong chay lai.
  grep -q '^CREATE TABLE `__drizzle_migrations`' "$WORK/$SQL_NAME" \
    || die "Ban dump khong co bang __drizzle_migrations — chay 'pnpm db:migrate' o local truoc."
  for table in singletons media users; do
    grep -q "^INSERT INTO \`$table\`" "$WORK/$SQL_NAME" \
      || die "Bang $table trong ban dump khong co du lieu — database local chua seed? ('pnpm db:setup')"
  done

  ok "$TABLES bang, $INSERTS lenh INSERT, $(du -h "$WORK/$SQL_NAME" | cut -f1)"
fi

# --- 4. Build ---------------------------------------------------------------------
step "Build ma nguon"

# Xoa ban build cu nhung GIU .next/dev (dev server dang chay dung no) va .next/cache
# (cache build, giup build nhanh hon). Ca hai deu bi loai khoi goi.
if [[ -d .next ]]; then
  find .next -mindepth 1 -maxdepth 1 ! -name dev ! -name cache -exec rm -rf {} +
fi

# NEXT_PUBLIC_* duoc nhung thang vao ban build — dat sai o day thi sua .env tren hosting
# cung khong co tac dung, phai build lai. Bien moi truong cua shell uu tien hon .env local.
NEXT_PUBLIC_SITE_URL="$SITE_URL" pnpm build

[[ -d .next/server ]] || die "Build xong nhung khong thay .next/server — build that bai."
[[ -f .next/BUILD_ID ]] || die "Build xong nhung khong thay .next/BUILD_ID — 'next start' tren hosting se khong chay."

# Chi tinh phan se duoc dong goi.
BUILD_SIZE=$(du -shc .next/server .next/static 2>/dev/null | tail -1 | cut -f1)
ok "Build xong (phan se dong goi: $BUILD_SIZE)"

# Kiem tra dia chi that su nam trong ban build -------------------------------------
# NEXT_PUBLIC_SITE_URL chi dung o phia server (metadata, sitemap, OpenAPI) nen tim ca
# .next/server lan .next/static.
if grep -rqsF --include='*.js' --include='*.html' --include='*.body' -- "$SITE_URL" .next/server .next/static 2>/dev/null; then
  ok "Dia chi $SITE_URL da duoc nhung vao ban build"
else
  warn "Khong tim thay $SITE_URL trong ban build — kiem tra lai bien NEXT_PUBLIC_SITE_URL."
fi

# --- 5. package-lock.json cho hosting ------------------------------------------------
step "Kiem tra package-lock.json"

# Hosting cPanel cai bang npm (nut "Run NPM Install" / Terminal), con du an dung pnpm. Repo
# giu san package-lock.json (sinh bang `pnpm lock:npm`, xem scripts/npm-lock.sh) de hosting
# cai dung bo phien ban da build va kiem thu. O day chi KIEM TRA no con khop package.json,
# bang chinh lenh se chay tren hosting — khong sinh lai, de goi mang di dung file da commit.
[[ -f package-lock.json ]] || die "Chua co package-lock.json. Chay 'pnpm lock:npm' roi commit file do."

mkdir -p "$WORK/lock-check"
cp package.json package-lock.json "$WORK/lock-check/"
( cd "$WORK/lock-check" && npm ci --omit=dev --dry-run --ignore-scripts --no-audit --no-fund >"$WORK/npm-ci.log" 2>&1 ) \
  || { grep 'npm error' "$WORK/npm-ci.log" | head -8 >&2; die "package-lock.json lech voi package.json ('npm ci' tu choi).
     Chay 'pnpm lock:npm' roi commit lai package-lock.json."; }

# Dong bo voi nhung goi phai giong het ban build.
for pkg in next react react-dom; do
  want=$(node -p "require('./package.json').dependencies['$pkg']")
  got=$(node -p "require('./package-lock.json').packages['node_modules/$pkg'].version")
  [[ "$want" == "$got" ]] || die "package-lock.json co $pkg@$got, khac voi package.json ($want). Chay 'pnpm lock:npm'."
done
node -e "process.exit(require('./package-lock.json').packages['node_modules/@img/sharp-linux-x64'] ? 0 : 1)" \
  || warn "package-lock.json khong co @img/sharp-linux-x64 — toi uu anh tren hosting Linux co the loi."
ok "package-lock.json: khop package.json, npm ci chap nhan, co sharp cho Linux"

# --- 6. Goi ma nguon + ban build ---------------------------------------------------
step "Dong goi code_build"

# Sinh `.env` cho hosting tu deploy.config. Nho file nay ma giai nen xong la ung dung
# chay duoc luon, khong phai go lai tung bien trong giao dien cPanel.
cat > "$WORK/.env" <<ENVFILE
# File nay do scripts/release.sh sinh ra tu deploy.config — dung sua tay o day,
# sua trong deploy.config roi dong goi lai.
# Sinh luc: $STAMP

NODE_ENV=production
NEXT_PUBLIC_SITE_URL="$SITE_URL"
DATABASE_URL="$DATABASE_URL"
AUTH_SECRET="$AUTH_SECRET"
REGISTRATION_RATE_LIMIT=$REGISTRATION_RATE_LIMIT
ENVFILE

# Moi file .env* cua may local bi loai truoc (chan mac dinh), roi them lai dung hai file:
# `.env` vua sinh o tren va `.env.example`. Lam nguoc lai - liet ke tung file can loai -
# thi mai nay ai them `.env.production` la ro ri ma khong ai hay.
#
# GIU LAI: src/, drizzle/ va scripts/db-*.ts — `npm run db:migrate` tren hosting can ca
# ba (drizzle.config.ts doc drizzle/, scripts/db-data-migrate.ts import tu src/).
zip -qr "$CODE_ZIP" . \
  -x 'node_modules/*' \
     '.git/*' \
     'releases/*' \
     '.next/cache/*' \
     '.next/dev/*' \
     '.env*' \
     'deploy.config' 'deploy.config.example' \
     'docker/*' 'docker-compose.yml' \
     'plan/*' 'REPORT.md' \
     'tests/*' 'test-results/*' 'playwright-report/*' 'playwright.config.ts' \
     '.claude/*' \
     'scripts/release.sh' \
     '.vscode/*' '.idea/*' \
     'tsconfig.tsbuildinfo' \
     '*.zip' \
     '*.log' \
     '.DS_Store' '*/.DS_Store'

( cd "$WORK" && zip -q "$CODE_ZIP" .env )
[[ -f .env.example ]] && zip -q "$CODE_ZIP" .env.example

# Kiem tra lai noi dung goi.
#
# Liet ke ra file roi grep tren file, KHONG grep thang tren ong dan: `grep -q` thoat
# ngay khi tim thay, lam `unzip` nhan SIGPIPE, va `set -o pipefail` bien ket qua DUNG
# thanh loi.
unzip -Z1 "$CODE_ZIP" > "$WORK/code.list"

# Chi duoc phep co dung `.env` (ban vua sinh) va `.env.example`.
LEAK=$(grep -E '^(\.env($|\.)|node_modules/|\.next/(cache|dev)/|releases/|deploy\.config|docker/|docker-compose\.yml$|plan/|tests/|test-results/|playwright-report/|\.claude/|scripts/release\.sh$|tsconfig\.tsbuildinfo$|[^/]+\.zip$)' "$WORK/code.list" \
        | grep -vE '^\.env(\.example)?$' || true)
[[ -z "$LEAK" ]] || die "Goi code lot file khong duoc phep:
$LEAK"

# Doc nguoc `.env` tu trong goi ra de chac chan do la ban sinh cho hosting, khong phai
# file cua may local bi lot vao.
unzip -p "$CODE_ZIP" .env > "$WORK/env.check"
grep -q "do scripts/release.sh sinh ra" "$WORK/env.check" \
  || die "File .env trong goi khong phai ban sinh cho hosting."
grep -qF "NEXT_PUBLIC_SITE_URL=\"$SITE_URL\"" "$WORK/env.check" \
  || die "File .env trong goi co SITE_URL sai."
# So khop CHINH XAC phan duoi cua URL (`/<ten-db>"`), khong phai tim chuoi con: neu chi
# tim chuoi con thi ten "hooked" van khop voi URL tro toi "tk_hooked".
grep -qF -- "/$DB_NAME\"" "$WORK/env.check" \
  || die "File .env trong goi khong tro toi database $DB_NAME.
     Dang co trong goi:
     $(grep '^DATABASE_URL' "$WORK/env.check" | sed -E 's|//[^:]+:[^@]*@|//***:***@|')"

# Nhung file ma hosting bat buoc phai co.
for required in server.js package.json package-lock.json next.config.ts .next/BUILD_ID drizzle.config.ts scripts/db-data-migrate.ts; do
  grep -qxF "$required" "$WORK/code.list" || die "Goi code thieu $required."
done
grep -q '^\.next/server/' "$WORK/code.list" || die "Goi code thieu .next/server — ban build chua vao goi."
grep -q '^\.next/static/' "$WORK/code.list" || die "Goi code thieu .next/static — trang se khong co CSS/JS."
grep -q '^drizzle/meta/_journal\.json$' "$WORK/code.list" || die "Goi code thieu drizzle/ — 'npm run db:migrate' tren hosting se khong chay."
grep -qx '\.env\.example' "$WORK/code.list" \
  || warn "Goi code khong co .env.example (file mau bien moi truong)."

# Anh tai len qua CMS di theo goi code, nen phai dem lai cho chac.
# Thu muc chi xuat hien sau lan tai anh dau tien qua CMS.
UPLOAD_COUNT=0
[[ -d storage/uploads ]] && UPLOAD_COUNT=$(find storage/uploads -type f ! -name '.DS_Store' | wc -l | tr -d ' ')
if [[ "$UPLOAD_COUNT" -gt 0 ]]; then
  ZIPPED=$(grep -c '^storage/uploads/.*[^/]$' "$WORK/code.list" || true)
  [[ "$ZIPPED" -ge "$UPLOAD_COUNT" ]] \
    || die "Goi code thieu anh: co $UPLOAD_COUNT file trong storage/uploads nhung chi $ZIPPED file vao goi."
  ok "Kem $UPLOAD_COUNT file anh trong storage/uploads"
else
  ok "storage/uploads chua co file nao (anh cua website nam trong public/images, di theo ma nguon)"
fi

ok "$(basename "$CODE_ZIP") — $(du -h "$CODE_ZIP" | cut -f1), $(wc -l < "$WORK/code.list" | tr -d ' ') muc"

# --- 7. Goi du lieu ----------------------------------------------------------------
if (( WITH_DB )); then
  step "Dong goi data_sql"

  # Goi nay CHI chua dung mot file .sql — anh da di theo goi code o buoc tren.
  ( cd "$WORK" && zip -q "$DATA_ZIP" "$SQL_NAME" )

  DATA_LIST=$(unzip -Z1 "$DATA_ZIP")
  [[ "$DATA_LIST" == "$SQL_NAME" ]] || die "Goi du lieu phai chi chua $SQL_NAME, dang co:
$DATA_LIST"

  ok "$(basename "$DATA_ZIP") — $(du -h "$DATA_ZIP" | cut -f1), dung 1 file: $SQL_NAME"
fi

# --- 8. Tong ket -------------------------------------------------------------------
printf '\n%sXong.%s Goi nam trong releases/\n\n' "$GREEN$BOLD" "$OFF"
printf '  %s  (ma nguon + ban build + anh da tai len + .env + package-lock.json)\n' "$(basename "$CODE_ZIP")"
(( WITH_DB )) && printf '  %s  (chi ban dump database)\n' "$(basename "$DATA_ZIP")"
printf '\n'

warn "Goi code chua file .env kem MAT KHAU DATABASE. Dung gui qua kenh cong khai,"
warn "dung commit len git (releases/ va deploy.config da duoc gitignore)."
(( WITH_DB )) && warn "Nap data_sql se GHI DE toan bo du lieu tren hosting — chi dung cho lan deploy dau."

cat <<EOF

Buoc tiep theo tren hosting cPanel

  Lan dau:
  1. MySQL Databases: tao database + user (ALL PRIVILEGES), dung ten da dien trong deploy.config
  2. Setup Node.js App: Node >= 20.9, mode Production, startup file: server.js
     Environment variables: NODE_OPTIONS=--v8-pool-size=2
  3. Giai nen code_build vao thu muc ung dung (unzip -o) — da co san .env va package-lock.json
  4. Giai nen data_sql, nap file .sql vao database $DB_NAME (phpMyAdmin -> Import)
  5. Terminal (sau dong 'source .../nodevenv/.../activate'):  npm ci --omit=dev
  6. Restart. Dang nhap /admin va DOI MAT KHAU admin ngay (dang la mat khau o may local)

  Cac lan sau (./scripts/release.sh --code-only):
  1. Giai nen code_build de len (unzip -o) — anh trong storage/uploads khong bi mat
  2. Neu co migration moi:  npm ci  &&  npm run db:migrate   (can devDependencies)
     Khong co migration:    npm ci --omit=dev
  3. Restart

  Kiem tra: $SITE_URL , $SITE_URL/admin , $SITE_URL/api-docs
EOF
