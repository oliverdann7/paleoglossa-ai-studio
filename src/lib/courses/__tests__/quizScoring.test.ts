import { describe, it, expect } from 'vitest';
import { gradeQuiz, QUIZ_PASS_RATIO } from '../quizScoring.js';

const correct = (n: number) => Array.from({ length: n }, () => true);
const wrong = (n: number) => Array.from({ length: n }, () => false);

describe('gradeQuiz', () => {
  it('counts correct answers and total', () => {
    const g = gradeQuiz([true, false, true, false, true]);
    expect(g.score).toBe(3);
    expect(g.total).toBe(5);
    expect(g.percent).toBe(60);
  });

  it('uses an explicit total when provided (mid-quiz)', () => {
    // Only 2 answered so far out of 5 questions.
    const g = gradeQuiz([true, true], 5);
    expect(g.score).toBe(2);
    expect(g.total).toBe(5);
    expect(g.passThreshold).toBe(3);
  });

  it('pass threshold is ceil(total * pass ratio)', () => {
    expect(gradeQuiz(wrong(5)).passThreshold).toBe(3); // ceil(3.0)
    expect(gradeQuiz(wrong(4)).passThreshold).toBe(3); // ceil(2.4)
    expect(gradeQuiz(wrong(3)).passThreshold).toBe(2); // ceil(1.8)
    expect(gradeQuiz(wrong(10)).passThreshold).toBe(6); // ceil(6.0)
  });

  it('passes at or above the threshold, fails just below it', () => {
    expect(gradeQuiz([...correct(3), ...wrong(2)]).passed).toBe(true); // 3/5
    expect(gradeQuiz([...correct(2), ...wrong(3)]).passed).toBe(false); // 2/5
    expect(gradeQuiz([...correct(2), ...wrong(3)]).tier).toBe('fail');
    expect(gradeQuiz([...correct(3), ...wrong(2)]).tier).toBe('pass');
  });

  it('flags a perfect score distinctly from a regular pass', () => {
    const perfect = gradeQuiz(correct(5));
    expect(perfect.perfect).toBe(true);
    expect(perfect.passed).toBe(true);
    expect(perfect.tier).toBe('perfect');
    expect(perfect.percent).toBe(100);

    const justPassed = gradeQuiz([...correct(4), ...wrong(1)]);
    expect(justPassed.perfect).toBe(false);
    expect(justPassed.tier).toBe('pass');
  });

  it('a zero-question quiz never passes and reports 0%', () => {
    const g = gradeQuiz([], 0);
    expect(g.total).toBe(0);
    expect(g.passed).toBe(false);
    expect(g.perfect).toBe(false);
    expect(g.percent).toBe(0);
    expect(g.tier).toBe('fail');
  });

  it('all-wrong fails; all-correct is perfect', () => {
    expect(gradeQuiz(wrong(5)).tier).toBe('fail');
    expect(gradeQuiz(correct(5)).tier).toBe('perfect');
  });

  it('matches the legacy inline threshold (score >= total * ratio) for integer scores', () => {
    for (let total = 1; total <= 12; total++) {
      for (let score = 0; score <= total; score++) {
        const g = gradeQuiz([...correct(score), ...wrong(total - score)], total);
        expect(g.passed).toBe(score >= total * QUIZ_PASS_RATIO);
      }
    }
  });
});
