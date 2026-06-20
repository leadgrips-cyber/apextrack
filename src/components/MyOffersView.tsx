import { useState, useEffect } from "react";
import { CheckCircle, Link, ShieldCheck } from "lucide-react";
import { useBranding } from "../contexts/BrandingContext";

interface MyOffersViewProps {
  setSelectedOfferId: (id: string | null) => void;
}

export function MyOffersView({ setSelectedOfferId }: MyOffersViewProps) {
  const branding = useBranding();
  const [approvedOffers, setApprovedOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) { setApprovedOffers([]); setLoading(false); return; }
      try {
        const res = await fetch("/api/publisher/me/approved-offers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { setApprovedOffers([]); setLoading(false); return; }
        const data = await res.json();
        const normalized = Array.isArray(data.offers)
          ? data.offers.map((o: any) => ({
              ...o,
              id: o.id?.toString?.() ?? "",
              logo_url: o.offer_logo_url ?? null,
              payoutType: o.payout_type ?? "CPA",
              payoutValue: Number(o.payout_amount ?? 0),
              caps: typeof o.caps === "string" && o.caps.length > 0
                ? o.caps
                : "Live offer details available on request",
            }))
          : [];
        setApprovedOffers(normalized);
      } catch {
        setApprovedOffers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="my-offers-view">

      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            My Approved Offer Campaigns
          </h2>
          <p className="text-xs text-slate-400">
            Below are active tracking relationships available for instant traffic redirection.
          </p>
        </div>
        <div className="bg-slate-950 px-2 py-1 rounded text-[10px] text-slate-400 font-mono border border-slate-900 select-all shrink-0">
          State: <span className="text-emerald-400 font-bold">Approved Catalogs Only</span>
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-sm text-slate-400">Loading...</div>
        ) : approvedOffers.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            No approved offers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950">
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Offer</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Vertical</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Payout</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Daily Cap</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Status</th>
                  <th className="px-4 py-3 text-center text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {approvedOffers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {offer.logo_url && (
                          <img
                            src={offer.logo_url}
                            alt=""
                            className="w-8 h-8 object-contain rounded-lg border border-slate-700 bg-slate-950 shrink-0"
                          />
                        )}
                        <div>
                          <div className="font-semibold text-slate-100 text-xs leading-tight">{offer.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">ID: {offer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400 font-mono uppercase tracking-wide">{offer.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {offer.payoutType === "REVENUE_SHARE" ? (
                        <>
                          <span className="font-bold text-emerald-400 text-xs">{Number(offer.affiliate_revenue_share_percent ?? 0).toFixed(2)}%</span>
                          <span className="text-[10px] text-slate-500 ml-1">Rev Share</span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-emerald-400 text-xs">${offer.payoutValue.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-500 ml-1">/{offer.payoutType}</span>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-400 font-mono">{offer.caps.split(" ")[0]}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-emerald-950 border border-emerald-800 px-2 py-0.5 text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                        Approved
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedOfferId(offer.id)}
                        className="inline-flex items-center gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase font-mono tracking-wider transition cursor-pointer"
                      >
                        <Link className="w-3 h-3" />
                        Get Link
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <strong className="text-white text-xs uppercase font-mono tracking-wider block flex items-center gap-1.5 text-cyan-400">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          General Publisher Traffic Rules & Caps Compliance
        </strong>
        <p className="text-slate-300 text-xs leading-relaxed">
          The campaign relationships listed above represent active, legally authorized associations. In accordance with platform terms:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] leading-relaxed text-slate-400 font-mono pt-1">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
            <span className="block font-bold text-slate-300 text-xs pb-1">1. Daily Dynamic Capsule Caps</span>
            Your daily traffic triggers must not overshoot recommended cap limits without prior clearance requests via your Account Manager rep. Over-caps will result in raw redirections dropping down to empty fallbacks.
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-850">
            <span className="block font-bold text-slate-300 text-xs pb-1">2. Traffic Inspection Logs</span>
            {branding.networkName} reserves execution capabilities to run random checks on traffic referrals, verifying quality constraints, device fingerprints, and geolocation ranges to eliminate click injection triggers.
          </div>
        </div>
      </div>

    </div>
  );
}
