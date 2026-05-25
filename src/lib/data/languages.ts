import type { LanguageId, ScriptDirection } from '../../types/linguistics.js';

export interface TokenizationHints {
  wordBoundaries: 'whitespace' | 'none' | 'script-specific';
  hasClitics?: boolean;
  hasSandhi?: boolean;
}

export interface DictionaryHints {
  dictionaries: string[];
  hasCorpusGlosses: boolean;
  grammarResources?: string[];
}

export interface Language {
  id: LanguageId;
  name: string;
  nativeName: string;
  shortName: string;
  icon: string;
  symbol: string;
  direction: ScriptDirection;
  scripts: string[];
  era: string;
  region: string;
  writingSystem: string;
  description: string;
  sampleText: string;
  recommendedStartTextId?: string;
  corpusStatus: 'available' | 'partial' | 'sample' | 'coming_soon';
  supportsMorphology: boolean;
  supportsTransliteration: boolean;
  supportsTTS: boolean;
  supportsPronunciationGuide: boolean;
  supportsAiAnalysis?: boolean;
  hasScriptLearning?: boolean;
  audioProvider?: string;
  reconstructionNote?: string;
  color?: string;
  tokenizationHints?: TokenizationHints;
  dictionaryHints?: DictionaryHints;
}

export const LANGUAGES: Language[] = [
  {
    id: 'grc',
    name: 'Ancient Greek',
    nativeName: 'Ἑλληνική',
    shortName: 'Greek',
    icon: 'α',
    symbol: 'α',
    direction: 'ltr',
    scripts: ['Greek'],
    era: 'c. 1500 BC – 300 BC',
    region: 'Ancient Greece',
    writingSystem: 'Greek Alphabet',
    description: 'The language of Homer, Plato, and the New Testament.',
    sampleText: 'μῆνιν ἄειδε θεὰ Πηληϊάδεω Ἀχιλῆος',
    recommendedStartTextId: 'Jn-1',
    corpusStatus: 'available',
    supportsMorphology: true,
    supportsTransliteration: true,
    supportsTTS: true,
    supportsPronunciationGuide: true,
    supportsAiAnalysis: true,
    audioProvider: 'gemini',
    reconstructionNote: undefined,
    color: '#2563EB',
    tokenizationHints: { wordBoundaries: 'whitespace' },
    dictionaryHints: { dictionaries: ['liddell-scott', 'strongs-greek'], hasCorpusGlosses: true },
  },
  {
    id: 'grc-koine',
    name: 'Koine Greek',
    nativeName: 'Κοινὴ Ἑλληνική',
    shortName: 'Koine',
    icon: 'Ω',
    symbol: 'Ω',
    direction: 'ltr',
    scripts: ['Greek'],
    era: 'c. 300 BC – AD 300',
    region: 'Mediterranean & Middle East',
    writingSystem: 'Greek Alphabet',
    description:
      'The common Greek spoken and written during the Hellenistic period, the Roman Empire, and the early Byzantine Empire.',
    sampleText: 'Ἐν ἀρχῇ ἦν ὁ λόγος',
    recommendedStartTextId: 'Jn-1',
    corpusStatus: 'available',
    supportsMorphology: true,
    supportsTransliteration: true,
    supportsTTS: true,
    supportsPronunciationGuide: true,
    supportsAiAnalysis: true,
    audioProvider: 'gemini',
    reconstructionNote: undefined,
    color: '#059669',
    tokenizationHints: { wordBoundaries: 'whitespace' },
    dictionaryHints: { dictionaries: ['strongs-greek', 'liddell-scott'], hasCorpusGlosses: true },
  },
  {
    id: 'hbo',
    name: 'Biblical Hebrew',
    nativeName: 'עִבְרִית מִקְרָאִית',
    shortName: 'Hebrew',
    icon: 'א',
    symbol: 'א',
    direction: 'rtl',
    scripts: ['Hebrew'],
    era: 'c. 1000 BC – 100 AD',
    region: 'Ancient Israel / Levant',
    writingSystem: 'Hebrew Alphabet (abjad)',
    description: 'The archaic form of the Hebrew language, in which the Hebrew Bible is written.',
    sampleText: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים',
    recommendedStartTextId: 'Gen',
    corpusStatus: 'available',
    supportsMorphology: true,
    supportsTransliteration: true,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    supportsAiAnalysis: true,
    audioProvider: undefined,
    reconstructionNote: undefined,
    color: '#D97706',
    tokenizationHints: { wordBoundaries: 'whitespace', hasClitics: true },
    dictionaryHints: { dictionaries: ['strongs-hebrew'], hasCorpusGlosses: true },
  },
  {
    id: 'lat',
    name: 'Classical Latin',
    nativeName: 'Latīna',
    shortName: 'Latin',
    icon: 'V',
    symbol: 'V',
    direction: 'ltr',
    scripts: ['Latin'],
    era: 'c. 75 BC – AD 300',
    region: 'Roman Empire',
    writingSystem: 'Latin Alphabet',
    description: 'The standard register of the Latin language of the Roman classical period.',
    sampleText: 'Arma virumque cano',
    recommendedStartTextId: 'Aeneid-1',
    corpusStatus: 'available',
    supportsMorphology: true,
    supportsTransliteration: false,
    supportsTTS: true,
    supportsPronunciationGuide: true,
    supportsAiAnalysis: true,
    audioProvider: 'gemini',
    reconstructionNote: undefined,
    color: '#7C3AED',
    tokenizationHints: { wordBoundaries: 'whitespace' },
    dictionaryHints: { dictionaries: ['whitakers-words'], hasCorpusGlosses: true },
  },
  {
    id: 'syr',
    name: 'Syriac',
    nativeName: 'ܠܫܢܐ ܣܘܪܝܝܐ',
    shortName: 'Syriac',
    icon: 'ܣ',
    symbol: 'ܣ',
    direction: 'rtl',
    scripts: ['Syriac'],
    era: '1st century AD – Present',
    region: 'Fertile Crescent',
    writingSystem: 'Syriac Alphabet (abjad)',
    description:
      'A dialect of Middle Aramaic that was once spoken across much of the Fertile Crescent and Eastern Arabia.',
    sampleText: 'ܒܪܫܝܬ ܐܝܬܘܗܝ ܗܘܐ ܡܠܬܐ',
    recommendedStartTextId: 'Syr-Jn-1',
    corpusStatus: 'sample',
    supportsMorphology: false,
    supportsTransliteration: false,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    supportsAiAnalysis: true,
    audioProvider: undefined,
    reconstructionNote: undefined,
    color: '#DC2626',
    tokenizationHints: { wordBoundaries: 'whitespace', hasClitics: true },
    dictionaryHints: { dictionaries: [], hasCorpusGlosses: false },
  },
  {
    id: 'cop',
    name: 'Coptic',
    nativeName: 'ⲙⲉⲧⲣⲉⲙⲛ̀ⲭⲏⲙⲓ',
    shortName: 'Coptic',
    icon: 'ⲱ',
    symbol: 'ⲱ',
    direction: 'ltr',
    scripts: ['Coptic'],
    era: '2nd century AD – Present (Liturgical)',
    region: 'Egypt',
    writingSystem: 'Coptic Alphabet',
    description:
      'The latest stage of the Egyptian language, a northern Afroasiatic language spoken in Egypt until at least the 17th century.',
    sampleText: 'ϩⲛ ⲧⲉϩⲟⲩⲓⲧⲉ ⲛⲉϥϣⲟⲟⲡ ⲛϭⲓ ⲡϣⲁϫⲉ',
    recommendedStartTextId: 'Cop-Jn-1',
    corpusStatus: 'sample',
    supportsMorphology: false,
    supportsTransliteration: false,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    supportsAiAnalysis: true,
    audioProvider: undefined,
    reconstructionNote: undefined,
    color: '#0891B2',
    tokenizationHints: { wordBoundaries: 'whitespace' },
    dictionaryHints: { dictionaries: [], hasCorpusGlosses: false },
  },
  {
    id: 'arc',
    name: 'Aramaic',
    nativeName: 'ארמית / ܐܪܡܝܐ',
    shortName: 'Aramaic',
    icon: '𐡀',
    symbol: '𐡀',
    direction: 'rtl',
    scripts: ['Aramaic', 'Hebrew'],
    era: 'c. 3000 BC – Present',
    region: 'Near East',
    writingSystem: 'Aramaic Alphabet (abjad)',
    description:
      'An ancient language belonging to the Northwest Semitic group of the Afroasiatic language family.',
    sampleText: 'ܐܒܘܢ ܕܒܫܡܝܐ',
    recommendedStartTextId: 'Arc-Gen-1',
    corpusStatus: 'sample',
    supportsMorphology: false,
    supportsTransliteration: false,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    supportsAiAnalysis: true,
    audioProvider: undefined,
    reconstructionNote: undefined,
    color: '#CA8A04',
    tokenizationHints: { wordBoundaries: 'whitespace', hasClitics: true },
    dictionaryHints: { dictionaries: [], hasCorpusGlosses: false },
  },
  {
    id: 'akk',
    name: 'Akkadian',
    nativeName: '𒀝𒅗𒁺𒌑',
    shortName: 'Akkadian',
    icon: '𒀭',
    symbol: '𒀭',
    direction: 'ltr',
    scripts: ['Cuneiform'],
    era: 'c. 2500 BC – 100 AD',
    region: 'Mesopotamia',
    writingSystem: 'Cuneiform (logo-syllabic)',
    description: 'An extinct East Semitic language that was spoken in ancient Mesopotamia.',
    sampleText: '𒀭 𒂗 𒆤',
    recommendedStartTextId: 'Akk-Gilg-1',
    corpusStatus: 'sample',
    supportsMorphology: false,
    supportsTransliteration: true,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    supportsAiAnalysis: true,
    hasScriptLearning: true,
    audioProvider: undefined,
    reconstructionNote: undefined,
    color: '#9333EA',
    tokenizationHints: { wordBoundaries: 'whitespace' },
    dictionaryHints: { dictionaries: [], hasCorpusGlosses: false },
  },
  {
    id: 'san',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    shortName: 'Sanskrit',
    icon: 'अ',
    symbol: 'अ',
    direction: 'ltr',
    scripts: ['Devanagari', 'Latin'],
    era: 'c. 1500 BC – Present',
    region: 'South Asia',
    writingSystem: 'Devanagari (abugida)',
    description:
      'An ancient Indo-Aryan language that is the classical language of India and of Hinduism.',
    sampleText: 'धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः',
    recommendedStartTextId: 'San-Gita-1',
    corpusStatus: 'sample',
    supportsMorphology: false,
    supportsTransliteration: true,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    supportsAiAnalysis: true,
    audioProvider: undefined,
    reconstructionNote: undefined,
    color: '#E11D48',
    tokenizationHints: { wordBoundaries: 'whitespace', hasSandhi: true },
    dictionaryHints: { dictionaries: [], hasCorpusGlosses: false },
  },
  {
    id: 'egy',
    name: 'Egyptian Hieroglyphs',
    nativeName: '𓂋𓈖𓎡𓅱𓏏',
    shortName: 'Egyptian',
    icon: '𓂋',
    symbol: '𓂋',
    direction: 'ltr',
    scripts: ['Hieroglyphs'],
    era: 'c. 3200 BC – AD 400',
    region: 'Ancient Egypt',
    writingSystem: 'Hieroglyphs',
    description:
      'The formal writing system used in Ancient Egypt, featuring a combination of logographic, syllabic and alphabetic elements.',
    sampleText: '𓐍𓂤𓅱 𓈖 𓊵𓏏𓊪𓅆',
    recommendedStartTextId: 'Egy-Ptah-1',
    corpusStatus: 'sample',
    supportsMorphology: false,
    supportsTransliteration: true,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    supportsAiAnalysis: true,
    hasScriptLearning: true,
    audioProvider: undefined,
    reconstructionNote: undefined,
    color: '#B45309',
    tokenizationHints: { wordBoundaries: 'none' },
    dictionaryHints: { dictionaries: [], hasCorpusGlosses: false },
  },
  {
    id: 'hit',
    name: 'Hittite',
    nativeName: '𒉈𒅆𒇷',
    shortName: 'Hittite',
    icon: '𒀭',
    symbol: '𒀭',
    direction: 'ltr',
    scripts: ['Cuneiform'],
    era: 'c. 1600 BC – 1180 BC',
    region: 'Anatolia',
    writingSystem: 'Cuneiform',
    description: 'An extinct Indo-European language spoken by the Hittites in Anatolia.',
    sampleText: 'UM-MA dUTU-ŠI m',
    recommendedStartTextId: 'Hit-Annals-1',
    corpusStatus: 'sample',
    supportsMorphology: false,
    supportsTransliteration: true,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    supportsAiAnalysis: true,
    hasScriptLearning: true,
    audioProvider: undefined,
    reconstructionNote: undefined,
    color: '#78716C',
    tokenizationHints: { wordBoundaries: 'whitespace' },
    dictionaryHints: { dictionaries: [], hasCorpusGlosses: false },
  },
  {
    id: 'uga',
    name: 'Ugaritic',
    nativeName: '𐎀𐎃𐎗𐎚',
    shortName: 'Ugaritic',
    icon: '𐎁',
    symbol: '𐎁',
    direction: 'ltr',
    scripts: ['Ugaritic', 'Latin (transliteration)'],
    era: 'c. 1400 BC – 1200 BC',
    region: 'Ugarit (modern Ras Shamra, Syria)',
    writingSystem: 'Ugaritic Cuneiform Alphabet',
    description:
      'A Northwest Semitic language attested in the ancient city of Ugarit, closely related to Biblical Hebrew and Phoenician. Known primarily from the Baal Cycle and other mythological texts.',
    sampleText: '𐎁𐎓𐎍 𐎎𐎍𐎋 𐎀𐎍𐎛𐎊𐎐',
    recommendedStartTextId: 'Uga-Baal-1',
    corpusStatus: 'sample',
    supportsMorphology: false,
    supportsTransliteration: true,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    supportsAiAnalysis: true,
    hasScriptLearning: true,
    audioProvider: undefined,
    reconstructionNote:
      'Ugaritic is fully deciphered. Texts shown in native script with Latin transliteration.',
    color: '#0E7490',
    tokenizationHints: { wordBoundaries: 'whitespace' },
    dictionaryHints: { dictionaries: [], hasCorpusGlosses: false },
  },
];

export const LANGUAGE_IDS = [
  'grc',
  'grc-koine',
  'hbo',
  'lat',
  'syr',
  'cop',
  'arc',
  'akk',
  'san',
  'egy',
  'hit',
  'uga',
] as const;

export type KnownLanguageId = (typeof LANGUAGE_IDS)[number];

export function getLanguageById(languageId: LanguageId): Language | undefined {
  return LANGUAGES.find((l) => l.id === languageId);
}

export function getAvailableLanguages(): Language[] {
  return LANGUAGES;
}

export function getLanguageDirection(languageId: string): ScriptDirection {
  return LANGUAGES.find((l) => l.id === languageId)?.direction || 'ltr';
}

export function getLanguageDisplayName(languageId: string): string {
  return LANGUAGES.find((l) => l.id === languageId)?.name || languageId;
}

export function getLanguageNativeName(languageId: string): string | undefined {
  return LANGUAGES.find((l) => l.id === languageId)?.nativeName;
}

export function isRtlLanguage(languageId: string): boolean {
  return getLanguageDirection(languageId) === 'rtl';
}

export function getLanguageIcon(languageId: string): string {
  return LANGUAGES.find((l) => l.id === languageId)?.icon || '🌐';
}

export function isSupportedLanguage(languageId: string): languageId is KnownLanguageId {
  return LANGUAGE_IDS.includes(languageId as KnownLanguageId);
}
