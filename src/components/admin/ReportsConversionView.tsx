import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Search,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as analyticsApi from "../../services/analytics";
import type { ConversionReportRow } from "../../services/analytics";
import * as offersApi from "../../services/offers";

const PAGE_SIZE = 25;

const STATUS_OPTIONS = ["", "review_queue", "pending", "approved", "rejected", "disputed", "paid"] as const;

function statusLabel(s: string): string {
  if (!s) return "All Statuses";
  if (s === "review_queue") return "Review Queue";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function statusBadge(status: string) {
  const s = status.toLowerCase();
  if (s === "review_queue") return <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700 uppercase tracking-wide">Review Queue</span>;
  if (s === "approved")     return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Approved</span>;
  if (s === "rejected")     return <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700 uppercase tracking-wide">Rejected</span>;
  if (s === "pending")      return <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700 uppercase tracking-wide">Pending</span>;
  if (s === "paid")         return <span className="inline-flex items-center rounded-full bg-cyan-100 px-2 py-0.5 text-[11px] font-bold text-cyan-700 uppercase tracking-wide">Paid</span>;
  if (s === "disputed")     return <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-700 uppercase tracking-wide">Disputed</span>;
  return <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">{status}</span>;
}

function fmt(n: string | number): string {
  const v = Number(n);
  return Number.isFinite(v) ? `$${v.toFixed(2)}` : "—";
}

const inputCls = "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-cyan-400 placeholder:text-slate-400";

export function ReportsConversionView() {
  const [rows, setRows] = useState<ConversionReportRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterSearch, setFilterSearch] = useState("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [filterOfferId, setFilterOfferId] = useState<number | undefined>(undefined);
  const [filterAffiliate, setFilterAffiliate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [offers, setOffers] = useState<{ id: number; name: string }[]>([]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    offersApi.listAdminOffers()
      .then(list => setOffers(list.map(o => ({ id: o.id, name: o.name }))))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyticsApi.getConversionReport({
        search: filterSearch || undefined,
        startDate: filterStart || undefined,
        endDate: filterEnd || undefined,
        offerId: filterOfferId,
        publisherEmail: filterAffiliate || undefined,
        status: filterStatus || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setRows(result.rows);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || "Failed to load conversion report");
    } finally {
      setIsLoading(false);
    }
  }, [filterSearch, filterStart, filterEnd, filterOfferId, filterAffiliate, filterStatus, page]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await analyticsApi.getConversionReport({
        search: filterSearch || undefined,
        startDate: filterStart || undefined,
        endDate: filterEnd || undefined,
        offerId: filterOfferId,
        publisherEmail: filterAffiliate || undefined,
        status: filterStatus || undefined,
        page: 1,
        pageSize: 10000,
      });
      analyticsApi.downloadCSV(
        result.rows.map(r => ({
          conversion_time: r.event_timestamp,
          offer: r.offer_name,
          status: r.conversion_status,
          revenue: r.revenue_amount,
          payout: r.payout_amount,
          transaction_id: r.transaction_id,
          ip_address: r.ip_address ?? "",
          user_agent: r.user_agent ?? "",
          source: r.source ?? "",
          click_id: r.click_id,
          affiliate: r.affiliate_name,
          affiliate_email: r.affiliate_email,
          advertiser: r.advertiser_name ?? "",
          validated_at: r.validated_at ?? "",
          rejected_at: r.rejected_at ?? "",
          rejection_reason: r.rejection_reason ?? "",
        })),
        `conversion-report-${new Date().toISOString().slice(0, 10)}.csv`
      );
    } catch (err: any) {
      setError(err.message || "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setFilterSearch("");
    setFilterStart("");
    setFilterEnd("");
    setFilterOfferId(undefined);
    setFilterAffiliate("");
    setFilterStatus("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Reports</div>
          <h2 className="mt-2 text-2xl font-black theme-text-main flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Conversion Report
          </h2>
          <p className="mt-1 text-sm theme-text-muted">
            {isLoading ? "Loading…" : `${total.toLocaleString()} conversions total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting || total === 0}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition"
          >
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export CSV
          </button>
          <button
            onClick={load}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full border theme-border bg-white px-4 py-2 text-sm font-semibold theme-text-secondary hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* Filters */}
      <div className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 theme-text-muted" />
          <span className="text-xs uppercase tracking-[0.2em] font-bold theme-text-muted">Filters</span>
        </div>
        {/* Date presets */}
        <div className="flex flex-wrap gap-2 mb-3">
          {[
            { label: "Today",     start: new Date().toISOString().slice(0,10), end: new Date().toISOString().slice(0,10) },
            { label: "Yesterday", start: (() => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); })(), end: (() => { const d = new Date(); d.setDate(d.getDate()-1); return d.toISOString().slice(0,10); })() },
            { label: "7 Days",    start: (() => { const d = new Date(); d.setDate(d.getDate()-6); return d.toISOString().slice(0,10); })(), end: new Date().toISOString().slice(0,10) },
            { label: "30 Days",   start: (() => { const d = new Date(); d.setDate(d.getDate()-29); return d.toISOString().slice(0,10); })(), end: new Date().toISOString().slice(0,10) },
          ].map(p => (
            <button
              key={p.label}
              onClick={() => { setFilterStart(p.start); setFilterEnd(p.end); setPage(1); }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition ${
                filterStart === p.start && filterEnd === p.end
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-emerald-400 hover:text-emerald-600"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversion ID, offer, affiliate…"
              value={filterSearch}
              onChange={e => { setFilterSearch(e.target.value); setPage(1); }}
              className={`${inputCls} pl-8`}
            />
          </div>
          <select
            value={filterOfferId ?? ""}
            onChange={e => { setFilterOfferId(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            className={inputCls}
          >
            <option value="">All Offers</option>
            {offers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <input
            type="text"
            placeholder="Affiliate email"
            value={filterAffiliate}
            onChange={e => { setFilterAffiliate(e.target.value); setPage(1); }}
            className={inputCls}
          />
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
            className={inputCls}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{statusLabel(s)}</option>
            ))}
          </select>
          <input type="date" value={filterStart} onChange={e => { setFilterStart(e.target.value); setPage(1); }} className={inputCls} />
          <input type="date" value={filterEnd}   onChange={e => { setFilterEnd(e.target.value);   setPage(1); }} className={inputCls} />
        </div>
        <div className="mt-3 flex justify-end">
          <button onClick={handleReset} className="rounded-2xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition">
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="theme-bg-card border theme-border rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center gap-3 p-6 text-sm theme-text-muted">
            <RefreshCw className="w-4 h-4 animate-spin" />Loading conversion data…
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm theme-text-muted">No conversions found matching the current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1400px]">
              <thead>
                <tr className="border-b theme-border bg-slate-50 dark:bg-slate-900">
                  {["Time", "Offer", "Status", "Revenue", "Payout", "Transaction ID", "IP Address", "User Agent", "Source", "Click ID"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold theme-text-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y theme-border">
                {rows.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                    <td className="px-4 py-3 text-xs theme-text-muted whitespace-nowrap">{fmtDate(r.event_timestamp)}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold theme-text-main max-w-[140px] truncate block">{r.offer_name}</span>
                    </td>
                    <td className="px-4 py-3">{statusBadge(r.conversion_status)}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-cyan-700">{fmt(r.revenue_amount)}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-emerald-700">{fmt(r.payout_amount)}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-slate-500">{r.transaction_id || "—"}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">{r.ip_address || "—"}</td>
                    <td className="px-4 py-3 text-[11px] text-slate-500 max-w-[160px] truncate" title={r.user_agent ?? ""}>{r.user_agent || "—"}</td>
                    <td className="px-4 py-3 text-[11px] text-slate-500 max-w-[140px] truncate" title={r.source ?? ""}>{r.source || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-slate-500">{r.click_id ? r.click_id.slice(0, 10) + "…" : "—"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between gap-4 border-t theme-border px-5 py-3">
            <span className="text-xs theme-text-muted">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()} conversions
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="inline-flex items-center gap-1 rounded-full border theme-border px-3 py-1.5 text-xs font-semibold theme-text-secondary hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronLeft className="w-3.5 h-3.5" />Prev
              </button>
              <span className="text-xs theme-text-muted px-2">{page} / {totalPages || 1}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="inline-flex items-center gap-1 rounded-full border theme-border px-3 py-1.5 text-xs font-semibold theme-text-secondary hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                Next<ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
