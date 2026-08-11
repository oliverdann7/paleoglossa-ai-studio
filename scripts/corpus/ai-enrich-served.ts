/**
 * Phases 3b/4 driver — AI morphology + translation backfill for served texts.
 *
 * Walks `public/corpus-data`, and for every sentence still missing morphology
 * or a stored translation, resolves ONE cached Gemini call per sentence via
 * ingest/aiFill.ts (same prompt contract as the live Reader; everything
 * labeled ai-generated; treebank/curated data never overwritten).
 *
 * The approved rollout is flagship-first: use --text/--language to scope runs
 * and --limit to cap AI spend per invocation. Suggested batch 1 (~15k
 * sentences): hbo-*, grc-koine NT books, syr-peshitta gospels, Anabasis,
 * Plato Apology, Aesop.
 *
 *   GEMINI_API_KEY=… npx tsx scripts/corpus/ai-enrich-served.ts \
 *     --text hbo-genesis-full --limit 500 [--translate-only] [--dry-run]
 *
 * Afterwards run clean-served-corpus.ts (flags + index recompute) and
 * sync-stub-previews.ts is NOT needed (sections unchanged).
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  applyAnalysis,
  createGeminiSentenceResolver,
  loadAiCache,
  saveAiCache,
  sentenceText,
  type AiSentenceAnalysis,
} from './ingest/aiFill.js';
import type { Sentence } from '../../src/types/corpus.js';

const DIR = 'public/corpus-data';

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const flag = (name: string) => process.argv.includes(`--${name}`);

const onlyText = arg('text');
const onlyLanguage = arg('language');
const limit = Number(arg('limit') ?? Infinity);
const translateOnly = flag('translate-only');
const dryRun = flag('dry-run');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey && !dryRun) {
  console.error(
    'GEMINI_API_KEY is not set. This stage is built and ready, but it cannot run without a key.\n' +
      'Set the key in the environment (see .env.example) and re-run. Use --dry-run to preview scope.'
  );
  process.exit(1);
}
const resolver = apiKey ? createGeminiSentenceResolver(apiKey) : null;

interface ServedRecord {
  text: { id: string; language: string };
  sections: { sentences: Sentence[] }[];
}

function sentenceNeedsWork(s: Sentence): { morph: boolean; translation: boolean } {
  const morph =
    !translateOnly &&
    s.tokens.some((t) => !t.morphology?.partOfSpeech || t.morphology.partOfSpeech === 'unknown');
  const translation = !s.translation || !s.translation.trim();
  return { morph, translation };
}

let calls = 0;
let cacheHits = 0;
let morphFilled = 0;
let glossFilled = 0;
let translationsSet = 0;

for (const file of readdirSync(DIR).sort()) {
  if (!file.endsWith('.json') || file === 'index.json') continue;
  const path = join(DIR, file);
  const record = JSON.parse(readFileSync(path, 'utf-8')) as ServedRecord;
  if (onlyText && record.text.id !== onlyText) continue;
  if (onlyLanguage && record.text.language !== onlyLanguage) continue;

  const cachePath = `scripts/corpus/ingest/.cache/${record.text.language}-ai-analysis.json`;
  const cache = loadAiCache(cachePath);
  let changed = false;

  outer: for (const section of record.sections) {
    for (const sentence of section.sentences) {
      const need = sentenceNeedsWork(sentence);
      if (!need.morph && !need.translation) continue;
      if (calls >= limit) break outer;

      const key = `${record.text.language}::${sentence.id}`;
      let analysis: AiSentenceAnalysis | undefined = cache[key];
      if (analysis) {
        cacheHits++;
      } else {
        if (dryRun || !resolver) {
          calls++; // dry-run: count what a real run would spend
          continue;
        }
        const resolved = await resolver(record.text.language, sentenceText(sentence));
        calls++;
        if (!resolved) continue;
        cache[key] = resolved;
        analysis = resolved;
      }

      const r = applyAnalysis(sentence, analysis);
      morphFilled += r.morphFilled;
      glossFilled += r.glossFilled;
      if (r.translationSet) translationsSet++;
      if (r.morphFilled || r.glossFilled || r.translationSet) changed = true;
    }
  }

  if (changed && !dryRun) {
    writeFileSync(path, JSON.stringify(record), 'utf-8');
    saveAiCache(cachePath, cache);
    console.log(`${record.text.id}: updated`);
  }
}

console.log(
  `\n${dryRun ? '[dry run] ' : ''}AI calls ${dryRun ? 'needed' : 'made'}: ${calls}, cache hits: ${cacheHits}, ` +
    `morph filled: ${morphFilled} tokens, glosses: ${glossFilled}, translations: ${translationsSet}`
);
if (!dryRun) console.log('Run clean-served-corpus.ts to recompute capability flags + index.');
