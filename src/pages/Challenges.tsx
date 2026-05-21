import { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Flame, BookOpen, Star, Crown, Loader2, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStats } from '../lib/hooks/useStats.js';
import { useActiveLanguage } from '../lib/hooks/useActiveLanguage.js';
import { fetchCommunityScholars } from '../lib/services/communityService.js';
import { ChallengeService } from '../lib/services/challengeService.js';
import type { PublicScholar } from '../types/social.js';
import { useAuth } from '../lib/hooks/useAuth.js';

// ─── Challenge definitions ─────────────────────────────────────────────────

interface ChallengeDef {
  id: string;
  title: string;
  desc: string;
  metric: 'weeklyWords' | 'streak' | 'totalKnown';
  target: number;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold';
}

const CHALLENGES: ChallengeDef[] = [
  { id: 'weekly-100', title: 'Novice Reader', desc: 'Read 100 words this week', metric: 'weeklyWords', target: 100, icon: '📖', tier: 'bronze' },
  { id: 'weekly-500', title: 'Diligent Scholar', desc: 'Read 500 words this week', metric: 'weeklyWords', target: 500, icon: '📚', tier: 'silver' },
  { id: 'weekly-2000', title: 'Voracious Reader', desc: 'Read 2,000 words this week', metric: 'weeklyWords', target: 2000, icon: '🏆', tier: 'gold' },
  { id: 'streak-7', title: 'Week of Study', desc: 'Maintain a 7-day streak', metric: 'streak', target: 7, icon: '🔥', tier: 'bronze' },
  { id: 'streak-30', title: 'Monthly Devotion', desc: 'Maintain a 30-day streak', metric: 'streak', target: 30, icon: '🌟', tier: 'silver' },
  { id: 'streak-100', title: 'Century Scholar', desc: 'Maintain a 100-day streak', metric: 'streak', target: 100, icon: '💎', tier: 'gold' },
  { id: 'vocab-100', title: 'Growing Lexicon', desc: 'Know 100 words by heart', metric: 'totalKnown', target: 100, icon: '🗝️', tier: 'bronze' },
  { id: 'vocab-500', title: 'Rich Vocabulary', desc: 'Know 500 words by heart', metric: 'totalKnown', target: 500, icon: '🏛️', tier: 'silver' },
  { id: 'vocab-2000', title: 'Lexical Mastery', desc: 'Know 2,000 words by heart', metric: 'totalKnown', target: 2000, icon: '🎓', tier: 'gold' },
];

const TIER_STYLES: Record<string, { badge: string; bar: string; ring: string }> = {
  bronze: { badge: 'bg-amber-100 text-amber-700 border-amber-200', bar: 'bg-amber-400', ring: 'ring-amber-200' },
  silver: { badge: 'bg-slate-100 text-slate-600 border-slate-200', bar: 'bg-slate-400', ring: 'ring-slate-200' },
  gold:   { badge: 'bg-yellow-50 text-yellow-700 border-yellow-200', bar: 'bg-yellow-400', ring: 'ring-yellow-200' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWeeklyWords(history: Array<{ date: string; readWords: number }>): number {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 7);
  return history
    .filter((h) => new Date(h.date) >= cutoff)
    .reduce((sum, h) => sum + (h.readWords || 0), 0);
}

function getMetricValue(
  metric: ChallengeDef['metric'],
  stats: { streak: number; totalKnown: number; history: any[] }
): number {
  if (metric === 'streak') return stats.streak;
  if (metric === 'totalKnown') return stats.totalKnown;
  return getWeeklyWords(stats.history);
}

// ─── Challenge card ───────────────────────────────────────────────────────────

function ChallengeCard({
  challenge,
  value,
  completedAt,
}: {
  challenge: ChallengeDef;
  value: number;
  completedAt?: string;
}) {
  const pct = Math.min(100, Math.round((value / challenge.target) * 100));
  const done = value >= challenge.target;
  const styles = TIER_STYLES[challenge.tier];

  return (
    <div
      className={cn(
        'card p-5 flex flex-col gap-3 transition-all',
        done && `ring-2 ${styles.ring}`
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{challenge.icon}</span>
          <div>
            <div className="text-[15px] font-serif font-bold text-ink leading-tight">
              {challenge.title}
            </div>
            <div className="text-[11px] text-muted mt-0.5">{challenge.desc}</div>
          </div>
        </div>
        <span className={cn('text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border shrink-0', styles.badge)}>
          {challenge.tier}
        </span>
      </div>
      <div>
        <div className="flex justify-between text-[11px] font-bold mb-1.5">
          <span className="text-ink3">
            {value.toLocaleString()} / {challenge.target.toLocaleString()}
          </span>
          {done ? (
            <span className="text-green-600 flex items-center gap-1" title={completedAt ? `Achieved ${new Date(completedAt).toLocaleDateString()}` : undefined}>
              <Star className="w-3 h-3 fill-current" /> {completedAt ? new Date(completedAt).toLocaleDateString() : 'Complete!'}
            </span>
          ) : (
            <span className="text-muted">{pct}%</span>
          )}
        </div>
        <div className="h-2 bg-parch3 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-700', done ? 'bg-green-500' : styles.bar)}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Leaderboard row ──────────────────────────────────────────────────────────

type LeaderMetric = 'streak' | 'totalKnown';

function LeaderRow({
  scholar,
  rank,
  metric,
  isCurrentUser,
}: {
  scholar: PublicScholar;
  rank: number;
  metric: LeaderMetric;
  isCurrentUser: boolean;
}) {
  const value = metric === 'streak' ? (scholar.stats?.streak ?? 0) : (scholar.stats?.totalKnown ?? 0);
  const initials = (scholar.displayName || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const rankStyle =
    rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-slate-400' : rank === 3 ? 'text-amber-600' : 'text-muted';

  return (
    <Link
      to={`/app/profile/${scholar.uid}`}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-parch2/60 transition-colors',
        isCurrentUser && 'bg-blue/5 ring-1 ring-blue/20'
      )}
    >
      <span className={cn('w-6 text-[13px] font-black text-center shrink-0', rankStyle)}>
        {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
      </span>
      {scholar.avatarUrl ? (
        <img src={scholar.avatarUrl} alt={scholar.displayName} className="w-9 h-9 rounded-full object-cover border border-bdr shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-blue/10 border border-bdr flex items-center justify-center shrink-0">
          <span className="text-[13px] font-bold text-blue">{initials}</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-serif font-semibold text-ink truncate">
          {scholar.displayName}
          {isCurrentUser && <span className="ml-1.5 text-[10px] font-sans text-blue">You</span>}
        </div>
        {scholar.nickname && (
          <div className="text-[11px] text-muted truncate">@{scholar.nickname}</div>
        )}
      </div>
      <div className="text-right shrink-0">
        <div className="text-[15px] font-bold text-ink">{value.toLocaleString()}</div>
        <div className="text-[9px] uppercase font-bold text-muted tracking-widest">
          {metric === 'streak' ? (
            <span className="flex items-center gap-0.5 justify-end">
              <Flame className="w-3 h-3 text-amber-500" /> days
            </span>
          ) : 'words'}
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function Challenges() {
  const { user } = useAuth();
  const { activeLanguageId } = useActiveLanguage();
  const { stats } = useStats(activeLanguageId);

  const [scholars, setScholars] = useState<PublicScholar[]>([]);
  const [loadingScholars, setLoadingScholars] = useState(true);
  const [leaderMetric, setLeaderMetric] = useState<LeaderMetric>('streak');
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard'>('challenges');
  const [completionMap, setCompletionMap] = useState<Record<string, string>>({});
  const recordedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchCommunityScholars()
      .then(setScholars)
      .catch(() => setScholars([]))
      .finally(() => setLoadingScholars(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    ChallengeService.getCompletions()
      .then((completions) => {
        const map: Record<string, string> = {};
        for (const c of completions) map[c.challengeId] = c.completedAt;
        setCompletionMap(map);
        for (const id of Object.keys(map)) recordedRef.current.add(id);
      })
      .catch(() => {});
  }, [user]);

  const userMetrics = useMemo(
    () => ({
      streak: stats.streak,
      totalKnown: stats.totalKnown,
      history: stats.history,
    }),
    [stats]
  );

  // Record newly-completed challenges to Firestore
  useEffect(() => {
    if (!user) return;
    void (async () => {
      const newEntries: Record<string, string> = {};
      const now = new Date().toISOString();
      for (const c of CHALLENGES) {
        if (recordedRef.current.has(c.id)) continue;
        const value = getMetricValue(c.metric, userMetrics);
        if (value >= c.target) {
          recordedRef.current.add(c.id);
          newEntries[c.id] = now;
          ChallengeService.recordCompletion(c.id, c.metric, value).catch(() => {});
        }
      }
      if (Object.keys(newEntries).length > 0) {
        setCompletionMap((prev) => ({ ...prev, ...newEntries }));
      }
    })();
  }, [userMetrics, user]);

  const sortedScholars = useMemo(() => {
    return [...scholars]
      .filter((s) => (leaderMetric === 'streak' ? s.stats?.streak : s.stats?.totalKnown))
      .sort((a, b) => {
        const av = leaderMetric === 'streak' ? (a.stats?.streak ?? 0) : (a.stats?.totalKnown ?? 0);
        const bv = leaderMetric === 'streak' ? (b.stats?.streak ?? 0) : (b.stats?.totalKnown ?? 0);
        return bv - av;
      })
      .slice(0, 50);
  }, [scholars, leaderMetric]);

  const completedCount = Object.keys(completionMap).length;

  return (
    <div className="p-6 md:p-12 max-w-4xl mx-auto min-h-screen">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-6 h-6 text-gold" />
          <h1 className="text-[32px] font-serif font-light text-ink tracking-tight">Challenges</h1>
        </div>
        <p className="font-body text-[15px] italic text-ink2">
          Track your reading goals and see how you rank among scholars.
        </p>
        {completedCount > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-1.5 rounded-full text-[12px] font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            {completedCount} of {CHALLENGES.length} challenges complete
          </div>
        )}
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {(['challenges', 'leaderboard'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-5 py-2 rounded-lg text-[13px] font-bold flex items-center gap-2 transition-all capitalize',
              activeTab === tab
                ? 'bg-ink text-parch shadow-md'
                : 'bg-white text-ink3 border border-bdr/40 hover:bg-parch'
            )}
          >
            {tab === 'challenges' ? <Trophy className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
            {tab}
          </button>
        ))}
      </div>

      {/* ── Challenges tab ──────────────────────────────────────────────── */}
      {activeTab === 'challenges' && (
        <>
          {(['weeklyWords', 'streak', 'totalKnown'] as const).map((metric) => {
            const group = CHALLENGES.filter((c) => c.metric === metric);
            const titles: Record<string, string> = {
              weeklyWords: 'Weekly Reading',
              streak: 'Consistency Streaks',
              totalKnown: 'Vocabulary Milestones',
            };
            const icons: Record<string, React.ReactNode> = {
              weeklyWords: <BookOpen className="w-4 h-4 text-blue" />,
              streak: <Flame className="w-4 h-4 text-amber-500" />,
              totalKnown: <Star className="w-4 h-4 text-gold" />,
            };
            return (
              <section key={metric} className="mb-10">
                <h2 className="flex items-center gap-2 font-serif text-[20px] font-bold text-ink mb-4">
                  {icons[metric]} {titles[metric]}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {group.map((c) => (
                    <ChallengeCard
                      key={c.id}
                      challenge={c}
                      value={getMetricValue(c.metric, userMetrics)}
                      completedAt={completionMap[c.id]}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}

      {/* ── Leaderboard tab ─────────────────────────────────────────────── */}
      {activeTab === 'leaderboard' && (
        <div>
          {/* Metric toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setLeaderMetric('streak')}
              className={cn(
                'px-4 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 transition-all border',
                leaderMetric === 'streak'
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-white text-ink3 border-bdr/40 hover:bg-parch'
              )}
            >
              <Flame className="w-3.5 h-3.5" /> Longest Streak
            </button>
            <button
              onClick={() => setLeaderMetric('totalKnown')}
              className={cn(
                'px-4 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 transition-all border',
                leaderMetric === 'totalKnown'
                  ? 'bg-blue/10 text-blue border-blue/30'
                  : 'bg-white text-ink3 border-bdr/40 hover:bg-parch'
              )}
            >
              <BookOpen className="w-3.5 h-3.5" /> Most Words Known
            </button>
          </div>

          {loadingScholars ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted" />
            </div>
          ) : sortedScholars.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <ChevronUp className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-[14px]">No scholars on the leaderboard yet. Start reading!</p>
            </div>
          ) : (
            <div className="card divide-y divide-bdr/20 overflow-hidden">
              {sortedScholars.map((scholar, i) => (
                <LeaderRow
                  key={scholar.uid}
                  scholar={scholar}
                  rank={i + 1}
                  metric={leaderMetric}
                  isCurrentUser={scholar.uid === user?.uid}
                />
              ))}
            </div>
          )}

          <p className="text-[11px] text-muted text-center mt-4 italic">
            Leaderboard shows scholars who have made their profile public.
          </p>
        </div>
      )}
    </div>
  );
}
