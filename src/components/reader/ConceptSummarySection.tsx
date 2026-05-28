import { useState } from 'react';
import { Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { AIClient } from '../../lib/services/aiClient.js';
import { cn } from '@/lib/utils';

interface Props {
  lemma: string;
  languageId: string;
  gloss?: string;
  context?: string;
  /** Whether AI features are enabled for this user/plan */
  aiEnabled?: boolean;
}

export function ConceptSummarySection({ lemma, languageId, gloss, context, aiEnabled = true }: Props) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const load = async () => {
    if (summary !== null || loading) return;
    setLoading(true);
    setError(null);
    const result = await AIClient.getConceptSummary(languageId, lemma, gloss, context);
    setLoading(false);
    if (result) {
      setSummary(result);
      setExpanded(true);
    } else {
      setError('Could not generate a concept summary. Try again later.');
    }
  };

  if (!aiEnabled) return null;

  return (
    <div className="mb-6">
      <button
        onClick={summary !== null ? () => setExpanded((v) => !v) : load}
        disabled={loading}
        className="w-full flex items-center gap-2 text-[12px] font-bold text-muted hover:text-blue transition-colors disabled:cursor-wait group"
        aria-expanded={expanded}
      >
        <Sparkles className="w-3.5 h-3.5 shrink-0 group-hover:text-blue transition-colors" aria-hidden />
        <span className="flex-1 text-left uppercase tracking-wider">Concept Summary</span>
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden />}
        {summary !== null && !loading && (
          <ChevronDown
            className={cn('w-3.5 h-3.5 shrink-0 transition-transform', expanded && 'rotate-180')}
            aria-hidden
          />
        )}
      </button>

      {summary === null && !loading && !error && (
        <p className="text-[11px] text-muted/60 mt-1 italic">
          Click to generate an AI concept summary for <bdi lang={languageId}>{lemma}</bdi>.
        </p>
      )}

      {error && (
        <p className="text-[11px] text-red-500 mt-2">{error}</p>
      )}

      {summary !== null && expanded && (
        <div
          className="mt-3 p-4 bg-parch2/80 border border-bdr/30 rounded-xl text-[13px] leading-relaxed text-ink/90 italic border-l-4 border-l-blue/30"
          aria-live="polite"
        >
          {summary}
        </div>
      )}
    </div>
  );
}
