import { useEffect, useState, useCallback } from "react";
import { Eye, X } from "lucide-react";
import {
  listAdvertiserLogs,
  AdvertiserPostbackLogRow,
} from "../../services/adminPostbacks";
import { listAdminOffers, OfferRecord } from "../../services/offers";
import { listPublishers } from "../../services/publishers";

function fmtDate(s: string) {
  return new Date(s).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function statusBadge(s: string) {
  const base = "inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold";
  switch (s.toLowerCase()) {
    case "approved": return <span className={`${base} bg-emerald-500/15 text-emerald-400`}>Approved</span>;
    case "rejected": return <span className={`${base} bg-rose-500/15 text-rose-400`}>Rejected</span>;
    case "pending":  return <span className={`${base} bg-amber-500/15 text-amber-400`}>Pending</span>;
    case "paid":     return <span className={`${base} bg-cyan-500/15 text-cyan-400`}>Paid</span>;
    case "disputed": return <span className={`${base} bg-purple-500/15 text-purple-400`}>Disputed</span>;
    case "review_queue": return <span className={`${base} bg-blue-500/15 text-blue-400`}>Review Queue</span>;
    default: return <span className={`${base} bg-slate-500/15 text-slate-400`}>{s}</span>;
  }
}

export function AdvertiserPostbackLogsView() {
  const [rows, setRows] = useState<AdvertiserPostbackLogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [publishers, setPublishers] = useState<{ id: string; email: string; full_name: string }[]>([]);

  const [filterOffer, setFilterOffer] = useState("");
  const [filterPublisher, setFilterPublisher] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const [rawModal, setRawModal] = useState<Record<string, unknown> | null>(null);

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
      const result = await listAdvertiserLogs({
        offerId:     filterOffer     ? Number(filterOffer)  : undefined,
        publisherId: filterPublisher || undefined,
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
  }, [filterOffer, filterPublisher, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black theme-text-main tracking-tight">Advertiser Postback Logs</h1>
        <p className="text-sm theme-text-muted mt-1">Inbound postbacks received from advertisers via S2S tracking.</p>
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
                <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Click ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Transaction ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Offer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Publisher</th>
                <th className="text-right px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Revenue</th>
                <th className="text-right px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Payout</th>
                <th className="text-right px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Raw</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-divide">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center theme-text-muted text-sm">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center theme-text-muted text-sm">No inbound postback logs found.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                  <td className="px-4 py-3 text-xs theme-text-muted whitespace-nowrap">{fmtDate(row.created_at)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-cyan-400">{row.click_id || "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs theme-text-secondary">{row.transaction_id || "—"}</td>
                  <td className="px-4 py-3">{statusBadge(row.conversion_status)}</td>
                  <td className="px-4 py-3 text-xs theme-text-secondary">{row.offer_name}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs theme-text-main">{row.publisher_email}</div>
                    <div className="text-xs theme-text-muted">{row.publisher_name}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400">
                    ${Number(row.revenue_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-cyan-400">
                    ${Number(row.payout_amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.s2s_payload ? (
                      <button
                        onClick={() => setRawModal(row.s2s_payload!)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 theme-text-muted transition"
                        title="View raw payload"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-xs theme-text-muted">—</span>
                    )}
                  </td>
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

      {/* Raw Payload Modal */}
      {rawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border theme-border shadow-2xl w-full max-w-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold theme-text-main">Raw S2S Payload</h2>
              <button onClick={() => setRawModal(null)} className="theme-text-muted hover:text-rose-400 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <pre className="font-mono text-xs theme-text-secondary bg-slate-50 dark:bg-slate-950 rounded-xl p-4 overflow-auto max-h-96 whitespace-pre-wrap break-all">
              {JSON.stringify(rawModal, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
