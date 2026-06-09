import { Activity, Globe, DollarSign, Users, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { adminMetrics, adminRecentActivity } from "./adminDemoData";

function renderBadge(label: string) {
  return (
    <span className="text-[10px] uppercase tracking-[0.22em] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-900 theme-text-secondary">
      {label}
    </span>
  );
}

export function AdminDashboardView() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-4">
        {adminMetrics.map((metric) => (
          <div key={metric.id} className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">
                {metric.label}
              </div>
              <div className="text-cyan-600 dark:text-cyan-400 font-black text-xl">{metric.delta}</div>
            </div>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <div className="text-3xl font-black theme-text-main">{metric.value}</div>
                <div className="mt-2 text-sm theme-text-muted">{metric.description}</div>
              </div>
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-3 text-cyan-600 dark:text-cyan-300">
                {metric.id === "revenue" ? <DollarSign className="w-5 h-5" /> : metric.id === "publishers" ? <Users className="w-5 h-5" /> : metric.id === "offers" ? <Globe className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">
                Revenue Overview
              </div>
              <div className="mt-2 text-2xl font-black theme-text-main">$1.92M</div>
              <div className="mt-1 text-sm theme-text-muted">Quarter-to-date performance across advertisers and publishers.</div>
            </div>
            <TrendingUp className="w-7 h-7 text-cyan-600" />
          </div>

          <div className="mt-8 space-y-4">
            {[
              { label: "Direct offer revenue", value: 74 },
              { label: "Partner payouts", value: 52 },
              { label: "New publisher intake", value: 28 },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm theme-text-muted">
                  <span>{item.label}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <div className="h-2 rounded-full bg-cyan-600" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">
                Recent Activity
              </div>
              <div className="mt-2 text-sm theme-text-main">24 actions in the last 24 hours</div>
            </div>
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-2">
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {adminRecentActivity.map((activity) => (
              <div key={activity.id} className="theme-bg-well border theme-border rounded-3xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold theme-text-main">{activity.title}</div>
                    <div className="mt-1 text-sm theme-text-muted">{activity.description}</div>
                  </div>
                  {renderBadge(activity.badge)}
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-xs font-medium text-slate-500">
                  <span>{activity.detail}</span>
                  <span>{activity.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
