import { useState } from 'react';
import { Check, Sparkles, BookOpen, Crown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Subscription = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto font-sans min-h-screen pb-24">
      <header className="mb-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amberxl text-amber border border-amber/20 rounded-full font-mono text-[10px] uppercase tracking-widest mb-6">
          <Crown className="w-3.5 h-3.5" />
          Paleoglossa Fellowship
        </div>
        <h2 className="text-[36px] md:text-[42px] font-serif font-light text-ink tracking-tight mb-4 leading-tight">
          Master classical languages without limits.
        </h2>
        <p className="font-body text-[16px] italic text-ink2 leading-relaxed">
          Upgrade to the Fellowship plan to unlock the entire corpus, unlimited imports, and advanced morphology insights.
        </p>
      </header>

      <div className="flex justify-center mb-10">
        <div className="bg-parch2 p-1 border border-bdr rounded-xl inline-flex gap-1 shadow-sm">
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={cn(
              "px-5 py-2 text-[13px] font-medium rounded-lg transition-all",
              billingCycle === 'monthly' ? "bg-white text-ink shadow-sm" : "text-ink3 hover:text-ink"
            )}
          >
            Monthly
          </button>
          <button 
            onClick={() => setBillingCycle('yearly')}
            className={cn(
              "px-5 py-2 text-[13px] font-medium rounded-lg transition-all flex items-center gap-2",
              billingCycle === 'yearly' ? "bg-white text-ink shadow-sm" : "text-ink3 hover:text-ink"
            )}
          >
            Yearly
            <span className="bg-jadexl text-jade px-1.5 py-0.5 rounded text-[10px] font-bold">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
        {/* Free Plan */}
        <div className="card p-8 bg-parch/50 border-bdr/50 flex flex-col h-full opacity-90 transition-opacity hover:opacity-100">
          <div className="mb-6">
            <h3 className="font-serif text-[22px] font-medium text-ink mb-2">Novice Scholar</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-[32px] font-serif">$0</span>
              <span className="text-muted font-sans text-sm">/ forever</span>
            </div>
            <p className="font-body text-[14px] text-ink2 italic mt-3">
              Essential access for casual learners starting their journey.
            </p>
          </div>

          <div className="space-y-4 mb-8 flex-1">
            {[
               "A curated selection of 10 foundational texts",
               "Basic spaced repetition (up to 20 words/day)",
               "Support for 1 active language",
               "Standard dictionary definitions",
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-muted mt-0.5 flex-shrink-0" />
                <span className="text-[13.5px] text-ink2 font-sans">{feature}</span>
              </div>
            ))}
          </div>

          <button className="w-full btn-secondary py-3 text-[14px]" disabled>
            Current Plan
          </button>
        </div>

        {/* Pro Plan */}
        <div className="card p-8 border-blue/30 relative flex flex-col h-full shadow-[0_20px_40px_-15px_rgba(30,61,110,0.15)] ring-1 ring-blue/10">
          <div className="absolute top-0 inset-x-0 h-1 bg-blue rounded-t-[15px]" />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue text-white font-mono text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> Most Popular
          </div>
          
          <div className="mb-6 mt-2">
            <h3 className="font-serif text-[22px] font-medium text-blue mb-2">Fellowship</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-[32px] font-serif">{billingCycle === 'yearly' ? '$12' : '$15'}</span>
              <span className="text-muted font-sans text-sm">/ month</span>
            </div>
            <p className="font-body text-[14px] text-ink2 italic mt-3">
              Unlimited access to all texts, languages, and advanced tools.
            </p>
          </div>

          <div className="space-y-4 mb-8 flex-1">
            {[
               "Access to the entire library of 80+ classical texts",
               "Unlimited spaced repetition limits",
               "Study all 11 supported languages simultaneously",
               "Import your own texts and documents",
               "Deep morphological parsing & etymology",
               "Priority email support"
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-4 h-4 text-blue mt-0.5 flex-shrink-0" />
                <span className="text-[13.5px] text-ink font-sans font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <button className="w-full btn-primary py-3 text-[14px] flex items-center justify-center gap-2 group">
            Upgrade to Fellowship
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="text-center text-[11px] text-muted font-sans mt-3">
            {billingCycle === 'yearly' ? "Billed $144 annually." : "Billed $15 rolling monthly."} Cancel anytime.
          </p>
        </div>
      </div>

      <div className="mt-20 max-w-2xl mx-auto text-center border-t border-bdr/50 pt-10">
        <BookOpen className="w-6 h-6 text-muted mx-auto mb-4" />
        <h4 className="font-serif text-[20px] text-ink mb-2">Educational & Institutional</h4>
        <p className="font-body text-[14.5px] italic text-ink2 mb-6">
          Are you a university or a study group? We offer discounted bulk licenses for educational institutions.
        </p>
        <button className="btn-secondary px-6 py-2 text-[13px]">
          Contact Sales
        </button>
      </div>
    </div>
  );
};
