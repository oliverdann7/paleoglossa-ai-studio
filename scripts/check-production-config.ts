#!/usr/bin/env tsx
/**
 * Production configuration checker for Paleoglossa.
 *
 * Usage:
 *   npm run config:check          — check all targets
 *   npm run config:check:web      — web/Vercel env vars only
 *   npm run config:check:native   — Capacitor native build vars only
 *   npm run config:check:server   — server/Admin SDK vars only
 *
 * Exit codes: 0 = all critical vars present, 1 = one or more critical vars missing.
 * Never prints actual secret values — only "set" or "MISSING".
 */

import fs from 'node:fs';
import path from 'node:path';
import { loadEnv } from 'vite';

type Severity = 'critical' | 'warning';

// Resolve env the same way the builds do: web/server from `.env` (+ production
// overrides), native from `.env.native-production` (vite --mode native-production).
// process.env always wins so CI-provided values are never shadowed by files.
const webFileEnv = loadEnv('production', process.cwd(), '');
const nativeFileEnv = loadEnv('native-production', process.cwd(), '');
let activeEnv: Record<string, string | undefined> = { ...webFileEnv, ...process.env };

interface CheckItem {
  name: string;
  severity: Severity;
  consequence: string;
  featureGate?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function present(name: string): boolean {
  const val = activeEnv[name];
  return typeof val === 'string' && val.trim().length > 0;
}

function featureEnabled(flag: string): boolean {
  return present(flag) && activeEnv[flag]?.toLowerCase() !== 'false';
}

let failures = 0;
let warnings = 0;

function check(item: CheckItem): void {
  if (item.featureGate && !featureEnabled(item.featureGate)) {
    return; // Feature is disabled — skip optional var
  }
  const ok = present(item.name);
  if (!ok) {
    if (item.severity === 'critical') {
      console.error(`  ✗ MISSING  ${item.name}`);
      console.error(`             → ${item.consequence}`);
      failures++;
    } else {
      console.warn(`  ⚠ warning  ${item.name}`);
      console.warn(`             → ${item.consequence}`);
      warnings++;
    }
  } else {
    console.log(`  ✓ set      ${item.name}`);
  }
}

// ── Web production checks ─────────────────────────────────────────────────────

function checkWeb(): void {
  console.log('\n── Web / Vercel ─────────────────────────────────────────────');
  activeEnv = { ...webFileEnv, ...process.env };

  const web: CheckItem[] = [
    {
      name: 'VITE_FIREBASE_PROJECT_ID',
      severity: 'critical',
      consequence: 'Wrong Firebase project ID: user data may appear missing.',
    },
    {
      name: 'VITE_FIREBASE_APP_ID',
      severity: 'critical',
      consequence: 'Firebase SDK will not initialize: the app will not load.',
    },
    {
      name: 'VITE_FIREBASE_API_KEY',
      severity: 'critical',
      consequence: 'Firebase Auth will fail: users cannot sign in.',
    },
    {
      name: 'VITE_FIREBASE_AUTH_DOMAIN',
      severity: 'critical',
      consequence: 'Firebase Auth redirects will fail: Google sign-in will not work.',
    },
    {
      name: 'VITE_FIREBASE_STORAGE_BUCKET',
      severity: 'warning',
      consequence: 'Avatar upload / file storage will not work.',
    },
    {
      name: 'VITE_FIREBASE_FIRESTORE_DATABASE_ID',
      severity: 'warning',
      consequence: 'Will use "(default)" database — confirm this is correct for production.',
    },
    {
      name: 'GEMINI_API_KEY',
      severity: 'warning',
      consequence: 'AI word explain, translation, tutor, and OCR features will fail.',
    },
    {
      name: 'STRIPE_SECRET_KEY',
      severity: 'warning',
      consequence: 'Subscription billing will fail: users cannot upgrade.',
      featureGate: 'VITE_ENABLE_STRIPE',
    },
    {
      name: 'STRIPE_WEBHOOK_SECRET',
      severity: 'warning',
      consequence: 'Stripe webhooks will be rejected: subscription status will not update.',
      featureGate: 'VITE_ENABLE_STRIPE',
    },
    {
      name: 'VITE_SENTRY_DSN',
      severity: 'warning',
      consequence: 'Error monitoring is disabled — production errors will not be reported.',
    },
    {
      name: 'VITE_POSTHOG_API_KEY',
      severity: 'warning',
      consequence: 'Product analytics is disabled.',
    },
    {
      name: 'RESEND_API_KEY',
      severity: 'warning',
      consequence:
        'Transactional email is disabled — no welcome, receipt, or failed-payment emails.',
    },
    {
      name: 'SENTRY_DSN',
      severity: 'warning',
      consequence:
        'Server-side error monitoring is disabled — API errors will not be reported to Sentry.',
    },
  ];

  web.forEach(check);
}

// ── Native (Capacitor) checks ─────────────────────────────────────────────────

function checkNative(): void {
  console.log('\n── Native / Capacitor ───────────────────────────────────────');
  activeEnv = { ...nativeFileEnv, ...process.env };

  const native: CheckItem[] = [
    {
      name: 'VITE_FIREBASE_PROJECT_ID',
      severity: 'critical',
      consequence: 'Wrong Firebase project ID: native app will query the wrong database.',
    },
    {
      name: 'VITE_FIREBASE_APP_ID',
      severity: 'critical',
      consequence: 'Firebase SDK will not initialize in native build.',
    },
    {
      name: 'VITE_FIREBASE_API_KEY',
      severity: 'critical',
      consequence: 'Firebase Auth will fail in native build.',
    },
    {
      name: 'VITE_FIREBASE_AUTH_DOMAIN',
      severity: 'critical',
      consequence: 'Auth redirects will fail in native build.',
    },
    {
      name: 'VITE_API_BASE_URL',
      severity: 'critical',
      consequence:
        'Missing VITE_API_BASE_URL: native app may call the wrong backend — all API calls will fail.',
    },
    {
      name: 'VITE_GOOGLE_IOS_CLIENT_ID',
      severity: 'warning',
      consequence:
        'Google Sign-In hidden on iOS (Apple + email only) — see isGoogleSignInAvailable.',
    },
    {
      name: 'VITE_GOOGLE_WEB_CLIENT_ID',
      severity: 'warning',
      consequence:
        'Google Sign-In hidden on Android — its Credential Manager flow validates the id token against the *web* OAuth client, not an Android one. Android has no Apple button either, so the app ships email-only.',
    },
    {
      name: 'VITE_ENABLE_MOBILE_PURCHASES',
      severity: 'warning',
      consequence:
        'In-app purchase flag unset — Stripe checkout may be shown incorrectly on iOS/Android.',
    },
    {
      name: 'VITE_ENABLE_COMMUNITY',
      severity: 'warning',
      consequence:
        'Community features flag unset — social features may be shown without moderation.',
    },
  ];

  native.forEach(check);
  reportExampleDrift();
}

/**
 * Flags variables that the committed `.env.native-production.example` defines
 * but the local `.env.native-production` leaves empty or omits entirely.
 *
 * This drift is invisible and expensive: the example carries the real public
 * OAuth client ids, and Xcode Cloud seeds the env file *from* it
 * (ios/App/ci_scripts/ci_post_clone.sh), so a cloud build and a local build of
 * the very same commit can ship different sign-in buttons. It cost a release
 * cycle once — hence the generic check rather than one more named variable.
 */
function reportExampleDrift(): void {
  const examplePath = path.join(process.cwd(), '.env.native-production.example');
  if (!fs.existsSync(examplePath)) return;

  const exampleVars = new Map<string, string>();
  for (const line of fs.readFileSync(examplePath, 'utf8').split('\n')) {
    const match = /^\s*(VITE_[A-Z0-9_]+)\s*=(.*)$/.exec(line);
    if (match && match[2].trim().length > 0) exampleVars.set(match[1], match[2].trim());
  }

  // present() resolves file + process.env, so a value supplied only by the CI
  // environment (rather than the file) correctly counts as not drifted.
  const drifted = [...exampleVars.keys()].filter((name) => !present(name));
  if (drifted.length === 0) return;

  console.warn('\n  ⚠ .env.native-production is missing values its .example provides:');
  for (const name of drifted) console.warn(`      ${name}`);
  console.warn(
    '    → Local native builds will differ from Xcode Cloud builds, which seed\n' +
      '      the env file from the example. Copy these lines across before\n' +
      '      building a release locally.'
  );
  warnings++;
}

// ── Server / Admin SDK checks ─────────────────────────────────────────────────

function checkServer(): void {
  console.log('\n── Server / Admin SDK ───────────────────────────────────────');
  activeEnv = { ...webFileEnv, ...process.env };

  // Admin SDK: either service account JSON, or individual vars
  const hasJson = present('FIREBASE_SERVICE_ACCOUNT_JSON');
  const hasIndividual =
    present('FIREBASE_PROJECT_ID') &&
    present('FIREBASE_CLIENT_EMAIL') &&
    present('FIREBASE_PRIVATE_KEY');
  const hasAdminSdk = hasJson || hasIndividual;

  if (!hasAdminSdk) {
    console.error(
      '  ✗ MISSING  FIREBASE_SERVICE_ACCOUNT_JSON (or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY)'
    );
    console.error('             → Missing Admin SDK config: authenticated API routes may fail.');
    failures++;
  } else if (hasJson) {
    console.log('  ✓ set      FIREBASE_SERVICE_ACCOUNT_JSON');
  } else {
    console.log('  ✓ set      FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY');
  }

  const server: CheckItem[] = [
    {
      name: 'GEMINI_API_KEY',
      severity: 'warning',
      consequence:
        'AI analysis, translation, tutor, OCR, and pronunciation routes will return 503.',
    },
    {
      name: 'STRIPE_SECRET_KEY',
      severity: 'warning',
      consequence: 'Subscription webhook and billing routes will fail.',
    },
    {
      name: 'STRIPE_WEBHOOK_SECRET',
      severity: 'warning',
      consequence: 'Stripe webhooks cannot be verified — subscription status will not update.',
    },
    {
      name: 'GOOGLE_TTS_API_KEY',
      severity: 'warning',
      consequence: 'AudioLab TTS playback will fail.',
    },
  ];

  server.forEach(check);
}

// ── Diagnostic notes ──────────────────────────────────────────────────────────

function printDiagnosticNotes(): void {
  console.log(`
── Why data may not appear in Firebase ──────────────────────
  1. Demo / localStorage mode    — user is in guest mode; data is local-only.
  2. Wrong Firebase project ID   — VITE_FIREBASE_PROJECT_ID points to wrong project.
  3. Wrong database ID           — VITE_FIREBASE_FIRESTORE_DATABASE_ID is not "(default)".
  4. Firestore rules not deployed — run: firebase deploy --only firestore:rules
  5. Admin SDK missing           — FIREBASE_SERVICE_ACCOUNT_JSON not set; server writes fail.
  6. Native app missing API URL  — VITE_API_BASE_URL unset; mobile calls go to localhost.
─────────────────────────────────────────────────────────────
`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

// Vercel preview/development builds have no env vars (all secrets are scoped
// to the Production environment), so enforcing production config there would
// fail every PR preview. Only production deploys are gated.
if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
  console.log(
    `Skipping production config check: VERCEL_ENV=${process.env.VERCEL_ENV} (only production builds are gated).`
  );
  process.exit(0);
}

const target = process.argv[2] ?? 'all';

if (target === 'all' || target === 'web') checkWeb();
if (target === 'all' || target === 'native') checkNative();
if (target === 'all' || target === 'server') checkServer();

printDiagnosticNotes();

const totalIssues = failures + warnings;
if (totalIssues === 0) {
  console.log('✅  All production configuration checks passed.\n');
} else {
  if (failures > 0) {
    console.error(`\n❌  ${failures} critical variable(s) missing — fix before deploying.`);
  }
  if (warnings > 0) {
    console.warn(`⚠   ${warnings} optional variable(s) unset — some features may not work.`);
  }
  console.log('');
}

if (failures > 0) process.exit(1);
