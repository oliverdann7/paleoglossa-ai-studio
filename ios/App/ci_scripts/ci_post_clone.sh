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
# node@22 is keg-only; resolve the prefix instead of hardcoding /opt/homebrew
# so the script also works on Intel runners (/usr/local).
export PATH="$(brew --prefix node@22)/bin:$PATH"
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

# ── Native Google Sign-In URL scheme ────────────────────────────────────────────
# Derives the com.googleusercontent.apps.* callback scheme from
# VITE_GOOGLE_IOS_CLIENT_ID (set it in the Xcode Cloud environment, or via the
# seeded .env.native-production) and injects it into Info.plist. No-ops when
# unset — the app then ships with the Google button hidden on native.
sh scripts/ios-google-scheme.sh

# ── Keep SwiftPM resolution consistent with the synced manifest ────────────────
# `cap sync` regenerates CapApp-SPM/Package.swift from the *installed* npm
# package versions. If those drifted from the committed Package.swift (e.g. the
# lockfile moved @capacitor/ios from 8.3.3 → 8.3.4), the committed
# Package.resolved no longer matches the manifest and the Archive step fails
# with "an out-of-date resolved file was detected … not allowed when automatic
# dependency resolution is disabled". Xcode Cloud builds with automatic
# resolution disabled, so the resolved file can be neither stale nor missing —
# regenerate it to match the synced manifest before the Archive step runs.
if ! git diff --quiet -- ios/App/CapApp-SPM/Package.swift; then
  echo "▸ cap sync changed Package.swift — regenerating Package.resolved"
  xcodebuild -resolvePackageDependencies \
    -project ios/App/App.xcodeproj \
    -scheme App
fi

echo "▸ ci_post_clone: web assets synced to ios/App/App/public"
