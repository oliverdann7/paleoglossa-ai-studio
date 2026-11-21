/**
 * Vocabulary identity — the single definition of "which lexeme is this?".
 *
 * A vocabulary item is identified by (languageId, normalized lemma). The same
 * pair produces:
 *   - `vocabKey`   → the in-memory KnowledgeMap key
 *   - `vocabDocId` → the Firestore `users/{uid}/vocabulary/{id}` document ID
 *
 * Both are derived here so memory, Firestore sync, review scheduling and
 * statistics can never disagree about identity.
 *
 * Normalization is language-dependent and deliberately conservative: the
 * served corpus is not consistently accented (Koine lemmas appear as both
 * `καί` and `και`), so Greek keys stay accent-insensitive and only curated
 * homographs (`εἰς`/`εἷς`, `εἰμί`/`εἶμι`, …) are told apart. See
 * `docs/vocabulary-identity.md` for the measurements behind each rule.
 *
 * Pure module: no Firebase, no React. Safe to import from `api/`.
 */

export const UNKNOWN_LANGUAGE = 'unknown';

/** Combining Diacritical Marks block (accents, breathings, macrons, …). */
const COMBINING_MARKS = /[̀-ͯ]/g;
/** Hebrew cantillation (te'amim), meteg and rafe — never lexical. Niqqud is kept. */
const HEBREW_NON_LEXICAL = /[֑-ֽֿ֯]/g;
/** Greek editorial vowel-length marks (macron, breve). */
const GREEK_LENGTH_MARKS = /[̄̆]/g;
const EDGE_NOISE = /^[\p{P}\p{S}\s]+|[\p{P}\p{S}\s]+$/gu;

/**
 * Languages stored in scholarly transliteration, where diacritics are
 * phonemic (Egyptian h / ḥ / ḫ / ẖ are four consonants; Akkadian s / ṣ / š
 * are three). Stripping marks merges unrelated lexemes, so they are kept.
 */
const DIACRITIC_PRESERVING = new Set(['akk', 'hit', 'uga', 'egy', 'san']);
const GREEK = new Set(['grc', 'grc-koine']);
const HEBREW_SCRIPT = new Set(['hbo', 'arc']);

/**
 * The pre-v2 key: NFD, strip combining marks, lowercase, trim.
 * Still the base "skeleton" for most languages; kept exported because
 * non-vocabulary callers (search, dictionaries) match on it.
 */
export function legacyLemmaKey(lemma: string): string {
  return String(lemma ?? '')
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .trim();
}

/** Trim surrounding punctuation/symbols and collapse internal whitespace. */
function tidy(value: string): string {
  const stripped = value.replace(EDGE_NOISE, '');
  // A term that is nothing but punctuation keeps its original form.
  return (stripped || value.trim()).replace(/\s+/g, ' ');
}

/** Canonical fully-accented Greek form: grave→acute, length marks dropped. */
function greekFullForm(lemma: string): string {
  return tidy(
    lemma.normalize('NFD').replace(/̀/g, '́').replace(GREEK_LENGTH_MARKS, '').toLowerCase()
  ).normalize('NFC');
}

/**
 * Greek lemmas that differ from a more common lemma only by diacritics.
 * Each entry gets its own key; the commoner partner (in the comment) keeps
 * the accent-insensitive key, so unaccented corpus lemmas and all existing
 * user data resolve to the commoner word. Extend freely — adding an entry
 * only ever splits a key, and the split is handled by the identity repair.
 */
const GREEK_DISTINCT_HOMOGRAPHS: ReadonlySet<string> = new Set(
  [
    'εἷς', // one            ≠ εἰς (into)
    'εἶμι', // I shall go    ≠ εἰμί (I am)
    'ἦ', // truly            ≠ ἤ (or)
    'ᾗ', // in which way     ≠ ἤ (or)
    'οὗ', // where           ≠ οὐ (not)
    'τίς', // who?           ≠ τις (someone)
    'ἆρα', // interrogative  ≠ ἄρα (therefore)
    'πότε', // when?         ≠ ποτέ (once)
    'ποῦ', // where?         ≠ πού (somewhere)
    'πῶς', // how?           ≠ πώς (somehow)
    'πόθεν', // whence?      ≠ ποθέν (from somewhere)
    'θέα', // sight          ≠ θεά (goddess)
    'βιός', // bow           ≠ βίος (life)
    'νομός', // pasture      ≠ νόμος (law)
    'δημός', // fat          ≠ δῆμος (people)
    'ὠμός', // raw           ≠ ὦμος (shoulder)
    'φώς', // man            ≠ φῶς (light)
    'κάλως', // rope         ≠ καλῶς (well)
    'οἶος', // alone         ≠ οἷος (such as)
    'ὅρος', // boundary      ≠ ὄρος (mountain)
    'ὤρα', // care           ≠ ὥρα (hour)
    'πειθώ', // persuasion   ≠ πείθω (persuade)
    'τρόχος', // course      ≠ τροχός (wheel)
    'κήρ', // death-spirit   ≠ κῆρ (heart)
  ].map((form) => form.normalize('NFC'))
);

/** Exposed for tests and documentation. */
export const GREEK_DISTINCT_HOMOGRAPH_FORMS: readonly string[] = [...GREEK_DISTINCT_HOMOGRAPHS];

/**
 * Normalize a lemma for identity within one language.
 * The result is stable, idempotent, and never empty for a non-empty input.
 */
export function normalizeLemma(lemma: string, languageId: string = UNKNOWN_LANGUAGE): string {
  const input = String(lemma ?? '');

  if (GREEK.has(languageId)) {
    const full = greekFullForm(input);
    if (GREEK_DISTINCT_HOMOGRAPHS.has(full)) return full;
    return tidy(legacyLemmaKey(input));
  }

  if (HEBREW_SCRIPT.has(languageId)) {
    return tidy(legacyLemmaKey(input.replace(HEBREW_NON_LEXICAL, '')));
  }

  if (languageId === 'lat') {
    // Editions disagree on i/j, u/v and ligatures; lexica treat them as one.
    return tidy(
      legacyLemmaKey(input)
        .replace(/æ/g, 'ae')
        .replace(/œ/g, 'oe')
        .replace(/j/g, 'i')
        .replace(/v/g, 'u')
    );
  }

  if (DIACRITIC_PRESERVING.has(languageId)) {
    return tidy(input.normalize('NFC').toLowerCase());
  }

  return tidy(legacyLemmaKey(input));
}

function languageOf(languageId: string | null | undefined): string {
  return languageId || UNKNOWN_LANGUAGE;
}

/** In-memory KnowledgeMap key: `${languageId}:${normalizedLemma}`. */
export function vocabKey(lemma: string, languageId?: string | null): string {
  const lang = languageOf(languageId);
  return `${lang}:${normalizeLemma(lemma, lang)}`;
}

/**
 * False for input with no lexical content (empty, whitespace). Such a "lemma"
 * identifies nothing: every un-lemmatized token would share its entry.
 */
export function isIdentifiableLemma(lemma: unknown): lemma is string {
  return typeof lemma === 'string' && lemma.trim().length > 0;
}

/** Inverse of `vocabKey` (language IDs never contain a colon). */
export function parseVocabKey(key: string): { languageId: string; normalized: string } {
  const at = key.indexOf(':');
  if (at < 0) return { languageId: UNKNOWN_LANGUAGE, normalized: key };
  return { languageId: key.slice(0, at), normalized: key.slice(at + 1) };
}

function base64Utf8(value: string): string {
  return btoa(encodeURIComponent(value)).replace(/[+/=]/g, '_');
}

/** cyrb53 — small, fast, well-distributed 53-bit string hash. */
function cyrb53(value: string, seed: number): string {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < value.length; i++) {
    const ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export const MAX_SHORT_DOC_ID = 120;
const LONG_ID_PREFIX = 96;

/**
 * Firestore document ID for a vocabulary item.
 *
 * Short keys keep the historical encoding byte-for-byte, so the vast majority
 * of existing documents are already at their v2 ID. Keys whose encoding
 * exceeds 120 characters used to be truncated — any two long lemmas, phrases
 * or saved sentences sharing a ~13-letter prefix overwrote each other. Those
 * now get a readable prefix plus a hash of the whole key. The `-` separator
 * cannot occur in the historical alphabet, so the two forms never collide.
 */
export function vocabDocId(lemma: string, languageId?: string | null): string {
  const key = vocabKey(lemma, languageId);
  const encoded = base64Utf8(key);
  if (encoded.length <= MAX_SHORT_DOC_ID) return encoded;
  return `${encoded.slice(0, LONG_ID_PREFIX)}-${cyrb53(key, 0)}${cyrb53(key, 0x9e3779b9)}`;
}

/** The pre-v2 document ID (truncating, accent-blind). Tests and repair only. */
export function legacyVocabDocId(lemma: string, languageId?: string | null): string {
  return base64Utf8(`${languageOf(languageId)}:${legacyLemmaKey(lemma)}`).substring(
    0,
    MAX_SHORT_DOC_ID
  );
}
