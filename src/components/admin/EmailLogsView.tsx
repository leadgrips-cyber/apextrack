import { useState, useEffect, useCallback } from "react";
import { Activity, RefreshCw, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getEmailLogs, type EmailLog } from "../../services/mailer";

const PAGE_SIZE = 50;

const STATUS_STYLES: Record<string, string> = {
  sent:    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  failed:  'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function EmailLogsView() {
  const [logs,      setLogs]      = useState<EmailLog[]>([]);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [status,    setStatus]    = useState("");
  const [recipient, setRecipient] = useState("");
  const [search,    setSearch]    = useState("");

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getEmailLogs({
        status:    status    || undefined,
        recipient: recipient || undefined,
        page:      p,
        limit:     PAGE_SIZE,
      });
      setLogs(res.logs);
      setTotal(res.total);
      setPage(p);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [status, recipient]);

  useEffect(() => { load(1); }, [load]);

  function handleSearch() {
    setRecipient(search.trim());
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-500" />
          <h1 className="text-xl font-black theme-text-main">Email Logs</h1>
          {!loading && (
            <span className="text-xs theme-text-muted ml-1">{total} records</span>
          )}
        </div>
        <button onClick={() => load(page)} disabled={loading}
          className="flex items-center gap-1.5 text-xs theme-text-muted hover:text-cyan-600 transition font-semibold">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-end">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] theme-text-muted mb-1">Status</div>
          <select value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 transition">
            <option value="">All</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <div className="flex-1 min-w-48">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] theme-text-muted mb-1">Recipient</div>
          <div className="flex gap-2">
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search email address…"
              className="flex-1 rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 transition" />
            <button onClick={handleSearch}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-semibold theme-text-main transition">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="theme-bg-card border theme-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 theme-text-muted text-sm">No email logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b theme-border bg-slate-50 dark:bg-slate-900">
                  {['Recipient', 'Template', 'Subject', 'Status', 'Error', 'Sent At'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] theme-text-muted whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y theme-divide">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                    <td className="px-4 py-3 font-mono text-xs theme-text-main whitespace-nowrap">
                      {log.recipient}
                    </td>
                    <td className="px-4 py-3 text-xs theme-text-muted font-mono">
                      {log.template_slug ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs theme-text-main max-w-56 truncate">
                      {log.subject ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        STATUS_STYLES[log.status] ?? ''
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-rose-600 dark:text-rose-400 max-w-48 truncate" title={log.error ?? ''}>
                      {log.error ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-xs theme-text-muted whitespace-nowrap font-mono">
                      {fmtDate(log.sent_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs theme-text-muted">
            Page {page} of {totalPages} — {total} total
          </span>
          <div className="flex gap-2">
            <button onClick={() => load(page - 1)} disabled={page <= 1 || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border theme-border text-xs font-semibold theme-text-main hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition">
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button onClick={() => load(page + 1)} disabled={page >= totalPages || loading}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border theme-border text-xs font-semibold theme-text-main hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition">
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
