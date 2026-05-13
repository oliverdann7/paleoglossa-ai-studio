import { useState, useEffect } from "react";
import { Loader2, ShieldAlert, Users, FileText, Flag, Activity } from "lucide-react";
import { apiFetch } from "../../lib/services/apiFetch";

interface Overview { totalUsers: number; paidUsers: number; freeUsers: number; publicTextCount: number; openReports: number; recentAiCalls: number; }
interface Report { id: string; textId: string; reporterId: string; reason: string; status: string; createdAt?: string; }

export const AdminDashboard = () => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Overview>('/api/admin/overview').catch(() => null),
      apiFetch<Report[]>('/api/admin/reports').catch(() => []),
    ]).then(([ov, rp]) => {
      if (ov) setOverview(ov);
      setReports(rp);
    }).catch(() => setError('Failed to load admin data')).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin text-blue mx-auto" /></div>;
  if (error) return <div className="p-12 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6 md:p-12 max-w-5xl mx-auto font-sans min-h-screen">
      <h2 className="text-[28px] font-serif font-bold text-ink mb-2 flex items-center gap-3">
        <ShieldAlert className="w-7 h-7 text-blue" /> Admin Dashboard
      </h2>
      <p className="text-ink2 text-[15px] mb-8">Site overview and moderation.</p>

      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="card p-4"><Users className="w-5 h-5 text-blue mb-2" /><div className="text-[24px] font-bold">{overview.totalUsers}</div><div className="text-[11px] text-muted">Total Users</div></div>
          <div className="card p-4"><Activity className="w-5 h-5 text-emerald-500 mb-2" /><div className="text-[24px] font-bold">{overview.paidUsers}</div><div className="text-[11px] text-muted">Paid Users</div></div>
          <div className="card p-4"><FileText className="w-5 h-5 text-amber mb-2" /><div className="text-[24px] font-bold">{overview.publicTextCount}</div><div className="text-[11px] text-muted">Public Texts</div></div>
          <div className="card p-4"><Activity className="w-5 h-5 text-purple-500 mb-2" /><div className="text-[24px] font-bold">{overview.recentAiCalls}</div><div className="text-[11px] text-muted">Recent AI Calls</div></div>
          <div className="card p-4"><Flag className="w-5 h-5 text-red-400 mb-2" /><div className="text-[24px] font-bold">{overview.openReports}</div><div className="text-[11px] text-muted">Open Reports</div></div>
          <div className="card p-4"><Users className="w-5 h-5 text-muted mb-2" /><div className="text-[24px] font-bold">{overview.freeUsers}</div><div className="text-[11px] text-muted">Free Users</div></div>
        </div>
      )}

      {reports.length > 0 && (
        <div className="card p-6">
          <h3 className="text-[16px] font-bold text-ink mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.id} className="flex items-center justify-between p-3 bg-parch2 rounded-xl">
                <div>
                  <span className="text-[13px] font-medium text-ink">Text: {r.textId}</span>
                  <p className="text-[12px] text-ink2">{r.reason}</p>
                </div>
                <span className="text-[10px] uppercase font-bold text-muted">{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
