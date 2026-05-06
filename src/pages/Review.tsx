import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';

const dummyReviewQueue = [
  { id: '1', term: 'λόγος', translit: 'logos', definition: 'word, reason, account', context: 'Ἐν ἀρχῇ ἦν ὁ λόγος...', contextTranslation: "In the beginning was the Word...", source: '— Mark 1:2 (from your reading, 3 days ago)', language: 'Greek', type: 'FORM → MEANING' },
  { id: '2', term: 'בְּרֵאשִׁית', translit: 'bereshit', definition: 'in the beginning', context: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים...', contextTranslation: "In the beginning, God created...", source: '— Genesis 1:1 (from your reading, 1 week ago)', language: 'Hebrew', type: 'FORM → MEANING' },
];

export const Review = ({ onBack }: { onBack?: () => void }) => {
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState({ correct: 0, hard: 0, again: 0 });

  useEffect(() => {
    const fetchQueue = async () => {
      if (!auth.currentUser) {
        setQueue(dummyReviewQueue);
        setIsLoading(false);
        return;
      }
      
      try {
        const vocabQuery = query(collection(db, 'vocabulary'), 
          where('userId', '==', auth.currentUser.uid),
          where('nextReview', '<=', new Date())
        );
        const snap = await getDocs(vocabQuery);
        const fetchedCards: any[] = [];
        snap.forEach(d => {
          fetchedCards.push({ id: d.id, ...d.data(), type: 'FORM → MEANING' });
        });
        setQueue(fetchedCards.length > 0 ? fetchedCards : dummyReviewQueue);
      } catch (err) {
        console.error(err);
        setQueue(dummyReviewQueue);
      }
      setIsLoading(false);
    };
    fetchQueue();
  }, []);

  const currentCard = queue[currentIndex];
  const total = queue.length;
  const isHebrew = currentCard?.language?.includes('Hebrew') || currentCard?.language?.includes('Aramaic');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentCard) return;

      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        setIsFlipped(true);
      } else if (isFlipped) {
        if (e.key === '1') handleRate('again');
        else if (e.key === '2') handleRate('hard');
        else if (e.key === '3') handleRate('good');
        else if (e.key === '4') handleRate('easy');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, currentCard]);

  const handleRate = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    setStats(prev => ({ 
      ...prev, 
      correct: (rating === 'good' || rating === 'easy') ? prev.correct + 1 : prev.correct,
      hard: rating === 'hard' ? prev.hard + 1 : prev.hard,
      again: rating === 'again' ? prev.again + 1 : prev.again,
    }));
    
    // Update firestore if real card
    if (auth.currentUser && currentCard.userId) {
      try {
        let newInterval = currentCard.interval || 1;
        let newEase = currentCard.ease || 2.5;

        // Simplified SuperMemo-2 algorithm
        if (rating === 'again') {
          newInterval = 1;
          newEase = Math.max(1.3, newEase - 0.2);
        } else if (rating === 'hard') {
          newInterval = Math.max(1, newInterval * 1.2);
          newEase = Math.max(1.3, newEase - 0.15);
        } else if (rating === 'good') {
          newInterval = Math.max(1, (newInterval * newEase));
        } else if (rating === 'easy') {
          newInterval = Math.max(1, (newInterval * newEase * 1.3));
          newEase += 0.15;
        }

        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + Math.round(newInterval));
        
        await setDoc(doc(db, 'vocabulary', currentCard.id), {
          ...currentCard,
          interval: newInterval,
          ease: newEase,
          nextReview: nextDate,
          updatedAt: new Date()
        });
      } catch (e) {
        console.error(e);
      }
    }

    setTimeout(() => {
      setIsFlipped(false);
      setCurrentIndex(prev => prev + 1);
    }, 150);
  };

  const progress = (currentIndex / total) * 100;

  if (isLoading) {
    return <div className="min-h-screen bg-parch2 flex items-center justify-center font-serif text-ink text-xl">Loading Lexicon...</div>;
  }

  if (currentIndex >= total) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h2 className="text-3xl font-serif text-ink mb-4">Session Complete</h2>
        <div className="flex gap-6 mb-8">
          <div className="text-center"><div className="text-2xl font-bold font-sans text-jade">{stats.correct}</div><div className="eyebrow">Correct</div></div>
          <div className="text-center"><div className="text-2xl font-bold font-sans text-amber">{stats.hard}</div><div className="eyebrow">Hard</div></div>
          <div className="text-center"><div className="text-2xl font-bold font-sans text-ruby">{stats.again}</div><div className="eyebrow">Again</div></div>
        </div>
        <button onClick={onBack} className="btn-primary py-2 px-6">Return to Dashboard</button>
      </div>
    );
  }

  // Highlight word in context
  const getContextElement = (contextStr: string, term: string) => {
    if (!contextStr) return null;
    const parts = contextStr.split(new RegExp(`(${term})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === term.toLowerCase() ? 
            <span key={i} className="border-b-2 border-gold pb-0.5">{part}</span> : part
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-parch2 flex flex-col font-sans">
      <div className="fixed top-0 left-0 w-full h-1 bg-parch3 z-50">
        <motion.div className="h-full bg-blue" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
      </div>

      <header className="px-6 py-4 flex items-center justify-between border-b border-bdr">
        <div className="flex items-center gap-4">
           {onBack && <button onClick={onBack} className="text-muted hover:text-ink transition-colors"><ArrowLeft className="w-5 h-5"/></button>}
           <div className="font-mono text-xs text-ink3 uppercase tracking-widest">Card {currentIndex + 1} / {total}</div>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-muted"><span className="w-1.5 h-1.5 rounded-full bg-jade"></span> {stats.correct} Correct</div>
           <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-muted"><span className="w-1.5 h-1.5 rounded-full bg-amber"></span> {stats.hard} Hard</div>
           <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-muted"><span className="w-1.5 h-1.5 rounded-full bg-ruby"></span> {stats.again} Again</div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-[580px]"
          >
            <div className="bg-[#FEFAF4] rounded-[18px] border border-bdr shadow-[0_20px_40px_-20px_rgba(35,20,10,0.1)] pt-[48px] px-[40px] pb-[40px] relative text-center">
              <div className="absolute top-5 left-6 font-mono text-[10px] text-muted tracking-widest uppercase">{currentCard.type}</div>
              
              <div className={cn("text-[72px] font-serif font-light text-ink leading-none mb-1", isHebrew ? "font-hebrew" : "")} dir={isHebrew ? "rtl" : "ltr"}>
                {currentCard.term}
              </div>
              <div className="font-mono text-[15px] italic text-ink3 mb-4">{currentCard.translit}</div>
              <div className="inline-block bg-bluexl text-blue border border-blue/20 rounded px-1.5 py-0.5 font-mono text-[10px] mb-8">N-NSM</div>

              {!isFlipped ? (
                <div className="mt-8 flex justify-center">
                  <button onClick={() => setIsFlipped(true)} className="px-6 py-3 bg-parch border border-bdr rounded-xl text-ink3 font-sans font-medium hover:bg-parch2 transition-colors flex items-center gap-2">
                    Tap to reveal <span className="font-mono text-[10px] uppercase opacity-50 ml-2 bg-parch3 px-1.5 py-0.5 rounded">Space</span>
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 border-t border-bdr/50 pt-8 text-left">
                  <div className="text-[22px] font-body font-medium text-ink mb-6 text-center">{currentCard.definition}</div>
                  
                  <div className="bg-parch p-5 rounded-xl border border-bdr/50">
                    <div className={cn("font-body italic text-[17px] text-ink2 leading-relaxed mb-1 text-center")} dir={isHebrew ? "rtl" : "ltr"}>
                      {currentCard.context ? (
                        <>"{getContextElement(currentCard.context, currentCard.term)}"</>
                      ) : (
                        <span className="opacity-50">Context not saved</span>
                      )}
                    </div>
                    {currentCard.source && (
                      <div className="font-mono text-[10px] text-muted text-center mt-3 uppercase tracking-widest">
                         {currentCard.source}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {isFlipped && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 grid grid-cols-4 gap-3">
                <button onClick={() => handleRate('again')} className="bg-rubyxl border border-ruby/20 rounded-[14px] p-3 text-center hover:bg-[#FAD9D6] transition-colors relative group">
                  <div className="font-sans font-bold text-ruby text-[15px] mb-0.5">Again</div>
                  <div className="font-mono text-[10px] text-ruby/70 uppercase tracking-widest">&lt; 10m</div>
                  <div className="absolute top-2 right-2 font-mono text-[9px] text-ruby/50 bg-ruby/10 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">1</div>
                </button>
                <button onClick={() => handleRate('hard')} className="bg-amberxl border border-amber/20 rounded-[14px] p-3 text-center hover:bg-[#FCEAD0] transition-colors relative group">
                  <div className="font-sans font-bold text-amber text-[15px] mb-0.5">Hard</div>
                  <div className="font-mono text-[10px] text-amber/70 uppercase tracking-widest">1d</div>
                  <div className="absolute top-2 right-2 font-mono text-[9px] text-amber/50 bg-amber/10 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">2</div>
                </button>
                <button onClick={() => handleRate('good')} className="bg-jadexl border border-jade/20 rounded-[14px] p-3 text-center hover:bg-[#DDF0E2] transition-colors relative group">
                  <div className="font-sans font-bold text-jade text-[15px] mb-0.5">Good</div>
                  <div className="font-mono text-[10px] text-jade/70 uppercase tracking-widest">3d</div>
                  <div className="absolute top-2 right-2 font-mono text-[9px] text-jade/50 bg-jade/10 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">3</div>
                </button>
                <button onClick={() => handleRate('easy')} className="bg-bluexl border border-blue/20 rounded-[14px] p-3 text-center hover:bg-[#DDEEF8] transition-colors relative group">
                  <div className="font-sans font-bold text-blue text-[15px] mb-0.5">Easy</div>
                  <div className="font-mono text-[10px] text-blue/70 uppercase tracking-widest">7d</div>
                  <div className="absolute top-2 right-2 font-mono text-[9px] text-blue/50 bg-blue/10 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">4</div>
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
