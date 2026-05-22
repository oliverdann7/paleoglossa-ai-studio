import type { TextSection, Text, Sentence } from '../../types/corpus.js';

function sent(id: string, words: string[], translation: string, lemmaGloss?: Record<string, { lemma: string; gloss: string }>): Sentence {
  return {
    id,
    tokens: words.map((w, i) => {
      const clean = w.replace(/^[\s.,;·:!?()"«»—–]+|[\s.,;·:!?()"«»—–]+$/g, '');
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

const VOCAB_COMMON_WORDS = (langPrefix: string) => [
  sent(`${langPrefix}-voc-1`, ['ἄνθρωπος'], 'man / human', { ἄνθρωπος: { lemma: 'ἄνθρωπος', gloss: 'man, human' } }),
  sent(`${langPrefix}-voc-2`, ['θεός'], 'god', { θεός: { lemma: 'θεός', gloss: 'god' } }),
  sent(`${langPrefix}-voc-3`, ['οἶκος'], 'house', { οἶκος: { lemma: 'οἶκος', gloss: 'house' } }),
  sent(`${langPrefix}-voc-4`, ['λόγος'], 'word', { λόγος: { lemma: 'λόγος', gloss: 'word, reason' } }),
  sent(`${langPrefix}-voc-5`, ['ὕδωρ'], 'water', { ὕδωρ: { lemma: 'ὕδωρ', gloss: 'water' } }),
  sent(`${langPrefix}-voc-6`, ['πῦρ'], 'fire', { πῦρ: { lemma: 'πῦρ', gloss: 'fire' } }),
  sent(`${langPrefix}-voc-7`, ['γῆ'], 'earth', { γῆ: { lemma: 'γῆ', gloss: 'earth, land' } }),
  sent(`${langPrefix}-voc-8`, ['οὐρανός'], 'heaven', { οὐρανός: { lemma: 'οὐρανός', gloss: 'heaven, sky' } }),
  sent(`${langPrefix}-voc-9`, ['μέγας'], 'great', { μέγας: { lemma: 'μέγας', gloss: 'great, large' } }),
  sent(`${langPrefix}-voc-10`, ['καλός'], 'beautiful', { καλός: { lemma: 'καλός', gloss: 'beautiful, good' } }),
  sent(`${langPrefix}-voc-11`, ['ἀγαθός'], 'good', { ἀγαθός: { lemma: 'ἀγαθός', gloss: 'good' } }),
  sent(`${langPrefix}-voc-12`, ['πολύς'], 'many', { πολύς: { lemma: 'πολύς', gloss: 'many, much' } }),
  sent(`${langPrefix}-voc-13`, ['εἷς'], 'one', { εἷς: { lemma: 'εἷς', gloss: 'one' } }),
  sent(`${langPrefix}-voc-14`, ['δύο'], 'two', { δύο: { lemma: 'δύο', gloss: 'two' } }),
  sent(`${langPrefix}-voc-15`, ['τρία'], 'three', { τρία: { lemma: 'τρία', gloss: 'three' } }),
  sent(`${langPrefix}-voc-16`, ['ἐγώ'], 'I / me', { ἐγώ: { lemma: 'ἐγώ', gloss: 'I, me' } }),
  sent(`${langPrefix}-voc-17`, ['σύ'], 'you', { σύ: { lemma: 'σύ', gloss: 'you (sg)' } }),
  sent(`${langPrefix}-voc-18`, ['ποιέω'], 'I make / do', { ποιέω: { lemma: 'ποιέω', gloss: 'make, do' } }),
  sent(`${langPrefix}-voc-19`, ['λέγω'], 'I say / speak', { λέγω: { lemma: 'λέγω', gloss: 'say, speak' } }),
  sent(`${langPrefix}-voc-20`, ['ἔχω'], 'I have', { ἔχω: { lemma: 'ἔχω', gloss: 'have, hold' } }),
  sent(`${langPrefix}-voc-21`, ['εἰμί'], 'I am', { εἰμί: { lemma: 'εἰμί', gloss: 'be, exist' } }),
  sent(`${langPrefix}-voc-22`, ['ἔρχομαι'], 'I come / go', { ἔρχομαι: { lemma: 'ἔρχομαι', gloss: 'come, go' } }),
];

export const TEXT_VOCAB_GRC: Text = {
  id: 'grc-vocab',
  corpusId: 'ANCIENT_GREEK',
  title: '100 Most Common Ancient Greek Words',
  language: 'grc',
  direction: 'ltr',
  level: 'A0',
  corpusType: 'vocabulary',
  hasTranslation: true,
  isSample: false,
  sentenceCount: 22,
  sectionsPreview: [{ id: 'grc-voc-1', label: 'Core Vocabulary' }],
};

export const GRC_VOCAB_SECTION: TextSection = {
  id: 'grc-voc-1',
  textId: 'grc-vocab',
  sequence: 1,
  label: 'Core Vocabulary',
  sentences: VOCAB_COMMON_WORDS('grc'),
};

const VOCAB_KOINE_WORDS = (langPrefix: string) => [
  sent(`${langPrefix}-voc-1`, ['ἄνθρωπος'], 'man / human', { ἄνθρωπος: { lemma: 'ἄνθρωπος', gloss: 'man, human' } }),
  sent(`${langPrefix}-voc-2`, ['θεός'], 'god', { θεός: { lemma: 'θεός', gloss: 'god' } }),
  sent(`${langPrefix}-voc-3`, ['κύριος'], 'lord', { κύριος: { lemma: 'κύριος', gloss: 'lord, master' } }),
  sent(`${langPrefix}-voc-4`, ['λόγος'], 'word', { λόγος: { lemma: 'λόγος', gloss: 'word, reason' } }),
  sent(`${langPrefix}-voc-5`, ['πνεῦμα'], 'spirit', { πνεῦμα: { lemma: 'πνεῦμα', gloss: 'spirit, wind' } }),
  sent(`${langPrefix}-voc-6`, ['βασιλεία'], 'kingdom', { βασιλεία: { lemma: 'βασιλεία', gloss: 'kingdom' } }),
  sent(`${langPrefix}-voc-7`, ['ἀγάπη'], 'love', { ἀγάπη: { lemma: 'ἀγάπη', gloss: 'love' } }),
  sent(`${langPrefix}-voc-8`, ['πίστις'], 'faith', { πίστις: { lemma: 'πίστις', gloss: 'faith, trust' } }),
  sent(`${langPrefix}-voc-9`, ['ἁμαρτία'], 'sin', { ἁμαρτία: { lemma: 'ἁμαρτία', gloss: 'sin' } }),
  sent(`${langPrefix}-voc-10`, ['σῴζω'], 'I save', { σῴζω: { lemma: 'σῴζω', gloss: 'save, heal' } }),
  sent(`${langPrefix}-voc-11`, ['ἀποστέλλω'], 'I send', { ἀποστέλλω: { lemma: 'ἀποστέλλω', gloss: 'send' } }),
  sent(`${langPrefix}-voc-12`, ['γινώσκω'], 'I know', { γινώσκω: { lemma: 'γινώσκω', gloss: 'know' } }),
  sent(`${langPrefix}-voc-13`, ['ἀκούω'], 'I hear', { ἀκούω: { lemma: 'ἀκούω', gloss: 'hear, listen' } }),
  sent(`${langPrefix}-voc-14`, ['γράφω'], 'I write', { γράφω: { lemma: 'γράφω', gloss: 'write' } }),
  sent(`${langPrefix}-voc-15`, ['δίκαιος'], 'righteous', { δίκαιος: { lemma: 'δίκαιος', gloss: 'righteous, just' } }),
  sent(`${langPrefix}-voc-16`, ['υἱός'], 'son', { υἱός: { lemma: 'υἱός', gloss: 'son' } }),
  sent(`${langPrefix}-voc-17`, ['πατήρ'], 'father', { πατήρ: { lemma: 'πατήρ', gloss: 'father' } }),
  sent(`${langPrefix}-voc-18`, ['γυνή'], 'woman / wife', { γυνή: { lemma: 'γυνή', gloss: 'woman, wife' } }),
  sent(`${langPrefix}-voc-19`, ['ἀνήρ'], 'man / husband', { ἀνήρ: { lemma: 'ἀνήρ', gloss: 'man, husband' } }),
  sent(`${langPrefix}-voc-20`, ['τέκνον'], 'child', { τέκνον: { lemma: 'τέκνον', gloss: 'child' } }),
];

export const TEXT_VOCAB_GRC_KOINE: Text = {
  id: 'grc-koine-vocab',
  corpusId: 'SBLGNT',
  title: '100 Most Common Koine Greek Words',
  language: 'grc-koine',
  direction: 'ltr',
  level: 'A0',
  corpusType: 'vocabulary',
  hasTranslation: true,
  isSample: false,
  sentenceCount: 20,
  sectionsPreview: [{ id: 'grc-koine-voc-1', label: 'Core Vocabulary' }],
};

export const GRC_KOINE_VOCAB_SECTION: TextSection = {
  id: 'grc-koine-voc-1',
  textId: 'grc-koine-vocab',
  sequence: 1,
  label: 'Core Vocabulary',
  sentences: VOCAB_KOINE_WORDS('grc-koine'),
};

const VOCAB_LATIN_WORDS = (langPrefix: string) => [
  sent(`${langPrefix}-voc-1`, ['vir'], 'man', { vir: { lemma: 'vir', gloss: 'man' } }),
  sent(`${langPrefix}-voc-2`, ['femina'], 'woman', { femina: { lemma: 'femina', gloss: 'woman' } }),
  sent(`${langPrefix}-voc-3`, ['deus'], 'god', { deus: { lemma: 'deus', gloss: 'god' } }),
  sent(`${langPrefix}-voc-4`, ['terra'], 'earth', { terra: { lemma: 'terra', gloss: 'earth, land' } }),
  sent(`${langPrefix}-voc-5`, ['caelum'], 'heaven', { caelum: { lemma: 'caelum', gloss: 'heaven, sky' } }),
  sent(`${langPrefix}-voc-6`, ['aqua'], 'water', { aqua: { lemma: 'aqua', gloss: 'water' } }),
  sent(`${langPrefix}-voc-7`, ['ignis'], 'fire', { ignis: { lemma: 'ignis', gloss: 'fire' } }),
  sent(`${langPrefix}-voc-8`, ['domus'], 'house', { domus: { lemma: 'domus', gloss: 'house, home' } }),
  sent(`${langPrefix}-voc-9`, ['rex'], 'king', { rex: { lemma: 'rex', gloss: 'king' } }),
  sent(`${langPrefix}-voc-10`, ['bellum'], 'war', { bellum: { lemma: 'bellum', gloss: 'war' } }),
  sent(`${langPrefix}-voc-11`, ['pax'], 'peace', { pax: { lemma: 'pax', gloss: 'peace' } }),
  sent(`${langPrefix}-voc-12`, ['amor'], 'love', { amor: { lemma: 'amor', gloss: 'love' } }),
  sent(`${langPrefix}-voc-13`, ['vita'], 'life', { vita: { lemma: 'vita', gloss: 'life' } }),
  sent(`${langPrefix}-voc-14`, ['mors'], 'death', { mors: { lemma: 'mors', gloss: 'death' } }),
  sent(`${langPrefix}-voc-15`, ['bonus'], 'good', { bonus: { lemma: 'bonus', gloss: 'good' } }),
  sent(`${langPrefix}-voc-16`, ['malus'], 'bad', { malus: { lemma: 'malus', gloss: 'bad, evil' } }),
  sent(`${langPrefix}-voc-17`, ['magnus'], 'great', { magnus: { lemma: 'magnus', gloss: 'great, large' } }),
  sent(`${langPrefix}-voc-18`, ['parvus'], 'small', { parvus: { lemma: 'parvus', gloss: 'small' } }),
  sent(`${langPrefix}-voc-19`, ['amo'], 'I love', { amo: { lemma: 'amo', gloss: 'love' } }),
  sent(`${langPrefix}-voc-20`, ['dico'], 'I say', { dico: { lemma: 'dico', gloss: 'say, speak' } }),
  sent(`${langPrefix}-voc-21`, ['facio'], 'I make', { facio: { lemma: 'facio', gloss: 'make, do' } }),
  sent(`${langPrefix}-voc-22`, ['video'], 'I see', { video: { lemma: 'video', gloss: 'see' } }),
  sent(`${langPrefix}-voc-23`, ['venio'], 'I come', { venio: { lemma: 'venio', gloss: 'come' } }),
  sent(`${langPrefix}-voc-24`, ['eo'], 'I go', { eo: { lemma: 'eo', gloss: 'go' } }),
  sent(`${langPrefix}-voc-25`, ['sum'], 'I am', { sum: { lemma: 'sum', gloss: 'be, exist' } }),
];

export const TEXT_VOCAB_LAT: Text = {
  id: 'lat-vocab',
  corpusId: 'LATIN_CLASSIC',
  title: '100 Most Common Latin Words',
  language: 'lat',
  direction: 'ltr',
  level: 'A0',
  corpusType: 'vocabulary',
  hasTranslation: true,
  isSample: false,
  sentenceCount: 25,
  sectionsPreview: [{ id: 'lat-voc-1', label: 'Core Vocabulary' }],
};

export const LAT_VOCAB_SECTION: TextSection = {
  id: 'lat-voc-1',
  textId: 'lat-vocab',
  sequence: 1,
  label: 'Core Vocabulary',
  sentences: VOCAB_LATIN_WORDS('lat'),
};
