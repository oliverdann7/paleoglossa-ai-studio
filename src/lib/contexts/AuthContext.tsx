import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AuthContext, UserStats } from './AuthContextInstance';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setDemoModeState] = useState(() => localStorage.getItem('paleoglossa_demo_mode') === 'true');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [claims, setClaimsState] = useState<Record<string, unknown>>({});

  const setDemoMode = (val: boolean) => {
    setDemoModeState(val);
    if (val) localStorage.setItem('paleoglossa_demo_mode', 'true');
    else localStorage.removeItem('paleoglossa_demo_mode');
  };

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
              streak: 0,
              freezesTotal: 2,
              freezesUsed: 0
            };
            await setDoc(profileRef, {
              email: u.email || '',
              displayName: u.displayName || '',
              createdAt: serverTimestamp(),
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
        try {
          const token = await u.getIdToken();
          await fetch('/api/admin/refresh-claims', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch { /* non-fatal — claim will be picked up on next login */ }
        try {
          const result = await u.getIdTokenResult(true);
          setClaimsState(result.claims as Record<string, unknown>);
        } catch {
          setClaimsState({});
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode, setDemoMode, stats, claims }}>
      {children}
    </AuthContext.Provider>
  );
};
