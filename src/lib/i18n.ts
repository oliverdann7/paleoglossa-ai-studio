import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './translations/en.js';

const SUPPORTED_LANGS = ['en', 'es', 'de', 'pt', 'fr', 'ru', 'zh', 'tr'] as const;
type SupportedLang = (typeof SUPPORTED_LANGS)[number];

function resolveInitialLanguage(): SupportedLang {
  // 1. Explicit user choice saved in localStorage
  const saved = localStorage.getItem('app_lang');
  if (saved && SUPPORTED_LANGS.includes(saved as SupportedLang)) return saved as SupportedLang;
  // 2. Browser / OS system language (e.g. "tr-TR" → "tr", "en-US" → "en")
  const browserLang = (navigator.language || '').split('-')[0].toLowerCase();
  if (SUPPORTED_LANGS.includes(browserLang as SupportedLang)) return browserLang as SupportedLang;
  // 3. Fall back to English
  return 'en';
}

type TranslationModule = { [key in SupportedLang]?: { translation: Record<string, string> } };

// Only English is bundled. All other languages are lazy-loaded on demand.
const LAZY_LOADERS: Partial<Record<SupportedLang, () => Promise<TranslationModule>>> = {
  es: () => import('./translations/es.js') as Promise<TranslationModule>,
  de: () => import('./translations/de.js') as Promise<TranslationModule>,
  pt: () => import('./translations/pt.js') as Promise<TranslationModule>,
  fr: () => import('./translations/fr.js') as Promise<TranslationModule>,
  ru: () => import('./translations/ru.js') as Promise<TranslationModule>,
  zh: () => import('./translations/zh.js') as Promise<TranslationModule>,
  tr: () => import('./translations/tr.js') as Promise<TranslationModule>,
};

i18n.use(initReactI18next).init({
  resources: { en },
  lng: resolveInitialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

async function addBundle(lang: SupportedLang): Promise<void> {
  const loader = LAZY_LOADERS[lang];
  if (!loader) return;
  const mod = await loader();
  const bundle = mod[lang];
  if (bundle?.translation) {
    i18n.addResourceBundle(lang, 'translation', bundle.translation, true, true);
  }
}

// Load the initial language bundle if it's not English
const initialLang = resolveInitialLanguage();
if (initialLang !== 'en') {
  addBundle(initialLang);
}

// Called from Settings/Switcher when the user changes language
export async function loadLanguage(lang: SupportedLang): Promise<void> {
  if (lang === 'en' || i18n.hasResourceBundle(lang, 'translation')) return;
  await addBundle(lang);
}

export default i18n;
