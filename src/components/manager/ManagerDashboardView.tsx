import { useEffect, useState } from "react";
import { Users, Activity, DollarSign, CheckCircle } from "lucide-react";
import { getManagerStats, getManagerPublishers, type ManagerStats, type ManagerPublisher } from "../../services/managers";

interface Props {
  managerId: string;
}

function fmt(n: number | string): string {
  const num = Number(n);
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}k`;
  return `$${num.toFixed(2)}`;
}

const statusColor = (s: string) => {
  const u = s.toUpperCase();
  if (u === "ACTIVE") return "bg-emerald-100 text-emerald-700";
  if (u === "PENDING") return "bg-amber-100 text-amber-700";
  if (u === "SUSPENDED") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
};

export function ManagerDashboardView({ managerId }: Props) {
  const [stats, setStats] = useState<ManagerStats | null>(null);
  const [publishers, setPublishers] = useState<ManagerPublisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!managerId) return;
    setLoading(true);
    Promise.all([getManagerStats(managerId), getManagerPublishers(managerId)])
      .then(([s, p]) => {
        setStats(s);
        setPublishers(p);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [managerId]);

  if (!managerId) {
    return (
      <div className="theme-bg-card border theme-border rounded-3xl p-8 text-center text-sm theme-text-muted">
        Session not initialised. Please log in again.
      </div>
    );
  }

  if (loading) {
    return <div className="theme-bg-card border theme-border rounded-3xl p-8 text-center text-sm theme-text-muted">Loading dashboard…</div>;
  }

  if (error) {
    return <div className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-sm text-rose-700">{error}</div>;
  }

  const metricCards = [
    { label: "Assigned Affiliates", value: String(stats?.assigned ?? 0), icon: <Users className="w-5 h-5" /> },
    { label: "Approved Affiliates", value: String(stats?.approved ?? 0), icon: <CheckCircle className="w-5 h-5" /> },
    { label: "Pending Affiliates", value: String(stats?.pending ?? 0), icon: <Activity className="w-5 h-5" /> },
    { label: "Clicks", value: String(stats?.total_clicks ?? 0), icon: <Activity className="w-5 h-5" /> },
    { label: "Conversions", value: String(stats?.total_conversions ?? 0), icon: <CheckCircle className="w-5 h-5" /> },
    { label: "Revenue", value: fmt(stats?.total_revenue ?? 0), icon: <DollarSign className="w-5 h-5" /> },
    { label: "Payout", value: fmt(stats?.total_payout ?? 0), icon: <DollarSign className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Dashboard</div>
        <h2 className="mt-2 text-2xl font-black theme-text-main">My Portfolio Overview</h2>
        <p className="mt-1 text-sm theme-text-muted">Live stats across your assigned affiliates.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((m) => (
          <div key={m.label} className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.22em] font-bold theme-text-muted">{m.label}</div>
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-2 text-cyan-600 dark:text-cyan-300">
                {m.icon}
              </div>
            </div>
            <div className="mt-4 text-3xl font-black theme-text-main">{m.value}</div>
          </div>
        ))}
      </div>

      <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Assigned Affiliates</div>
        <div className="mt-2 text-lg font-black theme-text-main">Recent publishers</div>

        {publishers.length === 0 ? (
          <p className="mt-4 text-sm theme-text-muted">No publishers assigned to you yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border theme-border">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  {["Publisher", "Country", "Status", "Joined"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-widest font-bold theme-text-secondary">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {publishers.slice(0, 10).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-sm theme-text-main">{p.full_name}</div>
                      <div className="text-xs font-mono theme-text-muted">{p.email}</div>
                    </td>
                    <td className="px-4 py-4 text-sm theme-text-main">{p.country_code ?? "—"}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusColor(p.account_status)}`}>
                        {p.account_status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-mono theme-text-muted">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
