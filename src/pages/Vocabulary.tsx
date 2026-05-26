import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Trash2,
  ExternalLink,
  History,
  TrendingUp,
  Brain,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Download,
  ArrowUpDown,
  Languages,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKnowledge } from '../lib/hooks/useKnowledge.js';
import { WordInfo } from '../lib/services/vocabularyService.js';
import { WordState, normalizeWordState, safeStateLabel } from '../lib/constants/wordStates.js';
import { getTokenInfo } from '../lib/data/dictionary.js';
import { useTranslation } from 'react-i18next';
import { getLanguageDisplayName } from '../lib/constants/languages.js';
import { apiFetch } from '../lib/services/apiFetch.js';
import { useToast } from '../lib/hooks/useToast.js';

const PAGE_SIZE = 50;

type SortKey = 'due' | 'alpha' | 'encounters' | 'added' | 'frequency';

const SORT_LABELS: Record<SortKey, string> = {
  due: 'Due date',
  alpha: 'Alphabetical',
  encounters: 'Most seen',
  added: 'Date added',
  frequency: 'Corpus frequency',
};

const RTL_LANGS = new Set(['hbo', 'Biblical Hebrew', 'arc', 'Aramaic', 'syr', 'Syriac', 'Hebrew', 'egy']);

function exportToCSV(
  words: {
    term: string;
    definition: string;
    translit: string;
    language: string;
    status: string;
    encounterCount: number;
    nextReview: string;
  }[],
  filename: string
) {
  const header = ['Term', 'Definition', 'Transliteration', 'Language', 'Status', 'Encounters', 'Next Review'];
  const rows = words.map((w) =>
    [w.term, w.definition, w.translit, w.language, w.status, String(w.encounterCount), w.nextReview ? new Date(w.nextReview).toLocaleDateString() : '']
      .map((v) => `"${v.replace(/"/g, '""')}"`)
      .join(',')
  );
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportToAnki(
  words: {
    term: string;
    definition: string;
    translit: string;
    language: string;
    status: string;
  }[],
  filename: string
) {
  // Anki tab-separated import format — import via File > Import in Anki desktop.
  // Each line: Front<TAB>Back. HTML is enabled so we can include transliteration.
  const header = ['#separator:tab', '#html:true', '#notetype:Basic', '#deck:Paleoglossa'];
  const rows = words
    .filter((w) => w.term && w.definition)
    .map((w) => {
      const front = w.translit
        ? `${w.term}<br><span style="font-size:0.85em;color:#888;">${w.translit}</span>`
        : w.term;
      const back = `${w.definition}<br><span style="font-size:0.8em;color:#aaa;">${w.language} · ${w.status}</span>`;
      return `${front}\t${back}`;
    });
  const content = [...header, ...rows].join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const STATE_CYCLE: WordState[] = [
  WordState.SEEN,
  WordState.LEARNING,
  WordState.FAMILIAR,
  WordState.KNOWN,
  WordState.IGNORED,
];

const STATE_CLASSES: Record<string, string> = {
  Known: 'cefr-c',
  Familiar: 'cefr-b',
  Learning: 'cefr-a',
  Seen: 'cefr-a opacity-50',
  Ignored: 'bg-ink3/10 text-ink3 border-ink3/20',
};

export const Vocabulary = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  // Debounce paywall toast so rapid cycling doesn't spam the user.
  const limitToastShown = useRef(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('due');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>('all');
  const [freqMap, setFreqMap] = useState<Record<string, number>>({});
  const { t } = useTranslation();

  // We read knowledge for all languages by passing undefined
  const { knowledge, setWordState, vocabLimit } = useKnowledge(undefined as any);

  const filters = ['All', 'Due', 'Known', 'Familiar', 'Learning', 'Seen', 'Ignored'];

  // Build full word list from all languages
  const allWords = useMemo(() => {
    return Object.entries(knowledge)
      .filter(([, info]) => {
        const state = normalizeWordState(typeof info === 'object' ? (info as any).state : info);
        return state !== WordState.NEW;
      })
      .map(([lemma, info]) => {
        const wordInfo = typeof info === 'object' ? (info as WordInfo) : ({ state: info } as unknown as WordInfo);
        const nextReview = wordInfo.srs?.nextReview ? new Date(wordInfo.srs.nextReview as any) : new Date();
        const tokenInfo = getTokenInfo(lemma);
        const definition = wordInfo.userGloss || tokenInfo?.gloss || '';
        const langId = wordInfo.languageId || tokenInfo?.language || '';
        const langDisplay = langId ? getLanguageDisplayName(langId) || langId : getLanguageDisplayName('grc') || 'Greek';

        return {
          id: lemma,
          term: lemma,
          definition,
          translit: tokenInfo?.transliteration || '',
          language: langDisplay,
          languageId: langId,
          status: safeStateLabel(wordInfo.state),
          rawState: wordInfo.state,
          nextReview: nextReview.toISOString(),
          isDue: nextReview <= new Date(),
          encounterCount: wordInfo.encounterCount ?? 0,
          lastSeenAt: wordInfo.lastSeenAt,
          addedAt: wordInfo.addedAt || new Date(0).toISOString(),
          frequencyRank: freqMap[lemma] ?? 0,
        };
      });
  }, [knowledge, freqMap]);

  // Derived language list from actual vocabulary
  const availableLanguages = useMemo(() => {
    const langCounts = new Map<string, { id: string; display: string; count: number }>();
    for (const w of allWords) {
      const key = w.languageId || w.language;
      const existing = langCounts.get(key);
      if (existing) existing.count++;
      else langCounts.set(key, { id: w.languageId || key, display: w.language, count: 1 });
    }
    return Array.from(langCounts.values()).sort((a, b) => b.count - a.count);
  }, [allWords]);

  // Fetch frequency index for the selected language
  useEffect(() => {
    let stale = false;
    const langId = selectedLang === 'all' ? (availableLanguages[0]?.id || 'grc') : selectedLang;
    apiFetch<{ entries: { lemma: string; frequency: number }[] }>(
      `/api/lemma-frequency/${encodeURIComponent(langId)}?limit=2000`,
      { skipAuth: true }
    )
      .then((data) => {
        if (stale) return;
        const map: Record<string, number> = {};
        // entries are sorted by frequency desc; index + 1 = frequency rank
        (data.entries ?? []).forEach((entry, i) => {
          map[entry.lemma] = i + 1;
        });
        setFreqMap(map);
      })
      .catch(() => {});
    return () => { stale = true; };
  }, [selectedLang, availableLanguages]);

  const handleDelete = (id: string) => setWordState(id, WordState.NEW);

  const handleCycleState = useCallback(
    (id: string, currentState: WordState, languageId?: string) => {
      const idx = STATE_CYCLE.indexOf(currentState);
      const nextState = STATE_CYCLE[(idx + 1) % STATE_CYCLE.length];
      const saved = setWordState(id, nextState, languageId ?? 'unknown');
      if (!saved && !limitToastShown.current) {
        limitToastShown.current = true;
        addToast(
          `You've reached the ${vocabLimit.limit}-word save limit for this language. Upgrade for unlimited saves.`,
          'info'
        );
        // Allow showing the toast again after a cooldown.
        setTimeout(() => {
          limitToastShown.current = false;
        }, 5000);
      }
    },
    [setWordState, addToast, vocabLimit.limit]
  );

  const filteredWords = useMemo(() => {
    return allWords
      .filter((w) => selectedLang === 'all' || w.languageId === selectedLang || w.language === selectedLang)
      .filter((w) => {
        if (activeFilter === 'Due') return w.isDue && w.status !== 'Seen';
        if (activeFilter !== 'All') return w.status === activeFilter;
        return true;
      })
      .filter((w) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return w.term.toLowerCase().includes(q) || w.definition.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        switch (sortKey) {
          case 'alpha': return a.term.localeCompare(b.term);
          case 'encounters': return b.encounterCount - a.encounterCount;
          case 'added': return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
          case 'frequency': return (a.frequencyRank || 99999) - (b.frequencyRank || 99999);
          case 'due':
          default:
            return new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime();
        }
      });
  }, [allWords, selectedLang, activeFilter, searchQuery, sortKey]);

  const stats = useMemo(() => {
    const base = selectedLang === 'all' ? allWords : allWords.filter((w) => w.languageId === selectedLang || w.language === selectedLang);
    return {
      due: base.filter((w) => w.isDue && w.status !== 'Seen').length,
      known: base.filter((w) => w.status === 'Known' || w.status === 'Familiar').length,
      learning: base.filter((w) => w.status === 'Learning').length,
      total: base.length,
    };
  }, [allWords, selectedLang]);

  // Reset pagination on filter/search/sort change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(0);
  }, [activeFilter, searchQuery, sortKey, selectedLang]);

  // Close export menu on outside click
  useEffect(() => {
    if (!showExportMenu) return;
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showExportMenu]);

  const totalPages = Math.ceil(filteredWords.length / PAGE_SIZE);
  const pagedWords = filteredWords.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto font-sans min-h-screen">
      {/* Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-[32px] font-serif font-light text-ink tracking-tight mb-2">
            {t('vocab.title', 'Vocabulary')}
          </h2>
          <p className="font-body text-[15px] italic text-ink2">
            {t('vocab.personalCollection', `Your personal collection of {{count}} tracked words`, { count: allWords.length })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Export dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu((v) => !v)}
              disabled={filteredWords.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 border border-bdr rounded-xl text-[13px] font-bold text-ink3 hover:bg-parch2 disabled:opacity-40 transition-all"
            >
              <Download className="w-4 h-4" />
              {t('vocab.export', 'Export')}
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-parch border border-bdr rounded-xl shadow-lg z-20 overflow-hidden">
                <button
                  onClick={() => {
                    exportToCSV(filteredWords, `vocabulary-${selectedLang}-${new Date().toISOString().slice(0, 10)}.csv`);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-[13px] font-medium text-ink hover:bg-parch2 transition-colors"
                >
                  CSV (.csv)
                  <span className="block text-[11px] text-ink3 font-normal">Spreadsheet / Excel</span>
                </button>
                <button
                  onClick={() => {
                    exportToAnki(filteredWords, `vocabulary-${selectedLang}-${new Date().toISOString().slice(0, 10)}.txt`);
                    setShowExportMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 text-[13px] font-medium text-ink hover:bg-parch2 transition-colors border-t border-bdr"
                >
                  Anki deck (.txt)
                  <span className="block text-[11px] text-ink3 font-normal">Import via File › Import</span>
                </button>
              </div>
            )}
          </div>
          <button onClick={() => navigate('/app/review')} className="btn-primary px-6 py-2.5">
            {t('dashboard.startReview', 'Start Review')}
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card p-5 border-blue/20 bg-blue/5">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <Brain className="w-4 h-4 text-blue" />
            <h4 className="text-[11px] uppercase tracking-widest font-bold text-blue">{t('vocab.reviewsDue', 'Due')}</h4>
          </div>
          <div className="text-[32px] font-serif leading-none text-ink">{stats.due}</div>
        </div>
        <div className="card p-5 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <h4 className="text-[11px] uppercase tracking-widest font-bold text-emerald-600">{t('vocab.known', 'Known')}</h4>
          </div>
          <div className="text-[32px] font-serif leading-none text-ink">{stats.known}</div>
        </div>
        <div className="card p-5 border-amber/20 bg-amber/5">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <TrendingUp className="w-4 h-4 text-amber" />
            <h4 className="text-[11px] uppercase tracking-widest font-bold text-amber">{t('vocab.learning', 'Learning')}</h4>
          </div>
          <div className="text-[32px] font-serif leading-none text-ink">{stats.learning}</div>
        </div>
        <div className="card p-5 border-bdr/40">
          <div className="flex items-center gap-2 mb-2 opacity-70">
            <BookOpen className="w-4 h-4 text-ink3" />
            <h4 className="text-[11px] uppercase tracking-widest font-bold text-ink3">{t('vocab.total', 'Total')}</h4>
          </div>
          <div className="text-[32px] font-serif leading-none text-ink">{stats.total}</div>
        </div>
      </div>

      {/* Language tabs */}
      {availableLanguages.length > 1 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button
            onClick={() => setSelectedLang('all')}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-bold border transition-all',
              selectedLang === 'all'
                ? 'bg-ink text-parch border-ink'
                : 'bg-parch2 text-ink3 border-bdr/60 hover:border-ink/30'
            )}
          >
            <Languages className="w-3.5 h-3.5" />
            All languages
          </button>
          {availableLanguages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setSelectedLang(lang.id)}
              className={cn(
                'px-4 py-2 rounded-full text-[12px] font-bold border transition-all',
                selectedLang === lang.id
                  ? 'bg-ink text-parch border-ink'
                  : 'bg-parch2 text-ink3 border-bdr/60 hover:border-ink/30'
              )}
            >
              {lang.display} <span className="opacity-50 ml-1">{lang.count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Filters + search + sort */}
      <div className="flex flex-col gap-4 mb-8 card p-4 bg-parch2/30 border-bdr/50 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'px-4 py-2 rounded-full text-[12px] font-bold border transition-all duration-150 active:scale-95',
                  activeFilter === filter
                    ? 'bg-blue text-white shadow-md border-blue'
                    : 'bg-white text-ink3 border-bdr/60 hover:bg-parch hover:border-blue/30'
                )}
              >
                {t(`vocab.${filter.toLowerCase()}`, filter)}
                {filter === 'Due' && stats.due > 0 && <span className="ml-1 opacity-70">({stats.due})</span>}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder={t('vocab.searchLexicon', 'Search...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-bdr rounded-[12px] text-[14px] font-sans focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all shadow-sm"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2 border border-bdr rounded-[12px] text-[12px] font-bold text-ink3 bg-white hover:border-blue/30 hover:bg-parch transition-all shadow-sm whitespace-nowrap"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {SORT_LABELS[sortKey]}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </button>
              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute right-0 top-full mt-1 z-50 bg-white border border-bdr rounded-xl shadow-lg py-1 min-w-40"
                  >
                    {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => { setSortKey(key); setShowSortMenu(false); }}
                        className={cn(
                          'w-full text-left px-4 py-2 text-[13px] hover:bg-parch2 transition-colors',
                          sortKey === key ? 'font-bold text-blue' : 'text-ink3'
                        )}
                      >
                        {SORT_LABELS[key]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Word list */}
      <div className="flex flex-col gap-3 pb-20">
        {filteredWords.length > 0 ? (
          pagedWords.map((word, i) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.012, duration: 0.25 }}
              className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-blue/30 hover:shadow-md transition-all"
            >
              {/* Term + gloss */}
              <div className="flex items-start md:items-center gap-5 flex-1 min-w-0">
                <div className="w-44 flex-shrink-0">
                  <div
                    className={cn(
                      'text-[24px] font-serif text-ink leading-tight',
                      RTL_LANGS.has(word.language) ? 'font-hebrew' : ''
                    )}
                    dir={RTL_LANGS.has(word.language) ? 'rtl' : 'ltr'}
                  >
                    {word.term}
                  </div>
                  {word.translit && (
                    <div className="font-mono text-[11px] italic text-muted mt-0.5">{word.translit}</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-[9px] font-bold text-muted border border-bdr/60 bg-parch px-1.5 py-0.5 rounded uppercase">
                      {word.language}
                    </span>
                    {word.frequencyRank > 0 && (
                      <span className="font-mono text-[9px] text-muted border border-bdr/40 px-1.5 py-0.5 rounded bg-parch/50" title="Corpus frequency rank">
                        #{word.frequencyRank}
                      </span>
                    )}
                    {word.status !== 'Seen' && (
                      <span className={cn('text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider', word.isDue ? 'text-amber' : 'text-emerald-600/70')}>
                        <History className="w-3 h-3" />
                        {word.isDue ? t('vocab.dueNow', 'Due Now') : new Date(word.nextReview).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="font-body text-[14px] italic text-ink2 truncate">
                    {word.definition || <span className="text-muted">—</span>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-shrink-0 md:pl-2">
                {/* Inline state toggle */}
                <button
                  onClick={() => handleCycleState(word.id, word.rawState, word.languageId)}
                  className={cn(
                    'pill px-2.5 py-1 text-[10.5px] font-bold shadow-sm cursor-pointer hover:opacity-80 transition-opacity active:scale-95',
                    STATE_CLASSES[word.status] || ''
                  )}
                  title="Click to cycle state"
                >
                  {t(`vocab.${word.status.toLowerCase()}`, word.status)}
                </button>

                {word.encounterCount > 0 && (
                  <span className="text-[10px] text-muted font-mono hidden md:block whitespace-nowrap">
                    {word.encounterCount}×
                  </span>
                )}

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => navigate(`/app/dictionary/${encodeURIComponent(word.languageId || 'grc')}/${encodeURIComponent(word.term)}`)}
                    className="p-1.5 rounded text-muted hover:text-blue hover:bg-blue/5 transition-colors"
                    title={t('vocab.openDictionary', 'Open dictionary')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(word.id)}
                    className="p-1.5 rounded text-ruby/40 hover:text-ruby hover:bg-ruby/5 transition-colors"
                    title="Remove from vocabulary"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="card p-12 text-center border-dashed border-2 border-bdr/40 bg-parch2/50 flex flex-col items-center">
            <Brain className="w-12 h-12 text-muted mb-4 opacity-50" />
            <h3 className="font-serif text-[24px] text-ink mb-2">{t('vocab.noWordsFound', 'No Words Found')}</h3>
            <p className="text-ink3 max-w-sm mx-auto mb-6">
              {t('vocab.noWordsFoundDesc', 'Read texts or import vocabulary to begin building your personal lexicon.')}
            </p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 py-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-2 rounded-full border border-bdr/60 text-ink3 hover:text-blue hover:border-blue/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-[13px] font-bold text-muted">
              {t('vocab.pageOf', 'Page {{current}} of {{total}}', { current: currentPage + 1, total: totalPages })}
              <span className="font-normal ml-2">({filteredWords.length} words)</span>
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
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
