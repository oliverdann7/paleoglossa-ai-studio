/**
 * Source adapter — MorphGNT / Macula Greek.
 *
 * Macula Greek (Clear-Bible) publishes a TSV where every word of the Greek NT
 * carries surface text, trailing punctuation, lemma, normalized form, an
 * English gloss, and full morphology (class + gender/case/number/person/
 * tense/voice/mood). That single source therefore yields a FULLY annotated
 * text — lemma + gloss + POS for every token — with no AI needed, which is
 * exactly what the completeness gate requires.
 *
 * Because every token is known exactly, this adapter builds canonical
 * `TextSection`s directly rather than going through segment()+annotate()
 * (re-tokenising joined text risks positional drift). Sections are grouped by
 * chapter; sentences are grouped by verse.
 *
 * TSV columns (Macula Greek, Nestle1904/TSV/macula-greek.tsv):
 *   xml:id, ref, role, class, type, gloss, text, after, lemma, normalized,
 *   strong, morph, domain, ln, frame, gender, case, number, person, tense,
 *   voice, mood
 */

import type { Sentence, TextSection, Token } from '../types.js';

const MORPH_FEATURE_COLUMNS = [
  'gender',
  'case',
  'number',
  'person',
  'tense',
  'voice',
  'mood',
] as const;

interface MaculaRow {
  ref: string;
  cls: string;
  gloss: string;
  text: string;
  after: string;
  lemma: string;
  normalized: string;
  strong: string;
  morph: string;
  features: Record<string, string>;
}

/** Parse a Macula book code + chapter + verse + word position from a ref. */
function parseRef(ref: string): { book: string; chapter: number; verse: number } | null {
  // e.g. "MAT 1:1!1"  or  "MAT 1:1"
  const m = ref.match(/^([1-3]?[A-Z]{2,3})\s+(\d+):(\d+)/);
  if (!m) return null;
  return { book: m[1], chapter: Number(m[2]), verse: Number(m[3]) };
}

function parseRows(tsv: string): MaculaRow[] {
  const lines = tsv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const header = lines[0].split('\t');
  const col = (name: string) => header.indexOf(name);
  const idx = {
    ref: col('ref'),
    cls: col('class'),
    gloss: col('gloss'),
    text: col('text'),
    after: col('after'),
    lemma: col('lemma'),
    normalized: col('normalized'),
    strong: col('strong'),
    morph: col('morph'),
    features: Object.fromEntries(MORPH_FEATURE_COLUMNS.map((f) => [f, col(f)])),
  };
  const rows: MaculaRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const c = lines[i].split('\t');
    const get = (j: number) => (j >= 0 && j < c.length ? c[j].trim() : '');
    const text = get(idx.text);
    if (!text) continue;
    const features: Record<string, string> = {};
    for (const f of MORPH_FEATURE_COLUMNS) {
      const v = get(idx.features[f]);
      if (v) features[f] = v;
    }
    rows.push({
      ref: get(idx.ref),
      cls: get(idx.cls),
      gloss: get(idx.gloss),
      text,
      after: get(idx.after),
      lemma: get(idx.lemma),
      normalized: get(idx.normalized),
      strong: get(idx.strong),
      morph: get(idx.morph),
      features,
    });
  }
  return rows;
}

function normalize(form: string): string {
  return form
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function buildToken(row: MaculaRow, id: string, first: boolean): Token {
  const morphology = {
    partOfSpeech: row.cls || 'unknown',
    ...row.features,
  } as Token['morphology'] & Record<string, string>;
  if (row.morph) morphology.morph = row.morph;
  if (row.strong) morphology.strong = row.strong;
  return {
    id,
    surface: row.text,
    normalized: row.normalized ? normalize(row.normalized) : normalize(row.text),
    lemma: row.lemma,
    gloss: row.gloss,
    morphology,
    punctBefore: first ? '' : '',
    // Macula `after` is the literal trailing text (space/punct). Default to a
    // single space so words don't run together if `after` is blank.
    punctAfter: row.after === '' ? ' ' : row.after.replace(/\\n/g, ' '),
  };
}

export interface MaculaBuildOptions {
  /** Macula book code, e.g. "MRK" for Mark, "MAT" for Matthew. */
  book: string;
  /** Paleoglossa text id to stamp on every section, e.g. "grc-mark-full". */
  textId: string;
  /** Section id prefix; defaults to textId. Section id = `${prefix}-${chapter}`. */
  sectionPrefix?: string;
}

/**
 * Build fully-annotated chapter sections for one NT book from a Macula TSV.
 * Returns sections in chapter order, with next/previous links wired.
 */
export function buildMaculaSections(tsv: string, opts: MaculaBuildOptions): TextSection[] {
  const prefix = opts.sectionPrefix ?? opts.textId;
  const rows = parseRows(tsv).filter((r) => {
    const ref = parseRef(r.ref);
    return ref?.book === opts.book;
  });

  // Group rows → chapter → verse → tokens
  const chapters = new Map<number, Map<number, MaculaRow[]>>();
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
        tokens: verseRows.map((row, ti) => buildToken(row, `${sentId}-t${ti}`, ti === 0)),
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

  // Wire next/previous links
  for (let i = 0; i < sections.length; i++) {
    if (i > 0) sections[i].previousSectionId = sections[i - 1].id;
    if (i < sections.length - 1) sections[i].nextSectionId = sections[i + 1].id;
  }

  return sections;
}
