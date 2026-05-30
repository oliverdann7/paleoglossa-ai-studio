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

// kind: 'repo'     — must pass; failure exits non-zero (the repo itself isn't ready)
// kind: 'external' — informational; failure is expected without user credentials
//                    (Firebase service files, keystore, store accounts). Never exits non-zero.
function check(label, fn, kind = 'repo') {
  try {
    const result = fn();
    if (result === true || (result && result.ok)) {
      results.push({ label, kind, status: 'pass', detail: result?.detail });
    } else if (result === false) {
      results.push({ label, kind, status: 'fail', detail: 'check returned false' });
    } else {
      results.push({ label, kind, status: 'fail', detail: result?.detail ?? 'check failed' });
    }
  } catch (err) {
    results.push({ label, kind, status: 'fail', detail: err.message });
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

check(
  'iOS GoogleService-Info.plist present (Firebase native config)',
  () => {
    return {
      ok: fileExists('ios/App/App/GoogleService-Info.plist'),
      detail: fileExists('ios/App/App/GoogleService-Info.plist')
        ? 'present'
        : 'download from Firebase Console → Project Settings → iOS app → GoogleService-Info.plist',
    };
  },
  'external'
);

// ── Android configuration ────────────────────────────────────────────────────

check('Android applicationId is com.paleoglossa.app', () => {
  const gradle = read('android/app/build.gradle');
  return gradle.includes('applicationId "com.paleoglossa.app"');
});

check('Android signing config wired to key.properties', () => {
  const gradle = read('android/app/build.gradle');
  return gradle.includes("rootProject.file('key.properties')") && gradle.includes('signingConfigs');
});

check(
  'Android google-services.json present (Firebase native config)',
  () => {
    return {
      ok: fileExists('android/app/google-services.json'),
      detail: fileExists('android/app/google-services.json')
        ? 'present'
        : 'download from Firebase Console → Project Settings → Android app → google-services.json',
    };
  },
  'external'
);

check(
  'Android key.properties present (release signing)',
  () => {
    return {
      ok: fileExists('android/key.properties'),
      detail: fileExists('android/key.properties')
        ? 'present'
        : 'create from android/key.properties.example; never commit',
    };
  },
  'external'
);

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

const reset = '\x1b[0m';
const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const dim = '\x1b[2m';

function section(title, items) {
  if (items.length === 0) return;
  console.log(`\n${dim}── ${title} ${'─'.repeat(Math.max(0, 64 - title.length))}${reset}`);
  for (const r of items) {
    const mark = r.status === 'pass' ? '✓' : r.kind === 'external' ? '○' : '✗';
    const color = r.status === 'pass' ? green : r.kind === 'external' ? yellow : red;
    const detail = r.detail ? ` — ${dim}${r.detail}${reset}` : '';
    console.log(`  ${color}${mark}${reset} ${r.label}${detail}`);
  }
}

const repoItems = results.filter((r) => r.kind === 'repo');
const externalItems = results.filter((r) => r.kind === 'external');
const repoFails = repoItems.filter((r) => r.status === 'fail');
const externalFails = externalItems.filter((r) => r.status === 'fail');

console.log('');
console.log('Release readiness report');
section('Repo-local (must pass)', repoItems);
section('External (require user credentials/action)', externalItems);

console.log('');
console.log(
  `  Repo:     ${repoItems.length - repoFails.length}/${repoItems.length} ${
    repoFails.length === 0 ? green + '✓ ready' + reset : red + '✗ incomplete' + reset
  }`
);
console.log(
  `  External: ${externalItems.length - externalFails.length}/${externalItems.length} ${
    externalFails.length === 0 ? green + '✓ ready' + reset : yellow + '○ pending user action' + reset
  }`
);
console.log('');

if (externalFails.length > 0) {
  console.log(`${yellow}Next steps for external items:${reset}`);
  console.log('  See docs/STORE_SUBMISSION_HANDOFF.md');
  console.log('    1. Apple Developer enrollment + App Store Connect record');
  console.log('    2. Google Play Console enrollment + record');
  console.log('    3. Firebase Console → download GoogleService-Info.plist + google-services.json');
  console.log('    4. keytool → keystore → android/key.properties');
  console.log('    5. Device screenshots (Xcode simulator / Android emulator)');
  console.log('    6. Confirm privacy + ToS routes are live on paleoglossa.com');
  console.log('');
}

// Repo failures block; external "failures" are pending user action and do not block.
process.exit(repoFails.length > 0 ? 1 : 0);
