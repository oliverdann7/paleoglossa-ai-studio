import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './translations/en.js';
import { es } from './translations/es.js';
import { de } from './translations/de.js';
import { pt } from './translations/pt.js';
import { fr } from './translations/fr.js';
import { ru } from './translations/ru.js';
import { zh } from './translations/zh.js';
import { tr } from './translations/tr.js';

const SUPPORTED_LANGS = ['en', 'es', 'de', 'pt', 'fr', 'ru', 'zh', 'tr'] as const;

function resolveInitialLanguage(): string {
  // 1. Explicit user choice saved in localStorage
  const saved = localStorage.getItem('app_lang');
  if (saved && SUPPORTED_LANGS.includes(saved as any)) return saved;
  // 2. Browser / OS system language (e.g. "tr-TR" → "tr", "en-US" → "en")
  const browserLang = (navigator.language || '').split('-')[0].toLowerCase();
  if (SUPPORTED_LANGS.includes(browserLang as any)) return browserLang;
  // 3. Fall back to English
  return 'en';
}

const resources = {
  en,
  es,
  de,
  pt,
  fr,
  ru,
  zh,
  tr,
};

i18n.use(initReactI18next).init({
  resources,
  lng: resolveInitialLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
