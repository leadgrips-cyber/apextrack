import { useEffect, useState } from "react";
import { Copy, Check, Link2, AlertTriangle, Zap } from "lucide-react";
import { getAdminNetworkSettings } from "../../services/network-settings";
import { listAdminOffers, OfferRecord } from "../../services/offers";
import { listOfferEvents, OfferEventRecord } from "../../services/offerEvents";

const TOKENS: { name: string; description: string }[] = [
  { name: "{click_id}",       description: "ApexTrack click identifier" },
  { name: "{transaction_id}", description: "Advertiser transaction / order ID" },
  { name: "{status}",         description: "Conversion status (approved, pending…)" },
  { name: "{payout}",         description: "Publisher payout amount" },
  { name: "{revenue}",        description: "Advertiser revenue amount" },
  { name: "{sub1}",           description: "Sub-parameter 1" },
  { name: "{sub2}",           description: "Sub-parameter 2" },
  { name: "{sub3}",           description: "Sub-parameter 3" },
  { name: "{sub4}",           description: "Sub-parameter 4" },
  { name: "{sub5}",           description: "Sub-parameter 5" },
];

function buildGlobalUrl(domain: string) {
  const base = domain.replace(/\/$/, "");
  return `${base}/api/postback?click_id={click_id}&transaction_id={transaction_id}&status={status}&payout={payout}&revenue={revenue}`;
}

function buildOfferUrl(domain: string, offerId: number) {
  const base = domain.replace(/\/$/, "");
  return `${base}/api/postback?click_id={click_id}&offer_id=${offerId}&transaction_id={transaction_id}&status={status}&payout={payout}&revenue={revenue}`;
}

function buildEventUrl(domain: string, eventToken: string) {
  const base = domain.replace(/\/$/, "");
  return `${base}/api/postback?click_id={click_id}&event=${eventToken}&transaction_id={transaction_id}`;
}

interface CopyButtonProps {
  url: string;
  disabled: boolean;
  label: string;
  variant?: "cyan" | "violet";
  onCopied: () => void;
}

function CopyButton({ url, disabled, label, variant = "cyan", onCopied }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (disabled || !url) return;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    onCopied();
    setTimeout(() => setCopied(false), 1500);
  }

  const colorClass =
    variant === "violet"
      ? "bg-violet-600 hover:bg-violet-500"
      : "bg-cyan-600 hover:bg-cyan-500";

  return (
    <button
      onClick={handleCopy}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl ${colorClass} text-white text-sm font-semibold disabled:opacity-40 transition`}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copied!" : label}
    </button>
  );
}

export function AdvertiserPostbackGeneratorView() {
  const [trackingDomain, setTrackingDomain] = useState<string>("");
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string>("");

  const [events, setEvents] = useState<OfferEventRecord[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [selectedEventToken, setSelectedEventToken] = useState<string>("");

  const [toast, setToast] = useState(false);

  useEffect(() => {
    getAdminNetworkSettings()
      .then((s) => setTrackingDomain(s.tracking_domain || ""))
      .catch((e: Error) => setSettingsError(e.message))
      .finally(() => setLoadingSettings(false));

    listAdminOffers().then(setOffers).catch(() => {});
  }, []);

  useEffect(() => {
    setSelectedEventToken("");
    if (!selectedOfferId) {
      setEvents([]);
      return;
    }
    setEventsLoading(true);
    listOfferEvents(Number(selectedOfferId))
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, [selectedOfferId]);

  function showToast() {
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  const domainMissing = !loadingSettings && !settingsError && !trackingDomain;
  const globalUrl = trackingDomain ? buildGlobalUrl(trackingDomain) : "";
  const offerUrl =
    trackingDomain && selectedOfferId
      ? buildOfferUrl(trackingDomain, Number(selectedOfferId))
      : "";
  const selectedOffer = offers.find((o) => String(o.id) === selectedOfferId);
  const activeEvents = events.filter((e) => e.is_active);
  const eventUrl =
    trackingDomain && selectedEventToken
      ? buildEventUrl(trackingDomain, selectedEventToken)
      : "";

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black theme-text-main tracking-tight">
          Advertiser Postback Generator
        </h1>
        <p className="text-sm theme-text-muted mt-1">
          Generate S2S postback URLs to send to advertisers for conversion tracking configuration.
        </p>
      </div>

      {domainMissing && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 px-4 py-3 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>
            Tracking domain not configured.{" "}
            <span className="font-semibold">Go to System → Network Settings</span> to set it up before
            generating URLs.
          </span>
        </div>
      )}

      {settingsError && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 px-4 py-3 text-sm">
          Failed to load network settings: {settingsError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Generator panels */}
        <div className="lg:col-span-2 space-y-5">

          {/* Global Postback */}
          <div className="rounded-2xl border theme-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-cyan-500/10">
                <Link2 className="w-4 h-4 text-cyan-400" />
              </div>
              <h2 className="text-sm font-bold theme-text-main">Global Postback URL</h2>
            </div>
            <p className="text-xs theme-text-muted">
              Works for any offer. ApexTrack identifies the offer automatically from the click ID.
              Send this URL to advertisers who run multiple offers under one tracker.
            </p>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/80 border theme-border px-4 py-3">
              {loadingSettings ? (
                <span className="text-xs theme-text-muted italic">Loading…</span>
              ) : globalUrl ? (
                <span className="font-mono text-xs theme-text-secondary break-all">{globalUrl}</span>
              ) : (
                <span className="text-xs text-amber-500 italic">Set tracking domain to generate URL</span>
              )}
            </div>

            <CopyButton
              url={globalUrl}
              disabled={!trackingDomain}
              label="Copy Global URL"
              variant="cyan"
              onCopied={showToast}
            />
          </div>

          {/* Offer-Specific Postback */}
          <div className="rounded-2xl border theme-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-500/10">
                <Link2 className="w-4 h-4 text-violet-400" />
              </div>
              <h2 className="text-sm font-bold theme-text-main">Offer-Specific Postback URL</h2>
            </div>
            <p className="text-xs theme-text-muted">
              Select an offer to generate a URL with the offer ID embedded. Useful when sending
              separate postback instructions per offer to an advertiser.
            </p>

            <div>
              <label className="block text-xs font-semibold theme-text-muted uppercase tracking-wider mb-1.5">
                Select Offer
              </label>
              <select
                value={selectedOfferId}
                onChange={(e) => setSelectedOfferId(e.target.value)}
                className="w-full rounded-xl border theme-border bg-white dark:bg-slate-900 theme-text-main text-sm px-3 py-2"
              >
                <option value="">Select an offer…</option>
                {offers.map((o) => (
                  <option key={o.id} value={String(o.id)}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedOffer && (
              <div className="flex items-center gap-5 rounded-xl bg-violet-500/5 border border-violet-500/20 px-4 py-2.5">
                <div>
                  <p className="text-[10px] font-semibold theme-text-muted uppercase tracking-wider">Offer</p>
                  <p className="text-sm font-semibold theme-text-main">{selectedOffer.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold theme-text-muted uppercase tracking-wider">Offer ID</p>
                  <p className="font-mono text-sm text-violet-400">#{selectedOffer.id}</p>
                </div>
              </div>
            )}

            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/80 border theme-border px-4 py-3 min-h-[52px] flex items-center">
              {loadingSettings ? (
                <span className="text-xs theme-text-muted italic">Loading…</span>
              ) : offerUrl ? (
                <span className="font-mono text-xs theme-text-secondary break-all">{offerUrl}</span>
              ) : (
                <span className="text-xs text-slate-500 italic">
                  {!trackingDomain ? "Set tracking domain to generate URL" : "Select an offer above"}
                </span>
              )}
            </div>

            <CopyButton
              url={offerUrl}
              disabled={!trackingDomain || !selectedOfferId}
              label="Copy Offer URL"
              variant="violet"
              onCopied={showToast}
            />
          </div>
          {/* Event-Specific Postback */}
          <div className="rounded-2xl border theme-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/10">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-sm font-bold theme-text-main">Event Postback URL</h2>
            </div>
            <p className="text-xs theme-text-muted">
              Generate a URL for a specific event token. Events control the approval workflow —
              the offer's payout applies when the conversion is created.
            </p>

            <div>
              <label className="block text-xs font-semibold theme-text-muted uppercase tracking-wider mb-1.5">
                Select Offer (to load events)
              </label>
              <select
                value={selectedOfferId}
                onChange={(e) => setSelectedOfferId(e.target.value)}
                className="w-full rounded-xl border theme-border bg-white dark:bg-slate-900 theme-text-main text-sm px-3 py-2"
              >
                <option value="">Select an offer…</option>
                {offers.map((o) => (
                  <option key={o.id} value={String(o.id)}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedOfferId && (
              <div>
                <label className="block text-xs font-semibold theme-text-muted uppercase tracking-wider mb-1.5">
                  Select Event
                </label>
                {eventsLoading ? (
                  <p className="text-xs theme-text-muted italic">Loading events…</p>
                ) : activeEvents.length === 0 ? (
                  <p className="text-xs text-amber-500">
                    No active events defined for this offer.{" "}
                    <span className="font-semibold">Go to Offer Management → Events to add one.</span>
                  </p>
                ) : (
                  <select
                    value={selectedEventToken}
                    onChange={(e) => setSelectedEventToken(e.target.value)}
                    className="w-full rounded-xl border theme-border bg-white dark:bg-slate-900 theme-text-main text-sm px-3 py-2"
                  >
                    <option value="">Select an event…</option>
                    {activeEvents.map((ev) => (
                      <option key={ev.id} value={ev.event_token}>
                        {ev.event_name} ({ev.event_token})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {selectedEventToken && (
              <div className="flex flex-wrap items-center gap-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4 py-2.5">
                <div>
                  <p className="text-[10px] font-semibold theme-text-muted uppercase tracking-wider">Event Token</p>
                  <p className="font-mono text-sm text-emerald-400">{selectedEventToken}</p>
                </div>
                {(() => {
                  const ev = activeEvents.find((e) => e.event_token === selectedEventToken);
                  return ev ? (
                    <div>
                      <p className="text-[10px] font-semibold theme-text-muted uppercase tracking-wider">Approval</p>
                      <p className="text-sm font-semibold theme-text-main">
                        {ev.approval_mode === "AUTO_APPROVE" ? "Auto" : "Manual Review"}
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <div className="rounded-xl bg-slate-50 dark:bg-slate-900/80 border theme-border px-4 py-3 min-h-[52px] flex items-center">
              {loadingSettings ? (
                <span className="text-xs theme-text-muted italic">Loading…</span>
              ) : eventUrl ? (
                <span className="font-mono text-xs theme-text-secondary break-all">{eventUrl}</span>
              ) : (
                <span className="text-xs text-slate-500 italic">
                  {!trackingDomain
                    ? "Set tracking domain to generate URL"
                    : !selectedOfferId
                    ? "Select an offer to load events"
                    : "Select an event above"}
                </span>
              )}
            </div>

            <CopyButton
              url={eventUrl}
              disabled={!trackingDomain || !selectedEventToken}
              label="Copy Event URL"
              variant="cyan"
              onCopied={showToast}
            />
          </div>
        </div>

        {/* Right: Reference panels */}
        <div className="space-y-5">

          {/* Tokens */}
          <div className="rounded-2xl border theme-border p-5 space-y-3">
            <h2 className="text-xs font-bold theme-text-muted uppercase tracking-wider">
              Supported Parameters
            </h2>
            <p className="text-xs theme-text-muted">
              Replace each token with your advertiser tracker's macro for that value.
            </p>
            <div className="space-y-2">
              {TOKENS.map((t) => (
                <div key={t.name} className="flex items-start gap-2">
                  <span className="font-mono text-xs bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-lg px-2 py-0.5 shrink-0 mt-0.5">
                    {t.name}
                  </span>
                  <span className="text-xs theme-text-muted">{t.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="rounded-2xl border theme-border p-5 space-y-3">
            <h2 className="text-xs font-bold theme-text-muted uppercase tracking-wider">
              Setup Guide
            </h2>
            <ol className="space-y-2.5 text-xs theme-text-muted list-decimal list-inside">
              <li>Copy the postback URL above.</li>
              <li>
                Paste it into the advertiser's tracker as their{" "}
                <span className="font-semibold theme-text-secondary">S2S postback URL</span>.
              </li>
              <li>
                The advertiser replaces each{" "}
                <span className="font-mono text-cyan-400">{"{token}"}</span> with the
                corresponding macro from their tracker platform.
              </li>
              <li>
                When a conversion fires, ApexTrack receives it, creates the conversion record, and
                dispatches publisher postbacks automatically.
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-2xl border border-cyan-500/30 flex items-center gap-2 z-50 pointer-events-none">
          <Check className="w-4 h-4 text-cyan-400" />
          Postback URL copied
        </div>
      )}
    </div>
  );
}
