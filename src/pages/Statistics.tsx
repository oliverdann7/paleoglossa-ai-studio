import { getLangForLemma } from '../lib/data/dictionary.js';
import { format, subDays, parseISO } from 'date-fns';
import { lazy, Suspense, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  BookOpen,
  Zap,
  History,
  BarChart2,
  CheckCircle2 as CheckCircle,
  Brain,
  FileText,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKnowledge } from '../lib/hooks/useKnowledge.js';
import { useReadingProgress } from '../lib/hooks/useReadingProgress.js';
import { useActiveLanguage } from '../lib/hooks/useActiveLanguage.js';
import { getLanguageDisplayName } from '../lib/constants/languages.js';
import { TextProgress } from '../lib/services/statsService.js';
import { WordState } from '../lib/constants/wordStates.js';
import { useTranslation } from 'react-i18next';

const ChartsSection = lazy(() => import('../components/reader/ChartsSection.js'));

const StatCard = ({
  label,
  value,
  trend,
  trendUp,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  trend?: string | null;
  trendUp?: boolean;
  icon: React.ElementType;
  color: 'blue' | 'amber' | 'green' | 'ruby';
  sub?: string;
}) => (
  <div className="card p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div
        className={cn(
          'p-3 rounded-2xl bg-opacity-10',
          color === 'blue'
            ? 'bg-blue/10 text-blue'
            : color === 'amber'
              ? 'bg-amber/10 text-amber'
              : color === 'ruby'
                ? 'bg-ruby/10 text-ruby'
                : 'bg-green-600/10 text-green-600'
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div
          className={cn(
            'flex items-center gap-1 text-[11px] font-bold',
            trendUp ? 'text-green-600' : 'text-ruby'
          )}
        >
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </div>
    <div>
      <div className="text-[32px] font-serif font-bold text-ink leading-none mb-1">{value}</div>
      <div className="eyebrow text-muted text-[9px] font-bold tracking-widest">{label}</div>
      {sub && <div className="text-[10px] text-muted mt-1 font-mono">{sub}</div>}
    </div>
  </div>
);

export const Statistics = () => {
  const navigate = useNavigate();
  const { activeLanguageId } = useActiveLanguage();
  const { stats, knowledge } = useKnowledge(activeLanguageId);
  const { getAllProgress } = useReadingProgress(activeLanguageId);
  const { t } = useTranslation();
  const [allProgress, setAllProgress] = useState<TextProgress[]>([]);

  useEffect(() => {
    getAllProgress()
      .then(setAllProgress)
      .catch(() => setAllProgress([]));
  }, [getAllProgress]);

  // ── Derived vocab counts ──────────────────────────────────────────────────
  const vocabCounts = useMemo(() => {
    let known = 0,
      learning = 0,
      seen = 0,
      ignored = 0;
    for (const info of Object.values(knowledge)) {
      const state = typeof info === 'object' ? info.state : info;
      const lang = typeof info === 'object' ? (info as any).languageId || '' : '';
      if (lang && lang !== activeLanguageId) continue;
      if (state === WordState.KNOWN) known++;
      else if (state === WordState.LEARNING) learning++;
      else if (state === WordState.SEEN) seen++;
      else if (state === WordState.IGNORED) ignored++;
    }
    return { known, learning, seen, ignored };
  }, [knowledge, activeLanguageId]);

  // ── Real week-over-week trends ────────────────────────────────────────────
  const trends = useMemo(() => {
    const history = stats.history || [];

    const pct = (curr: number, prev: number): string | null => {
      if (prev === 0) return null;
      const p = Math.round(((curr - prev) / prev) * 100);
      if (p === 0) return null;
      return `${p > 0 ? '+' : ''}${p}% vs last week`;
    };

    const thisWeekWords =
      (stats.readToday || 0) + history.slice(-6).reduce((s, d) => s + (d.readWords || 0), 0);
    const lastWeekWords = history.slice(-14, -7).reduce((s, d) => s + (d.readWords || 0), 0);
    const wordsTrend = pct(thisWeekWords, lastWeekWords);
    const wordsTrendUp = thisWeekWords >= lastWeekWords;

    const thisWeekTime =
      (stats.readingTime || 0) + history.slice(-6).reduce((s, d) => s + (d.minutes || 0), 0);
    const lastWeekTime = history.slice(-14, -7).reduce((s, d) => s + (d.minutes || 0), 0);
    const timeTrend = pct(thisWeekTime, lastWeekTime);
    const timeTrendUp = thisWeekTime >= lastWeekTime;

    // Known words added this week vs last
    const knownNow = stats.totalKnown || 0;
    const knownWeekAgo = history.length >= 7 ? history[history.length - 7].knownWords : 0;
    const knownAdded = knownNow - knownWeekAgo;
    const knownTrend = knownAdded > 0 ? `+${knownAdded} this week` : null;

    return { wordsTrend, wordsTrendUp, timeTrend, timeTrendUp, knownTrend };
  }, [stats]);

  // ── 30-day chart data (real, zero-padded) ────────────────────────────────
  const trendData = useMemo(() => {
    let data = [...(stats.history || [])];
    if (data.length < 30) {
      const needed = 30 - data.length;
      const firstDate = data.length > 0 ? parseISO(data[0].date) : new Date();
      const pads = [];
      for (let i = needed; i > 0; i--) {
        pads.push({
          date: format(subDays(firstDate, i), 'yyyy-MM-dd'),
          knownWords: 0,
          readWords: 0,
          minutes: 0,
        });
      }
      data = [...pads, ...data];
    } else {
      data = data.slice(-30);
    }
    return data;
  }, [stats.history]);

  // ── 13-week heatmap (real) ────────────────────────────────────────────────
  const heatmap = useMemo(() => {
    const data = new Array(13 * 7).fill(0);
    const today = new Date();
    (stats.history || []).forEach((item) => {
      const date = parseISO(item.date);
      const diff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diff >= 0 && diff < 91) {
        const index = 90 - diff;
        let intensity = 0;
        if (item.readWords > 500) intensity = 4;
        else if (item.readWords > 200) intensity = 3;
        else if (item.readWords > 50) intensity = 2;
        else if (item.readWords > 0) intensity = 1;
        data[index] = intensity;
      }
    });
    return data;
  }, [stats.history]);

  // ── Vocabulary by language (real) ─────────────────────────────────────────
  const languageStats = useMemo(() => {
    const raw: Record<string, { label: string; known: number; learning: number; new: number }> = {
      grc: { label: 'Ancient Greek', known: 0, learning: 0, new: 0 },
      'grc-koine': { label: 'Koine Greek', known: 0, learning: 0, new: 0 },
      hbo: { label: 'Biblical Hebrew', known: 0, learning: 0, new: 0 },
      lat: { label: 'Classical Latin', known: 0, learning: 0, new: 0 },
      syr: { label: 'Syriac', known: 0, learning: 0, new: 0 },
      cop: { label: 'Coptic', known: 0, learning: 0, new: 0 },
      arc: { label: 'Aramaic', known: 0, learning: 0, new: 0 },
      akk: { label: 'Akkadian', known: 0, learning: 0, new: 0 },
      san: { label: 'Sanskrit', known: 0, learning: 0, new: 0 },
      egy: { label: 'Egyptian Hieroglyphs', known: 0, learning: 0, new: 0 },
    };

    Object.entries(knowledge).forEach(([lemma, info]) => {
      const i = typeof info === 'object' ? info : { state: info };
      const dictLang = getLangForLemma(lemma);
      let lang = dictLang !== 'Unknown' ? dictLang : 'grc-koine';
      if (dictLang === 'Unknown') {
        if (/[֐-׿܀-ݏݐ-ݿࢠ-ࣿיִ-ﭏ]/u.test(lemma)) lang = 'hbo';
        else if (/[a-zA-Z]/.test(lemma)) lang = 'lat';
        else if (/[\u{13000}-\u{1342E}]/u.test(lemma)) lang = 'egy';
      }
      if (lang === 'Biblical Hebrew') lang = 'hbo';
      if ((i as any).languageId) lang = (i as any).languageId;
      else if ((i as any).language) lang = (i as any).language;

      const bucket = raw[lang] ?? (raw['other'] = { label: lang, known: 0, learning: 0, new: 0 });
      if (i.state === WordState.KNOWN) bucket.known++;
      else if (i.state === WordState.NEW) bucket.new++;
      else bucket.learning++;
    });

    return Object.values(raw)
      .map((l) => {
        const total = l.known + l.learning + l.new;
        const cefr = l.known < 1000 ? 'A1' : l.known < 3000 ? 'A2' : l.known < 6000 ? 'B1' : 'B2';
        return {
          ...l,
          total,
          cefr,
          percentKnown: total ? (l.known / total) * 100 : 0,
          percentLearning: total ? (l.learning / total) * 100 : 0,
        };
      })
      .filter((l) => l.total > 0);
  }, [knowledge]);

  // ── Computed milestones (real) ────────────────────────────────────────────
  const computedMilestones = useMemo(() => {
    const total = stats.totalKnown || 0;
    const streak = stats.streak || 0;
    const langCount = languageStats.length;
    const textsCompleted = allProgress.filter((p) => p.completed).length;

    return [
      {
        label: 'First Words',
        desc: 'Learn your first 10 words',
        completed: total >= 10,
        progress: Math.min(total / 10, 1),
        progressLabel: total < 10 ? `${10 - total} to go` : null,
      },
      {
        label: 'Century Scholar',
        desc: 'Know 100 words across the library',
        completed: total >= 100,
        progress: Math.min(total / 100, 1),
        progressLabel: total < 100 ? `${100 - total} to go` : null,
      },
      {
        label: 'Reading Habit',
        desc: 'Maintain a 7-day reading streak',
        completed: streak >= 7,
        progress: Math.min(streak / 7, 1),
        progressLabel: streak < 7 ? `${7 - streak} days to go` : null,
      },
      {
        label: 'Polyglot Apprentice',
        desc: 'Study words in 2 or more languages',
        completed: langCount >= 2,
        progress: Math.min(langCount / 2, 1),
        progressLabel: langCount < 2 ? 'Study a second language' : null,
      },
      {
        label: 'First Text Completed',
        desc: 'Read a text all the way through',
        completed: textsCompleted >= 1,
        progress: Math.min(textsCompleted, 1),
        progressLabel: textsCompleted === 0 ? 'Keep reading' : null,
      },
      {
        label: 'Deep Scholar',
        desc: 'Know 2,000 words across the library',
        completed: total >= 2000,
        progress: Math.min(total / 2000, 1),
        progressLabel: total < 2000 ? `${(2000 - total).toLocaleString()} to go` : null,
      },
    ];
  }, [stats.totalKnown, stats.streak, languageStats.length, allProgress]);

  // ── Weekly totals ─────────────────────────────────────────────────────────
  const weeklyStats = useMemo(() => {
    const history = stats.history || [];
    const weekRead =
      (stats.readToday || 0) + history.slice(-6).reduce((s, d) => s + (d.readWords || 0), 0);
    const totalMinutes =
      (stats.readingTime || 0) + history.reduce((s, d) => s + (d.minutes || 0), 0);
    return {
      weekRead,
      totalHours: (totalMinutes / 60).toFixed(1),
    };
  }, [stats]);

  // ── Empty state ───────────────────────────────────────────────────────────
  const isEmpty =
    (stats.history || []).length === 0 && stats.totalKnown === 0 && stats.readToday === 0;

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto font-sans min-h-screen">
      <header className="mb-10">
        <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">
          {t('stats.title', 'Progress Analytics')}
        </h2>
        <p className="font-body text-[15px] italic text-ink2">
          {t(
            'stats.description',
            'Knowledge is a marathon. Every page read is a stone in your intellectual fortress.'
          )}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-blue/10 text-blue text-[12px] font-bold rounded-lg">
          {t('stats.shownFor', 'Stats shown for')}: {getLanguageDisplayName(activeLanguageId)}
        </div>
      </header>

      {isEmpty ? (
        <div className="card p-12 text-center border-dashed border-2 border-bdr/40 bg-parch2/50 flex flex-col items-center mt-8">
          <BarChart2 className="w-12 h-12 text-muted mb-4 opacity-50" />
          <h3 className="font-serif text-[24px] text-ink mb-2">
            {t('stats.noData', 'No Data Yet')}
          </h3>
          <p className="text-ink3 max-w-sm mx-auto mb-8">
            {t(
              'stats.noDataDesc',
              'Read your first words or complete a review session to see your progress here.'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => navigate('/app/library')} className="btn-primary px-6 py-2.5">
              {t('stats.browseLibrary', 'Browse the Library')}
            </button>
            <button onClick={() => navigate('/app/import')} className="btn-secondary px-6 py-2.5">
              {t('dashboard.importText', 'Import a Text')}
            </button>
            <button onClick={() => navigate('/app/review')} className="btn-secondary px-6 py-2.5">
              {t('stats.startReview', 'Start a Review')}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label={t('stats.knownWords', 'Known Words')}
              value={stats.totalKnown.toLocaleString()}
              trend={trends.knownTrend}
              trendUp
              icon={BookOpen}
              color="blue"
            />
            <StatCard
              label={t('stats.wordsReadWeek', 'Words Read (Week)')}
              value={weeklyStats.weekRead.toLocaleString()}
              trend={trends.wordsTrend}
              trendUp={trends.wordsTrendUp}
              icon={History}
              color="amber"
              sub={t('stats.xToday', '{{count}} today', { count: stats.readToday || 0 })}
            />
            <StatCard
              label={t('stats.totalReadingTime', 'Total Reading Time')}
              value={`${weeklyStats.totalHours}h`}
              trend={trends.timeTrend}
              trendUp={trends.timeTrendUp}
              icon={Clock}
              color="green"
            />
            <StatCard
              label={t('stats.currentStreak', 'Current Streak')}
              value={`🔥 ${stats.streak}`}
              icon={Zap}
              color="amber"
              sub={
                stats.streak === 0
                  ? t('stats.readTodayToStart', 'Read today to start one')
                  : stats.streak === 1
                    ? `1 ${t('stats.day', 'day')}`
                    : `${stats.streak} ${t('stats.days', 'days')}`
              }
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <StatCard
              label={t('stats.learningWords', 'Learning Words')}
              value={vocabCounts.learning.toLocaleString()}
              icon={Brain}
              color="ruby"
              sub={t('stats.xSeen', '{{count}} seen', { count: vocabCounts.seen })}
            />
            <StatCard
              label={t('stats.lastReviewAccuracy', 'Last Review Accuracy')}
              value={
                stats.lastAccuracy != null
                  ? `${stats.lastAccuracy <= 1 ? Math.round(stats.lastAccuracy * 100) : stats.lastAccuracy}%`
                  : '—'
              }
              icon={Target}
              color="blue"
              sub={stats.lastAccuracy == null ? t('stats.noSession', 'No session yet') : undefined}
            />
            <StatCard
              label={t('stats.textsCompleted', 'Texts Completed')}
              value={allProgress.filter((p) => p.completed).length}
              icon={FileText}
              color="green"
              sub={
                allProgress.length > 0
                  ? t('stats.xStarted', '{{count}} started', { count: allProgress.length })
                  : t('stats.noneStarted', 'None started yet')
              }
            />
            <StatCard
              label={t('stats.ignoredWords', 'Ignored Words')}
              value={vocabCounts.ignored.toLocaleString()}
              icon={BookOpen}
              color="amber"
              sub={t('stats.skippedReading', 'Skipped during reading')}
            />
          </div>

          {/* ── Heatmap + Milestones ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2 card p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[18px] font-serif font-bold text-ink">
                  {t('stats.readingActivity', 'Reading Activity (13 Weeks)')}
                </h3>
                <div className="flex gap-1 text-[9px] font-bold text-muted uppercase tracking-widest items-center">
                  <span>{t('stats.less', 'Less')}</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-parch rounded-sm" />
                    <div className="w-3 h-3 bg-amber/30 rounded-sm" />
                    <div className="w-3 h-3 bg-amber/60 rounded-sm" />
                    <div className="w-3 h-3 bg-amber rounded-sm" />
                    <div className="w-3 h-3 bg-gold rounded-sm" />
                  </div>
                  <span>{t('stats.more', 'More')}</span>
                </div>
              </div>
              <div className="flex gap-1.5 overflow-hidden">
                {Array.from({ length: 13 }).map((_, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1.5 flex-1">
                    {Array.from({ length: 7 }).map((_, dayIndex) => {
                      const intensity = heatmap[weekIndex * 7 + dayIndex];
                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            'w-full pt-[100%] rounded-sm transition-all duration-300',
                            intensity === 0
                              ? 'bg-parch'
                              : intensity === 1
                                ? 'bg-amber/30'
                                : intensity === 2
                                  ? 'bg-amber/60'
                                  : intensity === 3
                                    ? 'bg-amber'
                                    : 'bg-gold shadow-sm'
                          )}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-muted uppercase tracking-widest px-1">
                <span>{format(subDays(new Date(), 90), 'MMM')}</span>
                <span>{format(subDays(new Date(), 45), 'MMM')}</span>
                <span>{format(new Date(), 'MMM')}</span>
              </div>
            </div>

            {/* ── Milestones (real) ── */}
            <div className="card p-8 flex flex-col h-full">
              <h3 className="text-[18px] font-serif font-bold text-ink mb-6">
                {t('stats.milestoneTracker', 'Milestone Tracker')}
              </h3>

              {computedMilestones.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <CheckCircle className="w-8 h-8 text-muted opacity-30 mb-3" />
                  <p className="text-[13px] text-muted italic">
                    Start reading to unlock milestones.
                  </p>
                </div>
              ) : (
                <div className="space-y-5 flex-1 overflow-y-auto">
                  {computedMilestones.map((m, i) => (
                    <div
                      key={i}
                      className={cn('relative flex gap-4', !m.completed && 'opacity-60')}
                    >
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                          m.completed ? 'bg-green-100 text-green-600' : 'bg-parch2 text-muted'
                        )}
                      >
                        {m.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <div className="w-2 h-2 bg-muted rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-bold text-ink mb-0.5">{m.label}</h4>
                        <p className="text-[11px] text-muted leading-snug">{m.desc}</p>
                        {m.progressLabel && (
                          <p className="text-[10px] text-blue font-bold italic mt-0.5">
                            {m.progressLabel}
                          </p>
                        )}
                        {!m.completed && m.progress > 0 && (
                          <div className="mt-1.5 h-1 w-full bg-parch3 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue transition-all"
                              style={{ width: `${m.progress * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Suspense
              fallback={
                <div className="card p-6 flex items-center justify-center h-32 col-span-3">
                  <span className="text-muted animate-pulse">
                    {t('stats.loadingCharts', 'Loading charts…')}
                  </span>
                </div>
              }
            >
              <ChartsSection trendData={trendData} />
            </Suspense>
          </div>

          {/* ── Language Proficiency (real) ── */}
          {languageStats.length > 0 ? (
            <div className="card p-8">
              <h3 className="text-[20px] font-serif font-bold text-ink mb-8">
                {t('stats.languageProficiency', 'Language Proficiency')}
              </h3>
              <div className="space-y-10">
                {languageStats.map((l, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <h4 className="text-[17px] font-bold text-ink leading-none">{l.label}</h4>
                        <span className="text-[11px] font-serif italic text-muted">
                          {t('stats.estLevel', 'Estimated Level:')} {l.cefr}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[18px] font-bold text-ink">
                          {l.known.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-2">
                          {t('stats.knownWordsSmall', 'Known')}
                        </span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-parch3 rounded-full overflow-hidden flex shadow-inner">
                      <div className="bg-blue h-full" style={{ width: `${l.percentKnown}%` }} />
                      <div
                        className="bg-amber h-full opacity-60"
                        style={{ width: `${l.percentLearning}%` }}
                      />
                    </div>
                    <div className="flex gap-6 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue rounded-full" />
                        <span className="text-[10px] font-bold text-ink3 uppercase tracking-tighter">
                          {l.known} {t('library.known', 'Known')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-amber rounded-full" />
                        <span className="text-[10px] font-bold text-ink3 uppercase tracking-tighter">
                          {l.learning} {t('vocab.learning', 'Learning')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-parch3 rounded-full" />
                        <span className="text-[10px] font-bold text-ink3 uppercase tracking-tighter">
                          {l.new} {t('vocab.new', 'New')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center border-dashed border-2 border-bdr/40 bg-parch2/30">
              <BookOpen className="w-8 h-8 text-muted mx-auto mb-3 opacity-40" />
              <p className="text-[14px] text-muted italic">
                {t(
                  'stats.proficiencyEmpty',
                  'Language proficiency will appear after you read and mark words.'
                )}
              </p>
              <button
                onClick={() => navigate('/app/library')}
                className="mt-4 text-blue text-[13px] font-bold hover:underline"
              >
                {t('stats.startReading', 'Start reading →')}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
