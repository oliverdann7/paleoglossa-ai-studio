import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Loader2 } from 'lucide-react';
import { fetchSemanticContext, type SemanticContext } from '../../lib/services/semanticContextService.js';

interface Props {
  lemma: string;
  languageId: string;
  gloss?: string;
}

export const SemanticContextSection = ({ lemma, languageId, gloss }: Props) => {
  const { t } = useTranslation();
  // null = not loaded; 'loading' = in flight; SemanticContext = loaded
  const [data, setData] = useState<SemanticContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchSemanticContext({ lemma, languageId, gloss })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => {
        setError(t('semantic.error', 'Could not load semantic context.'));
        setLoading(false);
      });
  };

  // Not yet loaded — show a trigger button
  if (data === null && !loading) {
    return (
      <div className="mb-8">
        <div className="eyebrow mb-3 text-ink flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 opacity-60" />
          {t('semantic.title', 'Semantic Context')}
        </div>
        <button
          onClick={load}
          className="w-full py-2.5 px-3 rounded-xl border border-bdr text-[12px] font-medium text-ink3 hover:border-blue/40 hover:text-blue transition-colors flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {t('semantic.load', 'Load semantic context')}
        </button>
        {error && <p className="mt-2 text-[11px] text-red-500">{error}</p>}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mb-8">
        <div className="eyebrow mb-3 text-ink flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 opacity-60" />
          {t('semantic.title', 'Semantic Context')}
        </div>
        <div className="flex items-center gap-2 text-[12px] text-ink3 py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {t('semantic.loading', 'Loading...')}
        </div>
      </div>
    );
  }

  if (!data || data._unavailable) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="eyebrow mb-3 text-ink flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 opacity-60" />
        {t('semantic.title', 'Semantic Context')}
      </div>

      <div className="space-y-4">
        {/* Semantic domain badge */}
        {data.semanticDomain && (
          <div className="flex items-center gap-2">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue/10 text-blue border border-blue/20">
              {data.semanticDomain}
            </span>
          </div>
        )}

        {/* Usage notes */}
        {data.usageNotes && (
          <div>
            <p className="text-[11px] font-semibold text-ink3 uppercase tracking-wide mb-1">
              {t('semantic.usageNotes', 'Usage')}
            </p>
            <p className="text-[13px] text-ink/80 leading-relaxed">{data.usageNotes}</p>
          </div>
        )}

        {/* Historical evolution */}
        {data.historicalEvolution && (
          <div>
            <p className="text-[11px] font-semibold text-ink3 uppercase tracking-wide mb-1">
              {t('semantic.historicalEvolution', 'Historical Usage')}
            </p>
            <p className="text-[13px] text-ink/80 leading-relaxed">{data.historicalEvolution}</p>
          </div>
        )}

        {/* Cognates */}
        {data.cognates.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold text-ink3 uppercase tracking-wide mb-2">
              {t('semantic.cognates', 'Related Words')}
            </p>
            <div className="space-y-1.5">
              {data.cognates.map((c, i) => (
                <div key={i} className="flex items-baseline gap-2 text-[12px]">
                  <span className="text-ink3 shrink-0 w-16 truncate">{c.language}</span>
                  <span className="font-medium text-ink">{c.word}</span>
                  <span className="text-ink/50">— {c.meaning}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-[10px] text-ink/30">
        {t('semantic.aiGenerated', 'AI-generated — verify with scholarly sources')}
      </p>
    </div>
  );
};
