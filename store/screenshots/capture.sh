#!/usr/bin/env bash
# Renders the generated HTML panels to PNG at exact store dimensions using headless Chrome.
# Sizes come from the .sizes manifest written by generate.mjs (single source of truth).
#   node store/screenshots/generate.mjs && bash store/screenshots/capture.sh
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

shoot() { # html w h
  local html="$1" w="$2" h="$3" png="${1%.html}.png"
  "$CHROME" --headless --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --default-background-color=00000000 --window-size="$w,$h" \
    --screenshot="$png" "file://$html" >/dev/null 2>&1
}

while read -r sub w h; do
  [ -z "${sub:-}" ] && continue
  for f in "$DIR/$sub"/*.html; do
    shoot "$f" "$w" "$h"
    echo "$sub/$(basename "$f" .html).png  ${w}×${h}"
  done
done < "$DIR/.sizes"
echo "Done."
