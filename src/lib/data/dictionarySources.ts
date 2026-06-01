/**
 * Unified, per-language dictionary-source registry.
 *
 * This is the single source of truth for *which* dictionaries exist for *which*
 * language. Every dictionary surface (reader popup, Dictionary page, Settings)
 * reads from {@link getDictionariesForLanguage} so a language can never reach
 * into another language's lexicon — separation is enforced here, once.
 *
 * Each source declares the languages it supports and a `resolver` kind. The
 * actual meaning lookup lives in `dictionaryResolver.ts`, which switches on the
 * kind and reuses the existing resolvers (corpus fallback chain, Logeion /
 * Sefaria proxy, Wiktionary, AI) — no new fetching logic is introduced.
 */

import type { LanguageId } from '../../types/linguistics.js';

/** How a source's inline meaning is produced. */
export type DictionaryResolverKind =
  /** Bundled/corpus-derived lexica via getDefinitionWithFallbacks (offline). */
  | 'bundled'
  /** Logeion (Greek/Latin) or Sefaria (Hebrew) via the /api/lexicon-lookup proxy. */
  | 'external-api'
  /** Wiktionary REST API (covers most corpus languages). */
  | 'wiktionary'
  /** No inline text — opens an external reference in a new tab. */
  | 'external-link'
  /** On-demand AI gloss (localised into the UI language). */
  | 'ai';

export interface DictionarySourceDef {
  id: string;
  name: string;
  /** Short label for chips/pills. */
  shortName: string;
  resolver: DictionaryResolverKind;
  /** Languages this source serves, or `'all'` for language-agnostic sources. */
  languages: LanguageId[] | 'all';
  licenseName?: string;
  /** Reference URL for external-link sources (and "open source" affordances). */
  url?: (lemma: string, languageId: string) => string;
}

const enc = (s: string) => encodeURIComponent(s);

/**
 * The catalogue. Order within a language is decided by
 * {@link getDictionariesForLanguage}, not by array position here.
 */
export const DICTIONARY_SOURCE_CATALOG: DictionarySourceDef[] = [
  {
    id: 'paleoglossa',
    name: 'PalæoGlossa Lexicon',
    shortName: 'PalæoGlossa',
    resolver: 'bundled',
    languages: 'all',
    licenseName: 'Bundled lexica (Public Domain) + corpus-derived index',
  },
  {
    id: 'logeion',
    name: 'Logeion (LSJ · Lewis & Short)',
    shortName: 'Logeion',
    resolver: 'external-api',
    languages: ['grc', 'grc-koine', 'grc-class', 'lat', 'lat-class', 'lat-med'],
    licenseName: 'Public Domain (via Logeion, University of Chicago)',
    url: (lemma) => `https://logeion.uchicago.edu/${enc(lemma)}`,
  },
  {
    id: 'sefaria',
    name: 'Sefaria Lexicon (BDB)',
    shortName: 'Sefaria',
    resolver: 'external-api',
    languages: ['hbo'],
    licenseName: 'Public Domain (via Sefaria)',
    url: (lemma) => `https://www.sefaria.org/search#lexicon/${enc(lemma)}`,
  },
  {
    id: 'wiktionary',
    name: 'Wiktionary',
    shortName: 'Wiktionary',
    resolver: 'wiktionary',
    languages: [
      'grc',
      'grc-koine',
      'lat',
      'hbo',
      'syr',
      'cop',
      'arc',
      'akk',
      'san',
      'egy',
      'hit',
      'uga',
    ],
    licenseName: 'CC BY-SA 3.0',
    url: (lemma) => `https://en.wiktionary.org/wiki/${enc(lemma)}`,
  },
  {
    id: 'perseus',
    name: 'Perseus Word Study',
    shortName: 'Perseus',
    resolver: 'external-link',
    languages: ['grc', 'grc-koine', 'grc-class', 'lat', 'lat-class', 'lat-med'],
    licenseName: 'CC BY-SA (Perseus Digital Library)',
    url: (lemma, languageId) =>
      `https://www.perseus.tufts.edu/hopper/morph?l=${enc(lemma)}&la=${
        languageId.startsWith('lat') ? 'la' : 'greek'
      }`,
  },
  {
    id: 'blueletter',
    name: 'Blue Letter Bible',
    shortName: 'BLB',
    resolver: 'external-link',
    languages: ['hbo', 'arc'],
    licenseName: 'Blue Letter Bible',
    url: (lemma) => `https://www.blueletterbible.org/lexicon/h${enc(lemma)}/kjv/wlc/0-1/`,
  },
  {
    id: 'ai',
    name: 'AI Gloss',
    shortName: 'AI',
    resolver: 'ai',
    languages: 'all',
    licenseName: 'AI-generated — verify against a primary lexicon',
  },
];

const CATALOG_BY_ID: Record<string, DictionarySourceDef> = Object.fromEntries(
  DICTIONARY_SOURCE_CATALOG.map((s) => [s.id, s])
);

/** Preferred ordering of inline (non-link) sources within a language. */
const RESOLVER_PRIORITY: Record<DictionaryResolverKind, number> = {
  bundled: 0,
  'external-api': 1,
  wiktionary: 2,
  'external-link': 3,
  ai: 4,
};

function supportsLanguage(source: DictionarySourceDef, languageId: string): boolean {
  if (source.languages === 'all') return true;
  return source.languages.includes(languageId);
}

/**
 * The dictionaries available for a language, ordered: bundled → external lexica
 * → Wiktionary → external links → AI. This is the ONLY function UI surfaces
 * should use to enumerate dictionaries, guaranteeing per-language separation.
 */
export function getDictionariesForLanguage(languageId: string): DictionarySourceDef[] {
  if (!languageId) return [];
  return DICTIONARY_SOURCE_CATALOG.filter((s) => supportsLanguage(s, languageId)).sort(
    (a, b) => RESOLVER_PRIORITY[a.resolver] - RESOLVER_PRIORITY[b.resolver]
  );
}

/** The default dictionary id for a language (first inline source). */
export function getDefaultDictionaryId(languageId: string): string {
  const list = getDictionariesForLanguage(languageId).filter((s) => s.resolver !== 'external-link');
  return list[0]?.id ?? 'paleoglossa';
}

export function getDictionarySource(id: string): DictionarySourceDef | undefined {
  return CATALOG_BY_ID[id];
}

/**
 * Resolve the user's preferred dictionary for a language, falling back to the
 * language default when no (valid) preference is stored.
 */
export function resolvePreferredDictionaryId(
  languageId: string,
  preferredByLang: Record<string, string> | undefined
): string {
  const preferred = preferredByLang?.[languageId];
  if (preferred) {
    const src = CATALOG_BY_ID[preferred];
    if (src && supportsLanguage(src, languageId) && src.resolver !== 'external-link') {
      return preferred;
    }
  }
  return getDefaultDictionaryId(languageId);
}
