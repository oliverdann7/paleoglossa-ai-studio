import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Search, Trash2, ExternalLink, History, TrendingUp, Brain, GraduationCap, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKnowledge } from "../lib/hooks/useKnowledge";
import { WordInfo } from "../lib/services/vocabularyService";
import { WordState, normalizeWordState, safeStateLabel } from "../lib/constants/wordStates";
import { getTokenInfo } from "../lib/data/dictionary";
import { useTranslation } from "react-i18next";
import { useActiveLanguage } from "../lib/hooks/useActiveLanguage";
import { getLanguageDisplayName } from "../lib/constants/languages";

const PAGE_SIZE = 50;

function exportToCSV(words: { term: string; definition: string; translit: string; language: string; status: string; encounterCount: number; nextReview: string }[], filename: string) {
  const header = ['Term', 'Definition', 'Transliteration', 'Language', 'Status', 'Encounters', 'Next Review'];
  const rows = words.map(w => [
    w.term,
    w.definition,
    w.translit,
    w.language,
    w.status,
    String(w.encounterCount),
    w.nextReview ? new Date(w.nextReview).toLocaleDateString() : '',
  ].map(v => `"${v.replace(/"/g, '""')}"`).join(','));
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const Vocabulary = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const { activeLanguageId } = useActiveLanguage();
  const { knowledge, setWordState } = useKnowledge(activeLanguageId);
  const { t } = useTranslation();

  const filters = ["All", "Due", "Known", "Familiar", "Learning", "Seen", "Ignored"];

  const words = useMemo(() => {
    return Object.entries(knowledge)
      .filter(([, info]) => {
        const state = normalizeWordState(typeof info === "object" ? (info as any).state : info);
        return state !== WordState.NEW;
      })
      .filter(([, info]) => {
        const lang = (typeof info === "object" ? (info as any).languageId : null) || '';
        return !lang || lang === activeLanguageId;
      })
      .map(([lemma, info]) => {
        const wordInfo = typeof info === "object" ? (info as WordInfo) : ({ state: info } as unknown as WordInfo);
        const nextReview = wordInfo.srs?.nextReview ? new Date(wordInfo.srs.nextReview as any) : new Date();
        const tokenInfo = getTokenInfo(lemma);
        const definition = wordInfo.userGloss || tokenInfo?.gloss || "Definition missing";
        const languageDesc = wordInfo.languageId || tokenInfo?.language || (lemma.match(/[\u0590-\u05FF\u0700-\u074F]/u) ? "Hebrew" : getLanguageDisplayName(activeLanguageId));

        return {
          id: lemma,
          term: lemma,
          definition,
          translit: tokenInfo?.transliteration || "",
          language: languageDesc,
          status: safeStateLabel(wordInfo.state),
          nextReview: nextReview.toISOString(),
          isDue: nextReview <= new Date(),
          encounterCount: wordInfo.encounterCount ?? 0,
          lastSeenAt: wordInfo.lastSeenAt,
        };
      })
      .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime()); // sort due earliest
  }, [knowledge]);

  const handleDelete = (id: string) => {
    setWordState(id, WordState.NEW); // Effectively deletes from learned list
  };

  const filteredWords = words.filter((w) => {
    let matchesFilter = true;
    if (activeFilter === "Due") matchesFilter = w.isDue && w.status !== "Seen";
    else if (activeFilter !== "All") matchesFilter = w.status === activeFilter;
    
    const matchesSearch = w.term.toLowerCase().includes(searchQuery.toLowerCase()) || w.definition.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getDictionaryPath = (lemma: string, langId: string) => {
    const code = langId?.toLowerCase() || '';
    const languageId = code.includes('koine') ? 'grc-koine'
      : code.includes('greek') ? 'grc'
      : code.includes('hebrew') ? 'hbo'
      : code.includes('latin') ? 'lat'
      : langId;
    return `/app/dictionary/${encodeURIComponent(languageId)}/${encodeURIComponent(lemma)}`;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Known": return "cefr-c";
      case "Familiar": return "cefr-b";
      case "Learning": return "cefr-a";
      case "Seen": return "cefr-a opacity-50";
      case "Ignored": return "bg-ink3/10 text-ink3 border-ink3/20";
      default: return "";
    }
  };

  const stats = useMemo(() => {
    let due = 0, known = 0, learning = 0;
    for (const w of words) {
      if (w.isDue && w.status !== "Seen") due++;
      if (w.status === "Known" || w.status === "Familiar") known++;
      if (w.status === "Learning") learning++;
    }
    return { due, known, learning };
  }, [words]);

  // Reset to page 0 whenever filter or search changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(0);
  }, [activeFilter, searchQuery]);

  const totalPages = Math.ceil(filteredWords.length / PAGE_SIZE);
  const pagedWords = filteredWords.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto font-sans min-h-screen">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">
            {t('vocab.title', "Vocabulary")}
          </h2>
          <p className="font-body text-[15px] italic text-ink2">
            {t('vocab.personalCollection', `Your personal collection of ${words.length} tracked words`, { count: words.length })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportToCSV(filteredWords, `vocabulary-${activeLanguageId}-${new Date().toISOString().slice(0, 10)}.csv`)}
            disabled={filteredWords.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 border border-bdr rounded-xl text-[13px] font-bold text-ink3 hover:bg-parch2 disabled:opacity-40 transition-all"
            title={t('vocab.exportCSV', 'Export as CSV')}
          >
            <Download className="w-4 h-4" />
            {t('vocab.export', 'Export')}
          </button>
          <button onClick={() => navigate("/app/review")} className="btn-primary px-6 py-2.5">
            {t('dashboard.startReview', "Start Review")}
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
         <div className="card p-5 border-blue/20 bg-blue/5">
            <div className="flex items-center gap-3 mb-2 opacity-70">
               <Brain className="w-4 h-4 text-blue" />
               <h4 className="text-[12px] uppercase tracking-widest font-bold text-blue">{t("vocab.reviewsDue", "Reviews Due")}</h4>
            </div>
            <div className="text-[32px] font-serif leading-none text-ink">{stats.due}</div>
         </div>
         <div className="card p-5 border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-3 mb-2 opacity-70">
               <GraduationCap className="w-4 h-4 text-emerald-600" />
               <h4 className="text-[12px] uppercase tracking-widest font-bold text-emerald-600">{t("vocab.known", "Words Known")}</h4>
            </div>
            <div className="text-[32px] font-serif leading-none text-ink">{stats.known}</div>
         </div>
         <div className="card p-5 border-amber/20 bg-amber/5">
            <div className="flex items-center gap-3 mb-2 opacity-70">
               <TrendingUp className="w-4 h-4 text-amber" />
               <h4 className="text-[12px] uppercase tracking-widest font-bold text-amber">{t("vocab.learning", "Words Learning")}</h4>
            </div>
            <div className="text-[32px] font-serif leading-none text-ink">{stats.learning}</div>
         </div>
      </div>

      <div className="flex flex-col gap-5 mb-10 card p-4 bg-parch2/30 border-bdr/50 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  "px-4 py-2 rounded-full text-[12px] font-bold font-sans transition-all duration-150 border active:scale-95",
                  activeFilter === filter
                    ? "bg-blue text-white shadow-md border-blue"
                    : "bg-white text-ink3 border-bdr/60 hover:bg-parch hover:border-blue/30",
                )}
              >
                {t(`vocab.${filter.toLowerCase()}`, filter)} {filter === "Due" && stats.due > 0 && <span className="ml-1 opacity-70">({stats.due})</span>}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder={t("vocab.searchLexicon", "Search lexicon...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-bdr rounded-[12px] text-[14px] font-sans focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pb-20">
        {filteredWords.length > 0 ? (
          pagedWords.map((word, i) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.015, duration: 0.3 }}
              className="card p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 group hover:border-blue/30 hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="w-40 flex-shrink-0">
                  <div className={cn("text-[26px] font-serif text-ink leading-tight",
                      ['hbo', 'Biblical Hebrew', 'arc', 'Aramaic', 'syr', 'Syriac', 'Hebrew'].includes(word.language) ? "font-hebrew" : "")}
                      dir={['hbo', 'Biblical Hebrew', 'arc', 'Aramaic', 'syr', 'Syriac', 'egy', 'Hebrew'].includes(word.language) ? "rtl" : "ltr"}>
                    {word.term}
                  </div>
                  <div className="font-mono text-[11px] italic text-muted mt-0.5">{word.translit}</div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-[9px] font-bold text-muted border border-bdr/60 bg-parch px-1.5 py-0.5 rounded uppercase">
                      {word.language}
                    </span>
                    {word.status !== 'Seen' && (
                      <span className={cn("text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider", word.isDue ? "text-amber" : "text-emerald-600/70")}>
                        <History className="w-3 h-3" />
                        {word.isDue ? t("vocab.dueNow", "Due Now") : t("vocab.dueDate", { date: new Date(word.nextReview).toLocaleDateString(), defaultValue: `Due ${new Date(word.nextReview).toLocaleDateString()}` })}
                      </span>
                    )}
                  </div>
                  <div className="font-body text-[14px] italic text-ink2 mt-1">
                    {word.definition}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto mt-2 md:mt-0 pt-3 md:pt-0 border-t border-bdr/50 md:border-none">
                <div className="flex flex-col items-start md:items-end gap-1 w-36">
                  <div className={cn("pill px-2 py-0.5 text-[10.5px] font-bold shadow-sm", getStatusClass(word.status))}>
                    {t(`vocab.${word.status.toLowerCase()}`, word.status)}
                  </div>
                  {word.encounterCount > 0 && (
                    <div className="text-[10px] text-muted font-mono">
                      {t("vocab.timesSeen", "{{count}}× seen", { count: word.encounterCount })}
                      {word.lastSeenAt && (
                        <span className="ml-1 opacity-70">· {new Date(word.lastSeenAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => navigate(getDictionaryPath(word.term, word.language))}
                     className="p-1.5 rounded text-muted hover:text-blue hover:bg-blue/5 transition-colors" title={t("vocab.openDictionary", "Open dictionary entry")}>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(word.id)} className="p-1.5 rounded text-ruby/40 hover:text-ruby hover:bg-ruby/5 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="card p-12 text-center col-span-full border-dashed border-2 border-bdr/40 bg-parch2/50 flex flex-col items-center">
            <Brain className="w-12 h-12 text-muted mb-4 opacity-50" />
            <h3 className="font-serif text-[24px] text-ink mb-2">{t("vocab.noWordsFound", "No Words Found")}</h3>
            <p className="text-ink3 max-w-sm mx-auto mb-6">{t("vocab.noWordsFoundDesc", "Read texts or import vocabulary to begin building your personal lexicon.")}</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 py-8">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-full border border-bdr/60 text-ink3 hover:text-blue hover:border-blue/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-[13px] font-bold text-muted">
              {t("vocab.pageOf", "Page {{current}} of {{total}}", { current: currentPage + 1, total: totalPages })}
              <span className="font-normal ml-2">{t("vocab.totalWords", "({{count}} words)", { count: filteredWords.length })}</span>
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="p-2 rounded-full border border-bdr/60 text-ink3 hover:text-blue hover:border-blue/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
