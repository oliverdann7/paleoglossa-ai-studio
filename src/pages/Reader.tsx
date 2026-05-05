import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Type, Languages, Eye, EyeOff, Maximize2, Settings2, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LexDrawer } from '../components/LexDrawer';

const greekTokens = [
  { id: 1, text: "Ἐν", lemma: "ἐν", gloss: "In", morphology: { part: "Preposition", case: "Dative" }, language: "Greek" },
  { id: 2, text: "ἀρχῇ", lemma: "ἀρχή", gloss: "beginning", morphology: { part: "Noun", case: "Dative", gender: "Feminine", number: "Singular" }, language: "Greek" },
  { id: 3, text: "ἦν", lemma: "εἰμί", gloss: "was", morphology: { part: "Verb", tense: "Imperfect", voice: "Active", mood: "Indicative", person: "3rd", number: "Singular" }, language: "Greek" },
  { id: 4, text: "ὁ", lemma: "ὁ", gloss: "the", morphology: { part: "Article", case: "Nominative", gender: "Masculine", number: "Singular" }, language: "Greek" },
  { id: 5, text: "λόγος,", lemma: "λόγος", gloss: "word", morphology: { part: "Noun", case: "Nominative", gender: "Masculine", number: "Singular" }, language: "Greek" },
  { id: 6, text: "καὶ", lemma: "καί", gloss: "and", morphology: { part: "Conjunction" }, language: "Greek" },
  { id: 7, text: "ὁ", lemma: "ὁ", gloss: "the", morphology: { part: "Article", case: "Nominative", gender: "Masculine", number: "Singular" }, language: "Greek" },
  { id: 8, text: "λόγος", lemma: "λόγος", gloss: "word", morphology: { part: "Noun", case: "Nominative", gender: "Masculine", number: "Singular" }, language: "Greek" },
  { id: 9, text: "ἦν", lemma: "εἰμί", gloss: "was", morphology: { part: "Verb", tense: "Imperfect", voice: "Active", mood: "Indicative", person: "3rd", number: "Singular" }, language: "Greek" },
  { id: 10, text: "πρὸς", lemma: "πρός", gloss: "with", morphology: { part: "Preposition", case: "Accusative" }, language: "Greek" },
  { id: 11, text: "τὸν", lemma: "ὁ", gloss: "the", morphology: { part: "Article", case: "Accusative", gender: "Masculine", number: "Singular" }, language: "Greek" },
  { id: 12, text: "θεόν,", lemma: "θεός", gloss: "God", morphology: { part: "Noun", case: "Accusative", gender: "Masculine", number: "Singular" }, language: "Greek" },
  { id: 13, text: "καὶ", lemma: "καί", gloss: "and", morphology: { part: "Conjunction" }, language: "Greek" },
  { id: 14, text: "θεὸς", lemma: "θεός", gloss: "God", morphology: { part: "Noun", case: "Nominative", gender: "Masculine", number: "Singular" }, language: "Greek" },
  { id: 15, text: "ἦν", lemma: "εἰμί", gloss: "was", morphology: { part: "Verb", tense: "Imperfect", voice: "Active", mood: "Indicative", person: "3rd", number: "Singular" }, language: "Greek" },
  { id: 16, text: "ὁ", lemma: "ὁ", gloss: "the", morphology: { part: "Article", case: "Nominative", gender: "Masculine", number: "Singular" }, language: "Greek" },
  { id: 17, text: "λόγος.", lemma: "λόγος", gloss: "word", morphology: { part: "Noun", case: "Nominative", gender: "Masculine", number: "Singular" }, language: "Greek" },
];

const hebrewTokens = [
  { id: 101, text: "בְּרֵאשִׁית", lemma: "רֵאשִׁית", gloss: "In the beginning", morphology: { part: "Noun", prefix: "Preposition", gender: "Feminine", number: "Singular" }, language: "Hebrew" },
  { id: 102, text: "בָּרָא", lemma: "בָּרָא", gloss: "created", morphology: { part: "Verb", tense: "Perfect", person: "3rd", gender: "Masculine", number: "Singular" }, language: "Hebrew" },
  { id: 103, text: "אֱלֹהִים", lemma: "אֱלֹהִים", gloss: "God", morphology: { part: "Noun", gender: "Masculine", number: "Plural" }, language: "Hebrew" },
  { id: 104, text: "אֵת", lemma: "אֵת", gloss: "direct object marker", morphology: { part: "Particle" }, language: "Hebrew" },
  { id: 105, text: "הַשָּׁמַיִם", lemma: "שָׁמַיִם", gloss: "the heavens", morphology: { part: "Noun", prefix: "Article", gender: "Masculine", number: "Dual" }, language: "Hebrew" },
  { id: 106, text: "וְאֵת", lemma: "אֵת", gloss: "and direct object marker", morphology: { part: "Particle", prefix: "Conjunction" }, language: "Hebrew" },
  { id: 107, text: "הָאָרֶץ׃", lemma: "אֶרֶץ", gloss: "the earth", morphology: { part: "Noun", prefix: "Article", gender: "Feminine", number: "Singular" }, language: "Hebrew" },
];

export const Reader = ({ text, onBack }: { text: any, onBack: () => void }) => {
  const [selectedWord, setSelectedWord] = useState<any>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [fontSize, setFontSize] = useState(28);
  const [focusMode, setFocusMode] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const tokens = text?.language === 'Biblical Hebrew' ? hebrewTokens : greekTokens;
  const isRTL = text?.language === 'Biblical Hebrew';

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <div className={cn(
            "flex flex-wrap gap-x-4 gap-y-8 leading-[2] justify-center",
            isRTL ? "font-hebrew" : "font-greek"
          )} dir={isRTL ? "rtl" : "ltr"}>
            {tokens.map((token) => (
              <motion.span
                key={token.id}
                whileHover={{ y: -3, scale: 1.05 }}
                onClick={() => setSelectedWord(token)}
                className={cn(
                  "cursor-pointer transition-all duration-500 relative group",
                  "font-medium tracking-normal",
                  selectedWord?.id === token.id ? "text-gold-600" : "text-obsidian-900 dark:text-vellum-100"
                )}
                style={{ fontSize: `${fontSize}px` }}
              >
                {token.text}
                <span className={cn(
                  "absolute -bottom-2 left-0 w-full h-0.5 bg-gold-500/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500",
                  selectedWord?.id === token.id && "scale-x-100 bg-gold-500"
                )} />
              </motion.span>
            ))}
          </div>

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
                  {isRTL 
                    ? "In the beginning God created the heaven and the earth."
                    : "In the beginning was the Word, and the Word was with God, and the Word was God."
                  }
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
