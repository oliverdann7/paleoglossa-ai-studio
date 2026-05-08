import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKnowledge, WordInfo, SRSData } from '../lib/hooks/useKnowledge';
import { WordState } from '../lib/constants/wordStates';

enum CardType {
  FORM_TO_MEANING,
  MEANING_TO_FORM,
  PARSE,
  CLOZE,
  LEMMA
}

interface ReviewCard {
  lemma: string;
  wordInfo: WordInfo;
  type: CardType;
  question: string;
  answer: string;
  context?: string;
  morphHint?: string;
}

export const Review = () => {
  const navigate = useNavigate();
  const onBack = () => navigate('/app');
  const { knowledge, updateWordSRS } = useKnowledge();
  const [isStarted, setIsStarted] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [sessionResults, setSessionResults] = useState<{ lemma: string, rating: string }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // 1. Identify words due for review
  const queue = useMemo(() => {
    const words = Object.entries(knowledge).filter(([, info]) => {
      const i = typeof info === 'object' ? (info as any) : { state: info };
      if (i.state !== WordState.LEARNING && i.state !== WordState.FAMILIAR) return false;
      if (!i.srs?.nextReview) return true;
      return new Date(i.srs.nextReview) <= new Date();
    });

    return words.map(([lemma, info]) => {
      const wordInfo = typeof info === 'object' ? info : { state: info, addedAt: new Date().toISOString() };
      const gloss = (wordInfo as any).gloss as string | undefined;

      // Only generate FORM_TO_MEANING cards when we have a gloss stored
      const type = gloss ? CardType.FORM_TO_MEANING : CardType.LEMMA;

      const question = lemma;
      const answer = gloss || '(no gloss stored — read the text to record definitions)';

      return {
        lemma,
        wordInfo,
        type,
        question,
        answer,
      } as ReviewCard;
    }).sort(() => Math.random() - 0.5);
  }, [knowledge]);

  const currentCard = queue[currentCardIndex];

  const handleRate = useCallback((rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY') => {
    if (!currentCard) return;
    
    const srs = currentCard.wordInfo.srs || {
      lastReviewed: null,
      nextReview: null,
      interval: 0,
      easing: 2.5,
      step: 0
    };

    let newInterval = srs.interval;
    let newEasing = srs.easing;
    let newStep = srs.step + 1;
    let newState = currentCard.wordInfo.state;

    if (rating === 'AGAIN') {
      newInterval = 0;
      newStep = Math.max(0, srs.step - 1);
      newState = WordState.LEARNING;
    } else if (rating === 'HARD') {
      newInterval = Math.max(1, srs.interval * 1.2);
      newEasing = Math.max(1.3, srs.easing - 0.15);
      newState = WordState.LEARNING;
    } else if (rating === 'GOOD') {
      newInterval = srs.interval === 0 ? 1 : srs.interval * srs.easing;
      if (newStep >= 4 && newState === WordState.LEARNING) newState = WordState.FAMILIAR;
      if (newStep >= 9) newState = WordState.KNOWN;
    } else if (rating === 'EASY') {
      newInterval = srs.interval === 0 ? 4 : srs.interval * srs.easing * 1.3;
      if (newState === WordState.LEARNING) newState = WordState.FAMILIAR;
      else if (newState === WordState.FAMILIAR) newState = WordState.KNOWN;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + Math.ceil(newInterval));

    const updatedSRS: SRSData = {
      lastReviewed: new Date().toISOString(),
      nextReview: nextReview.toISOString(),
      interval: newInterval,
      easing: newEasing,
      step: newStep
    };

    updateWordSRS(currentCard.lemma, updatedSRS, newState);
    setSessionResults(prev => [...prev, { lemma: currentCard.lemma, rating }]);

    if (currentCardIndex < queue.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsRevealed(false);
    } else {
      setIsFinished(true);
    }
  }, [currentCard, currentCardIndex, queue.length, updateWordSRS]);

  // Keyboard support for ratings 1, 2, 3, 4
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isStarted || isFinished) return;
      if (!isRevealed) {
        if (e.key === ' ' || e.key === 'Enter') setIsRevealed(true);
        return;
      }
      if (e.key === '1') handleRate('AGAIN');
      if (e.key === '2') handleRate('HARD');
      if (e.key === '3') handleRate('GOOD');
      if (e.key === '4') handleRate('EASY');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isStarted, isFinished, isRevealed, handleRate]);

  if (!isStarted) {
    return (
      <div className="p-8 md:p-12 max-w-4xl mx-auto font-sans min-h-screen flex flex-col items-center justify-center text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-12 w-full">
           <div className="w-16 h-16 bg-blue/10 text-blue rounded-full flex items-center justify-center mx-auto mb-6">
              <Award className="w-8 h-8" />
           </div>
          <h2 className="text-[36px] font-serif font-bold text-ink mb-2">SRS Review Session</h2>
          <p className="text-ink2 mb-10 max-w-md mx-auto">
            {queue.length === 0 
              ? "No cards due. Read more to find new words to learn."
              : `Reinforce ${queue.length} words due for review. We prioritize words you're still mastering.`
            }
          </p>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-left">
              <div className="bg-parch p-4 rounded-xl border border-bdr/40">
                <div className="text-[24px] font-bold text-blue">{queue.length}</div>
                <div className="eyebrow text-[9px] text-muted">In Queue</div>
              </div>
              <div className="bg-parch p-4 rounded-xl border border-bdr/40">
                <div className="text-[24px] font-bold text-amber">12</div>
                <div className="eyebrow text-[9px] text-muted">Critical</div>
              </div>
              <div className="bg-parch p-4 rounded-xl border border-bdr/40">
                <div className="text-[24px] font-bold text-ink">247</div>
                <div className="eyebrow text-[9px] text-muted">New Today</div>
              </div>
              <div className="bg-parch p-4 rounded-xl border border-bdr/40">
                <div className="text-[24px] font-bold text-green-600">85%</div>
                <div className="eyebrow text-[9px] text-muted">Accuracy</div>
              </div>
           </div>

           <div className="flex flex-col gap-4">
              <button 
                onClick={() => setIsStarted(true)}
                disabled={queue.length === 0}
                className="w-full bg-blue text-white py-4 rounded-2xl font-bold text-[18px] hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                Start Session
              </button>
              <button onClick={onBack} className="text-muted font-bold text-[14px] hover:text-ink">Maybe later</button>
           </div>
           
           <div className="mt-12 pt-8 border-t border-bdr/20 flex justify-center gap-6">
              <div className="flex items-center gap-2 text-[11px] font-bold text-muted">
                 <span className="w-6 h-6 bg-red-100 text-red-500 rounded flex items-center justify-center font-mono">1</span>
                 Again
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-muted">
                 <span className="w-6 h-6 bg-amber-100 text-amber-500 rounded flex items-center justify-center font-mono">2</span>
                 Hard
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-muted">
                 <span className="w-6 h-6 bg-green-100 text-green-500 rounded flex items-center justify-center font-mono">3</span>
                 Good
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-muted">
                 <span className="w-6 h-6 bg-blue-100 text-blue-500 rounded flex items-center justify-center font-mono">4</span>
                 Easy
              </div>
           </div>
        </motion.div>
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="p-8 md:p-12 max-w-2xl mx-auto font-sans min-h-screen flex flex-col items-center justify-center text-center">
         <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card p-12 w-full">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-[32px] font-serif font-bold text-ink mb-2">Session Complete!</h2>
            <p className="text-ink2 mb-10">You've moved {sessionResults.length} words closer to mastery.</p>
            
            <div className="flex justify-center gap-2 mb-10 overflow-hidden">
               {sessionResults.map((r, i) => (
                 <div key={i} className={cn(
                   "w-2 h-2 rounded-full",
                   r.rating === 'AGAIN' ? "bg-red-400" : r.rating === 'HARD' ? "bg-amber-400" : r.rating === 'GOOD' ? "bg-green-400" : "bg-blue-400"
                 )} />
               ))}
            </div>

            <button 
              onClick={onBack}
              className="w-full bg-blue text-white py-4 rounded-full font-bold text-[16px] hover:shadow-lg transition-all"
            >
              Back to Dashboard
            </button>
         </motion.div>
      </div>
    );
  }

  const progress = ((currentCardIndex + 1) / queue.length) * 100;

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-16 border-b border-bdr px-6 flex items-center justify-between bg-parch2">
         <button onClick={onBack} className="text-ink3 hover:text-blue flex items-center gap-2 font-bold text-[14px]">
            <ChevronLeft className="w-5 h-5" />
            Quit Session
         </button>
         <div className="flex-1 max-w-md mx-8">
            <div className="flex justify-between text-[10px] font-bold text-muted uppercase tracking-widest mb-1">
               <span>Card {currentCardIndex + 1} of {queue.length}</span>
               <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full bg-parch3 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }} 
                 className="h-full bg-blue" 
               />
            </div>
         </div>
         <div className="w-24" /> {/* Spacer */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6 bg-parch">
         <AnimatePresence mode="wait">
           <motion.div 
             key={currentCard.lemma + isRevealed}
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: -20 }}
             onClick={() => !isRevealed && setIsRevealed(true)}
             className="card w-full max-w-xl h-[400px] flex flex-col items-center justify-center p-12 cursor-pointer shadow-xl relative overflow-hidden"
           >
              <div className="absolute top-6 left-6 text-[10px] font-mono text-muted uppercase tracking-widest bg-blue/5 px-2 py-1 rounded">
                {CardType[currentCard.type].replace(/_/g, ' ')}
              </div>
              
              <div className="flex flex-col items-center text-center">
                 <h3 className="text-[64px] font-serif font-light text-ink leading-none mb-4">
                   {currentCard.question}
                 </h3>
                 {currentCard.morphHint && (
                   <div className="px-3 py-1 bg-blue/10 text-blue rounded-full text-[12px] font-bold mb-8">
                     {currentCard.morphHint}
                   </div>
                 )}

                 {isRevealed && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
                       <div className="w-12 h-px bg-bdr/30 mb-8" />
                       <div className="text-[24px] font-body text-blue font-medium leading-snug">
                         {currentCard.answer}
                       </div>
                    </motion.div>
                 )}
              </div>

              {!isRevealed && (
                <div className="absolute bottom-10 text-[12px] font-bold text-muted animate-pulse">
                  Tap to Reveal Meaning
                </div>
              )}
           </motion.div>
         </AnimatePresence>
      </div>

      {/* Footer / Buttons */}
      <div className="h-[120px] bg-parch2 border-t border-bdr p-6">
         <div className="max-w-2xl mx-auto h-full flex items-center justify-center">
            {!isRevealed ? (
               <button 
                onClick={() => setIsRevealed(true)}
                className="bg-blue text-white px-10 py-4 rounded-2xl font-bold hover:shadow-lg transition-all active:scale-95"
               >
                 Show Answer
               </button>
            ) : (
               <div className="grid grid-cols-4 gap-4 w-full">
                  <button onClick={() => handleRate('AGAIN')} className="flex flex-col items-center gap-1 group">
                     <div className="w-full h-14 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center justify-center font-bold text-[14px] group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
                        AGAIN
                     </div>
                     <span className="text-[9px] font-bold text-muted uppercase tracking-tighter">{"<"}1m</span>
                  </button>
                  <button onClick={() => handleRate('HARD')} className="flex flex-col items-center gap-1 group">
                     <div className="w-full h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-xl flex items-center justify-center font-bold text-[14px] group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                        HARD
                     </div>
                     <span className="text-[9px] font-bold text-muted uppercase tracking-tighter">1d</span>
                  </button>
                  <button onClick={() => handleRate('GOOD')} className="flex flex-col items-center gap-1 group">
                     <div className="w-full h-14 bg-green-50 border border-green-200 text-green-600 rounded-xl flex items-center justify-center font-bold text-[14px] group-hover:bg-green-500 group-hover:text-white transition-all shadow-sm">
                        GOOD
                     </div>
                     <span className="text-[9px] font-bold text-muted uppercase tracking-tighter">4d</span>
                  </button>
                  <button onClick={() => handleRate('EASY')} className="flex flex-col items-center gap-1 group">
                     <div className="w-full h-14 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl flex items-center justify-center font-bold text-[14px] group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                        EASY
                     </div>
                     <span className="text-[9px] font-bold text-muted uppercase tracking-tighter">7d</span>
                  </button>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};
