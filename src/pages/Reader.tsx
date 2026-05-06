import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Languages, Eye, Maximize2, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LexDrawer } from '../components/LexDrawer';
import { 
  greekAlphabetTokens, greekBasicVocabTokens, greekTokens, nextGreekTokens,
  hebrewAlphabetTokens, hebrewBasicVocabTokens, hebrewTokens, nextHebrewTokens,
  egyptianAlphabetTokens, egyptianBasicVocabTokens, egyptianTokens, nextEgyptianTokens,
  sanskritAlphabetTokens, sanskritBasicVocabTokens, sanskritTokens, nextSanskritTokens,
  latinAlphabetTokens, latinBasicVocabTokens, latinTokens, nextLatinTokens, additionalLatinTokens,
  koineGreekAlphabetTokens, koineGreekBasicVocabTokens, koineGreekTokens, nextKoineGreekTokens, additionalKoineGreekTokens,
  aramaicAlphabetTokens, aramaicBasicVocabTokens, aramaicTokens, nextAramaicTokens, additionalAramaicTokens,
  copticAlphabetTokens, copticBasicVocabTokens, copticTokens, nextCopticTokens, additionalCopticTokens,
  akkadianAlphabetTokens, akkadianBasicVocabTokens, akkadianTokens, nextAkkadianTokens, additionalAkkadianTokens,
  syriacAlphabetTokens, syriacBasicVocabTokens, syriacTokens, nextSyriacTokens, additionalSyriacTokens,
  hittiteAlphabetTokens, hittiteBasicVocabTokens, hittiteTokens, nextHittiteTokens, additionalHittiteTokens
} from '../data/tokens';

export const Reader = ({ text, onBack }: { text: any, onBack: () => void }) => {
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [fontSize, setFontSize] = useState(28);
  const [focusMode, setFocusMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [currentTokens, setCurrentTokens] = useState<any[]>(() => {
    switch (text?.id) {
      case 101: return greekAlphabetTokens;
      case 102: return greekBasicVocabTokens;
      case 201: return hebrewAlphabetTokens;
      case 202: return hebrewBasicVocabTokens;
      case 301: return egyptianAlphabetTokens;
      case 302: return egyptianBasicVocabTokens;
      case 401: return sanskritAlphabetTokens;
      case 402: return sanskritBasicVocabTokens;
      case 501: return latinAlphabetTokens;
      case 502: return latinBasicVocabTokens;
      case 601: return koineGreekAlphabetTokens;
      case 602: return koineGreekBasicVocabTokens;
      case 701: return aramaicAlphabetTokens;
      case 702: return aramaicBasicVocabTokens;
      case 801: return copticAlphabetTokens;
      case 802: return copticBasicVocabTokens;
      case 901: return akkadianAlphabetTokens;
      case 902: return akkadianBasicVocabTokens;
      case 1001: return syriacAlphabetTokens;
      case 1002: return syriacBasicVocabTokens;
      case 1101: return hittiteAlphabetTokens;
      case 1102: return hittiteBasicVocabTokens;
      default:
        if (text?.language === 'Hebrew') return hebrewTokens;
        if (text?.language === 'Egyptian') return egyptianTokens;
        if (text?.language === 'Sanskrit') return sanskritTokens;
        if (text?.language === 'Latin') return latinTokens;
        if (text?.language === 'Koine Greek') return koineGreekTokens;
        if (text?.language === 'Aramaic') return aramaicTokens;
        if (text?.language === 'Coptic') return copticTokens;
        if (text?.language === 'Akkadian') return akkadianTokens;
        if (text?.language === 'Syriac') return syriacTokens;
        if (text?.language === 'Hittite') return hittiteTokens;
        return greekTokens;
    }
  });

  const [hasMore, setHasMore] = useState(text?.id ? (text.id % 100 > 2) : true);

  let isRTL = text?.language === 'Hebrew' || text?.language === 'Aramaic' || text?.language === 'Syriac';
  let fontClass = "font-greek";
  if (text?.language === 'Hebrew' || text?.language === 'Aramaic' || text?.language === 'Syriac') fontClass = "font-hebrew";
  else if (text?.language === 'Egyptian' || text?.language === 'Sanskrit' || text?.language === 'Latin' || text?.language === 'Akkadian' || text?.language === 'Coptic' || text?.language === 'Hittite') fontClass = "font-sans";

  let translationText = "In the beginning was the Word, and the Word was with God, and the Word was God.";
  if (text?.language === 'Hebrew') {
    translationText = "In the beginning God created the heaven and the earth.";
  } else if (text?.language === 'Egyptian') {
    translationText = "The jackal is upon the hunter.";
  } else if (text?.language === 'Sanskrit') {
    translationText = "I praise Agni, the high priest of the sacrifice, the divine ministrant.";
  } else if (text?.language === 'Latin') {
    translationText = "Arms and the man I sing.";
  } else if (text?.language === 'Koine Greek') {
    translationText = "Paul, a servant of Jesus Christ...";
  } else if (text?.language === 'Aramaic') {
    translationText = "Then Daniel spoke to the king...";
  } else if (text?.language === 'Coptic') {
    translationText = "Jesus said: He who finds...";
  } else if (text?.language === 'Akkadian') {
    translationText = "He who saw the deep...";
  } else if (text?.language === 'Syriac') {
    translationText = "In the beginning was the Word...";
  } else if (text?.language === 'Hittite') {
    translationText = "Thus speaks His Majesty, Mursili...";
  }

  // Update translation for alphabets/basics
  if (text?.id % 100 === 1) translationText = "The Alphabet";
  if (text?.id % 100 === 2) translationText = "Basic Vocabulary and Sentences";

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
    setHasMore(false); // only 1 extra page for demo
    if (text?.language === 'Hebrew') setCurrentTokens(prev => [...prev, ...nextHebrewTokens]);
    else if (text?.language === 'Egyptian') setCurrentTokens(prev => [...prev, ...nextEgyptianTokens]);
    else if (text?.language === 'Sanskrit') setCurrentTokens(prev => [...prev, ...nextSanskritTokens]);
    else if (text?.language === 'Latin') setCurrentTokens(prev => [...prev, ...nextLatinTokens, ...additionalLatinTokens]);
    else if (text?.language === 'Koine Greek') setCurrentTokens(prev => [...prev, ...nextKoineGreekTokens, ...additionalKoineGreekTokens]);
    else if (text?.language === 'Aramaic') setCurrentTokens(prev => [...prev, ...nextAramaicTokens, ...additionalAramaicTokens]);
    else if (text?.language === 'Coptic') setCurrentTokens(prev => [...prev, ...nextCopticTokens, ...additionalCopticTokens]);
    else if (text?.language === 'Akkadian') setCurrentTokens(prev => [...prev, ...nextAkkadianTokens, ...additionalAkkadianTokens]);
    else if (text?.language === 'Syriac') setCurrentTokens(prev => [...prev, ...nextSyriacTokens, ...additionalSyriacTokens]);
    else if (text?.language === 'Hittite') setCurrentTokens(prev => [...prev, ...nextHittiteTokens, ...additionalHittiteTokens]);
    else setCurrentTokens(prev => [...prev, ...nextGreekTokens]);
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
