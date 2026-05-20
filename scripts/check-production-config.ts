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

type Severity = 'critical' | 'warning';

interface CheckItem {
  name: string;
  severity: Severity;
  consequence: string;
  featureGate?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function present(name: string): boolean {
  const val = process.env[name];
  return typeof val === 'string' && val.trim().length > 0;
}

function featureEnabled(flag: string): boolean {
  return present(flag) && process.env[flag]?.toLowerCase() !== 'false';
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
  ];

  web.forEach(check);
}

// ── Native (Capacitor) checks ─────────────────────────────────────────────────

function checkNative(): void {
  console.log('\n── Native / Capacitor ───────────────────────────────────────');

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
      name: 'VITE_ENABLE_MOBILE_PURCHASES',
      severity: 'warning',
      consequence: 'In-app purchase flag unset — Stripe checkout may be shown incorrectly on iOS/Android.',
    },
    {
      name: 'VITE_ENABLE_COMMUNITY',
      severity: 'warning',
      consequence: 'Community features flag unset — social features may be shown without moderation.',
    },
  ];

  native.forEach(check);
}

// ── Server / Admin SDK checks ─────────────────────────────────────────────────

function checkServer(): void {
  console.log('\n── Server / Admin SDK ───────────────────────────────────────');

  // Admin SDK: either service account JSON, or individual vars
  const hasJson = present('FIREBASE_SERVICE_ACCOUNT_JSON');
  const hasIndividual =
    present('FIREBASE_PROJECT_ID') &&
    present('FIREBASE_CLIENT_EMAIL') &&
    present('FIREBASE_PRIVATE_KEY');
  const hasAdminSdk = hasJson || hasIndividual;

  if (!hasAdminSdk) {
    console.error('  ✗ MISSING  FIREBASE_SERVICE_ACCOUNT_JSON (or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY)');
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
      consequence: 'AI analysis, translation, tutor, OCR, and pronunciation routes will return 503.',
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
