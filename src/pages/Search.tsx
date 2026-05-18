import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon,
  FileText,
  Globe,
  BookMarked,
  MessageSquare,
  BookOpen,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiFetch } from '../lib/services/apiFetch.js';
import { useTranslation } from 'react-i18next';
import { LoadingState, EmptyState } from '../components/ui/index.js';
import { CorpusDB } from '../data/corpus.js';
import { LANGUAGES } from '../lib/constants/languages.js';

// ── Types ──────────────────────────────────────────────────────────────────

interface ApiResult {
  id: string;
  title?: string;
  term?: string;
  lemma?: string;
  source: 'import' | 'vocabulary' | 'note' | 'public';
  languageId?: string;
  snippet?: string;
  textId?: string | null;
  authorName?: string;
}

type CorpusHit = ReturnType<typeof CorpusDB.searchCorpus>[number];

type Tab = 'all' | 'corpus' | 'imports' | 'vocabulary' | 'notes';

const POS_OPTIONS = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'pronoun',
  'preposition',
  'conjunction',
  'particle',
  'article',
  'numeral',
];
const TENSE_OPTIONS = ['present', 'imperfect', 'future', 'aorist', 'perfect', 'pluperfect'];
const VOICE_OPTIONS = ['active', 'middle', 'passive', 'middle/passive'];
const MOOD_OPTIONS = [
  'indicative',
  'subjunctive',
  'optative',
  'imperative',
  'infinitive',
  'participle',
];
const CASE_OPTIONS = ['nominative', 'genitive', 'dative', 'accusative', 'vocative', 'absolute'];
const NUMBER_OPTIONS = ['singular', 'plural', 'dual'];

// ── Helpers ────────────────────────────────────────────────────────────────

function getContextParts(tokens: any[], tokenIdx: number, window = 6) {
  const before = tokens
    .slice(Math.max(0, tokenIdx - window), tokenIdx)
    .map((t) => t.surface)
    .join(' ');
  const match = tokens[tokenIdx];
  const after = tokens
    .slice(tokenIdx + 1, tokenIdx + 1 + window)
    .map((t) => t.surface)
    .join(' ');
  return { before, match, after };
}

// ── Sub-components ─────────────────────────────────────────────────────────

function CorpusResultCard({ hit, navigate }: { hit: CorpusHit; navigate: (p: string) => void }) {
  const { before, match, after } = getContextParts(hit.sentence.tokens, hit.tokenIdx);
  const token = hit.sentence.tokens[hit.tokenIdx];
  const morph = token?.morphology;
  const morphTags = morph
    ? [morph.partOfSpeech, morph.tense, morph.voice, morph.mood, morph.case, morph.number]
        .filter(Boolean)
        .join(' · ')
    : '';
  const langName = LANGUAGES.find((l) => l.id === hit.textLanguage)?.name || hit.textLanguage;

  return (
    <div
      className="card p-4 hover:border-blue/30 transition-all cursor-pointer group"
      onClick={() =>
        navigate(`/app/reader/${hit.textId}?section=${encodeURIComponent(hit.sectionId)}`)
      }
    >
      <div className="flex items-start gap-3">
        <BookOpen className="w-4 h-4 mt-0.5 text-muted shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-[14px] font-bold text-ink truncate">{hit.textTitle}</span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-blue bg-blue/8 px-2 py-0.5 rounded-full shrink-0">
              Corpus
            </span>
            <span className="text-[10px] text-muted shrink-0">{langName}</span>
          </div>

          {/* KWIC */}
          <p className="text-[14px] leading-relaxed font-serif">
            {before && <span className="text-ink2">{before} </span>}
            <mark className="bg-yellow-100 dark:bg-yellow-900/40 text-ink font-semibold px-0.5 rounded not-italic">
              {match?.surface || ''}
            </mark>
            {after && <span className="text-ink2"> {after}</span>}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {token?.lemma && (
              <span className="text-[11px] text-ink2 font-serif">
                lemma: <span className="font-semibold">{token.lemma}</span>
              </span>
            )}
            {token?.gloss && <span className="text-[11px] text-muted">"{token.gloss}"</span>}
            {morphTags && (
              <span className="text-[10px] text-muted bg-parch3 px-2 py-0.5 rounded-full">
                {morphTags}
              </span>
            )}
            <span className="ml-auto text-[11px] text-blue opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              Open in Reader <ExternalLink className="w-3 h-3" />
            </span>
          </div>

          {/* Translation if available */}
          {hit.sentence.translation && (
            <p className="text-[12px] text-muted italic mt-1 line-clamp-1">
              {hit.sentence.translation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ApiResultCard({ r, navigate }: { r: ApiResult; navigate: (p: string) => void }) {
  const { t } = useTranslation();
  const SOURCE_ICONS: Record<string, any> = {
    import: FileText,
    vocabulary: BookMarked,
    note: MessageSquare,
    public: Globe,
  };
  const Icon = SOURCE_ICONS[r.source] || FileText;
  const sourceLabel =
    r.source === 'import'
      ? t('search.sourceImport', 'Your Import')
      : r.source === 'vocabulary'
        ? t('search.sourceVocabulary', 'Vocabulary')
        : r.source === 'note'
          ? t('search.sourceNote', 'Note')
          : t('search.sourcePublicLibrary', 'Public Library');

  return (
    <div
      className={cn(
        'card p-4 flex items-start gap-4 hover:border-blue/30 transition-all cursor-pointer',
        r.source === 'public' && 'border-emerald-200/50'
      )}
      onClick={() => {
        if (r.textId) navigate(`/app/reader/${r.textId}`);
        else if (r.lemma)
          navigate(`/app/dictionary/${r.languageId || 'grc'}/${encodeURIComponent(r.lemma)}`);
      }}
    >
      <Icon className="w-4 h-4 mt-0.5 text-muted shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[14px] font-bold text-ink truncate">
            {r.title || r.term || r.lemma}
          </span>
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted bg-parch3 px-2 py-0.5 rounded-full shrink-0">
            {sourceLabel}
          </span>
        </div>
        {r.snippet && <p className="text-[13px] text-ink2 line-clamp-2">{r.snippet}</p>}
        {r.languageId && <span className="text-[10px] text-muted mt-1 block">{r.languageId}</span>}
      </div>
    </div>
  );
}

function MorphFilterPanel({
  value,
  onChange,
}: {
  value: Record<string, string>;
  onChange: (v: Record<string, string>) => void;
}) {
  const set = (k: string, v: string) => onChange({ ...value, [k]: v });
  const sel = (label: string, key: string, opts: string[]) => (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] uppercase tracking-wider font-bold text-muted">{label}</label>
      <select
        value={value[key] || ''}
        onChange={(e) => set(key, e.target.value)}
        className="text-[13px] bg-white border border-bdr rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue transition-colors"
      >
        <option value="">Any</option>
        {opts.map((o) => (
          <option key={o} value={o}>
            {o.charAt(0).toUpperCase() + o.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="border border-bdr rounded-xl bg-parch2/50 p-4 mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      {sel('Part of Speech', 'partOfSpeech', POS_OPTIONS)}
      {sel('Tense', 'tense', TENSE_OPTIONS)}
      {sel('Voice', 'voice', VOICE_OPTIONS)}
      {sel('Mood', 'mood', MOOD_OPTIONS)}
      {sel('Case', 'case', CASE_OPTIONS)}
      {sel('Number', 'number', NUMBER_OPTIONS)}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export const SearchPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [query, setQuery] = useState('');
  const [langFilter, setLangFilter] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [showMorphFilter, setShowMorphFilter] = useState(false);
  const [morphFilter, setMorphFilter] = useState<Record<string, string>>({});

  const [corpusResults, setCorpusResults] = useState<CorpusHit[]>([]);
  const [apiResults, setApiResults] = useState<ApiResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const hasMorphFilter = Object.values(morphFilter).some(Boolean);

  const handleSearch = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!query.trim() && !hasMorphFilter) return;
      setIsLoading(true);
      setSearched(true);

      // Client-side corpus search
      const cHits = CorpusDB.searchCorpus(query, {
        languageId: langFilter || undefined,
        morphology: hasMorphFilter ? morphFilter : undefined,
        limit: 60,
      });
      setCorpusResults(cHits);

      // Server-side user data search (skip if morphology-only)
      if (query.trim()) {
        try {
          const data = await apiFetch<ApiResult[]>('/api/search', {
            method: 'POST',
            body: {
              query: query.trim(),
              languageId: langFilter || undefined,
            },
          });
          setApiResults(data);
        } catch {
          setApiResults([]);
        }
      } else {
        setApiResults([]);
      }

      setIsLoading(false);
    },
    [query, langFilter, morphFilter, hasMorphFilter]
  );

  // Derived counts per tab
  const importResults = apiResults.filter((r) => r.source === 'import');
  const vocabResults = apiResults.filter((r) => r.source === 'vocabulary');
  const noteResults = apiResults.filter((r) => r.source === 'note');
  const publicResults = apiResults.filter((r) => r.source === 'public');
  const allApiResults = [...importResults, ...publicResults, ...vocabResults, ...noteResults];
  const totalCount = corpusResults.length + allApiResults.length;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'all', label: t('search.tabAll', 'All'), count: totalCount },
    { id: 'corpus', label: t('search.tabCorpus', 'Corpus'), count: corpusResults.length },
    {
      id: 'imports',
      label: t('search.tabMyTexts', 'My Texts'),
      count: importResults.length + publicResults.length,
    },
    {
      id: 'vocabulary',
      label: t('search.tabVocabulary', 'Vocabulary'),
      count: vocabResults.length,
    },
    { id: 'notes', label: t('search.tabNotes', 'Notes'), count: noteResults.length },
  ];

  const visibleCorpus = activeTab === 'all' || activeTab === 'corpus' ? corpusResults : [];
  const visibleApi =
    activeTab === 'all'
      ? allApiResults
      : activeTab === 'imports'
        ? [...importResults, ...publicResults]
        : activeTab === 'vocabulary'
          ? vocabResults
          : activeTab === 'notes'
            ? noteResults
            : [];

  const isEmpty = searched && !isLoading && visibleCorpus.length === 0 && visibleApi.length === 0;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto font-sans min-h-screen">
      <h2 className="text-[26px] font-serif font-bold text-ink mb-1">
        {t('search.title', 'Search')}
      </h2>
      <p className="text-ink2 text-[14px] mb-6">
        {t('search.description', 'Search the corpus by lemma, surface form, gloss, or morphology.')}
      </p>

      {/* Search bar + language filter */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder', 'lemma, word form, gloss, or note…')}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-bdr rounded-xl text-[14px] focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-all shadow-sm"
          />
        </div>
        <select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value)}
          className="text-[13px] bg-white border border-bdr rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue transition-colors shrink-0"
        >
          <option value="">{t('search.allLanguages', 'All languages')}</option>
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="btn-primary px-4 py-2.5 rounded-xl text-[14px] font-semibold shrink-0"
        >
          {t('search.searchButton', 'Search')}
        </button>
      </form>

      {/* Morphology filter toggle */}
      <button
        type="button"
        onClick={() => setShowMorphFilter((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 text-[12px] font-medium mb-3 px-2 py-1 rounded-lg transition-colors',
          hasMorphFilter ? 'text-blue bg-blue/8' : 'text-muted hover:text-ink hover:bg-parch3'
        )}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        {t('search.morphologyFilter', 'Morphology filter')}
        {hasMorphFilter && (
          <span className="bg-blue text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {Object.values(morphFilter).filter(Boolean).length}
          </span>
        )}
        {showMorphFilter ? (
          <ChevronUp className="w-3.5 h-3.5 ml-auto" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 ml-auto" />
        )}
      </button>

      {showMorphFilter && <MorphFilterPanel value={morphFilter} onChange={setMorphFilter} />}

      {/* Tabs (only shown after search) */}
      {searched && !isLoading && (
        <div className="flex gap-1 mb-5 border-b border-bdr overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 whitespace-nowrap transition-colors -mb-px',
                activeTab === tab.id
                  ? 'border-blue text-blue'
                  : 'border-transparent text-muted hover:text-ink'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                    activeTab === tab.id ? 'bg-blue text-white' : 'bg-parch3 text-muted'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {isLoading && <LoadingState />}

      {isEmpty && (
        <EmptyState
          icon={<SearchIcon className="w-12 h-12" />}
          heading={t('search.noResults', 'No results found.')}
        />
      )}

      {!isLoading && (visibleCorpus.length > 0 || visibleApi.length > 0) && (
        <div className="space-y-2.5">
          {/* Section header for corpus when both visible */}
          {activeTab === 'all' && visibleCorpus.length > 0 && visibleApi.length > 0 && (
            <p className="text-[11px] uppercase tracking-wider font-bold text-muted mt-4 mb-2">
              {t('search.corpusSection', 'Corpus')} ({visibleCorpus.length})
            </p>
          )}

          {visibleCorpus.map((hit, i) => (
            <CorpusResultCard
              key={`corpus-${hit.sectionId}-${hit.tokenIdx}-${i}`}
              hit={hit}
              navigate={navigate}
            />
          ))}

          {activeTab === 'all' && visibleCorpus.length > 0 && visibleApi.length > 0 && (
            <p className="text-[11px] uppercase tracking-wider font-bold text-muted mt-5 mb-2">
              {t('search.yourDataSection', 'Your Data')} ({visibleApi.length})
            </p>
          )}

          {visibleApi.map((r, i) => (
            <ApiResultCard key={`api-${r.source}-${r.id}-${i}`} r={r} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
};
