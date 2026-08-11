/**
 * Phase-1.5 re-sectioning of one-section served texts.
 *
 * The audit found 12 served texts shipping as a single giant section (Isaiah:
 * 2,271 sentences in one scroll). The original chapter markers were lost at
 * ingest and the raw sources are not on this machine, so this script splits
 * deterministically:
 *
 *  - `arc-targum-onkelos-genesis-full`: its 1,533 sentences are exactly the
 *    Masoretic verse count of Genesis, verse-per-sentence in order — split
 *    into the 50 real chapters via the canonical verses-per-chapter table
 *    (validated to sum to 1,533; aborts otherwise).
 *  - Any other text with ONE section of > 400 sentences: split into even
 *    "Part N" chunks of ~150 sentences. Not chapter-accurate, but honest
 *    labels and a usable reader/navigation experience; chapter-accurate
 *    re-splits can land whenever the sources are re-fetched.
 *
 * Section ids stay in the `<textId>-<n>` scheme; sentence ids are untouched
 * (they are opaque). Bundled `remoteSections` stubs must be resynced after
 * this — run sync-stub-previews.ts, which regenerates their sectionsPreview
 * from the served JSON (validation.test.ts locks the 1:1 correspondence).
 *
 * Usage: npx tsx scripts/corpus/resection-served-corpus.ts [--dry-run]
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { rebuildIndex, LOCAL_CORPUS_DIR } from './ingest/emitLocal.js';

const dryRun = process.argv.includes('--dry-run');

const SPLIT_THRESHOLD = 400;
const TARGET_PART_SIZE = 150;

/**
 * Masoretic verses per chapter, Genesis 1–50, Hebrew versification
 * (31:54 / 32:33, as in Sperber's Targum edition) — sums to 1,533.
 */
const GENESIS_VERSES = [
  31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24, 21, 16, 27, 33, 38, 18,
  34, 24, 20, 67, 34, 35, 46, 22, 35, 43, 54, 33, 20, 31, 29, 43, 36, 30, 23, 23,
  57, 38, 34, 34, 28, 34, 31, 22, 33, 26,
];

interface Sentence {
  id: string;
}
interface Section {
  id: string;
  textId?: string;
  sequence?: number;
  label?: string;
  nextSectionId?: string;
  previousSectionId?: string;
  sentences: Sentence[];
}
interface ServedRecord {
  text: {
    id: string;
    sentenceCount?: number;
    sectionsPreview?: { id: string; label: string }[];
    [k: string]: unknown;
  };
  sections: Section[];
}

function rebuildSections(
  record: ServedRecord,
  chunks: { label: string; sentences: Sentence[] }[]
): void {
  const textId = record.text.id;
  record.sections = chunks.map((chunk, i) => ({
    id: `${textId}-${i + 1}`,
    textId,
    sequence: i + 1,
    label: chunk.label,
    previousSectionId: i > 0 ? `${textId}-${i}` : undefined,
    nextSectionId: i < chunks.length - 1 ? `${textId}-${i + 2}` : undefined,
    sentences: chunk.sentences,
  }));
  record.text.sectionsPreview = record.sections.map((s) => ({ id: s.id, label: s.label ?? '' }));
}

for (const file of readdirSync(LOCAL_CORPUS_DIR).sort()) {
  if (!file.endsWith('.json') || file === 'index.json') continue;
  const path = join(LOCAL_CORPUS_DIR, file);
  const record = JSON.parse(readFileSync(path, 'utf-8')) as ServedRecord;
  if (record.sections.length !== 1) continue;
  const sentences = record.sections[0].sentences;
  if (sentences.length <= SPLIT_THRESHOLD) continue;

  let chunks: { label: string; sentences: Sentence[] }[];
  if (record.text.id === 'arc-targum-onkelos-genesis-full') {
    const total = GENESIS_VERSES.reduce((a, b) => a + b, 0);
    if (total !== sentences.length) {
      console.error(
        `SKIP ${record.text.id}: expected ${total} verses, found ${sentences.length} sentences — not verse-aligned`
      );
      continue;
    }
    let offset = 0;
    chunks = GENESIS_VERSES.map((n, i) => {
      const part = sentences.slice(offset, offset + n);
      offset += n;
      return { label: `בראשית ${i + 1}`, sentences: part };
    });
  } else {
    const parts = Math.ceil(sentences.length / TARGET_PART_SIZE);
    const per = Math.ceil(sentences.length / parts);
    chunks = [];
    for (let i = 0; i < parts; i++) {
      chunks.push({ label: `Part ${i + 1}`, sentences: sentences.slice(i * per, (i + 1) * per) });
    }
  }

  rebuildSections(record, chunks);
  console.log(`${record.text.id}: 1 section (${sentences.length} sentences) → ${chunks.length} sections`);
  if (!dryRun) writeFileSync(path, JSON.stringify(record), 'utf-8');
}

if (!dryRun) rebuildIndex(LOCAL_CORPUS_DIR);
console.log(dryRun ? '(dry run — nothing written)' : 'Done. Now run sync-stub-previews.ts.');
