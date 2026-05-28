export interface GrammarConcept {
  id: string;
  title: string;
  languageId: string;
  category: 'nouns' | 'verbs' | 'syntax' | 'particles' | 'morphology' | 'pronouns' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  explanation: string;
  examples: { surface: string; gloss: string; translation?: string }[];
  paradigm?: {
    caption: string;
    headers: string[];
    rows: { label: string; cells: string[] }[];
  };
  relatedMorphKeys: string[];
  lemmaKeys?: string[];
  prerequisites?: string[];
  status: 'complete' | 'partial';
}

export const GRAMMAR_CONCEPTS: GrammarConcept[] = [
  // ──────────────────────────────────────────────────────────────
  //  ANCIENT GREEK — NOUNS
  // ──────────────────────────────────────────────────────────────

  {
    id: 'greek-cases',
    title: 'Greek Cases Overview',
    languageId: 'grc',
    category: 'nouns',
    difficulty: 'beginner',
    prerequisites: [],
    explanation: `Ancient Greek has five main cases, each with a range of syntactic functions:

• Nominative — subject of a finite verb
• Genitive — possession, origin, separation, partitive
• Dative — indirect object, instrument, location, time
• Accusative — direct object, extent of space or time, motion toward
• Vocative — direct address

The case endings vary by declension, gender, and number (singular, dual, plural).`,
    examples: [
      { surface: 'λόγος', gloss: 'word (nom. sg.)', translation: 'the word (as subject)' },
      { surface: 'λόγου', gloss: 'of a word (gen. sg.)', translation: 'of the word' },
      { surface: 'λόγῳ', gloss: 'to/for a word (dat. sg.)', translation: 'to/for the word' },
      { surface: 'λόγον', gloss: 'word (acc. sg.)', translation: 'word (as object)' },
      { surface: 'λόγε', gloss: 'O word! (voc. sg.)', translation: 'O word!' },
    ],
    relatedMorphKeys: ['case', 'number', 'declension'],
    lemmaKeys: ['λόγος', 'χώρα'],
    status: 'complete',
  },

  {
    id: 'greek-first-declension',
    title: 'Greek First Declension (ᾱ/η-stems)',
    languageId: 'grc',
    category: 'nouns',
    difficulty: 'beginner',
    prerequisites: ['greek-cases'],
    explanation: `The first declension includes mostly feminine nouns (and some masculines) with stems in ᾱ or η. In Attic, the long ᾱ of the stem usually appears as η except after ε, ι, or ρ.

Gender: mostly feminine; some masculines (e.g. νεανίας — young man).
Typical feminine pattern: ἡ χώρᾱ (Doric/Ionic) → ἡ χώρα (Attic).`,
    examples: [
      { surface: 'ἡ χώρα', gloss: 'land/country (nom. sg.)', translation: 'the land' },
      { surface: 'τῆς χώρας', gloss: 'of the land (gen. sg.)' },
      { surface: 'τῇ χώρᾳ', gloss: 'to/for the land (dat. sg.)' },
      { surface: 'τὴν χώραν', gloss: 'the land (acc. sg.)' },
    ],
    paradigm: {
      caption: 'ἡ χώρα (land) — 1st declension feminine',
      headers: ['Case', 'Singular', 'Plural'],
      rows: [
        { label: 'Nom.', cells: ['χώρᾱ', 'χῶραι'] },
        { label: 'Gen.', cells: ['χώρᾱς', 'χωρῶν'] },
        { label: 'Dat.', cells: ['χώρᾳ', 'χώραις'] },
        { label: 'Acc.', cells: ['χώρᾱν', 'χώρᾱς'] },
        { label: 'Voc.', cells: ['χώρᾱ', 'χῶραι'] },
      ],
    },
    relatedMorphKeys: ['declension', 'case', 'number', 'gender'],
    lemmaKeys: ['χώρα', 'ἀρχή'],
    status: 'complete',
  },

  {
    id: 'greek-second-declension',
    title: 'Greek Second Declension (o-stems)',
    languageId: 'grc',
    category: 'nouns',
    difficulty: 'beginner',
    prerequisites: ['greek-cases'],
    explanation: `The second declension covers masculine and neuter nouns with o-stems. Masculine nouns end in -ος (nom. sg.); neuter nouns end in -ον. The neuter nominative, accusative, and vocative are always identical.`,
    examples: [
      { surface: 'ὁ λόγος', gloss: 'word (masc. nom. sg.)', translation: 'the word' },
      { surface: 'τὸ ἔργον', gloss: 'work (neut. nom. sg.)', translation: 'the work' },
      { surface: 'τοῦ λόγου', gloss: 'of the word (gen. sg.)' },
    ],
    paradigm: {
      caption: 'ὁ λόγος (word) — 2nd declension masculine',
      headers: ['Case', 'Singular', 'Plural'],
      rows: [
        { label: 'Nom.', cells: ['λόγος', 'λόγοι'] },
        { label: 'Gen.', cells: ['λόγου', 'λόγων'] },
        { label: 'Dat.', cells: ['λόγῳ', 'λόγοις'] },
        { label: 'Acc.', cells: ['λόγον', 'λόγους'] },
        { label: 'Voc.', cells: ['λόγε', 'λόγοι'] },
      ],
    },
    relatedMorphKeys: ['declension', 'case', 'number', 'gender'],
    lemmaKeys: ['λόγος', 'ἔργον'],
    status: 'complete',
  },

  {
    id: 'greek-third-declension',
    prerequisites: ['greek-first-declension', 'greek-second-declension'],
    title: 'Greek Third Declension (consonant stems)',
    languageId: 'grc',
    category: 'nouns',
    difficulty: 'intermediate',
    explanation: `The third declension is the largest and most varied. Stems end in consonants (stops, liquids, nasals, sibilants) or semivowels. The genitive singular is the key form for identifying the stem.

Key patterns:
• Dental stems: ἐλπίς, ἐλπίδ-ος (hope)
• Liquid stems: πατήρ, πατρ-ός (father)
• Nasal stems: ποιμήν, ποιμέν-ος (shepherd)
• s-stems (neuter): γένος, γένε-ος (race/kind)

The dative plural always ends in -σι(ν), which often causes consonant changes.`,
    examples: [
      { surface: 'ἡ ἐλπίς', gloss: 'hope (nom. sg.)', translation: 'hope' },
      { surface: 'τῆς ἐλπίδος', gloss: 'of hope (gen. sg.)' },
      { surface: 'ταῖς ἐλπίσι(ν)', gloss: 'for hopes (dat. pl.)' },
      { surface: 'ὁ πατήρ', gloss: 'father (nom. sg.)' },
      { surface: 'τοῦ πατρός', gloss: 'of the father (gen. sg.)' },
    ],
    relatedMorphKeys: ['declension', 'case', 'number', 'stem'],
    lemmaKeys: ['ἐλπίς', 'πατήρ', 'πνεῦμα'],
    status: 'complete',
  },

  {
    id: 'greek-article',
    title: 'Greek Definite Article',
    languageId: 'grc',
    category: 'nouns',
    difficulty: 'beginner',
    prerequisites: ['greek-cases'],
    explanation: `Ancient Greek has a definite article (ὁ, ἡ, τό) that declines for case, number, and gender. Greek has no indefinite article — "a/an" is expressed by the absence of the article or by the indefinite pronoun τις.

The article is also used to substantivize adjectives, participles, and infinitives:
• οἱ ἀγαθοί — "the good (men)"
• τὸ καλόν — "the beautiful (thing)"`,
    examples: [
      { surface: 'ὁ λόγος', gloss: 'the word (masc. nom. sg.)' },
      { surface: 'ἡ χώρα', gloss: 'the land (fem. nom. sg.)' },
      { surface: 'τὸ ἔργον', gloss: 'the work (neut. nom. sg.)' },
      { surface: 'τοῦ λόγου', gloss: 'of the word (masc. gen. sg.)' },
      { surface: 'οἱ λόγοι', gloss: 'the words (masc. nom. pl.)' },
    ],
    paradigm: {
      caption: 'Definite article — all genders',
      headers: ['Case', 'Masc.', 'Fem.', 'Neut.', 'Masc. pl.', 'Fem. pl.', 'Neut. pl.'],
      rows: [
        { label: 'Nom.', cells: ['ὁ', 'ἡ', 'τό', 'οἱ', 'αἱ', 'τά'] },
        { label: 'Gen.', cells: ['τοῦ', 'τῆς', 'τοῦ', 'τῶν', 'τῶν', 'τῶν'] },
        { label: 'Dat.', cells: ['τῷ', 'τῇ', 'τῷ', 'τοῖς', 'ταῖς', 'τοῖς'] },
        { label: 'Acc.', cells: ['τόν', 'τήν', 'τό', 'τούς', 'τάς', 'τά'] },
      ],
    },
    relatedMorphKeys: ['article', 'case', 'number', 'gender'],
    lemmaKeys: ['λόγος', 'θεός', 'ἄνθρωπος'],
    status: 'complete',
  },

  // ──────────────────────────────────────────────────────────────
  //  ANCIENT GREEK — VERBS
  // ──────────────────────────────────────────────────────────────

  {
    id: 'greek-tense-aspect',
    title: 'Greek Tense and Aspect',
    languageId: 'grc',
    category: 'verbs',
    difficulty: 'intermediate',
    prerequisites: ['greek-present-active'],
    explanation: `Greek verbal morphology encodes both tense (time of action) and aspect (kind of action):

• Present — ongoing action (imperfective aspect, present time)
• Imperfect — ongoing action in the past (imperfective aspect, past time)
• Future — future action (no strong aspect)
• Aorist — simple/punctual action (perfective aspect)
• Perfect — completed action with present relevance (stative aspect)
• Pluperfect — completed action in the past with past relevance

The augment (ε- prefix, or vowel lengthening) marks past time in the indicative mood.`,
    examples: [
      { surface: 'λύω', gloss: 'I loosen (pres.)', translation: 'I am loosening' },
      { surface: 'ἔλυον', gloss: 'I was loosening (impf.)', translation: 'I was loosening' },
      { surface: 'λύσω', gloss: 'I will loosen (fut.)' },
      { surface: 'ἔλυσα', gloss: 'I loosened (aor.)' },
      { surface: 'λέλυκα', gloss: 'I have loosened (pf.)' },
    ],
    relatedMorphKeys: ['tense', 'aspect', 'mood', 'augment'],
    lemmaKeys: ['λύω', 'λέγω', 'πιστεύω'],
    status: 'complete',
  },

  {
    id: 'greek-present-active',
    prerequisites: [],
    title: 'Greek Present Active Indicative',
    languageId: 'grc',
    category: 'verbs',
    difficulty: 'beginner',
    explanation: `The present active indicative is formed from the present stem + thematic vowel (o/e) + primary personal endings. It expresses ongoing or repeated action in present time.

The principal parts of a Greek verb: (1) present active indicative 1sg, (2) future active 1sg, (3) aorist active 1sg, (4) perfect active 1sg, (5) perfect middle/passive 1sg, (6) aorist passive 1sg.`,
    examples: [
      { surface: 'λύω', gloss: 'I loosen' },
      { surface: 'λύεις', gloss: 'you (sg.) loosen' },
      { surface: 'λύει', gloss: 'he/she/it loosens' },
      { surface: 'λύομεν', gloss: 'we loosen' },
      { surface: 'λύετε', gloss: 'you (pl.) loosen' },
      { surface: 'λύουσι(ν)', gloss: 'they loosen' },
    ],
    paradigm: {
      caption: 'λύω (loosen) — Present Active Indicative',
      headers: ['Person', 'Singular', 'Plural'],
      rows: [
        { label: '1st', cells: ['λύω', 'λύομεν'] },
        { label: '2nd', cells: ['λύεις', 'λύετε'] },
        { label: '3rd', cells: ['λύει', 'λύουσι(ν)'] },
      ],
    },
    relatedMorphKeys: ['tense', 'voice', 'mood', 'person', 'number'],
    lemmaKeys: ['λύω', 'πιστεύω', 'λέγω'],
    status: 'complete',
  },

  {
    id: 'greek-aorist-active',
    prerequisites: ['greek-present-active', 'greek-tense-aspect'],
    title: 'Greek Aorist Active Indicative',
    languageId: 'grc',
    category: 'verbs',
    difficulty: 'intermediate',
    explanation: `The aorist (from ἀόριστος — "undefined") expresses a simple, punctual action without reference to duration. In the indicative it denotes a past action.

The first (weak) aorist adds -σα- to the stem + secondary endings.
The second (strong) aorist changes the stem vowel (ablaut) + secondary endings — same endings as the imperfect.

The augment (ε-) marks past time in the indicative.`,
    examples: [
      { surface: 'ἔλυσα', gloss: 'I loosened (1st aor.)' },
      { surface: 'ἔβαλον', gloss: 'I threw (2nd aor. of βάλλω)' },
      { surface: 'ἔλαβον', gloss: 'I took (2nd aor. of λαμβάνω)' },
      { surface: 'εἶπον', gloss: 'I said (2nd aor. of λέγω)' },
    ],
    paradigm: {
      caption: 'ἔλυσα (I loosened) — 1st Aorist Active Indicative',
      headers: ['Person', 'Singular', 'Plural'],
      rows: [
        { label: '1st', cells: ['ἔλυσα', 'ἐλύσαμεν'] },
        { label: '2nd', cells: ['ἔλυσας', 'ἐλύσατε'] },
        { label: '3rd', cells: ['ἔλυσε(ν)', 'ἔλυσαν'] },
      ],
    },
    relatedMorphKeys: ['tense', 'aspect', 'voice', 'mood', 'augment'],
    lemmaKeys: ['λύω', 'λαμβάνω', 'λέγω', 'βάλλω'],
    status: 'complete',
  },

  {
    id: 'greek-perfect-active',
    prerequisites: ['greek-aorist-active'],
    title: 'Greek Perfect Active Indicative',
    languageId: 'grc',
    category: 'verbs',
    difficulty: 'intermediate',
    explanation: `The perfect tense expresses a completed action whose results are still felt in the present. Greek perfect is stative in aspect — it describes a present state resulting from a past action.

Formation: reduplication (first consonant + ε) + perfect stem + κ + perfect endings.
The perfect is often better translated with an English present than a present perfect: λέλυκα = "I have loosened / I stand having loosened."`,
    examples: [
      { surface: 'λέλυκα', gloss: 'I have loosened / I stand having loosened' },
      { surface: 'γέγραφα', gloss: 'I have written (γράφω)' },
      { surface: 'πεπίστευκα', gloss: 'I have believed / I believe (πιστεύω)' },
    ],
    paradigm: {
      caption: 'λέλυκα — Perfect Active Indicative',
      headers: ['Person', 'Singular', 'Plural'],
      rows: [
        { label: '1st', cells: ['λέλυκα', 'λελύκαμεν'] },
        { label: '2nd', cells: ['λέλυκας', 'λελύκατε'] },
        { label: '3rd', cells: ['λέλυκε(ν)', 'λελύκασι(ν)'] },
      ],
    },
    relatedMorphKeys: ['tense', 'aspect', 'reduplication', 'voice', 'mood'],
    lemmaKeys: ['γράφω', 'πιστεύω', 'λύω'],
    status: 'complete',
  },

  {
    id: 'greek-participles',
    prerequisites: ['greek-present-active', 'greek-cases'],
    title: 'Greek Participles',
    languageId: 'grc',
    category: 'verbs',
    difficulty: 'intermediate',
    explanation: `Greek participles are verbal adjectives — they decline like adjectives (for case, number, gender) and encode tense and voice like verbs.

Main types:
• Present active: λύων, λύουσα, λῦον (loosening)
• Aorist active: λύσας, λύσασα, λῦσαν (having loosened)
• Perfect active: λελυκώς, λελυκυῖα, λελυκός (having loosened [statively])
• Present middle/passive: λυόμενος (being loosened / loosening for oneself)

Uses:
• Attributive: ὁ λύων ἄνθρωπος — "the loosening man"
• Circumstantial: λύσας, ἔβη — "having loosened, he went"
• Genitive absolute: τοῦ ἡγεμόνος λύοντος — "while the general was loosening"`,
    examples: [
      { surface: 'λύων', gloss: 'loosening (pres. act. masc. nom. sg.)' },
      { surface: 'λύουσα', gloss: 'loosening (pres. act. fem. nom. sg.)' },
      { surface: 'λῦσαν', gloss: 'having loosened (aor. act. neut. nom. sg.)' },
      { surface: 'λελυκώς', gloss: 'having loosened (pf. act. masc. nom. sg.)' },
    ],
    relatedMorphKeys: ['participle', 'tense', 'voice', 'case', 'number', 'gender'],
    lemmaKeys: ['λύω', 'πιστεύω', 'γράφω', 'εἰμί'],
    status: 'complete',
  },

  {
    id: 'greek-infinitive',
    prerequisites: ['greek-present-active'],
    title: 'Greek Infinitives',
    languageId: 'grc',
    category: 'verbs',
    difficulty: 'intermediate',
    explanation: `The infinitive is a verbal noun in Greek. It does not inflect for person or number, but it encodes tense and voice. When used with a definite article, it becomes a noun (articular infinitive):

• Present active infinitive: λύειν (to loosen / the loosening)
• Aorist active infinitive: λῦσαι (to loosen [punctually] / the act of loosening)
• Perfect active infinitive: λελυκέναι (to have loosened)
• Present middle/passive infinitive: λύεσθαι

Key uses:
• Complementary infinitive: βούλομαι λύειν — "I want to loosen"
• Indirect discourse (after verbs of saying/thinking): λέγει λύειν αὐτόν — "he says that he is loosening"
• Articular infinitive: τὸ λύειν — "the act of loosening"`,
    examples: [
      { surface: 'βούλομαι λύειν', gloss: 'I want to loosen' },
      { surface: 'ἐκέλευσε λύσαι', gloss: 'he ordered (them) to loosen' },
      { surface: 'τὸ λύειν', gloss: 'the act of loosening (articular inf.)' },
    ],
    relatedMorphKeys: ['infinitive', 'tense', 'voice', 'complementary', 'indirect discourse'],
    lemmaKeys: ['βούλομαι', 'κελεύω', 'λέγω'],
    status: 'complete',
  },

  {
    id: 'greek-moods',
    prerequisites: ['greek-present-active', 'greek-tense-aspect'],
    title: 'Greek Verbal Moods',
    languageId: 'grc',
    category: 'verbs',
    difficulty: 'intermediate',
    explanation: `Greek has four finite moods (plus participle and infinitive):

• Indicative — states a fact or asks a direct question
• Subjunctive — expresses possibility, purpose, indefinite conditions, or exhortation
• Optative — expresses wish, possibility (more remote than subjunctive), indirect discourse, or potential conditions
• Imperative — commands and prohibitions

The distinction between subjunctive and optative often reflects primary vs. secondary sequence:
• After primary tenses → subjunctive
• After secondary tenses → optative`,
    examples: [
      { surface: 'λύει', gloss: 'he loosens (indicative — fact)' },
      { surface: 'λύῃ', gloss: 'he may loosen / so that he loosens (subjunctive)' },
      { surface: 'λύοι', gloss: 'he might loosen / would that he loosen (optative)' },
      { surface: 'λύε', gloss: 'loosen! (imperative)' },
    ],
    relatedMorphKeys: ['mood', 'subjunctive', 'optative', 'imperative', 'indicative'],
    lemmaKeys: ['λύω', 'πιστεύω'],
    status: 'complete',
  },

  {
    id: 'greek-mi-verbs',
    prerequisites: ['greek-present-active', 'greek-aorist-active'],
    title: 'Greek μι-Verbs',
    languageId: 'grc',
    category: 'verbs',
    difficulty: 'advanced',
    explanation: `μι-verbs are a small but extremely common class of Greek verbs that use athematic (direct stem + ending, no thematic vowel o/e) conjugation. The most important are:

• εἰμί — to be
• φημί — to say
• δίδωμι — to give
• τίθημι — to put/place
• ἵημι — to send/let go
• ἵστημι — to stand/set up

They often show ablaut (vowel alternation) in the stem: long vowel in singular, short in plural of present/imperfect. Their aorists are frequently second aorist (ἔδωκα, ἔθηκα, ἔστην).`,
    examples: [
      { surface: 'εἰμί', gloss: 'I am' },
      { surface: 'ἐστί(ν)', gloss: 'he/she/it is' },
      { surface: 'δίδωμι', gloss: 'I give' },
      { surface: 'τίθεμεν', gloss: 'we place' },
      { surface: 'ἵστημι', gloss: 'I make stand / I set up' },
    ],
    paradigm: {
      caption: 'εἰμί (to be) — Present Indicative',
      headers: ['Person', 'Singular', 'Plural'],
      rows: [
        { label: '1st', cells: ['εἰμί', 'ἐσμέν'] },
        { label: '2nd', cells: ['εἶ', 'ἐστέ'] },
        { label: '3rd', cells: ['ἐστί(ν)', 'εἰσί(ν)'] },
      ],
    },
    relatedMorphKeys: ['athematic', 'conjugation', 'person', 'number'],
    lemmaKeys: ['εἰμί', 'δίδωμι', 'τίθημι'],
    status: 'complete',
  },

  // ──────────────────────────────────────────────────────────────
  //  ANCIENT GREEK — SYNTAX
  // ──────────────────────────────────────────────────────────────

  {
    id: 'greek-conditions',
    prerequisites: ['greek-moods'],
    title: 'Greek Conditional Sentences',
    languageId: 'grc',
    category: 'syntax',
    difficulty: 'advanced',
    explanation: `Greek conditionals classify by the degree of probability and time reference:

1. Simple (particular fact): εἰ + indicative → indicative
   "If he is (in fact) loosening, he is…"

2. Contrary-to-fact: εἰ + secondary indicative → ἄν + secondary indicative
   "If he were loosening (but he isn't), he would be…"

3. Future More Vivid: ἐάν (= εἰ + ἄν) + subjunctive → future indicative
   "If he should loosen, he will…"

4. Future Less Vivid: εἰ + optative → ἄν + optative
   "If he were to loosen, he would…"

5. General (timeless truth): εἰ + optative (past) / ἐάν + subjunctive (present) → indicative
   "If ever he loosens, he does…"`,
    examples: [
      { surface: 'εἰ λύει, χαίρει', gloss: 'If he is loosening, he rejoices (simple)' },
      { surface: 'εἰ ἔλυεν, ἂν ἔχαιρεν', gloss: 'If he were loosening, he would rejoice (CTF)' },
      { surface: 'ἐὰν λύῃ, χαιρήσει', gloss: 'If he should loosen, he will rejoice (FMV)' },
    ],
    relatedMorphKeys: ['conditional', 'mood', 'ἄν', 'εἰ', 'ἐάν'],
    lemmaKeys: ['εἰ', 'λύω', 'χαίρω'],
    status: 'complete',
  },

  {
    id: 'greek-indirect-discourse',
    prerequisites: ['greek-moods', 'greek-infinitive', 'greek-participles'],
    title: 'Greek Indirect Discourse',
    languageId: 'grc',
    category: 'syntax',
    difficulty: 'advanced',
    explanation: `Greek reports speech and thought in three main constructions, depending on the governing verb:

1. ὅτι/ὡς + finite verb (after verbs of saying)
   λέγει ὅτι λύει — "he says that he is loosening"
   (tense preserved; in secondary sequence optative may replace indicative)

2. Accusative + infinitive (after verbs of thinking, believing, knowing)
   νομίζει λύειν αὐτόν — "he thinks that he is loosening (him)"

3. Participle in the appropriate case (after verbs of knowing, perceiving, showing)
   ὁράᾳ αὐτὸν λύοντα — "he sees him loosening"`,
    examples: [
      { surface: 'λέγουσιν ὅτι ἔλυσαν', gloss: 'they say that they loosened' },
      { surface: 'νομίζω αὐτὸν σοφὸν εἶναι', gloss: 'I think him to be wise' },
      { surface: 'ὁράᾳ αὐτὸν γράφοντα', gloss: 'he sees him writing' },
    ],
    relatedMorphKeys: ['indirect discourse', 'infinitive', 'participle', 'ὅτι'],
    lemmaKeys: ['λέγω', 'νομίζω', 'ὁράω'],
    status: 'complete',
  },

  // ──────────────────────────────────────────────────────────────
  //  ANCIENT GREEK — PARTICLES
  // ──────────────────────────────────────────────────────────────

  {
    id: 'greek-particles',
    prerequisites: ['greek-cases'],
    title: 'Greek Particles',
    languageId: 'grc',
    category: 'particles',
    difficulty: 'intermediate',
    explanation: `Particles are small, indeclinable words that signal discourse structure, attitude, and logical relations. They are one of the most distinctive features of Greek style.

Key particles:
• μέν … δέ — "on the one hand … on the other hand" (contrast/balance; μέν alone often has no direct translation)
• γάρ — "for, because" (explains what preceded; always post-positive)
• οὖν — "therefore, so, then" (logical consequence; post-positive)
• δή — adds emphasis or irony ("indeed, so, therefore")
• ἄρα — expresses inference or surprise ("so, then, as it turns out")
• ἀλλά — "but, rather" (strong adversative)
• καί — "and, also, even" (additive or emphatic)
• τε … καί — "both … and" (close connection)
• εἴτε … εἴτε — "whether … or" (alternative)`,
    examples: [
      {
        surface: 'μὲν … δέ',
        gloss: 'on one hand … on the other',
        translation: 'He, on the one hand, went; she, on the other, stayed.',
      },
      { surface: 'εὐθὺς γάρ', gloss: 'for immediately (γάρ post-positive)' },
      { surface: 'οὔπω οὖν εἰσῆλθεν', gloss: 'he had not yet entered, therefore' },
    ],
    relatedMorphKeys: ['particle', 'discourse', 'post-positive', 'μέν', 'δέ', 'γάρ'],
    lemmaKeys: ['δέ', 'γάρ', 'καί', 'οὖν'],
    status: 'complete',
  },

  {
    id: 'greek-an',
    prerequisites: ['greek-moods'],
    title: 'The Greek Particle ἄν',
    languageId: 'grc',
    category: 'particles',
    difficulty: 'advanced',
    explanation: `The particle ἄν is one of the most important (and hardest to translate) in Greek. It does not have a single English equivalent but marks:

1. Potential in main clauses (with optative): ἂν λύοι — "he would/could loosen"
2. Contrary-to-fact in main clauses (with secondary indicative): ἂν ἔλυεν — "he would be loosening (if...)"
3. Indefiniteness in subordinate clauses (with subjunctive, forming ἐάν, ὅταν, etc.): ὅταν λύῃ — "whenever he loosens"
4. Generalizing relative clauses: ὃς ἂν λύῃ — "whoever loosens"

ἄν is always post-positive (never first word in a clause) and closely associated with its verb.`,
    examples: [
      { surface: 'λύοι ἄν', gloss: 'he might/could loosen (potential optative)' },
      { surface: 'ἔλυεν ἄν', gloss: 'he would be loosening (contrary-to-fact)' },
      { surface: 'ὅταν λύῃ', gloss: 'whenever he loosens (general)' },
    ],
    relatedMorphKeys: ['ἄν', 'potential', 'conditional', 'optative', 'subjunctive'],
    lemmaKeys: ['ἄν'],
    status: 'complete',
  },

  // ──────────────────────────────────────────────────────────────
  //  ANCIENT GREEK — PRONOUNS
  // ──────────────────────────────────────────────────────────────

  {
    id: 'greek-personal-pronouns',
    prerequisites: ['greek-cases'],
    title: 'Greek Personal Pronouns',
    languageId: 'grc',
    category: 'pronouns',
    difficulty: 'beginner',
    explanation: `Greek personal pronouns distinguish person (1st, 2nd, 3rd), number (singular, plural), and case. Because the verb ending already marks person and number, pronouns are used mainly for emphasis or clarity.

The third-person pronoun αὐτός also serves as an intensifier ("himself/herself") and as a pronoun of identity ("the same") when used attributively.`,
    examples: [
      { surface: 'ἐγώ', gloss: 'I (1st sg. nom., emphatic)' },
      { surface: 'σύ', gloss: 'you (2nd sg. nom.)' },
      { surface: 'αὐτός', gloss: 'he/it / himself / the same (3rd sg. masc.)' },
      { surface: 'ἡμεῖς', gloss: 'we (1st pl. nom.)' },
    ],
    paradigm: {
      caption: 'Personal pronouns — 1st and 2nd person',
      headers: ['Case', '1st sg.', '2nd sg.', '1st pl.', '2nd pl.'],
      rows: [
        { label: 'Nom.', cells: ['ἐγώ', 'σύ', 'ἡμεῖς', 'ὑμεῖς'] },
        { label: 'Gen.', cells: ['ἐμοῦ / μου', 'σοῦ / σου', 'ἡμῶν', 'ὑμῶν'] },
        { label: 'Dat.', cells: ['ἐμοί / μοι', 'σοί / σοι', 'ἡμῖν', 'ὑμῖν'] },
        { label: 'Acc.', cells: ['ἐμέ / με', 'σέ / σε', 'ἡμᾶς', 'ὑμᾶς'] },
      ],
    },
    relatedMorphKeys: ['pronoun', 'person', 'number', 'case'],
    lemmaKeys: ['αὐτός', 'ἐγώ', 'σύ'],
    status: 'complete',
  },

  // ──────────────────────────────────────────────────────────────
  //  LATIN — NOUNS
  // ──────────────────────────────────────────────────────────────

  {
    id: 'latin-declensions',
    prerequisites: [],
    title: 'Latin Noun Declensions',
    languageId: 'lat',
    category: 'nouns',
    difficulty: 'beginner',
    explanation: `Latin nouns are grouped into five declensions, each with a set of case endings:

• 1st Declension (mainly feminine, -a stems): rosa, rosae
• 2nd Declension (masculine/neuter, -o stems): dominus, domini; bellum, belli
• 3rd Declension (all genders, consonant or i-stems): rex, regis; civis, civis
• 4th Declension (masculine/neuter, -u stems): gradus, gradūs; cornu, cornūs
• 5th Declension (mainly feminine, -e stems): res, rei; dies, diēī

Latin has six cases: Nominative, Genitive, Dative, Accusative, Ablative, Vocative (and Locative for a few nouns).`,
    examples: [
      { surface: 'rosa, rosae', gloss: 'rose (1st decl.)', translation: 'rose' },
      { surface: 'dominus, domini', gloss: 'master (2nd decl.)', translation: 'lord/master' },
      { surface: 'rex, regis', gloss: 'king (3rd decl.)', translation: 'king' },
      { surface: 'gradus, gradūs', gloss: 'step (4th decl.)', translation: 'step/grade' },
      { surface: 'res, rei', gloss: 'thing (5th decl.)', translation: 'thing/matter' },
    ],
    relatedMorphKeys: ['case', 'number', 'declension'],
    lemmaKeys: ['rosa', 'rex', 'dominus', 'res'],
    status: 'complete',
  },

  {
    id: 'latin-first-declension',
    prerequisites: ['latin-declensions'],
    title: 'Latin First Declension (a-stems)',
    languageId: 'lat',
    category: 'nouns',
    difficulty: 'beginner',
    explanation: `The first declension is almost entirely feminine. Nouns end in -a in the nominative singular. A few masculines denote male occupations (agricola — farmer, nauta — sailor, poeta — poet).

The genitive plural ends in -ārum; the dative and ablative plural share -īs.`,
    examples: [
      { surface: 'puella', gloss: 'girl (nom. sg.)' },
      { surface: 'puellae', gloss: 'of the girl (gen. sg.) / to the girl (dat. sg.)' },
      { surface: 'puellam', gloss: 'the girl (acc. sg.)' },
      { surface: 'puellā', gloss: 'by/with the girl (abl. sg.)' },
    ],
    paradigm: {
      caption: 'puella (girl) — 1st declension feminine',
      headers: ['Case', 'Singular', 'Plural'],
      rows: [
        { label: 'Nom.', cells: ['puella', 'puellae'] },
        { label: 'Gen.', cells: ['puellae', 'puellārum'] },
        { label: 'Dat.', cells: ['puellae', 'puellīs'] },
        { label: 'Acc.', cells: ['puellam', 'puellās'] },
        { label: 'Abl.', cells: ['puellā', 'puellīs'] },
        { label: 'Voc.', cells: ['puella', 'puellae'] },
      ],
    },
    relatedMorphKeys: ['declension', 'case', 'number', 'gender'],
    lemmaKeys: ['puella', 'aqua', 'terra'],
    status: 'complete',
  },

  {
    id: 'latin-ablative-uses',
    prerequisites: ['latin-declensions'],
    title: 'Latin Ablative Case — Major Uses',
    languageId: 'lat',
    category: 'syntax',
    difficulty: 'intermediate',
    explanation: `The Latin ablative case is a fusion of three ancient Indo-European cases (ablative, instrumental, locative), giving it a wide range of meanings:

Separation (true ablative):
• Ablative of separation: careō pecuniā — "I lack money"
• Ablative of origin: nātus clārō genere — "born of a distinguished family"

Instrument/Manner (instrumental):
• Ablative of means: gladiō vulnerātus — "wounded by a sword"
• Ablative of manner: magnā cum cūrā — "with great care"
• Ablative of accompaniment: cum amīcīs — "with friends"

Location/Time (locative):
• Ablative of place where (with preposition): in forō — "in the forum"
• Ablative of time when: prīmā lūce — "at first light"
• Ablative of time within which: tribus diēbus — "within three days"

The ablative absolute: a participial phrase with a separate subject in the ablative, providing temporal, causal, or concessive context.`,
    examples: [
      { surface: 'gladiō pugnābant', gloss: 'they fought with a sword (means)' },
      { surface: 'summā dīligentiā', gloss: 'with greatest diligence (manner)' },
      { surface: 'nōbīs dormientibus', gloss: 'while we were sleeping (ablative absolute)' },
    ],
    relatedMorphKeys: ['ablative', 'case', 'preposition', 'absolute'],
    lemmaKeys: ['gladius', 'cura', 'dux'],
    status: 'complete',
  },

  {
    id: 'latin-verb-conjugations',
    prerequisites: [],
    title: 'Latin Verb Conjugations',
    languageId: 'lat',
    category: 'verbs',
    difficulty: 'beginner',
    explanation: `Latin verbs belong to four main conjugations, identified by the vowel before -re in the present active infinitive:

• 1st Conjugation (-āre): amāre — to love
• 2nd Conjugation (-ēre): monēre — to warn
• 3rd Conjugation (-ere, short): dūcere — to lead
• 3rd -io Conjugation (-ĕre like 3rd, but -io present): capere — to take
• 4th Conjugation (-īre): audīre — to hear

Principal parts: (1) 1sg pres. act. ind., (2) pres. act. inf., (3) 1sg perf. act. ind., (4) perfect passive participle (supine stem).`,
    examples: [
      { surface: 'amō, amāre, amāvī, amātum', gloss: 'to love (1st conj.)' },
      { surface: 'moneō, monēre, monuī, monitum', gloss: 'to warn (2nd conj.)' },
      { surface: 'dūcō, dūcere, dūxī, ductum', gloss: 'to lead (3rd conj.)' },
      { surface: 'audiō, audīre, audīvī, audītum', gloss: 'to hear (4th conj.)' },
    ],
    paradigm: {
      caption: 'Present Active Indicative — amō (1st conjugation)',
      headers: ['Person', 'Singular', 'Plural'],
      rows: [
        { label: '1st', cells: ['amō', 'amāmus'] },
        { label: '2nd', cells: ['amās', 'amātis'] },
        { label: '3rd', cells: ['amat', 'amant'] },
      ],
    },
    relatedMorphKeys: ['conjugation', 'tense', 'voice', 'mood', 'person', 'number'],
    lemmaKeys: ['amo', 'dico', 'audio', 'sum'],
    status: 'complete',
  },

  {
    id: 'latin-indirect-discourse',
    prerequisites: ['latin-verb-conjugations', 'latin-subjunctive'],
    title: 'Latin Indirect Discourse (Accusative + Infinitive)',
    languageId: 'lat',
    category: 'syntax',
    difficulty: 'intermediate',
    explanation: `After verbs of saying, thinking, knowing, and perceiving, Latin uses the accusative + infinitive construction (oratio obliqua). The subject of the infinitive goes into the accusative; the tense of the infinitive is relative to the main verb:

• Present infinitive — action simultaneous with main verb
• Perfect infinitive — action prior to main verb
• Future infinitive — action subsequent to main verb

Tense of infinitive does not reflect absolute time, only relative time.`,
    examples: [
      { surface: 'dīcit eum esse bonum', gloss: 'he says that he is good (simultaneous)' },
      { surface: 'crēdidit eōs vīcisse', gloss: 'he believed that they had won (prior)' },
      { surface: 'spērat sē victūrum esse', gloss: 'he hopes that he will win (future)' },
    ],
    relatedMorphKeys: ['indirect discourse', 'accusative', 'infinitive', 'oratio obliqua'],
    lemmaKeys: ['dico', 'credo', 'spero'],
    status: 'complete',
  },

  {
    id: 'latin-subjunctive',
    prerequisites: ['latin-verb-conjugations'],
    title: 'Latin Subjunctive — Key Uses',
    languageId: 'lat',
    category: 'verbs',
    difficulty: 'intermediate',
    explanation: `The Latin subjunctive is used far more widely than the English subjunctive. Key uses:

Independent:
• Volitive/hortatory: eāmus — "let us go"
• Optative: utinam venīret — "would that he were coming!"
• Deliberative: quid faciam? — "what am I to do?"
• Potential: quis hoc dīxerit? — "who could have said this?"

Dependent (sequence of tenses applies):
• Purpose (ut/nē): venī ut vidērem — "I came to see"
• Result (ut + ... ): tam longus ut nōn legī possit — "so long that it cannot be read"
• Indirect question: rogāvit quid facerem — "he asked what I was doing"
• Cum temporal/causal/concessive: cum haec dīxisset — "when/since he had said these things"
• Conditional (contrary-to-fact): sī essem rēx — "if I were king"`,
    examples: [
      { surface: 'veniat', gloss: 'let him come (hortatory)' },
      { surface: 'veniret ut vidēret', gloss: 'he came so that he might see (purpose)' },
      { surface: 'nesciō quid dīcat', gloss: 'I do not know what he says (indirect question)' },
    ],
    relatedMorphKeys: ['subjunctive', 'mood', 'sequence of tenses', 'purpose', 'result'],
    lemmaKeys: ['venio', 'video', 'dico'],
    status: 'complete',
  },

  // ──────────────────────────────────────────────────────────────
  //  BIBLICAL HEBREW — MORPHOLOGY
  // ──────────────────────────────────────────────────────────────

  {
    id: 'hebrew-stems',
    prerequisites: [],
    title: 'Hebrew Verbal Stems (Binyanim)',
    languageId: 'hbo',
    category: 'verbs',
    difficulty: 'intermediate',
    explanation: `Biblical Hebrew verbs are built on seven main stems (binyanim), each adding meaning to the triconsonantal root:

• Qal (קַל) — simple active: כָּתַב — "he wrote"
• Niphal (נִפְעַל) — simple passive / reflexive: נִכְתַּב — "it was written"
• Piel (פִּעֵל) — intensive active: כִּתֵּב — "he inscribed/engraved"
• Pual (פֻּעַל) — intensive passive: כֻּתַּב — "it was engraved"
• Hiphil (הִפְעִיל) — causative active: הִכְתִּיב — "he caused to write / dictated"
• Hophal (הָפְעַל) — causative passive: הָכְתַּב — "it was caused to be written"
• Hithpael (הִתְפַּעֵל) — reflexive / reciprocal: הִתְכַּתֵּב — "he corresponded"

The root consonants carry the core meaning; the stem pattern adds voice and nuance.`,
    examples: [
      { surface: 'כָּתַב', gloss: 'he wrote (Qal)', translation: 'he wrote' },
      { surface: 'נִכְתַּב', gloss: 'it was written (Niphal)', translation: 'it was written' },
      { surface: 'הִכְתִּיב', gloss: 'he dictated (Hiphil)', translation: 'he caused to write' },
      { surface: 'הִתְפַּלֵּל', gloss: 'he prayed (Hithpael of פלל)' },
    ],
    relatedMorphKeys: ['stem', 'root', 'binyan', 'voice'],
    lemmaKeys: ['כָּתַב', 'אָמַר', 'הָלַךְ'],
    status: 'complete',
  },

  {
    id: 'hebrew-qal-perfect',
    prerequisites: ['hebrew-stems'],
    title: 'Hebrew Qal Perfect',
    languageId: 'hbo',
    category: 'verbs',
    difficulty: 'beginner',
    explanation: `The Hebrew perfect (qātal form) expresses a completed action or a state. In narrative prose it is often translated as a simple past. In poetry and prophecy it can express completed certainty (prophetic perfect).

The Qal perfect uses suffixed personal endings. The 3rd masculine singular is the dictionary/lexical form.`,
    examples: [
      { surface: 'כָּתַב', gloss: 'he wrote (3ms)' },
      { surface: 'כָּתְבָה', gloss: 'she wrote (3fs)' },
      { surface: 'כָּתַבְתָּ', gloss: 'you (ms) wrote (2ms)' },
      { surface: 'כָּתַבְתִּי', gloss: 'I wrote (1cs)' },
    ],
    paradigm: {
      caption: 'כָּתַב (write) — Qal Perfect',
      headers: ['Person/Gender/Number', 'Form'],
      rows: [
        { label: '3ms', cells: ['כָּתַב'] },
        { label: '3fs', cells: ['כָּתְבָה'] },
        { label: '2ms', cells: ['כָּתַבְתָּ'] },
        { label: '2fs', cells: ['כָּתַבְתְּ'] },
        { label: '1cs', cells: ['כָּתַבְתִּי'] },
        { label: '3cp', cells: ['כָּתְבוּ'] },
        { label: '2mp', cells: ['כְּתַבְתֶּם'] },
        { label: '2fp', cells: ['כְּתַבְתֶּן'] },
        { label: '1cp', cells: ['כָּתַבְנוּ'] },
      ],
    },
    relatedMorphKeys: ['perfect', 'qal', 'conjugation', 'stem'],
    lemmaKeys: ['כָּתַב', 'אָמַר', 'עָשָׂה'],
    status: 'complete',
  },

  {
    id: 'hebrew-waw-consecutive',
    prerequisites: ['hebrew-qal-perfect'],
    title: 'Hebrew Waw-Consecutive',
    languageId: 'hbo',
    category: 'syntax',
    difficulty: 'intermediate',
    explanation: `The waw-consecutive (וַ / וְ) is one of the most distinctive features of Biblical Hebrew prose. It reverses the aspect of the verb it is prefixed to:

• וַ + imperfect (wayyiqtol) = narrative past
  Used for sequential past events in narrative: וַיֹּאמֶר — "and he said"

• וְ + perfect (weqatal) = future/modal
  Used in instructions, laws, and future sequences: וְשָׁמַרְתָּ — "and you shall keep"

This is why the tense system is better described as an aspect system — the verbal form's meaning shifts depending on whether waw-consecutive is attached.`,
    examples: [
      { surface: 'וַיֹּאמֶר', gloss: 'and he said (wayyiqtol — narrative past)' },
      { surface: 'וַיֵּלֶךְ', gloss: 'and he went (wayyiqtol)' },
      { surface: 'וְשָׁמַרְתָּ', gloss: 'and you shall keep (weqatal — future)' },
    ],
    relatedMorphKeys: ['waw', 'consecutive', 'narrative', 'aspect', 'tense'],
    lemmaKeys: ['אָמַר', 'הָלַךְ', 'שָׁמַר'],
    status: 'complete',
  },

  {
    id: 'hebrew-definite-article',
    prerequisites: [],
    title: 'Hebrew Definite Article and Dagesh',
    languageId: 'hbo',
    category: 'morphology',
    difficulty: 'beginner',
    explanation: `Hebrew has a definite article (הַ / הֶ / הָ) that is prefixed directly to the noun, not written separately. There is no indefinite article.

The article causes the first consonant of the word to be doubled (marked by a dagesh forte ּ), compensating for the assimilation of the ה:
• הַסּוּס — has·sūs — "the horse" (dagesh in ס)
• הָאִישׁ — hā·ʾîš — "the man" (no dagesh — gutturals do not take dagesh)

Gutturals (א ה ח ע) and ר cannot take dagesh forte; instead, the preceding vowel is often lengthened.`,
    examples: [
      { surface: 'הַסֵּפֶר', gloss: 'the book (haś-sēfer)' },
      { surface: 'הָאָרֶץ', gloss: 'the land (hā-ʾāreṣ — with compensatory lengthening)' },
      { surface: 'הַמֶּלֶךְ', gloss: 'the king (ham-melek — dagesh in מ)' },
    ],
    relatedMorphKeys: ['article', 'dagesh', 'guttural', 'prefix'],
    lemmaKeys: ['סֵפֶר', 'אָרֶץ', 'מֶלֶךְ'],
    status: 'complete',
  },

  // ──────────────────────────────────────────────────────────────
  //  SYRIAC
  // ──────────────────────────────────────────────────────────────

  {
    id: 'syriac-verb-forms',
    prerequisites: [],
    title: 'Syriac Basic Verb Stems',
    languageId: 'syr',
    category: 'verbs',
    difficulty: 'intermediate',
    explanation: `Classical Syriac verbs follow root-and-pattern morphology similar to other Semitic languages. The three main stem forms (Peal, Pael, Aphel) correspond roughly to the Hebrew Qal, Piel, and Hiphil:

• Peal (ܦܥܠ) — simple active: "he wrote"
• Pael (ܦܥܠ) — intensive: "he engraved / he was very diligent in writing"
• Aphel (ܐܦܥܠ) — causative: "he caused to write"
• Ethpeel (ܐܬܦܥܠ) — passive of Peal
• Ethpaal (ܐܬܦܥܠ) — passive of Pael
• Ettaphal (ܐܬܦܥܠ) — passive of Aphel

Verbs conjugate for person, number, gender, and tense (perfect, imperfect, imperative, infinitive, participle).`,
    examples: [
      { surface: 'ܟܬܒ', gloss: 'he wrote (Peal perfect 3ms)', translation: 'he wrote' },
      { surface: 'ܐܟܬܒ', gloss: 'he caused to write (Aphel)', translation: 'he caused to write' },
      { surface: 'ܐܬܟܬܒ', gloss: 'it was written (Ethpeel)', translation: 'it was written' },
    ],
    relatedMorphKeys: ['stem', 'root', 'conjugation', 'voice'],
    status: 'partial',
  },
];

// ─── Named pathways (structured curricula per language) ───────────────────────

export interface NamedPathwayStep {
  step: number;
  conceptId: string;
  recommendedTextIds: string[];
}

export interface NamedPathway {
  id: string;
  title: string;
  description: string;
  languageId: string;
  icon: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  steps: NamedPathwayStep[];
}

export const NAMED_PATHWAYS: NamedPathway[] = [
  {
    id: 'koine-greek-beginner',
    title: 'Koine Greek: From Zero',
    description: 'Master the essentials of Koine Greek through the Gospel of John — cases, declensions, the article, and core verb forms.',
    languageId: 'grc-koine',
    icon: '🏛️',
    level: 'beginner',
    estimatedHours: 12,
    steps: [
      { step: 1, conceptId: 'greek-cases', recommendedTextIds: ['Jn-1'] },
      { step: 2, conceptId: 'greek-article', recommendedTextIds: ['Jn-1'] },
      { step: 3, conceptId: 'greek-first-declension', recommendedTextIds: ['Jn-1'] },
      { step: 4, conceptId: 'greek-second-declension', recommendedTextIds: ['Jn-1'] },
      { step: 5, conceptId: 'greek-present-active', recommendedTextIds: ['Jn-1', 'Jn-full'] },
    ],
  },
  {
    id: 'koine-greek-intermediate',
    title: 'Koine Greek: Verb Mastery',
    description: 'Deepen your Greek with tense, aspect, the aorist, perfect, and the four moods — essential for reading the New Testament fluently.',
    languageId: 'grc-koine',
    icon: '⚗️',
    level: 'intermediate',
    estimatedHours: 16,
    steps: [
      { step: 1, conceptId: 'greek-tense-aspect', recommendedTextIds: ['Jn-1', 'Jn-full'] },
      { step: 2, conceptId: 'greek-aorist-active', recommendedTextIds: ['Jn-full'] },
      { step: 3, conceptId: 'greek-perfect-active', recommendedTextIds: ['Jn-full'] },
      { step: 4, conceptId: 'greek-participles', recommendedTextIds: ['Jn-full'] },
      { step: 5, conceptId: 'greek-moods', recommendedTextIds: ['Jn-full'] },
    ],
  },
  {
    id: 'classical-greek-epic',
    title: 'Classical Greek: Epic & History',
    description: 'Read Homer and Xenophon. Focuses on cases, tense/aspect, and participles as used in Attic and Homeric dialect.',
    languageId: 'grc',
    icon: '⚔️',
    level: 'intermediate',
    estimatedHours: 20,
    steps: [
      { step: 1, conceptId: 'greek-cases', recommendedTextIds: ['Iliad-1', 'Odyssey-1'] },
      { step: 2, conceptId: 'greek-first-declension', recommendedTextIds: ['Iliad-1'] },
      { step: 3, conceptId: 'greek-second-declension', recommendedTextIds: ['Odyssey-1'] },
      { step: 4, conceptId: 'greek-aorist-active', recommendedTextIds: ['Iliad-1', 'Anab-1'] },
      { step: 5, conceptId: 'greek-participles', recommendedTextIds: ['Anab-1'] },
      { step: 6, conceptId: 'greek-conditions', recommendedTextIds: ['Anab-1'] },
    ],
  },
  {
    id: 'latin-beginner',
    title: 'Latin Foundations',
    description: 'Start reading Vergil and Cicero. Covers the five declensions and core verb conjugations.',
    languageId: 'lat',
    icon: '🦅',
    level: 'beginner',
    estimatedHours: 10,
    steps: [
      { step: 1, conceptId: 'latin-declensions', recommendedTextIds: ['Aeneid-1'] },
      { step: 2, conceptId: 'latin-verb-conjugations', recommendedTextIds: ['Aeneid-1', 'Cic-Catilina-1'] },
    ],
  },
  {
    id: 'biblical-hebrew-beginner',
    title: 'Biblical Hebrew: First Steps',
    description: 'Begin reading Genesis and Psalms with a focus on the Qal stem and foundational verb patterns.',
    languageId: 'hbo',
    icon: '📜',
    level: 'beginner',
    estimatedHours: 14,
    steps: [
      { step: 1, conceptId: 'hebrew-qal-perfect', recommendedTextIds: ['Gen', 'Ps-23'] },
      { step: 2, conceptId: 'hebrew-stems', recommendedTextIds: ['Gen'] },
    ],
  },
];

export const PATHWAY: { step: number; conceptId: string; title: string; level: string }[] = [
  { step: 1, conceptId: 'greek-cases', title: 'Greek Cases', level: 'beginner' },
  { step: 2, conceptId: 'greek-article', title: 'Greek Article', level: 'beginner' },
  {
    step: 3,
    conceptId: 'greek-first-declension',
    title: 'Greek 1st Declension',
    level: 'beginner',
  },
  {
    step: 4,
    conceptId: 'greek-second-declension',
    title: 'Greek 2nd Declension',
    level: 'beginner',
  },
  { step: 5, conceptId: 'greek-present-active', title: 'Greek Present Active', level: 'beginner' },
  {
    step: 6,
    conceptId: 'greek-tense-aspect',
    title: 'Greek Tense & Aspect',
    level: 'intermediate',
  },
  { step: 7, conceptId: 'greek-aorist-active', title: 'Greek Aorist', level: 'intermediate' },
  { step: 8, conceptId: 'greek-perfect-active', title: 'Greek Perfect', level: 'intermediate' },
  { step: 9, conceptId: 'greek-participles', title: 'Greek Participles', level: 'intermediate' },
  { step: 10, conceptId: 'greek-moods', title: 'Greek Moods', level: 'intermediate' },
  { step: 11, conceptId: 'greek-conditions', title: 'Greek Conditionals', level: 'advanced' },
  { step: 12, conceptId: 'latin-declensions', title: 'Latin Declensions', level: 'beginner' },
  {
    step: 13,
    conceptId: 'latin-verb-conjugations',
    title: 'Latin Conjugations',
    level: 'beginner',
  },
  { step: 14, conceptId: 'hebrew-stems', title: 'Hebrew Stems', level: 'intermediate' },
  { step: 15, conceptId: 'hebrew-qal-perfect', title: 'Hebrew Qal Perfect', level: 'beginner' },
];
