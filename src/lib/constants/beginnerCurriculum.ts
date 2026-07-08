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
 * `grc` / `grc-koine` / `grc-class` language-tag split used elsewhere.
 *
 * Currently only Greek (`grc`) is fully sequenced — see WS1 in
 * `.claude/plans`. Other languages fall back to the generic recommendation.
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

const CURRICULA: Record<string, CurriculumUnit[]> = {
  grc: GREEK_CURRICULUM,
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
