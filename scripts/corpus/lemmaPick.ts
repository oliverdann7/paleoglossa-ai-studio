/**
 * Choosing a lemma from form-table evidence. Pure; shared by the served-corpus
 * lemma backfill (`lemmatize-served.ts`) and its tests.
 */
import { normalizeLemma } from '../../src/lib/vocabulary/identity.js';

export type Counts = Map<string, number>;

/** Share of the evidence one lemma must hold before a form is filled. */
export const DOMINANCE = 0.9;
/** Minimum attestations before a merely dominant (not unique) lemma is trusted. */
export const MIN_EVIDENCE = 5;

/**
 * Choose a lemma from the attestations of one form. Spellings that are the
 * same vocabulary item (`καί` / `και`) count together; the accented spelling
 * is the one written. Returns null unless one item clearly dominates.
 */
export function pickLemma(counts: Counts | undefined, languageId: string): string | null {
  if (!counts || counts.size === 0) return null;
  const groups = new Map<string, { total: number; best: string; bestScore: number }>();
  let total = 0;
  for (const [lemma, n] of counts) {
    total += n;
    const id = normalizeLemma(lemma, languageId);
    const marked = lemma.normalize('NFD') !== lemma.normalize('NFD').replace(/[̀-ͯ]/g, '');
    const score = n + (marked ? 1e9 : 0); // prefer the spelling that keeps its diacritics
    const g = groups.get(id);
    if (!g) groups.set(id, { total: n, best: lemma, bestScore: score });
    else {
      g.total += n;
      if (score > g.bestScore) {
        g.best = lemma;
        g.bestScore = score;
      }
    }
  }
  const top = [...groups.values()].sort((a, b) => b.total - a.total)[0];
  if (groups.size === 1) return top.best;
  if (total >= MIN_EVIDENCE && top.total / total >= DOMINANCE) return top.best;
  return null;
}
