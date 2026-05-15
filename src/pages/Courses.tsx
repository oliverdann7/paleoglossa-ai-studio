import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Plus, BookOpen, Globe, Lock, Loader2, ChevronRight,
  Trash2, Edit2, X, Check, Play, UserCheck, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../lib/hooks/useAuth';
import { useActiveLanguage } from '../lib/hooks/useActiveLanguage';
import { CourseService, CourseWithMeta } from '../lib/services/courseService';
import { CourseTextAssignment } from '../types/modules';
import { LANGUAGES, getLanguageById, getLanguageDisplayName } from '../lib/constants/languages';
import { useKnowledge } from '../lib/hooks/useKnowledge';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';

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

  const overallProgress = textCount > 0
    ? Math.round(course.texts.reduce((sum, t) => sum + (readingProgress[t.textId] ?? 0), 0) / textCount)
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
            <p className="text-[13px] text-ink2 line-clamp-2 leading-relaxed">{course.description}</p>
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
              onClick={e => { e.stopPropagation(); onDelete(); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 hover:text-red-500 text-muted transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {!isOwner && isEnrolled && onLeave && (
            <button
              onClick={e => { e.stopPropagation(); onLeave(); }}
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
  onSave: (data: { title: string; description: string; languageId: string; isPublic: boolean; texts: CourseTextAssignment[] }) => Promise<void>;
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

  const addText = (textId: string, textTitle: string) => {
    if (texts.some(t => t.textId === textId)) return;
    setTexts(prev => [...prev, { textId, order: prev.length + 1, learningObjectives: textTitle }]);
  };

  const removeText = (textId: string) => {
    setTexts(prev => prev.filter(t => t.textId !== textId).map((t, i) => ({ ...t, order: i + 1 })));
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setIsSaving(true);
    setError(null);
    try {
      await onSave({ title: title.trim(), description: description.trim(), languageId, isPublic, texts });
    } catch {
      setError('Failed to save. Please try again.');
      setIsSaving(false);
    }
  };

  const availableTexts = userImports.filter(imp => imp.languageId === languageId || !imp.languageId);

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
          <label className="block text-[12px] font-bold text-muted uppercase tracking-wider mb-1.5">Title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. The Iliad – Books 1–6"
            className="w-full px-4 py-2.5 border border-bdr rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/50"
          />
        </div>

        <div>
          <label className="block text-[12px] font-bold text-muted uppercase tracking-wider mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What will students read and learn?"
            rows={3}
            className="w-full px-4 py-2.5 border border-bdr rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/50 resize-none"
          />
        </div>

        <div>
          <label className="block text-[12px] font-bold text-muted uppercase tracking-wider mb-1.5">Language</label>
          <select
            value={languageId}
            onChange={e => setLanguageId(e.target.value)}
            className="w-full px-4 py-2.5 border border-bdr rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/50 bg-white"
          >
            {LANGUAGES.map(lang => (
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
              "w-10 h-6 rounded-full transition-colors relative",
              isPublic ? "bg-blue" : "bg-parch3"
            )}
          >
            <div className={cn(
              "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
              isPublic ? "translate-x-4" : "translate-x-0.5"
            )} />
          </div>
          <div>
            <div className="text-[14px] font-medium text-ink">Make public</div>
            <div className="text-[12px] text-muted">Other scholars can find and join this reading list</div>
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
              <div key={t.textId} className="flex items-center gap-2 px-3 py-2 bg-parch2 rounded-lg text-[13px]">
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-blue/10 text-blue text-[10px] font-bold shrink-0">{i + 1}</span>
                <span className="flex-1 text-ink truncate">{t.learningObjectives || t.textId}</span>
                <button onClick={() => removeText(t.textId)} className="text-muted hover:text-red-500 transition-colors shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {availableTexts.length > 0 ? (
          <div className="border border-bdr rounded-lg max-h-40 overflow-y-auto">
            {availableTexts.filter(imp => !texts.some(t => t.textId === imp.id)).map(imp => (
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

function CourseDetail({
  course,
  isOwner,
  readingProgress,
  onJoin,
  onLeave,
  onEdit,
  onBack,
}: {
  course: CourseWithMeta;
  isOwner: boolean;
  readingProgress: Record<string, number>;
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
      <button onClick={onBack} className="flex items-center gap-1.5 text-[13px] text-muted hover:text-blue mb-6 transition-colors">
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
              {course.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
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
              {isJoining ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Join
            </button>
          )}
          {!isOwner && isEnrolled && (
            <button
              onClick={handleLeave}
              disabled={isLeaving}
              className="flex items-center gap-1.5 px-4 py-2 border border-bdr text-[13px] font-semibold hover:bg-parch transition-colors rounded-lg disabled:opacity-50"
            >
              {isLeaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              Leave
            </button>
          )}
        </div>
      </div>

      {course.description && (
        <p className="font-body text-[15px] italic text-ink2 mb-6 leading-relaxed">{course.description}</p>
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
        <div className="space-y-2">
          {course.texts
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((assignment, i) => {
              const pct = readingProgress[assignment.textId] ?? 0;
              const canRead = isOwner || isEnrolled;
              return (
                <div key={assignment.textId} className="card p-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-parch2 flex items-center justify-center text-[13px] font-bold text-muted shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-ink truncate mb-1">
                      {assignment.learningObjectives || assignment.textId}
                    </div>
                    {canRead && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-parch3 rounded-full overflow-hidden">
                          <div className="h-full bg-blue rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[11px] text-muted shrink-0">{pct}%</span>
                      </div>
                    )}
                  </div>
                  {canRead && (
                    <button
                      onClick={() => navigate(`/app/reader/${assignment.textId}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue text-white text-[12px] font-semibold rounded-lg hover:bg-blue/90 transition-colors shrink-0"
                    >
                      <Play className="w-3 h-3" fill="currentColor" />
                      Read
                    </button>
                  )}
                  {!canRead && (
                    <Lock className="w-4 h-4 text-muted shrink-0" />
                  )}
                </div>
              );
            })}
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
  const { userImports } = useKnowledge(activeLanguageId);

  const [view, setView] = useState<View>('list');
  const [courses, setCourses] = useState<CourseWithMeta[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [readingProgress] = useState<Record<string, number>>({});

  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    const data = await CourseService.getCourses();
    setCourses(data);
    setIsLoading(false);
  }, []);

  useEffect(() => { loadCourses(); }, [loadCourses]);

  const userId = user?.uid ?? null;
  const ownedCourses = courses.filter(c => c.ownerId === userId);
  const enrolledCourses = courses.filter(c => c.ownerId !== userId && (c.isEnrolled || c._enrolled));
  const discoverCourses = courses.filter(c => c.ownerId !== userId && !c.isEnrolled && !c._enrolled && c.isPublic);

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
    setCourses(prev => prev.filter(c => c.id !== courseId));
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
            <p className="text-[12px] text-muted">Organize texts into structured reading sequences</p>
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
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-blue" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* My lists */}
                {ownedCourses.length > 0 && (
                  <section>
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">My Reading Lists</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {ownedCourses.map(c => (
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
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">Enrolled</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {enrolledCourses.map(c => (
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
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted mb-3">Discover</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {discoverCourses.map(c => (
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
          <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CourseForm
              onSave={handleCreate}
              onCancel={() => setView('list')}
              userImports={userImports}
            />
          </motion.div>
        )}

        {/* Edit */}
        {view === 'edit' && selectedCourse && (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
          <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CourseDetail
              course={selectedCourse}
              isOwner={selectedCourse.ownerId === userId}
              readingProgress={readingProgress}
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
