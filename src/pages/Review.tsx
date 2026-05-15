import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Award, Loader2, Brain, History, Target, Settings2 } from "lucide-react";
import { useAuth } from "../lib/hooks/useAuth";
import { useKnowledge } from "../lib/hooks/useKnowledge";
import { useActiveLanguage } from "../lib/hooks/useActiveLanguage";
import { WordState } from "../lib/constants/wordStates";
import { ReviewService, ReviewItem } from "../lib/services/reviewService";
import { Rating } from "../lib/srs/sm2";
import { CardType, ReviewCard, generateReviewCards } from "../lib/review/reviewCardFactory";
import { useTranslation } from "react-i18next";

interface ReviewSettings {
  enabledTypes: CardType[];
  maxCards: number;
  includeMorphology: boolean;
}

const DEFAULT_SETTINGS: ReviewSettings = {
  enabledTypes: [CardType.FORM_TO_MEANING, CardType.MEANING_TO_FORM, CardType.CLOZE, CardType.PARSE],
  maxCards: 30,
  includeMorphology: true,
};

const SETTINGS_KEY = 'paleoglossa_review_settings';

function loadSettings(): ReviewSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

function saveSettings(s: ReviewSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export const Review = () => {
  const navigate = useNavigate();
  const { user, isDemoMode } = useAuth();
  const { activeLanguageId } = useActiveLanguage();
  const { knowledge, updateWordSRS } = useKnowledge(activeLanguageId);
  const { t } = useTranslation();
  // Stable ref so the queue-load effect doesn't re-run on every word state change
  const knowledgeRef = useRef(knowledge);
  useLayoutEffect(() => { knowledgeRef.current = knowledge; });


  const [isStarted, setIsStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [queue, setQueue] = useState<ReviewCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [cardStartTime, setCardStartTime] = useState<number>(0);
  const [sessionResults, setSessionResults] = useState<{ lemma: string; rating: Rating; responseMs: number }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ReviewSettings>(loadSettings);

  // Analytics
  const [reviewSummary, setReviewSummary] = useState<{
    dueCount: number; reviewedToday: number; lastAccuracy: number | null; avgResponseMs: number | null;
  } | null>(null);
  const [weakLemmas, setWeakLemmas] = useState<{ lemma: string; failCount: number }[]>([]);
  const [weakCardTypes, setWeakCardTypes] = useState<{ cardType: string; failRate: number; count: number }[]>([]);

  // Load analytics on mount
  useEffect(() => {
    if (!user || isDemoMode) {
      // Demo mode: compute from local knowledge
      const due = Object.entries(knowledgeRef.current).filter(([, info]: [string, any]) => {
        const state = typeof info === 'object' ? info.state : info;
        if (state === WordState.NEW || state === WordState.IGNORED) return false;
        const lang = typeof info === 'object' ? (info as any).languageId || '' : '';
        if (lang && lang !== activeLanguageId) return false;
        if (!info.srs?.nextReview) return true;
        return new Date(info.srs.nextReview) <= new Date();
      });
      setReviewSummary({ dueCount: due.length, reviewedToday: 0, lastAccuracy: null, avgResponseMs: null });
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
        let items: any[] = [];
        if (!isDemoMode && user) {
          items = await ReviewService.getDueItems(user.uid, settings.maxCards, activeLanguageId);
        } else {
          items = Object.entries(knowledgeRef.current)
            .filter(([, info]: [string, any]) => {
              const state = typeof info === "object" ? info.state : info;
              if (state === WordState.NEW || state === WordState.IGNORED || state === WordState.SEEN) return false;
              return true;
            })
            .filter(([, info]: [string, any]) => {
              const lang = typeof info === "object" ? (info as any).languageId || '' : '';
              return !lang || lang === activeLanguageId;
            })
            .filter(([, info]: [string, any]) => {
              if (!info.srs?.nextReview) return true;
              return new Date(info.srs.nextReview) <= new Date();
            })
            .map(([lemma, info]) => ({
              id: lemma,
              term: lemma,
              languageId: (info as any).languageId || activeLanguageId || "unknown",
              userGloss: (info as any).userGloss,
              contexts: (info as any).contexts,
              status: (info as any).state || info,
              srs: info.srs || { interval: 0, ease: 2.5, step: 0, lastReviewed: null, nextReview: new Date().toISOString() }
            }));
        }

        const cards = generateReviewCards(items, {
          enabledTypes: settings.enabledTypes,
          includeMorphology: settings.includeMorphology,
        });
        setQueue(cards.sort(() => Math.random() - 0.5));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadQueue();
  }, [user, isDemoMode, activeLanguageId, settings]);

  const handleStart = () => {
    setIsStarted(true);
    setCardStartTime(Date.now());
  };

  const onBack = () => navigate("/app");

  const handleRate = useCallback(async (rating: Rating) => {
    const currentCard = queue[currentCardIndex];
    if (!currentCard) return;

    const responseMs = Date.now() - cardStartTime;
    const result = { lemma: currentCard.term, rating, responseMs };
    setSessionResults(prev => [...prev, result]);

    try {
      if (!isDemoMode && user) {
        await ReviewService.logReview(user.uid, {
          id: currentCard.itemId,
          term: currentCard.term,
          languageId: currentCard.languageId,
          status: currentCard.status,
          srs: currentCard.srs,
        } as ReviewItem, rating, responseMs, {
          cardType: currentCard.type,
          languageId: currentCard.languageId,
          wasCorrect: rating !== 'AGAIN',
        });
      } else {
        const nextReviewDate = new Date();
        let interval = 0;
        let ease = 2.5;
        let step = 0;

        if (rating === "AGAIN") {
          interval = 0; step = 0;
        } else if (rating === "GOOD") {
          interval = 1; step = 1;
        } else if (rating === "EASY") {
          interval = 4; step = 1;
        } else {
          interval = 1; ease = Math.max(1.3, ease - 0.15);
        }

        nextReviewDate.setDate(nextReviewDate.getDate() + interval);
        await updateWordSRS(currentCard.term, {
          lastReviewed: new Date().toISOString(),
          nextReview: nextReviewDate.toISOString(),
          interval, ease, step
        }, rating === 'AGAIN' ? WordState.LEARNING : WordState.FAMILIAR, currentCard.languageId);
      }
    } catch (e) {
      console.error(e);
    }

    if (currentCardIndex >= queue.length - 1) {
      setIsFinished(true);
      return;
    }

    setCurrentCardIndex(prev => prev + 1);
    setIsRevealed(false);
    setCardStartTime(Date.now());
  }, [queue, currentCardIndex, cardStartTime, isDemoMode, user, updateWordSRS]);

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
  const progress = queue.length > 0 ? ((currentCardIndex) / queue.length * 100) : 0;
  const correctCount = sessionResults.filter(r => r.rating !== 'AGAIN').length;
  const accuracy = sessionResults.length > 0 ? correctCount / sessionResults.length : 0;

  // ── Settings panel ───────────────────────────────────────────────────
  if (showSettings) {
    const allTypes = [CardType.FORM_TO_MEANING, CardType.MEANING_TO_FORM, CardType.CLOZE, CardType.PARSE];
    const typeLabels: Record<string, string> = {
      FORM_TO_MEANING: t('review.formToMeaning', 'Form → Meaning'),
      MEANING_TO_FORM: t('review.meaningToForm', 'Meaning → Form'),
      CLOZE: t('review.cloze', 'Cloze Context'),
      PARSE: t('review.parsing', 'Parsing'),
    };

    return (
      <div className="p-6 md:p-12 max-w-lg mx-auto font-sans min-h-screen">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => setShowSettings(false)} className="text-muted hover:text-ink transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-serif font-bold text-ink">{t('review.settingsTitle', 'Review Settings')}</h2>
        </div>

        <div className="card p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-ink mb-3">{t('review.cardTypes', 'Card Types')}</h3>
            <div className="space-y-2">
              {allTypes.map(type => (
                <label key={type} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enabledTypes.includes(type)}
                    onChange={() => {
                      const next = settings.enabledTypes.includes(type)
                        ? settings.enabledTypes.filter(t => t !== type)
                        : [...settings.enabledTypes, type];
                      const updated = { ...settings, enabledTypes: next.length > 0 ? next : [CardType.FORM_TO_MEANING] };
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
            <label className="text-sm font-bold text-ink mb-2 block">{t('review.cardsPerSession', 'Cards per session')}: {settings.maxCards}</label>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={settings.maxCards}
              onChange={e => {
                const updated = { ...settings, maxCards: parseInt(e.target.value, 10) };
                setSettings(updated);
                saveSettings(updated);
              }}
              className="w-full accent-blue"
            />
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
              <span className="text-[14px] text-ink2">{t('review.includeMorphology', 'Include morphology/parsing cards')}</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  // ── Start Screen ─────────────────────────────────────────────────────
  if (!isStarted) {
    return (
      <div className="p-6 md:p-12 max-w-2xl mx-auto font-sans min-h-screen">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="text-muted hover:text-ink transition-colors flex items-center gap-1">
            <ChevronLeft className="w-5 h-5" /> {t('review.back', 'Back')}
          </button>
          <button onClick={() => setShowSettings(true)} className="text-muted hover:text-ink transition-colors flex items-center gap-1">
            <Settings2 className="w-4 h-4" /> {t('review.settings', 'Settings')}
          </button>
        </div>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Brain className="w-8 h-8 text-blue" />
          </div>
          <h2 className="text-[28px] font-serif font-bold text-ink mb-2">{t('review.title', 'Review')}</h2>
          <p className="text-ink2 text-[15px]">{t('review.subtitle', 'Reinforce your vocabulary with spaced repetition')}</p>
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
              <div className="text-[11px] text-muted uppercase tracking-widest font-bold">{t('review.dueNow', 'Due Now')}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-[24px] font-bold text-jade">{reviewSummary.reviewedToday}</div>
              <div className="text-[11px] text-muted uppercase tracking-widest font-bold">{t('review.reviewedToday', 'Reviewed Today')}</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-[24px] font-bold text-amber">
                {reviewSummary.lastAccuracy !== null ? `${Math.round(reviewSummary.lastAccuracy * 100)}%` : '—'}
              </div>
              <div className="text-[11px] text-muted uppercase tracking-widest font-bold">{t('review.accuracy', 'Accuracy')}</div>
            </div>
          </div>
        )}

        {/* Weak lemmas */}
        {weakLemmas.length > 0 && (
          <div className="card p-5 mb-6">
            <h3 className="text-[13px] font-bold text-ink mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-red-400" /> {t('review.mostFailed', 'Most Failed Words')}
            </h3>
            <div className="space-y-2">
              {weakLemmas.map(w => (
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
              <History className="w-4 h-4 text-amber" /> {t('review.weakestCardTypes', 'Weakest Card Types')}
            </h3>
            <div className="space-y-2">
              {weakCardTypes.slice(0, 3).map(w => (
                <div key={w.cardType} className="flex justify-between text-[14px]">
                  <span className="text-ink2">{w.cardType}</span>
                  <span className="text-amber font-bold">{Math.round(w.failRate * 100)}% {t('review.fail', 'fail')}</span>
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
          {isLoading ? t('review.loading', 'Loading…') : (reviewSummary?.dueCount || 0) === 0 ? t('review.allCaughtUp', 'All caught up!') : t('review.startWithCount', 'Start Review ({{count}} cards)', { count: queue.length })}
        </button>
      </div>
    );
  }

  // ── Finished Screen ─────────────────────────────────────────────────
  if (isFinished) {
    return (
      <div className="p-6 md:p-12 max-w-lg mx-auto font-sans min-h-screen flex items-center justify-center">
        <div className="text-center w-full">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-[28px] font-serif font-bold text-ink mb-2">{t('review.sessionComplete', 'Session Complete!')}</h2>
          <p className="text-ink2 mb-8">{t('review.greatWork', 'Great work! You reviewed {{count}} cards.', { count: sessionResults.length })}</p>

          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-[32px] font-bold text-jade">{correctCount}</div>
              <div className="text-[11px] text-muted uppercase tracking-widest font-bold">{t('review.correct', 'Correct')}</div>
            </div>
            <div className="text-center">
              <div className="text-[32px] font-bold text-red-400">{sessionResults.length - correctCount}</div>
              <div className="text-[11px] text-muted uppercase tracking-widest font-bold">{t('review.needsReview', 'Needs Review')}</div>
            </div>
            <div className="text-center">
              <div className="text-[32px] font-bold text-blue">{Math.round(accuracy * 100)}%</div>
              <div className="text-[11px] text-muted uppercase tracking-widest font-bold">{t('review.accuracy', 'Accuracy')}</div>
            </div>
          </div>

          <button
            onClick={() => { setIsStarted(false); setIsFinished(false); setQueue([]); setCurrentCardIndex(0); setSessionResults([]); }}
            className="w-full py-4 bg-blue text-white font-bold rounded-2xl hover:bg-blue/90 active:scale-[0.98] transition-all shadow-lg"
          >
            {t('review.reviewAgain', 'Review Again')}
          </button>
          <button onClick={onBack} className="w-full py-3 mt-3 text-ink2 hover:text-ink transition-colors font-medium">
            {t('review.backToDashboard', 'Back to Dashboard')}
          </button>
        </div>
      </div>
    );
  }

  // ── Card Screen ────────────────────────────────────────────────────
  if (!currentCard) {
    return <div className="p-8 text-center text-ink2">{t('review.noCards', 'No cards to review.')}</div>;
  }

  return (
    <div className="max-w-2xl mx-auto font-sans min-h-screen p-6 md:p-12">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 bg-parch3 rounded-full overflow-hidden">
          <div className="h-full bg-blue rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-[12px] font-bold text-muted">{currentCardIndex + 1}/{queue.length}</span>
      </div>

      <div className="card p-8 shadow-lg">
        {/* Card type badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[10px] uppercase tracking-widest font-bold text-blue bg-blue/10 px-2 py-1 rounded-full">
            {currentCard.type === 'FORM_TO_MEANING' ? t('review.formToMeaning', 'Form → Meaning') :
             currentCard.type === 'MEANING_TO_FORM' ? t('review.meaningToForm', 'Meaning → Form') :
             currentCard.type === 'CLOZE' ? t('review.clozeShort', 'Cloze') :
             currentCard.type === 'PARSE' ? t('review.parsingShort', 'Parsing') : currentCard.type}
          </span>
          {currentCard.transliteration && (
            <span className="text-[11px] text-muted italic">{currentCard.transliteration}</span>
          )}
        </div>

        {/* Question */}
        {currentCard.context && (
          <p className="text-[13px] text-ink2/60 italic mb-4 leading-relaxed">{currentCard.context}</p>
        )}
        <h3 className="text-[28px] font-serif font-bold text-ink leading-snug mb-6">{currentCard.question}</h3>

        {/* Morph hint */}
        {currentCard.morphHint && (
          <p className="text-[12px] text-muted font-medium mb-4">{currentCard.morphHint}</p>
        )}

        {/* Answer */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-bdr pt-6 mt-6"
            >
              <p className="text-[11px] uppercase tracking-widest text-muted font-bold mb-2">{t('review.answer', 'Answer')}</p>
              <p className="text-[20px] font-serif font-medium text-jade">{currentCard.answer}</p>
            </motion.div>
          )}
        </AnimatePresence>
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
            <p className="text-center text-[11px] text-muted mt-2">{t('review.spaceHint', 'Space / Enter to reveal')}</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => handleRate("AGAIN")}
                className="py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-[13px] active:scale-95 transition-all flex flex-col items-center gap-0.5">
                <span>{t('review.again', 'Again')}</span>
                <span className="text-[10px] opacity-60">1</span>
              </button>
              <button onClick={() => handleRate("HARD")}
                className="py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-[13px] active:scale-95 transition-all flex flex-col items-center gap-0.5">
                <span>{t('review.hard', 'Hard')}</span>
                <span className="text-[10px] opacity-60">2</span>
              </button>
              <button onClick={() => handleRate("GOOD")}
                className="py-3 bg-jade-500 hover:bg-jade-600 text-white font-bold rounded-xl text-[13px] active:scale-95 transition-all flex flex-col items-center gap-0.5">
                <span>{t('review.good', 'Good')}</span>
                <span className="text-[10px] opacity-60">3</span>
              </button>
              <button onClick={() => handleRate("EASY")}
                className="py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-[13px] active:scale-95 transition-all flex flex-col items-center gap-0.5">
                <span>{t('review.easy', 'Easy')}</span>
                <span className="text-[10px] opacity-60">4</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
