/**
 * STEPBible lexicon lookup — TBESH (Hebrew) and TBESG (Greek), CC BY 4.0.
 * Data is bundled as JSON in /public/lexicons/ and lazy-loaded on first
 * lookup for the relevant language. Subsequent lookups hit an in-memory index.
 *
 * Build: `node scripts/build-stepbible.mjs`
 * Source: https://github.com/STEPBible/STEPBible-Data
 */

export interface StepBibleEntry {
  eStrong: string;
  uStrong: string;
  lemma: string;
  transliteration: string;
  morphCode: string;
  gloss: string;
  definition: string;
}

export interface StepBibleLookupResult {
  normalizedLemma: string;
  entries: StepBibleEntry[];
  source: 'stepbible-greek' | 'stepbible-hebrew';
  attribution: { name: string; url: string; license: string };
}

const ATTRIBUTION = {
  name: 'STEPBible — Brief Lexicon (Tyndale House Cambridge)',
  url: 'https://github.com/STEPBible/STEPBible-Data',
  license: 'CC BY 4.0',
};

const LANG_TO_FILE: Record<string, { path: string; key: 'stepbible-greek' | 'stepbible-hebrew' }> = {
  grc: { path: '/lexicons/stepbible-greek.json', key: 'stepbible-greek' },
  'grc-koine': { path: '/lexicons/stepbible-greek.json', key: 'stepbible-greek' },
  hbo: { path: '/lexicons/stepbible-hebrew.json', key: 'stepbible-hebrew' },
};

type LemmaIndex = Record<string, StepBibleEntry[]>;
const indexCache = new Map<string, Promise<LemmaIndex | null>>();

const HEBREW_DIACRITICS = /[֑-ׇ]/g;
const GREEK_DIACRITICS = /[̀-ͯ]/g;

// Zero-width spaces, bidirectional marks, and BOMs that often sneak into
// copy-pasted Hebrew/Greek text. Built via String.fromCharCode to avoid
// irregular-whitespace lint errors when the chars appear inline.
const ZERO_WIDTH_CHARS = [0x200b, 0x200c, 0x200d, 0x200e, 0x200f, 0xfeff].map((c) =>
  String.fromCharCode(c)
);

function stripZeroWidth(s: string): string {
  let out = s;
  for (const ch of ZERO_WIDTH_CHARS) {
    if (out.indexOf(ch) >= 0) out = out.split(ch).join('');
  }
  return out;
}

function normalize(lemma: string, languageId: string): string {
  const trimmed = stripZeroWidth(lemma).trim();
  if (languageId === 'hbo') {
    return trimmed.normalize('NFD').replace(HEBREW_DIACRITICS, '').normalize('NFC');
  }
  return trimmed.normalize('NFD').replace(GREEK_DIACRITICS, '').normalize('NFC').toLowerCase();
}

async function loadIndex(languageId: string): Promise<LemmaIndex | null> {
  const config = LANG_TO_FILE[languageId];
  if (!config) return null;
  const cached = indexCache.get(config.key);
  if (cached) return cached;
  const promise = (async () => {
    try {
      const response = await fetch(config.path);
      if (!response.ok) return null;
      const data = (await response.json()) as LemmaIndex;
      return data;
    } catch {
      return null;
    }
  })();
  indexCache.set(config.key, promise);
  return promise;
}

export async function lookupStepBible(
  lemma: string,
  languageId: string
): Promise<StepBibleLookupResult | null> {
  const config = LANG_TO_FILE[languageId];
  if (!config || !lemma) return null;
  const index = await loadIndex(languageId);
  if (!index) return null;
  const key = normalize(lemma, languageId);
  if (!key) return null;
  const entries = index[key];
  if (!entries || entries.length === 0) return null;
  return {
    normalizedLemma: key,
    entries,
    source: config.key,
    attribution: ATTRIBUTION,
  };
}

/**
 * Single-line summary from a STEPBible result — uses the gloss field
 * (e.g. "word, reason" for λόγος). Falls back to the first ~140 chars of
 * the definition if gloss is empty.
 */
export function summarizeStepBible(result: StepBibleLookupResult): string {
  const first = result.entries[0];
  if (!first) return '';
  if (first.gloss) return first.gloss;
  if (first.definition) {
    return first.definition.length > 160
      ? first.definition.slice(0, 160).trimEnd() + '…'
      : first.definition;
  }
  return '';
}

/** Test-only: clear the index cache between tests. */
export function _resetStepBibleCache(): void {
  indexCache.clear();
}
