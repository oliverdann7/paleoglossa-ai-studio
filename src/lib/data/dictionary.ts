import { ATTRIBUTIONS, CorpusDB } from '../../data/corpus.js';
import * as tokenArrays from '../../data/tokens.js';
import { SourceAttribution, Token } from '../../types/corpus.js';
import { DICTIONARY as STATIC_DICT } from './dictionaryDB.js';
import { staticLookup } from './dictionaries/index.js';

export interface DictionarySource {
  id: string;
  name: string;
  licenseName: string;
  url?: string;
  licenseUrl?: string;
  attributionText?: string;
}

export interface CorpusExample {
  id: string;
  textId: string;
  textTitle: string;
  sectionId: string;
  sectionLabel: string;
  sentenceId: string;
  sentenceText: string;
  translation?: string;
  tokenId: string;
  surface: string;
}

export interface DictionaryEntry {
  id: string;
  lemma: string;
  languageId: string;
  language: string;
  transliteration?: string;
  partOfSpeech?: string;
  shortGloss: string;
  fullDefinition: string;
  semanticDomain: string[];
  relatedForms: string[];
  corpusExamples: CorpusExample[];
  source: DictionarySource;
  dictionaries: DictionarySource[];
  frequency: number;
}

interface EntryAccumulator {
  lemma: string;
  languageId: string;
  language: string;
  transliteration?: string;
  glosses: Set<string>;
  partsOfSpeech: Set<string>;
  forms: Set<string>;
  semanticDomain: Set<string>;
  examples: CorpusExample[];
  sources: Map<string, DictionarySource>;
  firstToken?: any;
  frequency: number;
}

let _dictCache: Record<string, any> | null = null;
let _entriesCache: DictionaryEntry[] | null = null;
let _staticDictNormCache: Record<string, string> | null = null;

const LANGUAGE_ALIASES: Record<string, string> = {
  'Ancient Greek': 'grc',
  'Koine Greek': 'grc-koine',
  'Biblical Hebrew': 'hbo',
  Hebrew: 'hbo',
  Greek: 'grc',
  Latin: 'lat',
  'Classical Latin': 'lat',
  Syriac: 'syr',
  Coptic: 'cop',
  Aramaic: 'arc',
  Akkadian: 'akk',
  Sanskrit: 'san',
  'Egyptian Hieroglyphs': 'egy',
  Hittite: 'hit',
};

const LANGUAGE_NAMES: Record<string, string> = {
  grc: 'Ancient Greek',
  'grc-koine': 'Koine Greek',
  hbo: 'Biblical Hebrew',
  lat: 'Classical Latin',
  syr: 'Syriac',
  cop: 'Coptic',
  arc: 'Aramaic',
  akk: 'Akkadian',
  san: 'Sanskrit',
  egy: 'Egyptian Hieroglyphs',
  hit: 'Hittite',
};

const DEFAULT_SOURCE: DictionarySource = {
  id: 'paleoglossa-corpus-index',
  name: 'PalæoGlossa Corpus-Derived Lexical Index',
  licenseName: 'Derived from in-app corpus tokens; no copyrighted lexicon imported',
};

function normalizeLanguageId(language?: string) {
  if (!language) return 'unknown';
  return LANGUAGE_ALIASES[language] || language;
}

function languageName(languageId: string) {
  return LANGUAGE_NAMES[languageId] || languageId || 'Unknown';
}

export function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function buildStaticDictNormCache(): Record<string, string> {
  if (_staticDictNormCache) return _staticDictNormCache;
  _staticDictNormCache = {};
  for (const key of Object.keys(STATIC_DICT)) {
    const colonIdx = key.indexOf(':');
    if (colonIdx === -1) continue;
    const lang = key.slice(0, colonIdx);
    const lemmaPart = key.slice(colonIdx + 1);
    const normed = normalizeSearch(lemmaPart);
    const normKey = `${lang}:${normed}`;
    if (!_staticDictNormCache[normKey]) {
      _staticDictNormCache[normKey] = key;
    }
  }
  return _staticDictNormCache;
}

export function stripHebrewVowels(value: string): string {
  return value.replace(/[\u0591-\u05C7\u05B0-\u05BD\u05BF\u05C1\u05C2]/g, '');
}

function getPartOfSpeech(token: any) {
  return token?.morphology?.partOfSpeech || token?.morphology?.part || token?.morphology?.pos;
}

function sourceFromAttribution(attribution?: SourceAttribution): DictionarySource | undefined {
  if (!attribution) return undefined;
  return {
    id: attribution.id,
    name: attribution.sourceName,
    licenseName: attribution.licenseName,
    url: attribution.sourceUrl,
    licenseUrl: attribution.licenseUrl,
    attributionText: attribution.attributionText,
  };
}

function makeEntryKey(languageId: string, lemma: string) {
  return `${languageId}:${lemma}`;
}

// Static-dictionary language aliases — e.g. Koine/Classical Greek reuse the
// shared Ancient Greek lexicon. Used to enrich corpus-derived entries that
// carry no inline token gloss.
const STATIC_LANG_ALIASES: Record<string, string[]> = {
  'grc-koine': ['grc'],
  'grc-class': ['grc'],
};

/**
 * Non-recursive lookup of a static gloss/definition for a lemma. Safe to call
 * while `getDictionaryEntries()` is still building its cache, because it only
 * touches the static lexicons (STATIC_DICT + per-language compact maps) and
 * never re-enters the corpus-derived entry list.
 */
function staticEnrichment(
  lemma: string,
  languageId: string
): { shortGloss: string; fullDefinition?: string } | null {
  const langs = [languageId, ...(STATIC_LANG_ALIASES[languageId] || [])];
  const lower = lemma.toLowerCase();

  // 1. Rich static DB (Strong's / LSJ / Whitaker's) — has fullDefinition.
  for (const lang of langs) {
    const e = STATIC_DICT[`${lang}:${lemma}`] || STATIC_DICT[`${lang}:${lower}`];
    if (e?.shortGloss || e?.fullDefinition) {
      return {
        shortGloss: e.shortGloss || e.fullDefinition || '',
        fullDefinition: e.fullDefinition || e.shortGloss,
      };
    }
  }

  // 2. Compact per-language gloss maps — handles diacritic-stripping and the
  // grc-koine alias internally.
  const compact = staticLookup(lemma, languageId);
  if (compact) return { shortGloss: compact };

  return null;
}

function addTokenToEntry(
  entries: Map<string, EntryAccumulator>,
  token: any,
  languageId: string,
  options?: { source?: DictionarySource; example?: CorpusExample }
) {
  if (!token?.lemma) return;

  const normalizedLanguageId = normalizeLanguageId(languageId || token.language);
  const key = makeEntryKey(normalizedLanguageId, token.lemma);
  const current: EntryAccumulator = entries.get(key) || {
    lemma: token.lemma,
    languageId: normalizedLanguageId,
    language: languageName(normalizedLanguageId),
    glosses: new Set<string>(),
    partsOfSpeech: new Set<string>(),
    forms: new Set<string>(),
    semanticDomain: new Set<string>(),
    examples: [],
    sources: new Map<string, DictionarySource>(),
    firstToken: token,
    frequency: 0,
  };

  const surface = token.surface || token.text || token.normalized;
  const partOfSpeech = getPartOfSpeech(token);

  if (!current.transliteration && (token.transliteration || token.translit)) {
    current.transliteration = token.transliteration || token.translit;
  }
  if (token.gloss) current.glosses.add(token.gloss);
  if (partOfSpeech) {
    current.partsOfSpeech.add(partOfSpeech);
    current.semanticDomain.add(partOfSpeech);
  }
  if (surface) current.forms.add(surface);
  if (token.normalized) current.forms.add(token.normalized);
  if (token.text) current.forms.add(token.text);
  if (options?.source) current.sources.set(options.source.id, options.source);
  if (options?.example && current.examples.length < 8) current.examples.push(options.example);

  current.frequency += 1;
  entries.set(key, current);
}

function sentenceToText(tokens: Token[]) {
  return tokens
    .map((token) => `${token.punctBefore || ''}${token.surface}${token.punctAfter || ''}`)
    .join(' ');
}

export const getGlobalDictionary = () => {
  if (_dictCache) return _dictCache;
  const dict: Record<string, any> = {};

  // Tokens from chapters
  for (const key of Object.keys(tokenArrays)) {
    const list = (tokenArrays as any)[key];
    if (Array.isArray(list)) {
      for (const t of list) {
        if (t.lemma) {
          dict[t.lemma] = { ...t, _source: 'chapter' };
        }
      }
    }
  }

  // Tokens from real texts
  for (const text of CorpusDB.getTexts()) {
    if (text.sectionsPreview) {
      for (const section of text.sectionsPreview) {
        const fullSection = CorpusDB.getSection(section.id);
        if (fullSection) {
          for (const sentence of fullSection.sentences) {
            for (const t of sentence.tokens) {
              if (t.lemma && !dict[t.lemma]) {
                dict[t.lemma] = { ...t, language: text.language, _source: 'text' };
              } else if (t.lemma && t.gloss && dict[t.lemma] && !dict[t.lemma].gloss) {
                dict[t.lemma] = { ...t, language: text.language, _source: 'text' };
              }
            }
          }
        }
      }
    }
  }

  _dictCache = dict;
  return dict;
};

export const getGlossForLemma = (lemma: string) => {
  const dict = getGlobalDictionary();
  return dict[lemma]?.gloss || null;
};

export const GLOSS_SOURCES = {
  USER_GLOSS: 'user_gloss',
  STATIC_COMPACT: 'static_compact',
  CORPUS_DERIVED: 'corpus_derived',
  STATIC_DICT: 'static_dictionary',
  CORPUS_GLOBAL: 'corpus_global',
  TOKEN_GLOSS: 'token_gloss',
  AI_EXPLANATION: 'ai_explanation',
  UNAVAILABLE: 'unavailable',
} as const;

export type GlossSource = (typeof GLOSS_SOURCES)[keyof typeof GLOSS_SOURCES];

export interface LookupResult {
  definition: string;
  source: GlossSource;
  sourceLabel?: string;
}

export const getGlossWithFallbacks = (lemma: string, languageId: string): string | null => {
  const lower = lemma.toLowerCase();
  const normalized = normalizeSearch(lemma);
  const isHebrew = languageId === 'hbo';
  const consonantal = isHebrew ? stripHebrewVowels(lemma) : null;

  // 0. Compact static dictionaries
  const compactGloss = staticLookup(lemma, languageId);
  if (compactGloss) return compactGloss;

  // 1. Exact match in corpus-derived dictionary entries
  let entry = findDictionaryEntry(lemma, languageId);
  if (entry?.shortGloss) return entry.shortGloss;

  // 2. Lowercase lemma
  if (lower !== lemma) {
    entry = findDictionaryEntry(lower, languageId);
    if (entry?.shortGloss) return entry.shortGloss;
  }

  // 3. NFD-normalized / diacritic-stripped lemma
  if (normalized !== lemma && normalized !== lower) {
    entry = findDictionaryEntry(normalized, languageId);
    if (entry?.shortGloss) return entry.shortGloss;
  }

  // 4. Static dictionaryDB entries (Strong's / LSJ / Whitaker's)
  const staticKey = `${languageId}:${lemma}`;
  const staticEntry = STATIC_DICT[staticKey];
  if (staticEntry?.shortGloss) return staticEntry.shortGloss;
  const staticKeyLower = `${languageId}:${lower}`;
  if (staticKeyLower !== staticKey) {
    const staticLower = STATIC_DICT[staticKeyLower];
    if (staticLower?.shortGloss) return staticLower.shortGloss;
  }

  // 5. Language alias fallback for static dict (e.g. grc-koine -> grc)
  const langAliases = languageId === 'grc-koine' ? ['grc'] : [];
  for (const alias of langAliases) {
    const aliasEntry = STATIC_DICT[`${alias}:${lemma}`];
    if (aliasEntry?.shortGloss) return aliasEntry.shortGloss;
    const aliasLower = STATIC_DICT[`${alias}:${lower}`];
    if (aliasLower?.shortGloss) return aliasLower.shortGloss;
  }

  // 6. Accent-insensitive static dict lookup via normalized keys
  const normCache = buildStaticDictNormCache();
  const lookupLangs = [...new Set([languageId, ...langAliases])];
  for (const lang of lookupLangs) {
    const normKey = `${lang}:${normalized}`;
    const origKey = normCache[normKey];
    if (
      origKey &&
      origKey !== `${languageId}:${lemma}` &&
      origKey !== `${languageId}:${lower}` &&
      !langAliases.some((a) => origKey === `${a}:${lemma}` || origKey === `${a}:${lower}`)
    ) {
      const normEntry = STATIC_DICT[origKey];
      if (normEntry?.shortGloss) return normEntry.shortGloss;
    }
  }

  // 7. Hebrew consonantal form (without vowel marks)
  if (isHebrew && consonantal && consonantal !== lemma) {
    entry = findDictionaryEntry(consonantal, languageId);
    if (entry?.shortGloss) return entry.shortGloss;
    const staticConsonantal = STATIC_DICT[`${languageId}:${consonantal}`];
    if (staticConsonantal?.shortGloss) return staticConsonantal.shortGloss;
  }

  // 8. Corpus global dictionary
  const dict = getGlobalDictionary();
  const corpusGloss = dict[lemma]?.gloss || dict[lower]?.gloss || dict[normalized]?.gloss;
  if (corpusGloss) return corpusGloss;

  return null;
};

export const getDefinitionWithFallbacks = (
  lemma: string,
  languageId: string
): LookupResult | null => {
  const lower = lemma.toLowerCase();
  const normalized = normalizeSearch(lemma);
  const isHebrew = languageId === 'hbo';
  const consonantal = isHebrew ? stripHebrewVowels(lemma) : null;

  // 0. Compact static dictionaries (thousands of entries per language)
  const compactGloss = staticLookup(lemma, languageId);
  if (compactGloss) {
    return { definition: compactGloss, source: GLOSS_SOURCES.STATIC_COMPACT };
  }

  // 1. Exact match in corpus-derived dictionary entries
  let entry = findDictionaryEntry(lemma, languageId);
  if (entry?.fullDefinition) {
    return { definition: entry.fullDefinition, source: GLOSS_SOURCES.CORPUS_DERIVED };
  }
  if (entry?.shortGloss) {
    return { definition: entry.shortGloss, source: GLOSS_SOURCES.CORPUS_DERIVED };
  }

  // 2. Lowercase lemma
  if (lower !== lemma) {
    entry = findDictionaryEntry(lower, languageId);
    if (entry?.fullDefinition) {
      return { definition: entry.fullDefinition, source: GLOSS_SOURCES.CORPUS_DERIVED };
    }
    if (entry?.shortGloss) {
      return { definition: entry.shortGloss, source: GLOSS_SOURCES.CORPUS_DERIVED };
    }
  }

  // 3. NFD-normalized / diacritic-stripped lemma
  if (normalized !== lemma && normalized !== lower) {
    entry = findDictionaryEntry(normalized, languageId);
    if (entry?.fullDefinition) {
      return { definition: entry.fullDefinition, source: GLOSS_SOURCES.CORPUS_DERIVED };
    }
    if (entry?.shortGloss) {
      return { definition: entry.shortGloss, source: GLOSS_SOURCES.CORPUS_DERIVED };
    }
  }

  // 4. Static dictionaryDB entries (Strong's / LSJ / Whitaker's)
  const tryStatic = (key: string): LookupResult | null => {
    const staticEntry = STATIC_DICT[key];
    if (staticEntry?.fullDefinition) {
      return {
        definition: staticEntry.fullDefinition,
        source: GLOSS_SOURCES.STATIC_DICT,
        sourceLabel: staticEntry.source?.name,
      };
    }
    if (staticEntry?.shortGloss) {
      return {
        definition: staticEntry.shortGloss,
        source: GLOSS_SOURCES.STATIC_DICT,
        sourceLabel: staticEntry.source?.name,
      };
    }
    return null;
  };

  const staticResult = tryStatic(`${languageId}:${lemma}`) || tryStatic(`${languageId}:${lower}`);
  if (staticResult) return staticResult;

  // 5. Language alias fallback for static dict (e.g. grc-koine -> grc)
  const langAliases = languageId === 'grc-koine' ? ['grc'] : [];
  for (const alias of langAliases) {
    const aliasResult = tryStatic(`${alias}:${lemma}`) || tryStatic(`${alias}:${lower}`);
    if (aliasResult) return aliasResult;
  }

  // 6. Accent-insensitive static dict lookup via normalized keys
  const normCache = buildStaticDictNormCache();
  const lookupLangs = [...new Set([languageId, ...langAliases])];
  for (const lang of lookupLangs) {
    const normKey = `${lang}:${normalized}`;
    const origKey = normCache[normKey];
    if (
      origKey &&
      origKey !== `${languageId}:${lemma}` &&
      origKey !== `${languageId}:${lower}` &&
      !langAliases.some((a) => origKey === `${a}:${lemma}` || origKey === `${a}:${lower}`)
    ) {
      const normResult = tryStatic(origKey);
      if (normResult) return normResult;
    }
  }

  // 7. Hebrew consonantal form (without vowel marks)
  if (isHebrew && consonantal && consonantal !== lemma) {
    entry = findDictionaryEntry(consonantal, languageId);
    if (entry?.fullDefinition) {
      return { definition: entry.fullDefinition, source: GLOSS_SOURCES.CORPUS_DERIVED };
    }
    if (entry?.shortGloss) {
      return { definition: entry.shortGloss, source: GLOSS_SOURCES.CORPUS_DERIVED };
    }
    const staticConsonantal = tryStatic(`${languageId}:${consonantal}`);
    if (staticConsonantal) return staticConsonantal;
  }

  // 8. Corpus global dictionary
  const dict = getGlobalDictionary();
  const token = dict[lemma] || dict[lower] || dict[normalized];
  if (token?.gloss) {
    return { definition: token.gloss, source: GLOSS_SOURCES.CORPUS_GLOBAL };
  }
  if (token?.fullDefinition) {
    return { definition: token.fullDefinition, source: GLOSS_SOURCES.CORPUS_GLOBAL };
  }
  if (token?.shortGloss) {
    return { definition: token.shortGloss, source: GLOSS_SOURCES.CORPUS_GLOBAL };
  }

  return null;
};

export const getLangForLemma = (lemma: string) => {
  const dict = getGlobalDictionary();
  return dict[lemma]?.language || 'Unknown';
};

export const getTokenInfo = (lemma: string) => {
  return getGlobalDictionary()[lemma];
};

export const getDictionaryEntries = (): DictionaryEntry[] => {
  if (_entriesCache) return _entriesCache;

  const entries = new Map<string, EntryAccumulator>();

  for (const key of Object.keys(tokenArrays)) {
    const list = (tokenArrays as any)[key];
    if (!Array.isArray(list)) continue;
    for (const token of list) {
      addTokenToEntry(entries, token, normalizeLanguageId(token.language), {
        source: DEFAULT_SOURCE,
      });
    }
  }

  for (const text of CorpusDB.getTexts()) {
    const corpus = CorpusDB.getCorpusOverview(text.corpusId);
    const corpusSource =
      sourceFromAttribution(
        corpus?.sourceAttributionId ? ATTRIBUTIONS[corpus.sourceAttributionId] : undefined
      ) || DEFAULT_SOURCE;

    for (const preview of text.sectionsPreview || []) {
      const section = CorpusDB.getSection(preview.id);
      if (!section) continue;

      for (const sentence of section.sentences) {
        const sentenceText = sentenceToText(sentence.tokens);
        for (const token of sentence.tokens) {
          addTokenToEntry(entries, token, text.language, {
            source: corpusSource,
            example: {
              id: `${text.id}:${section.id}:${sentence.id}:${token.id}`,
              textId: text.id,
              textTitle: text.canonicalRef || text.title,
              sectionId: section.id,
              sectionLabel: section.label,
              sentenceId: sentence.id,
              sentenceText,
              translation: sentence.translation,
              tokenId: token.id,
              surface: token.surface,
            },
          });
        }
      }
    }
  }

  _entriesCache = Array.from(entries.values())
    .map((entry) => {
      const glosses = Array.from(entry.glosses).filter(Boolean);
      let shortGloss = glosses[0] || '';
      let fullDefinition = glosses.length > 1 ? glosses.join('; ') : shortGloss;

      // Corpus tokens often carry no inline gloss (e.g. Koine high-frequency
      // words). Backfill from the static lexicon so the Definition panel is
      // never blank when a known gloss exists.
      if (!shortGloss) {
        const enriched = staticEnrichment(entry.lemma, entry.languageId);
        if (enriched) {
          shortGloss = enriched.shortGloss;
          fullDefinition = enriched.fullDefinition || enriched.shortGloss;
        }
      }

      const partOfSpeech = Array.from(entry.partsOfSpeech)[0];
      const dictionaries = Array.from(entry.sources.values());
      const relatedForms = Array.from(entry.forms)
        .filter((form) => form && form !== entry.lemma)
        .slice(0, 12);

      return {
        id: makeEntryKey(entry.languageId, entry.lemma),
        lemma: entry.lemma,
        languageId: entry.languageId,
        language: entry.language,
        transliteration: entry.transliteration,
        partOfSpeech,
        shortGloss,
        fullDefinition,
        semanticDomain: Array.from(entry.semanticDomain),
        relatedForms,
        corpusExamples: entry.examples,
        source: dictionaries[0] || DEFAULT_SOURCE,
        dictionaries: dictionaries.length > 0 ? dictionaries : [DEFAULT_SOURCE],
        frequency: entry.frequency,
      } satisfies DictionaryEntry;
    })
    .sort((a, b) => b.frequency - a.frequency || a.lemma.localeCompare(b.lemma));

  return _entriesCache;
};

export const findDictionaryEntry = (lemma: string, languageId?: string) => {
  const normalizedLanguageId = languageId ? normalizeLanguageId(languageId) : undefined;
  return (
    getDictionaryEntries().find((entry) => {
      if (normalizedLanguageId && entry.languageId !== normalizedLanguageId) return false;
      return entry.lemma === lemma;
    }) || null
  );
};

export const searchDictionaryEntries = (query: string, languageId?: string, limit: number = 50) => {
  const normalizedQuery = normalizeSearch(query);
  const normalizedLanguageId = languageId ? normalizeLanguageId(languageId) : undefined;

  return getDictionaryEntries()
    .filter((entry) => {
      if (normalizedLanguageId && entry.languageId !== normalizedLanguageId) return false;
      if (!normalizedQuery) return true;

      const haystack = [
        entry.lemma,
        entry.transliteration || '',
        entry.shortGloss,
        entry.fullDefinition,
        ...entry.relatedForms,
      ].map(normalizeSearch);

      return haystack.some((value) => value.includes(normalizedQuery));
    })
    .slice(0, limit);
};

export const getDictionaryLanguages = () => {
  const seen = new Map<string, string>();
  getDictionaryEntries().forEach((entry) => seen.set(entry.languageId, entry.language));
  return Array.from(seen.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
};
