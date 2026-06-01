#!/usr/bin/env tsx
/**
 * Corpus ingestion pipeline CLI — orchestrates segment → annotate → glossFill
 * → assemble → pushFirestore for one work, and writes it to Firestore WITHOUT
 * touching the bundled corpus. Run by a maintainer with credentials; never in
 * the client or a serverless request.
 *
 * Two sources:
 *
 *   1. Macula Greek (fully annotated TSV — surface+lemma+gloss+morphology):
 *      tsx scripts/corpus/ingest/cli.ts \
 *        --source macula --tsv ./macula-greek.tsv --book MRK \
 *        --text-id grc-mark-full --language grc \
 *        --title "Gospel of Mark" [--dry-run]
 *
 *   2. Generic work JSON (a WorkInput) + optional positional annotations
 *      (TokenAnnotation[]). Empty glosses are resolved from bundled
 *      dictionaries, then Gemini if --gemini-key is supplied:
 *      tsx scripts/corpus/ingest/cli.ts \
 *        --source work --work ./caesar-bg-1.json \
 *        [--annotations ./caesar-bg-1.proiel.json] \
 *        --text-id lat-caesar-bg-1 --language lat \
 *        --title "Caesar, De Bello Gallico I" \
 *        [--gemini-key $GEMINI_API_KEY] [--dry-run]
 *
 * See README.md for sources, licenses, and the pilot run-book.
 */

import { readFileSync } from 'fs';
import { segmentWork } from './segment.js';
import { applyAnnotations } from './annotate.js';
import { buildMaculaSections } from './sources/macula.js';
import { fillGlosses, createGeminiGlossResolver } from './glossFill.js';
import { assembleText } from './assemble.js';
import { pushToFirestore } from './pushFirestore.js';
import type { TextSection, TokenAnnotation, WorkInput } from './types.js';

interface Args {
  source: 'macula' | 'work';
  tsv?: string;
  book?: string;
  work?: string;
  annotations?: string;
  textId: string;
  language: string;
  title: string;
  author?: string;
  geminiKey?: string;
  glossCache?: string;
  dryRun: boolean;
}

function parseArgs(argv: string[]): Args {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const args: Args = {
    source: (get('--source') as Args['source']) ?? 'work',
    tsv: get('--tsv'),
    book: get('--book'),
    work: get('--work'),
    annotations: get('--annotations'),
    textId: get('--text-id') ?? '',
    language: get('--language') ?? '',
    title: get('--title') ?? '',
    author: get('--author'),
    geminiKey: get('--gemini-key') ?? process.env.GEMINI_API_KEY,
    glossCache: get('--gloss-cache'),
    dryRun: argv.includes('--dry-run'),
  };
  const missing: string[] = [];
  if (!args.textId) missing.push('--text-id');
  if (!args.language) missing.push('--language');
  if (!args.title) missing.push('--title');
  if (args.source === 'macula' && (!args.tsv || !args.book)) missing.push('--tsv and --book (macula)');
  if (args.source === 'work' && !args.work) missing.push('--work (work)');
  if (missing.length) {
    console.error(`[ingest] Missing required args: ${missing.join(', ')}`);
    process.exit(1);
  }
  return args;
}

async function buildSections(args: Args): Promise<TextSection[]> {
  if (args.source === 'macula') {
    const tsv = readFileSync(args.tsv!, 'utf-8');
    return buildMaculaSections(tsv, { book: args.book!, textId: args.textId });
  }
  // source === 'work'
  const work = JSON.parse(readFileSync(args.work!, 'utf-8')) as WorkInput;
  // textId/language from the flags win, so one work file can be re-targeted.
  work.textId = args.textId;
  work.language = args.language;
  let sections = segmentWork(work);
  if (args.annotations) {
    const annotations = JSON.parse(readFileSync(args.annotations, 'utf-8')) as TokenAnnotation[];
    const res = applyAnnotations(sections, annotations);
    sections = res.sections;
    console.log(`[ingest] Applied ${res.matched} annotations (${res.unmatched.length} unmatched).`);
  }
  return sections;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log(`[ingest] ${args.dryRun ? '[DRY RUN] ' : ''}${args.textId} (${args.language}) via "${args.source}"`);

  let sections = await buildSections(args);

  const cachePath = args.glossCache ?? `scripts/corpus/ingest/.cache/${args.language}-glosses.json`;
  const gloss = await fillGlosses(sections, {
    languageId: args.language,
    cachePath,
    aiResolver: args.geminiKey ? createGeminiGlossResolver(args.geminiKey) : undefined,
  });
  sections = gloss.sections;
  console.log(
    `[ingest] Glosses — bundled: ${gloss.filledFromBundled}, ai: ${gloss.filledFromAi}, still missing: ${gloss.stillMissing}`
  );

  const assembled = assembleText(args.textId, args.language, { title: args.title, author: args.author }, sections);

  if (!assembled.complete) {
    console.warn(`[ingest] ⚠ Text "${args.textId}" did NOT pass the completeness gate — writing as 'partial':`);
    for (const p of assembled.problems) console.warn(`    - ${p}`);
  } else {
    console.log(`[ingest] ✓ Completeness gate passed — ${assembled.text.sentenceCount} sentences, ${sections.length} sections, marking 'complete'.`);
  }

  const result = await pushToFirestore(assembled, { dryRun: args.dryRun });
  console.log(
    `[ingest] ${args.dryRun ? 'Would write' : 'Wrote'} corpus/${result.textId} + ${result.sectionsWritten} sections${args.dryRun ? ' (dry run — nothing committed)' : ''}.`
  );
}

main().catch((err) => {
  console.error('[ingest] Fatal error:', err);
  process.exit(1);
});
