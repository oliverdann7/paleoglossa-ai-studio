/**
 * One spelling per Biblical Hebrew lemma in the served corpus.
 *
 * Macula Hebrew names a handful of verbs both by unpointed root and by pointed
 * dictionary form (`הלך` / `הָלַךְ`). Vocabulary identity already treats the
 * pair as one item (src/lib/vocabulary/hebrewLegacyLemmas.ts); this pass makes
 * the served tokens show the dictionary form too. Idempotent.
 *
 * Usage: npx tsx scripts/corpus/canonicalize-hebrew-lemmas.ts [--dry-run]
 * Then:  npx tsx scripts/corpus/build-lemma-profiles.ts
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { HEBREW_LEGACY_LEMMAS } from '../../src/lib/vocabulary/hebrewLegacyLemmas.js';

const DIR = 'public/corpus-data';
const dryRun = process.argv.includes('--dry-run');

const canonical = new Map(
  Object.entries(HEBREW_LEGACY_LEMMAS).map(([old, current]) => [old.normalize('NFC'), current])
);

for (const file of readdirSync(DIR).sort()) {
  if (!file.endsWith('.json') || file === 'index.json') continue;
  const path = join(DIR, file);
  const record = JSON.parse(readFileSync(path, 'utf-8')) as {
    text: { id: string; language: string };
    sections: { sentences: { tokens: { lemma?: string }[] }[] }[];
  };
  if (record.text.language !== 'hbo') continue;
  const changed = new Map<string, number>();
  for (const section of record.sections) {
    for (const sentence of section.sentences) {
      for (const token of sentence.tokens) {
        const current = canonical.get((token.lemma ?? '').normalize('NFC'));
        if (!current) continue;
        changed.set(token.lemma!, (changed.get(token.lemma!) ?? 0) + 1);
        token.lemma = current;
      }
    }
  }
  const summary = [...changed].map(([lemma, count]) => `${lemma}×${count}`).join(' ');
  console.log(`${record.text.id}: ${summary || 'nothing to change'}`);
  if (changed.size > 0 && !dryRun) writeFileSync(path, JSON.stringify(record));
}
