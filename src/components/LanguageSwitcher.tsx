import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Lock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveLanguage } from '../lib/hooks/useActiveLanguage.js';
import { getLanguageIcon } from '../lib/constants/languages.js';
import { useSubscription } from '../lib/contexts/SubscriptionContext.js';

export function LanguageSwitcher() {
  const { activeLanguageId, setActiveLanguageId, currentLanguage, availableLanguages } =
    useActiveLanguage();
  const { canAccessLanguage, remainingSlots, subscription } = useSubscription();
  const [open, setOpen] = useState(false);
  const [upgradePromptLang, setUpgradePromptLang] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setUpgradePromptLang(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const icon = currentLanguage ? getLanguageIcon(activeLanguageId) : '🌐';
  // The user's first selected language is their "free" language slot.
  const freeLangId = subscription.selectedLanguageIds[0] ?? 'grc';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); setUpgradePromptLang(null); }}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-bdr/60 rounded-lg hover:border-blue/30 hover:shadow-sm transition-all text-[13px] font-sans font-medium text-ink"
      >
        <span className="text-[16px]">{icon}</span>
        <span className="hidden sm:inline">
          {currentLanguage?.shortName || currentLanguage?.name || 'Select Language'}
        </span>
        {remainingSlots !== Infinity && remainingSlots <= 1 && (
          <span className="text-[9px] font-bold text-amber bg-amber/10 px-1.5 py-0.5 rounded-full">
            {remainingSlots} slot
          </span>
        )}
        <ChevronDown
          className={cn('w-3.5 h-3.5 text-muted transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white border border-bdr rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {/* Inline upgrade prompt for locked language */}
            <AnimatePresence>
              {upgradePromptLang && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber/5 border-b border-amber/20 px-3 py-2.5 text-[12px]"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-amber-700 mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Upgrade to unlock{' '}
                    {availableLanguages.find((l) => l.id === upgradePromptLang)?.name ?? upgradePromptLang}
                  </div>
                  <p className="text-muted mb-2">
                    Add a second language with the Duo plan, or unlock all 11 with Full Pack.
                  </p>
                  <a
                    href="/app/subscription"
                    className="inline-block text-[11px] font-bold text-white bg-blue px-3 py-1 rounded-lg hover:bg-blue/80 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    View plans →
                  </a>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-1.5">
              {availableLanguages.map((lang) => {
                const isActive = lang.id === activeLanguageId;
                const isLocked = !canAccessLanguage(lang.id);
                const isFree = lang.id === freeLangId && subscription.currentPlan === 'free';
                return (
                  <button
                    key={lang.id}
                    onClick={() => {
                      if (isLocked) {
                        setUpgradePromptLang(upgradePromptLang === lang.id ? null : lang.id);
                        return;
                      }
                      setUpgradePromptLang(null);
                      setActiveLanguageId(lang.id);
                      setOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-[13px]',
                      isActive
                        ? 'bg-blue/10 text-blue font-bold'
                        : isLocked
                          ? 'text-muted/70 hover:bg-parch2 cursor-pointer'
                          : 'text-ink2 hover:bg-parch2 font-medium'
                    )}
                  >
                    <span className="text-[18px] w-7 text-center">{getLanguageIcon(lang.id)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{lang.name}</span>
                        {isFree && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded shrink-0">
                            Free
                          </span>
                        )}
                      </div>
                      <div
                        className={cn(
                          'text-[10px] uppercase tracking-wider',
                          isActive ? 'text-blue/70' : 'text-muted'
                        )}
                      >
                        {isLocked
                          ? 'Tap to unlock'
                          : lang.corpusStatus === 'available'
                            ? 'Available'
                            : lang.corpusStatus === 'partial'
                              ? 'In Progress'
                              : 'Sample'}
                      </div>
                    </div>
                    {isActive && <span className="w-2 h-2 rounded-full bg-blue shrink-0" />}
                    {isLocked && <Lock className="w-3.5 h-3.5 text-muted/60 shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-bdr/40 p-2">
              <a
                href="/app/subscription"
                className="block w-full text-center text-[11px] font-bold text-blue hover:underline py-1"
                onClick={() => setOpen(false)}
              >
                Upgrade plan for more languages
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
