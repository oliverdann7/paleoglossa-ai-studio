#!/bin/sh

# ─────────────────────────────────────────────────────────────────────────────
# Injects the Google Sign-In callback URL scheme into ios/App/App/Info.plist.
#
# The native Google SDK (GIDSignIn, used via @capgo/capacitor-social-login)
# returns to the app through a custom URL scheme derived from the iOS OAuth
# client id: `<prefix>.apps.googleusercontent.com` → scheme
# `com.googleusercontent.apps.<prefix>`. The client id is public config but
# lives outside git (.env.native-production / Xcode Cloud env), so the scheme
# is injected at build time instead of being committed.
#
# Reads VITE_GOOGLE_IOS_CLIENT_ID from the environment, falling back to
# .env.native-production. No-ops (exit 0) when unset — the app then ships
# Apple + email sign-in only, and the Google button stays hidden (see
# isGoogleSignInAvailable in src/lib/services/authService.ts).
#
# Idempotent: safe to run repeatedly (cap sync, CI, local archives).
# ─────────────────────────────────────────────────────────────────────────────

set -e

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLIST="$REPO_ROOT/ios/App/App/Info.plist"
PB=/usr/libexec/PlistBuddy

CLIENT_ID="${VITE_GOOGLE_IOS_CLIENT_ID:-}"
if [ -z "$CLIENT_ID" ] && [ -f "$REPO_ROOT/.env.native-production" ]; then
  CLIENT_ID=$(sed -n 's/^VITE_GOOGLE_IOS_CLIENT_ID=//p' "$REPO_ROOT/.env.native-production" | tail -1)
fi

if [ -z "$CLIENT_ID" ]; then
  echo "▸ ios-google-scheme: VITE_GOOGLE_IOS_CLIENT_ID not set — skipping (Google hidden on native)"
  exit 0
fi

case "$CLIENT_ID" in
  *.apps.googleusercontent.com) ;;
  *)
    echo "✗ ios-google-scheme: VITE_GOOGLE_IOS_CLIENT_ID does not look like an iOS OAuth client id (expected *.apps.googleusercontent.com)" >&2
    exit 1
    ;;
esac

PREFIX="${CLIENT_ID%.apps.googleusercontent.com}"
SCHEME="com.googleusercontent.apps.$PREFIX"

if grep -q "$SCHEME" "$PLIST"; then
  echo "▸ ios-google-scheme: $SCHEME already present"
  exit 0
fi

# Append a new URL type entry after the existing ones.
IDX=0
while $PB -c "Print :CFBundleURLTypes:$IDX" "$PLIST" >/dev/null 2>&1; do
  IDX=$((IDX + 1))
done

$PB -c "Add :CFBundleURLTypes:$IDX dict" "$PLIST"
$PB -c "Add :CFBundleURLTypes:$IDX:CFBundleURLSchemes array" "$PLIST"
$PB -c "Add :CFBundleURLTypes:$IDX:CFBundleURLSchemes:0 string $SCHEME" "$PLIST"

echo "▸ ios-google-scheme: added $SCHEME to Info.plist (URL type #$IDX)"
