import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export const ReaderTutorial = ({ currentStep, onDismiss }: { currentStep: number, onDismiss: () => void }) => {
  if (currentStep > 4 || currentStep === 0) return null;

  const steps = [
    { title: "Click a word", desc: "Click any blue word to see its meaning." },
    { title: "Mark your knowledge", desc: "Mark it as KNOWN if you recognize it." },
    { title: "Read the sentence", desc: "Try reading the sentence — the colours show your progress." },
    { title: "Explore the Library", desc: "Open Library to find more texts." }
  ];

  const content = steps[currentStep - 1];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-24 right-8 w-72 bg-parch text-ink p-5 rounded-2xl shadow-xl border border-bdr z-[100]"
      >
        <button onClick={onDismiss} className="absolute top-4 right-4 text-muted hover:text-ink">
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex gap-1.5 mb-4">
           {[1,2,3,4].map(s => (
              <div key={s} className={cn("h-1.5 flex-1 rounded-full", s === currentStep ? "bg-amber" : s < currentStep ? "bg-amber/30" : "bg-bdr")} />
           ))}
        </div>
        
        <h4 className="font-serif font-bold text-[18px] mb-2">{content.title}</h4>
        <p className="text-[14px] text-ink2 leading-snug">{content.desc}</p>
      </motion.div>
    </AnimatePresence>
  );
};
