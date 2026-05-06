import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Languages, Eye, Maximize2, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LexDrawer } from '../components/LexDrawer';
import { getChapter } from '../data/chapters';

export const Reader = ({ text, onBack }: { text: any, onBack: () => void }) => {
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [fontSize, setFontSize] = useState(28);
  const [focusMode, setFocusMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const chapter = getChapter(text?.id || 104);
  const [currentTokens, setCurrentTokens] = useState<any[]>(chapter.tokens);
  const [hasMore, setHasMore] = useState(false); // Can be enhanced later to load more chapters

  let isRTL = text?.language === 'Hebrew' || text?.language === 'Aramaic' || text?.language === 'Syriac';
  let fontClass = "font-greek";
  if (text?.language === 'Hebrew' || text?.language === 'Aramaic' || text?.language === 'Syriac') fontClass = "font-hebrew";
  else if (text?.language === 'Egyptian' || text?.language === 'Sanskrit' || text?.language === 'Latin' || text?.language === 'Akkadian' || text?.language === 'Coptic' || text?.language === 'Hittite') fontClass = "font-sans";

  let translationText = chapter.translation;

  useEffect(() => {
    setCurrentTokens(chapter.tokens);
  }, [text?.id]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadMore = () => {
    if (!hasMore) return;
    setHasMore(false); // just disable it for now since we load all at once per chapter
  };

  const getStatusColor = (status: string, isSelected: boolean) => {
    if (isSelected) return "text-gold-600";
    switch(status) {
      case 'Known': return "text-green-600 dark:text-green-400";
      case 'Familiar': return "text-gold-600 dark:text-gold-400";
      case 'Seen Once': return "text-blue-600 dark:text-blue-400";
      default: return "text-obsidian-900 dark:text-vellum-100";
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

          {hasMore && (
            <div className="mt-16 flex justify-center">
              <button
                onClick={loadMore}
                className="px-8 py-3 rounded-full border border-black/10 dark:border-white/10 text-xs font-bold uppercase tracking-widest hover:border-gold-500/50 hover:text-gold-600 transition-all duration-300"
              >
                Continue Reading
              </button>
            </div>
          )}

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

      {/* Lexical Drawer */}
      <LexDrawer 
        word={selectedWord} 
        isOpen={!!selectedWord} 
        onClose={() => setSelectedWord(null)} 
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
