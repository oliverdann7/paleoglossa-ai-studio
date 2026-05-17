import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, BookOpen, Flame, ExternalLink, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/hooks/useAuth.js';
import { fetchCommunityScholars } from '../lib/services/communityService.js';
import { cn } from '@/lib/utils';
import type { PublicScholar } from '../types/social.js';

function ScholarAvatar({ scholar }: { scholar: PublicScholar }) {
  const initials = (scholar.displayName || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (scholar.avatarUrl) {
    return (
      <img
        src={scholar.avatarUrl}
        alt={scholar.displayName}
        className="w-14 h-14 rounded-full object-cover border border-bdr flex-shrink-0"
      />
    );
  }

  return (
    <div className="w-14 h-14 rounded-full bg-bluexl border border-bdr flex items-center justify-center flex-shrink-0">
      <span className="text-[18px] font-serif font-semibold text-blue">{initials}</span>
    </div>
  );
}

function ScholarCard({ scholar, isCurrentUser }: { scholar: PublicScholar; isCurrentUser: boolean }) {
  const { t } = useTranslation();

  const joinedDate = useMemo(() => {
    if (!scholar.createdAt) return null;
    try {
      return new Date(scholar.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
      });
    } catch {
      return null;
    }
  }, [scholar.createdAt]);

  return (
    <div className={cn('card p-5 flex flex-col gap-4 hover:shadow-md transition-all', isCurrentUser && 'ring-1 ring-blue/30')}>
      <div className="flex items-start gap-3">
        <ScholarAvatar scholar={scholar} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-serif font-semibold text-ink truncate">
              {scholar.displayName}
            </span>
            {isCurrentUser && (
              <span className="text-[10px] font-sans font-bold uppercase tracking-wide text-blue bg-bluexl px-2 py-0.5 rounded-full">
                {t('community.you', 'You')}
              </span>
            )}
          </div>
          {scholar.nickname && (
            <p className="text-[12px] text-muted font-sans mt-0.5">@{scholar.nickname}</p>
          )}
          {joinedDate && (
            <p className="text-[11px] text-muted font-sans mt-0.5">
              {t('community.joined', 'Joined {{date}}', { date: joinedDate })}
            </p>
          )}
        </div>
      </div>

      {scholar.bio && (
        <p className="text-[13px] text-ink2 font-sans leading-relaxed line-clamp-2">{scholar.bio}</p>
      )}

      {scholar.stats && (
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-[12px] text-ink3 font-sans">
            <BookOpen className="w-3.5 h-3.5 text-muted" strokeWidth={1.5} />
            <span>{scholar.stats.totalKnown.toLocaleString()}</span>
            <span className="text-muted">{t('community.wordsKnown', 'words')}</span>
          </div>
          {scholar.stats.streak > 0 && (
            <div className="flex items-center gap-1.5 text-[12px] text-ink3 font-sans">
              <Flame className="w-3.5 h-3.5 text-amber" strokeWidth={1.5} />
              <span>{scholar.stats.streak}</span>
              <span className="text-muted">{t('community.dayStreak', 'day streak')}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <div />
        {!isCurrentUser && (
          <Link
            to={`/app/profile/${scholar.uid}`}
            className="btn-secondary flex items-center gap-1.5 text-[12px] px-3 py-1.5"
          >
            {t('community.viewProfile', 'View Profile')}
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
        {isCurrentUser && (
          <Link
            to={`/app/profile/${scholar.uid}`}
            className="text-[12px] text-blue hover:underline font-sans flex items-center gap-1"
          >
            {t('community.viewProfile', 'View Profile')}
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

export const CommunityPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [scholars, setScholars] = useState<PublicScholar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCommunityScholars();
        if (!cancelled) setScholars(data);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || t('community.errorDesc', 'Could not load scholars. Please try again.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [t]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return scholars;
    return scholars.filter(
      (s) =>
        s.displayName.toLowerCase().includes(q) ||
        (s.nickname?.toLowerCase().includes(q) ?? false) ||
        (s.bio?.toLowerCase().includes(q) ?? false),
    );
  }, [scholars, query]);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-bluexl flex items-center justify-center">
            <Users className="w-5 h-5 text-blue" strokeWidth={1.5} />
          </div>
          <h1 className="text-[26px] font-serif font-semibold text-ink">
            {t('community.title', 'Community')}
          </h1>
        </div>
        <p className="text-[14px] text-muted ml-12">
          {t('community.subtitle', 'Discover public scholars on Paleoglossa')}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" strokeWidth={1.5} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('community.search', 'Search scholars by name, handle, or bio…')}
          className="w-full pl-9 pr-4 py-2.5 bg-parch border border-bdr rounded-lg text-[13px] font-sans text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue/50 transition-all"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 rounded-full bg-parch3 flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-4 bg-parch3 rounded w-3/4" />
                  <div className="h-3 bg-parch3 rounded w-1/2" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-parch3 rounded w-full" />
                <div className="h-3 bg-parch3 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="card p-8 flex flex-col items-center gap-4 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-ruby/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-ruby" />
          </div>
          <div>
            <h3 className="text-[16px] font-serif text-ink mb-1">{t('community.errorTitle', 'Something went wrong')}</h3>
            <p className="text-[13px] text-muted">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div className="card p-12 flex flex-col items-center gap-4 text-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-full bg-parch2 border border-bdr flex items-center justify-center">
            <Users className="w-7 h-7 text-muted" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-[17px] font-serif text-ink mb-2">
              {query
                ? t('community.noResults', 'No scholars match your search')
                : t('community.emptyTitle', 'No public scholars yet')}
            </h3>
            <p className="text-[13px] text-muted">
              {query
                ? t('community.noResultsDesc', 'Try a different name or handle.')
                : t('community.emptyDesc', 'Scholars who make their profile public will appear here.')}
            </p>
          </div>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          <p className="text-[12px] text-muted mb-4">
            {t('community.count', '{{count}} scholar', { count: filtered.length })}
            {filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((scholar) => (
              <ScholarCard
                key={scholar.uid}
                scholar={scholar}
                isCurrentUser={user?.uid === scholar.uid}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
