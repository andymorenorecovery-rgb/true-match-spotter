#!/usr/bin/env bash
# Safely updates the live site:  bash ~/site/scripts/deploy.sh
# 1. Pulls the newest code and builds it.
# 2. Test-runs the new build on a spare port. If the page or photos fail,
#    it stops here and the current site keeps running untouched.
# 3. Swaps the new build into ~/live, keeping the old one in ~/live.prev.
#    If the new one fails to start, it puts the old one back automatically.
# 4. Makes sure the auto-start and 5-minute watchdog are installed.
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
BUN="$HOME/.bun/bin/bun"
[ -x "$BUN" ] || BUN="$(command -v bun)"

REPO="$(cd "$(dirname "$0")/.." && pwd)"
LIVE="$HOME/live"
TEST_PORT=8001
cd "$REPO"

echo "== pulling newest code =="
git pull --ff-only

echo "== installing =="
NITRO_PRESET=node-server "$BUN" install

echo "== building =="
rm -rf "$REPO/.output"
NITRO_PRESET=node-server "$BUN" run build

echo "== testing new build (live site untouched) =="
set -a; . "$HOME/.site-env"; set +a
PORT=$TEST_PORT node "$REPO/.output/server/index.mjs" > "$HOME/site-test.log" 2>&1 &
TEST_PID=$!
OK=no
for i in $(seq 1 20); do
  sleep 1
  P=$(curl -s -m 5 -o /dev/null -w '%{http_code}' "http://localhost:$TEST_PORT/" || true)
  F=$(curl -s -m 5 -o /dev/null -w '%{http_code}' "http://localhost:$TEST_PORT/favicon.png" || true)
  if [ "$P" = "200" ] && [ "$F" = "200" ]; then OK=yes; break; fi
done
kill "$TEST_PID" 2>/dev/null || true
wait "$TEST_PID" 2>/dev/null || true
if [ "$OK" != "yes" ]; then
  echo "NEW BUILD FAILED its test — your site was NOT changed and is still running."
  echo "Send a screenshot of this:"
  tail -n 25 "$HOME/site-test.log"
  exit 1
fi
echo "new build OK"

echo "== switching to new build =="
rm -rf "$LIVE.new"
cp -a "$REPO/.output" "$LIVE.new"
rm -rf "$LIVE.prev"
[ -d "$LIVE" ] && mv "$LIVE" "$LIVE.prev"
mv "$LIVE.new" "$LIVE"

# Force a restart onto the new build.
pkill -f "server/index.mjs" 2>/dev/null || true
for i in $(seq 1 15); do pgrep -f "server/index.mjs" > /dev/null || break; sleep 1; done
pkill -9 -f "server/index.mjs" 2>/dev/null || true

if ! bash "$REPO/scripts/start-site.sh"; then
  if [ -d "$LIVE.prev" ]; then
    echo "== new build would not start — putting the previous version back =="
    rm -rf "$LIVE"; mv "$LIVE.prev" "$LIVE"
    pkill -9 -f "server/index.mjs" 2>/dev/null || true
    bash "$REPO/scripts/start-site.sh"
  fi
  exit 1
fi

echo "== making sure auto-start + watchdog are on =="
CRON_LINE_BOOT="@reboot bash $REPO/scripts/start-site.sh >> $HOME/watchdog.log 2>&1"
CRON_LINE_WATCH="*/5 * * * * bash $REPO/scripts/start-site.sh >> $HOME/watchdog.log 2>&1"
( crontab -l 2>/dev/null | grep -v "start-site.sh" ; echo "$CRON_LINE_BOOT" ; echo "$CRON_LINE_WATCH" ) | crontab -
echo "watchdog on — checks the site every 5 minutes and restarts it if needed"
echo "DONE"
