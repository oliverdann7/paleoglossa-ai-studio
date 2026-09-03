/**
 * "First Reader" A1 texts for the smaller-corpus languages
 * (Akkadian, Egyptian, Hittite, Ugaritic, Coptic, Aramaic, Syriac,
 * Sanskrit). Original Paleoglossa compositions: very short, heavily
 * repetitive sentences built from the highest-frequency vocabulary, so a
 * learner fresh out of the alphabet course can read complete sentences on
 * day one.
 *
 * Every token carries lemma + gloss + partOfSpeech (via the lexicon
 * hints), so these texts satisfy the `complete` annotation gate in
 * validation.ts. They are whole original works and are allow-listed in
 * COMPLETE_SHORT_WORKS.
 */

import type { TextSection } from '../../types/corpus.js';
import { sentLex, type LexicalHint } from '../../lib/utils/lexicalHelper.js';

// ─── Akkadian (transliterated Old Babylonian) ────────────────────────────

const AKK_FIRST_LEX: Record<string, LexicalHint> = {
  šarrum: { lemma: 'šarrum', gloss: 'king', partOfSpeech: 'noun' },
  šarratum: { lemma: 'šarratum', gloss: 'queen', partOfSpeech: 'noun' },
  dannum: { lemma: 'dannum', gloss: 'strong, mighty', partOfSpeech: 'adjective' },
  damiqtum: { lemma: 'damqum', gloss: 'good (f.)', partOfSpeech: 'adjective' },
  ālum: { lemma: 'ālum', gloss: 'city', partOfSpeech: 'noun' },
  ālam: { lemma: 'ālum', gloss: 'city (acc.)', partOfSpeech: 'noun' },
  ālim: { lemma: 'ālum', gloss: 'city (gen.)', partOfSpeech: 'noun' },
  rabûm: { lemma: 'rabûm', gloss: 'great, big', partOfSpeech: 'adjective' },
  bītum: { lemma: 'bītum', gloss: 'house', partOfSpeech: 'noun' },
  bītam: { lemma: 'bītum', gloss: 'house (acc.)', partOfSpeech: 'noun' },
  bītim: { lemma: 'bītum', gloss: 'house (gen.)', partOfSpeech: 'noun' },
  ṣehrum: { lemma: 'ṣehrum', gloss: 'small, young', partOfSpeech: 'adjective' },
  ina: { lemma: 'ina', gloss: 'in, on', partOfSpeech: 'preposition' },
  ilum: { lemma: 'ilum', gloss: 'god', partOfSpeech: 'noun' },
  šamê: { lemma: 'šamû', gloss: 'heaven (gen.)', partOfSpeech: 'noun' },
  mārum: { lemma: 'mārum', gloss: 'son', partOfSpeech: 'noun' },
  mārū: { lemma: 'mārum', gloss: 'sons (nom. pl.)', partOfSpeech: 'noun' },
  ša: { lemma: 'ša', gloss: 'of, which', partOfSpeech: 'particle' },
  šarrim: { lemma: 'šarrum', gloss: 'king (gen.)', partOfSpeech: 'noun' },
  īpuš: { lemma: 'epēšum', gloss: 'he built, made', partOfSpeech: 'verb' },
  iṣṣur: { lemma: 'naṣārum', gloss: 'he protected', partOfSpeech: 'verb' },
  u: { lemma: 'u', gloss: 'and', partOfSpeech: 'conjunction' },
  awīlum: { lemma: 'awīlum', gloss: 'man, person', partOfSpeech: 'noun' },
  kaspam: { lemma: 'kaspum', gloss: 'silver (acc.)', partOfSpeech: 'noun' },
  iddin: { lemma: 'nadānum', gloss: 'he gave', partOfSpeech: 'verb' },
  dannim: { lemma: 'dannum', gloss: 'strong (gen.)', partOfSpeech: 'adjective' },
};

export const AKK_FIRST_1: TextSection = {
  id: 'AkkFirst-1',
  textId: 'AkkFirst',
  sequence: 1,
  label: 'The King and the City',
  sentences: [
    sentLex('AkkFirst-1-1', ['šarrum', 'dannum.'], 'The king is strong.', AKK_FIRST_LEX),
    sentLex('AkkFirst-1-2', ['šarratum', 'damiqtum.'], 'The queen is good.', AKK_FIRST_LEX),
    sentLex('AkkFirst-1-3', ['ālum', 'rabûm.'], 'The city is great.', AKK_FIRST_LEX),
    sentLex('AkkFirst-1-4', ['bītum', 'ṣehrum.'], 'The house is small.', AKK_FIRST_LEX),
    sentLex('AkkFirst-1-5', ['šarrum', 'ina', 'ālim.'], 'The king is in the city.', AKK_FIRST_LEX),
    sentLex('AkkFirst-1-6', ['ilum', 'ina', 'šamê.'], 'The god is in heaven.', AKK_FIRST_LEX),
    sentLex(
      'AkkFirst-1-7',
      ['mārum', 'ša', 'šarrim', 'dannum.'],
      'The son of the king is strong.',
      AKK_FIRST_LEX
    ),
    sentLex('AkkFirst-1-8', ['šarrum', 'bītam', 'īpuš.'], 'The king built a house.', AKK_FIRST_LEX),
    sentLex(
      'AkkFirst-1-9',
      ['ilum', 'ālam', 'iṣṣur.'],
      'The god protected the city.',
      AKK_FIRST_LEX
    ),
    sentLex(
      'AkkFirst-1-10',
      ['šarrum', 'u', 'šarratum', 'ina', 'bītim.'],
      'The king and the queen are in the house.',
      AKK_FIRST_LEX
    ),
    sentLex('AkkFirst-1-11', ['awīlum', 'kaspam', 'iddin.'], 'The man gave silver.', AKK_FIRST_LEX),
    sentLex(
      'AkkFirst-1-12',
      ['mārū', 'šarrim', 'ina', 'ālim', 'dannim.'],
      'The sons of the king are in the strong city.',
      AKK_FIRST_LEX
    ),
  ],
};

// ─── Egyptian (Middle Egyptian, transliterated) ──────────────────────────

const EGY_FIRST_LEX: Record<string, LexicalHint> = {
  nfr: { lemma: 'nfr', gloss: 'good, beautiful', partOfSpeech: 'adjective' },
  pr: { lemma: 'pr', gloss: 'house', partOfSpeech: 'noun' },
  st: { lemma: 'st', gloss: 'place, seat', partOfSpeech: 'noun' },
  rꜥ: { lemma: 'rꜥ', gloss: 'Ra, the sun', partOfSpeech: 'noun' },
  m: { lemma: 'm', gloss: 'in, as', partOfSpeech: 'preposition' },
  pt: { lemma: 'pt', gloss: 'sky', partOfSpeech: 'noun' },
  nsw: { lemma: 'nsw', gloss: 'king', partOfSpeech: 'noun' },
  sš: { lemma: 'sš', gloss: 'scribe', partOfSpeech: 'noun' },
  nʾt: { lemma: 'nʾt', gloss: 'city', partOfSpeech: 'noun' },
  ḏd: { lemma: 'ḏd', gloss: 'to say, speak', partOfSpeech: 'verb' },
  sḏm: { lemma: 'sḏm', gloss: 'to hear', partOfSpeech: 'verb' },
  rn: { lemma: 'rn', gloss: 'name', partOfSpeech: 'noun' },
  n: { lemma: 'n', gloss: 'of, to', partOfSpeech: 'preposition' },
  ꜥnḫ: { lemma: 'ꜥnḫ', gloss: 'to live; may (he) live', partOfSpeech: 'verb' },
  mj: { lemma: 'mj', gloss: 'like, as', partOfSpeech: 'preposition' },
  jw: { lemma: 'jw', gloss: '(statement particle)', partOfSpeech: 'particle' },
  'ḏd.f': { lemma: 'ḏd', gloss: 'he says', partOfSpeech: 'verb' },
  'rn.f': { lemma: 'rn', gloss: 'his name', partOfSpeech: 'noun' },
  'sḏm.f': { lemma: 'sḏm', gloss: 'he hears', partOfSpeech: 'verb' },
  ḫrw: { lemma: 'ḫrw', gloss: 'voice', partOfSpeech: 'noun' },
};

export const EGY_FIRST_1: TextSection = {
  id: 'EgyFirst-1',
  textId: 'EgyFirst',
  sequence: 1,
  label: 'The King and the Scribe',
  sentences: [
    sentLex('EgyFirst-1-1', ['nfr', 'pr.'], 'The house is beautiful.', EGY_FIRST_LEX),
    sentLex('EgyFirst-1-2', ['nfr', 'st.'], 'The place is good.', EGY_FIRST_LEX),
    sentLex('EgyFirst-1-3', ['rꜥ', 'm', 'pt.'], 'Ra is in the sky.', EGY_FIRST_LEX),
    sentLex('EgyFirst-1-4', ['nsw', 'm', 'pr.'], 'The king is in the house.', EGY_FIRST_LEX),
    sentLex('EgyFirst-1-5', ['sš', 'm', 'nʾt.'], 'The scribe is in the city.', EGY_FIRST_LEX),
    sentLex('EgyFirst-1-6', ['ḏd', 'nsw.'], 'The king speaks.', EGY_FIRST_LEX),
    sentLex('EgyFirst-1-7', ['sḏm', 'sš.'], 'The scribe hears.', EGY_FIRST_LEX),
    sentLex(
      'EgyFirst-1-8',
      ['nfr', 'rn', 'n', 'nsw.'],
      'The name of the king is beautiful.',
      EGY_FIRST_LEX
    ),
    sentLex(
      'EgyFirst-1-9',
      ['ꜥnḫ', 'nsw', 'mj', 'rꜥ.'],
      'May the king live like Ra.',
      EGY_FIRST_LEX
    ),
    sentLex(
      'EgyFirst-1-10',
      ['jw', 'nsw', 'm', 'pr', 'nfr.'],
      'The king is in the beautiful house.',
      EGY_FIRST_LEX
    ),
    sentLex('EgyFirst-1-11', ['ḏd.f', 'rn.f.'], 'He says his name.', EGY_FIRST_LEX),
    sentLex(
      'EgyFirst-1-12',
      ['sḏm.f', 'ḫrw', 'n', 'rꜥ.'],
      'He hears the voice of Ra.',
      EGY_FIRST_LEX
    ),
  ],
};

// ─── Hittite (normalized transliteration) ────────────────────────────────

const HIT_FIRST_LEX: Record<string, LexicalHint> = {
  attaš: { lemma: 'atta-', gloss: 'father', partOfSpeech: 'noun' },
  attan: { lemma: 'atta-', gloss: 'father (acc.)', partOfSpeech: 'noun' },
  annaš: { lemma: 'anna-', gloss: 'mother', partOfSpeech: 'noun' },
  šalliš: { lemma: 'šalli-', gloss: 'great, big', partOfSpeech: 'adjective' },
  'LUGAL-uš': { lemma: 'haššu-', gloss: 'king', partOfSpeech: 'noun' },
  nu: { lemma: 'nu', gloss: 'and, then', partOfSpeech: 'conjunction' },
  ēšzi: { lemma: 'eš-', gloss: 'is, exists', partOfSpeech: 'verb' },
  'DUMU-aš': { lemma: 'DUMU', gloss: 'son, child', partOfSpeech: 'noun' },
  'DUMU-an': { lemma: 'DUMU', gloss: 'son (acc.)', partOfSpeech: 'noun' },
  'URU-ri': { lemma: 'URU', gloss: 'in the city', partOfSpeech: 'noun' },
  aušzi: { lemma: 'au(š)-', gloss: 'sees', partOfSpeech: 'verb' },
  'É-ir': { lemma: 'É', gloss: 'house (acc.)', partOfSpeech: 'noun' },
  wetezzi: { lemma: 'wete-', gloss: 'builds', partOfSpeech: 'verb' },
  wātar: { lemma: 'wātar', gloss: 'water', partOfSpeech: 'noun' },
  ekuzzi: { lemma: 'eku-', gloss: 'drinks', partOfSpeech: 'verb' },
  'NINDA-an': { lemma: 'NINDA', gloss: 'bread (acc.)', partOfSpeech: 'noun' },
  ēzzazzi: { lemma: 'ed-', gloss: 'eats', partOfSpeech: 'verb' },
  antuhšaš: { lemma: 'antuhša-', gloss: 'man, human being', partOfSpeech: 'noun' },
  memai: { lemma: 'mema-', gloss: 'speaks', partOfSpeech: 'verb' },
};

export const HIT_FIRST_1: TextSection = {
  id: 'HitFirst-1',
  textId: 'HitFirst',
  sequence: 1,
  label: 'Father, Mother, King',
  sentences: [
    sentLex('HitFirst-1-1', ['attaš', 'šalliš.'], 'The father is great.', HIT_FIRST_LEX),
    sentLex('HitFirst-1-2', ['annaš', 'šalliš.'], 'The mother is great.', HIT_FIRST_LEX),
    sentLex('HitFirst-1-3', ['LUGAL-uš', 'šalliš.'], 'The king is great.', HIT_FIRST_LEX),
    sentLex('HitFirst-1-4', ['nu', 'LUGAL-uš', 'ēšzi.'], 'And the king is there.', HIT_FIRST_LEX),
    sentLex(
      'HitFirst-1-5',
      ['DUMU-aš', 'URU-ri', 'ēšzi.'],
      'The son is in the city.',
      HIT_FIRST_LEX
    ),
    sentLex(
      'HitFirst-1-6',
      ['nu', 'attaš', 'DUMU-an', 'aušzi.'],
      'And the father sees the son.',
      HIT_FIRST_LEX
    ),
    sentLex(
      'HitFirst-1-7',
      ['LUGAL-uš', 'É-ir', 'wetezzi.'],
      'The king builds a house.',
      HIT_FIRST_LEX
    ),
    sentLex(
      'HitFirst-1-8',
      ['annaš', 'wātar', 'ekuzzi.'],
      'The mother drinks water.',
      HIT_FIRST_LEX
    ),
    sentLex(
      'HitFirst-1-9',
      ['DUMU-aš', 'NINDA-an', 'ēzzazzi.'],
      'The son eats bread.',
      HIT_FIRST_LEX
    ),
    sentLex('HitFirst-1-10', ['nu', 'antuhšaš', 'memai.'], 'And the man speaks.', HIT_FIRST_LEX),
    sentLex('HitFirst-1-11', ['LUGAL-uš', 'šalliš', 'ēšzi.'], 'The king is great.', HIT_FIRST_LEX),
    sentLex(
      'HitFirst-1-12',
      ['nu', 'DUMU-aš', 'attan', 'aušzi.'],
      'And the son sees the father.',
      HIT_FIRST_LEX
    ),
  ],
};

// ─── Ugaritic (alphabetic cuneiform; transliterations in the glosses) ────

const UGA_FIRST_LEX: Record<string, LexicalHint> = {
  '𐎛𐎍': { lemma: '𐎛𐎍', gloss: 'El, god (il)', partOfSpeech: 'noun' },
  '𐎗𐎁': { lemma: '𐎗𐎁', gloss: 'great (rb)', partOfSpeech: 'adjective' },
  '𐎁𐎓𐎍': { lemma: '𐎁𐎓𐎍', gloss: 'Baal, lord (bʿl)', partOfSpeech: 'noun' },
  '𐎎𐎍𐎋': { lemma: '𐎎𐎍𐎋', gloss: 'king (mlk)', partOfSpeech: 'noun' },
  '𐎀𐎁': { lemma: '𐎀𐎁', gloss: 'father (ab)', partOfSpeech: 'noun' },
  '𐎉𐎁': { lemma: '𐎉𐎁', gloss: 'good (ṭb)', partOfSpeech: 'adjective' },
  '𐎁𐎐': { lemma: '𐎁𐎐', gloss: 'son (bn)', partOfSpeech: 'noun' },
  '𐎁': { lemma: '𐎁', gloss: 'in (b)', partOfSpeech: 'preposition' },
  '𐎁𐎚': { lemma: '𐎁𐎚', gloss: 'house (bt)', partOfSpeech: 'noun' },
  '𐎊𐎎': { lemma: '𐎊𐎎', gloss: 'Yam, the sea (ym)', partOfSpeech: 'noun' },
  '𐎗𐎋𐎁': { lemma: '𐎗𐎋𐎁', gloss: 'rider (rkb)', partOfSpeech: 'noun' },
  '𐎓𐎗𐎔𐎚': { lemma: '𐎓𐎗𐎔𐎚', gloss: 'clouds (ʿrpt)', partOfSpeech: 'noun' },
};

export const UGA_FIRST_1: TextSection = {
  id: 'UgaFirst-1',
  textId: 'UgaFirst',
  sequence: 1,
  label: 'El, Baal, and the King',
  sentences: [
    sentLex('UgaFirst-1-1', ['𐎛𐎍', '𐎗𐎁.'], 'El is great.', UGA_FIRST_LEX),
    sentLex('UgaFirst-1-2', ['𐎁𐎓𐎍', '𐎎𐎍𐎋.'], 'Baal is king.', UGA_FIRST_LEX),
    sentLex('UgaFirst-1-3', ['𐎀𐎁', '𐎉𐎁.'], 'The father is good.', UGA_FIRST_LEX),
    sentLex('UgaFirst-1-4', ['𐎁𐎐', '𐎎𐎍𐎋.'], 'The son of the king.', UGA_FIRST_LEX),
    sentLex('UgaFirst-1-5', ['𐎁𐎓𐎍', '𐎁', '𐎁𐎚.'], 'Baal is in the house.', UGA_FIRST_LEX),
    sentLex('UgaFirst-1-6', ['𐎎𐎍𐎋', '𐎗𐎁.'], 'The king is great.', UGA_FIRST_LEX),
    sentLex('UgaFirst-1-7', ['𐎊𐎎', '𐎗𐎁.'], 'Yam, the sea, is great.', UGA_FIRST_LEX),
    sentLex('UgaFirst-1-8', ['𐎁𐎚', '𐎛𐎍.'], 'The house of El.', UGA_FIRST_LEX),
    sentLex(
      'UgaFirst-1-9',
      ['𐎁𐎓𐎍', '𐎗𐎋𐎁', '𐎓𐎗𐎔𐎚.'],
      'Baal is the Rider of the Clouds.',
      UGA_FIRST_LEX
    ),
    sentLex('UgaFirst-1-10', ['𐎎𐎍𐎋', '𐎁', '𐎁𐎚.'], 'The king is in the house.', UGA_FIRST_LEX),
    sentLex('UgaFirst-1-11', ['𐎁𐎐', '𐎉𐎁.'], 'The son is good.', UGA_FIRST_LEX),
    sentLex('UgaFirst-1-12', ['𐎛𐎍', '𐎀𐎁', '𐎁𐎓𐎍.'], 'El is the father of Baal.', UGA_FIRST_LEX),
  ],
};

// ─── Coptic (Sahidic) ────────────────────────────────────────────────────

const COP_FIRST_LEX: Record<string, LexicalHint> = {
  ⲡⲛⲟⲩⲧⲉ: { lemma: 'ⲛⲟⲩⲧⲉ', gloss: 'God (with article)', partOfSpeech: 'noun' },
  ⲡⲉ: { lemma: 'ⲡⲉ', gloss: 'is (copula, m.)', partOfSpeech: 'particle' },
  ⲡⲟⲩⲟⲉⲓⲛ: { lemma: 'ⲟⲩⲟⲉⲓⲛ', gloss: 'the light', partOfSpeech: 'noun' },
  ⲡⲣⲱⲙⲉ: { lemma: 'ⲣⲱⲙⲉ', gloss: 'the man', partOfSpeech: 'noun' },
  ⲛⲁⲛⲟⲩϥ: { lemma: 'ⲛⲁⲛⲟⲩ-', gloss: 'is good (m.)', partOfSpeech: 'verb' },
  ⲧⲉⲥϩⲓⲙⲉ: { lemma: 'ⲥϩⲓⲙⲉ', gloss: 'the woman', partOfSpeech: 'noun' },
  ⲛⲁⲛⲟⲩⲥ: { lemma: 'ⲛⲁⲛⲟⲩ-', gloss: 'is good (f.)', partOfSpeech: 'verb' },
  ⲁⲛⲟⲕ: { lemma: 'ⲁⲛⲟⲕ', gloss: 'I', partOfSpeech: 'pronoun' },
  ⲟⲩⲣⲱⲙⲉ: { lemma: 'ⲣⲱⲙⲉ', gloss: 'a man', partOfSpeech: 'noun' },
  ⲛⲧⲟⲕ: { lemma: 'ⲛⲧⲟⲕ', gloss: 'you (m.)', partOfSpeech: 'pronoun' },
  ⲟⲩⲥⲁϩ: { lemma: 'ⲥⲁϩ', gloss: 'a teacher', partOfSpeech: 'noun' },
  ϯⲛⲁⲩ: { lemma: 'ⲛⲁⲩ', gloss: 'I see', partOfSpeech: 'verb' },
  ⲉⲡⲏⲓ: { lemma: 'ⲏⲓ', gloss: 'the house (obj.)', partOfSpeech: 'noun' },
  ϯⲥⲱⲧⲙ: { lemma: 'ⲥⲱⲧⲙ', gloss: 'I hear', partOfSpeech: 'verb' },
  ⲉⲡϣⲁϫⲉ: { lemma: 'ϣⲁϫⲉ', gloss: 'the word (obj.)', partOfSpeech: 'noun' },
  ⲡϣⲁϫⲉ: { lemma: 'ϣⲁϫⲉ', gloss: 'the word', partOfSpeech: 'noun' },
  ⲡⲏⲓ: { lemma: 'ⲏⲓ', gloss: 'the house', partOfSpeech: 'noun' },
  ⲟⲩⲛⲟϭ: { lemma: 'ⲛⲟϭ', gloss: 'a great one', partOfSpeech: 'adjective' },
  ⲙⲉ: { lemma: 'ⲙⲉ', gloss: 'loves', partOfSpeech: 'verb' },
  ⲙⲡⲣⲱⲙⲉ: { lemma: 'ⲣⲱⲙⲉ', gloss: 'the man (obj.)', partOfSpeech: 'noun' },
  ⲙⲡⲛⲟⲩⲧⲉ: { lemma: 'ⲛⲟⲩⲧⲉ', gloss: 'God (obj.)', partOfSpeech: 'noun' },
  ⲡϣⲏⲣⲉ: { lemma: 'ϣⲏⲣⲉ', gloss: 'the son', partOfSpeech: 'noun' },
};

export const COP_FIRST_1: TextSection = {
  id: 'CopFirst-1',
  textId: 'CopFirst',
  sequence: 1,
  label: 'God, Man, and the Light',
  sentences: [
    sentLex('CopFirst-1-1', ['ⲡⲛⲟⲩⲧⲉ', 'ⲡⲉ', 'ⲡⲟⲩⲟⲉⲓⲛ.'], 'God is the light.', COP_FIRST_LEX),
    sentLex('CopFirst-1-2', ['ⲡⲣⲱⲙⲉ', 'ⲛⲁⲛⲟⲩϥ.'], 'The man is good.', COP_FIRST_LEX),
    sentLex('CopFirst-1-3', ['ⲧⲉⲥϩⲓⲙⲉ', 'ⲛⲁⲛⲟⲩⲥ.'], 'The woman is good.', COP_FIRST_LEX),
    sentLex('CopFirst-1-4', ['ⲁⲛⲟⲕ', 'ⲟⲩⲣⲱⲙⲉ.'], 'I am a man.', COP_FIRST_LEX),
    sentLex('CopFirst-1-5', ['ⲛⲧⲟⲕ', 'ⲟⲩⲥⲁϩ.'], 'You are a teacher.', COP_FIRST_LEX),
    sentLex('CopFirst-1-6', ['ϯⲛⲁⲩ', 'ⲉⲡⲏⲓ.'], 'I see the house.', COP_FIRST_LEX),
    sentLex('CopFirst-1-7', ['ϯⲥⲱⲧⲙ', 'ⲉⲡϣⲁϫⲉ.'], 'I hear the word.', COP_FIRST_LEX),
    sentLex('CopFirst-1-8', ['ⲡϣⲁϫⲉ', 'ⲛⲁⲛⲟⲩϥ.'], 'The word is good.', COP_FIRST_LEX),
    sentLex('CopFirst-1-9', ['ⲡⲏⲓ', 'ⲟⲩⲛⲟϭ', 'ⲡⲉ.'], 'The house is a great one.', COP_FIRST_LEX),
    sentLex('CopFirst-1-10', ['ⲡⲛⲟⲩⲧⲉ', 'ⲙⲉ', 'ⲙⲡⲣⲱⲙⲉ.'], 'God loves the man.', COP_FIRST_LEX),
    sentLex('CopFirst-1-11', ['ⲡⲣⲱⲙⲉ', 'ⲙⲉ', 'ⲙⲡⲛⲟⲩⲧⲉ.'], 'The man loves God.', COP_FIRST_LEX),
    sentLex('CopFirst-1-12', ['ⲁⲛⲟⲕ', 'ⲡⲉ', 'ⲡϣⲏⲣⲉ.'], 'I am the son.', COP_FIRST_LEX),
  ],
};

// ─── Aramaic (Biblical Aramaic, vocalized) ───────────────────────────────

const ARC_FIRST_LEX: Record<string, LexicalHint> = {
  מַלְכָּא: { lemma: 'מֶלֶךְ', gloss: 'the king', partOfSpeech: 'noun' },
  רַב: { lemma: 'רַב', gloss: 'great', partOfSpeech: 'adjective' },
  אֱלָהָא: { lemma: 'אֱלָהּ', gloss: 'God', partOfSpeech: 'noun' },
  טָב: { lemma: 'טָב', gloss: 'good', partOfSpeech: 'adjective' },
  בְּבֵיתָא: { lemma: 'בַּיִת', gloss: 'in the house', partOfSpeech: 'noun' },
  בַּר: { lemma: 'בַּר', gloss: 'son of', partOfSpeech: 'noun' },
  חַכִּים: { lemma: 'חַכִּים', gloss: 'wise', partOfSpeech: 'adjective' },
  בִּשְׁמַיָּא: { lemma: 'שְׁמַיִן', gloss: 'in heaven', partOfSpeech: 'noun' },
  מַלְכְּתָא: { lemma: 'מַלְכָּה', gloss: 'the queen', partOfSpeech: 'noun' },
  טָבָא: { lemma: 'טָב', gloss: 'good (f./emph.)', partOfSpeech: 'adjective' },
  סָפְרָא: { lemma: 'סָפַר', gloss: 'the scribe', partOfSpeech: 'noun' },
  כָּתֵב: { lemma: 'כתב', gloss: 'writes', partOfSpeech: 'verb' },
  אֲמַר: { lemma: 'אמר', gloss: 'said', partOfSpeech: 'verb' },
  עַבְדָּא: { lemma: 'עֲבֵד', gloss: 'the servant', partOfSpeech: 'noun' },
  שְׁמַע: { lemma: 'שׁמע', gloss: 'heard', partOfSpeech: 'verb' },
  חָכְמְתָא: { lemma: 'חָכְמָה', gloss: 'wisdom', partOfSpeech: 'noun' },
  יְהַב: { lemma: 'יהב', gloss: 'gave', partOfSpeech: 'verb' },
  כַּסְפָּא: { lemma: 'כְּסַף', gloss: 'the silver', partOfSpeech: 'noun' },
};

export const ARC_FIRST_1: TextSection = {
  id: 'ArcFirst-1',
  textId: 'ArcFirst',
  sequence: 1,
  label: 'The King and the Scribe',
  sentences: [
    sentLex('ArcFirst-1-1', ['מַלְכָּא', 'רַב.'], 'The king is great.', ARC_FIRST_LEX),
    sentLex('ArcFirst-1-2', ['אֱלָהָא', 'טָב.'], 'God is good.', ARC_FIRST_LEX),
    sentLex('ArcFirst-1-3', ['מַלְכָּא', 'בְּבֵיתָא.'], 'The king is in the house.', ARC_FIRST_LEX),
    sentLex(
      'ArcFirst-1-4',
      ['בַּר', 'מַלְכָּא', 'חַכִּים.'],
      'The son of the king is wise.',
      ARC_FIRST_LEX
    ),
    sentLex('ArcFirst-1-5', ['אֱלָהָא', 'בִּשְׁמַיָּא.'], 'God is in heaven.', ARC_FIRST_LEX),
    sentLex('ArcFirst-1-6', ['מַלְכְּתָא', 'טָבָא.'], 'The queen is good.', ARC_FIRST_LEX),
    sentLex('ArcFirst-1-7', ['סָפְרָא', 'כָּתֵב.'], 'The scribe writes.', ARC_FIRST_LEX),
    sentLex('ArcFirst-1-8', ['מַלְכָּא', 'אֲמַר.'], 'The king said.', ARC_FIRST_LEX),
    sentLex('ArcFirst-1-9', ['עַבְדָּא', 'שְׁמַע.'], 'The servant heard.', ARC_FIRST_LEX),
    sentLex('ArcFirst-1-10', ['חָכְמְתָא', 'טָבָא.'], 'Wisdom is good.', ARC_FIRST_LEX),
    sentLex(
      'ArcFirst-1-11',
      ['מַלְכָּא', 'יְהַב', 'כַּסְפָּא.'],
      'The king gave the silver.',
      ARC_FIRST_LEX
    ),
    sentLex(
      'ArcFirst-1-12',
      ['בַּר', 'מַלְכָּא', 'בְּבֵיתָא.'],
      'The son of the king is in the house.',
      ARC_FIRST_LEX
    ),
  ],
};

// ─── Syriac (Estrangela, unvocalized) ────────────────────────────────────

const SYR_FIRST_LEX: Record<string, LexicalHint> = {
  ܡܠܟܐ: { lemma: 'ܡܠܟܐ', gloss: 'the king (malkā)', partOfSpeech: 'noun' },
  ܪܒܐ: { lemma: 'ܪܒܐ', gloss: 'great (rabbā)', partOfSpeech: 'adjective' },
  ܐܠܗܐ: { lemma: 'ܐܠܗܐ', gloss: 'God (alāhā)', partOfSpeech: 'noun' },
  ܛܒܐ: { lemma: 'ܛܒܐ', gloss: 'good (ṭābā)', partOfSpeech: 'adjective' },
  ܒܒܝܬܐ: { lemma: 'ܒܝܬܐ', gloss: 'in the house (b-baytā)', partOfSpeech: 'noun' },
  ܒܪܐ: { lemma: 'ܒܪܐ', gloss: 'the son (brā)', partOfSpeech: 'noun' },
  ܕܡܠܟܐ: { lemma: 'ܡܠܟܐ', gloss: 'of the king (d-malkā)', partOfSpeech: 'noun' },
  ܚܟܝܡܐ: { lemma: 'ܚܟܝܡܐ', gloss: 'wise (ḥakkīmā)', partOfSpeech: 'adjective' },
  ܒܫܡܝܐ: { lemma: 'ܫܡܝܐ', gloss: 'in heaven (ba-šmayyā)', partOfSpeech: 'noun' },
  ܣܦܪܐ: { lemma: 'ܣܦܪܐ', gloss: 'the scribe (sāprā)', partOfSpeech: 'noun' },
  ܟܬܒ: { lemma: 'ܟܬܒ', gloss: 'writes (kāteb)', partOfSpeech: 'verb' },
  ܐܡܪ: { lemma: 'ܐܡܪ', gloss: 'said (emar)', partOfSpeech: 'verb' },
  ܥܒܕܐ: { lemma: 'ܥܒܕܐ', gloss: 'the servant (ʿabdā)', partOfSpeech: 'noun' },
  ܫܡܥ: { lemma: 'ܫܡܥ', gloss: 'heard (šmaʿ)', partOfSpeech: 'verb' },
  ܐܒܐ: { lemma: 'ܐܒܐ', gloss: 'the father (abā)', partOfSpeech: 'noun' },
  ܫܠܡܐ: { lemma: 'ܫܠܡܐ', gloss: 'the peace (šlāmā)', partOfSpeech: 'noun' },
  ܝܗܒ: { lemma: 'ܝܗܒ', gloss: 'gave (yab)', partOfSpeech: 'verb' },
  ܟܣܦܐ: { lemma: 'ܟܣܦܐ', gloss: 'the silver (kespā)', partOfSpeech: 'noun' },
};

export const SYR_FIRST_1: TextSection = {
  id: 'SyrFirst-1',
  textId: 'SyrFirst',
  sequence: 1,
  label: 'The King and the Servant',
  sentences: [
    sentLex('SyrFirst-1-1', ['ܡܠܟܐ', 'ܪܒܐ.'], 'The king is great.', SYR_FIRST_LEX),
    sentLex('SyrFirst-1-2', ['ܐܠܗܐ', 'ܛܒܐ.'], 'God is good.', SYR_FIRST_LEX),
    sentLex('SyrFirst-1-3', ['ܡܠܟܐ', 'ܒܒܝܬܐ.'], 'The king is in the house.', SYR_FIRST_LEX),
    sentLex(
      'SyrFirst-1-4',
      ['ܒܪܐ', 'ܕܡܠܟܐ', 'ܚܟܝܡܐ.'],
      'The son of the king is wise.',
      SYR_FIRST_LEX
    ),
    sentLex('SyrFirst-1-5', ['ܐܠܗܐ', 'ܒܫܡܝܐ.'], 'God is in heaven.', SYR_FIRST_LEX),
    sentLex('SyrFirst-1-6', ['ܣܦܪܐ', 'ܟܬܒ.'], 'The scribe writes.', SYR_FIRST_LEX),
    sentLex('SyrFirst-1-7', ['ܡܠܟܐ', 'ܐܡܪ.'], 'The king said.', SYR_FIRST_LEX),
    sentLex('SyrFirst-1-8', ['ܥܒܕܐ', 'ܫܡܥ.'], 'The servant heard.', SYR_FIRST_LEX),
    sentLex('SyrFirst-1-9', ['ܐܒܐ', 'ܛܒܐ.'], 'The father is good.', SYR_FIRST_LEX),
    sentLex('SyrFirst-1-10', ['ܫܠܡܐ', 'ܪܒܐ.'], 'The peace is great.', SYR_FIRST_LEX),
    sentLex('SyrFirst-1-11', ['ܡܠܟܐ', 'ܝܗܒ', 'ܟܣܦܐ.'], 'The king gave the silver.', SYR_FIRST_LEX),
    sentLex('SyrFirst-1-12', ['ܒܪܐ', 'ܒܒܝܬܐ.'], 'The son is in the house.', SYR_FIRST_LEX),
  ],
};

// ─── Sanskrit (Devanāgarī) ───────────────────────────────────────────────

const SAN_FIRST_LEX: Record<string, LexicalHint> = {
  रामः: { lemma: 'राम', gloss: 'Rama (nom.)', partOfSpeech: 'noun' },
  गच्छति: { lemma: 'गम्', gloss: 'goes', partOfSpeech: 'verb' },
  बालः: { lemma: 'बाल', gloss: 'the boy (nom.)', partOfSpeech: 'noun' },
  पठति: { lemma: 'पठ्', gloss: 'reads, recites', partOfSpeech: 'verb' },
  नरः: { lemma: 'नर', gloss: 'the man (nom.)', partOfSpeech: 'noun' },
  वदति: { lemma: 'वद्', gloss: 'speaks', partOfSpeech: 'verb' },
  बाला: { lemma: 'बाला', gloss: 'the girl (nom.)', partOfSpeech: 'noun' },
  वनं: { lemma: 'वन', gloss: 'forest (acc.)', partOfSpeech: 'noun' },
  जलं: { lemma: 'जल', gloss: 'water (acc.)', partOfSpeech: 'noun' },
  पिबति: { lemma: 'पा', gloss: 'drinks', partOfSpeech: 'verb' },
  फलं: { lemma: 'फल', gloss: 'fruit (acc.)', partOfSpeech: 'noun' },
  खादति: { lemma: 'खाद्', gloss: 'eats', partOfSpeech: 'verb' },
  बालं: { lemma: 'बाल', gloss: 'the boy (acc.)', partOfSpeech: 'noun' },
  पश्यति: { lemma: 'दृश्', gloss: 'sees', partOfSpeech: 'verb' },
  गुरुः: { lemma: 'गुरु', gloss: 'the teacher (nom.)', partOfSpeech: 'noun' },
  शिष्यं: { lemma: 'शिष्य', gloss: 'the student (acc.)', partOfSpeech: 'noun' },
  गुरुं: { lemma: 'गुरु', gloss: 'the teacher (acc.)', partOfSpeech: 'noun' },
  नमति: { lemma: 'नम्', gloss: 'bows to', partOfSpeech: 'verb' },
  च: { lemma: 'च', gloss: 'and', partOfSpeech: 'conjunction' },
  गच्छतः: { lemma: 'गम्', gloss: 'both go (dual)', partOfSpeech: 'verb' },
  वने: { lemma: 'वन', gloss: 'in the forest (loc.)', partOfSpeech: 'noun' },
  वसति: { lemma: 'वस्', gloss: 'lives, dwells', partOfSpeech: 'verb' },
};

export const SAN_FIRST_1: TextSection = {
  id: 'SanFirst-1',
  textId: 'SanFirst',
  sequence: 1,
  label: 'Rama Goes to the Forest',
  sentences: [
    sentLex('SanFirst-1-1', ['रामः', 'गच्छति.'], 'Rama goes.', SAN_FIRST_LEX),
    sentLex('SanFirst-1-2', ['बालः', 'पठति.'], 'The boy reads.', SAN_FIRST_LEX),
    sentLex('SanFirst-1-3', ['नरः', 'वदति.'], 'The man speaks.', SAN_FIRST_LEX),
    sentLex('SanFirst-1-4', ['बाला', 'गच्छति.'], 'The girl goes.', SAN_FIRST_LEX),
    sentLex('SanFirst-1-5', ['रामः', 'वनं', 'गच्छति.'], 'Rama goes to the forest.', SAN_FIRST_LEX),
    sentLex('SanFirst-1-6', ['बालः', 'जलं', 'पिबति.'], 'The boy drinks water.', SAN_FIRST_LEX),
    sentLex('SanFirst-1-7', ['नरः', 'फलं', 'खादति.'], 'The man eats fruit.', SAN_FIRST_LEX),
    sentLex('SanFirst-1-8', ['रामः', 'बालं', 'पश्यति.'], 'Rama sees the boy.', SAN_FIRST_LEX),
    sentLex(
      'SanFirst-1-9',
      ['गुरुः', 'शिष्यं', 'वदति.'],
      'The teacher speaks to the student.',
      SAN_FIRST_LEX
    ),
    sentLex(
      'SanFirst-1-10',
      ['बालः', 'गुरुं', 'नमति.'],
      'The boy bows to the teacher.',
      SAN_FIRST_LEX
    ),
    sentLex(
      'SanFirst-1-11',
      ['रामः', 'च', 'बालः', 'च', 'गच्छतः.'],
      'Rama and the boy both go.',
      SAN_FIRST_LEX
    ),
    sentLex(
      'SanFirst-1-12',
      ['नरः', 'वने', 'वसति.'],
      'The man lives in the forest.',
      SAN_FIRST_LEX
    ),
  ],
};

export const ALL_FIRST_READER_SECTIONS: TextSection[] = [
  AKK_FIRST_1,
  EGY_FIRST_1,
  HIT_FIRST_1,
  UGA_FIRST_1,
  COP_FIRST_1,
  ARC_FIRST_1,
  SYR_FIRST_1,
  SAN_FIRST_1,
];
