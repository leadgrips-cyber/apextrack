import { useMemo } from "react";
import { CheckCircle, Globe, Link, ArrowUpRight, HelpCircle, AlertTriangle, ShieldCheck } from "lucide-react";

interface MyOffersViewProps {
  setSelectedOfferId: (id: string | null) => void;
  offers: any[];
}

export function MyOffersView({ setSelectedOfferId, offers }: MyOffersViewProps) {
  
  // Filter offers that are approved or open access and ready to generate clicks (status: active/open_access/approved)
  const approvedOffers = useMemo(() => {
    return offers.filter(o => o.status === "open_access" || o.status === "approved");
  }, [offers]);

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {approvedOffers.map((offer) => (
          <div
            key={offer.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-cyan-500/20 transition duration-150"
          >
            <div className="space-y-1">
              <div className="flex justify-between items-start">
                <span className="bg-slate-950 text-cyan-400 text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-slate-850 uppercase">
                  ID: {offer.id}
                </span>
                <span className="bg-emerald-50 text-emerald-800 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border border-emerald-300">
                  Approved
                </span>
              </div>
              
              <strong className="text-slate-100 font-bold text-sm block line-clamp-1">
                {offer.name}
              </strong>
              
              <span className="text-slate-400 text-[11px] font-mono tracking-wider block font-semibold uppercase">
                Vertical: {offer.category}
              </span>
            </div>

            <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
              {offer.description}
            </p>

            {/* Quick mini metrics card */}
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-850 text-[10px] font-mono text-slate-500">
              <div>
                <span className="block text-[8px] uppercase font-bold text-slate-400">Payout rate</span>
                <strong className="text-slate-100 text-xs font-semibold">${offer.payoutValue.toFixed(2)} / {offer.payoutType}</strong>
              </div>
              <div>
                <span className="block text-[8px] uppercase font-bold text-slate-400">Daily capsule</span>
                <strong className="text-slate-300 text-xs truncate block">{offer.caps.split(" ")[0]} limit</strong>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={() => setSelectedOfferId(offer.id)}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded-xl text-[10px] uppercase font-mono tracking-wider transition cursor-pointer select-none text-center flex items-center justify-center gap-1"
              >
                <Link className="w-3.5 h-3.5" />
                Get Tracking Link
              </button>
            </div>

          </div>
        ))}
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
            ApexTrack reserves execution capabilities to run random checks on traffic referrals, verifying quality constraints, device fingerprints, and geolocation ranges to eliminate click injection triggers.
          </div>
        </div>
      </div>

    </div>
  );
}
