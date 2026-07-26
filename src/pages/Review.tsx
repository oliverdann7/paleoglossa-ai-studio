import { useState, useEffect, useLayoutEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Loader2,
  Brain,
  History,
  Target,
  Settings2,
  ScrollText,
  Clock,
} from 'lucide-react';
import { useAuth } from '../lib/hooks/useAuth.js';
import { useKnowledge } from '../lib/hooks/useKnowledge.js';
import { useActiveLanguage } from '../lib/hooks/useActiveLanguage.js';
import { WordState } from '../lib/constants/wordStates.js';
import { ReviewService, ReviewItem } from '../lib/services/reviewService.js';
import { Rating, calculateSM2 } from '../lib/srs/sm2.js';
import type { SRSState } from '../lib/srs/sm2.js';
import {
  CardType,
  CardWeighting,
  ReviewCard,
  generateReviewCards,
} from '../lib/review/reviewCardFactory.js';
import {
  readSavedSession,
  writeSavedSession,
  clearSavedSession,
  type SavedReviewSession,
} from '../lib/review/reviewSession.js';
import { useTranslation } from 'react-i18next';
import type { WordInfo } from '../lib/services/vocabularyService.js';
import { Timestamp } from 'firebase/firestore';
import { trackEvent, ANALYTICS_EVENTS } from '../lib/analytics.js';
import { useXP } from '../lib/hooks/useXP.js';
import { XP_REWARDS } from '../lib/services/xpService.js';
import { ReviewTutorial } from '../components/review/ReviewTutorial.js';
import { checkAndUnlock } from '../lib/services/achievementService.js';
import { ReviewAudioButton } from '../components/review/ReviewAudioButton.js';
import { isReviewAudioSupported } from '../components/review/reviewAudioSupport.js';
import { logSilentFailure } from '../lib/utils/logSilent.js';

interface ReviewSettings {
  enabledTypes: CardType[];
  maxCards: number;
  includeMorphology: boolean;
  cardWeighting: CardWeighting;
}

const DEFAULT_SETTINGS: ReviewSettings = {
  enabledTypes: [
    CardType.FORM_TO_MEANING,
    CardType.MEANING_TO_FORM,
    CardType.CLOZE,
    CardType.PARSE,
    CardType.LEMMA_RECOGNITION,
    CardType.CONTEXT_TRANSLATION,
  ],
  maxCards: 30,
  includeMorphology: true,
  cardWeighting: 'adaptive',
};

const SETTINGS_KEY = 'paleoglossa_review_settings';

const toDateStr = (v: string | Timestamp): string =>
  typeof v === 'string' ? v : v.toDate().toISOString();

/** Format an elapsed duration as `m:ss` (or `s s` under a minute) for the colophon. */
function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function loadSettings(): ReviewSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: ReviewSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export const Review = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isDemoMode } = useAuth();
  const { activeLanguageId } = useActiveLanguage();
  const { knowledge, updateWordSRS, recordReviewSession } = useKnowledge(activeLanguageId);
  const { t } = useTranslation();
  const { awardXP } = useXP();

  // Text-specific filter: set when arriving from Reader via "Review This Text"
  const textFilterActive = searchParams.get('filter') === 'text';
  const [textFilter] = useState<{ textId: string; lemmas: Set<string> } | null>(() => {
    try {
      if (new URLSearchParams(window.location.search).get('filter') !== 'text') return null;
      const stored = sessionStorage.getItem('reviewTextFilter');
      if (stored) {
        const parsed = JSON.parse(stored) as { textId: string; lemmas: string[] };
        sessionStorage.removeItem('reviewTextFilter');
        return { textId: parsed.textId, lemmas: new Set(parsed.lemmas) };
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Stable ref so the queue-load effect doesn't re-run on every word state change
  const knowledgeRef = useRef(knowledge);
  useLayoutEffect(() => {
    knowledgeRef.current = knowledge;
  });

  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [queue, setQueue] = useState<ReviewCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [cardStartTime, setCardStartTime] = useState<number>(0);
  const [sessionResults, setSessionResults] = useState<
    { lemma: string; rating: Rating; responseMs: number }[]
  >([]);
  const [isFinished, setIsFinished] = useState(false);
  // Elapsed time of the just-finished session, frozen for the colophon screen.
  const [sessionDurationMs, setSessionDurationMs] = useState(0);

  // Session resume: a snapshot from a prior interrupted session, offered on the
  // start screen. `resumedRef` guards the async queue loader from clobbering a
  // restored queue; `resumeDismissed` hides the prompt after "Start over".
  const [resumeDismissed, setResumeDismissed] = useState(false);
  const resumedRef = useRef(false);

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ReviewSettings>(loadSettings);

  const sessionStartRef = useRef<number>(0);

  // Analytics
  const [reviewSummary, setReviewSummary] = useState<{
    dueCount: number;
    reviewedToday: number;
    lastAccuracy: number | null;
    avgResponseMs: number | null;
  } | null>(null);
  const [weakLemmas, setWeakLemmas] = useState<{ lemma: string; failCount: number }[]>([]);
  const [weakCardTypes, setWeakCardTypes] = useState<
    { cardType: string; failRate: number; count: number }[]
  >([]);

  // Load analytics on mount
  useEffect(() => {
    if (!user || isDemoMode) {
      // Demo mode: compute from local knowledge
      const due = Object.entries(knowledgeRef.current).filter(([, info]: [string, WordInfo]) => {
        const state = typeof info === 'string' ? info : info.state;
        if (state === WordState.NEW || state === WordState.IGNORED) return false;
        const lang = typeof info === 'object' ? info.languageId || '' : '';
        if (lang && lang !== activeLanguageId) return false;
        if (!info.srs?.nextReview) return true;
        return new Date(toDateStr(info.srs.nextReview)) <= new Date();
      });
      setReviewSummary({
        dueCount: due.length,
        reviewedToday: 0,
        lastAccuracy: null,
        avgResponseMs: null,
      });
      return;
    }
    ReviewService.getReviewSummary(user.uid, activeLanguageId).then(setReviewSummary);
    ReviewService.getWeakLemmas(user.uid, activeLanguageId).then(setWeakLemmas);
    ReviewService.getWeakCardTypes(user.uid, activeLanguageId).then(setWeakCardTypes);
  }, [user, isDemoMode, activeLanguageId]);

  // Load Review Queue
  useEffect(() => {
    const loadQueue = async () => {
      setIsLoading(true);
      try {
        let items: ReviewItem[] = [];
        if (!isDemoMode && user) {
          items = await ReviewService.getDueItems(user.uid, settings.maxCards, activeLanguageId);
          if (textFilter) {
            items = items.filter((item) => textFilter.lemmas.has(item.term));
          }
        } else {
          items = Object.entries(knowledgeRef.current)
            .filter(([, info]: [string, WordInfo]) => {
              const state = typeof info === 'object' ? info.state : info;
              if (
                state === WordState.NEW ||
                state === WordState.IGNORED ||
                state === WordState.SEEN
              )
                return false;
              return true;
            })
            .filter(([, info]: [string, WordInfo]) => {
              const lang = info.languageId || '';
              return !lang || lang === activeLanguageId;
            })
            .filter(([, info]: [string, WordInfo]) => {
              if (!info.srs?.nextReview) return true;
              return new Date(toDateStr(info.srs.nextReview)) <= new Date();
            })
            .map(([lemma, info]) => {
              const srs: SRSState = info.srs
                ? {
                    interval: info.srs.interval,
                    ease: info.srs.ease,
                    step: info.srs.step,
                    lastReviewed: info.srs.lastReviewed ? toDateStr(info.srs.lastReviewed) : null,
                    nextReview: toDateStr(info.srs.nextReview),
                  }
                : {
                    interval: 0,
                    ease: 2.5,
                    step: 0,
                    lastReviewed: null,
                    nextReview: new Date().toISOString(),
                  };
              return {
                id: lemma,
                term: lemma,
                languageId: info.languageId || activeLanguageId || 'unknown',
                userGloss: info.userGloss,
                contexts: info.contexts,
                status: info.state,
                srs,
                surface: info.surface,
                morphology: info.morphology,
                transliteration: info.transliteration,
                textId: info.textId,
                sentenceIndex: info.sentenceIndex,
                sentenceTranslation: info.sentenceTranslation,
              };
            });
          if (textFilter) {
            items = items.filter((item) => textFilter.lemmas.has(item.term));
          }
        }

        const cards = generateReviewCards(items, {
          enabledTypes: settings.enabledTypes,
          includeMorphology: settings.includeMorphology,
          weighting: settings.cardWeighting,
        });
        // A resumed session owns the queue — don't overwrite it with a fresh load.
        if (resumedRef.current) return;
        setQueue(cards.sort(() => Math.random() - 0.5));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadQueue();
  }, [user, isDemoMode, activeLanguageId, settings, textFilter]);

  // The resumable snapshot offered on the start screen. Derived (not state) so
  // it stays in sync with the active language without a setState-in-effect; a
  // saved session only applies to its own language.
  const resumable: SavedReviewSession | null = useMemo(() => {
    if (isStarted || isFinished || resumeDismissed) return null;
    return readSavedSession(activeLanguageId);
  }, [isStarted, isFinished, resumeDismissed, activeLanguageId]);

  // Mirror the live session to sessionStorage so a reload mid-review recovers.
  useEffect(() => {
    if (!isStarted || isFinished || queue.length === 0) return;
    writeSavedSession({ languageId: activeLanguageId, queue, currentCardIndex, sessionResults });
  }, [isStarted, isFinished, queue, currentCardIndex, sessionResults, activeLanguageId]);

  const handleStart = () => {
    // Starting fresh supersedes any prior snapshot.
    clearSavedSession();
    resumedRef.current = false;
    setIsStarted(true);
    sessionStartRef.current = Date.now();
    setCardStartTime(Date.now());
    trackEvent(ANALYTICS_EVENTS.REVIEW_STARTED, {
      languageId: activeLanguageId,
      cardCount: queue.length,
      textFilterActive,
    });
  };

  const handleResume = () => {
    if (!resumable) return;
    resumedRef.current = true;
    setQueue(resumable.queue);
    setCurrentCardIndex(resumable.currentCardIndex);
    setSessionResults(resumable.sessionResults);
    setIsRevealed(false);
    setIsStarted(true);
    setIsFinished(false);
    sessionStartRef.current = Date.now();
    setCardStartTime(Date.now());
    trackEvent(ANALYTICS_EVENTS.REVIEW_STARTED, {
      languageId: activeLanguageId,
      cardCount: resumable.queue.length - resumable.currentCardIndex,
      resumed: true,
    });
  };

  const handleDiscardResume = () => {
    clearSavedSession();
    setResumeDismissed(true);
  };

  const onBack = () => navigate('/app');

  const handleRate = useCallback(
    async (rating: Rating) => {
      const currentCard = queue[currentCardIndex];
      if (!currentCard) return;

      const responseMs = Date.now() - cardStartTime;
      const result = { lemma: currentCard.term, rating, responseMs };
      setSessionResults((prev) => [...prev, result]);

      try {
        if (!isDemoMode && user) {
          await ReviewService.logReview(
            user.uid,
            {
              id: currentCard.itemId,
              term: currentCard.term,
              languageId: currentCard.languageId,
              status: currentCard.status,
              srs: currentCard.srs,
            } as ReviewItem,
            rating,
            responseMs,
            {
              cardType: currentCard.type,
              languageId: currentCard.languageId,
              wasCorrect: rating !== 'AGAIN',
            }
          );
          // Award XP for completing a review card
          awardXP(XP_REWARDS.reviewCard).catch((e) => logSilentFailure('Review.awardXP', e));
        } else {
          // Demo mode runs the same SM-2 algorithm as authenticated reviews
          // (roadmap § 11, 0.6) — an honest trial of the real scheduler.
          const nextState = calculateSM2(rating, currentCard.srs ?? null);
          await updateWordSRS(
            currentCard.term,
            nextState,
            rating === 'AGAIN' ? WordState.LEARNING : WordState.FAMILIAR,
            currentCard.languageId
          );
        }
      } catch (e) {
        console.error(e);
      }

      if (currentCardIndex >= queue.length - 1) {
        const finalResults = [...sessionResults, result];
        const correct = finalResults.filter((r) => r.rating !== 'AGAIN').length;
        const acc = finalResults.length > 0 ? correct / finalResults.length : 0;
        const durationMs = Date.now() - sessionStartRef.current;
        recordReviewSession(Math.round(acc * 100));
        if (user?.uid) {
          checkAndUnlock(user.uid, 'review_session', {
            accuracy: Math.round(acc * 100),
            cardCount: finalResults.length,
            hour: new Date().getHours(),
          });
        }
        trackEvent(ANALYTICS_EVENTS.REVIEW_COMPLETED, {
          languageId: activeLanguageId,
          cardsReviewed: finalResults.length,
          correctCount: correct,
          accuracyPercent: Math.round(acc * 100),
          durationMs,
        });
        clearSavedSession();
        setSessionDurationMs(durationMs);
        setIsFinished(true);
        return;
      }

      setCurrentCardIndex((prev) => prev + 1);
      setIsRevealed(false);
      setCardStartTime(Date.now());
    },
    [
      queue,
      currentCardIndex,
      cardStartTime,
      isDemoMode,
      user,
      updateWordSRS,
      sessionResults,
      recordReviewSession,
      activeLanguageId,
      awardXP,
    ]
  );

  const handleReveal = () => setIsRevealed(true);

  // Keyboard shortcuts for active review session
  useEffect(() => {
    if (!isStarted || isFinished) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (!isRevealed) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleReveal();
        }
        return;
      }
      if (e.key === '1') handleRate('AGAIN');
      else if (e.key === '2') handleRate('HARD');
      else if (e.key === '3') handleRate('GOOD');
      else if (e.key === '4') handleRate('EASY');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isStarted, isFinished, isRevealed, handleRate]);

  const currentCard = queue[currentCardIndex];
  const progress = queue.length > 0 ? (currentCardIndex / queue.length) * 100 : 0;
  const correctCount = sessionResults.filter((r) => r.rating !== 'AGAIN').length;
  const accuracy = sessionResults.length > 0 ? correctCount / sessionResults.length : 0;

  // ── Settings panel ───────────────────────────────────────────────────
  if (showSettings) {
    const allTypes = [
      CardType.FORM_TO_MEANING,
      CardType.MEANING_TO_FORM,
      CardType.CLOZE,
      CardType.PARSE,
      CardType.LEMMA_RECOGNITION,
      CardType.CONTEXT_TRANSLATION,
    ];
    const typeLabels: Record<string, string> = {
      FORM_TO_MEANING: t('review.formToMeaning', 'Form → Meaning'),
      MEANING_TO_FORM: t('review.meaningToForm', 'Meaning → Form'),
      CLOZE: t('review.cloze', 'Cloze Context'),
      PARSE: t('review.parsing', 'Parsing'),
      LEMMA_RECOGNITION: t('review.lemmaRecognition', 'Lemma Recognition'),
      CONTEXT_TRANSLATION: t('review.contextTranslation', 'Context Translation'),
    };

    return (
      <div className="p-6 md:p-12 pt-safe-page max-w-lg mx-auto font-sans min-h-screen">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setShowSettings(false)}
            aria-label={t('review.backToReview', 'Back to review')}
            className="text-muted hover:text-ink transition-colors"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden />
          </button>
          <h2 className="text-xl font-serif font-bold text-ink">
            {t('review.settingsTitle', 'Review Settings')}
          </h2>
        </div>

        <div className="card p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-ink mb-3">
              {t('review.cardTypes', 'Card Types')}
            </h3>
            <div className="space-y-2">
              {allTypes.map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enabledTypes.includes(type)}
                    onChange={() => {
                      const next = settings.enabledTypes.includes(type)
                        ? settings.enabledTypes.filter((t) => t !== type)
                        : [...settings.enabledTypes, type];
                      const updated = {
                        ...settings,
                        enabledTypes: next.length > 0 ? next : [CardType.FORM_TO_MEANING],
                      };
                      setSettings(updated);
                      saveSettings(updated);
                    }}
                    className="w-4 h-4 accent-blue"
                  />
                  <span className="text-[14px] text-ink2">{typeLabels[type] || type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-ink mb-2 block">
              {t('review.cardsPerSession', 'Cards per session')}: {settings.maxCards}
            </label>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={settings.maxCards}
              onChange={(e) => {
                const updated = { ...settings, maxCards: parseInt(e.target.value, 10) };
                setSettings(updated);
                saveSettings(updated);
              }}
              className="w-full accent-blue"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-ink mb-2 block" htmlFor="card-weighting">
              {t('review.cardWeighting', 'Card balance')}
            </label>
            <select
              id="card-weighting"
              value={settings.cardWeighting}
              onChange={(e) => {
                const updated = { ...settings, cardWeighting: e.target.value as CardWeighting };
                setSettings(updated);
                saveSettings(updated);
              }}
              className="w-full p-3 bg-parch2/50 border border-bdr rounded-xl text-ink focus:outline-none focus:border-blue transition-all"
            >
              <option value="adaptive">
                {t('review.weighting.adaptive', 'Adaptive (recommended)')}
              </option>
              <option value="recognition">
                {t('review.weighting.recognition', 'Recognition first')}
              </option>
              <option value="production">
                {t('review.weighting.production', 'Production first')}
              </option>
              <option value="balanced">{t('review.weighting.balanced', 'Balanced mix')}</option>
            </select>
            <p className="text-[12px] text-ink2 mt-1.5 leading-snug">
              {t(
                'review.weighting.help',
                'Adaptive favors recognition for new words and production for words you know well.'
              )}
            </p>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.includeMorphology}
                onChange={() => {
                  const updated = { ...settings, includeMorphology: !settings.includeMorphology };
                  setSettings(updated);
                  saveSettings(updated);
                }}
                className="w-4 h-4 accent-blue"
              />
              <span className="text-[14px] text-ink2">
                {t('review.includeMorphology', 'Include morphology/parsing cards')}
              </span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  // ── Start Screen ─────────────────────────────────────────────────────
  if (!isStarted) {
    return (
      <div className="p-6 md:p-12 pt-safe-page max-w-2xl mx-auto font-sans min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="text-muted hover:text-ink transition-colors flex items-center gap-1"
          >
            <ChevronLeft className="w-5 h-5" /> {t('review.back', 'Back')}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="text-muted hover:text-ink transition-colors flex items-center gap-1"
          >
            <Settings2 className="w-4 h-4" /> {t('review.settings', 'Settings')}
          </button>
        </div>

        {resumable && (
          <div className="card p-5 mb-8 border border-blue/30 bg-blue/5">
            <div className="flex items-start gap-3">
              <History className="w-5 h-5 text-blue mt-0.5 shrink-0" />
              <div className="flex-1">
                <h3 className="text-[15px] font-bold text-ink mb-1">
                  {t('review.resumeTitle', 'Resume your session?')}
                </h3>
                <p className="text-[13px] text-ink2 mb-4">
                  {t(
                    'review.resumeDesc',
                    'You have {{count}} cards left from an unfinished review.',
                    {
                      count: resumable.queue.length - resumable.currentCardIndex,
                    }
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleResume}
                    className="px-4 py-2 bg-blue text-white font-bold rounded-xl text-[14px] hover:bg-blue/90 active:scale-[0.98] transition-all"
                  >
                    {t('review.resume', 'Resume')}
                  </button>
                  <button
                    onClick={handleDiscardResume}
                    className="px-4 py-2 text-ink2 hover:text-ink font-medium text-[14px] transition-colors"
                  >
                    {t('review.startOver', 'Start over')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Brain className="w-8 h-8 text-blue" />
          </div>
          <h2 className="text-[28px] font-serif font-bold text-ink mb-2">
            {t('review.title', 'Review')}
          </h2>
          <p className="text-ink2 text-[15px]">
            {t('review.subtitle', 'Reinforce your vocabulary with spaced repetition')}
          </p>
          {textFilterActive && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue/10 text-blue text-[13px] font-medium rounded-full border border-blue/20">
              <Brain className="w-3.5 h-3.5" />
              {t('review.textFilterActive', 'Filtered to vocabulary from this text')}
            </div>
          )}
        </div>

        {/* Summary */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue" />
          </div>
        )}
        {!isLoading && reviewSummary && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="card p-4 text-center">
              <div className="text-[24px] font-bold text-blue">{reviewSummary.dueCount}</div>
              <div className="text-[11px] text-muted uppercase tracking-widest font-bold">
                {t('review.dueNow', 'Due Now')}
              </div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-[24px] font-bold text-jade">{reviewSummary.reviewedToday}</div>
              <div className="text-[11px] text-muted uppercase tracking-widest font-bold">
                {t('review.reviewedToday', 'Reviewed Today')}
              </div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-[24px] font-bold text-amber">
                {reviewSummary.lastAccuracy !== null
                  ? `${Math.round(reviewSummary.lastAccuracy * 100)}%`
                  : '—'}
              </div>
              <div className="text-[11px] text-muted uppercase tracking-widest font-bold">
                {t('review.accuracy', 'Accuracy')}
              </div>
            </div>
          </div>
        )}

        {/* Weak lemmas */}
        {weakLemmas.length > 0 && (
          <div className="card p-5 mb-6">
            <h3 className="text-[13px] font-bold text-ink mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-red-400" />{' '}
              {t('review.mostFailed', 'Most Failed Words')}
            </h3>
            <div className="space-y-2">
              {weakLemmas.map((w) => (
                <div key={w.lemma} className="flex justify-between text-[14px]">
                  <span className="text-ink2 font-medium">{w.lemma}</span>
                  <span className="text-red-400 font-bold">{w.failCount}x</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weak card types */}
        {weakCardTypes.length > 0 && (
          <div className="card p-5 mb-8">
            <h3 className="text-[13px] font-bold text-ink mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-amber" />{' '}
              {t('review.weakestCardTypes', 'Weakest Card Types')}
            </h3>
            <div className="space-y-2">
              {weakCardTypes.slice(0, 3).map((w) => (
                <div key={w.cardType} className="flex justify-between text-[14px]">
                  <span className="text-ink2">{w.cardType}</span>
                  <span className="text-amber font-bold">
                    {Math.round(w.failRate * 100)}% {t('review.fail', 'fail')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={isLoading || (reviewSummary?.dueCount || 0) === 0}
          className="w-full py-4 bg-blue text-white font-bold rounded-2xl text-[16px] hover:bg-blue/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isLoading
            ? t('review.loading', 'Loading…')
            : (reviewSummary?.dueCount || 0) === 0
              ? t('review.allCaughtUp', 'All caught up!')
              : t('review.startWithCount', 'Start Review ({{count}} cards)', {
                  count: queue.length,
                })}
        </button>
      </div>
    );
  }

  // ── Finished Screen — the scribal colophon (roadmap § 11, 3.5) ───────
  if (isFinished) {
    return (
      <div className="p-6 md:p-12 pt-safe-page max-w-lg mx-auto font-sans min-h-screen flex items-center justify-center">
        <div className="text-center w-full">
          <div className="w-20 h-20 bg-amber/10 ring-1 ring-amber/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <ScrollText className="w-9 h-9 text-amber" />
          </div>
          <h2 className="text-[30px] font-serif font-bold text-ink mb-1 tracking-tight">
            {t('review.colophonTitle', 'Explicit feliciter')}
          </h2>
          <p className="text-ink2 mb-6 italic font-serif">
            {t('review.colophonSubtitle', 'Here ends the session, happily.')}
          </p>

          {/* Colophon line — the scribe's signing-off note, in the manuscript voice. */}
          <div className="card p-4 mb-8 border border-amber/20 bg-parch2/40">
            <p className="text-[14px] text-ink2 font-serif">
              {t('review.colophonLine', '{{count}} cards · {{accuracy}}% · {{duration}}', {
                count: sessionResults.length,
                accuracy: Math.round(accuracy * 100),
                duration: formatDuration(sessionDurationMs),
              })}
            </p>
          </div>

          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-[32px] font-bold text-jade">{correctCount}</div>
              <div className="text-[11px] text-muted uppercase tracking-widest font-bold">
                {t('review.correct', 'Correct')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[32px] font-bold text-red-400">
                {sessionResults.length - correctCount}
              </div>
              <div className="text-[11px] text-muted uppercase tracking-widest font-bold">
                {t('review.needsReview', 'Needs Review')}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[32px] font-bold text-blue">{Math.round(accuracy * 100)}%</div>
              <div className="text-[11px] text-muted uppercase tracking-widest font-bold">
                {t('review.accuracy', 'Accuracy')}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[12px] text-muted mb-8">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-bold uppercase tracking-widest">{t('review.time', 'Time')}</span>
            <span className="text-ink2 font-bold ml-1">{formatDuration(sessionDurationMs)}</span>
          </div>

          <button
            onClick={() => {
              clearSavedSession();
              resumedRef.current = false;
              setIsStarted(false);
              setIsFinished(false);
              setQueue([]);
              setCurrentCardIndex(0);
              setSessionResults([]);
            }}
            className="w-full py-4 bg-blue text-white font-bold rounded-2xl hover:bg-blue/90 active:scale-[0.98] transition-all shadow-lg"
          >
            {t('review.reviewAgain', 'Review Again')}
          </button>
          <button
            onClick={onBack}
            className="w-full py-3 mt-3 text-ink2 hover:text-ink transition-colors font-medium"
          >
            {t('review.backToDashboard', 'Back to Dashboard')}
          </button>
        </div>
      </div>
    );
  }

  // ── Card Screen ────────────────────────────────────────────────────
  if (!currentCard) {
    return (
      <div className="p-8 text-center text-ink2">{t('review.noCards', 'No cards to review.')}</div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto font-sans min-h-screen p-6 md:p-12">
      {/* First-run coaching (self-dismissing, once per device) */}
      <ReviewTutorial />

      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <div
          role="progressbar"
          aria-valuenow={currentCardIndex + 1}
          aria-valuemin={1}
          aria-valuemax={queue.length}
          aria-label={t('review.progressLabel', 'Review progress')}
          className="flex-1 h-2 bg-parch3 rounded-full overflow-hidden"
        >
          <div
            className="h-full bg-blue rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[12px] font-bold text-muted" aria-hidden>
          {currentCardIndex + 1}/{queue.length}
        </span>
      </div>

      <div className="card p-8 shadow-lg">
        {/* Card type badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[10px] uppercase tracking-widest font-bold text-blue bg-blue/10 px-2 py-1 rounded-full">
            {currentCard.type === 'FORM_TO_MEANING'
              ? t('review.formToMeaning', 'Form → Meaning')
              : currentCard.type === 'MEANING_TO_FORM'
                ? t('review.meaningToForm', 'Meaning → Form')
                : currentCard.type === 'CLOZE'
                  ? t('review.clozeShort', 'Cloze')
                  : currentCard.type === 'PARSE'
                    ? t('review.parsingShort', 'Parsing')
                    : currentCard.type === 'LEMMA_RECOGNITION'
                      ? t('review.lemmaRecognitionShort', 'Lemma')
                      : currentCard.type === 'CONTEXT_TRANSLATION'
                        ? t('review.contextTranslationShort', 'Translation')
                        : currentCard.type}
          </span>
          {currentCard.transliteration && (
            <span className="text-[11px] text-muted italic">{currentCard.transliteration}</span>
          )}
        </div>

        {/* Question */}
        {currentCard.context && (
          <p className="text-[13px] text-ink2/60 italic mb-4 leading-relaxed">
            {currentCard.context}
          </p>
        )}
        <div className="flex items-start gap-3 mb-6">
          <h3 className="text-[28px] font-serif font-bold text-ink leading-snug flex-1">
            {currentCard.question}
          </h3>
          {isReviewAudioSupported(currentCard.languageId) &&
            currentCard.question === currentCard.term && (
              <ReviewAudioButton
                text={currentCard.term}
                languageId={currentCard.languageId}
                label={t('review.hearPronunciation', 'Hear pronunciation')}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full text-blue bg-blue/10 hover:bg-blue/20 active:scale-95 transition-all shrink-0 mt-1"
              />
            )}
        </div>

        {/* Morph hint */}
        {currentCard.morphHint && (
          <p className="text-[12px] text-muted font-medium mb-4">{currentCard.morphHint}</p>
        )}

        {/* Answer */}
        <div aria-live="polite" aria-atomic="true">
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-bdr pt-6 mt-6"
              >
                <p className="text-[11px] uppercase tracking-widest text-muted font-bold mb-2">
                  {t('review.answer', 'Answer')}
                </p>
                <div className="flex items-center gap-3">
                  <p className="text-[20px] font-serif font-medium text-jade">
                    {currentCard.answer}
                  </p>
                  {isReviewAudioSupported(currentCard.languageId) &&
                    currentCard.answer === currentCard.term && (
                      <ReviewAudioButton
                        text={currentCard.term}
                        languageId={currentCard.languageId}
                        label={t('review.hearPronunciation', 'Hear pronunciation')}
                      />
                    )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8">
        {!isRevealed ? (
          <div>
            <button
              onClick={handleReveal}
              className="w-full py-4 bg-ink text-parch font-bold rounded-2xl text-[16px] hover:opacity-90 active:scale-[0.98] transition-all shadow-lg"
            >
              {t('review.showAnswer', 'Show Answer')}
            </button>
            <p className="text-center text-[11px] text-muted mt-2">
              {t('review.spaceHint', 'Space / Enter to reveal')}
            </p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleRate('AGAIN')}
                aria-label={t('review.rateAgain', 'Again — repeat soon (press 1)')}
                aria-keyshortcuts="1"
                className="py-4 md:py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl text-[13px] active:scale-95 transition-all flex flex-col items-center gap-1 min-h-[56px]"
              >
                <span>{t('review.again', 'Again')}</span>
                <span className="text-[10px] opacity-60 hidden md:block" aria-hidden>
                  1
                </span>
              </button>
              <button
                onClick={() => handleRate('HARD')}
                aria-label={t('review.rateHard', 'Hard — struggled (press 2)')}
                aria-keyshortcuts="2"
                className="py-4 md:py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl text-[13px] active:scale-95 transition-all flex flex-col items-center gap-1 min-h-[56px]"
              >
                <span>{t('review.hard', 'Hard')}</span>
                <span className="text-[10px] opacity-60 hidden md:block" aria-hidden>
                  2
                </span>
              </button>
              <button
                onClick={() => handleRate('GOOD')}
                aria-label={t('review.rateGood', 'Good — recalled correctly (press 3)')}
                aria-keyshortcuts="3"
                className="py-4 md:py-3 bg-jade-500 hover:bg-jade-600 text-white font-bold rounded-2xl text-[13px] active:scale-95 transition-all flex flex-col items-center gap-1 min-h-[56px]"
              >
                <span>{t('review.good', 'Good')}</span>
                <span className="text-[10px] opacity-60 hidden md:block" aria-hidden>
                  3
                </span>
              </button>
              <button
                onClick={() => handleRate('EASY')}
                aria-label={t('review.rateEasy', 'Easy — recalled instantly (press 4)')}
                aria-keyshortcuts="4"
                className="py-4 md:py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl text-[13px] active:scale-95 transition-all flex flex-col items-center gap-1 min-h-[56px]"
              >
                <span>{t('review.easy', 'Easy')}</span>
                <span className="text-[10px] opacity-60 hidden md:block" aria-hidden>
                  4
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
