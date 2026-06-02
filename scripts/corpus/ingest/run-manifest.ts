#!/usr/bin/env tsx
/**
 * Batch runner — drive the whole {@link MANIFEST} through the ingestion pipeline.
 *
 * Reuses the exact same stages as the single-text CLI (segment / annotate /
 * glossFill / assemble / pushFirestore) and the same license gate, so a manifest
 * run is just N CLI runs with one shared report.
 *
 *   # Validate everything without writing or needing credentials:
 *   tsx scripts/corpus/ingest/run-manifest.ts --dry-run
 *
 *   # Ingest just the Koine NT (real write — needs FIREBASE_SERVICE_ACCOUNT_JSON):
 *   tsx scripts/corpus/ingest/run-manifest.ts --only grc-koine
 *
 * Flags:
 *   --dry-run             build + validate, write nothing (no credentials needed)
 *   --only <lang|textId>  restrict to a language id or a single text id
 *   --allow-noncommercial bypass the commercial gate (non-commercial builds only)
 *   --sources-dir <path>  where source files live (default scripts/corpus/ingest/.sources)
 *   --gemini-key <key>    enable AI gloss-fill for text-only sources
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { buildMaculaSections } from './sources/macula.js';
import { buildMaculaHebrewSections } from './sources/macula-hebrew.js';
import { parseTeiWork } from './sources/tei.js';
import { parsePlaintextWork } from './sources/plaintext.js';
import { segmentWork } from './segment.js';
import { applyAnnotations } from './annotate.js';
import { fillGlosses, createGeminiGlossResolver } from './glossFill.js';
import { assembleText } from './assemble.js';
import { pushToFirestore } from './pushFirestore.js';
import { emitLocal } from './emitLocal.js';
import { checkLicense } from './licenseGate.js';
import { getLanguageDirection } from '../../../src/lib/data/languages.js';
import { MANIFEST, type ManifestEntry } from './manifest.js';
import type { TextSection, TokenAnnotation } from './types.js';

interface RunArgs {
  dryRun: boolean;
  only?: string;
  allowNonCommercial: boolean;
  sourcesDir: string;
  geminiKey?: string;
  emitLocal: boolean;
}

function parseArgs(argv: string[]): RunArgs {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  return {
    dryRun: argv.includes('--dry-run'),
    only: get('--only'),
    allowNonCommercial: argv.includes('--allow-noncommercial'),
    sourcesDir: get('--sources-dir') ?? 'scripts/corpus/ingest/.sources',
    geminiKey: get('--gemini-key') ?? process.env.GEMINI_API_KEY,
    emitLocal: argv.includes('--emit-local'),
  };
}

function matchesOnly(entry: ManifestEntry, only?: string): boolean {
  if (!only) return true;
  return entry.language === only || entry.textId === only;
}

function buildSections(entry: ManifestEntry, sourcesDir: string): TextSection[] | null {
  const filePath = entry.file ? join(sourcesDir, entry.file) : undefined;
  if (entry.source === 'macula' || entry.source === 'macula-hebrew') {
    if (!filePath || !existsSync(filePath)) return null;
    const tsv = readFileSync(filePath, 'utf-8');
    const opts = { book: entry.book!, textId: entry.textId };
    return entry.source === 'macula'
      ? buildMaculaSections(tsv, opts)
      : buildMaculaHebrewSections(tsv, opts);
  }

  if (entry.source === 'tei' || entry.source === 'plaintext') {
    if (!filePath || !existsSync(filePath)) return null;
    const raw = readFileSync(filePath, 'utf-8');
    const work =
      entry.source === 'tei'
        ? parseTeiWork(raw, { textId: entry.textId, language: entry.language, title: entry.title })
        : parsePlaintextWork(raw, { textId: entry.textId, language: entry.language, title: entry.title });
    return segmentWork(work);
  }

  // source === 'work'
  if (!filePath || !existsSync(filePath)) return null;
  const work = JSON.parse(readFileSync(filePath, 'utf-8'));
  work.textId = entry.textId;
  work.language = entry.language;
  let sections = segmentWork(work);
  if (entry.annotationsFile) {
    const ann = JSON.parse(readFileSync(join(sourcesDir, entry.annotationsFile), 'utf-8')) as TokenAnnotation[];
    sections = applyAnnotations(sections, ann).sections;
  }
  return sections;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const entries = MANIFEST.filter((e) => matchesOnly(e, args.only));
  console.log(
    `[manifest] ${args.dryRun ? '[DRY RUN] ' : ''}${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}${args.only ? ` matching "${args.only}"` : ''}.`
  );

  const summary = { ingested: 0, complete: 0, partial: 0, blocked: 0, missing: 0, failed: 0 };

  for (const entry of entries) {
    const tag = `${entry.textId} (${entry.language})`;

    // Curatorial block (license and/or editorial decision). Honored regardless
    // of the license-gate result; only an explicit override attempts it.
    if (entry.status === 'blocked') {
      if (!args.allowNonCommercial) {
        console.log(`[manifest] ⊘ ${tag} blocked — ${entry.blockedReason ?? 'recorded but not ingested'}`);
        summary.blocked++;
        continue;
      }
      console.log(`[manifest] … ${tag} was blocked but --allow-noncommercial set; attempting.`);
    }

    const lic = checkLicense(entry.attribution, { allowNonCommercial: args.allowNonCommercial });
    for (const w of lic.warnings) console.warn(`[manifest]   ⚠ ${w}`);
    if (!lic.ok) {
      console.log(`[manifest] ⊘ ${tag} blocked — ${lic.reason}`);
      summary.blocked++;
      continue;
    }

    let sections: TextSection[] | null;
    try {
      sections = buildSections(entry, args.sourcesDir);
    } catch (err) {
      console.error(`[manifest] ✗ ${tag} failed to build:`, (err as Error).message);
      summary.failed++;
      continue;
    }
    if (!sections) {
      console.log(`[manifest] – ${tag} skipped — source file not present (${entry.file ?? 'no file'}).`);
      summary.missing++;
      continue;
    }

    const cachePath = `scripts/corpus/ingest/.cache/${entry.language}-glosses.json`;
    const gloss = await fillGlosses(sections, {
      languageId: entry.language,
      cachePath,
      aiResolver: args.geminiKey ? createGeminiGlossResolver(args.geminiKey) : undefined,
    });

    const assembled = assembleText(
      entry.textId,
      entry.language,
      {
        title: entry.title,
        author: entry.author,
        sourceAttributionId: entry.attribution,
        direction: getLanguageDirection(entry.language),
      },
      gloss.sections
    );

    const result =
      args.emitLocal && !args.dryRun
        ? emitLocal(assembled)
        : await pushToFirestore(assembled, { dryRun: args.dryRun });
    const state = assembled.complete ? 'complete' : 'partial';
    if (assembled.complete) summary.complete++;
    else summary.partial++;
    summary.ingested++;
    console.log(
      `[manifest] ${assembled.complete ? '✓' : '◐'} ${tag} → ${state} ` +
        `(${assembled.text.sentenceCount} sentences, ${result.sectionsWritten} sections, ` +
        `gloss ai:${gloss.filledFromAi} missing:${gloss.stillMissing})${args.dryRun ? ' [dry run]' : ''}`
    );
  }

  console.log(
    `[manifest] Done. ingested=${summary.ingested} (complete=${summary.complete}, partial=${summary.partial}), ` +
      `blocked=${summary.blocked}, missing-source=${summary.missing}, failed=${summary.failed}.`
  );
}

main().catch((err) => {
  console.error('[manifest] Fatal error:', err);
  process.exit(1);
});
