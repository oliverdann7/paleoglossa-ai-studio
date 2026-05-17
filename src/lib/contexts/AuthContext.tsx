import React, { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../firebase.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AuthContext, UserProfile, UserStats } from './AuthContextInstance.js';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setDemoModeState] = useState(() => localStorage.getItem('paleoglossa_demo_mode') === 'true');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [claims, setClaimsState] = useState<Record<string, unknown>>({});
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const setDemoMode = (val: boolean) => {
    setDemoModeState(val);
    if (val) localStorage.setItem('paleoglossa_demo_mode', 'true');
    else localStorage.removeItem('paleoglossa_demo_mode');
  };

  const loadProfile = useCallback(async (uid: string) => {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const d = snap.data();
        setProfile({
          displayName: d.displayName || '',
          nickname: d.nickname,
          bio: d.bio,
          avatarUrl: d.avatarUrl,
          isPublic: d.isPublic ?? false,
        });
      }
    } catch (e) {
      console.error('Profile load error', e);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (auth.currentUser) await loadProfile(auth.currentUser.uid);
  }, [loadProfile]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setDemoMode(false);
        try {
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
            setProfile({ displayName: u.displayName || '', isPublic: false });
          } else {
            const d = snap.data();
            setStats(d.stats as UserStats);
            setProfile({
              displayName: d.displayName || '',
              nickname: d.nickname,
              bio: d.bio,
              avatarUrl: d.avatarUrl,
              isPublic: d.isPublic ?? false,
            });
          }
        } catch (e: any) {
          console.error("Auth profile error", e);
        }
        let serverAdmin = false;
        try {
          const token = await u.getIdToken();
          const resp = await fetch('/api/admin/refresh-claims', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resp.ok) {
            const data = await resp.json();
            serverAdmin = data.admin === true;
          }
        } catch { /* non-fatal */ }
        try {
          const result = await u.getIdTokenResult(true);
          const claimsData = result.claims as Record<string, unknown>;
          if (serverAdmin) claimsData.admin = true;
          setClaimsState(claimsData);
        } catch {
          setClaimsState(serverAdmin ? { admin: true } : {});
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [loadProfile]);

  return (
    <AuthContext.Provider value={{ user, loading, isDemoMode, setDemoMode, stats, claims, profile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
