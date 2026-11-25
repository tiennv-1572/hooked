#!/usr/bin/env bash
# Hướng dẫn CMS — the local stack the screenshots are taken on (docs/huong-dan/WRITING.md, "Chụp ảnh").
#
#   bash scripts/huong-dan/stack.sh up      # db + web                       (pnpm docs:stack up)
#   bash scripts/huong-dan/stack.sh db      # fresh MySQL: migrate, seed, prepare-db.ts
#   bash scripts/huong-dan/stack.sh web     # production build of a copy of this repo, on that database
#   bash scripts/huong-dan/stack.sh down | status
#
# Screenshots create, edit and delete rows: they only ever do it here. The stack has its own MySQL container and
# its own copy of the site — it never touches `hooked-mysql` (docker-compose), the repo's `.next` or a running
# `next dev`. Needs Docker (Colima…), rsync and the repo's node_modules (pnpm install).
set -euo pipefail

ROOT=$(cd "$(dirname "$0")/../.." && pwd)
RUN="$ROOT/.huong-dan-stack"

DB_CONTAINER=huong-dan-mysql                    # = LOCAL_DB.container in shots/kit.ts
DB_PORT=${HUONG_DAN_DB_PORT:-33307}
DB_NAME=hooked_huong_dan                        # = LOCAL_DB.database
DB_URL="mysql://hooked:hooked@127.0.0.1:$DB_PORT/$DB_NAME"
WEB_PORT=${HUONG_DAN_WEB_PORT:-3101}

# The copy runs on these, never on the repo's .env (whose DATABASE_URL is the developer's own database).
stack_env() {
  export DATABASE_URL="$DB_URL"
  # Local only, signs the stack's CMS sessions. Not a secret of any real deployment.
  export AUTH_SECRET="huong-dan-local-stack-only-0123456789abcdef"
  # Absolute links and previews read as the live site, as staff will see them.
  export NEXT_PUBLIC_SITE_URL="https://hooked.vn"
  # The registration form is submitted by screenshot scripts: no per-IP limit.
  export REGISTRATION_RATE_LIMIT=0
  export TZ=Asia/Ho_Chi_Minh
  # Seeded password of every active account (scripts/db-seed.ts), whatever the developer's .env says.
  export ADMIN_DEMO_PASSWORD=hooked2026
}

wait_for() { # url, seconds — ready means a 2xx answer, not just an open port
  for _ in $(seq 1 "$2"); do curl -sf -o /dev/null --max-time 2 "$1" && return 0; sleep 1; done
  echo "Không lên được: $1" >&2; return 1
}
# By port too: killing the launcher's pid can leave the server process behind.
stop_pid() { # name, port
  [ -f "$RUN/$1.pid" ] && kill "$(cat "$RUN/$1.pid")" 2>/dev/null || true; rm -f "$RUN/$1.pid"
  local pids; pids=$(lsof -ti "tcp:$2" -sTCP:LISTEN 2>/dev/null || true)
  [ -n "$pids" ] && kill $pids 2>/dev/null || true
  for _ in $(seq 1 20); do lsof -ti "tcp:$2" -sTCP:LISTEN >/dev/null 2>&1 || return 0; sleep 0.5; done
}

db() {
  docker info >/dev/null 2>&1 || { echo "Docker chưa chạy (colima start)." >&2; exit 1; }
  docker rm -f "$DB_CONTAINER" >/dev/null 2>&1 || true
  docker run -d --name "$DB_CONTAINER" -p "127.0.0.1:$DB_PORT:3306" \
    -e MYSQL_ROOT_PASSWORD=huongdan -e MYSQL_DATABASE="$DB_NAME" -e MYSQL_USER=hooked -e MYSQL_PASSWORD=hooked \
    -e TZ=Asia/Ho_Chi_Minh mysql:8.4 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci >/dev/null
  # The server restarts once after its first initialisation: wait for a real query, twice in a row.
  local ok=0
  for _ in $(seq 1 90); do
    if docker exec "$DB_CONTAINER" mysql -uhooked -phooked -e "select 1" "$DB_NAME" >/dev/null 2>&1; then
      ok=$((ok + 1)); [ "$ok" -ge 2 ] && break
    else ok=0; fi
    sleep 1
  done
  [ "$ok" -ge 2 ] || { echo "MySQL không lên." >&2; exit 1; }
  echo "DB: migrate, seed…"
  (
    cd "$ROOT" && stack_env
    pnpm -s db:migrate > "$RUN/db.log" 2>&1 && pnpm -s db:seed >> "$RUN/db.log" 2>&1 \
      && pnpm -s exec tsx scripts/huong-dan/prepare-db.ts
  ) || { tail -20 "$RUN/db.log"; exit 1; }
  echo "DB: $DB_CONTAINER, cổng $DB_PORT"
}

web() {
  # Built from a copy of the working tree, so `.next` of the repo (and a `next dev` running on it) is untouched.
  stop_pid web "$WEB_PORT"
  # .env*: the copy runs on stack_env. storage/: the copy's own uploads (rsync keeps excluded paths).
  rsync -a --delete --exclude .git --exclude .next --exclude node_modules --exclude .huong-dan-stack \
    --exclude .huong-dan-pdf --exclude public/huong-dan --exclude test-results --exclude playwright-report \
    --exclude .claude --exclude releases --exclude storage --exclude deploy.config --exclude '.env*' \
    "$ROOT/" "$RUN/web/"
  mkdir -p "$RUN/web/storage/uploads"
  # A real folder, not a symlink: Turbopack refuses node_modules outside the project (on APFS `cp -c` clones it
  # in seconds; pnpm's links inside node_modules are relative, so they still resolve in the copy). Copied again
  # when the lock file changes.
  if ! cmp -s "$ROOT/pnpm-lock.yaml" "$RUN/web/node_modules/.lock-stamp"; then
    rm -rf "$RUN/web/node_modules"
    cp -Rc "$ROOT/node_modules" "$RUN/web/node_modules" 2>/dev/null || cp -R "$ROOT/node_modules" "$RUN/web/node_modules"
    cp "$ROOT/pnpm-lock.yaml" "$RUN/web/node_modules/.lock-stamp"
  fi
  cd "$RUN/web"
  stack_env
  echo "Web: build…"
  # Next 16.4 may stop a build once to recommend an upgrade ("SecurityFatalError … Retry the same command"):
  # the retry goes through.
  local attempt
  for attempt in 1 2; do
    if node_modules/.bin/next build > "$RUN/web-build.log" 2>&1; then break; fi
    if [ "$attempt" = 1 ] && grep -q SecurityFatalError "$RUN/web-build.log"; then continue; fi
    tail -30 "$RUN/web-build.log"; exit 1
  done
  nohup node_modules/.bin/next start -p "$WEB_PORT" > "$RUN/web.log" 2>&1 &
  echo $! > "$RUN/web.pid"
  wait_for "http://localhost:$WEB_PORT/admin/login" 60
  echo "Web: http://localhost:$WEB_PORT"
}

down() {
  stop_pid web "$WEB_PORT"
  docker rm -f "$DB_CONTAINER" >/dev/null 2>&1 || true
  echo "Đã tắt (cổng $WEB_PORT, $DB_PORT trống)."
}

status() {
  docker ps --filter "name=$DB_CONTAINER" --format 'DB:  {{.Status}}' | grep . || echo "DB:  tắt"
  curl -sf -o /dev/null --max-time 2 "http://localhost:$WEB_PORT/admin/login" && echo "Web: chạy" || echo "Web: tắt"
}

mkdir -p "$RUN"
# `pnpm docs:stack -- up` hands the "--" over to the script.
[ "${1:-}" = "--" ] && shift
case "${1:-}" in
  up) db; web ;;
  db) db ;;
  web) web ;;
  down) down ;;
  status) status ;;
  *) sed -n '2,7p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
esac
