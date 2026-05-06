import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronRight, ChevronLeft, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getChapters } from '../data/chapters';
import { CorpusDB } from '../data/corpus';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, setDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '@/lib/firebase';

export const Reader = ({ text, onBack }: { text: any, onBack: () => void }) => {
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTranslit, setShowTranslit] = useState(false);
  const [fontSize, setFontSize] = useState(21);
  const [scrollProgress, setScrollProgress] = useState(0);

  const chapters = useMemo(() => {
    // If this is a real Corpus DB text (string IDs like 'Mt' or 'Gen')
    if (typeof text?.id === 'string' && CorpusDB.getText(text.id)) {
      const realText = CorpusDB.getText(text.id);
      return realText?.sectionsPreview?.map(preview => {
        const section = CorpusDB.getSection(preview.id);
        if (!section) return { id: preview.id, title: preview.label, tokens: [], translation: '' };
        // Flatten sentences into tokens array for Reader
        const tokens = section.sentences.flatMap((s: any) => s.tokens.map((t: any) => ({
          id: t.id,
          text: t.surface,
          lemma: t.lemma,
          gloss: t.gloss,
          morphology: t.morphology,
          translit: t.transliteration,
          status: 'New', // default
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
    }
    // Fallback to legacy mock data
    return getChapters(text?.id || 104);
  }, [text?.id]);

  const [currentChapterIndex, setCurrentChapterIndex] = useState(() => {
    const saved = localStorage.getItem(`reader_chapter_${text?.id}`);
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const chapter = chapters[currentChapterIndex] || chapters[0];
  const [currentTokens, setCurrentTokens] = useState<any[]>([]);

  const isHebrew = text?.language === 'Biblical Hebrew' || text?.language === 'Aramaic' || text?.language === 'Syriac' || text?.language === 'hbo';

  useEffect(() => {
    if (text?.id) {
      localStorage.setItem(`reader_chapter_${text.id}`, currentChapterIndex.toString());
    }
  }, [currentChapterIndex, text?.id]);

  useEffect(() => {
    const fetchVocab = async () => {
      let savedStatuses: Record<string, string> = {};
      
      if (auth.currentUser) {
        try {
          const vocabQuery = query(collection(db, 'vocabulary'), where('userId', '==', auth.currentUser.uid));
          const snap = await getDocs(vocabQuery);
          snap.forEach(d => {
            const data = d.data();
            savedStatuses[`${text?.language || 'Lang'}_${data.term}`] = data.status;
          });
        } catch (e) {
          console.error(e);
        }
      } else {
        const savedStatusesStr = localStorage.getItem('user_vocab_statuses');
        if (savedStatusesStr) {
          try { savedStatuses = JSON.parse(savedStatusesStr); } catch (e) {}
        }
      }

      const initialTokens = chapter.tokens.map((t: any) => {
        const key = `${text?.language || 'Lang'}_${t.lemma || t.text}`;
        return { ...t, status: savedStatuses[key] || t.status };
      });
      
      setCurrentTokens(initialTokens);
      setScrollProgress(0);
    };

    fetchVocab();
  }, [chapter, text?.id, text?.language]);

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

  // Adjust handleKeyDown to match UI components
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedWord && e.key === 'ArrowRight') {
        const firstToken = currentTokens[0];
        if (firstToken) setSelectedWord(firstToken);
        return;
      }
      if (selectedWord) {
        const currentIndex = currentTokens.findIndex(t => t.id === selectedWord.id);
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (currentIndex < currentTokens.length - 1) setSelectedWord(currentTokens[currentIndex + 1]);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (currentIndex > 0) setSelectedWord(currentTokens[currentIndex - 1]);
        } else if (e.key === 'Escape') {
          setSelectedWord(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWord, currentTokens]);

  const handleStatusChange = async (wordId: number, status: string) => {
    let affectedToken: any = null;
    setCurrentTokens(prev => prev.map(t => {
      if (t.id === wordId) {
         affectedToken = { ...t, status };
         return affectedToken;
      } return t;
    }));
    
    if (selectedWord?.id === wordId) setSelectedWord((prev: any) => ({ ...prev, status }));

    if (affectedToken) {
      const key = `${text?.language || 'Lang'}_${affectedToken.lemma || affectedToken.text}`;
      
      if (auth.currentUser) {
        // Sync to Firestore
        const termId = key.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 50); // safe doc ID
        try {
          const docRef = doc(db, 'vocabulary', `${auth.currentUser.uid}_${termId}`);
          await setDoc(docRef, {
            userId: auth.currentUser.uid,
            term: affectedToken.lemma || affectedToken.text,
            translit: affectedToken.translit || '',
            definition: affectedToken.gloss || '',
            language: text?.language || 'Unknown',
            status: status,
            nextReview: new Date(Date.now() + 86400000), // tomorrow
            interval: 1,
            ease: 2.5,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'vocabulary');
        }
      } else {
        const savedStatusesStr = localStorage.getItem('user_vocab_statuses');
        let savedStatuses: Record<string, string> = {};
        if (savedStatusesStr) {
          try { savedStatuses = JSON.parse(savedStatusesStr); } catch (e) {}
        }
        savedStatuses[key] = status;
        localStorage.setItem('user_vocab_statuses', JSON.stringify(savedStatuses));
      }
    }
  };

  const handleMarkAllKnownAndAdvance = async () => {
    const tokensToMark = currentTokens.filter(t => !t.status || t.status === 'New');
    
    // Optimistic UI update
    setCurrentTokens(prev => prev.map(t => {
      if (!t.status || t.status === 'New') {
        return { ...t, status: 'Known' };
      }
      return t;
    }));

    if (auth.currentUser) {
      try {
        const batch = writeBatch(db);
        let count = 0;
        
        // We need to keep track of unique lemmas so we don't try to write the same doc twice in a batch
        const uniqueLemmas = new Set<string>();

        for (const token of tokensToMark) {
          const lemmaStr = token.lemma || token.text;
          if (uniqueLemmas.has(lemmaStr)) continue;
          uniqueLemmas.add(lemmaStr);

          const key = `${text?.language || 'Lang'}_${lemmaStr}`;
          const termId = key.replace(/[^a-zA-Z0-9_\-]/g, '_').substring(0, 50);
          
          const docRef = doc(db, 'vocabulary', `${auth.currentUser.uid}_${termId}`);
          batch.set(docRef, {
            userId: auth.currentUser.uid,
            term: lemmaStr,
            translit: token.translit || '',
            definition: token.gloss || '',
            language: text?.language || 'Unknown',
            status: 'Known',
            nextReview: new Date(Date.now() + 86400000), // tomorrow
            interval: 1,
            ease: 2.5,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          count++;
          if (count >= 500) break; // max batch size
        }
        if (count > 0) {
          await batch.commit();
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, 'vocabulary');
      }
    } else {
      const savedStatusesStr = localStorage.getItem('user_vocab_statuses');
      let savedStatuses: Record<string, string> = {};
      if (savedStatusesStr) {
        try { savedStatuses = JSON.parse(savedStatusesStr); } catch (e) {}
      }
      for (const token of tokensToMark) {
        const key = `${text?.language || 'Lang'}_${token.lemma || token.text}`;
        savedStatuses[key] = 'Known';
      }
      localStorage.setItem('user_vocab_statuses', JSON.stringify(savedStatuses));
    }
    
    // Advance to next chapter if available
    if (currentChapterIndex < chapters.length - 1) {
       setCurrentChapterIndex(currentChapterIndex + 1);
       setSelectedWord(null);
    }
  };

  const getWordClasses = (token: any, isSelected: boolean) => {
    const base = "cursor-pointer transition-colors px-0.5 rounded-sm inline-block";
    
    let styleClass = "";
    if (isSelected) {
      styleClass = "bg-bluexl underline decoration-blue decoration-2 underline-offset-4";
    } else {
      switch(token.status) {
        case 'New': styleClass = "underline decoration-[#6894C0] decoration-2 underline-offset-4 decoration-dashed hover:bg-[#1E3D6E0f]"; break;
        case 'Learning': styleClass = "underline decoration-amber decoration-2 underline-offset-4 hover:bg-[#1E3D6E0f]"; break;
        case 'Familiar': styleClass = "underline decoration-jade decoration-2 underline-offset-4 hover:bg-[#1E3D6E0f]"; break;
        case 'Ignored': styleClass = "opacity-50 hover:bg-[#1E3D6E0f]"; break;
        case 'Known': styleClass = "hover:bg-[#1E3D6E0f]"; break;
        default: styleClass = "underline decoration-[#6894C0] decoration-2 underline-offset-4 decoration-dashed hover:bg-[#1E3D6E0f]";
      }
    }
    return cn(base, styleClass);
  };

  const isMobile = window.innerWidth < 768;

  return (
    <div className="flex h-screen bg-parch text-ink font-sans overflow-hidden">
      
      {/* History Sidebar */}
      <AnimatePresence>
        {(showHistory) && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: isMobile ? '100%' : 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className={cn(
              "border-r border-bdr bg-parch2 flex flex-col z-40 overflow-hidden flex-shrink-0",
              isMobile ? "absolute inset-0" : ""
            )}
          >
            <div className="p-4 border-b border-bdr flex justify-between items-center">
              <span className="font-serif font-medium text-[15px]">📜 Text history</span>
              <button className="text-muted hover:text-ink transition-colors" onClick={() => setShowHistory(false)}>✕</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 border-b border-bdr">
                <div className="eyebrow text-gold mb-2">Author</div>
                <p className="font-body text-[11.5px] leading-[1.55] text-ink2">{text?.author || "Traditional"}</p>
              </div>
              <div className="p-4 border-b border-bdr">
                <div className="eyebrow text-gold mb-2">Historical Context</div>
                <p className="font-body text-[11.5px] leading-[1.55] text-ink2">
                  Written during the {text?.era || "ancient period"}, tracking the development of cultural and theological understanding within its original audience.
                </p>
              </div>
              <div className="p-4 border-b border-bdr">
                <div className="eyebrow text-gold mb-2">Why It Matters</div>
                <p className="font-body text-[11.5px] leading-[1.55] text-ink2">
                  Considered foundational literature, offering insight into narrative conventions and linguistic shifts over time in the {text?.language} corpus.
                </p>
              </div>
            </div>
            <div className="p-4 pt-3 flex justify-center border-t border-bdr bg-parch2 mt-auto">
               <span className="pill bg-jadexl text-jade border-jade/20 font-mono" style={{fontSize: '9px'}}>✓ Complete Survival</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Reading Area */}
      <div className="flex-1 flex flex-col relative z-20 overflow-hidden bg-parch paper-texture">
        
        {/* Top Bar */}
        <div className="h-12 border-b border-bdr flex items-center justify-between px-4 bg-parch2/90 backdrop-blur-sm z-10 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-1 text-muted hover:text-ink transition-colors mr-2">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="text-[11px] font-sans text-ink3 flex items-center">
              Library <span className="mx-1 text-muted">›</span> 
              <span className="font-medium text-ink truncate max-w-[120px] md:max-w-xs">{text?.title || "Unknown"}</span>
              <span className="mx-1 text-muted">›</span> 
              <span className="truncate max-w-[80px]">{chapter.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!showHistory && (
              <button onClick={() => setShowHistory(true)} className="pill bg-parch text-ink3 border-bdr hover:bg-parch2 text-[10px] py-1 px-2.5 hidden md:block">
                📜 History
              </button>
            )}
            <button onClick={() => setShowTranslation(!showTranslation)} className={cn("pill border text-[10px] py-1 px-2.5 transition-colors", showTranslation ? "bg-bluexl text-blue border-blue/20" : "bg-parch text-ink3 border-bdr hover:bg-parch2")}>
              Translation
            </button>
            <button onClick={() => setShowTranslit(!showTranslit)} className={cn("pill border text-[10px] py-1 px-2.5 transition-colors hidden sm:block", showTranslit ? "bg-bluexl text-blue border-blue/20" : "bg-parch text-ink3 border-bdr hover:bg-parch2")}>
              Translit.
            </button>
            <div className="flex bg-parch2 rounded-full border border-bdr overflow-hidden ml-1">
              <button className="px-2 py-0.5 text-ink3 hover:bg-parch3 hover:text-ink" onClick={() => setFontSize(Math.max(16, fontSize - 2))}>
                <span className="text-[10px] font-serif font-bold">A-</span>
              </button>
              <button className="px-2 py-0.5 text-ink3 hover:bg-parch3 hover:text-ink" onClick={() => setFontSize(Math.min(48, fontSize + 2))}>
                <span className="text-[11px] font-serif font-bold">A+</span>
              </button>
            </div>
          </div>
        </div>

        {/* Text Pane */}
        <div id="reading-area-scroll" className="flex-1 overflow-y-auto px-7 md:px-10 lg:px-14 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="eyebrow mb-8 text-center md:text-left">
              Corpus <span className="mx-1.5 opacity-40">•</span> {text?.language} <span className="mx-1.5 opacity-40">•</span> {chapter.title}
            </div>
            
            <div className={cn("font-serif leading-[2.1] tracking-[0.008em] pb-12", isHebrew ? "font-hebrew text-right" : "")} dir={isHebrew ? "rtl" : "ltr"}>
               {currentTokens.map((token: any) => (
                  <span key={token.id} className="inline whitespace-pre-wrap">
                    {token.punctBefore && <span>{token.punctBefore}</span>}
                    <span
                      id={`word-${token.id}`}
                      onClick={() => setSelectedWord(token)}
                      className={getWordClasses(token, selectedWord?.id === token.id)}
                      style={{ fontSize: `${fontSize}px` }}
                    >
                       {token.text}
                    </span>
                    {token.punctAfter ? <span>{token.punctAfter}</span> : <span> </span>}
                  </span>
               ))}
               <span className="text-muted ml-2 opacity-50 text-[18px]">❧</span>
            </div>

            {showTranslation && (
              <div className="mt-12 pt-6 border-t border-bdr/40">
                <p className="font-body italic text-[14px] text-ink2 leading-[1.7]">
                  {chapter.translation}
                </p>
                <div className="font-mono text-[9px] text-muted mt-2 uppercase tracking-widest text-right">
                   Source: Standard Edition Translation
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Legend / Progress */}
        <div className="shrink-0 bg-parch2 border-t border-bdr flex flex-col z-30">
          <div className="h-6 flex items-center justify-between px-4 border-b border-bdr/50 bg-parch">
             <div className="flex gap-4">
               <div className="flex items-center gap-1.5">
                 <span className="w-3 h-px border-b-2 border-dashed border-[#6894C0]"></span>
                 <span className="text-[9px] uppercase font-mono text-muted hidden sm:inline">New</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <span className="w-3 h-0.5 border-b-2 border-solid border-amber"></span>
                 <span className="text-[9px] uppercase font-mono text-muted hidden sm:inline">Learning</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <span className="w-3 h-0.5 border-b-2 border-solid border-jade"></span>
                 <span className="text-[9px] uppercase font-mono text-muted hidden sm:inline">Familiar</span>
               </div>
               <div className="flex items-center gap-1.5">
                 <span className="w-3 h-0.5 border-b-2 border-solid border-transparent"></span>
                 <span className="text-[9px] uppercase font-mono text-muted hidden sm:inline">Known</span>
               </div>
             </div>
             <div className="text-[9px] font-mono text-muted uppercase">← → keys to navigate</div>
          </div>
          <div className="h-0.5 w-full bg-parch3 flex items-center">
            <div className="h-full bg-blue transition-all duration-300" style={{ width: `${scrollProgress}%` }} />
          </div>
          <div className="h-10 flex items-center justify-between px-4 text-[11px] font-sans">
             <div className="flex items-center gap-4">
               <span className="text-ink3 font-medium hidden sm:inline">{chapter.title}</span>
               <span className="text-muted font-mono">{Math.round(scrollProgress)}% Complete</span>
             </div>
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => currentChapterIndex > 0 && setCurrentChapterIndex(currentChapterIndex - 1)}
                 className={cn("hover:text-blue transition-colors", currentChapterIndex === 0 ? "text-muted cursor-not-allowed" : "text-ink2")}
               >
                 Prev Section
               </button>
               <div className="hidden md:block w-px h-4 bg-bdr mx-1" />
               <button 
                 onClick={handleMarkAllKnownAndAdvance}
                 className="pill bg-[#1E3D6E0f] text-blue hover:bg-bluexl px-2.5 py-1 font-medium transition-colors hidden md:flex items-center gap-1 opacity-90 hover:opacity-100"
               >
                 Mark page read <ChevronRight className="w-3 h-3" />
               </button>
               <button 
                 onClick={() => currentChapterIndex < chapters.length - 1 && setCurrentChapterIndex(currentChapterIndex + 1)}
                 className={cn("hover:text-blue transition-colors font-medium", currentChapterIndex === chapters.length - 1 ? "text-muted cursor-not-allowed" : "text-blue")}
               >
                 Next Section
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Word Panel */}
      <AnimatePresence>
        {(selectedWord) && (
          <motion.div
            initial={{ width: 0, opacity: 0, x: isMobile ? 0 : 50, y: isMobile ? 100 : 0 }}
            animate={{ width: isMobile ? '100%' : 280, opacity: 1, x: 0, y: 0 }}
            exit={{ width: 0, opacity: 0, x: isMobile ? 0 : 50, y: isMobile ? 100 : 0 }}
            className={cn(
               "bg-[#FEFAF4] border-l border-bdr flex flex-col z-50 overflow-hidden flex-shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.03)]",
               isMobile ? "absolute bottom-0 left-0 h-[50%] rounded-t-2xl border-t border-l-0 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] w-full" : "h-full"
            )}
          >
            {/* Header */}
            <div className="h-12 border-b border-bdr flex items-center justify-between px-3 bg-parch shrink-0">
               <div className="flex gap-2 text-ink3">
                  <button className="p-1 hover:bg-parch3 rounded transition-colors"><ChevronLeft className="w-4 h-4"/></button>
                  <button className="p-1 hover:bg-parch3 rounded transition-colors"><ChevronRight className="w-4 h-4"/></button>
               </div>
               <button onClick={() => setSelectedWord(null)} className="text-muted hover:text-ink"><span className="text-sm font-bold">✕</span></button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6">
              {/* Form Section */}
              <div className="mb-6">
                 <div className={cn("text-[32px] font-serif leading-none mb-1 text-ink", isHebrew?"font-hebrew":"")} dir={isHebrew?"rtl":"ltr"}>
                   {selectedWord.text}
                 </div>
                 {selectedWord.translit && <div className="font-mono italic text-xs text-muted mb-4">{selectedWord.translit}</div>}
                 
                 <div className="flex items-center gap-2 mb-1">
                   <span className="eyebrow">Lemma</span>
                   <span className={cn("font-serif text-[17px] text-blue", isHebrew?"font-hebrew":"")} dir={isHebrew?"rtl":"ltr"}>{selectedWord.lemma || selectedWord.text}</span>
                 </div>
                 {selectedWord.strongs && <div className="font-mono text-[9px] text-muted tracking-widest uppercase">Strong's {selectedWord.strongs}</div>}
              </div>

              {/* Meaning Section */}
              <div className="mb-6 border-t border-bdr/50 pt-5">
                 <div className="eyebrow mb-2">Meaning</div>
                 <div className="font-body text-[13.5px] font-medium text-ink mb-1">
                   {selectedWord.gloss || "Translation not available"}
                 </div>
                 {selectedWord.extendedMeaning && (
                   <div className="font-body italic text-[12.5px] text-ink2 pl-3 border-l-2 border-parch3 mb-2">
                     {selectedWord.extendedMeaning}
                   </div>
                 )}
                 {selectedWord.synonyms && (
                   <div className="font-body text-[12.5px] text-ink3 mb-2">
                     <span className="italic mr-1">Also:</span> {selectedWord.synonyms}
                   </div>
                 )}
                 {selectedWord.lexicons && <div className="font-mono text-[9px] text-muted">{selectedWord.lexicons}</div>}
              </div>

              {/* Morphology Section */}
              {selectedWord.morphology && (
                <div className="mb-6 border-t border-bdr/50 pt-5">
                    <div className="eyebrow mb-2">Morphology</div>
                    {selectedWord.morphology.code && (
                      <div className="inline-block bg-bluexl text-blue border border-blue/20 rounded px-1.5 py-0.5 font-mono text-[10px] mb-3">
                        {selectedWord.morphology.code}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      {Object.entries(selectedWord.morphology).map(([key, val]) => {
                        if (key === 'code') return null;
                        return (
                          <div key={key} className="flex flex-col">
                            <span className="text-[9px] font-mono text-muted uppercase">{key}</span>
                            <span className="text-[11.5px] font-sans text-ink">{val as string}</span>
                          </div>
                        )
                      })}
                    </div>
                </div>
              )}

              {/* Frequency Stats */}
              {(selectedWord.occurrences || selectedWord.frequencyTier) && (
                <div className="mb-6 flex gap-3">
                   {selectedWord.occurrences && (
                     <div className="flex-1 bg-parch2 rounded-xl p-3 border border-bdr text-center">
                        <div className="text-[17px] font-serif text-ink mb-0.5">{selectedWord.occurrences}</div>
                        <div className="text-[9px] font-mono uppercase text-muted tracking-widest">Occurrences</div>
                     </div>
                   )}
                   {selectedWord.frequencyTier && (
                     <div className="flex-1 bg-parch2 rounded-xl p-3 border border-bdr text-center">
                        <div className="text-[17px] font-sans font-medium text-amber mb-0.5">{selectedWord.frequencyTier}</div>
                        <div className="text-[9px] font-mono uppercase text-muted tracking-widest">Frequency Tier</div>
                     </div>
                   )}
                </div>
              )}

              {/* Grammar Ref */}
              {selectedWord.grammarNote && (
                <div className="mb-8">
                   <button className="pill bg-bluexl text-blue border-blue/20 py-1.5 px-3 w-auto flex items-center gap-2 hover:bg-blue/10 transition-colors">
                     <Bookmark className="w-3 h-3"/> {selectedWord.grammarNote}
                   </button>
                </div>
              )}

              {/* Vocab Status Toggle */}
              <div className="mb-6">
                <div className="flex p-1 bg-parch border border-bdr rounded-full mb-3 shadow-[0_1px_2px_rgba(35,20,10,0.02)_inset]">
                   {['Ignored', 'Learning', 'Familiar', 'Known'].map(status => {
                     const isActive = (selectedWord.status === status) || (status === 'Learning' && (!selectedWord.status || selectedWord.status === 'New'));
                     let activeClass = "";
                     if (status === 'Ignored') activeClass = "bg-parch3 text-ink2 border-bdr ring-1 ring-bdr/50 shadow-sm";
                     if (status === 'Learning') activeClass = "bg-amberxl text-amber ring-2 ring-amber/30 border-amber/20 shadow-sm";
                     if (status === 'Familiar') activeClass = "bg-jadexl text-jade ring-2 ring-jade/30 border-jade/20 shadow-sm";
                     if (status === 'Known') activeClass = "bg-bluexl text-blue ring-2 ring-blue/30 border-blue/20 shadow-sm";
                     
                     return (
                       <button 
                         key={status}
                         onClick={() => handleStatusChange(selectedWord.id, status)}
                         className={cn(
                           "flex-1 text-[10px] font-bold uppercase tracking-widest py-1.5 rounded-full transition-all text-center",
                           isActive ? activeClass : "text-muted hover:text-ink border border-transparent"
                         )}
                       >
                         {status}
                       </button>
                     );
                   })}
                </div>
                <button className={cn(
                  "w-full text-center py-2.5 rounded-xl font-bold font-sans text-[13px] transition-colors border",
                  selectedWord.status !== 'Known' ? "bg-blue text-white border-blue shadow-sm hover:shadow-md hover:-translate-y-px" : "bg-jadexl text-jade border-jade/30"
                )}>
                  {selectedWord.status !== 'Known' ? "Add to review queue" : "✓ In review queue"}
                </button>
              </div>

              {/* Notes Section */}
              <div className="border-t border-bdr/50 pt-5 pb-8">
                <button className="w-full py-3 border border-dashed border-bdr text-ink3 text-[12.5px] font-sans font-medium rounded-xl hover:bg-parch2 transition-colors flex items-center justify-center gap-2">
                  <span className="text-muted">✎</span> Add a note about this word
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
