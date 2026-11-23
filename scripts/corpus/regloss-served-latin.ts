/**
 * Gloss recovery for the served Latin corpus (zero AI).
 *
 * For every Latin token with an empty gloss, look its lemma up in the bundled
 * `LAT_DICTIONARY` (2.2k curated lemma→gloss entries, macron keys stripped for
 * matching, u/v i/j folded). A token without a lemma is glossed only when its
 * own form is a dictionary headword. Fill-only — existing glosses are never
 * overwritten.
 *
 * Lemmas are not this script's business: `lemmatize-served.ts` assigns them,
 * with rules for ambiguous forms and proper names that a most-frequent-lemma
 * guess here used to bypass. Run that first, then this.
 *
 * Usage: npx tsx scripts/corpus/regloss-served-latin.ts [--dry-run]
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { LAT_DICTIONARY } from '../../src/lib/data/dictionaries/lat.js';

const DIR = 'public/corpus-data';
const dryRun = process.argv.includes('--dry-run');

/** Accentless lowercase key with Latin orthography folds (u/v, i/j). */
function key(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/v/g, 'u')
    .replace(/j/g, 'i')
    .replace(/[^a-z]/g, '');
}

// Dictionary: lemma key → gloss.
const dict = new Map<string, string>();
for (const [lemma, gloss] of Object.entries(LAT_DICTIONARY)) {
  const k = key(lemma);
  if (k && !dict.has(k)) dict.set(k, gloss);
}
console.log(`Latin lookup: ${dict.size} dictionary lemmas`);

// Fill pass.
interface ServedToken {
  surface: string;
  normalized: string;
  lemma: string;
  gloss: string;
}
interface ServedRecord {
  text: { id: string; language: string };
  sections: { sentences: { tokens: ServedToken[] }[] }[];
}

let grandFilled = 0;
for (const file of readdirSync(DIR).sort()) {
  if (!file.endsWith('.json') || file === 'index.json') continue;
  const path = join(DIR, file);
  const record = JSON.parse(readFileSync(path, 'utf-8')) as ServedRecord;
  if (record.text.language !== 'lat') continue;

  let tokens = 0;
  let empty = 0;
  let filled = 0;
  for (const section of record.sections) {
    for (const sentence of section.sentences) {
      for (const token of sentence.tokens) {
        tokens++;
        if (token.gloss && token.gloss.trim() !== '') continue;
        empty++;
        const gloss = dict.get(key(token.lemma?.trim() || token.normalized));
        if (!gloss) continue;
        token.gloss = gloss;
        filled++;
      }
    }
  }
  grandFilled += filled;
  if (!dryRun) writeFileSync(path, JSON.stringify(record), 'utf-8');
  console.log(
    `${record.text.id}: filled ${filled}/${empty} empty (coverage ${(((tokens - empty + filled) / tokens) * 100).toFixed(1)}%)`
  );
}
console.log(`\nTotal: +${grandFilled} Latin glosses${dryRun ? ' (dry run)' : ''}`);
