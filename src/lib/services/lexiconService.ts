import { getApiUrl } from './apiBaseUrl.js';
/**
 * Client-side proxy for the server-side /api/lexicon-lookup endpoint.
 *
 * Supported languages:
 *   grc / grc-koine  → Logeion (LSJ / Middle Liddell)
 *   lat              → Logeion (Lewis & Short)
 *   hbo              → Sefaria (BDB)
 */

const SUPPORTED_LANGUAGES = new Set(['grc', 'grc-koine', 'lat', 'hbo']);

export interface LexiconLookupResult {
  definition: string;
  source: string;
  sourceLabel: string;
  sourceUrl?: string;
}

const cache = new Map<string, LexiconLookupResult | null>();

export async function lookupLexicon(
  lemma: string,
  languageId: string
): Promise<LexiconLookupResult | null> {
  if (!SUPPORTED_LANGUAGES.has(languageId) || !lemma) return null;

  const key = `${languageId}:${lemma}`;
  if (cache.has(key)) return cache.get(key) ?? null;

  try {
    const response = await fetch(getApiUrl(`/api/lexicon-lookup/${encodeURIComponent(languageId)}/${encodeURIComponent(lemma)}`)
    );
    if (!response.ok) {
      cache.set(key, null);
      return null;
    }
    const data = await response.json();
    const result: LexiconLookupResult = {
      definition: data.definition,
      source: data.source,
      sourceLabel: data.sourceLabel,
      sourceUrl: data.sourceUrl,
    };
    cache.set(key, result);
    return result;
  } catch {
    cache.set(key, null);
    return null;
  }
}
