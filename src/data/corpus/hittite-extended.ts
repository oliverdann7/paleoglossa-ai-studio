import type { TextSection } from '../../types/corpus.js';
import { sentLex } from '../../lib/utils/lexicalHelper.js';

const HIT_LEXICON: Record<string, { lemma: string; gloss: string; partOfSpeech: string }> = {
  nu: { lemma: 'nu', gloss: 'and, then', partOfSpeech: 'conjunction' },
  'ma-a-an': { lemma: 'mān', gloss: 'when, if', partOfSpeech: 'conjunction' },
  'an-da': { lemma: 'anda', gloss: 'into, within', partOfSpeech: 'adverb' },
  'pa-ra-a': { lemma: 'parā', gloss: 'forth, out', partOfSpeech: 'adverb' },
  'ka-a-aš': { lemma: 'kāš', gloss: 'this, this one', partOfSpeech: 'pronoun' },
  'a-ši': { lemma: 'aši', gloss: 'that', partOfSpeech: 'pronoun' },
  'ki-nu-na': { lemma: 'kinuna', gloss: 'now', partOfSpeech: 'adverb' },
  'dUTU-ŠI': { lemma: 'dUTU-ŠI', gloss: 'My Majesty', partOfSpeech: 'noun' },
  dUTU: { lemma: 'dUTU', gloss: 'Sun-goddess', partOfSpeech: 'noun' },
  LÚKÚR: { lemma: 'LÚKÚR', gloss: 'enemy', partOfSpeech: 'noun' },
  KUR: { lemma: 'KUR', gloss: 'land', partOfSpeech: 'noun' },
  'KUR-e': { lemma: 'KUR', gloss: 'land (nom/acc)', partOfSpeech: 'noun' },
  'LUGAL.GAL': { lemma: 'LUGAL.GAL', gloss: 'Great King', partOfSpeech: 'noun' },
  IR: { lemma: 'IR', gloss: 'servant', partOfSpeech: 'noun' },
  ÉRINMEŠ: { lemma: 'ÉRINMEŠ', gloss: 'troops', partOfSpeech: 'noun' },
  Mursili: { lemma: 'Mursili', gloss: 'Mursili', partOfSpeech: 'noun' },
};

export const HIT_ANNALS_2: TextSection = {
  id: 'Hit-Annals-2',
  textId: 'Hit-Annals',
  sequence: 2,
  label: 'Year 2 — Campaigns in the North',
  sentences: [
    sentLex(
      'Hit-Annals-2-1',
      [
        'ma-a-an',
        'ke-e-da-ni',
        'MU-ti',
        'ku-it-ma-an',
        'I-NA',
        'KUR',
        'URUDa-at-ti',
        'e-šu-un',
        'nu',
        'KUR-e',
        'ŠA',
        'KUR',
        'URUPa-ḫḫu-wa',
      ],
      'When in this year I was in the land of Hatti, the land of Pahhuwa...',
      HIT_LEXICON
    ),
    sentLex(
      'Hit-Annals-2-2',
      [
        'nu',
        'LÚKÚR',
        'URUŠa-ap-pí-da',
        'KUR',
        'URUŠa-ap-pí-da',
        'da-a-aš',
        'nu',
        'LÚKÚR',
        'iš-ta-an-da-aš',
        'pa-a-iš',
      ],
      'The enemy took the land of Sappida and went away.',
      HIT_LEXICON
    ),
    sentLex(
      'Hit-Annals-2-3',
      [
        'nu',
        'dUTU-ŠI',
        'ka-a-aš',
        'pa-a-un',
        'nu',
        'KUR',
        'URUPa-la-a',
        'ú-e-mi-ia-nu-un',
        'nu',
        'ša-an',
        'a-ki-ir',
      ],
      'And I, My Majesty, went and found the land of Pala, and they died.',
      HIT_LEXICON
    ),
    sentLex(
      'Hit-Annals-2-4',
      [
        'nu',
        'ku-ut-ta-an-ni-iš-ši-ma',
        'an-da',
        'LÚKÚR',
        'URUGa-aš-ga',
        'ú-it',
        'nu',
        'URUŠa-ap-pí-da',
        'ú-da-a-aš',
      ],
      'And into the border region came the Gasga enemy, and they brought Sappida.',
      HIT_LEXICON
    ),
  ],
};

export const HIT_PRAYER_1: TextSection = {
  id: 'Hit-Prayer-1',
  textId: 'Hit-Prayer',
  sequence: 1,
  label: 'Plague Prayer of Mursili II — Opening',
  sentences: [
    sentLex(
      'Hit-Prayer-1-1',
      ['dUTU-ŠI', 'Mursili', 'LUGAL.GAL', 'IR', 'dUTU-ŠI', 'QA-TAM-MA', 'te-eḫ-ḫi'],
      'Thus speaks Mursili, the Great King, the servant of the Sun-goddess of Arinna:',
      HIT_LEXICON
    ),
    sentLex(
      'Hit-Prayer-1-2',
      [
        'dUTU',
        'URUA-ri-in-na',
        'iš-ḫa-a-šar-ri',
        'KUR',
        'URUNe-ri-iq-qa',
        'a-ši',
        'KUR-e',
        'an-da',
        'e-eš-ta',
      ],
      'Sun-goddess of Arinna, my lady! The land of Nerik belonged to you.',
      HIT_LEXICON
    ),
    sentLex(
      'Hit-Prayer-1-3',
      [
        'nu',
        'KUR',
        'URUNe-ri-iq-qa',
        'LÚKÚR',
        'URUGaš-ga',
        'ḫar-ni-in-ke-er',
        'nu-uš-ši',
        'ÉRINMEŠ',
        'URUŠu-ú-e',
        'pa-ra-a',
        'ne-eḫ-ḫu-un',
      ],
      'But the Gasga enemy destroyed the land of Nerik. I sent troops from Suwa.',
      HIT_LEXICON
    ),
    sentLex(
      'Hit-Prayer-1-4',
      [
        'dUTU',
        'URUA-ri-in-na',
        'iš-ḫa-a-šar-ri',
        'ki-nu-na',
        'a-ši',
        'mu-tar',
        'KUR-e',
        'an-da',
        'ki-ša-at',
      ],
      'Sun-goddess of Arinna, my lady! Now this plague has begun in the land.',
      HIT_LEXICON
    ),
    sentLex(
      'Hit-Prayer-1-5',
      [
        'am-mu-uk',
        'ma-a-an',
        'a-ši',
        'mu-ú-ta-ar',
        'i-na',
        'KUR',
        'URUḪa-at-ti',
        'ki-it-ta-ri',
        'nu',
        'a-ši',
        'mu-ta-ar',
        'ki-nu-na',
        'te-eḫ-ḫi',
      ],
      'If this plague stands over the land of Hatti, then I will speak of this plague now.',
      HIT_LEXICON
    ),
  ],
};

export const ALL_HITTITE_EXTENDED_SECTIONS: TextSection[] = [HIT_ANNALS_2, HIT_PRAYER_1];
