import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth, appleProvider } from '../firebase.js';
import { isCapacitor } from '../platform.js';
import { VocabularyService } from './vocabularyService.js';

export interface AuthResult {
  success: boolean;
  error?: string;
  errorCode?: string;
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
 * On web the native `signInWithPopup` is used (same as before).  In
 * Capacitor environments where pop-ups are unavailable, Firebase Auth's
 * `signInWithRedirect` is used instead — the page navigates to the
 * OAuth provider, and the result is recovered by `handleRedirectResult`
 * when the user returns.
 */
export async function signInWithGoogle(promptAccountSelect = false): Promise<AuthResult> {
  const provider = new GoogleAuthProvider();
  if (promptAccountSelect) {
    provider.setCustomParameters({ prompt: 'select_account' });
  }

  try {
    if (isCapacitor()) {
      await signInWithRedirect(auth, provider);
      // The page will navigate away — reaching this line means the
      // redirect was initiated.  The result is handled by
      // `handleRedirectResult` on the next page load.
      return { success: true };
    }

    await signInWithPopup(auth, provider);
    return { success: true };
  } catch (err: any) {
    return mapFirebaseError(err);
  }
}

/**
 * Attempts to sign in with Apple.
 *
 * Works like `signInWithGoogle` — popup on web, redirect in Capacitor.
 */
export async function signInWithApple(): Promise<AuthResult> {
  try {
    if (isCapacitor()) {
      await signInWithRedirect(auth, appleProvider);
      return { success: true };
    }

    await signInWithPopup(auth, appleProvider);
    return { success: true };
  } catch (err: any) {
    return mapFirebaseError(err);
  }
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
