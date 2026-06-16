import { useEffect, useState } from "react";
import { getManagerApplications, type ManagerApplication } from "../../services/managers";

interface Props {
  managerId: string;
}

function statusBadge(status: string) {
  const s = status.toUpperCase();
  if (s === "APPROVED") return "bg-emerald-100 text-emerald-700";
  if (s === "REJECTED") return "bg-rose-100 text-rose-700";
  return "bg-amber-100 text-amber-700";
}

export function ManagerOfferApprovalView({ managerId }: Props) {
  const [applications, setApplications] = useState<ManagerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!managerId) return;
    setLoading(true);
    getManagerApplications(managerId)
      .then(setApplications)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load requests"))
      .finally(() => setLoading(false));
  }, [managerId]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Offer Requests</div>
        <div className="mt-2 text-2xl font-black theme-text-main">Pending Offer Access Requests</div>
        <p className="mt-1 text-sm theme-text-muted">
          Offer access requests from your assigned publishers. Final approval is made by Admin.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-sm text-rose-700">{error}</div>
      )}

      {loading ? (
        <div className="theme-bg-card border theme-border rounded-3xl p-8 text-center text-sm theme-text-muted">Loading requests…</div>
      ) : applications.length === 0 ? (
        <div className="theme-bg-card border theme-border rounded-3xl p-8 text-center text-sm theme-text-muted">
          No pending offer requests from your assigned publishers.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {["Offer", "Publisher", "Status", "Submitted", "Notes"].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-[10px] uppercase tracking-widest font-bold theme-text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {applications.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                  <td className="px-6 py-5">
                    <div className="font-semibold text-sm theme-text-main">{a.offer_name}</div>
                    <div className="text-xs font-mono theme-text-muted">ID: {a.offer_id}</div>
                  </td>
                  <td className="px-6 py-5 text-sm theme-text-main">{a.publisher_name}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(a.status)}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-xs font-mono theme-text-muted">
                    {new Date(a.requested_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 text-xs theme-text-muted max-w-xs">
                    <p className="truncate">{a.comments || <span className="italic">None</span>}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="theme-bg-card border theme-border rounded-3xl p-5">
        <p className="text-xs theme-text-muted">
          Manager note: You can view offer requests from your assigned publishers here. To approve or reject, use the Offer Applications section in the Admin panel.
        </p>
      </div>
    </div>
  );
}
