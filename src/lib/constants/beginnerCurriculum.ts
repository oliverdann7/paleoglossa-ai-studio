/**
 * Sequenced beginner reading curriculum.
 *
 * The Beginner Hub previously sent absolute beginners straight to the
 * `recommendedStartTextId` (John 1 for Greek) — real Koine, far too hard cold.
 * This defines an ordered ladder of *existing* corpus texts per language so the
 * daily path can walk a learner from graded readers up to authentic texts,
 * advancing one unit at a time (tracked by `curriculumIndex` in
 * `useBeginnerProgress`).
 *
 * Units reference corpus text IDs directly, so they are unaffected by the
 * `grc` / `grc-koine` language-tag split used elsewhere. (The former
 * `grc-class` tag was merged into `grc` in the 2026-08 corpus cleanup.)
 *
 * Every supported language now has a ladder (2026-08): the smaller-corpus
 * languages start from their "First Reader" A1 originals (see
 * `src/data/corpus/first-readers.ts`) and climb to authentic advanced
 * excerpts. Unit textIds are locked against CorpusDB by
 * `__tests__/beginnerCurriculum.test.ts`.
 */

export interface CurriculumUnit {
  /** Stable unit id (independent of the underlying text id). */
  id: string;
  /** Corpus text id to open in the reader (`/app/reader/:textId`). */
  textId: string;
  /** Display title shown in the daily path / beginner hub. */
  title: string;
  /** CEFR level badge for the unit. */
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  /** Rough minutes estimate for the unit. */
  estimatedMinutes: number;
}

/**
 * Koine-first ladder: composed graded reader → John (the classic, repetitive
 * Koine starting point) → narrative Koine → a stretch into classical Greek.
 */
const GREEK_CURRICULUM: CurriculumUnit[] = [
  { id: 'grc-1', textId: 'GrcMini', title: 'Greek Mini-Stories', level: 'A1', estimatedMinutes: 10 },
  { id: 'grc-2', textId: 'Jn-full', title: 'Gospel of John', level: 'A1', estimatedMinutes: 10 },
  { id: 'grc-3', textId: 'grc-koine-mark-full', title: 'Gospel of Mark', level: 'A2', estimatedMinutes: 12 },
  { id: 'grc-4', textId: 'LXX-Jonah-1', title: 'Jonah (Septuagint)', level: 'A2', estimatedMinutes: 12 },
  { id: 'grc-5', textId: 'Did-1', title: 'The Didache', level: 'A2', estimatedMinutes: 12 },
  { id: 'grc-6', textId: 'Anab-1', title: 'Xenophon, Anabasis', level: 'B1', estimatedMinutes: 15 },
];

/** Vulgate-first Latin ladder: composed stories → easy authentic prose → classics. */
const LATIN_CURRICULUM: CurriculumUnit[] = [
  { id: 'lat-1', textId: 'LatMini', title: 'Latin Mini-Stories', level: 'A1', estimatedMinutes: 10 },
  { id: 'lat-2', textId: 'lat-disticha-catonis-full', title: 'Disticha Catonis', level: 'A2', estimatedMinutes: 10 },
  { id: 'lat-3', textId: 'lat-vulgate-john-full', title: 'Vulgate, Gospel of John', level: 'A2', estimatedMinutes: 12 },
  { id: 'lat-4', textId: 'Caesar-BG-1', title: 'Caesar, Bellum Gallicum', level: 'B1', estimatedMinutes: 15 },
  { id: 'lat-5', textId: 'lat-vergil-aeneid-full', title: 'Vergil, Aeneid', level: 'B2', estimatedMinutes: 15 },
];

const HEBREW_CURRICULUM: CurriculumUnit[] = [
  { id: 'hbo-1', textId: 'HebMini', title: 'Hebrew Mini-Stories', level: 'A1', estimatedMinutes: 10 },
  { id: 'hbo-2', textId: 'Heb-Genesis', title: 'Genesis 1–3 (guided)', level: 'A1', estimatedMinutes: 12 },
  { id: 'hbo-3', textId: 'hbo-jonah-full', title: 'Jonah', level: 'A2', estimatedMinutes: 12 },
  { id: 'hbo-4', textId: 'hbo-ruth-full', title: 'Ruth', level: 'A2', estimatedMinutes: 12 },
  { id: 'hbo-5', textId: 'Ps-23', title: 'Psalm 23', level: 'B1', estimatedMinutes: 10 },
  { id: 'hbo-6', textId: 'Heb-Isa40', title: 'Isaiah 40 (poetry)', level: 'C1', estimatedMinutes: 15 },
];

const SYRIAC_CURRICULUM: CurriculumUnit[] = [
  { id: 'syr-1', textId: 'SyrFirst', title: 'Syriac First Reader', level: 'A1', estimatedMinutes: 8 },
  { id: 'syr-2', textId: 'SyrMini', title: 'Syriac Mini-Stories', level: 'A1', estimatedMinutes: 8 },
  { id: 'syr-3', textId: 'Syr-Gen', title: 'Peshitta Genesis 1', level: 'A2', estimatedMinutes: 10 },
  { id: 'syr-4', textId: 'syr-peshitta-john-full', title: 'Peshitta, Gospel of John', level: 'B1', estimatedMinutes: 12 },
  { id: 'syr-5', textId: 'Syr-Ps23', title: 'Peshitta Psalm 23', level: 'B2', estimatedMinutes: 10 },
];

const COPTIC_CURRICULUM: CurriculumUnit[] = [
  { id: 'cop-1', textId: 'CopFirst', title: 'Coptic First Reader', level: 'A1', estimatedMinutes: 8 },
  { id: 'cop-2', textId: 'CopMini', title: 'Coptic Mini-Stories', level: 'A1', estimatedMinutes: 8 },
  { id: 'cop-3', textId: 'cop-john-full', title: 'Sahidic Gospel of John', level: 'B1', estimatedMinutes: 12 },
  { id: 'cop-4', textId: 'Cop-Thom', title: 'Gospel of Thomas', level: 'B2', estimatedMinutes: 12 },
];

const ARAMAIC_CURRICULUM: CurriculumUnit[] = [
  { id: 'arc-1', textId: 'ArcFirst', title: 'Aramaic First Reader', level: 'A1', estimatedMinutes: 8 },
  { id: 'arc-2', textId: 'ArcDialogues', title: 'Aramaic Dialogues', level: 'A1', estimatedMinutes: 10 },
  { id: 'arc-3', textId: 'ArcMini', title: 'Aramaic Mini-Stories', level: 'A1', estimatedMinutes: 8 },
  { id: 'arc-4', textId: 'arc-targum-onkelos-genesis-full', title: 'Targum Onkelos, Genesis', level: 'A2', estimatedMinutes: 12 },
  { id: 'arc-5', textId: 'Arc-Dan', title: 'Daniel (Biblical Aramaic)', level: 'B2', estimatedMinutes: 12 },
];

const AKKADIAN_CURRICULUM: CurriculumUnit[] = [
  { id: 'akk-1', textId: 'AkkFirst', title: 'Akkadian First Reader', level: 'A1', estimatedMinutes: 8 },
  { id: 'akk-2', textId: 'Akk-Gilg-1', title: 'Gilgamesh, Tablet I', level: 'B1', estimatedMinutes: 12 },
  { id: 'akk-3', textId: 'Akk-Gilg-full', title: 'Gilgamesh, Tablets II, VI, X', level: 'B1', estimatedMinutes: 12 },
  { id: 'akk-4', textId: 'Akk-Ham', title: 'Code of Hammurabi', level: 'B2', estimatedMinutes: 12 },
  { id: 'akk-5', textId: 'Akk-Enuma', title: 'Enūma Eliš', level: 'C1', estimatedMinutes: 15 },
];

const SANSKRIT_CURRICULUM: CurriculumUnit[] = [
  { id: 'san-1', textId: 'SanFirst', title: 'Sanskrit First Reader', level: 'A1', estimatedMinutes: 8 },
  { id: 'san-2', textId: 'SanMini', title: 'Sanskrit Mini-Stories', level: 'A1', estimatedMinutes: 8 },
  { id: 'san-3', textId: 'San-Hito', title: 'Hitopadeśa (fables)', level: 'A2', estimatedMinutes: 10 },
  { id: 'san-4', textId: 'san-bhagavad-gita-full', title: 'Bhagavad Gītā', level: 'B1', estimatedMinutes: 12 },
  { id: 'san-5', textId: 'San-Upan', title: 'Īśā Upaniṣad', level: 'C1', estimatedMinutes: 15 },
];

const EGYPTIAN_CURRICULUM: CurriculumUnit[] = [
  { id: 'egy-1', textId: 'EgyFirst', title: 'Egyptian First Reader', level: 'A1', estimatedMinutes: 8 },
  { id: 'egy-2', textId: 'Egy-Ptah-1', title: 'Maxims of Ptahhotep', level: 'B1', estimatedMinutes: 12 },
  { id: 'egy-3', textId: 'Egy-Sin', title: 'The Tale of Sinuhe', level: 'B2', estimatedMinutes: 12 },
];

const HITTITE_CURRICULUM: CurriculumUnit[] = [
  { id: 'hit-1', textId: 'HitFirst', title: 'Hittite First Reader', level: 'A1', estimatedMinutes: 8 },
  { id: 'hit-2', textId: 'Hit-Prayer', title: 'Plague Prayers of Mursili II', level: 'B2', estimatedMinutes: 12 },
  { id: 'hit-3', textId: 'Hit-Annals-1', title: 'Annals of Mursili II', level: 'C1', estimatedMinutes: 15 },
];

const UGARITIC_CURRICULUM: CurriculumUnit[] = [
  { id: 'uga-1', textId: 'UgaFirst', title: 'Ugaritic First Reader', level: 'A1', estimatedMinutes: 8 },
  { id: 'uga-2', textId: 'Uga-Baal-1', title: 'The Baal Cycle', level: 'C1', estimatedMinutes: 15 },
];

const CURRICULA: Record<string, CurriculumUnit[]> = {
  grc: GREEK_CURRICULUM,
  // The Greek ladder is Koine-first, so it serves the Koine tag directly.
  'grc-koine': GREEK_CURRICULUM,
  lat: LATIN_CURRICULUM,
  hbo: HEBREW_CURRICULUM,
  syr: SYRIAC_CURRICULUM,
  cop: COPTIC_CURRICULUM,
  arc: ARAMAIC_CURRICULUM,
  akk: AKKADIAN_CURRICULUM,
  san: SANSKRIT_CURRICULUM,
  egy: EGYPTIAN_CURRICULUM,
  hit: HITTITE_CURRICULUM,
  uga: UGARITIC_CURRICULUM,
};

/** Returns the ordered curriculum for a language, or null when none exists. */
export function getBeginnerCurriculum(languageId: string): CurriculumUnit[] | null {
  return CURRICULA[languageId] ?? null;
}

/** True when a sequenced curriculum exists for the language. */
export function hasBeginnerCurriculum(languageId: string): boolean {
  return languageId in CURRICULA;
}

/**
 * Resolves the current (next-to-read) unit for a language given how far the
 * learner has progressed. Clamps to the last unit once the ladder is finished
 * so the daily path always has a reading target; callers can use
 * `isCurriculumComplete` to detect the finished state.
 */
export function getCurrentUnit(
  languageId: string,
  curriculumIndex: number
): CurriculumUnit | null {
  const curriculum = getBeginnerCurriculum(languageId);
  if (!curriculum || curriculum.length === 0) return null;
  const idx = Math.min(Math.max(curriculumIndex, 0), curriculum.length - 1);
  return curriculum[idx];
}

/** True once the learner has advanced past the final unit. */
export function isCurriculumComplete(languageId: string, curriculumIndex: number): boolean {
  const curriculum = getBeginnerCurriculum(languageId);
  if (!curriculum) return false;
  return curriculumIndex >= curriculum.length;
}
