import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Settings,
  Globe,
  Image,
  Users,
  Zap,
  TrendingUp,
  BarChart2,
  Loader2,
  PauseCircle,
  CheckCircle,
  Archive,
  Shield,
  Gauge,
} from "lucide-react";
import * as offersApi from "../../services/offers";
import * as advertisersApi from "../../services/advertisers";
import * as summaryApi from "../../services/offerSummary";
import { OfferGeneralTab } from "./OfferGeneralTab";
import { OfferLandingPagesTab } from "./OfferLandingPagesTab";
import { OfferCreativesTab } from "./OfferCreativesTab";
import { OfferAffiliatesTab } from "./OfferAffiliatesTab";
import { OfferEventsTab } from "./OfferEventsTab";
import { OfferTargetingTab } from "./OfferTargetingTab";
import { OfferCappingTab } from "./OfferCappingTab";

type OfferRecord = offersApi.OfferRecord;
type AdvertiserRecord = advertisersApi.AdvertiserRecord;
type OfferSummary = summaryApi.OfferSummary;
type Tab = "general" | "landing_pages" | "creatives" | "affiliates" | "events" | "targeting" | "capping";

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PAUSED: "bg-amber-100 text-amber-700",
  DRAFT: "bg-slate-100 text-slate-600",
  ARCHIVED: "bg-red-100 text-red-600",
  EXHAUSTED: "bg-orange-100 text-orange-700",
  CLOSED: "bg-gray-100 text-gray-600",
};

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "general",      label: "General",        icon: <Settings className="w-3.5 h-3.5" /> },
  { id: "landing_pages",label: "Landing Pages",  icon: <Globe className="w-3.5 h-3.5" /> },
  { id: "creatives",    label: "Creatives",      icon: <Image className="w-3.5 h-3.5" /> },
  { id: "affiliates",   label: "Affiliates",     icon: <Users className="w-3.5 h-3.5" /> },
  { id: "events",       label: "Events & Payout",icon: <Zap className="w-3.5 h-3.5" /> },
  { id: "targeting",    label: "Targeting",      icon: <Shield className="w-3.5 h-3.5" /> },
  { id: "capping",      label: "Capping",        icon: <Gauge className="w-3.5 h-3.5" /> },
];

function fmt(n: number, currency = false) {
  if (currency) return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return n.toLocaleString();
}

interface Props {
  offer: OfferRecord;
  advertisers: AdvertiserRecord[];
  onBack: () => void;
  onOfferUpdated: (updated: OfferRecord) => void;
}

export function OfferDetailView({ offer: initialOffer, advertisers, onBack, onOfferUpdated }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [offer, setOffer] = useState<OfferRecord>(initialOffer);
  const [summary, setSummary] = useState<OfferSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [statusActing, setStatusActing] = useState(false);

  useEffect(() => {
    loadSummary();
  }, [offer.id]);

  async function loadSummary() {
    setSummaryLoading(true);
    try {
      const data = await summaryApi.fetchOfferSummary(offer.id);
      setSummary(data);
    } catch {
      // non-fatal — widget just shows dashes
    } finally {
      setSummaryLoading(false);
    }
  }

  function handleOfferSaved(updated: OfferRecord) {
    setOffer(updated);
    onOfferUpdated(updated);
    loadSummary();
  }

  async function handlePause() {
    setStatusActing(true);
    try {
      const updated = await offersApi.pauseOffer(offer.id);
      setOffer(updated);
      onOfferUpdated(updated);
    } catch { }
    finally { setStatusActing(false); }
  }

  async function handleActivate() {
    setStatusActing(true);
    try {
      const updated = await offersApi.activateOffer(offer.id);
      setOffer(updated);
      onOfferUpdated(updated);
    } catch { }
    finally { setStatusActing(false); }
  }

  async function handleArchive() {
    setStatusActing(true);
    try {
      const updated = await offersApi.archiveOffer(offer.id);
      setOffer(updated);
      onOfferUpdated(updated);
    } catch { }
    finally { setStatusActing(false); }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start gap-4">
        <button
          onClick={onBack}
          className="rounded-xl border theme-border px-3 py-2 text-xs font-semibold theme-text-secondary hover:theme-text-main transition flex items-center gap-2 flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Offer List
        </button>

        <div className="flex-1 min-w-0">
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Offer #{offer.id}</div>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {offer.offer_logo_url && (
              <img src={offer.offer_logo_url} alt="" className="w-9 h-9 rounded-lg border theme-border object-contain flex-shrink-0" />
            )}
            <h1 className="text-2xl font-black theme-text-main">{offer.name}</h1>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[offer.status] ?? "bg-slate-100 text-slate-600"}`}>
              {offer.status.charAt(0) + offer.status.slice(1).toLowerCase()}
            </span>
          </div>
        </div>

        {/* Quick status actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {offer.status === "ACTIVE" && (
            <button onClick={handlePause} disabled={statusActing} className="rounded-2xl bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-200 transition flex items-center gap-1.5 disabled:opacity-50">
              {statusActing ? <Loader2 className="w-4 h-4 animate-spin" /> : <PauseCircle className="w-4 h-4" />}Pause
            </button>
          )}
          {(offer.status === "PAUSED" || offer.status === "DRAFT") && (
            <button onClick={handleActivate} disabled={statusActing} className="rounded-2xl bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition flex items-center gap-1.5 disabled:opacity-50">
              {statusActing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}Activate
            </button>
          )}
          {offer.status !== "ARCHIVED" && (
            <button onClick={handleArchive} disabled={statusActing} className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition flex items-center gap-1.5 disabled:opacity-50">
              {statusActing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}Archive
            </button>
          )}
        </div>
      </div>

      {/* Body: main content + sidebar */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">

        {/* Left: tabs + content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Tab bar */}
          <div className="flex gap-0 border-b theme-border overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px transition ${
                  activeTab === tab.id
                    ? "border-cyan-500 text-cyan-600"
                    : "border-transparent theme-text-muted hover:theme-text-main"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div>
            {activeTab === "general" && (
              <OfferGeneralTab offer={offer} advertisers={advertisers} onSaved={handleOfferSaved} />
            )}
            {activeTab === "landing_pages" && (
              <OfferLandingPagesTab offerId={offer.id} />
            )}
            {activeTab === "creatives" && (
              <OfferCreativesTab offerId={offer.id} />
            )}
            {activeTab === "affiliates" && (
              <OfferAffiliatesTab offerId={offer.id} />
            )}
            {activeTab === "events" && (
              <OfferEventsTab offerId={offer.id} offerName={offer.name} />
            )}
            {activeTab === "targeting" && (
              <OfferTargetingTab offerId={offer.id} />
            )}
            {activeTab === "capping" && (
              <OfferCappingTab offerId={offer.id} />
            )}
          </div>
        </div>

        {/* Right: sidebar widgets */}
        <div className="xl:w-72 w-full flex-shrink-0 space-y-4">

          {/* Offer Summary widget */}
          <div className="theme-bg-card border theme-border rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              <h3 className="text-xs font-bold uppercase tracking-widest theme-text-muted">Offer Summary</h3>
            </div>

            <dl className="space-y-2.5">
              <SummaryRow label="Status">
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusStyles[offer.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {offer.status}
                </span>
              </SummaryRow>
              <SummaryRow label="Advertiser">
                <span className="text-xs font-semibold theme-text-main">{offer.advertiser_name ?? "—"}</span>
              </SummaryRow>
              <SummaryRow label="Category">
                <span className="text-xs font-semibold theme-text-main">{offer.category}</span>
              </SummaryRow>
              <SummaryRow label="Advertiser Payout">
                <span className="text-xs font-semibold theme-text-main">${Number(offer.advertiser_payout ?? offer.payout_amount).toFixed(2)} {offer.payout_type}</span>
              </SummaryRow>
              <SummaryRow label="Affiliate Payout">
                <span className="text-xs font-semibold text-emerald-600">${Number(offer.affiliate_payout ?? offer.payout_amount).toFixed(2)} {offer.payout_type}</span>
              </SummaryRow>
              <SummaryRow label="System Profit">
                <span className="text-xs font-bold text-cyan-600">
                  ${(Number(offer.advertiser_payout ?? offer.payout_amount) - Number(offer.affiliate_payout ?? offer.payout_amount)).toFixed(2)}
                </span>
              </SummaryRow>
              {summaryLoading ? (
                <div className="pt-1"><Loader2 className="w-4 h-4 animate-spin text-slate-400" /></div>
              ) : summary ? (
                <>
                  <div className="border-t theme-border my-2" />
                  <SummaryRow label="Total Affiliates">
                    <span className="text-xs font-bold theme-text-main">{summary.total_affiliates}</span>
                  </SummaryRow>
                  <SummaryRow label="Pending Applications">
                    <span className={`text-xs font-bold ${summary.pending_affiliates > 0 ? "text-amber-600" : "theme-text-main"}`}>
                      {summary.pending_affiliates}
                    </span>
                  </SummaryRow>
                  <SummaryRow label="Active Events">
                    <span className="text-xs font-bold theme-text-main">{summary.active_events}</span>
                  </SummaryRow>
                </>
              ) : null}
              <div className="border-t theme-border my-2" />
              <SummaryRow label="Created">
                <span className="text-xs theme-text-muted">{new Date(offer.created_at).toLocaleDateString()}</span>
              </SummaryRow>
            </dl>
          </div>

          {/* Performance Snapshot widget */}
          <div className="theme-bg-card border theme-border rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-cyan-500" />
              <h3 className="text-xs font-bold uppercase tracking-widest theme-text-muted">Performance</h3>
            </div>

            {summaryLoading ? (
              <div className="py-4 text-center"><Loader2 className="w-4 h-4 animate-spin text-slate-400 mx-auto" /></div>
            ) : summary ? (
              <dl className="space-y-2.5">
                <PerfRow label="Clicks" value={fmt(summary.clicks_total)} />
                <PerfRow label="Conversions" value={fmt(summary.conversions_total)} />
                <div className="border-t theme-border my-2" />
                <PerfRow label="Revenue" value={fmt(summary.revenue_total, true)} />
                <PerfRow label="Payout" value={fmt(summary.payout_total, true)} />
                <PerfRow
                  label="Profit"
                  value={fmt(summary.profit_total, true)}
                  highlight={summary.profit_total >= 0 ? "positive" : "negative"}
                />
              </dl>
            ) : (
              <p className="text-xs text-slate-400 text-center py-2">Unable to load stats</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-xs theme-text-muted flex-shrink-0">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

function PerfRow({ label, value, highlight }: { label: string; value: string; highlight?: "positive" | "negative" }) {
  const valueClass =
    highlight === "positive"
      ? "text-emerald-600 font-bold"
      : highlight === "negative"
      ? "text-red-500 font-bold"
      : "font-semibold theme-text-main";
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-xs theme-text-muted">{label}</dt>
      <dd className={`text-xs ${valueClass}`}>{value}</dd>
    </div>
  );
}
