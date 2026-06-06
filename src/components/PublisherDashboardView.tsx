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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/20 px-6 py-5 rounded-2xl border border-slate-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Publisher Console</h1>
            <span className="bg-cyan-500/10 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full font-mono border border-cyan-800/30">
              ID: #2081 Account Verified
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Welcome back! Reviewing tracking parameters, click-leads ledger reconciliations, and postback health streams.
          </p>
        </div>

        {/* Timeframe selector controls */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-850 shrink-0">
          {(["today", "yesterday", "7days", "month"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                timeframe === t
                  ? "bg-slate-800 text-cyan-300 font-bold border border-slate-700/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t === "7days" ? "7 days" : t}
            </button>
          ))}
        </div>
      </div>

      {/* BENZO ANALYSIS GRID: 6 MAIN KPI STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Gross Clicks</span>
            <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-xl font-extrabold text-white font-mono">
            {timeBasedStats.clicks.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5" /> +14.2% versus prev
          </span>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Conversions</span>
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-xl font-extrabold text-white font-mono">
            {timeBasedStats.cvs.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5" /> +8.6% versus prev
          </span>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Revenue (USD)</span>
            <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-xl font-extrabold text-white font-mono text-cyan-300">
            ${timeBasedStats.rev.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5" /> +21.9% organic grow
          </span>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">CR Percentage</span>
            <Percent className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-xl font-extrabold text-white font-mono">
            {timeBasedStats.cr}%
          </p>
          <span className="text-[10px] text-slate-500">Optimal (3% - 6% target)</span>
        </div>

        {/* KPI 5 */}
        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Average EPC</span>
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-xl font-extrabold text-white font-mono">
            ${timeBasedStats.epc.toFixed(2)}
          </p>
          <span className="text-[10px] text-rose-400 flex items-center gap-1">
            <TrendingDown className="w-2.5 h-2.5" /> -1.8% global change
          </span>
        </div>

        {/* KPI 6 */}
        <div className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl space-y-1 hover:border-slate-700 transition cursor-pointer" onClick={() => onNavigate("wallet")}>
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-cyan-400">Holds / Pending</span>
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <p className="text-xl font-extrabold text-white font-mono">
            ${timeBasedStats.pending.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[9px] text-slate-400 underline decoration-slate-600 block">Review wallet holdings</span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* GRAPH & OFFERS INDEX: LEFT (9/12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SVG RENDERING REALISTIC TRENDS GRAPH */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-white text-sm font-extrabold uppercase font-mono tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Traffic Performance Streams
                </h3>
                <p className="text-[11px] text-slate-400">
                  Dynamic attribution tracking charting active clicks versus authenticated converting operations over hours span.
                </p>
              </div>
              <div className="flex gap-4 text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-cyan-400 block"></span>
                  <span>Gross Redirect Clicks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-indigo-400 block"></span>
                  <span>Postback Conversions</span>
                </div>
              </div>
            </div>

            {/* Custom Interactive SVG Chart */}
            <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-2">
              <svg className="w-full h-48 select-none overflow-visible" viewBox="0 0 500 200">
                {/* Horizontal Guide Rules */}
                <line x1="40" y1="20" x2="480" y2="20" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="40" y1="80" x2="480" y2="80" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="40" y1="140" x2="480" y2="140" stroke="#1e293b" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="40" y1="180" x2="480" y2="180" stroke="#334155" strokeWidth="1" />

                {/* Vertical Axis labels */}
                <text x="15" y="24" fill="#64748b" fontSize="8" fontFamily="monospace">1500</text>
                <text x="15" y="84" fill="#64748b" fontSize="8" fontFamily="monospace">750</text>
                <text x="15" y="144" fill="#64748b" fontSize="8" fontFamily="monospace">250</text>
                <text x="15" y="184" fill="#64748b" fontSize="8" fontFamily="monospace">0</text>

                {/* Blue Click Path Line */}
                <path
                  d="M 40 160 L 100 130 L 160 150 L 220 80 L 280 90 L 340 50 L 400 42 L 480 25"
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                />
                
                {/* Purple Conversion Path Line */}
                <path
                  d="M 40 178 L 100 170 L 160 174 L 220 150 L 280 152 L 340 130 L 400 122 L 480 102"
                  fill="none"
                  stroke="#818cf8"
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-white text-sm font-extrabold uppercase font-mono tracking-wider">
                  Top Recommended Campaigns
                </h3>
                <p className="text-[11px] text-slate-400">
                  Offers with the highest EPC ratings in your geo cluster over the past 48 hours.
                </p>
              </div>
              <button
                onClick={() => onNavigate("marketplace")}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 font-mono"
              >
                Browse Marketplace <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between space-y-3 hover:border-cyan-500/20 transition cursor-pointer" onClick={() => onNavigate("marketplace")}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1 min-w-0">
                    <span className="bg-emerald-950 text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wide">
                      HIGH CR (4.6%)
                    </span>
                    <strong className="text-slate-200 text-xs block truncate pt-1">NordVPN Secure CPA</strong>
                  </div>
                  <span className="text-cyan-400 text-xs font-black font-mono tracking-wider shrink-0">$3.80 CPA</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Geos: US, CA, EU</span>
                  <span>EPC: $0.18</span>
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 flex flex-col justify-between space-y-3 hover:border-cyan-500/20 transition cursor-pointer" onClick={() => onNavigate("marketplace")}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1 min-w-0">
                    <span className="bg-indigo-950 text-indigo-400 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wide">
                      HIGH PAYOUT ($28)
                    </span>
                    <strong className="text-slate-200 text-xs block truncate pt-1">FastHomeLoan Zip Leads</strong>
                  </div>
                  <span className="text-cyan-400 text-xs font-black font-mono tracking-wider shrink-0">$28.00 CPL</span>
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-white text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  Live Redirect Stream (SaaS)
                </h3>
                <p className="text-[10px] text-slate-400">
                  Attribution logging events capturing real-time hits.
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleSimulateClick}
                className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono text-[9px] font-extrabold px-2 py-1 rounded cursor-pointer transition flex items-center gap-1 uppercase select-none"
              >
                <Play className="w-2.5 h-2.5 fill-slate-950" />
                Fire Hit
              </button>
            </div>

            {/* Simulated Live Feed Log */}
            <div className="space-y-2 max-h-[290px] overflow-y-auto scrollbar-thin rounded-xl" id="traffic-stream-scroll">
              {trafficFeed.map((log, li) => {
                const isConv = log.type === "lead" || log.type === "sale";
                
                return (
                  <div
                    key={li}
                    className={`p-2 rounded-lg text-[10px] space-y-1.5 border transition duration-150 ${
                      isConv
                        ? "bg-slate-950 border-emerald-900/60"
                        : log.error
                        ? "bg-rose-950/20 border-rose-900/40"
                        : "bg-slate-950/70 border-slate-850"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-mono">{log.time}</span>
                      
                      {isConv ? (
                        <span className="bg-emerald-900/40 text-emerald-300 font-bold px-1.5 py-0.2 rounded font-mono text-[8px] uppercase tracking-wide border border-emerald-800/40">
                          {log.payout || "Lead"} ok
                        </span>
                      ) : log.error ? (
                        <span className="bg-rose-950 text-rose-400 font-bold px-1 py-0.2 rounded font-mono text-[7px]" title={log.error}>
                          ERROR
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-mono text-[7px]">
                          HIT
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between font-medium">
                      <strong className="text-slate-200 truncate pr-1">
                        `{log.offer}`
                      </strong>
                      <span className="text-cyan-400 shrink-0 font-mono text-[8px] bg-slate-900 px-1 py-0.2 rounded">
                        GEO: {log.geo}
                      </span>
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-500 font-mono truncate">
                      <span>sub1={log.sub1 || "none"}</span>
                      {log.error && <span className="text-rose-400 font-bold italic">{log.error}</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <span className="text-[10px] text-slate-500 font-mono block text-center pt-1 border-t border-slate-850 select-none">
              Double-Entry secure cryptographical logging
            </span>

          </div>

          {/* GEOTARGETING CHART CHIPS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5">
            <h3 className="text-white text-xs font-bold uppercase font-mono tracking-wider">
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
                  <div className="flex justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <strong>{geo.name}</strong> ({geo.code})
                    </span>
                    <span className="font-mono text-cyan-400 font-bold">{geo.convs} conversions</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
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
