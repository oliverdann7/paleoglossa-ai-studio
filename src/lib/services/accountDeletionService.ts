import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
} from 'firebase/auth';
import { getAnalytics, setUserId } from 'firebase/analytics';
import { getApiUrl } from './apiBaseUrl.js';
import { reauthenticateWithProvider } from './authService.js';

export interface ReauthOptions {
  password?: string; // For email/password users
}

/** How the current user must confirm their identity before deletion. */
export type ReauthMethod = 'password' | 'google.com' | 'apple.com' | 'none';

/**
 * Picks the re-authentication method from the providers actually linked to
 * the account. A password is only ever asked of accounts that have one —
 * having an email address does not imply it (Google and Apple accounts carry
 * an email too).
 */
export function getReauthMethod(
  user: { providerData?: ReadonlyArray<{ providerId: string }> } | null | undefined
): ReauthMethod {
  const ids = new Set((user?.providerData ?? []).map((p) => p.providerId));
  if (ids.has('password')) return 'password';
  if (ids.has('google.com')) return 'google.com';
  if (ids.has('apple.com')) return 'apple.com';
  return 'none';
}

/**
 * Reauthenticate the current user before deletion.
 * Email/password accounts confirm with their password; Google and Apple
 * accounts confirm through their provider (popup on web, native sheet in the
 * iOS/Android apps). Accounts with no linked provider need no extra step —
 * the server still requires a valid session and the typed confirmation.
 */
export async function reauthenticateUser(options: ReauthOptions): Promise<void> {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('No user signed in');
  }

  const method = getReauthMethod(currentUser);

  if (method === 'password') {
    if (!options.password) {
      throw new Error('Password required for email/password accounts');
    }
    if (!currentUser.email) {
      throw new Error('User email not found');
    }
    const credential = EmailAuthProvider.credential(currentUser.email, options.password);
    await reauthenticateWithCredential(currentUser, credential);
    return;
  }

  if (method === 'google.com' || method === 'apple.com') {
    await reauthenticateWithProvider(method);
  }
}

/**
 * Delete the user account and all associated data.
 * This calls the backend API which cascades deletion to Firestore.
 */
export async function deleteUserAccount(confirmationText: string): Promise<void> {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('No user signed in');
  }

  try {
    // Call backend API to delete all Firestore data
    const idToken = await currentUser.getIdToken();
    const response = await fetch(getApiUrl('/api/account/delete'), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ confirmationText }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete account');
    }

    // Clear local state
    clearLocalState();

    // Clear analytics identity
    try {
      const analytics = getAnalytics();
      setUserId(analytics, null as any);
    } catch {
      // Analytics may not be initialized
    }

    // Sign out
    await signOut(auth);
  } catch (error) {
    console.error('Account deletion error:', error);
    throw error;
  }
}

/**
 * Clear all local app state and cache
 */
function clearLocalState(): void {
  const keysToRemove = [
    'paleoglossa_knowledge',
    'paleoglossa_stats',
    'paleoglossa_reading_sessions',
    'paleoglossa_settings',
    'app_lang',
    'firebase_user',
    'user_profile',
  ];

  keysToRemove.forEach((key) => {
    localStorage.removeItem(key);
  });

  // Clear all sessionStorage
  sessionStorage.clear();

  // Clear IndexedDB if available
  if (window.indexedDB) {
    try {
      const dbs = ['paleoglossa', 'firebaseLocalStorageDb'];
      dbs.forEach((dbName) => {
        const request = indexedDB.deleteDatabase(dbName);
        request.onerror = () => console.error(`Failed to delete ${dbName}`);
      });
    } catch {
      // IndexedDB not available
    }
  }
}
