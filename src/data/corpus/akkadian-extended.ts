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
  // Hammurabi / Gilgamesh continuation vocabulary
  lu: { lemma: 'lū', gloss: '(precative particle)', partOfSpeech: 'particle' },
  kussi: { lemma: 'kussûm', gloss: 'throne, seat', partOfSpeech: 'noun' },
  ili: { lemma: 'ilum', gloss: 'of god', partOfSpeech: 'noun' },
  ilī: { lemma: 'ilum', gloss: 'of the gods', partOfSpeech: 'noun' },
  elīsu: { lemma: 'eli', gloss: 'upon him', partOfSpeech: 'preposition' },
  yasi: { lemma: 'yāši', gloss: 'to me', partOfSpeech: 'pronoun' },
  wašib: { lemma: 'wašābum', gloss: 'sitting, dwelling', partOfSpeech: 'verb' },
  warkanum: { lemma: 'warkânum', gloss: 'later', partOfSpeech: 'adverb' },
  warkânum: { lemma: 'warkânum', gloss: 'later', partOfSpeech: 'adverb' },
  uṣiamma: { lemma: 'aṣû', gloss: 'and came forth', partOfSpeech: 'verb' },
  ušēzib: { lemma: 'ezēbu', gloss: 'caused to be deposited', partOfSpeech: 'verb' },
  'ušetbû-šu': { lemma: 'tebû', gloss: 'they shall remove him', partOfSpeech: 'verb' },
  uruk: { lemma: 'Uruk', gloss: 'Uruk (city)', partOfSpeech: 'noun' },
  urri: { lemma: 'ūmu', gloss: 'days', partOfSpeech: 'noun' },
  'uktīn-šu': { lemma: 'kânu', gloss: 'has proved against him', partOfSpeech: 'verb' },
  uktīn: { lemma: 'kânu', gloss: 'proved', partOfSpeech: 'verb' },
  'ukinnū-šum': { lemma: 'kânu', gloss: 'they established for him', partOfSpeech: 'verb' },
  'ukannūšu-ma': { lemma: 'kânu', gloss: 'they shall convict him', partOfSpeech: 'verb' },
  ugdassiru: { lemma: 'gāšāru', gloss: 'they prevailed', partOfSpeech: 'verb' },
  ubbiramma: { lemma: 'abāru', gloss: 'has accused', partOfSpeech: 'verb' },
  ubbib: { lemma: 'ebēbu', gloss: 'cleansed, purified', partOfSpeech: 'verb' },
  ṭubbim: { lemma: 'ṭâbu', gloss: 'well-being', partOfSpeech: 'noun' },
  tillēšu: { lemma: 'tillu', gloss: 'his help', partOfSpeech: 'noun' },
  tarappud: { lemma: 'rapādu', gloss: 'you roam', partOfSpeech: 'verb' },
  tagdamir: { lemma: 'gamāru', gloss: 'you exhausted', partOfSpeech: 'verb' },
  tagaššīma: { lemma: 'qašû', gloss: 'be silent (do not!)', partOfSpeech: 'verb' },
  supūri: { lemma: 'supūru', gloss: 'enclosure, sheepfold', partOfSpeech: 'noun' },
  šūpîm: { lemma: 'wapû', gloss: 'to make appear', partOfSpeech: 'verb' },
  šumī: { lemma: 'šumu', gloss: 'my name', partOfSpeech: 'noun' },
  'šubat-su': { lemma: 'šubtum', gloss: 'his dwelling', partOfSpeech: 'noun' },
  šuāti: { lemma: 'šū', gloss: 'that, this', partOfSpeech: 'pronoun' },
  šū: { lemma: 'šū', gloss: 'he, that', partOfSpeech: 'pronoun' },
  ṣīrum: { lemma: 'ṣīru', gloss: 'lofty', partOfSpeech: 'adjective' },
  ṣīrtim: { lemma: 'ṣīru', gloss: 'exalted (f.)', partOfSpeech: 'adjective' },
  ṣīr: { lemma: 'ṣīru', gloss: 'lofty', partOfSpeech: 'adjective' },
  šīmti: { lemma: 'šīmtu', gloss: 'destiny', partOfSpeech: 'noun' },
  šībūt: { lemma: 'šību', gloss: 'witnesses', partOfSpeech: 'noun' },
  šī: { lemma: 'šī', gloss: 'she', partOfSpeech: 'pronoun' },
  ṣēram: { lemma: 'ṣēru', gloss: 'steppe', partOfSpeech: 'noun' },
  ṣēnam: { lemma: 'ṣēnu', gloss: 'the wicked', partOfSpeech: 'adjective' },
  sâšu: { lemma: 'šū', gloss: 'that', partOfSpeech: 'pronoun' },
  sarrātim: { lemma: 'sarrātu', gloss: 'false testimony', partOfSpeech: 'noun' },
  rūqi: { lemma: 'rūqu', gloss: 'far', partOfSpeech: 'adjective' },
  rubûti: { lemma: 'rubû', gloss: 'princely', partOfSpeech: 'adjective' },
  rubâm: { lemma: 'rubû', gloss: 'prince (acc.)', partOfSpeech: 'noun' },
  rīmi: { lemma: 'rīmu', gloss: 'wild ox', partOfSpeech: 'noun' },
  rēštîm: { lemma: 'rēštû', gloss: 'first-born', partOfSpeech: 'adjective' },
  raggam: { lemma: 'raggu', gloss: 'the wicked', partOfSpeech: 'adjective' },
  qišma: { lemma: 'qiāšu', gloss: 'grant!', partOfSpeech: 'verb' },
  qišam: { lemma: 'qišum', gloss: 'forest', partOfSpeech: 'noun' },
  purussâm: { lemma: 'purussû', gloss: 'a verdict', partOfSpeech: 'noun' },
  puḫrim: { lemma: 'puḫru', gloss: 'assembly', partOfSpeech: 'noun' },
  pīka: { lemma: 'pûm', gloss: 'your mouth', partOfSpeech: 'noun' },
  pāšu: { lemma: 'pûm', gloss: 'his mouth', partOfSpeech: 'noun' },
  'pānū-ki': { lemma: 'pānu', gloss: 'your face', partOfSpeech: 'noun' },
  'pāni-ka': { lemma: 'pānu', gloss: 'your face', partOfSpeech: 'noun' },
  pāliḫ: { lemma: 'palāḫu', gloss: 'fearing', partOfSpeech: 'verb' },
  pakkīka: { lemma: 'pakku', gloss: 'your understanding', partOfSpeech: 'noun' },
  nērtam: { lemma: 'nērtu', gloss: 'murder', partOfSpeech: 'noun' },
  naʾdam: { lemma: 'naʾdu', gloss: 'reverent', partOfSpeech: 'adjective' },
  napištim: { lemma: 'napištu', gloss: 'life, capital', partOfSpeech: 'noun' },
  nammaštê: { lemma: 'nammaštû', gloss: 'wildlife', partOfSpeech: 'noun' },
  mūtū: { lemma: 'mūtu', gloss: 'husband', partOfSpeech: 'noun' },
  mūti: { lemma: 'mūtu', gloss: 'of death', partOfSpeech: 'noun' },
  mūssa: { lemma: 'mūtu', gloss: 'her husband', partOfSpeech: 'noun' },
  mūši: { lemma: 'mūšu', gloss: 'of night', partOfSpeech: 'noun' },
  mūšab: { lemma: 'mūšabu', gloss: 'dwelling', partOfSpeech: 'noun' },
  'mubbir-šu': { lemma: 'abāru', gloss: 'his accuser', partOfSpeech: 'noun' },
  mīšarim: { lemma: 'mīšaru', gloss: 'justice', partOfSpeech: 'noun' },
  mārim: { lemma: 'mārum', gloss: 'son', partOfSpeech: 'noun' },
  malêšu: { lemma: 'malû', gloss: 'his fullness', partOfSpeech: 'noun' },
  'maḫar-ša': { lemma: 'maḫar', gloss: 'before her', partOfSpeech: 'preposition' },
  lušqâkimma: { lemma: 'šaqû', gloss: 'let me give to drink', partOfSpeech: 'verb' },
  lūbilka: { lemma: 'wabālu', gloss: 'let me bring you', partOfSpeech: 'verb' },
  liššima: { lemma: 'našû', gloss: 'let it be raised', partOfSpeech: 'verb' },
  kunukkam: { lemma: 'kunukku', gloss: 'sealed document', partOfSpeech: 'noun' },
  kiššat: { lemma: 'kiššatu', gloss: 'totality', partOfSpeech: 'noun' },
  kanūnu: { lemma: 'kanūnu', gloss: 'brazier', partOfSpeech: 'noun' },
  ītēni: { lemma: 'enû', gloss: 'altered', partOfSpeech: 'verb' },
  iššâ: { lemma: 'naš', gloss: 'lifted', partOfSpeech: 'verb' },
  'išīm-šum': { lemma: 'šâmu', gloss: 'assigned to him', partOfSpeech: 'verb' },
  iqbû: { lemma: 'qabû', gloss: 'they spoke', partOfSpeech: 'verb' },
  iqdamma: { lemma: 'qadāmu', gloss: 'has gone forth', partOfSpeech: 'verb' },
  iqâšiš: { lemma: 'qâšu', gloss: 'granted to him', partOfSpeech: 'verb' },
  innendê: { lemma: 'nadû', gloss: 'will be cast', partOfSpeech: 'verb' },
  inūmīšu: { lemma: 'inūma', gloss: 'at that time', partOfSpeech: 'adverb' },
  inūma: { lemma: 'inūma', gloss: 'when', partOfSpeech: 'conjunction' },
  ina_dup: { lemma: 'ina', gloss: 'in, by', partOfSpeech: 'preposition' },
  ibbû: { lemma: 'nabû', gloss: 'called', partOfSpeech: 'verb' },
  iddi: { lemma: 'nadû', gloss: 'has laid', partOfSpeech: 'verb' },
  iddak: { lemma: 'dâku', gloss: 'shall be put to death', partOfSpeech: 'verb' },
  idīn: { lemma: 'dânu', gloss: 'has rendered', partOfSpeech: 'verb' },
  idīnu: { lemma: 'dânu', gloss: 'he gave', partOfSpeech: 'verb' },
  ḫulluqim: { lemma: 'ḫalāqu', gloss: 'to destroy', partOfSpeech: 'verb' },
  ḫarīmtim: { lemma: 'ḫarīmtu', gloss: 'harlot', partOfSpeech: 'noun' },
  ḫabālim: { lemma: 'ḫabālu', gloss: 'to oppress', partOfSpeech: 'verb' },
  enšam: { lemma: 'enšu', gloss: 'the weak', partOfSpeech: 'adjective' },
  enūt: { lemma: 'enūtu', gloss: 'dominion', partOfSpeech: 'noun' },
  ellāti: { lemma: 'ellātu', gloss: 'troops', partOfSpeech: 'noun' },
  dīnim: { lemma: 'dīnum', gloss: 'in a lawsuit', partOfSpeech: 'noun' },
  dīnum: { lemma: 'dīnum', gloss: 'case, lawsuit', partOfSpeech: 'noun' },
  'dīn-šu': { lemma: 'dīnum', gloss: 'his verdict', partOfSpeech: 'noun' },
  'dayyānūti-šu': { lemma: 'dayyānūtu', gloss: 'of his judgeship', partOfSpeech: 'noun' },
  dayyānam: { lemma: 'dayyānum', gloss: 'judge (acc.)', partOfSpeech: 'noun' },
  dannum: { lemma: 'dannu', gloss: 'the strong', partOfSpeech: 'adjective' },
  damqū: { lemma: 'damqu', gloss: 'fair, fine', partOfSpeech: 'adjective' },
  Bābilim: { lemma: 'Bābilum', gloss: 'Babylon', partOfSpeech: 'noun' },
  awīlam: { lemma: 'awīlum', gloss: 'another man', partOfSpeech: 'noun' },
  awât: { lemma: 'awātum', gloss: 'word', partOfSpeech: 'noun' },
  awâtīkī: { lemma: 'awātum', gloss: 'your words', partOfSpeech: 'noun' },
  Anunnaki: { lemma: 'Anunnakū', gloss: 'Anunnaki gods', partOfSpeech: 'noun' },
  ammātu: { lemma: 'ammātu', gloss: 'cubits', partOfSpeech: 'noun' },
  ammâ: { lemma: 'ammā', gloss: 'over there', partOfSpeech: 'adverb' },
  alku: { lemma: 'alāku', gloss: 'go!', partOfSpeech: 'verb' },
  aḫīšu: { lemma: 'aḫu', gloss: 'his arm/brother', partOfSpeech: 'noun' },
  // Diacritic variants for sentLex's `clean` lookup
  šīr: { lemma: 'šīru', gloss: 'flesh', partOfSpeech: 'noun' },
  iddâk: { lemma: 'dâku', gloss: 'shall be put to death', partOfSpeech: 'verb' },
  ūṣiamma: { lemma: 'aṣû', gloss: 'and came forth', partOfSpeech: 'verb' },
  iprus: { lemma: 'parāsu', gloss: 'has decided', partOfSpeech: 'verb' },
  šuati: { lemma: 'šū', gloss: 'that, this', partOfSpeech: 'pronoun' },
  kussî: { lemma: 'kussûm', gloss: 'throne, seat', partOfSpeech: 'noun' },
  elīšu: { lemma: 'eli', gloss: 'upon him', partOfSpeech: 'preposition' },
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
