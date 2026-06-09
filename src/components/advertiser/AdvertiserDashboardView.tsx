import { advertiserMetrics, advertiserCampaigns } from "./advertiserDemoData";
import { TrendingUp, CreditCard, Activity, BarChart3 } from "lucide-react";

const badgeClasses: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Paused: "bg-amber-100 text-amber-700",
  Pending: "bg-slate-100 text-slate-700",
};

export function AdvertiserDashboardView() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-4">
        {advertiserMetrics.map((metric) => (
          <div key={metric.id} className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">{metric.label}</div>
              <div className="text-cyan-600 dark:text-cyan-400 font-black text-xl">{metric.delta}</div>
            </div>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <div className="text-3xl font-black theme-text-main">{metric.value}</div>
                <div className="mt-2 text-sm theme-text-muted">{metric.description}</div>
              </div>
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-3 text-cyan-600 dark:text-cyan-300">
                {metric.id === "spend" ? <CreditCard className="w-5 h-5" /> : metric.id === "conversions" ? <TrendingUp className="w-5 h-5" /> : metric.id === "campaigns" ? <Activity className="w-5 h-5" /> : <BarChart3 className="w-5 h-5" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Revenue Chart</div>
              <div className="mt-2 text-2xl font-black theme-text-main">Campaign spend and conversion overview</div>
            </div>
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-2">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
            </div>
          </div>
          <div className="mt-8 h-72 rounded-[2rem] bg-gradient-to-r from-cyan-500/10 via-slate-100 to-slate-100 dark:from-cyan-500/15 dark:via-slate-900 dark:to-slate-950 border border-dashed theme-border flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm font-semibold">
            Revenue chart placeholder - ready for future chart integration
          </div>
        </section>

        <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Live campaign snapshot</div>
          <div className="mt-6 space-y-4">
            {advertiserCampaigns.slice(0, 3).map((campaign) => (
              <div key={campaign.id} className="rounded-3xl bg-slate-50 dark:bg-slate-900 border theme-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold theme-text-main">{campaign.name}</div>
                    <div className="text-sm theme-text-muted">{campaign.category}</div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses[campaign.status]}`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <div className="rounded-2xl bg-white dark:bg-slate-950 p-3 border theme-border">
                    <div className="text-[10px] uppercase tracking-[0.22em] font-bold theme-text-muted">Spend</div>
                    <div className="mt-2 font-semibold theme-text-main">{campaign.spend}</div>
                  </div>
                  <div className="rounded-2xl bg-white dark:bg-slate-950 p-3 border theme-border">
                    <div className="text-[10px] uppercase tracking-[0.22em] font-bold theme-text-muted">Conversions</div>
                    <div className="mt-2 font-semibold theme-text-main">{campaign.conversions}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
