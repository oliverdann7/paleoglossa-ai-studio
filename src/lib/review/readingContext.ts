export interface ReadingContext {
  surface?: string;
  morphology?: string;
  transliteration?: string;
  textId?: string;
  sentenceIndex?: number;
  sentenceTranslation?: string;
  /** 'phrase' for a multi-word item; absent for a single word. */
  kind?: 'phrase';
  /** Lemmas of a phrase's member words, in order. */
  memberLemmas?: string[];
}

export const READING_CONTEXT_FIELDS = [
  'surface',
  'morphology',
  'transliteration',
  'textId',
  'sentenceIndex',
  'sentenceTranslation',
  'kind',
  'memberLemmas',
] as const;

export function sanitizeReadingExtra(
  extra: Partial<ReadingContext>
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const key of READING_CONTEXT_FIELDS) {
    if (extra[key] !== undefined) {
      payload[key] = extra[key];
    }
  }
  return payload;
}

export function buildReadingContext(
  selectedWord: {
    text?: string;
    lemma?: string;
    morphology?: string;
    translit?: string;
    sentenceText?: string;
    sentenceIndex?: number;
  },
  text?: { id?: string },
  sentenceTranslation?: string
): ReadingContext {
  return {
    surface: selectedWord.text || selectedWord.lemma,
    morphology: selectedWord.morphology,
    transliteration: selectedWord.translit,
    textId: text?.id,
    sentenceIndex: selectedWord.sentenceIndex,
    sentenceTranslation,
  };
}
