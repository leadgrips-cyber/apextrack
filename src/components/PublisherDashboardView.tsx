import { useState, useEffect } from "react";
import {
  TrendingUp,
  Activity,
  UserCheck,
  Percent,
  DollarSign,
  MousePointer,
  Sparkles,
  CheckCircle,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  Globe,
  Megaphone,
} from "lucide-react";
import * as publisherApi from "../services/publisherAnalytics";
import type { PublisherDashboardStats } from "../services/publisherAnalytics";
import { listActiveAnnouncements, AnnouncementRecord } from "../services/announcements";

function getDateRange(tf: "today" | "yesterday" | "7days" | "month") {
  const today = new Date().toISOString().slice(0, 10);
  if (tf === "today") return { startDate: today, endDate: today };
  if (tf === "yesterday") {
    const d = new Date(); d.setDate(d.getDate() - 1);
    const s = d.toISOString().slice(0, 10);
    return { startDate: s, endDate: s };
  }
  if (tf === "7days") {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return { startDate: d.toISOString().slice(0, 10), endDate: today };
  }
  const d = new Date(); d.setDate(d.getDate() - 30);
  return { startDate: d.toISOString().slice(0, 10), endDate: today };
}

const defaultStats: PublisherDashboardStats = {
  total_clicks: 0, total_conversions: 0, total_payout: '0.00', total_revenue: '0.00',
  epc: '0.0000', cr: '0.00', available_balance: '0.000000', pending_balance: '0.000000', withdrawn_balance: '0.000000',
};

export function PublisherDashboardView({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [timeframe, setTimeframe] = useState<"today" | "yesterday" | "7days" | "month">("7days");
  const [trafficFeed, setTrafficFeed] = useState<any[]>([]);
  const [stats, setStats] = useState<PublisherDashboardStats>(defaultStats);
  const [statsLoading, setStatsLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([]);

  useEffect(() => {
    setStatsLoading(true);
    const range = getDateRange(timeframe);
    publisherApi.getPublisherDashboardStats(range)
      .then(setStats)
      .catch(() => setStats(defaultStats))
      .finally(() => setStatsLoading(false));
  }, [timeframe]);

  useEffect(() => {
    listActiveAnnouncements()
      .then(setAnnouncements)
      .catch(() => {});
  }, []);


  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="dashboard-view">
      
      {/* Upper Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 rounded-[20px] border border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-blue-50 px-7 py-7 shadow-lg">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700 shadow-inner shadow-cyan-200/60">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Publisher Console</h1>
              <p className="mt-2 text-sm text-slate-600 max-w-xl">
                Modern affiliate analytics for campaign performance, postback health, and live traffic activity.
              </p>
            </div>
          </div>
          <div className="inline-flex flex-wrap items-center gap-3 rounded-full border border-slate-200 bg-white/90 px-4 py-2 shadow-sm">
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold font-mono">Publisher Portal</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-700 border border-cyan-200">
              Active
            </span>
          </div>
        </div>

        <div className="inline-flex rounded-[20px] border border-slate-200 bg-white p-1 shadow-sm">
          {(["today", "yesterday", "7days", "month"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                timeframe === t
                  ? "rounded-[16px] bg-cyan-600 text-white shadow-lg"
                  : "rounded-[16px] text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              {t === "7days" ? "7 days" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-4 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-900/20 px-5 py-4"
            >
              <div className="shrink-0 mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-800/40">
                <Megaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-indigo-900 dark:text-indigo-200">{a.title}</p>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-0.5 leading-relaxed">{a.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        
        <div className="rounded-[20px] border border-slate-200 bg-gradient-to-br from-cyan-50 to-sky-100 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-slate-500">Gross Clicks</p>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">{statsLoading ? '—' : stats.total_clicks.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-cyan-600 shadow-sm">
              <MousePointer className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 font-mono">Selected period total</p>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-gradient-to-br from-emerald-50 to-green-100 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-slate-500">Conversions</p>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">{statsLoading ? '—' : stats.total_conversions.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-emerald-600 shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 font-mono">Selected period total</p>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-gradient-to-br from-violet-50 to-purple-100 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-slate-500">Revenue (USD)</p>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">{statsLoading ? '—' : `$${Number(stats.total_payout).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-violet-600 shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 font-mono">Payout earnings</p>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-gradient-to-br from-amber-50 to-orange-100 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-slate-500">CR Percentage</p>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">{statsLoading ? '—' : `${stats.cr}%`}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-orange-600 shadow-sm">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 font-mono">Conversion rate</p>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-gradient-to-br from-pink-50 to-rose-100 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-slate-500">Average EPC</p>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">{statsLoading ? '—' : `$${Number(stats.epc).toFixed(2)}`}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-pink-600 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-500 font-mono">Earnings per click</p>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-100 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer" onClick={() => onNavigate("wallet") }>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-slate-500">Holds / Pending</p>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">{statsLoading ? '—' : `$${Number(stats.pending_balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-sky-600 shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600 flex items-center gap-2">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-sky-500" />
            Review wallet holdings
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRAPH & OFFERS INDEX: LEFT (9/12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SVG RENDERING REALISTIC TRENDS GRAPH */}
          <div className="rounded-[20px] border border-slate-200 bg-white p-5 space-y-5 shadow-lg">
            <div className="rounded-[18px] border border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-blue-50 p-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.32em] text-slate-600 shadow-sm">
                    <Activity className="w-4 h-4 text-cyan-600" />
                    Traffic Performance Streams
                  </div>
                  <p className="text-sm text-slate-600 max-w-xl">
                    Dynamic attribution across click volume, conversions and postback momentum for the current reporting window.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
                    Gross Redirect Clicks
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] text-slate-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    Postback Conversions
                  </span>
                </div>
              </div>
            </div>

            {/* Traffic chart — data populates once you have active offers sending traffic */}
            <div className="bg-slate-50 border border-slate-200 rounded-[18px] p-4 min-h-[240px] flex flex-col items-center justify-center text-center gap-3">
              <Activity className="w-8 h-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">No traffic data yet</p>
              <p className="text-xs text-slate-400 max-w-xs">Activate an offer and start sending traffic. Clicks and conversions will appear here in real time.</p>
              <button
                onClick={() => onNavigate("marketplace")}
                className="mt-1 text-xs font-semibold text-cyan-600 hover:text-cyan-700 flex items-center gap-1 transition"
              >
                Browse offers <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* OFFER WORKSPACE QUICK LINKS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-slate-950 text-sm font-extrabold uppercase font-mono tracking-wider">
                  Offer Marketplace
                </h3>
                <p className="text-sm text-slate-600">
                  Browse available campaigns and join offers matching your traffic sources.
                </p>
              </div>
              <button
                onClick={() => onNavigate("marketplace")}
                className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-1 font-mono"
              >
                Browse All <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:border-cyan-300 transition"
              onClick={() => onNavigate("marketplace")}
            >
              <CheckCircle className="w-8 h-8 text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">Find your first offer</p>
              <p className="text-xs text-slate-400 max-w-xs">Join available campaigns from the marketplace and start generating commissions.</p>
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-cyan-600">
                Go to Marketplace <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

        </div>

        {/* SIDE LIVE TRAFFIC STREAM CONTROLS: RIGHT (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* SIMULATED TRAFFIC STREAM TERMINAL CARD */}
          <div className="rounded-[20px] border border-slate-200 bg-white p-5 space-y-4 shadow-lg">
            
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h3 className="text-slate-950 text-sm font-extrabold uppercase tracking-[0.32em] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-500 animate-pulse" />
                  Live Redirect Stream
                </h3>
                <p className="text-sm text-slate-600">
                  Real-time event stream with status indicators and traffic source context.
                </p>
              </div>
            </div>

            {/* Live redirect event stream */}
            <div className="space-y-3 max-h-[290px] overflow-y-auto scrollbar-thin" id="traffic-stream-scroll">
              {trafficFeed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <Clock className="w-7 h-7 text-slate-300" />
                  <p className="text-xs text-slate-400">No events yet. Send traffic through your tracking links to see live redirects here.</p>
                </div>
              ) : trafficFeed.map((log, li) => {
                const isConv = log.type === "lead" || log.type === "sale";
                return (
                  <div
                    key={li}
                    className={`rounded-[18px] border p-3 text-[10px] space-y-2 transition duration-150 shadow-sm ${
                      isConv
                        ? "bg-emerald-50 border-emerald-200"
                        : log.error
                        ? "bg-rose-50 border-rose-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[11px] text-slate-500 font-mono">
                      <span>{log.time}</span>
                      {isConv ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 font-semibold tracking-wide border border-emerald-200">
                          <span className="h-2 w-2 rounded-full bg-emerald-500" />
                          {log.payout || "Lead"} ok
                        </span>
                      ) : log.error ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-rose-700 font-semibold tracking-wide border border-rose-200" title={log.error}>
                          <span className="h-2 w-2 rounded-full bg-rose-500" />
                          ERROR
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-600 tracking-wide border border-slate-200">
                          <span className="h-2 w-2 rounded-full bg-slate-500" />
                          HIT
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <strong className="text-slate-950 truncate font-medium">{log.offer}</strong>
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1 text-[9px] text-slate-600 font-mono">
                        GEO: {log.geo}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[9px] text-slate-500 font-mono">
                      <span>sub1={log.sub1 || "none"}</span>
                      {log.error && <span className="text-rose-600 font-bold italic">{log.error}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* GEOGRAPHIC PERFORMANCE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-sm">
            <h3 className="text-slate-950 text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-500" />
              Geographic Performance
            </h3>
            <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
              <Globe className="w-7 h-7 text-slate-300" />
              <p className="text-xs text-slate-400">No geo data yet. Send traffic through your tracking links to see geographic breakdown.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
