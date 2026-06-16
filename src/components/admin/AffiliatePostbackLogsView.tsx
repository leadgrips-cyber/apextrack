import { useEffect, useState, useCallback } from "react";
import {
  listAffiliateLogs,
  AffiliatePostbackLogRow,
} from "../../services/adminPostbacks";
import { listAdminOffers, OfferRecord } from "../../services/offers";
import { listPublishers } from "../../services/publishers";

function fmtDate(s: string | null) {
  if (!s) return "—";
  return new Date(s).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function deliveryBadge(status: string) {
  const base = "inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold";
  switch (status.toUpperCase()) {
    case "SUCCESS": return <span className={`${base} bg-emerald-500/15 text-emerald-400`}>Success</span>;
    case "FAILED":  return <span className={`${base} bg-rose-500/15 text-rose-400`}>Failed</span>;
    case "QUEUED":  return <span className={`${base} bg-slate-500/15 text-slate-400`}>Queued</span>;
    case "SENT":    return <span className={`${base} bg-cyan-500/15 text-cyan-400`}>Sent</span>;
    case "RETRY":   return <span className={`${base} bg-amber-500/15 text-amber-400`}>Retry</span>;
    case "DISABLED":return <span className={`${base} bg-slate-500/15 text-slate-400`}>Disabled</span>;
    default: return <span className={`${base} bg-slate-500/15 text-slate-400`}>{status}</span>;
  }
}

function httpCodeBadge(code: number | null) {
  if (code === null) return <span className="text-xs theme-text-muted">—</span>;
  const cls = code >= 200 && code < 300
    ? "text-emerald-400"
    : code >= 400
    ? "text-rose-400"
    : "text-amber-400";
  return <span className={`font-mono text-xs ${cls}`}>{code}</span>;
}

const STATUS_OPTIONS = ["", "SUCCESS", "FAILED", "QUEUED", "SENT", "RETRY", "DISABLED"];

export function AffiliatePostbackLogsView() {
  const [rows, setRows] = useState<AffiliatePostbackLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [publishers, setPublishers] = useState<{ id: string; email: string; full_name: string }[]>([]);

  const [filterOffer, setFilterOffer] = useState("");
  const [filterPublisher, setFilterPublisher] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  useEffect(() => {
    listAdminOffers().then(setOffers).catch(() => {});
    listPublishers({ page: 1 })
      .then((r) => setPublishers(r.publishers))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAffiliateLogs({
        offerId:     filterOffer     ? Number(filterOffer)  : undefined,
        publisherId: filterPublisher || undefined,
        status:      filterStatus    || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setRows(result.rows);
      setTotal(result.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterOffer, filterPublisher, filterStatus, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black theme-text-main tracking-tight">Affiliate Postback Logs</h1>
        <p className="text-sm theme-text-muted mt-1">Outbound postback delivery records — all fired requests to publisher callback URLs.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filterOffer}
          onChange={(e) => { setFilterOffer(e.target.value); setPage(1); }}
          className="rounded-xl border theme-border bg-white dark:bg-slate-900 theme-text-main text-sm px-3 py-2 min-w-[200px]"
        >
          <option value="">All Offers</option>
          {offers.map((o) => (
            <option key={o.id} value={String(o.id)}>{o.name}</option>
          ))}
        </select>
        <select
          value={filterPublisher}
          onChange={(e) => { setFilterPublisher(e.target.value); setPage(1); }}
          className="rounded-xl border theme-border bg-white dark:bg-slate-900 theme-text-main text-sm px-3 py-2 min-w-[200px]"
        >
          <option value="">All Publishers</option>
          {publishers.map((p) => (
            <option key={p.id} value={p.id}>{p.email}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="rounded-xl border theme-border bg-white dark:bg-slate-900 theme-text-main text-sm px-3 py-2"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s || "All Statuses"}</option>
          ))}
        </select>
        <span className="text-sm theme-text-muted">{total.toLocaleString()} record{total !== 1 ? "s" : ""}</span>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 px-4 py-3 text-sm">{error}</div>
      )}

      {/* Table */}
      <div className="rounded-2xl border theme-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b theme-border">
                <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Publisher</th>
                <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Offer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Callback URL</th>
                <th className="text-center px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">HTTP</th>
                <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Response</th>
                <th className="text-center px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Retries</th>
                <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Delivery</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-divide">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center theme-text-muted text-sm">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-8 text-center theme-text-muted text-sm">No outbound postback logs found.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                  <td className="px-4 py-3 text-xs theme-text-muted whitespace-nowrap">{fmtDate(row.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs theme-text-main">{row.publisher_email}</div>
                    <div className="text-xs theme-text-muted">{row.publisher_name}</div>
                  </td>
                  <td className="px-4 py-3 text-xs theme-text-secondary">{row.offer_name}</td>
                  <td className="px-4 py-3 max-w-[200px]">
                    <span className="font-mono text-xs theme-text-muted truncate block" title={row.destination_url}>
                      {row.destination_url}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {httpCodeBadge(row.last_response_code)}
                  </td>
                  <td className="px-4 py-3 max-w-[200px]">
                    {row.last_response_body ? (
                      <span className="font-mono text-xs theme-text-muted truncate block" title={row.last_response_body}>
                        {row.last_response_body.slice(0, 80)}{row.last_response_body.length > 80 ? "…" : ""}
                      </span>
                    ) : (
                      <span className="text-xs theme-text-muted">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-mono text-xs ${row.attempt_count > 1 ? "text-amber-400" : "theme-text-muted"}`}>
                      {row.attempt_count}
                    </span>
                  </td>
                  <td className="px-4 py-3">{deliveryBadge(row.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm theme-text-muted">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border theme-border hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            >Prev</button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl border theme-border hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
