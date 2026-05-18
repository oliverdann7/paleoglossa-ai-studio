import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import type { App } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';
import type { Auth } from 'firebase-admin/auth';

let app: App | null = null;
let _adminDb: Firestore | null = null;
let _adminAuth: Auth | null = null;
let initialized = false;

function loadServiceAccount(): object | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      return JSON.parse(json);
    } catch {
      console.error('[firebaseAdmin] FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
      return null;
    }
  }
  return null;
}

function buildCredentialFromEnv(): object | null {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (projectId && clientEmail && privateKey) {
    return {
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'),
    };
  }
  return null;
}

function tryInit(): void {
  if (initialized) return;
  initialized = true;

  if (getApps().length > 0) {
    app = getApps()[0];
    _adminDb = getFirestore(app);
    _adminAuth = getAuth(app);
    return;
  }

  const serviceAccount = loadServiceAccount() ?? buildCredentialFromEnv();

  if (serviceAccount) {
    try {
      app = initializeApp({ credential: cert(serviceAccount as any) });
      _adminDb = getFirestore(app);
      _adminAuth = getAuth(app);
      return;
    } catch (err) {
      console.error('[firebaseAdmin] Failed to initialize with service account:', err);
    }
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  if (projectId) {
    try {
      app = initializeApp({
        projectId,
        credential: applicationDefault(),
      });
      _adminDb = getFirestore(app);
      _adminAuth = getAuth(app);
      console.log('[firebaseAdmin] Initialized with Application Default Credentials');
      return;
    } catch (err) {
      console.error('[firebaseAdmin] Failed to initialize with ADC:', err);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Firebase Admin SDK is not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON ' +
        'or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY environment variables.'
    );
  }

  console.warn(
    '[firebaseAdmin] Firebase Admin SDK not configured in development. ' +
      'Set FIREBASE_SERVICE_ACCOUNT_JSON or individual env vars for Admin features.'
  );
}

export function getAdminDb(): Firestore | null {
  tryInit();
  return _adminDb;
}

export function getAdminAuth(): Auth | null {
  tryInit();
  return _adminAuth;
}

export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    const db = getAdminDb();
    if (!db) throw new Error('Firebase Admin not configured — adminDb unavailable');
    return (db as any)[prop];
  },
});

export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    const auth = getAdminAuth();
    if (!auth) throw new Error('Firebase Admin not configured — adminAuth unavailable');
    return (auth as any)[prop];
  },
});

export function isAdminAvailable(): boolean {
  tryInit();
  return _adminDb !== null;
}
