import { Text, TextSection, Sentence, Token, Corpus, SourceAttribution } from '../types/corpus';

export const ATTRIBUTIONS: Record<string, SourceAttribution> = {
  'sblgnt-text': {
    id: 'sblgnt-text',
    sourceName: 'SBL Greek New Testament',
    sourceUrl: 'https://sblgnt.com',
    dataType: 'text',
    licenseName: 'SBLGNT License',
    licenseUrl: 'https://sblgnt.com/license/',
    attributionText: 'The SBL Greek New Testament, edited by Michael W. Holmes. Copyright 2010 Society of Biblical Literature and Logos Bible Software.',
    requiresAttribution: true,
    allowsCommercialUse: false, // The license restricts commercial without permission
    allowsModification: false, // Generally derivative works of the SBLGNT are not permitted without permission
    shareAlike: false
  },
  'morphgnt-parsing': {
    id: 'morphgnt-parsing',
    sourceName: 'MorphGNT',
    sourceUrl: 'https://github.com/morphgnt/sblgnt',
    dataType: 'morphology',
    licenseName: 'CC BY-SA 3.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
    attributionText: 'Morphological parsing by MorphGNT.',
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: true
  },
  'oshb-text-morph': {
    id: 'oshb-text-morph',
    sourceName: 'Open Scriptures Hebrew Bible',
    sourceUrl: 'https://github.com/openscriptures/morphhb',
    dataType: 'text',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    attributionText: 'OSHB text and morphology provided by Open Scriptures.',
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: false,
    notes: 'Includes WLC text.'
  },
  'stepbible-lexicon': {
    id: 'stepbible-lexicon',
    sourceName: 'STEPBible Lexicon',
    sourceUrl: 'https://www.stepbible.org/',
    dataType: 'lexicon',
    licenseName: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    attributionText: 'Lexical data provided by STEPBible (Tyndale House).',
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: false
  },
  'wlc-text': {
    id: 'wlc-text',
    sourceName: 'Westminster Leningrad Codex',
    sourceUrl: 'https://tanach.us/',
    dataType: 'text',
    licenseName: 'Public Domain',
    attributionText: 'The Westminster Leningrad Codex (Public Domain).',
    requiresAttribution: false,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: false
  }
};

export const GREEK_CORPUS: Corpus = {
  id: 'SBLGNT',
  title: 'SBL Greek New Testament',
  description: 'The SBL Greek New Testament, edited by Michael W. Holmes. Copyright 2010 Society of Biblical Literature and Logos Bible Software.',
  language: 'grc',
  sourceAttributionId: 'sblgnt-text',
  licenseSummary: 'Non-Commercial, Attribution Required',
  importStatus: 'partial',
  attribution: [ATTRIBUTIONS['sblgnt-text'], ATTRIBUTIONS['morphgnt-parsing']]
};

export const HEBREW_CORPUS: Corpus = {
  id: 'OSHB',
  title: 'Open Scriptures Hebrew Bible',
  description: 'Open Scriptures Hebrew Bible aligned to morphological parsing and Strong’s numbers.',
  language: 'hbo',
  sourceAttributionId: 'oshb-text-morph',
  licenseSummary: 'CC BY 4.0',
  importStatus: 'partial',
  attribution: [ATTRIBUTIONS['oshb-text-morph'], ATTRIBUTIONS['wlc-text']]
};

export const TEXT_MATTHEW: Text = {
  id: 'Mt',
  corpusId: 'SBLGNT',
  title: 'ΚΑΤΑ ΜΑΘΘΑΙΟΝ',
  canonicalRef: 'Matthew',
  author: 'Matthew',
  language: 'grc',
  direction: 'ltr',
  sourceAttributionId: 'sblgnt-text',
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: true,
  sectionsPreview: [
    { id: 'Mt-1', label: 'Chapter 1' }
  ]
};

export const TEXT_GENESIS: Text = {
  id: 'Gen',
  corpusId: 'OSHB',
  title: 'בְּרֵאשִׁית',
  canonicalRef: 'Genesis',
  author: 'Moses',
  language: 'hbo',
  direction: 'rtl',
  sourceAttributionId: 'oshb-text-morph',
  hasMorphology: true,
  hasTranslation: true,
  hasTransliteration: false,
  sectionsPreview: [
    { id: 'Gen-1', label: 'Chapter 1' }
  ]
};

export const MATTHEW_1: TextSection = {
  id: 'Mt-1',
  textId: 'Mt',
  sequence: 1,
  label: 'Matthew 1',
  sentences: [
    {
      id: 'Mt-1-1',
      translation: 'The book of the genealogy of Jesus Christ, the son of David, the son of Abraham.',
      tokens: [
        { id: 'Mt-1-1-1', surface: 'Βίβλος', normalized: 'βιβλος', lemma: 'βίβλος', gloss: 'book, record', morphology: { partOfSpeech: 'noun', case: 'nominative', number: 'singular', gender: 'feminine' }, transliteration: 'Biblos', punctBefore: '', punctAfter: ' ' },
        { id: 'Mt-1-1-2', surface: 'γενέσεως', normalized: 'γενεσεως', lemma: 'γένεσις', gloss: 'origin, birth, genealogy', morphology: { partOfSpeech: 'noun', case: 'genitive', number: 'singular', gender: 'feminine' }, transliteration: 'geneseōs', punctBefore: '', punctAfter: ' ' },
        { id: 'Mt-1-1-3', surface: 'Ἰησοῦ', normalized: 'ιησου', lemma: 'Ἰησοῦς', gloss: 'Jesus', morphology: { partOfSpeech: 'noun', case: 'genitive', number: 'singular', gender: 'masculine' }, transliteration: 'Iēsou', punctBefore: '', punctAfter: ' ' },
        { id: 'Mt-1-1-4', surface: 'Χριστοῦ', normalized: 'χριστου', lemma: 'Χριστός', gloss: 'Christ, Anointed One', morphology: { partOfSpeech: 'noun', case: 'genitive', number: 'singular', gender: 'masculine' }, transliteration: 'Christou', punctBefore: '', punctAfter: ' ' },
        { id: 'Mt-1-1-5', surface: 'υἱοῦ', normalized: 'υιου', lemma: 'υἱός', gloss: 'son', morphology: { partOfSpeech: 'noun', case: 'genitive', number: 'singular', gender: 'masculine' }, transliteration: 'huiou', punctBefore: '', punctAfter: ' ' },
        { id: 'Mt-1-1-6', surface: 'Δαυὶδ', normalized: 'δαυιδ', lemma: 'Δαυίδ', gloss: 'David', morphology: { partOfSpeech: 'proper noun', case: 'genitive', number: 'singular', gender: 'masculine' }, transliteration: 'Dauid', punctBefore: '', punctAfter: ' ' },
        { id: 'Mt-1-1-7', surface: 'υἱοῦ', normalized: 'υιου', lemma: 'υἱός', gloss: 'son', morphology: { partOfSpeech: 'noun', case: 'genitive', number: 'singular', gender: 'masculine' }, transliteration: 'huiou', punctBefore: '', punctAfter: ' ' },
        { id: 'Mt-1-1-8', surface: 'Ἀβραάμ', normalized: 'αβρααμ', lemma: 'Ἀβραάμ', gloss: 'Abraham', morphology: { partOfSpeech: 'proper noun', case: 'genitive', number: 'singular', gender: 'masculine' }, transliteration: 'Abraam', punctBefore: '', punctAfter: '.' }
      ]
    },
    {
      id: 'Mt-1-2',
      translation: 'Abraham fathered Isaac, and Isaac fathered Jacob, and Jacob fathered Judah and his brothers.',
      tokens: [
        { id: 'Mt-1-2-1', surface: 'Ἀβραὰμ', normalized: 'αβρααμ', lemma: 'Ἀβραάμ', gloss: 'Abraham', morphology: { partOfSpeech: 'proper noun', case: 'nominative', number: 'singular', gender: 'masculine' }, transliteration: 'Abraam', punctBefore: '', punctAfter: ' ' },
        { id: 'Mt-1-2-2', surface: 'ἐγέννησεν', normalized: 'εγεννησεν', lemma: 'γεννάω', gloss: 'fathered, begot', morphology: { partOfSpeech: 'verb', tense: 'aorist', voice: 'active', mood: 'indicative', person: 'third', number: 'singular' }, transliteration: 'egennēsen', punctBefore: '', punctAfter: ' ' },
        { id: 'Mt-1-2-3', surface: 'τὸν', normalized: 'τον', lemma: 'ὁ', gloss: 'the', morphology: { partOfSpeech: 'article', case: 'accusative', number: 'singular', gender: 'masculine' }, transliteration: 'ton', punctBefore: '', punctAfter: ' ' },
        { id: 'Mt-1-2-4', surface: 'Ἰσαάκ', normalized: 'ισαακ', lemma: 'Ἰσαάκ', gloss: 'Isaac', morphology: { partOfSpeech: 'proper noun', case: 'accusative', number: 'singular', gender: 'masculine' }, transliteration: 'Isaak', punctBefore: '', punctAfter: ', ' },
        { id: 'Mt-1-2-5', surface: 'Ἰσαὰκ', normalized: 'ισαακ', lemma: 'Ἰσαάκ', gloss: 'Isaac', morphology: { partOfSpeech: 'proper noun', case: 'nominative', number: 'singular', gender: 'masculine' }, transliteration: 'Isaak', punctBefore: '', punctAfter: ' ' },
        { id: 'Mt-1-2-6', surface: 'δὲ', normalized: 'δε', lemma: 'δέ', gloss: 'but, and', morphology: { partOfSpeech: 'conjunction' }, transliteration: 'de', punctBefore: '', punctAfter: ' ' },
        { id: 'Mt-1-2-7', surface: 'ἐγέννησεν', normalized: 'εγεννησεν', lemma: 'γεννάω', gloss: 'fathered, begot', morphology: { partOfSpeech: 'verb', tense: 'aorist', voice: 'active', mood: 'indicative', person: 'third', number: 'singular' }, transliteration: 'egennēsen', punctBefore: '', punctAfter: ' ' },
        { id: 'Mt-1-2-8', surface: 'τὸν', normalized: 'τον', lemma: 'ὁ', gloss: 'the', morphology: { partOfSpeech: 'article', case: 'accusative', number: 'singular', gender: 'masculine' }, transliteration: 'ton', punctBefore: '', punctAfter: ' ' },
        { id: 'Mt-1-2-9', surface: 'Ἰακώβ', normalized: 'ιακωβ', lemma: 'Ἰακώβ', gloss: 'Jacob', morphology: { partOfSpeech: 'proper noun', case: 'accusative', number: 'singular', gender: 'masculine' }, transliteration: 'Iakōb', punctBefore: '', punctAfter: ', ' }
      ]
    }
  ]
};

export const GENESIS_1: TextSection = {
  id: 'Gen-1',
  textId: 'Gen',
  sequence: 1,
  label: 'Genesis 1',
  sentences: [
    {
      id: 'Gen-1-1',
      translation: 'In the beginning, God created the heavens and the earth.',
      tokens: [
        { id: 'Gen-1-1-1', surface: 'בְּ', normalized: 'ב', lemma: 'בְּ', gloss: 'in', morphology: { partOfSpeech: 'preposition' }, punctBefore: '', punctAfter: '' },
        { id: 'Gen-1-1-2', surface: 'רֵאשִׁית', normalized: 'ראשית', lemma: 'רֵאשִׁית', root: 'ראשׁ', gloss: 'beginning', morphology: { partOfSpeech: 'noun', gender: 'feminine', number: 'singular' }, punctBefore: '', punctAfter: ' ' },
        { id: 'Gen-1-1-3', surface: 'בָּרָא', normalized: 'ברא', lemma: 'בָּרָא', root: 'ברא', gloss: 'he created', morphology: { partOfSpeech: 'verb', stem: 'qal', tense: 'perfect', person: 'third', gender: 'masculine', number: 'singular' }, punctBefore: '', punctAfter: ' ' },
        { id: 'Gen-1-1-4', surface: 'אֱלֹהִים', normalized: 'אלהים', lemma: 'אֱלֹהִים', root: 'אלהּ', gloss: 'God', morphology: { partOfSpeech: 'noun', gender: 'masculine', number: 'plural' }, punctBefore: '', punctAfter: ' ' },
        { id: 'Gen-1-1-5', surface: 'אֵת', normalized: 'את', lemma: 'אֵת', gloss: '(direct object marker)', morphology: { partOfSpeech: 'particle' }, punctBefore: '', punctAfter: ' ' },
        { id: 'Gen-1-1-6', surface: 'הַ', normalized: 'ה', lemma: 'הַ', gloss: 'the', morphology: { partOfSpeech: 'article' }, punctBefore: '', punctAfter: '' },
        { id: 'Gen-1-1-7', surface: 'שָּׁמַיִם', normalized: 'שמים', lemma: 'שָׁמַיִם', root: 'שמה', gloss: 'heavens', morphology: { partOfSpeech: 'noun', gender: 'masculine', number: 'plural' }, punctBefore: '', punctAfter: ' ' },
        { id: 'Gen-1-1-8', surface: 'וְ', normalized: 'ו', lemma: 'וְ', gloss: 'and', morphology: { partOfSpeech: 'conjunction' }, punctBefore: '', punctAfter: '' },
        { id: 'Gen-1-1-9', surface: 'אֵת', normalized: 'את', lemma: 'אֵת', gloss: '(direct object marker)', morphology: { partOfSpeech: 'particle' }, punctBefore: '', punctAfter: ' ' },
        { id: 'Gen-1-1-10', surface: 'הָ', normalized: 'ה', lemma: 'הַ', gloss: 'the', morphology: { partOfSpeech: 'article' }, punctBefore: '', punctAfter: '' },
        { id: 'Gen-1-1-11', surface: 'אָרֶץ', normalized: 'ארץ', lemma: 'אֶרֶץ', root: 'ארץ', gloss: 'earth', morphology: { partOfSpeech: 'noun', gender: 'feminine', number: 'singular' }, punctBefore: '', punctAfter: '׃' }
      ]
    }
  ]
};

// Simplified DB wrapper for MVP without full Firestore
export const CorpusDB = {
  getTexts: () => [TEXT_MATTHEW, TEXT_GENESIS],
  getText: (id: string) => [TEXT_MATTHEW, TEXT_GENESIS].find(t => t.id === id),
  getSection: (sectionId: string) => {
    if (sectionId === 'Mt-1') return MATTHEW_1;
    if (sectionId === 'Gen-1') return GENESIS_1;
    return null;
  },
  getCorpusOverview: (corpusId: string) => {
     if (corpusId === 'SBLGNT') return GREEK_CORPUS;
     if (corpusId === 'OSHB') return HEBREW_CORPUS;
     return null;
  }
};
