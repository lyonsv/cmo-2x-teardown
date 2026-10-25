#!/usr/bin/env bash
# Per-phase gate. Local only, not in CI: the CDP "no page target" flake must not block deploy.
# Order: node --test, crosscheck, smoke, a11y, print. Stops at the first failure.
# The browser checks are retried once, and only when stderr shows a known Chrome startup flake.
set -u
cd "$(dirname "$0")/.."

run() { echo "== $*"; "$@"; }

retry_once() {
  local err
  err=$(mktemp)
  # stderr goes to a file and is echoed after the command exits, so grep never reads a
  # file an asynchronous tee is still writing (code review IN-08).
  local rc=0
  "$@" 2>"$err" || rc=$?
  cat "$err" >&2
  if [ "$rc" -eq 0 ]; then rm -f "$err"; return 0; fi
  if grep -qE 'no page target|DevToolsActivePort never appeared' "$err"; then
    echo "-- known CDP flake, retrying once: $*"
    rm -f "$err"
    sleep 1
    "$@"
  else
    rm -f "$err"
    return 1
  fi
}

run node --test || exit 1
run node scripts/crosscheck.mjs || exit 1
echo "== smoke"; retry_once node scripts/smoke.mjs || exit 1
echo "== a11y"; retry_once node scripts/a11y.mjs || exit 1
echo "== print"; retry_once node scripts/print.mjs || exit 1
echo "ALL GATES GREEN"
