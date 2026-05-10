import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UserStats {
  totalKnown: number;
  readToday: number;
  readingTime: number;
  lastActive: string;
  streak: number;
  freezesTotal: number;
  freezesUsed: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemoMode: boolean;
  setDemoMode: (val: boolean) => void;
  stats: UserStats | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isDemoMode: false,
  setDemoMode: () => {},
  stats: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setDemoMode] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setDemoMode(false);
        try {
          // Attempt to boot profile if doesn't exist
          const profileRef = doc(db, 'users', u.uid);
          const snap = await getDoc(profileRef);
          if (!snap.exists()) {
            const now = new Date();
            now.setUTCHours(now.getUTCHours() - 4);
            const initStats: UserStats = {
              totalKnown: 0,
              readToday: 0,
              readingTime: 0,
              lastActive: now.toISOString(),
              streak: 1,
              freezesTotal: 2,
              freezesUsed: 0
            };
            await setDoc(profileRef, {
              email: u.email || '',
              displayName: u.displayName || '',
              createdAt: serverTimestamp(),
              currentPlan: 'free',
              stats: initStats
            });
            setStats(initStats);
          } else {
            setStats(snap.data().stats as UserStats);
          }
        } catch (e: any) {
          // handle failure gently
          console.error("Auth profile error", e);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode, setDemoMode, stats }}>
      {children}
    </AuthContext.Provider>
  );
};
