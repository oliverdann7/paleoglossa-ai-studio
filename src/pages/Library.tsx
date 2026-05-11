import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Search, Library as LibraryIcon, Play, Filter, Clock, BookOpen, Crown, ChevronDown, CalendarDays, FileText, GitBranch, Languages, ShieldCheck, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKnowledge } from "../lib/hooks/useKnowledge";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "../lib/constants/languages";
import { LibraryService, LibraryText } from "../lib/services/libraryService";
import { useAuth } from "../lib/hooks/useAuth";

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

const LANGUAGE_LABELS: Record<string, string> = {
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
  hit: "Hittite",
};

export const Library = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getWordInfo, getAllProgress } = useKnowledge();
  const { t } = useTranslation();
  
  const [texts, setTexts] = useState<LibraryText[]>([]);
  const [readingProgress, setReadingProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting state
  const [activeLang, setActiveLang] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [minKnown, setMinKnown] = useState(0);
  const [activeSort, setActiveSort] = useState<SortOption>('comprehensible');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'corpus' | 'import'>('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [corpusTypeFilter, setCorpusTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getAllProgress().then(setReadingProgress);
  }, [getAllProgress]);

  useEffect(() => {
    const fetchLibrary = async () => {
      setIsLoading(true);
      const data = await LibraryService.getLibrary(user?.uid || null, {
        language: activeLang,
        search: searchQuery,
        minKnownPercent: minKnown,
        period: periodFilter,
        genre: genreFilter,
        corpusType: corpusTypeFilter,
        source: sourceFilter === 'all' ? undefined : sourceFilter
      }, getWordInfo);
      setTexts(data);
      setIsLoading(false);
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchLibrary();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [user?.uid, activeLang, searchQuery, minKnown, sourceFilter, periodFilter, genreFilter, corpusTypeFilter, getWordInfo]);

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
          const aUnknown = a.totalWords - ((a.percentKnown || 0)/100 * a.totalWords) - ((a.percentLearning || 0)/100 * a.totalWords);
          const bUnknown = b.totalWords - ((b.percentKnown || 0)/100 * b.totalWords) - ((b.percentLearning || 0)/100 * b.totalWords);
          return bUnknown - aUnknown;
        });
      default:
        return copy;
    }
  }, [texts, activeSort]);

  const recentTexts = useMemo(() => {
    if (readingProgress.length === 0) return sortedTexts.slice(0, 3);
    
    return readingProgress
      .map(p => {
        const text = texts.find(t => t.id === p.textId);
        if (!text) return null;
        return {
          ...text,
          lastPosition: p.lastPosition || 0
        };
      })
      .filter(Boolean)
      .slice(0, 4);
  }, [readingProgress, texts, sortedTexts]);

  const getCefrClass = (level: string) => {
    if (level.startsWith("A")) return "cefr-a";
    if (level.startsWith("B")) return "cefr-b";
    return "cefr-c";
  };

  // Group into courses/collections
  const collections = useMemo(() => {
    const map: Record<string, LibraryText[]> = {};
    sortedTexts.forEach(t => {
      let collectionName = "Other";
      if (t.sourceType === 'import') collectionName = "Your Imports";
      else if (t.corpusTitle) collectionName = t.corpusTitle;
      else if (t.language === 'grc-koine' || t.language === 'grc') collectionName = "Greek Texts";
      else if (t.language === 'hbo') collectionName = "Hebrew Bible";
      else if (t.language === 'lat') collectionName = "Latin Library";
      
      if (!map[collectionName]) map[collectionName] = [];
      map[collectionName].push(t);
    });
    return map;
  }, [sortedTexts]);

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

      {/* Continue Reading Carousel */}
      {recentTexts.length > 0 && (
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

      {/* Advanced Filters */}
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
                      type="range"
                      min="0"
                      max="95"
                      step="5"
                      value={minKnown}
                      onChange={(e) => setMinKnown(parseInt(e.target.value, 10))}
                      className="w-full accent-blue appearance-none h-1.5 bg-parch3 rounded-full cursor-pointer"
                    />
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-zinc-400">
                      <span>{t("library.any", "Any %")}</span>
                      <span>{t("library.nearlyAll", "Nearly All")}</span>
                    </div>
                 </div>

                  <div className="w-full lg:w-48">
                     <label className="block text-[11px] font-bold text-muted uppercase mb-4">
                        Source
                      </label>
                      <select 
                         value={sourceFilter}
                         onChange={e => setSourceFilter(e.target.value as any)}
                         className="w-full p-2 text-sm bg-white border border-bdr rounded outline-none"
                      >
                         <option value="all">All Sources</option>
                         <option value="corpus">Curated Library</option>
                         <option value="import">My Imports</option>
                      </select>
                 </div>

                 <div className="w-full lg:w-48">
                     <label className="block text-[11px] font-bold text-muted uppercase mb-4">
                        Sort By
                      </label>
                      <select 
                         value={activeSort}
                         onChange={e => setActiveSort(e.target.value as any)}
                         className="w-full p-2 text-sm bg-white border border-bdr rounded outline-none"
                      >
                         <option value="comprehensible">Most Comprehensible</option>
                         <option value="newest">Newest Added</option>
                         <option value="shortest">Shortest Length</option>
                         <option value="hardest">Hardest (Lowest %)</option>
                         <option value="unknown">Most Unknown Words</option>
                      </select>
                 </div>
              </motion.div>
           )}
        </AnimatePresence>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {[1, 2, 3, 4, 5, 6].map(i => (
               <div key={i} className="card p-6 min-h-[240px] flex flex-col justify-between animate-pulse">
                  <div>
                     <div className="h-6 bg-parch3 rounded w-3/4 mb-4"></div>
                     <div className="h-4 bg-parch3 rounded w-1/2 mb-8"></div>
                     <div className="h-2 bg-parch3 rounded w-full mb-4"></div>
                  </div>

                  <div className="w-full lg:w-48">
                      <label className="block text-[11px] font-bold text-muted uppercase mb-4">
                        Period
                       </label>
                       <select
                          value={periodFilter}
                          onChange={e => setPeriodFilter(e.target.value)}
                          className="w-full p-2 text-sm bg-white border border-bdr rounded outline-none"
                       >
                          <option value="all">All Periods</option>
                          {PERIOD_FILTERS.map(period => <option key={period} value={period}>{period}</option>)}
                       </select>
                  </div>

                  <div className="w-full lg:w-48">
                      <label className="block text-[11px] font-bold text-muted uppercase mb-4">
                        Genre
                       </label>
                       <select
                          value={genreFilter}
                          onChange={e => setGenreFilter(e.target.value)}
                          className="w-full p-2 text-sm bg-white border border-bdr rounded outline-none"
                       >
                          <option value="all">All Genres</option>
                          {GENRE_FILTERS.map(genre => <option key={genre} value={genre}>{genre}</option>)}
                       </select>
                  </div>

                  <div className="w-full lg:w-48">
                      <label className="block text-[11px] font-bold text-muted uppercase mb-4">
                        Corpus Type
                       </label>
                       <select
                          value={corpusTypeFilter}
                          onChange={e => setCorpusTypeFilter(e.target.value)}
                          className="w-full p-2 text-sm bg-white border border-bdr rounded outline-none"
                       >
                          <option value="all">All Types</option>
                          {CORPUS_TYPE_FILTERS.map(type => <option key={type} value={type}>{type}</option>)}
                       </select>
                  </div>
                  <div className="h-8 bg-parch3 rounded w-1/3 ml-auto"></div>
               </div>
            ))}
        </div>
      ) : sortedTexts.length === 0 ? (
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
             Import New Lesson
          </button>
        </div>
      ) : (
        <div className="space-y-12 pb-20">
           {Object.entries(collections).map(([collectionName, colTexts]) => (
              <div key={collectionName} className="scroll-mt-8">
                 <h3 className="font-serif text-[22px] font-bold text-ink flex items-center gap-3 mb-6">
                    {collectionName === "Your Imports" && <BookOpen className="w-5 h-5 text-blue" />}
                    {collectionName}
                    <span className="text-sm font-sans font-normal text-muted bg-parch3 px-2 py-0.5 rounded-full">{colTexts.length}</span>
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {colTexts.map((text, i) => (
                      <motion.div
                        key={text.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.3 }}
                        onClick={() => navigate(`/app/reader/${text.id}`)}
                        className={cn(
                          "card p-6 flex flex-col justify-between cursor-pointer group hover:border-blue/30 transition-all min-h-[250px] relative overflow-hidden",
                          text.sourceType === 'import' && "border-blue/10 bg-blue/[0.01]",
                        )}
                      >
                        {text.percentKnown !== undefined && text.percentKnown >= 90 && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gold/10 rounded-bl-full flex justify-end items-start p-3">
                               <Crown className="w-4 h-4 text-gold opacity-50" />
                            </div>
                        )}
                        <div>
                           <div className="flex justify-between items-start mb-2 pr-8">
                             <h4 className="text-[18px] font-serif font-medium text-ink leading-snug">
                               {text.title}
                             </h4>
                          </div>
          
                          <div className="flex items-center gap-2 mb-4">
                             <div className="text-[10px] text-ink3 font-sans uppercase tracking-[0.1em] font-bold">
                                {text.author}
                             </div>
                             <span className="opacity-30 text-[10px]">•</span>
                             <span className="text-[10px] text-blue font-sans uppercase tracking-widest font-bold">
                                 {LANGUAGE_LABELS[text.language] || text.language}
                               </span>
                           </div>

                           <div className="grid grid-cols-2 gap-2 mb-5 text-[11px] text-ink3">
                             <div className="flex items-center gap-1.5 min-w-0">
                               <CalendarDays className="w-3.5 h-3.5 text-muted shrink-0" />
                               <span className="truncate">{text.date || text.period || "Date unknown"}</span>
                             </div>
                             <div className="flex items-center gap-1.5 min-w-0">
                               <FileText className="w-3.5 h-3.5 text-muted shrink-0" />
                               <span className="truncate">{text.genre || "Text"}</span>
                             </div>
                             <div className="flex items-center gap-1.5 min-w-0">
                               <LibraryIcon className="w-3.5 h-3.5 text-muted shrink-0" />
                               <span className="truncate capitalize">{text.corpusType || "other"}</span>
                             </div>
                             <div className="flex items-center gap-1.5 min-w-0">
                               <ShieldCheck className="w-3.5 h-3.5 text-muted shrink-0" />
                               <span className="truncate">{text.licenseName || "License unknown"}</span>
                             </div>
                           </div>

                           <div className="flex flex-wrap gap-1.5 mb-5">
                             {[
                               { key: 'morphology', label: 'Morphology', icon: Languages, active: text.availableTools.morphology },
                               { key: 'translation', label: 'Translation', icon: BookOpen, active: text.availableTools.translation },
                               { key: 'audio', label: 'Audio', icon: Volume2, active: text.availableTools.audio },
                               { key: 'syntax', label: 'Syntax', icon: GitBranch, active: text.availableTools.syntax },
                             ].map(tool => {
                               const ToolIcon = tool.icon;
                               return (
                                 <span
                                   key={tool.key}
                                   className={cn(
                                    "inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider",
                                    tool.active ? "bg-blue/5 text-blue border-blue/20" : "bg-white text-muted border-bdr/40 opacity-60"
                                   )}
                                 >
                                   <ToolIcon className="w-3 h-3" />
                                   {tool.label}
                                 </span>
                               );
                             })}
                           </div>

                           {text.sectionsPreview && text.sectionsPreview.length > 0 && (
                             <div className="mb-5">
                               <div className="text-[9px] uppercase font-bold tracking-widest text-muted mb-2">Open Section</div>
                               <div className="flex flex-wrap gap-1.5">
                                 {text.sectionsPreview.slice(0, 4).map(section => (
                                   <button
                                     key={section.id}
                                     onClick={(event) => {
                                       event.stopPropagation();
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
          
                          {/* Knowledge bars at a glance */}
                          <div className="flex h-1 gap-0.5 mb-6 opacity-40 group-hover:opacity-100 transition-opacity">
                            <div
                              className="bg-blue h-full"
                              style={{ width: `${Math.max(text.percentKnown || 0, 1)}%` }}
                            />
                            <div
                              className="bg-amber h-full"
                              style={{ width: `${Math.max(text.percentLearning || 0, 1)}%` }}
                            />
                            <div className="flex-1 bg-parch3 h-full" />
                          </div>
          
                          {/* Stats & Progress Bars */}
                          <div className="space-y-4 mb-6">
                            <div className="flex items-center justify-between text-[11.5px] font-bold">
                              <span className="text-zinc-500 uppercase tracking-tight flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                {text.totalWords} wds • ~{Math.ceil(text.totalWords / 150)} min
                              </span>
                              <span className="text-blue">
                                {text.percentKnown}% Known
                              </span>
                            </div>
                            <div className="flex gap-4">
                              <div className="flex flex-col">
                                <span className="text-[15px] font-bold text-ink leading-none">
                                  {text.percentKnown}%
                                </span>
                                <span className="text-[8.5px] uppercase font-bold text-muted tracking-widest mt-1">
                                  {t("vocab.known", "Known")}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[15px] font-bold text-amber leading-none">
                                  {text.percentLearning}%
                                </span>
                                <span className="text-[8.5px] uppercase font-bold text-muted tracking-widest mt-1">
                                  {t("vocab.learning", "Learning")}
                                </span>
                              </div>
                              <div className="flex flex-col ml-auto text-right">
                                <span className="text-[15px] font-bold text-red-400 leading-none">
                                  {text.percentKnown !== undefined ? (100 - text.percentKnown - (text.percentLearning || 0)) : 0}%
                                </span>
                                <span className="text-[8.5px] uppercase font-bold text-muted tracking-widest mt-1">
                                  New
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
          
                        <div className="flex items-end justify-between pt-4 mt-auto border-t border-dashed border-bdr/40">
                          <span className={cn(
                             "text-[10px] uppercase font-bold tracking-widest flex items-center gap-1",
                             text.sourceType === 'import' ? "text-purple-600/60" : "text-emerald-600/60"
                          )}>
                            {text.sourceType === 'import' && <BookOpen className="w-3 h-3" />}
                            {text.sourceType === 'import' ? "Private Import" : "Curated Library"}
                          </span>
                          <span
                            className={cn(
                              "pill text-[10px] px-2 py-0.5",
                              getCefrClass(text.level),
                            )}
                          >
                            {text.level}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                 </div>
              </div>
           ))}
        </div>
      )}
    </div>
  );
};
