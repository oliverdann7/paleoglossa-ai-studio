import { initializeApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  inMemoryPersistence,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { isCapacitor } from './platform.js';

// Injected at build time by vite.config.ts — reads from firebase-applet-config.json
// (AI Studio) or VITE_FIREBASE_* environment variables (Vercel / local dev).
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
const { firestoreDatabaseId, ...firebaseConfig } = __FIREBASE_CONFIG__;

const REQUIRED_KEYS = ['projectId', 'apiKey', 'authDomain', 'appId'] as const;
const missing = REQUIRED_KEYS.filter((k) => !firebaseConfig[k as keyof typeof firebaseConfig]);

if (missing.length > 0) {
  const isDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const msg =
    'Firebase client SDK is missing required configuration fields: ' +
    missing.join(', ') +
    '.\n\n' +
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

// IndexedDB is broken inside the iOS Capacitor WKWebView: open/transaction
// requests can hang forever without firing success/error. That's the confirmed
// root cause of the native sign-in hang — the network request succeeds (raw
// fetch returns 200 in ~1s), but Firebase Auth's follow-up write of the session
// to IndexedDB never completes, so `signInWithEmailAndPassword` never resolves.
// On native we therefore avoid IndexedDB entirely: Auth persists to localStorage
// (synchronous, reliable in WKWebView) and Firestore uses an in-memory cache.
// Web keeps the richer IndexedDB-backed persistence.
const native = isCapacitor();

export const db = initializeFirestore(
  app,
  {
    localCache: native
      ? memoryLocalCache()
      : persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    // Firestore's default WebChannel streaming transport frequently fails to
    // establish inside the iOS/Android Capacitor WebView (and behind some
    // corporate proxies), leaving reads hanging indefinitely. Auto-detecting
    // long-polling lets the SDK fall back to plain HTTP so post-login reads
    // actually resolve on native.
    experimentalAutoDetectLongPolling: true,
  },
  firestoreDatabaseId || '(default)'
);

export const auth = native
  ? initializeAuth(app, {
      // localStorage first — IndexedDB persistence hangs in the WKWebView and
      // would trap sign-in on the spinner forever.
      persistence: [browserLocalPersistence, inMemoryPersistence],
      // No popup/redirect resolver on native: OAuth runs through the native
      // Google/Apple sheets (authService) and never through Firebase's
      // popup or redirect flows, so the resolver — which wires the auth
      // iframe against authDomain — is dead weight inside the WebView. This
      // matches Firebase's own guidance for Capacitor/Ionic apps.
    })
  : getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com');
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
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
