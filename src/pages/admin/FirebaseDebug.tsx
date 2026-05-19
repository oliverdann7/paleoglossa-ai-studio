import { useState, useCallback } from 'react';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Bug,
  Database,
  Server,
  Globe,
  User,
  Terminal,
} from 'lucide-react';
import { db } from '../../lib/firebase.js';
import { getApiUrl } from '../../lib/services/apiBaseUrl.js';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../lib/hooks/useAuth.js';

declare const __FIREBASE_CONFIG__: {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId: string;
  measurementId: string;
  firestoreDatabaseId: string;
};

interface TestResult {
  label: string;
  status: 'pass' | 'fail' | 'running' | 'idle';
  details: string;
  error?: string;
}

interface ServerDiagnostics {
  adminSdkAvailable: boolean;
  projectId: string | null;
  clientTokenVerified: boolean;
  clientEmail: string | null;
  clientUid: string | null;
  serverTimestamp: string;
  serverTests: {
    adminDb: {
      ok?: boolean;
      writeOk?: boolean;
      readOk?: boolean;
      deleteOk?: boolean;
      error?: string;
      code?: string;
    } | null;
    adminAuth: {
      ok?: boolean;
      userFound?: boolean;
      email?: string | null;
      emailVerified?: boolean;
      disabled?: boolean;
      hasCustomClaims?: boolean;
      error?: string;
      code?: string;
    } | null;
  };
}

function StatusIcon({ status }: { status: 'pass' | 'fail' | 'running' | 'idle' }) {
  if (status === 'pass') return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
  if (status === 'fail') return <XCircle className="w-5 h-5 text-red-500 shrink-0" />;
  if (status === 'running') return <Loader2 className="w-5 h-5 animate-spin text-blue shrink-0" />;
  return <div className="w-5 h-5 shrink-0" />;
}

export function FirebaseDebug() {
  const { user } = useAuth();

  const [clientTest, setClientTest] = useState<TestResult>({
    label: 'Client Firestore write/read/delete',
    status: 'idle',
    details: 'Click "Run client Firestore test" to check client SDK connectivity.',
  });

  const [serverTest, setServerTest] = useState<TestResult>({
    label: 'Server Admin SDK',
    status: 'idle',
    details: 'Click "Run server Admin SDK test" to check server-side Firebase connectivity.',
  });

  const clearAll = useCallback(() => {
    setClientTest({
      label: 'Client Firestore write/read/delete',
      status: 'idle',
      details: 'Click "Run client Firestore test" to check client SDK connectivity.',
    });
    setServerTest({
      label: 'Server Admin SDK',
      status: 'idle',
      details: 'Click "Run server Admin SDK test" to check server-side Firebase connectivity.',
    });
  }, []);

  const firebaseConfig = (
    typeof __FIREBASE_CONFIG__ !== 'undefined' ? __FIREBASE_CONFIG__ : null
  ) as {
    projectId: string;
    appId: string;
    apiKey: string;
    authDomain: string;
    storageBucket: string;
    messagingSenderId: string;
    measurementId: string;
    firestoreDatabaseId: string;
  } | null;

  const isCapacitor =
    typeof (window as any).Capacitor !== 'undefined' &&
    (window as any).Capacitor.isNativePlatform();

  function classifyFirestoreError(error: unknown): string {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('permission-denied'))
      return 'permission-denied — Firestore rules are blocking the write. This is expected for unknown subcollections.';
    if (msg.includes('unauthenticated'))
      return 'unauthenticated — No valid auth token. Check Firebase Auth configuration.';
    if (msg.includes('auth/invalid-api-key'))
      return 'invalid-api-key — The Firebase API key is incorrect or missing. Check VITE_FIREBASE_API_KEY.';
    if (msg.includes('project-id') || msg.includes('projectId'))
      return 'wrong-project — The Firebase project appears misconfigured. Check VITE_FIREBASE_PROJECT_ID.';
    if (msg.includes('network'))
      return 'network-error — Cannot reach Firestore servers. Check if Firebase project exists and rules are deployed.';
    if (msg.includes('not-found'))
      return 'not-found — The Firestore database was not found. Check firestoreDatabaseId config.';
    return msg;
  }

  function classifyApiError(error: unknown): string {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('SERVICE_UNAVAILABLE') || msg.includes('503'))
      return 'Service unavailable — Admin SDK is not configured on the server. Check FIREBASE_SERVICE_ACCOUNT_JSON env var.';
    if (msg.includes('FORBIDDEN') || msg.includes('403'))
      return 'Forbidden — Your account is not an admin on the server. Check ADMIN_EMAILS in api/_routes/admin.ts.';
    if (msg.includes('UNAUTHORIZED') || msg.includes('401'))
      return 'Unauthorized — Token missing or expired. Sign out and sign back in.';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError'))
      return 'Network error — API server is unreachable. Check VITE_API_BASE_URL and that the server is running.';
    return msg;
  }

  const runClientTest = useCallback(async () => {
    setClientTest({
      label: 'Client Firestore write/read/delete',
      status: 'running',
      details: 'Running client-side Firestore test...',
    });

    if (!user) {
      setClientTest({
        label: 'Client Firestore write/read/delete',
        status: 'fail',
        details: 'No authenticated user.',
        error: 'Cannot run test without a signed-in user.',
      });
      return;
    }

    const testPath = `users/${user.uid}/settings/__debug__`;
    const testRef = doc(db, testPath);
    const testData = { test: true, timestamp: new Date().toISOString(), action: 'write-test' };

    try {
      await setDoc(testRef, testData);
    } catch (e: unknown) {
      const detail = classifyFirestoreError(e);
      setClientTest({
        label: 'Client Firestore write/read/delete',
        status: 'fail',
        details: 'Write failed.',
        error: detail,
      });
      return;
    }

    let readBack: unknown;
    try {
      const snap = await getDoc(testRef);
      readBack = snap.exists() ? snap.data() : null;
    } catch (e: unknown) {
      const detail = classifyFirestoreError(e);
      setClientTest({
        label: 'Client Firestore write/read/delete',
        status: 'fail',
        details: 'Write succeeded but read failed.',
        error: detail,
      });
      return;
    }

    try {
      await deleteDoc(testRef);
    } catch (e: unknown) {
      const detail = classifyFirestoreError(e);
      setClientTest({
        label: 'Client Firestore write/read/delete',
        status: 'fail',
        details: 'Write and read succeeded but delete failed.',
        error: detail,
      });
      return;
    }

    setClientTest({
      label: 'Client Firestore write/read/delete',
      status: 'pass',
      details: `Write → Read → Delete all succeeded.\nPath: ${testPath}\nData written: ${JSON.stringify(testData)}\nData read back: ${JSON.stringify(readBack)}`,
    });
  }, [user]);

  const runServerTest = useCallback(async () => {
    setServerTest({
      label: 'Server Admin SDK',
      status: 'running',
      details: 'Calling server diagnostic endpoint...',
    });

    try {
      const token = await user?.getIdToken();
      if (!token) {
        setServerTest({
          label: 'Server Admin SDK',
          status: 'fail',
          details: 'No auth token available.',
          error: 'Cannot authenticate to the API server.',
        });
        return;
      }

      const res = await fetch(getApiUrl('/api/admin/firebase-debug'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        let body: any;
        try {
          body = await res.json();
        } catch {
          body = null;
        }
        const detail = classifyApiError(body?.error || `HTTP ${res.status}`);
        setServerTest({
          label: 'Server Admin SDK',
          status: 'fail',
          details: `Request failed (${res.status}).`,
          error: detail,
        });
        return;
      }

      const data: ServerDiagnostics = await res.json();
      const lines: string[] = [];
      lines.push(`Admin SDK available: ${data.adminSdkAvailable}`);
      lines.push(`Project ID: ${data.projectId || 'not detected'}`);
      lines.push(`Token verified: ${data.clientTokenVerified}`);

      if (data.serverTests?.adminDb) {
        const t = data.serverTests.adminDb;
        if (t.ok !== false) {
          lines.push(`Admin DB test: Write=${t.writeOk} Read=${t.readOk} Delete=${t.deleteOk}`);
        } else {
          lines.push(`Admin DB test: FAILED — ${t.error} (${t.code})`);
        }
      }

      if (data.serverTests?.adminAuth) {
        const t = data.serverTests.adminAuth;
        if (t.ok) {
          lines.push(
            `Admin Auth test: User found=${t.userFound} Email verified=${t.emailVerified} Disabled=${t.disabled}`
          );
        } else {
          lines.push(`Admin Auth test: FAILED — ${t.error} (${t.code})`);
        }
      }

      setServerTest({
        label: 'Server Admin SDK',
        status: 'pass',
        details: lines.join('\n'),
      });
    } catch (e: unknown) {
      const detail = classifyApiError(e);
      setServerTest({
        label: 'Server Admin SDK',
        status: 'fail',
        details: 'Request threw an exception.',
        error: detail,
      });
    }
  }, [user]);

  const runFullDiagnostics = useCallback(async () => {
    clearAll();
    await runClientTest();
    await runServerTest();
  }, [clearAll, runClientTest, runServerTest]);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto font-sans min-h-screen">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-[26px] font-serif font-bold text-ink flex items-center gap-3">
            <Bug className="w-6 h-6 text-blue" />
            Firebase Debug
          </h2>
          <p className="text-ink2 text-[14px] mt-1">
            Diagnose Firebase client and server connectivity. No secrets are exposed.
          </p>
        </div>
        <button
          onClick={runFullDiagnostics}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-bdr hover:bg-parch3 text-[13px] font-medium text-ink3 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Run full diagnostics
        </button>
      </div>

      {/* ─── Environment Info ─────────────────────────────────── */}
      <section className="card p-5 mb-6">
        <h3 className="text-[15px] font-semibold text-ink flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-blue" />
          Environment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
          <InfoRow
            label="Origin"
            value={typeof window !== 'undefined' ? window.location.origin : 'N/A'}
          />
          <InfoRow
            label="API Base URL"
            value={import.meta.env.VITE_API_BASE_URL || '(empty — using relative paths)'}
          />
          <InfoRow label="Mode" value={import.meta.env.MODE} />
          <InfoRow label="Platform" value={isCapacitor ? 'Capacitor (native)' : 'Web / PWA'} />
        </div>
      </section>

      {/* ─── Firebase Config ──────────────────────────────────── */}
      <section className="card p-5 mb-6">
        <h3 className="text-[15px] font-semibold text-ink flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-blue" />
          Firebase Client Config
        </h3>
        {firebaseConfig ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
            <InfoRow
              label="Project ID"
              value={firebaseConfig.projectId || '(empty)'}
              warn={!firebaseConfig.projectId}
            />
            <InfoRow
              label="Auth Domain"
              value={firebaseConfig.authDomain || '(empty)'}
              warn={!firebaseConfig.authDomain}
            />
            <InfoRow label="Storage Bucket" value={firebaseConfig.storageBucket || '(empty)'} />
            <InfoRow
              label="App ID"
              value={
                firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 24)}...` : '(empty)'
              }
              warn={!firebaseConfig.appId}
            />
            <InfoRow
              label="Database ID"
              value={firebaseConfig.firestoreDatabaseId || '(default)'}
            />
            <InfoRow
              label="API Key"
              value={
                firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 8)}...` : '(empty)'
              }
              warn={!firebaseConfig.apiKey}
            />
          </div>
        ) : (
          <p className="text-red-500 text-[13px]">
            __FIREBASE_CONFIG__ not found — Firebase SDK may not be initialized.
          </p>
        )}
      </section>

      {/* ─── Auth Info ────────────────────────────────────────── */}
      <section className="card p-5 mb-6">
        <h3 className="text-[15px] font-semibold text-ink flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-blue" />
          Current User
        </h3>
        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[13px]">
            <InfoRow label="UID" value={user.uid} />
            <InfoRow label="Email" value={user.email || '(none)'} />
            <InfoRow
              label="Email verified"
              value={user.emailVerified ? 'Yes' : 'No'}
              warn={!user.emailVerified}
            />
            <InfoRow label="Anonymous" value={user.isAnonymous ? 'Yes' : 'No'} />
            <InfoRow
              label="Provider IDs"
              value={user.providerData.map((p) => p.providerId).join(', ') || '(none)'}
            />
          </div>
        ) : (
          <p className="text-ink3 text-[13px]">No user signed in.</p>
        )}
      </section>

      {/* ─── Client Test ──────────────────────────────────────── */}
      <section className="card p-5 mb-6">
        <h3 className="text-[15px] font-semibold text-ink flex items-center gap-2 mb-4">
          <Terminal className="w-4 h-4 text-blue" />
          Client Firestore Test
        </h3>
        <p className="text-[12px] text-ink3 mb-4">
          Tests client-side read/write/delete to{' '}
          <code className="bg-parch2 px-1 rounded text-[11px]">
            users/&lt;uid&gt;/settings/__debug__
          </code>{' '}
          (owner-only).
        </p>
        <button
          onClick={runClientTest}
          disabled={clientTest.status === 'running'}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue text-white text-[13px] font-medium hover:bg-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {clientTest.status === 'running' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          Run client Firestore test
        </button>
        <TestResultRow result={clientTest} />
      </section>

      {/* ─── Server Test ──────────────────────────────────────── */}
      <section className="card p-5 mb-6">
        <h3 className="text-[15px] font-semibold text-ink flex items-center gap-2 mb-4">
          <Server className="w-4 h-4 text-blue" />
          Server Admin SDK Test
        </h3>
        <p className="text-[12px] text-ink3 mb-4">
          Calls{' '}
          <code className="bg-parch2 px-1 rounded text-[11px]">GET /api/admin/firebase-debug</code>{' '}
          to check server-side Firebase Admin SDK connectivity.
        </p>
        <button
          onClick={runServerTest}
          disabled={serverTest.status === 'running'}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue text-white text-[13px] font-medium hover:bg-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {serverTest.status === 'running' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Server className="w-4 h-4" />
          )}
          Run server Admin SDK test
        </button>
        <TestResultRow result={serverTest} />
      </section>
    </div>
  );
}

function InfoRow({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-ink3 whitespace-nowrap min-w-[120px]">{label}:</span>
      <span
        className={
          warn ? 'text-amber-600 font-medium break-all' : 'text-ink font-mono text-[12px] break-all'
        }
      >
        {warn && <AlertTriangle className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />}
        {value}
      </span>
    </div>
  );
}

function TestResultRow({ result }: { result: TestResult }) {
  return (
    <div className="border border-bdr rounded-lg p-4 bg-parch2">
      <div className="flex items-start gap-3">
        <StatusIcon status={result.status} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-ink">{result.details}</p>
          {result.error && (
            <div className="mt-2 p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-[12px] text-red-700 font-mono whitespace-pre-wrap">
                {result.error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
