import { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  GraduationCap,
  Lightbulb,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { cn } from '../../lib/utils.js';
import type { AlphabetCourse, AlphabetLesson, ScriptSign } from '../../types/scripts.js';
import { useAlphabetProgress } from '../../lib/hooks/useAlphabetProgress.js';

interface AlphabetCourseViewProps {
  langId: string;
  course: AlphabetCourse;
  signs: ScriptSign[];
}

interface QuizQuestion {
  sign: ScriptSign;
  options: string[]; // transliterations, one correct
}

/** Percentage of quiz answers that must be correct to pass a lesson. */
const PASS_THRESHOLD = 0.8;

function cryptoShuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor((i + 1) * (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildQuiz(lesson: AlphabetLesson, allSigns: ScriptSign[]): QuizQuestion[] {
  const byId = new Map(allSigns.map((s) => [s.id, s]));
  const lessonSigns = lesson.signIds.map((id) => byId.get(id)).filter((s): s is ScriptSign => !!s);
  const distractorPool = allSigns.filter((s) => s.transliteration);

  return cryptoShuffle(lessonSigns).map((sign) => {
    const distractors = cryptoShuffle(
      distractorPool.filter((s) => s.id !== sign.id && s.transliteration !== sign.transliteration)
    )
      .slice(0, 3)
      .map((s) => s.transliteration);
    return { sign, options: cryptoShuffle([sign.transliteration, ...distractors]) };
  });
}

export const AlphabetCourseView = ({ langId, course, signs }: AlphabetCourseViewProps) => {
  const { t } = useTranslation();
  const { getCompleted, markLessonComplete, resetCourse } = useAlphabetProgress();

  const completed = getCompleted(langId);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [stage, setStage] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);

  const activeLesson = useMemo(
    () => course.lessons.find((l) => l.id === activeLessonId) ?? null,
    [course, activeLessonId]
  );

  const signById = useMemo(() => new Map(signs.map((s) => [s.id, s])), [signs]);

  const openLesson = useCallback((lessonId: string) => {
    setActiveLessonId(lessonId);
    setStage('intro');
    setQuiz([]);
    setQuestionIndex(0);
    setSelectedOption(null);
    setCorrectCount(0);
  }, []);

  const startQuiz = useCallback(() => {
    if (!activeLesson) return;
    setQuiz(buildQuiz(activeLesson, signs));
    setQuestionIndex(0);
    setSelectedOption(null);
    setCorrectCount(0);
    setStage('quiz');
  }, [activeLesson, signs]);

  const handleAnswer = useCallback(
    (option: string) => {
      if (selectedOption !== null) return; // already answered
      setSelectedOption(option);
      if (option === quiz[questionIndex]?.sign.transliteration) {
        setCorrectCount((c) => c + 1);
      }
    },
    [selectedOption, quiz, questionIndex]
  );

  const nextQuestion = useCallback(() => {
    if (questionIndex + 1 >= quiz.length) {
      setStage('result');
      return;
    }
    setQuestionIndex((i) => i + 1);
    setSelectedOption(null);
  }, [questionIndex, quiz.length]);

  const passed = quiz.length > 0 && correctCount / quiz.length >= PASS_THRESHOLD;

  const finishLesson = useCallback(() => {
    if (activeLesson && passed) {
      markLessonComplete(langId, activeLesson.id);
    }
    setActiveLessonId(null);
    setStage('intro');
  }, [activeLesson, passed, markLessonComplete, langId]);

  // ── Course overview ────────────────────────────────────────────────────────
  if (!activeLesson) {
    const doneCount = course.lessons.filter((l) => completed.includes(l.id)).length;
    const allDone = doneCount === course.lessons.length;

    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-lg font-serif font-bold text-ink mb-1">{course.title}</h2>
          <p className="text-sm text-muted leading-relaxed">{course.intro}</p>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-2 bg-parch3 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue rounded-full transition-all"
              style={{ width: `${(doneCount / course.lessons.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-bold text-muted whitespace-nowrap">
            {t('alphabetCourse.progress', '{{done}}/{{total}} lessons', {
              done: doneCount,
              total: course.lessons.length,
            })}
          </span>
        </div>

        {allDone && (
          <div className="flex items-center gap-3 p-4 mb-5 bg-green-50 border border-green-200 rounded-xl">
            <Trophy className="w-6 h-6 text-green-600 shrink-0" />
            <div className="text-sm text-green-800">
              {t(
                'alphabetCourse.courseComplete',
                'You have completed the whole alphabet course — time to read real texts!'
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {course.lessons.map((lesson, idx) => {
            const done = completed.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                onClick={() => openLesson(lesson.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-colors',
                  done
                    ? 'bg-green-50/50 border-green-200 hover:border-green-300'
                    : 'bg-sand border-bdr hover:border-blue/40'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold',
                    done ? 'bg-green-500 text-white' : 'bg-parch3 text-muted'
                  )}
                >
                  {done ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={cn('text-sm font-semibold', done ? 'text-green-700' : 'text-ink')}
                  >
                    {lesson.title}
                  </div>
                  <div className="text-[12px] text-muted leading-snug">{lesson.description}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted shrink-0" />
              </button>
            );
          })}
        </div>

        {doneCount > 0 && (
          <button
            onClick={() => resetCourse(langId)}
            className="flex items-center gap-2 mx-auto mt-6 px-4 py-2 text-xs text-muted hover:text-ink transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('alphabetCourse.reset', 'Reset course progress')}
          </button>
        )}
      </div>
    );
  }

  // ── Lesson: intro stage ────────────────────────────────────────────────────
  if (stage === 'intro') {
    const lessonSigns = activeLesson.signIds
      .map((id) => signById.get(id))
      .filter((s): s is ScriptSign => !!s);

    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => setActiveLessonId(null)}
          className="text-blue flex items-center mb-4 hover:underline text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('alphabetCourse.backToCourse', 'All lessons')}
        </button>

        <h2 className="text-lg font-serif font-bold text-ink mb-1">{activeLesson.title}</h2>
        <p className="text-sm text-muted mb-4">{activeLesson.description}</p>

        {activeLesson.tip && (
          <div className="flex items-start gap-2 p-3 mb-4 bg-amber-50 border border-amber-200 rounded-xl">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[13px] text-amber-800 leading-snug">{activeLesson.tip}</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-5">
          {lessonSigns.map((sign) => (
            <div key={sign.id} className="border border-bdr rounded-lg p-3 text-center bg-sand">
              <div className="text-3xl mb-1">{sign.unicode || sign.transliteration}</div>
              <div className="text-xs font-mono text-ink2">{sign.transliteration}</div>
              {sign.phonetic && <div className="text-[10px] text-muted">{sign.phonetic}</div>}
              {sign.forms && (
                <div className="flex justify-center gap-3 mt-1.5 pt-1.5 border-t border-bdr/60">
                  {(['initial', 'medial', 'final'] as const).map(
                    (pos) =>
                      sign.forms?.[pos] && (
                        <div key={pos}>
                          <div className="text-lg leading-none">{sign.forms[pos]}</div>
                          <div className="text-[9px] uppercase tracking-wide text-muted mt-0.5">
                            {t(`alphabetCourse.form_${pos}`, pos)}
                          </div>
                        </div>
                      )
                  )}
                </div>
              )}
              {sign.exampleWord && (
                <div className="text-[11px] mt-1 text-ink2">
                  {sign.exampleWord}
                  {sign.exampleGloss && <span className="text-muted"> — {sign.exampleGloss}</span>}
                </div>
              )}
            </div>
          ))}
        </div>

        {activeLesson.practiceWords && activeLesson.practiceWords.length > 0 && (
          <div className="mb-5">
            <div className="text-[11px] font-bold text-ink2 uppercase tracking-wider mb-2">
              {t('alphabetCourse.readWords', 'Try reading')}
            </div>
            <div className="flex flex-wrap gap-2">
              {activeLesson.practiceWords.map((w) => (
                <div
                  key={w.word}
                  className="px-3 py-2 border border-bdr rounded-lg bg-sand text-center"
                >
                  <div className="text-xl">{w.word}</div>
                  <div className="text-[10px] text-muted">
                    {w.transliteration} — {w.gloss}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={startQuiz}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue text-white rounded-lg text-sm font-medium hover:bg-blue-dark transition-colors"
        >
          <GraduationCap className="w-4 h-4" />
          {t('alphabetCourse.startQuiz', 'Quiz me on these signs')}
        </button>
      </div>
    );
  }

  // ── Lesson: quiz stage ─────────────────────────────────────────────────────
  if (stage === 'quiz') {
    const question = quiz[questionIndex];
    if (!question) return null;

    return (
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4 text-xs text-muted">
          <button onClick={() => setStage('intro')} className="text-blue hover:underline">
            {t('alphabetCourse.backToSigns', 'Review signs')}
          </button>
          <span>
            {t('alphabetCourse.questionOf', '{{current}} of {{total}}', {
              current: questionIndex + 1,
              total: quiz.length,
            })}
          </span>
        </div>

        <div className="border border-bdr rounded-xl p-8 text-center bg-sand">
          <div className="text-[11px] font-bold text-ink2 uppercase tracking-wider mb-3">
            {t('alphabetCourse.whichSign', 'Which sign is this?')}
          </div>
          <div className="text-6xl mb-6">
            {question.sign.unicode || question.sign.transliteration}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {question.options.map((option) => {
              const isCorrect = option === question.sign.transliteration;
              const isSelected = option === selectedOption;
              const answered = selectedOption !== null;
              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(option)}
                  disabled={answered}
                  className={cn(
                    'px-4 py-2.5 rounded-lg text-sm font-mono border transition-colors',
                    !answered && 'bg-white/60 border-bdr hover:border-blue/50 text-ink',
                    answered && isCorrect && 'bg-green-100 border-green-400 text-green-800',
                    answered &&
                      isSelected &&
                      !isCorrect &&
                      'bg-red-100 border-red-400 text-red-800',
                    answered && !isSelected && !isCorrect && 'bg-white/40 border-bdr text-muted'
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {selectedOption !== null && (
            <button
              onClick={nextQuestion}
              className="mt-5 inline-flex items-center gap-2 px-6 py-2 bg-blue text-white rounded-lg text-sm font-medium hover:bg-blue-dark transition-colors"
            >
              {questionIndex + 1 >= quiz.length
                ? t('alphabetCourse.seeResult', 'See result')
                : t('alphabetCourse.next', 'Next')}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Lesson: result stage ───────────────────────────────────────────────────
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="border border-bdr rounded-xl p-8 bg-sand">
        {passed ? (
          <Trophy className="w-12 h-12 mx-auto mb-3 text-green-600" />
        ) : (
          <RotateCcw className="w-12 h-12 mx-auto mb-3 text-muted" />
        )}
        <h2 className="text-lg font-serif font-bold text-ink mb-1">
          {passed
            ? t('alphabetCourse.passed', 'Lesson complete!')
            : t('alphabetCourse.failed', 'Almost there')}
        </h2>
        <p className="text-sm text-muted mb-5">
          {t('alphabetCourse.score', 'You got {{correct}} of {{total}} correct.', {
            correct: correctCount,
            total: quiz.length,
          })}
          {!passed &&
            ' ' +
              t('alphabetCourse.retryHint', 'Review the signs and try again — you need {{pct}}%.', {
                pct: Math.round(PASS_THRESHOLD * 100),
              })}
        </p>
        <div className="flex gap-3 justify-center">
          {passed ? (
            <button
              onClick={finishLesson}
              className="px-6 py-2 bg-blue text-white rounded-lg text-sm font-medium hover:bg-blue-dark transition-colors"
            >
              {t('alphabetCourse.continue', 'Continue')}
            </button>
          ) : (
            <>
              <button
                onClick={() => setStage('intro')}
                className="px-5 py-2 border border-bdr rounded-lg text-sm font-medium text-ink hover:border-blue/40 transition-colors"
              >
                {t('alphabetCourse.reviewSigns', 'Review signs')}
              </button>
              <button
                onClick={startQuiz}
                className="px-5 py-2 bg-blue text-white rounded-lg text-sm font-medium hover:bg-blue-dark transition-colors"
              >
                {t('alphabetCourse.retry', 'Retry quiz')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
