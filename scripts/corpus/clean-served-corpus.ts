/**
 * Maintenance pass over the served corpus (`public/corpus-data/`).
 *
 * Applies the 2026-08 corpus-audit fixes to the emitted JSON in place:
 *   1. Language remap — retires the phantom `grc-class` code (merged into `grc`).
 *   2. Junk-token removal — apparatus sigla, un-decoded escapes, bare verse
 *      numbers (shared rules in `ingest/clean.ts`; the ingest pipeline now
 *      applies them at segmentation, this script retrofits existing emits).
 *   3. Truthful capability flags — `hasMorphology`/`hasTranslation` recomputed
 *      from the actual tokens (same thresholds as `ingest/assemble.ts`).
 *   4. Quarantine — removes texts whose token streams are beyond repair
 *      (currently `akk-gilgamesh-full`: an English translation + apparatus was
 *      ingested as Akkadian; must be re-ingested cleanly from eBL).
 *   5. Rebuilds `index.json` and prints per-text count changes so bundled
 *      `remoteSections` stubs can be resynced (validation.test.ts locks them).
 *
 * Usage: npx tsx scripts/corpus/clean-served-corpus.ts [--dry-run]
 */
import { readdirSync, readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { cleanSections, type CleanStats } from './ingest/clean.js';
import { rebuildIndex, LOCAL_CORPUS_DIR } from './ingest/emitLocal.js';

const LANGUAGE_REMAP: Record<string, string> = { 'grc-class': 'grc' };

const QUARANTINED: string[] = ['akk-gilgamesh-full'];

const CAPABILITY_COVERAGE_THRESHOLD = 0.9;

const dryRun = process.argv.includes('--dry-run');

interface ServedToken {
  surface: string;
  morphology?: { partOfSpeech?: string };
}
interface ServedSentence {
  id: string;
  translation?: string;
  tokens: ServedToken[];
}
interface ServedSection {
  id: string;
  sentences: ServedSentence[];
}
interface ServedRecord {
  text: {
    id: string;
    language: string;
    hasMorphology?: boolean;
    hasTranslation?: boolean;
    sentenceCount?: number;
    [key: string]: unknown;
  };
  sections: ServedSection[];
}

interface TextReport extends CleanStats {
  id: string;
  language: string;
  sentenceCount: number;
  wordCount: number;
  hasMorphology: boolean;
  hasTranslation: boolean;
  changed: boolean;
}

const reports: TextReport[] = [];

for (const file of readdirSync(LOCAL_CORPUS_DIR).sort()) {
  if (!file.endsWith('.json') || file === 'index.json') continue;
  const path = join(LOCAL_CORPUS_DIR, file);
  const record = JSON.parse(readFileSync(path, 'utf-8')) as ServedRecord;

  if (QUARANTINED.includes(record.text.id)) {
    console.log(`QUARANTINE ${record.text.id} — deleting ${path}`);
    if (!dryRun) unlinkSync(path);
    continue;
  }

  const before = JSON.stringify(record.text);

  const remapped = LANGUAGE_REMAP[record.text.language];
  if (remapped) record.text.language = remapped;

  const stats = cleanSections(record.sections, record.text.language);

  let tokens = 0;
  let tagged = 0;
  let sentences = 0;
  let translated = 0;
  for (const section of record.sections) {
    for (const sentence of section.sentences) {
      sentences++;
      if (sentence.translation && sentence.translation.trim() !== '') translated++;
      for (const token of sentence.tokens) {
        tokens++;
        const pos = token.morphology?.partOfSpeech;
        if (pos && pos !== 'unknown') tagged++;
      }
    }
  }

  record.text.sentenceCount = sentences;
  record.text.hasMorphology = tokens > 0 && tagged / tokens >= CAPABILITY_COVERAGE_THRESHOLD;
  record.text.hasTranslation =
    sentences > 0 && translated / sentences >= CAPABILITY_COVERAGE_THRESHOLD;

  const changed =
    stats.tokensRemoved > 0 || stats.sentencesRemoved > 0 || before !== JSON.stringify(record.text);

  reports.push({
    id: record.text.id,
    language: record.text.language,
    ...stats,
    sentenceCount: sentences,
    wordCount: tokens,
    hasMorphology: record.text.hasMorphology,
    hasTranslation: record.text.hasTranslation as boolean,
    changed,
  });

  if (changed && !dryRun) {
    writeFileSync(path, JSON.stringify(record), 'utf-8');
  }
}

if (!dryRun && existsSync(LOCAL_CORPUS_DIR)) rebuildIndex(LOCAL_CORPUS_DIR);

const changedReports = reports.filter((r) => r.changed);
console.log(`\n${reports.length} texts scanned, ${changedReports.length} changed${dryRun ? ' (dry run — nothing written)' : ''}.`);
for (const r of changedReports) {
  console.log(
    `${r.id} [${r.language}] -${r.tokensRemoved} tokens, -${r.sentencesRemoved} sentences → ` +
      `${r.sentenceCount} sentences / ${r.wordCount} words, ` +
      `hasMorphology=${r.hasMorphology}, hasTranslation=${r.hasTranslation}`
  );
}

// Machine-readable dump for resyncing the bundled remoteSections stubs.
writeFileSync(
  'reports/served-corpus-clean.json',
  JSON.stringify(reports, null, 2),
  'utf-8'
);
console.log('\nPer-text report written to reports/served-corpus-clean.json');
