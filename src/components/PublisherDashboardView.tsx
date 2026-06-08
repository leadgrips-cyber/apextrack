import { useState, useMemo } from "react";
import {
  TrendingUp,
  Activity,
  UserCheck,
  Percent,
  DollarSign,
  MousePointer,
  Sparkles,
  Play,
  CheckCircle,
  MapPin,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Info
} from "lucide-react";
import { REPLAY_TRAFFIC_LOGS } from "../data/publisherDemo";

export function PublisherDashboardView({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [timeframe, setTimeframe] = useState<"today" | "yesterday" | "7days" | "month">("7days");
  const [trafficFeed, setTrafficFeed] = useState(REPLAY_TRAFFIC_LOGS);

  // Computed live numbers based on timeframe selection to mimic realistic reactivity
  const timeBasedStats = useMemo(() => {
    switch (timeframe) {
      case "today":
        return { clicks: 1240, cvs: 54, rev: 335.20, epc: 0.27, cr: 4.35, pending: 95.00 };
      case "yesterday":
        return { clicks: 3102, cvs: 122, rev: 890.40, epc: 0.28, cr: 3.93, pending: 180.00 };
      case "month":
        return { clicks: 92840, cvs: 3951, rev: 24905.50, epc: 0.26, cr: 4.25, pending: 1420.50 };
      case "7days":
      default:
        return { clicks: 14201, cvs: 588, rev: 3840.80, epc: 0.27, cr: 4.14, pending: 450.00 };
    }
  }, [timeframe]);

  // Inject a new mock tracking click redirect representing real-time traffic updates
  const handleSimulateClick = () => {
    const randomOffers = ["NordVPNSecure", "Apex Trading App", "FastHomeLoan", "KetoDiet Shred", "CoinLedger crypto"];
    const randomGeos = ["US", "DE", "GB", "CA", "SG", "JP", "FR"];
    const randomSub = ["google_ads", "fb_campaign", "adsterra_pop", "aff_forum", "newsletter_june"];
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];

    const isConv = Math.random() > 0.8;
    const item = {
      time: timeStr,
      offer: randomOffers[Math.floor(Math.random() * randomOffers.length)],
      geo: randomGeos[Math.floor(Math.random() * randomGeos.length)],
      type: isConv ? "lead" as const : "click" as const,
      status: isConv ? "Converted" : "Redirected",
      sub1: randomSub[Math.floor(Math.random() * randomSub.length)],
      sub2: "sub_aff_" + Math.floor(Math.random() * 100),
      ...(isConv && { payout: `$${(Math.random() * 25 + 3).toFixed(2)}` })
    };

    setTrafficFeed(prev => [item, ...prev.slice(0, 7)]);
  };

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
            <span className="text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold font-mono">Affiliate ID</span>
            <span className="text-xs font-black text-slate-900">#2081</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-700 border border-cyan-200">
              Verified
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

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        
        <div className="rounded-[20px] border border-slate-200 bg-gradient-to-br from-cyan-50 to-sky-100 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-slate-500">Gross Clicks</p>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">{timeBasedStats.clicks.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-cyan-600 shadow-sm">
              <MousePointer className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            +14.2% versus prev period
          </p>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-gradient-to-br from-emerald-50 to-green-100 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-slate-500">Conversions</p>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">{timeBasedStats.cvs.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-emerald-600 shadow-sm">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-900" />
            +8.6% quality lift
          </p>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-gradient-to-br from-violet-50 to-purple-100 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-slate-500">Revenue (USD)</p>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">${timeBasedStats.rev.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-violet-600 shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            +21.9% revenue growth
          </p>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-gradient-to-br from-amber-50 to-orange-100 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-slate-500">CR Percentage</p>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">{timeBasedStats.cr}%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-orange-600 shadow-sm">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            Stable conversion trend
          </p>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-gradient-to-br from-pink-50 to-rose-100 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-slate-500">Average EPC</p>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">${timeBasedStats.epc.toFixed(2)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-pink-600 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            Slight EPC contraction
          </p>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-100 p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer" onClick={() => onNavigate("wallet") }>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] font-bold text-slate-500">Holds / Pending</p>
              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">${timeBasedStats.pending.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
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

            {/* Custom Interactive SVG Chart */}
            <div className="bg-slate-50 border border-slate-200 rounded-[18px] p-4 min-h-[240px]">
              <svg className="w-full h-48 select-none overflow-visible" viewBox="0 0 500 200">
                {/* Horizontal Guide Rules */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="40" y1="140" x2="480" y2="140" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="40" y1="180" x2="480" y2="180" stroke="#e2e8f0" strokeWidth="1" />

                {/* Vertical Axis labels */}
                <text x="15" y="24" fill="#64748b" fontSize="8" fontFamily="monospace">1500</text>
                <text x="15" y="84" fill="#64748b" fontSize="8" fontFamily="monospace">750</text>
                <text x="15" y="144" fill="#64748b" fontSize="8" fontFamily="monospace">250</text>
                <text x="15" y="184" fill="#64748b" fontSize="8" fontFamily="monospace">0</text>

                {/* Blue Click Path Line */}
                <path
                  d="M 40 160 L 100 130 L 160 150 L 220 80 L 280 90 L 340 50 L 400 42 L 480 25"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="2.5"
                />
                
                {/* Purple Conversion Path Line */}
                <path
                  d="M 40 178 L 100 170 L 160 174 L 220 150 L 280 152 L 340 130 L 400 122 L 480 102"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                />

                {/* Graph Dots */}
                <circle cx="220" cy="80" r="4.5" fill="#22d3ee" stroke="#0f172a" strokeWidth="2" />
                <circle cx="340" cy="50" r="4.5" fill="#22d3ee" stroke="#0f172a" strokeWidth="2" />
                <circle cx="480" cy="25" r="4.5" fill="#22d3ee" stroke="#0f172a" strokeWidth="2" />

                <circle cx="220" cy="150" r="4" fill="#818cf8" stroke="#0f172a" strokeWidth="1.5" />
                <circle cx="480" cy="102" r="4" fill="#818cf8" stroke="#0f172a" strokeWidth="1.5" />

                {/* Horizontal X axis labels */}
                <text x="40" y="195" fill="#64748b" textAnchor="middle" fontSize="8" fontFamily="monospace">Mon</text>
                <text x="100" y="195" fill="#64748b" textAnchor="middle" fontSize="8" fontFamily="monospace">Tue</text>
                <text x="160" y="195" fill="#64748b" textAnchor="middle" fontSize="8" fontFamily="monospace">Wed</text>
                <text x="220" y="195" fill="#64748b" textAnchor="middle" fontSize="8" fontFamily="monospace">Thu</text>
                <text x="280" y="195" fill="#64748b" textAnchor="middle" fontSize="8" fontFamily="monospace">Fri</text>
                <text x="340" y="195" fill="#64748b" textAnchor="middle" fontSize="8" fontFamily="monospace">Sat</text>
                <text x="400" y="195" fill="#64748b" textAnchor="middle" fontSize="8" fontFamily="monospace">Sun</text>
                <text x="480" y="195" fill="#64748b" textAnchor="middle" fontSize="8" fontFamily="monospace">Today</text>
              </svg>
            </div>
          </div>

          {/* QUICK LINKS FOR OFFERS WORKSPACE */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-slate-950 text-sm font-extrabold uppercase font-mono tracking-wider">
                  Top Recommended Campaigns
                </h3>
                <p className="text-sm text-slate-600">
                  Offers with the highest EPC ratings in your geo cluster over the past 48 hours.
                </p>
              </div>
              <button
                onClick={() => onNavigate("marketplace")}
                className="text-xs text-cyan-600 hover:text-cyan-700 font-semibold flex items-center gap-1 font-mono"
              >
                Browse Marketplace <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 hover:border-cyan-500/20 transition cursor-pointer" onClick={() => onNavigate("marketplace")}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1 min-w-0">
                    <span className="bg-emerald-100 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wide">
                      HIGH CR (4.6%)
                    </span>
                    <strong className="text-slate-950 text-xs block truncate pt-1">NordVPN Secure CPA</strong>
                  </div>
                  <span className="text-cyan-600 text-xs font-black font-mono tracking-wider shrink-0">$3.80 CPA</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Geos: US, CA, EU</span>
                  <span>EPC: $0.18</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3 hover:border-cyan-500/20 transition cursor-pointer" onClick={() => onNavigate("marketplace")}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1 min-w-0">
                    <span className="bg-indigo-100 text-indigo-700 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wide">
                      HIGH PAYOUT ($28)
                    </span>
                    <strong className="text-slate-950 text-xs block truncate pt-1">FastHomeLoan Zip Leads</strong>
                  </div>
                  <span className="text-cyan-600 text-xs font-black font-mono tracking-wider shrink-0">$28.00 CPL</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Geos: US, CA Only</span>
                  <span>EPC: $1.86</span>
                </div>
              </div>
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
              <button
                type="button"
                onClick={handleSimulateClick}
                className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white shadow-lg transition hover:bg-cyan-500"
              >
                <Play className="w-3.5 h-3.5 text-white" />
                Fire Hit
              </button>
            </div>

            {/* Simulated Live Feed Log */}
            <div className="space-y-3 max-h-[290px] overflow-y-auto scrollbar-thin" id="traffic-stream-scroll">
              {trafficFeed.map((log, li) => {
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

            <span className="text-[10px] text-slate-500 font-mono block text-center pt-2 border-t border-slate-200 select-none">
              Double-entry secure cryptographical logging
            </span>

          </div>

          {/* GEOTARGETING CHART CHIPS */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 shadow-sm">
            <h3 className="text-slate-950 text-xs font-bold uppercase font-mono tracking-wider">
              Top Geographic Performance
            </h3>
            
            <div className="space-y-2.5">
              {[
                { name: "United States", code: "US", clickShare: 52, convs: 322, leadColor: "w-[52%]" },
                { name: "Germany", code: "DE", clickShare: 18, convs: 112, leadColor: "w-[18%]" },
                { name: "United Kingdom", code: "GB", clickShare: 14, convs: 84, leadColor: "w-[14%]" },
                { name: "Canada", code: "CA", clickShare: 10, convs: 48, leadColor: "w-[10%]" },
                { name: "Singapore", code: "SG", clickShare: 6, convs: 22, leadColor: "w-[6%]" }
              ].map((geo, gidx) => (
                <div key={gidx} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <strong>{geo.name}</strong> ({geo.code})
                    </span>
                    <span className="font-mono text-cyan-600 font-bold">{geo.convs} conversions</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-cyan-400 ${geo.leadColor} rounded-full`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
