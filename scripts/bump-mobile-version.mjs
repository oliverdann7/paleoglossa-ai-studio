#!/usr/bin/env node
// Bump app version across package.json, iOS Xcode project, and Android build.gradle.
//
// Usage:
//   node scripts/bump-mobile-version.mjs patch        # 1.0.0 → 1.0.1
//   node scripts/bump-mobile-version.mjs minor        # 1.0.0 → 1.1.0
//   node scripts/bump-mobile-version.mjs major        # 1.0.0 → 2.0.0
//   node scripts/bump-mobile-version.mjs set 1.2.3    # explicit
//
// versionCode / CURRENT_PROJECT_VERSION (build number) is always incremented
// by 1 so every store upload is unique — App Store Connect and Play Console
// both require this even for the same marketing version.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const PACKAGE_JSON = path.join(root, 'package.json');
const PBXPROJ = path.join(root, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');
const ANDROID_GRADLE = path.join(root, 'android', 'app', 'build.gradle');

function parseArgs(argv) {
  const cmd = argv[2];
  if (cmd === 'set') {
    const v = argv[3];
    if (!/^\d+\.\d+\.\d+$/.test(v ?? '')) {
      throw new Error('Usage: bump-mobile-version.mjs set <major.minor.patch>');
    }
    return { mode: 'set', version: v };
  }
  if (!['patch', 'minor', 'major'].includes(cmd)) {
    throw new Error('Usage: bump-mobile-version.mjs <patch|minor|major|set X.Y.Z>');
  }
  return { mode: cmd };
}

function nextVersion(current, mode, explicit) {
  if (mode === 'set') return explicit;
  const [maj, min, pat] = current.split('.').map(Number);
  if (mode === 'patch') return `${maj}.${min}.${pat + 1}`;
  if (mode === 'minor') return `${maj}.${min + 1}.0`;
  if (mode === 'major') return `${maj + 1}.0.0`;
  throw new Error(`Unknown mode: ${mode}`);
}

function bumpPackageJson(nextVer) {
  const json = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const prev = json.version;
  json.version = nextVer;
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(json, null, 2) + '\n');
  return prev;
}

function bumpIos(nextVer) {
  let src = fs.readFileSync(PBXPROJ, 'utf8');

  // MARKETING_VERSION — appears twice (Debug + Release)
  src = src.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${nextVer};`);

  // CURRENT_PROJECT_VERSION — bump by +1 across all occurrences
  const buildNumbers = [...src.matchAll(/CURRENT_PROJECT_VERSION = (\d+);/g)].map((m) =>
    Number(m[1])
  );
  if (buildNumbers.length === 0) {
    throw new Error('No CURRENT_PROJECT_VERSION found in iOS project.pbxproj');
  }
  const nextBuild = Math.max(...buildNumbers) + 1;
  src = src.replace(
    /CURRENT_PROJECT_VERSION = \d+;/g,
    `CURRENT_PROJECT_VERSION = ${nextBuild};`
  );

  fs.writeFileSync(PBXPROJ, src);
  return nextBuild;
}

function bumpAndroid(nextVer) {
  let src = fs.readFileSync(ANDROID_GRADLE, 'utf8');

  // versionName
  src = src.replace(/versionName\s+"[^"]+"/g, `versionName "${nextVer}"`);

  // versionCode — bump by +1
  const match = src.match(/versionCode\s+(\d+)/);
  if (!match) throw new Error('No versionCode found in android/app/build.gradle');
  const nextCode = Number(match[1]) + 1;
  src = src.replace(/versionCode\s+\d+/, `versionCode ${nextCode}`);

  fs.writeFileSync(ANDROID_GRADLE, src);
  return nextCode;
}

function main() {
  const { mode, version: explicit } = parseArgs(process.argv);
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const nextVer = nextVersion(pkg.version, mode, explicit);

  const prevVer = bumpPackageJson(nextVer);
  const iosBuild = bumpIos(nextVer);
  const androidCode = bumpAndroid(nextVer);

  console.log(`Bumped ${prevVer} → ${nextVer}`);
  console.log(`  package.json     version=${nextVer}`);
  console.log(`  iOS              MARKETING_VERSION=${nextVer}  CURRENT_PROJECT_VERSION=${iosBuild}`);
  console.log(`  Android          versionName=${nextVer}        versionCode=${androidCode}`);
  console.log('');
  console.log('Next steps:');
  console.log('  git diff --stat                       # review the bump');
  console.log('  npm run mobile:build:production       # rebuild + cap sync');
  console.log('  npm run ios:open / android:bundle     # ship to store');
}

main();
