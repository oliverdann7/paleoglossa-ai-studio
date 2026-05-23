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

const HIT_GLOSS: Record<string, { lemma: string; gloss: string }> = {
  'ma-a-an': { lemma: 'mān', gloss: 'when, if' },
  'ke-e-da-ni': { lemma: 'kēdani', gloss: 'this (dat.)' },
  'MU-ti': { lemma: 'MUD', gloss: 'year (dat.)' },
  'ku-it-ma-an': { lemma: 'kuitman', gloss: 'while, until' },
  'I-NA': { lemma: 'ina', gloss: 'in (Sumerian)' },
  'KUR': { lemma: 'KUR', gloss: 'land' },
  'URUDa-at-ti': { lemma: 'URUDatt', gloss: 'Hatti' },
  'e-šu-un': { lemma: 'eš-', gloss: 'I was' },
  'nu': { lemma: 'nu', gloss: 'and, now' },
  'KUR-e': { lemma: 'KUR', gloss: 'the land' },
  'ŠA': { lemma: 'ŠA', gloss: 'of (Sumerian)' },
  'URUPa-ḫḫu-wa': { lemma: 'Pahhuwa', gloss: 'Pahhuwa' },
  'LÚKÚR': { lemma: 'LÚKÚR', gloss: 'enemy' },
  'URUŠa-ap-pí-da': { lemma: 'URUSappida', gloss: 'Sappida' },
  'da-a-aš': { lemma: 'dā-', gloss: 'took' },
  'iš-ta-an-da-aš': { lemma: 'istanda', gloss: 'away, off' },
  'pa-a-iš': { lemma: 'pai-', gloss: 'went' },
  'dUTU-ŠI': { lemma: 'UTU-ŠI', gloss: 'My Majesty, the Sun' },
  'ka-a-aš': { lemma: 'kāš', gloss: 'this (nom.)' },
  'pa-a-un': { lemma: 'pai-', gloss: 'I went' },
  'URUPa-la-a': { lemma: 'Pala', gloss: 'Pala' },
  'ú-e-mi-ia-nu-un': { lemma: 'wemiya-', gloss: 'I found' },
  'ša-an': { lemma: '-šan', gloss: '(particle)' },
  'a-ki-ir': { lemma: 'ak-', gloss: 'they died' },
  'ku-ut-ta-an-ni-iš-ši-ma': { lemma: 'kuttan', gloss: 'in the border region' },
  'an-da': { lemma: 'anda', gloss: 'into, in' },
  'URUGa-aš-ga': { lemma: 'URUGasga', gloss: 'Gasga' },
  'ú-it': { lemma: 'uwa-', gloss: 'came' },
  'ú-da-a-aš': { lemma: 'uda-', gloss: 'brought' },
  'Mursili': { lemma: 'Mursili', gloss: 'Mursili' },
  'LUGAL.GAL': { lemma: 'LUGAL.GAL', gloss: 'Great King' },
  'IR': { lemma: 'IR', gloss: 'servant' },
  'QA-TAM-MA': { lemma: 'QATAMMA', gloss: 'thus, likewise' },
  'te-eḫ-ḫi': { lemma: 'te-', gloss: 'I speak, declare' },
  'URUA-ri-in-na': { lemma: 'Arinna', gloss: 'Arinna' },
  'iš-ḫa-a-šar-ri': { lemma: 'išhaššara', gloss: 'my lady' },
  'URUNe-ri-iq-qa': { lemma: 'Nerik', gloss: 'Nerik' },
  'a-ši': { lemma: 'aši', gloss: 'that (nom.)' },
  'e-eš-ta': { lemma: 'eš-', gloss: 'was, belonged' },
  'ḫar-ni-in-ke-er': { lemma: 'harnink-', gloss: 'destroyed' },
  'ÉRINMEŠ': { lemma: 'ERINMEŠ', gloss: 'troops' },
  'URUŠu-ú-e': { lemma: 'Suwa', gloss: 'Suwa' },
  'pa-ra-a': { lemma: 'parā', gloss: 'forth, out' },
  'ne-eḫ-ḫu-un': { lemma: 'nai-', gloss: 'I sent' },
  'ki-nu-na': { lemma: 'kinuna', gloss: 'now' },
  'mu-tar': { lemma: 'mūtar', gloss: 'plague' },
  'ki-ša-at': { lemma: 'kiš-', gloss: 'began, became' },
  'am-mu-uk': { lemma: 'ammuk', gloss: 'I, me' },
  'mu-ú-ta-ar': { lemma: 'mūtar', gloss: 'plague' },
  'i-na': { lemma: 'ina', gloss: 'in (Akkadian)' },
  'URUḪa-at-ti': { lemma: 'Hatti', gloss: 'Hatti' },
  'ki-it-ta-ri': { lemma: 'kiš-', gloss: 'stands, is placed' },
};

export const HIT_ANNALS_2: TextSection = {
  id: 'Hit-Annals-2',
  textId: 'Hit-Annals-1',
  sequence: 2,
  label: 'Year 2 — Campaigns in the North',
  sentences: [
    sent(
      'Hit-Annals-2-1',
      ['ma-a-an', 'ke-e-da-ni', 'MU-ti', 'ku-it-ma-an', 'I-NA', 'KUR', 'URUDa-at-ti', 'e-šu-un', 'nu', 'KUR-e', 'ŠA', 'KUR', 'URUPa-ḫḫu-wa'],
      'When in this year I was in the land of Hatti, the land of Pahhuwa...',
      HIT_GLOSS
    ),
    sent(
      'Hit-Annals-2-2',
      ['nu', 'LÚKÚR', 'URUŠa-ap-pí-da', 'KUR', 'URUŠa-ap-pí-da', 'da-a-aš', 'nu', 'LÚKÚR', 'iš-ta-an-da-aš', 'pa-a-iš'],
      'The enemy took the land of Sappida and went away.',
      HIT_GLOSS
    ),
    sent(
      'Hit-Annals-2-3',
      ['nu', 'dUTU-ŠI', 'ka-a-aš', 'pa-a-un', 'nu', 'KUR', 'URUPa-la-a', 'ú-e-mi-ia-nu-un', 'nu', 'ša-an', 'a-ki-ir'],
      'And I, My Majesty, went and found the land of Pala, and they died.',
      HIT_GLOSS
    ),
    sent(
      'Hit-Annals-2-4',
      ['nu', 'ku-ut-ta-an-ni-iš-ši-ma', 'an-da', 'LÚKÚR', 'URUGa-aš-ga', 'ú-it', 'nu', 'URUŠa-ap-pí-da', 'ú-da-a-aš'],
      'And into the border region came the Gasga enemy, and they brought Sappida.',
      HIT_GLOSS
    ),
  ],
};

export const HIT_PRAYER_1: TextSection = {
  id: 'Hit-Prayer-1',
  textId: 'Hit-Prayer',
  sequence: 1,
  label: 'Plague Prayer of Mursili II — Opening',
  sentences: [
    sent(
      'Hit-Prayer-1-1',
      ['dUTU-ŠI', 'Mursili', 'LUGAL.GAL', 'IR', 'dUTU-ŠI', 'QA-TAM-MA', 'te-eḫ-ḫi'],
      'Thus speaks Mursili, the Great King, the servant of the Sun-goddess of Arinna:',
      HIT_GLOSS
    ),
    sent(
      'Hit-Prayer-1-2',
      ['dUTU', 'URUA-ri-in-na', 'iš-ḫa-a-šar-ri', 'KUR', 'URUNe-ri-iq-qa', 'a-ši', 'KUR-e', 'an-da', 'e-eš-ta'],
      'Sun-goddess of Arinna, my lady! The land of Nerik belonged to you.',
      HIT_GLOSS
    ),
    sent(
      'Hit-Prayer-1-3',
      ['nu', 'KUR', 'URUNe-ri-iq-qa', 'LÚKÚR', 'URUGaš-ga', 'ḫar-ni-in-ke-er', 'nu-uš-ši', 'ÉRINMEŠ', 'URUŠu-ú-e', 'pa-ra-a', 'ne-eḫ-ḫu-un'],
      'But the Gasga enemy destroyed the land of Nerik. I sent troops from Suwa.',
      HIT_GLOSS
    ),
    sent(
      'Hit-Prayer-1-4',
      ['dUTU', 'URUA-ri-in-na', 'iš-ḫa-a-šar-ri', 'ki-nu-na', 'a-ši', 'mu-tar', 'KUR-e', 'an-da', 'ki-ša-at'],
      'Sun-goddess of Arinna, my lady! Now this plague has begun in the land.',
      HIT_GLOSS
    ),
    sent(
      'Hit-Prayer-1-5',
      ['am-mu-uk', 'ma-a-an', 'a-ši', 'mu-ú-ta-ar', 'i-na', 'KUR', 'URUḪa-at-ti', 'ki-it-ta-ri', 'nu', 'a-ši', 'mu-ta-ar', 'ki-nu-na', 'te-eḫ-ḫi'],
      'If this plague stands over the land of Hatti, then I will speak of this plague now.',
      HIT_GLOSS
    ),
  ],
};

export const ALL_HITTITE_EXTENDED_SECTIONS: TextSection[] = [HIT_ANNALS_2, HIT_PRAYER_1];
