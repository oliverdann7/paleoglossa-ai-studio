/**
 * Language-specific instructions for the AI analysis prompt.
 * Each entry gives the AI context about the language's script, morphology,
 * and common pitfalls to improve analysis quality.
 */
export const LANGUAGE_INSTRUCTIONS: Record<string, string> = {
  'grc': `Language: Ancient Greek (Attic/Ionic/Koine).
Script: Greek alphabet. Lemmatize to standard dictionary form (e.g. λύω for verbs).
Note: Distinguish between final sigma (ς) and medial sigma (σ). Identify common
contractions (crasis, elision). Provide accurate gloss for classical meanings.`,

  'grc-koine': `Language: Koine Greek (Biblical/Hellenistic).
Script: Greek alphabet. Similar to Ancient Greek but note semantic shifts in
Biblical context (e.g. ἀγάπη = love). Handle itacism in transliteration
(e.g. η = i, ει = i). Lemmatize to standard NT Greek forms.`,

  'hbo': `Language: Biblical Hebrew (Tiberian pointing).
Script: Hebrew alphabet (right-to-left). Include niqqud (vowel points) as written.
Provide semantic gloss based on Tanakh usage. Note: verbal stems (Qal, Niphal,
Piel, Pual, Hiphil, Hophal, Hithpael) should be reflected in the lemma where
possible. Transliterate using SBL Academic style (e.g. א = ', ב = b/v).`,

  'lat': `Language: Latin (Classical/Ecclesiastical).
Script: Latin alphabet. Lemmatize to standard dictionary form (e.g. amo for verbs,
first principal part). Note macrons for long vowels where evident. Distinguish
between classical and ecclesiastical pronunciation in transliteration.`,

  'syr': `Language: Syriac (Classical Syriac / Edessan).
Script: Syriac alphabet (Estrangela/Serto, right-to-left). Handle Syriac-specific
vowel marks (Zqapa, Pthaha, Rbasa, etc.). Lemmatize to standard root + pattern.
Transliteration using standard Syriac academic scheme.`,

  'cop': `Language: Coptic (Sahidic/Bohairic).
Script: Coptic alphabet (Greek-derived + Demotic letters). Lemmatize to standard
Coptic dictionary form. Note the six major dialects if detectable. Transliteration
follows standard Coptological conventions (e.g. ⲁ = a, ⲃ = b).`,

  'arc': `Language: Aramaic (Biblical Aramaic / Imperial Aramaic).
Script: Hebrew/Aramaic square script (right-to-left). Similar to Hebrew but with
Aramaic-specific vocabulary and grammar. Lemmatize to standard Aramaic lexicon
forms. Key difference: definite state uses emphatic suffix -א.`,

  'akk': `Language: Akkadian (Babylonian/Assyrian).
Script: Cuneiform (Latin transcription expected as input, not actual signs).
Lemmatize to standard Akkadian root forms (e.g. parāsu). Distinguish between
Babylonian and Assyrian dialects. Use standard Assyriological transliteration
(sumerograms in CAPITALS, phonetic in lowercase).`,

  'san': `Language: Sanskrit (Classical/Vedic).
Script: Devanagari (or Latin transliteration). Lemmatize to standard dhātu (root)
forms. Note sandhi (euphonic combinations) — provide both sandhi and sandhi-free
forms. Transliteration using IAST standard.`,

  'egy': `Language: Egyptian (Middle Egyptian / Late Egyptian).
Script: Hieroglyphic (Manuel de Codage transliteration expected as input).
Lemmatize to standard dictionary forms (e.g. Gardiner sign list numbers for
reference). Note determinatives. Transliteration using standard Egyptological
scheme (ȝ, i, y, ˁ, w, b, etc.).`,

  'hit': `Language: Hittite (Akkadian/Anatolian hieroglyphs? Neo-Hittite?).
Script: Cuneiform (Latin transcription expected). Lemmatize to standard Hittite
dictionary forms. Note the three genders and the -r/n declension. Transliteration
conventions: š = sh, ḫ = kh.`,
};

export function getLanguageName(languageId: string): string {
  const names: Record<string, string> = {
    'grc': 'Ancient Greek',
    'grc-koine': 'Koine Greek',
    'hbo': 'Biblical Hebrew',
    'lat': 'Latin',
    'syr': 'Syriac',
    'cop': 'Coptic',
    'arc': 'Aramaic',
    'akk': 'Akkadian',
    'san': 'Sanskrit',
    'egy': 'Egyptian',
    'hit': 'Hittite',
  };
  return names[languageId] || languageId;
}

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
          "confidence": 0.95
        }
      ],
      "translation": "..."
    }
  ]
}`;
