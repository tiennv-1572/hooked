#!/usr/bin/env bash
#
# Cai dependencies TREN HOSTING cPanel (CloudLinux "Setup Node.js App"), giu nguyen symlink node_modules.
#
#   bash scripts/hosting-install.sh          # chi goi production (moi lan deploy)
#   bash scripts/hosting-install.sh --dev    # them devDependencies, truoc khi chay 'npm run db:migrate'
#
# Chay trong Terminal cua cPanel, o thu muc ung dung, SAU dong 'source .../nodevenv/.../bin/activate'
# ma trang Setup Node.js App hien san.
#
# Vi sao khong chay thang 'npm ci' / 'npm install' trong thu muc ung dung:
#   Node.js Selector de thu vien o ~/nodevenv/<ung dung>/<phien ban>/lib/node_modules va chi dat mot
#   SYMLINK node_modules trong thu muc ung dung. npm (ca 'ci' lan 'install') xoa symlink do va tao thu
#   muc that thay vao ("npm warn reify Removing non-directory .../node_modules" - da thu tren AlmaLinux 8
#   voi npm 10), sau do Setup Node.js App bao ung dung khong duoc chua thu muc node_modules.
#   Script nay cai THANG vao thu muc ma symlink tro toi, bang dung package-lock.json di kem goi.
#
# Cach khac khong can Terminal: nut "Run NPM Install" trong Setup Node.js App.

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
APP="$(pwd)"

die() { printf 'LOI: %s\n' "$*" >&2; exit 1; }

OMIT=(--omit=dev)
case "${1:-}" in
  "") ;;
  --dev) OMIT=() ;;
  *) die "Tham so khong hop le: $1 (chi co --dev)" ;;
esac

command -v node >/dev/null && command -v npm >/dev/null \
  || die "Khong co node/npm. Chay dong 'source .../nodevenv/.../bin/activate' trong Setup Node.js App truoc."
[[ -f package.json && -f package-lock.json ]] || die "Thieu package.json / package-lock.json trong $APP."

# Next 16 can Node >= 20.9; htmlparser2 (dung boi sanitize-html) can >= 20.19; sanitize-html khai >= 22.12.
NODE_VERSION="$(node -p 'process.versions.node')"
node -e '
  const [major, minor] = process.versions.node.split(".").map(Number);
  process.exit(major > 20 || (major === 20 && minor >= 19) ? 0 : 1);
' || die "Node $NODE_VERSION qua cu. Chon Node 22 (hoac 24) trong Setup Node.js App."
node -e '
  const [major, minor] = process.versions.node.split(".").map(Number);
  process.exit(major > 22 || (major === 22 && minor >= 12) ? 0 : 1);
' || printf 'Canh bao: Node %s chay duoc nhung da het ho tro - nen chon Node 22 (hoac 24) trong Setup Node.js App.\n' "$NODE_VERSION"

if [[ -L node_modules ]]; then
  MODULES="$(readlink -f node_modules)"
elif [[ -e node_modules ]]; then
  die "node_modules la thu muc that chu khong phai symlink cua Node.js Selector (co le do 'npm ci' / 'npm install'
     tung chay o day). Xoa no:  rm -rf node_modules  - roi bam 'Run NPM Install' trong Setup Node.js App mot lan
     (de tao lai symlink) va chay lai script nay."
else
  die "Chua co symlink node_modules. Tao ung dung trong Setup Node.js App va bam 'Run NPM Install' mot lan, roi chay lai."
fi

LIB="$(dirname "$MODULES")"
mkdir -p "$MODULES"
# npm doc package.json + package-lock.json ngay canh node_modules ma no cai vao.
ln -sf "$APP/package.json" "$LIB/package.json"
ln -sf "$APP/package-lock.json" "$LIB/package-lock.json"

printf 'Cai vao %s (%s, Node %s)...\n' "$MODULES" "${OMIT[*]:-ca devDependencies}" "$NODE_VERSION"
( cd "$LIB" && npm ci "${OMIT[@]}" --no-audit --no-fund )

[[ -L node_modules ]] || die "Symlink node_modules bi mat sau khi cai - bao lai nguoi phat trien."
node -e 'require("next/package.json"); require("sharp")' \
  || die "Cai xong nhung khong nap duoc next/sharp tren may chu nay."
printf 'Xong: node_modules -> %s. Bam Restart trong Setup Node.js App.\n' "$MODULES"
