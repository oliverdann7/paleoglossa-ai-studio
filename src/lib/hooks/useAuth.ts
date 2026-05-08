import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';

export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<AuthState>('loading');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setState(u ? 'authenticated' : 'unauthenticated');
    });
    return unsubscribe;
  }, []);

  return { user, state };
}
