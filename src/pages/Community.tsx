import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  BookOpen,
  Flame,
  ExternalLink,
  AlertCircle,
  MoreVertical,
  Flag,
  UserX,
  Mail,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/hooks/useAuth.js';
import {
  fetchCommunityScholars,
  reportUser,
  blockUser,
} from '../lib/services/communityService.js';
import { cn } from '@/lib/utils';
import type { PublicScholar, ReportReason } from '../types/social.js';

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'fake_account', label: 'Fake or impersonation account' },
  { value: 'other', label: 'Other' },
];

// ── Report modal ─────────────────────────────────────────────────────────────
function ReportModal({
  targetUid,
  displayName,
  onClose,
}: {
  targetUid: string;
  displayName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await reportUser({ type: 'profile', targetUid, reason, details: details.trim() || undefined });
      setDone(true);
    } catch {
      setError(t('community.reportError', 'Could not submit report. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card p-6 w-full max-w-sm flex flex-col gap-4">
        {done ? (
          <>
            <h3 className="text-[16px] font-serif text-ink font-semibold">
              {t('community.reportSent', 'Report submitted')}
            </h3>
            <p className="text-[13px] text-muted">
              {t(
                'community.reportSentDesc',
                'Thank you. Our team will review this report. If you need immediate help, contact us at support@paleoglossa.com.'
              )}
            </p>
            <button onClick={onClose} className="btn-secondary text-[13px]">
              {t('common.close', 'Close')}
            </button>
          </>
        ) : (
          <>
            <h3 className="text-[16px] font-serif text-ink font-semibold">
              {t('community.reportTitle', 'Report {{name}}', { name: displayName })}
            </h3>
            <div className="flex flex-col gap-2">
              {REPORT_REASONS.map((r) => (
                <label key={r.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="accent-blue"
                  />
                  <span className="text-[13px] text-ink">{r.label}</span>
                </label>
              ))}
            </div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={t('community.reportDetails', 'Additional details (optional)')}
              maxLength={500}
              rows={3}
              className="w-full bg-parch border border-bdr rounded-lg p-2.5 text-[12px] font-sans text-ink placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-blue/30"
            />
            {error && <p className="text-[12px] text-ruby">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={onClose} className="btn-secondary text-[12px] px-4 py-2">
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="btn-primary text-[12px] px-4 py-2"
              >
                {submitting
                  ? t('community.reportSubmitting', 'Submitting…')
                  : t('community.reportSubmit', 'Submit report')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Scholar avatar ────────────────────────────────────────────────────────────
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

// ── Scholar card ──────────────────────────────────────────────────────────────
function ScholarCard({
  scholar,
  isCurrentUser,
  onBlocked,
}: {
  scholar: PublicScholar;
  isCurrentUser: boolean;
  onBlocked: (uid: string) => void;
}) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<PublicScholar | null>(null);
  const [blocking, setBlocking] = useState(false);

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

  const handleBlock = async () => {
    setMenuOpen(false);
    setBlocking(true);
    try {
      await blockUser(scholar.uid);
      onBlocked(scholar.uid);
    } catch {
      setBlocking(false);
    }
  };

  if (blocking) return null;

  return (
    <>
      {reportTarget && (
        <ReportModal
          targetUid={reportTarget.uid}
          displayName={reportTarget.displayName}
          onClose={() => setReportTarget(null)}
        />
      )}
      <div
        className={cn(
          'card p-5 flex flex-col gap-4 hover:shadow-md transition-all relative',
          isCurrentUser && 'ring-1 ring-blue/30'
        )}
      >
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

          {/* Context menu for other users */}
          {!isCurrentUser && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="p-1.5 rounded-md text-muted hover:text-ink hover:bg-parch3 transition-colors"
                aria-label={t('community.moreOptions', 'More options')}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-7 z-20 bg-parch2 border border-bdr rounded-xl shadow-lg py-1 min-w-[160px]">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        setReportTarget(scholar);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-ink hover:bg-parch3 transition-colors"
                    >
                      <Flag className="w-3.5 h-3.5 text-amber" />
                      {t('community.reportProfile', 'Report profile')}
                    </button>
                    <button
                      onClick={handleBlock}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-ruby hover:bg-ruby/5 transition-colors"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      {t('community.blockUser', 'Block user')}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {scholar.bio && (
          <p className="text-[13px] text-ink2 font-sans leading-relaxed line-clamp-2">
            {scholar.bio}
          </p>
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
    </>
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
      } catch (err: unknown) {
        if (!cancelled)
          setError(
            err instanceof Error
              ? err.message
              : t('community.errorDesc', 'Could not load scholars. Please try again.')
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const handleBlocked = (uid: string) => {
    setScholars((prev) => prev.filter((s) => s.uid !== uid));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return scholars;
    return scholars.filter(
      (s) =>
        s.displayName.toLowerCase().includes(q) ||
        (s.nickname?.toLowerCase().includes(q) ?? false) ||
        (s.bio?.toLowerCase().includes(q) ?? false)
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
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
          strokeWidth={1.5}
        />
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
            <h3 className="text-[16px] font-serif text-ink mb-1">
              {t('community.errorTitle', 'Something went wrong')}
            </h3>
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
                : t(
                    'community.emptyDesc',
                    'Scholars who make their profile public will appear here.'
                  )}
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
                onBlocked={handleBlocked}
              />
            ))}
          </div>
        </>
      )}

      {/* Support / abuse link */}
      <div className="mt-10 pt-6 border-t border-bdr flex items-center justify-center gap-1.5 text-[12px] text-muted">
        <Mail className="w-3.5 h-3.5" />
        <span>{t('community.supportNote', 'Need help or want to report abuse?')}</span>
        <a
          href="mailto:support@paleoglossa.com"
          className="text-blue hover:underline"
        >
          support@paleoglossa.com
        </a>
      </div>
    </div>
  );
};
