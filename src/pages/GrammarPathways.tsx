import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  GraduationCap,
  ChevronRight,
  CheckCircle,
  Circle,
  BookOpen,
  ArrowLeft,
  Clock,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getApiUrl } from '@/lib/services/apiBaseUrl';
import { getLanguageDisplayName } from '@/lib/constants/languages';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PathwaySummary {
  id: string;
  title: string;
  description: string;
  languageId: string;
  icon: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  steps: { step: number }[];
}

interface PathwayDetail extends PathwaySummary {
  steps: PathwayDetailStep[];
}

interface PathwayDetailStep {
  step: number;
  conceptId: string;
  recommendedTextIds: string[];
  concept: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    explanation: string;
    examples: { surface: string; gloss: string }[];
  } | null;
}

// ─── Progress helpers (localStorage) ─────────────────────────────────────────

const PROGRESS_KEY = 'paleoglossa_grammar_progress';

function loadProgress(): Record<string, string[]> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveProgress(progress: Record<string, string[]>) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function toggleStep(pathwayId: string, conceptId: string) {
  const progress = loadProgress();
  const completed = progress[pathwayId] || [];
  const idx = completed.indexOf(conceptId);
  if (idx >= 0) {
    completed.splice(idx, 1);
  } else {
    completed.push(conceptId);
  }
  progress[pathwayId] = completed;
  saveProgress(progress);
  return completed;
}

// ─── Level badge ──────────────────────────────────────────────────────────────

const LEVEL_BADGE: Record<string, string> = {
  beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  intermediate: 'bg-blue/10 text-blue border-blue/20',
  advanced: 'bg-amber/10 text-amber-700 border-amber/20',
};

// ─── Pathway list ─────────────────────────────────────────────────────────────

function PathwayList() {
  const navigate = useNavigate();
  const [pathways, setPathways] = useState<PathwaySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress] = useState(loadProgress);

  useEffect(() => {
    let stale = false;
    fetch(getApiUrl('/api/grammar/pathways'))
      .then((r) => r.json())
      .then((data) => { if (!stale) setPathways(Array.isArray(data) ? data : []); })
      .catch(() => { if (!stale) setPathways([]); })
      .finally(() => { if (!stale) setLoading(false); });
    return () => { stale = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  const byLanguage: Record<string, PathwaySummary[]> = {};
  pathways.forEach((p) => {
    if (!byLanguage[p.languageId]) byLanguage[p.languageId] = [];
    byLanguage[p.languageId].push(p);
  });

  return (
    <div className="space-y-10">
      {Object.entries(byLanguage).map(([langId, langPathways]) => (
        <section key={langId}>
          <h2 className="font-serif text-[20px] font-bold text-ink mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue" />
            {getLanguageDisplayName(langId)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {langPathways.map((pathway) => {
              const done = (progress[pathway.id] || []).length;
              const total = pathway.steps.length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <button
                  key={pathway.id}
                  onClick={() => navigate(`/app/grammar/pathways/${pathway.id}`)}
                  className="card p-5 text-left hover:border-blue/30 hover:shadow-md transition-all group active:scale-[0.99]"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl leading-none">{pathway.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[15px] font-serif font-bold text-ink">
                          {pathway.title}
                        </span>
                        <span className={cn('text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border', LEVEL_BADGE[pathway.level])}>
                          {pathway.level}
                        </span>
                      </div>
                      <p className="text-[12px] text-muted line-clamp-2">{pathway.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted group-hover:text-blue transition-colors shrink-0 mt-1" />
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> ~{pathway.estimatedHours}h
                    </span>
                    <span>{total} steps</span>
                    {done > 0 && (
                      <span className="text-blue font-bold">{done}/{total} done</span>
                    )}
                  </div>
                  <div className="h-1.5 bg-parch3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

// ─── Pathway detail ───────────────────────────────────────────────────────────

function PathwayDetail({ pathwayId }: { pathwayId: string }) {
  const navigate = useNavigate();
  const [pathway, setPathway] = useState<PathwayDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const p = loadProgress();
    setCompleted(p[pathwayId] || []); // eslint-disable-line react-hooks/set-state-in-effect
  }, [pathwayId]);

  useEffect(() => {
    let stale = false;
    fetch(getApiUrl(`/api/grammar/pathways/${encodeURIComponent(pathwayId)}`))
      .then((r) => r.json())
      .then((data) => { if (!stale) setPathway(data); })
      .catch(() => { if (!stale) setPathway(null); })
      .finally(() => { if (!stale) setLoading(false); });
    return () => { stale = true; };
  }, [pathwayId]);

  const handleToggle = useCallback((conceptId: string) => {
    const next = toggleStep(pathwayId, conceptId);
    setCompleted([...next]);
  }, [pathwayId]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!pathway) {
    return (
      <div className="text-center py-20 text-muted">
        <p>Pathway not found.</p>
        <Link to="/app/grammar/pathways" className="text-blue underline text-sm mt-2 inline-block">
          ← Back to pathways
        </Link>
      </div>
    );
  }

  const doneCount = completed.length;
  const totalCount = pathway.steps.length;
  const pct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <button
        onClick={() => navigate('/app/grammar/pathways')}
        className="flex items-center gap-1.5 text-[12px] text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> All Pathways
      </button>

      <div className="flex items-start gap-4 mb-6">
        <span className="text-4xl leading-none">{pathway.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h1 className="text-[26px] font-serif font-light text-ink">{pathway.title}</h1>
            <span className={cn('text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border', LEVEL_BADGE[pathway.level])}>
              {pathway.level}
            </span>
          </div>
          <p className="text-[14px] text-muted font-body italic mb-3">{pathway.description}</p>
          <div className="flex items-center gap-4 text-[12px] text-muted">
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> ~{pathway.estimatedHours}h</span>
            <span className="font-bold text-blue">{doneCount}/{totalCount} steps complete</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-parch3 rounded-full overflow-hidden mb-8">
        <div className="h-full bg-blue rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {pathway.steps.map((s) => {
          const isDone = completed.includes(s.conceptId);
          return (
            <div
              key={s.step}
              className={cn(
                'card p-5 transition-all',
                isDone && 'border-green-200 bg-green-50/30'
              )}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleToggle(s.conceptId)}
                  className="mt-0.5 shrink-0 text-muted hover:text-blue transition-colors"
                  title={isDone ? 'Mark as incomplete' : 'Mark as complete'}
                >
                  {isDone ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[11px] font-bold text-muted uppercase tracking-widest">
                      Step {s.step}
                    </span>
                    {s.concept && (
                      <span className="text-[10px] bg-parch3 text-muted px-2 py-0.5 rounded-full capitalize">
                        {s.concept.category}
                      </span>
                    )}
                  </div>

                  {s.concept ? (
                    <>
                      <h3 className="text-[16px] font-serif font-bold text-ink mb-2">
                        {s.concept.title}
                      </h3>
                      <p className="text-[12px] text-muted line-clamp-2 mb-3 font-body">
                        {s.concept.explanation.split('\n')[0]}
                      </p>
                      {s.concept.examples.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {s.concept.examples.slice(0, 3).map((ex, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 bg-parch2 border border-bdr/40 px-2 py-0.5 rounded text-[11px]"
                            >
                              <span className="font-serif text-ink">{ex.surface}</span>
                              <span className="text-muted">—</span>
                              <span className="text-muted">{ex.gloss}</span>
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-[13px] text-muted italic">Concept coming soon.</p>
                  )}

                  {/* Recommended texts */}
                  {s.recommendedTextIds.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted tracking-widest mb-1.5">
                        Practice in
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {s.recommendedTextIds.map((textId) => (
                          <Link
                            key={textId}
                            to={`/app/reader/${textId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-bdr/50 text-[11px] font-bold text-blue hover:border-blue/40 hover:shadow-sm transition-all"
                          >
                            <BookOpen className="w-3 h-3" />
                            {textId}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {s.concept && (
                  <Link
                    to={`/app/grammar`}
                    state={{ conceptId: s.conceptId }}
                    className="shrink-0 px-3 py-1.5 text-[11px] font-bold text-muted border border-bdr/40 rounded-lg hover:border-blue/40 hover:text-blue transition-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Study
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {doneCount === totalCount && totalCount > 0 && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-2xl text-center">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-[16px] font-serif font-bold text-green-700">Pathway Complete!</p>
          <p className="text-[13px] text-green-600 mt-1">You've finished {pathway.title}. Keep reading in the Library to reinforce these concepts.</p>
          <Link
            to="/app/library"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-green-600 text-white text-[13px] font-bold rounded-lg hover:bg-green-700 transition-colors"
          >
            <BookOpen className="w-4 h-4" /> Explore Library
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Router wrapper ───────────────────────────────────────────────────────────

export function GrammarPathways() {
  const { pathwayId } = useParams<{ pathwayId?: string }>();

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto min-h-screen">
      {!pathwayId && (
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-6 h-6 text-blue" />
            <h1 className="text-[32px] font-serif font-light text-ink tracking-tight">
              Grammar Pathways
            </h1>
          </div>
          <p className="font-body text-[15px] italic text-ink2">
            Structured curricula linking grammar concepts to real corpus texts. Work through steps in order and track your progress.
          </p>
        </header>
      )}
      {pathwayId ? <PathwayDetail pathwayId={pathwayId} /> : <PathwayList />}
    </div>
  );
}
