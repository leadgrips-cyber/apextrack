import { useState, useEffect, useCallback } from "react";
import {
  MousePointer,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as analyticsApi from "../../services/analytics";
import type { ClickReportRow } from "../../services/analytics";
import * as offersApi from "../../services/offers";

const PAGE_SIZE = 25;

function fmtDate(d: string): string {
  return new Date(d).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function nullCell(v: string | null | undefined): string {
  return v && v.trim() ? v : "—";
}

const inputCls = "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-cyan-400 placeholder:text-slate-400";

export function ReportsClickView() {
  const [rows, setRows] = useState<ClickReportRow[]>([]);
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

  const [offers, setOffers] = useState<{ id: number; name: string }[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      const result = await analyticsApi.getClickReport({
        search: filterSearch || undefined,
        startDate: filterStart || undefined,
        endDate: filterEnd || undefined,
        offerId: filterOfferId,
        publisherEmail: filterAffiliate || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setRows(result.rows);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || "Failed to load click report");
    } finally {
      setIsLoading(false);
    }
  }, [filterSearch, filterStart, filterEnd, filterOfferId, filterAffiliate, page]);

  useEffect(() => { load(); }, [load]);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await analyticsApi.getClickReport({
        search: filterSearch || undefined,
        startDate: filterStart || undefined,
        endDate: filterEnd || undefined,
        offerId: filterOfferId,
        publisherEmail: filterAffiliate || undefined,
        page: 1,
        pageSize: 10000,
      });
      analyticsApi.downloadCSV(
        result.rows.map(r => ({
          click_id: r.click_id,
          offer: r.offer_name,
          affiliate: r.affiliate_name,
          affiliate_email: r.affiliate_email,
          country: r.country_code ?? "",
          device: r.device_type ?? "",
          sub1: r.sub1 ?? "",
          sub2: r.sub2 ?? "",
          sub3: r.sub3 ?? "",
          sub4: r.sub4 ?? "",
          sub5: r.sub5 ?? "",
          click_time: r.created_at,
        })),
        `click-report-${new Date().toISOString().slice(0, 10)}.csv`
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
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Reports</div>
          <h2 className="mt-2 text-2xl font-black theme-text-main flex items-center gap-2">
            <MousePointer className="w-6 h-6 text-cyan-600" />
            Click Report
          </h2>
          <p className="mt-1 text-sm theme-text-muted">
            {isLoading ? "Loading…" : `${total.toLocaleString()} clicks total`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting || total === 0}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition"
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
                  ? "bg-cyan-600 border-cyan-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-cyan-400 hover:text-cyan-600"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search click ID, offer, affiliate…"
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
            <RefreshCw className="w-4 h-4 animate-spin" />Loading click data…
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm theme-text-muted">No clicks found matching the current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead>
                <tr className="border-b theme-border bg-slate-50 dark:bg-slate-900">
                  {["Click ID", "Offer", "Affiliate", "Country", "Device", "Sub1", "Sub2", "Sub3", "Sub4", "Sub5", "Click Time"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold theme-text-muted whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y theme-border">
                {rows.map(r => (
                  <tr key={r.click_id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-slate-500 select-all">{r.click_id.slice(0, 12)}…</span>
                        <button
                          onClick={() => handleCopy(r.click_id)}
                          title="Copy full Click ID"
                          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
                        >
                          {copiedId === r.click_id
                            ? <Check className="w-3 h-3 text-emerald-500" />
                            : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold theme-text-main max-w-[150px] truncate block">{r.offer_name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold theme-text-main">{nullCell(r.affiliate_name)}</div>
                      <div className="text-[10px] theme-text-muted">{r.affiliate_email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs theme-text-main">{nullCell(r.country_code)}</td>
                    <td className="px-4 py-3 text-xs theme-text-main capitalize">{nullCell(r.device_type)}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{nullCell(r.sub1)}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{nullCell(r.sub2)}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{nullCell(r.sub3)}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{nullCell(r.sub4)}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{nullCell(r.sub5)}</td>
                    <td className="px-4 py-3 text-xs theme-text-muted whitespace-nowrap">{fmtDate(r.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && total > 0 && (
          <div className="flex items-center justify-between gap-4 border-t theme-border px-5 py-3">
            <span className="text-xs theme-text-muted">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()} clicks
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
