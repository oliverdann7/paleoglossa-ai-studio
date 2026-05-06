import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Languages, Eye, Maximize2, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FastWordPopup } from '../components/FastWordPopup';
import { LexDrawer } from '../components/LexDrawer';
import { getChapter } from '../data/chapters';

export const Reader = ({ text, onBack }: { text: any, onBack: () => void }) => {
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [panelWord, setPanelWord] = useState<any>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [fontSize, setFontSize] = useState(28);
  const [focusMode, setFocusMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const chapter = getChapter(text?.id || 104);
  const [currentTokens, setCurrentTokens] = useState<any[]>(chapter.tokens);

  let isRTL = text?.language === 'Hebrew' || text?.language === 'Aramaic' || text?.language === 'Syriac';
  let fontClass = "font-greek";
  if (text?.language === 'Hebrew' || text?.language === 'Aramaic' || text?.language === 'Syriac') fontClass = "font-hebrew";
  else if (text?.language === 'Egyptian' || text?.language === 'Sanskrit' || text?.language === 'Latin' || text?.language === 'Akkadian' || text?.language === 'Coptic' || text?.language === 'Hittite') fontClass = "font-sans";

  let translationText = chapter.translation;

  useEffect(() => {
    setCurrentTokens(chapter.tokens);
  }, [text?.id]);

  const handleStatusChange = (wordId: number, status: string) => {
    setCurrentTokens(prev => prev.map(t => t.id === wordId ? { ...t, status } : t));
    if (selectedWord?.id === wordId) setSelectedWord((prev: any) => ({ ...prev, status }));
  };

  useEffect(() => {
    if (selectedWord) {
      const el = document.getElementById(`word-${selectedWord.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        const isInView = (
          rect.top >= 100 &&
          rect.bottom <= (window.innerHeight - 200)
        );
        if (!isInView) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [selectedWord]);

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
          if (currentIndex < currentTokens.length - 1) {
            setSelectedWord(currentTokens[currentIndex + 1]);
          }
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (currentIndex > 0) {
            setSelectedWord(currentTokens[currentIndex - 1]);
          }
        } else if (e.key === 'Escape') {
          setSelectedWord(null);
          setPanelWord(null);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (!panelWord) setPanelWord(selectedWord);
        } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
          e.preventDefault();
          const statusMap: Record<string, string> = {
            '1': 'New',
            '2': 'Seen Once',
            '3': 'Learning',
            '4': 'Familiar',
            '5': 'Known'
          };
          const newStatus = statusMap[e.key];
          if (newStatus) {
            handleStatusChange(selectedWord.id, newStatus);
            // Auto advance
            if (currentIndex < currentTokens.length - 1) {
              setSelectedWord(currentTokens[currentIndex + 1]);
            } else {
              setSelectedWord(null);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWord, currentTokens, panelWord]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getStatusColor = (status: string, isSelected: boolean) => {
    if (isSelected) return "text-gold-600 bg-black/5 dark:bg-white/5";
    switch(status) {
      case 'New': return "text-blue-600 dark:text-blue-400 font-semibold";
      case 'Seen Once': return "text-blue-400 dark:text-blue-300";
      case 'Learning': return "text-amber-600 dark:text-amber-400";
      case 'Familiar': return "text-gold-600 dark:text-gold-400";
      case 'Known': return "text-obsidian-900 dark:text-vellum-100"; // clean reading
      case 'Ignored': return "text-obsidian-900/40 dark:text-vellum-100/40"; // faded
      default: return "text-blue-600 dark:text-blue-400"; // assume new by default
    }
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-1000 ease-in-out",
      focusMode ? "bg-vellum-100 dark:bg-obsidian-950" : "bg-vellum-50 dark:bg-obsidian-950"
    )}>
      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-black/5 dark:bg-white/5 z-[100]">
        <motion.div 
          className="h-full bg-gold-500"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Top Bar */}
      <AnimatePresence>
        {!focusMode && (
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-0 left-64 right-0 h-24 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-12 z-50 bg-vellum-50/80 dark:bg-obsidian-950/80 backdrop-blur-xl"
          >
            <div className="flex items-center gap-8">
              <button 
                onClick={onBack}
                className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <h2 className="text-xl font-serif font-bold tracking-tight">{text?.title || "Gospel of John"}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gold-600 uppercase tracking-[0.2em]">Book I • Chapter 1</span>
                  <span className="w-1 h-1 rounded-full bg-black/10 dark:bg-white/10" />
                  <span className="text-[10px] font-bold text-obsidian-900/40 dark:text-vellum-100/40 uppercase tracking-[0.2em]">{text?.language}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex bg-black/5 dark:bg-white/5 rounded-full p-1 border border-black/5 dark:border-white/5">
                <button 
                  onClick={() => setFontSize(Math.max(16, fontSize - 2))}
                  className="p-2.5 rounded-full hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm active:scale-90"
                >
                  <span className="text-xs font-bold">A</span>
                </button>
                <button 
                  onClick={() => setFontSize(Math.min(64, fontSize + 2))}
                  className="p-2.5 rounded-full hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm active:scale-90"
                >
                  <span className="text-lg font-bold leading-none">A</span>
                </button>
              </div>
              <button 
                onClick={() => setShowTranslation(!showTranslation)}
                className={cn(
                  "p-3.5 rounded-full transition-all border border-black/5 dark:border-white/5 active:scale-95",
                  showTranslation ? "bg-gold-500 text-vellum-50 shadow-lg shadow-gold-500/20" : "bg-black/5 dark:bg-white/5"
                )}
              >
                <Languages className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setFocusMode(!focusMode)}
                className="p-3.5 bg-black/5 dark:bg-white/5 rounded-full border border-black/5 dark:border-white/5 active:scale-95"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Reading Canvas */}
      <main className={cn(
        "editorial-container pt-56 pb-64 transition-all duration-1000 ease-in-out",
        focusMode ? "max-w-2xl" : "max-w-4xl"
      )}>
        <div className="relative">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.03 } }
            }}
            className={cn(
              "flex flex-wrap gap-x-3 gap-y-12 leading-[2.5] justify-center px-4 sm:px-8",
              fontClass
            )} dir={isRTL ? "rtl" : "ltr"}>
            {currentTokens.map((token: any) => (
              <motion.span
                key={token.id}
                id={`word-${token.id}`}
                variants={{
                  hidden: { opacity: 0, y: 10, filter: 'blur(2px)' },
                  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.5, ease: "easeOut" } }
                }}
                whileHover={{ y: -3, scale: 1.02, color: 'var(--tw-colors-gold-600)' }}
                onClick={() => setSelectedWord(token)}
                className={cn(
                  "cursor-pointer transition-colors duration-300 relative group px-2 py-1 rounded-xl hover:bg-black/5 dark:hover:bg-white/5",
                  "font-medium tracking-normal",
                  getStatusColor(token.status, selectedWord?.id === token.id)
                )}
                style={{ fontSize: `${fontSize}px` }}
              >
                {token.text}
                <span className={cn(
                  "absolute -bottom-1 left-1 w-[calc(100%-8px)] h-0.5 bg-gold-500/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-full",
                  selectedWord?.id === token.id && "scale-x-100 bg-gold-500"
                )} />
              </motion.span>
            ))}
          </motion.div>

          <AnimatePresence>
            {showTranslation && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="mt-32 p-16 rounded-[40px] bg-gold-500/5 border border-gold-500/10 relative overflow-hidden paper-texture"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gold-500/20" />
                <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-600 mb-8 flex items-center gap-3">
                  <Eye className="w-4 h-4" />
                  Parallel Translation
                </h4>
                <p className="text-3xl font-serif italic text-obsidian-900/70 dark:text-vellum-100/70 leading-relaxed tracking-tight">
                  {translationText}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section Completion & Stats */}
        <div className="mt-32 p-12 bg-white dark:bg-obsidian-900 rounded-[32px] border border-black/5 dark:border-white/5 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
            <div>
              <h3 className="text-2xl font-serif font-bold mb-2">Section Completed</h3>
              <p className="text-obsidian-900/60 dark:text-vellum-100/60">You've reached the end of this chapter.</p>
            </div>
            
            <div className="flex gap-6">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {Math.round((currentTokens.filter(t => t.status === 'Known' || t.status === 'Familiar').length / currentTokens.length) * 100) || 0}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Known</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {currentTokens.filter(t => t.status === 'Learning').length}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Learning</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {currentTokens.filter(t => t.status === 'New' || !t.status).length}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">New</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-gold-500 text-vellum-50 rounded-full text-sm font-bold shadow-lg hover:bg-gold-600 transition-colors">
              Continue to Next Section
            </button>
            <button className="px-6 py-3 bg-obsidian-900 text-vellum-50 dark:bg-vellum-100 dark:text-obsidian-950 rounded-full text-sm font-bold hover:opacity-90 transition-opacity">
              Review New Words
            </button>
            <button 
              onClick={() => setCurrentTokens(prev => prev.map(t => (!t.status || t.status === 'New' ? { ...t, status: 'Known' } : t)))}
              className="px-6 py-3 border border-black/10 dark:border-white/10 rounded-full text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Mark Remaining as Known
            </button>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="mt-48 flex justify-between items-center pt-16 border-t border-black/5 dark:border-white/5">
          <button className="group flex items-center gap-3 text-xs font-bold text-obsidian-900/40 dark:text-vellum-100/40 hover:text-gold-600 transition-all uppercase tracking-widest">
            <div className="p-2 rounded-full border border-black/5 dark:border-white/5 group-hover:border-gold-500/30 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </div>
            Previous Chapter
          </button>
          <button className="group flex items-center gap-3 text-xs font-bold text-obsidian-900/40 dark:text-vellum-100/40 hover:text-gold-600 transition-all uppercase tracking-widest">
            Next Chapter
            <div className="p-2 rounded-full border border-black/5 dark:border-white/5 group-hover:border-gold-500/30 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      </main>

      {/* Fast Word Popup */}
      <FastWordPopup
        word={selectedWord}
        isOpen={!!selectedWord && !panelWord}
        onClose={() => setSelectedWord(null)}
        onOpenPanel={() => setPanelWord(selectedWord)}
        onStatusChange={(wordId, status) => {
          handleStatusChange(wordId, status);
          
          // Auto advance to next word on status change
          const currentIndex = currentTokens.findIndex(t => t.id === wordId);
          if (currentIndex !== -1 && currentIndex < currentTokens.length - 1) {
            setTimeout(() => {
              setSelectedWord(currentTokens[currentIndex + 1]);
            }, 50);
          } else {
             setTimeout(() => {
              setSelectedWord(null);
            }, 50);
          }
        }}
      />

      {/* Lexical Deep Panel */}
      <LexDrawer 
        word={panelWord} 
        isOpen={!!panelWord} 
        onClose={() => setPanelWord(null)} 
        onStatusChange={(wordId, status) => {
          handleStatusChange(wordId, status);
          if (panelWord?.id === wordId) setPanelWord({ ...panelWord, status });
        }}
      />

      {/* Focus Mode Toggle (Floating) */}
      <AnimatePresence>
        {focusMode && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => setFocusMode(false)}
            className="fixed bottom-12 right-12 p-5 bg-obsidian-900 dark:bg-vellum-100 text-vellum-50 dark:text-obsidian-950 rounded-full shadow-2xl z-[100] hover:scale-110 active:scale-95 transition-all"
          >
            <Maximize2 className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
