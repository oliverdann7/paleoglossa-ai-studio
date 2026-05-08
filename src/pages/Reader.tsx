import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronRight, ChevronLeft, Play, Pause, Repeat, Repeat1, Layout, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CorpusDB } from '../data/corpus';
import { useKnowledge } from '../lib/hooks/useKnowledge';
import { useSettings } from '../lib/hooks/useSettings';
import { WordState, STATE_COLORS, STATE_LABELS } from '../lib/constants/wordStates';
import { ProgressRing } from '../components/reader/ProgressRing';
import { ReaderTutorial } from '../components/reader/ReaderTutorial';

export const Reader = () => {
  const { textId } = useParams();
  const navigate = useNavigate();
  const onBack = () => navigate('/app/library');
  
  const text = useMemo<any>(() => {
    if (!textId) return null;
    let t = CorpusDB.getText(textId);
    if (!t && textId.startsWith('import-')) {
      const existingRaw = localStorage.getItem('paleoglossa_imports');
      if (existingRaw) {
        const existing = JSON.parse(existingRaw);
        t = existing.find((item: any) => item.id === textId);
      }
    }
    return t;
  }, [textId]);
  const { knowledge, setWordState, stats, addReadWords, incrementReadingTime, setWordNote, getWordInfo } = useKnowledge();
  const { settings } = useSettings();
  
  const [selectedWord, setSelectedWord] = useState<any>(null);

  const showTranslit = settings.showTranslit;
  const [showParallel, setShowParallel] = useState(settings.showParallelDefault);
  const [readingMode, setReadingMode] = useState<'scroll' | 'page'>('scroll');
  const [maskKnown, setMaskKnown] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(() => {
    return localStorage.getItem('tutorialCompleted') ? 0 : 1;
  });

  const [scrollProgress, setScrollProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0); // seconds

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioPos, setAudioPos] = useState({ sentenceIdx: 0, wordIdx: 0 });
  const [audioSpeed, setAudioSpeed] = useState(settings.audioSpeedDefault);
  const [loopSentence, setLoopSentence] = useState(false);
  const [loopWord, setLoopWord] = useState(false);
  
  // Page mode state
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  const chapters = useMemo(() => {
    const textId = text?.id;

    if (typeof textId === 'string' && CorpusDB.getText(textId)) {
      const realText = CorpusDB.getText(textId);
      return realText?.sectionsPreview?.map(preview => {
        const section = CorpusDB.getSection(preview.id);
        if (!section) return { id: preview.id, title: preview.label, sentences: [], translation: '' };
        
        const sentences = section.sentences.map((s: any) => ({
           id: s.id,
           translation: s.translation,
           parallel: s.translation || '',
           tokens: s.tokens.map((t: any) => ({
              id: t.id,
              text: t.surface,
              lemma: t.lemma,
              gloss: t.gloss,
              morphology: t.morphology,
              translit: t.transliteration,
              punctBefore: t.punctBefore || '',
              punctAfter: t.punctAfter || ' '
           }))
        }));
        
        return {
           id: section.id,
           title: section.label,
           sentences,
           translation: section.sentences.map(s => s.translation).filter(Boolean).join(' ')
        };
      }) || [];
    } else if (text?.content) {
      // Logic for imported text
      const sentencesRaw = text.content.split(/(?<=[.?!])\s+/).filter(Boolean);
      const sentences = sentencesRaw.map((sRaw: string, i: number) => {
         const rawTokens = sRaw.split(/\s+/).filter(Boolean);
         return {
            id: `import-sent-${i}`,
            translation: 'No translation for imported text.',
            parallel: 'No parallel text available.',
            tokens: rawTokens.map((t: string, j: number) => ({
              id: `import-token-${i}-${j}`,
              text: t.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ""),
              lemma: t.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase(),
              gloss: 'User imported word',
              punctAfter: t.match(/[.,/#!$%^&*;:{}=\-_`~()]/) ? t.slice(-1) + ' ' : ' '
            }))
         };
      });
      return [{
        id: 'imported-section-1',
        title: 'Full Text',
        sentences,
        translation: 'No translation available for imported text.'
      }];
    }
    return [];
  }, [text]);

  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    const saved = localStorage.getItem(`reader_chapter_${text?.id}`);
    const parsed = saved ? parseInt(saved, 10) || 0 : 0;
    return parsed < chapters.length ? parsed : 0;
  });
  
  const chapter = chapters[currentChapterIndex] || chapters[0];
  const isHebrew = text?.language === 'hbo' || text?.language === 'Biblical Hebrew';

  const exampleSentences = useMemo(() => {
    if (!selectedWord) return [];
    const currentSentenceId = chapter?.sentences?.[currentSentenceIndex]?.id;
    return CorpusDB.findSentencesWithLemma(selectedWord.lemma, currentSentenceId, 3);
  }, [selectedWord, chapter, currentSentenceIndex]);

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

  // Audio Playback Effect
  useEffect(() => {
     if (!isPlaying) return;
     const currentSentence = chapter?.sentences[audioPos.sentenceIdx];
     if (!currentSentence) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsPlaying(false);
        return;
     }

     const baseSpeed = isHebrew ? 180 : 150;
     const delay = baseSpeed / audioSpeed;

     const timer = setTimeout(() => {
        if (loopWord) {
           // Do not advance token
        } else if (audioPos.wordIdx < currentSentence.tokens.length - 1) {
           setAudioPos(p => ({ ...p, wordIdx: p.wordIdx + 1 }));
        } else {
           if (loopSentence) {
              setAudioPos(p => ({ ...p, wordIdx: 0 }));
           } else if (audioPos.sentenceIdx < chapter.sentences.length - 1) {
              setAudioPos({ sentenceIdx: audioPos.sentenceIdx + 1, wordIdx: 0 });
              if (readingMode === 'page') setCurrentSentenceIndex(audioPos.sentenceIdx + 1);
           } else {
               
              setIsPlaying(false);
               
              setAudioPos({ sentenceIdx: 0, wordIdx: 0 });
           }
        }
     }, delay);

     return () => clearTimeout(timer);
  }, [isPlaying, audioPos, audioSpeed, chapter, loopWord, loopSentence, isHebrew, readingMode]);

  useEffect(() => {
    if (text?.id) {
      localStorage.setItem(`reader_chapter_${text.id}`, currentChapterIndex.toString());
    }
  }, [currentChapterIndex, text?.id]);

  // Tutorial logic
  useEffect(() => {
    if (tutorialStep === 0) return;
    
    if (tutorialStep === 1 && selectedWord) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTutorialStep(2);
    } else if (tutorialStep === 2 && selectedWord && (knowledge[selectedWord.lemma] === WordState.KNOWN || (knowledge[selectedWord.lemma] as any)?.state === WordState.KNOWN)) {
         
        setTutorialStep(3);
    } else if (tutorialStep === 3 && scrollProgress > 80) {
         
        setTutorialStep(4);
    }
  }, [tutorialStep, selectedWord, knowledge, scrollProgress]);

  const dismissTutorial = () => {
    setTutorialStep(0);
    localStorage.setItem('tutorialCompleted', 'true');
  };

  useEffect(() => {
    if (readingMode === 'page') return;
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
  }, [chapter, readingMode]);

  // Keyboard support
  useEffect(() => {
     const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === ' ') {
           e.preventDefault();
           setIsPlaying(p => !p);
           return;
        }
        if (e.key === 'l' || e.key === 'L') {
           setLoopSentence(p => !p);
           return;
        }
        if (['1','2','3','4','5'].includes(e.key)) {
           const speeds = [0.7, 0.85, 1.0, 1.15, 1.3];
           setAudioSpeed(speeds[parseInt(e.key) - 1]);
           return;
        }

        if (!selectedWord) {
           if (e.key === 'ArrowRight') {
              if (readingMode === 'page' && currentSentenceIndex < chapter.sentences.length - 1) {
                 setCurrentSentenceIndex(prev => prev + 1);
                 setAudioPos({ sentenceIdx: currentSentenceIndex + 1, wordIdx: 0 });
              }
           } else if (e.key === 'ArrowLeft') {
              if (readingMode === 'page' && currentSentenceIndex > 0) {
                 setCurrentSentenceIndex(prev => prev - 1);
                 setAudioPos({ sentenceIdx: currentSentenceIndex - 1, wordIdx: 0 });
              }
           }
           return;
        }

        if (e.key === 'Escape') setSelectedWord(null);
     };
     window.addEventListener('keydown', handleKeyDown);
     return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWord, chapter, readingMode, currentSentenceIndex]);

  const getWordStyle = (token: any, isAudioActive: boolean) => {
    const info = knowledge[token.lemma] ?? WordState.NEW;
    const state = typeof info === 'object' ? (info as any).state : info;
    const isSelected = selectedWord?.id === token.id;
    const isKnown = state === WordState.KNOWN;
    const colors = STATE_COLORS[state as WordState];
    
    const intensity = settings.highlightIntensity;
    let bgOpacity = intensity === 'strong' ? '50' : intensity === 'subtle' ? '15' : '33';
    if (state === WordState.NEW) bgOpacity = '00';

    if (maskKnown && isKnown && !isSelected && !isAudioActive) {
       return {
          color: 'transparent',
          borderBottom: '2px dotted #8C8273',
          backgroundImage: 'radial-gradient(circle, #8C8273 1px, transparent 1px)',
          backgroundSize: '10px 10px',
          backgroundPosition: '1px 8px',
          backgroundRepeat: 'repeat-x'
       };
    }
    
    return {
      backgroundColor: isSelected ? '#1E3D6E33' : (colors.bg === 'transparent' ? 'transparent' : `${colors.bg}${bgOpacity}`),
      borderBottom: `2px solid ${isSelected ? '#1E3D6E' : (isAudioActive ? '#D4AF37' : colors.border)}`,
      color: colors.text,
      fontStyle: state === WordState.IGNORED ? 'italic' : 'normal',
      opacity: state === WordState.IGNORED ? 0.6 : 1,
      transition: 'all 0.15s ease'
    };
  };

  const handleMarkPageKnown = () => {
    let tokensToMark: any[];
    if (readingMode === 'page') {
      tokensToMark = chapter.sentences[currentSentenceIndex]?.tokens || [];
    } else {
      tokensToMark = chapter.sentences.flatMap((s: any) => s.tokens);
    }

    const newLemmas = tokensToMark
      .map((t: any) => t.lemma)
      .filter((l: string) => {
        const info = knowledge[l] ?? WordState.NEW;
        const state = typeof info === 'object' ? (info as any).state : info;
        return state === WordState.NEW;
      });
    
    newLemmas.forEach((l: string) => setWordState(l, WordState.KNOWN));
    addReadWords(tokensToMark.length);
    
    if (readingMode === 'page') {
      if (currentSentenceIndex < chapter.sentences.length - 1) {
        setCurrentSentenceIndex(prev => prev + 1);
        setAudioPos({ sentenceIdx: currentSentenceIndex + 1, wordIdx: 0 });
        setSelectedWord(null);
      } else if (currentChapterIndex < chapters.length - 1) {
        setCurrentChapterIndex(currentChapterIndex + 1);
        setCurrentSentenceIndex(0);
        setAudioPos({ sentenceIdx: 0, wordIdx: 0 });
        setSelectedWord(null);
      }
    } else {
      if (currentChapterIndex < chapters.length - 1) {
        setCurrentChapterIndex(currentChapterIndex + 1);
        setSelectedWord(null);
      }
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
        <div className="h-14 bg-parch2 border-b border-bdr flex items-center justify-between px-4 md:px-6 shrink-0 transition-colors">
          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex flex-col md:flex-row md:items-baseline md:gap-2">
              <span className="text-[16px] md:text-[18px] font-bold text-blue leading-none">{stats.readToday.toLocaleString()}</span>
              <span className="text-[9px] uppercase tracking-wider text-muted font-bold hidden md:inline">Read Today</span>
            </div>
            <div className="hidden md:flex flex-col md:flex-row md:items-baseline md:gap-2">
              <span className="text-[18px] font-bold text-ink leading-none">{formatTime(elapsedTime)}</span>
              <span className="text-[9px] uppercase tracking-wider text-muted font-bold">Session</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <span className="hidden md:inline text-[11px] font-bold text-ink3 uppercase tracking-tight">Goal</span>
                <ProgressRing progress={Math.min(1, stats.readToday / Math.max(1, settings.dailyGoalWords))} />
             </div>
             <div className="w-px h-8 bg-bdr/50" />
             <button onClick={onBack} className="p-2 text-link hover:bg-parch3 rounded-full transition-colors">
               <ArrowLeft className="w-5 h-5 text-ink3" />
             </button>
          </div>
        </div>

        {/* Reader Controls Toolbar */}
        <div className="h-12 border-b border-bdr/40 flex items-center justify-between px-4 md:px-6 bg-parch/30 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-medium text-ink2 overflow-hidden">
            <select 
              value={currentChapterIndex} 
              onChange={e => setCurrentChapterIndex(parseInt(e.target.value, 10))}
              className="bg-transparent border-none p-0 pr-4 focus:ring-0 cursor-pointer font-bold text-blue truncate max-w-[120px] md:max-w-none"
            >
              {chapters.map((c, i) => <option key={c.id} value={i}>{c.title}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setShowParallel(!showParallel)}
              className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest", showParallel ? "bg-blue/10 text-blue" : "text-muted hover:bg-parch3")}
            >
              <Layout className="w-3.5 h-3.5" /> Parallel
            </button>
            <button 
              onClick={() => setMaskKnown(!maskKnown)}
              className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors text-[10px] font-bold uppercase tracking-widest", maskKnown ? "bg-amber/10 text-amber" : "text-muted hover:bg-parch3")}
            >
              <EyeOff className="w-3.5 h-3.5" /> Mask Known
            </button>
            <div className="w-px h-4 bg-bdr m-1 hidden md:block" />
            <div className="flex bg-parch3 p-0.5 rounded-lg border border-bdr shrink-0">
              <button 
                onClick={() => setReadingMode('scroll')}
                className={cn(
                  "px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all whitespace-nowrap",
                  readingMode === 'scroll' ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink cursor-pointer"
                )}
              >
                Sentence View
              </button>
              <button 
                onClick={() => setReadingMode('page')}
                className={cn(
                  "px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-md transition-all whitespace-nowrap",
                  readingMode === 'page' ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink cursor-pointer"
                )}
              >
                Page View
              </button>
            </div>
          </div>
        </div>

        {/* Audio Bar */}
        <div className="h-14 bg-parch text-ink border-b border-bdr flex items-center gap-4 px-4 shadow-sm z-30">
           <button onClick={() => setIsPlaying(!isPlaying)} className="w-8 h-8 flex items-center justify-center rounded-full bg-blue text-white hover:bg-blue-600 transition-transform active:scale-95 shadow-sm shrink-0">
              {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
           </button>
           
           <div className="flex-1 flex items-center gap-3">
              <div className="h-2 w-full bg-parch3 rounded-full overflow-hidden cursor-pointer">
                 <div 
                   className="h-full bg-gold transition-all duration-100 ease-linear"
                   style={{ width: `${(audioPos.sentenceIdx / chapter.sentences.length) * 100}%` }}
                 />
              </div>
           </div>

           <div className="flex items-center gap-2 shrink-0">
             <button 
               onClick={() => {
                   const speeds = [0.7, 0.85, 1.0, 1.15, 1.3];
                   const next = speeds[(speeds.indexOf(audioSpeed) + 1) % speeds.length];
                   setAudioSpeed(next);
               }}
               className="text-[11px] font-mono font-bold text-ink w-10 text-center hover:bg-parch3 px-1 py-1 rounded"
             >
               {audioSpeed}x
             </button>
             <button onClick={() => setLoopSentence(!loopSentence)} className={cn("p-1.5 rounded-md transition-colors", loopSentence ? "text-gold bg-gold/10" : "text-muted hover:bg-parch3")} title="Loop Sentence">
                <Repeat className="w-4 h-4" />
             </button>
             <button onClick={() => setLoopWord(!loopWord)} className={cn("p-1.5 rounded-md transition-colors", loopWord ? "text-gold bg-gold/10" : "text-muted hover:bg-parch3")} title="Loop Word">
                <Repeat1 className="w-4 h-4" />
             </button>
           </div>
        </div>

        {/* Text Pane */}
        <div id="reading-area-scroll" className={cn("flex-1 overflow-y-auto px-4 md:px-12 py-8 md:py-16 scroll-smooth bg-transparent relative", readingMode === 'page' && "flex flex-col justify-center")}>
          <div className={cn("mx-auto transition-all w-full", showParallel ? "max-w-screen-xl lg:grid grid-cols-2 gap-8 items-center" : "max-w-3xl")}>
             
             {/* Original Column */}
             <div className="col-span-1 border-r-0 lg:border-r border-bdr/40 lg:pr-8">
                <div className={cn("font-serif tracking-wide transition-all", isHebrew ? "font-hebrew text-right" : "text-left", readingMode==='page' ?"text-center leading-[3]":"leading-[2.2]")}>
                   {chapter.sentences.map((sentence: any, sIdx: number) => {
                      if (readingMode === 'page' && sIdx !== currentSentenceIndex) return null;
                      
                      return (
                        <span key={sentence.id} className="inline mr-2 md:mr-3">
                           {sentence.tokens.map((token: any, tIdx: number) => {
                              const isAudioActive = audioPos.sentenceIdx === sIdx && audioPos.wordIdx === tIdx;
                              return (
                                <span key={token.id} className="inline">
                                  {token.punctBefore && <span className="opacity-40">{token.punctBefore}</span>}
                                  <motion.span
                                    layoutId={`word-${token.id}`}
                                    onClick={() => setSelectedWord(token)}
                                    className="cursor-pointer transition-all px-0.5 rounded-sm inline-block"
                                    style={{ 
                                      fontSize: readingMode==='page' ? `${settings.fontSize * 1.5}px` : `${settings.fontSize}px`,
                                      ...getWordStyle(token, isAudioActive)
                                    }}
                                  >
                                     {token.text}
                                  </motion.span>
                                  {token.punctAfter ? <span className="opacity-40">{token.punctAfter}</span> : <span> </span>}
                                </span>
                              )
                           })}
                        </span>
                      )
                   })}
                   {readingMode === 'scroll' && <div className="text-muted text-center opacity-30 text-[24px] mt-12 mb-8">❦</div>}
                </div>
             </div>

             {/* Parallel Column */}
             {showParallel && (
                <div className="col-span-1 pt-8 lg:pt-0 pb-16">
                   {chapter.sentences.map((sentence: any, sIdx: number) => {
                      if (readingMode === 'page' && sIdx !== currentSentenceIndex) return null;
                      return (
                         <p key={`par-${sentence.id}`} className={cn("font-serif text-ink2 leading-[2.2] mb-3 transition-opacity", readingMode==='page' ?"text-center text-[24px]":"text-[18px]", "opacity-80 hover:opacity-100")}>
                            {sentence.parallel}
                         </p>
                      )
                   })}
                </div>
             )}
          </div>
        </div>

        {/* Bottom Nav / Stats */}
        <div className="h-12 bg-parch2 border-t border-bdr flex items-center justify-between px-4 md:px-6 shrink-0 z-30 pb-safe">
           <div className="flex items-center gap-4 md:gap-6">
             <div className="hidden md:flex h-1 w-32 bg-parch3 rounded-full overflow-hidden">
                <div className="h-full bg-gold transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
             </div>
             {readingMode === 'page' ? (
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{currentSentenceIndex + 1} / {chapter.sentences.length}</span>
             ) : (
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted hidden md:inline">{Math.round(scrollProgress)}% read</span>
             )}
           </div>
           
           <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                   if (readingMode === 'page' && currentSentenceIndex > 0) setCurrentSentenceIndex(p => p - 1);
                   else if (currentChapterIndex > 0) setCurrentChapterIndex(currentChapterIndex - 1);
                }}
                disabled={currentChapterIndex === 0 && (readingMode==='scroll' || currentSentenceIndex === 0)}
                className="text-ink3 hover:text-blue disabled:opacity-30 p-1"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={handleMarkPageKnown}
                className="bg-blue text-white px-4 md:px-5 py-1.5 rounded-full text-[12px] font-bold hover:bg-blue/90 shadow-sm transition-all whitespace-nowrap"
              >
                {readingMode === 'page' ? 'Mark Known & Next' : 'Mark Page Known'}
              </button>
              <button 
                onClick={() => {
                   if (readingMode === 'page' && currentSentenceIndex < chapter.sentences.length - 1) setCurrentSentenceIndex(p => p + 1);
                   else if (currentChapterIndex < chapters.length - 1) setCurrentChapterIndex(currentChapterIndex + 1);
                }}
                disabled={currentChapterIndex === chapters.length - 1 && (readingMode==='scroll' || currentSentenceIndex === chapter.sentences.length - 1)}
                className="text-ink3 hover:text-blue disabled:opacity-30 p-1"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
           </div>
        </div>
      </div>

      {/* 380px Reading Panel - Absolute on mobile, relative on desktop */}
      <AnimatePresence>
        {selectedWord && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            className="md:!translate-y-0 fixed md:relative bottom-0 left-0 w-full md:w-[380px] h-[65vh] md:h-full bg-[#FEFAF4] border-t md:border-t-0 md:border-l border-bdr flex flex-col shrink-0 z-50 md:z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-[-10px_0_40px_rgba(35,20,10,0.04)] rounded-t-3xl md:rounded-none"
          >
            <div className="h-14 border-b border-bdr flex items-center justify-between px-4 bg-[#FEFAF4] shrink-0 rounded-t-3xl md:rounded-none">
               <div className="eyebrow">Lexical Entry</div>
               <button onClick={() => setSelectedWord(null)} className="w-8 h-8 flex items-center justify-center text-muted hover:text-ink rounded-full hover:bg-parch3 transition-colors text-[18px] leading-none">×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
               {/* Surface form + transliteration */}
               <div className="mb-6 text-center">
                  <h2 className={cn("font-serif leading-tight mb-1 text-ink", isHebrew ? "font-hebrew text-[44px] md:text-[52px]" : "text-[40px] md:text-[48px]")} dir={isHebrew ? "rtl" : "ltr"}>
                    {selectedWord.text}
                  </h2>
                  {showTranslit && selectedWord.translit && (
                    <div className="font-body italic text-[15px] text-muted mb-2">{selectedWord.translit}</div>
                  )}
                  {selectedWord.text !== selectedWord.lemma && (
                    <div className="inline-flex items-center gap-1.5 text-[13px] font-sans text-ink3 bg-parch2 border border-bdr/40 px-3 py-1 rounded-full mt-1">
                      <span className="text-muted">lemma</span>
                      <span className={cn("font-serif font-semibold text-blue", isHebrew ? "font-hebrew" : "")} dir={isHebrew ? "rtl" : "ltr"}>{selectedWord.lemma}</span>
                    </div>
                  )}
               </div>

               {/* Gloss */}
               <div className="mb-8 p-5 bg-parch/50 border border-bdr/30 rounded-2xl">
                  <div className="eyebrow mb-3 text-blue font-bold flex items-center gap-2">
                    <span>Gloss</span>
                    {selectedWord.morphology?.partOfSpeech && (
                      <span className="text-[9px] font-bold uppercase tracking-widest bg-blue/10 text-blue px-2 py-0.5 rounded-full">
                        {selectedWord.morphology.partOfSpeech}
                      </span>
                    )}
                  </div>
                  <div className="font-body text-[18px] md:text-[20px] text-ink font-medium leading-snug">
                    {selectedWord.gloss || <span className="text-muted italic">No gloss available</span>}
                  </div>
               </div>

               {selectedWord.morphology && (
                 <div className="mb-10">
                    <div className="eyebrow mb-3 flex items-center gap-2 text-ink">
                      <span>Morphology</span>
                    </div>

                    <div className="mb-4 text-[14px] text-ink2 capitalize font-medium italic">
                      {(() => {
                        const m = selectedWord.morphology;
                        const pos = m.partOfSpeech || (m.tense ? 'verb' : m.case ? 'noun' : '');
                        const parts = [];
                        if (pos === 'noun' || pos === 'pronoun' || m.case) {
                          if (m.case) parts.push(m.case);
                          if (m.number) parts.push(m.number);
                          if (m.gender) parts.push(m.gender);
                          if (pos) parts.push(pos);
                        } else if (pos === 'verb' || m.tense || m.mood) {
                          if (m.person) parts.push(m.person === 'first' ? '1st person' : m.person === 'second' ? '2nd person' : m.person === 'third' ? '3rd person' : m.person);
                          if (m.number) parts.push(m.number);
                          if (m.tense) parts.push(m.tense);
                          if (m.voice) parts.push(m.voice);
                          if (m.mood) parts.push(m.mood);
                          if (!parts.includes('verb')) parts.push('verb');
                        } else {
                          if (pos) parts.push(pos);
                        }
                        return parts.filter(Boolean).join(' ');
                      })()}
                    </div>
                    
                    {/* Compact Paradigm Table */}
                    <div className="border border-bdr/50 rounded-xl overflow-hidden bg-white text-[12px] font-sans">
                       {(() => {
                          const m = selectedWord.morphology || {};
                          const pos = m.partOfSpeech || (m.tense ? 'verb' : m.case ? 'noun' : '');
                          const isNoun = pos === 'noun' || pos === 'pronoun' || m.case;
                          
                          const cases = ["nominative", "genitive", "dative", "accusative", "vocative"];
                          if (m.case && !cases.includes(m.case)) cases.push(m.case);
                          
                          const persons = ["first", "second", "third"];

                          return (
                             <>
                               <div className="bg-parch2 px-3 py-2 border-b border-bdr/50 font-bold text-ink2 text-[11px] uppercase tracking-wider text-center">
                                  {isNoun ? `${pos ? pos.charAt(0).toUpperCase() + pos.slice(1) : 'Declension'}${m.gender ? ` (${m.gender})` : ''}` : `${m.tense || ''} ${m.voice || ''} ${m.mood || ''}`.trim() || 'Conjugation'}
                               </div>
                               
                               <div className="flex divide-x divide-bdr/30 border-b border-bdr/30 text-[10px] font-bold uppercase text-ink3 text-center bg-parch/30">
                                 <div className="w-16 flex-none"></div>
                                 <div className="flex-1 py-1">Singular</div>
                                 <div className="flex-1 py-1">Plural</div>
                               </div>

                               <div className="flex flex-col">
                                  {isNoun ? cases.map(c => {
                                     const isSgActive = m.case === c && m.number === 'singular';
                                     const isPlActive = m.case === c && m.number === 'plural';
                                     
                                     return (
                                        <div key={c} className="flex divide-x divide-bdr/30 border-b border-bdr/30 last:border-b-0 text-center">
                                           <div className="w-16 flex-none flex items-center justify-center text-[10px] uppercase font-bold text-ink3 bg-parch/30">{c.substring(0, 3)}</div>
                                           <div className={cn("flex-1 py-2 flex items-center justify-center font-serif", isHebrew?"font-hebrew":"", isSgActive ? "bg-blue/5 text-blue font-bold" : "text-ink3")}>
                                              {isSgActive ? selectedWord.text : "—"}
                                           </div>
                                           <div className={cn("flex-1 py-2 flex items-center justify-center font-serif", isHebrew?"font-hebrew":"", isPlActive ? "bg-blue/5 text-blue font-bold" : "text-ink3")}>
                                              {isPlActive ? selectedWord.text : "—"}
                                           </div>
                                        </div>
                                     );
                                  }) : persons.map(p => {
                                     const isSgActive = m.person === p && m.number === 'singular';
                                     const isPlActive = m.person === p && m.number === 'plural';
                                     
                                     return (
                                        <div key={p} className="flex divide-x divide-bdr/30 border-b border-bdr/30 last:border-b-0 text-center">
                                           <div className="w-16 flex-none flex items-center justify-center text-[10px] uppercase font-bold text-ink3 bg-parch/30">{p.substring(0, 3)}</div>
                                           <div className={cn("flex-1 py-2 flex items-center justify-center font-serif", isHebrew?"font-hebrew":"", isSgActive ? "bg-blue/5 text-blue font-bold" : "text-ink3")}>
                                              {isSgActive ? selectedWord.text : "—"}
                                           </div>
                                           <div className={cn("flex-1 py-2 flex items-center justify-center font-serif", isHebrew?"font-hebrew":"", isPlActive ? "bg-blue/5 text-blue font-bold" : "text-ink3")}>
                                              {isPlActive ? selectedWord.text : "—"}
                                           </div>
                                        </div>
                                     );
                                  })}
                               </div>
                             </>
                          );
                       })()}
                    </div>
                 </div>
               )}

               <div className="mb-8">
                  <div className="eyebrow mb-3 flex items-center justify-between text-ink">
                     <span>Your Knowledge</span>
                  </div>
                  <div className="flex gap-2">
                     {[WordState.NEW, WordState.LEARNING, WordState.KNOWN, WordState.IGNORED].map(state => {
                        const isActive = (knowledge[selectedWord.lemma] === state || 
                             ((knowledge[selectedWord.lemma] as any)?.state === state) ||
                             (!knowledge[selectedWord.lemma] && state === WordState.NEW));
                        return (
                        <button
                          key={state}
                          onClick={() => setWordState(selectedWord.lemma, state, selectedWord.gloss)}
                          className={cn(
                             "flex-1 py-3 md:py-4 rounded-xl border flex flex-col items-center gap-1 transition-all",
                             isActive ? "shadow-sm transform scale-105" : "bg-white border-bdr/50 hover:bg-parch opacity-60 hover:opacity-100"
                          )}
                          style={isActive ? { backgroundColor: STATE_COLORS[state].bg, borderColor: STATE_COLORS[state].border } : {}}
                        >
                           <div 
                             className="w-3 h-3 rounded-full mb-1 border border-black/10"
                             style={{ backgroundColor: STATE_COLORS[state].border === 'transparent' ? '#EAE5D9' : STATE_COLORS[state].border }}
                           />
                           <span className="text-[9px] font-bold tracking-widest uppercase text-ink">
                             {STATE_LABELS[state]}
                           </span>
                        </button>
                     )})}
                  </div>
               </div>

               {/* Notes Section */}
               <div className="mb-8">
                  <div className="eyebrow mb-3 text-ink">Personal Notes</div>
                  <textarea
                    className="w-full h-24 p-3 bg-white border border-bdr rounded-xl text-[13px] font-body resize-none focus:outline-none focus:border-blue transition-colors"
                    placeholder="Add a note about this word..."
                    value={getWordInfo(selectedWord.lemma).notes || ''}
                    onChange={(e) => setWordNote(selectedWord.lemma, e.target.value)}
                  />
               </div>

               {/* Example sentences */}
               {exampleSentences.length > 0 && (
                 <div className="mt-8 pt-8 border-t border-bdr/30">
                    <div className="eyebrow mb-4 flex justify-between">
                       <span>Occurrences in Library</span>
                       <span className="text-blue">{exampleSentences.length} matches</span>
                    </div>
                    <div className="space-y-4">
                       {exampleSentences.map((ex: any, idx: number) => {
                          return (
                            <div key={idx} className="p-3 bg-parch/30 rounded-xl border border-bdr/20 text-[14px]">
                               <p className={cn("font-serif mb-2 text-ink2", isHebrew?"font-hebrew":"")} dir={isHebrew?"rtl":"ltr"}>
                                  {ex.sentence.tokens.map((t: any, i: number) => (
                                     <span key={i}>
                                        {t.punctBefore}
                                        <span className={cn(t.lemma === selectedWord.lemma ? "font-bold text-blue" : "")}>
                                           {t.surface}
                                        </span>
                                        {t.punctAfter}
                                     </span>
                                  ))}
                               </p>
                               <p className="font-body italic text-muted text-[12px]">{ex.sentence.translation}</p>
                            </div>
                          );
                       })}
                    </div>
                 </div>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ReaderTutorial currentStep={tutorialStep} onDismiss={dismissTutorial} />
    </div>
  );
};
