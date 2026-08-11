/**
 * Phase-2 gloss/lemma recovery for the served Latin corpus (zero AI).
 *
 * Latin has no Macula equivalent, but two in-repo/licensed sources combine
 * into a useful lookup chain:
 *   1. a form→lemma table built from the Perseus Latin Dependency Treebank
 *      files already downloaded for morphology (CC BY-SA 3.0) — most-frequent
 *      lemma per surface form, u/v i/j folded;
 *   2. the bundled `LAT_DICTIONARY` (2.2k curated lemma→gloss entries, macron
 *      keys stripped for matching).
 *
 * For every Latin token with an empty gloss: resolve a lemma (its own, else
 * the LDT form table), then look the lemma up in the dictionary. Fill-only —
 * existing annotations are never overwritten.
 *
 * Usage: npx tsx scripts/corpus/regloss-served-latin.ts [--dry-run]
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { LAT_DICTIONARY } from '../../src/lib/data/dictionaries/lat.js';

const LDT_DIR = 'scripts/corpus/ingest/.sources/ldt';
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

// 1. Dictionary: lemma key → { gloss, displayLemma }.
const dict = new Map<string, { gloss: string; lemma: string }>();
for (const [lemma, gloss] of Object.entries(LAT_DICTIONARY)) {
  const k = key(lemma);
  if (k && !dict.has(k)) dict.set(k, { gloss, lemma });
}

// 2. LDT form → most-frequent lemma.
const formTally = new Map<string, Map<string, number>>();
for (const file of readdirSync(LDT_DIR)) {
  if (!file.endsWith('.xml')) continue;
  const xml = readFileSync(join(LDT_DIR, file), 'utf-8');
  for (const tag of xml.match(/<word [^>]*\/>/g) ?? []) {
    if (tag.includes('artificial=') || tag.includes('insertion_id=')) continue;
    const form = /\bform="([^"]*)"/.exec(tag)?.[1] ?? '';
    const lemma = (/\blemma="([^"]*)"/.exec(tag)?.[1] ?? '').replace(/\d+$/, '');
    const postag = /\bpostag="([^"]*)"/.exec(tag)?.[1] ?? '';
    if (!form || !lemma || postag[0] === 'u') continue;
    const fk = key(form);
    if (!fk) continue;
    let t = formTally.get(fk);
    if (!t) formTally.set(fk, (t = new Map()));
    t.set(lemma, (t.get(lemma) ?? 0) + 1);
  }
}
const formToLemma = new Map<string, string>();
for (const [fk, t] of formTally) {
  let best = '';
  let n = -1;
  for (const [lemma, c] of t) if (c > n) ((best = lemma), (n = c));
  formToLemma.set(fk, best);
}
console.log(`Latin lookup: ${dict.size} dictionary lemmas, ${formToLemma.size} treebank forms`);

// 3. Fill pass.
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
        // Resolve a lemma: token's own → treebank form table → bare normalized.
        const lemma =
          (token.lemma && token.lemma.trim()) ||
          formToLemma.get(key(token.normalized)) ||
          formToLemma.get(key(token.surface)) ||
          '';
        const hit = (lemma && dict.get(key(lemma))) || dict.get(key(token.normalized));
        if (!hit) {
          // Even without a gloss, record a confidently-resolved lemma.
          if (!token.lemma && lemma) token.lemma = lemma;
          continue;
        }
        token.gloss = hit.gloss;
        if (!token.lemma || token.lemma.trim() === '') token.lemma = lemma || hit.lemma;
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
