import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { apiFetch } from '../lib/services/apiFetch.js';
import { WordState, normalizeWordState } from '../lib/constants/wordStates.js';
import type { KnowledgeMap } from '../lib/services/vocabularyService.js';
import { logSilentFailure } from '../lib/utils/logSilent.js';

interface FreqEntry {
  lemma: string;
  frequency: number;
}

interface FreqResponse {
  language: string;
  total: number;
  offset: number;
  limit: number;
  entries: FreqEntry[];
}

interface Tier {
  limit: number;
  label: string;
  levelName: string;
  color: string;
}

const TIERS: Tier[] = [
  { limit: 100,  label: 'Top 100',   levelName: 'Foundation',    color: 'bg-emerald-400' },
  { limit: 300,  label: 'Top 300',   levelName: 'Elementary',    color: 'bg-blue/70' },
  { limit: 500,  label: 'Top 500',   levelName: 'Intermediate',  color: 'bg-blue' },
  { limit: 1000, label: 'Top 1000',  levelName: 'Advanced',      color: 'bg-violet-500' },
  { limit: 2000, label: 'Top 2000',  levelName: 'Proficient',    color: 'bg-amber-500' },
];

interface Props {
  knowledge: KnowledgeMap;
  languageId: string;
}

export function VocabFrequencyGoals({ knowledge, languageId }: Props) {
  const [entries, setEntries] = useState<FreqEntry[]>([]);

  useEffect(() => {
    if (!languageId || languageId === 'all') return;
    let stale = false;
    apiFetch<FreqResponse>(`/api/lemma-frequency/${encodeURIComponent(languageId)}?limit=2000`, {
      skipAuth: true,
    })
      .then((data) => {
        if (!stale) setEntries(data.entries ?? []);
      })
      .catch((e) => logSilentFailure('VocabFrequencyGoals.loadFreq', e));
    return () => {
      stale = true;
    };
  }, [languageId]);

  // Build a set of lemmas the user actively knows (KNOWN, FAMILIAR, LEARNING)
  const knownLemmas = useMemo(() => {
    const s = new Set<string>();
    for (const [lemma, info] of Object.entries(knowledge)) {
      if (!info || typeof info !== 'object') continue;
      const wordInfo = info as { state?: string; languageId?: string };
      if (wordInfo.languageId && wordInfo.languageId !== languageId) continue;
      const state = normalizeWordState(wordInfo.state);
      if (
        state === WordState.KNOWN ||
        state === WordState.FAMILIAR ||
        state === WordState.LEARNING
      ) {
        s.add(lemma.toLowerCase());
      }
    }
    return s;
  }, [knowledge, languageId]);

  const tierStats = useMemo(
    () =>
      TIERS.map((tier) => {
        const slice = entries.slice(0, tier.limit);
        const known = slice.filter((e) => knownLemmas.has(e.lemma.toLowerCase())).length;
        const pct = slice.length > 0 ? Math.round((known / slice.length) * 100) : 0;
        return { ...tier, known, total: slice.length, pct };
      }),
    [entries, knownLemmas]
  );

  // Current level = highest tier where coverage ≥ 50%
  const currentLevel = useMemo(() => {
    let best: (typeof tierStats)[0] | null = null;
    for (const t of tierStats) {
      if (t.pct >= 50) best = t;
    }
    return best;
  }, [tierStats]);

  if (!languageId || languageId === 'all' || entries.length === 0) return null;

  return (
    <div className="space-y-3">
      {currentLevel && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[12px] font-bold text-ink2 uppercase tracking-widest">
            Current level
          </span>
          <span
            className={cn(
              'px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white',
              currentLevel.color
            )}
          >
            {currentLevel.levelName}
          </span>
        </div>
      )}

      {tierStats.map((tier) => (
        <div key={tier.limit}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-ink">{tier.label}</span>
              <span className="text-[11px] text-ink3">{tier.levelName}</span>
            </div>
            <span className="text-[12px] font-bold text-ink tabular-nums">
              {tier.known}/{tier.total}
              <span className="text-ink3 font-normal ml-1">({tier.pct}%)</span>
            </span>
          </div>
          <div className="h-2 bg-parch3 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-700', tier.color)}
              style={{ width: `${tier.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
