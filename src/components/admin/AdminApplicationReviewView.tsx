import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  AlertCircle,
  Tag,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppStatus = "PENDING" | "APPROVED" | "REJECTED";
type TabKey = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

interface EnrichedApplication {
  id: string;
  offer_id: number;
  publisher_id: string;
  status: AppStatus;
  requested_at: string;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  comments?: string | null;
  submission_data?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  offer_name?: string | null;
  offer_logo_url?: string | null;
  publisher_full_name?: string | null;
  publisher_company_name?: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

const TABS: { key: TabKey; label: string }[] = [
  { key: "ALL",      label: "All"      },
  { key: "PENDING",  label: "Pending"  },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function authHeaders() {
  const token = localStorage.getItem("admin_token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch {
    return iso?.substring(0, 10) ?? "—";
  }
}

function fmtKey(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

const STATUS_BADGE: Record<AppStatus, string> = {
  PENDING:  "bg-amber-100 text-amber-700 border border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  REJECTED: "bg-rose-100 text-rose-700 border border-rose-200",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminApplicationReviewView() {

  // ── Data ─────────────────────────────────────────────────────────────────────
  const [applications, setApplications] = useState<EnrichedApplication[]>([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState<string | null>(null);

  // ── Filters / pagination ─────────────────────────────────────────────────────
  const [tab, setTab]       = useState<TabKey>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);

  // ── Row-level errors (approve failures) ──────────────────────────────────────
  const [rowErrors, setRowErrors]         = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Dropdown ─────────────────────────────────────────────────────────────────
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // ── Questionnaire modal ───────────────────────────────────────────────────────
  const [questApp, setQuestApp] = useState<EnrichedApplication | null>(null);

  // ── Reject modal ─────────────────────────────────────────────────────────────
  const [rejectApp, setRejectApp]       = useState<EnrichedApplication | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectError, setRejectError]   = useState<string | null>(null);

  const rejectReasonRef = useRef<HTMLTextAreaElement>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────────

  function load() {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    fetch("http://localhost:3000/api/applications", { headers: authHeaders() })
      .then(r => {
        if (!r.ok) return r.json().then(d => { throw new Error(d.message || `Error ${r.status}`); });
        return r.json();
      })
      .then((data: { applications: EnrichedApplication[] }) => {
        if (!cancelled) setApplications(Array.isArray(data.applications) ? data.applications : []);
      })
      .catch(err => {
        if (!cancelled) setFetchError((err as Error).message || "Failed to load applications.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => load(), []);

  // Reset page when tab or search changes
  useEffect(() => { setPage(1); }, [tab, search]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openDropdown) return;
    const handler = () => setOpenDropdown(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [openDropdown]);

  // Focus reject reason textarea when modal opens
  useEffect(() => {
    if (rejectApp) setTimeout(() => rejectReasonRef.current?.focus(), 50);
  }, [rejectApp]);

  // ── Computed ─────────────────────────────────────────────────────────────────

  const counts = useMemo(() => ({
    ALL:      applications.length,
    PENDING:  applications.filter(a => a.status === "PENDING").length,
    APPROVED: applications.filter(a => a.status === "APPROVED").length,
    REJECTED: applications.filter(a => a.status === "REJECTED").length,
  }), [applications]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return applications.filter(app => {
      if (tab !== "ALL" && app.status !== tab) return false;
      if (!q) return true;
      const hay = [
        app.offer_name,
        app.publisher_full_name,
        app.publisher_company_name,
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [applications, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSlice  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Questionnaire items ───────────────────────────────────────────────────────

  function questItems(app: EnrichedApplication): { label: string; value: string }[] {
    const items: { label: string; value: string }[] = [];
    if (app.comments) {
      items.push({ label: "Promotion Method", value: app.comments });
    }
    if (app.submission_data) {
      const seen = new Set(items.map(i => i.label.toLowerCase()));
      for (const [key, val] of Object.entries(app.submission_data)) {
        if (val !== null && val !== undefined && String(val).trim() !== "") {
          const label = fmtKey(key);
          if (!seen.has(label.toLowerCase())) {
            items.push({ label, value: String(val) });
            seen.add(label.toLowerCase());
          }
        }
      }
    }
    return items;
  }

  // ── Approve ───────────────────────────────────────────────────────────────────

  async function handleApprove(appId: string) {
    setActionLoading(appId);
    setRowErrors(prev => { const n = { ...prev }; delete n[appId]; return n; });

    try {
      const r = await fetch(`http://localhost:3000/api/applications/${appId}/approve`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error((d as { message?: string }).message || `Error ${r.status}`);
      }
      // Update status in local state, preserve enriched fields
      setApplications(prev =>
        prev.map(a => a.id === appId ? { ...a, status: "APPROVED" as const } : a)
      );
    } catch (err) {
      setRowErrors(prev => ({ ...prev, [appId]: (err as Error).message || "Approval failed." }));
    } finally {
      setActionLoading(null);
    }
  }

  // ── Reject modal ──────────────────────────────────────────────────────────────

  function openRejectModal(app: EnrichedApplication) {
    setRejectApp(app);
    setRejectReason("");
    setRejectError(null);
  }

  async function confirmReject() {
    if (!rejectApp) return;
    setRejectLoading(true);
    setRejectError(null);

    try {
      const r = await fetch(`http://localhost:3000/api/applications/${rejectApp.id}/reject`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ rejection_reason: rejectReason.trim() || "No reason provided." }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error((d as { message?: string }).message || `Error ${r.status}`);
      }
      const reason = rejectReason.trim();
      setApplications(prev =>
        prev.map(a =>
          a.id === rejectApp.id
            ? { ...a, status: "REJECTED" as const, rejection_reason: reason || "No reason provided." }
            : a
        )
      );
      setRejectApp(null);
    } catch (err) {
      setRejectError((err as Error).message || "Rejection failed.");
    } finally {
      setRejectLoading(false);
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  const inputCls = "w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60 transition";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">
            Offer Access
          </div>
          <h2 className="mt-1 text-2xl font-black theme-text-main">Application Review</h2>
          <p className="mt-1 text-sm theme-text-muted">
            Review publisher access requests and manage offer approvals.
          </p>
        </div>
        <button onClick={load} disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 rounded-full border theme-border px-4 py-2 text-xs font-semibold theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          Refresh
        </button>
      </div>

      {/* Global fetch error */}
      {fetchError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 flex items-center gap-3 text-rose-700 dark:text-rose-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Table card */}
      <div className="theme-bg-card border theme-border rounded-3xl shadow-sm">

        {/* Tabs + search bar */}
        <div className="p-5 border-b theme-border space-y-4">

          {/* Status tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {TABS.map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] transition ${
                  tab === key
                    ? "bg-cyan-600 text-white"
                    : "border theme-border theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900"
                }`}>
                {label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  tab === key ? "bg-white/30 text-white" : "bg-slate-200 dark:bg-slate-700 theme-text-muted"
                }`}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by offer, affiliate or company…"
                className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 pl-9 pr-4 py-2 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            {search && (
              <button onClick={() => setSearch("")}
                className="rounded-full border theme-border px-3 py-2 text-xs theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                Clear
              </button>
            )}
            <span className="text-xs theme-text-muted ml-auto shrink-0">
              {filtered.length.toLocaleString()} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="flex items-center justify-center py-16 gap-3 theme-text-muted">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-600" />
            <span className="text-sm">Loading applications…</span>
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <FileText className="w-10 h-10 theme-text-muted opacity-30" />
            <div className="text-sm theme-text-muted">
              {search
                ? "No applications match your search."
                : tab === "ALL"
                  ? "No applications yet."
                  : `No ${tab.toLowerCase()} applications.`}
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && !fetchError && filtered.length > 0 && (
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b theme-border">
                  {["Offer", "Affiliate", "Requested", "Status", "Questionnaire", "Actions"].map(h => (
                    <th key={h}
                      className={`px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted whitespace-nowrap ${
                        h === "Actions" ? "text-right" : "text-left"
                      }`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageSlice.map(app => {
                  const isActing = actionLoading === app.id;
                  const rowErr   = rowErrors[app.id];
                  const qItems   = questItems(app);

                  return (
                    <>
                      <tr key={app.id}
                        className="border-b theme-border last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">

                        {/* Offer */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3 min-w-[180px]">
                            {app.offer_logo_url ? (
                              <img
                                src={app.offer_logo_url}
                                alt=""
                                className="w-9 h-9 rounded-xl object-cover shrink-0 border theme-border"
                                onError={e => { (e.target as HTMLImageElement).classList.add("hidden"); }}
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center text-sm font-black shrink-0">
                                <Tag className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <div className="font-semibold theme-text-main leading-tight">
                                {app.offer_name || `Offer #${app.offer_id}`}
                              </div>
                              <div className="text-[11px] font-mono theme-text-muted">#{app.offer_id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Affiliate */}
                        <td className="px-5 py-3.5 min-w-[160px]">
                          <div className="font-semibold theme-text-main leading-tight">
                            {app.publisher_full_name || <span className="opacity-40 font-normal">Unknown</span>}
                          </div>
                          {app.publisher_company_name && (
                            <div className="text-xs theme-text-muted">{app.publisher_company_name}</div>
                          )}
                          <div className="text-[11px] font-mono theme-text-muted">{app.publisher_id.slice(0, 8)}…</div>
                        </td>

                        {/* Requested */}
                        <td className="px-5 py-3.5 text-xs font-mono theme-text-muted whitespace-nowrap">
                          {fmtDate(app.requested_at)}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`inline-block text-[10px] uppercase tracking-[0.22em] font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[app.status]}`}>
                            {app.status}
                          </span>
                          {app.status === "REJECTED" && app.rejection_reason && (
                            <div className="mt-1 text-[11px] theme-text-muted max-w-[160px] truncate" title={app.rejection_reason}>
                              {app.rejection_reason}
                            </div>
                          )}
                        </td>

                        {/* Questionnaire */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          {qItems.length > 0 ? (
                            <button
                              onClick={() => setQuestApp(app)}
                              className="flex items-center gap-1.5 rounded-full border theme-border px-3 py-1.5 text-xs font-semibold theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                              <FileText className="w-3.5 h-3.5" />
                              View Answers
                            </button>
                          ) : (
                            <span className="text-xs theme-text-muted opacity-40">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="relative inline-block text-left">
                            <button
                              disabled={isActing}
                              onClick={e => {
                                e.stopPropagation();
                                setOpenDropdown(prev => prev === app.id ? null : app.id);
                              }}
                              className="flex items-center gap-1.5 rounded-full border theme-border px-3 py-1.5 text-xs font-semibold theme-text-main hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
                              {isActing
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <>Actions <ChevronDown className="w-3 h-3" /></>}
                            </button>

                            {openDropdown === app.id && (
                              <div
                                onClick={e => e.stopPropagation()}
                                className="absolute right-0 mt-1.5 z-20 w-44 rounded-2xl border theme-border theme-bg-card shadow-xl overflow-hidden">

                                {/* PENDING: Approve + Reject */}
                                {app.status === "PENDING" && (
                                  <>
                                    <button
                                      onClick={() => { setOpenDropdown(null); void handleApprove(app.id); }}
                                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Approve
                                    </button>
                                    <div className="border-t theme-border" />
                                    <button
                                      onClick={() => { setOpenDropdown(null); openRejectModal(app); }}
                                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition">
                                      <XCircle className="w-3.5 h-3.5" />
                                      Reject
                                    </button>
                                  </>
                                )}

                                {/* APPROVED: Reject Access */}
                                {app.status === "APPROVED" && (
                                  <button
                                    onClick={() => { setOpenDropdown(null); openRejectModal(app); }}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition">
                                    <XCircle className="w-3.5 h-3.5" />
                                    Reject Access
                                  </button>
                                )}

                                {/* REJECTED: Approve Again */}
                                {app.status === "REJECTED" && (
                                  <button
                                    onClick={() => { setOpenDropdown(null); void handleApprove(app.id); }}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Approve Again
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Per-row error strip */}
                      {rowErr && (
                        <tr key={`${app.id}-err`} className="border-b theme-border">
                          <td colSpan={6} className="px-5 py-2">
                            <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 flex items-center gap-2 text-rose-700 dark:text-rose-400 text-xs">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              {rowErr}
                              <button
                                onClick={() => setRowErrors(prev => { const n = { ...prev }; delete n[app.id]; return n; })}
                                className="ml-auto">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="px-5 py-4 border-t theme-border flex items-center justify-between gap-4">
            <span className="text-xs theme-text-muted">
              Page {page} of {totalPages} · {filtered.length.toLocaleString()} total
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-full border theme-border p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-full border theme-border p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Questionnaire Modal ─────────────────────────────────────────────── */}
      {questApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setQuestApp(null)} />
          <div className="relative w-full max-w-lg theme-bg-card border theme-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* Modal header */}
            <div className="px-6 pt-6 pb-4 border-b theme-border flex items-start justify-between gap-3 shrink-0">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Questionnaire</div>
                <div className="mt-1 font-bold theme-text-main">
                  {questApp.offer_name || `Offer #${questApp.offer_id}`}
                </div>
                <div className="text-xs theme-text-muted mt-0.5">
                  {questApp.publisher_full_name || questApp.publisher_id.slice(0, 8)}
                  {questApp.publisher_company_name ? ` · ${questApp.publisher_company_name}` : ""}
                </div>
              </div>
              <button onClick={() => setQuestApp(null)}
                className="rounded-full p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 overflow-y-auto">
              {(() => {
                const items = questItems(questApp);
                if (items.length === 0) {
                  return (
                    <p className="text-sm theme-text-muted text-center py-6">
                      No questionnaire answers submitted.
                    </p>
                  );
                }
                return (
                  <dl className="space-y-4">
                    {items.map(({ label, value }, i) => (
                      <div key={i}>
                        <dt className="text-xs font-bold uppercase tracking-[0.18em] theme-text-muted mb-1">
                          {label}
                        </dt>
                        <dd className="text-sm theme-text-main bg-slate-50 dark:bg-slate-900 border theme-border rounded-2xl px-4 py-3 leading-relaxed">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                );
              })()}
            </div>

            {/* Modal footer */}
            <div className="px-6 py-4 border-t theme-border shrink-0">
              <button onClick={() => setQuestApp(null)}
                className="w-full rounded-full border theme-border py-2.5 text-sm font-semibold theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ────────────────────────────────────────────────────── */}
      {rejectApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { if (!rejectLoading) setRejectApp(null); }} />
          <div className="relative w-full max-w-md theme-bg-card border theme-border rounded-3xl shadow-2xl p-6">

            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] font-bold text-rose-500">Reject Application</div>
                <div className="mt-1 font-bold theme-text-main">
                  {rejectApp.offer_name || `Offer #${rejectApp.offer_id}`}
                </div>
                <div className="text-xs theme-text-muted mt-0.5">
                  {rejectApp.publisher_full_name || rejectApp.publisher_id.slice(0, 8)}
                  {rejectApp.publisher_company_name ? ` · ${rejectApp.publisher_company_name}` : ""}
                </div>
              </div>
              <button onClick={() => { if (!rejectLoading) setRejectApp(null); }} disabled={rejectLoading}
                className="rounded-full p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">
                Rejection Reason <span className="normal-case font-normal">(optional)</span>
              </label>
              <textarea
                ref={rejectReasonRef}
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                disabled={rejectLoading}
                rows={3}
                placeholder="Explain why this application is being rejected…"
                className={`${inputCls} resize-none`}
              />
            </div>

            {rejectError && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 px-4 py-3 flex items-center gap-2 text-rose-700 dark:text-rose-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {rejectError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => void confirmReject()}
                disabled={rejectLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-rose-600 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50 transition">
                {rejectLoading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Rejecting…</>
                  : <><XCircle className="w-4 h-4" /> Confirm Rejection</>}
              </button>
              <button
                onClick={() => { if (!rejectLoading) setRejectApp(null); }}
                disabled={rejectLoading}
                className="rounded-full border theme-border px-4 py-2.5 text-sm font-semibold theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
