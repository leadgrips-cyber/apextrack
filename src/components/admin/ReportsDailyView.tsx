import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as analyticsApi from "../../services/analytics";
import type { DailyReportRow } from "../../services/analytics";
import * as offersApi from "../../services/offers";

const inputCls = "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-cyan-400 placeholder:text-slate-400";

function fmtUSD(n: string | number): string {
  const v = Number(n);
  return Number.isFinite(v) ? `$${v.toFixed(2)}` : "—";
}

function defaultRange() {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 29);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

// ─── SVG Sparkline / Bar chart ────────────────────────────────────────────────

interface ChartProps {
  rows: DailyReportRow[];
  metric: "clicks" | "conversions" | "revenue" | "payout" | "profit";
  color: string;
  labelColor: string;
}

function BarSparkChart({ rows, metric, color, labelColor }: ChartProps) {
  const W = 700;
  const H = 160;
  const PAD = { top: 12, right: 8, bottom: 28, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  if (rows.length === 0) {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
        <text x={W / 2} y={H / 2} textAnchor="middle" fill="#94a3b8" fontSize="12">No data</text>
      </svg>
    );
  }

  const values = rows.map(r => Number(r[metric]) || 0);
  const maxVal = Math.max(...values, 1);
  const barW = Math.max(2, Math.floor(innerW / rows.length) - 2);

  // Y-axis ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    y: PAD.top + innerH * (1 - t),
    label: metric === "clicks" || metric === "conversions"
      ? String(Math.round(maxVal * t))
      : `$${(maxVal * t).toFixed(0)}`,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Grid lines */}
      {ticks.map(t => (
        <line
          key={t.y}
          x1={PAD.left} y1={t.y}
          x2={PAD.left + innerW} y2={t.y}
          stroke="#e2e8f0" strokeWidth={1}
        />
      ))}
      {/* Y-axis labels */}
      {ticks.map(t => (
        <text
          key={t.y}
          x={PAD.left - 6} y={t.y + 4}
          textAnchor="end"
          fontSize={9}
          fill="#94a3b8"
        >{t.label}</text>
      ))}
      {/* Bars */}
      {rows.map((r, i) => {
        const barH = Math.max(2, (values[i] / maxVal) * innerH);
        const x = PAD.left + (innerW / rows.length) * i + (innerW / rows.length - barW) / 2;
        const y = PAD.top + innerH - barH;
        return (
          <rect
            key={r.date}
            x={x} y={y}
            width={barW} height={barH}
            rx={2} ry={2}
            fill={color}
            opacity={0.85}
          />
        );
      })}
      {/* X-axis date labels — show only first, middle, last */}
      {[0, Math.floor(rows.length / 2), rows.length - 1]
        .filter((idx, pos, arr) => arr.indexOf(idx) === pos && idx < rows.length)
        .map(idx => {
          const r = rows[idx];
          const x = PAD.left + (innerW / rows.length) * idx + innerW / rows.length / 2;
          const label = new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return (
            <text key={r.date} x={x} y={H - 6} textAnchor="middle" fontSize={9} fill={labelColor}>
              {label}
            </text>
          );
        })}
    </svg>
  );
}

// ─── Summary cards ────────────────────────────────────────────────────────────

function total(rows: DailyReportRow[], key: "clicks" | "conversions") {
  return rows.reduce((s, r) => s + (Number(r[key]) || 0), 0).toLocaleString();
}

function totalUSD(rows: DailyReportRow[], key: "revenue" | "payout" | "profit") {
  const v = rows.reduce((s, r) => s + (Number(r[key]) || 0), 0);
  return `$${v.toFixed(2)}`;
}

// ─── Table page size ──────────────────────────────────────────────────────────

const TABLE_PAGE = 20;

export function ReportsDailyView() {
  const range = defaultRange();
  const [filterStart, setFilterStart] = useState(range.start);
  const [filterEnd,   setFilterEnd]   = useState(range.end);
  const [filterOfferId,  setFilterOfferId]  = useState<number | undefined>(undefined);
  const [filterAffiliate, setFilterAffiliate] = useState("");

  const [rows, setRows] = useState<DailyReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tablePage, setTablePage] = useState(1);

  const [offers, setOffers] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    offersApi.listAdminOffers()
      .then(list => setOffers(list.map(o => ({ id: o.id, name: o.name }))))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    if (!filterStart || !filterEnd) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsApi.getDailyReport({
        startDate: filterStart,
        endDate: filterEnd,
        offerId: filterOfferId,
        publisherEmail: filterAffiliate || undefined,
      });
      setRows(data);
      setTablePage(1);
    } catch (err: any) {
      setError(err.message || "Failed to load daily report");
    } finally {
      setIsLoading(false);
    }
  }, [filterStart, filterEnd, filterOfferId, filterAffiliate]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      analyticsApi.downloadCSV(
        rows.map(r => ({
          date: r.date,
          clicks: r.clicks,
          conversions: r.conversions,
          revenue: r.revenue,
          payout: r.payout,
          profit: r.profit,
        })),
        `daily-report-${filterStart}-${filterEnd}.csv`
      );
    } finally {
      setIsExporting(false);
    }
  };

  const totalTablePages = Math.ceil(rows.length / TABLE_PAGE);
  const tableSlice = rows.slice((tablePage - 1) * TABLE_PAGE, tablePage * TABLE_PAGE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Reports</div>
          <h2 className="mt-2 text-2xl font-black theme-text-main flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            Daily Report
          </h2>
          <p className="mt-1 text-sm theme-text-muted">
            {isLoading ? "Loading…" : rows.length > 0 ? `${rows.length} days` : "No data for this range"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting || rows.length === 0}
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50 transition"
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
              onClick={() => { setFilterStart(p.start); setFilterEnd(p.end); }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition ${
                filterStart === p.start && filterEnd === p.end
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-purple-400 hover:text-purple-600"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input type="date" value={filterStart} onChange={e => setFilterStart(e.target.value)} className={inputCls} />
          <input type="date" value={filterEnd}   onChange={e => setFilterEnd(e.target.value)}   className={inputCls} />
          <select
            value={filterOfferId ?? ""}
            onChange={e => setFilterOfferId(e.target.value ? Number(e.target.value) : undefined)}
            className={inputCls}
          >
            <option value="">All Offers</option>
            {offers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <input
            type="text"
            placeholder="Affiliate email"
            value={filterAffiliate}
            onChange={e => setFilterAffiliate(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      {/* Summary Cards */}
      {rows.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Total Clicks",      value: total(rows, "clicks"),           color: "text-cyan-700",    bg: "bg-cyan-50" },
            { label: "Total Conversions", value: total(rows, "conversions"),       color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Total Revenue",     value: totalUSD(rows, "revenue"),        color: "text-blue-700",    bg: "bg-blue-50" },
            { label: "Total Payout",      value: totalUSD(rows, "payout"),         color: "text-amber-700",   bg: "bg-amber-50" },
            { label: "Total Profit",      value: totalUSD(rows, "profit"),         color: "text-purple-700",  bg: "bg-purple-50" },
          ].map(c => (
            <div key={c.label} className={`${c.bg} border border-transparent rounded-2xl p-4 flex flex-col gap-1`}>
              <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-slate-500">{c.label}</span>
              <span className={`text-xl font-black ${c.color}`}>{c.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {rows.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            { metric: "clicks"      as const, label: "Daily Clicks",      color: "#0e7490", labelColor: "#64748b" },
            { metric: "conversions" as const, label: "Daily Conversions",  color: "#059669", labelColor: "#64748b" },
            { metric: "revenue"     as const, label: "Daily Revenue",      color: "#1d4ed8", labelColor: "#64748b" },
            { metric: "profit"      as const, label: "Daily Profit",       color: "#7c3aed", labelColor: "#64748b" },
          ].map(c => (
            <div key={c.metric} className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
              <div className="text-xs uppercase tracking-[0.18em] font-bold theme-text-muted mb-3">{c.label}</div>
              <BarSparkChart rows={rows} metric={c.metric} color={c.color} labelColor={c.labelColor} />
            </div>
          ))}
        </div>
      )}

      {/* Data Table */}
      <div className="theme-bg-card border theme-border rounded-3xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center gap-3 p-6 text-sm theme-text-muted">
            <RefreshCw className="w-4 h-4 animate-spin" />Loading daily data…
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm theme-text-muted">No data found for the selected date range.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b theme-border bg-slate-50 dark:bg-slate-900">
                  {["Date", "Clicks", "Conversions", "Revenue", "Payout", "Profit"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold theme-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y theme-border">
                {tableSlice.map(r => {
                  const profit = Number(r.profit) || 0;
                  return (
                    <tr key={r.date} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                      <td className="px-5 py-3 text-xs font-semibold theme-text-main">
                        {new Date(r.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-5 py-3 text-xs theme-text-main">{Number(r.clicks).toLocaleString()}</td>
                      <td className="px-5 py-3 text-xs theme-text-main">{Number(r.conversions).toLocaleString()}</td>
                      <td className="px-5 py-3 text-xs font-semibold text-blue-700">{fmtUSD(r.revenue)}</td>
                      <td className="px-5 py-3 text-xs font-semibold text-amber-700">{fmtUSD(r.payout)}</td>
                      <td className={`px-5 py-3 text-xs font-semibold ${profit >= 0 ? "text-purple-700" : "text-rose-600"}`}>{fmtUSD(r.profit)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && rows.length > TABLE_PAGE && (
          <div className="flex items-center justify-between gap-4 border-t theme-border px-5 py-3">
            <span className="text-xs theme-text-muted">
              {(tablePage - 1) * TABLE_PAGE + 1}–{Math.min(tablePage * TABLE_PAGE, rows.length)} of {rows.length} days
            </span>
            <div className="flex items-center gap-2">
              <button onClick={() => setTablePage(p => Math.max(1, p - 1))} disabled={tablePage <= 1} className="inline-flex items-center gap-1 rounded-full border theme-border px-3 py-1.5 text-xs font-semibold theme-text-secondary hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                <ChevronLeft className="w-3.5 h-3.5" />Prev
              </button>
              <span className="text-xs theme-text-muted px-2">{tablePage} / {totalTablePages}</span>
              <button onClick={() => setTablePage(p => Math.min(totalTablePages, p + 1))} disabled={tablePage >= totalTablePages} className="inline-flex items-center gap-1 rounded-full border theme-border px-3 py-1.5 text-xs font-semibold theme-text-secondary hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition">
                Next<ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
