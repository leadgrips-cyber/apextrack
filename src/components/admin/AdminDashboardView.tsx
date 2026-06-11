import { useEffect, useState } from "react";
import { Activity, Globe, DollarSign, Users, Clock, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import * as analyticsApi from "../../services/analytics";

function formatCurrency(val: string | number): string {
  const n = Number(val);
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export function AdminDashboardView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<analyticsApi.DashboardSummary | null>(null);
  const [recentConversions, setRecentConversions] = useState<analyticsApi.RecentConversion[]>([]);
  const [topPublishers, setTopPublishers] = useState<analyticsApi.TopPublisher[]>([]);
  const [topOffers, setTopOffers] = useState<analyticsApi.TopOffer[]>([]);
  const [recentPostbacks, setRecentPostbacks] = useState<analyticsApi.RecentPostback[]>([]);
  const [chartData, setChartData] = useState<analyticsApi.DailyMetric[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const endDate = new Date().toISOString();
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const [summaryResult, conversionsResult, publishersResult, offersResult, postbacksResult, chartResult] =
          await Promise.allSettled([
            analyticsApi.getDashboardSummary(),
            analyticsApi.getRecentConversions(8),
            analyticsApi.getTopPublishers(5),
            analyticsApi.getTopOffers(5),
            analyticsApi.getRecentPostbacks(5),
            analyticsApi.getChartData(startDate, endDate),
          ]);

        if (summaryResult.status === "rejected") {
          setError((summaryResult.reason as any)?.message || "Failed to load dashboard data");
          return;
        }

        setSummary(summaryResult.value);
        setRecentConversions(conversionsResult.status === "fulfilled" ? conversionsResult.value : []);
        setTopPublishers(publishersResult.status === "fulfilled" ? publishersResult.value : []);
        setTopOffers(offersResult.status === "fulfilled" ? offersResult.value : []);
        setRecentPostbacks(postbacksResult.status === "fulfilled" ? postbacksResult.value : []);
        setChartData(chartResult.status === "fulfilled" ? chartResult.value : []);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
        <span className="ml-3 text-sm theme-text-muted">Loading dashboard...</span>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 flex items-center gap-3 text-rose-700 text-sm">
        <AlertCircle className="w-5 h-5 shrink-0" />
        <span>{error || "Dashboard data unavailable."}</span>
      </div>
    );
  }

  const revenueNum = Number(summary.total_revenue);
  const payoutNum = Number(summary.total_payout);
  const profitNum = Number(summary.profit);
  const payoutPct = revenueNum > 0 ? Math.min(Math.round((payoutNum / revenueNum) * 100), 100) : 0;
  const profitPct = revenueNum > 0 ? Math.min(Math.round((profitNum / revenueNum) * 100), 100) : 0;

  const period30Clicks = chartData.reduce((acc, d) => acc + Number(d.clicks), 0);
  const period30Conversions = chartData.reduce((acc, d) => acc + Number(d.conversions), 0);

  const kpiCards = [
    {
      label: "Total Publishers",
      value: summary.total_publishers.toLocaleString(),
      delta: `${summary.active_publishers} active`,
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "Active Offers",
      value: summary.active_offers.toLocaleString(),
      delta: `${summary.total_offers} total`,
      icon: <Globe className="w-5 h-5" />,
    },
    {
      label: "Total Conversions",
      value: summary.total_conversions.toLocaleString(),
      delta: period30Conversions > 0 ? `${period30Conversions} last 30d` : "all-time",
      icon: <Activity className="w-5 h-5" />,
    },
    {
      label: "Network Revenue",
      value: formatCurrency(summary.total_revenue),
      delta: `Profit ${formatCurrency(summary.profit)}`,
      icon: <DollarSign className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-4 lg:grid-cols-4">
        {kpiCards.map((metric) => (
          <div key={metric.label} className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">{metric.label}</div>
              <div className="text-cyan-600 dark:text-cyan-400 font-semibold text-xs">{metric.delta}</div>
            </div>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div className="text-3xl font-black theme-text-main">{metric.value}</div>
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-3 text-cyan-600 dark:text-cyan-300">
                {metric.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Overview + Recent Conversions */}
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Revenue Overview</div>
              <div className="mt-2 text-2xl font-black theme-text-main">{formatCurrency(summary.total_revenue)}</div>
              <div className="mt-1 text-sm theme-text-muted">
                Payout: {formatCurrency(summary.total_payout)} · Clicks: {summary.total_clicks.toLocaleString()}
              </div>
            </div>
            <TrendingUp className="w-7 h-7 text-cyan-600 shrink-0" />
          </div>

          <div className="mt-8 space-y-4">
            {[
              { label: `Total revenue (${formatCurrency(summary.total_revenue)})`, value: 100 },
              { label: `Publisher payouts (${formatCurrency(summary.total_payout)})`, value: payoutPct },
              { label: `Network profit (${formatCurrency(summary.profit)})`, value: profitPct },
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

          {chartData.length > 0 && (
            <div className="mt-6 pt-4 border-t theme-border flex items-center gap-6 text-xs theme-text-muted">
              <span>Last 30 days:</span>
              <span className="font-semibold theme-text-main">{period30Clicks.toLocaleString()} clicks</span>
              <span className="font-semibold theme-text-main">{period30Conversions.toLocaleString()} conversions</span>
            </div>
          )}
        </section>

        <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Recent Conversions</div>
              <div className="mt-2 text-sm theme-text-main">{summary.total_conversions.toLocaleString()} total conversions</div>
            </div>
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-2 shrink-0">
              <Clock className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="mt-6 space-y-3 max-h-[380px] overflow-y-auto">
            {recentConversions.length > 0 ? (
              recentConversions.map((conv) => (
                <div key={conv.id} className="theme-bg-well border theme-border rounded-3xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold theme-text-main truncate">{conv.offer_name}</div>
                      <div className="mt-1 text-xs theme-text-muted truncate">{conv.publisher_email}</div>
                    </div>
                    <span
                      className={`text-[10px] uppercase tracking-[0.22em] font-bold px-2 py-1 rounded-full shrink-0 ${
                        conv.conversion_status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {conv.conversion_status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs font-medium text-slate-500">
                    <span>${conv.payout_amount}</span>
                    <span>{conv.created_at.substring(0, 10)}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No conversions recorded yet.</p>
            )}
          </div>
        </section>
      </div>

      {/* Top Publishers + Top Offers */}
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-4">Top Publishers</div>
          {topPublishers.length > 0 ? (
            <div className="space-y-3">
              {topPublishers.map((pub, i) => (
                <div
                  key={pub.id}
                  className="flex items-center justify-between gap-3 theme-bg-well border theme-border rounded-2xl px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-black text-cyan-600 w-5 shrink-0">#{i + 1}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold theme-text-main truncate">{pub.full_name}</div>
                      <div className="text-xs theme-text-muted font-mono">{pub.affiliate_code}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold theme-text-main">{formatCurrency(pub.total_revenue)}</div>
                    <div className="text-xs theme-text-muted">{Number(pub.total_conversions).toLocaleString()} conv.</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No publisher data available.</p>
          )}
        </section>

        <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-4">Top Offers</div>
          {topOffers.length > 0 ? (
            <div className="space-y-3">
              {topOffers.map((offer, i) => (
                <div
                  key={offer.id}
                  className="flex items-center justify-between gap-3 theme-bg-well border theme-border rounded-2xl px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-black text-cyan-600 w-5 shrink-0">#{i + 1}</span>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold theme-text-main truncate">{offer.name}</div>
                      <div className="text-xs theme-text-muted">{offer.category}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold theme-text-main">{formatCurrency(offer.total_revenue)}</div>
                    <div className="text-xs theme-text-muted">{Number(offer.total_conversions).toLocaleString()} conv.</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No offer data available.</p>
          )}
        </section>
      </div>

      {/* Recent Postbacks */}
      {recentPostbacks.length > 0 && (
        <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-4">Recent Postbacks</div>
          <div className="space-y-3">
            {recentPostbacks.map((pb) => (
              <div
                key={pb.id}
                className="flex items-center justify-between gap-4 theme-bg-well border theme-border rounded-2xl px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold theme-text-main">{pb.offer_name}</div>
                  <div className="text-xs theme-text-muted font-mono truncate max-w-[480px]">{pb.destination_url}</div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] uppercase tracking-[0.22em] font-bold px-2 py-1 rounded-full ${
                      pb.status === "success" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {pb.status}
                  </span>
                  <div className="text-xs theme-text-muted mt-1">{pb.created_at.substring(0, 10)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
