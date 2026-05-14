export {
  LANGUAGES,
  LANGUAGE_IDS,
  LANGUAGE_REGISTRY,
  getLanguageById,
  getAvailableLanguages,
  getLanguageDirection,
  getLanguageDisplayName,
  getLanguageNativeName,
  isRtlLanguage,
  getLanguageIcon,
  isSupportedLanguage,
} from '../languages/registry';
export type { Language, TokenizationHints, DictionaryHints, KnownLanguageId } from '../languages/registry';
