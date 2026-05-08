import type { Language } from '@/types/linguistics';

export type ScriptKind = 'Greek' | 'Hebrew' | 'Latin' | 'Syriac' | 'Coptic';

export interface LanguageDefinition {
  code: Language;
  label: string;
  shortLabel: string;
  script: ScriptKind;
  direction: 'ltr' | 'rtl';
  importable: boolean;
  filterable: boolean;
}

export const LANGUAGE_DEFINITIONS: Record<Language, LanguageDefinition> = {
  grc: {
    code: 'grc',
    label: 'Ancient Greek',
    shortLabel: 'Greek',
    script: 'Greek',
    direction: 'ltr',
    importable: true,
    filterable: true
  },
  'grc-koine': {
    code: 'grc-koine',
    label: 'Koine Greek',
    shortLabel: 'Koine',
    script: 'Greek',
    direction: 'ltr',
    importable: true,
    filterable: true
  },
  hbo: {
    code: 'hbo',
    label: 'Biblical Hebrew',
    shortLabel: 'Hebrew',
    script: 'Hebrew',
    direction: 'rtl',
    importable: true,
    filterable: true
  },
  lat: {
    code: 'lat',
    label: 'Classical Latin',
    shortLabel: 'Latin',
    script: 'Latin',
    direction: 'ltr',
    importable: true,
    filterable: true
  },
  syr: {
    code: 'syr',
    label: 'Classical Syriac',
    shortLabel: 'Syriac',
    script: 'Syriac',
    direction: 'rtl',
    importable: true,
    filterable: true
  },
  cop: {
    code: 'cop',
    label: 'Coptic',
    shortLabel: 'Coptic',
    script: 'Coptic',
    direction: 'ltr',
    importable: true,
    filterable: true
  }
};

export const CORE_LEARNING_LANGUAGES = Object.values(LANGUAGE_DEFINITIONS);
export const IMPORTABLE_LANGUAGES = CORE_LEARNING_LANGUAGES.filter(language => language.importable);
export const FILTERABLE_LANGUAGES = CORE_LEARNING_LANGUAGES.filter(language => language.filterable);

const LANGUAGE_ALIASES: Record<string, Language> = {
  greek: 'grc',
  ancientgreek: 'grc',
  'ancient greek': 'grc',
  classicalgreek: 'grc',
  'classical greek': 'grc',
  koine: 'grc-koine',
  koinegreek: 'grc-koine',
  'koine greek': 'grc-koine',
  sblgnt: 'grc-koine',
  biblicalgreek: 'grc-koine',
  'biblical greek': 'grc-koine',
  hebrew: 'hbo',
  biblicalhebrew: 'hbo',
  'biblical hebrew': 'hbo',
  latin: 'lat',
  classicallatin: 'lat',
  'classical latin': 'lat',
  syriac: 'syr',
  classicalsyriac: 'syr',
  'classical syriac': 'syr',
  coptic: 'cop'
};

export const normalizeLanguageCode = (language?: string): Language => {
  const normalized = (language || '').trim().toLowerCase();
  if (normalized in LANGUAGE_DEFINITIONS) return normalized as Language;
  const compact = normalized.replace(/[\s_-]+/g, '');
  return LANGUAGE_ALIASES[normalized] || LANGUAGE_ALIASES[compact] || 'grc-koine';
};

export const getLanguageMeta = (language?: string): LanguageDefinition => {
  return LANGUAGE_DEFINITIONS[normalizeLanguageCode(language)];
};

export const getLanguageLabel = (language?: string): string => getLanguageMeta(language).label;
export const getLanguageDirection = (language?: string): 'ltr' | 'rtl' => getLanguageMeta(language).direction;

export const detectLemmaLanguage = (lemma: string): Language => {
  if (/[\u0590-\u05FF]/.test(lemma)) return 'hbo';
  if (/[\u0700-\u074F]/.test(lemma)) return 'syr';
  if (/[\u2C80-\u2CFF]/.test(lemma)) return 'cop';
  if (/[\u0370-\u03FF\u1F00-\u1FFF]/.test(lemma)) return 'grc-koine';
  if (/[A-Za-z]/.test(lemma)) return 'lat';
  return 'grc-koine';
};
