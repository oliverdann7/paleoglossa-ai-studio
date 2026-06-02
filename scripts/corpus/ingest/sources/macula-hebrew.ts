/**
 * Source adapter — Macula Hebrew (Clear Bible) / OSHB.
 *
 * Macula Hebrew publishes the Hebrew Bible (Westminster Leningrad Codex) as a
 * TSV where every word carries surface text, lemma, an English gloss, and full
 * morphology. Like the Greek adapter, that single source yields a FULLY
 * annotated text — lemma + gloss + POS for every token — with no AI needed,
 * which is exactly what the completeness gate requires.
 *
 * It also covers the Biblical Aramaic portions (Daniel 2–7, Ezra 4–7); ingest
 * those with `--language arc` and the relevant book code.
 *
 * Hebrew Macula TSV column names have varied across releases, so this adapter is
 * HEADER-DRIVEN: each logical field is resolved from the first matching column
 * name present in the header row (see FIELD_ALIASES). This keeps the adapter
 * working across the WLC/OSHB TSV variants without hard-coding one layout.
 *
 * Like sources/macula.ts, sections are grouped by chapter and sentences by
 * verse, and canonical `TextSection`s are built directly (no re-tokenisation).
 */

import type { Sentence, TextSection, Token } from '../types.js';

/** Logical field → candidate TSV column names, in priority order. */
const FIELD_ALIASES = {
  ref: ['ref', 'xml:id', 'id'],
  text: ['text', 'word', 'surface'],
  after: ['after', 'trailer'],
  lemma: ['lemma', 'lemmas'],
  gloss: ['gloss', 'english', 'gloss_en', 'meaning'],
  pos: ['class', 'pos', 'partofspeech', 'cat'],
  transliteration: ['transliteration', 'translit', 'romanization'],
  strong: ['strong', 'strongs', 'strongnumberx', 'strongnumber'],
  morph: ['morph', 'morphology', 'analysis'],
} as const;

/** Morphology feature columns to copy through when present. */
const MORPH_FEATURE_COLUMNS = [
  'person',
  'gender',
  'number',
  'state',
  'tense',
  'stem',
  'verbType',
  'verbtype',
  'binyan',
  'aspect',
  'conjugation',
] as const;

type LogicalField = keyof typeof FIELD_ALIASES;

interface HebrewRow {
  ref: string;
  text: string;
  after: string;
  lemma: string;
  gloss: string;
  pos: string;
  transliteration: string;
  strong: string;
  morph: string;
  features: Record<string, string>;
}

/** Parse a book code + chapter + verse from a ref like "GEN 1:1!1". */
function parseRef(ref: string): { book: string; chapter: number; verse: number } | null {
  const m = ref.match(/^([1-3]?[A-Z]{2,3})\s+(\d+):(\d+)/);
  if (!m) return null;
  return { book: m[1], chapter: Number(m[2]), verse: Number(m[3]) };
}

function resolveColumns(header: string[]): Record<LogicalField, number> & { features: Record<string, number> } {
  const lower = header.map((h) => h.trim().toLowerCase());
  const find = (candidates: readonly string[]) => {
    for (const c of candidates) {
      const i = lower.indexOf(c.toLowerCase());
      if (i >= 0) return i;
    }
    return -1;
  };
  const cols = {} as Record<LogicalField, number> & { features: Record<string, number> };
  (Object.keys(FIELD_ALIASES) as LogicalField[]).forEach((field) => {
    cols[field] = find(FIELD_ALIASES[field]);
  });
  cols.features = {};
  for (const f of MORPH_FEATURE_COLUMNS) {
    const i = lower.indexOf(f.toLowerCase());
    if (i >= 0) cols.features[f] = i;
  }
  return cols;
}

function parseRows(tsv: string): HebrewRow[] {
  const lines = tsv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines[0].split('\t');
  const cols = resolveColumns(header);
  const rows: HebrewRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const c = lines[i].split('\t');
    const get = (j: number) => (j >= 0 && j < c.length ? c[j].trim() : '');
    const text = get(cols.text);
    if (!text) continue;
    const features: Record<string, string> = {};
    for (const [name, j] of Object.entries(cols.features)) {
      const v = get(j);
      if (v) features[name.toLowerCase()] = v;
    }
    rows.push({
      ref: get(cols.ref),
      text,
      after: get(cols.after),
      lemma: get(cols.lemma),
      gloss: get(cols.gloss),
      pos: get(cols.pos),
      transliteration: get(cols.transliteration),
      strong: get(cols.strong),
      morph: get(cols.morph),
      features,
    });
  }
  return rows;
}

/** Hebrew/Aramaic normalization: strip cantillation + vowel points for matching. */
function normalize(form: string): string {
  return form
    .normalize('NFD')
    .replace(/[֑-ׇ]/g, '') // Hebrew accents, points, marks
    .replace(/[̀-ͯ]/g, '') // generic combining marks (transliteration)
    .toLowerCase();
}

function buildToken(row: HebrewRow, id: string): Token {
  const morphology = {
    partOfSpeech: row.pos || 'unknown',
    ...row.features,
  } as Token['morphology'] & Record<string, string>;
  if (row.morph) morphology.morph = row.morph;
  if (row.strong) morphology.strong = row.strong;
  return {
    id,
    surface: row.text,
    normalized: normalize(row.text),
    lemma: row.lemma,
    gloss: row.gloss,
    transliteration: row.transliteration || undefined,
    morphology,
    punctBefore: '',
    punctAfter: row.after === '' ? ' ' : row.after.replace(/\\n/g, ' '),
  };
}

export interface MaculaHebrewBuildOptions {
  /** Macula Hebrew book code, e.g. "GEN", "PSA", "DAN". */
  book: string;
  /** Paleoglossa text id stamped on every section, e.g. "hbo-genesis-full". */
  textId: string;
  /** Section id prefix; defaults to textId. Section id = `${prefix}-${chapter}`. */
  sectionPrefix?: string;
}

/**
 * Build fully-annotated chapter sections for one book from a Macula Hebrew TSV.
 * Returns sections in chapter order with next/previous links wired.
 */
export function buildMaculaHebrewSections(tsv: string, opts: MaculaHebrewBuildOptions): TextSection[] {
  const prefix = opts.sectionPrefix ?? opts.textId;
  const rows = parseRows(tsv).filter((r) => parseRef(r.ref)?.book === opts.book);

  const chapters = new Map<number, Map<number, HebrewRow[]>>();
  for (const r of rows) {
    const ref = parseRef(r.ref)!;
    if (!chapters.has(ref.chapter)) chapters.set(ref.chapter, new Map());
    const verses = chapters.get(ref.chapter)!;
    if (!verses.has(ref.verse)) verses.set(ref.verse, []);
    verses.get(ref.verse)!.push(r);
  }

  const chapterNums = [...chapters.keys()].sort((a, b) => a - b);
  const sections: TextSection[] = chapterNums.map((chapterNum, ci) => {
    const verses = chapters.get(chapterNum)!;
    const verseNums = [...verses.keys()].sort((a, b) => a - b);
    const sentences: Sentence[] = verseNums.map((verseNum) => {
      const verseRows = verses.get(verseNum)!;
      const sentId = `${opts.book}-${chapterNum}-${verseNum}`;
      return {
        id: sentId,
        tokens: verseRows.map((row, ti) => buildToken(row, `${sentId}-t${ti}`)),
      };
    });
    return {
      id: `${prefix}-${chapterNum}`,
      textId: opts.textId,
      sequence: ci + 1,
      label: `${opts.book} ${chapterNum}`,
      sentences,
    };
  });

  for (let i = 0; i < sections.length; i++) {
    if (i > 0) sections[i].previousSectionId = sections[i - 1].id;
    if (i < sections.length - 1) sections[i].nextSectionId = sections[i + 1].id;
  }

  return sections;
}
