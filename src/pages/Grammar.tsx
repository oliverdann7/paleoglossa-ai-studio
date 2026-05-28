import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useActiveLanguage } from '../lib/hooks/useActiveLanguage.js';
import {
  ChevronLeft,
  GraduationCap,
  Loader2,
  Search,
  Tag,
  BookOpen,
  Layers,
  MessageSquare,
  AlignLeft,
  Hash,
  ExternalLink,
  Brain,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ListOrdered,
  LayoutGrid,
  ChevronRight,
  GitBranch,
  Lock,
  Trophy,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { getApiUrl } from '../lib/services/apiBaseUrl.js';
import { useGrammarMastery } from '../lib/hooks/useGrammarMastery.js';
import { useXP } from '../lib/hooks/useXP.js';
import { XP_REWARDS } from '../lib/services/xpService.js';

interface Paradigm {
  caption: string;
  headers: string[];
  rows: { label: string; cells: string[] }[];
}

interface CorpusSentence {
  lemma: string;
  surface: string;
  sentenceText: string;
  translation: string;
  textTitle: string;
  textId: string;
}

interface Concept {
  id: string;
  title: string;
  languageId: string;
  category: string;
  difficulty: string;
  explanation: string;
  examples: { surface: string; gloss: string; translation?: string }[];
  paradigm?: Paradigm;
  relatedMorphKeys: string[];
  prerequisites?: string[];
  corpusSentences?: CorpusSentence[];
  status: string;
}

const LANG_LABELS: Record<string, string> = {
  grc: 'Ancient Greek',
  'grc-koine': 'Koine Greek',
  hbo: 'Hebrew',
  lat: 'Latin',
  syr: 'Syriac',
  cop: 'Coptic',
  arc: 'Aramaic',
  san: 'Sanskrit',
};

const RTL = new Set(['hbo', 'arc', 'syr']);

const CATEGORY_LABELS: Record<string, string> = {
  nouns: 'Nouns',
  verbs: 'Verbs',
  syntax: 'Syntax',
  particles: 'Particles',
  morphology: 'Morphology',
  pronouns: 'Pronouns',
  other: 'Other',
};

type IconComponent = React.ComponentType<{ className?: string }>;

const CATEGORY_ICONS: Record<string, IconComponent> = {
  nouns: BookOpen,
  verbs: Layers,
  syntax: AlignLeft,
  particles: MessageSquare,
  morphology: Hash,
  pronouns: Tag,
  other: GraduationCap,
};

const DIFFICULTY_STYLES: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700',
  intermediate: 'bg-blue/10 text-blue',
  advanced: 'bg-amber/10 text-amber-700',
};

function ParadigmTable({ paradigm, rtl }: { paradigm: Paradigm; rtl: boolean }) {
  return (
    <div className="overflow-x-auto mt-6">
      <p className="text-[11px] text-muted uppercase tracking-widest font-bold mb-2">
        {paradigm.caption}
      </p>
      <table className="w-full text-[13px] border-collapse">
        <thead>
          <tr>
            {paradigm.headers.map((h, i) => (
              <th
                key={i}
                className={cn(
                  'px-3 py-2 text-left border border-bdr bg-parch2 font-bold text-ink2 text-[11px] uppercase tracking-wider',
                  i > 0 && rtl ? 'text-right' : ''
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paradigm.rows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-parch2/40'}>
              <td className="px-3 py-2 border border-bdr font-bold text-muted text-[11px] uppercase tracking-wider whitespace-nowrap">
                {row.label}
              </td>
              {row.cells.map((cell, ci) => (
                <td
                  key={ci}
                  className={cn(
                    'px-3 py-2 border border-bdr font-serif text-[15px] text-ink',
                    rtl ? 'text-right' : ''
                  )}
                  dir={rtl ? 'rtl' : 'ltr'}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface QuizQuestion {
  question: string;
  choices: string[];
  answer: string;
  explanation: string;
}

const MASTERY_LABELS: Record<number, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  0: { label: 'Not started', color: 'bg-parch2 text-muted', icon: BookOpen },
  1: { label: 'Studied', color: 'bg-blue/10 text-blue', icon: Eye },
  2: { label: 'Practicing', color: 'bg-amber/10 text-amber-700', icon: Brain },
  3: { label: 'Mastered', color: 'bg-emerald-50 text-emerald-700', icon: Trophy },
};

function MasteryBadge({ level }: { level: 0 | 1 | 2 | 3 }) {
  const info = MASTERY_LABELS[level];
  const MIcon = info.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full',
        info.color
      )}
    >
      <MIcon className="w-3 h-3" />
      {info.label}
    </span>
  );
}

function MorphologyQuiz({ concept, onQuizResult }: { concept: Concept; onQuizResult?: (correct: boolean) => void }) {
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const pickExample = useCallback(() => {
    const examples = concept.examples ?? [];
    if (examples.length === 0) return null;
    return examples[Math.floor(Math.random() * examples.length)];
  }, [concept.examples]);

  const fetchQuestion = useCallback(async () => {
    const ex = pickExample();
    if (!ex) return;
    setLoading(true);
    setQuestion(null);
    setSelected(null);
    try {
      const url = getApiUrl('/api/ai/quiz');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          languageId: concept.languageId,
          lemma: ex.gloss || ex.surface,
          form: ex.surface,
          type: 'morphology',
        }),
      });
      if (!res.ok) throw new Error('quiz failed');
      const data = (await res.json()) as QuizQuestion;
      if (data.question && Array.isArray(data.choices) && data.choices.length > 0) {
        setQuestion(data);
      }
    } catch {
      // silently ignore — the quiz section just won't show
    } finally {
      setLoading(false);
    }
  }, [concept.languageId, pickExample]);

  const handleAnswer = useCallback(
    (choice: string) => {
      if (selected !== null || !question) return;
      setSelected(choice);
      const isCorrect = choice === question.answer;
      setScore((s) => ({
        correct: s.correct + (isCorrect ? 1 : 0),
        total: s.total + 1,
      }));
      onQuizResult?.(isCorrect);
    },
    [selected, question, onQuizResult]
  );

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest flex items-center gap-2">
          <Brain className="w-3.5 h-3.5 text-blue" />
          Practice Quiz
        </h3>
        {score.total > 0 && (
          <span className="text-[11px] text-muted">
            {score.correct}/{score.total} correct
          </span>
        )}
      </div>

      {!question && !loading && (
        <button
          onClick={fetchQuestion}
          disabled={concept.examples.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Brain className="w-4 h-4" />
          Generate question
        </button>
      )}

      {loading && (
        <div className="card p-6 flex items-center gap-3 text-muted">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Generating question…</span>
        </div>
      )}

      {question && !loading && (
        <div className="card p-5 space-y-4">
          <p className="text-[15px] text-ink leading-relaxed font-medium">{question.question}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {question.choices.map((choice) => {
              const isCorrect = choice === question.answer;
              const isSelected = choice === selected;
              const revealed = selected !== null;
              return (
                <button
                  key={choice}
                  onClick={() => handleAnswer(choice)}
                  disabled={revealed}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm text-left transition-colors',
                    !revealed
                      ? 'border-bdr hover:border-blue/40 hover:bg-parch3 text-ink'
                      : isCorrect
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold'
                        : isSelected
                          ? 'border-red-400 bg-red-50 text-red-800'
                          : 'border-bdr text-muted opacity-60'
                  )}
                >
                  {revealed && isCorrect && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />}
                  {revealed && isSelected && !isCorrect && <XCircle className="w-4 h-4 shrink-0 text-red-500" />}
                  <span>{choice}</span>
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <div className="space-y-3">
              <div
                className={cn(
                  'rounded-lg px-4 py-3 text-sm leading-relaxed',
                  selected === question.answer
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                )}
              >
                {selected === question.answer ? '✓ Correct! ' : '✗ Incorrect. '}
                {question.explanation}
              </div>
              <button
                onClick={fetchQuestion}
                className="flex items-center gap-1.5 text-sm text-blue hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Next question
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ConceptDetail({
  concept,
  isLoadingCorpus,
  onBack,
  masteryLevel,
  onMarkStudied,
  onQuizResult,
}: {
  concept: Concept;
  isLoadingCorpus: boolean;
  onBack: () => void;
  masteryLevel: 0 | 1 | 2 | 3;
  onMarkStudied: () => void;
  onQuizResult: (correct: boolean) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const rtl = RTL.has(concept.languageId);
  const Icon = CATEGORY_ICONS[concept.category] ?? GraduationCap;

  useEffect(() => {
    onMarkStudied();
  }, [concept.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto font-sans min-h-screen">
      <button
        onClick={onBack}
        className="text-muted hover:text-ink flex items-center gap-1 mb-6 transition-colors text-[13px]"
      >
        <ChevronLeft className="w-4 h-4" /> {t('grammar.back', 'Back to Concepts')}
      </button>

      <div className="flex flex-wrap items-start gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center text-blue shrink-0 mt-0.5">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[24px] font-serif font-bold text-ink leading-tight">
            {concept.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-[12px] text-muted">
              {LANG_LABELS[concept.languageId] || concept.languageId}
            </span>
            <span className="text-muted">·</span>
            <span
              className={cn(
                'text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full',
                DIFFICULTY_STYLES[concept.difficulty] ?? 'bg-parch2 text-ink3'
              )}
            >
              {concept.difficulty}
            </span>
            <span
              className={cn(
                'text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full',
                concept.status === 'complete'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber/10 text-amber'
              )}
            >
              {concept.status}
            </span>
            <MasteryBadge level={masteryLevel} />
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <p className="text-[15px] text-ink2 leading-[1.9] whitespace-pre-wrap">
          {concept.explanation}
        </p>
      </div>

      {concept.paradigm && (
        <div className="card p-5 mb-6">
          <h3 className="text-[11px] font-bold text-ink uppercase tracking-widest mb-1">
            Paradigm Table
          </h3>
          <ParadigmTable paradigm={concept.paradigm} rtl={rtl} />
        </div>
      )}

      {concept.relatedMorphKeys.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {concept.relatedMorphKeys.map((k) => (
            <span
              key={k}
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-blue/10 text-blue rounded-full"
            >
              <Tag className="w-3 h-3" /> {k}
            </span>
          ))}
        </div>
      )}

      {concept.examples.length > 0 && (
        <div>
          <h3 className="text-[11px] font-bold text-ink mb-3 uppercase tracking-widest">
            {t('grammar.examples', 'Examples')}
          </h3>
          <div className="space-y-2">
            {concept.examples.map((ex, i) => (
              <div key={i} className="card p-4 flex gap-4 items-start">
                <div className="shrink-0 w-6 h-6 rounded-full bg-blue/10 text-blue text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div
                    className="text-[19px] font-serif text-ink mb-0.5 leading-snug"
                    dir={rtl ? 'rtl' : 'ltr'}
                  >
                    {ex.surface}
                  </div>
                  <div className="text-[13px] text-blue italic">{ex.gloss}</div>
                  {ex.translation && (
                    <div className="text-[12px] text-muted mt-0.5">{ex.translation}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(isLoadingCorpus || (concept.corpusSentences && concept.corpusSentences.length > 0)) && (
        <div className="mt-8">
          <h3 className="text-[11px] font-bold text-ink mb-3 uppercase tracking-widest flex items-center gap-2">
            {t('grammar.corpusExamples', 'Found in Corpus')}
            {isLoadingCorpus && <Loader2 className="w-3 h-3 animate-spin text-muted" />}
          </h3>
          <div className="space-y-3">
            {(concept.corpusSentences ?? []).map((cs, i) => (
              <div key={i} className="card p-4 border-l-2 border-l-gold/40">
                <div
                  className="text-[16px] font-serif text-ink leading-relaxed mb-1"
                  dir={rtl ? 'rtl' : 'ltr'}
                >
                  {cs.sentenceText}
                </div>
                {cs.translation && (
                  <div className="text-[13px] text-ink2 italic mb-2">{cs.translation}</div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted">{cs.textTitle}</span>
                  {cs.textId && (
                    <button
                      onClick={() => navigate(`/app/reader/${cs.textId}`)}
                      className="flex items-center gap-1 text-[11px] text-blue hover:underline"
                    >
                      {t('grammar.readInContext', 'Read in context')}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <MorphologyQuiz concept={concept} onQuizResult={onQuizResult} />
    </div>
  );
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function FilterPill({
  children,
  active,
  onClick,
  variant = 'primary',
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all',
        active
          ? variant === 'primary'
            ? 'bg-blue text-white'
            : 'bg-ink text-white'
          : 'bg-parch2 text-ink3 hover:bg-parch3'
      )}
    >
      {children}
    </button>
  );
}

function ConceptCard({ concept, onClick, masteryLevel, locked }: { concept: Concept; onClick: () => void; masteryLevel: 0 | 1 | 2 | 3; locked: boolean }) {
  const Icon = CATEGORY_ICONS[concept.category] ?? GraduationCap;
  const hasParadigm = Boolean(concept.paradigm);

  return (
    <button
      onClick={locked ? undefined : onClick}
      className={cn(
        'card p-5 transition-all text-left group w-full',
        locked
          ? 'opacity-50 cursor-not-allowed border-bdr/30'
          : 'hover:border-blue/30 hover:shadow-md',
        masteryLevel === 3 && 'border-emerald-200 bg-emerald-50/30'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform',
          locked ? 'bg-parch2 text-muted' : masteryLevel === 3 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue/10 text-blue'
        )}>
          {locked ? <Lock className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-bold text-ink mb-0.5 line-clamp-1">{concept.title}</h3>
          <p className="text-[11px] text-muted mb-2">
            {LANG_LABELS[concept.languageId] || concept.languageId}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={cn(
                'text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full',
                DIFFICULTY_STYLES[concept.difficulty] ?? 'bg-parch2 text-ink3'
              )}
            >
              {concept.difficulty}
            </span>
            {hasParadigm && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-parch3 text-muted rounded-md">
                table
              </span>
            )}
            <span className="text-[10px] text-muted">{concept.examples.length} ex.</span>
            {!locked && masteryLevel > 0 && <MasteryBadge level={masteryLevel} />}
            {concept.relatedMorphKeys.slice(0, 2).map((k) => (
              <span
                key={k}
                className="text-[10px] font-bold px-1.5 py-0.5 bg-blue/10 text-blue rounded-md"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Pathway view ─────────────────────────────────────────────────────────────

interface PathwayStep {
  step: number;
  conceptId: string;
  title: string;
  level: string;
}

const LEVEL_STYLES: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  intermediate: 'bg-blue/10 text-blue border-blue/20',
  advanced: 'bg-amber/10 text-amber-700 border-amber/20',
};

function PathwayView({
  concepts,
  onSelectConcept,
}: {
  concepts: Concept[];
  onSelectConcept: (c: Concept) => void;
}) {
  const { t } = useTranslation();
  const [steps, setSteps] = useState<PathwayStep[]>([]);

  useEffect(() => {
    let stale = false;
    fetch(getApiUrl('/api/grammar/pathway'))
      .then((r) => r.json())
      .then((data) => { if (!stale) setSteps(Array.isArray(data) ? data : []); })
      .catch(() => { if (!stale) setSteps([]); });
    return () => { stale = true; };
  }, []);

  if (steps.length === 0) {
    return (
      <div className="py-12 text-center text-muted text-[14px]">
        {t('grammar.pathwayEmpty', 'No pathway steps found.')}
      </div>
    );
  }

  const conceptById = new Map(concepts.map((c) => [c.id, c]));
  const levels = ['beginner', 'intermediate', 'advanced'];

  return (
    <div className="space-y-8">
      {levels.map((level) => {
        const levelSteps = steps.filter((s) => s.level === level);
        if (levelSteps.length === 0) return null;
        return (
          <div key={level}>
            <div className="flex items-center gap-3 mb-4">
              <span
                className={cn(
                  'px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border',
                  LEVEL_STYLES[level] ?? 'bg-parch2 text-muted border-bdr/40'
                )}
              >
                {level}
              </span>
              <div className="flex-1 h-px bg-bdr/40" />
            </div>
            <div className="space-y-2">
              {levelSteps.map((step) => {
                const concept = conceptById.get(step.conceptId);
                const Icon = concept ? (CATEGORY_ICONS[concept.category] ?? GraduationCap) : GraduationCap;
                return (
                  <button
                    key={step.step}
                    onClick={() => concept && onSelectConcept(concept)}
                    disabled={!concept}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all',
                      concept
                        ? 'border-bdr/60 bg-parch hover:border-blue/40 hover:shadow-sm cursor-pointer group'
                        : 'border-bdr/30 bg-parch2/40 cursor-not-allowed opacity-50'
                    )}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue/10 text-blue font-bold text-[13px] shrink-0 group-hover:bg-blue group-hover:text-white transition-colors">
                      {step.step}
                    </div>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Icon className="w-4 h-4 text-muted shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-ink truncate">{step.title}</p>
                        {concept && (
                          <p className="text-[11px] text-muted truncate">
                            {LANG_LABELS[concept.languageId] || concept.languageId} ·{' '}
                            {concept.examples.length} examples
                          </p>
                        )}
                      </div>
                    </div>
                    {concept && (
                      <ChevronRight className="w-4 h-4 text-muted group-hover:text-blue transition-colors shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <p className="text-center text-muted text-[12px] italic pt-2">
        {t('grammar.pathwayFooter', 'Follow the pathway for a structured introduction to classical grammar.')}
      </p>
    </div>
  );
}

// ─── Prerequisite Graph ──────────────────────────────────────────────────────

interface GraphNode {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  languageId: string;
  prerequisites: string[];
}

interface GraphEdge {
  from: string;
  to: string;
}

function PrerequisiteGraph({
  onSelectConcept,
  concepts,
  activeLang,
  getMasteryLevel,
  isUnlocked,
}: {
  onSelectConcept: (c: Concept) => void;
  concepts: Concept[];
  activeLang: string;
  getMasteryLevel: (id: string) => 0 | 1 | 2 | 3;
  isUnlocked: (id: string, prereqs: string[]) => boolean;
}) {
  const { t } = useTranslation();
  const [graph, setGraph] = useState<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null);

  useEffect(() => {
    let stale = false;
    const langParam = activeLang !== 'all' ? `?lang=${activeLang}` : '';
    fetch(getApiUrl(`/api/grammar/graph${langParam}`))
      .then((r) => r.json())
      .then((data) => {
        if (!stale) setGraph(data);
      })
      .catch(() => {});
    return () => {
      stale = true;
    };
  }, [activeLang]);

  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="py-12 text-center text-muted text-[14px]">
        {t('grammar.graphEmpty', 'No prerequisite data available for this language.')}
      </div>
    );
  }

  const conceptById = new Map(concepts.map((c) => [c.id, c]));
  const nodeSet = new Set(graph.nodes.map((n) => n.id));
  const inDegree = new Map<string, number>();
  graph.nodes.forEach((n) => inDegree.set(n.id, 0));
  graph.edges.forEach((e) => {
    if (nodeSet.has(e.to)) inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1);
  });

  // Topological sort into tiers
  const tiers: GraphNode[][] = [];
  const placed = new Set<string>();
  const remaining = new Map(graph.nodes.map((n) => [n.id, n]));

  while (remaining.size > 0) {
    const tier: GraphNode[] = [];
    for (const [, node] of remaining) {
      const prereqs = node.prerequisites.filter((p) => nodeSet.has(p));
      if (prereqs.every((p) => placed.has(p))) {
        tier.push(node);
      }
    }
    if (tier.length === 0) {
      // Cycle — just dump remaining
      tier.push(...remaining.values());
      remaining.clear();
    }
    tier.sort((a, b) => {
      const catOrder = (a.category < b.category ? -1 : a.category > b.category ? 1 : 0);
      return catOrder || a.title.localeCompare(b.title);
    });
    tiers.push(tier);
    tier.forEach((n) => {
      placed.add(n.id);
      remaining.delete(n.id);
    });
  }

  const tierLabels = ['Foundation', 'Core', 'Intermediate', 'Advanced', 'Mastery'];

  const masteredCount = graph.nodes.filter((n) => getMasteryLevel(n.id) >= 3).length;
  const studiedCount = graph.nodes.filter((n) => getMasteryLevel(n.id) >= 1).length;
  const totalCount = graph.nodes.length;

  return (
    <div className="space-y-6">
      {totalCount > 0 && (
        <div className="card p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span className="text-[13px] font-semibold text-ink">
              {masteredCount}/{totalCount} mastered
            </span>
          </div>
          <div className="flex-1 min-w-[120px] h-2 bg-parch2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${totalCount > 0 ? (masteredCount / totalCount) * 100 : 0}%`,
                background: 'linear-gradient(90deg, #10b981, #059669)',
              }}
            />
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted">
            <span>{studiedCount} studied</span>
            <span>{masteredCount} mastered</span>
          </div>
        </div>
      )}
      {tiers.map((tier, ti) => (
        <div key={ti}>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted">
              {tierLabels[ti] ?? `Tier ${ti + 1}`}
            </span>
            <div className="flex-1 h-px bg-bdr/40" />
          </div>
          <div className="flex flex-wrap gap-2">
            {tier.map((node) => {
              const concept = conceptById.get(node.id);
              const Icon = CATEGORY_ICONS[node.category] ?? GraduationCap;
              const hasChildren = graph.edges.some((e) => e.from === node.id);
              const mastery = getMasteryLevel(node.id);
              const unlocked = isUnlocked(node.id, node.prerequisites);
              return (
                <button
                  key={node.id}
                  onClick={() => concept && unlocked && onSelectConcept(concept)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl border text-left text-[13px] font-medium transition-all',
                    !unlocked
                      ? 'border-bdr/30 bg-parch2/40 cursor-not-allowed opacity-50'
                      : mastery === 3
                        ? 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-400 hover:shadow-sm cursor-pointer group'
                        : concept
                          ? 'border-bdr/60 bg-parch hover:border-blue/40 hover:shadow-sm cursor-pointer group'
                          : 'border-bdr/30 bg-parch2/40 cursor-not-allowed opacity-50',
                    hasChildren && unlocked && 'border-l-2 border-l-blue/40'
                  )}
                >
                  {!unlocked ? (
                    <Lock className="w-3.5 h-3.5 text-muted shrink-0" />
                  ) : mastery === 3 ? (
                    <Trophy className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Icon className="w-3.5 h-3.5 text-muted group-hover:text-blue shrink-0" />
                  )}
                  <span className="truncate max-w-[200px]">{node.title}</span>
                  {unlocked && mastery > 0 && mastery < 3 && (
                    <MasteryBadge level={mastery} />
                  )}
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0',
                      DIFFICULTY_STYLES[node.difficulty] ?? 'bg-parch2 text-muted'
                    )}
                  >
                    {node.difficulty.slice(0, 3)}
                  </span>
                  {node.prerequisites.length > 0 && unlocked && (
                    <span className="text-[10px] text-muted" title={`Requires: ${node.prerequisites.join(', ')}`}>
                      ← {node.prerequisites.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <p className="text-center text-muted text-[12px] italic pt-2">
        {t(
          'grammar.graphFooter',
          'Concepts are arranged by prerequisite depth. Master earlier tiers before advancing.'
        )}
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export const Grammar = () => {
  const { t } = useTranslation();
  const { activeLanguageId } = useActiveLanguage();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selected, setSelected] = useState<Concept | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Default to the global active language; 'all' is available as an explicit filter.
  const [activeLang, setActiveLang] = useState<string>(activeLanguageId);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [view, setView] = useState<'browse' | 'pathway' | 'graph'>('browse');
  const mastery = useGrammarMastery();
  const { awardXP } = useXP();

  // Sync the language filter when the global active language changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveLang(activeLanguageId);
  }, [activeLanguageId]);

  useEffect(() => {
    let stale = false;
    fetch(getApiUrl('/api/grammar/concepts'))
      .then((r) => r.json())
      .then((data) => {
        if (stale) return;
        setConcepts(data);
        setIsLoading(false);
      })
      .catch(() => { if (!stale) setIsLoading(false); });
    return () => { stale = true; };
  }, []);

  const selectConcept = (concept: Concept) => {
    setIsLoadingDetail(true);
    setSelected(concept);
    fetch(getApiUrl(`/api/grammar/concepts/${concept.id}`))
      .then((r) => r.json())
      .then((data: Concept | null) => {
        if (data) setSelected(data);
      })
      .catch(() => {})
      .finally(() => setIsLoadingDetail(false));
  };

  const languages = useMemo(() => {
    const seen = new Set<string>();
    concepts.forEach((c) => seen.add(c.languageId));
    return Array.from(seen);
  }, [concepts]);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    concepts.forEach((c) => {
      if (c.category) seen.add(c.category);
    });
    return Array.from(seen);
  }, [concepts]);

  const filtered = useMemo(() => {
    return concepts.filter((c) => {
      const matchesLang = activeLang === 'all' || c.languageId === activeLang;
      const matchesCategory = activeCategory === 'all' || c.category === activeCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.explanation.toLowerCase().includes(q) ||
        c.relatedMorphKeys.some((k) => k.toLowerCase().includes(q));
      return matchesLang && matchesCategory && matchesSearch;
    });
  }, [concepts, activeLang, activeCategory, searchQuery]);

  const grouped = useMemo(() => {
    if (activeCategory !== 'all' || searchQuery) return null;
    const map = new Map<string, Concept[]>();
    for (const c of filtered) {
      const key = c.category ?? 'other';
      const list = map.get(key) ?? [];
      list.push(c);
      map.set(key, list);
    }
    return map;
  }, [filtered, activeCategory, searchQuery]);

  const handleMarkStudied = useCallback(() => {
    if (selected) mastery.markStudied(selected.id, selected.languageId);
  }, [selected, mastery]);

  const handleQuizResult = useCallback(
    async (correct: boolean) => {
      if (!selected) return;
      const justMastered = await mastery.recordQuizResult(selected.id, selected.languageId, correct);
      if (justMastered) {
        awardXP(XP_REWARDS.grammarConceptMastered).catch(() => {});
      }
    },
    [selected, mastery, awardXP]
  );

  if (isLoading)
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue mx-auto" />
      </div>
    );

  if (selected)
    return (
      <ConceptDetail
        concept={selected}
        isLoadingCorpus={isLoadingDetail}
        onBack={() => setSelected(null)}
        masteryLevel={mastery.getMasteryLevel(selected.id)}
        onMarkStudied={handleMarkStudied}
        onQuizResult={handleQuizResult}
      />
    );

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto font-sans min-h-screen">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue/10 rounded-lg flex items-center justify-center text-blue">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[28px] font-serif font-light text-ink tracking-tight">
              {t('grammar.title', 'Grammar Atlas')}
            </h2>
            <p className="text-ink2 text-[12px]">
              {t('grammar.subtitle', 'Curated grammar concepts for classical languages.')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/app/grammar/pathways"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue text-white text-[12px] font-bold rounded-lg hover:opacity-90 transition-opacity shrink-0"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Pathways
          </Link>
        <div className="flex items-center gap-1 bg-parch2 border border-bdr/60 rounded-lg p-1 shrink-0">
          <button
            onClick={() => setView('browse')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors',
              view === 'browse' ? 'bg-white text-blue shadow-sm' : 'text-muted hover:text-ink'
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            {t('grammar.browse', 'Browse')}
          </button>
          <button
            onClick={() => setView('pathway')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors',
              view === 'pathway' ? 'bg-white text-blue shadow-sm' : 'text-muted hover:text-ink'
            )}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            {t('grammar.pathway', 'Pathway')}
          </button>
          <button
            onClick={() => setView('graph')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors',
              view === 'graph' ? 'bg-white text-blue shadow-sm' : 'text-muted hover:text-ink'
            )}
          >
            <GitBranch className="w-3.5 h-3.5" />
            {t('grammar.graph', 'Graph')}
          </button>
        </div>
        </div>
      </header>

      {view === 'pathway' && (
        <PathwayView concepts={concepts} onSelectConcept={selectConcept} />
      )}

      {view === 'graph' && (
        <PrerequisiteGraph
          concepts={concepts}
          onSelectConcept={selectConcept}
          activeLang={activeLang}
          getMasteryLevel={mastery.getMasteryLevel}
          isUnlocked={mastery.isUnlocked}
        />
      )}

      {view !== 'browse' ? null : (
      <>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('grammar.search', 'Search concepts…')}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-bdr rounded-xl text-[14px] focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all"
        />
      </div>

      {/* Language tabs */}
      <div className="flex flex-wrap gap-2 mb-3">
        <FilterPill active={activeLang === 'all'} onClick={() => setActiveLang('all')}>
          All Languages
        </FilterPill>
        {languages.map((lang) => (
          <FilterPill key={lang} active={activeLang === lang} onClick={() => setActiveLang(lang)}>
            {LANG_LABELS[lang] || lang}
          </FilterPill>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterPill
          active={activeCategory === 'all'}
          onClick={() => setActiveCategory('all')}
          variant="secondary"
        >
          All Categories
        </FilterPill>
        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat] ?? GraduationCap;
          return (
            <FilterPill
              key={cat}
              active={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              variant="secondary"
            >
              <Icon className="w-3 h-3" /> {CATEGORY_LABELS[cat] || cat}
            </FilterPill>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted text-[14px]">
          <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>{t('grammar.noResults', 'No concepts match your search.')}</p>
        </div>
      ) : grouped ? (
        // Grouped by category view (default)
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([cat, items]) => {
            const Icon = CATEGORY_ICONS[cat] ?? GraduationCap;
            return (
              <section key={cat}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-muted" />
                  <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted">
                    {CATEGORY_LABELS[cat] || cat}
                  </h3>
                  <span className="text-[10px] text-muted/60 font-bold">({items.length})</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((c) => (
                    <ConceptCard
                      key={c.id}
                      concept={c}
                      onClick={() => selectConcept(c)}
                      masteryLevel={mastery.getMasteryLevel(c.id)}
                      locked={!mastery.isUnlocked(c.id, c.prerequisites ?? [])}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        // Flat filtered view
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((c) => (
            <ConceptCard
              key={c.id}
              concept={c}
              onClick={() => selectConcept(c)}
              masteryLevel={mastery.getMasteryLevel(c.id)}
              locked={!mastery.isUnlocked(c.id, c.prerequisites ?? [])}
            />
          ))}
        </div>
      )}

      <p className="text-center text-muted text-[12px] mt-10 italic">
        {t('grammar.footer', 'More concepts will be added as the corpus grows.')}
      </p>
      </>
      )}
    </div>
  );
};
