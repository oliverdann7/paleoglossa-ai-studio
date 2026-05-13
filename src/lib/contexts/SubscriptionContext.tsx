import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { apiFetch } from '../services/apiFetch';
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
  selectFreePlan: () => void;
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
// TODO: Migrate to Firebase custom claims so admin status is verifiable server-side.

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  currentPlan: 'free',
  selectedLanguageIds: ['grc'],
  subscriptionStatus: 'free',
};

const PAID_PLANS: PlanId[] = ['basic_1', 'duo_2', 'full_all'];

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, claims } = useAuth();
  const isAdmin = !!claims?.admin;
  const [subscription, setSubscription] = useState<UserSubscription>(DEFAULT_SUBSCRIPTION);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load subscription: trust Firestore for paid plans, fall back to localStorage for free.
  useEffect(() => {
    const load = async () => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, `users/${user.uid}`));
          if (snap.exists()) {
            const data = snap.data();
            const plan = data.currentPlan as PlanId | undefined;
            // Only trust paid plans from the server (Stripe webhook).
            // Reject free+localStorage hybrid: always read free from defaults.
            if (plan && PAID_PLANS.includes(plan)) {
              setSubscription({
                currentPlan: plan,
                selectedLanguageIds: (data.selectedLanguageIds as string[]) || ['grc'],
                subscriptionStatus: (data.subscriptionStatus as SubscriptionStatus) || 'free',
              });
              setIsLoaded(true);
              return;
            }
          }
        } catch {
          // Fall through to localStorage
        }
      }
      // Guest/demo mode: read from localStorage as a transient fallback.
      // Paid plans saved here are stale — the server is the authority.
      const stored = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (stored) {
        try {
          const parsed: UserSubscription = JSON.parse(stored);
          // Only restore free from localStorage; paid plans must come from server.
          if (parsed.currentPlan === 'free' || parsed.currentPlan === undefined) {
            setSubscription({
              currentPlan: 'free',
              selectedLanguageIds: parsed.selectedLanguageIds || ['grc'],
              subscriptionStatus: 'free',
            });
            setIsLoaded(true);
            return;
          }
        } catch { /* ignore */ }
      }
      setIsLoaded(true);
    };
    load();
  }, [user]);

  // Save selectedLanguageIds to localStorage only (guest/demo).
  // The server (Stripe webhook) is the authority for paid subscription fields.
  // Firestore writes for language selection are handled by the server.
  const persistLanguages = useCallback((langIds: string[]) => {
    const stored = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
    const existing = stored ? JSON.parse(stored) : {};
    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify({ ...existing, selectedLanguageIds: langIds }));
    if (user) {
      // Update Firestore with language selection only (not subscription fields).
      setDoc(doc(db, `users/${user.uid}`), {
        selectedLanguageIds: langIds,
        updatedAt: serverTimestamp(),
      }, { merge: true }).catch(() => {});
    }
  }, [user]);

  // Only callable for the free plan. Paid plans must go through createCheckoutSession
  // which is handled server-side via the Stripe webhook.
  const selectFreePlan = useCallback(() => {
    const plan = getPlanById('free');
    const limit = plan.languageLimit;
    const newSelected = subscription.selectedLanguageIds.slice(0, limit as number);
    setSubscription({
      currentPlan: 'free',
      selectedLanguageIds: newSelected,
      subscriptionStatus: 'free',
    });
    persistLanguages(newSelected);
  }, [subscription.selectedLanguageIds, persistLanguages]);

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
      persistLanguages(newSelected);
      return { ...prev, selectedLanguageIds: newSelected };
    });
  }, [persistLanguages]);

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
    try {
      const data = await apiFetch<{ url: string | null; devMode?: boolean }>('/api/stripe/create-checkout-session', {
        method: 'POST',
        body: { planId, billingCycle },
      });
      if (data.devMode) {
        // Dev mode: store plan in memory + localStorage (transient, no Firestore write).
        // The Stripe webhook is the authority in production.
        const trialEnd = new Date(Date.now() + TRIAL_DAYS * 86400000).toISOString();
        const devSub: UserSubscription = {
          currentPlan: planId,
          selectedLanguageIds: subscription.selectedLanguageIds,
          subscriptionStatus: 'trialing',
          trialEnd,
        };
        setSubscription(devSub);
        localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(devSub));
        return null;
      }
      return data.url || null;
    } catch (err) {
      console.error('Checkout error:', err);
      return null;
    }
  }, [user, subscription.selectedLanguageIds]);

  const createPortalSession = useCallback(async (): Promise<string | null> => {
    try {
      const data = await apiFetch<{ url: string | null; devMode?: boolean }>('/api/stripe/create-portal-session', {
        method: 'POST',
      });
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
      selectFreePlan,
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
