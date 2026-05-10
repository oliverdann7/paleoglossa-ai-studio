import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, Bookmark, Eye, Brain, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoogleGenAI } from '@google/genai';

interface LexDrawerProps {
  word: any;
  language?: string;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (wordId: number, status: string) => void;
}

export const LexDrawer = ({ word, language, isOpen, onClose, onStatusChange }: LexDrawerProps) => {
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiExplain = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    setAiInsights("");
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Give a brief, scholarly explanation of the etymology and morphological usage of the word '${word.text}' (lemma: ${word.lemma}) in the language '${language || word.language || "ancient language"}'. Keep it concise (under 150 words).`;
      
      const response = await ai.models.generateContentStream({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
      });

      for await (const chunk of response) {
        setAiInsights((prev) => (prev || "") + (chunk.text || ""));
      }
    } catch (error) {
      console.error(error);
      setAiInsights("Failed to fetch insights.");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!word) return null;

  const proficiencyLevels = [
    { id: 'New', label: 'New', icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'Seen Once', label: 'Seen Once', icon: Eye, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 'Learning', label: 'Learning', icon: Eye, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'Familiar', label: 'Familiar', icon: Brain, color: 'text-gold-500', bg: 'bg-gold-500/10' },
    { id: 'Known', label: 'Known', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' }
  ] as const;

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

            <header className="mb-12 mt-4">
              <div className="flex items-center gap-4 mb-6">
                <h3 className={cn(
                  "text-5xl font-serif font-bold tracking-tight",
                  ['hbo', 'Biblical Hebrew', 'arc', 'Aramaic', 'syr', 'Syriac', 'Hebrew'].includes(word.language) ? "font-hebrew" : "font-greek"
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

            <section className="mb-10">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-obsidian-900/40 dark:text-vellum-100/40 mb-4">Mastery Level</h4>
              <div className="flex flex-col gap-2">
                {proficiencyLevels.map((level) => {
                  const isSelected = (word.status || 'New') === level.id;
                  const Icon = level.icon;
                  return (
                    <button
                      key={level.id}
                      onClick={() => onStatusChange?.(word.id, level.id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                        isSelected 
                          ? cn("border-transparent", level.bg)
                          : "border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10 bg-white/50 dark:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("w-5 h-5", isSelected ? level.color : "text-obsidian-900/40 dark:text-vellum-100/40")} />
                        <span className={cn(
                          "text-sm font-bold",
                          isSelected ? level.color : "text-obsidian-900/60 dark:text-vellum-100/60"
                        )}>
                          {level.label}
                        </span>
                      </div>
                      {isSelected && (
                        <motion.div layoutId="activeProficiency" className={cn("w-2 h-2 rounded-full", level.bg.replace('/10', ''))} />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mb-10">
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
              <div className="p-6 rounded-2xl bg-gold-500/5 border border-gold-500/10 mb-4">
                <div className="text-2xl font-serif font-bold text-gold-600 mb-2">{word.root || '—'}</div>
                <p className="text-sm text-obsidian-900/60 dark:text-vellum-100/60 leading-relaxed">
                  Shares a semantic root with <span className="text-gold-600 font-bold">14 other words</span> in this corpus.
                </p>
              </div>

              {(aiInsights || isAiLoading) && (
                <div className="p-6 rounded-2xl bg-blue/5 border border-blue/10 mb-4">
                  <div className="flex items-center gap-2 mb-3 text-blue font-bold text-sm">
                    {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    AI Insights
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{aiInsights}</p>
                </div>
              )}
            </section>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleAiExplain}
                disabled={isAiLoading}
                className="py-3 border border-black/10 dark:border-white/10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-blue" />
                AI Explain
              </button>
              <button className="py-3 border border-black/10 dark:border-white/10 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <Bookmark className="w-3 h-3" />
                Annotate
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
