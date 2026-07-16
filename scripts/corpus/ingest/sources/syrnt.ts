/**
 * Source adapter — SyrNT (Peshitta New Testament with SEDRA morphology).
 *
 * The SyrNT dataset (github.com/PatristicTextArchive/syrnt, MIT; a SEDRA
 * database export by George A. Kiraz and James W. Bennett) carries the whole
 * Peshitta NT — all 27 books, 7957 verses — with a full morphological
 * annotation on every word: lexeme (lemma), root, prefix/suffix, verbal
 * conjugation (peal/pael/aphel…), aspect, state, number, person, gender, and
 * grammatical category. That yields lemma + POS + rich morphology for every
 * token with no AI; only the English gloss layer is absent (SEDRA's English
 * meanings are non-commercial and are NOT used), so books assemble `partial`
 * (morphology-complete, glosses via dictionary cache / the app's on-click AI).
 *
 * Source format (`source/0.1/all-ordered.txt`): one line per verse, in
 * canonical book/chapter/verse order (the {@link SYRNT_BOOKS} table); words
 * separated by spaces; each word is `SURFACE|a0#a1#…#a22` where a0–a4 are
 * transliterated strings (stem, lexeme, root, prefix, suffix) and a5–a22 are
 * numeric feature codes. Text is in the SEDRA ASCII transliteration, converted
 * here to Syriac script.
 */

import type { Sentence, TextSection, Token } from '../types.js';

// ─── SEDRA transliteration → Syriac script ──────────────────────────────────

const TO_SYRIAC: Record<string, string> = {
  A: 'ܐ', B: 'ܒ', G: 'ܓ', D: 'ܕ', H: 'ܗ', O: 'ܘ', Z: 'ܙ', K: 'ܚ',
  Y: 'ܛ', ';': 'ܝ', C: 'ܟ', L: 'ܠ', M: 'ܡ', N: 'ܢ', S: 'ܣ', E: 'ܥ',
  I: 'ܦ', '/': 'ܨ', X: 'ܩ', R: 'ܪ', W: 'ܫ', T: 'ܬ',
};

/** Convert a SEDRA-transliterated form to Syriac script ('' stays ''). */
export function toSyriacScript(translit: string): string {
  let out = '';
  for (const ch of translit) {
    if (ch === ',') continue; // vowel/diacritic marker — dropped, as upstream
    out += TO_SYRIAC[ch] ?? ch; // '-' in compound names passes through
  }
  return out;
}

// ─── Canonical book order (verses per chapter) ───────────────────────────────
// Mirrors the SyrNT constants table; `all-ordered.txt` lines follow it exactly.

export interface SyrntBook {
  /** Book code used by manifest entries, e.g. "Matt". */
  code: string;
  /** English display name, e.g. "Matthew". */
  name: string;
  /** Verses per chapter, in order. */
  chapters: readonly number[];
}

export const SYRNT_BOOKS: readonly SyrntBook[] = [
  { code: 'Matt', name: 'Matthew', chapters: [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20] },
  { code: 'Mark', name: 'Mark', chapters: [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20] },
  { code: 'Luke', name: 'Luke', chapters: [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53] },
  { code: 'John', name: 'John', chapters: [51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25] },
  { code: 'Acts', name: 'Acts', chapters: [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31] },
  { code: 'Rom', name: 'Romans', chapters: [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 27] },
  { code: '1Cor', name: '1 Corinthians', chapters: [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40, 58, 24] },
  { code: '2Cor', name: '2 Corinthians', chapters: [24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14] },
  { code: 'Gal', name: 'Galatians', chapters: [24, 21, 29, 31, 26, 18] },
  { code: 'Eph', name: 'Ephesians', chapters: [23, 22, 21, 32, 33, 24] },
  { code: 'Phil', name: 'Philippians', chapters: [30, 30, 21, 23] },
  { code: 'Col', name: 'Colossians', chapters: [29, 23, 25, 18] },
  { code: '1Thess', name: '1 Thessalonians', chapters: [10, 20, 13, 18, 28] },
  { code: '2Thess', name: '2 Thessalonians', chapters: [12, 17, 18] },
  { code: '1Tim', name: '1 Timothy', chapters: [20, 15, 16, 16, 25, 21] },
  { code: '2Tim', name: '2 Timothy', chapters: [18, 26, 17, 22] },
  { code: 'Titus', name: 'Titus', chapters: [16, 15, 15] },
  { code: 'Phlm', name: 'Philemon', chapters: [25] },
  { code: 'Heb', name: 'Hebrews', chapters: [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25] },
  { code: 'James', name: 'James', chapters: [27, 26, 18, 17, 20] },
  { code: '1Peter', name: '1 Peter', chapters: [25, 25, 22, 19, 14] },
  { code: '2Peter', name: '2 Peter', chapters: [21, 22, 18] },
  { code: '1John', name: '1 John', chapters: [10, 29, 24, 21, 21] },
  { code: '2John', name: '2 John', chapters: [13] },
  { code: '3John', name: '3 John', chapters: [15] },
  { code: 'Jude', name: 'Jude', chapters: [25] },
  { code: 'Rev', name: 'Revelation', chapters: [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 20] },
];

// ─── Numeric feature-code tables (SyrNT annotation spec) ─────────────────────

const VS = ['', 'peal', 'ethpeal', 'pael', 'ethpael', 'aphel', 'ettaphal', 'shaphel', 'eshtaphal', 'saphel', 'estaphal', 'pauel', 'ethpaual', 'paiel', 'ethpaial', 'palpal', 'ethpalpal', 'palpel', 'ethpalpal2', 'pamel', 'ethpamel', 'parel', 'ethparal', 'pali', 'ethpali', 'pahli', 'ethpahli', 'taphel', 'ethaphal'];
const VT = ['', 'perfect', 'imperfect', 'imperative', 'infinitive', 'participle'];
const ST = ['', 'absolute', 'construct', 'emphatic'];
const NU = ['', 'singular', 'plural'];
const PS = ['', 'first', 'second', 'third'];
const GN = ['', 'common', 'masculine', 'feminine'];
const PRTYP = ['', 'personal', 'demonstrative', 'interrogative'];
const NTYP = ['', 'proper', 'common'];
const NMTYP = ['', 'cardinal', 'ordinal', 'cipher'];
const PTCTYP = ['', 'active', 'passive'];
const SP = ['verb', 'participle', 'noun', 'pronoun', 'numeral', 'adjective', 'particle', 'adverb', 'idiom'];
const SFGN = ['', 'masculine', 'feminine'];
const SFPS = ['', 'first', 'second', 'third'];
const SFNU = ['', 'plural'];

interface SyrntWord {
  surface: string; // Syriac script
  lemma: string; // Syriac script
  root: string; // Syriac script
  morphology: Token['morphology'] & Record<string, string>;
}

/** Decode one `SURFACE|stem#lexeme#root#prefix#suffix#<codes…>` word. */
function parseWord(raw: string): SyrntWord | null {
  const bar = raw.indexOf('|');
  if (bar < 0) return null;
  const surfaceTr = raw.slice(0, bar);
  const a = raw.slice(bar + 1).split('#');
  if (a.length < 23) return null;
  const n = (i: number) => Number(a[i]) || 0;

  const pos = SP[n(17)] ?? 'unknown';
  const lemma = toSyriacScript(a[1]);
  const root = toSyriacScript(a[2]);
  const prefix = toSyriacScript(a[3]);
  const suffix = toSyriacScript(a[4]);

  const morphology = { partOfSpeech: pos } as SyrntWord['morphology'];
  if (root) morphology.root = root;
  const stem = VS[n(6)];
  if (stem) morphology.stem = stem;
  const tense = VT[n(7)];
  if (tense) morphology.tense = tense;
  const state = ST[n(8)];
  if (state) morphology.state = state;
  const number = NU[n(9)];
  if (number) morphology.number = number;
  const person = PS[n(10)];
  if (person) morphology.person = person;
  const gender = GN[n(11)];
  if (gender) morphology.gender = gender;
  // Participle voice (active/passive) surfaces in the generic `voice` slot.
  const voice = PTCTYP[n(16)];
  if (voice) morphology.voice = voice;
  const pronounType = PRTYP[n(12)];
  if (pronounType) morphology.pronounType = pronounType;
  const nounType = NTYP[n(14)];
  if (nounType) morphology.nounType = nounType;
  const numeralType = NMTYP[n(15)];
  if (numeralType) morphology.numeralType = numeralType;
  if (prefix) morphology.prefix = prefix;
  if (suffix) {
    morphology.suffix = suffix;
    const sfgn = SFGN[n(19)];
    if (sfgn) morphology.suffixGender = sfgn;
    const sfps = SFPS[n(20)];
    if (sfps) morphology.suffixPerson = sfps;
    morphology.suffixNumber = SFNU[n(21)] || 'singular';
  }

  return { surface: toSyriacScript(surfaceTr), lemma, root, morphology };
}

export interface SyrntBuildOptions {
  /** SyrNT book code, e.g. "Matt". */
  book: string;
  /** Paleoglossa text id to stamp on every section, e.g. "syr-peshitta-matthew-full". */
  textId: string;
  /** Section id prefix; defaults to textId. Section id = `${prefix}-${chapter}`. */
  sectionPrefix?: string;
}

/**
 * Build morphology-annotated chapter sections for one Peshitta book from the
 * SyrNT `all-ordered.txt` export. Sections are chapters; sentences are verses.
 */
export function buildSyrntSections(raw: string, opts: SyrntBuildOptions): TextSection[] {
  const bookIdx = SYRNT_BOOKS.findIndex((b) => b.code === opts.book);
  if (bookIdx < 0) throw new Error(`Unknown SyrNT book code "${opts.book}"`);
  const book = SYRNT_BOOKS[bookIdx];
  const prefix = opts.sectionPrefix ?? opts.textId;

  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const expectedTotal = SYRNT_BOOKS.reduce((s, b) => s + b.chapters.reduce((x, c) => x + c, 0), 0);
  if (lines.length !== expectedTotal) {
    throw new Error(
      `SyrNT source has ${lines.length} verse lines; expected ${expectedTotal}. ` +
        'The canonical book table no longer matches the data.'
    );
  }

  let offset = 0;
  for (let i = 0; i < bookIdx; i++) {
    offset += SYRNT_BOOKS[i].chapters.reduce((s, c) => s + c, 0);
  }

  const sections: TextSection[] = book.chapters.map((verseCount, ci) => {
    const chapterNum = ci + 1;
    const sentences: Sentence[] = [];
    for (let v = 1; v <= verseCount; v++) {
      const line = lines[offset++];
      const sentId = `${book.code}-${chapterNum}-${v}`;
      const tokens: Token[] = [];
      for (const rawWord of line.split(/\s+/)) {
        if (!rawWord) continue;
        const word = parseWord(rawWord);
        if (!word) continue;
        tokens.push({
          id: `${sentId}-t${tokens.length}`,
          surface: word.surface,
          normalized: word.surface,
          lemma: word.lemma,
          root: word.root || undefined,
          gloss: '',
          morphology: word.morphology,
          punctBefore: '',
          punctAfter: ' ',
        });
      }
      sentences.push({ id: sentId, tokens });
    }
    return {
      id: `${prefix}-${chapterNum}`,
      textId: opts.textId,
      sequence: chapterNum,
      label: `${book.name} ${chapterNum}`,
      sentences,
    };
  });

  for (let i = 0; i < sections.length; i++) {
    if (i > 0) sections[i].previousSectionId = sections[i - 1].id;
    if (i < sections.length - 1) sections[i].nextSectionId = sections[i + 1].id;
  }

  return sections;
}
