import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ChevronDown, ChevronRight, BookOpen, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CorpusDB } from '@/data/corpus';
import { downloadFile } from '../../lib/services/downloadService.js';

interface Props {
  lemma: string;
  languageId?: string;
  maxResults?: number;
}

const PAGE_SIZE = 20;

function buildKWIC(
  sentence: { tokens: { surface?: string; text?: string; lemma?: string; type?: string }[] },
  tokenIdx: number,
  windowSize = 5
) {
  const tokens = sentence.tokens;
  const target = tokens[tokenIdx];
  const targetText = target?.surface ?? target?.text ?? '';

  // Build left/right context from full token array
  const leftTokens: string[] = [];
  const rightTokens: string[] = [];
  let passedTarget = false;

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'punctuation' || t.type === 'whitespace') continue;
    if (i === tokenIdx) {
      passedTarget = true;
      continue;
    }
    if (!passedTarget) {
      leftTokens.push(t.surface ?? t.text ?? '');
    } else {
      if (rightTokens.length < windowSize) rightTokens.push(t.surface ?? t.text ?? '');
    }
  }

  const left = leftTokens.slice(-windowSize).join(' ');
  const right = rightTokens.join(' ');

  return { left, target: targetText, right };
}

// Group hits by text
interface Hit {
  textId: string;
  textTitle: string;
  textLanguage: string;
  sectionId: string;
  sentence: { tokens: { surface?: string; text?: string; lemma?: string; type?: string }[] };
  tokenIdx: number;
}

interface GroupedHits {
  textId: string;
  textTitle: string;
  textLanguage: string;
  hits: Hit[];
}

export function KWICPanel({ lemma, languageId, maxResults = 200 }: Props) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [expandedTexts, setExpandedTexts] = useState<Set<string>>(new Set(['all']));
  const [groupByText, setGroupByText] = useState(false);

  const allHits = useMemo(() => {
    if (!lemma.trim()) return [];
    return CorpusDB.searchCorpus(lemma.trim(), { languageId, limit: maxResults });
  }, [lemma, languageId, maxResults]);

  const grouped = useMemo<GroupedHits[]>(() => {
    const map = new Map<string, GroupedHits>();
    for (const hit of allHits) {
      const existing = map.get(hit.textId);
      if (existing) {
        existing.hits.push(hit as Hit);
      } else {
        map.set(hit.textId, {
          textId: hit.textId,
          textTitle: hit.textTitle,
          textLanguage: hit.textLanguage,
          hits: [hit as Hit],
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.hits.length - a.hits.length);
  }, [allHits]);

  const totalHits = allHits.length;
  const totalPages = Math.max(1, Math.ceil(totalHits / PAGE_SIZE));
  const pagedHits = allHits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleText = (textId: string) => {
    setExpandedTexts((prev) => {
      const next = new Set(prev);
      if (next.has(textId)) {
        next.delete(textId);
      } else {
        next.add(textId);
      }
      return next;
    });
  };

  const exportCSV = () => {
    const rows = [['Left Context', 'Target', 'Right Context', 'Text', 'Section']];
    for (const hit of allHits) {
      const kwic = buildKWIC(hit.sentence as any, hit.tokenIdx);
      rows.push([kwic.left, kwic.target, kwic.right, hit.textTitle, hit.sectionId]);
    }
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    void downloadFile(`kwic_${lemma}_${Date.now()}.csv`, blob);
  };

  if (totalHits === 0) {
    return (
      <div className="text-center py-10 text-muted">
        <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted/40" />
        <p className="text-[13px]">
          No corpus occurrences found for{' '}
          <span className="font-serif font-bold text-ink">{lemma}</span>.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Stats header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-bold text-ink">
            {totalHits} occurrence{totalHits !== 1 ? 's' : ''}
          </span>
          <span className="text-[12px] text-muted">
            across {grouped.length} text{grouped.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setGroupByText(!groupByText)}
            className={cn(
              'text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors',
              groupByText
                ? 'bg-blue text-white border-blue'
                : 'border-bdr text-muted hover:border-blue/40'
            )}
          >
            Group by text
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-bdr text-muted hover:border-blue/40 hover:text-blue transition-colors"
          >
            <Download className="w-3 h-3" /> CSV
          </button>
        </div>
      </div>

      {groupByText ? (
        /* Grouped view */
        <div className="space-y-3">
          {grouped.map((group) => {
            const expanded = expandedTexts.has(group.textId);
            return (
              <div key={group.textId} className="border border-bdr/50 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleText(group.textId)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-parch2/50 hover:bg-parch2 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {expanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-muted shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-muted shrink-0" />
                    )}
                    <span className="font-medium text-[13px] text-ink truncate">
                      {group.textTitle}
                    </span>
                    <span className="text-[10px] text-muted shrink-0">{group.textLanguage}</span>
                  </div>
                  <span className="text-[11px] font-bold text-blue shrink-0 ml-2">
                    {group.hits.length}×
                  </span>
                </button>
                {expanded && (
                  <div className="divide-y divide-bdr/20">
                    {group.hits.map((hit, i) => {
                      const kwic = buildKWIC(hit.sentence as any, hit.tokenIdx);
                      return (
                        <div
                          key={i}
                          className="px-4 py-2 font-mono text-[12px] flex items-baseline gap-1 hover:bg-parch2/30 group"
                        >
                          <span
                            className="text-muted text-right min-w-[140px] truncate shrink-0"
                            dir="ltr"
                          >
                            {kwic.left}
                          </span>
                          <span className="font-bold text-blue shrink-0 px-0.5">{kwic.target}</span>
                          <span className="text-ink2 flex-1 truncate" dir="ltr">
                            {kwic.right}
                          </span>
                          <button
                            onClick={() => navigate(`/app/reader/${hit.textId}`)}
                            className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded text-muted hover:text-blue transition-all"
                            title="Open in reader"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat KWIC view */
        <div className="border border-bdr/40 rounded-xl overflow-hidden">
          <div className="divide-y divide-bdr/20">
            {pagedHits.map((hit, i) => {
              const kwic = buildKWIC(hit.sentence as any, hit.tokenIdx);
              return (
                <div
                  key={i}
                  className="px-4 py-2 font-mono text-[12px] flex items-baseline gap-1 hover:bg-parch2/30 group"
                >
                  <span className="text-muted text-right min-w-[140px] truncate shrink-0" dir="ltr">
                    {kwic.left}
                  </span>
                  <span className="font-bold text-blue shrink-0 px-0.5">{kwic.target}</span>
                  <span className="text-ink2 flex-1 truncate" dir="ltr">
                    {kwic.right}
                  </span>
                  <span className="text-[10px] text-muted/60 shrink-0 hidden sm:block truncate max-w-[100px]">
                    {hit.textTitle}
                  </span>
                  <button
                    onClick={() => navigate(`/app/reader/${hit.textId}`)}
                    className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded text-muted hover:text-blue transition-all"
                    title="Open in reader"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {!groupByText && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-[12px] font-bold border border-bdr rounded-lg disabled:opacity-40 hover:border-blue/40 transition-colors"
          >
            Previous
          </button>
          <span className="text-[12px] text-muted">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-[12px] font-bold border border-bdr rounded-lg disabled:opacity-40 hover:border-blue/40 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {totalHits >= maxResults && (
        <p className="text-center text-[11px] text-muted mt-3">
          Showing first {maxResults} results. Use the Search page for broader queries.
        </p>
      )}
    </div>
  );
}
