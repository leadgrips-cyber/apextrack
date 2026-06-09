import { managerPublishers } from "./managerDemoData";

export function ManagerPerformanceView() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Performance Overview</div>
        <div className="mt-2 text-2xl font-black theme-text-main">Top publishers and offers</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="theme-bg-card border theme-border rounded-3xl p-4">
          <div className="text-sm font-semibold theme-text-main">Top Publishers</div>
          <div className="mt-4 space-y-2">
            {managerPublishers.map(p => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-xl theme-bg-well border theme-border">
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-sm theme-text-muted">{p.revenue}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="theme-bg-card border theme-border rounded-3xl p-4">
          <div className="text-sm font-semibold theme-text-main">Top Offers</div>
          <div className="mt-4 space-y-2">
            <div className="p-2 rounded-xl theme-bg-well border theme-border">KetoDiet Shred — $42 CPA</div>
            <div className="p-2 rounded-xl theme-bg-well border theme-border">Crypto Wealth Academy — $62 CPA</div>
            <div className="p-2 rounded-xl theme-bg-well border theme-border">Luxury Essentials Trial — $9 CPS</div>
          </div>
        </div>

        <div className="theme-bg-card border theme-border rounded-3xl p-4">
          <div className="text-sm font-semibold theme-text-main">Revenue Summary</div>
          <div className="mt-4 text-2xl font-black theme-text-main">$243k</div>
          <div className="mt-2 text-sm theme-text-muted">This month across assigned publishers</div>
        </div>
      </div>
    </div>
  );
}
