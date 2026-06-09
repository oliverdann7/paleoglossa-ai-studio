#!/bin/sh

# ─────────────────────────────────────────────────────────────────────────────
# Xcode Cloud post-clone build step for the Capacitor app.
#
# Xcode Cloud clones the repo and goes straight to archiving. But this is a
# Capacitor app: the Xcode project references `ios/App/App/public` (a folder
# reference in the Resources build phase) plus a generated
# `capacitor.config.json`. Both are produced by `vite build` + `npx cap sync`
# and are intentionally gitignored — so without this script the `public` folder
# is missing and the **Archive step fails**.
#
# This script runs automatically because Xcode Cloud executes
# `ci_post_clone.sh` after cloning, before resolving dependencies.
#
# LOCATION MATTERS: Xcode Cloud looks for `ci_scripts/` in the directory that
# contains the Xcode project it builds — here `ios/App/` (sibling of
# `App.xcodeproj`), NOT the repository root. If this folder lives at the repo
# root the script is silently skipped and the Archive fails on the missing
# `config.xml` / `public`. Do not move it. (The body still operates from the
# repo root via $CI_PRIMARY_REPOSITORY_PATH below.)
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "▸ ci_post_clone: building web bundle for native archive"

cd "$CI_PRIMARY_REPOSITORY_PATH"

# ── Install Node (Xcode Cloud images ship Homebrew) ────────────────────────────
# package.json requires Node >= 22.
brew install node@22
export PATH="/opt/homebrew/opt/node@22/bin:$PATH"
echo "▸ node $(node -v) / npm $(npm -v)"

# ── Native build-time config ───────────────────────────────────────────────────
# `.env.native-production` is gitignored. The values in the committed
# `.env.native-production.example` are the public Firebase web client config
# (safe to expose — they ship in the client bundle regardless), so seed the env
# file from it. Any VITE_* variable set in the Xcode Cloud environment overrides
# the file value, because Vite's loadEnv lets process.env win.
if [ ! -f .env.native-production ]; then
  cp .env.native-production.example .env.native-production
  echo "▸ seeded .env.native-production from example"
fi

# ── Build web assets and sync into the iOS project ──────────────────────────────
npm ci
npx vite build --mode native-production
npx cap sync ios

echo "▸ ci_post_clone: web assets synced to ios/App/App/public"
