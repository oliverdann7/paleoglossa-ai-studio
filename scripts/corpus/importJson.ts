/**
 * Bulk-import a JSON corpus manifest into a Paleoglossa TypeScript section
 * module. The manifest describes one or more TextSections with raw source
 * text (and optional per-token lemma/gloss overrides); the importer
 * tokenizes at build time so the emitted module is plain static data.
 *
 * Design rationale:
 *   - For the upcoming "huge" corpus ingestion, hand-authoring TS modules
 *     does not scale. JSON manifests are easier to generate from external
 *     sources (CSV, scrapers, treebanks).
 *   - We emit static TS rather than loading JSON at runtime so the existing
 *     CorpusDB synchronous lookup path keeps working unchanged.
 *   - Tokenization is delegated to the existing `tokenizeSentence` helper
 *     so generated modules match the format of hand-authored ones.
 */

import type { Sentence, TextSection } from '../../src/types/corpus.js';
import { tokenizeSentence } from '../../src/data/corpus/helpers/textHelpers.js';

export interface CorpusImportTokenOverride {
  /** Surface form as it appears in `src`. Must match exactly (after punctuation strip). */
  surface: string;
  lemma?: string;
  gloss?: string;
  transliteration?: string;
  /** Optional morphology bag merged into the generated token. */
  morphology?: Record<string, string>;
}

export interface CorpusImportSentence {
  /** Stable id, e.g. "Jn-1-1". */
  id: string;
  /** Raw source string; will be word-split and tokenized. */
  src: string;
  /** Optional translation (English or target language). */
  translation?: string;
  /** Optional per-word overrides for lemma/gloss/morphology, keyed by surface. */
  tokens?: CorpusImportTokenOverride[];
}

export interface CorpusImportSection {
  /** Section id, e.g. "Jn-1-1". */
  id: string;
  /** Section sequence number within the parent text. */
  sequence: number;
  /** Human-readable label, e.g. "John 1:1-18". */
  label: string;
  sentences: CorpusImportSentence[];
  nextSectionId?: string;
  previousSectionId?: string;
}

export interface CorpusImportManifest {
  /** Schema version; must be 1 for now. */
  schemaVersion: 1;
  /** Parent text id, e.g. "TEXT_JOHN_FULL". */
  textId: string;
  /** Language code, only used by emit() to set Token defaults. */
  language: string;
  sections: CorpusImportSection[];
}

export class CorpusImportError extends Error {
  constructor(message: string, public readonly path: string) {
    super(`[corpus-import] ${path}: ${message}`);
    this.name = 'CorpusImportError';
  }
}

/**
 * Validates a parsed manifest against the schema. Throws CorpusImportError
 * on the first failure so the caller can stop and surface a useful message.
 */
export function validateManifest(input: unknown, path = '$'): CorpusImportManifest {
  if (!input || typeof input !== 'object') {
    throw new CorpusImportError('manifest must be an object', path);
  }
  const m = input as Record<string, unknown>;
  if (m.schemaVersion !== 1) {
    throw new CorpusImportError(`schemaVersion must be 1 (got ${String(m.schemaVersion)})`, path);
  }
  if (typeof m.textId !== 'string' || !m.textId) {
    throw new CorpusImportError('textId must be a non-empty string', path);
  }
  if (typeof m.language !== 'string' || !m.language) {
    throw new CorpusImportError('language must be a non-empty string', path);
  }
  if (!Array.isArray(m.sections) || m.sections.length === 0) {
    throw new CorpusImportError('sections must be a non-empty array', path);
  }
  const seenSectionIds = new Set<string>();
  m.sections.forEach((s, i) => {
    const p = `${path}.sections[${i}]`;
    if (!s || typeof s !== 'object') throw new CorpusImportError('section must be an object', p);
    const sec = s as Record<string, unknown>;
    if (typeof sec.id !== 'string' || !sec.id) throw new CorpusImportError('id required', p);
    if (seenSectionIds.has(sec.id)) throw new CorpusImportError(`duplicate section id "${sec.id}"`, p);
    seenSectionIds.add(sec.id);
    if (typeof sec.sequence !== 'number') throw new CorpusImportError('sequence must be a number', p);
    if (typeof sec.label !== 'string' || !sec.label) throw new CorpusImportError('label required', p);
    if (!Array.isArray(sec.sentences) || sec.sentences.length === 0) {
      throw new CorpusImportError('sentences must be a non-empty array', p);
    }
    const seenSentenceIds = new Set<string>();
    sec.sentences.forEach((snt, j) => {
      const sp = `${p}.sentences[${j}]`;
      if (!snt || typeof snt !== 'object') throw new CorpusImportError('sentence must be an object', sp);
      const sn = snt as Record<string, unknown>;
      if (typeof sn.id !== 'string' || !sn.id) throw new CorpusImportError('id required', sp);
      if (seenSentenceIds.has(sn.id)) throw new CorpusImportError(`duplicate sentence id "${sn.id}"`, sp);
      seenSentenceIds.add(sn.id);
      if (typeof sn.src !== 'string' || !sn.src.trim()) {
        throw new CorpusImportError('src must be a non-empty string', sp);
      }
    });
  });
  return input as CorpusImportManifest;
}

/**
 * Tokenizes a single import sentence using the project's standard helper,
 * applying per-token lemma/gloss/morphology overrides.
 */
export function buildSentence(input: CorpusImportSentence): Sentence {
  const overrideMap: Record<string, { lemma: string; gloss: string; transliteration?: string }> = {};
  for (const t of input.tokens ?? []) {
    overrideMap[t.surface] = {
      lemma: t.lemma ?? '',
      gloss: t.gloss ?? '',
      transliteration: t.transliteration,
    };
  }
  const morphologyBySurface: Record<string, Record<string, string>> = {};
  for (const t of input.tokens ?? []) {
    if (t.morphology) morphologyBySurface[t.surface] = t.morphology;
  }
  const tokens = tokenizeSentence(input.id, input.src, overrideMap).map((tok) => {
    const surface = tok.surface.replace(
      /^[\s!@#$%^&*()\-_=+[\]{}|;:',.<>?/~`"«»‹›]+|[\s!@#$%^&*()\-_=+[\]{}|;:',.<>?/~`"«»‹›]+$/g,
      ''
    );
    const raw = morphologyBySurface[surface];
    const morph = raw
      ? { partOfSpeech: raw.partOfSpeech ?? 'unknown', ...raw }
      : { partOfSpeech: 'unknown' };
    return {
      id: tok.id,
      surface: tok.surface,
      normalized: tok.normalized,
      lemma: tok.lemma,
      gloss: tok.gloss,
      morphology: morph,
      transliteration: tok.transliteration,
      punctBefore: tok.punctBefore,
      punctAfter: tok.punctAfter,
    };
  });
  return { id: input.id, tokens, translation: input.translation };
}

export function buildSection(input: CorpusImportSection, textId: string): TextSection {
  return {
    id: input.id,
    textId,
    sequence: input.sequence,
    label: input.label,
    sentences: input.sentences.map(buildSentence),
    nextSectionId: input.nextSectionId,
    previousSectionId: input.previousSectionId,
  };
}

/**
 * Renders a TS module string that exports each section as a top-level
 * `export const SECTION_<UPPER> = {...}` plus an `ALL_<TEXT>_SECTIONS`
 * array. The module imports the `TextSection` type so generated files
 * stay type-checked.
 */
export function renderModule(manifest: CorpusImportManifest): string {
  const sections = manifest.sections.map((s) => buildSection(s, manifest.textId));
  const sectionConstName = (id: string) =>
    'SECTION_' + id.replace(/[^a-zA-Z0-9]/g, '_').toUpperCase();
  const lines: string[] = [
    '// AUTO-GENERATED by scripts/corpus/importJson.ts — do not edit by hand.',
    `// Source: textId=${manifest.textId}, language=${manifest.language}`,
    `import type { TextSection } from '../../../types/corpus.js';`,
    '',
  ];
  for (const sec of sections) {
    const name = sectionConstName(sec.id);
    lines.push(`export const ${name}: TextSection = ${JSON.stringify(sec, null, 2)};`);
    lines.push('');
  }
  const arrayName = manifest.textId.toUpperCase().replace(/[^A-Z0-9]/g, '_') + '_SECTIONS';
  lines.push(
    `export const ${arrayName}: TextSection[] = [`,
    ...sections.map((s) => `  ${sectionConstName(s.id)},`),
    '];',
    ''
  );
  return lines.join('\n');
}
