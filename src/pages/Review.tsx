import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Award, Sparkles, Loader2, Brain, History, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "../lib/hooks/useAuth";
import { useKnowledge } from "../lib/hooks/useKnowledge";
import { WordState } from "../lib/constants/wordStates";
import { getTokenInfo } from "../lib/data/dictionary";
import { useTranslation } from "react-i18next";
import { ReviewService, ReviewItem } from "../lib/services/reviewService";
import { Rating } from "../lib/srs/sm2";

enum CardType {
  FORM_TO_MEANING = "Form → Meaning",
  MEANING_TO_FORM = "Meaning → Form",
  CLOZE = "Cloze Context",
  LEMMA = "Lemma Check",
  PARSE = "Parsing",
  ROOT = "Root / Etymology"
}

interface ReviewCard {
  item: ReviewItem | any;
  type: CardType;
  question: string;
  answer: string;
  context?: string;
  morphHint?: string;
  transliteration?: string;
}

export const Review = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isDemoMode } = useAuth();
  const { knowledge, stats, updateWordSRS, recordReviewSession } = useKnowledge();
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

  const generateCard = (item: any): ReviewCard | null => {
    const tokenInfo = getTokenInfo(item.term);
    const gloss = item.userGloss || tokenInfo?.gloss || "Definition missing";
    const contexts = item.contexts || [];
    
    // Choose card type based on item progress and available data
    const types: CardType[] = [CardType.FORM_TO_MEANING];
    if (gloss && gloss !== "Definition missing") types.push(CardType.MEANING_TO_FORM);
    if (contexts.length > 0) types.push(CardType.CLOZE);
    
    // For advanced users/languages, add parsing or root
    if (tokenInfo?.morphology && Object.keys(tokenInfo.morphology).length > 2) {
      types.push(CardType.PARSE);
    }

    const type = types[Math.floor(Math.random() * types.length)];
    
    let question = item.term;
    let answer = gloss;
    let context = "";

    switch (type) {
      case CardType.MEANING_TO_FORM:
        question = gloss;
        answer = item.term;
        break;
      case CardType.CLOZE:
        context = contexts[Math.floor(Math.random() * contexts.length)];
        question = context.replace(new RegExp(item.term, "gi"), "[_____]");
        answer = item.term;
        break;
      case CardType.PARSE:
        question = item.term;
        answer = Object.entries(tokenInfo?.morphology || {})
          .filter(([k, v]) => v && k !== 'partOfSpeech')
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        break;
    }

    return {
      item,
      type,
      question,
      answer,
      context,
      morphHint: tokenInfo?.morphology?.partOfSpeech,
      transliteration: tokenInfo?.transliteration
    };
  };

  // Load Review Queue
  useEffect(() => {
    const loadQueue = async () => {
      setIsLoading(true);
      try {
        let items: any[] = [];
        if (!isDemoMode && user) {
          items = await ReviewService.getDueItems(user.uid, 50);
        } else {
          // Local fallback
          items = Object.entries(knowledgeRef.current)
            .filter(([, info]: [string, any]) => {
              const state = typeof info === "object" ? info.state : info;
              if (state === WordState.NEW || state === WordState.IGNORED || state === WordState.SEEN) return false;
              if (!info.srs?.nextReview) return true;
              return new Date(info.srs.nextReview) <= new Date();
            })
            .map(([lemma, info]) => ({
              id: lemma,
              term: lemma,
              languageId: (info as any).languageId || "unknown",
              userGloss: (info as any).userGloss,
              contexts: (info as any).contexts,
              status: (info as any).state || info,
              srs: info.srs || { interval: 0, ease: 2.5, step: 0, lastReviewed: null, nextReview: new Date().toISOString() }
            }));
        }

        const cards = items.map(item => generateCard(item)).filter(Boolean) as ReviewCard[];
        // Shuffle
        setQueue(cards.sort(() => Math.random() - 0.5));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadQueue();
  }, [user, isDemoMode]);

  const handleStart = () => {
    setIsStarted(true);
    setCardStartTime(Date.now());
  };

  const onBack = () => navigate("/app");

  const handleRate = useCallback(async (rating: Rating) => {
    const currentCard = queue[currentCardIndex];
    if (!currentCard) return;

    const responseMs = Date.now() - cardStartTime;
    const result = { lemma: currentCard.item.term, rating, responseMs };
    setSessionResults(prev => [...prev, result]);

    try {
      if (!isDemoMode && user) {
        await ReviewService.logReview(user.uid, currentCard.item, rating, responseMs);
      } else {
        // Local logic implementation (simplified SM-2 matches what updateWordSRS expects)
        // I'll reuse the updateWordSRS but it doesn't log history as robustly
        // In a real app we'd keep local logs too
        const state = currentCard.item.srs;
        const nextReviewDate = new Date();
        let interval = state.interval || 0;
        let ease = state.ease || 2.5;
        let step = state.step || 0;

        if (rating === "AGAIN") {
          interval = 0; step = 0;
        } else if (rating === "GOOD") {
          interval = interval === 0 ? 1 : Math.ceil(interval * ease);
          step++;
        } else if (rating === "EASY") {
          interval = interval === 0 ? 4 : Math.ceil(interval * ease * 1.3);
          step++;
        } else {
          interval = Math.max(1, Math.ceil(interval * 1.2));
          ease = Math.max(1.3, ease - 0.15);
        }

        nextReviewDate.setDate(nextReviewDate.getDate() + interval);
        const updatedSRS = {
          lastReviewed: new Date().toISOString(),
          nextReview: nextReviewDate.toISOString(),
          interval,
          ease,
          step
        };
        updateWordSRS(currentCard.item.term, updatedSRS, WordState.LEARNING);
      }
    } catch (e) {
      console.error(e);
    }

    if (currentCardIndex < queue.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsRevealed(false);
      setCardStartTime(Date.now());
    } else {
      const accurateCount = [...sessionResults, result].filter(r => r.rating !== "AGAIN").length;
      const accuracy = Math.round((accurateCount / queue.length) * 100);
      recordReviewSession(accuracy);
      setIsFinished(true);
    }
  }, [queue, currentCardIndex, cardStartTime, isDemoMode, user, sessionResults, updateWordSRS, recordReviewSession]);

  // Keyboard support
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isStarted || isFinished) return;
      if (!isRevealed) {
        if (e.key === " " || e.key === "Enter") setIsRevealed(true);
        return;
      }
      if (e.key === "1") handleRate("AGAIN");
      if (e.key === "2") handleRate("HARD");
      if (e.key === "3") handleRate("GOOD");
      if (e.key === "4") handleRate("EASY");
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isStarted, isFinished, isRevealed, handleRate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-parch">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue" />
          <p className="font-serif italic text-muted">Preparing your review deck...</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="p-8 md:p-12 max-w-4xl mx-auto font-sans min-h-screen flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-12 w-full shadow-2xl relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gold/5 rounded-full blur-3xl" />
          
          <div className="w-20 h-20 bg-blue/10 text-blue rounded-[24px] rotate-3 flex items-center justify-center mx-auto mb-8 shadow-inner">
            <Brain className="w-10 h-10" />
          </div>
          
          <h2 className="text-[42px] font-serif font-bold text-ink mb-2">
            {t("review.session", "SRS Review")}
          </h2>
          <p className="text-ink2 mb-10 max-w-md mx-auto leading-relaxed">
            {queue.length === 0
              ? t("review.noCards", "Your memory is fresh. Read more to encounter new words and grow your library.")
              : t("review.reinforce", `Your memory is fading for ${queue.length} words. Revisit them now to lock them into long-term memory.`, { count: queue.length })}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-12 text-left">
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-bdr/30 shadow-sm transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-4 h-4 text-ruby" />
                <span className="eyebrow text-[10px] text-muted">Due Today</span>
              </div>
              <div className="text-[32px] font-bold text-ink">
                {queue.length}
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-bdr/30 shadow-sm transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="eyebrow text-[10px] text-muted">Awaiting Mastery</span>
              </div>
              <div className="text-[32px] font-bold text-ink">
                {Object.values(knowledge).filter((i: any) => i.state === WordState.LEARNING).length}
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-bdr/30 shadow-sm transition-transform hover:-translate-y-1 md:col-span-1 col-span-2">
              <div className="flex items-center gap-3 mb-2">
                <History className="w-4 h-4 text-blue" />
                <span className="eyebrow text-[10px] text-muted">Accuracy Trend</span>
              </div>
              <div className="text-[32px] font-bold text-ink">
                {stats?.lastAccuracy != null ? `${stats.lastAccuracy}%` : "—"}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleStart}
              disabled={queue.length === 0}
              className="w-full bg-ink text-parch2 py-5 rounded-[24px] font-bold text-[20px] shadow-xl hover:bg-ink/90 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed group border-b-4 border-black/20"
            >
              <span className="flex items-center justify-center gap-3">
                {t("review.startSession", "Begin Recitation")}
                <ChevronLeft className="w-5 h-5 rotate-180" />
              </span>
            </button>
            {queue.length === 0 ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate("/app/library")}
                  className="text-blue font-bold text-[14px] hover:text-blue/80 transition-colors"
                >
                  Browse the Library
                </button>
                <button
                  onClick={() => navigate("/app/import")}
                  className="text-muted font-bold text-[14px] hover:text-ink transition-colors"
                >
                  Import a Text
                </button>
              </div>
            ) : (
              <button
                onClick={onBack}
                className="text-muted font-bold text-[14px] hover:text-ink transition-colors"
              >
                {t("review.maybeLater", "Return to Library")}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (isFinished) {
    const accuracy = Math.round((sessionResults.filter(r => r.rating !== "AGAIN").length / sessionResults.length) * 100);
    const avgResponse = Math.round(sessionResults.reduce((a, b) => a + b.responseMs, 0) / sessionResults.length / 100) / 10;
    
    return (
      <div className="p-8 md:p-12 max-w-3xl mx-auto font-sans min-h-screen flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card p-12 w-full bg-ink text-parch2 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Award className="w-48 h-48" />
          </div>

          <div className="w-16 h-16 bg-gold/20 text-gold rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-8 h-8" />
          </div>
          
          <h2 className="text-[42px] font-serif font-bold mb-2">
            {t("review.complete", "Mastery Progressed")}
          </h2>
          <p className="text-parch/60 mb-12 max-w-md mx-auto">
            Your persistence strengthens the synaptic pathways of your ancient library.
          </p>

          <div className="grid grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-[48px] font-bold text-gold leading-none mb-2">{accuracy}%</div>
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-50">Accuracy</div>
            </div>
            <div>
              <div className="text-[48px] font-bold text-parch2 leading-none mb-2">{sessionResults.length}</div>
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-50">Cards</div>
            </div>
            <div>
              <div className="text-[48px] font-bold text-parch2 leading-none mb-2">{avgResponse}s</div>
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-50">Avg Speed</div>
            </div>
          </div>

          <div className="bg-parch/5 rounded-2xl p-6 mb-12 text-left">
            <h4 className="text-[11px] uppercase tracking-widest font-bold mb-4 opacity-40">Session Breakdown</h4>
            <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-4">
              {['AGAIN', 'HARD', 'GOOD', 'EASY'].map(r => {
                const count = sessionResults.filter(res => res.rating === r).length;
                const pct = (count / sessionResults.length) * 100;
                if (pct === 0) return null;
                return (
                  <div 
                    key={r}
                    style={{ width: `${pct}%` }} 
                    className={cn(
                      "h-full",
                      r === 'AGAIN' ? 'bg-ruby' : r === 'HARD' ? 'bg-amber' : r === 'GOOD' ? 'bg-green-500' : 'bg-blue'
                    )}
                  />
                );
              })}
            </div>
            <div className="grid grid-cols-4 gap-2">
               {['AGAIN', 'HARD', 'GOOD', 'EASY'].map(r => (
                 <div key={r} className="flex flex-col">
                   <span className="text-[10px] font-bold opacity-30">{r}</span>
                   <span className="text-[14px] font-bold">{sessionResults.filter(res => res.rating === r).length}</span>
                 </div>
               ))}
            </div>
          </div>

          <button
            onClick={onBack}
            className="w-full bg-parch text-ink py-4 rounded-[20px] font-bold text-[18px] hover:bg-white transition-all shadow-xl active:scale-95"
          >
            {t("review.backDashboard", "Finish Session")}
          </button>
        </motion.div>
      </div>
    );
  }

  const currentCard = queue[currentCardIndex];
  const progress = ((currentCardIndex + 1) / queue.length) * 100;

  return (
    <div className="min-h-screen bg-parch flex flex-col overflow-hidden font-sans">
      {/* Dynamic Header */}
      <div className="h-20 bg-white/80 backdrop-blur-md border-b border-bdr px-8 flex items-center justify-between sticky top-0 z-50">
        <button
          onClick={onBack}
          className="text-muted hover:text-ink flex items-center gap-2 font-bold text-[13px] transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          {t("review.quitSession", "Exit Deck")}
        </button>
        
        <div className="flex-1 max-w-xl mx-12">
          <div className="flex justify-between text-[9px] font-black text-muted/60 uppercase tracking-[0.2em] mb-2">
            <span>Progressing Memory</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-parch3 rounded-full overflow-hidden shadow-inner">
            <motion.div
              layoutId="progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-ink"
            />
          </div>
        </div>

        <div className="w-32 flex justify-end">
          <div className="px-3 py-1 bg-ink text-parch2 rounded-full text-[11px] font-bold flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
             Deck Active
          </div>
        </div>
      </div>

      {/* Card Arena */}
      <main className="flex-1 flex items-center justify-center p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.item.term + currentCard.type + isRevealed}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            onClick={() => !isRevealed && setIsRevealed(true)}
            className={cn(
              "card w-full max-w-3xl min-h-[500px] flex flex-col items-center justify-center p-16 shadow-2xl relative transition-all duration-500",
              isRevealed ? "ring-2 ring-gold/10" : ""
            )}
          >
            {/* Card Metadata */}
            <div className="absolute top-10 left-10 flex items-center gap-4">
              <div className="px-3 py-1.5 bg-ink text-parch text-[9px] font-black uppercase tracking-[0.15em] rounded-md">
                {currentCard.type}
              </div>
              {currentCard.morphHint && (
                <div className="text-[10px] font-bold text-muted/50 italic border-l border-bdr pl-4">
                   {currentCard.morphHint}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center text-center w-full">
              {/* Question Zone */}
              <div className="mb-12 w-full">
                <h3 
                  className={cn(
                    "font-serif text-ink leading-tight",
                    currentCard.question.length > 20 ? "text-[32px] md:text-[42px]" : "text-[56px] md:text-[72px]",
                    /[\u0590-\u05FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFB4F\u{13000}-\u{1342E}]/u.test(currentCard.question) ? "font-hebrew text-right" : ""
                  )}
                  dir={/[\u0590-\u05FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFB4F\u{13000}-\u{1342E}]/u.test(currentCard.question) ? "rtl" : "ltr"}
                >
                  {currentCard.question}
                </h3>
                {currentCard.transliteration && !isRevealed && (
                  <div className="mt-4 text-muted text-[13px] font-mono italic opacity-40">
                    {currentCard.transliteration}
                  </div>
                )}
              </div>

              {/* Reveal Zone */}
              <AnimatePresence>
                {isRevealed && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full"
                  >
                    <div className="w-16 h-1 bg-gold/30 mx-auto mb-10 rounded-full" />
                    
                    <div 
                      className={cn(
                        "text-[28px] md:text-[36px] font-body text-blue font-bold leading-snug drop-shadow-sm",
                        /[\u0590-\u05FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFB4F\u{13000}-\u{1342E}]/u.test(currentCard.answer) ? "font-hebrew text-right" : ""
                      )}
                      dir={/[\u0590-\u05FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFB4F\u{13000}-\u{1342E}]/u.test(currentCard.answer) ? "rtl" : "ltr"}
                    >
                      {currentCard.answer}
                    </div>

                    {currentCard.context && currentCard.type !== CardType.CLOZE && (
                      <div className="mt-12 p-6 bg-parch/30 border border-bdr/20 rounded-2xl text-[14px] leading-relaxed italic text-ink2 max-w-lg mx-auto border-l-4 border-l-gold/30">
                        "{currentCard.context}"
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {!isRevealed && (
              <div className="absolute bottom-12 flex flex-col items-center gap-3">
                 <div className="px-5 py-2.5 bg-blue text-white rounded-full text-[13px] font-bold shadow-xl animate-bounce">
                    Tap or Space to reveal
                 </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Control Deck */}
      <div className="h-[140px] bg-white border-t border-bdr p-6 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
        <div className="max-w-3xl mx-auto h-full flex items-center justify-center">
          {!isRevealed ? (
            <button
              onClick={() => setIsRevealed(true)}
              className="w-full max-w-md bg-ink text-parch2 h-16 rounded-[20px] font-bold text-[18px] shadow-2xl hover:bg-ink/90 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <Sparkles className="w-5 h-5 text-gold" />
              {t("review.showAnswer", "Reveal Ancient Secrets")}
            </button>
          ) : (
            <div className="grid grid-cols-4 gap-4 w-full">
              <button
                onClick={() => handleRate("AGAIN")}
                className="flex flex-col gap-2 group"
              >
                <div className="h-16 bg-red-50 border-2 border-red-100 text-red-600 rounded-2xl flex items-center justify-center font-bold text-[15px] group-hover:bg-red-600 group-hover:text-white group-hover:border-red-600 transition-all shadow-sm">
                  {t("review.again", "AGAIN")}
                </div>
                <div className="flex justify-between px-2 text-[9px] font-black text-muted/60 uppercase">
                  <span>Fail</span>
                  <span>{"<"}1m</span>
                </div>
              </button>
              <button
                onClick={() => handleRate("HARD")}
                className="flex flex-col gap-2 group"
              >
                <div className="h-16 bg-amber-50 border-2 border-amber-100 text-amber-600 rounded-2xl flex items-center justify-center font-bold text-[15px] group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-all shadow-sm">
                  {t("review.hard", "HARD")}
                </div>
                <div className="flex justify-between px-2 text-[9px] font-black text-muted/60 uppercase">
                  <span>Retain</span>
                  <span>1-2d</span>
                </div>
              </button>
              <button
                onClick={() => handleRate("GOOD")}
                className="flex flex-col gap-2 group"
              >
                <div className="h-16 bg-green-50 border-2 border-green-100 text-green-600 rounded-2xl flex items-center justify-center font-bold text-[15px] group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all shadow-sm">
                  {t("review.good", "GOOD")}
                </div>
                <div className="flex justify-between px-2 text-[9px] font-black text-muted/60 uppercase">
                  <span>Learned</span>
                  <span>4-6d</span>
                </div>
              </button>
              <button
                onClick={() => handleRate("EASY")}
                className="flex flex-col gap-2 group"
              >
                <div className="h-16 bg-blue-50 border-2 border-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold text-[15px] group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-sm">
                  {t("review.easy", "EASY")}
                </div>
                <div className="flex justify-between px-2 text-[9px] font-black text-muted/60 uppercase">
                  <span>Mastered</span>
                  <span>10-14d</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

