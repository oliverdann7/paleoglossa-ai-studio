import { useMemo } from "react";
import {
  TrendingUp,
  Clock,
  BookOpen,
  Zap,
  History,
  BarChart2,
  CheckCircle2 as CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useKnowledge } from "../lib/hooks/useKnowledge";
import { WordState } from "../lib/constants/wordStates";
import { useTranslation } from "react-i18next";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { format, subDays, parseISO } from "date-fns";

const StatCard = ({ label, value, trend, icon: Icon, color }: any) => (
  <div className="card p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      <div
        className={cn(
          "p-3 rounded-2xl bg-opacity-10",
          color === "blue"
            ? "bg-blue text-blue"
            : color === "amber"
              ? "bg-amber text-amber"
              : "bg-green-600 text-green-600",
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-[11px] font-bold text-green-600">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
    <div>
      <div className="text-[32px] font-serif font-bold text-ink leading-none mb-1">
        {value}
      </div>
      <div className="eyebrow text-muted text-[9px] font-bold tracking-widest">
        {label}
      </div>
    </div>
  </div>
);

import { getLangForLemma } from "../lib/data/dictionary";

export const Statistics = () => {
  const { stats, knowledge } = useKnowledge();
  const { t } = useTranslation();

  const trendData = useMemo(() => {
    let data = [...(stats.history || [])];

    // Ensure we have at least 30 days of data, pad with zeros if missing
    if (data.length < 30) {
      const needed = 30 - data.length;
      const firstDate = data.length > 0 ? parseISO(data[0].date) : new Date();
      const pads = [];
      for (let i = needed; i > 0; i--) {
        pads.push({
          date: format(subDays(firstDate, i), "yyyy-MM-dd"),
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

  // 13-week heatmap simulator using real history + padding
  const heatmap = useMemo(() => {
    const data = new Array(13 * 7).fill(0);
    const history = stats.history || [];

    // We map days from today backwards up to 91 days
    const today = new Date();

    history.forEach((item) => {
      const date = parseISO(item.date);
      const diff = Math.floor(
        (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diff >= 0 && diff < 91) {
        // index 0 is oldest (90 days ago), index 90 is today
        const index = 90 - diff;
        // Calculate intensity (0 to 4) based on readWords
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

  const languageStats = useMemo(() => {
    const raw: any = {
      grc: { label: "Ancient Greek", known: 0, learning: 0, new: 0 },
      "grc-koine": { label: "Koine Greek", known: 0, learning: 0, new: 0 },
      hbo: { label: "Biblical Hebrew", known: 0, learning: 0, new: 0 },
      lat: { label: "Classical Latin", known: 0, learning: 0, new: 0 },
      syr: { label: "Syriac", known: 0, learning: 0, new: 0 },
      cop: { label: "Coptic", known: 0, learning: 0, new: 0 },
      arc: { label: "Aramaic", known: 0, learning: 0, new: 0 },
      akk: { label: "Akkadian", known: 0, learning: 0, new: 0 },
      san: { label: "Sanskrit", known: 0, learning: 0, new: 0 },
      egy: { label: "Egyptian Hieroglyphs", known: 0, learning: 0, new: 0 },
    };

    Object.entries(knowledge).forEach(([lemma, info]) => {
      const i = typeof info === "object" ? info : { state: info };
      
      const dictLang = getLangForLemma(lemma);
      let lang = dictLang !== "Unknown" ? dictLang : "grc-koine";
      
      // Fallbacks in case dictionary doesn't have it
      if (dictLang === "Unknown") {
        if (/[\u0590-\u05FF\u0700-\u074F\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFB4F]/u.test(lemma)) lang = "hbo";
        else if (/[a-zA-Z]/.test(lemma)) lang = "lat";
        else if (/[\u{13000}-\u{1342E}]/u.test(lemma)) lang = "egy";
      }

      // Map 'Biblical Hebrew' to 'hbo' to match the keys of `raw`
      if (lang === "Biblical Hebrew") lang = "hbo";

      if ((i as any).language) lang = (i as any).language;

      if (raw[lang]) {
        if (i.state === WordState.KNOWN) raw[lang].known++;
        else if (i.state === WordState.NEW) raw[lang].new++;
        else raw[lang].learning++;
      }
    });

    return Object.values(raw)
      .map((l: any) => {
        const total = l.known + l.learning + l.new;
        const cefr =
          l.known < 1000
            ? "A1"
            : l.known < 3000
              ? "A2"
              : l.known < 6000
                ? "B1"
                : "B2";
        return {
          ...l,
          total,
          cefr,
          percentKnown: total ? (l.known / total) * 100 : 0,
          percentLearning: total ? (l.learning / total) * 100 : 0,
        };
      })
      .filter((l: any) => l.total > 0);
  }, [knowledge]);

  const weeklyStats = useMemo(() => {
    let weekRead = stats.readToday;

    // Add history from the last 6 days
    if (stats.history && stats.history.length > 0) {
      const recentHistory = stats.history.slice(-6);
      recentHistory.forEach((day) => {
        weekRead += day.readWords || 0;
      });
    }

    let totalMinutes = stats.readingTime;
    if (stats.history) {
      stats.history.forEach((day) => {
        totalMinutes += day.minutes || 0;
      });
    }

    return {
      weekRead,
      totalHours: (totalMinutes / 60).toFixed(1),
    };
  }, [stats]);

  const milestones = [
    {
      label: t("stats.polyglotApprentice", "Polyglot Apprentice"),
      desc: t("stats.polyglotDesc", "Reach 500 known words in 2 languages"),
      date: t("stats.reachedDate", "Reached Apr 12"),
      completed: true,
    },
    {
      label: t("stats.homericMemory", "Homeric Memory"),
      desc: t("stats.homericDesc", "Complete 10 error-free review sessions"),
      date: t("stats.reachedMay", "Reached May 3"),
      completed: true,
    },
    {
      label: t("stats.masterOfTense", "Master of the Tense"),
      desc: t("stats.masterDesc", "Known 2,000 words across the library"),
      desc2: t("stats.wordsToGo", "153 words to go"),
      date: null,
      completed: false,
      progress: 1847 / 2000,
    },
  ];

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto font-sans min-h-screen">
      <header className="mb-10">
        <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">
          {t('stats.title', "Progress Analytics")}
        </h2>
        <p className="font-body text-[15px] italic text-ink2">
          {t('stats.description', "Knowledge is a marathon. Every page read is a stone in your intellectual fortress.")}
        </p>
      </header>

      {stats.history.length === 0 &&
      stats.totalKnown === 0 &&
      stats.readToday === 0 ? (
        <div className="card p-12 text-center border-dashed border-2 border-bdr/40 bg-parch2/50 flex flex-col items-center mt-8">
          <BarChart2 className="w-12 h-12 text-muted mb-4" />
          <h3 className="font-serif text-[24px] text-ink mb-2">{t('stats.noData', "No Data Yet")}</h3>
          <p className="text-ink3 max-w-sm mx-auto">
            {t('stats.noDataDesc', "Read your first 100 words to see your progress here. Head over to the Library to begin!")}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <StatCard
              label={t('stats.knownWords', "Known Words")}
              value={stats.totalKnown.toLocaleString()}
              trend={t("stats.trendKnown", "+12% vs last week")}
              icon={BookOpen}
              color="blue"
            />
            <StatCard
              label={t('stats.wordsReadWeek', "Words Read (Week)")}
              value={weeklyStats.weekRead.toLocaleString()}
              trend={t("stats.trendActive", "Active")}
              icon={History}
              color="amber"
            />
            <StatCard
              label={t('stats.totalReadingTime', "Total Reading Time")}
              value={`${weeklyStats.totalHours}h`}
              trend={t("stats.trendKeepUp", "Keep it up!")}
              icon={Clock}
              color="green"
            />
            <StatCard
              label={t('stats.currentStreak', "Current Streak")}
              value={t("stats.streakDays", `🔥 ${stats.streak} Days`, { streak: stats.streak })}
              icon={Zap}
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Heatmap */}
            <div className="lg:col-span-2 card p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[18px] font-serif font-bold text-ink">
                  {t('stats.readingActivity', "Reading Activity (13 Weeks)")}
                </h3>
                <div className="flex gap-1 text-[9px] font-bold text-muted uppercase tracking-widest items-center">
                  <span>{t("stats.less", "Less")}</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-parch rounded-sm" />
                    <div className="w-3 h-3 bg-amber/30 rounded-sm" />
                    <div className="w-3 h-3 bg-amber/60 rounded-sm" />
                    <div className="w-3 h-3 bg-amber rounded-sm" />
                    <div className="w-3 h-3 bg-gold rounded-sm" />
                  </div>
                  <span>{t("stats.more", "More")}</span>
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
                            "w-full pt-[100%] rounded-sm transition-all duration-300",
                            intensity === 0
                              ? "bg-parch"
                              : intensity === 1
                                ? "bg-amber/30"
                                : intensity === 2
                                  ? "bg-amber/60"
                                  : intensity === 3
                                    ? "bg-amber"
                                    : "bg-gold shadow-sm",
                          )}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-muted uppercase tracking-widest px-1">
                <span>{format(subDays(new Date(), 90), "MMM")}</span>
                <span>{format(subDays(new Date(), 45), "MMM")}</span>
                <span>{format(new Date(), "MMM")}</span>
              </div>
            </div>

            {/* Milestones Sidebar */}
            <div className="card p-8 flex flex-col h-full">
              <h3 className="text-[18px] font-serif font-bold text-ink mb-6">
                {t("stats.milestoneTracker", "Milestone Tracker")}
              </h3>
              <div className="space-y-6 flex-1">
                {milestones.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative flex gap-4",
                      !m.completed && "opacity-60",
                    )}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1",
                        m.completed
                          ? "bg-green-100 text-green-600"
                          : "bg-parch2 text-muted",
                      )}
                    >
                      {m.completed ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <div className="w-2 h-2 bg-muted rounded-full" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-ink mb-1">
                        {m.label}
                      </h4>
                      <p className="text-[12px] text-muted leading-snug mb-1">
                        {m.desc}
                      </p>
                      {m.desc2 && (
                        <p className="text-[11px] text-blue font-bold italic">
                          {m.desc2}
                        </p>
                      )}
                      {m.date && (
                        <span className="text-[10px] text-muted/60 font-medium italic">
                          {m.date}
                        </span>
                      )}
                      {!m.completed && m.progress && (
                        <div className="mt-2 h-1 w-full bg-parch3 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue"
                            style={{ width: `${m.progress * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2 text-[12px] font-bold text-blue hover:bg-blue/5 rounded-lg transition-all border border-blue/20">
                {t("stats.viewAllAchievements", "View All Achievement")}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Known Words via Recharts */}
            <div className="card p-6 flex flex-col">
              <h4 className="eyebrow text-amber mb-4 font-bold">
                {t("stats.knownWords30d", "Known Words (30d)")}
              </h4>
              <div className="h-32 w-full relative group flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient
                        id="colorKnown"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#F1DAB0"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#F1DAB0"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FCFBF8",
                        borderRadius: "8px",
                        border: "1px solid rgba(0,0,0,0.1)",
                        fontSize: "12px",
                      }}
                      labelFormatter={(label) =>
                        format(parseISO(label as string), "MMM d, yyyy")
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="knownWords"
                      stroke="#d4ab6a"
                      fillOpacity={1}
                      fill="url(#colorKnown)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card p-6 flex flex-col">
              <h4 className="eyebrow text-blue mb-4 font-bold">
                {t("stats.dailyReading30d", "Daily Reading (30d)")}
              </h4>
              <div className="h-32 w-full relative flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FCFBF8",
                        borderRadius: "8px",
                        border: "1px solid rgba(0,0,0,0.1)",
                        fontSize: "12px",
                      }}
                      labelFormatter={(label) =>
                        format(parseISO(label as string), "MMM d, yyyy")
                      }
                      cursor={{ fill: "rgba(30, 61, 110, 0.1)" }}
                    />
                    <Bar
                      dataKey="readWords"
                      fill="#1E3D6E"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card p-6 flex flex-col">
              <h4 className="eyebrow text-green-600 mb-4 font-bold">
                {t("stats.readingTime30d", "Reading Time (30d)")}
              </h4>
              <div className="h-32 w-full relative flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FCFBF8",
                        borderRadius: "8px",
                        border: "1px solid rgba(0,0,0,0.1)",
                        fontSize: "12px",
                      }}
                      labelFormatter={(label) =>
                        format(parseISO(label as string), "MMM d, yyyy")
                      }
                      formatter={(val: any) => [`${val} min`, t("stats.time", "Time")]}
                    />
                    <Line
                      type="monotone"
                      dataKey="minutes"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="card p-8">
            <h3 className="text-[20px] font-serif font-bold text-ink mb-8">
              {t("stats.languageProficiency", "Language Proficiency")}
            </h3>
            <div className="space-y-10">
              {languageStats.map((l, i) => (
                <div key={i}>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <h4 className="text-[17px] font-bold text-ink leading-none">
                         {t(`languageNames.${l.label === 'Ancient Greek' ? 'grc' : l.label === 'Koine Greek' ? 'grc-koine' : l.label === 'Biblical Hebrew' ? 'hbo' : l.label === 'Classical Latin' ? 'lat' : l.label === 'Syriac' ? 'syr' : l.label === 'Coptic' ? 'cop' : l.label === 'Aramaic' ? 'arc' : l.label === 'Akkadian' ? 'akk' : l.label === 'Sanskrit' ? 'san' : l.label === 'Egyptian Hieroglyphs' ? 'egy' : l.label}`, l.label)}
                      </h4>
                      <span className="text-[11px] font-serif italic text-muted">
                        {t("stats.estLevel", "Estimated Level:")} {l.cefr}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[18px] font-bold text-ink">
                        {l.known.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-muted uppercase tracking-widest ml-2">
                        {t("stats.knownWordsSmall", "Known Words")}
                      </span>
                    </div>
                  </div>
                  <div className="h-3 w-full bg-parch3 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      className="bg-blue h-full"
                      style={{ width: `${l.percentKnown}%` }}
                    />
                    <div
                      className="bg-amber h-full opacity-60"
                      style={{ width: `${l.percentLearning}%` }}
                    />
                  </div>
                  <div className="flex gap-6 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue rounded-full" />
                      <span className="text-[10px] font-bold text-ink3 uppercase tracking-tighter">
                        {l.known} {t("library.known", "Known")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-amber rounded-full" />
                      <span className="text-[10px] font-bold text-ink3 uppercase tracking-tighter">
                        {l.learning} {t("vocab.learning", "Learning")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-parch3 rounded-full" />
                      <span className="text-[10px] font-bold text-ink3 uppercase tracking-tighter">
                        {l.new} {t("vocab.new", "New")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
