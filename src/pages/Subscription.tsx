import { useState, useEffect } from 'react';
import {
  Check,
  Sparkles,
  Crown,
  ArrowRight,
  ExternalLink,
  Loader2,
  Info,
  Infinity as InfinityIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics';
import { useSubscription } from '../lib/contexts/SubscriptionContext.js';
import { PLANS, getPlanById } from '../lib/constants/plans.js';
import { LANGUAGES, getLanguageIcon } from '../lib/constants/languages.js';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isCapacitor } from '../lib/platform.js';
import { useAuth } from '../lib/hooks/useAuth.js';
import {
  isIapAvailable,
  loadIapOffers,
  purchaseIapOffer,
  restoreIapPurchases,
  IapCancelledError,
  iapStore,
  manageSubscriptionsUrl,
  type IapOffer,
} from '../lib/services/iapService.js';

/** Translation keys for each plan's features, in order. */
const PLAN_FEATURE_KEYS: Record<string, string[]> = {
  free: ['plans.free.feat1', 'plans.free.feat2', 'plans.free.feat3', 'plans.free.feat4'],
  basic_1: [
    'plans.basic.feat1', 'plans.basic.feat2', 'plans.basic.feat3',
    'plans.basic.feat4', 'plans.basic.feat5', 'plans.basic.feat6',
  ],
  duo_2: [
    'plans.duo.feat1', 'plans.duo.feat2', 'plans.duo.feat3',
    'plans.duo.feat4', 'plans.duo.feat5', 'plans.duo.feat6',
  ],
  full_all: [
    'plans.full.feat1', 'plans.full.feat2', 'plans.full.feat3',
    'plans.full.feat4', 'plans.full.feat5', 'plans.full.feat6', 'plans.full.feat7',
  ],
};

export const Subscription = () => {
  const { t } = useTranslation();
  const {
    subscription,
    selectFreePlan,
    toggleLanguage,
    canAddLanguage: canAdd,
    createCheckoutSession,
    createPortalSession,
    refreshSubscription,
  } = useSubscription();
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [searchParams] = useSearchParams();

  // The native apps sell through their own store (App Store / Google Play). A
  // native build without in-app purchase configured has no purchase UI at all
  // — Stripe checkout is web-only.
  const iap = isIapAvailable();
  const store = iapStore();
  const onPlay = store === 'play_store';
  const isNative = isCapacitor() && !iap;
  const [iapOffers, setIapOffers] = useState<Record<string, IapOffer> | null>(null);
  const [iapLoadFailed, setIapLoadFailed] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [iapNotice, setIapNotice] = useState<string | null>(null);
  // A plan bought on the web or in the other store is managed there; never
  // sell a second one on top.
  const paidElsewhere =
    iap && subscription.currentPlan !== 'free' && subscription.subscriptionSource !== store;
  const uid = user?.uid;

  useEffect(() => {
    if (!iap || !uid) return;
    let cancelled = false;
    loadIapOffers(uid)
      .then((offers) => {
        if (!cancelled) setIapOffers(offers);
      })
      .catch(() => {
        if (!cancelled) setIapLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [iap, uid]);
  const currentPlan = getPlanById(subscription.currentPlan);
  const success = searchParams.get('success');

  useEffect(() => {
    if (success === 'true') {
      trackEvent(ANALYTICS_EVENTS.CHECKOUT_COMPLETED, { planId: subscription.currentPlan });
    }
  }, [success, subscription.currentPlan]);
  const canceled = searchParams.get('canceled');

  const handleChoosePlan = async (planId: string) => {
    if (planId === 'free') {
      selectFreePlan();
      return;
    }

    setLoadingPlan(planId);
    setCheckoutError(null);
    setIapNotice(null);
    trackEvent(ANALYTICS_EVENTS.CHECKOUT_STARTED, { planId, billingCycle });

    if (iap) {
      const offer = iapOffers?.[`${planId}:${billingCycle}`];
      try {
        if (!uid || !offer) return;
        await purchaseIapOffer(uid, offer);
        refreshSubscription();
        setIapNotice(t('sub.iapPurchased', 'Thank you — your plan is now active.'));
      } catch (err) {
        if (!(err instanceof IapCancelledError)) {
          setCheckoutError(
            t(
              'sub.iapPurchaseFailed',
              'The purchase could not be completed. You have not been charged twice — tap Restore Purchases if your plan does not appear.'
            )
          );
        }
      } finally {
        setLoadingPlan(null);
      }
      return;
    }

    try {
      const url = await createCheckoutSession(planId as any, billingCycle);
      if (url) {
        window.location.assign(url);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setCheckoutError(msg || t('sub.checkoutFailed', 'Could not start checkout. Please try again.'));
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleRestore = async () => {
    if (!uid) return;
    setRestoring(true);
    setCheckoutError(null);
    setIapNotice(null);
    try {
      const plan = await restoreIapPurchases(uid);
      refreshSubscription();
      setIapNotice(
        plan
          ? t('sub.iapRestored', 'Your purchases have been restored.')
          : onPlay
            ? t(
                'sub.iapNothingToRestoreAndroid',
                'No active subscription was found for this Google account.'
              )
            : t('sub.iapNothingToRestore', 'No active subscription was found for this Apple ID.')
      );
    } catch {
      setCheckoutError(
        t('sub.iapRestoreFailed', 'Could not restore purchases. Please try again.')
      );
    } finally {
      setRestoring(false);
    }
  };

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const url = await createPortalSession();
      if (url) {
        window.location.href = url;
      }
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 pt-safe-page max-w-5xl mx-auto font-sans min-h-screen pb-24">
      {success === 'true' && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[14px] font-medium text-center">
          {t('sub.paymentSuccess')}
        </div>
      )}
      {canceled === 'true' && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[14px] font-medium text-center">
          {t('sub.paymentCanceled')}
        </div>
      )}

      {/* App Store 3.1.1: no purchase steering, no pricing, no external-checkout
          references in the native apps — plans render as a feature comparison
          only, with a neutral notice. */}
      {isNative && (
        <div className="mb-8 p-4 bg-parch2 border border-bdr rounded-xl text-ink2 text-[14px] flex items-center justify-center gap-3">
          <Info className="w-5 h-5 text-ink3" />
          {t('sub.mobileSubscriptionNotice', {
            defaultValue: 'Upgrading is not available in this app.',
          })}
        </div>
      )}

      {iap && !user && (
        <div className="mb-8 p-4 bg-parch2 border border-bdr rounded-xl text-ink2 text-[14px] text-center">
          {t('sub.iapSignIn', 'Sign in to subscribe, so your plan follows your account.')}{' '}
          <Link to="/auth/login" className="text-blue font-bold underline">
            {t('auth.signIn', 'Sign in')}
          </Link>
        </div>
      )}
      {paidElsewhere && (
        <div className="mb-8 p-4 bg-parch2 border border-bdr rounded-xl text-ink2 text-[14px] flex items-center justify-center gap-3">
          <Info className="w-5 h-5 text-ink3" />
          {t('sub.iapPaidElsewhere', 'Your plan is already active on this account.')}
        </div>
      )}
      {iapNotice && (
        <div
          className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[14px] font-medium text-center"
          role="status"
        >
          {iapNotice}
        </div>
      )}

      <header className="mb-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amberxl text-amber border border-amber/20 rounded-full font-mono text-[10px] uppercase tracking-widest mb-6">
          <Crown className="w-3.5 h-3.5" />
          {t('sub.currentPlan', { name: currentPlan.name })}
        </div>
        <h2 className="text-[36px] md:text-[42px] font-serif font-light text-ink tracking-tight mb-4 leading-tight">
          {t('sub.title')}
        </h2>
        <p className="font-body text-[16px] italic text-ink2 leading-relaxed">
          {t('sub.choosePlan')}
        </p>
      </header>

      {!isNative && (
      <div className="flex justify-center mb-10">
        <div className="bg-parch2 p-1 border border-bdr rounded-xl inline-flex gap-1 shadow-sm">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              'px-5 py-2 text-[13px] font-medium rounded-lg transition-all',
              billingCycle === 'monthly'
                ? 'bg-white text-ink shadow-sm'
                : 'text-ink3 hover:text-ink'
            )}
          >
            {t('sub.monthly')}
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              'px-5 py-2 text-[13px] font-medium rounded-lg transition-all flex items-center gap-2',
              billingCycle === 'yearly' ? 'bg-white text-ink shadow-sm' : 'text-ink3 hover:text-ink'
            )}
          >
            {t('sub.yearly')}
            {/* The saving is computed from web prices; App Store prices may differ. */}
            {!iap && (
              <span className="bg-jadexl text-jade px-1.5 py-0.5 rounded text-[10px] font-bold">
                {t('sub.saveYearly')}
              </span>
            )}
          </button>
        </div>
      </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
        {PLANS.filter((p) => p.id !== 'free').map((plan) => {
          const isCurrent = subscription.currentPlan === plan.id;
          const price =
            billingCycle === 'yearly' && plan.yearlyPriceUsd
              ? plan.yearlyPriceUsd
              : plan.monthlyPriceUsd;
          const label = billingCycle === 'yearly' ? '/year' : '/month';
          const isLoading = loadingPlan === plan.id;
          const offer = iap ? iapOffers?.[`${plan.id}:${billingCycle}`] : undefined;
          // In-app: a plan can only be bought when the App Store returned it.
          const iapUnavailable = iap && (!user || !offer || paidElsewhere);
          const isDisabled = isNative || isLoading || isCurrent || iapUnavailable;

          return (
            <div
              key={plan.id}
              className={cn(
                'card p-6 flex flex-col h-full relative transition-all',
                isCurrent ? 'border-blue/40 ring-2 ring-blue/20' : 'border-bdr/50 hover:shadow-md',
                plan.recommended && 'ring-1 ring-blue/10'
              )}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue text-white font-mono text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> {plan.badge || t('sub.recommended')}
                </div>
              )}

              <div className="mb-4 mt-1">
                <h3 className="font-serif text-[20px] font-medium text-ink mb-1">{plan.name}</h3>
                {!isNative && !iap && (
                  <div className="flex items-baseline gap-1">
                    <span className="text-[28px] font-serif">${price}</span>
                    <span className="text-muted font-sans text-sm">{label}</span>
                  </div>
                )}
                {/* In-app: always the App Store's own localized price. */}
                {iap && offer && (
                  <div className="flex items-baseline gap-1" data-testid={`iap-price-${plan.id}`}>
                    <span className="text-[28px] font-serif">{offer.priceString}</span>
                    <span className="text-muted font-sans text-sm">{label}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6 flex-1">
                {(PLAN_FEATURE_KEYS[plan.id] ?? plan.features.map((_, i) => `${plan.id}.feat${i + 1}`)).map((key, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Check
                      className={cn(
                        'w-4 h-4 mt-0.5 shrink-0',
                        isCurrent ? 'text-blue' : 'text-muted'
                      )}
                    />
                    <span className="text-[13px] text-ink2 font-sans">
                      {t(key, { defaultValue: plan.features[i] ?? key })}
                    </span>
                  </div>
                ))}
              </div>

              {!isNative && (
              <button
                onClick={() => handleChoosePlan(plan.id)}
                disabled={isDisabled}
                className={cn(
                  'w-full py-3 text-[14px] font-bold rounded-xl transition-all flex items-center justify-center gap-2',
                  isCurrent
                    ? 'bg-parch2 text-ink3 border border-bdr cursor-default'
                    : isDisabled
                      ? 'bg-parch2 text-ink3 border border-bdr cursor-not-allowed'
                      : isLoading
                        ? 'bg-blue/70 text-white cursor-wait'
                        : 'bg-blue text-white hover:bg-blue/90 shadow-md active:scale-[0.98]'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />{' '}
                    {iap ? t('sub.iapProcessing', 'Processing…') : t('sub.redirecting')}
                  </>
                ) : isCurrent ? (
                  t('sub.current')
                ) : (
                  t('sub.choose', { name: plan.name })
                )}
                {!isDisabled && !isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
              )}
            </div>
          );
        })}
      </div>

      {checkoutError && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-[14px] font-medium text-center max-w-xl mx-auto">
          {checkoutError}
        </div>
      )}

      {/* In-app purchase: restore, manage, and the disclosures App Store
          guideline 3.1.2 requires next to the purchase buttons. */}
      {iap && (
        <div className="max-w-2xl mx-auto mb-12 text-center space-y-4" data-testid="iap-footer">
          {user && iapOffers && Object.keys(iapOffers).length === 0 && (
            <p className="text-[13px] text-ink2">
              {t('sub.iapNoProducts', 'Plans are not available to purchase right now.')}
            </p>
          )}
          {iapLoadFailed && (
            <p className="text-[13px] text-ink2">
              {onPlay
                ? t(
                    'sub.iapLoadFailedAndroid',
                    'Could not reach Google Play. Check your connection and try again.'
                  )
                : t(
                    'sub.iapLoadFailed',
                    'Could not reach the App Store. Check your connection and try again.'
                  )}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRestore}
              disabled={!user || restoring}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-bdr/60 rounded-xl text-[13px] font-bold text-ink hover:bg-parch2 transition-all disabled:opacity-50"
              data-testid="iap-restore"
            >
              {restoring && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('sub.iapRestore', 'Restore Purchases')}
            </button>
            {subscription.currentPlan !== 'free' && subscription.subscriptionSource === store && (
              <button
                type="button"
                onClick={() => window.open(manageSubscriptionsUrl(), '_system')}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-bdr/60 rounded-xl text-[13px] font-bold text-ink hover:bg-parch2 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                {t('sub.iapManage', 'Manage Subscription')}
              </button>
            )}
          </div>
          <p className="text-[11px] text-muted leading-relaxed">
            {onPlay
              ? t(
                  'sub.iapTermsAndroid',
                  'Subscriptions renew automatically at the price shown, monthly or yearly, until cancelled. Payment is charged to your Google Play account at confirmation of purchase. Cancel any time in Google Play → Payments & subscriptions; access continues until the end of the paid period.'
                )
              : t(
                  'sub.iapTerms',
                  'Subscriptions renew automatically at the price shown, monthly or yearly, until cancelled. Payment is charged to your Apple ID at confirmation of purchase. Cancel at least 24 hours before the end of the period in your Apple ID subscription settings to avoid renewal.'
                )}{' '}
            <Link to="/terms" className="underline">
              {t('sub.iapTermsLink', 'Terms of Use')}
            </Link>
            {' · '}
            <Link to="/privacy" className="underline">
              {t('sub.iapPrivacyLink', 'Privacy Policy')}
            </Link>
          </p>
        </div>
      )}

      {/* Manage Billing */}
      {subscription.subscriptionStatus === 'active' &&
        subscription.stripeCustomerId &&
        !isNative &&
        !iap && (
          <div className="text-center mb-12">
            <button
              onClick={handleManageBilling}
              disabled={portalLoading}
              className="inline-flex items-center gap-2 px-6 py-3 border border-bdr/60 rounded-xl text-[14px] font-bold text-ink hover:bg-parch2 transition-all"
            >
              {portalLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              {t('sub.manageBilling')}
            </button>
          </div>
        )}

      {/* Language Unlock Selection */}
      <div className="card p-8 max-w-3xl mx-auto">
        <h3 className="font-serif text-[20px] font-medium text-ink mb-2">
          {t('sub.unlockedLanguages', 'Unlocked Languages')}
        </h3>
        <p className="text-[14px] text-ink2 mb-6">
          {currentPlan.languageLimit === 'all'
            ? t('sub.includesAll')
            : currentPlan.languageLimit === 0
              ? t('sub.noUnlockedLangs', 'Upgrade to choose a language for unlimited saves.')
              : t('sub.unlockSlotLabel', { count: currentPlan.languageLimit, defaultValue: `Select up to ${currentPlan.languageLimit} language(s) for unlimited saves.` })}
        </p>

        {currentPlan.languageLimit !== 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {LANGUAGES.map((lang) => {
              const isSelected = subscription.selectedLanguageIds.includes(lang.id);
              const isAtLimit = !isSelected && !canAdd();

              return (
                <button
                  key={lang.id}
                  onClick={() => {
                    if (isAtLimit) return;
                    toggleLanguage(lang.id);
                  }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                    isSelected
                      ? 'border-blue/30 bg-blue/5 text-blue'
                      : isAtLimit
                        ? 'border-bdr/30 bg-parch2/50 text-muted/60 cursor-not-allowed'
                        : 'border-bdr/50 hover:border-blue/20 text-ink2'
                  )}
                >
                  <span className="text-xl">{getLanguageIcon(lang.id)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold truncate">{lang.shortName}</div>
                    <div className="text-[9px] uppercase tracking-wider text-muted truncate">
                      {lang.name}
                    </div>
                  </div>
                  {isSelected && currentPlan.languageLimit !== 'all' && (
                    <InfinityIcon className="w-3.5 h-3.5 text-blue shrink-0" />
                  )}
                  {isSelected && currentPlan.languageLimit === 'all' && (
                    <span className="w-2 h-2 rounded-full bg-blue shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Dev Notice — shown when running without Stripe */}
      {/* Never in the native apps: it is a developer hint and names Stripe. */}
      {!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY && !isCapacitor() && (
        <div className="mt-8 max-w-3xl mx-auto p-4 bg-amber/5 border border-amber/20 rounded-xl text-center">
          <p className="text-[13px] text-ink3">
            {t('sub.devMode')} Set{' '}
            <code className="bg-parch3 px-1 rounded">VITE_STRIPE_PUBLISHABLE_KEY</code> and{' '}
            <code className="bg-parch3 px-1 rounded">STRIPE_SECRET_KEY</code> in your environment
            for production payments.
          </p>
        </div>
      )}
    </div>
  );
};
