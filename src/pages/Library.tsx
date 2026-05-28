import { useState, useMemo, useEffect, useLayoutEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Library as LibraryIcon,
  Play,
  Filter,
  Clock,
  BookOpen,
  ChevronDown,
  CalendarDays,
  FileText,
  GitBranch,
  Languages,
  ShieldCheck,
  Volume2,
  Globe,
  Share2,
  Lock,
  GitFork,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKnowledge } from '../lib/hooks/useKnowledge.js';
import { computeRecommendations } from '../lib/services/recommendationService.js';
import { RecommendationRail } from '../components/library/RecommendationRail.js';
import { useTranslation } from 'react-i18next';
import { LANGUAGES, getLanguageDisplayName } from '../lib/constants/languages.js';
import { LibraryService, LibraryText } from '../lib/services/libraryService.js';
import { useAuth } from '../lib/hooks/useAuth.js';
import { useActiveLanguage } from '../lib/hooks/useActiveLanguage.js';
import { EmptyState } from '../components/ui/index.js';
import { useSubscription } from '../lib/contexts/SubscriptionContext.js';
import { ImportService } from '../lib/services/importService.js';
import { CorpusDB } from '../data/corpus.js';
import { CoverageBadge } from '../components/library/CoverageBadge.js';
import { TextQualityBadge } from '../components/ui/TextQualityBadge.js';

type SortOption = 'comprehensible' | 'newest' | 'shortest' | 'hardest' | 'unknown';

const CORPUS_TYPE_FILTERS = [
  'biblical',
  'classical',
  'patristic',
  'inscription',
  'vocabulary',
  'other',
];

function LanguageCard({
  lang,
  isActive,
  isLocked,
  textCount,
  importCount,
  knownWords,
  onClick,
}: {
  lang: {
    id: string;
    name: string;
    shortName: string;
    icon: string;
    symbol: string;
    corpusStatus: string;
  };
  isActive: boolean;
  isLocked?: boolean;
  textCount: number;
  importCount: number;
  knownWords: number;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      onClick={onClick}
      className={cn(
        'card p-5 flex flex-col items-start text-left gap-2 transition-all border-2 min-w-[180px]',
        isLocked
          ? 'opacity-60 border-transparent cursor-pointer'
          : isActive
            ? 'border-blue bg-blue/[0.03] hover:shadow-md active:scale-[0.98]'
            : 'border-transparent hover:shadow-md active:scale-[0.98]'
      )}
    >
      <div className="flex items-center gap-3 w-full">
        <span className="text-2xl w-9 text-center">{lang.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-bold font-serif text-ink truncate">{lang.shortName}</div>
          <div className="text-[10px] text-muted uppercase tracking-wider font-bold truncate">
            {lang.name}
          </div>
        </div>
        {isActive && <span className="w-2.5 h-2.5 rounded-full bg-blue shrink-0" />}
        {isLocked && <Lock className="w-3.5 h-3.5 text-muted shrink-0" />}
      </div>
      <div className="flex gap-3 text-[11px] text-ink3 font-medium mt-1">
        <span>{textCount} texts</span>
        {importCount > 0 && <span>{importCount} imported</span>}
        <span>{knownWords} known</span>
      </div>
      <div
        className={cn(
          'text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full',
          isLocked
            ? 'bg-parch3 text-muted'
            : lang.corpusStatus === 'available'
              ? 'bg-emerald-50 text-emerald-700'
              : lang.corpusStatus === 'partial'
                ? 'bg-blue/10 text-blue'
                : 'bg-amber/10 text-amber'
        )}
      >
        {isLocked
          ? t('language.statusLocked', 'Locked')
          : lang.corpusStatus === 'available'
            ? t('language.statusAvailable', 'Available')
            : lang.corpusStatus === 'partial'
              ? t('language.statusInProgress', 'In Progress')
              : t('language.statusSample', 'Sample')}
      </div>
    </button>
  );
}

const SOURCE_MAP: Record<string, 'corpus' | 'import' | 'public'> = {
  library: 'corpus',
  imports: 'import',
  public: 'public',
};

export const Library = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeLanguageId, setActiveLanguageId } = useActiveLanguage();
  const { canAccessLanguage } = useSubscription();
  const { getWordInfo, getAllProgress, knowledge } = useKnowledge(activeLanguageId);
  // Stable ref so the fetch effect doesn't re-run when word states change
  const getWordInfoRef = useRef(getWordInfo);
  useLayoutEffect(() => {
    getWordInfoRef.current = getWordInfo;
  });
  const { t } = useTranslation();

  // ── Phase A state: raw texts (refetch only on tab / auth change) ─────
  const [rawTexts, setRawTexts] = useState<LibraryText[]>([]);
  const [readingProgress, setReadingProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Sorting state
  const [activeLang, setActiveLang] = useState(
    () => LANGUAGES.find((l) => l.id === activeLanguageId)?.name || 'All'
  );

  // Sync active language with filter when changed externally
  const prevLangRef = useRef(activeLanguageId);
  useLayoutEffect(() => {
    if (prevLangRef.current !== activeLanguageId) {
      prevLangRef.current = activeLanguageId;
      const langName = LANGUAGES.find((l) => l.id === activeLanguageId)?.name || 'All';
      setActiveLang(langName);
    }
  }, [activeLanguageId]);
  const [searchQuery, setSearchQuery] = useState('');
  const [minKnown, setMinKnown] = useState(0);
  const [activeSort, setActiveSort] = useState<SortOption>('comprehensible');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [genreFilter, setGenreFilter] = useState('all');
  const [corpusTypeFilter, setCorpusTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState<
    'all' | 'beginner' | 'accessible' | 'challenging' | 'advanced'
  >('all');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'library' | 'imports' | 'public'>('library');
  const [sharingId, setSharingId] = useState<string | null>(null);

  useEffect(() => {
    getAllProgress().then(setReadingProgress);
  }, [getAllProgress]);

  // Phase A: fetch raw texts only when tab or user changes (no coverage work here)
  useEffect(() => {
    let active = true;
    setIsLoading(true); // eslint-disable-line react-hooks/set-state-in-effect
    LibraryService.getRawTexts(user?.uid || null, SOURCE_MAP[activeTab]).then((data) => {
      if (active) {
        setRawTexts(data);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [user?.uid, activeTab]);

  // Phase B: compute coverage — only reruns when vocabulary or raw texts change,
  // NOT on every filter keystroke. getWordInfo is stable (Fix 3); knowledge is
  // the dep that signals when word states have changed.
  const coverageMap = useMemo(
    () => LibraryService.computeCoverage(rawTexts, getWordInfo),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawTexts, knowledge]
  );

  // Merge coverage into raw texts once per knowledge/rawTexts change
  const textsWithCoverage = useMemo(
    () => rawTexts.map((tx) => ({ ...tx, ...coverageMap.get(tx.id) })),
    [rawTexts, coverageMap]
  );

  // Derive available filter values from actual text metadata
  const availablePeriods = useMemo(() => {
    const set = new Set<string>();
    textsWithCoverage.forEach((t) => { if (t.period) set.add(t.period); });
    return Array.from(set).sort();
  }, [textsWithCoverage]);

  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    textsWithCoverage.forEach((t) => { if (t.genre) set.add(t.genre); });
    return Array.from(set).sort();
  }, [textsWithCoverage]);

  // Phase C: filter — pure sync O(texts), no debounce needed
  const filteredTexts = useMemo(() => {
    let result = textsWithCoverage;

    if (activeLang !== 'All') {
      const code = LANGUAGES.find((l) => l.name === activeLang)?.id || activeLang;
      result = result.filter((t) => t.language === code);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((t) => t._searchText?.includes(q));
    }
    if (periodFilter !== 'all') result = result.filter((t) => t.period === periodFilter);
    if (genreFilter !== 'all') result = result.filter((t) => t.genre === genreFilter);
    if (corpusTypeFilter !== 'all')
      result = result.filter((t) => t.corpusType === corpusTypeFilter);
    if (minKnown > 0) result = result.filter((t) => (t.percentKnown || 0) >= minKnown);

    return result;
  }, [
    textsWithCoverage,
    activeLang,
    searchQuery,
    periodFilter,
    genreFilter,
    corpusTypeFilter,
    minKnown,
  ]);

  // ── Language card data ───────────────────────────────────────────────
  const corpusTexts = useMemo(() => CorpusDB.getTexts(), []);
  const langStats = useMemo(() => {
    return LANGUAGES.map((lang) => {
      const langCorpus = corpusTexts.filter((t) => t.language === lang.id);
      const langImports = rawTexts.filter(
        (t) => t.language === lang.id && t.sourceType === 'import'
      );
      const knownInLang = Object.entries(knowledge).filter(([, info]: any) => {
        return info.languageId === lang.id && (info.state === 'KNOWN' || info.state === 3);
      }).length;
      return {
        lang,
        textCount: langCorpus.length,
        importCount: langImports.length,
        knownWords: knownInLang,
      };
    });
  }, [rawTexts, corpusTexts, knowledge]);

  const mainFilters = [{ name: 'All', id: 'all', icon: '📚' }, ...LANGUAGES];

  const sortedTexts = useMemo(() => {
    let copy = [...filteredTexts];
    if (difficultyFilter !== 'all') {
      copy = copy.filter((t) => t.difficultyTier === difficultyFilter);
    }
    switch (activeSort) {
      case 'comprehensible':
        return copy.sort((a, b) => (b.percentKnown || 0) - (a.percentKnown || 0));
      case 'hardest':
        return copy.sort((a, b) => (a.percentKnown || 0) - (b.percentKnown || 0));
      case 'newest':
        return copy.sort(
          (a, b) => new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime()
        );
      case 'shortest':
        return copy.sort((a, b) => a.totalWords - b.totalWords);
      case 'unknown':
        return copy.sort((a, b) => {
          const aU =
            a.totalWords -
            ((a.percentKnown || 0) / 100) * a.totalWords -
            ((a.percentLearning || 0) / 100) * a.totalWords;
          const bU =
            b.totalWords -
            ((b.percentKnown || 0) / 100) * b.totalWords -
            ((b.percentLearning || 0) / 100) * b.totalWords;
          return bU - aU;
        });
      default:
        return copy;
    }
  }, [filteredTexts, activeSort, difficultyFilter]);

  const recentTexts = useMemo(() => {
    if (readingProgress.length === 0) return [];
    return readingProgress
      .map((p) => {
        const tx = textsWithCoverage.find((t) => t.id === p.textId);
        return tx ? { ...tx, lastPosition: p.lastPosition || 0 } : null;
      })
      .filter(Boolean)
      .slice(0, 4);
  }, [readingProgress, textsWithCoverage]);

  const recentGenres = useMemo(() => {
    const genres: string[] = [];
    for (const p of readingProgress.slice(0, 5)) {
      const tx = textsWithCoverage.find((t) => t.id === p.textId);
      if (tx?.genre) genres.push(tx.genre);
    }
    return genres;
  }, [readingProgress, textsWithCoverage]);

  const recommendations = useMemo(
    () =>
      computeRecommendations(textsWithCoverage, knowledge, {
        activeLanguageId,
        readingProgress,
        recentGenres,
      }),
    [textsWithCoverage, knowledge, activeLanguageId, readingProgress, recentGenres]
  );

  const getCefrClass = (level: string) => {
    if (level?.startsWith('A')) return 'cefr-a';
    if (level?.startsWith('B')) return 'cefr-b';
    return 'cefr-c';
  };

  const collections = useMemo(() => {
    const map: Record<string, LibraryText[]> = {};
    sortedTexts.forEach((t) => {
      let name = 'Other';
      if (t.sourceType === 'import') name = 'Your Texts';
      else if (t.corpusTitle) name = t.corpusTitle;
      else if (t.language === 'grc-koine' || t.language === 'grc') name = 'Greek Texts';
      else if (t.language === 'hbo') name = 'Hebrew Bible';
      else if (t.language === 'lat') name = 'Latin Library';
      if (!map[name]) map[name] = [];
      map[name].push(t);
    });
    return map;
  }, [sortedTexts]);

  const handleShare = async (textId: string) => {
    if (!user?.uid) return;
    setSharingId(textId);
    try {
      await ImportService.sharePublic(user.uid, textId);
      setRawTexts((prev) =>
        prev.map((t) =>
          t.id === textId ? { ...t, isPublic: true, sourceType: 'public' as const } : t
        )
      );
    } catch (e) {
      console.error('Error sharing:', e);
    }
    setSharingId(null);
  };
  const handleUnshare = async (textId: string) => {
    if (!user?.uid) return;
    setSharingId(textId);
    try {
      await ImportService.unsharePublic(user.uid, textId);
      setRawTexts((prev) =>
        prev.map((t) =>
          t.id === textId ? { ...t, isPublic: false, sourceType: 'import' as const } : t
        )
      );
    } catch (e) {
      console.error('Error unsharing:', e);
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
      console.error('Error forking:', e);
    }
    setSharingId(null);
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto font-sans min-h-screen">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">
            {t('library.title', 'Library')}
          </h2>
          <p className="font-body text-[15px] italic text-ink2">
            {t(
              'library.chooseLanguage',
              'Choose a language to explore, or browse all texts below.'
            )}
          </p>
        </div>
      </header>

      <Link
        to="/app/beginner-hub"
        className="flex items-center gap-3 mb-8 p-4 bg-gradient-to-r from-blue/5 to-purple/5 rounded-xl border border-blue/20 hover:border-blue/40 transition-colors group"
      >
        <Sparkles className="w-6 h-6 text-blue shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-ink">
            {t('library.beginnerHub', 'Beginner Hub')}
          </div>
          <div className="text-xs text-muted truncate">
            {t('library.beginnerHubDesc', 'Start here — beginner texts and script-learning tools for all languages')}
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted group-hover:text-blue transition-colors shrink-0" />
      </Link>

      {/* ── Language Cards ───────────────────────────────────────────── */}
      <div className="mb-10">
        <h3 className="eyebrow mb-4 opacity-50">{t('library.yourLanguages', 'Your Languages')}</h3>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {langStats.map(({ lang, textCount, importCount, knownWords }) => {
            const isLocked = !canAccessLanguage(lang.id);
            return (
              <LanguageCard
                key={lang.id}
                lang={lang}
                isActive={lang.id === activeLanguageId}
                isLocked={isLocked}
                textCount={textCount}
                importCount={importCount}
                knownWords={knownWords}
                onClick={() => {
                  if (isLocked) {
                    navigate('/app/subscription');
                    return;
                  }
                  setActiveLanguageId(lang.id);
                  navigate(`/app/language/${lang.id}`);
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ── Continue Reading ─────────────────────────────────────────── */}
      {recentTexts.length > 0 && (
        <div className="mb-10">
          <h3 className="eyebrow mb-4 opacity-50">
            {t('dashboard.continueReading', 'Continue Reading')}
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {recentTexts.map((text: any, i) => (
              <div
                key={i}
                onClick={() => navigate(`/app/reader/${text.id}`)}
                className="min-w-[300px] card bg-parch2/30 border-bdr/40 p-5 flex items-center justify-between group cursor-pointer hover:border-blue/30 hover:shadow-md transition-all"
              >
                <div className="max-w-[180px]">
                  <div className="text-[16px] font-serif font-bold text-ink truncate mb-1">
                    {text.title}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-muted tracking-widest">
                    {text.author || t('library.authorUnknown', 'Unknown')}
                  </div>
                  <div className="mt-3 h-1.5 w-full bg-parch3 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gold transition-all"
                      style={{ width: `${Math.max(text.lastPosition || 0, 2)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted mt-1 font-bold">
                    {Math.round(text.lastPosition || 0)}% {t('library.complete', 'Complete')}
                  </div>
                </div>
                <button className="w-10 h-10 bg-white border border-bdr rounded-full flex items-center justify-center text-blue shadow-sm group-hover:bg-blue group-hover:text-white transition-all">
                  <Play className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recommended for You ─────────────────────────────────────── */}
      <RecommendationRail texts={recommendations} />

      {/* ── Tab Navigation ───────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab('imports')}
          className={cn(
            'px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all',
            activeTab === 'imports'
              ? 'bg-blue text-white shadow-md'
              : 'bg-white text-ink3 border border-bdr/40 hover:bg-parch'
          )}
        >
          <BookOpen className="w-4 h-4" /> {t('library.yourTexts', 'Your Texts')}
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={cn(
            'px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all',
            activeTab === 'library'
              ? 'bg-ink text-parch shadow-md'
              : 'bg-white text-ink3 border border-bdr/40 hover:bg-parch'
          )}
        >
          <LibraryIcon className="w-4 h-4" /> {t('library.curated', 'Curated Library')}
        </button>
        <button
          onClick={() => setActiveTab('public')}
          className={cn(
            'px-4 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all',
            activeTab === 'public'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white text-ink3 border border-bdr/40 hover:bg-parch'
          )}
        >
          <Globe className="w-4 h-4" /> {t('library.public', 'Public Library')}
        </button>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div className="mb-10 card p-6 bg-parch2/10 border-bdr/30 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder={t(
                'library.searchPlaceholder',
                'Search texts, corpora, authors, genres...'
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-bdr rounded-[12px] text-[14px] font-sans focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all shadow-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2 flex-1">
            {mainFilters.slice(0, 5).map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveLang(f.name)}
                className={cn(
                  'px-4 py-2 rounded-full text-[12px] font-medium font-sans transition-all duration-150 border flex items-center gap-1.5 active:scale-95',
                  activeLang === f.name
                    ? 'bg-blue text-white shadow-md border-blue'
                    : 'bg-white text-ink3 border-bdr/60 hover:bg-parch hover:border-blue/30'
                )}
              >
                <span>{f.icon}</span>
                <span className="hidden sm:inline">{f.name}</span>
              </button>
            ))}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'px-4 py-2 rounded-full text-[12px] font-bold font-sans flex items-center gap-1.5 transition-all outline-none border',
                showFilters
                  ? 'bg-parch3 border-bdr text-ink'
                  : 'bg-white border-bdr/60 text-ink3 hover:bg-parch'
              )}
            >
              <Filter className="w-3.5 h-3.5" /> {t('library.filters', 'Filters')}{' '}
              <ChevronDown
                className={cn('w-3.5 h-3.5 transition-transform', showFilters && 'rotate-180')}
              />
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
                    {t('library.comprehensibility', 'Comprehensibility')}
                  </label>
                  <span className="text-[11px] font-bold text-blue bg-blue/10 px-2 py-0.5 rounded-full">
                    {minKnown}%+ {t('library.known', 'Known')}
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
                  <span>{t('library.anyPercent', 'Any %')}</span>
                  <span>{t('library.nearlyAll', 'Nearly All')}</span>
                </div>
              </div>
              <div className="w-full lg:w-44">
                <label className="block text-[11px] font-bold text-muted uppercase mb-4">
                  {t('library.sortBy', 'Sort By')}
                </label>
                <select
                  value={activeSort}
                  onChange={(e) => setActiveSort(e.target.value as SortOption)}
                  className="w-full p-2 text-sm bg-white border border-bdr rounded outline-none"
                >
                  <option value="comprehensible">
                    {t('library.sortComprehensible', 'Most Comprehensible')}
                  </option>
                  <option value="newest">{t('library.sortNewest', 'Newest Added')}</option>
                  <option value="shortest">{t('library.sortShortest', 'Shortest Length')}</option>
                  <option value="hardest">{t('library.sortHardest', 'Hardest')}</option>
                  <option value="unknown">{t('library.sortUnknown', 'Most Unknown Words')}</option>
                </select>
              </div>
              <div className="w-full lg:w-44">
                <label className="block text-[11px] font-bold text-muted uppercase mb-4">
                  {t('library.period', 'Period')}
                </label>
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value)}
                  className="w-full p-2 text-sm bg-white border border-bdr rounded outline-none"
                >
                  <option value="all">{t('library.allPeriods', 'All Periods')}</option>
                  {availablePeriods.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full lg:w-44">
                <label className="block text-[11px] font-bold text-muted uppercase mb-4">
                  {t('library.genre', 'Genre')}
                </label>
                <select
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="w-full p-2 text-sm bg-white border border-bdr rounded outline-none"
                >
                  <option value="all">{t('library.allGenres', 'All Genres')}</option>
                  {availableGenres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full lg:w-44">
                <label className="block text-[11px] font-bold text-muted uppercase mb-4">
                  {t('library.corpusType', 'Corpus Type')}
                </label>
                <select
                  value={corpusTypeFilter}
                  onChange={(e) => setCorpusTypeFilter(e.target.value)}
                  className="w-full p-2 text-sm bg-white border border-bdr rounded outline-none"
                >
                  <option value="all">{t('library.allTypes', 'All Types')}</option>
                  {CORPUS_TYPE_FILTERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full">
                <label className="block text-[11px] font-bold text-muted uppercase mb-4">
                  {t('library.difficulty', 'Difficulty')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    {
                      id: 'all' as const,
                      label: t('library.allLevels', 'All Levels'),
                      active: 'bg-ink text-parch border-ink',
                      inactive: 'bg-white text-ink3 border-bdr/60',
                    },
                    {
                      id: 'beginner' as const,
                      label: t('library.comfortable', 'Comfortable'),
                      active: 'bg-ink3/20 text-ink3 border-ink3/30',
                      inactive: 'bg-white text-ink3 border-bdr/60',
                    },
                    {
                      id: 'accessible' as const,
                      label: t('library.optimal', 'Optimal'),
                      active: 'bg-green-100 text-green-700 border-green-300',
                      inactive: 'bg-white text-ink3 border-bdr/60',
                    },
                    {
                      id: 'challenging' as const,
                      label: t('library.developing', 'Developing'),
                      active: 'bg-amber/20 text-amber border-amber/30',
                      inactive: 'bg-white text-ink3 border-bdr/60',
                    },
                    {
                      id: 'advanced' as const,
                      label: t('library.challenging', 'Challenging'),
                      active: 'bg-ruby/15 text-ruby border-ruby/25',
                      inactive: 'bg-white text-ink3 border-bdr/60',
                    },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setDifficultyFilter(d.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all',
                        difficultyFilter === d.id ? d.active : d.inactive
                      )}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 pb-20">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-4 md:p-6 min-h-[180px] md:min-h-[240px] animate-pulse">
              <div className="h-6 bg-parch3 rounded w-3/4 mb-3" />
              <div className="h-4 bg-parch3 rounded w-1/2 mb-6" />
              <div className="flex gap-1.5 mb-4">
                <div className="h-5 bg-parch3 rounded-full w-16" />
                <div className="h-5 bg-parch3 rounded-full w-20" />
              </div>
              <div className="h-2 bg-parch3 rounded w-full mb-2" />
              <div className="flex justify-between">
                <div className="h-4 bg-parch3 rounded w-24" />
                <div className="h-6 bg-parch3 rounded-full w-8" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedTexts.length === 0 ? (
        <EmptyState
          icon={<LibraryIcon className="w-12 h-12" />}
          heading={t('library.shelfEmpty', 'Shelf Empty')}
          description={t(
            'library.noTextsFound',
            'No texts found for this language. Import a text or try adjusting your filters.'
          )}
          action={
            <button
              onClick={() => navigate('/app/import')}
              className="px-6 py-2.5 bg-ink text-white font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-md"
            >
              {t('import.title', 'Import New Lesson')}
            </button>
          }
        />
      ) : (
        <div className="space-y-12 pb-20">
          {Object.entries(collections).map(([name, colTexts]) => (
            <div key={name} className="scroll-mt-8">
              <h3 className="font-serif text-[22px] font-bold text-ink flex items-center gap-3 mb-6">
                {name === 'Your Texts' && <BookOpen className="w-5 h-5 text-blue" />}
                {name}
                <span className="text-sm font-sans font-normal text-muted bg-parch3 px-2 py-0.5 rounded-full">
                  {colTexts.length}
                </span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {colTexts.map((text, i) => (
                  <motion.div
                    key={text.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.3 }}
                    onClick={() => navigate(`/app/reader/${text.id}`)}
                    data-testid="text-card"
                    className={cn(
                      'card p-4 md:p-6 flex flex-col justify-between cursor-pointer group hover:border-blue/30 transition-all min-h-[200px] md:min-h-[250px] relative overflow-hidden active:scale-[0.98]',
                      text.sourceType === 'import' && 'border-blue/10 bg-blue/[0.01]'
                    )}
                  >
                    <div>
                      <h4 className="text-[15px] md:text-[18px] font-serif font-medium text-ink leading-snug mb-1 line-clamp-2">
                        {text.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mb-3 md:mb-4 flex-wrap">
                        <span className="text-[9px] md:text-[10px] text-ink3 uppercase tracking-[0.1em] font-bold truncate max-w-[80px]">
                          {text.author}
                        </span>
                        <span className="opacity-30 text-[10px]">•</span>
                        <span className="text-[9px] md:text-[10px] text-blue uppercase tracking-widest font-bold">
                          {getLanguageDisplayName(text.language)}
                        </span>
                      </div>
                      <div className="hidden md:grid grid-cols-2 gap-2 mb-5 text-[11px] text-ink3">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-muted shrink-0" />
                          <span className="truncate">
                            {text.date || text.period || t('library.dateUnknown', 'Date unknown')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-muted shrink-0" />
                          <span className="truncate">
                            {text.genre || t('library.defaultGenre', 'Text')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <LibraryIcon className="w-3.5 h-3.5 text-muted shrink-0" />
                          <span className="truncate capitalize">
                            {text.corpusType || t('library.defaultCorpusType', 'other')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-muted shrink-0" />
                          <span className="truncate">
                            {text.licenseName || t('library.licenseUnknown', 'License unknown')}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3 md:mb-5">
                        {text.percentKnown !== undefined && (
                          <CoverageBadge percent={text.percentKnown} size="sm" />
                        )}
                        <TextQualityBadge
                          text={{
                            isComplete: text.sourceStatus === 'complete',
                            hasMorphology: text.availableTools.morphology,
                            sourceStatus: text.sourceStatus,
                            isSample: text.isSample,
                            analysisStatus: text.analysisStatus,
                          }}
                          sourceType={text.sourceType === 'import' ? 'paste' : undefined}
                        />
                        <span className="hidden md:contents">
                          {[
                            {
                              key: 'morphology' as const,
                              label: t('library.toolMorphology', 'Morphology'),
                              icon: Languages,
                              active: text.availableTools.morphology,
                            },
                            {
                              key: 'translation' as const,
                              label: t('library.toolTranslation', 'Translation'),
                              icon: BookOpen,
                              active: text.availableTools.translation,
                            },
                            {
                              key: 'audio' as const,
                              label: t('library.toolAudio', 'Audio'),
                              icon: Volume2,
                              active: text.availableTools.audio,
                            },
                            {
                              key: 'syntax' as const,
                              label: t('library.toolSyntax', 'Syntax'),
                              icon: GitBranch,
                              active: text.availableTools.syntax,
                            },
                          ].map((tool) => (
                            <span
                              key={tool.key}
                              className={cn(
                                'inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[9px] font-bold uppercase tracking-wider',
                                tool.active
                                  ? 'bg-blue/5 text-blue border-blue/20'
                                  : 'bg-white text-muted border-bdr/40 opacity-60'
                              )}
                            >
                              <tool.icon className="w-3 h-3" /> {tool.label}
                            </span>
                          ))}
                        </span>
                      </div>
                      <div className="flex h-1 gap-0.5 mb-3 md:mb-6 opacity-40 group-hover:opacity-100 transition-opacity">
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
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center justify-between text-[11.5px] font-bold">
                          <span className="text-zinc-500 uppercase tracking-tight flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {t('library.wordCountEstimate', '{{count}} wds ~{{minutes}} min', {
                              count: text.totalWords,
                              minutes: Math.ceil(text.totalWords / 150),
                            })}
                          </span>
                          <span className="text-blue">
                            {t('library.percentKnown', '{{percent}}% Known', {
                              percent: text.percentKnown,
                            })}
                          </span>
                        </div>
                        <div className="flex gap-4">
                          <div className="flex flex-col">
                            <span className="text-[15px] font-bold text-ink leading-none">
                              {text.percentKnown}%
                            </span>
                            <span className="text-[8.5px] uppercase font-bold text-muted tracking-widest mt-1">
                              {t('vocab.known', 'Known')}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[15px] font-bold text-amber leading-none">
                              {text.percentLearning}%
                            </span>
                            <span className="text-[8.5px] uppercase font-bold text-muted tracking-widest mt-1">
                              {t('vocab.learning', 'Learning')}
                            </span>
                          </div>
                          <div className="flex flex-col ml-auto text-right">
                            <span className="text-[15px] font-bold text-red-400 leading-none">
                              {text.percentKnown !== undefined
                                ? 100 - text.percentKnown - (text.percentLearning || 0)
                                : 0}
                              %
                            </span>
                            <span className="text-[8.5px] uppercase font-bold text-muted tracking-widest mt-1">
                              {t('vocab.new', 'New')}
                            </span>
                          </div>
                        </div>

                        {/* Sections quick-open */}
                        {text.sectionsPreview && text.sectionsPreview.length > 0 && (
                          <div className="mt-2">
                            <div className="text-[9px] uppercase font-bold tracking-widest text-muted mb-2">
                              {t('library.openSection', 'Open Section')}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {text.sectionsPreview.slice(0, 4).map((section) => (
                                <button
                                  key={section.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/app/reader/${text.id}?section=${encodeURIComponent(section.id)}`
                                    );
                                  }}
                                  className="px-2 py-1 rounded-md bg-white border border-bdr/50 text-[10px] font-bold text-ink3 hover:text-blue hover:border-blue/30 transition-colors"
                                >
                                  {section.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-end justify-between pt-4 mt-auto border-t border-dashed border-bdr/40">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'text-[10px] uppercase font-bold tracking-widest flex items-center gap-1',
                            text.sourceType === 'import'
                              ? 'text-purple-600/60'
                              : text.sourceType === 'public'
                                ? 'text-emerald-600/60'
                                : 'text-emerald-600/60'
                          )}
                        >
                          {text.sourceType === 'import' && <BookOpen className="w-3 h-3" />}
                          {text.sourceType === 'public' && <Globe className="w-3 h-3" />}
                          {text.sourceType === 'import'
                            ? t('library.privateImport', 'Private Import')
                            : text.sourceType === 'public'
                              ? t('library.public', 'Public')
                              : t('library.curated', 'Curated Library')}
                        </span>
                        {text.sourceType === 'import' && user && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (text.isPublic) handleUnshare(text.id);
                              else handleShare(text.id);
                            }}
                            disabled={sharingId === text.id}
                            className={cn(
                              'text-[9px] uppercase font-bold tracking-widest flex items-center gap-1 px-2 py-0.5 rounded transition-colors',
                              text.isPublic
                                ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                                : 'text-blue bg-blue-50 hover:bg-blue-100'
                            )}
                          >
                            {text.isPublic ? (
                              <Lock className="w-3 h-3" />
                            ) : (
                              <Share2 className="w-3 h-3" />
                            )}
                            {text.isPublic
                              ? t('library.unshare', 'Unshare')
                              : t('library.share', 'Share')}
                          </button>
                        )}
                        {text.sourceType === 'public' && user && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFork(text.id);
                            }}
                            disabled={sharingId === text.id}
                            className="text-[9px] uppercase font-bold tracking-widest flex items-center gap-1 px-2 py-0.5 rounded text-purple-600 bg-purple-50 hover:bg-purple-100 transition-colors"
                          >
                            <GitFork className="w-3 h-3" /> {t('library.fork', 'Fork')}
                          </button>
                        )}
                      </div>
                      <span
                        className={cn('pill text-[10px] px-2 py-0.5', getCefrClass(text.level))}
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
