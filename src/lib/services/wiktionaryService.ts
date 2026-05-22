/**
 * Wiktionary lookup — fetches lemma definitions from the public English
 * Wiktionary REST API. Covers every supported ancient language with no API
 * key, no rate limit on individual lookups, and CORS enabled.
 *
 * Content is CC BY-SA 4.0 — attribute on display.
 * API: https://en.wiktionary.org/api/rest_v1/
 */

const ENDPOINT = 'https://en.wiktionary.org/api/rest_v1/page/definition/';

/**
 * Wiktionary tags each entry with the human-readable language name.
 * Multiple ancient languages overlap onto a single Wiktionary umbrella —
 * e.g. both Biblical Hebrew and Modern Hebrew live under "Hebrew",
 * and both Syriac and Aramaic show up under "Aramaic".
 *
 * Order matters: the first match wins, so put the most specific first.
 */
const LANGUAGE_NAME_CANDIDATES: Record<string, string[]> = {
  grc: ['Ancient Greek'],
  'grc-koine': ['Ancient Greek', 'Koine Greek'],
  lat: ['Latin'],
  hbo: ['Hebrew'],
  syr: ['Classical Syriac', 'Aramaic'],
  cop: ['Coptic'],
  arc: ['Aramaic', 'Imperial Aramaic', 'Jewish Babylonian Aramaic'],
  akk: ['Akkadian'],
  san: ['Sanskrit'],
  egy: ['Egyptian'],
  hit: ['Hittite'],
  uga: ['Ugaritic'],
};

export interface WiktionaryDefinition {
  partOfSpeech: string;
  language: string;
  definitions: string[];
  examples?: string[];
}

export interface WiktionaryLookupResult {
  lemma: string;
  matchedLanguageName: string;
  entries: WiktionaryDefinition[];
  sourceUrl: string;
}

interface WiktionaryApiEntry {
  partOfSpeech?: string;
  language?: string;
  definitions?: { definition?: string; examples?: string[] }[];
}

const cache = new Map<string, WiktionaryLookupResult | null>();

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildSourceUrl(lemma: string, langName: string): string {
  const anchor = langName.replace(/\s+/g, '_');
  return `https://en.wiktionary.org/wiki/${encodeURIComponent(lemma)}#${anchor}`;
}

/**
 * Look up a lemma in Wiktionary for a given language. Returns null when
 * Wiktionary has no entry for that lemma in that language.
 */
export async function lookupWiktionary(
  lemma: string,
  languageId: string
): Promise<WiktionaryLookupResult | null> {
  const candidates = LANGUAGE_NAME_CANDIDATES[languageId];
  if (!candidates || !lemma) return null;

  const cacheKey = `${languageId}:${lemma}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey) ?? null;

  let response: Response;
  try {
    response = await fetch(`${ENDPOINT}${encodeURIComponent(lemma)}`, {
      headers: { Accept: 'application/json' },
    });
  } catch {
    cache.set(cacheKey, null);
    return null;
  }

  if (!response.ok) {
    cache.set(cacheKey, null);
    return null;
  }

  let body: Record<string, WiktionaryApiEntry[]>;
  try {
    body = await response.json();
  } catch {
    cache.set(cacheKey, null);
    return null;
  }

  // The API groups entries by an opaque key — match by the human-readable
  // `language` field on each entry instead of by key.
  const allEntries = Object.values(body).flat();
  for (const candidate of candidates) {
    const matched = allEntries.filter((e) => e.language === candidate);
    if (matched.length === 0) continue;
    const entries: WiktionaryDefinition[] = matched
      .map((entry) => ({
        partOfSpeech: entry.partOfSpeech || '',
        language: entry.language || candidate,
        definitions: (entry.definitions || [])
          .map((d) => stripHtml(d.definition || ''))
          .filter((d) => d.length > 0),
        examples: (entry.definitions || [])
          .flatMap((d) => (d.examples || []).map((e) => stripHtml(e)))
          .filter((e) => e.length > 0),
      }))
      .filter((e) => e.definitions.length > 0);

    if (entries.length === 0) continue;
    const result: WiktionaryLookupResult = {
      lemma,
      matchedLanguageName: candidate,
      entries,
      sourceUrl: buildSourceUrl(lemma, candidate),
    };
    cache.set(cacheKey, result);
    return result;
  }

  cache.set(cacheKey, null);
  return null;
}

/**
 * Build a compact, single-line gloss from a lookup result — first definition
 * of the first entry. Useful for the meaning panel's headline display.
 */
export function summarizeWiktionary(result: WiktionaryLookupResult): string {
  const first = result.entries[0];
  if (!first || first.definitions.length === 0) return '';
  return first.definitions[0];
}
