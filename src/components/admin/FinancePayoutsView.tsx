import { useEffect, useRef, useState } from "react";
import {
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
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

function fmtDate(ts: string): string {
  return ts.substring(0, 10);
}

const TX_TYPE_BADGE: Record<string, string> = {
  HOLD:       "bg-amber-100  text-amber-700",
  CREDIT:     "bg-emerald-100 text-emerald-700",
  ADJUSTMENT: "bg-slate-100  text-slate-600",
  WITHDRAWAL: "bg-cyan-100   text-cyan-700",
};

function txBadgeCls(type: string): string {
  return TX_TYPE_BADGE[type.toUpperCase()] ?? "bg-slate-100 text-slate-600";
}

// ─── Modal state type ─────────────────────────────────────────────────────────

interface ModalState {
  open: boolean;
  publisherId: string;
  publisherName: string;
  publisherEmail: string;
  maxAmount: number;
  amount: string;
  description: string;
  submitting: boolean;
  error: string | null;
}

const MODAL_CLOSED: ModalState = {
  open: false,
  publisherId: "",
  publisherName: "",
  publisherEmail: "",
  maxAmount: 0,
  amount: "",
  description: "",
  submitting: false,
  error: null,
};

const PAGE_SIZE = 15;

// ─── Component ───────────────────────────────────────────────────────────────

export function FinancePayoutsView() {

  // ── KPI summary ────────────────────────────────────────────────────────────
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError,   setSummaryError]   = useState<string | null>(null);
  const [summary, setSummary] = useState<financeApi.PayoutsSummary | null>(null);

  // ── Publishers ─────────────────────────────────────────────────────────────
  const [pubLoading,    setPubLoading]    = useState(true);
  const [pubError,      setPubError]      = useState<string | null>(null);
  const [publishers,    setPublishers]    = useState<financeApi.PublisherWithBalance[]>([]);
  const [pubTotal,      setPubTotal]      = useState(0);
  const [pubPage,       setPubPage]       = useState(1);
  const [pubSearch,     setPubSearch]     = useState("");
  const [pendingSearch, setPendingSearch] = useState("");

  // ── Wallet Transactions ────────────────────────────────────────────────────
  const [txLoading,     setTxLoading]     = useState(true);
  const [txError,       setTxError]       = useState<string | null>(null);
  const [txRows,        setTxRows]        = useState<financeApi.WalletTransaction[]>([]);
  const [txTotal,       setTxTotal]       = useState(0);
  const [txPage,        setTxPage]        = useState(1);
  const [txType,        setTxType]        = useState("");
  const [txInputStart,  setTxInputStart]  = useState(daysAgoStr(30));
  const [txInputEnd,    setTxInputEnd]    = useState(todayStr());
  const [txStart,       setTxStart]       = useState(daysAgoStr(30));
  const [txEnd,         setTxEnd]         = useState(todayStr());

  // ── Modal ──────────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalState>(MODAL_CLOSED);
  const amountRef = useRef<HTMLInputElement>(null);

  // ─── Data loaders (stable references via inner functions) ──────────────────

  function loadSummary(): (() => void) {
    let cancelled = false;
    setSummaryLoading(true);
    setSummaryError(null);
    financeApi
      .getPayoutsSummary()
      .then(data  => { if (!cancelled) setSummary(data); })
      .catch(err  => { if (!cancelled) setSummaryError((err as Error).message || "Failed to load summary"); })
      .finally(() => { if (!cancelled) setSummaryLoading(false); });
    return () => { cancelled = true; };
  }

  function loadPublishers(): (() => void) {
    let cancelled = false;
    setPubLoading(true);
    setPubError(null);
    financeApi
      .getPublishersWithBalances({ page: pubPage, pageSize: PAGE_SIZE, search: pubSearch || undefined })
      .then(data  => { if (!cancelled) { setPublishers(data.publishers); setPubTotal(data.total); } })
      .catch(err  => { if (!cancelled) setPubError((err as Error).message || "Failed to load publishers"); })
      .finally(() => { if (!cancelled) setPubLoading(false); });
    return () => { cancelled = true; };
  }

  function loadTransactions(): (() => void) {
    let cancelled = false;
    setTxLoading(true);
    setTxError(null);
    financeApi
      .getWalletTransactions({
        page:            txPage,
        pageSize:        PAGE_SIZE,
        transactionType: txType || undefined,
        startDate:       toISOStart(txStart),
        endDate:         toISOEnd(txEnd),
      })
      .then(data  => { if (!cancelled) { setTxRows(data.transactions); setTxTotal(data.total); } })
      .catch(err  => { if (!cancelled) setTxError((err as Error).message || "Failed to load transactions"); })
      .finally(() => { if (!cancelled) setTxLoading(false); });
    return () => { cancelled = true; };
  }

  // ─── Effects ───────────────────────────────────────────────────────────────

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => loadSummary(), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => loadPublishers(), [pubPage, pubSearch]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => loadTransactions(), [txPage, txType, txStart, txEnd]);

  useEffect(() => {
    if (modal.open) setTimeout(() => amountRef.current?.focus(), 50);
  }, [modal.open]);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function applySearch() {
    setPubPage(1);
    setPubSearch(pendingSearch.trim());
  }

  function applyTxDates() {
    if (!txInputStart || !txInputEnd || txInputStart > txInputEnd) return;
    setTxPage(1);
    setTxStart(txInputStart);
    setTxEnd(txInputEnd);
  }

  function setTxPreset(days: number) {
    const s = daysAgoStr(days);
    const e = todayStr();
    setTxInputStart(s); setTxInputEnd(e);
    setTxPage(1);
    setTxStart(s); setTxEnd(e);
  }

  function openModal(pub: financeApi.PublisherWithBalance) {
    setModal({
      open: true,
      publisherId:    pub.publisher_id,
      publisherName:  pub.full_name,
      publisherEmail: pub.email,
      maxAmount:      Number(pub.available_balance),
      amount:         "",
      description:    "",
      submitting:     false,
      error:          null,
    });
  }

  function closeModal() {
    if (modal.submitting) return;
    setModal(MODAL_CLOSED);
  }

  async function submitPayout() {
    const amount = parseFloat(modal.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setModal(m => ({ ...m, error: "Please enter a valid positive amount." }));
      return;
    }
    if (amount > modal.maxAmount) {
      setModal(m => ({ ...m, error: `Amount cannot exceed available balance ($${modal.maxAmount.toFixed(2)}).` }));
      return;
    }

    setModal(m => ({ ...m, submitting: true, error: null }));
    try {
      await financeApi.processManualPayout({
        publisherId: modal.publisherId,
        amount,
        description: modal.description.trim() || undefined,
      });
      setModal(MODAL_CLOSED);
      loadSummary();
      loadPublishers();
      loadTransactions();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payout failed";
      setModal(m => ({ ...m, submitting: false, error: msg }));
    }
  }

  // ─── Derived ───────────────────────────────────────────────────────────────

  const pubTotalPages = Math.max(1, Math.ceil(pubTotal / PAGE_SIZE));
  const txTotalPages  = Math.max(1, Math.ceil(txTotal  / PAGE_SIZE));

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div>
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Finance</div>
        <h2 className="mt-1 text-2xl font-black theme-text-main">Payouts</h2>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">

        <div className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">Total Available</div>
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-2.5 text-emerald-600 dark:text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-5">
            {summaryLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
            ) : summaryError ? (
              <span className="text-sm text-rose-600">Error loading</span>
            ) : (
              <div className="text-3xl font-black text-emerald-600">
                {formatCurrency(summary?.total_available_balance ?? 0)}
              </div>
            )}
            <div className="mt-1.5 text-xs theme-text-muted">Ready for payout</div>
          </div>
        </div>

        <div className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">Total Pending</div>
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-2.5 text-amber-500 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-5">
            {summaryLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
            ) : summaryError ? (
              <span className="text-sm text-rose-600">Error loading</span>
            ) : (
              <div className="text-3xl font-black text-amber-500">
                {formatCurrency(summary?.total_pending_balance ?? 0)}
              </div>
            )}
            <div className="mt-1.5 text-xs theme-text-muted">Awaiting conversion approval</div>
          </div>
        </div>

        <div className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">Total Withdrawn</div>
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-2.5 text-cyan-600 dark:text-cyan-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-5">
            {summaryLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
            ) : summaryError ? (
              <span className="text-sm text-rose-600">Error loading</span>
            ) : (
              <div className="text-3xl font-black theme-text-main">
                {formatCurrency(summary?.total_withdrawn_balance ?? 0)}
              </div>
            )}
            <div className="mt-1.5 text-xs theme-text-muted">All-time paid out</div>
          </div>
        </div>

      </div>

      {/* ── Publisher Balances ────────────────────────────────────────────── */}
      <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Publisher Balances</div>
            <div className="mt-1 text-sm theme-text-muted">{pubTotal} publishers</div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {pubLoading && <Loader2 className="w-4 h-4 animate-spin text-cyan-600 shrink-0" />}
            <input
              type="text"
              placeholder="Search by name or email"
              value={pendingSearch}
              onChange={e => setPendingSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applySearch()}
              className="rounded-2xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main min-w-[200px]"
            />
            <button
              onClick={applySearch}
              className="rounded-full bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition"
            >
              Search
            </button>
          </div>
        </div>

        {pubError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {pubError}
          </div>
        ) : (
          <>
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b theme-border">
                    <th className="text-left pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Publisher</th>
                    <th className="text-right pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Available</th>
                    <th className="text-right pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Pending</th>
                    <th className="text-right pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Withdrawn</th>
                    <th className="text-right pb-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {publishers.length === 0 && !pubLoading ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-sm theme-text-muted">
                        No publishers found.
                      </td>
                    </tr>
                  ) : (
                    publishers.map(pub => {
                      const available = Number(pub.available_balance);
                      return (
                        <tr
                          key={pub.publisher_id}
                          className="border-b theme-border last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                        >
                          <td className="py-3 pr-3 max-w-[240px]">
                            <div className="font-semibold theme-text-main truncate">{pub.full_name}</div>
                            <div className="text-xs theme-text-muted truncate">{pub.email}</div>
                          </td>
                          <td className="py-3 pr-3 text-right font-bold text-emerald-600 tabular-nums">
                            {formatCurrency(pub.available_balance)}
                          </td>
                          <td className="py-3 pr-3 text-right text-sm text-amber-500 tabular-nums">
                            {formatCurrency(pub.pending_balance)}
                          </td>
                          <td className="py-3 pr-3 text-right text-sm theme-text-muted tabular-nums">
                            {formatCurrency(pub.withdrawn_balance)}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => openModal(pub)}
                              disabled={available <= 0}
                              className="rounded-full bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition whitespace-nowrap"
                            >
                              Process Payout
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {pubTotal > PAGE_SIZE && (
              <div className="mt-4 pt-4 border-t theme-border flex items-center justify-between gap-4">
                <span className="text-xs theme-text-muted">
                  {pubTotal} publishers · Page {pubPage} of {pubTotalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPubPage(p => Math.max(1, p - 1))}
                    disabled={pubPage <= 1 || pubLoading}
                    className="rounded-full border theme-border p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPubPage(p => Math.min(pubTotalPages, p + 1))}
                    disabled={pubPage >= pubTotalPages || pubLoading}
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

      {/* ── Transaction History ────────────────────────────────────────────── */}
      <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Transaction History</div>
            <div className="mt-1 text-sm theme-text-muted">{txTotal.toLocaleString()} records</div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex items-center gap-2">
              {[7, 30, 90].map(d => (
                <button
                  key={d}
                  onClick={() => setTxPreset(d)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border theme-border theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                >
                  Last {d}d
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {txLoading && <Loader2 className="w-4 h-4 animate-spin text-cyan-600 shrink-0" />}
              <select
                value={txType}
                onChange={e => { setTxType(e.target.value); setTxPage(1); }}
                className="rounded-2xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main"
              >
                <option value="">All Types</option>
                <option value="HOLD">Hold</option>
                <option value="CREDIT">Credit</option>
                <option value="ADJUSTMENT">Adjustment</option>
                <option value="WITHDRAWAL">Withdrawal</option>
              </select>
              <input
                type="date"
                value={txInputStart}
                max={txInputEnd}
                onChange={e => setTxInputStart(e.target.value)}
                className="rounded-2xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main"
              />
              <span className="text-sm theme-text-muted">→</span>
              <input
                type="date"
                value={txInputEnd}
                min={txInputStart}
                max={todayStr()}
                onChange={e => setTxInputEnd(e.target.value)}
                className="rounded-2xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main"
              />
              <button
                onClick={applyTxDates}
                className="rounded-full bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition"
              >
                Apply
              </button>
            </div>
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
                    <th className="text-left pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted whitespace-nowrap">Date</th>
                    <th className="text-left pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Publisher</th>
                    <th className="text-center pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Type</th>
                    <th className="text-right pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Amount</th>
                    <th className="text-right pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted whitespace-nowrap">Balance After</th>
                    <th className="text-left pb-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {txRows.length === 0 && !txLoading ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-sm theme-text-muted">
                        No transactions found for this period.
                      </td>
                    </tr>
                  ) : (
                    txRows.map(tx => (
                      <tr
                        key={tx.id}
                        className="border-b theme-border last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <td className="py-3 pr-3 text-xs theme-text-muted font-mono whitespace-nowrap">
                          {fmtDate(tx.created_at)}
                        </td>
                        <td className="py-3 pr-3 max-w-[200px]">
                          <div className="font-semibold theme-text-main truncate">{tx.publisher_name}</div>
                          <div className="text-xs theme-text-muted truncate">{tx.publisher_email}</div>
                        </td>
                        <td className="py-3 pr-3 text-center">
                          <span className={`text-[10px] uppercase tracking-[0.22em] font-bold px-2 py-1 rounded-full whitespace-nowrap ${txBadgeCls(tx.transaction_type)}`}>
                            {tx.transaction_type}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-right font-semibold theme-text-main tabular-nums">
                          {formatCurrency(tx.amount)}
                        </td>
                        <td className="py-3 pr-3 text-right text-sm theme-text-muted tabular-nums">
                          {formatCurrency(tx.balance_after)}
                        </td>
                        <td className="py-3 max-w-[240px]">
                          <span className="text-xs theme-text-muted truncate block">
                            {tx.description || "—"}
                          </span>
                        </td>
                      </tr>
                    ))
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

      {/* ── Process Payout Modal ───────────────────────────────────────────── */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-md theme-bg-card border theme-border rounded-3xl p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Process Payout</div>
                <div className="mt-1 font-bold theme-text-main">{modal.publisherName}</div>
                <div className="text-xs theme-text-muted">{modal.publisherEmail}</div>
              </div>
              <button
                onClick={closeModal}
                disabled={modal.submitting}
                className="rounded-full p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-5 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Available Balance</span>
              <div className="mt-1 text-2xl font-black text-emerald-600">
                {formatCurrency(modal.maxAmount)}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">
                Amount (USD)
              </label>
              <input
                ref={amountRef}
                type="number"
                min="0.01"
                step="0.01"
                max={modal.maxAmount}
                value={modal.amount}
                onChange={e => setModal(m => ({ ...m, amount: e.target.value, error: null }))}
                onKeyDown={e => { if (e.key === "Enter" && !modal.submitting) void submitPayout(); }}
                placeholder="0.00"
                disabled={modal.submitting}
                className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-lg font-bold theme-text-main disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">
                Description <span className="normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text"
                maxLength={200}
                value={modal.description}
                onChange={e => setModal(m => ({ ...m, description: e.target.value }))}
                disabled={modal.submitting}
                placeholder="e.g. June 2026 payout"
                className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm theme-text-main disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {modal.error && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {modal.error}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => void submitPayout()}
                disabled={modal.submitting || !modal.amount}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {modal.submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                ) : (
                  <><Send className="w-4 h-4" /> Confirm Payout</>
                )}
              </button>
              <button
                onClick={closeModal}
                disabled={modal.submitting}
                className="rounded-full border theme-border px-4 py-2.5 text-sm font-semibold theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
