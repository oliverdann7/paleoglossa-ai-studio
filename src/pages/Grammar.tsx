import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { getApiUrl } from '../lib/services/apiBaseUrl.js';

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

function MorphologyQuiz({ concept }: { concept: Concept }) {
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
      setScore((s) => ({
        correct: s.correct + (choice === question.answer ? 1 : 0),
        total: s.total + 1,
      }));
    },
    [selected, question]
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
}: {
  concept: Concept;
  isLoadingCorpus: boolean;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const rtl = RTL.has(concept.languageId);
  const Icon = CATEGORY_ICONS[concept.category] ?? GraduationCap;

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

      <MorphologyQuiz concept={concept} />
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

function ConceptCard({ concept, onClick }: { concept: Concept; onClick: () => void }) {
  const Icon = CATEGORY_ICONS[concept.category] ?? GraduationCap;
  const hasParadigm = Boolean(concept.paradigm);

  return (
    <button
      onClick={onClick}
      className="card p-5 hover:border-blue/30 hover:shadow-md transition-all text-left group w-full"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue/10 flex items-center justify-center text-blue shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
          <Icon className="w-4 h-4" />
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

// ─── Main page ────────────────────────────────────────────────────────────────

export const Grammar = () => {
  const { t } = useTranslation();
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [selected, setSelected] = useState<Concept | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLang, setActiveLang] = useState<string>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    fetch(getApiUrl('/api/grammar/concepts'))
      .then((r) => r.json())
      .then((data) => {
        setConcepts(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
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
      />
    );

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto font-sans min-h-screen">
      <header className="mb-6 flex items-center gap-3">
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
      </header>

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
                    <ConceptCard key={c.id} concept={c} onClick={() => selectConcept(c)} />
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
            <ConceptCard key={c.id} concept={c} onClick={() => selectConcept(c)} />
          ))}
        </div>
      )}

      <p className="text-center text-muted text-[12px] mt-10 italic">
        {t('grammar.footer', 'More concepts will be added as the corpus grows.')}
      </p>
    </div>
  );
};
