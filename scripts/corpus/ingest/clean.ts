/**
 * Junk-token rules shared by the ingest pipeline (segment stage) and the
 * served-corpus maintenance script (`scripts/corpus/clean-served-corpus.ts`).
 *
 * "Junk" is editorial noise that leaked into token streams from raw sources:
 * critical-apparatus sigla (`|`, `+`, `om`, `Qᵐᵍ`), un-decoded escapes
 * (`u+05d0`), section markers (`§`, `¶`), and bare chapter/verse numbers.
 * The 2026-08 served-corpus audit found ~20k such tokens concentrated in the
 * CATSS-derived LXX texts and the Latin Library scrapes.
 *
 * The 2026-11 lemma backfill found three more kinds, all in the Latin Library
 * scrapes: UTF-8 that was decoded as Latin-1 (`canÅ\u008d` for `canō`), section
 * numbers wrapped in brackets (`[12]`, `(18)`), and the site's own page furniture
 * — an all-caps title line fused onto the first sentence of every page, and a
 * footer of English notes and navigation links fused onto the last.
 *
 * Rules are deliberately conservative: a token is junk only when it can never
 * be a real word of the text's language.
 */
import { tokenizeSentence } from '../../../src/data/corpus/helpers/textHelpers.js';

/** Whole token is punctuation/symbols/whitespace. */
const PUNCT_ONLY = /^[\p{P}\p{S}\s]+$/u;

/** Bare chapter/verse/line numbers (`3`, `1:12`, `24.7`). */
const DIGIT_ONLY = /^\d+([.,:;·–—-]\d+)*$/;

/** Punctuation wrapped around a token: `[12]` → `12`, `(18)` → `18`, `24;` → `24`. */
const WRAPPING = /^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu;

/** Verse-line label (`22a`, `23b`) — digits first, so never a word. */
const LINE_LABEL = /^\d+[a-z]$/;

/** Bracketed fragment number (`[F3]`, the Fuldense fragment of Tertullian). */
const FRAGMENT_NUMBER = /^\[[A-Z]\d+\]$/;

/** Un-decoded Unicode escape leaked from a source conversion (`u+05d0`). */
const UNDECODED_ESCAPE = /^u\+[0-9a-f]{3,6}$/i;

/**
 * Primary-script requirement per language. For languages written in a
 * non-Latin script, a token with NO character of that script is apparatus
 * noise (English marginalia, sigla, transliteration fragments) by definition.
 * Latin-script and transliteration-based languages (lat, akk, hit, egy, uga)
 * get no script rule — Latin letters are their real content.
 */
const PRIMARY_SCRIPT: Record<string, RegExp> = {
  grc: /[Ͱ-Ͽἀ-῿]/,
  'grc-koine': /[Ͱ-Ͽἀ-῿]/,
  'grc-class': /[Ͱ-Ͽἀ-῿]/,
  hbo: /[֐-׿]/,
  arc: /[֐-׿]/,
  syr: /[܀-ݏ]/,
  // Coptic uses its own block plus letters from the Greek-and-Coptic block.
  cop: /[Ⲁ-⳿Ͱ-Ͽ]/,
  san: /[ऀ-ॿ]/,
};

export function isJunkToken(surface: string, languageId: string): boolean {
  const s = surface.trim();
  if (!s) return true;
  if (PUNCT_ONLY.test(s)) return true;
  if (DIGIT_ONLY.test(s)) return true;
  const core = s.replace(WRAPPING, '');
  if (DIGIT_ONLY.test(core) || LINE_LABEL.test(core) || FRAGMENT_NUMBER.test(s)) return true;
  if (UNDECODED_ESCAPE.test(s)) return true;
  const script = PRIMARY_SCRIPT[languageId];
  if (script && !script.test(s)) return true;
  return false;
}

// ── Mis-decoded UTF-8 ────────────────────────────────────────────────────────

/**
 * A UTF-8 multi-byte sequence read as Latin-1: a lead byte (`Ã`…) followed by
 * the right number of continuation bytes (U+0080–U+00BF). Real text never has
 * a Latin-1 letter followed by a C1 control, so this does not fire on it.
 */
const MOJIBAKE_SEQUENCE = /[Â-ß][\u0080-¿]|[à-ï][\u0080-¿]{2}|[ð-ô][\u0080-¿]{3}/g;

/** Restore UTF-8 that was decoded as Latin-1 (`canÅ\u008d` → `canō`). Other text is returned as it was. */
export function repairMojibake(s: string): string {
  return s.replace(MOJIBAKE_SEQUENCE, (seq) => {
    const decoded = Buffer.from(seq, 'latin1').toString('utf8');
    return decoded.includes('�') ? seq : decoded;
  });
}

/** `canō` → `cano`. Vowel length only; other diacritics are kept. */
function stripMacrons(s: string): string {
  return s.normalize('NFD').replace(/[̄̆]/g, '').normalize('NFC');
}

const DASH_ONLY = /^[–—]+$/;

/** A verse or note number run onto the end of a word: `me.50`, `vidisti?"58`. */
const GLUED_NUMBER = /^(.*\p{L}.*[.?!;:,"'”’])\d+$/u;

// ── Latin Library page furniture ─────────────────────────────────────────────

const lettersOf = (s: string): string => s.replace(/[^\p{L}]/gu, '');

/** `VERGILI`, `PRIMVS` — two or more letters, none lower-case. */
function isCapsWord(surface: string): boolean {
  const l = lettersOf(surface);
  return l.length >= 2 && l === l.toUpperCase() && l !== l.toLowerCase();
}

/** A praenomen abbreviation. A title may contain one (`P. VERGILI`) but the text may start with one too. */
const PRAENOMEN = /^[ACDKLMNPQST]\.$/;

/** A one-letter book number (`LIBER I`, `LIBER V`). */
const ONE_LETTER_NUMERAL = /^[IVX]\.?$/;

const ROMAN_NUMERAL = /^(?=[IVXLCDM])M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})\.?$/;

/** The words a date numeral sits between: `a. d. VII. Kal. Iunias`. */
const DATE_BEFORE = /^(a\.)?d\.$/i;
const DATE_AFTER = /^(Kal|Non|Id)/;

/**
 * Is sentence `i` a chapter number standing alone (`VIII.`)? The sentence
 * splitter breaks at every full stop, so two other things look the same and
 * are left: a praenomen cut off from its name (`C.` `D.` `L.` `M.`), and the
 * numeral of a date.
 */
function isChapterNumeral(sentences: CleanableSentence[], i: number): boolean {
  if (sentences[i].tokens.length !== 1) return false;
  const surface = sentences[i].tokens[0].surface;
  if (!ROMAN_NUMERAL.test(surface) || PRAENOMEN.test(surface)) return false;
  const before = sentences[i - 1]?.tokens.at(-1)?.surface ?? '';
  const after = sentences[i + 1]?.tokens[0]?.surface ?? '';
  return !DATE_BEFORE.test(before) && !DATE_AFTER.test(after);
}

/** English words that are not also Latin words (so no `in`, `is`, `his`, `an`, `at`, `as`, `here`). */
const ENGLISH_ONLY = new Set([
  'the', 'of', 'and', 'by', 'from', 'with', 'this', 'which', 'may', 'be', 'found', 'was', 'were',
  'there', 'their', 'about', 'into', 'on', 'new', 'based', 'published', 'edition', 'submitted',
  'translation', 'commentary',
]);

const isEnglishWord = (surface: string): boolean => ENGLISH_ONLY.has(surface.replace(WRAPPING, '').toLowerCase());

/** An English note, not Latin: English-only words make up a third of it, or it is a fragment with one. */
function isEnglish(surfaces: string[]): boolean {
  const n = surfaces.filter(isEnglishWord).length;
  return (n >= 2 && n / surfaces.length >= 1 / 3) || (n >= 1 && surfaces.length <= 4);
}

/**
 * Where in a sentence an English note starts, or -1. Usually at its first
 * word, but a closing quote can hide a sentence break from the splitter
 * (`… ibi ego feram.' Submitted by James J.`), so the note is taken to start
 * at the last new sentence before its first English-only word.
 */
function englishStart(surfaces: string[]): number {
  const first = surfaces.findIndex(isEnglishWord);
  if (first < 0) return -1;
  let start = first;
  while (start > 0 && !(/^\p{Lu}/u.test(surfaces[start]) && /[.?!'"”’]$/.test(surfaces[start - 1]))) start--;
  return isEnglish(surfaces.slice(start)) ? start : -1;
}

/** How far from the end of a page its footer can start. */
const FOOTER_WINDOW = 12;

/** The site's footer links, left behind when the nav line itself was dropped at fetch time. */
const FOOTER_AUTHORS = new Set(['Augustine', 'Cicero', 'Jerome', 'Livy', 'Ovid', 'Sallust', 'Tacitus', 'Tertullian', 'Vergil']);
const FOOTER_CATEGORIES = new Set(['Christian', 'Christina', 'Medieval', 'Neo']);

interface CleanableToken {
  surface: string;
  normalized?: string;
  lemma?: string;
  lemmaSource?: string;
  gloss?: string;
  punctAfter?: string;
}
interface CleanableSentence {
  tokens: CleanableToken[];
}
interface CleanableSection {
  sentences: CleanableSentence[];
}

export interface CleanStats {
  tokensRemoved: number;
  sentencesRemoved: number;
  /** Tokens kept but respelled: mis-decoded UTF-8 restored, a glued number cut off. */
  tokensRepaired: number;
}

/** Re-derive what the tokenizer derives from the surface, and drop annotation made from the old spelling. */
function respell(token: CleanableToken, surface: string): void {
  const [fresh] = tokenizeSentence('', surface);
  token.surface = surface;
  token.normalized = fresh.normalized;
  token.punctAfter = fresh.punctAfter;
  if (token.lemma !== undefined) token.lemma = '';
  if (token.gloss !== undefined) token.gloss = '';
  delete token.lemmaSource;
}

/**
 * Restore mis-decoded tokens in place. A Latin text is brought back without
 * its macrons: the damaged lines are the only macronised ones in texts that
 * are otherwise plain, so keeping them would leave two spellings of one word.
 * A dash that was a token of its own goes back to being punctuation.
 */
function repairTokens(sentence: CleanableSentence, languageId: string, stats: CleanStats): void {
  const kept: CleanableToken[] = [];
  for (const token of sentence.tokens) {
    let surface = repairMojibake(token.surface);
    if (surface !== token.surface && languageId === 'lat') surface = stripMacrons(surface);
    if (languageId === 'lat') surface = surface.replace(GLUED_NUMBER, '$1');
    if (surface === token.surface) {
      kept.push(token);
      continue;
    }
    const previous = kept[kept.length - 1];
    if (DASH_ONLY.test(surface) && previous) {
      previous.punctAfter = `${(previous.punctAfter ?? '').trimEnd()} ${surface} `;
      stats.tokensRemoved++;
      continue;
    }
    respell(token, surface);
    stats.tokensRepaired++;
    kept.push(token);
  }
  sentence.tokens = kept;
}

/**
 * Drop the title line at the top of a page: the leading run of all-caps words
 * (`P. VERGILI MARONIS AENEIDOS LIBER PRIMVS`), which the fetcher fused onto
 * the first sentence. Needs two full caps words, so a text that merely opens
 * with a praenomen or an acronym is untouched.
 */
function stripTitle(section: CleanableSection, stats: CleanStats): void {
  const run: Array<{ sentence: CleanableSentence; token: CleanableToken }> = [];
  scan: for (const sentence of section.sentences) {
    for (const token of sentence.tokens) {
      const s = token.surface;
      if (!isCapsWord(s) && !PRAENOMEN.test(s) && !ONE_LETTER_NUMERAL.test(s)) break scan;
      run.push({ sentence, token });
    }
  }
  // A trailing praenomen belongs to the text: `… LIBER QVARTVS` | `C. Asinio C. Antistio consulibus`.
  while (run.length > 0 && PRAENOMEN.test(run[run.length - 1].token.surface)) run.pop();
  if (run.filter(({ token }) => lettersOf(token.surface).length >= 3).length < 2) return;
  const title = new Set(run.map(({ token }) => token));
  for (const sentence of new Set(run.map((r) => r.sentence))) {
    sentence.tokens = sentence.tokens.filter((t) => !title.has(t));
  }
  stats.tokensRemoved += run.length;
}

/**
 * Drop the footer at the bottom of a page: English notes about the edition
 * (`Submitted by … from his new edition.`), then the navigation links
 * (`Augustine`, `Christian Latin`), then a closing `FINIS`.
 */
function stripFooter(section: CleanableSection, stats: CleanStats): void {
  const { sentences } = section;

  // 1. English notes run from where they start to the end of the page.
  for (let i = Math.max(0, sentences.length - FOOTER_WINDOW); i < sentences.length; i++) {
    const start = englishStart(sentences[i].tokens.map((t) => t.surface));
    if (start < 0) continue;
    for (let k = i; k < sentences.length; k++) {
      const from = k === i ? start : 0;
      stats.tokensRemoved += sentences[k].tokens.length - from;
      sentences[k].tokens.length = from;
    }
    break;
  }

  // 2. Navigation links at the very end: [St.] Author | The Bible, then Category Latin.
  const tail = sentences.flatMap((sentence) => sentence.tokens.map((token) => ({ sentence, token })));
  const at = (fromEnd: number): string => tail[tail.length - fromEnd]?.token.surface ?? '';
  let crumb = 0;
  if (at(1) === 'Latin' && FOOTER_CATEGORIES.has(at(2))) crumb = 2;
  if (FOOTER_AUTHORS.has(at(crumb + 1))) crumb += at(crumb + 2) === 'St.' ? 2 : 1;
  else if (at(crumb + 2) === 'The' && at(crumb + 1) === 'Bible') crumb += 2;
  // `Cicero` and `Tacitus` are Latin words too: alone, a name is a link only as a sentence of its own.
  if (crumb === 1) {
    const { sentence, token } = tail[tail.length - 1];
    const before = sentence.tokens[sentence.tokens.indexOf(token) - 1];
    if (before && !/[.?!'"”’]$/.test(before.surface)) crumb = 0;
  }
  for (const { sentence, token } of tail.slice(tail.length - crumb)) {
    sentence.tokens.splice(sentence.tokens.indexOf(token), 1);
  }
  stats.tokensRemoved += crumb;
  const last = (): CleanableSentence | undefined => {
    for (let i = sentences.length - 1; i >= 0; i--) if (sentences[i].tokens.length > 0) return sentences[i];
    return undefined;
  };

  // 3. A closing line in capitals.
  const end = last();
  if (end && end.tokens.every((t) => isCapsWord(t.surface))) {
    stats.tokensRemoved += end.tokens.length;
    end.tokens = [];
  }
}

/**
 * Clean sections in place: restore mis-decoded text, remove junk tokens and
 * page furniture, and drop the sentences left empty. Returns what changed so
 * callers can log/resync counts.
 */
export function cleanSections(sections: CleanableSection[], languageId: string): CleanStats {
  const stats: CleanStats = { tokensRemoved: 0, sentencesRemoved: 0, tokensRepaired: 0 };
  for (const section of sections) {
    for (const sentence of section.sentences) {
      repairTokens(sentence, languageId, stats);
      const kept = sentence.tokens.filter((t) => !isJunkToken(t.surface, languageId));
      stats.tokensRemoved += sentence.tokens.length - kept.length;
      sentence.tokens = kept;
    }
    if (languageId === 'lat') {
      stripTitle(section, stats);
      stripFooter(section, stats);
      const chapterNumerals = section.sentences.filter((_, i) => isChapterNumeral(section.sentences, i));
      for (const sentence of section.sentences) {
        const kept = chapterNumerals.includes(sentence) ? [] : sentence.tokens.filter((t) => !isEnglishWord(t.surface));
        stats.tokensRemoved += sentence.tokens.length - kept.length;
        sentence.tokens = kept;
      }
    }
    const keptSentences = section.sentences.filter((s) => s.tokens.length > 0);
    stats.sentencesRemoved += section.sentences.length - keptSentences.length;
    section.sentences = keptSentences;
  }
  return stats;
}
