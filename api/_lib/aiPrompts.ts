/**
 * Language-specific instructions for the AI analysis prompt.
 * Each entry gives the AI context about the language's script, morphology,
 * and common pitfalls to improve analysis quality.
 */
export const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  grc: `Language: Ancient Greek (Attic/Ionic/Koine).
Script: Greek alphabet. Lemmatize to standard dictionary form (e.g. λύω for verbs).
Note: Distinguish between final sigma (ς) and medial sigma (σ). Identify common
contractions (crasis, elision). Provide accurate gloss for classical meanings.
For morphology: provide case/number/gender for nouns and adjectives; for verbs
provide tense, voice, mood, person, number, and aspect (perfective/imperfective/stative)
when identifiable.`,

  'grc-koine': `Language: Koine Greek (Biblical/Hellenistic).
Script: Greek alphabet. Similar to Ancient Greek but note semantic shifts in
Biblical context (e.g. ἀγάπη = love). Handle itacism in transliteration
(e.g. η = i, ει = i). Lemmatize to standard NT Greek forms.
For morphology: provide case/number/gender for nouns and adjectives; for verbs
provide tense, voice, mood, person, number, and aspect (perfective/imperfective/stative)
when identifiable.`,

  hbo: `Language: Biblical Hebrew (Tiberian pointing).
Script: Hebrew alphabet (right-to-left). Include niqqud (vowel points) as written.
Provide semantic gloss based on Tanakh usage. Note: verbal stems (Qal, Niphal,
Piel, Pual, Hiphil, Hophal, Hithpael) should be reflected in the lemma where
possible. Transliterate using SBL Academic style (e.g. א = ', ב = b/v).
For morphology: provide stem/binyan, aspect, person, number, gender, and state
when identifiable. Include the Hebrew root (usually 3 consonants) when known.`,

  lat: `Language: Latin (Classical/Ecclesiastical).
Script: Latin alphabet. Lemmatize to standard dictionary form (e.g. amo for verbs,
first principal part). Note macrons for long vowels where evident. Distinguish
between classical and ecclesiastical pronunciation in transliteration.
For morphology: provide case/number/gender for nouns and adjectives; for verbs
provide tense, voice, mood, person, number, and conjugation when identifiable.
Include declension number for nouns (1st, 2nd, 3rd, 4th, 5th) when known.`,

  syr: `Language: Syriac (Classical Syriac / Edessan).
Script: Syriac alphabet (Estrangela/Serto, right-to-left). Handle Syriac-specific
vowel marks (Zqapa, Pthaha, Rbasa, etc.). Lemmatize to standard root + pattern.
Transliteration using standard Syriac academic scheme.`,

  cop: `Language: Coptic (Sahidic/Bohairic).
Script: Coptic alphabet (Greek-derived + Demotic letters). Lemmatize to standard
Coptic dictionary form. Note the six major dialects if detectable. Transliteration
follows standard Coptological conventions (e.g. ⲁ = a, ⲃ = b).`,

  arc: `Language: Aramaic (Biblical Aramaic / Imperial Aramaic).
Script: Hebrew/Aramaic square script (right-to-left). Similar to Hebrew but with
Aramaic-specific vocabulary and grammar. Lemmatize to standard Aramaic lexicon
forms. Key difference: definite state uses emphatic suffix -א.`,

  akk: `Language: Akkadian (Babylonian/Assyrian).
Script: Cuneiform (Latin transcription expected as input, not actual signs).
Lemmatize to standard Akkadian root forms (e.g. parāsu). Distinguish between
Babylonian and Assyrian dialects. Use standard Assyriological transliteration
(sumerograms in CAPITALS, phonetic in lowercase).`,

  san: `Language: Sanskrit (Classical/Vedic).
Script: Devanagari (or Latin transliteration). Lemmatize to standard dhātu (root)
forms. Note sandhi (euphonic combinations) — provide both sandhi and sandhi-free
forms. Transliteration using IAST standard.`,

  egy: `Language: Egyptian (Middle Egyptian / Late Egyptian).
Script: Hieroglyphic (Manuel de Codage transliteration expected as input).
Lemmatize to standard dictionary forms (e.g. Gardiner sign list numbers for
reference). Note determinatives. Transliteration using standard Egyptological
scheme (ȝ, i, y, ˁ, w, b, etc.).`,

  hit: `Language: Hittite (Akkadian/Anatolian hieroglyphs? Neo-Hittite?).
Script: Cuneiform (Latin transcription expected). Lemmatize to standard Hittite
dictionary forms. Note the three genders and the -r/n declension. Transliteration
conventions: š = sh, ḫ = kh.`,
};

export function getLanguageName(languageId: string): string {
  const names: Record<string, string> = {
    grc: 'Ancient Greek',
    'grc-koine': 'Koine Greek',
    hbo: 'Biblical Hebrew',
    lat: 'Latin',
    syr: 'Syriac',
    cop: 'Coptic',
    arc: 'Aramaic',
    akk: 'Akkadian',
    san: 'Sanskrit',
    egy: 'Egyptian',
    hit: 'Hittite',
  };
  return names[languageId] || languageId;
}

export interface TutorContext {
  textTitle?: string;
  sentenceText?: string;
  selectedToken?: string;
  lemma?: string;
  morphology?: Record<string, string>;
  gloss?: string;
}

export type TutorMode =
  | 'beginner'
  | 'grammar'
  | 'seminary'
  | 'scholar'
  | 'devotional'
  | 'historical';

export const TUTOR_MODES: Record<TutorMode, { label: string; description: string }> = {
  beginner: {
    label: 'Beginner',
    description: 'Simple explanations with modern analogies',
  },
  grammar: {
    label: 'Grammar',
    description: 'Morphology, parsing, and syntax focus',
  },
  seminary: {
    label: 'Seminary',
    description: 'Exegetical insights for ministry preparation',
  },
  scholar: {
    label: 'Scholar',
    description: 'Philological precision and comparative linguistics',
  },
  devotional: {
    label: 'Devotional',
    description: 'Contemplative reading and spiritual reflection',
  },
  historical: {
    label: 'Historical',
    description: 'Cultural background and archaeological context',
  },
};

const TUTOR_MODE_INSTRUCTIONS: Record<TutorMode, string> = {
  beginner: `Tone: patient, encouraging, simple.
- Use everyday English. Avoid technical grammar terms unless you immediately define them.
- Give modern-language analogies when explaining grammar concepts.
- Keep answers to 2-3 short sentences. Use bullet points for clarity.
- If the student seems confused, offer a simpler rephrasing.`,

  grammar: `Tone: precise, instructional, thorough.
- Focus on morphological analysis: parsing, principal parts, paradigm placement.
- Cite specific grammar rules (e.g. "3rd declension, dative plural").
- Provide the full parsing for verb forms (tense, voice, mood, person, number).
- Reference paradigm tables and standard grammar conventions.`,

  seminary: `Tone: pastoral, exegetical, theologically informed.
- Connect grammar to theological meaning — show how the original language shapes interpretation.
- Reference significant translations (ESV, NASB, NIV) and note translation choices.
- Highlight theologically significant vocabulary and its semantic range.
- Provide brief cross-references to parallel passages when relevant.`,

  scholar: `Tone: academic, philologically rigorous, precise.
- Use standard academic terminology and abbreviations.
- Reference grammars by name (BDF, Smyth, GKC, Joüon-Muraoka) when relevant.
- Note text-critical variants if they affect the form being discussed.
- Compare cognates across related Semitic or Indo-European languages when illuminating.
- Provide detailed morphological analysis including historical developments.`,

  devotional: `Tone: contemplative, warm, spiritually attentive.
- Help the student hear the text as a living word, not just an academic exercise.
- Draw out the beauty of the original language — etymology, word pictures, poetic features.
- Suggest how a word or phrase might shape prayer or meditation.
- Keep grammar explanations brief; focus on meaning that moves the heart.`,

  historical: `Tone: vivid, contextual, narrative.
- Place the text in its historical setting: who wrote it, when, where, why.
- Reference relevant archaeology, inscriptions, material culture, and daily life.
- Explain how historical context changes our understanding of the words.
- Connect the text to broader political, social, and religious currents of its era.`,
};

/**
 * Builds a grounded system prompt for the AI tutor, including language-specific
 * instructions and any reader context (sentence, selected word, morphology).
 */
export function buildTutorPrompt(
  languageId: string,
  message: string,
  context?: TutorContext,
  mode?: TutorMode
): string {
  const langName = getLanguageName(languageId);
  const langInstructions = LANGUAGE_INSTRUCTIONS[languageId] ?? '';
  const effectiveMode = mode && TUTOR_MODE_INSTRUCTIONS[mode] ? mode : undefined;

  let prompt = `You are a ${langName} tutor helping a student read an ancient text in its original language.\n`;

  if (effectiveMode) {
    prompt += `\nTutor mode: ${TUTOR_MODES[effectiveMode].label}\n${TUTOR_MODE_INSTRUCTIONS[effectiveMode]}\n`;
  }

  if (langInstructions) {
    prompt += `\nLanguage reference:\n${langInstructions}\n`;
  }

  prompt += `
Rules:
- Answer questions about morphology, syntax, and meaning based on ${langName} grammar.
- If you are uncertain about a form or parsing, say so explicitly with "I'm not certain, but..."
- Do NOT invent morphology or grammar rules that do not apply to ${langName}.
- Distinguish between:
  • KNOWN: facts confirmed by standard grammars
  • AI-GENERATED: your analysis based on context
  • UNCERTAIN: forms you cannot confidently parse
- Keep answers concise (2-4 sentences). Focus on the student's specific question.`;

  if (context) {
    if (context.textTitle) prompt += `\n\nText: "${context.textTitle}"`;
    if (context.sentenceText) prompt += `\nSentence: "${context.sentenceText}"`;
    if (context.selectedToken) prompt += `\nSelected word: "${context.selectedToken}"`;
    if (context.lemma) prompt += `\nLemma: ${context.lemma}`;
    if (context.morphology) prompt += `\nKnown morphology: ${JSON.stringify(context.morphology)}`;
    if (context.gloss) prompt += `\nGloss: ${context.gloss}`;
  }

  prompt += `\n\nStudent's question: ${message}`;
  return prompt;
}

export const MODE_SUGGESTED_QUESTIONS: Record<TutorMode, string[]> = {
  beginner: [
    'What does this word mean in simple terms?',
    'Can you break this sentence down for me?',
    'What is the basic structure of this sentence?',
  ],
  grammar: [
    'Parse this verb form completely.',
    'What case is this and why?',
    'What grammatical construction is this?',
  ],
  seminary: [
    'What is the theological significance of this word?',
    'How do major translations handle this verse?',
    'What does the original language reveal here?',
  ],
  scholar: [
    'What are the text-critical issues here?',
    'Are there cognates in related languages?',
    'What does the grammar reference say about this form?',
  ],
  devotional: [
    'What beauty lies in the original language here?',
    'How might this word shape my prayer?',
    'What picture does this word paint?',
  ],
  historical: [
    'What was happening historically when this was written?',
    'What archaeological evidence illuminates this passage?',
    'What was daily life like for the original audience?',
  ],
};

export const LANGUAGE_SUGGESTED_QUESTIONS: Record<string, string[]> = {
  grc: [
    'What case is this noun and why?',
    'Parse this verb form for me.',
    'What does this participle modify?',
    'What is the dictionary form of this word?',
    'Why is this in the genitive?',
  ],
  'grc-koine': [
    'What case is this noun and why?',
    'Parse this verb form for me.',
    'What is the Biblical meaning of this word?',
    'What is the dictionary form of this word?',
    'How does this word differ from Classical Greek?',
  ],
  hbo: [
    'What verbal stem (binyan) is this?',
    'What does this construct chain mean?',
    'What is the root of this word?',
    'What does this suffix indicate?',
    'How is this word used elsewhere in the Tanakh?',
  ],
  lat: [
    'What case is this and why?',
    'Parse this verb form for me.',
    'What does this subjunctive mean here?',
    'What is the principal part of this verb?',
    'What grammatical construction is this?',
  ],
  syr: [
    'What is the root of this word?',
    'Parse this verb for me.',
    'What does this particle mean?',
    'What state is this noun in?',
    'What grammatical construction is this?',
  ],
};

export interface SentenceAnalysisResult {
  parsing: Array<{
    text: string;
    lemma: string;
    gloss: string;
    pos: string;
    morphology: string;
    morphologyDetails?: {
      case?: string;
      number?: string;
      gender?: string;
      person?: string;
      tense?: string;
      aspect?: string;
      voice?: string;
      mood?: string;
      stem?: string;
      binyan?: string;
      state?: string;
      conjugation?: string;
      declension?: string;
      root?: string;
    };
    notes: string;
  }>;
  syntax: {
    mainVerb: string;
    subject: string;
    object: string;
    description: string;
  };
  semantics: {
    keywords: string[];
    idioms: string[];
    notes: string;
  };
  context: string;
  translations: string[];
}

export function buildSentenceAnalysisPrompt(
  sentence: string,
  languageId: string,
  mode: 'beginner' | 'scholar'
): string {
  const langName = getLanguageName(languageId);
  const langInstructions = LANGUAGE_INSTRUCTIONS[languageId] ?? '';

  const modeInstructions =
    mode === 'beginner'
      ? 'Use simple, accessible language. Avoid jargon. Explain technical terms when used.'
      : 'Use philological terminology. Be precise and comprehensive. Assume advanced linguistic knowledge.';

  return `You are an expert philologist specializing in ${langName}. Analyze the following sentence for a ${mode === 'beginner' ? 'student' : 'scholar'}.

${langInstructions}

${modeInstructions}

Sentence: "${sentence}"

Return ONLY valid JSON with this exact structure — no markdown, no explanation:

{
  "parsing": [
    {
      "text": "original word form",
      "lemma": "dictionary form",
      "gloss": "brief English meaning",
      "pos": "part of speech",
      "morphology": "case/tense/mood/voice/number/person/gender as applicable (compact string)",
      "morphologyDetails": {
        "case": "nominative/accusative/etc. (omit if unknown)",
        "number": "singular/plural/dual (omit if unknown)",
        "gender": "masculine/feminine/neuter (omit if unknown)",
        "person": "1st/2nd/3rd (omit if unknown)",
        "tense": "present/imperfect/future/aorist/perfect/pluperfect (omit if unknown)",
        "aspect": "perfective/imperfective/stative (omit if unknown, Greek/Hebrew verbs)",
        "voice": "active/passive/middle (omit if unknown)",
        "mood": "indicative/subjunctive/imperative/optative/infinitive/participle (omit if unknown)",
        "stem": "qal/niphal/piel/pual/hiphil/hophal/hithpael (Hebrew only, omit if unknown)",
        "state": "absolute/construct (Semitic languages only, omit if unknown)",
        "conjugation": "1st/2nd/3rd/4th (Latin verbs only, omit if unknown)",
        "declension": "1st/2nd/3rd/4th/5th (Latin nouns only, omit if unknown)",
        "root": "the consonantal root (Hebrew/Semitic only, omit if unknown)"
      },
      "notes": "any notable features or irregularities (empty string if none)"
    }
  ],
  "syntax": {
    "mainVerb": "the main verb lemma",
    "subject": "subject of the sentence",
    "object": "direct object if present, else empty string",
    "description": "2-3 sentence description of the syntactic structure"
  },
  "semantics": {
    "keywords": ["2-4 key lemmas that carry the main meaning"],
    "idioms": ["any idiomatic expressions, or empty array"],
    "notes": "semantic notes: word sense, connotation, theological/literary significance"
  },
  "context": "2-3 sentences on historical, literary, or textual context. Cite parallels in other texts if known.",
  "translations": ["a literal translation", "a natural English rendering"]
}

Include every word token in parsing (skip punctuation). Be precise with morphology — provide morphologyDetails whenever possible, omitting fields that are not applicable.`;
}

export interface CourseQuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface CourseQuizResult {
  questions: CourseQuizQuestion[];
}

export function buildCourseQuizPrompt(
  textSnippet: string,
  languageId: string,
  questionCount: number = 5
): string {
  const langName = getLanguageName(languageId);
  return `You are a ${langName} language instructor. Generate ${questionCount} multiple-choice comprehension questions based on the following text passage.

Text: """
${textSnippet.slice(0, 2000)}
"""

Return ONLY valid JSON with this exact structure — no markdown, no explanation:

{
  "questions": [
    {
      "question": "question text in English",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explanation": "1-2 sentences explaining why this answer is correct"
    }
  ]
}

Rules:
- Questions should test reading comprehension, vocabulary, or grammar patterns from the passage
- Each question has exactly 4 options
- correctIndex is 0-based (0=A, 1=B, 2=C, 3=D)
- Mix question types: some about meaning, some about grammar, some about content
- Keep options plausible but clearly distinguishable`;
}

export const DEFAULT_SUGGESTED_QUESTIONS = [
  'What does this word mean in context?',
  'Parse this form for me.',
  'Why is this word in this case?',
  'What is the dictionary form of this word?',
  'What grammatical construction is this?',
];

export const BASE_JSON_SCHEMA = `{
  "sentences": [
    {
      "tokens": [
        {
          "text": "...",
          "lemma": "...",
          "normalized": "...",
          "type": "word|punctuation|number|whitespace",
          "transliteration": "...",
          "gloss": "...",
          "pos": "...",
          "morphology": {
            "case": "...",
            "number": "...",
            "gender": "...",
            "person": "...",
            "tense": "...",
            "aspect": "...",
            "voice": "...",
            "mood": "...",
            "stem": "...",
            "state": "...",
            "conjugation": "...",
            "declension": "..."
          },
          "confidence": 0.95
        }
      ],
      "translation": "..."
    }
  ]
}`;
