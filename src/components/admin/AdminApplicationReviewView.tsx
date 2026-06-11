import { useEffect, useMemo, useState } from "react";
import { Search, CheckCircle2, XCircle, ClipboardList, Loader2 } from "lucide-react";

interface ApplicationRecord {
  id: string;
  offer_id: number;
  publisher_id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requested_at: string;
  comments?: string | null;
  submission_data?: Record<string, unknown> | null;
  rejection_reason?: string | null;
}

function authHeaders() {
  const token = localStorage.getItem("admin_token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

export function AdminApplicationReviewView() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [showRejectInput, setShowRejectInput] = useState<Record<string, boolean>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:3000/api/applications", {
          headers: authHeaders(),
        });
        if (!response.ok) throw new Error(`Failed to load applications: ${response.status}`);
        const data = await response.json();
        setApplications(Array.isArray(data.applications) ? data.applications : []);
      } catch (err: any) {
        setError(err.message || "Failed to load applications.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const handleApprove = async (applicationId: string) => {
    setActionLoading(applicationId);
    try {
      const response = await fetch(`http://localhost:3000/api/applications/${applicationId}/approve`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as any).message || "Failed to approve.");
      }
      setApplications(prev =>
        prev.map(a => a.id === applicationId ? { ...a, status: "APPROVED" as const } : a)
      );
    } catch (err: any) {
      alert(err.message || "Approval failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicationId: string) => {
    const reason = (rejectionReasons[applicationId] || "").trim();
    setActionLoading(applicationId);
    try {
      const response = await fetch(`http://localhost:3000/api/applications/${applicationId}/reject`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ rejection_reason: reason || "No reason provided." }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as any).message || "Failed to reject.");
      }
      setApplications(prev =>
        prev.map(a =>
          a.id === applicationId
            ? { ...a, status: "REJECTED" as const, rejection_reason: reason }
            : a
        )
      );
      setShowRejectInput(prev => ({ ...prev, [applicationId]: false }));
    } catch (err: any) {
      alert(err.message || "Rejection failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const visible = useMemo(() => {
    const q = filter.toLowerCase();
    return applications.filter(app => {
      const text = `${app.offer_id} ${app.publisher_id} ${app.comments ?? ""} ${app.status}`.toLowerCase();
      return !q || text.includes(q);
    });
  }, [applications, filter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">
            Application Review
          </div>
          <div className="mt-2 text-2xl font-black theme-text-main">
            Pending approvals and publisher requests
          </div>
        </div>

        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by offer ID, publisher, status…"
            className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-950 px-10 py-3 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-mono">Loading applications…</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-5 text-sm font-mono">
          {error}
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="theme-bg-well border theme-border rounded-3xl p-10 text-center text-slate-500 text-sm font-mono">
          No applications found.
        </div>
      )}

      {!loading && !error && visible.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {visible.map((app) => {
            const isActing = actionLoading === app.id;
            const trafficSource =
              typeof app.submission_data?.traffic_source === "string"
                ? app.submission_data.traffic_source
                : null;

            return (
              <div key={app.id} className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold theme-text-main font-mono">
                      Offer #{app.offer_id}
                    </div>
                    <div className="text-xs theme-text-muted font-mono truncate max-w-[220px]" title={app.publisher_id}>
                      Publisher: {app.publisher_id.slice(0, 8)}…
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full uppercase border ${
                      app.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : app.status === "REJECTED"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {app.status}
                    </span>
                    <span className="text-[10px] theme-text-muted font-mono">
                      {formatDate(app.requested_at)}
                    </span>
                  </div>
                </div>

                {app.comments && (
                  <div className="text-xs theme-text-muted leading-relaxed">
                    <span className="font-semibold theme-text-main">Promotion: </span>
                    {app.comments}
                  </div>
                )}

                {trafficSource && (
                  <div className="text-xs theme-text-muted">
                    <span className="font-semibold theme-text-main">Traffic Source: </span>
                    {trafficSource}
                  </div>
                )}

                {app.status === "REJECTED" && app.rejection_reason && (
                  <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl p-2.5 text-xs text-rose-700 dark:text-rose-400 font-mono">
                    Rejection reason: {app.rejection_reason}
                  </div>
                )}

                {app.status === "PENDING" && (
                  <div className="space-y-2 pt-1">
                    {showRejectInput[app.id] && (
                      <input
                        type="text"
                        placeholder="Rejection reason (optional)"
                        value={rejectionReasons[app.id] || ""}
                        onChange={(e) =>
                          setRejectionReasons(prev => ({ ...prev, [app.id]: e.target.value }))
                        }
                        className="w-full rounded-xl border theme-border bg-slate-50 dark:bg-slate-950 px-3 py-2 text-xs theme-text-main focus:outline-none focus:ring-1 focus:ring-rose-400 font-mono"
                      />
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(app.id)}
                        disabled={isActing}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
                      >
                        {isActing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Approve
                      </button>

                      {showRejectInput[app.id] ? (
                        <button
                          onClick={() => handleReject(app.id)}
                          disabled={isActing}
                          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                          {isActing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Confirm Reject
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            setShowRejectInput(prev => ({ ...prev, [app.id]: true }))
                          }
                          disabled={isActing}
                          className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-200 disabled:opacity-60 disabled:cursor-not-allowed transition"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="theme-bg-well border theme-border rounded-3xl p-5 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <ClipboardList className="w-4 h-4" />
          Review note
        </div>
        <div className="mt-3 text-slate-500 dark:text-slate-400">
          Approving an application creates an approved record in the system. The publisher will be able to generate tracking links for that offer immediately after approval.
        </div>
      </div>
    </div>
  );
}
