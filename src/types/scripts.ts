export interface ScriptSign {
  id: string;
  unicode?: string;
  image?: string;
  transliteration: string;
  phonetic?: string;
  type:
    | 'uniliteral'
    | 'biliteral'
    | 'triliteral'
    | 'logogram'
    | 'determinative'
    | 'syllabic'
    | 'consonant'
    | 'vowel'
    | 'mater'
    | 'diacritic'
    | 'letter'
    | 'convention';
  exampleWord?: string;
  exampleGloss?: string;
  gardinerNumber?: string;
  cupboardNumber?: string;
  frequency?: number;
  /**
   * Positional (contextual) forms for cursive scripts, built with zero-width
   * joiners so the font shapes each glyph as it appears at that position in a
   * connected word (Surayt-style alphabet teaching).
   */
  forms?: { initial?: string; medial?: string; final?: string };
}

export interface ScriptLesson {
  langId: string;
  title: string;
  signs: ScriptSign[];
}

/** A short word used in an alphabet-lesson reading drill. */
export interface AlphabetPracticeWord {
  word: string;
  transliteration: string;
  gloss: string;
}

/**
 * One unit of a staged alphabet course. `signIds` reference entries of the
 * language's ScriptSign array (see `src/data/scripts/*`), so lesson data
 * stays small and the sign definitions have a single source of truth.
 */
export interface AlphabetLesson {
  id: string;
  title: string;
  description: string;
  signIds: string[];
  /** Words readable with only the signs introduced so far. */
  practiceWords?: AlphabetPracticeWord[];
  /** A memorable learning hint shown at the top of the lesson. */
  tip?: string;
}

/** A complete beginner alphabet course for one language. */
export interface AlphabetCourse {
  langId: string;
  title: string;
  intro: string;
  lessons: AlphabetLesson[];
}
