#!/usr/bin/env bash
# Renders the generated HTML panels to PNG at exact store dimensions using headless Chrome.
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

for f in "$DIR"/ios/*.html;     do shoot "$f" 1290 2796; echo "ios/$(basename "$f" .html).png"; done
for f in "$DIR"/android/*.html; do shoot "$f" 1080 2400; echo "android/$(basename "$f" .html).png"; done
echo "Done."
