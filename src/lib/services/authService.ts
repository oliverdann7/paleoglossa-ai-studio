import {
  signInWithPopup,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithCredential,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { auth, appleProvider } from '../firebase.js';
import { isCapacitor } from '../platform.js';
import { VocabularyService } from './vocabularyService.js';

/**
 * Generates a cryptographically-random URL-safe nonce and its SHA-256 hash.
 * Apple's native flow hashes the nonce it embeds in the identity token; Firebase
 * verifies it against the raw value we pass to the credential. Both are derived
 * here so the native authorize() call and signInWithCredential() stay in sync.
 */
async function makeAppleNonce(): Promise<{ raw: string; hashed: string }> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const raw = Array.from(bytes, (b) => ('0' + b.toString(16)).slice(-2)).join('');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  const hashed = Array.from(new Uint8Array(digest), (b) => ('0' + b.toString(16)).slice(-2)).join(
    ''
  );
  return { raw, hashed };
}

export interface AuthResult {
  success: boolean;
  error?: string;
  errorCode?: string;
}

/**
 * iOS OAuth client id for native Google Sign-In. Public configuration (client
 * ids ship inside every app bundle by design), baked in at build time from
 * `.env.native-production`. Empty on web builds and when not yet configured.
 */
const GOOGLE_IOS_CLIENT_ID: string =
  (import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID as string | undefined) ?? '';

/**
 * Whether Google Sign-In can work in this environment. Always true on web
 * (popup flow); on native it requires the iOS client id to have been baked
 * into the build — without it the native Google SDK cannot be configured, so
 * the button should not be offered.
 */
export function isGoogleSignInAvailable(): boolean {
  return !isCapacitor() || GOOGLE_IOS_CLIENT_ID.length > 0;
}

let socialLoginInit: Promise<void> | null = null;

/**
 * Lazily import and initialize the native social-login plugin exactly once.
 * Apple needs no configuration on iOS (it authorizes against the app's own
 * bundle id); Google is only initialized when a client id was baked in.
 */
async function getSocialLogin() {
  const { SocialLogin } = await import('@capgo/capacitor-social-login');
  if (!socialLoginInit) {
    socialLoginInit = SocialLogin.initialize({
      apple: {},
      ...(GOOGLE_IOS_CLIENT_ID
        ? { google: { iOSClientId: GOOGLE_IOS_CLIENT_ID, mode: 'online' as const } }
        : {}),
    });
  }
  await socialLoginInit;
  return SocialLogin;
}

/**
 * Rejects with a synthetic `auth/network-request-failed` error if the wrapped
 * promise does not settle in time. Firebase Auth calls can hang indefinitely
 * inside the Capacitor WKWebView (persistence/transport stalls), trapping the
 * UI on a spinner with no feedback. A timeout converts that dead-end into an
 * actionable error the user can retry.
 */
function withAuthTimeout<T>(promise: Promise<T>, ms = 25000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject({ code: 'auth/network-request-failed' });
    }, ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

/**
 * Attempts to sign in with Google.
 *
 * On web, Firebase's `signInWithPopup` is used. On native (Capacitor) neither
 * popup nor redirect can complete inside the WebView (providers block embedded
 * user-agents), so the native Google Sign-In sheet runs via
 * `@capgo/capacitor-social-login`, and the returned OpenID Connect id token is
 * exchanged for a Firebase session with `signInWithCredential` (keeps the
 * existing Firebase JS SDK as the source of truth — no v12 upgrade).
 */
export async function signInWithGoogle(promptAccountSelect = false): Promise<AuthResult> {
  try {
    if (isCapacitor()) {
      return await signInWithGoogleNative();
    }

    const provider = new GoogleAuthProvider();
    if (promptAccountSelect) {
      provider.setCustomParameters({ prompt: 'select_account' });
    }
    await signInWithPopup(auth, provider);
    return { success: true };
  } catch (err: any) {
    return mapFirebaseError(err);
  }
}

async function signInWithGoogleNative(): Promise<AuthResult> {
  if (!GOOGLE_IOS_CLIENT_ID) {
    // Build shipped without an iOS client id — the button is hidden in this
    // case, so this is only reachable programmatically.
    return { success: false, errorCode: 'auth/operation-not-allowed', error: 'auth.networkError' };
  }

  const SocialLogin = await getSocialLogin();

  let idToken: string | null | undefined;
  try {
    const login = await SocialLogin.login({
      provider: 'google',
      options: { scopes: ['email', 'profile'] },
    });
    idToken = (login.result as { idToken?: string | null })?.idToken;
  } catch (err: any) {
    // User-cancelled the native sheet — not an error worth surfacing.
    const msg = String(err?.message ?? err ?? '');
    if (/cancel/i.test(msg)) {
      return { success: false };
    }
    throw err;
  }

  if (!idToken) {
    return {
      success: false,
      errorCode: 'auth/invalid-credential',
      error: 'auth.invalidCredentials',
    };
  }

  const credential = GoogleAuthProvider.credential(idToken);
  await withAuthTimeout(signInWithCredential(auth, credential));
  return { success: true };
}

/**
 * Attempts to sign in with Apple.
 *
 * On web, Firebase's `signInWithPopup` is used. On native (Capacitor) the web
 * redirect flow cannot complete inside the WebView, so we run Apple's native
 * authorization sheet via `@capgo/capacitor-social-login`, then exchange the
 * returned identity token for a Firebase session with `signInWithCredential`
 * (keeps the existing Firebase JS SDK as the source of truth — no v12 upgrade).
 */
export async function signInWithApple(): Promise<AuthResult> {
  try {
    if (isCapacitor()) {
      return await signInWithAppleNative();
    }

    await signInWithPopup(auth, appleProvider);
    return { success: true };
  } catch (err: any) {
    return mapFirebaseError(err);
  }
}

async function signInWithAppleNative(): Promise<AuthResult> {
  const SocialLogin = await getSocialLogin();
  // Apple embeds SHA-256(nonce) in the identity token; Firebase verifies it
  // against the raw value passed to the credential (see makeAppleNonce).
  const { raw, hashed } = await makeAppleNonce();

  let identityToken: string | null | undefined;
  try {
    const login = await SocialLogin.login({
      provider: 'apple',
      options: { scopes: ['email', 'name'], nonce: hashed },
    });
    identityToken = (login.result as { idToken?: string | null })?.idToken;
  } catch (err: any) {
    // User-cancelled the native sheet — not an error worth surfacing.
    const msg = String(err?.message ?? err ?? '');
    if (/cancel/i.test(msg) || err?.code === '1001') {
      return { success: false };
    }
    throw err;
  }

  if (!identityToken) {
    return { success: false, errorCode: 'auth/invalid-credential', error: 'auth.invalidCredentials' };
  }

  const provider = new OAuthProvider('apple.com');
  const credential = provider.credential({ idToken: identityToken, rawNonce: raw });
  await withAuthTimeout(signInWithCredential(auth, credential));
  return { success: true };
}

/**
 * Email / password sign-in.  Works identically in every environment.
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  try {
    await withAuthTimeout(signInWithEmailAndPassword(auth, email, password));
    return { success: true };
  } catch (err: any) {
    return mapFirebaseError(err);
  }
}

/**
 * Called once on app mount (inside AuthProvider) to recover a pending
 * `signInWithRedirect` result.  Must be awaited before the app claims
 * the user is still loading.
 */
export async function handleRedirectResult(): Promise<AuthResult> {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return { success: true };
    }
    return { success: false };
  } catch (err: any) {
    return mapFirebaseError(err);
  }
}

// ---------------------------------------------------------------------------
// Sign-out
// ---------------------------------------------------------------------------

/**
 * Flush any pending vocabulary writes for the current user, then sign out of
 * Firebase Auth.  Always call this instead of the raw Firebase `signOut` so
 * that queued writes are not lost.
 */
export async function signOut(): Promise<void> {
  try {
    await VocabularyService.flushPendingWrites();
  } catch {
    // Non-fatal — proceed with sign-out regardless.
  }
  await firebaseSignOut(auth);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Fetches the sign-in methods Firebase has on record for a given email.
 * Returns an array like `["google.com", "password"]`.
 */
export async function fetchSignInMethods(email: string): Promise<string[]> {
  const { fetchSignInMethodsForEmail } = await import('firebase/auth');
  return withAuthTimeout(fetchSignInMethodsForEmail(auth, email), 10000);
}

function mapFirebaseError(err: any): AuthResult {
  const code = err.code as string;

  // User-cancelled flows are not errors.
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return { success: false };
  }

  if (code === 'auth/popup-blocked') {
    return {
      success: false,
      errorCode: code,
      error: 'auth.popupBlocked',
    };
  }

  // Standard auth errors
  const known: Record<string, string> = {
    'auth/invalid-credential': 'auth.invalidCredentials',
    'auth/user-not-found': 'auth.invalidCredentials',
    'auth/wrong-password': 'auth.invalidCredentials',
    'auth/too-many-requests': 'auth.tooManyRequests',
    'auth/user-disabled': 'auth.userDisabled',
    'auth/network-request-failed': 'auth.networkError',
    'auth/invalid-email': 'auth.invalidEmail',
    'auth/weak-password': 'auth.weakPassword',
    'auth/email-already-in-use': 'auth.emailInUse',
  };

  return {
    success: false,
    errorCode: code,
    error: known[code] || err.message,
  };
}
