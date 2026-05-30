#!/usr/bin/env node
// Audit everything needed for an App Store / Play Store submission that can
// be checked from the repo. Prints a pass/fail report and exits non-zero if
// any blocker is unresolved.
//
// Usage:
//   node scripts/check-release-readiness.mjs
//   npm run release:check

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const results = [];

function check(label, fn) {
  try {
    const result = fn();
    if (result === true || (result && result.ok)) {
      results.push({ label, status: 'pass', detail: result?.detail });
    } else if (result === false) {
      results.push({ label, status: 'fail', detail: 'check returned false' });
    } else {
      results.push({ label, status: 'fail', detail: result?.detail ?? 'check failed' });
    }
  } catch (err) {
    results.push({ label, status: 'fail', detail: err.message });
  }
}

function fileExists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

// ── Version consistency ──────────────────────────────────────────────────────

check('package.json version is not 0.0.0', () => {
  const pkg = JSON.parse(read('package.json'));
  return {
    ok: pkg.version !== '0.0.0' && /^\d+\.\d+\.\d+$/.test(pkg.version),
    detail: `version=${pkg.version}`,
  };
});

check('iOS MARKETING_VERSION matches package.json', () => {
  const pkg = JSON.parse(read('package.json'));
  const pbx = read('ios/App/App.xcodeproj/project.pbxproj');
  const versions = [...pbx.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map((m) => m[1].trim());
  const unique = [...new Set(versions)];
  if (unique.length !== 1) {
    return { ok: false, detail: `iOS has inconsistent versions: ${unique.join(', ')}` };
  }
  return {
    ok: unique[0] === pkg.version,
    detail: `iOS=${unique[0]} package=${pkg.version}`,
  };
});

check('Android versionName matches package.json', () => {
  const pkg = JSON.parse(read('package.json'));
  const gradle = read('android/app/build.gradle');
  const m = gradle.match(/versionName\s+"([^"]+)"/);
  return {
    ok: m?.[1] === pkg.version,
    detail: `android=${m?.[1]} package=${pkg.version}`,
  };
});

// ── iOS configuration ────────────────────────────────────────────────────────

check('iOS Info.plist has bundle ID com.paleoglossa.app via PRODUCT_BUNDLE_IDENTIFIER', () => {
  const plist = read('ios/App/App/Info.plist');
  if (!plist.includes('$(PRODUCT_BUNDLE_IDENTIFIER)')) {
    return { ok: false, detail: 'Info.plist does not reference PRODUCT_BUNDLE_IDENTIFIER' };
  }
  const pbx = read('ios/App/App.xcodeproj/project.pbxproj');
  return {
    ok: pbx.includes('PRODUCT_BUNDLE_IDENTIFIER = com.paleoglossa.app'),
    detail: 'Info.plist + project.pbxproj',
  };
});

check('iOS Info.plist declares ITSAppUsesNonExemptEncryption = NO', () => {
  const plist = read('ios/App/App/Info.plist');
  return plist.includes('<key>ITSAppUsesNonExemptEncryption</key>') && plist.includes('<false/>');
});

check('iOS PrivacyInfo.xcprivacy present', () => fileExists('ios/App/App/PrivacyInfo.xcprivacy'));

check('iOS LaunchScreen storyboard configured', () => {
  const plist = read('ios/App/App/Info.plist');
  return plist.includes('UILaunchStoryboardName');
});

check('iOS GoogleService-Info.plist present (Firebase) — REQUIRED for native auth', () => {
  return {
    ok: fileExists('ios/App/App/GoogleService-Info.plist'),
    detail: fileExists('ios/App/App/GoogleService-Info.plist')
      ? 'present'
      : 'download from Firebase Console → Project Settings → iOS app → GoogleService-Info.plist',
  };
});

// ── Android configuration ────────────────────────────────────────────────────

check('Android applicationId is com.paleoglossa.app', () => {
  const gradle = read('android/app/build.gradle');
  return gradle.includes('applicationId "com.paleoglossa.app"');
});

check('Android signing config wired to key.properties', () => {
  const gradle = read('android/app/build.gradle');
  return gradle.includes("rootProject.file('key.properties')") && gradle.includes('signingConfigs');
});

check('Android google-services.json present — REQUIRED for native Firebase', () => {
  return {
    ok: fileExists('android/app/google-services.json'),
    detail: fileExists('android/app/google-services.json')
      ? 'present'
      : 'download from Firebase Console → Project Settings → Android app → google-services.json',
  };
});

check('Android key.properties present (release signing) — REQUIRED for AAB upload', () => {
  return {
    ok: fileExists('android/key.properties'),
    detail: fileExists('android/key.properties')
      ? 'present'
      : 'create from android/key.properties.example; never commit',
  };
});

check('Android INTERNET permission declared', () => {
  const manifest = read('android/app/src/main/AndroidManifest.xml');
  return manifest.includes('android.permission.INTERNET');
});

// ── Store metadata ───────────────────────────────────────────────────────────

check('iOS store listing draft present', () =>
  fileExists('store/listings/ios/en-US/metadata.md')
);

check('Android store listing draft present', () =>
  fileExists('store/listings/android/en-US/metadata.md')
);

check('Release notes for current version present', () => {
  const pkg = JSON.parse(read('package.json'));
  const rel = `store/release-notes/${pkg.version}.md`;
  return { ok: fileExists(rel), detail: rel };
});

// ── App-level prereqs ────────────────────────────────────────────────────────

check('Privacy + Terms routes wired in App.tsx', () => {
  const app = read('src/App.tsx');
  return app.includes('path="/privacy"') && app.includes('path="/terms"');
});

check('Capacitor config has appId and webDir', () => {
  const cfg = read('capacitor.config.ts');
  return cfg.includes("appId: 'com.paleoglossa.app'") && cfg.includes("webDir: 'dist'");
});

check('Web bundle (dist/) exists for cap sync', () => {
  return {
    ok: fileExists('dist/index.html'),
    detail: fileExists('dist/index.html')
      ? 'present'
      : 'run `npm run build` before `npx cap sync`',
  };
});

check('App icons generated (1024 + 512)', () => {
  return (
    fileExists('public/app-store-icon-1024.png') &&
    fileExists('public/play-store-icon-512.png')
  );
});

// ── Report ───────────────────────────────────────────────────────────────────

const pass = results.filter((r) => r.status === 'pass');
const fail = results.filter((r) => r.status === 'fail');

console.log('');
console.log('── Release readiness ──────────────────────────────────────────────');
for (const r of results) {
  const mark = r.status === 'pass' ? '✓' : '✗';
  const color = r.status === 'pass' ? '\x1b[32m' : '\x1b[31m';
  const reset = '\x1b[0m';
  const detail = r.detail ? ` — ${r.detail}` : '';
  console.log(`  ${color}${mark}${reset} ${r.label}${detail}`);
}
console.log('');
console.log(`  ${pass.length} pass · ${fail.length} fail`);
console.log('');

if (fail.length > 0) {
  console.log('External items the repo cannot verify itself:');
  console.log('  - Apple Developer enrollment + App Store Connect app record');
  console.log('  - Google Play Console enrollment + app record');
  console.log('  - Device screenshots (iPhone 6.7", 5.5", iPad, Android phone, tablet)');
  console.log('  - Privacy policy + ToS publicly hosted (routes exist in-app)');
  console.log('');
}

process.exit(fail.length > 0 ? 1 : 0);
