import { useState, useMemo, useEffect } from "react";
import { Link2, Copy, Check, Sliders, Server, RefreshCw, Plus } from "lucide-react";
import * as trackingApi from "../services/tracking";
import { useBranding } from "../contexts/BrandingContext";

interface TrackingLinkViewProps {
  offers: any[];
}

export function TrackingLinkView({ offers }: TrackingLinkViewProps) {
  const branding = useBranding();
  const approvedOffers = useMemo(
    () => offers.filter((o) => o.status === "open_access" || o.status === "approved"),
    [offers]
  );

  const [selectedOfferId, setSelectedOfferId] = useState<string>("");
  const [sub1, setSub1] = useState("");
  const [sub2, setSub2] = useState("");
  const [sub3, setSub3] = useState("");
  const [sub4, setSub4] = useState("");
  const [savedLinks, setSavedLinks] = useState<trackingApi.TrackingLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedOfferId && approvedOffers.length > 0) {
      setSelectedOfferId(String(approvedOffers[0].id));
    }
  }, [approvedOffers, selectedOfferId]);

  useEffect(() => {
    setIsLoading(true);
    trackingApi
      .listTrackingLinks()
      .then((links) => setSavedLinks(links))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const activeOfferObj = useMemo(
    () => approvedOffers.find((o) => String(o.id) === selectedOfferId) || approvedOffers[0],
    [selectedOfferId, approvedOffers]
  );

  const handleGenerate = async () => {
    if (!selectedOfferId) return;
    setErrorMessage("");
    setIsGenerating(true);
    try {
      const link = await trackingApi.generateTrackingLink({
        offer_id: Number(selectedOfferId),
        sub1: sub1 || undefined,
        sub2: sub2 || undefined,
        sub3: sub3 || undefined,
        sub4: sub4 || undefined,
      });
      setSavedLinks((prev) => [link, ...prev]);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate tracking link");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (link: trackingApi.TrackingLink) => {
    navigator.clipboard.writeText(branding.trackingDomain + link.tracking_url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="tracking-generator-root">

      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            <Link2 className="w-5 h-5 text-cyan-400" />
            Tracking Link Generator
          </h2>
          <p className="text-xs text-slate-400">
            Generate and manage tracking links for your approved campaigns.
          </p>
        </div>
        <div className="bg-slate-950 px-2.5 py-1 rounded text-[10px] text-slate-400 font-mono border border-slate-900 select-all shrink-0">
          Tool: <span className="text-cyan-400 font-bold">S2S Click Builder</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-white text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Parameter Configuration
          </h3>

          {errorMessage && (
            <div className="bg-rose-950/40 border border-rose-800 text-rose-300 text-xs p-3 rounded-xl">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-500 font-mono">
                1. Select Campaign Offer
              </label>
              {approvedOffers.length === 0 ? (
                <p className="mt-2 text-slate-500 text-xs">
                  No approved offers available. Apply for an offer in the Marketplace first.
                </p>
              ) : (
                <select
                  value={selectedOfferId}
                  onChange={(e) => setSelectedOfferId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
                >
                  {approvedOffers.map((o) => (
                    <option key={o.id} value={String(o.id)}>
                      [{o.id}] {o.name} (${o.payoutValue.toFixed(2)} {o.payoutType})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <span className="block text-[10px] uppercase font-semibold text-slate-500 font-mono">
                2. Sub ID Traffic Segments (Optional)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(
                  [
                    { value: sub1, set: setSub1, label: "sub1", placeholder: "e.g. facebook_ads" },
                    { value: sub2, set: setSub2, label: "sub2", placeholder: "e.g. banner_top" },
                    { value: sub3, set: setSub3, label: "sub3", placeholder: "e.g. video_v3" },
                    { value: sub4, set: setSub4, label: "sub4", placeholder: "e.g. buy_nordvpn" },
                  ] as const
                ).map(({ value, set, label, placeholder }) => (
                  <div key={label}>
                    <label className="block text-[10px] text-slate-400 font-mono mb-1">{label}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => set(e.target.value)}
                      placeholder={placeholder}
                      className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedOfferId}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Generate & Save Link
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-white text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Server className="w-4 h-4 text-cyan-400" />
            Selected Campaign
          </h3>
          {activeOfferObj ? (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300 leading-relaxed">
              <div>
                Campaign: <strong className="text-white">{activeOfferObj.name}</strong>
              </div>
              <div>
                Category: <span className="text-cyan-400 font-bold">{activeOfferObj.category}</span>
              </div>
              <div>
                Commission:{" "}
                <span className="text-emerald-400 font-bold">
                  ${activeOfferObj.payoutValue.toFixed(2)} ({activeOfferObj.payoutType})
                </span>
              </div>
              <div>
                Status: <span className="text-slate-400">{activeOfferObj.status}</span>
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs">No offer selected.</div>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h3 className="text-slate-950 text-xs font-bold uppercase font-mono tracking-wider">
          Saved Tracking Links ({savedLinks.length})
        </h3>

        {isLoading ? (
          <div className="text-slate-500 text-xs flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Loading...
          </div>
        ) : savedLinks.length === 0 ? (
          <div className="text-slate-500 text-xs">
            No tracking links yet. Use the builder above to generate one.
          </div>
        ) : (
          <div className="space-y-3">
            {savedLinks.map((link) => {
              const fullUrl = branding.trackingDomain + link.tracking_url;
              return (
                <div key={link.id} className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Offer #{link.offer_id}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(link.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <pre className="text-xs font-mono text-cyan-700 bg-cyan-50 border border-cyan-200 p-3 rounded-lg break-words whitespace-pre-wrap select-all">
                    {fullUrl}
                  </pre>
                  <button
                    onClick={() => handleCopy(link)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition"
                  >
                    {copiedId === link.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
