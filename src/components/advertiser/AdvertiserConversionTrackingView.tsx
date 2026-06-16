import { advertiserConversionStats } from "./advertiserDemoData";
import { Copy, Link2, ShieldCheck } from "lucide-react";
import { useBranding } from "../../contexts/BrandingContext";

export function AdvertiserConversionTrackingView() {
  const branding = useBranding();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Conversion Tracking</div>
          <div className="mt-2 text-2xl font-black theme-text-main">Postback URLs, tokens, and performance metrics</div>
        </div>
        <button className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-500 transition inline-flex items-center gap-2 justify-center">
          <ShieldCheck className="w-4 h-4" />
          Copy Postback URL
        </button>
      </div>

      <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Postback URL</div>
            <div className="mt-2 text-sm theme-text-main">Use this URL to send conversion events back to {branding.networkName}.</div>
          </div>
          <button className="rounded-full border theme-border px-4 py-2 text-xs font-semibold theme-text-secondary hover:theme-text-main transition inline-flex items-center gap-2">
            <Copy className="w-4 h-4" />
            Copy URL
          </button>
        </div>
        <div className="mt-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border theme-border p-4 text-sm font-mono text-slate-700 dark:text-slate-300">
          {branding.trackingDomain}/postback?campaign_id=CAMPAIGN_ID&amp;click_id=CLICK_ID&amp;status=conversion&amp;payout=AMOUNT
        </div>
      </section>

      <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Tracking Token Examples</div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { label: "Click token", value: "{CLICK_ID}" },
            { label: "Campaign token", value: "{CAMPAIGN_ID}" },
            { label: "Revenue token", value: "{PAYOUT_AMOUNT}" },
            { label: "Status token", value: "{STATUS}" },
          ].map((token) => (
            <div key={token.label} className="rounded-3xl bg-slate-50 dark:bg-slate-900 border theme-border p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] theme-text-muted">{token.label}</div>
              <div className="mt-2 font-mono text-sm theme-text-main">{token.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Conversion statistics</div>
            <div className="mt-2 text-sm theme-text-main">Daily conversion metrics for the current campaign window.</div>
          </div>
          <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 px-3 py-2 text-xs font-semibold theme-text-secondary">
            5 days shown
          </div>
        </div>
        <div className="mt-6 overflow-x-auto rounded-3xl border theme-border bg-white dark:bg-slate-950">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Date</th>
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Clicks</th>
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Conversions</th>
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {advertiserConversionStats.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{row.date}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{row.clicks.toLocaleString()}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{row.conversions.toLocaleString()}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{row.revenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
