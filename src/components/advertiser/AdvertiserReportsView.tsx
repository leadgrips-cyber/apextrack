import { advertiserFilters } from "./advertiserDemoData";
import { Activity, BarChart3, DollarSign, CheckCircle2 } from "lucide-react";

export function AdvertiserReportsView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Reports</div>
          <div className="mt-2 text-2xl font-black theme-text-main">Performance by clicks, conversions, and revenue</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {advertiserFilters.map((filter) => (
            <button key={filter.id} className="rounded-2xl border theme-border px-4 py-2 text-xs font-semibold theme-text-secondary hover:bg-slate-100 dark:hover:bg-slate-900 transition">
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { label: "Clicks", value: "162,400", icon: Activity },
          { label: "Conversions", value: "18,620", icon: CheckCircle2 },
          { label: "Revenue", value: "$1.92M", icon: DollarSign },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">{metric.label}</div>
                <div className="rounded-2xl bg-cyan-50 dark:bg-cyan-950 p-3 text-cyan-600 dark:text-cyan-200">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-6 text-3xl font-black theme-text-main">{metric.value}</div>
              <div className="mt-2 text-sm theme-text-muted">Latest aggregated summary for the selected period.</div>
            </div>
          );
        })}
      </div>

      <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Filters</div>
            <div className="mt-2 text-sm theme-text-main">Apply date and campaign filters in future integrations.</div>
          </div>
          <button className="rounded-2xl border theme-border px-4 py-2 text-xs font-semibold theme-text-secondary hover:bg-slate-100 dark:hover:bg-slate-900 transition">
            Manage Filters
          </button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { title: "Traffic source", value: "Organic, PPC, Affiliates" },
            { title: "Conversion type", value: "Lead, Sale, Download" },
            { title: "Region", value: "US, EU, APAC" },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl bg-slate-50 dark:bg-slate-900 border theme-border p-4">
              <div className="text-[10px] uppercase tracking-[0.22em] font-bold theme-text-muted">{item.title}</div>
              <div className="mt-2 text-sm theme-text-main">{item.value}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
