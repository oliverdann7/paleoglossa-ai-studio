import type { LanguageId, ScriptDirection } from '../../types/linguistics';

export interface Language {
  id: LanguageId;
  name: string;
  shortName: string;
  icon: string;
  symbol: string;
  direction: ScriptDirection;
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
  audioProvider?: string;
  reconstructionNote?: string;
  color?: string;
}

export const LANGUAGES: Language[] = [
  {
    id: "grc",
    name: "Ancient Greek",
    shortName: "Greek",
    icon: "α",
    symbol: "α",
    direction: "ltr",
    era: "c. 1500 BC – 300 BC",
    region: "Ancient Greece",
    writingSystem: "Greek Alphabet",
    description: "The language of Homer, Plato, and the New Testament.",
    sampleText: "μῆνιν ἄειδε θεὰ Πηληϊάδεω Ἀχιλῆος",
    recommendedStartTextId: "Jn-1",
    corpusStatus: "available",
    supportsMorphology: true,
    supportsTransliteration: true,
    supportsTTS: true,
    supportsPronunciationGuide: true,
    audioProvider: "gemini",
    reconstructionNote: undefined,
    color: "#2563EB",
  },
  {
    id: "grc-koine",
    name: "Koine Greek",
    shortName: "Koine",
    icon: "Ω",
    symbol: "Ω",
    direction: "ltr",
    era: "c. 300 BC – AD 300",
    region: "Mediterranean & Middle East",
    writingSystem: "Greek Alphabet",
    description: "The common Greek spoken and written during the Hellenistic period, the Roman Empire, and the early Byzantine Empire.",
    sampleText: "Ἐν ἀρχῇ ἦν ὁ λόγος",
    recommendedStartTextId: "Jn-1",
    corpusStatus: "available",
    supportsMorphology: true,
    supportsTransliteration: true,
    supportsTTS: true,
    supportsPronunciationGuide: true,
    audioProvider: "gemini",
    reconstructionNote: undefined,
    color: "#059669",
  },
  {
    id: "hbo",
    name: "Biblical Hebrew",
    shortName: "Hebrew",
    icon: "א",
    symbol: "א",
    direction: "rtl",
    era: "c. 1000 BC – 100 AD",
    region: "Ancient Israel / Levant",
    writingSystem: "Hebrew Alphabet (abjad)",
    description: "The archaic form of the Hebrew language, in which the Hebrew Bible is written.",
    sampleText: "בְּרֵאשִׁית בָּרָא אֱלֹהִים",
    recommendedStartTextId: "Gen",
    corpusStatus: "available",
    supportsMorphology: true,
    supportsTransliteration: true,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    audioProvider: undefined,
    reconstructionNote: undefined,
    color: "#D97706",
  },
  {
    id: "lat",
    name: "Classical Latin",
    shortName: "Latin",
    icon: "V",
    symbol: "V",
    direction: "ltr",
    era: "c. 75 BC – AD 300",
    region: "Roman Empire",
    writingSystem: "Latin Alphabet",
    description: "The standard register of the Latin language of the Roman classical period.",
    sampleText: "Arma virumque cano",
    recommendedStartTextId: "Aeneid-1",
    corpusStatus: "available",
    supportsMorphology: true,
    supportsTransliteration: false,
    supportsTTS: true,
    supportsPronunciationGuide: true,
    audioProvider: "gemini",
    reconstructionNote: undefined,
    color: "#7C3AED",
  },
  {
    id: "syr",
    name: "Syriac",
    shortName: "Syriac",
    icon: "ܣ",
    symbol: "ܣ",
    direction: "rtl",
    era: "1st century AD – Present",
    region: "Fertile Crescent",
    writingSystem: "Syriac Alphabet (abjad)",
    description: "A dialect of Middle Aramaic that was once spoken across much of the Fertile Crescent and Eastern Arabia.",
    sampleText: "ܒܪܫܝܬ ܐܝܬܘܗܝ ܗܘܐ ܡܠܬܐ",
    recommendedStartTextId: "Syr-Jn-1",
    corpusStatus: "sample",
    supportsMorphology: false,
    supportsTransliteration: false,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    audioProvider: undefined,
    reconstructionNote: undefined,
    color: "#DC2626",
  },
  {
    id: "cop",
    name: "Coptic",
    shortName: "Coptic",
    icon: "ⲱ",
    symbol: "ⲱ",
    direction: "ltr",
    era: "2nd century AD – Present (Liturgical)",
    region: "Egypt",
    writingSystem: "Coptic Alphabet",
    description: "The latest stage of the Egyptian language, a northern Afroasiatic language spoken in Egypt until at least the 17th century.",
    sampleText: "ϩⲛ ⲧⲉϩⲟⲩⲓⲧⲉ ⲛⲉϥϣⲟⲟⲡ ⲛϭⲓ ⲡϣⲁϫⲉ",
    recommendedStartTextId: "Cop-Jn-1",
    corpusStatus: "sample",
    supportsMorphology: false,
    supportsTransliteration: false,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    audioProvider: undefined,
    reconstructionNote: undefined,
    color: "#0891B2",
  },
  {
    id: "arc",
    name: "Aramaic",
    shortName: "Aramaic",
    icon: "𐡀",
    symbol: "𐡀",
    direction: "rtl",
    era: "c. 3000 BC – Present",
    region: "Near East",
    writingSystem: "Aramaic Alphabet (abjad)",
    description: "An ancient language belonging to the Northwest Semitic group of the Afroasiatic language family.",
    sampleText: "ܐܒܘܢ ܕܒܫܡܝܐ",
    recommendedStartTextId: "Arc-Gen-1",
    corpusStatus: "sample",
    supportsMorphology: false,
    supportsTransliteration: false,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    audioProvider: undefined,
    reconstructionNote: undefined,
    color: "#CA8A04",
  },
  {
    id: "akk",
    name: "Akkadian",
    shortName: "Akkadian",
    icon: "𒀭",
    symbol: "𒀭",
    direction: "ltr",
    era: "c. 2500 BC – 100 AD",
    region: "Mesopotamia",
    writingSystem: "Cuneiform (logo-syllabic)",
    description: "An extinct East Semitic language that was spoken in ancient Mesopotamia.",
    sampleText: "𒀭 𒂗 𒆤",
    recommendedStartTextId: "Akk-Gilg-1",
    corpusStatus: "sample",
    supportsMorphology: false,
    supportsTransliteration: true,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    audioProvider: undefined,
    reconstructionNote: undefined,
    color: "#9333EA",
  },
  {
    id: "san",
    name: "Sanskrit",
    shortName: "Sanskrit",
    icon: "अ",
    symbol: "अ",
    direction: "ltr",
    era: "c. 1500 BC – Present",
    region: "South Asia",
    writingSystem: "Devanagari (abugida)",
    description: "An ancient Indo-Aryan language that is the classical language of India and of Hinduism.",
    sampleText: "धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः",
    recommendedStartTextId: "San-Gita-1",
    corpusStatus: "sample",
    supportsMorphology: false,
    supportsTransliteration: true,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    audioProvider: undefined,
    reconstructionNote: undefined,
    color: "#E11D48",
  },
  {
    id: "egy",
    name: "Egyptian Hieroglyphs",
    shortName: "Egyptian",
    icon: "𓂋",
    symbol: "𓂋",
    direction: "ltr",
    era: "c. 3200 BC – AD 400",
    region: "Ancient Egypt",
    writingSystem: "Hieroglyphs",
    description: "The formal writing system used in Ancient Egypt, featuring a combination of logographic, syllabic and alphabetic elements.",
    sampleText: "𓐍𓂤𓅱 𓈖 𓊵𓏏𓊪𓅆",
    recommendedStartTextId: "Egy-Ptah-1",
    corpusStatus: "sample",
    supportsMorphology: false,
    supportsTransliteration: true,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    audioProvider: undefined,
    reconstructionNote: undefined,
    color: "#B45309",
  },
  {
    id: "hit",
    name: "Hittite",
    shortName: "Hittite",
    icon: "𒀭",
    symbol: "𒀭",
    direction: "ltr",
    era: "c. 1600 BC – 1180 BC",
    region: "Anatolia",
    writingSystem: "Cuneiform",
    description: "An extinct Indo-European language spoken by the Hittites in Anatolia.",
    sampleText: "UM-MA dUTU-ŠI m",
    recommendedStartTextId: "Hit-Annals-1",
    corpusStatus: "sample",
    supportsMorphology: false,
    supportsTransliteration: true,
    supportsTTS: false,
    supportsPronunciationGuide: true,
    audioProvider: undefined,
    reconstructionNote: undefined,
    color: "#78716C",
  },
];

export function getLanguageById(languageId: LanguageId): Language | undefined {
  return LANGUAGES.find(l => l.id === languageId);
}

export function getAvailableLanguages(): Language[] {
  return LANGUAGES;
}

export function getLanguageDirection(languageId: string): ScriptDirection {
  return LANGUAGES.find(l => l.id === languageId)?.direction || 'ltr';
}

export function getLanguageDisplayName(languageId: string): string {
  return LANGUAGES.find(l => l.id === languageId)?.name || languageId;
}

export function isRtlLanguage(languageId: string): boolean {
  return getLanguageDirection(languageId) === 'rtl';
}

export function getLanguageIcon(languageId: string): string {
  return LANGUAGES.find(l => l.id === languageId)?.icon || '🌐';
}
