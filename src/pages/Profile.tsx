import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  Flame,
  GraduationCap,
  Globe,
  Lock,
  Settings,
  ArrowLeft,
  Flag,
  UserX,
  Mail,
} from 'lucide-react';
import { useAuth } from '../lib/hooks/useAuth.js';
import {
  fetchOwnProfile,
  fetchPublicProfile,
  fetchPublicTextsByAuthor,
  UserProfileData,
  PublicText,
} from '../lib/services/profileService.js';
import { reportUser, blockUser } from '../lib/services/communityService.js';
import { cn } from '@/lib/utils';
import type { ReportReason } from '../types/social.js';

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'fake_account', label: 'Fake or impersonation account' },
  { value: 'other', label: 'Other' },
];

function formatDate(val: any): string {
  if (!val) return '';
  const d = val?.toDate ? val.toDate() : new Date(val);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
}

// ── Report modal ──────────────────────────────────────────────────────────────
function ReportModal({
  targetUid,
  displayName,
  onClose,
}: {
  targetUid: string;
  displayName: string;
  onClose: () => void;
}) {
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
      setError('Could not submit report. Please try again.');
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
            <h3 className="text-[16px] font-serif text-ink font-semibold">Report submitted</h3>
            <p className="text-[13px] text-muted">
              Thank you. Our team will review this report. If you need immediate help, contact us at{' '}
              <a href="mailto:support@paleoglossa.com" className="text-blue hover:underline">
                support@paleoglossa.com
              </a>
              .
            </p>
            <button onClick={onClose} className="btn-secondary text-[13px]">
              Close
            </button>
          </>
        ) : (
          <>
            <h3 className="text-[16px] font-serif text-ink font-semibold">
              Report {displayName}
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
              placeholder="Additional details (optional)"
              maxLength={500}
              rows={3}
              className="w-full bg-parch border border-bdr rounded-lg p-2.5 text-[12px] font-sans text-ink placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-blue/30"
            />
            {error && <p className="text-[12px] text-ruby">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={onClose} className="btn-secondary text-[12px] px-4 py-2">
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting}
                className="btn-primary text-[12px] px-4 py-2"
              >
                {submitting ? 'Submitting…' : 'Submit report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isOwnProfile = user?.uid === userId;

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [texts, setTexts] = useState<PublicText[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      setIsPrivate(false);
      try {
        let data: UserProfileData | null = null;
        if (isOwnProfile) {
          data = await fetchOwnProfile(userId);
        } else {
          data = await fetchPublicProfile(userId);
        }

        if (!data) {
          setIsPrivate(true);
          setLoading(false);
          return;
        }

        setProfile(data);

        if (data.isPublic || isOwnProfile) {
          try {
            const publicTexts = await fetchPublicTextsByAuthor(userId);
            setTexts(publicTexts);
          } catch {
            // non-fatal
          }
        }
      } catch {
        setIsPrivate(true);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId, isOwnProfile]);

  const handleBlock = async () => {
    if (!userId) return;
    setBlocking(true);
    try {
      await blockUser(userId);
      setBlocked(true);
    } catch {
      setBlocking(false);
    }
  };

  const initials = (profile?.displayName || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return (
      <div className="p-12 flex items-center justify-center min-h-screen">
        <div className="card px-6 py-4 text-sm font-medium text-ink2">Loading profile…</div>
      </div>
    );
  }

  if (isPrivate || blocked) {
    return (
      <div className="p-6 md:p-12 max-w-2xl mx-auto font-sans min-h-screen flex flex-col items-center justify-center gap-6 text-center">
        <div className="w-16 h-16 rounded-full bg-parch2 border border-bdr flex items-center justify-center">
          <Lock className="w-7 h-7 text-muted" />
        </div>
        <div>
          <h2 className="text-[22px] font-serif text-ink mb-2">
            {blocked ? 'User blocked' : 'Profile is private'}
          </h2>
          <p className="text-[14px] text-muted">
            {blocked
              ? 'You have blocked this user. They will no longer appear in Community.'
              : 'This scholar has not made their profile public yet.'}
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary flex items-center gap-2 px-5 py-2.5"
        >
          <ArrowLeft className="w-4 h-4" /> Go back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-12 max-w-3xl mx-auto font-sans min-h-screen pb-24">
      {showReport && userId && profile && (
        <ReportModal
          targetUid={userId}
          displayName={profile.displayName}
          onClose={() => setShowReport(false)}
        />
      )}

      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-[13px] text-muted hover:text-ink transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* ── Profile header ─────────────────────────────────────────────── */}
      <div className="card p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-blue/10 border-2 border-blue/20 flex items-center justify-center overflow-hidden shrink-0">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-blue">{initials}</span>
            )}
          </div>

          {/* Name + handle + bio */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-[24px] font-serif font-semibold text-ink leading-tight">
                {profile?.displayName || 'Scholar'}
              </h1>
              {!profile?.isPublic && isOwnProfile && (
                <span className="px-2 py-0.5 rounded-full bg-parch2 border border-bdr text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> Private
                </span>
              )}
              {profile?.isPublic && (
                <span className="px-2 py-0.5 rounded-full bg-blue/5 border border-blue/15 text-[10px] font-bold text-blue uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" /> Public
                </span>
              )}
            </div>

            {profile?.nickname && (
              <p className="text-[14px] font-mono text-muted mb-2">@{profile.nickname}</p>
            )}

            {profile?.bio && (
              <p className="text-[14px] text-ink2 leading-relaxed mb-3 max-w-md">{profile.bio}</p>
            )}

            {profile?.createdAt && (
              <p className="text-[11px] text-muted">
                Scholar since {formatDate(profile.createdAt)}
              </p>
            )}
          </div>

          {/* Own profile: edit button. Other profiles: report/block. */}
          {isOwnProfile ? (
            <button
              onClick={() => navigate('/app/settings')}
              className="btn-secondary flex items-center gap-2 px-4 py-2 text-[13px] shrink-0"
            >
              <Settings className="w-3.5 h-3.5" /> Edit Profile
            </button>
          ) : (
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={() => setShowReport(true)}
                className="btn-secondary flex items-center gap-2 px-4 py-2 text-[12px]"
              >
                <Flag className="w-3.5 h-3.5 text-amber" /> Report
              </button>
              <button
                onClick={handleBlock}
                disabled={blocking}
                className="flex items-center gap-2 px-4 py-2 text-[12px] font-medium text-ruby border border-ruby/20 rounded-lg hover:bg-ruby/5 transition-colors"
              >
                <UserX className="w-3.5 h-3.5" /> {blocking ? 'Blocking…' : 'Block'}
              </button>
            </div>
          )}
        </div>

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        {profile?.stats && (
          <div className="mt-6 pt-6 border-t border-bdr grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center p-3 rounded-xl bg-parch2/60">
              <div className="flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-4 h-4 text-blue" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Known words
                </span>
              </div>
              <span className="text-[22px] font-serif font-semibold text-ink">
                {profile.stats.totalKnown.toLocaleString()}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-parch2/60">
              <div className="flex items-center gap-1.5 mb-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Day streak
                </span>
              </div>
              <span className="text-[22px] font-serif font-semibold text-ink">
                {profile.stats.streak}
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-xl bg-parch2/60 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 mb-1">
                <BookOpen className="w-4 h-4 text-blue" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  Shared texts
                </span>
              </div>
              <span className="text-[22px] font-serif font-semibold text-ink">{texts.length}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Shared texts ───────────────────────────────────────────────── */}
      {texts.length > 0 && (
        <section className="card p-8">
          <h2 className="font-serif text-[18px] text-ink mb-5 pb-4 border-b border-bdr">
            Shared Texts
          </h2>
          <div className="space-y-3">
            {texts.map((text) => (
              <button
                key={text.id}
                onClick={() => navigate(`/app/reader/${text.id}`)}
                className="w-full flex items-start gap-4 p-4 rounded-xl hover:bg-parch2/70 border border-transparent hover:border-bdr transition-all text-left group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4 text-blue" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold text-ink group-hover:text-blue transition-colors truncate mb-0.5">
                    {text.title}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted">
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded-md font-mono bg-parch2 border border-bdr/50 text-[10px] uppercase tracking-wider'
                      )}
                    >
                      {text.languageId}
                    </span>
                    {text.stats?.totalWords && (
                      <span>{text.stats.totalWords.toLocaleString()} words</span>
                    )}
                    {text.createdAt && <span>{formatDate(text.createdAt)}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {texts.length === 0 && (profile?.isPublic || isOwnProfile) && (
        <div className="card p-8 text-center">
          <BookOpen className="w-8 h-8 text-muted mx-auto mb-3" />
          <p className="text-[14px] text-muted">
            {isOwnProfile
              ? "You haven't shared any texts yet. Import a text and set it to public to share with the community."
              : "This scholar hasn't shared any public texts yet."}
          </p>
          {isOwnProfile && (
            <button
              onClick={() => navigate('/app/import')}
              className="mt-4 btn-secondary px-5 py-2.5 text-[13px]"
            >
              Import a text
            </button>
          )}
        </div>
      )}

      {/* Support / abuse link */}
      {!isOwnProfile && (
        <div className="mt-8 pt-6 border-t border-bdr flex items-center justify-center gap-1.5 text-[12px] text-muted">
          <Mail className="w-3.5 h-3.5" />
          <span>Need help or want to report abuse?</span>
          <a href="mailto:support@paleoglossa.com" className="text-blue hover:underline">
            support@paleoglossa.com
          </a>
        </div>
      )}
    </div>
  );
};
