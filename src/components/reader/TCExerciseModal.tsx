/**
 * Textual Criticism Exercise Modal (Phase 6)
 *
 * Presents gamified TC exercises based on the static variant apparatus database.
 * Users identify: which reading is earlier, what type of scribal change it is,
 * and why one variant is preferred. Awards XP on completion.
 */
import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Scroll, X, ChevronRight, Check, AlertCircle, Award, Loader2 } from 'lucide-react';
import { entries as variantEntries } from '../../lib/data/textualVariants.js';
import { cn } from '@/lib/utils';

interface Props {
  onClose: () => void;
  onAwardXP?: (amount: number) => Promise<void>;
}

type ExerciseType = 'identify-earlier' | 'identify-type' | 'explain-preference';

interface Exercise {
  entryIndex: number;
  type: ExerciseType;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

function buildExercises(): Exercise[] {
  const exercises: Exercise[] = [];

  for (let i = 0; i < variantEntries.length; i++) {
    const entry = variantEntries[i];
    if (entry.variants.length < 2) continue;

    // Exercise 1: What type of scribal change?
    const types = [...new Set(entry.variants.map((v) => v.type))];
    if (types.length > 0) {
      const correctType = entry.variants[0].type;
      const typeLabels: Record<string, string> = {
        omission: 'Omission (text left out)',
        addition: 'Addition (text inserted)',
        substitution: 'Substitution (word replaced)',
        transposition: 'Transposition (order changed)',
        spelling: 'Spelling variant',
      };
      const wrongTypes = Object.keys(typeLabels).filter((t) => t !== correctType);
      const options = [
        typeLabels[correctType],
        typeLabels[wrongTypes[0]],
        typeLabels[wrongTypes[1]],
        typeLabels[wrongTypes[2] ?? wrongTypes[0]],
      ];
      exercises.push({
        entryIndex: i,
        type: 'identify-type',
        question: `At ${entry.location}, what is the primary nature of the variant between readings?`,
        options,
        correctIndex: 0,
        explanation: entry.summary,
      });
    }

    // Exercise 2: Which witnesses support which reading?
    if (entry.significance !== 'minor') {
      const v0 = entry.variants[0];
      const v1 = entry.variants[1];
      const question = `At ${entry.location}, which manuscript tradition supports the reading "${v0.reading}"?`;
      const options = [v0.witness, v1.witness, 'All manuscripts agree', 'Neither — it is a conjectural emendation'];
      exercises.push({
        entryIndex: i,
        type: 'identify-earlier',
        question,
        options,
        correctIndex: 0,
        explanation: entry.summary,
      });
    }
  }

  return exercises;
}

// Shuffle array (Fisher-Yates)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const EXERCISE_XP = 15;
const MAX_EXERCISES = 5;

export function TCExerciseModal({ onClose, onAwardXP }: Props) {
  const allExercises = useMemo(() => shuffle(buildExercises()).slice(0, MAX_EXERCISES), []);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [awardingXP, setAwardingXP] = useState(false);
  const [done, setDone] = useState(false);

  const exercise = allExercises[index];
  const entry = variantEntries[exercise?.entryIndex ?? 0];

  const SIGNIFICANCE_COLORS = {
    minor: 'bg-parch3 text-muted',
    moderate: 'bg-amber-50 text-amber-700 border border-amber-200',
    significant: 'bg-red-50 text-red-700 border border-red-200',
  };

  const handleSelect = (optionIndex: number) => {
    if (revealed) return;
    setSelected(optionIndex);
  };

  const handleReveal = () => {
    if (selected === null) return;
    if (selected === exercise.correctIndex) setScore((s) => s + 1);
    setRevealed(true);
  };

  const handleNext = async () => {
    if (index === allExercises.length - 1) {
      // Done — award XP proportional to score
      const xpEarned = Math.round((score + (selected === exercise.correctIndex ? 1 : 0)) / allExercises.length * MAX_EXERCISES * EXERCISE_XP);
      if (xpEarned > 0 && onAwardXP) {
        setAwardingXP(true);
        await onAwardXP(xpEarned);
        setAwardingXP(false);
      }
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  };

  const finalScore = score + (revealed && selected === exercise?.correctIndex ? 1 : 0);

  if (done) {
    const pct = Math.round((finalScore / allExercises.length) * 100);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          className="bg-parch rounded-2xl shadow-2xl p-8 w-full max-w-md border border-bdr text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Award className="w-12 h-12 text-gold mx-auto mb-4" />
          <h2 className="text-[24px] font-serif font-bold text-ink mb-2">Exercise Complete!</h2>
          <p className="text-[14px] text-muted mb-4">
            You scored {finalScore} of {allExercises.length} — {pct}%
          </p>
          {pct >= 80 && (
            <p className="text-[13px] text-emerald-700 bg-emerald-50 rounded-xl px-4 py-3 mb-4 border border-emerald-200">
              Excellent! You have a strong grasp of textual criticism principles.
            </p>
          )}
          {pct >= 50 && pct < 80 && (
            <p className="text-[13px] text-amber-700 bg-amber-50 rounded-xl px-4 py-3 mb-4 border border-amber-200">
              Good effort! Review the variant summaries to deepen your understanding.
            </p>
          )}
          {pct < 50 && (
            <p className="text-[13px] text-muted italic mb-4">
              Keep studying the manuscript traditions — this is advanced material!
            </p>
          )}
          {awardingXP && (
            <div className="flex items-center justify-center gap-2 text-muted mb-4">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Awarding XP...
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue text-white font-bold rounded-xl text-[14px] hover:bg-blue/90 transition-colors"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  if (!exercise || !entry) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        key={index}
        className="bg-parch rounded-2xl shadow-2xl w-full max-w-lg border border-bdr overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bdr/30">
          <div className="flex items-center gap-2">
            <Scroll className="w-4 h-4 text-muted" />
            <span className="text-[12px] font-bold text-muted uppercase tracking-wider">
              Textual Criticism — {index + 1}/{allExercises.length}
            </span>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-parch3">
          <div
            className="h-full bg-blue transition-all duration-500"
            style={{ width: `${((index) / allExercises.length) * 100}%` }}
          />
        </div>

        <div className="p-6">
          {/* Location badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full', SIGNIFICANCE_COLORS[entry.significance])}>
              {entry.location}
            </span>
            <span className="text-[11px] text-muted italic">{entry.significance} variant</span>
          </div>

          {/* Question */}
          <p className="text-[15px] font-semibold text-ink mb-5 leading-snug">{exercise.question}</p>

          {/* Options */}
          <div className="space-y-2 mb-5">
            {exercise.options.map((option, i) => {
              const isSelected = selected === i;
              const isCorrect = i === exercise.correctIndex;
              let optionClass = 'border-bdr bg-white hover:border-blue/40 hover:bg-blue/5 cursor-pointer';
              if (revealed) {
                if (isCorrect) optionClass = 'border-emerald-400 bg-emerald-50 cursor-default';
                else if (isSelected && !isCorrect) optionClass = 'border-red-400 bg-red-50 cursor-default';
                else optionClass = 'border-bdr/40 bg-parch2/50 cursor-default opacity-60';
              } else if (isSelected) {
                optionClass = 'border-blue bg-blue/10 cursor-pointer';
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  className={cn('w-full text-left p-3.5 rounded-xl border text-[13px] transition-all flex items-start gap-3', optionClass)}
                >
                  <span className={cn('w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5',
                    revealed && isCorrect ? 'border-emerald-500 bg-emerald-500 text-white' :
                    revealed && isSelected && !isCorrect ? 'border-red-500 bg-red-500 text-white' :
                    isSelected ? 'border-blue bg-blue text-white' : 'border-bdr text-muted')}>
                    {revealed && isCorrect ? <Check className="w-3 h-3" /> :
                     revealed && isSelected && !isCorrect ? <X className="w-3 h-3" /> :
                     String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 leading-snug">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation after reveal */}
          {revealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-4 bg-parch2 border border-bdr/30 rounded-xl border-l-4 border-l-blue/30"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-blue shrink-0" />
                <span className="text-[11px] font-bold text-blue uppercase tracking-wider">Explanation</span>
              </div>
              <p className="text-[12px] text-ink/80 leading-relaxed italic">{exercise.explanation}</p>
            </motion.div>
          )}

          {/* Action button */}
          {!revealed ? (
            <button
              onClick={handleReveal}
              disabled={selected === null}
              className="w-full py-3 bg-blue text-white font-bold rounded-xl text-[14px] hover:bg-blue/90 disabled:opacity-40 transition-colors"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="w-full py-3 bg-blue text-white font-bold rounded-xl text-[14px] hover:bg-blue/90 transition-colors flex items-center justify-center gap-2"
            >
              {index === allExercises.length - 1 ? (
                <>
                  <Award className="w-4 h-4" /> Finish
                </>
              ) : (
                <>
                  Next <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
