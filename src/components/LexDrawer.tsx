import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, Bookmark, Share2, ExternalLink, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LexDrawerProps {
  word: any;
  isOpen: boolean;
  onClose: () => void;
}

export const LexDrawer = ({ word, isOpen, onClose }: LexDrawerProps) => {
  if (!word) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-obsidian-950/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-96 bg-vellum-50 dark:bg-obsidian-900 border-l border-black/5 dark:border-white/5 shadow-2xl z-[70] p-8 overflow-y-auto"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <header className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <h3 className={cn(
                  "text-5xl font-serif font-bold tracking-tight",
                  word.language === 'Hebrew' ? "font-hebrew" : "font-greek"
                )}>
                  {word.text}
                </h3>
                <button className="p-2 rounded-full bg-gold-500/10 text-gold-600 hover:bg-gold-500/20 transition-colors">
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-8">
                <span className="px-3 py-1 bg-obsidian-900 text-vellum-50 dark:bg-vellum-100 dark:text-obsidian-950 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  {word.lemma}
                </span>
                <span className="px-3 py-1 border border-black/10 dark:border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest opacity-60">
                  {word.language}
                </span>
              </div>

              <p className="text-xl font-serif italic text-obsidian-900/60 dark:text-vellum-100/60 leading-relaxed">
                "{word.gloss}"
              </p>
            </header>

            <section className="mb-12">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-obsidian-900/40 dark:text-vellum-100/40 mb-6">Morphology</h4>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(word.morphology || {}).map(([key, value]: [string, any]) => (
                  <div key={key} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-obsidian-900/40 dark:text-vellum-100/40 mb-1">{key}</div>
                    <div className="text-sm font-bold">{value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-12">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-obsidian-900/40 dark:text-vellum-100/40 mb-6">Root Analysis</h4>
              <div className="p-6 rounded-2xl bg-gold-500/5 border border-gold-500/10">
                <div className="text-2xl font-serif font-bold text-gold-600 mb-2">{word.root || '—'}</div>
                <p className="text-sm text-obsidian-900/60 dark:text-vellum-100/60 leading-relaxed">
                  Shares a semantic root with <span className="text-gold-600 font-bold">14 other words</span> in this corpus.
                </p>
              </div>
            </section>

            <div className="flex flex-col gap-3">
              <button className="w-full py-4 bg-obsidian-900 dark:bg-vellum-100 text-vellum-50 dark:text-obsidian-950 rounded-xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                <GraduationCap className="w-4 h-4" />
                Save to Vocabulary
              </button>
              <div className="grid grid-cols-2 gap-3">
                <button className="py-3 border border-black/10 dark:border-white/10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <Bookmark className="w-3 h-3" />
                  Annotate
                </button>
                <button className="py-3 border border-black/10 dark:border-white/10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <Share2 className="w-3 h-3" />
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
