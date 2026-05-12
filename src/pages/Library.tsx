import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Search, Library as LibraryIcon, Play, Filter, Clock, BookOpen, Crown,
  ChevronDown, CalendarDays, FileText, GitBranch, Languages, ShieldCheck,
  Volume2, Globe, Share2, Lock, GitFork, FlaskConical, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useKnowledge } from "../lib/hooks/useKnowledge";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../lib/constants/languages";
import { LibraryService, LibraryText } from "../lib/services/libraryService";
import { useAuth } from "../lib/hooks/useAuth";
import { getLanguageDisplayName } from "../lib/constants/languages";
import { ImportService } from "../lib/services/importService";

type SortOption = 'comprehensible' | 'newest' | 'shortest' | 'hardest' | 'unknown';

const PERIOD_FILTERS = [
  'Hellenistic / Roman',
  'Iron Age',
  'Augustan',
  'Late Antique',
  'Classical',
  'Archaic',
  'Ancient Near Eastern',
  'Classical Sanskrit',
  'Late Bronze Age',
  'Middle Egyptian',
];

const GENRE_FILTERS = [
  'Gospel',
  'Narrative',
  'Epic',
  'Psalm',
  'History',
  'Fable',
  'Early Christian',
  'Christian literature',
  'Biblical prose/poetry',
  'Royal / literary text',
  'Wisdom instruction',
];

const CORPUS_TYPE_FILTERS = [
  'biblical',
  'classical',
  'patristic',
  'inscription',
  'manuscript',
  'islamicate',
  'other',
];

// ─── Status badge ─────────────────────────────────────────────────────────────
type BadgeDef = { label: string; className: string; icon?: React.FC<{ className?: string }> };

function getStatusBadge(text: LibraryText): BadgeDef | null {
  if (text.sourceType === 'import') return null; // handled separately
  const s = text.sourceStatus;
  if (s === 'complete') return {
    label: 'Complete',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  if (s === 'partial') return {
    label: 'Partial',
    className: 'bg-blue/5 text-blue border-blue/20',
  };
  if (s === 'excerpt' || text.isSample) return {
    label: 'Sample Excerpt',
    className: 'bg-amber/5 text-amber border-amber/20',
    icon: AlertCircle,
  };
  if (s === 'stub') return {
    label: 'Stub',
    className: 'bg-parch3 text-muted border-bdr/40',
  };
  if (s === 'needs_import') return {
    label: 'Not Imported',
    className: 'bg-red-50 text-red-500 border-red-200',
  };
  return null;
}

export const Library = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getWordInfo, getAllProgress } = useKnowledge();
  // Stable ref so the fetch effect doesn't re-run when word states change
  const getWordInfoRef = useRef(getWordInfo);
  useLayoutEffect(() => { getWordInfoRef.current = getWordInfo; });
  const { t } = useTranslation();

  const [texts, setTexts] = useState<LibraryText[]>([]);
  const [readingProgress, setReadingProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting state
  const [activeLang, setActiveLang] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [minKnown, setMinKnown] = useState(0);
  const [activeSort, setActiveSort] = useState<SortOption>('comprehensible');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [corpusTypeFilter, setCorpusTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'imports' | 'public'>('library');
  const [sharingId, setSharingId] = useState<string | null>(null);

  useEffect(() => {
    getAllProgress().then(setReadingProgress);
  }, [getAllProgress]);

  useEffect(() => {
    const fetchLibrary = async () => {
      setIsLoading(true);
      const sourceMap: Record<string, 'corpus' | 'import' | 'public'> = {
        'library': 'corpus',
        'imports': 'import',
        'public': 'public'
      };
      const data = await LibraryService.getLibrary(user?.uid || null, {
        language: activeLang,
        search: searchQuery,
        minKnownPercent: minKnown,
        period: periodFilter,
        genre: genreFilter,
        corpusType: corpusTypeFilter,
        source: sourceMap[activeTab]
      }, getWordInfoRef.current);
      setTexts(data);
      setIsLoading(false);
    };

    const timeoutId = setTimeout(() => {
      fetchLibrary();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [user?.uid, activeLang, searchQuery, minKnown, periodFilter, genreFilter, corpusTypeFilter, activeTab]);

  const mainFilters = [
    { name: "All", id: "all", icon: "📚" },
    ...LANGUAGES
  ];

  const sortedTexts = useMemo(() => {
    const copy = [...texts];
    switch (activeSort) {
      case 'comprehensible':
        return copy.sort((a, b) => (b.percentKnown || 0) - (a.percentKnown || 0));
      case 'hardest':
        return copy.sort((a, b) => (a.percentKnown || 0) - (b.percentKnown || 0));
      case 'newest':
        return copy.sort((a, b) => new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime());
      case 'shortest':
        return copy.sort((a, b) => a.totalWords - b.totalWords);
      case 'unknown':
        return copy.sort((a, b) => {
          const aUnknown = a.totalWords - ((a.percentKnown || 0) / 100 * a.totalWords) - ((a.percentLearning || 0) / 100 * a.totalWords);
          const bUnknown = b.totalWords - ((b.percentKnown || 0) / 100 * b.totalWords) - ((b.percentLearning || 0) / 100 * b.totalWords);
          return bUnknown - aUnknown;
        });
      default:
        return copy;
    }
  }, [texts, activeSort]);

  // Only show actual reading progress — never fake "Continue Reading" from corpus
  const recentTexts = useMemo(() => {
    if (readingProgress.length === 0) return [];
    return readingProgress
      .map(p => {
        const text = texts.find(t => t.id === p.textId);
        if (!text) return null;
        return { ...text, lastPosition: p.lastPosition || 0 };
      })
      .filter(Boolean)
      .slice(0, 4);
  }, [readingProgress, texts]);

  const getCefrClass = (level: string) => {
    if (level?.startsWith("A")) return "cefr-a";
    if (level?.startsWith("B")) return "cefr-b";
    return "cefr-c";
  };

  // Group into collections
  const collections = useMemo(() => {
    const map: Record<string, LibraryText[]> = {};
    sortedTexts.forEach(t => {
      let collectionName = "Other";
      if (t.sourceType === 'import') collectionName = "Your Texts";
      else if (t.corpusTitle) collectionName = t.corpusTitle;
      else if (t.language === 'grc-koine' || t.language === 'grc') collectionName = "Greek Texts";
      else if (t.language === 'hbo') collectionName = "Hebrew Bible";
      else if (t.language === 'lat') collectionName = "Latin Library";

      if (!map[collectionName]) map[collectionName] = [];
      map[collectionName].push(t);
    });
    return map;
  }, [sortedTexts]);

  const handleShare = async (textId: string) => {
    if (!user?.uid) return;
    setSharingId(textId);
    try {
      await ImportService.sharePublic(user.uid, textId);
      setTexts(prev => prev.map(t =>
        t.id === textId ? { ...t, isPublic: true, sourceType: 'public' } : t
      ));
    } catch (e) {
      console.error("Error sharing:", e);
    }
    setSharingId(null);
  };

  const handleUnshare = async (textId: string) => {
    if (!user?.uid) return;
    setSharingId(textId);
    try {
      await ImportService.unsharePublic(user.uid, textId);
      setTexts(prev => prev.map(t =>
        t.id === textId ? { ...t, isPublic: false, sourceType: 'import' } : t
      ));
    } catch (e) {
      console.error("Error unsharing:", e);
    }
    setSharingId(null);
  };

  const handleFork = async (textId: string) => {
    if (!user?.uid) return;
    setSharingId(textId);
    try {
      const newId = await ImportService.forkPublic(user.uid, textId);
      if (newId) navigate(`/app/reader/${newId}`);
    } catch (e) {
      console.error("Error forking:", e);
    }
    setSharingId(null);
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto font-sans min-h-screen">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">
            {t("library.title", "Library")}
          </h2>
          <p className="font-body text-[15px] italic text-ink2">
            {t("library.subtitle", "Browse curated corpora, inspect metadata, and open texts in the reader.")}
          </p>
        </div>
      </header>

      {/* Tab Navigation — Your Texts first, corpus second */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <button
          onClick={() => setActiveTab('imports')}
          className={cn(
            "px-4 py-2 rounded-lg text-[13px] font-bold font-sans transition-all flex items-center gap-2",
            activeTab === 'imports'
              ? "bg-blue text-white shadow-md"
              : "bg-white text-ink3 border border-bdr/40 hover:bg-parch"
          )}
        >
          <BookOpen className="w-4 h-4" />
          Your Texts
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={cn(
            "px-4 py-2 rounded-lg text-[13px] font-bold font-sans transition-all flex items-center gap-2",
            activeTab === 'library'
              ? "bg-ink text-parch shadow-md"
              : "bg-white text-ink3 border border-bdr/40 hover:bg-parch"
          )}
        >
          <LibraryIcon className="w-4 h-4" />
          Curated Library
        </button>
        <button
          onClick={() => setActiveTab('public')}
          className={cn(
            "px-4 py-2 rounded-lg text-[13px] font-bold font-sans transition-all flex items-center gap-2",
            activeTab === 'public'
              ? "bg-emerald-600 text-white shadow-md"
              : "bg-white text-ink3 border border-bdr/40 hover:bg-parch"
          )}
        >
          <Globe className="w-4 h-4" />
          Public Library
        </button>
      </div>

      {/* Continue Reading — only shown when user has real reading history */}
      {recentTexts.length > 0 && activeTab !== 'public' && (
        <div className="mb-14 fade-in">
          <h3 className="eyebrow mb-4 opacity-50">{t("library.continueReading", "Continue Reading")}</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide py-1">
            {recentTexts.map((text: any, i) => (
              <div
                key={i}
                className="min-w-[340px] card bg-parch2/30 border-bdr/40 p-6 flex items-center justify-between group cursor-pointer hover:border-blue/30 hover:shadow-md transition-all active:scale-[0.99]"
                onClick={() => navigate(`/app/reader/${text.id}`)}
              >
                <div className="max-w-[200px]">
                  <h4 className="text-[17px] font-serif font-bold text-ink truncate mb-1">
                    {text.title}
                  </h4>
                  <div className="text-[10px] uppercase font-bold text-muted tracking-widest flex items-center gap-1.5">
                    {text.sourceType === 'import' && <BookOpen className="w-3 h-3 text-blue" />}
                    {text.author || "Unknown"}
                  </div>
                  <div className="mt-4 h-1.5 w-full bg-parch3 rounded-full overflow-hidden">
                    <div className="h-full bg-gold transition-all duration-1000" style={{ width: `${Math.max(text.lastPosition || 0, 2)}%` }} />
                  </div>
                  <div className="text-[10px] text-muted mt-2 font-bold">{Math.round(text.lastPosition || 0)}% Complete</div>
                </div>
                <button className="w-12 h-12 bg-white border border-bdr rounded-full flex items-center justify-center text-blue shadow-sm group-hover:bg-blue group-hover:text-white transition-all">
                  <Play className="w-5 h-5 ml-0.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-10 card p-6 bg-parch2/10 border-bdr/30 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder={t("library.searchPlaceholder", "Search texts, corpora, authors, genres...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-bdr rounded-[12px] text-[14px] font-sans focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 flex-1">
            {mainFilters.slice(0, 5).map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveLang(filter.name)}
                className={cn(
                  "px-4 py-2 rounded-full text-[12px] font-medium font-sans transition-all duration-150 border flex items-center gap-1.5 active:scale-95",
                  activeLang === filter.name
                    ? "bg-blue text-white shadow-md border-blue"
                    : "bg-white text-ink3 border-bdr/60 hover:bg-parch hover:border-blue/30",
                )}
              >
                <span>{filter.icon}</span>
                <span className="hidden sm:inline">{filter.name}</span>
              </button>
            ))}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "px-4 py-2 rounded-full text-[12px] font-bold font-sans flex items-center gap-1.5 transition-all outline-none border",
                showFilters ? "bg-parch3 border-bdr text-ink" : "bg-white border-bdr/60 text-ink3 hover:bg-parch"
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showFilters && "rotate-180")} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-6 pt-6 border-t border-bdr/30 flex flex-wrap lg:flex-nowrap gap-8"
            >
              <div className="w-full lg:w-72">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[11px] font-bold text-muted uppercase">
                    {t("library.comprehensibility", "Comprehensibility")}
                  </label>
                  <span className="text-[11px] font-bold text-blue bg-blue/10 px-2 py-0.5 rounded-full">
                    {minKnown}%+ {t("library.known", "Known")}
                  </span>
                </div>
                <input
                  type="range" min="0" max="95" step="5" value={minKnown}
                  onChange={(e) => setMinKnown(parseInt(e.target.value, 10))}
                  className="w-full accent-blue appearance-none h-1.5 bg-parch3 rounded-full cursor-pointer"
                />
                <div className="flex justify-between mt-2 text-[10px] font-bold text-zinc-400">
                  <span>{t("library.any", "Any %")}</span>
                  <span>{t("library.nearlyAll", "Nearly All")}</span>
                </div>
              </div>

              <div className="w-full lg:w-44">
                <label className="block text-[11px] font-bold text-muted uppercase mb-4">Sort By</label>
                <select
                  value={activeSort}
                  onChange={e => setActiveSort(e.target.value as SortOption)}
                  className="w-full p-2 text-sm bg-white border border-bdr rounded outline-none"
                >
                  <option value="comprehensible">Most Comprehensible</option>
                  <option value="newest">Newest Added</option>
                  <option value="shortest">Shortest Length</option>
                  <option value="hardest">Hardest</option>
                  <option value="unknown">Most Unknown Words</option>
                </select>
              </div>

              <div className="w-full lg:w-44">
                <label className="block text-[11px] font-bold text-muted uppercase mb-4">Period</label>
                <select
                  value={periodFilter}
                  onChange={e => setPeriodFilter(e.target.value)}
                  className="w-full p-2 text-sm bg-white border border-bdr rounded outline-none"
                >
                  <option value="all">All Periods</option>
                  {PERIOD_FILTERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="w-full lg:w-44">
                <label className="block text-[11px] font-bold text-muted uppercase mb-4">Genre</label>
                <select
                  value={genreFilter}
                  onChange={e => setGenreFilter(e.target.value)}
                  className="w-full p-2 text-sm bg-white border border-bdr rounded outline-none"
                >
                  <option value="all">All Genres</option>
                  {GENRE_FILTERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="w-full lg:w-44">
                <label className="block text-[11px] font-bold text-muted uppercase mb-4">Corpus Type</label>
                <select
                  value={corpusTypeFilter}
                  onChange={e => setCorpusTypeFilter(e.target.value)}
                  className="w-full p-2 text-sm bg-white border border-bdr rounded outline-none"
                >
                  <option value="all">All Types</option>
                  {CORPUS_TYPE_FILTERS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card p-6 min-h-[240px] flex flex-col justify-between animate-pulse">
              <div>
                <div className="h-6 bg-parch3 rounded w-3/4 mb-3" />
                <div className="h-4 bg-parch3 rounded w-1/2 mb-6" />
                <div className="flex gap-1.5 mb-4">
                  <div className="h-5 bg-parch3 rounded-full w-16" />
                  <div className="h-5 bg-parch3 rounded-full w-20" />
                </div>
                <div className="h-2 bg-parch3 rounded w-full mb-2" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-parch3 rounded w-24" />
                <div className="h-6 bg-parch3 rounded-full w-8" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedTexts.length === 0 ? (
        activeTab === 'imports' ? (
          /* Empty "Your Texts" — strong first-class import CTA */
          <div className="card p-12 text-center border-2 border-dashed border-blue/20 bg-blue/[0.02] flex flex-col items-center">
            <BookOpen className="w-16 h-16 text-blue/30 mb-6" />
            <h3 className="font-serif text-[28px] text-ink mb-3">Your library is empty.</h3>
            <p className="text-ink3 max-w-md mx-auto mb-8 text-[15px] leading-relaxed">
              Import any ancient text — paste it, upload a file, or scrape a URL.
              Paleoglossa will analyze the morphology, map it to your vocabulary,
              and make it immediately readable.
            </p>
            <button
              onClick={() => navigate('/app/import')}
              className="px-8 py-4 bg-blue text-white font-bold rounded-2xl hover:shadow-xl transition-all shadow-lg text-[15px]"
            >
              Import Your First Text
            </button>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg text-left">
              {[
                { label: "Ancient Greek", hint: "Plato, Xenophon, Homer, NT" },
                { label: "Classical Latin", hint: "Cicero, Virgil, Caesar, Livy" },
                { label: "Biblical Hebrew", hint: "Psalms, Genesis, Proverbs" },
              ].map(s => (
                <div key={s.label} className="px-4 py-3 rounded-xl bg-parch2 border border-bdr/40">
                  <div className="text-[12px] font-bold text-ink mb-0.5">{s.label}</div>
                  <div className="text-[11px] text-muted">{s.hint}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card p-12 text-center col-span-full border-dashed border-2 border-bdr/40 bg-parch2/50 flex flex-col items-center">
            <LibraryIcon className="w-12 h-12 text-muted mb-4" />
            <h3 className="font-serif text-[24px] text-ink mb-2">{t("library.shelfEmpty", "Shelf Empty")}</h3>
            <p className="text-ink3 max-w-sm mx-auto mb-6">
              {t("library.shelfEmptyDesc", "Import a text or pick one from the curated library to begin. Try adjusting your filters if you can't find what you're looking for.")}
            </p>
            <button
              onClick={() => navigate('/app/import')}
              className="px-6 py-2.5 bg-ink text-white font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              Import New Text
            </button>
          </div>
        )
      ) : (
        <div className="space-y-12 pb-20">
          {Object.entries(collections).map(([collectionName, colTexts]) => (
            <div key={collectionName} className="scroll-mt-8">
              <h3 className="font-serif text-[22px] font-bold text-ink flex items-center gap-3 mb-6">
                {collectionName === "Your Texts" && <BookOpen className="w-5 h-5 text-blue" />}
                {collectionName}
                <span className="text-sm font-sans font-normal text-muted bg-parch3 px-2 py-0.5 rounded-full">
                  {colTexts.length}
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {colTexts.map((text, i) => {
                  const statusBadge = getStatusBadge(text);
                  const BadgeIcon = statusBadge?.icon;
                  const sectionCount = text.sectionsPreview?.length ?? 0;

                  return (
                    <motion.div
                      key={text.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      onClick={() => navigate(`/app/reader/${text.id}`)}
                      className={cn(
                        "card p-6 flex flex-col justify-between cursor-pointer group hover:border-blue/30 transition-all min-h-[250px] relative overflow-hidden",
                        text.sourceType === 'import' && "border-blue/10 bg-blue/[0.01]",
                        text.isSample && "border-amber/15 bg-amber/[0.01]",
                      )}
                    >
                      {text.percentKnown !== undefined && text.percentKnown >= 90 && (
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gold/10 rounded-bl-full flex justify-end items-start p-3">
                          <Crown className="w-4 h-4 text-gold opacity-50" />
                        </div>
                      )}

                      <div>
                        {/* Title */}
                        <div className="flex justify-between items-start mb-2 pr-8">
                          <h4 className="text-[18px] font-serif font-medium text-ink leading-snug">
                            {text.title}
                          </h4>
                        </div>

                        {/* Author · Language */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="text-[10px] text-ink3 font-sans uppercase tracking-[0.1em] font-bold">
                            {text.author}
                          </div>
                          <span className="opacity-30 text-[10px]">•</span>
                          <span className="text-[10px] text-blue font-sans uppercase tracking-widest font-bold">
                            {getLanguageDisplayName(text.language)}
                          </span>
                        </div>

                        {/* Metadata grid */}
                        <div className="grid grid-cols-2 gap-2 mb-4 text-[11px] text-ink3">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <CalendarDays className="w-3.5 h-3.5 text-muted shrink-0" />
                            <span className="truncate">{text.date || text.period || "Date unknown"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-muted shrink-0" />
                            <span className="truncate">{text.genre || "Text"}</span>
                          </div>
                          {sectionCount > 0 && (
                            <div className="flex items-center gap-1.5 min-w-0">
                              <LibraryIcon className="w-3.5 h-3.5 text-muted shrink-0" />
                              <span className="truncate">{sectionCount} section{sectionCount !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <ShieldCheck className="w-3.5 h-3.5 text-muted shrink-0" />
                            <span className="truncate">{text.licenseName || "License unknown"}</span>
                          </div>
                        </div>

                        {/* Status + tool badges */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {/* Source type for imports */}
                          {text.sourceType === 'import' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider bg-blue/5 text-blue border-blue/20">
                              <BookOpen className="w-3 h-3" />
                              Your Text
                            </span>
                          )}
                          {/* Analysis quality for imports */}
                          {text.sourceType === 'import' && text.analysisStatus === 'raw' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider bg-amber/5 text-amber border-amber/20">
                              <AlertCircle className="w-3 h-3" />
                              No AI Analysis
                            </span>
                          )}
                          {text.sourceType === 'import' && text.analysisStatus === 'needs_ai' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider bg-amber/5 text-amber border-amber/20">
                              <AlertCircle className="w-3 h-3" />
                              Analysis Needed
                            </span>
                          )}
                          {text.sourceType === 'public' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 border-emerald-200">
                              <Globe className="w-3 h-3" />
                              Public
                            </span>
                          )}

                          {/* Corpus status */}
                          {statusBadge && (
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider",
                              statusBadge.className
                            )}>
                              {BadgeIcon && <BadgeIcon className="w-3 h-3" />}
                              {statusBadge.label}
                            </span>
                          )}

                          {/* Tool availability */}
                          {[
                            { key: 'morphology', label: 'Morphology', icon: Languages, active: text.availableTools?.morphology },
                            { key: 'translation', label: 'Translation', icon: BookOpen, active: text.availableTools?.translation },
                            { key: 'audio', label: 'Audio', icon: Volume2, active: text.availableTools?.audio },
                            { key: 'syntax', label: 'Syntax', icon: GitBranch, active: text.availableTools?.syntax },
                          ].map(tool => {
                            const ToolIcon = tool.icon;
                            return (
                              <span
                                key={tool.key}
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider",
                                  tool.active
                                    ? "bg-blue/5 text-blue border-blue/20"
                                    : "bg-white text-muted border-bdr/40 opacity-40"
                                )}
                              >
                                <ToolIcon className="w-3 h-3" />
                                {tool.label}
                              </span>
                            );
                          })}

                          {/* Experimental tag for stub / needs_import */}
                          {(text.sourceStatus === 'stub' || text.sourceStatus === 'needs_import') && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider bg-parch3 text-muted border-bdr/40">
                              <FlaskConical className="w-3 h-3" />
                              Experimental
                            </span>
                          )}
                        </div>

                        {/* Honest excerpt notice */}
                        {(text.isSample || text.sourceStatus === 'excerpt') && (
                          <p className="text-[10px] text-amber/80 italic mb-4">
                            Sample excerpt — full text not yet imported.
                          </p>
                        )}
                        {text.sourceStatus === 'partial' && !text.isSample && (
                          <p className="text-[10px] text-blue/70 italic mb-4">
                            Partial corpus — additional sections coming.
                          </p>
                        )}

                        {/* Sections quick-open */}
                        {text.sectionsPreview && text.sectionsPreview.length > 0 && (
                          <div className="mb-4">
                            <div className="text-[9px] uppercase font-bold tracking-widest text-muted mb-2">Open Section</div>
                            <div className="flex flex-wrap gap-1.5">
                              {text.sectionsPreview.slice(0, 4).map(section => (
                                <button
                                  key={section.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/app/reader/${text.id}?section=${encodeURIComponent(section.id)}`);
                                  }}
                                  className="px-2 py-1 rounded-md bg-white border border-bdr/50 text-[10px] font-bold text-ink3 hover:text-blue hover:border-blue/30 transition-colors"
                                >
                                  {section.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Knowledge progress bars */}
                        <div className="flex h-1 gap-0.5 mb-5 opacity-40 group-hover:opacity-100 transition-opacity">
                          <div className="bg-blue h-full" style={{ width: `${Math.max(text.percentKnown || 0, 1)}%` }} />
                          <div className="bg-amber h-full opacity-60" style={{ width: `${Math.max(text.percentLearning || 0, 1)}%` }} />
                          <div className="flex-1 bg-parch3 h-full" />
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                          <span className="text-zinc-500 uppercase tracking-tight flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {text.totalWords} wds · ~{Math.ceil(text.totalWords / 150)} min
                          </span>
                          <span className="text-blue">{text.percentKnown}% known</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-end justify-between pt-4 mt-auto border-t border-dashed border-bdr/40">
                        <div className="flex items-center gap-2">
                          {/* Share/unshare for imports */}
                          {text.sourceType === 'import' && user && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (text.isPublic) { handleUnshare(text.id); } else { handleShare(text.id); }
                              }}
                              disabled={sharingId === text.id}
                              className={cn(
                                "text-[9px] uppercase font-bold tracking-widest flex items-center gap-1 px-2 py-0.5 rounded transition-colors",
                                text.isPublic
                                  ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                                  : "text-blue bg-blue-50 hover:bg-blue-100"
                              )}
                            >
                              {text.isPublic ? <Lock className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
                              {text.isPublic ? "Unshare" : "Share"}
                            </button>
                          )}

                          {/* Fork for public */}
                          {text.sourceType === 'public' && user && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleFork(text.id); }}
                              disabled={sharingId === text.id}
                              className="text-[9px] uppercase font-bold tracking-widest flex items-center gap-1 px-2 py-0.5 rounded text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors"
                            >
                              <GitFork className="w-3 h-3" />
                              Fork
                            </button>
                          )}
                        </div>
                        <span className={cn("pill text-[10px] px-2 py-0.5", getCefrClass(text.level))}>
                          {text.level}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
