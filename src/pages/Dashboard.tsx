import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { CorpusDB } from "../data/corpus";
import { getLangForLemma } from "../lib/data/dictionary";
import { useKnowledge } from "../lib/hooks/useKnowledge";
import {
  WordState,
  STATE_COLORS,
  STATE_LABELS,
} from "../lib/constants/wordStates";
import { ProgressRing } from "../components/reader/ProgressRing";

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
  const { knowledge, stats } = useKnowledge();
  const hour = new Date().getHours();

  const knownCount = useMemo(
    () =>
      Object.values(knowledge).filter((info) => {
        const state = typeof info === "object" ? (info as any).state : info;
        return state === WordState.KNOWN;
      }).length,
    [knowledge],
  );

  const learningCount = useMemo(
    () =>
      Object.values(knowledge).filter((info) => {
        const state = typeof info === "object" ? (info as any).state : info;
        return state === WordState.LEARNING || state === WordState.FAMILIAR;
      }).length,
    [knowledge],
  );

  const reviewCount = useMemo(() => {
    return Object.values(knowledge).filter((info) => {
      const i = typeof info === "object" ? (info as any) : { state: info };
      if (i.state !== WordState.LEARNING && i.state !== WordState.FAMILIAR)
        return false;
      if (!i.srs?.nextReview) return true; // Newly learned words are due immediately
      return new Date(i.srs.nextReview) <= new Date();
    }).length;
  }, [knowledge]);

  const recentVocab = useMemo(() => {
    const highlighted = Object.entries(knowledge)
      .filter(([, info]) => {
        const state = typeof info === "object" ? (info as any).state : info;
        return state !== WordState.NEW && state !== WordState.IGNORED;
      })
      .sort((a, b) => {
        const aDate = typeof a[1] === "object" ? new Date((a[1] as any).addedAt || 0).getTime() : 0;
        const bDate = typeof b[1] === "object" ? new Date((b[1] as any).addedAt || 0).getTime() : 0;
        return bDate - aDate;
      })
      .slice(0, 6);
    return highlighted.map(([lemma, info]) => {
      const state = typeof info === "object" ? (info as any).state : info;
      const dictLang = getLangForLemma(lemma);
      return {
        lemma,
        state,
        lang: dictLang,
      };
    });
  }, [knowledge]);

  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 18) greeting = "Good afternoon";

  const continueText = CorpusDB.getTexts()[0];

  return (
    <div className="p-6 md:p-12 max-w-6xl mx-auto font-sans min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[32px] font-serif font-light tracking-tight text-ink"
          >
            {greeting}, Scholar.
          </motion.h2>
          <p className="font-body text-[16px] text-muted italic mt-1">
            Your journey through the ancient world continues.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Streak Card */}
          <div className="card bg-amberxl/30 border-amber/20 p-4 flex items-center gap-4 shadow-sm">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="text-2xl font-serif font-bold text-amber leading-none">
                12
              </div>
              <div className="eyebrow text-amber/60 text-[8px] mt-1">
                Day Streak
              </div>
            </div>
          </div>

          {/* Daily Goal card */}
          <div className="card p-4 flex items-center gap-4 border-bdr shadow-sm">
            <ProgressRing
              progress={Math.min(1, stats.readToday / 500)}
              size={40}
            />
            <div>
              <div className="text-[14px] font-bold text-ink leading-none">
                {stats.readToday} / 500
              </div>
              <div className="eyebrow text-[8px] mt-1">Words read today</div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Review Hero */}
        <div className="lg:col-span-1 rounded-[24px] p-8 bg-blue text-white shadow-xl flex flex-col justify-between min-h-[300px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <span className="text-[120px] font-serif font-bold leading-none">
              A
            </span>
          </div>
          <div className="relative z-10">
            <div className="eyebrow text-bluexl/50 mb-4 font-bold">
              Review Queue
            </div>
            <div className="text-[64px] font-serif font-bold leading-none mb-4">
              {reviewCount}
            </div>
            <p className="font-body text-bluexl/70 text-[16px]">
              Words ready for reinforcement.
            </p>
          </div>
          <button
            onClick={() => navigate("/app/review")}
            disabled={reviewCount === 0}
            className="relative z-10 w-full bg-white text-blue py-3 rounded-2xl font-bold font-sans text-[14px] hover:shadow-lg transition-all active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {reviewCount > 0 ? "Start Review Session" : "All Caught Up"}
          </button>
        </div>

        {/* Continue Reading Hero */}
        <div
          className="lg:col-span-2 card p-8 group cursor-pointer flex flex-col justify-between min-h-[300px] hover:border-blue/30 transition-all border-2 border-transparent"
          onClick={() => navigate(`/app/reader/${continueText.id}`)}
        >
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="eyebrow text-gold font-bold">
                Resume Reading
              </span>
              <span className="pill cefr-a">A1</span>
            </div>
            <h3 className="text-[36px] font-serif font-semibold text-ink leading-tight mb-2 group-hover:text-blue transition-colors">
              {continueText.title}
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[14px] font-body text-ink3">
                {continueText.author}
              </span>
              <span className="w-1 h-1 rounded-full bg-bdr" />
              <span className="text-[14px] font-mono text-muted uppercase tracking-widest">
                {{
                  grc: "Ancient Greek",
                  "grc-koine": "Koine Greek",
                  hbo: "Biblical Hebrew",
                  lat: "Classical Latin",
                  syr: "Syriac",
                  cop: "Coptic",
                  arc: "Aramaic",
                  akk: "Akkadian",
                  san: "Sanskrit",
                  egy: "Egyptian Hieroglyphs",
                }[continueText.language as string] || continueText.language}
              </span>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex justify-between items-end mb-3">
              <span className="text-[13px] font-bold text-blue group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                Continue from John 1:1 <ChevronRight className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-bold text-muted uppercase tracking-tighter">
                ~4 mins left in section
              </span>
            </div>
            <div className="h-2 w-full bg-parch3 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "42%" }}
                className="h-full bg-gold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Global Progress Grid */}
      <h3 className="eyebrow mb-6 font-bold text-ink3">Overall Progress</h3>
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14 cursor-pointer"
        onClick={() => navigate("/app/statistics")}
      >
        <StatCard label="Words Known" value={knownCount.toLocaleString()} />
        <StatCard
          label="Words Learning"
          value={learningCount.toLocaleString()}
        />
        <StatCard
          label="Total Words Read"
          value={(stats.readToday + 12400).toLocaleString()}
        />
        <StatCard label="Accuracy" value="94%" />
      </div>

      {/* Recent Vocab */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-serif text-ink font-semibold">
            Vocabulary Spotlight
          </h3>
          <button
            onClick={() => navigate("/app/vocabulary")}
            className="text-[12px] font-bold text-blue hover:underline"
          >
            View All Vocabulary
          </button>
        </div>
        {recentVocab.length === 0 ? (
          <div className="card p-8 border-dashed border-2 border-bdr bg-parch2/50 text-center">
            <p className="font-body text-[14px] italic text-ink3">
              No vocabulary saved yet. Read texts and mark words to build your
              lexicon.
            </p>
          </div>
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
                    ['hbo', 'Biblical Hebrew', 'arc', 'Aramaic', 'syr', 'Syriac', 'Hebrew'].includes(w.lang) ? "font-hebrew" : ""
                  )}
                  dir={['hbo', 'Biblical Hebrew', 'arc', 'Aramaic', 'syr', 'Syriac', 'egy', 'Hebrew'].includes(w.lang) ? "rtl" : "ltr"}
                >
                  {w.lemma}
                </div>
                <div
                  className="text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block"
                  style={{
                    backgroundColor: STATE_COLORS[w.state as WordState].bg,
                    color: STATE_COLORS[w.state as WordState].text,
                  }}
                >
                  {STATE_LABELS[w.state as WordState]}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
