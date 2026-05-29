#!/usr/bin/env tsx
/**
 * Import a PROIEL XML treebank file into a Paleoglossa sidecar JSON.
 *
 * Usage:
 *   tsx scripts/treebank/import-proiel.ts \
 *     --input  path/to/iliad.proiel.xml \
 *     --output src/data/treebanks/iliad-proiel.json \
 *     --text-id iliad-1 \
 *     [--start-index 0]
 *
 * The output is keyed by `${textId}_${sentenceIndex}` so the API can do
 * an O(1) lookup. `sentenceIndex` is assigned sequentially from the
 * order PROIEL emits sentences (starting at --start-index), which means
 * the importer expects you to be ingesting a contiguous slice that
 * matches Paleoglossa's sentence numbering for the target text.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { parseProielXml } from '../../src/lib/treebank/parseProiel.js';
import type { TreebankSidecar } from '../../src/lib/treebank/types.js';

interface Args {
  input: string;
  output: string;
  textId: string;
  startIndex: number;
}

function parseArgs(argv: string[]): Args {
  const args: Partial<Args> = { startIndex: 0 };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const next = argv[i + 1];
    if (flag === '--input') args.input = next;
    else if (flag === '--output') args.output = next;
    else if (flag === '--text-id') args.textId = next;
    else if (flag === '--start-index') args.startIndex = parseInt(next, 10) || 0;
  }
  if (!args.input || !args.output || !args.textId) {
    console.error(
      'Usage: tsx scripts/treebank/import-proiel.ts --input <xml> --output <json> --text-id <id> [--start-index N]'
    );
    process.exit(1);
  }
  return args as Args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const xml = readFileSync(args.input, 'utf-8');
  const parsed = parseProielXml(xml);

  if (parsed.length === 0) {
    console.error(`[import-proiel] No sentences found in ${args.input}.`);
    process.exit(2);
  }

  const sentences: TreebankSidecar['sentences'] = {};
  parsed.forEach((sentence, i) => {
    const sentenceIndex = args.startIndex + i;
    sentences[`${args.textId}_${sentenceIndex}`] = sentence;
  });

  const sidecar: TreebankSidecar = {
    schemaVersion: 1,
    source: 'proiel',
    textId: args.textId,
    sentences,
  };

  mkdirSync(dirname(args.output), { recursive: true });
  writeFileSync(args.output, JSON.stringify(sidecar, null, 2) + '\n', 'utf-8');
  console.log(
    `[import-proiel] Wrote ${parsed.length} sentences → ${args.output} (textId=${args.textId}, startIndex=${args.startIndex}).`
  );
}

main();
