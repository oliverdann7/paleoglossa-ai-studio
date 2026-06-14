import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../lib/hooks/useSettings.js';
import { useAuth } from '../lib/hooks/useAuth.js';
import { useToast } from '../lib/hooks/useToast.js';
import { useXP } from '../lib/hooks/useXP.js';
import { VocabularyService } from '../lib/services/vocabularyService.js';
import { invalidateRecommendations } from '../lib/services/recommendationApi.js';
import { WordState } from '../lib/constants/wordStates.js';
import { getLanguageById } from '../lib/data/languages.js';
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics.js';
import { STORAGE_KEYS } from '../lib/constants/storage.js';
import { getDayOneLesson, type DayOneWord } from '../data/dayOneLessons.js';

/**
 * Day-One Lesson (roadmap § 11, 1.1) — the single highest-leverage retention
 * move. Right after onboarding, the learner walks through a 2–3 sentence A0
 * micro-text in their chosen language, one word at a time. On completion ~90% of
 * the vocabulary is seeded KNOWN (the rest LEARNING), XP is awarded, and a
 * celebration confirms the first comprehension win before they ever see the
 * full library.
 */

const destinationFor = (languageId: string | undefined): string => {
  const lang = languageId ? getLanguageById(languageId as never) : undefined;
  return lang?.recommendedStartTextId ? `/app/reader/${lang.recommendedStartTextId}` : '/app';
};

export const DayOneLesson = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { awardXP } = useXP();

  // Prefer the language handed over by onboarding (no async settings race);
  // fall back to the persisted onboarding profile on a direct visit.
  const navLanguageId = (location.state as { languageId?: string } | null)?.languageId;
  const languageId = navLanguageId ?? settings.onboardingProfile?.languageId;
  const lesson = useMemo(() => getDayOneLesson(languageId), [languageId]);
  const destination = useMemo(() => destinationFor(languageId), [languageId]);

  // Flatten every word across sentences into a single tap-through deck, while
  // keeping the originating sentence index so we can render translations.
  const deck = useMemo(() => {
    if (!lesson) return [] as Array<{ word: DayOneWord; sentenceIndex: number }>;
    return lesson.sentences.flatMap((s, si) =>
      s.words.map((word) => ({ word, sentenceIndex: si }))
    );
  }, [lesson]);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'reading' | 'done'>('intro');
  const completedRef = useRef(false);

  const alreadyDone =
    typeof window !== 'undefined' &&
    localStorage.getItem(STORAGE_KEYS.DAY_ONE_LESSON_COMPLETED) === 'true';

  // No lesson for this language (or it was already completed): skip straight to
  // the reader/library, preserving the prior onboarding behaviour.
  useEffect(() => {
    if (!lesson || alreadyDone) {
      navigate(destination, { replace: true });
    }
  }, [lesson, alreadyDone, destination, navigate]);

  const finishLesson = useCallback(async () => {
    if (completedRef.current || !lesson) return;
    completedRef.current = true;

    // Seed vocabulary: known words KNOWN, the one "new" word per sentence
    // LEARNING so it enters the SRS. De-duplicate by lemma; LEARNING wins over
    // KNOWN if the same lemma is both (never happens today, but be safe).
    const byLemma = new Map<string, WordState>();
    for (const { word } of deck) {
      const state = word.isNew ? WordState.LEARNING : WordState.KNOWN;
      const existing = byLemma.get(word.lemma);
      if (existing !== WordState.LEARNING) byLemma.set(word.lemma, state);
    }

    const uid = user?.uid ?? null;
    try {
      await Promise.all(
        Array.from(byLemma.entries()).map(([lemma, state]) =>
          VocabularyService.setWordState(uid, lemma, state, lesson.languageId)
        )
      );
      await invalidateRecommendations();
    } catch (err) {
      console.error('[day-one] failed to seed vocabulary', err);
    }

    localStorage.setItem(STORAGE_KEYS.DAY_ONE_LESSON_COMPLETED, 'true');
    await awardXP(25);
    trackEvent(ANALYTICS_EVENTS.DAY_ONE_LESSON_COMPLETED, {
      languageId: lesson.languageId,
      wordCount: byLemma.size,
    });
  }, [deck, lesson, user, awardXP]);

  // Run the completion side-effects exactly once when we reach the done screen.
  useEffect(() => {
    if (phase === 'done') void finishLesson();
  }, [phase, finishLesson]);

  if (!lesson || alreadyDone) {
    return <div className="min-h-screen bg-parch" aria-hidden />;
  }

  const start = () => {
    setPhase('reading');
    trackEvent(ANALYTICS_EVENTS.DAY_ONE_LESSON_STARTED, { languageId: lesson.languageId });
  };

  const advance = () => {
    if (index >= deck.length - 1) {
      setPhase('done');
    } else {
      setIndex((i) => i + 1);
    }
  };

  const current = deck[index];
  const knownCount = new Set(deck.map((d) => d.word.lemma)).size;

  return (
    <div className="min-h-screen bg-parch text-ink flex flex-col items-center justify-center p-6 md:p-12 font-sans paper-texture">
      <AnimatePresence mode="wait">
        {/* ── Intro ─────────────────────────────────────────────── */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="max-w-md w-full text-center"
          >
            <div className="text-6xl mb-6" aria-hidden>
              📜
            </div>
            <h1 className="text-3xl font-serif mb-3">
              {t('dayOne.introTitle', 'Your first words')}
            </h1>
            <p className="opacity-70 mb-10">
              {t(
                'dayOne.introBody',
                'A two-sentence taste of your new language. Tap through each word — by the end, you’ll read a full line and understand every part.'
              )}
            </p>
            <button
              onClick={start}
              className="px-8 py-3 rounded-xl bg-ink text-parch text-lg hover:opacity-90 transition-opacity"
            >
              {t('dayOne.begin', 'Begin')}
            </button>
          </motion.div>
        )}

        {/* ── Word-by-word reading ──────────────────────────────── */}
        {phase === 'reading' && current && (
          <motion.button
            key={`word-${index}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={advance}
            className="max-w-lg w-full text-center cursor-pointer select-none"
            aria-label={t('dayOne.tapContinue', 'Tap to continue')}
          >
            <div className="mb-2 text-xs uppercase tracking-widest opacity-50">
              {t('dayOne.progress', 'Word {{n}} of {{total}}', {
                n: index + 1,
                total: deck.length,
              })}
            </div>
            <div
              dir={lesson.direction}
              className={`${lesson.font} text-7xl md:text-8xl leading-none mb-4`}
            >
              {current.word.surface}
            </div>
            {current.word.transliteration && (
              <div className="text-xl opacity-60 italic mb-2">{current.word.transliteration}</div>
            )}
            <div className="text-2xl font-serif mb-10">{current.word.gloss}</div>
            <div className="text-sm opacity-50">{t('dayOne.tapContinue', 'Tap to continue')}</div>
          </motion.button>
        )}

        {/* ── Celebration ───────────────────────────────────────── */}
        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg w-full text-center"
          >
            <motion.div
              className="text-6xl mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16 }}
              aria-hidden
            >
              🏛️
            </motion.div>
            <h1 className="text-3xl font-serif mb-2">
              {t('dayOne.doneTitle', 'You read your first sentences!')}
            </h1>
            <p className="opacity-70 mb-8">
              {t('dayOne.doneBody', '{{count}} words are now in your vocabulary. +25 XP', {
                count: knownCount,
              })}
            </p>

            <div className="space-y-4 mb-10">
              {lesson.sentences.map((s, si) => (
                <div key={si} className="border rounded-xl p-4 bg-parch3/40">
                  <div
                    dir={lesson.direction}
                    className={`${lesson.font} text-2xl md:text-3xl leading-relaxed mb-1`}
                  >
                    {s.words.map((w) => w.surface).join(' ')}
                  </div>
                  <div className="text-sm opacity-60 font-serif italic">{s.translation}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                addToast(
                  t('dayOne.keepReading', 'Now read the real thing — every word builds on this.'),
                  'success'
                );
                navigate(destination, { replace: true });
              }}
              className="px-8 py-3 rounded-xl bg-ink text-parch text-lg hover:opacity-90 transition-opacity"
            >
              {t('dayOne.continue', 'Start reading')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
