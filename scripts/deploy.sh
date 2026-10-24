#!/usr/bin/env bash
# Pulls the newest code from GitHub, rebuilds it, and restarts the site.
# Run this on the server after making changes in Lovable:  bash ~/site/scripts/deploy.sh
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

BUN="$HOME/.bun/bin/bun"
[ -x "$BUN" ] || BUN="$(command -v bun)"

cd "$(dirname "$0")/.."

echo "== pulling newest code =="
git pull --ff-only

echo "== installing =="
NITRO_PRESET=node-server "$BUN" install

echo "== building =="
NITRO_PRESET=node-server "$BUN" run build

echo "== restarting =="
# Stop every old copy, and wait until it is really gone, so the new one gets the port.
pkill -f "index.mjs" 2>/dev/null || true
for i in $(seq 1 15); do pgrep -f "index.mjs" > /dev/null || break; sleep 1; done
pkill -9 -f "index.mjs" 2>/dev/null || true
sleep 1
bash "$(dirname "$0")/start-site.sh"
