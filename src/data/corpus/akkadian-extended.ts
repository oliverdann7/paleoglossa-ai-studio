import type { TextSection } from '../../types/corpus.js';
import { sentLex } from '../../lib/utils/lexicalHelper.js';

const AKK_LEXICON: Record<string, { lemma: string; gloss: string; partOfSpeech: string }> = {
  ana: { lemma: 'ana', gloss: 'to, for', partOfSpeech: 'preposition' },
  ina: { lemma: 'ina', gloss: 'in, by', partOfSpeech: 'preposition' },
  ša: { lemma: 'ša', gloss: 'of, which', partOfSpeech: 'particle' },
  u: { lemma: 'u', gloss: 'and', partOfSpeech: 'conjunction' },
  lā: { lemma: 'lā', gloss: 'not', partOfSpeech: 'adverb' },
  kīma: { lemma: 'kīma', gloss: 'like, as', partOfSpeech: 'preposition' },
  eli: { lemma: 'eli', gloss: 'upon, over', partOfSpeech: 'preposition' },
  itti: { lemma: 'itti', gloss: 'with', partOfSpeech: 'preposition' },
  atta: { lemma: 'attā', gloss: 'you (m sg)', partOfSpeech: 'pronoun' },
  šumma: { lemma: 'šumma', gloss: 'if', partOfSpeech: 'conjunction' },
  iqbâššu: { lemma: 'qabû', gloss: 'she spoke to him', partOfSpeech: 'verb' },
  iqbi: { lemma: 'qabû', gloss: 'he spoke', partOfSpeech: 'verb' },
  iqabbi: { lemma: 'qabû', gloss: 'he speaks', partOfSpeech: 'verb' },
  izzakkar: { lemma: 'zakāru', gloss: 'he spoke', partOfSpeech: 'verb' },
  alka: { lemma: 'alāku', gloss: 'come!', partOfSpeech: 'verb' },
  illik: { lemma: 'alāku', gloss: 'has gone', partOfSpeech: 'verb' },
  allik: { lemma: 'alāku', gloss: 'I came', partOfSpeech: 'verb' },
  mīnâ: { lemma: 'mīnu', gloss: 'what?', partOfSpeech: 'pronoun' },
  ammīni: { lemma: 'ammīni', gloss: 'why?', partOfSpeech: 'adverb' },
  Gilgameš: { lemma: 'Gilgameš', gloss: 'Gilgamesh', partOfSpeech: 'noun' },
  Enkidu: { lemma: 'Enkidu', gloss: 'Enkidu', partOfSpeech: 'noun' },
  Šamḫat: { lemma: 'Šamḫat', gloss: 'Shamhat', partOfSpeech: 'noun' },
  Ištar: { lemma: 'Ištar', gloss: 'Ishtar', partOfSpeech: 'noun' },
  Utnapištim: { lemma: 'Utnapištim', gloss: 'Utnapishtim', partOfSpeech: 'noun' },
  Anum: { lemma: 'Anum', gloss: 'Anu', partOfSpeech: 'noun' },
  Enlil: { lemma: 'Enlil', gloss: 'Enlil', partOfSpeech: 'noun' },
  Marduk: { lemma: 'Marduk', gloss: 'Marduk', partOfSpeech: 'noun' },
  Ea: { lemma: 'Ea', gloss: 'Ea', partOfSpeech: 'noun' },
  Ḫammurabi: { lemma: 'Ḫammurabi', gloss: 'Hammurabi', partOfSpeech: 'noun' },
  šar: { lemma: 'šarru', gloss: 'king', partOfSpeech: 'noun' },
  bēl: { lemma: 'bēlu', gloss: 'lord', partOfSpeech: 'noun' },
  rubâ: { lemma: 'rubû', gloss: 'prince', partOfSpeech: 'noun' },
  rubūti: { lemma: 'rubû', gloss: 'princely', partOfSpeech: 'adjective' },
  mātim: { lemma: 'mātu', gloss: 'land', partOfSpeech: 'noun' },
  nišī: { lemma: 'nišū', gloss: 'people, mankind', partOfSpeech: 'noun' },
  šamê: { lemma: 'šamû', gloss: 'heaven', partOfSpeech: 'noun' },
  erṣetim: { lemma: 'erṣetu', gloss: 'earth', partOfSpeech: 'noun' },
  awīlum: { lemma: 'awīlum', gloss: 'man, citizen', partOfSpeech: 'noun' },
  dayyānum: { lemma: 'dayyānum', gloss: 'judge', partOfSpeech: 'noun' },
  dīnam: { lemma: 'dīnum', gloss: 'judgment, case', partOfSpeech: 'noun' },
  dīn: { lemma: 'dīnum', gloss: 'judgment, case', partOfSpeech: 'noun' },
};

export const AKK_GILGAMESH_2: TextSection = {
  id: 'Akk-Gilg-2',
  textId: 'Akk-Gilg-full',
  sequence: 2,
  label: 'Tablet II — Enkidu Comes to Uruk',
  sentences: [
    sentLex(
      'Akk-Gilg-2-1',
      ['Enkidu', 'wašib', 'maḫar-ša', 'iqbi', 'ana', 'ḫarīmtim'],
      'Enkidu sat before her; he spoke to the harlot.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-2-2',
      ['Šamḫat', 'lā', 'tagaššīma', 'pīka', 'liššima', 'awâtikī'],
      'Shamhat, do not be silent! Let your mouth open; let me hear your words.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-2-3',
      ['šī', 'iqbâššu', 'ana', 'Enkidu', 'pānū-ki', 'damqū'],
      'She spoke to him, to Enkidu: Your face is fair.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-2-4',
      ['atta', 'kīma', 'ili', 'ammīni', 'itti', 'nammaštê', 'tarappud', 'ṣēram'],
      'You are like a god — why do you roam the steppe with the wild creatures?',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-2-5',
      ['alka', 'lūbilka', 'ana', 'Uruk', 'supūri'],
      'Come, let me lead you to ramparted Uruk.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-2-6',
      ['ana', 'bīt', 'ellim', 'mūšab', 'Ani', 'u', 'Ištar'],
      'To the holy temple, the dwelling of Anu and Ishtar.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-2-7',
      ['ašar', 'Gilgameš', 'gitmālu', 'emūqi'],
      'Where Gilgamesh, perfect in strength, dwells.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-2-8',
      ['kīma', 'rīmi', 'ugdašširū', 'eli', 'eṭlūtim'],
      'Like a wild bull he lords it over the men.',
      AKK_LEXICON
    ),
  ],
};

export const AKK_GILGAMESH_6: TextSection = {
  id: 'Akk-Gilg-6',
  textId: 'Akk-Gilg-full',
  sequence: 3,
  label: 'Tablet VI — Ishtar and the Bull of Heaven',
  sentences: [
    sentLex(
      'Akk-Gilg-6-1',
      ['imsi', 'malêšu', 'ubbib', 'tillēšu'],
      'He washed his filthy hair, he cleaned his weapons.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-6-2',
      ['ana', 'dumqi', 'Gilgameš', 'īnāša', 'iššâ', 'rubūtu', 'Ištar'],
      'On the beauty of Gilgamesh, princely Ishtar lifted her eyes.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-6-3',
      ['alka', 'Gilgameš', 'lū', 'ḫâʾiri-ma'],
      'Come, Gilgamesh, be my husband.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-6-4',
      ['inbīka', 'yâši', 'qīšam', 'qīšma'],
      'Grant me your fruit as a gift.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-6-5',
      ['Gilgameš', 'pâšu', 'īpušamma', 'iqabbi', 'ana', 'rubūti', 'Ištar'],
      'Gilgamesh opened his mouth and spoke; he said to princely Ishtar:',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-6-6',
      ['mīnâ', 'lušqâkimma', 'ḫīrāt-ka', 'ša', 'lū', 'aššatu'],
      'What shall I give you if I take you in marriage?',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-6-7',
      ['attī', 'kanūnū', 'ša', 'ina', 'kuṣṣi', 'ibellû'],
      'You are a brazier whose fire goes out in the cold.',
      AKK_LEXICON
    ),
  ],
};

export const AKK_GILGAMESH_10: TextSection = {
  id: 'Akk-Gilg-10',
  textId: 'Akk-Gilg-full',
  sequence: 4,
  label: 'Tablet X — The Search for Eternal Life',
  sentences: [
    sentLex(
      'Akk-Gilg-10-1',
      ['Gilgameš', 'ana', 'šâšu', 'izzakkar', 'ana', 'Utnapištim', 'rūqi'],
      'Gilgamesh said to him, to Utnapishtim the distant:',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-10-2',
      ['ana', 'pānī-ka', 'akli', 'aššum', 'baltūti', 'allik'],
      'Before your face I have come, because of the matter of the living.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-10-3',
      ['Enkidu', 'ibrī', 'ša', 'arāmu', 'dannīš', 'illik', 'ana', 'šīmti', 'amēlūti'],
      'Enkidu, my friend whom I greatly loved, has gone to the fate of mankind.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-10-4',
      ['urri', 'u', 'mūši', 'bakâku', 'elīšu'],
      'Day and night I weep over him.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-10-5',
      ['mūtu', 'eppēš-ma', 'amâtu', 'ḫâliqu'],
      'I am afraid of death; I will perish.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-10-6',
      ['Utnapištim', 'iqâbi', 'ana', 'Gilgameš', 'ammīni', 'tagdamir', 'pakkīka'],
      'Utnapishtim said to Gilgamesh: Why have you exhausted yourself?',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Gilg-10-7',
      ['ša', 'mūti', 'lā', 'illebbū', 'mussa'],
      'Of death no man knows the form.',
      AKK_LEXICON
    ),
  ],
};

export const AKK_HAMMURABI_1: TextSection = {
  id: 'Akk-Ham-1',
  textId: 'Akk-Ham',
  sequence: 1,
  label: 'Prologue — When Anum the Lofty',
  sentences: [
    sentLex(
      'Akk-Ham-1-1',
      ['inūma', 'Anum', 'ṣīrum', 'šar', 'Anunnaki', 'Enlil', 'bēl', 'šamê', 'u', 'erṣetim'],
      'When lofty Anum, king of the Anunnaki, and Enlil, lord of heaven and earth...',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Ham-1-2',
      ['ana', 'Marduk', 'mārim', 'rēštîm', 'ša', 'Ea', 'enūt', 'kiššat', 'nišī', 'išīm-šum'],
      '...assigned to Marduk, the firstborn son of Ea, dominion over the totality of mankind.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Ham-1-3',
      ['ina', 'Bābilim', 'šubat-su', 'ṣīrtim', 'ukinnū-šum'],
      'In Babylon they established for him an exalted dwelling.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Ham-1-4',
      ['inūmīšu', 'Ḫammurabi', 'rubâm', 'naʾdam', 'pāliḫ', 'ilī'],
      'At that time, me, Hammurabi, the reverent prince, who fears the gods —',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Ham-1-5',
      ['ana', 'mīšarim', 'ina', 'mātim', 'ana', 'šūpîm'],
      '— to cause justice to appear in the land...',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Ham-1-6',
      ['raggam', 'u', 'ṣēnam', 'ana', 'ḫulluqim'],
      '...to destroy the wicked and the evil...',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Ham-1-7',
      ['dannum', 'enšam', 'ana', 'lā', 'ḫabālim'],
      '...so that the strong might not oppress the weak,',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Ham-1-8',
      ['Anum', 'u', 'Enlil', 'ana', 'šīr', 'nišī', 'ṭubbim', 'šumī', 'ibbû'],
      'Anum and Enlil called my name for the well-being of the people.',
      AKK_LEXICON
    ),
  ],
};

export const AKK_HAMMURABI_2: TextSection = {
  id: 'Akk-Ham-2',
  textId: 'Akk-Ham',
  sequence: 2,
  label: 'Selected Laws (§1, §3, §5)',
  sentences: [
    sentLex(
      'Akk-Ham-2-1',
      ['šumma', 'awīlum', 'awīlam', 'ubbiramma', 'nērtam', 'elīšu', 'iddi'],
      'If a man has accused another man and laid a charge of murder against him...',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Ham-2-2',
      ['u', 'lā', 'uktīn-šu', 'mubbir-šu', 'iddâk'],
      '...but cannot prove it, his accuser shall be put to death.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Ham-2-3',
      ['šumma', 'awīlum', 'ina', 'dīnim', 'ana', 'šībūt', 'sarrātim', 'ūṣiamma'],
      'If a man in a lawsuit has come forward with false testimony...',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Ham-2-4',
      ['u', 'awât', 'iqbû', 'lā', 'uktīn', 'dīnum', 'šū', 'dīn', 'napištim'],
      '...and the testimony he gave cannot be verified, if the case is a capital case, that man shall be put to death.',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Ham-2-5',
      ['šumma', 'dayyānum', 'dīnam', 'idīn', 'purussâm', 'iprus'],
      'If a judge has rendered a verdict, decided a case...',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Ham-2-6',
      ['kunukkam', 'ušēzib', 'warkânum', 'dīn-šu', 'ītēni'],
      '...and sealed a tablet, and afterwards alters his judgment...',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Ham-2-7',
      ['dayyānam', 'šuati', 'ina', 'dīn', 'idīnu', 'ukannūšu-ma'],
      '...they shall convict that judge of changing the verdict that he gave...',
      AKK_LEXICON
    ),
    sentLex(
      'Akk-Ham-2-8',
      ['ina', 'puḫrim', 'ina', 'kussî', 'dayyānūti-šu', 'ušetbû-šu'],
      "...and they shall remove him from his judge's seat in the assembly.",
      AKK_LEXICON
    ),
  ],
};

export const ALL_AKKADIAN_EXTENDED_SECTIONS: TextSection[] = [
  AKK_GILGAMESH_2,
  AKK_GILGAMESH_6,
  AKK_GILGAMESH_10,
  AKK_HAMMURABI_1,
  AKK_HAMMURABI_2,
];
