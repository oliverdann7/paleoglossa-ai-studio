import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signInWithCredential,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { auth, appleProvider } from '../firebase.js';
import { isCapacitor, capacitorPlatform } from '../platform.js';
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
  /** i18n key describing the failure (see AUTH_ERROR_DEFAULTS). Absent on user cancellation. */
  error?: string;
  errorCode?: string;
  /**
   * Underlying provider/SDK error (code + message), for diagnostics only.
   * Surfaced in small print under the banner so a TestFlight screenshot is
   * enough to root-cause a failure that only reproduces on a device.
   */
  detail?: string;
}

/**
 * English defaults for every i18n key an `AuthResult.error` can carry. Pages
 * render errors through `describeAuthError`, so a locale that lacks a key can
 * never leak the raw key ("auth.networkError") into the UI — which is exactly
 * what TestFlight build 59 showed after a failed native Google sign-in.
 */
export const AUTH_ERROR_DEFAULTS: Record<string, string> = {
  'auth.networkError': 'Network error. Please check your connection and try again.',
  'auth.invalidCredentials': 'Incorrect email or password. Please try again.',
  'auth.tooManyRequests':
    'Too many failed attempts. Please wait a moment and try again, or reset your password.',
  'auth.userDisabled': 'This account has been disabled. Please contact support.',
  'auth.invalidEmail': 'Please enter a valid email address.',
  'auth.weakPassword': 'Password should be at least 6 characters.',
  'auth.emailInUse': 'An account with this email already exists. Please sign in instead.',
  'auth.popupBlocked':
    'Popup was blocked by your browser. Please allow popups or open this app in a new tab/window to sign in.',
  'auth.providerUnavailable':
    'This sign-in method is not available in this build. Please use email sign-in or visit paleoglossa.com.',
  'auth.signInFailed': 'Sign in failed. Please try again.',
};

type Translate = (key: string, defaultValue: string) => string;

/**
 * Human-readable message for a failed `AuthResult`. Translates known keys
 * (falling back to the English default) and passes anything else through.
 */
export function describeAuthError(t: Translate, result: AuthResult): string {
  const key = result.error ?? 'auth.signInFailed';
  const fallback = AUTH_ERROR_DEFAULTS[key];
  return fallback ? t(key, fallback) : key;
}

/**
 * Whether a rejection from the native social-login sheet means the user
 * dismissed it. `@capgo/capacitor-social-login` marks these with
 * `code: 'USER_CANCELLED'`, but the message it carries is the raw platform
 * description — on iOS "The operation couldn't be completed.
 * (com.apple.AuthenticationServices.AuthorizationError error 1001.)" — which
 * contains no "cancel" at all. Build 59 showed that string to the user as an
 * error, so the code (and the ASAuthorizationError.canceled value 1001) are
 * checked explicitly.
 */
export function isUserCancellation(err: unknown): boolean {
  const e = err as { code?: unknown; message?: unknown } | null | undefined;
  if (e?.code === 'USER_CANCELLED') return true;
  const msg = String(e?.message ?? err ?? '');
  return /cancel/i.test(msg) || /AuthorizationError error 1001\b/.test(msg);
}

function errorDetail(err: unknown): string | undefined {
  const e = err as
    | { code?: unknown; message?: unknown; customData?: { message?: unknown } }
    | null
    | undefined;
  const code = typeof e?.code === 'string' ? e.code : '';
  const message = typeof e?.message === 'string' ? e.message : '';
  // Firebase's own message is the generic "Firebase: Error (auth/…)"; the
  // transport failure that caused it ("TypeError: Load failed") lives in
  // customData.message and is what actually explains a network error.
  const cause = typeof e?.customData?.message === 'string' ? e.customData.message : '';
  const text = [code, message, cause && cause !== message ? cause : '']
    .filter(Boolean)
    .join(': ')
    .trim();
  return text ? text.slice(0, 300) : undefined;
}

/**
 * OAuth client ids for native Google Sign-In. Public configuration (client
 * ids ship inside every app bundle by design), baked in at build time from
 * `.env.native-production`. Empty on web builds and when not yet configured.
 * iOS uses the iOS OAuth client; Android's Credential Manager flow validates
 * the id token against the *web* OAuth client (client_type 3).
 */
const GOOGLE_IOS_CLIENT_ID: string =
  (import.meta.env.VITE_GOOGLE_IOS_CLIENT_ID as string | undefined) ?? '';
const GOOGLE_WEB_CLIENT_ID: string =
  (import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID as string | undefined) ?? '';

/**
 * Whether Google Sign-In can work in this environment. Always true on web
 * (popup flow); on native it requires the platform's client id to have been
 * baked into the build — without it the native Google SDK cannot be
 * configured, so the button should not be offered.
 */
export function isGoogleSignInAvailable(): boolean {
  if (!isCapacitor()) return true;
  return capacitorPlatform() === 'android'
    ? GOOGLE_WEB_CLIENT_ID.length > 0
    : GOOGLE_IOS_CLIENT_ID.length > 0;
}

/**
 * Whether Apple Sign-In can work in this environment. Web uses the popup
 * flow; the native authorization sheet exists only on iOS. Android would
 * need Apple's web-flow (service id + redirect URL + backend handling),
 * which is not configured — the button must be hidden there.
 */
export function isAppleSignInAvailable(): boolean {
  return !isCapacitor() || capacitorPlatform() === 'ios';
}

let socialLoginInit: Promise<void> | null = null;

/**
 * Lazily import and initialize the native social-login plugin exactly once.
 * Apple needs no configuration on iOS (it authorizes against the app's own
 * bundle id) but must be omitted on Android, where the plugin rejects an
 * empty apple config; Google is only initialized when the platform's client
 * id was baked in.
 */
async function getSocialLogin() {
  const { SocialLogin } = await import('@capgo/capacitor-social-login');
  if (!socialLoginInit) {
    const android = capacitorPlatform() === 'android';
    const google = android
      ? GOOGLE_WEB_CLIENT_ID
        ? { google: { webClientId: GOOGLE_WEB_CLIENT_ID, mode: 'online' as const } }
        : {}
      : GOOGLE_IOS_CLIENT_ID
        ? { google: { iOSClientId: GOOGLE_IOS_CLIENT_ID, mode: 'online' as const } }
        : {};
    socialLoginInit = SocialLogin.initialize({
      ...(android ? {} : { apple: {} }),
      ...google,
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
      // Distinguishable from a real fetch failure in `detail`, so a device
      // screenshot tells a hang apart from a rejected request.
      reject({
        code: 'auth/network-request-failed',
        message: `Firebase Auth did not respond within ${Math.round(ms / 1000)}s`,
      });
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
  if (!isGoogleSignInAvailable()) {
    // Build shipped without this platform's client id — the button is hidden
    // in this case, so this is only reachable programmatically.
    return {
      success: false,
      errorCode: 'auth/operation-not-allowed',
      error: 'auth.providerUnavailable',
    };
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
    if (isUserCancellation(err)) {
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
  if (!isAppleSignInAvailable()) {
    // Android: no Apple web-flow configured — the button is hidden there, so
    // this is only reachable programmatically.
    return {
      success: false,
      errorCode: 'auth/operation-not-allowed',
      error: 'auth.providerUnavailable',
    };
  }
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
    if (isUserCancellation(err)) {
      return { success: false };
    }
    throw err;
  }

  if (!identityToken) {
    return {
      success: false,
      errorCode: 'auth/invalid-credential',
      error: 'auth.invalidCredentials',
    };
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
  const code = err?.code as string | undefined;

  // User-cancelled flows are not errors.
  if (
    code === 'auth/popup-closed-by-user' ||
    code === 'auth/cancelled-popup-request' ||
    isUserCancellation(err)
  ) {
    return { success: false };
  }

  const detail = errorDetail(err);
  // Keep the raw failure in the console (Safari Web Inspector / Xcode) —
  // native sign-in problems are otherwise invisible.
  console.error('[auth] sign-in failed:', detail ?? err);

  if (code === 'auth/popup-blocked') {
    return {
      success: false,
      errorCode: code,
      error: 'auth.popupBlocked',
      detail,
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
    error: (code && known[code]) || 'auth.signInFailed',
    detail,
  };
}
