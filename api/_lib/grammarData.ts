export interface GrammarConcept {
  id: string;
  title: string;
  languageId: string;
  explanation: string;
  examples: { surface: string; gloss: string; translation?: string }[];
  relatedMorphKeys: string[];
  status: 'complete' | 'partial';
}

export const GRAMMAR_CONCEPTS: GrammarConcept[] = [
  {
    id: 'greek-cases',
    title: 'Greek Cases Overview',
    languageId: 'grc',
    explanation: `Ancient Greek has five main cases, each with a range of syntactic functions:

• Nominative — subject of the verb
• Genitive — possession, origin, separation
• Dative — indirect object, instrument, location
• Accusative — direct object, extent of space/time
• Vocative — direct address

The case endings vary by declension and number (singular, dual, plural).`,
    examples: [
      { surface: 'λόγος', gloss: 'word (nom. sg.)', translation: 'the word' },
      { surface: 'λόγου', gloss: 'of a word (gen. sg.)', translation: 'of the word' },
      { surface: 'λόγῳ', gloss: 'to/for a word (dat. sg.)', translation: 'to/for the word' },
      { surface: 'λόγον', gloss: 'word (acc. sg.)', translation: 'word (as object)' },
    ],
    relatedMorphKeys: ['case', 'number', 'declension'],
    status: 'complete',
  },
  {
    id: 'greek-tense-aspect',
    title: 'Greek Tense and Aspect',
    languageId: 'grc',
    explanation: `Greek verbal morphology encodes both tense (time of action) and aspect (kind of action):

• Present — ongoing action (imperfective aspect, present time)
• Imperfect — ongoing action in the past (imperfective aspect, past time)
• Future — future action (no aspect distinction)
• Aorist — simple/unbounded action (perfective aspect)
• Perfect — completed action with present consequences (stative aspect)
• Pluperfect — completed action in the past

The augment (ἔ- prefix) marks past time in the indicative mood.`,
    examples: [
      { surface: 'λύω', gloss: 'I loosen (pres.)', translation: 'I am loosening' },
      { surface: 'ἔλυον', gloss: 'I was loosening (impf.)', translation: 'I was loosening' },
      { surface: 'ἔλυσα', gloss: 'I loosened (aor.)', translation: 'I loosened' },
      { surface: 'λέλυκα', gloss: 'I have loosened (pf.)', translation: 'I have loosened' },
    ],
    relatedMorphKeys: ['tense', 'aspect', 'mood', 'augment'],
    status: 'complete',
  },
  {
    id: 'hebrew-stems',
    title: 'Hebrew Verbal Stems (Binyanim)',
    languageId: 'hbo',
    explanation: `Biblical Hebrew verbs are built on seven main stems (binyanim), each addingmeaning to the root:

• Qal (קל) — simple active: "he wrote"
• Niphal (נפעל) — simple passive / reflexive: "it was written"
• Piel (פיעל) — intensive active: "he engraved" (intensive of "write")
• Pual (פועל) — intensive passive: "it was engraved"
• Hiphil (הפעיל) — causative active: "he caused to write / dictated"
• Hophal (הפעל) — causative passive: "it was caused to be written"
• Hithpael (התפעל) — reflexive / iterative: "he wrote to himself / corresponded"

The root consonants (usually three) carry the core meaning; the stem patterns add voice and aspect.`,
    examples: [
      { surface: 'כָּתַב', gloss: 'he wrote (Qal)', translation: 'he wrote' },
      { surface: 'נִכְתַּב', gloss: 'it was written (Niphal)', translation: 'it was written' },
      { surface: 'הִכְתִּיב', gloss: 'he dictated (Hiphil)', translation: 'he caused to write' },
    ],
    relatedMorphKeys: ['stem', 'root', 'binyan'],
    status: 'complete',
  },
  {
    id: 'latin-declensions',
    title: 'Latin Noun Declensions',
    languageId: 'lat',
    explanation: `Latin nouns are grouped into five declensions, each with a set of case endings:

• 1st Declension (mainly feminine, -a stems): rosa, rosae
• 2nd Declension (masculine/neuter, -o stems): dominus, domini
• 3rd Declension (all genders, consonant stems): rex, regis
• 4th Declension (masculine/neuter, -u stems): gradus, gradūs
• 5th Declension (mainly feminine, -e stems): res, rei

The six cases (Nominative, Genitive, Dative, Accusative, Ablative, Vocative) mark grammatical roles, with some prepositions taking specific cases for adverbial meanings.`,
    examples: [
      { surface: 'rosa, rosae', gloss: 'rose (1st decl.)', translation: 'rose' },
      { surface: 'dominus, domini', gloss: 'master (2nd decl.)', translation: 'lord/master' },
      { surface: 'rex, regis', gloss: 'king (3rd decl.)', translation: 'king' },
    ],
    relatedMorphKeys: ['case', 'number', 'declension'],
    status: 'complete',
  },
  {
    id: 'syriac-verb-forms',
    title: 'Syriac Basic Verb Forms',
    languageId: 'syr',
    explanation: `Classical Syriac verbs follow root-and-pattern morphology similar to other Semitic languages. The three main stem forms (Peal, Pael, Aphel) correspond roughly to the Hebrew Qal, Piel, and Hiphil:

• Peal (ܦܥܠ) — simple active: "he wrote"
• Pael (ܦܥܠ) — intensive: "he engraved"
• Aphel (ܐܦܥܠ) — causative: "he caused to write"
• Ethpeel (ܐܬܦܥܠ) — passive of Peal
• Ethpaal (ܐܬܦܥܠ) — passive of Pael
• Ettaphal (ܐܬܦܥܠ) — passive of Aphel

Verbs conjugate for person, number, gender, and tense (perfect, imperfect, imperative).`,
    examples: [
      { surface: 'ܟܬܒ', gloss: 'he wrote (Peal)', translation: 'he wrote' },
      { surface: 'ܐܟܬܒ', gloss: 'he caused to write (Aphel)', translation: 'he caused to write' },
      { surface: 'ܐܬܟܬܒ', gloss: 'it was written (Ethpeel)', translation: 'it was written' },
    ],
    relatedMorphKeys: ['stem', 'root', 'conjugation'],
    status: 'partial',
  },
];

export const PATHWAY: { step: number; conceptId: string; title: string; level: string }[] = [
  { step: 1, conceptId: 'greek-cases', title: 'Greek Cases', level: 'beginner' },
  { step: 2, conceptId: 'greek-tense-aspect', title: 'Greek Tense & Aspect', level: 'intermediate' },
  { step: 3, conceptId: 'hebrew-stems', title: 'Hebrew Stems', level: 'intermediate' },
  { step: 4, conceptId: 'latin-declensions', title: 'Latin Declensions', level: 'beginner' },
  { step: 5, conceptId: 'syriac-verb-forms', title: 'Syriac Verb Forms', level: 'intermediate' },
];
