import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Infinity as InfinityIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveLanguage } from '../lib/hooks/useActiveLanguage.js';
import { getLanguageIcon } from '../lib/constants/languages.js';
import { useSubscription } from '../lib/contexts/SubscriptionContext.js';
import { countTrackedWords } from '../lib/hooks/useVocabLimit.js';
import { isLanguageUnlocked, FREE_LANGUAGE_WORD_LIMIT } from '../lib/constants/plans.js';
import { useVocabulary } from '../lib/hooks/useVocabulary.js';

export function LanguageSwitcher() {
  const { activeLanguageId, setActiveLanguageId, currentLanguage, availableLanguages } =
    useActiveLanguage();
  const { subscription, canAccessLanguage } = useSubscription();
  const { knowledge } = useVocabulary();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const icon = currentLanguage ? getLanguageIcon(activeLanguageId) : '🌐';

  // Hide the switcher when there's only one language available — nothing to switch between.
  if (availableLanguages.length <= 1) {
    return null;
  }

  // Hide the switcher for users who only have one language — nothing to switch between.
  const accessibleLanguages = availableLanguages.filter((l) => canAccessLanguage(l.id));
  if (accessibleLanguages.length <= 1 && subscription.currentPlan !== 'full_all') {
    return null;
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-bdr/60 rounded-lg hover:border-blue/30 hover:shadow-sm transition-all text-[13px] font-sans font-medium text-ink"
      >
        <span className="text-[16px]">{icon}</span>
        <span className="hidden sm:inline">
          {currentLanguage?.shortName || currentLanguage?.name || 'Select Language'}
        </span>
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
            // left-0, not right-0: the anchor is only ~188px wide inside the 220px
            // rail, so a right-pinned w-64 panel would hang ~52px off the viewport.
            className="absolute left-0 top-full mt-2 w-64 bg-white border border-bdr rounded-xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-1.5">
              {availableLanguages.map((lang) => {
                const isActive = lang.id === activeLanguageId;
                const unlocked = isLanguageUnlocked(
                  subscription.currentPlan,
                  subscription.selectedLanguageIds,
                  lang.id
                );
                const count = unlocked ? 0 : countTrackedWords(knowledge, lang.id);
                const limit = FREE_LANGUAGE_WORD_LIMIT;
                const isFull = !unlocked && count >= limit;

                return (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setActiveLanguageId(lang.id);
                      setOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-[13px]',
                      isActive
                        ? 'bg-blue/10 text-blue font-bold'
                        : 'text-ink2 hover:bg-parch2 font-medium'
                    )}
                  >
                    <span className="text-[18px] w-7 text-center">{getLanguageIcon(lang.id)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate">{lang.name}</span>
                        {unlocked && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded shrink-0 flex items-center gap-0.5">
                            <InfinityIcon className="w-2.5 h-2.5" /> Unlimited
                          </span>
                        )}
                      </div>
                      {/* Per-language vocab progress bar for capped languages */}
                      {!unlocked ? (
                        <div className="mt-0.5">
                          <span className={cn(
                            'text-[9px] font-bold',
                            isFull ? 'text-red-500' : 'text-muted'
                          )}>
                            {count}/{limit} words saved
                          </span>
                          <div className="h-1 w-full bg-parch3 rounded-full overflow-hidden mt-0.5">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                isFull
                                  ? 'bg-red-400'
                                  : count >= limit * 0.8
                                    ? 'bg-amber'
                                    : 'bg-blue'
                              )}
                              style={{ width: `${Math.min(100, (count / limit) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className={cn(
                          'text-[10px] uppercase tracking-wider',
                          isActive ? 'text-blue/70' : 'text-muted'
                        )}>
                          {lang.corpusStatus === 'available'
                            ? 'Available'
                            : lang.corpusStatus === 'partial'
                              ? 'In Progress'
                              : 'Sample'}
                        </div>
                      )}
                    </div>
                    {isActive && <span className="w-2 h-2 rounded-full bg-blue shrink-0" />}
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
                Upgrade for unlimited saves
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
