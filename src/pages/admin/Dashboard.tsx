import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Loader2,
  ShieldAlert,
  Users,
  FileText,
  Flag,
  Activity,
  Crown,
  UserCheck,
  UserX,
  LayoutDashboard,
  ChevronDown,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Shield,
  Clock,
  BookOpen,
  Trash2,
  Globe,
  Lock,
  Bug,
  BarChart3,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '../../lib/services/apiFetch.js';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Overview {
  totalUsers: number;
  paidUsers: number;
  freeUsers: number;
  publicTextCount: number;
  openReports: number;
  recentAiCalls: number;
}

interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  currentPlan: string;
  subscriptionStatus: string;
  isAdmin: boolean;
  createdAt: string | null;
  lastSignIn: string | null;
}

interface Report {
  id: string;
  textId: string;
  reporterId: string;
  reason: string;
  status: string;
  createdAt?: string;
}

interface ActivityEntry {
  id: string;
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  action: string;
  details?: string;
  timestamp: string;
}

interface AdminCourse {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  languageId: string;
  texts: any[];
  isPublic: boolean;
  memberCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

type Tab = 'overview' | 'users' | 'reports' | 'activity' | 'courses' | 'corpus-quality' | 'errors';

const PLANS = [
  { id: 'free', label: 'Free' },
  { id: 'basic_1', label: 'Basic' },
  { id: 'duo_2', label: 'Duo' },
  { id: 'full_all', label: 'Full Access' },
];

// ─── Corpus Quality types ─────────────────────────────────────────────────────

interface CorpusQualityMetrics {
  texts: number;
  sections: number;
  sentences: number;
  tokens: number;
  tokensWithGloss: number;
  tokensWithPos: number;
  tokensWithLemma: number;
  tokensWithMorphBeyondPos: number;
  unknownPosTokens: number;
}

interface LanguageQualityReport {
  language: string;
  metrics: CorpusQualityMetrics;
  glossCoverage: number;
  posCoverage: number;
  lemmaCoverage: number;
  morphCoverage: number;
  status: 'good' | 'needs_work' | 'poor';
  topMissingLemmas: { lemma: string; count: number }[];
}

interface CorpusQualityReport {
  generatedAt: string;
  totalLanguages: number;
  totalTexts: number;
  totalTokens: number;
  totalSections: number;
  totalSentences: number;
  languages: LanguageQualityReport[];
  topMissingLemmas: { lemma: string; count: number; language: string }[];
  topProblemLanguages: LanguageQualityReport[];
  needsAttention: LanguageQualityReport[];
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: React.ElementType;
  value: number | string;
  label: string;
  color: string;
}) {
  return (
    <div className="card p-5 flex flex-col gap-2">
      <Icon className={cn('w-5 h-5', color)} />
      <div className="text-[28px] font-bold text-ink leading-none">{value}</div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted">{label}</div>
    </div>
  );
}

// ─── PlanBadge ────────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan: string }) {
  const colors: Record<string, string> = {
    full_all: 'bg-blue/10 text-blue',
    duo_2: 'bg-emerald-50 text-emerald-700',
    basic_1: 'bg-amber-50 text-amber-700',
    free: 'bg-parch3 text-ink3',
  };
  const labels: Record<string, string> = {
    full_all: 'Full Access',
    duo_2: 'Duo',
    basic_1: 'Basic',
    free: 'Free',
  };
  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
        colors[plan] || colors.free
      )}
    >
      {labels[plan] || plan}
    </span>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab({ overview, reports }: { overview: Overview | null; reports: Report[] }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard
            icon={Users}
            value={overview.totalUsers}
            label={t('admin.statTotalUsers', 'Total Users')}
            color="text-blue"
          />
          <StatCard
            icon={Crown}
            value={overview.paidUsers}
            label={t('admin.statPaidUsers', 'Paid Users')}
            color="text-emerald-500"
          />
          <StatCard
            icon={Users}
            value={overview.freeUsers}
            label={t('admin.statFreeUsers', 'Free Users')}
            color="text-muted"
          />
          <StatCard
            icon={FileText}
            value={overview.publicTextCount}
            label={t('admin.statPublicTexts', 'Public Texts')}
            color="text-amber-500"
          />
          <StatCard
            icon={Activity}
            value={overview.recentAiCalls}
            label={t('admin.statRecentAiCalls', 'AI Calls')}
            color="text-purple-500"
          />
          <StatCard
            icon={Flag}
            value={overview.openReports}
            label={t('admin.statOpenReports', 'Open Reports')}
            color="text-red-400"
          />
        </div>
      )}

      {reports.length > 0 && (
        <div className="card p-6">
          <h3 className="text-[15px] font-bold text-ink mb-4 flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-400" /> {t('admin.recentReports', 'Recent Reports')}
          </h3>
          <div className="space-y-2">
            {reports.slice(0, 10).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-3 bg-parch2 rounded-xl"
              >
                <div>
                  <span className="text-[13px] font-medium text-ink">
                    {t('admin.textLabel', 'Text: {{id}}', { id: r.textId })}
                  </span>
                  <p className="text-[12px] text-ink2">{r.reason}</p>
                </div>
                <span
                  className={cn(
                    'text-[10px] uppercase font-bold px-2 py-0.5 rounded-full',
                    r.status === 'open' ? 'bg-red-50 text-red-600' : 'bg-parch3 text-muted'
                  )}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {reports.length === 0 && overview && (
        <div className="card p-8 text-center text-muted text-sm">No open reports.</div>
      )}
    </div>
  );
}

// ─── Users tab ────────────────────────────────────────────────────────────────

function UsersTab({ users, onRefresh }: { users: AdminUser[]; onRefresh: () => void }) {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [busy, setBusy] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.displayName || '').toLowerCase().includes(q);
    const matchesPlan = planFilter === 'all' || u.currentPlan === planFilter;
    return matchesSearch && matchesPlan;
  });

  const setPlan = async (uid: string, plan: string) => {
    setBusy(uid + '_plan');
    try {
      await apiFetch(`/api/admin/users/${uid}/set-plan`, { method: 'POST', body: { plan } });
      onRefresh();
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  };

  const toggleAdmin = async (uid: string, grant: boolean) => {
    setBusy(uid + '_admin');
    try {
      await apiFetch(`/api/admin/users/${uid}/set-admin`, { method: 'POST', body: { grant } });
      onRefresh();
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name…"
          className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-bdr bg-parch2 text-sm text-ink focus:outline-none focus:border-blue"
        />
        <div className="relative">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-bdr bg-parch2 text-sm text-ink focus:outline-none focus:border-blue cursor-pointer"
          >
            <option value="all">All plans</option>
            {PLANS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
        </div>
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg border border-bdr bg-parch2 hover:bg-parch3 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-muted" />
        </button>
      </div>

      <p className="text-[11px] text-muted">
        {filtered.length} user{filtered.length !== 1 ? 's' : ''}
      </p>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-bdr bg-parch2">
                <th className="text-left px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">
                  Plan
                </th>
                <th className="text-left px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider hidden md:table-cell">
                  Last Sign-in
                </th>
                <th className="text-left px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr
                  key={u.uid}
                  className={cn(
                    'border-b border-bdr/40 hover:bg-parch2/60 transition-colors',
                    i % 2 === 0 ? '' : 'bg-parch/30'
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-blue/10 border border-blue/20 flex items-center justify-center text-[10px] font-bold text-blue">
                          {(u.displayName || u.email || '?')[0].toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        {u.displayName && (
                          <div className="font-medium text-ink truncate max-w-[180px]">
                            {u.displayName}
                          </div>
                        )}
                        <div className="text-ink3 truncate max-w-[180px]">{u.email || u.uid}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <PlanBadge plan={u.currentPlan} />
                  </td>
                  <td className="px-4 py-3 text-ink3 hidden md:table-cell">
                    {u.lastSignIn ? new Date(u.lastSignIn).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {u.isAdmin ? (
                      <span className="flex items-center gap-1 text-blue text-[11px] font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" /> Admin
                      </span>
                    ) : (
                      <span className="text-muted text-[11px]">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Plan selector */}
                      <div className="relative">
                        <select
                          value={u.currentPlan}
                          onChange={(e) => setPlan(u.uid, e.target.value)}
                          disabled={busy === u.uid + '_plan'}
                          className="appearance-none text-[11px] pl-2 pr-6 py-1 rounded-lg border border-bdr bg-white hover:bg-parch2 transition-colors cursor-pointer focus:outline-none focus:border-blue disabled:opacity-50"
                        >
                          {PLANS.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted pointer-events-none" />
                      </div>

                      {/* Toggle admin */}
                      <button
                        onClick={() => toggleAdmin(u.uid, !u.isAdmin)}
                        disabled={busy === u.uid + '_admin'}
                        title={u.isAdmin ? 'Revoke admin' : 'Grant admin'}
                        className={cn(
                          'p-1.5 rounded-lg border transition-colors disabled:opacity-50',
                          u.isAdmin
                            ? 'border-red-200 hover:bg-red-50 text-red-500'
                            : 'border-blue/20 hover:bg-blue/5 text-blue'
                        )}
                      >
                        {busy === u.uid + '_admin' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : u.isAdmin ? (
                          <UserX className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-8 text-center text-muted text-sm">
              No users match the current filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reports tab ──────────────────────────────────────────────────────────────

function ReportsTab({ reports, onRefresh }: { reports: Report[]; onRefresh: () => void }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<string | null>(null);

  const moderate = async (id: string, action: 'hide' | 'restore') => {
    setBusy(id);
    try {
      await apiFetch(`/api/admin/publicTexts/${id}/${action}`, { method: 'POST' });
      onRefresh();
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  };

  if (reports.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Flag className="w-8 h-8 text-muted mx-auto mb-3" />
        <p className="text-muted text-sm">No reports to review.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-bdr flex items-center justify-between">
        <h3 className="font-bold text-ink">
          {t('admin.recentReports', 'Recent Reports')} ({reports.length})
        </h3>
        <button onClick={onRefresh} className="p-1.5 rounded-lg hover:bg-parch3 transition-colors">
          <RefreshCw className="w-4 h-4 text-muted" />
        </button>
      </div>
      <div className="divide-y divide-bdr/40">
        {reports.map((r) => (
          <div key={r.id} className="flex items-start justify-between gap-4 p-4 hover:bg-parch2/50">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-semibold text-ink">
                  {t('admin.textLabel', 'Text: {{id}}', { id: r.textId })}
                </span>
                <span
                  className={cn(
                    'text-[10px] uppercase font-bold px-2 py-0.5 rounded-full',
                    r.status === 'open' ? 'bg-red-50 text-red-600' : 'bg-parch3 text-muted'
                  )}
                >
                  {r.status}
                </span>
              </div>
              <p className="text-[12px] text-ink2">{r.reason}</p>
              {r.createdAt && (
                <p className="text-[11px] text-muted mt-1">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => moderate(r.textId, 'hide')}
                disabled={busy === r.id}
                title="Hide text"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-[12px] font-medium transition-colors disabled:opacity-50"
              >
                {busy === r.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
                Hide
              </button>
              <button
                onClick={() => moderate(r.textId, 'restore')}
                disabled={busy === r.id}
                title="Restore text"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue/20 text-blue hover:bg-blue/5 text-[12px] font-medium transition-colors disabled:opacity-50"
              >
                {busy === r.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                Restore
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Action config ────────────────────────────────────────────────────────────

const ACTION_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  sign_up: { label: 'Signed up', icon: Users, color: 'text-blue' },
  ai_call: { label: 'AI call', icon: Activity, color: 'text-purple-500' },
  create_text: { label: 'Created text', icon: FileText, color: 'text-amber-500' },
  report: { label: 'Reported', icon: Flag, color: 'text-red-400' },
};

// ─── Activities tab ───────────────────────────────────────────────────────────

function ActivitiesTab({ activities, loading }: { activities: ActivityEntry[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Activity className="w-8 h-8 text-muted mx-auto mb-3" />
        <p className="text-muted text-sm">No recent activity.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((a) => {
        const meta = ACTION_META[a.action] || { label: a.action, icon: Clock, color: 'text-muted' };
        const Icon = meta.icon;
        return (
          <div
            key={a.id}
            className="flex items-start gap-4 p-4 rounded-xl hover:bg-parch2/50 transition-colors"
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-parch2 border border-bdr',
                meta.color
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                {a.photoURL ? (
                  <img src={a.photoURL} alt="" className="w-5 h-5 rounded-full" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-blue/10 flex items-center justify-center text-[8px] font-bold text-blue shrink-0">
                    {(a.displayName || a.email || '?')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-[13px] font-medium text-ink truncate">
                  {a.displayName || a.email || a.uid}
                </span>
                <span className="text-[12px] text-muted">{meta.label}</span>
              </div>
              {a.details && <p className="text-[12px] text-ink2 mt-0.5 truncate">{a.details}</p>}
              <p className="text-[11px] text-muted mt-0.5">
                {new Date(a.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Courses tab ──────────────────────────────────────────────────────────────

function CoursesTab({
  courses,
  loading,
  onRefresh,
}: {
  courses: AdminCourse[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState<string | null>(null);

  const deleteCourse = async (courseId: string) => {
    if (!window.confirm('Delete this course? This action cannot be undone.')) return;
    setBusy(courseId);
    try {
      await apiFetch(`/api/admin/courses/${courseId}`, { method: 'DELETE' });
      onRefresh();
    } catch {
      /* ignore */
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue" />
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="card p-12 text-center">
        <BookOpen className="w-8 h-8 text-muted mx-auto mb-3" />
        <p className="text-muted text-sm">No courses created yet.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-bdr flex items-center justify-between">
        <h3 className="font-bold text-ink">
          {t('admin.courses', 'Courses')} ({courses.length})
        </h3>
        <button onClick={onRefresh} className="p-1.5 rounded-lg hover:bg-parch3 transition-colors">
          <RefreshCw className="w-4 h-4 text-muted" />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-bdr bg-parch2">
              <th className="text-left px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">
                Title
              </th>
              <th className="text-left px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider hidden md:table-cell">
                Owner
              </th>
              <th className="text-left px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">
                Language
              </th>
              <th className="text-left px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">
                Texts
              </th>
              <th className="text-left px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">
                Members
              </th>
              <th className="text-left px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, i) => (
              <tr
                key={c.id}
                className={cn(
                  'border-b border-bdr/40 hover:bg-parch2/60 transition-colors',
                  i % 2 === 0 ? '' : 'bg-parch/30'
                )}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-ink truncate max-w-[200px]">{c.title}</div>
                  {c.description && (
                    <div className="text-ink3 text-[12px] truncate max-w-[200px]">
                      {c.description}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-ink3 text-[12px] hidden md:table-cell truncate max-w-[140px]">
                  {c.ownerId}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full bg-parch3 text-ink3 text-[10px] font-bold uppercase">
                    {c.languageId}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink3">{c.texts?.length ?? 0}</td>
                <td className="px-4 py-3 text-ink3">{c.memberCount}</td>
                <td className="px-4 py-3">
                  {c.isPublic ? (
                    <span className="flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
                      <Globe className="w-3 h-3" /> Public
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-muted text-[11px]">
                      <Lock className="w-3 h-3" /> Private
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => deleteCourse(c.id)}
                    disabled={busy === c.id}
                    className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete course"
                  >
                    {busy === c.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Corpus Quality tab ───────────────────────────────────────────────────────

function QualityBadge({ status }: { status: 'good' | 'needs_work' | 'poor' }) {
  const styles: Record<string, string> = {
    good: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    needs_work: 'bg-amber-50 text-amber-700 border-amber-200',
    poor: 'bg-red-50 text-red-600 border-red-200',
  };
  const labels: Record<string, string> = {
    good: 'Good',
    needs_work: 'Needs Work',
    poor: 'Poor',
  };
  const icons: Record<string, React.ElementType> = {
    good: CheckCircle2,
    needs_work: AlertTriangle,
    poor: XCircle,
  };
  const Icon = icons[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border',
        styles[status]
      )}
    >
      <Icon className="w-3 h-3" /> {labels[status]}
    </span>
  );
}

function CorpusQualityTab({
  data,
  loading,
}: {
  data: CorpusQualityReport | null;
  loading: boolean;
}) {
  const [langFilter, setLangFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortKey, setSortKey] = useState<'gloss' | 'pos' | 'morph'>('gloss');

  const exportJson = useCallback(() => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corpus-quality-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const exportMarkdown = useCallback(() => {
    if (!data) return;
    let md = `# Corpus Quality Report\n\n`;
    md += `Generated at: ${data.generatedAt}\n\n`;
    md += `## Summary\n\n`;
    md += `| Language | Texts | Tokens | Gloss % | POS % | Lemma % | Morph % | Status |\n`;
    md += `|---|---|---|---|---|---|---|---|\n`;
    for (const lang of data.languages) {
      md += `| ${lang.language} | ${lang.metrics.texts} | ${lang.metrics.tokens} | ${lang.glossCoverage}% | ${lang.posCoverage}% | ${lang.lemmaCoverage}% | ${lang.morphCoverage}% | ${lang.status} |\n`;
    }
    md += `\n## Needs Attention\n\n`;
    for (const lang of data.needsAttention) {
      md += `- ${lang.language} (${lang.status}) — Gloss: ${lang.glossCoverage}%, POS: ${lang.posCoverage}%, Morph: ${lang.morphCoverage}%\n`;
    }
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `corpus-quality-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="card p-12 text-center">
        <BarChart3 className="w-8 h-8 text-muted mx-auto mb-3" />
        <p className="text-muted text-sm">Could not load corpus quality data.</p>
      </div>
    );
  }

  const langOptions = Array.from(new Set(data.languages.map((l) => l.language))).sort();

  let filtered = data.languages.filter((l) => {
    if (langFilter !== 'all' && l.language !== langFilter) return false;
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    const aVal = sortKey === 'gloss' ? a.glossCoverage : sortKey === 'pos' ? a.posCoverage : a.morphCoverage;
    const bVal = sortKey === 'gloss' ? b.glossCoverage : sortKey === 'pos' ? b.posCoverage : b.morphCoverage;
    return aVal - bVal;
  });

  return (
    <div className="space-y-8">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card p-4 flex flex-col gap-1">
          <BarChart3 className="w-4 h-4 text-blue" />
          <div className="text-[22px] font-bold text-ink leading-none">{data.totalLanguages}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Languages</div>
        </div>
        <div className="card p-4 flex flex-col gap-1">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <div className="text-[22px] font-bold text-ink leading-none">{data.totalTexts}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Texts</div>
        </div>
        <div className="card p-4 flex flex-col gap-1">
          <FileText className="w-4 h-4 text-purple-500" />
          <div className="text-[22px] font-bold text-ink leading-none">{data.totalSections}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Sections</div>
        </div>
        <div className="card p-4 flex flex-col gap-1">
          <FileText className="w-4 h-4 text-emerald-500" />
          <div className="text-[22px] font-bold text-ink leading-none">{data.totalSentences}</div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Sentences</div>
        </div>
        <div className="card p-4 flex flex-col gap-1">
          <FileText className="w-4 h-4 text-blue" />
          <div className="text-[22px] font-bold text-ink leading-none">
            {data.totalTokens.toLocaleString()}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Tokens</div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Language filter */}
          <div className="relative">
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-bdr bg-parch2 text-sm text-ink focus:outline-none focus:border-blue cursor-pointer"
            >
              <option value="all">All languages</option>
              {langOptions.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-bdr bg-parch2 text-sm text-ink focus:outline-none focus:border-blue cursor-pointer"
            >
              <option value="all">All statuses</option>
              <option value="good">Good</option>
              <option value="needs_work">Needs Work</option>
              <option value="poor">Poor</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as 'gloss' | 'pos' | 'morph')}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-bdr bg-parch2 text-sm text-ink focus:outline-none focus:border-blue cursor-pointer"
            >
              <option value="gloss">Sort by Gloss %</option>
              <option value="pos">Sort by POS %</option>
              <option value="morph">Sort by Morph %</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none" />
          </div>
        </div>

        {/* Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={exportJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-bdr hover:bg-parch3 text-[13px] font-medium text-ink3 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download JSON
          </button>
          <button
            onClick={exportMarkdown}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-bdr hover:bg-parch3 text-[13px] font-medium text-ink3 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download MD
          </button>
        </div>
      </div>

      {/* Per-language table */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-bdr flex items-center justify-between">
          <h3 className="font-bold text-ink">
            Languages ({filtered.length}/{data.languages.length})
          </h3>
          <span className="text-[11px] text-muted">
            Sorted by {sortKey === 'gloss' ? 'gloss' : sortKey === 'pos' ? 'POS' : 'morph'} coverage (asc)
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-bdr bg-parch2">
                <th className="text-left px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">Language</th>
                <th className="text-right px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">Texts</th>
                <th className="text-right px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">Tokens</th>
                <th className="text-right px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">Gloss %</th>
                <th className="text-right px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">POS %</th>
                <th className="text-right px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">Lemma %</th>
                <th className="text-right px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">Morph %</th>
                <th className="text-center px-4 py-3 font-semibold text-ink3 text-[11px] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted text-sm">
                    No languages match current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((lang, i) => (
                  <tr
                    key={lang.language}
                    className={cn(
                      'border-b border-bdr/40 hover:bg-parch2/60 transition-colors',
                      i % 2 === 0 ? '' : 'bg-parch/30'
                    )}
                  >
                    <td className="px-4 py-3 font-medium text-ink">{lang.language}</td>
                    <td className="px-4 py-3 text-right text-ink2">{lang.metrics.texts}</td>
                    <td className="px-4 py-3 text-right text-ink2">{lang.metrics.tokens.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono">{lang.glossCoverage}%</td>
                    <td className="px-4 py-3 text-right font-mono">{lang.posCoverage}%</td>
                    <td className="px-4 py-3 text-right font-mono">{lang.lemmaCoverage}%</td>
                    <td className="px-4 py-3 text-right font-mono">{lang.morphCoverage}%</td>
                    <td className="px-4 py-3 text-center">
                      <QualityBadge status={lang.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Needs Attention */}
      {data.needsAttention.length > 0 && (
        <div className="card p-6">
          <h3 className="text-[15px] font-bold text-ink flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Needs Attention
          </h3>
          <div className="space-y-2">
            {data.needsAttention.map((lang) => (
              <div
                key={lang.language}
                className="flex items-center justify-between p-3 bg-parch2 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-ink text-[13px]">{lang.language}</span>
                  <QualityBadge status={lang.status} />
                </div>
                <div className="flex items-center gap-4 text-[12px] text-ink2">
                  <span>Gloss: {lang.glossCoverage}%</span>
                  <span>POS: {lang.posCoverage}%</span>
                  <span>Morph: {lang.morphCoverage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top missing lemmas */}
      {data.topMissingLemmas.length > 0 && (
        <div className="card p-6">
          <h3 className="text-[15px] font-bold text-ink flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-purple-500" /> Top Missing Lemma/POS
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-bdr">
                  <th className="text-left px-3 py-2 font-semibold text-ink3 text-[11px] uppercase tracking-wider">Lemma</th>
                  <th className="text-right px-3 py-2 font-semibold text-ink3 text-[11px] uppercase tracking-wider">Count</th>
                  <th className="text-left px-3 py-2 font-semibold text-ink3 text-[11px] uppercase tracking-wider">Language</th>
                </tr>
              </thead>
              <tbody>
                {data.topMissingLemmas.map((m, i) => (
                  <tr key={`${m.language}-${m.lemma}`} className={cn('border-b border-bdr/40', i % 2 === 0 ? '' : 'bg-parch/30')}>
                    <td className="px-3 py-2 font-mono text-ink">{m.lemma}</td>
                    <td className="px-3 py-2 text-right text-ink2">{m.count}</td>
                    <td className="px-3 py-2 text-ink2">{m.language}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Errors tab ───────────────────────────────────────────────────────────────

interface ErrorLogEntry {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  userId?: string;
}

interface ErrorStats {
  total: number;
  last24h: number;
  lastHour: number;
}

function ErrorsTab() {
  const [entries, setEntries] = useState<ErrorLogEntry[]>([]);
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ stats: ErrorStats; errors: ErrorLogEntry[] }>('/api/admin/errors');
      setStats(data.stats);
      setEntries(data.errors);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearAll = async () => {
    if (!window.confirm('Clear all error log entries?')) return;
    setClearing(true);
    try {
      await apiFetch('/api/admin/errors', { method: 'DELETE' });
      setEntries([]);
      setStats({ total: 0, last24h: 0, lastHour: 0 });
    } catch {
      /* ignore */
    } finally {
      setClearing(false);
    }
  };

  useEffect(() => {
    (async () => { await load(); })();
  }, [load]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 flex flex-col gap-1">
            <Bug className="w-4 h-4 text-red-400" />
            <div className="text-[22px] font-bold text-ink leading-none">{stats.total}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Buffered</div>
          </div>
          <div className="card p-4 flex flex-col gap-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <div className="text-[22px] font-bold text-ink leading-none">{stats.last24h}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Last 24h</div>
          </div>
          <div className="card p-4 flex flex-col gap-1">
            <Activity className="w-4 h-4 text-purple-500" />
            <div className="text-[22px] font-bold text-ink leading-none">{stats.lastHour}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted">Last Hour</div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted">
          {entries.length} error{entries.length !== 1 ? 's' : ''} (most recent first)
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 rounded-lg border border-bdr bg-parch2 hover:bg-parch3 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4 text-muted" />
          </button>
          <button
            onClick={clearAll}
            disabled={clearing || entries.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 text-[13px] font-medium transition-colors disabled:opacity-40"
          >
            {clearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Clear all
          </button>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <p className="text-muted text-sm">No server errors in the current buffer.</p>
        </div>
      ) : (
        <div className="card divide-y divide-bdr/40">
          {entries.map((e) => (
            <div key={e.id} className="p-4 hover:bg-parch2/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {e.method && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-parch3 text-ink3 uppercase">
                        {e.method}
                      </span>
                    )}
                    {e.route && <span className="text-[12px] font-mono text-ink2">{e.route}</span>}
                    {e.statusCode && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-500">
                        {e.statusCode}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] font-medium text-ink break-words">{e.message}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted">
                    <span>{new Date(e.timestamp).toLocaleString()}</span>
                    {e.userId && <span>uid: {e.userId}</span>}
                  </div>
                </div>
                {e.stack && (
                  <button
                    onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                    className="shrink-0 p-1.5 rounded-lg border border-bdr hover:bg-parch3 transition-colors"
                    title={expanded === e.id ? 'Collapse stack' : 'Expand stack'}
                  >
                    <ChevronDown
                      className={cn(
                        'w-3.5 h-3.5 text-muted transition-transform',
                        expanded === e.id ? 'rotate-180' : ''
                      )}
                    />
                  </button>
                )}
              </div>
              {expanded === e.id && e.stack && (
                <pre className="mt-3 p-3 bg-parch3 rounded-lg text-[11px] font-mono text-ink2 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed">
                  {e.stack}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export const AdminDashboard = () => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('overview');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [corpusQualityData, setCorpusQualityData] = useState<CorpusQualityReport | null>(null);
  const [corpusQualityLoading, setCorpusQualityLoading] = useState(false);

  const loadOverview = useCallback(async () => {
    const [ov, rp] = await Promise.all([
      apiFetch<Overview>('/api/admin/overview').catch(() => null),
      apiFetch<Report[]>('/api/admin/reports').catch(() => [] as Report[]),
    ]);
    if (ov) setOverview(ov);
    setReports(rp as Report[]);
  }, []);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await apiFetch<AdminUser[]>('/api/admin/users');
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const loadCorpusQuality = useCallback(async () => {
    setCorpusQualityLoading(true);
    try {
      const data = await apiFetch<CorpusQualityReport>('/api/admin/corpus-quality');
      setCorpusQualityData(data);
    } catch {
      setCorpusQualityData(null);
    } finally {
      setCorpusQualityLoading(false);
    }
  }, []);

  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const data = await apiFetch<AdminCourse[]>('/api/admin/courses');
      setCourses(data);
    } catch {
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) setIsLoading(true);
      try {
        await loadOverview();
      } catch {
        if (!cancelled) setError(t('admin.loadError', 'Failed to load admin data'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadOverview, t]);

  const loadActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const data = await apiFetch<ActivityEntry[]>('/api/admin/activities');
      setActivities(data);
    } catch {
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'users' && users.length === 0) {
      (async () => {
        await loadUsers();
      })();
    }
  }, [tab, users.length, loadUsers]);

  useEffect(() => {
    if (tab === 'activity' && activities.length === 0) {
      (async () => {
        await loadActivities();
      })();
    }
  }, [tab, activities.length, loadActivities]);

  useEffect(() => {
    if (tab === 'courses' && courses.length === 0) {
      (async () => {
        await loadCourses();
      })();
    }
  }, [tab, courses.length, loadCourses]);

  useEffect(() => {
    if (tab === 'corpus-quality' && !corpusQualityData) {
      (async () => {
        await loadCorpusQuality();
      })();
    }
  }, [tab, corpusQualityData, loadCorpusQuality]);

  const handleRefresh = () => {
    loadOverview();
    if (tab === 'users') loadUsers();
    if (tab === 'activity') loadActivities();
    if (tab === 'courses') loadCourses();
    if (tab === 'corpus-quality') loadCorpusQuality();
  };

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center">
        <ShieldAlert className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-500 font-medium">{error}</p>
        <p className="text-muted text-sm mt-1">
          You may not have admin access, or the server is unavailable.
        </p>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users, badge: overview?.totalUsers },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'reports', label: 'Reports', icon: Flag, badge: overview?.openReports || undefined },
    { id: 'corpus-quality', label: 'Corpus Quality', icon: BarChart3 },
    { id: 'errors', label: 'Errors', icon: Bug },
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto font-sans min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-[26px] font-serif font-bold text-ink flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue" />
            {t('admin.title', 'Admin Dashboard')}
          </h2>
          <p className="text-ink2 text-[14px] mt-1">
            {t('admin.description', 'Site overview and moderation.')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/firebase-debug"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-bdr hover:bg-parch3 text-[13px] font-medium text-ink3 transition-colors"
          >
            <Bug className="w-3.5 h-3.5" /> Firebase Debug
          </Link>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-bdr hover:bg-parch3 text-[13px] font-medium text-ink3 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-bdr">
        {TABS.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-[13px] font-medium border-b-2 -mb-px transition-colors',
              tab === id
                ? 'border-blue text-blue'
                : 'border-transparent text-ink3 hover:text-ink hover:border-bdr'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
            {badge !== undefined && badge > 0 && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                  id === 'reports' ? 'bg-red-100 text-red-600' : 'bg-blue/10 text-blue'
                )}
              >
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && <OverviewTab overview={overview} reports={reports} />}
      {tab === 'users' &&
        (usersLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-blue" />
          </div>
        ) : (
          <UsersTab users={users} onRefresh={loadUsers} />
        ))}
      {tab === 'activity' && <ActivitiesTab activities={activities} loading={activitiesLoading} />}
      {tab === 'reports' && <ReportsTab reports={reports} onRefresh={() => loadOverview()} />}
      {tab === 'courses' && (
        <CoursesTab courses={courses} loading={coursesLoading} onRefresh={loadCourses} />
      )}
      {tab === 'corpus-quality' && (
        <CorpusQualityTab data={corpusQualityData} loading={corpusQualityLoading} />
      )}
      {tab === 'errors' && <ErrorsTab />}
    </div>
  );
};
