import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Globe, Play, GitFork, BookOpen, Languages, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImportService, ImportedText } from '../lib/services/importService.js';
import { useAuth } from '../lib/hooks/useAuth.js';
import { useToast } from '../lib/hooks/useToast.js';
import { getLanguageDisplayName } from '../lib/constants/languages.js';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '../components/Skeleton.js';

function TextCard({
  text,
  onRead,
  onFork,
  isForkingId,
}: {
  text: ImportedText;
  onRead: (id: string) => void;
  onFork: (id: string) => void;
  isForkingId: string | null;
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

      <div className="flex items-center gap-3 text-[11px] text-muted">
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

  const [texts, setTexts] = useState<ImportedText[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterLang, setFilterLang] = useState<string>('');
  const [isForkingId, setIsForkingId] = useState<string | null>(null);

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
            />
          ))}
        </div>
      )}
    </div>
  );
}
