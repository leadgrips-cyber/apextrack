import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  Loader2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as financeApi from "../../services/finance";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().substring(0, 10);
}

function daysAgoStr(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
}

function toISOStart(d: string): string {
  return new Date(d + "T00:00:00.000Z").toISOString();
}

function toISOEnd(d: string): string {
  return new Date(d + "T23:59:59.999Z").toISOString();
}

function formatCurrency(val: string | number): string {
  const n = Number(val);
  if (!Number.isFinite(n)) return "$0.00";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

function formatMargin(profit: string | number, revenue: string | number): string {
  const p = Number(profit);
  const r = Number(revenue);
  if (!r || !Number.isFinite(p) || !Number.isFinite(r)) return "—";
  return `${((p / r) * 100).toFixed(1)}%`;
}

function fmtDate(ts: string): string {
  return ts.substring(0, 10);
}

// ─── Component ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

export function FinanceRevenueView() {
  // Date filter state (input vs applied — prevents re-fetch on every keystroke)
  const [inputStart, setInputStart] = useState(daysAgoStr(30));
  const [inputEnd,   setInputEnd]   = useState(todayStr());
  const [appliedStart, setAppliedStart] = useState(daysAgoStr(30));
  const [appliedEnd,   setAppliedEnd]   = useState(todayStr());

  // Summary
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError,   setSummaryError]   = useState<string | null>(null);
  const [summary, setSummary] = useState<financeApi.RevenueSummary | null>(null);

  // Revenue By Offer
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError,   setOffersError]   = useState<string | null>(null);
  const [offers,       setOffers]        = useState<financeApi.RevenueByOffer[]>([]);
  const [offersTotal,  setOffersTotal]   = useState(0);
  const [offersPage,   setOffersPage]    = useState(1);
  const [sortBy,       setSortBy]        = useState("total_revenue");
  const [sortDir,      setSortDir]       = useState<"asc" | "desc">("desc");

  // Revenue Transactions
  const [txLoading, setTxLoading] = useState(true);
  const [txError,   setTxError]   = useState<string | null>(null);
  const [txRows,    setTxRows]    = useState<financeApi.RevenueTransaction[]>([]);
  const [txTotal,   setTxTotal]   = useState(0);
  const [txPage,    setTxPage]    = useState(1);
  const [txStatus,  setTxStatus]  = useState("");

  // ─── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    let cancelled = false;
    setSummaryLoading(true);
    setSummaryError(null);
    financeApi
      .getRevenueSummary(toISOStart(appliedStart), toISOEnd(appliedEnd))
      .then(data  => { if (!cancelled) setSummary(data); })
      .catch(err  => { if (!cancelled) setSummaryError(err.message || "Failed to load summary"); })
      .finally(() => { if (!cancelled) setSummaryLoading(false); });
    return () => { cancelled = true; };
  }, [appliedStart, appliedEnd]);

  useEffect(() => {
    let cancelled = false;
    setOffersLoading(true);
    setOffersError(null);
    financeApi
      .getRevenueByOffer({
        startDate: toISOStart(appliedStart),
        endDate:   toISOEnd(appliedEnd),
        page:      offersPage,
        pageSize:  PAGE_SIZE,
        sortBy,
        sortDir,
      })
      .then(data  => { if (!cancelled) { setOffers(data.offers); setOffersTotal(data.total); } })
      .catch(err  => { if (!cancelled) setOffersError(err.message || "Failed to load offer data"); })
      .finally(() => { if (!cancelled) setOffersLoading(false); });
    return () => { cancelled = true; };
  }, [appliedStart, appliedEnd, offersPage, sortBy, sortDir]);

  useEffect(() => {
    let cancelled = false;
    setTxLoading(true);
    setTxError(null);
    financeApi
      .getRevenueTransactions({
        startDate: toISOStart(appliedStart),
        endDate:   toISOEnd(appliedEnd),
        page:      txPage,
        pageSize:  PAGE_SIZE,
        status:    txStatus || undefined,
      })
      .then(data  => { if (!cancelled) { setTxRows(data.transactions); setTxTotal(data.total); } })
      .catch(err  => { if (!cancelled) setTxError(err.message || "Failed to load transactions"); })
      .finally(() => { if (!cancelled) setTxLoading(false); });
    return () => { cancelled = true; };
  }, [appliedStart, appliedEnd, txPage, txStatus]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function applyDates() {
    if (!inputStart || !inputEnd || inputStart > inputEnd) return;
    setOffersPage(1);
    setTxPage(1);
    setAppliedStart(inputStart);
    setAppliedEnd(inputEnd);
  }

  function setPreset(days: number) {
    const s = daysAgoStr(days);
    const e = todayStr();
    setInputStart(s); setInputEnd(e);
    setOffersPage(1); setTxPage(1);
    setAppliedStart(s); setAppliedEnd(e);
  }

  function handleOfferSort(col: string) {
    if (col === sortBy) {
      setSortDir(d => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(col);
      setSortDir("desc");
    }
    setOffersPage(1);
  }

  // ─── Derived ───────────────────────────────────────────────────────────────

  const offersTotalPages = Math.max(1, Math.ceil(offersTotal / PAGE_SIZE));
  const txTotalPages     = Math.max(1, Math.ceil(txTotal     / PAGE_SIZE));

  function sortIcon(col: string) {
    if (col !== sortBy) return <ChevronsUpDown className="w-3 h-3 inline ml-1 opacity-40" />;
    return sortDir === "desc"
      ? <ChevronDown className="w-3 h-3 inline ml-1 text-cyan-600" />
      : <ChevronUp   className="w-3 h-3 inline ml-1 text-cyan-600" />;
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* ── Page Header + Date Filter ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Finance</div>
          <h2 className="mt-1 text-2xl font-black theme-text-main">Revenue</h2>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          {/* Preset buttons */}
          <div className="flex items-center gap-2">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setPreset(d)}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border theme-border theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              >
                Last {d}d
              </button>
            ))}
          </div>
          {/* Date range inputs */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={inputStart}
              max={inputEnd}
              onChange={e => setInputStart(e.target.value)}
              className="rounded-2xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main"
            />
            <span className="text-sm theme-text-muted">→</span>
            <input
              type="date"
              value={inputEnd}
              min={inputStart}
              max={todayStr()}
              onChange={e => setInputEnd(e.target.value)}
              className="rounded-2xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main"
            />
            <button
              onClick={applyDates}
              className="rounded-full bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition"
            >
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Summary Cards ─────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* Total Revenue */}
        <div className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">Total Revenue</div>
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-2.5 text-cyan-600 dark:text-cyan-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-5">
            {summaryLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
            ) : summaryError ? (
              <span className="text-sm text-rose-600">Error loading</span>
            ) : (
              <div className="text-3xl font-black theme-text-main">{formatCurrency(summary?.total_revenue ?? 0)}</div>
            )}
            <div className="mt-1.5 text-xs theme-text-muted">
              {(summary?.total_conversions ?? 0).toLocaleString()} conversions
            </div>
          </div>
        </div>

        {/* Total Payout */}
        <div className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">Total Payout</div>
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-2.5 text-amber-500 dark:text-amber-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-5">
            {summaryLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
            ) : summaryError ? (
              <span className="text-sm text-rose-600">Error loading</span>
            ) : (
              <div className="text-3xl font-black theme-text-main">{formatCurrency(summary?.total_payout ?? 0)}</div>
            )}
            <div className="mt-1.5 text-xs theme-text-muted">
              {(summary?.total_clicks ?? 0).toLocaleString()} clicks
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">Net Profit</div>
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-2.5 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-5">
            {summaryLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
            ) : summaryError ? (
              <span className="text-sm text-rose-600">Error loading</span>
            ) : (
              <div className={`text-3xl font-black ${Number(summary?.profit ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {formatCurrency(summary?.profit ?? 0)}
              </div>
            )}
            <div className="mt-1.5 text-xs theme-text-muted">Revenue − Payout</div>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">Profit Margin</div>
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-2.5 text-cyan-600 dark:text-cyan-300">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-5">
            {summaryLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
            ) : summaryError ? (
              <span className="text-sm text-rose-600">Error loading</span>
            ) : (
              <div className="text-3xl font-black theme-text-main">
                {formatMargin(summary?.profit ?? 0, summary?.total_revenue ?? 0)}
              </div>
            )}
            <div className="mt-1.5 text-xs theme-text-muted">Profit / Revenue</div>
          </div>
        </div>

      </div>

      {/* ── Revenue By Offer ──────────────────────────────────────────────── */}
      <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Revenue By Offer</div>
            <div className="mt-1 text-sm theme-text-muted">{offersTotal} offers</div>
          </div>
          {offersLoading && <Loader2 className="w-4 h-4 animate-spin text-cyan-600 shrink-0" />}
        </div>

        {offersError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {offersError}
          </div>
        ) : (
          <>
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b theme-border">
                    <th className="text-left pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted w-8">#</th>
                    <th
                      className="text-left pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted cursor-pointer select-none hover:text-cyan-600 transition-colors"
                      onClick={() => handleOfferSort("offer_name")}
                    >
                      Offer {sortIcon("offer_name")}
                    </th>
                    <th className="text-left pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">
                      Category
                    </th>
                    <th className="text-right pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">
                      Clicks
                    </th>
                    <th
                      className="text-right pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted cursor-pointer select-none hover:text-cyan-600 transition-colors"
                      onClick={() => handleOfferSort("total_conversions")}
                    >
                      Conv. {sortIcon("total_conversions")}
                    </th>
                    <th
                      className="text-right pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted cursor-pointer select-none hover:text-cyan-600 transition-colors"
                      onClick={() => handleOfferSort("total_revenue")}
                    >
                      Revenue {sortIcon("total_revenue")}
                    </th>
                    <th
                      className="text-right pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted cursor-pointer select-none hover:text-cyan-600 transition-colors"
                      onClick={() => handleOfferSort("total_payout")}
                    >
                      Payout {sortIcon("total_payout")}
                    </th>
                    <th
                      className="text-right pb-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted cursor-pointer select-none hover:text-cyan-600 transition-colors"
                      onClick={() => handleOfferSort("profit")}
                    >
                      Profit {sortIcon("profit")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {offers.length === 0 && !offersLoading ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-sm theme-text-muted">
                        No offer data available for this period.
                      </td>
                    </tr>
                  ) : (
                    offers.map((offer, i) => {
                      const rowNum   = (offersPage - 1) * PAGE_SIZE + i + 1;
                      const profitN  = Number(offer.profit);
                      return (
                        <tr
                          key={offer.offer_id}
                          className="border-b theme-border last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                        >
                          <td className="py-3 pr-3 text-xs font-black text-cyan-600">{rowNum}</td>
                          <td className="py-3 pr-3 max-w-[220px]">
                            <div className="font-semibold theme-text-main truncate">{offer.offer_name}</div>
                            <div className="text-xs theme-text-muted font-mono truncate">{offer.slug}</div>
                          </td>
                          <td className="py-3 pr-3">
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 theme-text-muted whitespace-nowrap">
                              {offer.category || "—"}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-right text-sm theme-text-muted tabular-nums">
                            {Number(offer.total_clicks).toLocaleString()}
                          </td>
                          <td className="py-3 pr-3 text-right text-sm theme-text-muted tabular-nums">
                            {Number(offer.total_conversions).toLocaleString()}
                          </td>
                          <td className="py-3 pr-3 text-right font-semibold theme-text-main tabular-nums">
                            {formatCurrency(offer.total_revenue)}
                          </td>
                          <td className="py-3 pr-3 text-right text-sm text-amber-600 tabular-nums">
                            {formatCurrency(offer.total_payout)}
                          </td>
                          <td className={`py-3 text-right font-bold tabular-nums ${profitN >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {formatCurrency(offer.profit)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {offersTotal > PAGE_SIZE && (
              <div className="mt-4 pt-4 border-t theme-border flex items-center justify-between gap-4">
                <span className="text-xs theme-text-muted">
                  {offersTotal} offers · Page {offersPage} of {offersTotalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOffersPage(p => Math.max(1, p - 1))}
                    disabled={offersPage <= 1 || offersLoading}
                    className="rounded-full border theme-border p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setOffersPage(p => Math.min(offersTotalPages, p + 1))}
                    disabled={offersPage >= offersTotalPages || offersLoading}
                    className="rounded-full border theme-border p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── Revenue Transactions ──────────────────────────────────────────── */}
      <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Revenue Transactions</div>
            <div className="mt-1 text-sm theme-text-muted">{txTotal.toLocaleString()} records</div>
          </div>
          <div className="flex items-center gap-3">
            {txLoading && <Loader2 className="w-4 h-4 animate-spin text-cyan-600 shrink-0" />}
            <select
              value={txStatus}
              onChange={e => { setTxStatus(e.target.value); setTxPage(1); }}
              className="rounded-2xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {txError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {txError}
          </div>
        ) : (
          <>
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b theme-border">
                    <th className="text-left pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted whitespace-nowrap">
                      Date
                    </th>
                    <th className="text-left pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">
                      Offer
                    </th>
                    <th className="text-left pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">
                      Publisher
                    </th>
                    <th className="text-center pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">
                      Status
                    </th>
                    <th className="text-right pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">
                      Revenue
                    </th>
                    <th className="text-right pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">
                      Payout
                    </th>
                    <th className="text-right pb-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">
                      Profit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {txRows.length === 0 && !txLoading ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-sm theme-text-muted">
                        No transactions found for this period.
                      </td>
                    </tr>
                  ) : (
                    txRows.map(tx => {
                      const profitN = Number(tx.profit);
                      const status  = tx.conversion_status.toLowerCase();
                      const badgeCls =
                        status === "approved" ? "bg-emerald-100 text-emerald-700" :
                        status === "pending"  ? "bg-amber-100 text-amber-700"     :
                                                "bg-rose-100 text-rose-700";
                      return (
                        <tr
                          key={tx.id}
                          className="border-b theme-border last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                        >
                          <td className="py-3 pr-3 text-xs theme-text-muted font-mono whitespace-nowrap">
                            {fmtDate(tx.created_at)}
                          </td>
                          <td className="py-3 pr-3 max-w-[200px]">
                            <div className="font-semibold theme-text-main truncate">{tx.offer_name}</div>
                          </td>
                          <td className="py-3 pr-3 max-w-[180px]">
                            <div className="text-xs theme-text-muted truncate">{tx.publisher_email}</div>
                          </td>
                          <td className="py-3 pr-3 text-center">
                            <span className={`text-[10px] uppercase tracking-[0.22em] font-bold px-2 py-1 rounded-full whitespace-nowrap ${badgeCls}`}>
                              {tx.conversion_status}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-right font-semibold theme-text-main tabular-nums">
                            {formatCurrency(tx.revenue_amount)}
                          </td>
                          <td className="py-3 pr-3 text-right text-sm text-amber-600 tabular-nums">
                            {formatCurrency(tx.payout_amount)}
                          </td>
                          <td className={`py-3 text-right font-bold tabular-nums ${profitN >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {formatCurrency(tx.profit)}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {txTotal > PAGE_SIZE && (
              <div className="mt-4 pt-4 border-t theme-border flex items-center justify-between gap-4">
                <span className="text-xs theme-text-muted">
                  {txTotal.toLocaleString()} records · Page {txPage} of {txTotalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTxPage(p => Math.max(1, p - 1))}
                    disabled={txPage <= 1 || txLoading}
                    className="rounded-full border theme-border p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setTxPage(p => Math.min(txTotalPages, p + 1))}
                    disabled={txPage >= txTotalPages || txLoading}
                    className="rounded-full border theme-border p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

    </div>
  );
}
