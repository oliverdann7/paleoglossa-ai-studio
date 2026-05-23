import type { TextSection, Sentence } from '../../types/corpus.js';

function sent(id: string, words: string[], translation: string, lemmaGloss?: Record<string, { lemma: string; gloss: string }>): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;:!?()"«»—–]+|[\s.,;:!?()"«»—–]+$/g, '');
      const punctAfter = w.slice(clean.length) || ' ';
      const normalized = clean.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      const mapped = lemmaGloss?.[clean];
      return {
        id: `${id}-t${i}`,
        surface: w,
        normalized,
        lemma: mapped?.lemma || normalized,
        gloss: mapped?.gloss || '',
        morphology: { partOfSpeech: 'unknown' },
        punctBefore: '',
        punctAfter: punctAfter.trim() ? punctAfter + ' ' : ' ',
      };
    }),
    translation,
  };
}

const AKK_GLOSS: Record<string, { lemma: string; gloss: string }> = {
  'iš-pur-rak-ku-nu-ši': { lemma: 'šapāru', gloss: 'he will send to you' },
  'i-na': { lemma: 'ina', gloss: 'in, on' },
  'e-ma-ru-ti-šu': { lemma: 'emāru', gloss: 'his wisdom' },
  'šá': { lemma: 'ša', gloss: 'of, which' },
  'a-na': { lemma: 'ana', gloss: 'to, for' },
  'šá-šu-nu': { lemma: 'šâšunu', gloss: 'to them' },
  'i-šap-pa-ru': { lemma: 'šapāru', gloss: 'he commands' },
  'mu-up-pal-sí': { lemma: 'muppalsu', gloss: 'dream interpreter' },
  'te-er-šú-nu': { lemma: 'tērtu', gloss: 'send for their oracle' },
  'ka-a-ri': { lemma: 'kāru', gloss: 'quay, harbor' },
  'na-di': { lemma: 'nadû', gloss: 'is placed' },
  'pa-rak-ku': { lemma: 'parakku', gloss: 'shrine' },
  'dIR-RA': { lemma: 'Irra', gloss: 'god Irra' },
  'qá-bu-ú': { lemma: 'qabû', gloss: 'dedicated' },
  'dGUD': { lemma: 'GUD', gloss: 'god GUD (Enlil)' },
  'ú-šad-di-ḫu': { lemma: 'šadāḫu', gloss: 'they drive away' },
  'ip-pa-rak': { lemma: 'parāku', gloss: 'he will block' },
  'ša₂': { lemma: 'ša', gloss: 'of, which' },
  'pi-i': { lemma: 'pû', gloss: 'mouth' },
  'pe-e-tu-ú': { lemma: 'petû', gloss: 'opens' },
  'nap-šá-tu': { lemma: 'napištu', gloss: 'life, throat' },
  'pu-ut-ru': { lemma: 'paṭāru', gloss: 'release' },
  'ip-šú-šú': { lemma: 'epēšu', gloss: 'his deed' },
  'zi-qi-qi': { lemma: 'ziqīqu', gloss: 'wind, ghost' },
  'ú-še-la-a': { lemma: 'elû', gloss: 'they lifted' },
  'ni-iš': { lemma: 'nīš', gloss: 'weapon of' },
  'ka-ak-kí': { lemma: 'kakku', gloss: 'weapon' },
  'i-nu': { lemma: 'inū', gloss: 'when' },
  'ṣi-ru-um': { lemma: 'ṣīrum', gloss: 'lofty' },
  'šar': { lemma: 'šarru', gloss: 'king' },
  'da-ri-im': { lemma: 'dārum', gloss: 'eternal' },
  'ra-bu-ú': { lemma: 'rabû', gloss: 'great' },
  'ma-tim': { lemma: 'mātu', gloss: 'land, country' },
  'šu-pu-ú': { lemma: 'šūpû', gloss: 'illustrious' },
  'mi-ša-ri-im': { lemma: 'mīšaru', gloss: 'justice' },
  'ša-ka-a-nim': { lemma: 'šakānu', gloss: 'to establish' },
  'da-ni-nim': { lemma: 'dannu', gloss: 'mighty, strong' },
  'šu-ḫu-zi-im': { lemma: 'šuḫuzu', gloss: 'to prevent' },
  'ḫa-ab-lim': { lemma: 'ḫablum', gloss: 'the weak' },
  'e-ni-im': { lemma: 'enû', gloss: 'to change, oppose' },
  'en-šim': { lemma: 'enšu', gloss: 'weak' },
  'la': { lemma: 'lā', gloss: 'not' },
  'na-da-nim': { lemma: 'nadānu', gloss: 'to give, allow' },
  'ḫa-am-mu-ra-pi': { lemma: 'Ḫammurapi', gloss: 'Hammurabi' },
  'ru-ba-am': { lemma: 'rubû', gloss: 'prince' },
  'na-’i-dam': { lemma: "nā'idu", gloss: 'reverent' },
  'pa-li-iḫ': { lemma: 'palāḫu', gloss: 'fearing, revering' },
  'i-li': { lemma: 'ilu', gloss: 'gods' },
  'ki-it-tam': { lemma: 'kittu', gloss: 'truth, justice' },
  'u': { lemma: 'u', gloss: 'and' },
  'mi-ša-ram': { lemma: 'mīšaru', gloss: 'justice' },
  'ki-ib-ra-at': { lemma: 'kibrātu', gloss: 'regions' },
  'er-bé-tim': { lemma: 'erbet', gloss: 'four' },
  'ú-ša-ar-di': { lemma: 'šarādu', gloss: 'he made appear' },
};

export const AKK_GILGAMESH_2: TextSection = {
  id: 'Akk-Gilg-2',
  textId: 'Akk-Gilg-1',
  sequence: 2,
  label: 'Tablet II — The Coming of Enkidu',
  sentences: [
    sent(
      'Akk-Gilg-2-1',
      ['iš-pur-rak-ku-nu-ši', 'i-na', 'e-ma-ru-ti-šu', 'šá', 'a-na', 'šá-šu-nu', 'i-šap-pa-ru', 'a-na', 'mu-up-pal-sí', 'te-er-šú-nu'],
      'He will send to you, in his wisdom, that which he commands to them — send for the dream interpreter.',
      AKK_GLOSS
    ),
    sent(
      'Akk-Gilg-2-2',
      ['i-na', 'ka-a-ri', 'na-di', 'pa-rak-ku', 'šá', 'a-na', 'dIR-RA', 'qá-bu-ú', 'a-na', 'dGUD', 'ú-šad-di-ḫu', 'ip-pa-rak'],
      'In the quay stands a shrine. For the god Irra it is dedicated. The bull they will drive away.',
      AKK_GLOSS
    ),
    sent(
      'Akk-Gilg-2-3',
      ['ša₂', 'pi-i', 'pe-e-tu-ú', 'nap-šá-tu', 'pu-ut-ru', 'ip-šú-šú', 'a-na', 'zi-qi-qi', 'ú-še-la-a', 'ni-iš', 'ka-ak-kí'],
      'He who opens the mouth, releases life, his deed to the wind they lifted the weapon.',
      AKK_GLOSS
    ),
  ],
};

export const AKK_HAMMURABI_1: TextSection = {
  id: 'Akk-Ham-1',
  textId: 'Akk-Ham',
  sequence: 1,
  label: 'Prologue — Anum and Enlil',
  sentences: [
    sent(
      'Akk-Ham-1-1',
      ['i-nu', 'Anum', 'ṣi-ru-um', 'šar', 'da-ri-im', 'šá', 'ki-ma', 'ša-me-e', 'ra-bu-ú', 'i-na', 'ma-tim', 'šu-pu-ú'],
      'When the lofty Anum, king of the Anunnaki, and Enlil, lord of heaven and earth, who determines the destinies of the land...',
      AKK_GLOSS
    ),
    sent(
      'Akk-Ham-1-2',
      ['a-na', 'mi-ša-ri-im', 'ša-ka-a-nim', 'da-ni-nim', 'šu-ḫu-zi-im', 'a-na', 'ḫa-ab-lim', 'e-ni-im', 'da-nim', 'en-šim', 'a-na', 'ḫa-ab-li-šu', 'la', 'na-da-nim'],
      'To establish justice in the land, to destroy the wicked and the evil, to prevent the strong from oppressing the weak...',
      AKK_GLOSS
    ),
    sent(
      'Akk-Ham-1-3',
      ['ḫa-am-mu-ra-pi', 'ru-ba-am', 'na-’i-dam', 'pa-li-iḫ', 'i-li', 'ki-it-tam', 'u', 'mi-ša-ram', 'a-na', 'ki-ib-ra-at', 'er-bé-tim', 'ú-ša-ar-di'],
      'Hammurabi, the reverent prince, who fears the gods, to make justice appear in the land, to destroy the wicked and the evil, so that the strong might not harm the weak.',
      AKK_GLOSS
    ),
  ],
};

export const ALL_AKKADIAN_EXTENDED_SECTIONS: TextSection[] = [AKK_GILGAMESH_2, AKK_HAMMURABI_1];
