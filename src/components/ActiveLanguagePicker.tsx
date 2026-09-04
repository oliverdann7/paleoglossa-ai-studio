import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronRight, Languages, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useActiveLanguage } from '../lib/hooks/useActiveLanguage.js';
import { useSubscription } from '../lib/contexts/SubscriptionContext.js';
import { useVocabulary } from '../lib/hooks/useVocabulary.js';
import { countTrackedWords } from '../lib/hooks/useVocabLimit.js';
import { isLanguageUnlocked, FREE_LANGUAGE_WORD_LIMIT } from '../lib/constants/plans.js';
import { getLanguageIcon } from '../lib/constants/languages.js';
import type { Language } from '../lib/constants/languages.js';

/**
 * Study-language selection, shared by every surface that lets the user switch
 * the language they are learning:
 *
 * - `LanguageOptionGrid` — the plain list of language buttons (Settings embeds it inline).
 * - `LanguagePickerSheet` — the same list inside a bottom sheet / modal.
 * - `ActiveLanguageChip` — a button showing the current language that opens the sheet
 *   (mobile Home header and the More page). The desktop sidebar keeps its own dropdown.
 *
 * Selecting a language calls `setActiveLanguageId`, which persists to
 * localStorage and, when signed in, to `users/{uid}/settings/activeLanguage`.
 */

function corpusStatusLabel(status: Language['corpusStatus'], t: (k: string, d: string) => string) {
  switch (status) {
    case 'available':
      return t('language.statusAvailable', 'Available');
    case 'partial':
      return t('language.statusInProgress', 'In Progress');
    case 'sample':
      return t('language.statusSample', 'Sample');
    default:
      return t('language.statusComingSoon', 'Coming soon');
  }
}

interface LanguageOptionGridProps {
  /** Called after the active language has been changed. */
  onSelected?: (languageId: string) => void;
  className?: string;
}

export function LanguageOptionGrid({ onSelected, className }: LanguageOptionGridProps) {
  const { t } = useTranslation();
  const { activeLanguageId, setActiveLanguageId, availableLanguages } = useActiveLanguage();
  const { subscription } = useSubscription();
  const { knowledge } = useVocabulary();

  return (
    <div
      role="radiogroup"
      aria-label={t('language.studyLanguage', 'Study language')}
      className={cn('grid grid-cols-1 sm:grid-cols-2 gap-2', className)}
    >
      {availableLanguages.map((lang) => {
        const isActive = lang.id === activeLanguageId;
        const unlocked = isLanguageUnlocked(
          subscription.currentPlan,
          subscription.selectedLanguageIds,
          lang.id
        );
        const saved = unlocked ? 0 : countTrackedWords(knowledge, lang.id);
        const comingSoon = lang.corpusStatus === 'coming_soon';

        return (
          <button
            key={lang.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            data-testid={`study-language-${lang.id}`}
            onClick={() => {
              setActiveLanguageId(lang.id);
              onSelected?.(lang.id);
            }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-3 rounded-xl border text-left transition-all active:scale-[0.99] min-h-[56px]',
              isActive
                ? 'bg-blue/10 border-blue text-blue shadow-sm'
                : 'bg-white border-bdr/60 text-ink hover:border-blue/40 hover:bg-parch'
            )}
          >
            <span className="text-[22px] w-8 text-center leading-none shrink-0" aria-hidden>
              {getLanguageIcon(lang.id)}
            </span>
            <span className="flex-1 min-w-0">
              <span
                className={cn(
                  'block text-[14px] leading-tight truncate',
                  isActive ? 'font-bold' : 'font-semibold'
                )}
              >
                {lang.name}
              </span>
              <span
                className={cn(
                  'block text-[11px] mt-0.5 truncate',
                  isActive ? 'text-blue/70' : comingSoon ? 'text-muted/70' : 'text-muted'
                )}
              >
                {corpusStatusLabel(lang.corpusStatus, t)}
                {!unlocked && saved > 0 && (
                  <>
                    {' · '}
                    {t('language.savedWords', '{{count}}/{{limit}} words saved', {
                      count: saved,
                      limit: FREE_LANGUAGE_WORD_LIMIT,
                    })}
                  </>
                )}
              </span>
            </span>
            {isActive && <Check className="w-4 h-4 shrink-0" aria-hidden />}
          </button>
        );
      })}
    </div>
  );
}

interface LanguagePickerSheetProps {
  open: boolean;
  onClose: () => void;
}

export function LanguagePickerSheet({ open, onClose }: LanguagePickerSheetProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end md:items-center justify-center">
          <motion.button
            type="button"
            aria-label={t('common.close', 'Close')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('language.studyLanguage', 'Study language')}
            data-testid="language-picker-sheet"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full md:w-[440px] max-h-[85vh] md:max-h-[80vh] bg-parch border border-bdr rounded-t-3xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="md:hidden flex justify-center pt-2" aria-hidden>
              <div className="w-10 h-1 rounded-full bg-ink3/30" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-bdr">
              <div>
                <h2 className="font-serif text-[18px] text-ink leading-tight">
                  {t('language.studyLanguage', 'Study language')}
                </h2>
                <p className="text-[12px] text-muted mt-0.5">
                  {t(
                    'language.studyLanguageHint',
                    'Sets which texts, words and reviews the app shows you.'
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t('common.close', 'Close')}
                className="p-2 rounded-full text-muted hover:text-ink hover:bg-parch2 transition-colors"
              >
                <X className="w-4 h-4" aria-hidden />
              </button>
            </div>
            <div className="overflow-y-auto p-4 pb-safe">
              <LanguageOptionGrid onSelected={onClose} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

interface ActiveLanguageChipProps {
  /** `chip` — compact pill (Home header). `row` — full-width list row (More page). */
  variant?: 'chip' | 'row';
  className?: string;
}

export function ActiveLanguageChip({ variant = 'chip', className }: ActiveLanguageChipProps) {
  const { t } = useTranslation();
  const { activeLanguageId, currentLanguage } = useActiveLanguage();
  const [open, setOpen] = useState(false);

  const icon = currentLanguage ? getLanguageIcon(activeLanguageId) : '🌐';
  const name = currentLanguage?.name || t('language.selectLanguage', 'Select language');

  return (
    <>
      {variant === 'row' ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-testid="active-language-row"
          className={cn(
            'w-full flex items-center gap-4 px-5 py-4 bg-blue/5 hover:bg-blue/10 active:bg-blue/10 transition-colors rounded-xl border border-blue/20 text-left min-h-[52px]',
            className
          )}
        >
          <div className="w-9 h-9 rounded-lg bg-white border border-blue/20 flex items-center justify-center shrink-0 text-[20px]">
            <span aria-hidden>{icon}</span>
          </div>
          <span className="flex-1 min-w-0">
            <span className="block text-[11px] font-bold uppercase tracking-widest text-blue/70">
              {t('language.studyLanguage', 'Study language')}
            </span>
            <span className="block text-[15px] font-semibold text-ink truncate">{name}</span>
          </span>
          <span className="text-[12px] font-semibold text-blue shrink-0 inline-flex items-center gap-1">
            {t('language.change', 'Change')}
            <ChevronRight className="w-4 h-4" aria-hidden />
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-testid="active-language-chip"
          aria-label={t('language.changeStudyLanguage', 'Change study language')}
          className={cn(
            'inline-flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-full bg-white border border-bdr text-ink text-[13px] font-semibold shadow-sm hover:border-blue/40 active:scale-[0.98] transition-all',
            className
          )}
        >
          <span className="text-[16px] leading-none" aria-hidden>
            {icon}
          </span>
          <span className="truncate max-w-[160px]">{name}</span>
          <span className="inline-flex items-center gap-0.5 text-[11px] text-blue font-bold">
            <Languages className="w-3.5 h-3.5" aria-hidden />
            {t('language.change', 'Change')}
          </span>
        </button>
      )}
      <LanguagePickerSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}
