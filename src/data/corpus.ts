import { Text, TextSection, Corpus, SourceAttribution } from '../types/corpus';

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
    allowsCommercialUse: false,
    allowsModification: false,
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
  'perseus-texts': {
    id: 'perseus-texts',
    sourceName: 'Perseus Digital Library',
    sourceUrl: 'http://www.perseus.tufts.edu/',
    dataType: 'text',
    licenseName: 'CC BY-SA 3.0',
    attributionText: 'Text provided by Perseus Digital Library.',
    requiresAttribution: true,
    allowsCommercialUse: true,
    allowsModification: true,
    shareAlike: true
  }
};

export const GREEK_CORPUS: Corpus = { id: 'SBLGNT', title: 'SBL Greek New Testament', description: 'The SBL Greek New Testament', language: 'grc-koine', sourceAttributionId: 'sblgnt-text', licenseSummary: 'Non-Commercial', importStatus: 'partial', attribution: [ATTRIBUTIONS['sblgnt-text'], ATTRIBUTIONS['morphgnt-parsing']] };
export const HEBREW_CORPUS: Corpus = { id: 'OSHB', title: 'Open Scriptures Hebrew Bible', description: 'Hebrew Bible', language: 'hbo', sourceAttributionId: 'oshb-text-morph', licenseSummary: 'CC BY 4.0', importStatus: 'partial', attribution: [ATTRIBUTIONS['oshb-text-morph'], ATTRIBUTIONS['wlc-text']] };
export const LATIN_CORPUS: Corpus = { id: 'LATIN_CLASSIC', title: 'Classical Latin Corpus', description: 'Ancient Latin texts', language: 'lat', sourceAttributionId: 'perseus-texts', licenseSummary: 'CC BY-SA 3.0', importStatus: 'partial', attribution: [ATTRIBUTIONS['perseus-texts']] };

export const TEXT_JOHN_1: Text = {
  id: 'Jn-1', corpusId: 'SBLGNT', title: 'ΚΑΤΑ ΙΩΑΝΝΗΝ', canonicalRef: 'John 1', author: 'John', language: 'grc-koine', direction: 'ltr', hasMorphology: true, hasTranslation: true, hasTransliteration: true,
  sectionsPreview: [{ id: 'Jn-1-1', label: 'John 1' }]
};

export const TEXT_GENESIS: Text = {
  id: 'Gen', corpusId: 'OSHB', title: 'בְּרֵאשִׁית', canonicalRef: 'Genesis', author: 'Moses', language: 'hbo', direction: 'rtl', hasMorphology: true, hasTranslation: true, hasTransliteration: false,
  sectionsPreview: [{ id: 'Gen-1', label: 'Chapter 1' }]
};

export const TEXT_AENEID_1: Text = {
  id: 'Aeneid-1', corpusId: 'LATIN_CLASSIC', title: 'AENEIS', canonicalRef: 'Aeneid 1', author: 'Virgil', language: 'lat', direction: 'ltr', hasMorphology: true, hasTranslation: true, hasTransliteration: false,
  sectionsPreview: [{ id: 'Aen-1-1', label: 'Book 1.1-11' }]
};

export const TEXT_PSALM_23: Text = {
  id: 'Ps-23', corpusId: 'OSHB', title: 'תְּהִלִּים כג', canonicalRef: 'Psalm 23', author: 'David', language: 'hbo', direction: 'rtl', hasMorphology: true, hasTranslation: true, hasTransliteration: false,
  sectionsPreview: [{ id: 'Ps-23-1', label: 'Psalm 23' }]
};

export const JOHN_1_1: TextSection = {
  id: 'Jn-1-1', textId: 'Jn-1', sequence: 1, label: 'John 1',
  sentences: [{
    id: 'Jn-1-1-1', translation: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
    tokens: [
      { id: 'jn1', surface: 'Ἐν', normalized: 'εν', lemma: 'ἐν', gloss: 'in, with, by', morphology: { partOfSpeech: 'preposition' }, transliteration: 'En', punctBefore: '', punctAfter: ' ' },
      { id: 'jn2', surface: 'ἀρχῇ', normalized: 'αρχη', lemma: 'ἀρχή', gloss: 'beginning, origin, first cause', morphology: { partOfSpeech: 'noun', case: 'dative', number: 'singular', gender: 'feminine' }, transliteration: 'archē', punctBefore: '', punctAfter: ' ' },
      { id: 'jn3', surface: 'ἦν', normalized: 'ην', lemma: 'εἰμί', gloss: 'was', morphology: { partOfSpeech: 'verb', tense: 'imperfect', voice: 'active', mood: 'indicative', person: 'third', number: 'singular' }, transliteration: 'ēn', punctBefore: '', punctAfter: ' ' },
      { id: 'jn4', surface: 'ὁ', normalized: 'ο', lemma: 'ὁ', gloss: 'the', morphology: { partOfSpeech: 'article', case: 'nominative', number: 'singular', gender: 'masculine' }, transliteration: 'ho', punctBefore: '', punctAfter: ' ' },
      { id: 'jn5', surface: 'λόγος', normalized: 'λογος', lemma: 'λόγος', gloss: 'word, reason, speech', morphology: { partOfSpeech: 'noun', case: 'nominative', number: 'singular', gender: 'masculine' }, transliteration: 'logos', punctBefore: '', punctAfter: ', ' },
      { id: 'jn6', surface: 'καὶ', normalized: 'και', lemma: 'καί', gloss: 'and, also', morphology: { partOfSpeech: 'conjunction' }, transliteration: 'kai', punctBefore: '', punctAfter: ' ' },
      { id: 'jn7', surface: 'ὁ', normalized: 'ο', lemma: 'ὁ', gloss: 'the', morphology: { partOfSpeech: 'article', case: 'nominative', number: 'singular', gender: 'masculine' }, transliteration: 'ho', punctBefore: '', punctAfter: ' ' },
      { id: 'jn8', surface: 'λόγος', normalized: 'λογος', lemma: 'λόγος', gloss: 'word, reason, speech', morphology: { partOfSpeech: 'noun', case: 'nominative', number: 'singular', gender: 'masculine' }, transliteration: 'logos', punctBefore: '', punctAfter: ' ' },
      { id: 'jn9', surface: 'ἦν', normalized: 'ην', lemma: 'εἰμί', gloss: 'was', morphology: { partOfSpeech: 'verb', tense: 'imperfect', voice: 'active', mood: 'indicative', person: 'third', number: 'singular' }, transliteration: 'ēn', punctBefore: '', punctAfter: ' ' },
      { id: 'jn10', surface: 'πρὸς', normalized: 'προς', lemma: 'πρός', gloss: 'with, toward', morphology: { partOfSpeech: 'preposition' }, transliteration: 'pros', punctBefore: '', punctAfter: ' ' },
      { id: 'jn11', surface: 'τὸν', normalized: 'τον', lemma: 'ὁ', gloss: 'the', morphology: { partOfSpeech: 'article', case: 'accusative', number: 'singular', gender: 'masculine' }, transliteration: 'ton', punctBefore: '', punctAfter: ' ' },
      { id: 'jn12', surface: 'θεόν', normalized: 'θεον', lemma: 'θεός', gloss: 'God, deity', morphology: { partOfSpeech: 'noun', case: 'accusative', number: 'singular', gender: 'masculine' }, transliteration: 'theon', punctBefore: '', punctAfter: ', ' },
      { id: 'jn13', surface: 'καὶ', normalized: 'και', lemma: 'καί', gloss: 'and, also', morphology: { partOfSpeech: 'conjunction' }, transliteration: 'kai', punctBefore: '', punctAfter: ' ' },
      { id: 'jn14', surface: 'θεὸς', normalized: 'θεος', lemma: 'θεός', gloss: 'God, deity', morphology: { partOfSpeech: 'noun', case: 'nominative', number: 'singular', gender: 'masculine' }, transliteration: 'theos', punctBefore: '', punctAfter: ' ' },
      { id: 'jn15', surface: 'ἦν', normalized: 'ην', lemma: 'εἰμί', gloss: 'was', morphology: { partOfSpeech: 'verb', tense: 'imperfect', voice: 'active', mood: 'indicative', person: 'third', number: 'singular' }, transliteration: 'ēn', punctBefore: '', punctAfter: ' ' },
      { id: 'jn16', surface: 'ὁ', normalized: 'ο', lemma: 'ὁ', gloss: 'the', morphology: { partOfSpeech: 'article', case: 'nominative', number: 'singular', gender: 'masculine' }, transliteration: 'ho', punctBefore: '', punctAfter: ' ' },
      { id: 'jn17', surface: 'λόγος', normalized: 'λογος', lemma: 'λόγος', gloss: 'word, reason, speech', morphology: { partOfSpeech: 'noun', case: 'nominative', number: 'singular', gender: 'masculine' }, transliteration: 'logos', punctBefore: '', punctAfter: '.' }
    ]
  }]
};

export const AENEID_1_1: TextSection = {
  id: 'Aen-1-1', textId: 'Aeneid-1', sequence: 1, label: 'Book 1',
  sentences: [{
    id: 'aen1', translation: 'I sing of arms and the man, who first from the coasts of Troy...',
    tokens: [
      { id: 'a1', surface: 'Arma', normalized: 'arma', lemma: 'arma', gloss: 'arms, weapons', morphology: { partOfSpeech: 'noun', case: 'accusative', number: 'plural', gender: 'neuter' }, punctBefore: '', punctAfter: ' ' },
      { id: 'a2', surface: 'virumque', normalized: 'virumque', lemma: 'vir', gloss: 'man, hero', morphology: { partOfSpeech: 'noun', case: 'accusative', number: 'singular', gender: 'masculine' }, punctBefore: '', punctAfter: ' ' },
      { id: 'a3', surface: 'cano', normalized: 'cano', lemma: 'cano', gloss: 'I sing', morphology: { partOfSpeech: 'verb', person: 'first', number: 'singular', tense: 'present', voice: 'active', mood: 'indicative' }, punctBefore: '', punctAfter: ', ' },
      { id: 'a4', surface: 'Troiae', normalized: 'troiae', lemma: 'Troia', gloss: 'Troy', morphology: { partOfSpeech: 'proper noun', case: 'genitive', number: 'singular', gender: 'feminine' }, punctBefore: '', punctAfter: ' ' },
      { id: 'a5', surface: 'qui', normalized: 'qui', lemma: 'qui', gloss: 'who', morphology: { partOfSpeech: 'relative pronoun', case: 'nominative', number: 'singular', gender: 'masculine' }, punctBefore: '', punctAfter: ' ' },
      { id: 'a6', surface: 'primus', normalized: 'primus', lemma: 'primus', gloss: 'first', morphology: { partOfSpeech: 'adjective', case: 'nominative', number: 'singular', gender: 'masculine' }, punctBefore: '', punctAfter: ' ' },
      { id: 'a7', surface: 'ab', normalized: 'ab', lemma: 'ab', gloss: 'from', morphology: { partOfSpeech: 'preposition' }, punctBefore: '', punctAfter: ' ' },
      { id: 'a8', surface: 'oris', normalized: 'oris', lemma: 'ora', gloss: 'coast, shore', morphology: { partOfSpeech: 'noun', case: 'ablative', number: 'plural', gender: 'feminine' }, punctBefore: '', punctAfter: ' ' }
    ]
  }]
};

export const PSALM_23_1: TextSection = {
  id: 'Ps-23-1', textId: 'Ps-23', sequence: 1, label: 'Psalm 23',
  sentences: [{
    id: 'p23-1', translation: 'The Lord is my shepherd; I shall not want.',
    tokens: [
      { id: 'p1', surface: 'יְהוָה', normalized: 'יהוה', lemma: 'יְהוָה', gloss: 'the Lord', morphology: { partOfSpeech: 'proper noun' }, punctBefore: '', punctAfter: ' ' },
      { id: 'p2', surface: 'רֹעִ֫י', normalized: 'רעי', lemma: 'רָעָה', gloss: 'my shepherd', morphology: { partOfSpeech: 'verb', tense: 'participle' }, punctBefore: '', punctAfter: ' ' },
      { id: 'p3', surface: 'לֹא', normalized: 'לא', lemma: 'לֹא', gloss: 'not', morphology: { partOfSpeech: 'particle' }, punctBefore: '', punctAfter: ' ' },
      { id: 'p4', surface: 'אֶחְסָֽר', normalized: 'אחסר', lemma: 'חָסֵר', gloss: 'I will want', morphology: { partOfSpeech: 'verb', tense: 'imperfect' }, punctBefore: '', punctAfter: '׃' }
    ]
  }]
};

export const GENESIS_1: TextSection = {
  id: 'Gen-1', textId: 'Gen', sequence: 1, label: 'Genesis 1',
  sentences: [{
    id: 'g-1', translation: 'In the beginning God created the heavens and the earth.',
    tokens: [
      { id: 'g1', surface: 'בְּ', normalized: 'ב', lemma: 'בְּ', gloss: 'in', morphology: { partOfSpeech: 'preposition' }, punctBefore: '', punctAfter: '' },
      { id: 'g2', surface: 'רֵאשִׁית', normalized: 'ראשית', lemma: 'רֵאשִׁית', gloss: 'beginning', morphology: { partOfSpeech: 'noun' }, punctBefore: '', punctAfter: ' ' },
      { id: 'g3', surface: 'בָּרָא', normalized: 'ברא', lemma: 'בָּרָא', gloss: 'created', morphology: { partOfSpeech: 'verb' }, punctBefore: '', punctAfter: ' ' },
      { id: 'g4', surface: 'אֱלֹהִים', normalized: 'אלהים', lemma: 'אֱלֹהִים', gloss: 'God', morphology: { partOfSpeech: 'noun' }, punctBefore: '', punctAfter: ' ' }
    ]
  }]
};

export const CorpusDB = {
  getTexts: () => [TEXT_JOHN_1, TEXT_GENESIS, TEXT_AENEID_1, TEXT_PSALM_23],
  getText: (id: string) => [TEXT_JOHN_1, TEXT_GENESIS, TEXT_AENEID_1, TEXT_PSALM_23].find(t => t.id === id),
  getSection: (sectionId: string) => {
    if (sectionId === 'Jn-1-1') return JOHN_1_1;
    if (sectionId === 'Gen-1') return GENESIS_1;
    if (sectionId === 'Aen-1-1') return AENEID_1_1;
    if (sectionId === 'Ps-23-1') return PSALM_23_1;
    return null;
  },
  getCorpusOverview: (corpusId: string) => {
    if (corpusId === 'SBLGNT') return GREEK_CORPUS;
    if (corpusId === 'OSHB') return HEBREW_CORPUS;
    if (corpusId === 'LATIN_CLASSIC') return LATIN_CORPUS;
    return null;
  },
  findSentencesWithLemma: (lemma: string, currentSentenceId?: string, max: number = 3) => {
    const results: any[] = [];
    for (const section of [JOHN_1_1, GENESIS_1, AENEID_1_1, PSALM_23_1]) {
       for (const sentence of section.sentences) {
          if (sentence.id === currentSentenceId) continue;
          if (sentence.tokens.some((t: any) => t.lemma === lemma)) {
             results.push({ sentence, sectionId: section.id, textId: section.textId });
             if (results.length >= max) return results;
          }
       }
    }
    return results;
  }
};
