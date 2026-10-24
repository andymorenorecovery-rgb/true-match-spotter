#!/usr/bin/env bash
# Starts the Ready Too Mingle server on this machine.
# Safe to run when the site is already up: it does nothing in that case.
# Used by the reboot auto-start (cron @reboot) and by deploy.sh.
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

ENV_FILE="$HOME/.site-env"
PORT="${PORT:-8000}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE — put your Stripe keys there first." >&2
  exit 1
fi
chmod 600 "$ENV_FILE" 2>/dev/null || true

set -a
. "$ENV_FILE"
set +a

if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  echo "STRIPE_SECRET_KEY is not in $ENV_FILE — checkout will not work." >&2
  exit 1
fi

if pgrep -f ".output/server/index.mjs" > /dev/null; then
  echo "already running"
  exit 0
fi

cd "$(dirname "$0")/.."
PORT="$PORT" nohup node .output/server/index.mjs > "$HOME/site.log" 2>&1 &
sleep 4
echo "replied: $(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$PORT")"
