import { motion, AnimatePresence } from 'motion/react';
import { MoreHorizontal, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export const FastWordPopup = ({ word, isOpen, onClose, onOpenPanel, onStatusChange }: { word: any, isOpen: boolean, onClose: () => void, onOpenPanel: () => void, onStatusChange: (wordId: number, status: string) => void }) => {
  if (!word || !isOpen) return null;

  const statuses = [
    { id: 'New', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-400' },
    { id: 'Seen Once', color: 'bg-blue-400/20 text-blue-600 dark:text-blue-300' },
    { id: 'Learning', color: 'bg-amber-500/20 text-amber-700 dark:text-amber-400' },
    { id: 'Familiar', color: 'bg-gold-500/20 text-gold-700 dark:text-gold-400' },
    { id: 'Known', color: 'bg-green-500/20 text-green-700 dark:text-green-400' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[80] w-[90%] max-w-sm bg-vellum-50 dark:bg-obsidian-900 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden sm:right-auto"
      >
        <div className="p-5 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className={cn("text-2xl font-bold mb-1", ['hbo', 'Biblical Hebrew', 'arc', 'Aramaic', 'syr', 'Syriac'].includes(word.language) ? "font-hebrew" : "font-greek")}>
                {word.text}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-obsidian-900/60 dark:text-vellum-100/60 uppercase tracking-widest">{word.lemma}</span>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
              <MoreHorizontal className="w-5 h-5 opacity-50" />
            </button>
          </div>

          <div className="text-lg italic font-serif opacity-90">
            "{word.gloss}"
          </div>

          {word.morphology && Object.entries(word.morphology).length > 0 && (
            <div className="text-xs text-obsidian-900/50 dark:text-vellum-100/50">
               {Object.values(word.morphology).join(' • ')}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            {statuses.map(status => (
              <button 
                key={status.id}
                onClick={() => onStatusChange(word.id, status.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-bold transition-transform active:scale-95 border",
                  word.status === status.id 
                    ? cn(status.color, "border-transparent") 
                    : "bg-transparent border-black/10 dark:border-white/10 opacity-70 hover:opacity-100"
                )}
              >
                {status.id}
              </button>
            ))}
          </div>
          
          <div className="flex justify-between mt-2 pt-4 border-t border-black/5 dark:border-white/5">
            <button onClick={onOpenPanel} className="text-xs font-bold uppercase tracking-widest text-gold-600 hover:text-gold-500 transition-colors flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              More Details
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
