/**
 * Pure scoring + progression logic for course comprehension quizzes.
 *
 * Extracted from CourseQuizModal so the pass/fail thresholds live in one place
 * and can be unit-tested independently of the React component.
 */

/** Fraction of questions a learner must answer correctly to pass. */
export const QUIZ_PASS_RATIO = 0.6;

export type QuizTier = 'perfect' | 'pass' | 'fail';

export interface QuizGrade {
  /** Number of correct answers. */
  score: number;
  /** Total number of questions graded. */
  total: number;
  /** Score as a 0–100 percentage, rounded. */
  percent: number;
  /** Minimum number of correct answers required to pass. */
  passThreshold: number;
  /** True when the learner met or exceeded the pass threshold. */
  passed: boolean;
  /** True when every question was answered correctly. */
  perfect: boolean;
  /** Coarse outcome tier used to pick result messaging. */
  tier: QuizTier;
}

/**
 * Grade a quiz from the per-question correctness flags.
 *
 * @param answers - One boolean per answered question (`true` = correct).
 * @param total   - Total question count; defaults to `answers.length`.
 */
export function gradeQuiz(answers: boolean[], total: number = answers.length): QuizGrade {
  const safeTotal = Math.max(0, total);
  const score = answers.reduce((n, correct) => (correct ? n + 1 : n), 0);
  const passThreshold = Math.ceil(safeTotal * QUIZ_PASS_RATIO);
  const passed = safeTotal > 0 && score >= passThreshold;
  const perfect = safeTotal > 0 && score === safeTotal;
  const percent = safeTotal > 0 ? Math.round((score / safeTotal) * 100) : 0;
  const tier: QuizTier = perfect ? 'perfect' : passed ? 'pass' : 'fail';

  return { score, total: safeTotal, percent, passThreshold, passed, perfect, tier };
}
