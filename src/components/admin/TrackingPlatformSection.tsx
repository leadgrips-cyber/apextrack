import { useState } from "react";
import { Copy, Check, Cpu, Link } from "lucide-react";

export interface IntegrationConfig {
  platform: string;
  click_id_token: string;
  transaction_id_token: string;
  payout_token: string;
  revenue_token: string;
  status_token: string;
}

const PLATFORMS = [
  "Custom", "Affise", "Offer18", "Trackier", "Everflow",
  "HasOffers", "TrackDesk", "RedTrack", "Binom",
] as const;
type Platform = typeof PLATFORMS[number];

const PLATFORM_PRESETS: Record<Platform, Omit<IntegrationConfig, "platform">> = {
  Custom:    { click_id_token: "{click_id}",     transaction_id_token: "{transaction_id}", payout_token: "{payout}",       revenue_token: "{revenue}",      status_token: "{status}" },
  Affise:    { click_id_token: "{ref_id}",        transaction_id_token: "{transactionid}",  payout_token: "{sum}",          revenue_token: "{sum}",          status_token: "{status}" },
  Offer18:   { click_id_token: "{click_id}",     transaction_id_token: "{transaction_id}", payout_token: "{payout}",       revenue_token: "{revenue}",      status_token: "{status}" },
  Trackier:  { click_id_token: "{clickid}",       transaction_id_token: "{transaction_id}", payout_token: "{payout}",       revenue_token: "{revenue}",      status_token: "{status}" },
  Everflow:  { click_id_token: "{sub1}",          transaction_id_token: "{transaction_id}", payout_token: "{payout}",       revenue_token: "{revenue}",      status_token: "{status}" },
  HasOffers: { click_id_token: "{aff_click_id}", transaction_id_token: "{transaction_id}", payout_token: "{amount}",       revenue_token: "{amount}",       status_token: "{status}" },
  TrackDesk: { click_id_token: "{cid}",           transaction_id_token: "{externalId}",     payout_token: "{amount.value}", revenue_token: "{amount.value}", status_token: "approved" },
  RedTrack:  { click_id_token: "{clickid}",       transaction_id_token: "{transaction_id}", payout_token: "{payout}",       revenue_token: "{revenue}",      status_token: "{status}" },
  Binom:     { click_id_token: "{clickid}",       transaction_id_token: "{transaction_id}", payout_token: "{payout}",       revenue_token: "{revenue}",      status_token: "{status}" },
};

// Parameter name to use when appending click_id to the advertiser tracking URL
const URL_PASS_PARAMS: Record<Platform, string> = {
  Custom:    "click_id",
  Affise:    "sub1",
  Offer18:   "click_id",
  Trackier:  "clickid",
  Everflow:  "sub1",
  HasOffers: "aff_click_id",
  TrackDesk: "cid",
  RedTrack:  "clickid",
  Binom:     "clickid",
};

export const DEFAULT_INTEGRATION_CONFIG: IntegrationConfig = {
  platform: "Custom",
  ...PLATFORM_PRESETS.Custom,
};

export function configToIntegrationSettings(config: IntegrationConfig): Record<string, unknown> {
  return {
    platform: config.platform,
    click_id_token: config.click_id_token,
    transaction_id_token: config.transaction_id_token,
    payout_token: config.payout_token,
    revenue_token: config.revenue_token,
    status_token: config.status_token,
  };
}

export function integrationSettingsToConfig(
  settings: Record<string, unknown> | null | undefined
): IntegrationConfig {
  if (!settings) return { ...DEFAULT_INTEGRATION_CONFIG };
  return {
    platform: (settings.platform as string) || "Custom",
    click_id_token: (settings.click_id_token as string) || "{click_id}",
    transaction_id_token: (settings.transaction_id_token as string) || "{transaction_id}",
    payout_token: (settings.payout_token as string) || "{payout}",
    revenue_token: (settings.revenue_token as string) || "{revenue}",
    status_token: (settings.status_token as string) || "{status}",
  };
}

export function buildPostbackUrl(config: IntegrationConfig): string {
  const base = `${window.location.origin}/api/postback`;
  return (
    base +
    `?click_id=${config.click_id_token}` +
    `&transaction_id=${config.transaction_id_token}` +
    `&status=${config.status_token}` +
    `&payout=${config.payout_token}` +
    `&revenue=${config.revenue_token}`
  );
}

const inputCls =
  "w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400 font-mono";
const labelCls = "block text-xs font-semibold theme-text-muted mb-1";

interface Props {
  config: IntegrationConfig;
  landingPageUrl: string;
  onChange: (config: IntegrationConfig) => void;
}

export function TrackingPlatformSection({ config, landingPageUrl, onChange }: Props) {
  const [copiedPostback, setCopiedPostback] = useState(false);
  const [copiedHelper, setCopiedHelper] = useState(false);

  const postbackUrl = buildPostbackUrl(config);
  const urlParam = URL_PASS_PARAMS[config.platform as Platform] ?? "click_id";
  const trackingHelperUrl = landingPageUrl
    ? landingPageUrl.includes("?")
      ? `${landingPageUrl}&${urlParam}={click_id}`
      : `${landingPageUrl}?${urlParam}={click_id}`
    : `https://advertiser.com/track?${urlParam}={click_id}`;

  function handlePlatformChange(platform: string) {
    const preset = PLATFORM_PRESETS[platform as Platform] ?? PLATFORM_PRESETS.Custom;
    onChange({ platform, ...preset });
  }

  function handleTokenChange(
    field: keyof Omit<IntegrationConfig, "platform">,
    value: string
  ) {
    onChange({ ...config, [field]: value });
  }

  function copy(text: string, type: "postback" | "helper") {
    navigator.clipboard.writeText(text).catch(() => {});
    if (type === "postback") {
      setCopiedPostback(true);
      setTimeout(() => setCopiedPostback(false), 1800);
    } else {
      setCopiedHelper(true);
      setTimeout(() => setCopiedHelper(false), 1800);
    }
  }

  return (
    <div className="theme-bg-card border theme-border rounded-3xl p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Cpu className="w-4 h-4 text-cyan-500" />
        <h3 className="text-xs font-bold uppercase tracking-widest theme-text-muted">Tracking Platform</h3>
      </div>

      {/* Platform selector */}
      <div>
        <label className="block text-xs font-semibold theme-text-muted mb-1">Platform</label>
        <select
          value={config.platform}
          onChange={e => handlePlatformChange(e.target.value)}
          className="w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <p className="mt-1 text-[11px] theme-text-muted">
          Selecting a platform pre-fills token defaults below. All fields remain editable.
        </p>
      </div>

      {/* Token mapping */}
      <div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 pb-2 border-b theme-border mb-3">
          Token Mapping
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Click ID Token</label>
            <input
              value={config.click_id_token}
              onChange={e => handleTokenChange("click_id_token", e.target.value)}
              className={inputCls}
              placeholder="{click_id}"
            />
          </div>
          <div>
            <label className={labelCls}>Transaction ID Token</label>
            <input
              value={config.transaction_id_token}
              onChange={e => handleTokenChange("transaction_id_token", e.target.value)}
              className={inputCls}
              placeholder="{transaction_id}"
            />
          </div>
          <div>
            <label className={labelCls}>Status Token</label>
            <input
              value={config.status_token}
              onChange={e => handleTokenChange("status_token", e.target.value)}
              className={inputCls}
              placeholder="{status}"
            />
          </div>
          <div>
            <label className={labelCls}>Payout Token</label>
            <input
              value={config.payout_token}
              onChange={e => handleTokenChange("payout_token", e.target.value)}
              className={inputCls}
              placeholder="{payout}"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Revenue Token</label>
            <input
              value={config.revenue_token}
              onChange={e => handleTokenChange("revenue_token", e.target.value)}
              className={inputCls}
              placeholder="{revenue}"
            />
          </div>
        </div>
      </div>

      {/* Advertiser URL helper */}
      <div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 pb-2 border-b theme-border mb-3 flex items-center gap-1.5">
          <Link className="w-3 h-3" />
          Integration Helper
        </div>
        <p className="text-[11px] theme-text-muted mb-2">
          Append this parameter to your advertiser tracking URL so {config.platform === "Custom" ? "your platform" : config.platform} can return the click ID in the postback.
        </p>
        <div className="flex items-start gap-2">
          <div className="flex-1 rounded-xl border theme-border bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-[11px] font-mono text-slate-600 dark:text-slate-300 break-all leading-relaxed min-h-[40px]">
            {trackingHelperUrl}
          </div>
          <button
            type="button"
            onClick={() => copy(trackingHelperUrl, "helper")}
            className="mt-0.5 flex-shrink-0 p-2 rounded-xl border theme-border hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title="Copy URL"
          >
            {copiedHelper
              ? <Check className="w-3.5 h-3.5 text-emerald-500" />
              : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Postback generator */}
      <div>
        <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 pb-2 border-b theme-border mb-3">
          Generated Postback URL
        </div>
        <p className="text-[11px] theme-text-muted mb-2">
          Configure this URL in {config.platform === "Custom" ? "your advertiser platform" : config.platform} as the conversion postback. Updates live as tokens are edited.
        </p>
        <div className="flex items-start gap-2">
          <div className="flex-1 rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/30 px-3 py-2.5 text-[11px] font-mono text-cyan-700 dark:text-cyan-300 break-all leading-relaxed min-h-[40px]">
            {postbackUrl}
          </div>
          <button
            type="button"
            onClick={() => copy(postbackUrl, "postback")}
            className="mt-0.5 flex-shrink-0 p-2 rounded-xl border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 dark:hover:bg-cyan-900 transition"
            title="Copy postback URL"
          >
            {copiedPostback
              ? <Check className="w-3.5 h-3.5 text-emerald-500" />
              : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
        </div>
      </div>
    </div>
  );
}
