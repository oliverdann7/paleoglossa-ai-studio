import { motion } from 'motion/react';
import { X, Play, BookOpen } from 'lucide-react';
import { WordState } from '@/lib/constants/wordStates';
import { cn } from '@/lib/utils';

export interface DrillLemma {
  lemma: string;
  gloss: string;
  state: WordState;
}

interface Props {
  textTitle: string;
  lemmas: DrillLemma[];
  onStartReading: () => void;
  onClose: () => void;
}

const STATE_LABEL: Record<WordState, string> = {
  [WordState.NEW]: 'New',
  [WordState.SEEN]: 'Seen',
  [WordState.LEARNING]: 'Learning',
  [WordState.FAMILIAR]: 'Familiar',
  [WordState.KNOWN]: 'Known',
  [WordState.IGNORED]: 'Skipped',
};

const STATE_COLOR: Record<WordState, string> = {
  [WordState.NEW]: 'bg-slate-100 text-slate-600',
  [WordState.SEEN]: 'bg-amber-50 text-amber-700',
  [WordState.LEARNING]: 'bg-orange-50 text-orange-700',
  [WordState.FAMILIAR]: 'bg-blue/10 text-blue',
  [WordState.KNOWN]: 'bg-emerald-50 text-emerald-700',
  [WordState.IGNORED]: 'bg-parch3 text-muted',
};

export function PreDrillModal({ textTitle, lemmas, onStartReading, onClose }: Props) {
  const unknownCount = lemmas.filter(
    (l) => l.state === WordState.NEW || l.state === WordState.SEEN
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        className="w-full max-w-md bg-parch rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-bdr/40">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted">
                Pre-reading Vocabulary
              </p>
              <p className="text-[13px] font-serif font-bold text-ink line-clamp-1">{textTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-parch3 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {unknownCount > 0 && (
            <p className="text-[13px] text-ink2 mb-4">
              This text contains{' '}
              <span className="font-bold text-ink">
                {unknownCount} unfamiliar {unknownCount === 1 ? 'lemma' : 'lemmas'}
              </span>
              . Review them before reading.
            </p>
          )}
          {unknownCount === 0 && (
            <p className="text-[13px] text-emerald-700 mb-4">
              You know all highlighted lemmas in this text — it should be comfortable reading!
            </p>
          )}

          <div className="space-y-1.5 max-h-60 overflow-y-auto mb-5">
            {lemmas.map((l) => (
              <div
                key={l.lemma}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-parch2/60"
              >
                <span className="font-serif text-[15px] text-ink font-medium">{l.lemma}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[12px] text-ink2 truncate">{l.gloss}</span>
                  <span
                    className={cn(
                      'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0',
                      STATE_COLOR[l.state]
                    )}
                  >
                    {STATE_LABEL[l.state]}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onStartReading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue text-white font-bold rounded-xl text-[13px] hover:bg-blue/90 transition-all"
          >
            <Play className="w-4 h-4" fill="currentColor" /> Start Reading
          </button>
        </div>
      </motion.div>
    </div>
  );
}
