import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Injected at build time by vite.config.ts — reads from firebase-applet-config.json
// (AI Studio) or VITE_FIREBASE_* environment variables (Vercel / local dev).
declare const __FIREBASE_CONFIG__: {
  projectId: string; appId: string; apiKey: string; authDomain: string;
  storageBucket: string; messagingSenderId: string; measurementId: string;
  firestoreDatabaseId: string;
};
const { firestoreDatabaseId, ...firebaseConfig } = __FIREBASE_CONFIG__;

const REQUIRED_KEYS = ['projectId', 'apiKey', 'authDomain', 'appId'] as const;
const missing = REQUIRED_KEYS.filter(k => !firebaseConfig[k as keyof typeof firebaseConfig]);

if (missing.length > 0) {
  const isDev = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const msg =
    'Firebase client SDK is missing required configuration fields: ' + missing.join(', ') + '.\n\n' +
    (isDev
      ? 'To fix this:\n' +
        '  1. Copy .env.example to firebase-applet-config.json and fill in the values, OR\n' +
        '  2. Set VITE_FIREBASE_* environment variables (e.g. VITE_FIREBASE_API_KEY).\n\n' +
        '  See .env.example for the list of required variables.'
      : 'Set VITE_FIREBASE_* environment variables in your production deployment.\n' +
        '  Required: VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_API_KEY, ' +
        'VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_APP_ID');
  throw new Error(msg);
}

const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
}, firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
