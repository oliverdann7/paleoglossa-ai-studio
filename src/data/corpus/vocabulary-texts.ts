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
  corpusId: 'PALEOGLOSSA',
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
  corpusId: 'PALEOGLOSSA',
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
  corpusId: 'PALEOGLOSSA',
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

// ─── Hebrew ────────────────────────────────────────────────────────────────────

const VOCAB_HEBREW_WORDS = (langPrefix: string) => [
  sent(`${langPrefix}-voc-1`, ['אָדָם'], 'man / human', { אָדָם: { lemma: 'אָדָם', gloss: 'man, human' } }),
  sent(`${langPrefix}-voc-2`, ['אִשָּׁה'], 'woman', { אִשָּׁה: { lemma: 'אִשָּׁה', gloss: 'woman, wife' } }),
  sent(`${langPrefix}-voc-3`, ['אֱלֹהִים'], 'God', { אֱלֹהִים: { lemma: 'אֱלֹהִים', gloss: 'God' } }),
  sent(`${langPrefix}-voc-4`, ['מֶלֶךְ'], 'king', { מֶלֶךְ: { lemma: 'מֶלֶךְ', gloss: 'king' } }),
  sent(`${langPrefix}-voc-5`, ['אֶרֶץ'], 'earth / land', { אֶרֶץ: { lemma: 'אֶרֶץ', gloss: 'earth, land' } }),
  sent(`${langPrefix}-voc-6`, ['שָׁמַיִם'], 'heaven', { שָׁמַיִם: { lemma: 'שָׁמַיִם', gloss: 'heaven, sky' } }),
  sent(`${langPrefix}-voc-7`, ['מַיִם'], 'water', { מַיִם: { lemma: 'מַיִם', gloss: 'water' } }),
  sent(`${langPrefix}-voc-8`, ['אֵשׁ'], 'fire', { אֵשׁ: { lemma: 'אֵשׁ', gloss: 'fire' } }),
  sent(`${langPrefix}-voc-9`, ['בַּיִת'], 'house', { בַּיִת: { lemma: 'בַּיִת', gloss: 'house' } }),
  sent(`${langPrefix}-voc-10`, ['עִיר'], 'city', { עִיר: { lemma: 'עִיר', gloss: 'city' } }),
  sent(`${langPrefix}-voc-11`, ['בֵּן'], 'son', { בֵּן: { lemma: 'בֵּן', gloss: 'son' } }),
  sent(`${langPrefix}-voc-12`, ['אָב'], 'father', { אָב: { lemma: 'אָב', gloss: 'father' } }),
  sent(`${langPrefix}-voc-13`, ['אֵם'], 'mother', { אֵם: { lemma: 'אֵם', gloss: 'mother' } }),
  sent(`${langPrefix}-voc-14`, ['טוֹב'], 'good', { טוֹב: { lemma: 'טוֹב', gloss: 'good' } }),
  sent(`${langPrefix}-voc-15`, ['רַע'], 'bad / evil', { רַע: { lemma: 'רַע', gloss: 'bad, evil' } }),
  sent(`${langPrefix}-voc-16`, ['יָד'], 'hand', { יָד: { lemma: 'יָד', gloss: 'hand' } }),
  sent(`${langPrefix}-voc-17`, ['דָּבָר'], 'word / thing', { דָּבָר: { lemma: 'דָּבָר', gloss: 'word, thing' } }),
  sent(`${langPrefix}-voc-18`, ['כֹּל'], 'all', { כֹּל: { lemma: 'כֹּל', gloss: 'all, every' } }),
  sent(`${langPrefix}-voc-19`, ['גָּדוֹל'], 'great', { גָּדוֹל: { lemma: 'גָּדוֹל', gloss: 'great, large' } }),
  sent(`${langPrefix}-voc-20`, ['קָדוֹשׁ'], 'holy', { קָדוֹשׁ: { lemma: 'קָדוֹשׁ', gloss: 'holy' } }),
];

export const TEXT_VOCAB_HEB: Text = {
  id: 'heb-vocab',
  corpusId: 'PALEOGLOSSA',
  title: '100 Most Common Biblical Hebrew Words',
  language: 'hbo',
  direction: 'rtl',
  level: 'A0',
  corpusType: 'vocabulary',
  hasTranslation: true,
  isSample: false,
  sentenceCount: 20,
  sectionsPreview: [{ id: 'heb-voc-1', label: 'Core Vocabulary' }],
};

export const HEB_VOCAB_SECTION: TextSection = {
  id: 'heb-voc-1',
  textId: 'heb-vocab',
  sequence: 1,
  label: 'Core Vocabulary',
  sentences: VOCAB_HEBREW_WORDS('heb'),
};

// ─── Syriac ────────────────────────────────────────────────────────────────────

const VOCAB_SYRIAC_WORDS = (langPrefix: string) => [
  sent(`${langPrefix}-voc-1`, ['ܐܠܗܐ'], 'God', { ܐܠܗܐ: { lemma: 'ܐܠܗܐ', gloss: 'God' } }),
  sent(`${langPrefix}-voc-2`, ['ܡܠܟܐ'], 'king', { ܡܠܟܐ: { lemma: 'ܡܠܟܐ', gloss: 'king' } }),
  sent(`${langPrefix}-voc-3`, ['ܐܪܥܐ'], 'earth', { ܐܪܥܐ: { lemma: 'ܐܪܥܐ', gloss: 'earth, land' } }),
  sent(`${langPrefix}-voc-4`, ['ܫܡܝܐ'], 'heaven', { ܫܡܝܐ: { lemma: 'ܫܡܝܐ', gloss: 'heaven, sky' } }),
  sent(`${langPrefix}-voc-5`, ['ܡܝܐ'], 'water', { ܡܝܐ: { lemma: 'ܡܝܐ', gloss: 'water' } }),
  sent(`${langPrefix}-voc-6`, ['ܢܘܗܪܐ'], 'light', { ܢܘܗܪܐ: { lemma: 'ܢܘܗܪܐ', gloss: 'light' } }),
  sent(`${langPrefix}-voc-7`, ['ܒܝܬܐ'], 'house', { ܒܝܬܐ: { lemma: 'ܒܝܬܐ', gloss: 'house' } }),
  sent(`${langPrefix}-voc-8`, ['ܒܪܐ'], 'son', { ܒܪܐ: { lemma: 'ܒܪܐ', gloss: 'son' } }),
  sent(`${langPrefix}-voc-9`, ['ܐܒܐ'], 'father', { ܐܒܐ: { lemma: 'ܐܒܐ', gloss: 'father' } }),
  sent(`${langPrefix}-voc-10`, ['ܡܠܬܐ'], 'word', { ܡܠܬܐ: { lemma: 'ܡܠܬܐ', gloss: 'word' } }),
  sent(`${langPrefix}-voc-11`, ['ܫܠܡܐ'], 'peace', { ܫܠܡܐ: { lemma: 'ܫܠܡܐ', gloss: 'peace' } }),
  sent(`${langPrefix}-voc-12`, ['ܚܘܒܐ'], 'love', { ܚܘܒܐ: { lemma: 'ܚܘܒܐ', gloss: 'love' } }),
  sent(`${langPrefix}-voc-13`, ['ܚܝܐ'], 'life', { ܚܝܐ: { lemma: 'ܚܝܐ', gloss: 'life' } }),
  sent(`${langPrefix}-voc-14`, ['ܡܘܬܐ'], 'death', { ܡܘܬܐ: { lemma: 'ܡܘܬܐ', gloss: 'death' } }),
  sent(`${langPrefix}-voc-15`, ['ܛܒ'], 'good', { ܛܒ: { lemma: 'ܛܒ', gloss: 'good' } }),
];

export const TEXT_VOCAB_SYR: Text = {
  id: 'syr-vocab',
  corpusId: 'PALEOGLOSSA',
  title: '100 Most Common Syriac Words',
  language: 'syr',
  direction: 'rtl',
  level: 'A0',
  corpusType: 'vocabulary',
  hasTranslation: true,
  isSample: false,
  sentenceCount: 15,
  sectionsPreview: [{ id: 'syr-voc-1', label: 'Core Vocabulary' }],
};

export const SYR_VOCAB_SECTION: TextSection = {
  id: 'syr-voc-1',
  textId: 'syr-vocab',
  sequence: 1,
  label: 'Core Vocabulary',
  sentences: VOCAB_SYRIAC_WORDS('syr'),
};

// ─── Coptic ─────────────────────────────────────────────────────────────────────

const VOCAB_COPTIC_WORDS = (langPrefix: string) => [
  sent(`${langPrefix}-voc-1`, ['ⲛⲟⲩⲧⲉ'], 'God', { ⲛⲟⲩⲧⲉ: { lemma: 'ⲛⲟⲩⲧⲉ', gloss: 'God' } }),
  sent(`${langPrefix}-voc-2`, ['ⲣⲱⲙⲉ'], 'man / human', { ⲣⲱⲙⲉ: { lemma: 'ⲣⲱⲙⲉ', gloss: 'man, human' } }),
  sent(`${langPrefix}-voc-3`, ['ⲥϩⲓⲙⲉ'], 'woman', { ⲥϩⲓⲙⲉ: { lemma: 'ⲥϩⲓⲙⲉ', gloss: 'woman, wife' } }),
  sent(`${langPrefix}-voc-4`, ['ⲟⲩⲟⲉⲓⲛ'], 'light', { ⲟⲩⲟⲉⲓⲛ: { lemma: 'ⲟⲩⲟⲉⲓⲛ', gloss: 'light' } }),
  sent(`${langPrefix}-voc-5`, ['ⲙⲉ'], 'truth', { ⲙⲉ: { lemma: 'ⲙⲉ', gloss: 'truth' } }),
  sent(`${langPrefix}-voc-6`, ['ϣⲁϫⲉ'], 'word', { ϣⲁϫⲉ: { lemma: 'ϣⲁϫⲉ', gloss: 'word, speech' } }),
  sent(`${langPrefix}-voc-7`, ['ⲙⲁ'], 'place', { ⲙⲁ: { lemma: 'ⲙⲁ', gloss: 'place' } }),
  sent(`${langPrefix}-voc-8`, ['ⲣⲟ'], 'mouth', { ⲣⲟ: { lemma: 'ⲣⲟ', gloss: 'mouth, door' } }),
  sent(`${langPrefix}-voc-9`, ['ϩⲏⲧ'], 'heart', { ϩⲏⲧ: { lemma: 'ϩⲏⲧ', gloss: 'heart, mind' } }),
  sent(`${langPrefix}-voc-10`, ['ⲥⲱⲧⲙ'], 'to hear', { ⲥⲱⲧⲙ: { lemma: 'ⲥⲱⲧⲙ', gloss: 'hear, obey' } }),
  sent(`${langPrefix}-voc-11`, ['ⲛⲁⲩ'], 'to see', { ⲛⲁⲩ: { lemma: 'ⲛⲁⲩ', gloss: 'see, behold' } }),
  sent(`${langPrefix}-voc-12`, ['ⲉⲓ'], 'to come', { ⲉⲓ: { lemma: 'ⲉⲓ', gloss: 'come' } }),
  sent(`${langPrefix}-voc-13`, ['ⲉⲓⲣⲉ'], 'to make / do', { ⲉⲓⲣⲉ: { lemma: 'ⲉⲓⲣⲉ', gloss: 'make, do' } }),
  sent(`${langPrefix}-voc-14`, ['ϫⲟⲟ'], 'to say', { ϫⲟⲟ: { lemma: 'ϫⲟⲟ', gloss: 'say, speak' } }),
  sent(`${langPrefix}-voc-15`, ['ⲛⲁϣⲧ'], 'to be great', { ⲛⲁϣⲧ: { lemma: 'ⲛⲁϣⲧ', gloss: 'great, mighty' } }),
];

export const TEXT_VOCAB_COP: Text = {
  id: 'cop-vocab',
  corpusId: 'PALEOGLOSSA',
  title: '100 Most Common Coptic Words',
  language: 'cop',
  direction: 'ltr',
  level: 'A0',
  corpusType: 'vocabulary',
  hasTranslation: true,
  isSample: false,
  sentenceCount: 15,
  sectionsPreview: [{ id: 'cop-voc-1', label: 'Core Vocabulary' }],
};

export const COP_VOCAB_SECTION: TextSection = {
  id: 'cop-voc-1',
  textId: 'cop-vocab',
  sequence: 1,
  label: 'Core Vocabulary',
  sentences: VOCAB_COPTIC_WORDS('cop'),
};

// ─── Aramaic ────────────────────────────────────────────────────────────────────

const VOCAB_ARAMAIC_WORDS = (langPrefix: string) => [
  sent(`${langPrefix}-voc-1`, ['יְיָ'], 'Lord', { יְיָ: { lemma: 'יְיָ', gloss: 'Lord' } }),
  sent(`${langPrefix}-voc-2`, ['מַלְכָּא'], 'king', { מַלְכָּא: { lemma: 'מַלְכָּא', gloss: 'king' } }),
  sent(`${langPrefix}-voc-3`, ['אַרְעָא'], 'earth', { אַרְעָא: { lemma: 'אַרְעָא', gloss: 'earth, land' } }),
  sent(`${langPrefix}-voc-4`, ['שְׁמַיָּא'], 'heaven', { שְׁמַיָּא: { lemma: 'שְׁמַיָּא', gloss: 'heaven, sky' } }),
  sent(`${langPrefix}-voc-5`, ['מַיָּא'], 'water', { מַיָּא: { lemma: 'מַיָּא', gloss: 'water' } }),
  sent(`${langPrefix}-voc-6`, ['נְהוֹרָא'], 'light', { נְהוֹרָא: { lemma: 'נְהוֹרָא', gloss: 'light' } }),
  sent(`${langPrefix}-voc-7`, ['חֲשׁוֹכָא'], 'darkness', { חֲשׁוֹכָא: { lemma: 'חֲשׁוֹכָא', gloss: 'darkness' } }),
  sent(`${langPrefix}-voc-8`, ['בְּרָא'], 'son', { בְּרָא: { lemma: 'בְּרָא', gloss: 'son' } }),
  sent(`${langPrefix}-voc-9`, ['אַבָּא'], 'father', { אַבָּא: { lemma: 'אַבָּא', gloss: 'father' } }),
  sent(`${langPrefix}-voc-10`, ['חֶלְמָא'], 'dream', { חֶלְמָא: { lemma: 'חֶלְמָא', gloss: 'dream' } }),
  sent(`${langPrefix}-voc-11`, ['חָכְמְתָא'], 'wisdom', { חָכְמְתָא: { lemma: 'חָכְמְתָא', gloss: 'wisdom' } }),
  sent(`${langPrefix}-voc-12`, ['טָב'], 'good', { טָב: { lemma: 'טָב', gloss: 'good' } }),
  sent(`${langPrefix}-voc-13`, ['רַב'], 'great', { רַב: { lemma: 'רַב', gloss: 'great, large' } }),
  sent(`${langPrefix}-voc-14`, ['עַבְדָּא'], 'servant', { עַבְדָּא: { lemma: 'עַבְדָּא', gloss: 'servant, slave' } }),
  sent(`${langPrefix}-voc-15`, ['מִלְּתָא'], 'word', { מִלְּתָא: { lemma: 'מִלְּתָא', gloss: 'word, thing' } }),
];

export const TEXT_VOCAB_ARC: Text = {
  id: 'arc-vocab',
  corpusId: 'PALEOGLOSSA',
  title: '100 Most Common Aramaic Words',
  language: 'arc',
  direction: 'rtl',
  level: 'A0',
  corpusType: 'vocabulary',
  hasTranslation: true,
  isSample: false,
  sentenceCount: 15,
  sectionsPreview: [{ id: 'arc-voc-1', label: 'Core Vocabulary' }],
};

export const ARC_VOCAB_SECTION: TextSection = {
  id: 'arc-voc-1',
  textId: 'arc-vocab',
  sequence: 1,
  label: 'Core Vocabulary',
  sentences: VOCAB_ARAMAIC_WORDS('arc'),
};

// ─── Akkadian ──────────────────────────────────────────────────────────────────

const VOCAB_AKKADIAN_WORDS = (langPrefix: string) => [
  sent(`${langPrefix}-voc-1`, ['šarrum'], 'king', { šarrum: { lemma: 'šarrum', gloss: 'king' } }),
  sent(`${langPrefix}-voc-2`, ['awīlum'], 'man', { awīlum: { lemma: 'awīlum', gloss: 'man' } }),
  sent(`${langPrefix}-voc-3`, ['ilum'], 'god', { ilum: { lemma: 'ilum', gloss: 'god' } }),
  sent(`${langPrefix}-voc-4`, ['bītum'], 'house', { bītum: { lemma: 'bītum', gloss: 'house, temple' } }),
  sent(`${langPrefix}-voc-5`, ['mātum'], 'land', { mātum: { lemma: 'mātum', gloss: 'land, country' } }),
  sent(`${langPrefix}-voc-6`, ['ālum'], 'city', { ālum: { lemma: 'ālum', gloss: 'city' } }),
  sent(`${langPrefix}-voc-7`, ['šamû'], 'heaven', { šamû: { lemma: 'šamû', gloss: 'heaven, sky' } }),
  sent(`${langPrefix}-voc-8`, ['mû'], 'water', { mû: { lemma: 'mû', gloss: 'water' } }),
  sent(`${langPrefix}-voc-9`, ['išātum'], 'fire', { išātum: { lemma: 'išātum', gloss: 'fire' } }),
  sent(`${langPrefix}-voc-10`, ['mārum'], 'son', { mārum: { lemma: 'mārum', gloss: 'son' } }),
  sent(`${langPrefix}-voc-11`, ['ṣīḫum'], 'laughter', { ṣīḫum: { lemma: 'ṣīḫum', gloss: 'laughter' } }),
  sent(`${langPrefix}-voc-12`, ['ṭābum'], 'good', { ṭābum: { lemma: 'ṭābum', gloss: 'good' } }),
  sent(`${langPrefix}-voc-13`, ['rabûm'], 'great', { rabûm: { lemma: 'rabûm', gloss: 'great, large' } }),
  sent(`${langPrefix}-voc-14`, ['qabûm'], 'to speak', { qabûm: { lemma: 'qabûm', gloss: 'speak, say' } }),
  sent(`${langPrefix}-voc-15`, ['alākum'], 'to go', { alākum: { lemma: 'alākum', gloss: 'go, come' } }),
];

export const TEXT_VOCAB_AKK: Text = {
  id: 'akk-vocab',
  corpusId: 'PALEOGLOSSA',
  title: '100 Most Common Akkadian Words',
  language: 'akk',
  direction: 'ltr',
  level: 'A0',
  corpusType: 'vocabulary',
  hasTranslation: true,
  isSample: false,
  sentenceCount: 15,
  sectionsPreview: [{ id: 'akk-voc-1', label: 'Core Vocabulary' }],
};

export const AKK_VOCAB_SECTION: TextSection = {
  id: 'akk-voc-1',
  textId: 'akk-vocab',
  sequence: 1,
  label: 'Core Vocabulary',
  sentences: VOCAB_AKKADIAN_WORDS('akk'),
};

// ─── Hittite ────────────────────────────────────────────────────────────────────

const VOCAB_HITTITE_WORDS = (langPrefix: string) => [
  sent(`${langPrefix}-voc-1`, ['LUGAL'], 'king', { LUGAL: { lemma: 'LUGAL', gloss: 'king' } }),
  sent(`${langPrefix}-voc-2`, ['LÚKÚR'], 'enemy', { LÚKÚR: { lemma: 'LÚKÚR', gloss: 'enemy' } }),
  sent(`${langPrefix}-voc-3`, ['KUR'], 'land', { KUR: { lemma: 'KUR', gloss: 'land, country' } }),
  sent(`${langPrefix}-voc-4`, ['URU'], 'city', { URU: { lemma: 'URU', gloss: 'city' } }),
  sent(`${langPrefix}-voc-5`, ['ÉRINMEŠ'], 'troops', { ÉRINMEŠ: { lemma: 'ÉRINMEŠ', gloss: 'troops, army' } }),
  sent(`${langPrefix}-voc-6`, ['DINGIR'], 'god', { DINGIR: { lemma: 'DINGIR', gloss: 'god' } }),
  sent(`${langPrefix}-voc-7`, ['dUTU'], 'sun', { dUTU: { lemma: 'dUTU', gloss: 'sun, day' } }),
  sent(`${langPrefix}-voc-8`, ['MU'], 'year', { MU: { lemma: 'MU', gloss: 'year' } }),
  sent(`${langPrefix}-voc-9`, ['LUGAL.GAL'], 'great king', { 'LUGAL.GAL': { lemma: 'LUGAL.GAL', gloss: 'great king' } }),
  sent(`${langPrefix}-voc-10`, ['mān'], 'if / when', { mān: { lemma: 'mān', gloss: 'if, when' } }),
  sent(`${langPrefix}-voc-11`, ['nu'], 'and / then', { nu: { lemma: 'nu', gloss: 'and, then' } }),
  sent(`${langPrefix}-voc-12`, ['pa-'], 'to go', { 'pa-': { lemma: 'pa-', gloss: 'to go' } }),
  sent(`${langPrefix}-voc-13`, ['uwa-'], 'to come', { 'uwa-': { lemma: 'uwa-', gloss: 'to come' } }),
  sent(`${langPrefix}-voc-14`, ['ḫar-'], 'to have', { 'ḫar-': { lemma: 'ḫar-', gloss: 'to have, hold' } }),
  sent(`${langPrefix}-voc-15`, ['ak-'], 'to die', { 'ak-': { lemma: 'ak-', gloss: 'to die' } }),
];

export const TEXT_VOCAB_HIT: Text = {
  id: 'hit-vocab',
  corpusId: 'PALEOGLOSSA',
  title: '100 Most Common Hittite Words',
  language: 'hit',
  direction: 'ltr',
  level: 'A0',
  corpusType: 'vocabulary',
  hasTranslation: true,
  isSample: false,
  sentenceCount: 15,
  sectionsPreview: [{ id: 'hit-voc-1', label: 'Core Vocabulary' }],
};

export const HIT_VOCAB_SECTION: TextSection = {
  id: 'hit-voc-1',
  textId: 'hit-vocab',
  sequence: 1,
  label: 'Core Vocabulary',
  sentences: VOCAB_HITTITE_WORDS('hit'),
};

// ─── Ugaritic ───────────────────────────────────────────────────────────────────

const VOCAB_UGARITIC_WORDS = (langPrefix: string) => [
  sent(`${langPrefix}-voc-1`, ['𐎁𐎓𐎍'], 'Baal / lord', { '𐎁𐎓𐎍': { lemma: '𐎁𐎓𐎍', gloss: 'Baal, lord, master' } }),
  sent(`${langPrefix}-voc-2`, ['𐎛𐎍'], 'El / god', { '𐎛𐎍': { lemma: '𐎛𐎍', gloss: 'El, god' } }),
  sent(`${langPrefix}-voc-3`, ['𐎎𐎍𐎋'], 'king', { '𐎎𐎍𐎋': { lemma: '𐎎𐎍𐎋', gloss: 'king' } }),
  sent(`${langPrefix}-voc-4`, ['𐎁𐎐'], 'son', { '𐎁𐎐': { lemma: '𐎁𐎐', gloss: 'son' } }),
  sent(`${langPrefix}-voc-5`, ['𐎃𐎐'], 'to be gracious', { '𐎃𐎐': { lemma: '𐎃𐎐', gloss: 'to be gracious' } }),
  sent(`${langPrefix}-voc-6`, ['𐎖𐎍'], 'voice', { '𐎖𐎍': { lemma: '𐎖𐎍', gloss: 'voice, sound' } }),
  sent(`${langPrefix}-voc-7`, ['𐎂𐎁𐎗'], 'man', { '𐎂𐎁𐎗': { lemma: '𐎂𐎁𐎗', gloss: 'man, warrior' } }),
  sent(`${langPrefix}-voc-8`, ['𐎋𐎒𐎀'], 'throne', { '𐎋𐎒𐎀': { lemma: '𐎋𐎒𐎀', gloss: 'throne, seat' } }),
  sent(`${langPrefix}-voc-9`, ['𐎜𐎄𐎐'], 'ear', { '𐎜𐎄𐎐': { lemma: '𐎜𐎄𐎐', gloss: 'ear' } }),
  sent(`${langPrefix}-voc-10`, ['𐎊𐎄'], 'hand', { '𐎊𐎄': { lemma: '𐎊𐎄', gloss: 'hand' } }),
  sent(`${langPrefix}-voc-11`, ['𐎌𐎁𐎓'], 'seven', { '𐎌𐎁𐎓': { lemma: '𐎌𐎁𐎓', gloss: 'seven' } }),
  sent(`${langPrefix}-voc-12`, ['𐎋𐎁𐎄'], 'liver / honor', { '𐎋𐎁𐎄': { lemma: '𐎋𐎁𐎄', gloss: 'liver, honor, weighty' } }),
  sent(`${langPrefix}-voc-13`, ['𐎎𐎅'], 'what?', { '𐎎𐎅': { lemma: '𐎎𐎅', gloss: 'what?' } }),
  sent(`${langPrefix}-voc-14`, ['𐎌𐎐𐎀'], 'to hate', { '𐎌𐎐𐎀': { lemma: '𐎌𐎐𐎀', gloss: 'to hate' } }),
  sent(`${langPrefix}-voc-15`, ['𐎂𐎗'], 'to attack', { '𐎂𐎗': { lemma: '𐎂𐎗', gloss: 'to attack, fight' } }),
];

export const TEXT_VOCAB_UGA: Text = {
  id: 'uga-vocab',
  corpusId: 'PALEOGLOSSA',
  title: '100 Most Common Ugaritic Words',
  language: 'uga',
  direction: 'ltr',
  level: 'A0',
  corpusType: 'vocabulary',
  hasTranslation: true,
  isSample: false,
  sentenceCount: 15,
  sectionsPreview: [{ id: 'uga-voc-1', label: 'Core Vocabulary' }],
};

export const UGA_VOCAB_SECTION: TextSection = {
  id: 'uga-voc-1',
  textId: 'uga-vocab',
  sequence: 1,
  label: 'Core Vocabulary',
  sentences: VOCAB_UGARITIC_WORDS('uga'),
};

// ─── Sanskrit ───────────────────────────────────────────────────────────────────

const VOCAB_SANSKRIT_WORDS = (langPrefix: string) => [
  sent(`${langPrefix}-voc-1`, ['धर्म'], 'dharma / duty', { धर्म: { lemma: 'धर्म', gloss: 'dharma, law, duty' } }),
  sent(`${langPrefix}-voc-2`, ['कर्म'], 'action / karma', { कर्म: { lemma: 'कर्म', gloss: 'action, karma' } }),
  sent(`${langPrefix}-voc-3`, ['अर्थ'], 'wealth / meaning', { अर्थ: { lemma: 'अर्थ', gloss: 'wealth, purpose, meaning' } }),
  sent(`${langPrefix}-voc-4`, ['मोक्ष'], 'liberation', { मोक्ष: { lemma: 'मोक्ष', gloss: 'liberation, release' } }),
  sent(`${langPrefix}-voc-5`, ['आत्मन्'], 'self / soul', { आत्मन्: { lemma: 'आत्मन्', gloss: 'self, soul, atman' } }),
  sent(`${langPrefix}-voc-6`, ['ब्रह्मन्'], 'Brahman', { ब्रह्मन्: { lemma: 'ब्रह्मन्', gloss: 'Brahman, ultimate reality' } }),
  sent(`${langPrefix}-voc-7`, ['देव'], 'god', { देव: { lemma: 'देव', gloss: 'god, deity' } }),
  sent(`${langPrefix}-voc-8`, ['मनुष्य'], 'human', { मनुष्य: { lemma: 'मनुष्य', gloss: 'human, man' } }),
  sent(`${langPrefix}-voc-9`, ['राजन्'], 'king', { राजन्: { lemma: 'राजन्', gloss: 'king' } }),
  sent(`${langPrefix}-voc-10`, ['गुरु'], 'teacher', { गुरु: { lemma: 'गुरु', gloss: 'teacher, guru, heavy' } }),
  sent(`${langPrefix}-voc-11`, ['शिष्य'], 'disciple', { शिष्य: { lemma: 'शिष्य', gloss: 'disciple, student' } }),
  sent(`${langPrefix}-voc-12`, ['प्रेमन्'], 'love', { प्रेमन्: { lemma: 'प्रेमन्', gloss: 'love' } }),
  sent(`${langPrefix}-voc-13`, ['ज्ञान'], 'knowledge', { ज्ञान: { lemma: 'ज्ञान', gloss: 'knowledge, wisdom' } }),
  sent(`${langPrefix}-voc-14`, ['शान्ति'], 'peace', { शान्ति: { lemma: 'शान्ति', gloss: 'peace, tranquility' } }),
  sent(`${langPrefix}-voc-15`, ['सत्य'], 'truth', { सत्य: { lemma: 'सत्य', gloss: 'truth' } }),
];

export const TEXT_VOCAB_SAN: Text = {
  id: 'san-vocab',
  corpusId: 'PALEOGLOSSA',
  title: '100 Most Common Sanskrit Words',
  language: 'san',
  direction: 'ltr',
  level: 'A0',
  corpusType: 'vocabulary',
  hasTranslation: true,
  isSample: false,
  sentenceCount: 15,
  sectionsPreview: [{ id: 'san-voc-1', label: 'Core Vocabulary' }],
};

export const SAN_VOCAB_SECTION: TextSection = {
  id: 'san-voc-1',
  textId: 'san-vocab',
  sequence: 1,
  label: 'Core Vocabulary',
  sentences: VOCAB_SANSKRIT_WORDS('san'),
};

// ─── Egyptian ───────────────────────────────────────────────────────────────────

const VOCAB_EGYPTIAN_WORDS = (langPrefix: string) => [
  sent(`${langPrefix}-voc-1`, ['nṯr'], 'god', { nṯr: { lemma: 'nṯr', gloss: 'god' } }),
  sent(`${langPrefix}-voc-2`, ['rmṯ'], 'people', { rmṯ: { lemma: 'rmṯ', gloss: 'people, mankind' } }),
  sent(`${langPrefix}-voc-3`, ['pr'], 'house', { pr: { lemma: 'pr', gloss: 'house, temple, domain' } }),
  sent(`${langPrefix}-voc-4`, ['tȝ'], 'land', { tȝ: { lemma: 'tȝ', gloss: 'land, earth' } }),
  sent(`${langPrefix}-voc-5`, ['ḥr'], 'face / upon', { ḥr: { lemma: 'ḥr', gloss: 'face, upon' } }),
  sent(`${langPrefix}-voc-6`, ['ỉb'], 'heart', { ỉb: { lemma: 'ỉb', gloss: 'heart, mind' } }),
  sent(`${langPrefix}-voc-7`, ['r'], 'mouth', { r: { lemma: 'r', gloss: 'mouth, speech' } }),
  sent(`${langPrefix}-voc-8`, ['nfr'], 'good / beautiful', { nfr: { lemma: 'nfr', gloss: 'good, beautiful, perfect' } }),
  sent(`${langPrefix}-voc-9`, ['ˁnḫ'], 'life / live', { 'ˁnḫ': { lemma: 'ˁnḫ', gloss: 'life, to live' } }),
  sent(`${langPrefix}-voc-10`, ['mȝˁt'], 'truth / order', { mȝˁt: { lemma: 'mȝˁt', gloss: 'truth, justice, Maat' } }),
  sent(`${langPrefix}-voc-11`, ['ỉr'], 'to make / do', { ỉr: { lemma: 'ỉr', gloss: 'to make, to do' } }),
  sent(`${langPrefix}-voc-12`, ['ḏd'], 'to say', { ḏd: { lemma: 'ḏd', gloss: 'to say, speak' } }),
  sent(`${langPrefix}-voc-13`, ['m'], 'in / from / as', { m: { lemma: 'm', gloss: 'in, from, as, with' } }),
  sent(`${langPrefix}-voc-14`, ['n'], 'to / for / of', { n: { lemma: 'n', gloss: 'to, for, of, belonging to' } }),
  sent(`${langPrefix}-voc-15`, ['ỉw'], 'and / while', { ỉw: { lemma: 'ỉw', gloss: 'and, while, (auxiliary)' } }),
];

export const TEXT_VOCAB_EGY: Text = {
  id: 'egy-vocab',
  corpusId: 'PALEOGLOSSA',
  title: '100 Most Common Egyptian Words',
  language: 'egy',
  direction: 'ltr',
  level: 'A0',
  corpusType: 'vocabulary',
  hasTranslation: true,
  isSample: false,
  sentenceCount: 15,
  sectionsPreview: [{ id: 'egy-voc-1', label: 'Core Vocabulary' }],
};

export const EGY_VOCAB_SECTION: TextSection = {
  id: 'egy-voc-1',
  textId: 'egy-vocab',
  sequence: 1,
  label: 'Core Vocabulary',
  sentences: VOCAB_EGYPTIAN_WORDS('egy'),
};
