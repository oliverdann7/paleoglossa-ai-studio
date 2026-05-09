import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translations
const resources = {
  en: {
    translation: {
      "dashboard.welcome": "Welcome back",
      "dashboard.wordsLearned": "Words Learned",
      "dashboard.accuracy": "Accuracy",
      "dashboard.reviewQueue": "Review Queue",
      "dashboard.wordsReady": "Words ready for reinforcement.",
      "dashboard.startReview": "Start Review Session",
      "dashboard.allCaughtUp": "All Caught Up",
      "dashboard.continueReading": "Continue Reading",
      "dashboard.recentWords": "Recently Encountered",
      "dashboard.viewVocab": "View Vocabulary",

      "library.title": "Library",
      "library.search": "Search texts...",
      "library.recent": "Recent",
      "library.allTexts": "All Texts",

      "reader.markKnowledge": "Mark your knowledge",
      "reader.markKnown": "Mark Known",
      "reader.markLearning": "Mark Learning",
      "reader.markIgnored": "Ignore",
      
      "vocab.title": "Vocabulary",
      "vocab.search": "Search words...",
      "vocab.known": "Known",
      "vocab.learning": "Learning",
      "vocab.familiar": "Familiar",
      "vocab.term": "Term",
      "vocab.definition": "Definition",
      "vocab.status": "Status",
      "vocab.nextReview": "Next Review",

      "review.session": "Review Session",
      "review.remaining": "Remaining",
      "review.reveal": "Reveal Answer",
      "review.again": "Again",
      "review.hard": "Hard",
      "review.good": "Good",
      "review.easy": "Easy",
      "review.complete": "Session Complete",
      "review.reviewed": "words reviewed",
      "review.back": "Back to Dashboard",

      "stats.title": "Statistics",
      "stats.learningCurve": "Learning Curve",
      "stats.languages": "Language Breakdown",

      "nav.dashboard": "Dashboard",
      "nav.library": "Library",
      "nav.review": "Review",
      "nav.vocabulary": "Vocabulary",
      "nav.statistics": "Statistics",
      "nav.import": "Import",
      "nav.settings": "Settings",
      "nav.upgrade": "Upgrade",
      "nav.home": "Home",
      "nav.words": "Words",
      "nav.more": "More",
      "settings.title": "Settings",
      "settings.language": "App Language",
      "settings.danger": "Danger Zone",
      "settings.reset": "Reset All Data",
      "settings.resetConfirm": "Erase all knowledge and streaks"
    }
  },
  es: {
    translation: {
      "dashboard.welcome": "Bienvenido de nuevo",
      "dashboard.wordsLearned": "Palabras Aprendidas",
      "dashboard.accuracy": "Precisión",
      "dashboard.reviewQueue": "Cola de Repaso",
      "dashboard.wordsReady": "Palabras listas para reforzar.",
      "dashboard.startReview": "Comenzar Repaso",
      "dashboard.allCaughtUp": "Todo al día",
      "dashboard.continueReading": "Continuar Leyendo",
      "dashboard.recentWords": "Encontradas Recientemente",
      "dashboard.viewVocab": "Ver Vocabulario",

      "library.title": "Biblioteca",
      "library.search": "Buscar textos...",
      "library.recent": "Reciente",
      "library.allTexts": "Todos los Textos",

      "reader.markKnowledge": "Marca tu conocimiento",
      "reader.markKnown": "Conocido",
      "reader.markLearning": "Aprendiendo",
      "reader.markIgnored": "Ignorar",

      "vocab.title": "Vocabulario",
      "vocab.search": "Buscar palabras...",
      "vocab.known": "Conocido",
      "vocab.learning": "Aprendiendo",
      "vocab.familiar": "Familiar",
      "vocab.term": "Término",
      "vocab.definition": "Definición",
      "vocab.status": "Estado",
      "vocab.nextReview": "Próximo Repaso",

      "review.session": "Sesión de Repaso",
      "review.remaining": "Restantes",
      "review.reveal": "Mostrar Respuesta",
      "review.again": "Otra vez",
      "review.hard": "Difícil",
      "review.good": "Bien",
      "review.easy": "Fácil",
      "review.complete": "Sesión Completa",
      "review.reviewed": "palabras repasadas",
      "review.back": "Volver al Inicio",

      "stats.title": "Estadísticas",
      "stats.learningCurve": "Curva de Aprendizaje",
      "stats.languages": "Desglose de Idiomas",

      "nav.dashboard": "Inicio",
      "nav.library": "Biblioteca",
      "nav.review": "Repaso",
      "nav.vocabulary": "Vocabulario",
      "nav.statistics": "Estadísticas",
      "nav.import": "Importar",
      "nav.settings": "Ajustes",
      "nav.upgrade": "Mejorar",
      "nav.home": "Inicio",
      "nav.words": "Palabras",
      "nav.more": "Más",
      "settings.title": "Ajustes",
      "settings.language": "Idioma de la App",
      "settings.danger": "Zona de Peligro",
      "settings.reset": "Restablecer Todos los Datos",
      "settings.resetConfirm": "Borrar todo el conocimiento y rachas"
    }
  }
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
