import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  fetchHistoricalContext,
  type HistoricalContext,
} from '../../lib/services/historicalContextService.js';

interface Props {
  textId?: string;
  title: string;
  languageId: string;
  author?: string;
  period?: string;
  isRtl?: boolean;
  onClose: () => void;
}

interface SectionConfig {
  key: keyof Omit<HistoricalContext, '_unavailable'>;
  labelKey: string;
  defaultLabel: string;
}

const SECTIONS: SectionConfig[] = [
  { key: 'period', labelKey: 'historicalContext.period', defaultLabel: 'Historical Period' },
  { key: 'geography', labelKey: 'historicalContext.geography', defaultLabel: 'Geography' },
  { key: 'keyFigures', labelKey: 'historicalContext.keyFigures', defaultLabel: 'Key Figures' },
  {
    key: 'culturalBackground',
    labelKey: 'historicalContext.culturalBackground',
    defaultLabel: 'Cultural Background',
  },
  {
    key: 'literaryContext',
    labelKey: 'historicalContext.literaryContext',
    defaultLabel: 'Literary Context',
  },
];

export const HistoricalContextPanel = ({
  textId,
  title,
  languageId,
  author,
  period,
  isRtl = false,
  onClose,
}: Props) => {
  const { t } = useTranslation();
  const [context, setContext] = useState<HistoricalContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string>('period');
  // Bumping this re-runs the fetch effect — used by the Retry button.
  const [attempt, setAttempt] = useState(0);

  // loading is true while both context and error are null
  const loading = context === null && error === null;

  useEffect(() => {
    const controller = new AbortController();

    fetchHistoricalContext({ textId, title, languageId, author, period }, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setContext(data);
      })
      .catch((err) => {
        if (controller.signal.aborted || err?.name === 'AbortError') return;
        setError(t('historicalContext.error', 'Could not load historical context.'));
      });

    return () => {
      controller.abort();
    };
  }, [textId, title, languageId, author, period, attempt, t]);

  // Close on Escape — expected for a modal-style overlay.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const retry = useCallback(() => {
    setContext(null);
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="historical-context-title"
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-y-0 right-0 z-40 w-80 bg-parch shadow-xl border-l border-bdr flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-bdr bg-parch2">
        <h2 id="historical-context-title" className="font-serif text-base font-semibold text-ink">
          {t('historicalContext.title', 'Historical Context')}
        </h2>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-parch3 transition-colors text-ink/60 hover:text-ink"
          aria-label={t('common.close', 'Close')}
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Text title */}
      <div className="px-4 py-2 border-b border-bdr/40 bg-parch">
        <p className="text-xs text-ink/50 uppercase tracking-wide font-sans">
          {t('historicalContext.for', 'Context for')}
        </p>
        <p className="text-sm font-serif text-ink truncate">{title}</p>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex flex-col gap-3 p-4">
            {SECTIONS.map((s) => (
              <div key={s.key} className="animate-pulse">
                <div className="h-4 bg-parch3 rounded w-1/3 mb-2" />
                <div className="h-3 bg-parch3 rounded w-full mb-1" />
                <div className="h-3 bg-parch3 rounded w-5/6" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-4 flex flex-col items-start gap-3">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={retry}
              className="text-sm font-sans px-3 py-1.5 rounded-md border border-bdr bg-parch2 hover:bg-parch3 text-ink transition-colors"
            >
              {t('common.retry', 'Retry')}
            </button>
          </div>
        )}

        {!loading && context?._unavailable && (
          <div className="p-4 text-sm text-ink/60">
            {t(
              'historicalContext.unavailable',
              'AI historical context is not available. Configure a Gemini API key to enable this feature.'
            )}
          </div>
        )}

        {!loading && context && !context._unavailable && (
          <div className="divide-y divide-bdr/30">
            {SECTIONS.map((s) => {
              const text = context[s.key];
              if (!text) return null;
              const isOpen = openSection === s.key;
              return (
                <div key={s.key}>
                  <button
                    onClick={() => setOpenSection(isOpen ? '' : s.key)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-parch2 transition-colors"
                  >
                    <span className="text-sm font-semibold text-ink">{t(s.labelKey, s.defaultLabel)}</span>
                    <svg
                      viewBox="0 0 24 24"
                      className={`w-4 h-4 text-ink/40 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-sm text-ink/80 leading-relaxed">{text}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer attribution */}
      <div className="px-4 py-2 border-t border-bdr/40 text-xs text-ink/40 text-center">
        {t('historicalContext.aiGenerated', 'AI-generated — verify with primary sources')}
      </div>
    </div>
  );
};
