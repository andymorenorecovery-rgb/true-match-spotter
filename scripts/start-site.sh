#!/usr/bin/env bash
# Starts (or heals) the Ready Too Mingle server on this machine.
# - If the site AND its photos answer 200, it does nothing.
# - Otherwise it stops any broken copy and starts a fresh one.
# Runs from ~/live (a private copy of the built site), so updating or
# deleting the code folder can never break the running site.
# Used by cron (@reboot and every 5 minutes as a watchdog) and by deploy.sh.
set -uo pipefail

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

ENV_FILE="$HOME/.site-env"
PORT="${PORT:-8000}"
LIVE="$HOME/live"
REPO="$HOME/site"
LOG="$HOME/site.log"

healthy() {
  local page photo
  page=$(curl -s -m 10 -o /dev/null -w '%{http_code}' "http://localhost:$PORT/")
  photo=$(curl -s -m 10 -o /dev/null -w '%{http_code}' "http://localhost:$PORT/favicon.png")
  echo "page: $page   photos: $photo"
  [ "$page" = "200" ] && [ "$photo" = "200" ]
}

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE — put your Stripe keys there first." >&2
  exit 1
fi
chmod 600 "$ENV_FILE" 2>/dev/null || true
set -a; . "$ENV_FILE"; set +a
if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  echo "STRIPE_SECRET_KEY is not in $ENV_FILE — checkout will not work." >&2
  exit 1
fi

if healthy > /dev/null; then
  [ -t 1 ] && echo "already running — site and photos OK"
  exit 0
fi

# First run after this change: make the private live copy from the last build.
if [ ! -f "$LIVE/server/index.mjs" ]; then
  if [ -f "$REPO/.output/server/index.mjs" ]; then
    cp -a "$REPO/.output" "$LIVE"
  elif [ -f "$HOME/live.prev/server/index.mjs" ]; then
    cp -a "$HOME/live.prev" "$LIVE"
  else
    echo "No built site found. Run: bash ~/site/scripts/deploy.sh" >&2
    exit 1
  fi
fi

echo "$(date) restarting site" >> "$HOME/watchdog.log"
pkill -f "server/index.mjs" 2>/dev/null || true
for i in $(seq 1 15); do pgrep -f "server/index.mjs" > /dev/null || break; sleep 1; done
pkill -9 -f "server/index.mjs" 2>/dev/null || true
sleep 1

cd "$LIVE"
PORT="$PORT" nohup node "$LIVE/server/index.mjs" > "$LOG" 2>&1 &

for i in $(seq 1 15); do sleep 1; healthy > /dev/null && break; done
if healthy; then
  echo "replied: 200 — site and photos OK"
else
  echo "PROBLEM — send a screenshot of everything below:"
  ls -la "$LIVE/public" | head -5
  tail -n 25 "$LOG"
  exit 1
fi
