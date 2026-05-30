import { useState } from 'react';
import { Scroll, ChevronDown, Sparkles, Loader2 } from 'lucide-react';
import { getVariantEntries, type TextualVariantEntry } from '../../lib/data/textualVariants.js';
import { AIClient } from '../../lib/services/aiClient.js';
import { cn } from '@/lib/utils';

interface Props {
  lemma: string;
  languageId: string;
  wordText?: string;
  sentenceText?: string;
  aiEnabled?: boolean;
}

const SIGNIFICANCE_LABELS: Record<TextualVariantEntry['significance'], string> = {
  minor: 'Minor variant',
  moderate: 'Moderate significance',
  significant: 'Significant variant',
};

const SIGNIFICANCE_COLORS: Record<TextualVariantEntry['significance'], string> = {
  minor: 'text-muted bg-parch2 border-bdr/40',
  moderate: 'text-amber-700 bg-amber-50 border-amber-200',
  significant: 'text-red-700 bg-red-50 border-red-200',
};

const TYPE_LABELS: Record<string, string> = {
  omission: 'Omission',
  addition: 'Addition',
  substitution: 'Substitution',
  transposition: 'Transposition',
  spelling: 'Spelling',
};

function StaticVariantCard({ entry }: { entry: TextualVariantEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-bdr/30 rounded-xl overflow-hidden mb-3">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 p-3 text-left hover:bg-parch2/60 transition-colors"
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-[12px] font-bold text-ink">{entry.location}</span>
            <span
              className={cn(
                'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border',
                SIGNIFICANCE_COLORS[entry.significance]
              )}
            >
              {SIGNIFICANCE_LABELS[entry.significance]}
            </span>
          </div>
          <p className="text-[11px] text-muted/80 truncate">{entry.summary}</p>
        </div>
        <ChevronDown
          className={cn('w-3.5 h-3.5 shrink-0 text-muted mt-0.5 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2 border-t border-bdr/20 pt-2">
          <p className="text-[12px] text-ink/80 leading-relaxed italic">{entry.summary}</p>
          <div className="space-y-2 mt-2">
            {entry.variants.map((v, i) => (
              <div key={i} className="p-2.5 bg-white rounded-lg border border-bdr/20 text-[11px]">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-ink font-mono">{v.reading}</span>
                  <span className="text-[10px] text-muted bg-parch2 px-1.5 py-0.5 rounded border border-bdr/30">
                    {TYPE_LABELS[v.type] ?? v.type}
                  </span>
                </div>
                <p className="text-muted/90">
                  <span className="font-medium text-ink3">MSS:</span> {v.witness}
                </p>
                {v.notes && <p className="text-muted/80 mt-0.5">{v.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AIApparatusNotes({
  lemma,
  languageId,
  wordText,
  sentenceText,
}: {
  lemma: string;
  languageId: string;
  wordText?: string;
  sentenceText?: string;
}) {
  const [notes, setNotes] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    if (notes !== null || loading) return;
    setLoading(true);
    setError(null);
    const result = await AIClient.getApparatusNotes(languageId, lemma, wordText, sentenceText);
    setLoading(false);
    if (result) {
      setNotes(result);
      setOpen(true);
    } else {
      setError('Could not generate apparatus notes. Try again later.');
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-bdr/20">
      <button
        onClick={notes !== null ? () => setOpen((v) => !v) : load}
        disabled={loading}
        className="w-full flex items-center gap-2 text-[11px] font-bold text-muted hover:text-blue transition-colors disabled:cursor-wait group"
        aria-expanded={open}
      >
        <Sparkles className="w-3 h-3 shrink-0 group-hover:text-blue" aria-hidden />
        <span className="flex-1 text-left">AI Apparatus Commentary</span>
        {loading && <Loader2 className="w-3 h-3 animate-spin shrink-0" aria-hidden />}
        {notes !== null && !loading && (
          <ChevronDown
            className={cn('w-3 h-3 shrink-0 transition-transform', open && 'rotate-180')}
            aria-hidden
          />
        )}
      </button>
      {notes === null && !loading && !error && (
        <p className="text-[10px] text-muted/60 mt-1 italic">
          Generate AI commentary on textual variants for this word.
        </p>
      )}
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      {notes !== null && open && (
        <div
          className="mt-2 p-3 bg-parch2/80 border border-bdr/30 rounded-xl text-[12px] leading-relaxed text-ink/90 italic"
          aria-live="polite"
        >
          {notes}
        </div>
      )}
    </div>
  );
}

export function VariantApparatusSection({
  lemma,
  languageId,
  wordText,
  sentenceText,
  aiEnabled = true,
}: Props) {
  const staticEntries = getVariantEntries(languageId, lemma);
  const hasStatic = staticEntries.length > 0;

  if (!hasStatic && !aiEnabled) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Scroll className="w-3.5 h-3.5 text-muted shrink-0" aria-hidden />
        <span className="text-[12px] font-bold text-muted uppercase tracking-wider">
          Textual Variants
        </span>
      </div>

      {hasStatic ? (
        <div>
          {staticEntries.map((entry, i) => (
            <StaticVariantCard key={i} entry={entry} />
          ))}
          {aiEnabled && (
            <AIApparatusNotes
              lemma={lemma}
              languageId={languageId}
              wordText={wordText}
              sentenceText={sentenceText}
            />
          )}
        </div>
      ) : (
        aiEnabled && (
          <AIApparatusNotes
            lemma={lemma}
            languageId={languageId}
            wordText={wordText}
            sentenceText={sentenceText}
          />
        )
      )}
    </div>
  );
}
