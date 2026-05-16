import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Loader2, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

interface Props {
  textTitle: string;
  textSnippet: string;
  languageId: string;
  onClose: () => void;
}

type Phase = 'loading' | 'quiz' | 'result' | 'error';

export function CourseQuizModal({ textTitle, textSnippet, languageId, onClose }: Props) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch quiz on mount
  useState(() => {
    (async () => {
      try {
        const res = await fetch('/api/ai/course-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textSnippet, languageId, questionCount: 5 }),
        });
        if (!res.ok) throw new Error('Quiz generation failed');
        const data = await res.json();
        setQuestions(data.questions ?? []);
        setPhase('quiz');
      } catch {
        setError('Could not generate quiz. Check your connection and try again.');
        setPhase('error');
      }
    })();
  });

  const q = questions[currentQ];
  const score = answers.filter(Boolean).length;

  const handleAnswer = (idx: number) => {
    if (selectedIndex !== null) return;
    setSelectedIndex(idx);
  };

  const handleNext = () => {
    if (selectedIndex === null || !q) return;
    const correct = selectedIndex === q.correctIndex;
    setAnswers(prev => [...prev, correct]);

    if (currentQ + 1 >= questions.length) {
      setPhase('result');
    } else {
      setCurrentQ(prev => prev + 1);
      setSelectedIndex(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-lg bg-parch rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-bdr/40">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted mb-0.5">Comprehension Quiz</p>
            <p className="text-[14px] font-serif font-bold text-ink line-clamp-1">{textTitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-parch3 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 min-h-[300px] flex flex-col">
          {phase === 'loading' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted">
              <Loader2 className="w-8 h-8 animate-spin text-blue" />
              <span className="text-[13px]">Generating questions with AI…</span>
            </div>
          )}

          {phase === 'error' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-red-600">
              <XCircle className="w-8 h-8" />
              <p className="text-[13px] text-center">{error}</p>
              <button onClick={onClose} className="text-[12px] underline hover:no-underline text-muted">Close</button>
            </div>
          )}

          {phase === 'quiz' && q && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col"
              >
                {/* Progress */}
                <div className="flex items-center gap-2 mb-4">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 h-1 rounded-full transition-colors",
                        i < currentQ ? "bg-blue" : i === currentQ ? "bg-blue/40" : "bg-parch3",
                      )}
                    />
                  ))}
                  <span className="text-[11px] text-muted shrink-0 ml-1">{currentQ + 1}/{questions.length}</span>
                </div>

                <p className="text-[15px] font-medium text-ink mb-4 leading-relaxed">{q.question}</p>

                <div className="space-y-2 flex-1">
                  {q.options.map((opt, idx) => {
                    const isSelected = selectedIndex === idx;
                    const isCorrect = idx === q.correctIndex;
                    const revealed = selectedIndex !== null;

                    return (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(idx)}
                        disabled={revealed}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl border text-[13px] transition-all",
                          !revealed && "hover:border-blue/50 hover:bg-blue/5 border-bdr",
                          revealed && isCorrect && "border-emerald-400 bg-emerald-50 text-emerald-800",
                          revealed && isSelected && !isCorrect && "border-red-400 bg-red-50 text-red-800",
                          revealed && !isSelected && !isCorrect && "border-bdr/40 text-muted",
                          !revealed && "border-bdr",
                        )}
                      >
                        <span className="font-bold mr-2 text-[11px]">{String.fromCharCode(65 + idx)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {selectedIndex !== null && (
                  <div className={cn(
                    "mt-4 p-3 rounded-lg text-[12px] leading-relaxed",
                    selectedIndex === q.correctIndex ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800",
                  )}>
                    <span className="font-bold mr-1">{selectedIndex === q.correctIndex ? '✓ Correct.' : '✗ Incorrect.'}</span>
                    {q.explanation}
                  </div>
                )}

                <button
                  onClick={handleNext}
                  disabled={selectedIndex === null}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue text-white font-bold rounded-xl text-[13px] hover:bg-blue/90 disabled:opacity-40 transition-all"
                >
                  {currentQ + 1 < questions.length ? (
                    <><ChevronRight className="w-4 h-4" /> Next Question</>
                  ) : (
                    <>See Results</>
                  )}
                </button>
              </motion.div>
            </AnimatePresence>
          )}

          {phase === 'result' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center text-[28px] font-bold",
                score === questions.length ? "bg-emerald-100 text-emerald-700" :
                score >= questions.length * 0.6 ? "bg-blue/10 text-blue" : "bg-amber-100 text-amber-700",
              )}>
                {score}/{questions.length}
              </div>
              <div>
                <p className="font-serif text-[18px] font-bold text-ink mb-1">
                  {score === questions.length ? 'Perfect score!' :
                   score >= questions.length * 0.6 ? 'Good work!' : 'Keep reading!'}
                </p>
                <p className="text-[13px] text-muted">
                  You answered {score} of {questions.length} questions correctly.
                </p>
              </div>
              {score < Math.ceil(questions.length * 0.6) && (
                <p className="text-[12px] text-amber-700 bg-amber-50 px-4 py-2 rounded-lg">
                  This text may be challenging. Consider reviewing vocabulary before re-reading.
                </p>
              )}
              {score === questions.length && (
                <p className="text-[12px] text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Excellent comprehension — try a more challenging text next!
                </p>
              )}
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-ink text-parch font-bold rounded-xl text-[13px] hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
