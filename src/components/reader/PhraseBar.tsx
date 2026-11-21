import { useEffect, useState } from 'react';
import { Link2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  /** The selected words, or null while only the first word has been chosen. */
  phrase: string | null;
  /** The first word, shown while waiting for the second. */
  anchor?: string;
  direction: 'ltr' | 'rtl';
  onSave: (meaning: string) => void;
  onCancel: () => void;
}

/**
 * Floating bar for saving a run of words as one vocabulary item.
 * Appears above the reader's bottom navigation; Escape cancels.
 */
export function PhraseBar({ phrase, anchor, direction, onSave, onCancel }: Props) {
  const { t } = useTranslation();
  // The parent keys this component by phrase, so the field starts empty each time.
  const [meaning, setMeaning] = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      data-testid="phrase-bar"
      role="region"
      aria-label={t('reader.phrase.region', 'Phrase selection')}
      className="fixed bottom-16 left-1/2 z-40 w-[min(92vw,560px)] -translate-x-1/2 rounded-2xl border border-bdr bg-parch p-3 shadow-xl"
    >
      <div className="flex items-start gap-2">
        <Link2 className="mt-1 h-4 w-4 shrink-0 text-blue" aria-hidden />
        <div className="min-w-0 flex-1">
          {phrase ? (
            <p
              data-testid="phrase-text"
              dir={direction}
              className="font-serif text-[18px] leading-snug text-ink"
            >
              <bdi>{phrase}</bdi>
            </p>
          ) : (
            <p className="text-[13px] text-ink2" aria-live="polite">
              {t(
                'reader.phrase.pickEnd',
                'Now choose the last word of the phrase, in the same sentence.'
              )}{' '}
              {anchor && (
                <bdi dir={direction} className="font-serif text-[15px] text-ink">
                  {anchor} …
                </bdi>
              )}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label={t('common.cancel', 'Cancel')}
          className="rounded p-1 text-muted hover:bg-parch3 hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {phrase && (
        <form
          className="mt-2 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(meaning.trim());
          }}
        >
          <input
            autoFocus
            data-testid="phrase-meaning"
            value={meaning}
            onChange={(e) => setMeaning(e.target.value)}
            placeholder={t('reader.phrase.meaning', 'Meaning (optional)')}
            aria-label={t('reader.phrase.meaning', 'Meaning (optional)')}
            className="min-w-0 flex-1 rounded-lg border border-bdr/60 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue"
          />
          <button
            type="submit"
            data-testid="phrase-save"
            className="rounded-lg bg-blue px-4 py-1.5 text-sm font-bold text-white shadow active:scale-95"
          >
            {t('reader.phrase.save', 'Save phrase')}
          </button>
        </form>
      )}
    </div>
  );
}
