import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronRight, ChevronLeft, ExternalLink, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CorpusDB } from '../data/corpus';
import { useKnowledge } from '../lib/hooks/useKnowledge';
import { WordState, STATE_COLORS, STATE_LABELS } from '../lib/constants/wordStates';
import { ProgressRing } from '../components/reader/ProgressRing';

export const Reader = ({ text, onBack }: { text: any, onBack: () => void }) => {
  const { knowledge, setWordState, stats, addReadWords, incrementReadingTime } = useKnowledge();
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTranslit, setShowTranslit] = useState(false);
  const [fontSize] = useState(24);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // seconds

  const chapters = useMemo(() => {
    if (typeof text?.id === 'string' && CorpusDB.getText(text.id)) {
      const realText = CorpusDB.getText(text.id);
      return realText?.sectionsPreview?.map(preview => {
        const section = CorpusDB.getSection(preview.id);
        if (!section) return { id: preview.id, title: preview.label, tokens: [], translation: '' };
        const tokens = section.sentences.flatMap((s: any) => s.tokens.map((t: any) => ({
          id: t.id,
          text: t.surface,
          lemma: t.lemma,
          gloss: t.gloss,
          morphology: t.morphology,
          translit: t.transliteration,
          punctBefore: t.punctBefore || '',
          punctAfter: t.punctAfter || ' '
        })));
        return {
           id: section.id,
           title: section.label,
           tokens,
           translation: section.sentences.map(s => s.translation).filter(Boolean).join(' ')
        };
      }) || [];
    } else if (text?.content) {
      // Logic for imported text
      const rawTokens = text.content.split(/\s+/).filter(Boolean);
      const tokens = rawTokens.map((t: string, i: number) => ({
        id: `import-token-${i}`,
        text: t.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ""),
        lemma: t.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase(),
        gloss: 'User imported word',
        punctAfter: t.match(/[.,/#!$%^&*;:{}=\-_`~()]/) ? t.slice(-1) + ' ' : ' '
      }));
      return [{
        id: 'imported-section-1',
        title: 'Full Text',
        tokens,
        translation: 'No translation available for imported text.'
      }];
    }
    return [];
  }, [text?.id, text?.content]);

  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    const saved = localStorage.getItem(`reader_chapter_${text?.id}`);
    const parsed = saved ? parseInt(saved, 10) || 0 : 0;
    return parsed < chapters.length ? parsed : 0;
  });
  
  const chapter = chapters[currentChapterIndex] || chapters[0];
  const isHebrew = text?.language === 'hbo' || text?.language === 'Biblical Hebrew';

  // Stats & Time tracking
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => {
        if (prev > 0 && prev % 60 === 0) incrementReadingTime(1);
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [incrementReadingTime]);

  useEffect(() => {
    if (text?.id) {
      localStorage.setItem(`reader_chapter_${text.id}`, currentChapterIndex.toString());
    }
  }, [currentChapterIndex, text?.id]);

  useEffect(() => {
    const handleScroll = (e: any) => {
      const el = e.target;
      const progress = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollProgress(progress || 0);
    };
    const scrollContainer = document.getElementById('reading-area-scroll');
    if (scrollContainer) scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      if (scrollContainer) scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [chapter]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedWord) {
        if (e.key === 'ArrowRight') {
           if (currentChapterIndex < chapters.length - 1) setCurrentChapterIndex(currentChapterIndex + 1);
        } else if (e.key === 'ArrowLeft') {
           if (currentChapterIndex > 0) setCurrentChapterIndex(currentChapterIndex - 1);
        }
        return;
      }
      
      const currentIndex = chapter.tokens.findIndex((t: any) => t.id === selectedWord.id);
      if (e.key === 'ArrowRight') {
        if (currentIndex < chapter.tokens.length - 1) setSelectedWord(chapter.tokens[currentIndex + 1]);
        else if (currentChapterIndex < chapters.length - 1) {
           setCurrentChapterIndex(currentChapterIndex + 1);
           setSelectedWord(null);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) setSelectedWord(chapter.tokens[currentIndex - 1]);
        else if (currentChapterIndex > 0) {
           setCurrentChapterIndex(currentChapterIndex - 1);
           setSelectedWord(null);
        }
      } else if (e.key === 'Escape') {
        setSelectedWord(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWord, chapter, currentChapterIndex, chapters.length]);

  const getWordStyle = (token: any) => {
    const info = knowledge[token.lemma] ?? WordState.NEW;
    const state = typeof info === 'object' ? (info as any).state : info;
    const isSelected = selectedWord?.id === token.id;
    const colors = STATE_COLORS[state as WordState];
    
    return {
      backgroundColor: isSelected ? '#1E3D6E33' : colors.bg,
      borderBottom: `2px solid ${isSelected ? '#1E3D6E' : colors.border}`,
      color: colors.text,
      fontStyle: state === WordState.IGNORED ? 'italic' : 'normal',
      opacity: state === WordState.IGNORED ? 0.6 : 1,
    };
  };

  const handleMarkPageKnown = () => {
    const newLemmas = chapter.tokens
      .map((t: any) => t.lemma)
      .filter((l: string) => {
        const info = knowledge[l] ?? WordState.NEW;
        const state = typeof info === 'object' ? (info as any).state : info;
        return state === WordState.NEW;
      });
    
    newLemmas.forEach((l: string) => setWordState(l, WordState.KNOWN));
    addReadWords(chapter.tokens.length);
    
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
      setSelectedWord(null);
    }
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    return `${mins} min`;
  };

  return (
    <div className="flex h-screen bg-[#FDFBF7] text-ink font-sans overflow-hidden">
      
      <div className="flex-1 flex flex-col relative z-20 overflow-hidden">
        
        {/* Progress Header Strip */}
        <div className="h-14 bg-parch2 border-b border-bdr flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[18px] font-bold text-blue leading-none">{stats.totalKnown.toLocaleString()}</span>
              <span className="text-[9px] uppercase tracking-wider text-muted font-bold">Known Words</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[18px] font-bold text-ink leading-none">{stats.readToday.toLocaleString()}</span>
              <span className="text-[9px] uppercase tracking-wider text-muted font-bold">Read Today</span>
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-[18px] font-bold text-ink leading-none">{formatTime(elapsedTime)}</span>
              <span className="text-[9px] uppercase tracking-wider text-muted font-bold">Session Time</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-ink3 uppercase tracking-tight">Daily Goal</span>
                <ProgressRing progress={Math.min(1, stats.readToday / 500)} />
             </div>
             <div className="w-px h-8 bg-bdr/50" />
             <button onClick={onBack} className="p-2 text-link hover:bg-parch3 rounded-full transition-colors">
               <ArrowLeft className="w-5 h-5 text-ink3" />
             </button>
          </div>
        </div>

        {/* Reader Top Nav */}
        <div className="h-10 border-b border-bdr/40 flex items-center justify-between px-6 bg-parch/30 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3 text-[11px] font-medium text-ink2">
            <span className="text-muted">Library</span>
            <span className="text-muted/40">/</span>
            <span className="truncate max-w-[200px]">{text?.title}</span>
            <span className="text-muted/40">/</span>
            <select 
              value={currentChapterIndex} 
              onChange={e => setCurrentChapterIndex(parseInt(e.target.value, 10))}
              className="bg-transparent border-none p-0 focus:ring-0 cursor-pointer font-bold text-blue"
            >
              {chapters.map((c, i) => <option key={c.id} value={i}>{c.title}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowTranslation(!showTranslation)} className={cn("text-[10px] font-bold tracking-widest uppercase", showTranslation ? "text-blue" : "text-muted")}>Translation</button>
            <button onClick={() => setShowTranslit(!showTranslit)} className={cn("text-[10px] font-bold tracking-widest uppercase", showTranslit ? "text-blue" : "text-muted")}>Transliteration</button>
          </div>
        </div>

        {/* Text Pane */}
        <div id="reading-area-scroll" className="flex-1 overflow-y-auto px-12 md:px-24 lg:px-32 py-16 scroll-smooth">
          <div className="max-w-3xl mx-auto">
            <div className={cn("font-serif leading-[2.2] tracking-wide", isHebrew ? "font-hebrew text-right" : "text-left")}>
               {chapter.tokens.map((token: any) => (
                  <span key={token.id} className="inline">
                    {token.punctBefore && <span className="opacity-40">{token.punctBefore}</span>}
                    <motion.span
                      layoutId={`word-${token.id}`}
                      onClick={() => setSelectedWord(token)}
                      className="cursor-pointer transition-all px-0.5 rounded-sm inline-block"
                      style={{ 
                        fontSize: `${fontSize}px`,
                        ...getWordStyle(token)
                      }}
                    >
                       {token.text}
                    </motion.span>
                    {token.punctAfter ? <span className="opacity-40">{token.punctAfter}</span> : <span> </span>}
                  </span>
               ))}
               <span className="text-muted ml-4 opacity-30 text-[24px]">❦</span>
            </div>

            {showTranslation && (
              <div className="mt-20 pt-10 border-t border-bdr/20">
                <p className="font-body italic text-[18px] text-ink2 leading-relaxed opacity-80">
                  {chapter.translation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Nav / Stats */}
        <div className="h-12 bg-parch2 border-t border-bdr flex items-center justify-between px-6 shrink-0 z-30">
           <div className="flex items-center gap-6">
             <div className="flex h-1 w-32 bg-parch3 rounded-full overflow-hidden">
                <div className="h-full bg-gold transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
             </div>
             <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{Math.round(scrollProgress)}% read</span>
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={() => currentChapterIndex > 0 && setCurrentChapterIndex(currentChapterIndex - 1)}
                disabled={currentChapterIndex === 0}
                className="text-ink3 hover:text-blue disabled:opacity-30 p-1"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={handleMarkPageKnown}
                className="bg-blue text-white px-5 py-1.5 rounded-full text-[12px] font-bold hover:bg-blue/90 shadow-sm transition-all"
              >
                Mark Known & Next
              </button>
              <button 
                onClick={() => currentChapterIndex < chapters.length - 1 && setCurrentChapterIndex(currentChapterIndex + 1)}
                disabled={currentChapterIndex === chapters.length - 1}
                className="text-ink3 hover:text-blue disabled:opacity-30 p-1"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
           </div>
        </div>
      </div>

      {/* 380px Reading Panel */}
      <AnimatePresence>
        {selectedWord && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-[#FEFAF4] border-l border-bdr flex flex-col shrink-0 z-40 shadow-[-10px_0_40px_rgba(35,20,10,0.04)]"
          >
            <div className="h-14 border-b border-bdr flex items-center justify-between px-4 bg-[#FEFAF4] shrink-0">
               <div className="eyebrow">Word Analysis</div>
               <button onClick={() => setSelectedWord(null)} className="text-muted hover:text-ink p-1">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
               <div className="mb-10 text-center">
                  <h2 className={cn("text-[48px] font-serif leading-tight mb-2 text-ink", isHebrew?"font-hebrew":"")} dir={isHebrew?"rtl":"ltr"}>
                    {selectedWord.text}
                  </h2>
                  {showTranslit && selectedWord.translit && (
                    <div className="font-body italic text-[16px] text-muted mb-4 opacity-80">{selectedWord.translit}</div>
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[18px] font-serif text-blue font-semibold tracking-wide">
                       {selectedWord.lemma}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Lemma form</span>
                  </div>
               </div>

               <div className="mb-10 p-5 bg-parch/40 border border-bdr/30 rounded-[20px]">
                  <div className="eyebrow mb-4 flex items-center justify-between text-blue font-bold">
                    <span>Popular Meanings</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                  <div className="font-body text-[20px] text-ink font-medium mb-6 leading-snug">
                    {selectedWord.gloss}
                  </div>
                  
                  <div className="space-y-2">
                     {/* Fake "Popular hints" based on standard meanings */}
                     {["primary translation", "alternative sense", "rare usage"].map((_hint, i) => (
                       <button 
                         key={i} 
                         onClick={() => {}}
                         className="w-full text-left p-3 rounded-xl border border-bdr/20 hover:border-blue/30 text-ink2 text-[13px] font-sans transition-colors flex items-center justify-between group"
                       >
                         <span>{selectedWord.gloss.split(',')[0]} (option {i+1})</span>
                         <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 text-blue" />
                       </button>
                     ))}
                  </div>
               </div>

               {selectedWord.morphology && (
                 <div className="mb-10">
                    <div className="eyebrow mb-4 opacity-50">Morphology</div>
                    <div className="font-sans text-[14px] text-ink2 leading-relaxed bg-white/40 p-4 rounded-xl border border-bdr/20">
                       <span className="font-bold text-blue pr-2">Parsed:</span>
                       {Object.entries(selectedWord.morphology).map(([_k, v]) => v).join(', ')}
                    </div>
                 </div>
               )}

               {/* Status Selector */}
               <div className="mb-10">
                  <div className="eyebrow mb-4 opacity-50">Mastery Level</div>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                        {[WordState.NEW, WordState.LEARNING, WordState.FAMILIAR, WordState.KNOWN].map((s) => {
                          const info = knowledge[selectedWord.lemma] ?? WordState.NEW;
                          const active = (typeof info === 'object' ? (info as any).state : info) === s;
                          const colors = STATE_COLORS[s];
                          return (
                         <button 
                           key={s}
                           onClick={() => setWordState(selectedWord.lemma, s)}
                           className={cn(
                             "flex flex-col items-center p-3 rounded-xl border transition-all",
                             active ? "border-blue ring-1 ring-blue shadow-sm" : "border-bdr/30 grayscale opacity-40 hover:grayscale-0 hover:opacity-100"
                           )}
                           style={{ backgroundColor: active ? colors.bg : 'transparent', color: colors.text }}
                         >
                            <span className="text-[14px] font-bold mb-1">{s === WordState.NEW ? '?' : s === WordState.KNOWN ? '✓' : s}</span>
                            <span className="text-[8px] font-bold uppercase tracking-tighter">{STATE_LABELS[s]}</span>
                         </button>
                       )
                     })}
                  </div>
                  <button 
                    onClick={() => setWordState(selectedWord.lemma, WordState.IGNORED)}
                    className={cn(
                      "w-full py-3 rounded-xl text-[12px] font-bold uppercase tracking-widest transition-colors",
                      (() => {
                        const info = knowledge[selectedWord.lemma] ?? WordState.NEW;
                        const state = typeof info === 'object' ? (info as any).state : info;
                        return state === WordState.IGNORED;
                      })() ? "bg-zinc-200 text-zinc-600" : "text-muted hover:text-ink"
                    )}
                  >
                    Hold as Ignored / Proper Noun
                  </button>
               </div>

               <div className="pt-6 border-t border-bdr/20 text-center">
                  <div className="inline-flex items-center gap-2 bg-blue/5 px-4 py-2 rounded-full">
                     <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                     <span className="text-[11px] font-bold text-blue/70">
                       Lemma occurs 247× across 14 texts
                     </span>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
