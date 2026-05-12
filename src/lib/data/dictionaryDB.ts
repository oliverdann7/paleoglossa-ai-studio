import { DictionaryEntry, DictionarySource } from './dictionary';
export type { DictionaryEntry };

// Define a few dictionary sources
export const DICTIONARY_SOURCES: Record<string, DictionarySource> = {
  'strongs-greek': {
    id: 'strongs-greek',
    name: 'Strong\'s Greek Dictionary',
    licenseName: 'Public Domain',
    url: 'https://www.blueletterbible.org/lang/lexicon/lexicon.cfm?strongs=G0001',
  },
  'strongs-hebrew': {
    id: 'strongs-hebrew',
    name: 'Strong\'s Hebrew Dictionary',
    licenseName: 'Public Domain',
    url: 'https://www.blueletterbible.org/lang/lexicon/lexicon.cfm?strongs=H0001',
  },
  'liddell-scott': {
    id: 'liddell-scott',
    name: 'Liddell & Scott\'s Greek-English Lexicon',
    licenseName: 'Public Domain',
    url: 'https://www.perseus.tufts.edu/hopper/text?doc=Perseus%3Atext%3A1999.04.0057',
  },
  'whitakers-words': {
    id: 'whitakers-words',
    name: 'Whitaker\'s Words Latin Dictionary',
    licenseName: 'Public Domain',
    url: 'https://archives.nd.edu/whitakers/words.htm',
  },
};

// A small starter dictionary with entries for some common words across languages
export const DICTIONARY: Record<string, DictionaryEntry> = {
  // Greek: ἀγάπη (agape) - love
  'grc:ἀγάπη': {
    id: 'grc:ἀγάπη',
    lemma: 'ἀγάπη',
    languageId: 'grc',
    language: 'Ancient Greek',
    transliteration: 'agápē',
    partOfSpeech: 'noun',
    shortGloss: 'love, affection, goodwill',
    fullDefinition: 'Love, especially brotherly love, charity, the love of God for man and of man for God.',
    semanticDomain: ['emotion', 'virtue', 'theology'],
    relatedForms: ['ἀγαπάω', 'ἀγαπητός'],
    corpusExamples: [], // Will be populated from corpus if needed
    source: DICTIONARY_SOURCES['strongs-greek'],
    dictionaries: [DICTIONARY_SOURCES['strongs-greek'], DICTIONARY_SOURCES['liddell-scott']],
    frequency: 10,
  },
  // Hebrew: אהבה (ahavah) - love
  'hbo:אהבה': {
    id: 'hbo:אהבה',
    lemma: 'אהבה',
    languageId: 'hbo',
    language: 'Biblical Hebrew',
    transliteration: 'ʼahăvāh',
    partOfSpeech: 'noun',
    shortGloss: 'love, affection',
    fullDefinition: 'Love, affection, both human and divine.',
    semanticDomain: ['emotion', 'virtue', 'theology'],
    relatedForms: ['אהב', 'אהוב'],
    corpusExamples: [],
    source: DICTIONARY_SOURCES['strongs-hebrew'],
    dictionaries: [DICTIONARY_SOURCES['strongs-hebrew']],
    frequency: 10,
  },
  // Latin: amor - love
  'lat:amor': {
    id: 'lat:amor',
    lemma: 'amor',
    languageId: 'lat',
    language: 'Classical Latin',
    partOfSpeech: 'noun',
    shortGloss: 'love, affection, romance',
    fullDefinition: 'Love, affection, romantic love, friendship.',
    semanticDomain: ['emotion', 'virtue'],
    relatedForms: ['amare', 'amatus'],
    corpusExamples: [],
    source: DICTIONARY_SOURCES['whitakers-words'],
    dictionaries: [DICTIONARY_SOURCES['whitakers-words']],
    frequency: 10,
  },
  // English: love (for reference)
  'en:love': {
    id: 'en:love',
    lemma: 'love',
    languageId: 'en',
    language: 'English',
    partOfSpeech: 'noun, verb',
    shortGloss: 'to feel deep affection for; deep affection',
    fullDefinition: 'An intense feeling of deep affection or a great interest and pleasure in something.',
    semanticDomain: ['emotion', 'action'],
    relatedForms: ['loves', 'loved', 'loving'],
    corpusExamples: [],
    source: {
      id: 'internal',
      name: 'PalæoGlossa Internal Dictionary',
      licenseName: 'CC0 1.0 Universal (CC0 1.0) Public Domain Dedication',
    },
    dictionaries: [],
    frequency: 100,
  },
};

// Helper to get a dictionary entry by lemma and languageId
export function getDictionaryEntry(lemma: string, languageId: string): DictionaryEntry | null {
  const key = `${languageId}:${lemma}`;
  return DICTIONARY[key] || null;
}

// Helper to search dictionary entries (simple substring match on lemma)
export function searchDictionaryEntries(query: string, languageId?: string, limit: number = 20): DictionaryEntry[] {
  const normalizedQuery = query.toLowerCase();
  return Object.values(DICTIONARY)
    .filter(entry => {
      if (languageId && entry.languageId !== languageId) return false;
      return entry.lemma.toLowerCase().includes(normalizedQuery);
    })
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);
}

// Get all available languages in the dictionary
export function getDictionaryLanguages(): Array<{ id: string; name: string }> {
  const seen = new Map<string, string>();
  Object.values(DICTIONARY).forEach(entry => seen.set(entry.languageId, entry.language));
  return Array.from(seen.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}