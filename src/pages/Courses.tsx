import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Plus,
  BookOpen,
  Globe,
  Lock,
  Loader2,
  ChevronRight,
  Trash2,
  Edit2,
  X,
  Check,
  Play,
  UserCheck,
  LogOut,
  Brain,
  Flame,
  BarChart2,
  ChevronDown,
  Download,
  UserMinus,
  ArrowUpDown,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../lib/hooks/useAuth.js';
import { useActiveLanguage } from '../lib/hooks/useActiveLanguage.js';
import { CourseService, CourseWithMeta, CourseRosterMember } from '../lib/services/courseService.js';
import { CourseTextAssignment } from '../types/modules.js';
import { LANGUAGES, getLanguageById, getLanguageDisplayName } from '../lib/constants/languages.js';
import { useKnowledge } from '../lib/hooks/useKnowledge.js';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { ImportService } from '../lib/services/importService.js';
import { WordState } from '../lib/constants/wordStates.js';
import { KnowledgeMap } from '../lib/services/vocabularyService.js';
import { CourseQuizModal } from '../components/courses/CourseQuizModal.js';
import { PreDrillModal, DrillLemma } from '../components/courses/PreDrillModal.js';
import { StatsService } from '../lib/services/statsService.js';

type View = 'list' | 'detail' | 'create' | 'edit';

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({
  course,
  isOwner,
  isEnrolled,
  readingProgress,
  onClick,
  onDelete,
  onLeave,
}: {
  course: CourseWithMeta;
  isOwner: boolean;
  isEnrolled: boolean;
  readingProgress: Record<string, number>;
  onClick: () => void;
  onDelete?: () => void;
  onLeave?: () => void;
}) {
  const lang = getLanguageById(course.languageId);
  const textCount = course.texts?.length ?? 0;

  const overallProgress =
    textCount > 0
      ? Math.round(
          course.texts.reduce((sum, t) => sum + (readingProgress[t.textId] ?? 0), 0) / textCount
        )
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 hover:shadow-md transition-all cursor-pointer group relative"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{lang?.icon ?? '📖'}</span>
            <h3 className="font-serif font-bold text-[16px] text-ink truncate">{course.title}</h3>
          </div>
          {course.description && (
            <p className="text-[13px] text-ink2 line-clamp-2 leading-relaxed">
              {course.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {course.isPublic ? (
            <Globe className="w-3.5 h-3.5 text-blue" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-muted" />
          )}
          {isOwner && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 hover:text-red-500 text-muted transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {!isOwner && isEnrolled && onLeave && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLeave();
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-amber-50 hover:text-amber-600 text-muted transition-all"
              title="Leave course"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-[12px] text-muted mb-3">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          {textCount} {textCount === 1 ? 'text' : 'texts'}
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {course.memberCount ?? 1} {(course.memberCount ?? 1) === 1 ? 'member' : 'members'}
        </span>
        {course.createdAt && (
          <span>{formatDistanceToNow(new Date(course.createdAt), { addSuffix: true })}</span>
        )}
      </div>

      {textCount > 0 && (isOwner || isEnrolled) && (
        <div>
          <div className="flex items-center justify-between text-[11px] text-muted mb-1">
            <span>Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="h-1.5 bg-parch3 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue rounded-full transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-1.5">
          {isOwner && (
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-blue/10 text-blue rounded-full">
              Your course
            </span>
          )}
          {!isOwner && isEnrolled && (
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> Enrolled
            </span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted group-hover:text-blue transition-colors" />
      </div>
    </motion.div>
  );
}

// ─── Create / Edit Form ───────────────────────────────────────────────────────

function CourseForm({
  initial,
  onSave,
  onCancel,
  userImports,
}: {
  initial?: Partial<CourseWithMeta>;
  onSave: (data: {
    title: string;
    description: string;
    languageId: string;
    isPublic: boolean;
    texts: CourseTextAssignment[];
  }) => Promise<void>;
  onCancel: () => void;
  userImports: any[];
}) {
  const { activeLanguageId } = useActiveLanguage();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [languageId, setLanguageId] = useState(initial?.languageId ?? activeLanguageId ?? 'grc');
  const [isPublic, setIsPublic] = useState(initial?.isPublic ?? false);
  const [texts, setTexts] = useState<CourseTextAssignment[]>(initial?.texts ?? []);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  const addText = (textId: string, textTitle: string) => {
    if (texts.some((t) => t.textId === textId)) return;
    setTexts((prev) => [
      ...prev,
      { textId, order: prev.length + 1, learningObjectives: textTitle },
    ]);
  };

  const removeText = (textId: string) => {
    setTexts((prev) =>
      prev.filter((t) => t.textId !== textId).map((t, i) => ({ ...t, order: i + 1 }))
    );
  };

  const updateTeacherNote = (textId: string, note: string) => {
    setTexts((prev) =>
      prev.map((t) => (t.textId === textId ? { ...t, teacherNote: note } : t))
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        languageId,
        isPublic,
        texts,
      });
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const availableTexts = userImports.filter(
    (imp) => imp.languageId === languageId || !imp.languageId
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <h3 className="font-serif text-[22px] font-bold text-ink mb-6">
        {initial?.id ? 'Edit Reading List' : 'Create Reading List'}
      </h3>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-[12px] font-bold text-muted uppercase tracking-wider mb-1.5">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. The Iliad – Books 1–6"
            className="w-full px-4 py-2.5 border border-bdr rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/50"
          />
        </div>

        <div>
          <label className="block text-[12px] font-bold text-muted uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will students read and learn?"
            rows={3}
            className="w-full px-4 py-2.5 border border-bdr rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/50 resize-none"
          />
        </div>

        <div>
          <label className="block text-[12px] font-bold text-muted uppercase tracking-wider mb-1.5">
            Language
          </label>
          <select
            value={languageId}
            onChange={(e) => setLanguageId(e.target.value)}
            className="w-full px-4 py-2.5 border border-bdr rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/50 bg-white"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.icon} {getLanguageDisplayName(lang.id)}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setIsPublic(!isPublic)}
            className={cn(
              'w-10 h-6 rounded-full transition-colors relative',
              isPublic ? 'bg-blue' : 'bg-parch3'
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
                isPublic ? 'translate-x-4' : 'translate-x-0.5'
              )}
            />
          </div>
          <div>
            <div className="text-[14px] font-medium text-ink">Make public</div>
            <div className="text-[12px] text-muted">
              Other scholars can find and join this reading list
            </div>
          </div>
        </label>
      </div>

      {/* Texts */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[12px] font-bold text-muted uppercase tracking-wider">Texts</label>
          <span className="text-[12px] text-muted">{texts.length} added</span>
        </div>

        {texts.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {texts.map((t, i) => (
              <div key={t.textId} className="bg-parch2 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 text-[13px]">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue/10 text-blue text-[10px] font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-ink truncate">{t.learningObjectives || t.textId}</span>
                  <button
                    onClick={() => setExpandedNoteId(expandedNoteId === t.textId ? null : t.textId)}
                    className={cn(
                      'p-1 rounded transition-colors shrink-0',
                      expandedNoteId === t.textId || t.teacherNote
                        ? 'text-blue'
                        : 'text-muted hover:text-ink'
                    )}
                    title="Add reading guide"
                  >
                    <FileText className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeText(t.textId)}
                    className="text-muted hover:text-red-500 transition-colors shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {expandedNoteId === t.textId && (
                  <div className="px-3 pb-2.5 border-t border-bdr/30">
                    <textarea
                      className="w-full mt-2 text-[12px] bg-white border border-bdr rounded-lg px-3 py-2 text-ink placeholder:text-muted resize-none focus:outline-none focus:ring-1 focus:ring-blue/40"
                      rows={3}
                      placeholder="Add a reading guide, key vocabulary, or learning objectives for students…"
                      value={t.teacherNote ?? ''}
                      onChange={(e) => updateTeacherNote(t.textId, e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {availableTexts.length > 0 ? (
          <div className="border border-bdr rounded-lg max-h-40 overflow-y-auto">
            {availableTexts
              .filter((imp) => !texts.some((t) => t.textId === imp.id))
              .map((imp) => (
                <button
                  key={imp.id}
                  onClick={() => addText(imp.id, imp.title)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-parch2 transition-colors text-[13px] text-ink border-b border-bdr/50 last:border-0"
                >
                  <Plus className="w-3.5 h-3.5 text-blue shrink-0" />
                  <span className="truncate">{imp.title}</span>
                </button>
              ))}
          </div>
        ) : (
          <p className="text-[13px] text-muted italic">
            Import texts in {getLanguageDisplayName(languageId)} to add them here.
          </p>
        )}
      </div>

      {error && <p className="text-red-500 text-[13px] mb-4">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-bdr text-[14px] font-semibold hover:bg-parch transition-colors rounded-lg"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSaving || !title.trim()}
          className="flex-1 px-4 py-2.5 bg-blue text-white text-[14px] font-semibold rounded-lg hover:bg-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {isSaving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Course Detail ────────────────────────────────────────────────────────────

// ─── Difficulty badge ─────────────────────────────────────────────────────────
function DifficultyBadge({ unknownPct }: { unknownPct: number | null }) {
  if (unknownPct === null) return null;
  if (unknownPct <= 15)
    return (
      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
        Easy
      </span>
    );
  if (unknownPct <= 30)
    return (
      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue/10 text-blue">
        Accessible
      </span>
    );
  if (unknownPct <= 50)
    return (
      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">
        Challenging
      </span>
    );
  return (
    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-red-50 text-red-700 flex items-center gap-0.5">
      <Flame className="w-2.5 h-2.5" /> Hard
    </span>
  );
}

function CourseDetail({
  course,
  isOwner,
  readingProgress,
  knowledge,
  userId,
  onJoin,
  onLeave,
  onEdit,
  onBack,
}: {
  course: CourseWithMeta;
  isOwner: boolean;
  readingProgress: Record<string, number>;
  knowledge: KnowledgeMap;
  userId: string | null;
  onJoin: () => Promise<void>;
  onLeave: () => Promise<void>;
  onEdit: () => void;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const lang = getLanguageById(course.languageId);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(Boolean(course.isEnrolled));

  // Teacher roster
  const [roster, setRoster] = useState<CourseRosterMember[]>([]);
  const [showRoster, setShowRoster] = useState(false);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [rosterSortBy, setRosterSortBy] = useState<'name' | 'progress'>('name');

  const loadRoster = useCallback(async () => {
    setRosterLoading(true);
    const data = await CourseService.getRoster(course.id);
    setRoster(data);
    setRosterLoading(false);
  }, [course.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOwner) loadRoster();
  }, [isOwner, loadRoster]);

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this student from the course?')) return;
    setRemovingMemberId(memberId);
    const ok = await CourseService.removeMember(course.id, memberId);
    if (ok) setRoster((r) => r.filter((m) => m.userId !== memberId));
    setRemovingMemberId(null);
  };

  const exportRosterCSV = () => {
    const students = roster.filter((m) => m.role !== 'teacher');
    const sortedTexts = [...course.texts].sort((a, b) => a.order - b.order);
    const headers = ['Name', 'Email', 'Joined', ...sortedTexts.map((_, i) => `Text ${i + 1}`), 'Overall'];
    const rows = students.map((m) => {
      const pcts = sortedTexts.map((t) => m.progress[t.textId] ?? 0);
      const overall = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;
      const joinedStr = m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : '';
      return [m.displayName, m.email, joinedStr, ...pcts.map(String), String(overall)];
    });
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.title.replace(/\s+/g, '-')}-roster.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sync reading progress to course member doc (enrolled students and owner)
  useEffect(() => {
    if (!userId || course.texts.length === 0) return;
    const syncProgress = async () => {
      for (const assignment of course.texts) {
        const pct = readingProgress[assignment.textId];
        if (pct && pct > 0) {
          await CourseService.updateProgress(course.id, assignment.textId, pct);
        }
      }
    };
    syncProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id, userId]);

  // Import data for difficulty calculation
  const [importData, setImportData] = useState<
    Record<
      string,
      {
        stats: { totalWords: number; knownWords: number };
        sentences?: { tokens: { lemma?: string; type: string }[] }[];
        rawContent?: string;
      }
    >
  >({});

  useEffect(() => {
    if (!userId) return;
    const textIds = course.texts.map((t) => t.textId);
    Promise.all(
      textIds.map((id) =>
        ImportService.getImport(userId, id).then((imp) => (imp ? ([id, imp] as const) : null))
      )
    ).then((results) => {
      const map: typeof importData = {};
      for (const r of results) {
        if (r) map[r[0]] = r[1] as (typeof importData)[string];
      }
      setImportData(map);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.id, userId]);

  // Compute per-text unknown-word density from live knowledge map
  const unknownDensity = useMemo<Record<string, number | null>>(() => {
    const result: Record<string, number | null> = {};
    for (const assignment of course.texts) {
      const imp = importData[assignment.textId];
      if (!imp?.sentences) {
        result[assignment.textId] = null;
        continue;
      }
      const tokens = imp.sentences.flatMap((s) => s.tokens).filter((t) => t.type === 'word');
      if (tokens.length === 0) {
        result[assignment.textId] = null;
        continue;
      }
      const unknown = tokens.filter((t) => {
        if (!t.lemma) return true;
        const info = knowledge[t.lemma.toLowerCase()];
        const state = info?.state ?? WordState.NEW;
        return state === WordState.NEW || state === WordState.SEEN;
      });
      result[assignment.textId] = Math.round((unknown.length / tokens.length) * 100);
    }
    return result;
  }, [course.texts, importData, knowledge]);

  // Find the recommended next text: first incomplete with density <= 30% (or just first incomplete)
  const sortedTexts = course.texts.slice().sort((a, b) => a.order - b.order);
  const recommendedTextId = useMemo(() => {
    const incomplete = sortedTexts.filter((t) => (readingProgress[t.textId] ?? 0) < 100);
    const accessible = incomplete.find((t) => {
      const d = unknownDensity[t.textId];
      return d === null || d <= 30;
    });
    return (accessible ?? incomplete[0])?.textId ?? null;
  }, [sortedTexts, readingProgress, unknownDensity]);

  // Adaptive tip: if all texts ≥ 80% done, show suggestion
  const allProgress = sortedTexts.map((t) => readingProgress[t.textId] ?? 0);
  const avgProgress =
    allProgress.length > 0 ? allProgress.reduce((a, b) => a + b, 0) / allProgress.length : 0;
  const allComplete = allProgress.length > 0 && allProgress.every((p) => p >= 80);
  const avgDensity = Object.values(unknownDensity).filter((v): v is number => v !== null);
  const meanDensity =
    avgDensity.length > 0 ? avgDensity.reduce((a, b) => a + b, 0) / avgDensity.length : null;

  // Pre-drill modal state
  const [preDrill, setPreDrill] = useState<{
    assignment: CourseTextAssignment;
    lemmas: DrillLemma[];
  } | null>(null);
  // Quiz modal state
  const [quiz, setQuiz] = useState<{ textId: string; title: string; snippet: string } | null>(null);

  const handleReadClick = (assignment: CourseTextAssignment) => {
    const imp = importData[assignment.textId];
    if (imp?.sentences) {
      // Gather top lemmas for pre-drill
      const lemmaMap = new Map<string, DrillLemma>();
      for (const s of imp.sentences) {
        for (const t of s.tokens) {
          if (t.type !== 'word' || !t.lemma || lemmaMap.has(t.lemma)) continue;
          const info = knowledge[t.lemma.toLowerCase()];
          const state = (info?.state as WordState | undefined) ?? WordState.NEW;
          if (state !== WordState.KNOWN && state !== WordState.IGNORED) {
            lemmaMap.set(t.lemma, { lemma: t.lemma, gloss: (t as any).gloss || '', state });
          }
        }
        if (lemmaMap.size >= 10) break;
      }
      const lemmas = Array.from(lemmaMap.values()).slice(0, 10);
      if (lemmas.length > 0) {
        setPreDrill({ assignment, lemmas });
        return;
      }
    }
    navigate(`/app/reader/${assignment.textId}`);
  };

  const handleOpenQuiz = (assignment: CourseTextAssignment) => {
    const imp = importData[assignment.textId];
    const snippet = imp?.rawContent?.slice(0, 2000) ?? '';
    setQuiz({
      textId: assignment.textId,
      title: assignment.learningObjectives || assignment.textId,
      snippet,
    });
  };

  const handleJoin = async () => {
    setIsJoining(true);
    await onJoin();
    setIsEnrolled(true);
    setIsJoining(false);
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    await onLeave();
    setIsEnrolled(false);
    setIsLeaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Pre-drill modal */}
      {preDrill && (
        <PreDrillModal
          textTitle={preDrill.assignment.learningObjectives || preDrill.assignment.textId}
          lemmas={preDrill.lemmas}
          onStartReading={() => {
            setPreDrill(null);
            navigate(`/app/reader/${preDrill.assignment.textId}`);
          }}
          onClose={() => setPreDrill(null)}
        />
      )}

      {/* Quiz modal */}
      {quiz && (
        <CourseQuizModal
          textTitle={quiz.title}
          textSnippet={quiz.snippet}
          languageId={course.languageId}
          onClose={() => setQuiz(null)}
        />
      )}

      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] text-muted hover:text-blue mb-6 transition-colors"
      >
        <ChevronRight className="w-4 h-4 rotate-180" /> Back to courses
      </button>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{lang?.icon ?? '📖'}</span>
            <h2 className="font-serif text-[26px] font-bold text-ink">{course.title}</h2>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-muted mt-1">
            <span className="flex items-center gap-1">
              {course.isPublic ? (
                <Globe className="w-3.5 h-3.5" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              {course.isPublic ? 'Public' : 'Private'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {course.memberCount ?? 1} {(course.memberCount ?? 1) === 1 ? 'member' : 'members'}
            </span>
            <span>{getLanguageDisplayName(course.languageId)}</span>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {isOwner && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-2 border border-bdr text-[13px] font-semibold hover:bg-parch transition-colors rounded-lg"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
          )}
          {!isOwner && course.isPublic && !isEnrolled && (
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue text-white text-[13px] font-semibold rounded-lg hover:bg-blue/90 disabled:opacity-50 transition-colors"
            >
              {isJoining ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Join
            </button>
          )}
          {!isOwner && isEnrolled && (
            <button
              onClick={handleLeave}
              disabled={isLeaving}
              className="flex items-center gap-1.5 px-4 py-2 border border-bdr text-[13px] font-semibold hover:bg-parch transition-colors rounded-lg disabled:opacity-50"
            >
              {isLeaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              Leave
            </button>
          )}
        </div>
      </div>

      {course.description && (
        <p className="font-body text-[15px] italic text-ink2 mb-6 leading-relaxed">
          {course.description}
        </p>
      )}

      {/* Overall progress bar */}
      {sortedTexts.length > 0 && (isOwner || isEnrolled) && avgProgress > 0 && (
        <div className="mb-6 card p-4">
          <div className="flex items-center justify-between text-[12px] text-muted mb-2">
            <span className="font-bold text-ink">Course Progress</span>
            <span>{Math.round(avgProgress)}% complete</span>
          </div>
          <div className="h-2 bg-parch3 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue rounded-full transition-all"
              style={{ width: `${avgProgress}%` }}
            />
          </div>
        </div>
      )}

      {course.texts.length === 0 ? (
        <div className="card p-8 text-center border-dashed border-2 border-bdr/40">
          <BookOpen className="w-10 h-10 text-muted/50 mx-auto mb-3" />
          <p className="text-muted text-[14px]">No texts added yet.</p>
          {isOwner && (
            <button onClick={onEdit} className="mt-3 text-blue text-[13px] hover:underline">
              Add texts →
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {sortedTexts.map((assignment, i) => {
              const pct = readingProgress[assignment.textId] ?? 0;
              const canRead = isOwner || isEnrolled;
              const density = unknownDensity[assignment.textId] ?? null;
              const isRecommended = canRead && assignment.textId === recommendedTextId;
              return (
                <div
                  key={assignment.textId}
                  className={cn(
                    'card p-4 flex items-center gap-4 transition-all',
                    isRecommended && 'border-blue/40 ring-1 ring-blue/20'
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-parch2 flex items-center justify-center text-[13px] font-bold text-muted shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-[14px] font-medium text-ink truncate">
                        {assignment.learningObjectives || assignment.textId}
                      </span>
                      {isRecommended && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-blue text-white shrink-0">
                          Next
                        </span>
                      )}
                      <DifficultyBadge unknownPct={density} />
                    </div>
                    {canRead && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-parch3 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-muted shrink-0">{pct}%</span>
                      </div>
                    )}
                    {assignment.teacherNote && (
                      <p className="mt-1.5 text-[12px] text-ink2 italic leading-relaxed border-l-2 border-blue/30 pl-2">
                        {assignment.teacherNote}
                      </p>
                    )}
                  </div>
                  {canRead && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {pct > 0 && (
                        <button
                          onClick={() => handleOpenQuiz(assignment)}
                          title="Comprehension quiz"
                          className="p-1.5 rounded-lg border border-bdr text-muted hover:text-blue hover:border-blue/40 transition-colors"
                        >
                          <Brain className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleReadClick(assignment)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue text-white text-[12px] font-semibold rounded-lg hover:bg-blue/90 transition-colors"
                      >
                        <Play className="w-3 h-3" fill="currentColor" />
                        {pct === 0 ? 'Start' : 'Continue'}
                      </button>
                    </div>
                  )}
                  {!canRead && <Lock className="w-4 h-4 text-muted shrink-0" />}
                </div>
              );
            })}
          </div>

          {/* Adaptive difficulty tip */}
          {allComplete && meanDensity !== null && (
            <div className="mt-6 card p-4 bg-parch2/60 border-dashed">
              {meanDensity <= 10 ? (
                <p className="text-[13px] text-emerald-700 flex items-start gap-2">
                  <span className="text-[16px]">🎓</span>
                  <span>
                    You handled this course with ease (avg. {Math.round(meanDensity)}% unknown).
                    Consider a more challenging course or longer texts next.
                  </span>
                </p>
              ) : meanDensity <= 30 ? (
                <p className="text-[13px] text-blue flex items-start gap-2">
                  <span className="text-[16px]">✅</span>
                  <span>
                    Course complete! Your comprehension is solid. Keep reading to consolidate.
                  </span>
                </p>
              ) : (
                <p className="text-[13px] text-amber-700 flex items-start gap-2">
                  <span className="text-[16px]">📖</span>
                  <span>
                    These texts were challenging (avg. {Math.round(meanDensity)}% unknown). Review
                    vocabulary in the SRS before moving on.
                  </span>
                </p>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Teacher dashboard ─────────────────────────────────────────────── */}
      {isOwner && (
        <div className="mt-8">
          <button
            onClick={() => setShowRoster((v) => !v)}
            className="flex items-center gap-2 text-[13px] font-bold text-ink mb-3 hover:text-blue transition-colors"
          >
            <BarChart2 className="w-4 h-4" />
            Student Progress
            {!rosterLoading && (
              <span className="text-[11px] text-muted font-normal">
                ({roster.filter((m) => m.role !== 'teacher').length} enrolled)
              </span>
            )}
            {rosterLoading && <Loader2 className="w-3 h-3 animate-spin text-muted" />}
            <ChevronDown
              className={cn('w-4 h-4 text-muted transition-transform', showRoster && 'rotate-180')}
            />
          </button>

          {showRoster && (
            <div className="card overflow-hidden">
              {roster.filter((m) => m.role !== 'teacher').length === 0 ? (
                <div className="p-6 text-center text-[13px] text-muted">
                  No students have joined yet.
                </div>
              ) : (
                <>
                  {/* Toolbar */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-bdr/40 bg-parch2/60">
                    <button
                      onClick={() => setRosterSortBy((s) => s === 'name' ? 'progress' : 'name')}
                      className="flex items-center gap-1.5 text-[11px] text-muted hover:text-ink transition-colors"
                    >
                      <ArrowUpDown className="w-3 h-3" />
                      Sort by {rosterSortBy === 'name' ? 'progress' : 'name'}
                    </button>
                    <button
                      onClick={exportRosterCSV}
                      className="flex items-center gap-1.5 text-[11px] text-blue hover:text-blue/80 transition-colors font-medium"
                    >
                      <Download className="w-3 h-3" />
                      Export CSV
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="border-b border-bdr bg-parch2">
                          <th className="px-4 py-2.5 text-left font-bold text-muted uppercase tracking-wider">
                            Student
                          </th>
                          <th className="px-3 py-2.5 text-left font-bold text-muted uppercase tracking-wider whitespace-nowrap">
                            Joined
                          </th>
                          {sortedTexts.map((t, i) => (
                            <th
                              key={t.textId}
                              className="px-3 py-2.5 text-center font-bold text-muted uppercase tracking-wider whitespace-nowrap"
                            >
                              Text {i + 1}
                            </th>
                          ))}
                          <th className="px-3 py-2.5 text-center font-bold text-muted uppercase tracking-wider">
                            Overall
                          </th>
                          <th className="px-2 py-2.5" />
                        </tr>
                      </thead>
                      <tbody>
                        {roster
                          .filter((m) => m.role !== 'teacher')
                          .map((member) => {
                            const textPcts = sortedTexts.map(
                              (t) => member.progress[t.textId] ?? 0
                            );
                            const overall =
                              textPcts.length > 0
                                ? Math.round(textPcts.reduce((a, b) => a + b, 0) / textPcts.length)
                                : 0;
                            return { member, textPcts, overall };
                          })
                          .sort((a, b) =>
                            rosterSortBy === 'name'
                              ? a.member.displayName.localeCompare(b.member.displayName)
                              : b.overall - a.overall
                          )
                          .map(({ member, textPcts, overall }) => (
                            <tr key={member.userId} className="border-b border-bdr/50 last:border-0 group">
                              <td className="px-4 py-3">
                                <div className="font-medium text-ink truncate max-w-[130px]">
                                  {member.displayName}
                                </div>
                                {member.email && (
                                  <div className="text-muted text-[11px] truncate max-w-[130px]">
                                    {member.email}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-3 text-muted whitespace-nowrap">
                                {member.joinedAt
                                  ? formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })
                                  : '—'}
                              </td>
                              {textPcts.map((pct, i) => (
                                <td key={i} className="px-3 py-3 text-center">
                                  <div className="flex flex-col items-center gap-1">
                                    <span
                                      className={cn(
                                        'font-bold text-[11px]',
                                        pct === 0
                                          ? 'text-muted'
                                          : pct >= 100
                                            ? 'text-emerald-600'
                                            : 'text-blue'
                                      )}
                                    >
                                      {pct}%
                                    </span>
                                    <div className="w-12 h-1 bg-parch3 rounded-full overflow-hidden">
                                      <div
                                        className={cn(
                                          'h-full rounded-full transition-all',
                                          pct >= 100 ? 'bg-emerald-500' : 'bg-blue'
                                        )}
                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                              ))}
                              <td className="px-3 py-3 text-center">
                                <span
                                  className={cn(
                                    'font-bold text-[12px]',
                                    overall === 0
                                      ? 'text-muted'
                                      : overall >= 100
                                        ? 'text-emerald-600'
                                        : 'text-ink'
                                  )}
                                >
                                  {overall}%
                                </span>
                              </td>
                              <td className="px-2 py-3">
                                <button
                                  onClick={() => handleRemoveMember(member.userId)}
                                  disabled={removingMemberId === member.userId}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-muted disabled:opacity-50"
                                  title="Remove student"
                                >
                                  {removingMemberId === member.userId ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <UserMinus className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export const Courses = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, isDemoMode } = useAuth();
  const { activeLanguageId } = useActiveLanguage();
  const { userImports, knowledge } = useKnowledge(activeLanguageId);

  const [view, setView] = useState<View>('list');
  const [courses, setCourses] = useState<CourseWithMeta[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [readingProgress, setReadingProgress] = useState<Record<string, number>>({});

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    const data = await CourseService.getCourses();
    setCourses(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCourses();
  }, [loadCourses]);

  const userId = user?.uid ?? null;

  useEffect(() => {
    StatsService.getAllProgress(userId).then((all) => {
      const map: Record<string, number> = {};
      for (const p of all) map[p.textId] = Math.round(p.lastPosition ?? 0);
      setReadingProgress(map);
    });
  }, [userId]);

  const langCourses = courses.filter((c) => c.languageId === activeLanguageId);
  const ownedCourses = langCourses.filter((c) => c.ownerId === userId);
  const enrolledCourses = langCourses.filter(
    (c) => c.ownerId !== userId && (c.isEnrolled || c._enrolled)
  );
  const discoverCourses = langCourses.filter(
    (c) => c.ownerId !== userId && !c.isEnrolled && !c._enrolled && c.isPublic
  );

  const handleOpenDetail = async (course: CourseWithMeta) => {
    if (userId) {
      const fresh = await CourseService.getCourse(course.id);
      setSelectedCourse(fresh ?? course);
    } else {
      setSelectedCourse(course);
    }
    setView('detail');
  };

  const handleCreate = async (data: Parameters<typeof CourseService.createCourse>[0]) => {
    const created = await CourseService.createCourse(data);
    if (created) {
      await loadCourses();
      setSelectedCourse(created);
      setView('detail');
    }
  };

  const handleUpdate = async (data: any) => {
    if (!selectedCourse) return;
    await CourseService.updateCourse(selectedCourse.id, data);
    await loadCourses();
    const fresh = await CourseService.getCourse(selectedCourse.id);
    setSelectedCourse(fresh ?? selectedCourse);
    setView('detail');
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Delete this reading list?')) return;
    await CourseService.deleteCourse(courseId);
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    if (selectedCourse?.id === courseId) setView('list');
  };

  const handleJoin = async () => {
    if (!selectedCourse) return;
    await CourseService.joinCourse(selectedCourse.id);
    await loadCourses();
    const fresh = await CourseService.getCourse(selectedCourse.id);
    setSelectedCourse(fresh ?? selectedCourse);
  };

  const handleLeave = async () => {
    if (!selectedCourse) return;
    await CourseService.leaveCourse(selectedCourse.id);
    await loadCourses();
    const fresh = await CourseService.getCourse(selectedCourse.id);
    setSelectedCourse(fresh ?? selectedCourse);
  };

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto font-sans min-h-screen">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue/10 rounded-lg flex items-center justify-center text-blue">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[28px] font-serif font-light text-ink tracking-tight">
              {t('courses.title', 'Reading Lists')}
            </h2>
            <p className="text-[12px] text-muted">
              Organize texts into structured reading sequences
            </p>
          </div>
        </div>
        {view === 'list' && user && !isDemoMode && (
          <button
            onClick={() => setView('create')}
            className="flex items-center gap-2 px-4 py-2 bg-blue text-white font-bold rounded-xl text-[13px] hover:bg-blue/90 transition-all"
          >
            <Plus className="w-4 h-4" /> New List
          </button>
        )}
      </header>

      <AnimatePresence mode="wait">
        {/* List view */}
        {view === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-blue" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* My lists */}
                {ownedCourses.length > 0 && (
                  <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">
                      My Reading Lists
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {ownedCourses.map((c) => (
                        <CourseCard
                          key={c.id}
                          course={c}
                          isOwner
                          isEnrolled
                          readingProgress={readingProgress}
                          onClick={() => handleOpenDetail(c)}
                          onDelete={() => handleDelete(c.id)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Enrolled */}
                {enrolledCourses.length > 0 && (
                  <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">
                      Enrolled
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {enrolledCourses.map((c) => (
                        <CourseCard
                          key={c.id}
                          course={c}
                          isOwner={false}
                          isEnrolled
                          readingProgress={readingProgress}
                          onClick={() => handleOpenDetail(c)}
                          onLeave={async () => {
                            await CourseService.leaveCourse(c.id);
                            await loadCourses();
                          }}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Discover */}
                {discoverCourses.length > 0 && (
                  <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">
                      Discover
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {discoverCourses.map((c) => (
                        <CourseCard
                          key={c.id}
                          course={c}
                          isOwner={false}
                          isEnrolled={false}
                          readingProgress={{}}
                          onClick={() => handleOpenDetail(c)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Empty state */}
                {courses.length === 0 && (
                  <div className="card p-10 text-center border-dashed border-2 border-bdr/40 bg-parch2/50">
                    <Users className="w-12 h-12 text-muted/50 mx-auto mb-4" />
                    <p className="font-serif text-[18px] text-ink mb-2">No reading lists yet</p>
                    <p className="text-[14px] text-muted mb-6">
                      Create a reading list to organise texts into a structured sequence.
                    </p>
                    {user && !isDemoMode ? (
                      <button
                        onClick={() => setView('create')}
                        className="px-5 py-2.5 bg-blue text-white font-semibold rounded-xl text-[13px] hover:bg-blue/90 transition-all inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Create your first list
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate('/app/library')}
                        className="px-5 py-2.5 border border-bdr text-[13px] font-semibold hover:bg-parch transition-colors rounded-lg"
                      >
                        Browse Library
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Create */}
        {view === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CourseForm
              onSave={handleCreate}
              onCancel={() => setView('list')}
              userImports={userImports}
            />
          </motion.div>
        )}

        {/* Edit */}
        {view === 'edit' && selectedCourse && (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CourseForm
              initial={selectedCourse}
              onSave={handleUpdate}
              onCancel={() => setView('detail')}
              userImports={userImports}
            />
          </motion.div>
        )}

        {/* Detail */}
        {view === 'detail' && selectedCourse && (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CourseDetail
              course={selectedCourse}
              isOwner={selectedCourse.ownerId === userId}
              readingProgress={readingProgress}
              knowledge={knowledge}
              userId={userId}
              onJoin={handleJoin}
              onLeave={handleLeave}
              onEdit={() => setView('edit')}
              onBack={() => setView('list')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
