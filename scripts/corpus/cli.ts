#!/usr/bin/env tsx
/**
 * CLI wrapper around scripts/corpus/importJson.ts.
 *
 * Usage:
 *   tsx scripts/corpus/cli.ts \
 *     --input  path/to/manifest.json \
 *     --output src/data/corpus/imported/foo.ts
 *
 * Pairs with scripts/corpus/fixtures/sample-import.json for a working
 * example. Run `npm test` after generating to make sure the round-trip
 * passes.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { renderModule, validateManifest, CorpusImportError } from './importJson.js';

interface Args {
  input: string;
  output: string;
}

function parseArgs(argv: string[]): Args {
  const args: Partial<Args> = {};
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const next = argv[i + 1];
    if (flag === '--input') args.input = next;
    else if (flag === '--output') args.output = next;
  }
  if (!args.input || !args.output) {
    console.error('Usage: tsx scripts/corpus/cli.ts --input <manifest.json> --output <out.ts>');
    process.exit(1);
  }
  return args as Args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const raw = readFileSync(args.input, 'utf-8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error(`[import-json] ${args.input}: invalid JSON — ${(e as Error).message}`);
    process.exit(2);
  }
  let manifest;
  try {
    manifest = validateManifest(parsed, args.input);
  } catch (e) {
    if (e instanceof CorpusImportError) {
      console.error(e.message);
      process.exit(3);
    }
    throw e;
  }
  const ts = renderModule(manifest);
  mkdirSync(dirname(args.output), { recursive: true });
  writeFileSync(args.output, ts, 'utf-8');
  const sectionCount = manifest.sections.length;
  const sentenceCount = manifest.sections.reduce((n, s) => n + s.sentences.length, 0);
  console.log(
    `[import-json] Wrote ${sectionCount} section(s) / ${sentenceCount} sentence(s) → ${args.output}`
  );
}

main();
