import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { PlanId, SubscriptionStatus, getPlanById, canAddLanguage as canAddByPlan, canAccessLanguage as canAccessByPlan, TRIAL_DAYS } from '../constants/plans';

const SUBSCRIPTION_STORAGE_KEY = 'paleoglossa_subscription';

interface UserSubscription {
  currentPlan: PlanId;
  selectedLanguageIds: string[];
  subscriptionStatus: SubscriptionStatus;
  stripeCustomerId?: string;
  trialEnd?: string;
}

interface SubscriptionContextValue {
  subscription: UserSubscription;
  setPlan: (planId: PlanId) => void;
  toggleLanguage: (languageId: string) => void;
  canAccessLanguage: (languageId: string) => boolean;
  canAddLanguage: () => boolean;
  remainingSlots: number;
  isLoaded: boolean;
  isAdmin: boolean;
  isOnTrial: () => boolean;
  createCheckoutSession: (planId: PlanId, billingCycle?: 'monthly' | 'yearly') => Promise<string | null>;
  createPortalSession: () => Promise<string | null>;
}

const ADMIN_EMAILS = ['danezolv@gmail.com'];

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  currentPlan: 'free',
  selectedLanguageIds: ['grc'],
  subscriptionStatus: 'free',
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;
  const [subscription, setSubscription] = useState<UserSubscription>(DEFAULT_SUBSCRIPTION);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, `users/${user.uid}`));
          if (snap.exists()) {
            const data = snap.data();
            if (data.currentPlan) {
              setSubscription({
                currentPlan: data.currentPlan as PlanId,
                selectedLanguageIds: data.selectedLanguageIds || ['grc'],
                subscriptionStatus: data.subscriptionStatus || 'free',
              });
              setIsLoaded(true);
              return;
            }
          }
        } catch {
          // Fall through to localStorage
        }
      }
      const stored = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (stored) {
        try {
          setSubscription(JSON.parse(stored));
        } catch { /* ignore */ }
      }
      setIsLoaded(true);
    };
    load();
  }, [user]);

  const persist = useCallback((sub: UserSubscription) => {
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(sub));
    if (user) {
      setDoc(doc(db, `users/${user.uid}`), {
        currentPlan: sub.currentPlan,
        selectedLanguageIds: sub.selectedLanguageIds,
        subscriptionStatus: sub.subscriptionStatus,
        subscriptionUpdatedAt: serverTimestamp(),
      }, { merge: true }).catch(() => {});
    }
  }, [user]);

  const setPlan = useCallback((planId: PlanId) => {
    const plan = getPlanById(planId);
    const limit = plan.languageLimit;
    const newSelected = limit === 'all'
      ? [...subscription.selectedLanguageIds]
      : subscription.selectedLanguageIds.slice(0, limit);
    const newSub: UserSubscription = {
      currentPlan: planId,
      selectedLanguageIds: newSelected,
      subscriptionStatus: planId === 'free' ? 'free' : 'active',
    };
    setSubscription(newSub);
    persist(newSub);
  }, [subscription.selectedLanguageIds, persist]);

  const toggleLanguage = useCallback((languageId: string) => {
    setSubscription(prev => {
      const isSelected = prev.selectedLanguageIds.includes(languageId);
      let newSelected: string[];
      if (isSelected) {
        newSelected = prev.selectedLanguageIds.filter(id => id !== languageId);
        if (newSelected.length === 0) newSelected = ['grc'];
      } else {
        const canAdd = canAddByPlan(prev.currentPlan, prev.selectedLanguageIds);
        if (!canAdd) return prev;
        newSelected = [...prev.selectedLanguageIds, languageId];
      }
      const newSub = { ...prev, selectedLanguageIds: newSelected };
      persist(newSub);
      return newSub;
    });
  }, [persist]);

  const isOnTrial = useCallback((): boolean => {
    if (!subscription.trialEnd) return false;
    return new Date(subscription.trialEnd) > new Date();
  }, [subscription.trialEnd]);

  const hasTrialAccess = useCallback((): boolean => {
    if (isAdmin) return true;
    if (isOnTrial()) return true;
    return false;
  }, [isAdmin, isOnTrial]);

  const checkAccess = useCallback((languageId: string): boolean => {
    if (hasTrialAccess()) return true;
    return canAccessByPlan(subscription.currentPlan, languageId, subscription.selectedLanguageIds);
  }, [subscription, isAdmin, hasTrialAccess]);

  const checkCanAdd = useCallback((): boolean => {
    if (hasTrialAccess()) return true;
    return canAddByPlan(subscription.currentPlan, subscription.selectedLanguageIds);
  }, [subscription, isAdmin, hasTrialAccess]);

  const createCheckoutSession = useCallback(async (planId: PlanId, billingCycle: 'monthly' | 'yearly' = 'monthly'): Promise<string | null> => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) return null;

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
          planId,
          billingCycle,
        }),
      });
      const data = await response.json();
      if (data.devMode) {
        // Dev mode: set plan with trial period
        const trialEnd = new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString();
        setSubscription(prev => ({
          ...prev,
          currentPlan: planId,
          subscriptionStatus: 'trialing',
          trialEnd,
        }));
        persist({ ...subscription, currentPlan: planId, subscriptionStatus: 'trialing', trialEnd });
        return null;
      }
      return data.url || null;
    } catch (err) {
      console.error('Checkout error:', err);
      return null;
    }
  }, [user, setPlan, subscription, persist]);

  const createPortalSession = useCallback(async (): Promise<string | null> => {
    const token = await auth.currentUser?.getIdToken();
    if (!token) return null;

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
      });
      const data = await response.json();
      if (data.devMode) return null;
      return data.url || null;
    } catch (err) {
      console.error('Portal error:', err);
      return null;
    }
  }, [subscription]);

  const remainingSlots = isAdmin || isOnTrial() ? Infinity : subscription.currentPlan === 'full_all'
    ? Infinity
    : (getPlanById(subscription.currentPlan).languageLimit as number) - subscription.selectedLanguageIds.length;

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      setPlan,
      toggleLanguage,
      canAccessLanguage: checkAccess,
      canAddLanguage: checkCanAdd,
      remainingSlots,
      isLoaded,
      isAdmin,
      isOnTrial,
      createCheckoutSession,
      createPortalSession,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
