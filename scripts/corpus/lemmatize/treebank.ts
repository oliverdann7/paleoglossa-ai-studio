/**
 * Form → lemma tables from Perseus-format dependency treebanks (AGDT, LDT, the
 * Gorman trees): `<word form="…" lemma="…" postag="…"/>`.
 *
 * A table answers "which lemma did human annotators give this spelling, and how
 * often?" — the evidence the served-corpus backfill fills empty lemmas from.
 */

export interface TreebankWord {
  form: string;
  lemma: string;
}

const WORD_TAG = /<word\b[^>]*>/g;
const attr = (tag: string, name: string): string => new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1] ?? '';

/** Real words of a treebank file: no punctuation, no elliptical (`artificial`) nodes. */
export function readTreebankWords(xml: string, isLemma: (lemma: string) => boolean): TreebankWord[] {
  const out: TreebankWord[] = [];
  for (const tag of xml.match(WORD_TAG) ?? []) {
    if (tag.includes('artificial=') || tag.includes('insertion_id=')) continue;
    if (attr(tag, 'postag').startsWith('u')) continue;
    const form = attr(tag, 'form');
    // Homograph numbering (`λέγω1`, `edo2`) is treebank-internal.
    const lemma = attr(tag, 'lemma').replace(/\d+$/, '').trim();
    if (form && lemma && isLemma(lemma)) out.push({ form, lemma });
  }
  return out;
}

/** key → lemma → occurrences. */
export type FormTable = Map<string, Map<string, number>>;

export function addToTable(table: FormTable, key: string, lemma: string): void {
  if (!key) return;
  let tally = table.get(key);
  if (!tally) table.set(key, (tally = new Map()));
  tally.set(lemma, (tally.get(lemma) ?? 0) + 1);
}

/**
 * The lemma a key resolves to, or undefined when the annotators disagree too
 * much to pick: the commonest lemma must be at least `dominance` times as
 * frequent as the runner-up.
 */
export function dominantLemma(tally: Map<string, number> | undefined, dominance: number): string | undefined {
  if (!tally) return undefined;
  let best = '';
  let bestN = 0;
  let secondN = 0;
  for (const [lemma, n] of tally) {
    if (n > bestN) ((secondN = bestN), (best = lemma), (bestN = n));
    else if (n > secondN) secondN = n;
  }
  return bestN > 0 && bestN >= dominance * secondN ? best : undefined;
}
