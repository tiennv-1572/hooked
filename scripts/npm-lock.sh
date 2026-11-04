#!/usr/bin/env bash
#
# Sinh package-lock.json cho hosting (cPanel cai bang npm, con du an dung pnpm / pnpm-lock.yaml).
#
#   pnpm lock:npm
#
# Chay lai moi khi doi dependencies trong package.json, roi commit ca package-lock.json.
# scripts/release.sh tu choi dong goi neu package-lock.json lech voi package.json.
#
# Sinh trong thu muc tam (chi co package.json) de npm khong dung vao node_modules cua pnpm.
# Chay `npm install --package-lock-only` HAI lan: lan dau npm 10 de lai mot nhanh phu thuoc
# lech (ajv cua eslint) ma `npm ci` tu choi; lan hai sua lai. Ket qua duoc thu bang chinh
# lenh se chay tren hosting (`npm ci --omit=dev`) truoc khi ghi de file trong repo.

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

command -v npm >/dev/null || { echo "Khong tim thay lenh 'npm'." >&2; exit 1; }

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

cp package.json "$WORK/"
for _ in 1 2; do
  ( cd "$WORK" && npm install --package-lock-only --ignore-scripts --no-audit --no-fund >"$WORK/npm.log" 2>&1 ) \
    || { cat "$WORK/npm.log" >&2; echo "npm khong sinh duoc package-lock.json." >&2; exit 1; }
done

mkdir "$WORK/check"
cp "$WORK/package.json" "$WORK/package-lock.json" "$WORK/check/"
( cd "$WORK/check" && npm ci --omit=dev --dry-run --ignore-scripts --no-audit --no-fund >"$WORK/ci.log" 2>&1 ) \
  || { grep 'npm error' "$WORK/ci.log" | head -8 >&2; echo "package-lock.json vua sinh bi 'npm ci' tu choi." >&2; exit 1; }

# Nhung goi phai giong het ban build bang pnpm.
for pkg in next react react-dom; do
  want=$(node -p "require('./package.json').dependencies['$pkg']")
  got=$(node -p "require('$WORK/package-lock.json').packages['node_modules/$pkg'].version")
  [[ "$want" == "$got" ]] || { echo "package-lock.json chon $pkg@$got, khac package.json ($want)." >&2; exit 1; }
done
node -e "process.exit(require('$WORK/package-lock.json').packages['node_modules/@img/sharp-linux-x64'] ? 0 : 1)" \
  || echo "Canh bao: package-lock.json khong co @img/sharp-linux-x64 (toi uu anh tren hosting Linux)." >&2

cp "$WORK/package-lock.json" package-lock.json
echo "✓ package-lock.json: $(node -p "Object.keys(require('./package-lock.json').packages).length - 1") goi, npm ci chap nhan, next/react khop package.json"
