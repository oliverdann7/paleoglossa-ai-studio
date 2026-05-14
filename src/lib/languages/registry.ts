import {
  LANGUAGES,
  LANGUAGE_IDS,
  getLanguageById,
  getAvailableLanguages,
  getLanguageDirection,
  getLanguageDisplayName,
  getLanguageNativeName,
  isRtlLanguage,
  getLanguageIcon,
  isSupportedLanguage,
} from '../data/languages';

export type { Language, TokenizationHints, DictionaryHints, KnownLanguageId } from '../data/languages';

export const LANGUAGE_REGISTRY = Object.fromEntries(
  LANGUAGES.map(lang => [lang.id, lang]),
) as Record<(typeof LANGUAGE_IDS)[number], (typeof LANGUAGES)[number]>;

export {
  LANGUAGES,
  LANGUAGE_IDS,
  getLanguageById,
  getAvailableLanguages,
  getLanguageDirection,
  getLanguageDisplayName,
  getLanguageNativeName,
  isRtlLanguage,
  getLanguageIcon,
  isSupportedLanguage,
};
