import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronRight, Brain, Library, Sparkles, BookMarked } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { CorpusDB } from "../data/corpus";
import { getLangForLemma } from "../lib/data/dictionary";
import { useKnowledge } from "../lib/hooks/useKnowledge";
import { useLanguageStats } from "../lib/hooks/useLanguageStats";
import { useAuth } from "../lib/hooks/useAuth";
import { useSettings } from "../lib/hooks/useSettings";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";
import { EmptyState } from "../components/ui";
import {
  WordState,
  normalizeWordState,
  safeStateColors,
  safeStateLabel,
} from "../lib/constants/wordStates";
import { ProgressRing } from "../components/reader/ProgressRing";
import { DashboardSkeleton } from "../components/Skeleton";

import { getLanguageDisplayName } from "../lib/constants/languages";
import { useActiveLanguage } from "../lib/hooks/useActiveLanguage";

const RTL_LANGS = new Set(["hbo", "Biblical Hebrew", "arc", "Aramaic", "syr", "Syriac", "Hebrew", "egy"]);

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="card px-6 py-5 flex flex-col justify-between hover:shadow-md transition-all h-full">
    <div className="text-[36px] font-serif font-bold mb-1 tracking-tight text-blue">
      {value}
    </div>
    <div className="eyebrow truncate text-muted font-bold">{label}</div>
  </div>
);

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings } = useSettings();
  const { activeLanguageId } = useActiveLanguage();
  const { knowledge, stats, getAllProgress, userImports, isLoading } = useKnowledge(activeLanguageId);
  const langStats = useLanguageStats(knowledge);
  const { t } = useTranslation();
  const [readingProgress, setReadingProgress] = useState<any[]>([]);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const hour = new Date().getHours();

  useEffect(() => {
    getAllProgress().then(p => {
      setReadingProgress(p);
      setProgressLoaded(true);
    });
  }, [getAllProgress]);

  const { knownCount, learningCount, reviewCount, recentVocab } = useMemo(() => {
    const now = new Date();
    let known = 0;
    let learning = 0;
    let review = 0;
    const activeEntries: [string, any][] = [];

    for (const [lemma, info] of Object.entries(knowledge)) {
      if (info == null) continue;
      const i = typeof info === "object" ? (info as any) : { state: info };
      const state: WordState = normalizeWordState(i.state);
      if (!state) continue;
      const wordLang = i.languageId || 'unknown';
      if (wordLang !== activeLanguageId && activeLanguageId !== 'all') continue;

      if (state === WordState.KNOWN) {
        known++;
      } else if (state === WordState.LEARNING || state === WordState.FAMILIAR) {
        learning++;
        const isDue = !i.srs?.nextReview || new Date(i.srs.nextReview) <= now;
        if (isDue) review++;
        activeEntries.push([lemma, info]);
      } else if (state !== WordState.NEW && state !== WordState.IGNORED) {
        activeEntries.push([lemma, info]);
      }
    }

    const recent = activeEntries
      .sort((a, b) => {
        const aDate = typeof a[1] === "object" ? new Date((a[1] as any).addedAt || 0).getTime() : 0;
        const bDate = typeof b[1] === "object" ? new Date((b[1] as any).addedAt || 0).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, 6)
      .map(([lemma, info]) => ({
        lemma,
        state: normalizeWordState(typeof info === "object" ? (info as any).state : info),
        lang: getLangForLemma(lemma),
      }));

    return { knownCount: known, learningCount: learning, reviewCount: review, recentVocab: recent };
  }, [knowledge, activeLanguageId]);

  // Derive first name for personalized greeting
  const firstName = useMemo(() => {
    const displayName = user?.displayName;
    if (displayName) return displayName.split(" ")[0];
    const email = user?.email;
    if (email) return email.split("@")[0];
    return null;
  }, [user]);

  let greeting = t("dashboard.evening", "Good evening");
  if (hour < 12) greeting = t("dashboard.morning", "Good morning");
  else if (hour < 18) greeting = t("dashboard.afternoon", "Good afternoon");
  const greetingLine = firstName ? `${greeting}, ${firstName}.` : `${greeting}, Scholar.`;

  // Subtitle adapts to new vs returning users
  const hasAnyActivity = knownCount > 0 || stats.readToday > 0 || readingProgress.length > 0;
  const subtitleKey = hasAnyActivity ? "dashboard.subtitle" : "dashboard.subtitleNew";
  const subtitleDefault = hasAnyActivity
    ? "Your journey through the ancient world continues."
    : "Begin your journey through the ancient world.";

  // Continue reading — only populated from real progress
  const continueText = useMemo(() => {
    const builtInTexts = CorpusDB.getTexts();
    const allTexts = [...builtInTexts, ...userImports];
    if (readingProgress.length > 0) {
      const last = readingProgress[0];
      const text = allTexts.find(t => t.id === last.textId);
      if (text) return { ...text, lastPosition: last.lastPosition || 0 };
    }
    return null;
  }, [readingProgress, userImports]);

  const dailyGoal = settings.dailyGoalWords > 0 ? settings.dailyGoalWords : 500;
  const dailyProgress = Math.min(1, stats.readToday / dailyGoal);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto font-sans min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[32px] font-serif font-light tracking-tight text-ink"
          >
            {greetingLine}
          </motion.h2>
          <p className="font-body text-[16px] text-muted italic mt-1">
            {t(subtitleKey, subtitleDefault)}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Streak — only show when streak > 0 */}
          {stats.streak > 0 && (
            <div className="card bg-amberxl/30 border-amber/20 p-4 flex items-center gap-4 shadow-sm">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="text-2xl font-serif font-bold text-amber leading-none">
                  {stats.streak}
                </div>
                <div className="eyebrow text-amber/60 text-[8px] mt-1">
                  {t("dashboard.dayStreak", "Day Streak")}
                </div>
              </div>
            </div>
          )}

          {/* Daily Goal — uses real goal from settings */}
          <div className="card p-4 flex items-center gap-4 border-bdr shadow-sm">
            <ProgressRing progress={dailyProgress} size={40} />
            <div>
              <div className="text-[14px] font-bold text-ink leading-none">
                {stats.readToday.toLocaleString()} / {dailyGoal.toLocaleString()}
              </div>
              <div className="eyebrow text-[8px] mt-1">{t("dashboard.wordsReadToday", "Words read today")}</div>
            </div>
          </div>

          {/* Last Accuracy — only when data exists */}
          {stats.lastAccuracy !== undefined && stats.lastAccuracy > 0 && (
            <div className="card p-4 flex items-center gap-4 border-bdr shadow-sm">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px]",
                stats.lastAccuracy >= 90 ? "bg-green-100 text-green-600"
                  : stats.lastAccuracy >= 70 ? "bg-amber-100 text-amber-600"
                  : "bg-red-100 text-red-600"
              )}>
                {stats.lastAccuracy}%
              </div>
              <div>
                <div className="text-[14px] font-bold text-ink leading-none">
                  {t("dashboard.lastAccuracy", "Last Accuracy")}
                </div>
                <div className="eyebrow text-[8px] mt-1">{t("dashboard.reviewPerformance", "Review performance")}</div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Review Hero */}
        <div className="lg:col-span-1 rounded-[32px] p-8 bg-ink text-parch2 shadow-2xl flex flex-col justify-between min-h-[340px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-all duration-700">
            <Brain className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gold/20 text-gold",
                reviewCount > 0 ? "animate-pulse" : "opacity-50"
              )}>
                {reviewCount > 0 ? t("dashboard.cardsDue", "Cards Due") : t("dashboard.allClear", "All Clear")}
              </div>
            </div>
            <div className="text-[72px] font-serif font-bold leading-none mb-4 flex items-baseline gap-2">
              {reviewCount}
              <span className="text-[18px] text-parch/40 font-body font-normal">{t("dashboard.items", "items")}</span>
            </div>
            <p className="font-body text-parch/60 text-[16px] leading-relaxed max-w-[200px]">
              {reviewCount > 0
                ? t("dashboard.wordsReady", "Your memory is fading for these words. Refresh now.")
                : learningCount > 0
                  ? t("dashboard.memoryFresh", "Your memory is currently in optimal state.")
                  : t("dashboard.noVocabYet", "Read texts and mark words to build your review queue.")}
            </p>
          </div>
          <button
            onClick={() => navigate("/app/review")}
            disabled={reviewCount === 0}
            className="relative z-10 w-full bg-parch text-ink py-4 rounded-[20px] font-bold font-sans text-[15px] hover:bg-white transition-all active:scale-95 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed shadow-lg"
          >
            <span className="flex items-center justify-center gap-2">
              {reviewCount > 0 ? t("dashboard.startReview", "Enter Review Sanctum") : t("dashboard.allCaughtUp", "No Reviews Today")}
              {reviewCount > 0 && <ChevronRight className="w-4 h-4" />}
            </span>
          </button>
        </div>

        {/* Continue Reading — real data or new-user CTA */}
        {progressLoaded && continueText ? (
          <div
            className="lg:col-span-2 card p-8 group cursor-pointer flex flex-col justify-between min-h-[300px] hover:border-blue/30 transition-all border-2 border-transparent"
            onClick={() => navigate(`/app/reader/${continueText.id}`)}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span className="eyebrow text-gold font-bold">
                  {t("dashboard.resumeReading", "Resume Reading")}
                </span>
                {continueText.level && (
                  <span className={cn(
                    "pill",
                    continueText.level === "A1" || continueText.level === "A2" ? "cefr-a"
                      : continueText.level === "B1" || continueText.level === "B2" ? "cefr-b"
                      : "cefr-c"
                  )}>
                    {continueText.level}
                  </span>
                )}
              </div>
              <h3 className="text-[36px] font-serif font-semibold text-ink leading-tight mb-2 group-hover:text-blue transition-colors">
                {continueText.title}
              </h3>
              <div className="flex items-center gap-3">
                {continueText.author && (
                  <span className="text-[14px] font-body text-ink3">{continueText.author}</span>
                )}
                {continueText.author && continueText.language && (
                  <span className="w-1 h-1 rounded-full bg-bdr" />
                )}
                {continueText.language && (
                  <span className="text-[14px] font-mono text-muted uppercase tracking-widest">
                    {getLanguageDisplayName(continueText.language as string)}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-8">
              <div className="flex justify-between items-end mb-3">
                <span className="text-[13px] font-bold text-blue group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                  {t("dashboard.continueReading", "Continue Reading")} <ChevronRight className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-bold text-muted uppercase tracking-tighter">
                  {Math.round(continueText.lastPosition)}% {t("dashboard.complete", "complete")}
                </span>
              </div>
              <div className="h-2 w-full bg-parch3 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${continueText.lastPosition}%` }}
                  className="h-full bg-gold"
                />
              </div>
            </div>
          </div>
        ) : (
          /* New user — no reading history yet; import is the primary action */
          <div className="lg:col-span-2 card p-8 flex flex-col justify-between min-h-[300px] border-2 border-dashed border-blue/20 bg-blue/[0.02]">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-blue" />
                <span className="eyebrow text-blue font-bold">
                  {t("dashboard.startJourney", "Start Your Journey")}
                </span>
              </div>
              <h3 className="text-[28px] font-serif font-semibold text-ink leading-tight mb-3">
                {t("dashboard.importFirstText", "Import your first text.")}
              </h3>
              <p className="font-body text-[15px] text-ink3 leading-relaxed max-w-sm">
                {t("dashboard.importFirstDesc", "Paste any ancient text and Paleoglossa will analyze it, map it to your vocabulary, and make it readable. Your progress follows your texts.")}
              </p>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate("/app/import")}
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
              >
                <Sparkles className="w-4 h-4" />
                {t("dashboard.importText", "Import a Text")}
              </button>
              <button
                onClick={() => navigate("/app/library")}
                className="btn-secondary flex items-center justify-center gap-2 px-6 py-3"
              >
                <Library className="w-4 h-4" />
                {t("dashboard.browseLibrary", "Browse Curated Library")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overall Progress — only show when user has activity */}
      {hasAnyActivity && (
        <>
          <h3 className="eyebrow mb-6 font-bold text-ink3">{t("dashboard.overallProgress", "Overall Progress")}</h3>
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14 cursor-pointer"
            onClick={() => navigate("/app/statistics")}
          >
            <StatCard label={t("vocab.known", "Words Known")} value={knownCount.toLocaleString()} />
            <StatCard label={t("vocab.learning", "Words Learning")} value={learningCount.toLocaleString()} />
            <StatCard label={t("dashboard.totalReadingTime", "Reading Time (m)")} value={stats.readingTime.toLocaleString()} />
            <StatCard label={t("dashboard.streakStatus", "Current Streak")} value={stats.streak > 0 ? `${stats.streak}d` : "—"} />
          </div>
        </>
      )}

      {/* Language Mastery — show when user has words in ≥ 1 language */}
      {hasAnyActivity && (() => {
        const activeLangs = Object.entries(langStats).filter(
          ([langId, s]) => langId !== 'unknown' && s.total >= 5
        );
        if (activeLangs.length === 0) return null;
        return (
          <div className="mb-14">
            <h3 className="eyebrow mb-6 font-bold text-ink3">
              {t("dashboard.languageMastery", "Language Mastery")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeLangs.map(([langId, s]) => (
                <div key={langId} className="card p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink text-[15px]">
                      {getLanguageDisplayName(langId)}
                    </span>
                    <span className="text-[12px] font-bold text-muted">
                      {s.known.toLocaleString()} / {s.total.toLocaleString()} {t("vocab.known", "known")}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-parch3 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.masteryPercent}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        s.masteryPercent >= 70 ? "bg-green-500"
                          : s.masteryPercent >= 40 ? "bg-amber"
                          : "bg-blue",
                      )}
                    />
                  </div>
                  <div className="flex gap-4 text-[11px] text-muted font-bold uppercase tracking-wider">
                    <span className="text-amber">{s.learning} {t("vocab.learning", "learning")}</span>
                    <span className="text-blue">{s.seen} {t("vocab.seen", "seen")}</span>
                    <span className="ml-auto">{s.masteryPercent}% {t("dashboard.mastered", "mastered")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Vocabulary Growth — last 30 days from stats history */}
      {hasAnyActivity && stats.history && stats.history.length > 1 && (() => {
        const chartData = [...stats.history]
          .slice(-30)
          .map(h => ({
            date: h.date.slice(5), // MM-DD
            known: h.knownWords ?? 0,
          }));
        return (
          <div className="mb-14">
            <h3 className="eyebrow mb-6 font-bold text-ink3">
              {t("dashboard.vocabGrowth", "Vocabulary Growth")}
            </h3>
            <div className="card p-6">
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="knownGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "var(--color-ink3, #6b7280)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--color-ink3, #6b7280)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 11,
                      borderRadius: 8,
                      border: "1px solid var(--color-bdr, #e5e7eb)",
                      background: "var(--color-parch, #faf9f6)",
                    }}
                    labelStyle={{ fontWeight: 700 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="known"
                    name={t("vocab.known", "Known")}
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fill="url(#knownGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })()}

      {/* New-user onboarding grid — show when no activity at all */}
      {!hasAnyActivity && progressLoaded && (
        <div className="mb-14">
          <h3 className="eyebrow mb-6 font-bold text-ink3">{t("dashboard.getStarted", "Get Started")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/app/import")}
              className="card p-6 text-left hover:border-blue/30 hover:shadow-md transition-all group border-blue/20 bg-blue/[0.02]"
            >
              <Sparkles className="w-8 h-8 text-blue mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-serif text-[18px] text-ink mb-1">{t("dashboard.importOwn", "Import Your Own Text")}</h4>
              <p className="text-[13px] text-ink3">{t("dashboard.importOwnDesc", "Paste or upload a text. AI will parse morphology and glosses automatically.")}</p>
            </button>
            <button
              onClick={() => navigate("/app/library")}
              className="card p-6 text-left hover:border-blue/30 hover:shadow-md transition-all group"
            >
              <Library className="w-8 h-8 text-ink3 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-serif text-[18px] text-ink mb-1">{t("dashboard.exploreLibrary", "Explore the Library")}</h4>
              <p className="text-[13px] text-ink3">{t("dashboard.exploreLibraryDesc", "Browse curated ancient texts in Greek, Hebrew, Latin, and more.")}</p>
            </button>
            <button
              onClick={() => navigate("/app/vocabulary")}
              className="card p-6 text-left hover:border-blue/30 hover:shadow-md transition-all group"
            >
              <Brain className="w-8 h-8 text-emerald-600 mb-4 group-hover:scale-110 transition-transform" />
              <h4 className="font-serif text-[18px] text-ink mb-1">{t("dashboard.buildLexicon", "Build Your Lexicon")}</h4>
              <p className="text-[13px] text-ink3">{t("dashboard.buildLexiconDesc", "Track words you encounter. Your vocabulary grows as you read.")}</p>
            </button>
          </div>
        </div>
      )}

      {/* Vocabulary Spotlight */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-serif text-ink font-semibold">
            {t("dashboard.recentWords", "Vocabulary Spotlight")}
          </h3>
          {recentVocab.length > 0 && (
            <button
              onClick={() => navigate("/app/vocabulary")}
              className="text-[12px] font-bold text-blue hover:underline"
            >
              {t("dashboard.viewVocab", "View All Vocabulary")}
            </button>
          )}
        </div>
        {recentVocab.length === 0 ? (
          <EmptyState
            compact
            icon={<BookMarked className="w-8 h-8" />}
            heading={t("dashboard.noVocab", "No vocabulary saved yet.")}
            description={t("dashboard.noVocabHint", "Read texts and mark words to build your lexicon.")}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {recentVocab.map((w, i) => (
              <div
                key={i}
                className="card p-4 border-bdr/40 hover:scale-[1.02] transition-transform shadow-sm"
              >
                <div
                  className={cn(
                    "text-[18px] font-serif text-ink mb-1 truncate",
                    RTL_LANGS.has(w.lang) ? "font-hebrew" : ""
                  )}
                  dir={RTL_LANGS.has(w.lang) ? "rtl" : "ltr"}
                >
                  {w.lemma}
                </div>
                <div
                  className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block"
                  style={{
                    backgroundColor: safeStateColors(w.state).bg,
                    color: safeStateColors(w.state).text,
                  }}
                >
                  {t(`vocab.${safeStateLabel(w.state).toLowerCase()}`, safeStateLabel(w.state))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
