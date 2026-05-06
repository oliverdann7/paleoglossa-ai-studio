import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Check, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const dummyReviewQueue = [
  { id: 1, term: 'λόγος', definition: 'word, reason, account', context: 'Ἐν ἀρχῇ ἦν ὁ *λόγος*...', language: 'Greek', status: 'Learning' },
  { id: 2, term: 'בְּרֵאשִׁית', definition: 'in the beginning', context: '*בְּרֵאשִׁית* בָּרָא אֱלֹהִים...', language: 'Hebrew', status: 'New' },
  { id: 3, term: 'אֱלֹהִים', definition: 'God', context: 'בְּרֵאשִׁית בָּרָא *אֱלֹהִים*...', language: 'Hebrew', status: 'Learning' },
  { id: 4, term: 'θεός', definition: 'God', context: 'καὶ ὁ *θεὸς* ἦν ὁ λόγος.', language: 'Greek', status: 'Familiar' },
];

export const Review = () => {
  const [queue, setQueue] = useState(dummyReviewQueue);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  const currentCard = queue[currentIndex];
  const progress = ((dummyReviewQueue.length - queue.length + currentIndex) / dummyReviewQueue.length) * 100;

  const handleNext = (grade: number) => {
    // In a real app we'd update SRS intervals here based on grade
    // using the grade parameter:
    void grade;
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < queue.length - 1) {
         // Keep in queue, move next
         setCurrentIndex(prev => prev + 1);
      } else {
         // Finished queue 
         setSessionComplete(true);
      }
    }, 150);
  };

  const resetSession = () => {
    setQueue(dummyReviewQueue);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
  };

  if (sessionComplete) {
    return (
      <div className="max-w-4xl flex flex-col items-center justify-center min-h-[80vh] mx-auto py-12 px-8 text-center text-obsidian-900 dark:text-vellum-100">
        <div className="w-24 h-24 bg-green-500/10 text-green-600 rounded-full flex items-center justify-center mb-8 mx-auto shadow-lg shadow-green-500/20">
          <Check className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-serif font-bold tracking-tight mb-4">Session Complete!</h1>
        <p className="text-xl opacity-60 mb-12">You reviewed {dummyReviewQueue.length} items. Keep up the good work!</p>
        <button 
          onClick={resetSession}
          className="flex items-center gap-2 px-8 py-4 bg-obsidian-900 text-vellum-50 dark:bg-vellum-100 dark:text-obsidian-950 font-bold rounded-2xl transition-transform hover:scale-105"
        >
          <RotateCcw className="w-5 h-5" />
          Review Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-8 min-h-screen flex flex-col items-center text-obsidian-900 dark:text-vellum-100 relative">
      <button 
        onClick={() => setSessionComplete(true)}
        className="absolute top-8 right-8 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 opacity-40 hover:opacity-100 transition-opacity"
      >
        <X className="w-6 h-6" />
      </button>
      
      <div className="w-full flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 opacity-60 font-bold tracking-widest uppercase text-xs">
          <Brain className="w-4 h-4" />
          <span>Daily Review</span>
        </div>
        <div className="text-xs font-bold font-mono opacity-60">
          {dummyReviewQueue.length - queue.length + currentIndex + 1} / {dummyReviewQueue.length}
        </div>
      </div>

      <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden mb-12">
        <motion.div 
          className="h-full bg-gold-500" 
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex + (isFlipped ? '-flipped' : '-front')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl relative"
        >
          <div 
            onClick={() => !isFlipped && setIsFlipped(true)}
            className={cn(
              "w-full bg-white dark:bg-obsidian-900 border border-black/5 dark:border-white/5 rounded-[2rem] p-12 min-h-[400px] flex flex-col justify-center items-center text-center shadow-lg transition-transform",
              !isFlipped && "cursor-pointer hover:border-black/20 dark:hover:border-white/20 hover:scale-[1.01]"
            )}
          >
            {/* Top Indicator */}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-center opacity-40 text-sm font-bold">
              <span>{currentCard.language}</span>
              <span className="uppercase tracking-widest text-[10px]">{currentCard.status}</span>
            </div>

            <h2 className="text-7xl font-serif text-obsidian-900 dark:text-vellum-100 leading-tight mb-8">
              {currentCard.term}
            </h2>

            {isFlipped ? (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 mt-4 space-y-6">
                <div className="h-px w-24 bg-black/10 dark:bg-white/10" />
                <p className="text-2xl text-gold-600 dark:text-gold-400 font-serif font-medium">{currentCard.definition}</p>
                {currentCard.context && (
                  <p className="text-lg opacity-60 font-serif italic max-w-md" dangerouslySetInnerHTML={{__html: currentCard.context.replace(/\*(.*?)\*/g, '<span class="text-obsidian-900 dark:text-vellum-50 not-italic font-bold">$1</span>')}} />
                )}
              </div>
            ) : (
              <p className="text-sm opacity-40 font-bold uppercase tracking-widest mt-12 animate-pulse">Click to reveal</p>
            )}
            
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="h-24 mt-12 w-full max-w-xl flex justify-center">
        {isFlipped && (
          <div className="grid grid-cols-4 gap-4 w-full px-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
             <button 
                onClick={() => handleNext(1)}
                className="flex flex-col items-center justify-center p-4 bg-red-500/10 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-500/20 transition-colors font-bold group"
              >
                <span className="text-sm">Again</span>
                <span className="text-[10px] opacity-60 uppercase tracking-widest mt-1">1</span>
             </button>
             <button 
                onClick={() => handleNext(2)}
                className="flex flex-col items-center justify-center p-4 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-2xl hover:bg-orange-500/20 transition-colors font-bold"
              >
                <span className="text-sm">Hard</span>
                <span className="text-[10px] opacity-60 uppercase tracking-widest mt-1">2</span>
             </button>
             <button 
                onClick={() => handleNext(3)}
                className="flex flex-col items-center justify-center p-4 bg-green-500/10 text-green-600 dark:text-green-400 rounded-2xl hover:bg-green-500/20 transition-colors font-bold"
              >
                <span className="text-sm">Good</span>
                <span className="text-[10px] opacity-60 uppercase tracking-widest mt-1">3</span>
             </button>
             <button 
                onClick={() => handleNext(4)}
                className="flex flex-col items-center justify-center p-4 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl hover:bg-blue-500/20 transition-colors font-bold"
              >
                <span className="text-sm">Easy</span>
                <span className="text-[10px] opacity-60 uppercase tracking-widest mt-1">4</span>
             </button>
          </div>
        )}
      </div>

    </div>
  );
};
