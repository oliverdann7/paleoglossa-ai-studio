import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, Play, GitFork, BookOpen, Languages, Filter, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImportService, ImportedText } from '../lib/services/importService.js';
import { useAuth } from '../lib/hooks/useAuth.js';
import { useToast } from '../lib/hooks/useToast.js';
import { getLanguageDisplayName } from '../lib/constants/languages.js';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '../components/Skeleton.js';
import { useKnowledge } from '../lib/hooks/useKnowledge.js';
import { normalizeLemmaKey } from '../lib/utils/lemmaUtils.js';
import { WordState, normalizeWordState } from '../lib/constants/wordStates.js';
import { useActiveLanguage } from '../lib/hooks/useActiveLanguage.js';

/** Returns 0-100 score of how much of this text's vocabulary the user already knows. */
function computeKnownPct(text: ImportedText, knownSet: Set<string>): number {
  if (knownSet.size === 0) return 0;
  // Prefer token lemmas if available; fall back to raw words
  const lemmas = new Set<string>();
  for (const sentence of text.sentences ?? []) {
    for (const token of sentence.tokens ?? []) {
      if (token.type === 'word') {
        const key = normalizeLemmaKey(token.lemma || token.text || '');
        if (key) lemmas.add(key);
      }
    }
  }
  if (lemmas.size === 0 && text.rawContent) {
    for (const word of text.rawContent.split(/[\s\p{P}]+/u)) {
      const key = normalizeLemmaKey(word);
      if (key.length > 1) lemmas.add(key);
    }
  }
  if (lemmas.size === 0) return 0;
  let hits = 0;
  for (const l of lemmas) if (knownSet.has(l)) hits++;
  return Math.round((hits / lemmas.size) * 100);
}

function KnownBadge({ pct }: { pct: number }) {
  const color =
    pct >= 80 ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
    : pct >= 50 ? 'bg-blue/10 text-blue border-blue/30'
    : pct >= 20 ? 'bg-amber/10 text-amber border-amber/30'
    : 'bg-ink3/10 text-ink3 border-ink3/20';
  return (
    <span className={cn('px-1.5 py-0.5 rounded-md border text-[10px] font-bold', color)} title="% of words you already know">
      {pct}% known
    </span>
  );
}

function TextCard({
  text,
  onRead,
  onFork,
  isForkingId,
  knownPct,
}: {
  text: ImportedText;
  onRead: (id: string) => void;
  onFork: (id: string) => void;
  isForkingId: string | null;
  knownPct?: number;
}) {
  const langLabel = getLanguageDisplayName(text.languageId) || text.languageId;
  const wordCount = text.stats?.totalWords ?? 0;
  const author = text.authorName || 'Anonymous';
  const forkCount = text.forkCount ?? 0;

  return (
    <div className="card p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ink text-sm leading-tight line-clamp-2">
            {text.title}
          </h3>
          <p className="text-xs text-muted mt-1">by {author}</p>
        </div>
        <span className="shrink-0 px-2 py-0.5 rounded-full bg-gold/15 text-gold text-[10px] font-semibold uppercase tracking-wide">
          {langLabel}
        </span>
      </div>

      {text.rawContent && (
        <p className="text-sm text-ink2 line-clamp-3 leading-relaxed" dir="auto">
          {text.rawContent.slice(0, 200)}
        </p>
      )}

      <div className="flex items-center gap-3 text-[11px] text-muted flex-wrap">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          {wordCount.toLocaleString()} words
        </span>
        {forkCount > 0 && (
          <span className="flex items-center gap-1">
            <GitFork className="w-3 h-3" />
            {forkCount} {forkCount === 1 ? 'fork' : 'forks'}
          </span>
        )}
        {knownPct !== undefined && <KnownBadge pct={knownPct} />}
      </div>

      <div className="flex gap-2 mt-1">
        <button
          onClick={() => onRead(text.id!)}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-blue text-white text-xs font-medium hover:bg-blue-600 transition-colors"
        >
          <Play className="w-3 h-3 fill-current" />
          Read
        </button>
        <button
          onClick={() => onFork(text.id!)}
          disabled={isForkingId === text.id}
          className={cn(
            'flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border border-bdr',
            isForkingId === text.id
              ? 'opacity-50 cursor-not-allowed text-muted'
              : 'text-ink2 hover:bg-parch3'
          )}
        >
          <GitFork className="w-3 h-3" />
          {isForkingId === text.id ? 'Forking…' : 'Fork'}
        </button>
      </div>
    </div>
  );
}

function DiscoverSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card p-4 flex flex-col gap-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Discover() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const { t } = useTranslation();
  const { activeLanguageId } = useActiveLanguage();

  const [texts, setTexts] = useState<ImportedText[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  // Default to the global active language; empty string means "all languages".
  const [filterLang, setFilterLang] = useState<string>(activeLanguageId);
  const [isForkingId, setIsForkingId] = useState<string | null>(null);

  // Sync the language filter when the global active language changes.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFilterLang(activeLanguageId);
  }, [activeLanguageId]);

  const { knowledge } = useKnowledge(undefined as any);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    ImportService.getPublicTexts(100)
      .then((results) => {
        if (!cancelled) setTexts(results);
      })
      .catch(() => {
        if (!cancelled) {
          addToast('Could not load public texts', 'error');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [addToast]);

  const handleRead = useCallback(
    (id: string) => {
      navigate(`/app/reader/${id}`);
    },
    [navigate]
  );

  const handleFork = useCallback(
    async (id: string) => {
      if (!user) {
        addToast(t('discover.loginToFork', 'Sign in to fork texts'), 'info');
        navigate('/auth/login');
        return;
      }
      setIsForkingId(id);
      try {
        const newId = await ImportService.forkPublic(user.uid, id);
        if (newId) {
          addToast(t('discover.forked', 'Text added to your library'), 'success');
          navigate(`/app/reader/${newId}`);
        } else {
          addToast(t('discover.forkFailed', 'Fork failed'), 'error');
        }
      } catch {
        addToast(t('discover.forkFailed', 'Fork failed'), 'error');
      } finally {
        setIsForkingId(null);
      }
    },
    [user, addToast, navigate, t]
  );

  const knownSet = useMemo<Set<string>>(() => {
    const s = new Set<string>();
    if (!knowledge) return s;
    for (const [lemma, entry] of Object.entries(knowledge)) {
      const state = normalizeWordState(entry.state);
      if (state !== WordState.NEW) s.add(normalizeLemmaKey(lemma));
    }
    return s;
  }, [knowledge]);

  const knownPctMap = useMemo<Map<string, number>>(() => {
    const m = new Map<string, number>();
    if (knownSet.size === 0) return m;
    for (const text of texts) {
      if (text.id) m.set(text.id, computeKnownPct(text, knownSet));
    }
    return m;
  }, [texts, knownSet]);

  const recommended = useMemo<ImportedText[]>(() => {
    if (knownSet.size === 0) return [];
    return [...texts]
      .filter((t) => {
        const pct = t.id ? (knownPctMap.get(t.id) ?? 0) : 0;
        return pct >= 20 && pct <= 85;
      })
      .sort((a, b) => {
        const pa = a.id ? (knownPctMap.get(a.id) ?? 0) : 0;
        const pb = b.id ? (knownPctMap.get(b.id) ?? 0) : 0;
        return pb - pa;
      })
      .slice(0, 3);
  }, [texts, knownSet, knownPctMap]);

  const displayed = texts.filter((t) => {
    const matchesLang = !filterLang || t.languageId === filterLang;
    const matchesQuery =
      !query ||
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      (t.authorName || '').toLowerCase().includes(query.toLowerCase()) ||
      (t.rawContent || '').toLowerCase().slice(0, 300).includes(query.toLowerCase());
    return matchesLang && matchesQuery;
  });

  const availableLangs = Array.from(new Set(texts.map((t) => t.languageId))).sort();

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Globe className="w-6 h-6 text-gold shrink-0" />
        <div>
          <h1 className="text-xl font-bold text-ink">
            {t('discover.title', 'Discover')}
          </h1>
          <p className="text-sm text-muted">
            {t('discover.subtitle', 'Browse texts shared by the Paleoglossa community')}
          </p>
        </div>
      </div>

      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('discover.searchPlaceholder', 'Search by title, author, or content…')}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-bdr bg-parch text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>

        {availableLangs.length > 1 && (
          <div className="relative">
            <Languages className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              className="pl-9 pr-8 py-2 rounded-lg border border-bdr bg-parch text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold/30 appearance-none cursor-pointer"
            >
              <option value="">{t('discover.allLanguages', 'All languages')}</option>
              {availableLangs.map((lang) => (
                <option key={lang} value={lang}>
                  {getLanguageDisplayName(lang) || lang}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>
        )}
      </div>

      {/* Results count */}
      {!loading && texts.length > 0 && (
        <p className="text-xs text-muted">
          {displayed.length === texts.length
            ? `${texts.length} public text${texts.length !== 1 ? 's' : ''}`
            : `${displayed.length} of ${texts.length} texts`}
        </p>
      )}

      {/* Recommended for you */}
      {!loading && recommended.length > 0 && !query && !filterLang && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gold" />
            <h2 className="text-sm font-semibold text-ink">
              {t('discover.recommended', 'Recommended for you')}
            </h2>
            <span className="text-xs text-muted">
              {t('discover.recommendedHint', 'Best vocabulary overlap with what you know')}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommended.map((text) => (
              <TextCard
                key={text.id}
                text={text}
                onRead={handleRead}
                onFork={handleFork}
                isForkingId={isForkingId}
                knownPct={text.id ? knownPctMap.get(text.id) : undefined}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <TrendingUp className="w-4 h-4 text-muted" />
            <h2 className="text-sm font-semibold text-ink">
              {t('discover.allTexts', 'All texts')}
            </h2>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <DiscoverSkeleton />
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <Globe className="w-12 h-12 text-muted/40" />
          {texts.length === 0 ? (
            <>
              <p className="font-medium text-ink2">
                {t('discover.empty', 'No public texts yet')}
              </p>
              <p className="text-sm text-muted max-w-xs">
                {t(
                  'discover.emptyHint',
                  'Import a text and set its visibility to "Public" to share it with the community.'
                )}
              </p>
              <button
                onClick={() => navigate('/app/import')}
                className="mt-2 px-4 py-2 rounded-lg bg-blue text-white text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                {t('discover.importCta', 'Import a text')}
              </button>
            </>
          ) : (
            <p className="text-sm text-muted">
              {t('discover.noMatch', 'No texts match your search')}
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((text) => (
            <TextCard
              key={text.id}
              text={text}
              onRead={handleRead}
              onFork={handleFork}
              isForkingId={isForkingId}
              knownPct={text.id ? knownPctMap.get(text.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
