import { useState } from 'react';
import { Flag, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../lib/services/apiFetch.js';
import { useAuth } from '../lib/hooks/useAuth.js';

type Reason = 'offensive' | 'inaccurate' | 'other';

interface Props {
  /** Which AI surface produced the content. */
  surface: 'tutor' | 'explanation' | 'sentence-analysis' | 'other';
  /** The AI-generated text being reported. */
  content: string;
  /** The user message that produced it, when there is one. */
  prompt?: string;
  languageId?: string;
}

/**
 * "Report" control for a piece of AI-generated content. Sends the content and
 * a reason to the developer without leaving the app (Google Play's
 * AI-Generated Content policy).
 */
export const ReportAiContentButton = ({ surface, content, prompt, languageId }: Props) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [state, setState] = useState<'idle' | 'choosing' | 'sending' | 'sent' | 'error'>('idle');

  const reasons: { id: Reason; label: string }[] = [
    { id: 'offensive', label: t('aiReport.offensive', 'Offensive or harmful') },
    { id: 'inaccurate', label: t('aiReport.inaccurate', 'Wrong or misleading') },
    { id: 'other', label: t('aiReport.other', 'Something else') },
  ];

  const submit = async (reason: Reason) => {
    setState('sending');
    try {
      await apiFetch('/api/reports/ai-content', {
        method: 'POST',
        // Guests can read and use AI too; attach the account only when there is one.
        skipAuth: !user,
        body: { surface, reason, content, prompt, languageId },
      });
      setState('sent');
    } catch {
      setState('error');
    }
  };

  if (state === 'sent') {
    return (
      <p className="mt-2 flex items-center gap-1 text-[11px] text-muted" role="status">
        <Check className="w-3 h-3" />
        {t('aiReport.thanks', 'Reported — thank you.')}
      </p>
    );
  }

  if (state === 'idle') {
    return (
      <button
        type="button"
        onClick={() => setState('choosing')}
        className="mt-2 flex items-center gap-1 text-[11px] text-muted hover:text-ink transition-colors"
        data-testid="ai-report-button"
      >
        <Flag className="w-3 h-3" />
        {t('aiReport.report', 'Report this answer')}
      </button>
    );
  }

  return (
    <div className="mt-2 text-[11px] text-muted" data-testid="ai-report-reasons">
      <p className="mb-1.5">
        {state === 'error'
          ? t('aiReport.failed', 'Could not send the report. Try again:')
          : t('aiReport.why', 'What is wrong with this answer?')}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {reasons.map((r) => (
          <button
            key={r.id}
            type="button"
            disabled={state === 'sending'}
            onClick={() => submit(r.id)}
            className="px-2.5 py-1.5 rounded-full border border-bdr text-ink2 hover:bg-parch2 transition-colors disabled:opacity-50"
          >
            {r.label}
          </button>
        ))}
        {state === 'sending' ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <button
            type="button"
            onClick={() => setState('idle')}
            className="px-2 py-1.5 underline hover:text-ink"
          >
            {t('aiReport.cancel', 'Cancel')}
          </button>
        )}
      </div>
    </div>
  );
};
