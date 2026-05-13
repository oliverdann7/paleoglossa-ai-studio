import { useState } from "react";
import { Check, Sparkles, Crown, ArrowRight, Lock, ExternalLink, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "../lib/contexts/SubscriptionContext";
import { PLANS, getPlanById } from "../lib/constants/plans";
import { LANGUAGES, getLanguageIcon } from "../lib/constants/languages";
import { useSearchParams } from "react-router-dom";

export const Subscription = () => {
  const { subscription, selectFreePlan, toggleLanguage, canAccessLanguage, canAddLanguage: canAdd, remainingSlots, createCheckoutSession, createPortalSession } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [searchParams] = useSearchParams();

  const currentPlan = getPlanById(subscription.currentPlan);
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  const handleChoosePlan = async (planId: string) => {
    if (planId === 'free') {
      selectFreePlan();
      return;
    }

    setLoadingPlan(planId);
    try {
      const url = await createCheckoutSession(planId as any, billingCycle);
      if (url) {
        window.location.href = url;
      }
    } finally {
      setLoadingPlan(null);
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
    <div className="p-6 md:p-12 max-w-5xl mx-auto font-sans min-h-screen pb-24">
      {success === 'true' && (
        <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[14px] font-medium text-center">
          Payment successful! Your plan has been activated.
        </div>
      )}
      {canceled === 'true' && (
        <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[14px] font-medium text-center">
          Payment was canceled. No changes were made.
        </div>
      )}

      <header className="mb-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amberxl text-amber border border-amber/20 rounded-full font-mono text-[10px] uppercase tracking-widest mb-6">
          <Crown className="w-3.5 h-3.5" />
          {currentPlan.name} Plan
        </div>
        <h2 className="text-[36px] md:text-[42px] font-serif font-light text-ink tracking-tight mb-4 leading-tight">
          Master classical languages without limits.
        </h2>
        <p className="font-body text-[16px] italic text-ink2 leading-relaxed">
          Choose a plan that matches your learning goals. Powered by Stripe.
        </p>
      </header>

      <div className="flex justify-center mb-10">
        <div className="bg-parch2 p-1 border border-bdr rounded-xl inline-flex gap-1 shadow-sm">
          <button onClick={() => setBillingCycle("monthly")}
            className={cn("px-5 py-2 text-[13px] font-medium rounded-lg transition-all",
              billingCycle === "monthly" ? "bg-white text-ink shadow-sm" : "text-ink3 hover:text-ink")}>
            Monthly
          </button>
          <button onClick={() => setBillingCycle("yearly")}
            className={cn("px-5 py-2 text-[13px] font-medium rounded-lg transition-all flex items-center gap-2",
              billingCycle === "yearly" ? "bg-white text-ink shadow-sm" : "text-ink3 hover:text-ink")}>
            Yearly
            <span className="bg-jadexl text-jade px-1.5 py-0.5 rounded text-[10px] font-bold">Save ~17%</span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
        {PLANS.filter(p => p.id !== 'free').map(plan => {
          const isCurrent = subscription.currentPlan === plan.id;
          const price = billingCycle === 'yearly' && plan.yearlyPriceUsd
            ? plan.yearlyPriceUsd : plan.monthlyPriceUsd;
          const label = billingCycle === 'yearly' ? '/year' : '/month';
          const isLoading = loadingPlan === plan.id;

          return (
            <div key={plan.id} className={cn(
              "card p-6 flex flex-col h-full relative transition-all",
              isCurrent ? "border-blue/40 ring-2 ring-blue/20" : "border-bdr/50 hover:shadow-md",
              plan.recommended && "ring-1 ring-blue/10",
            )}>
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue text-white font-mono text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" /> {plan.badge || 'Recommended'}
                </div>
              )}

              <div className="mb-4 mt-1">
                <h3 className="font-serif text-[20px] font-medium text-ink mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-[28px] font-serif">${price}</span>
                  <span className="text-muted font-sans text-sm">{label}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Check className={cn("w-4 h-4 mt-0.5 shrink-0", isCurrent ? "text-blue" : "text-muted")} />
                    <span className="text-[13px] text-ink2 font-sans">{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleChoosePlan(plan.id)}
                disabled={isLoading || isCurrent}
                className={cn(
                  "w-full py-3 text-[14px] font-bold rounded-xl transition-all flex items-center justify-center gap-2",
                  isCurrent
                    ? "bg-parch2 text-ink3 border border-bdr cursor-default"
                    : isLoading
                      ? "bg-blue/70 text-white cursor-wait"
                      : "bg-blue text-white hover:bg-blue/90 shadow-md active:scale-[0.98]"
                )}
              >
                {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</> :
                 isCurrent ? 'Current Plan' : `Choose ${plan.name}`}
                {!isCurrent && !isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Manage Billing */}
      {subscription.subscriptionStatus === 'active' && subscription.stripeCustomerId && (
        <div className="text-center mb-12">
          <button onClick={handleManageBilling} disabled={portalLoading}
            className="inline-flex items-center gap-2 px-6 py-3 border border-bdr/60 rounded-xl text-[14px] font-bold text-ink hover:bg-parch2 transition-all">
            {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            Manage Billing
          </button>
        </div>
      )}

      {/* Language Selection */}
      <div className="card p-8 max-w-3xl mx-auto">
        <h3 className="font-serif text-[20px] font-medium text-ink mb-2">Your Languages</h3>
        <p className="text-[14px] text-ink2 mb-6">
          {currentPlan.languageLimit === 'all'
            ? 'Your plan includes all languages.'
            : `Your plan includes ${currentPlan.languageLimit} language${currentPlan.languageLimit !== 1 ? 's' : ''}. ${remainingSlots > 0 ? `You can add ${remainingSlots} more.` : 'Upgrade to add more.'}`}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {LANGUAGES.map(lang => {
            const isSelected = subscription.selectedLanguageIds.includes(lang.id);
            const isLocked = !canAccessLanguage(lang.id);

            return (
              <button
                key={lang.id}
                onClick={() => {
                  if (isLocked && !canAdd()) return;
                  toggleLanguage(lang.id);
                }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                  isSelected
                    ? "border-blue/30 bg-blue/5 text-blue"
                    : isLocked
                      ? "border-bdr/30 bg-parch2/50 text-muted opacity-60 cursor-not-allowed"
                      : "border-bdr/50 hover:border-blue/20 text-ink2"
                )}
              >
                <span className="text-xl">{getLanguageIcon(lang.id)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold truncate">{lang.shortName}</div>
                  <div className="text-[9px] uppercase tracking-wider text-muted truncate">{lang.name}</div>
                </div>
                {isSelected && <span className="w-2 h-2 rounded-full bg-blue shrink-0" />}
                {isLocked && !isSelected && <Lock className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dev Notice — shown when running without Stripe */}
      {!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY && (
        <div className="mt-8 max-w-3xl mx-auto p-4 bg-amber/5 border border-amber/20 rounded-xl text-center">
          <p className="text-[13px] text-ink3">
            <strong className="text-amber">⚡ Development Mode:</strong> Stripe is not configured.
            Set <code className="bg-parch3 px-1 rounded">VITE_STRIPE_PUBLISHABLE_KEY</code> and <code className="bg-parch3 px-1 rounded">STRIPE_SECRET_KEY</code> in your environment for production payments.
          </p>
        </div>
      )}
    </div>
  );
};
