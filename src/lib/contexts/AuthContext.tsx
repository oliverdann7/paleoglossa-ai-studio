import React, { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, db } from '../firebase.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AuthContext, UserProfile, UserStats } from './AuthContextInstance.js';
import { identifyAnalytics, resetAnalytics, trackEvent, ANALYTICS_EVENTS } from '../analytics.js';
import { getApiUrl } from '../services/apiBaseUrl.js';
import { handleRedirectResult } from '../services/authService.js';
import { isCapacitor } from '../platform.js';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setDemoModeState] = useState(
    () => localStorage.getItem('paleoglossa_demo_mode') === 'true'
  );
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
    // Only recover redirect results in Capacitor where signInWithRedirect is used.
    if (isCapacitor()) handleRedirectResult();

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        resetAnalytics();
        setLoading(false);
        return;
      }

      setDemoMode(false);
      identifyAnalytics(u.uid, {
        email: u.email || undefined,
        displayName: u.displayName || undefined,
      });

      // Let the user into the app the instant Firebase Auth confirms them.
      // Profile, stats and claims load in the background below, so a slow or
      // blocked Firestore connection (e.g. inside the iOS WebView) can never
      // trap the user on the loading spinner after a successful sign-in.
      setLoading(false);

      void (async () => {
        // Load (or initialise) the user profile.
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
              // First-win streak (roadmap § 11, 1.2): day one counts.
              streak: 1,
              freezesTotal: 2,
              freezesUsed: 0,
            };
            await setDoc(profileRef, {
              email: u.email || '',
              displayName: u.displayName || '',
              createdAt: serverTimestamp(),
              stats: initStats,
            });
            setStats(initStats);
            setProfile({ displayName: u.displayName || '', isPublic: false });
            trackEvent(ANALYTICS_EVENTS.SIGNUP_COMPLETED);
            u.getIdToken().then((token) =>
              fetch(getApiUrl('/api/auth/welcome-email'), {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName: u.displayName || '' }),
              }).catch(() => {})
            );
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
        } catch (e: unknown) {
          console.error('Auth profile error', e);
        }

        // Read cached claims first (instant, no network).
        try {
          const cachedResult = await u.getIdTokenResult(false);
          setClaimsState(cachedResult.claims as Record<string, unknown>);
        } catch {
          /* non-fatal */
        }

        // Refresh admin claims — does not block rendering.
        let serverAdmin = false;
        try {
          const token = await u.getIdToken();
          const resp = await fetch(getApiUrl('/api/admin/refresh-claims'), {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (resp.ok) {
            const data = await resp.json();
            serverAdmin = data.admin === true;
          }
        } catch {
          /* non-fatal */
        }
        if (serverAdmin) {
          try {
            const result = await u.getIdTokenResult(true);
            const claimsData = result.claims as Record<string, unknown>;
            claimsData.admin = true;
            setClaimsState(claimsData);
          } catch {
            setClaimsState((prev) => ({ ...prev, admin: true }));
          }
        }
      })();
    });
    return () => unsub();
  }, [loadProfile]);

  return (
    <AuthContext.Provider
      value={{ user, loading, isDemoMode, setDemoMode, stats, claims, profile, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};
