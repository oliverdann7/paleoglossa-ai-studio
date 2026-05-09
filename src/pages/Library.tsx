import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Search, Library as LibraryIcon, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { CorpusDB } from "../data/corpus";
import { useKnowledge } from "../lib/hooks/useKnowledge";
import { WordState } from "../lib/constants/wordStates";
import { useTranslation } from "react-i18next";

export const Library = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [minKnown, setMinKnown] = useState(0);
  const { getWordInfo } = useKnowledge();
  const { t } = useTranslation();

  const mainFilters = [
    "All",
    "Ancient Greek",
    "Koine Greek",
    "Biblical Hebrew",
    "Classical Latin",
    "Syriac",
    "Coptic",
    "Aramaic",
    "Akkadian",
    "Sanskrit",
    "Egyptian Hieroglyphs",
  ];

  const allTexts = useMemo(() => {
    const builtIn = CorpusDB.getTexts();
    const importedRaw = localStorage.getItem("paleoglossa_imports");
    const imported = importedRaw ? JSON.parse(importedRaw) : [];

    const unified = [
      ...builtIn,
      ...imported.map((t: any) => ({
        ...t,
        isImported: true,
        author: "Your Import",
        language: t.language || "grc",
      })),
    ];

    return unified.map((t: any) => {
      // Calculate real stats for each text
      let totalWords: number;
      let knownWordsCount = 0;
      let learningWordsCount = 0;

      if (t.isImported) {
        totalWords = t.stats?.totalWords || 0;
        // In real app, we'd tokenize and check. For demo, we just keep the initial import stats
        // OR better: check against existing knowledge for real-time updates
        const words = t.content.split(/\s+/).filter(Boolean);
        words.forEach((w: string) => {
          const info = getWordInfo(w.toLowerCase());
          if (info.state === WordState.KNOWN) knownWordsCount++;
          else if (info.state !== WordState.NEW) learningWordsCount++;
        });
      } else {
        const sections =
          t.sectionsPreview
            ?.map((p: any) => CorpusDB.getSection(p.id))
            .filter(Boolean) || [];
        const allTokens = sections.flatMap(
          (s: any) => s?.sentences.flatMap((sent: any) => sent.tokens) || [],
        );
        totalWords = allTokens.length;
        allTokens.forEach((tok: any) => {
          const info = getWordInfo(tok.lemma);
          if (info.state === WordState.KNOWN) knownWordsCount++;
          else if (info.state !== WordState.NEW) learningWordsCount++;
        });
      }

      if (totalWords === 0)
        return {
          ...t,
          percentKnown: 0,
          percentLearning: 0,
          totalWords: 0,
          level: "A1",
        };

      const level = t.level || (t.id === "Jn-1" ? "A1" : t.id === "Gen" ? "A2" : "B1"); // Demo levels

      return {
        ...t,
        percentKnown: Math.round((knownWordsCount / totalWords) * 100),
        percentLearning: Math.round((learningWordsCount / totalWords) * 100),
        totalWords,
        level,
      };
    });
  }, [getWordInfo]);

  const filteredTexts = allTexts.filter((t: any) => {
    let matchesFilter = true;
    if (activeFilter !== "All") {
      const langMap: Record<string, string> = {
        "Ancient Greek": "grc",
        "Koine Greek": "grc-koine",
        "Biblical Hebrew": "hbo",
        "Classical Latin": "lat",
        Syriac: "syr",
        Coptic: "cop",
        Aramaic: "arc",
        Akkadian: "akk",
        Sanskrit: "san",
        "Egyptian Hieroglyphs": "egy",
      };
      matchesFilter = t.language === langMap[activeFilter];
    }

    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.author?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesKnown = t.percentKnown >= minKnown;

    return matchesFilter && matchesSearch && matchesKnown;
  });

  const recentTexts = useMemo(() => {
    return allTexts.slice(0, 3); // Demo: first 3 are recent
  }, [allTexts]);

  const getCefrClass = (level: string) => {
    if (level.startsWith("A")) return "cefr-a";
    if (level.startsWith("B")) return "cefr-b";
    return "cefr-c";
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto font-sans min-h-screen">
      <header className="mb-10">
        <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">
          {t("library.title", "Library")}
        </h2>
        <p className="font-body text-[15px] italic text-ink2">
          Ancient wisdom, now familiar. Every word tracked, every text a
          milestone.
        </p>
      </header>

      {/* Continue Reading Carousel */}
      <div className="mb-14">
        <h3 className="eyebrow mb-4 opacity-50">Continue Reading</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {recentTexts.map((text, i) => (
            <div
              key={i}
              className="min-w-[340px] card bg-parch2/30 border-bdr/40 p-6 flex items-center justify-between group cursor-pointer hover:border-blue/30 transition-all"
              onClick={() => navigate(`/app/reader/${text.id}`)}
            >
              <div className="max-w-[200px]">
                <h4 className="text-[17px] font-serif font-bold text-ink truncate mb-1">
                  {text.title}
                </h4>
                <div className="text-[10px] uppercase font-bold text-muted tracking-widest">
                  {text.author}
                </div>
                <div className="mt-4 h-1 w-full bg-parch3 rounded-full overflow-hidden">
                  <div className="h-full bg-gold" style={{ width: "42%" }} />
                </div>
              </div>
              <button className="w-10 h-10 bg-white border border-bdr rounded-full flex items-center justify-center text-blue shadow-sm group-hover:bg-blue group-hover:text-white transition-all">
                <Play className="w-4 h-4 ml-0.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-10 items-start lg:items-end">
        <div className="flex-1 space-y-5 w-full">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-bdr rounded-[12px] text-sm font-sans focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {mainFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-[11.5px] font-medium font-sans transition-all duration-150 border",
                  activeFilter === filter
                    ? "bg-blue text-white shadow-sm border-blue"
                    : "bg-parch text-ink3 border-bdr hover:bg-parch2",
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-64 card p-4 bg-parch2/20 border-bdr/30">
          <div className="flex justify-between items-center mb-4">
            <label className="text-[11px] font-bold text-muted uppercase">
              Comprehensibility
            </label>
            <span className="text-[11px] font-bold text-blue">
              {minKnown}%+ Known
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={minKnown}
            onChange={(e) => setMinKnown(parseInt(e.target.value, 10))}
            className="w-full accent-blue appearance-none h-1.5 bg-parch3 rounded-full"
          />
          <div className="flex justify-between mt-2 text-[9px] font-bold text-zinc-400">
            <span>Any</span>
            <span>Nearly All</span>
          </div>
        </div>
      </div>

      <div className="mb-14">
        <h3 className="eyebrow mb-4 opacity-50">Explore by Language</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {[
            { id: "grc-koine", name: "Koine Greek" },
            { id: "grc", name: "Ancient Greek" },
            { id: "hbo", name: "Biblical Hebrew" },
            { id: "lat", name: "Classical Latin" },
            { id: "syr", name: "Syriac" },
            { id: "cop", name: "Coptic" },
            { id: "arc", name: "Aramaic" },
            { id: "akk", name: "Akkadian" },
            { id: "san", name: "Sanskrit" },
            { id: "egy", name: "Egyptian Hieroglyphs" },
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => navigate(`/app/language/${lang.id}`)}
              className="shrink-0 px-6 py-4 rounded-xl border border-bdr/40 bg-sand hover:border-blue hover:text-blue transition-colors font-serif whitespace-nowrap"
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      {filteredTexts.length === 0 ? (
        <div className="card p-12 text-center col-span-full border-dashed border-2 border-bdr/40 bg-parch2/50 flex flex-col items-center">
          <LibraryIcon className="w-12 h-12 text-muted mb-4" />
          <h3 className="font-serif text-[24px] text-ink mb-2">Shelf Empty</h3>
          <p className="text-ink3 max-w-sm mx-auto">
            Import a text or pick one from the curated library to begin. Try
            adjusting your filters if you can't find what you're looking for.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {filteredTexts.map((text, i) => (
            <motion.div
              key={text.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              onClick={() => navigate(`/app/reader/${text.id}`)}
              className={cn(
                "card p-6 flex flex-col justify-between cursor-pointer group hover:border-blue/30 transition-all min-h-[240px]",
                text.isImported && "border-blue/10 bg-blue/[0.01]",
              )}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-[18px] font-serif font-medium text-ink leading-snug pr-4">
                    {text.title}
                    {text.isImported && (
                      <span className="inline-block ml-2 text-[10px] font-sans font-bold bg-blue/10 text-blue px-2 py-0.5 rounded uppercase tracking-wider">
                        📥 Import
                      </span>
                    )}
                  </h4>
                  <span
                    className={cn(
                      "pill flex-shrink-0 font-bold",
                      getCefrClass(text.level),
                    )}
                  >
                    {text.level}
                  </span>
                </div>

                <div className="text-[10px] text-ink3 font-sans mb-4 uppercase tracking-[0.1em] font-bold">
                  {text.author} <span className="mx-1 opacity-50">•</span>{" "}
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
                  }[text.language as string] || text.language}
                </div>

                {/* Knowledge bars at a glance */}
                <div className="flex h-1 gap-0.5 mb-6 opacity-30 group-hover:opacity-100 transition-opacity">
                  <div
                    className="bg-blue h-full"
                    style={{ width: `${text.percentKnown}%` }}
                  />
                  <div
                    className="bg-amber h-full"
                    style={{ width: `${text.percentLearning}%` }}
                  />
                  <div className="flex-1 bg-parch3 h-full" />
                </div>

                {/* Stats & Progress Bars */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-zinc-500 uppercase tracking-tight">
                      {text.totalWords} Total Words
                    </span>
                    <span className="text-blue">
                      {text.percentKnown}% Known
                    </span>
                  </div>
                  <div className="flex h-1.5 w-full bg-parch3 rounded-full overflow-hidden">
                    <div
                      className="bg-blue h-full transition-all duration-500"
                      style={{ width: `${text.percentKnown}%` }}
                    />
                    <div
                      className="bg-amber h-full transition-all duration-500 opacity-60"
                      style={{ width: `${text.percentLearning}%` }}
                    />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-ink leading-none">
                        {text.percentKnown}%
                      </span>
                      <span className="text-[8px] uppercase font-bold text-muted tracking-widest">
                        Known
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-bold text-amber leading-none">
                        {text.percentLearning}%
                      </span>
                      <span className="text-[8px] uppercase font-bold text-muted tracking-widest">
                        Learning
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-end justify-between pt-4 mt-auto">
                <span className="text-[11px] font-body italic text-muted">
                  {text.isImported ? "Private Lesson" : "Original Scripture"}
                </span>
                <div className="bg-blue/5 text-blue px-3 py-1 rounded-full text-[11px] font-bold group-hover:bg-blue group-hover:text-white transition-all">
                  Read Text
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
