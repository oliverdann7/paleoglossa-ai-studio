import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './translations/en';
import { es } from './translations/es';
import { de } from './translations/de';
import { pt } from './translations/pt';
import { fr } from './translations/fr';
import { ru } from './translations/ru';
import { zh } from './translations/zh';

// Translations
const resources = {
  en, es, de, pt, fr, ru, zh
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: localStorage.getItem("app_lang") || "en", // language to use
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
