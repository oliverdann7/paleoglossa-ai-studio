/**
 * Day-One Lessons (roadmap § 11, 1.1)
 *
 * A tiny, hand-curated A0 micro-text per flagship language. The point is a
 * *guaranteed* comprehension win in the user's first minute: ~90% of the
 * vocabulary is pre-seeded as KNOWN when the lesson completes, leaving a single
 * "new" word per sentence to enter the SRS as LEARNING.
 *
 * This data is intentionally self-contained (not pulled from `corpus.ts`) so the
 * onboarding path never has to eagerly load the multi-thousand-line corpus
 * bundle. Keep each lesson to 2–3 short sentences of genuinely A0 vocabulary.
 */

export interface DayOneWord {
  /** The exact form as it appears in the sentence. */
  surface: string;
  /** Romanised pronunciation aid (optional for Latin). */
  transliteration?: string;
  /** Plain-English gloss. */
  gloss: string;
  /** Canonical lemma — the term seeded into the user's vocabulary. */
  lemma: string;
  /** The one unfamiliar word per sentence; seeded as LEARNING, not KNOWN. */
  isNew?: boolean;
}

export interface DayOneSentence {
  words: DayOneWord[];
  /** Full natural-English rendering, shown once the sentence is assembled. */
  translation: string;
}

export interface DayOneLesson {
  languageId: string;
  /** Tailwind font class matching the script. */
  font: string;
  direction: 'ltr' | 'rtl';
  /** Reading-tradition note shown in the celebration ("Erasmian", etc.). */
  note?: string;
  sentences: DayOneSentence[];
}

const GREEK_LESSON: Omit<DayOneLesson, 'languageId'> = {
  font: 'font-greek',
  direction: 'ltr',
  sentences: [
    {
      translation: 'God is good.',
      words: [
        { surface: 'ὁ', transliteration: 'ho', gloss: 'the', lemma: 'ὁ' },
        { surface: 'θεός', transliteration: 'theós', gloss: 'God', lemma: 'θεός' },
        { surface: 'ἀγαθός', transliteration: 'agathós', gloss: 'good', lemma: 'ἀγαθός' },
        { surface: 'ἐστιν', transliteration: 'estin', gloss: 'is', lemma: 'εἰμί' },
      ],
    },
    {
      translation: 'The word is life.',
      words: [
        { surface: 'ὁ', transliteration: 'ho', gloss: 'the', lemma: 'ὁ' },
        { surface: 'λόγος', transliteration: 'lógos', gloss: 'word', lemma: 'λόγος' },
        { surface: 'ἐστι', transliteration: 'esti', gloss: 'is', lemma: 'εἰμί' },
        { surface: 'ζωή', transliteration: 'zōḗ', gloss: 'life', lemma: 'ζωή', isNew: true },
      ],
    },
  ],
};

const LATIN_LESSON: Omit<DayOneLesson, 'languageId'> = {
  font: 'font-serif',
  direction: 'ltr',
  sentences: [
    {
      translation: 'God is good.',
      words: [
        { surface: 'Deus', transliteration: 'DE-us', gloss: 'God', lemma: 'deus' },
        { surface: 'bonus', transliteration: 'BO-nus', gloss: 'good', lemma: 'bonus' },
        { surface: 'est', transliteration: 'est', gloss: 'is', lemma: 'sum' },
      ],
    },
    {
      translation: 'The water is good.',
      words: [
        { surface: 'aqua', transliteration: 'A-qua', gloss: 'water', lemma: 'aqua', isNew: true },
        { surface: 'bona', transliteration: 'BO-na', gloss: 'good', lemma: 'bonus' },
        { surface: 'est', transliteration: 'est', gloss: 'is', lemma: 'sum' },
      ],
    },
  ],
};

const HEBREW_LESSON: Omit<DayOneLesson, 'languageId'> = {
  font: 'font-hebrew',
  direction: 'rtl',
  sentences: [
    {
      translation: 'The light is good.',
      words: [
        { surface: 'הָאוֹר', transliteration: 'hā-ʾôr', gloss: 'the light', lemma: 'אוֹר' },
        { surface: 'טוֹב', transliteration: 'ṭôv', gloss: 'good', lemma: 'טוֹב' },
      ],
    },
    {
      translation: 'The waters are good.',
      words: [
        {
          surface: 'הַמַּיִם',
          transliteration: 'ham-mayim',
          gloss: 'the waters',
          lemma: 'מַיִם',
          isNew: true,
        },
        { surface: 'טוֹבִים', transliteration: 'ṭôvîm', gloss: 'good', lemma: 'טוֹב' },
      ],
    },
  ],
};

/**
 * Lessons keyed by language id. Both the Attic (`grc`) and Koine (`grc-koine`)
 * Greek tracks share the same A0 micro-text.
 */
export const DAY_ONE_LESSONS: Record<string, DayOneLesson> = {
  grc: { languageId: 'grc', ...GREEK_LESSON },
  'grc-koine': { languageId: 'grc-koine', ...GREEK_LESSON },
  lat: { languageId: 'lat', ...LATIN_LESSON },
  hbo: { languageId: 'hbo', ...HEBREW_LESSON },
};

export const getDayOneLesson = (languageId: string | undefined): DayOneLesson | null =>
  languageId ? (DAY_ONE_LESSONS[languageId] ?? null) : null;

export const hasDayOneLesson = (languageId: string | undefined): boolean =>
  getDayOneLesson(languageId) !== null;
