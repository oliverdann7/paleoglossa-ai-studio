import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { STORAGE_KEYS } from '../../lib/constants/storage.js';

/**
 * First-run coaching card for the Review page — the same dismissible-overlay
 * pattern as `ReaderTutorial`, addressing audit P0 #3 (no first-run guidance
 * outside the Reader). Self-contained: manages its own localStorage flag so the
 * Review page only needs to drop `<ReviewTutorial />` into its JSX.
 *
 * Renders nothing once dismissed (flag set) — safe to mount unconditionally.
 */
export const ReviewTutorial = () => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(
    () => !localStorage.getItem(STORAGE_KEYS.REVIEW_TUTORIAL_COMPLETED)
  );

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEW_TUTORIAL_COMPLETED, '1');
    } catch {
      // storage unavailable — still hide for this session
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="review-tutorial"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-24 right-8 w-72 bg-parch text-ink p-5 rounded-2xl shadow-xl border border-bdr z-[100]"
      >
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-muted hover:text-ink"
          aria-label={t('common.dismiss', 'Dismiss')}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-amber shrink-0" />
          <h3 className="text-[15px] font-bold">
            {t('reviewTutorial.title', 'How review works')}
          </h3>
        </div>
        <p className="text-[13px] text-ink2 leading-relaxed mb-4">
          {t(
            'reviewTutorial.desc',
            'Rate how well you recalled each word. Words you find hard come back sooner; words you know are scheduled further out — spaced repetition does the rest.'
          )}
        </p>
        <button
          onClick={dismiss}
          className="w-full px-3 py-2 text-[12px] font-semibold bg-blue text-white rounded-lg hover:bg-blue/90 active:scale-95 transition-all"
        >
          {t('common.gotIt', 'Got it')}
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
