import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { getAnalytics, setUserId } from 'firebase/analytics';
import { getApiUrl } from './apiBaseUrl.js';

export interface ReauthOptions {
  password?: string; // For email/password users
}

/**
 * Reauthenticate the current user before deletion.
 * For email/password: requires password
 * For social: uses popup/redirect flow
 */
export async function reauthenticateUser(options: ReauthOptions): Promise<void> {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error('No user signed in');
  }

  // Check if user has password auth
  const hasPasswordAuth =
    currentUser.providerData.some((provider) => provider.providerId === 'password') ||
    currentUser.email;

  if (hasPasswordAuth && !options.password) {
    throw new Error('Password required for email/password accounts');
  }

  // Reauthenticate with email/password
  if (hasPasswordAuth && options.password) {
    if (!currentUser.email) {
      throw new Error('User email not found');
    }

    const credential = EmailAuthProvider.credential(currentUser.email, options.password);
    await reauthenticateWithCredential(currentUser, credential);
    return;
  }

  // For social auth, user must reauthenticate through provider
  // Client should handle this with GoogleAuthProvider.getCredential() or similar
  const hasGoogleAuth = currentUser.providerData.some(
    (provider) => provider.providerId === 'google.com'
  );

  if (hasGoogleAuth) {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    try {
      const result = await (currentUser as any).reauthenticateWithPopup(provider);
      if (!result) {
        throw new Error('Google reauthentication failed');
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked') {
        throw new Error('Sign-in popup was blocked. Please enable popups and try again.', {
          cause: error,
        });
      }
      throw error;
    }
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
