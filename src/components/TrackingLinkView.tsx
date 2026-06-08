import { useState, useMemo } from "react";
import { Link2, Copy, Check, Info, Sliders, Server, HelpCircle, Layers } from "lucide-react";
import { DEMO_OFFERS } from "../data/publisherDemo";

export function TrackingLinkView() {
  const approvedOffers = useMemo(() => DEMO_OFFERS.filter(o => o.status === "active"), []);
  
  const [selectedOfferId, setSelectedOfferId] = useState(approvedOffers[0]?.id || "");
  const [sub1, setSub1] = useState("");
  const [sub2, setSub2] = useState("");
  const [sub3, setSub3] = useState("");
  const [sub4, setSub4] = useState("");
  const [copied, setCopied] = useState(false);

  // Active target candidate
  const activeOfferObj = useMemo(() => {
    return approvedOffers.find(o => o.id === selectedOfferId) || approvedOffers[0];
  }, [selectedOfferId, approvedOffers]);

  // Generated string
  const customGeneratedUrl = useMemo(() => {
    if (!activeOfferObj) return "";
    let base = `https://track.apextrack.com/click?aff_id=2081&offer_id=${activeOfferObj.id}`;
    if (sub1) base += `&sub1=${encodeURIComponent(sub1)}`;
    if (sub2) base += `&sub2=${encodeURIComponent(sub2)}`;
    if (sub3) base += `&sub3=${encodeURIComponent(sub3)}`;
    if (sub4) base += `&sub4=${encodeURIComponent(sub4)}`;
    return base;
  }, [activeOfferObj, sub1, sub2, sub3, sub4]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(customGeneratedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="tracking-generator-root">
      
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            <Link2 className="w-5 h-5 text-cyan-400" />
            Dynamic Tracking Link Generator
          </h2>
          <p className="text-xs text-slate-400">
            Build custom parameters and tracking segments for any active approved campaign URL.
          </p>
        </div>
        <div className="bg-slate-950 px-2.5 py-1 rounded text-[10px] text-slate-400 font-mono border border-slate-900 select-all shrink-0">
          Tool: <span className="text-cyan-400 font-bold">Encrypted Click S2S Builder</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* BUILDER PARAMETERS FORM: LEFT (7/12) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-white text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Parameter Configurations
          </h3>

          <div className="space-y-4 text-xs font-sans">
            
            {/* Dropdown Selector */}
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-500 font-mono">
                1. Select Campaign Offer
              </label>
              <select
                value={selectedOfferId}
                onChange={(e) => setSelectedOfferId(e.target.value)}
                className="mt-1 block w-full px-3 py-2.5 bg-slate-1000 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
              >
                {approvedOffers.map((o) => (
                  <option key={o.id} value={o.id}>
                    [{o.id}] {o.name} (${o.payoutValue.toFixed(2)} {o.payoutType})
                  </option>
                ))}
              </select>
            </div>

            {/* Custom parameters inputs */}
            <div className="space-y-3 pt-2">
              <span className="block text-[10px] uppercase font-semibold text-slate-500 font-mono">
                2. Append Sub ID Traffic Segments (Optional)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-mono mb-1">
                    sub1 (Source / Publisher Traffic Partner)
                  </label>
                  <input
                    type="text"
                    value={sub1}
                    onChange={(e) => setSub1(e.target.value)}
                    placeholder="e.g. facebook_ads"
                    className="block w-full px-3 py-2 bg-slate-1000 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-mono mb-1">
                    sub2 (Placement / Ad Group ID)
                  </label>
                  <input
                    type="text"
                    value={sub2}
                    onChange={(e) => setSub2(e.target.value)}
                    placeholder="e.g. banner_top"
                    className="block w-full px-3 py-2 bg-slate-1000 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-mono mb-1">
                    sub3 (Banner / Creative Version)
                  </label>
                  <input
                    type="text"
                    value={sub3}
                    onChange={(e) => setSub3(e.target.value)}
                    placeholder="e.g. video_v3"
                    className="block w-full px-3 py-2 bg-slate-1000 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-mono mb-1">
                    sub4 (Keywords / Organic Term)
                  </label>
                  <input
                    type="text"
                    value={sub4}
                    onChange={(e) => setSub4(e.target.value)}
                    placeholder="e.g. buy_nordvpn"
                    className="block w-full px-3 py-2 bg-slate-1000 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-slate-500 leading-normal block italic font-mono">
                * ApexTrack compiles parameters dynamically inside redirects. No compilation buffers are needed.
              </span>
            </div>

          </div>
        </div>

        {/* READY GENERATED URL SCREEN: RIGHT (5/12) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-white text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Server className="w-4 h-4 text-cyan-400" />
              Target Live Tracking URL
            </h3>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
              <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block">
                Active Campaign Details:
              </span>
              <div className="text-xs text-slate-300 font-sans leading-relaxed space-y-1">
                <div>Campaign Name: <strong className="text-white">`{activeOfferObj?.name}`</strong></div>
                <div>Default Category: <span className="text-cyan-400 font-bold">{activeOfferObj?.category}</span></div>
                <div>Commission: <span className="text-emerald-400 font-bold">${activeOfferObj?.payoutValue.toFixed(2)} USD ({activeOfferObj?.payoutType})</span></div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-semibold text-slate-700 font-mono block">
                Your Complete Redirection URI:
              </span>
              <pre className="p-4 bg-cyan-50 rounded-xl border border-cyan-200 text-cyan-700 text-xs font-mono break-words leading-normal whitespace-pre-wrap select-all focus:outline-none" style={{ minHeight: "100px" }}>
                {customGeneratedUrl}
              </pre>
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition duration-150 flex items-center justify-center gap-2 select-none cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                Copied Link to Clipboard!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Campaign Click String
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
