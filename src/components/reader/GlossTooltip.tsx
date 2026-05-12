import { motion, AnimatePresence } from 'motion/react';

interface Props {
  text: string | null;
  x: number;
  y: number;
  visible: boolean;
}

export function GlossTooltip({ text, x, y, visible }: Props) {
  return (
    <AnimatePresence>
      {visible && text && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.12 }}
          className="fixed z-50 pointer-events-none"
          style={{ left: x, top: y - 36, transform: 'translateX(-50%)' }}
        >
          <div className="bg-ink text-parch2 text-[11px] font-sans px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap max-w-[200px] truncate">
            {text}
          </div>
          <div className="w-2 h-2 bg-ink rotate-45 mx-auto -mt-1" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
