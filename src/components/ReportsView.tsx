import { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  Calendar,
  Download,
  Check,
  Filter,
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
  Megaphone,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import * as publisherApi from "../services/publisherAnalytics";
import type {
  PublisherClickRow,
  PublisherConversionRow,
  PublisherDailyRow,
  PublisherOverviewRow,
} from "../services/publisherAnalytics";

type Tab = "daily" | "overview" | "clicks" | "conversions";

function today(): string { return new Date().toISOString().slice(0, 10); }
function daysAgo(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10);
}

const PAGE_SIZE = 25;

function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function statusBadge(s: string) {
  const l = s.toLowerCase();
  if (l === "approved") return <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[9px] font-bold uppercase tracking-wide">Approved</span>;
  if (l === "paid")     return <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 text-[9px] font-bold uppercase tracking-wide">Paid</span>;
  return <span className="px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800 text-[9px] font-bold uppercase tracking-wide">{s}</span>;
}

const NOTIFICATIONS = [
  { id: 1, type: "approved", title: "Offer Approved", text: "Campaign #1094 Apex Trading App has been approved for sub ID traffic sources.", time: "10 minutes ago" },
  { id: 2, type: "paused",   title: "Offer Paused",   text: "Campaign #1098 Luxury Essentials has been temporarily paused for partner optimization.", time: "2 hours ago" },
  { id: 3, type: "rejected", title: "Offer Rejected", text: "Campaign #1097 B2B SaaS Enterprise CRM request was rejected due to geo mismatched traffic profile.", time: "5 hours ago" },
  { id: 4, type: "payout",   title: "Payout Released", text: "A payout of $2,850.00 USD has been dispatched to Citibank Ledger nodes (NET-15).", time: "Yesterday" },
  { id: 5, type: "announcement", title: "System Announcement", text: "Network Upgrade: S2S Click Attribution and POSTBACK ping speeds have been improved to < 12ms.", time: "2 days ago" },
];

export function ReportsView() {
  const [activeTab, setActiveTab] = useState<Tab>("daily");
  const [notificationsOpen, setNotificationsOpen] = useState(true);
  const [copiedCsv, setCopiedCsv] = useState(false);

  // Date range
  const [startDate, setStartDate] = useState(daysAgo(29));
  const [endDate, setEndDate] = useState(today());

  // Pagination
  const [clickPage, setClickPage] = useState(1);
  const [convPage, setConvPage] = useState(1);

  // Search
  const [search, setSearch] = useState("");

  // Data
  const [dailyRows, setDailyRows] = useState<PublisherDailyRow[]>([]);
  const [overviewRows, setOverviewRows] = useState<PublisherOverviewRow[]>([]);
  const [clickRows, setClickRows] = useState<PublisherClickRow[]>([]);
  const [clickTotal, setClickTotal] = useState(0);
  const [convRows, setConvRows] = useState<PublisherConversionRow[]>([]);
  const [convTotal, setConvTotal] = useState(0);

  // Loading / error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDaily = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const rows = await publisherApi.getPublisherDailyReport({ startDate, endDate });
      setDailyRows(rows);
    } catch (e: any) { setError(e.message || "Failed to load daily report"); }
    finally { setLoading(false); }
  }, [startDate, endDate]);

  const loadOverview = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const rows = await publisherApi.getPublisherOverviewReport({ startDate, endDate });
      setOverviewRows(rows);
    } catch (e: any) { setError(e.message || "Failed to load overview"); }
    finally { setLoading(false); }
  }, [startDate, endDate]);

  const loadClicks = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const result = await publisherApi.getPublisherClickReport({ startDate, endDate, search: search || undefined, page: clickPage, pageSize: PAGE_SIZE });
      setClickRows(result.rows); setClickTotal(result.total);
    } catch (e: any) { setError(e.message || "Failed to load clicks"); }
    finally { setLoading(false); }
  }, [startDate, endDate, search, clickPage]);

  const loadConversions = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const result = await publisherApi.getPublisherConversionReport({ startDate, endDate, search: search || undefined, page: convPage, pageSize: PAGE_SIZE });
      setConvRows(result.rows); setConvTotal(result.total);
    } catch (e: any) { setError(e.message || "Failed to load conversions"); }
    finally { setLoading(false); }
  }, [startDate, endDate, search, convPage]);

  useEffect(() => {
    if (activeTab === "daily")            loadDaily();
    else if (activeTab === "overview")    loadOverview();
    else if (activeTab === "clicks")      loadClicks();
    else if (activeTab === "conversions") loadConversions();
  }, [activeTab, loadDaily, loadOverview, loadClicks, loadConversions]);

  const dailyTotals = dailyRows.reduce(
    (acc, r) => ({ clicks: acc.clicks + r.clicks, conversions: acc.conversions + r.conversions, payout: acc.payout + Number(r.payout), revenue: acc.revenue + Number(r.revenue) }),
    { clicks: 0, conversions: 0, payout: 0, revenue: 0 }
  );

  const handleExportCSV = async () => {
    try {
      let rows: Record<string, unknown>[] = [];
      let filename = "";
      if (activeTab === "daily") {
        rows = dailyRows.map(r => ({ date: r.date, clicks: r.clicks, conversions: r.conversions, payout: r.payout, revenue: r.revenue, profit: r.profit }));
        filename = `publisher-daily-${startDate}-${endDate}.csv`;
      } else if (activeTab === "overview") {
        rows = overviewRows.map(r => ({ offer: r.offer_name, clicks: r.clicks, conversions: r.conversions, payout: r.payout, revenue: r.revenue }));
        filename = `publisher-overview-${today()}.csv`;
      } else if (activeTab === "clicks") {
        const all = await publisherApi.getPublisherClickReport({ startDate, endDate, search: search || undefined, page: 1, pageSize: 10000 });
        rows = all.rows.map(r => ({ click_id: r.click_id, offer: r.offer_name, country: r.country_code, device: r.device_type, sub1: r.sub1, sub2: r.sub2, sub3: r.sub3, sub4: r.sub4, sub5: r.sub5, time: r.created_at }));
        filename = `publisher-clicks-${today()}.csv`;
      } else {
        const all = await publisherApi.getPublisherConversionReport({ startDate, endDate, search: search || undefined, page: 1, pageSize: 10000 });
        rows = all.rows.map(r => ({ conversion_id: r.id, click_id: r.click_id, offer: r.offer_name, status: r.conversion_status, payout: r.payout_amount, time: r.event_timestamp }));
        filename = `publisher-conversions-${today()}.csv`;
      }
      publisherApi.downloadPublisherCSV(rows, filename);
      setCopiedCsv(true);
      setTimeout(() => setCopiedCsv(false), 2500);
    } catch { /* silent */ }
  };

  const clickTotalPages = Math.ceil(clickTotal / PAGE_SIZE);
  const convTotalPages  = Math.ceil(convTotal / PAGE_SIZE);

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="reports-ledger-root">

      {/* HEADER */}
      <div className="theme-bg-card border theme-border p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm bg-slate-900 border-slate-800">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-500" />
            Performance Ledger (Partner Accounts)
          </h2>
          <p className="text-xs text-slate-400">
            Secure partner stats feed. Audit dynamic timelines, filter traffic parameters, track custom sub-attributes, and download ledger logs.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition select-none uppercase tracking-wider cursor-pointer shadow-sm shadow-cyan-500/10"
        >
          {copiedCsv ? <><Check className="w-4 h-4" />CSV Dispatched</> : <><Download className="w-4 h-4" />Download Commission CSV</>}
        </button>
      </div>

      {/* NOTIFICATIONS */}
      <div className="theme-bg-card border theme-border rounded-2xl overflow-hidden shadow-sm bg-slate-900 border-slate-800">
        <button
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="w-full flex items-center justify-between p-4 bg-slate-950/60 border-b border-slate-850 hover:bg-slate-850/35 transition select-none text-left"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-cyan-500" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200">Affiliate Alerts &amp; Notifications Feed</span>
              <span className="text-[10px] block text-slate-500 font-mono font-bold uppercase">Live Broadcast (5 items)</span>
            </div>
          </div>
          <span className="text-xs text-cyan-500 font-bold font-mono">{notificationsOpen ? "Collapse Feed [−]" : "Expand Announcements [+]"}</span>
        </button>
        {notificationsOpen && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 bg-slate-950/60 font-sans text-xs">
            {NOTIFICATIONS.map(n => (
              <div key={n.id} className={`p-3 rounded-xl border flex flex-col justify-between space-y-2.5 ${
                n.type === "approved" ? "bg-emerald-50 border-emerald-200 text-slate-900"
                : n.type === "paused"   ? "bg-amber-50 border-amber-200 text-slate-900"
                : n.type === "rejected" ? "bg-rose-50 border-rose-200 text-slate-900"
                : n.type === "payout"   ? "bg-cyan-50 border-cyan-200 text-slate-900"
                :                         "bg-slate-50 border-slate-200 text-slate-900"
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase font-mono text-[9px] tracking-wider">
                    {n.type === "approved"     && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    {n.type === "paused"       && <PauseCircle  className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                    {n.type === "rejected"     && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                    {n.type === "payout"       && <CreditCard   className="w-3.5 h-3.5 text-cyan-600 shrink-0" />}
                    {n.type === "announcement" && <Megaphone    className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    <span>{n.title}</span>
                  </div>
                  <p className="text-[10px] leading-normal text-slate-700">{n.text}</p>
                </div>
                <span className="block text-[8px] font-mono text-slate-400 text-right">{n.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-800 select-none overflow-x-auto pb-px gap-1">
        {([
          { tab: "daily",       label: "Daily Report Timeline",  desc: "Interactive Daily Ledger" },
          { tab: "overview",    label: "Overview Report",         desc: "Breakdown Grouped by Offer" },
          { tab: "clicks",      label: "Clicks Report Logs",      desc: "SubIDs & Real-time Paths" },
          { tab: "conversions", label: "Conversions Report",      desc: "Commission & Callback Logs" },
        ] as const).map(item => (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`px-5 py-3 border-b-2 font-sans transition shrink-0 text-left cursor-pointer ${
              activeTab === item.tab ? "border-cyan-500 text-cyan-400 font-bold" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span className="block text-xs font-bold leading-tight">{item.label}</span>
            <span className="text-[10px] block opacity-70 font-mono font-medium">{item.desc}</span>
          </button>
        ))}
      </div>

      {/* FILTERS */}
      <div className="theme-bg-card border theme-border p-4 rounded-xl space-y-4 shadow-sm bg-slate-900 border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-mono text-slate-300 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-cyan-500" />
            Active Partner Filters
          </span>
          <button
            onClick={() => { setStartDate(daysAgo(29)); setEndDate(today()); setSearch(""); setClickPage(1); setConvPage(1); }}
            className="text-[10px] font-mono font-bold text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" /> Clear Active Filters
          </button>
        </div>
        {/* Date Presets */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Today",     start: today(),      end: today() },
            { label: "Yesterday", start: daysAgo(1),   end: daysAgo(1) },
            { label: "7 Days",    start: daysAgo(6),   end: today() },
            { label: "30 Days",   start: daysAgo(29),  end: today() },
          ].map(p => (
            <button
              key={p.label}
              onClick={() => { setStartDate(p.start); setEndDate(p.end); setClickPage(1); setConvPage(1); }}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono uppercase tracking-wide border transition cursor-pointer ${
                startDate === p.start && endDate === p.end
                  ? "bg-cyan-500 border-cyan-500 text-slate-950"
                  : "bg-slate-950 border-slate-700 text-slate-400 hover:border-cyan-500 hover:text-cyan-400"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 text-xs">
          <div>
            <label className="block text-[9px] font-bold font-mono uppercase text-slate-500 tracking-wider">Start Date</label>
            <input type="date" value={startDate}
              onChange={e => { setStartDate(e.target.value); setClickPage(1); setConvPage(1); }}
              className="mt-1 block w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-[11px]" />
          </div>
          <div>
            <label className="block text-[9px] font-bold font-mono uppercase text-slate-500 tracking-wider">End Date</label>
            <input type="date" value={endDate}
              onChange={e => { setEndDate(e.target.value); setClickPage(1); setConvPage(1); }}
              className="mt-1 block w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-[11px]" />
          </div>
          {(activeTab === "clicks" || activeTab === "conversions") && (
            <div className="md:col-span-2">
              <label className="block text-[9px] font-bold font-mono uppercase text-slate-500 tracking-wider">Search</label>
              <input type="text" placeholder="Offer name, click ID…" value={search}
                onChange={e => { setSearch(e.target.value); setClickPage(1); setConvPage(1); }}
                className="mt-1 block w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500 font-mono text-[11px]" />
            </div>
          )}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl bg-rose-950/40 border border-rose-800 px-4 py-3 text-sm text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}

      {/* DATA PANEL */}
      <div className="theme-bg-card border theme-border rounded-2xl overflow-hidden shadow-sm bg-slate-900 border-slate-800">
        {loading ? (
          <div className="flex items-center gap-3 p-8 text-sm text-slate-400">
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-500" /> Loading data…
          </div>
        ) : (
          <>
            {/* DAILY */}
            {activeTab === "daily" && (
              <div className="overflow-x-auto select-none">
                <table className="min-w-full divide-y divide-slate-800 text-left">
                  <thead className="bg-slate-950 text-[10px] tracking-wider font-mono uppercase text-slate-400">
                    <tr>
                      {["Date","Clicks","Conversions","Payout","Revenue","Profit"].map(h => (
                        <th key={h} className="px-5 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-slate-900 font-mono text-[11px] font-bold border-b border-slate-800">
                    <tr>
                      <td className="px-5 py-3.5 uppercase text-slate-300 font-sans font-bold">TOTAL AGGREGATES</td>
                      <td className="px-5 py-3.5 text-sky-400">{dailyTotals.clicks.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-amber-500">{dailyTotals.conversions.toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-emerald-400">${dailyTotals.payout.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-indigo-300">${dailyTotals.revenue.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-slate-300">${(dailyTotals.revenue - dailyTotals.payout).toFixed(2)}</td>
                    </tr>
                  </tbody>
                  <tbody className="divide-y divide-slate-800 text-[11px] text-slate-400 font-mono bg-slate-900/40">
                    {dailyRows.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-850/20 transition">
                        <td className="px-5 py-3.5 font-bold text-white flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-cyan-500 shrink-0" />{d.date}
                        </td>
                        <td className="px-5 py-3.5 text-sky-400">{d.clicks.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-amber-500">{d.conversions.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-emerald-400 font-bold">${Number(d.payout).toFixed(2)}</td>
                        <td className="px-5 py-3.5 text-indigo-300">${Number(d.revenue).toFixed(2)}</td>
                        <td className="px-5 py-3.5 text-slate-300">${Number(d.profit).toFixed(2)}</td>
                      </tr>
                    ))}
                    {dailyRows.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-10 text-slate-500 text-xs uppercase font-semibold">No records found for the selected date range.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800 text-left">
                  <thead className="bg-slate-950 text-[10px] tracking-wider font-mono uppercase text-slate-400">
                    <tr>
                      {["Offer","Clicks","Conversions","Payout","Revenue"].map(h => (
                        <th key={h} className="px-5 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-[11px] text-slate-400 font-mono bg-slate-900/40">
                    {overviewRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-850/20 transition">
                        <td className="px-5 py-3.5 font-bold text-white truncate max-w-xs" title={r.offer_name}>{r.offer_name}</td>
                        <td className="px-5 py-3.5 text-sky-400">{r.clicks.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-amber-500">{r.conversions.toLocaleString()}</td>
                        <td className="px-5 py-3.5 text-emerald-400 font-bold">${Number(r.payout).toFixed(2)}</td>
                        <td className="px-5 py-3.5 text-indigo-300">${Number(r.revenue).toFixed(2)}</td>
                      </tr>
                    ))}
                    {overviewRows.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-10 text-slate-500 text-xs uppercase font-semibold">No offers recorded in the selected date range.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* CLICKS */}
            {activeTab === "clicks" && (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800 text-left">
                    <thead className="bg-slate-950 text-[10px] tracking-wider font-mono uppercase text-slate-400">
                      <tr>
                        {["Time","Offer","Country","Device","Click ID","Aff S1","Aff S2","Aff S3","Aff S4","Aff S5"].map(h => (
                          <th key={h} className="px-5 py-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-[11px] text-slate-400 font-mono bg-slate-900/40">
                      {clickRows.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-850/20 transition">
                          <td className="px-5 py-3 text-white truncate max-w-[130px]" title={r.created_at}>{fmtDate(r.created_at)}</td>
                          <td className="px-5 py-3 text-slate-300 truncate max-w-[160px]" title={r.offer_name}>{r.offer_name}</td>
                          <td className="px-5 py-3 font-bold uppercase tracking-wide">{r.country_code || '—'}</td>
                          <td className="px-5 py-3 text-indigo-300">{r.device_type || '—'}</td>
                          <td className="px-5 py-3 text-cyan-400 select-all">{r.click_id}</td>
                          <td className="px-5 py-3 truncate max-w-[90px]" title={r.sub1 || ''}>{r.sub1 || '—'}</td>
                          <td className="px-5 py-3 truncate max-w-[90px]" title={r.sub2 || ''}>{r.sub2 || '—'}</td>
                          <td className="px-5 py-3 truncate max-w-[90px]" title={r.sub3 || ''}>{r.sub3 || '—'}</td>
                          <td className="px-5 py-3 truncate max-w-[90px]" title={r.sub4 || ''}>{r.sub4 || '—'}</td>
                          <td className="px-5 py-3 truncate max-w-[90px]" title={r.sub5 || ''}>{r.sub5 || '—'}</td>
                        </tr>
                      ))}
                      {clickRows.length === 0 && (
                        <tr><td colSpan={10} className="text-center py-10 text-slate-500 text-xs uppercase font-semibold">No matching redirects registered.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {clickTotal > PAGE_SIZE && (
                  <div className="flex items-center justify-between gap-4 border-t border-slate-800 px-5 py-3">
                    <span className="text-xs text-slate-400">{(clickPage - 1) * PAGE_SIZE + 1}–{Math.min(clickPage * PAGE_SIZE, clickTotal)} of {clickTotal.toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setClickPage(p => Math.max(1, p - 1))} disabled={clickPage <= 1}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
                        <ChevronLeft className="w-3.5 h-3.5" />Prev
                      </button>
                      <span className="text-xs text-slate-500 px-2">{clickPage} / {clickTotalPages || 1}</span>
                      <button onClick={() => setClickPage(p => Math.min(clickTotalPages, p + 1))} disabled={clickPage >= clickTotalPages}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
                        Next<ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* CONVERSIONS */}
            {activeTab === "conversions" && (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800 text-left">
                    <thead className="bg-slate-950 text-[10px] tracking-wider font-mono uppercase text-slate-400">
                      <tr>
                        {["Time","Offer","Status","Payout","Revenue","Click ID"].map(h => (
                          <th key={h} className="px-5 py-3 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-[11px] text-slate-400 font-mono bg-slate-900/40">
                      {convRows.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-850/20 transition">
                          <td className="px-5 py-3 text-white truncate max-w-[130px]" title={r.event_timestamp}>{fmtDate(r.event_timestamp)}</td>
                          <td className="px-5 py-3 text-slate-300 truncate max-w-[160px]" title={r.offer_name}>{r.offer_name}</td>
                          <td className="px-5 py-3">{statusBadge(r.conversion_status)}</td>
                          <td className="px-5 py-3 text-emerald-400 font-bold">${Number(r.payout_amount).toFixed(2)}</td>
                          <td className="px-5 py-3 text-indigo-300">${Number(r.revenue_amount).toFixed(2)}</td>
                          <td className="px-5 py-3 text-cyan-400 font-mono text-[10px] select-all">{r.click_id ? r.click_id.slice(0, 12) + '…' : '—'}</td>
                        </tr>
                      ))}
                      {convRows.length === 0 && (
                        <tr><td colSpan={6} className="text-center py-10 text-slate-500 text-xs uppercase font-semibold">No validated conversions in the selected date range.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {convTotal > PAGE_SIZE && (
                  <div className="flex items-center justify-between gap-4 border-t border-slate-800 px-5 py-3">
                    <span className="text-xs text-slate-400">{(convPage - 1) * PAGE_SIZE + 1}–{Math.min(convPage * PAGE_SIZE, convTotal)} of {convTotal.toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setConvPage(p => Math.max(1, p - 1))} disabled={convPage <= 1}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
                        <ChevronLeft className="w-3.5 h-3.5" />Prev
                      </button>
                      <span className="text-xs text-slate-500 px-2">{convPage} / {convTotalPages || 1}</span>
                      <button onClick={() => setConvPage(p => Math.min(convTotalPages, p + 1))} disabled={convPage >= convTotalPages}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition">
                        Next<ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ReportsView;
