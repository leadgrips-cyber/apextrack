import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Send,
  Plus,
  Pencil,
  Trash2,
  Eye,
} from "lucide-react";
import * as financeApi from "../../services/finance";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().substring(0, 10);
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

function fmtDateTime(ts: string): string {
  return ts.substring(0, 16).replace("T", " ");
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID:    "bg-emerald-100 text-emerald-700",
  HOLD:    "bg-rose-100 text-rose-700",
};

function statusBadgeCls(status: string): string {
  return STATUS_BADGE[status.toUpperCase()] ?? "bg-slate-100 text-slate-600";
}

const PAYOUT_METHODS = [
  "International Wire Transfer (USD)",
  "USDT ERC-20",
  "USDT TRC-20",
  "Bitcoin (BTC)",
  "PayPal",
  "ACH Transfer",
  "Other",
];

// ─── Modal state ──────────────────────────────────────────────────────────────

type ModalMode = "CLOSED" | "GENERATE" | "VIEW" | "EDIT" | "PAY" | "DELETE";
interface ModalState { mode: ModalMode; invoice?: financeApi.Invoice; }
const MODAL_CLOSED: ModalState = { mode: "CLOSED" };

const PAGE_SIZE = 15;

// ─── Component ────────────────────────────────────────────────────────────────

export function FinanceInvoicesView() {

  // ── Summary ─────────────────────────────────────────────────────────────────
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError,   setSummaryError]   = useState<string | null>(null);
  const [summary, setSummary] = useState<financeApi.InvoicesSummary | null>(null);

  // ── Invoice list ─────────────────────────────────────────────────────────────
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [invoices, setInvoices] = useState<financeApi.Invoice[]>([]);
  const [total,    setTotal]    = useState(0);
  const [page,     setPage]     = useState(1);

  // ── Filters ──────────────────────────────────────────────────────────────────
  const [activeStatus,  setActiveStatus]  = useState("ALL");
  const [searchInput,   setSearchInput]   = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [startInput,    setStartInput]    = useState("");
  const [endInput,      setEndInput]      = useState("");
  const [startApplied,  setStartApplied]  = useState("");
  const [endApplied,    setEndApplied]    = useState("");

  // ── Modal ────────────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalState>(MODAL_CLOSED);

  // ── Generate form ─────────────────────────────────────────────────────────────
  const [publishers,   setPublishers]   = useState<financeApi.PublisherWithBalance[]>([]);
  const [pubLoading,   setPubLoading]   = useState(false);
  const [genPublisher, setGenPublisher] = useState("");
  const [genStart,     setGenStart]     = useState("");
  const [genEnd,       setGenEnd]       = useState("");
  const [genGross,     setGenGross]     = useState("");
  const [genFee,       setGenFee]       = useState("0");
  const [genMethod,    setGenMethod]    = useState(PAYOUT_METHODS[0]);
  const [genNotes,     setGenNotes]     = useState("");
  const [genLoading,   setGenLoading]   = useState(false);
  const [genError,     setGenError]     = useState<string | null>(null);

  // ── Edit form ─────────────────────────────────────────────────────────────────
  const [editStart,   setEditStart]   = useState("");
  const [editEnd,     setEditEnd]     = useState("");
  const [editGross,   setEditGross]   = useState("");
  const [editFee,     setEditFee]     = useState("0");
  const [editMethod,  setEditMethod]  = useState(PAYOUT_METHODS[0]);
  const [editNotes,   setEditNotes]   = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError,   setEditError]   = useState<string | null>(null);

  // ── Pay modal ─────────────────────────────────────────────────────────────────
  const [payDesc,    setPayDesc]    = useState("");
  const [payLoading, setPayLoading] = useState(false);
  const [payError,   setPayError]   = useState<string | null>(null);

  // ── Delete confirmation ───────────────────────────────────────────────────────
  const [delLoading, setDelLoading] = useState(false);
  const [delError,   setDelError]   = useState<string | null>(null);

  const grossRef     = useRef<HTMLInputElement>(null);
  const editGrossRef = useRef<HTMLInputElement>(null);

  // ─── Data loaders ─────────────────────────────────────────────────────────────

  function loadSummary(): (() => void) {
    let cancelled = false;
    setSummaryLoading(true);
    setSummaryError(null);
    financeApi
      .getInvoicesSummary()
      .then(data  => { if (!cancelled) setSummary(data); })
      .catch(err  => { if (!cancelled) setSummaryError((err as Error).message || "Failed to load summary"); })
      .finally(() => { if (!cancelled) setSummaryLoading(false); });
    return () => { cancelled = true; };
  }

  function loadInvoices(): (() => void) {
    let cancelled = false;
    setLoading(true);
    setError(null);
    financeApi
      .getInvoices({
        page,
        pageSize:  PAGE_SIZE,
        status:    activeStatus === "ALL" ? undefined : activeStatus,
        search:    searchApplied || undefined,
        startDate: startApplied  || undefined,
        endDate:   endApplied    || undefined,
      })
      .then(data  => { if (!cancelled) { setInvoices(data.invoices); setTotal(data.total); } })
      .catch(err  => { if (!cancelled) setError((err as Error).message || "Failed to load invoices"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }

  function loadPublishers() {
    setPubLoading(true);
    financeApi
      .getPublishersWithBalances({ page: 1, pageSize: 100 })
      .then(data  => setPublishers(data.publishers))
      .catch(()   => setPublishers([]))
      .finally(() => setPubLoading(false));
  }

  // ─── Effects ──────────────────────────────────────────────────────────────────

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => loadSummary(), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => loadInvoices(), [page, activeStatus, searchApplied, startApplied, endApplied]);

  useEffect(() => {
    if (modal.mode === "GENERATE") {
      loadPublishers();
      setTimeout(() => grossRef.current?.focus(), 50);
    }
    if (modal.mode === "EDIT") {
      setTimeout(() => editGrossRef.current?.focus(), 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.mode]);

  // ─── Filter handlers ──────────────────────────────────────────────────────────

  function applyFilters() {
    setPage(1);
    setSearchApplied(searchInput.trim());
    setStartApplied(startInput);
    setEndApplied(endInput);
  }

  function clearFilters() {
    setSearchInput(""); setSearchApplied("");
    setStartInput("");  setStartApplied("");
    setEndInput("");    setEndApplied("");
    setPage(1);
  }

  function switchStatus(s: string) {
    setPage(1);
    setActiveStatus(s);
  }

  // ─── Generate modal handlers ──────────────────────────────────────────────────

  function openGenerate() {
    setGenPublisher(""); setGenStart(""); setGenEnd("");
    setGenGross(""); setGenFee("0");
    setGenMethod(PAYOUT_METHODS[0]); setGenNotes("");
    setGenError(null);
    setModal({ mode: "GENERATE" });
  }

  async function submitGenerate() {
    const gross = parseFloat(genGross);
    const fee   = parseFloat(genFee) || 0;
    if (!genPublisher) { setGenError("Select a publisher."); return; }
    if (!genStart || !genEnd) { setGenError("Billing period is required."); return; }
    if (genStart > genEnd) { setGenError("Period start must be before period end."); return; }
    if (!Number.isFinite(gross) || gross <= 0) { setGenError("Gross amount must be a positive number."); return; }
    if (fee < 0 || fee >= gross) { setGenError("Fee must be between 0 and the gross amount."); return; }

    setGenLoading(true);
    setGenError(null);
    try {
      await financeApi.createInvoice({
        publisherId:  genPublisher,
        periodStart:  genStart,
        periodEnd:    genEnd,
        grossAmount:  gross,
        feeAmount:    fee,
        payoutMethod: genMethod || undefined,
        notes:        genNotes.trim() || undefined,
      });
      setModal(MODAL_CLOSED);
      loadSummary();
      loadInvoices();
    } catch (err) {
      setGenError(err instanceof Error ? err.message : "Failed to create invoice");
    } finally {
      setGenLoading(false);
    }
  }

  // ─── View modal handler ───────────────────────────────────────────────────────

  function openView(invoice: financeApi.Invoice) {
    setModal({ mode: "VIEW", invoice });
  }

  // ─── Edit modal handlers ──────────────────────────────────────────────────────

  function openEdit(invoice: financeApi.Invoice) {
    setEditStart(invoice.period_start);
    setEditEnd(invoice.period_end);
    setEditGross(invoice.gross_amount);
    setEditFee(invoice.fee_amount);
    setEditMethod(invoice.payout_method || PAYOUT_METHODS[0]);
    setEditNotes(invoice.notes || "");
    setEditError(null);
    setModal({ mode: "EDIT", invoice });
  }

  async function submitEdit() {
    if (!modal.invoice) return;
    const gross = parseFloat(editGross);
    const fee   = parseFloat(editFee) || 0;
    if (!editStart || !editEnd) { setEditError("Billing period is required."); return; }
    if (editStart > editEnd) { setEditError("Period start must be before period end."); return; }
    if (!Number.isFinite(gross) || gross <= 0) { setEditError("Gross amount must be a positive number."); return; }
    if (fee < 0 || fee >= gross) { setEditError("Fee must be between 0 and the gross amount."); return; }

    setEditLoading(true);
    setEditError(null);
    try {
      await financeApi.updateInvoice(modal.invoice.id, {
        periodStart:  editStart,
        periodEnd:    editEnd,
        grossAmount:  gross,
        feeAmount:    fee,
        payoutMethod: editMethod || null,
        notes:        editNotes.trim() || null,
      });
      setModal(MODAL_CLOSED);
      loadSummary();
      loadInvoices();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Failed to update invoice");
    } finally {
      setEditLoading(false);
    }
  }

  // ─── Pay modal handlers ───────────────────────────────────────────────────────

  function openPay(invoice: financeApi.Invoice) {
    setPayDesc(""); setPayError(null);
    setModal({ mode: "PAY", invoice });
  }

  async function submitPay() {
    if (!modal.invoice) return;
    setPayLoading(true);
    setPayError(null);
    try {
      await financeApi.markInvoicePaid(modal.invoice.id, payDesc.trim() || undefined);
      setModal(MODAL_CLOSED);
      loadSummary();
      loadInvoices();
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setPayLoading(false);
    }
  }

  // ─── Hold / Unhold inline ─────────────────────────────────────────────────────

  async function toggleHold(invoice: financeApi.Invoice) {
    try {
      if (invoice.status === "HOLD") {
        await financeApi.unholdInvoice(invoice.id);
      } else {
        await financeApi.holdInvoice(invoice.id);
      }
      loadSummary();
      loadInvoices();
    } catch (err) {
      console.error("Hold toggle failed:", err);
    }
  }

  // ─── Delete handlers ──────────────────────────────────────────────────────────

  function openDeleteConfirm(invoice: financeApi.Invoice) {
    setDelError(null);
    setModal({ mode: "DELETE", invoice });
  }

  async function confirmDelete() {
    if (!modal.invoice) return;
    setDelLoading(true);
    setDelError(null);
    try {
      await financeApi.deleteInvoice(modal.invoice.id);
      setModal(MODAL_CLOSED);
      loadSummary();
      loadInvoices();
    } catch (err) {
      setDelError(err instanceof Error ? err.message : "Failed to delete invoice");
    } finally {
      setDelLoading(false);
    }
  }

  // ─── Derived ──────────────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const genNet     = Math.max(0, (parseFloat(genGross) || 0) - (parseFloat(genFee) || 0));
  const editNet    = Math.max(0, (parseFloat(editGross) || 0) - (parseFloat(editFee) || 0));
  const hasFilters = !!(searchApplied || startApplied || endApplied);

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* Page header */}
      <div>
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Finance</div>
        <h2 className="mt-1 text-2xl font-black theme-text-main">Invoices</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">Total Invoices</div>
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-2.5 text-slate-500">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-5">
            {summaryLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
            ) : summaryError ? (
              <span className="text-sm text-rose-600">Error loading</span>
            ) : (
              <div className="text-3xl font-black theme-text-main">
                {Number(summary?.total_invoices ?? 0).toLocaleString()}
              </div>
            )}
            <div className="mt-1.5 text-xs theme-text-muted">
              {summaryLoading ? "—" : `${formatCurrency(summary?.total_gross ?? 0)} total value`}
            </div>
          </div>
        </div>

        <div className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">Pending</div>
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-2.5 text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-5">
            {summaryLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
            ) : (
              <div className="text-3xl font-black text-amber-500">
                {Number(summary?.pending_count ?? 0).toLocaleString()}
              </div>
            )}
            <div className="mt-1.5 text-xs theme-text-muted">
              {summaryLoading ? "—" : `${formatCurrency(summary?.pending_gross ?? 0)} pending`}
            </div>
          </div>
        </div>

        <div className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">Paid</div>
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-2.5 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-5">
            {summaryLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
            ) : (
              <div className="text-3xl font-black text-emerald-600">
                {Number(summary?.paid_count ?? 0).toLocaleString()}
              </div>
            )}
            <div className="mt-1.5 text-xs theme-text-muted">
              {summaryLoading ? "—" : `${formatCurrency(summary?.paid_gross ?? 0)} paid out`}
            </div>
          </div>
        </div>

        <div className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">On Hold</div>
            <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-2.5 text-rose-500">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-5">
            {summaryLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
            ) : (
              <div className="text-3xl font-black text-rose-500">
                {Number(summary?.hold_count ?? 0).toLocaleString()}
              </div>
            )}
            <div className="mt-1.5 text-xs theme-text-muted">
              {summaryLoading ? "—" : `${formatCurrency(summary?.hold_gross ?? 0)} on hold`}
            </div>
          </div>
        </div>

      </div>

      {/* Invoice table */}
      <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Invoice List</div>
            <div className="mt-1 text-sm theme-text-muted">{total.toLocaleString()} invoices</div>
          </div>
          <button
            onClick={openGenerate}
            className="flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Generate Invoice
          </button>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 mb-4 flex-wrap">
          {["ALL", "PENDING", "PAID", "HOLD"].map(s => (
            <button
              key={s}
              onClick={() => switchStatus(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] transition ${
                activeStatus === s
                  ? "bg-cyan-600 text-white"
                  : "border theme-border theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-cyan-600 shrink-0" />}
          <input
            type="text"
            placeholder="Search invoice #, publisher, email"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && applyFilters()}
            className="rounded-2xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main min-w-[220px]"
          />
          <input
            type="date"
            value={startInput}
            max={endInput || todayStr()}
            onChange={e => setStartInput(e.target.value)}
            className="rounded-2xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main"
          />
          <span className="text-sm theme-text-muted">→</span>
          <input
            type="date"
            value={endInput}
            min={startInput}
            max={todayStr()}
            onChange={e => setEndInput(e.target.value)}
            className="rounded-2xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main"
          />
          <button
            onClick={applyFilters}
            className="rounded-full bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition"
          >
            Apply
          </button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="rounded-full border theme-border px-3 py-2 text-xs theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition"
            >
              Clear
            </button>
          )}
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        ) : (
          <>
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b theme-border">
                    <th className="text-left pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted whitespace-nowrap">Invoice #</th>
                    <th className="text-left pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Publisher</th>
                    <th className="text-left pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted whitespace-nowrap">Period</th>
                    <th className="text-right pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Gross</th>
                    <th className="text-right pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Fee</th>
                    <th className="text-right pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Net</th>
                    <th className="text-center pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Status</th>
                    <th className="text-left pb-3 pr-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted whitespace-nowrap">Created</th>
                    <th className="text-right pb-3 text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-sm theme-text-muted">
                        No invoices found.
                      </td>
                    </tr>
                  ) : (
                    invoices.map(inv => (
                      <tr
                        key={inv.id}
                        className="border-b theme-border last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <td className="py-3 pr-3">
                          <span className="font-mono text-xs font-semibold theme-text-main whitespace-nowrap">{inv.invoice_number}</span>
                        </td>
                        <td className="py-3 pr-3 max-w-[180px]">
                          <div className="font-semibold theme-text-main truncate">{inv.publisher_name}</div>
                          <div className="text-xs theme-text-muted truncate">{inv.publisher_email}</div>
                        </td>
                        <td className="py-3 pr-3 text-xs theme-text-muted whitespace-nowrap">
                          <div>{inv.period_start}</div>
                          <div>→ {inv.period_end}</div>
                        </td>
                        <td className="py-3 pr-3 text-right font-semibold theme-text-main tabular-nums">
                          {formatCurrency(inv.gross_amount)}
                        </td>
                        <td className="py-3 pr-3 text-right text-xs text-rose-500 tabular-nums">
                          {Number(inv.fee_amount) > 0 ? `− ${formatCurrency(inv.fee_amount)}` : "—"}
                        </td>
                        <td className="py-3 pr-3 text-right font-bold text-emerald-600 tabular-nums">
                          {formatCurrency(inv.net_amount)}
                        </td>
                        <td className="py-3 pr-3 text-center">
                          <span className={`text-[10px] uppercase tracking-[0.22em] font-bold px-2 py-1 rounded-full whitespace-nowrap ${statusBadgeCls(inv.status)}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-xs theme-text-muted font-mono whitespace-nowrap">
                          {fmtDate(inv.created_at)}
                        </td>
                        <td className="py-3 text-right">
                          {inv.status !== "PAID" ? (
                            <div className="flex flex-col items-end gap-1.5">
                              {/* Primary actions */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => openPay(inv)}
                                  className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition whitespace-nowrap"
                                >
                                  Mark Paid
                                </button>
                                <button
                                  onClick={() => void toggleHold(inv)}
                                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                                    inv.status === "HOLD"
                                      ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                      : "border theme-border theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900"
                                  }`}
                                >
                                  {inv.status === "HOLD" ? "Unhold" : "Hold"}
                                </button>
                              </div>
                              {/* Secondary actions */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => openView(inv)}
                                  title="View"
                                  className="rounded-full border theme-border p-1.5 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => openEdit(inv)}
                                  title="Edit"
                                  className="rounded-full border theme-border p-1.5 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => openDeleteConfirm(inv)}
                                  title="Delete"
                                  className="rounded-full border border-rose-200 p-1.5 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="text-xs text-emerald-600 font-semibold whitespace-nowrap">
                                {inv.paid_at ? fmtDate(inv.paid_at) : "Paid"}
                              </span>
                              <button
                                onClick={() => openView(inv)}
                                title="View"
                                className="rounded-full border theme-border p-1.5 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {total > PAGE_SIZE && (
              <div className="mt-4 pt-4 border-t theme-border flex items-center justify-between gap-4">
                <span className="text-xs theme-text-muted">
                  {total.toLocaleString()} invoices · Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1 || loading}
                    className="rounded-full border theme-border p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || loading}
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

      {/* ── View Invoice Modal ─────────────────────────────────────────────────── */}
      {modal.mode === "VIEW" && modal.invoice && (() => {
        const inv = modal.invoice;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(MODAL_CLOSED)} />
            <div className="relative w-full max-w-lg theme-bg-card border theme-border rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">

              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Invoice Details</div>
                  <div className="mt-1 font-mono text-xl font-black theme-text-main">{inv.invoice_number}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-[0.22em] font-bold px-2.5 py-1.5 rounded-full whitespace-nowrap ${statusBadgeCls(inv.status)}`}>
                    {inv.status}
                  </span>
                  <button
                    onClick={() => setModal(MODAL_CLOSED)}
                    className="rounded-full p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Publisher */}
              <div className="mb-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border theme-border px-4 py-3">
                <div className="text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-1">Publisher</div>
                <div className="font-semibold theme-text-main">{inv.publisher_name}</div>
                <div className="text-xs theme-text-muted">{inv.publisher_email}</div>
              </div>

              {/* Period */}
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-1">Period Start</div>
                  <div className="text-sm font-semibold theme-text-main">{inv.period_start}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-1">Period End</div>
                  <div className="text-sm font-semibold theme-text-main">{inv.period_end}</div>
                </div>
              </div>

              {/* Amounts */}
              <div className="mb-4 rounded-2xl border theme-border overflow-hidden">
                <div className="grid grid-cols-3 divide-x theme-divide">
                  <div className="p-3 text-center">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-1">Gross</div>
                    <div className="text-base font-bold theme-text-main tabular-nums">{formatCurrency(inv.gross_amount)}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-1">Fee</div>
                    <div className="text-base font-bold text-rose-500 tabular-nums">
                      {Number(inv.fee_amount) > 0 ? `− ${formatCurrency(inv.fee_amount)}` : "—"}
                    </div>
                  </div>
                  <div className="p-3 text-center bg-emerald-50 dark:bg-emerald-900/20">
                    <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400 mb-1">Net</div>
                    <div className="text-base font-black text-emerald-600 tabular-nums">{formatCurrency(inv.net_amount)}</div>
                  </div>
                </div>
              </div>

              {/* Payout method */}
              {inv.payout_method && (
                <div className="mb-4">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-1">Payout Method</div>
                  <div className="text-sm theme-text-main">{inv.payout_method}</div>
                </div>
              )}

              {/* Notes */}
              {inv.notes && (
                <div className="mb-4">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-1">Notes</div>
                  <div className="text-sm theme-text-main whitespace-pre-wrap">{inv.notes}</div>
                </div>
              )}

              {/* Timestamps */}
              <div className="mb-5 grid grid-cols-2 gap-3 text-xs theme-text-muted">
                <div>
                  <span className="font-bold">Generated:</span>{" "}
                  {fmtDateTime(inv.generated_at)}
                </div>
                {inv.paid_at && (
                  <div>
                    <span className="font-bold text-emerald-600">Paid:</span>{" "}
                    <span className="text-emerald-600">{fmtDateTime(inv.paid_at)}</span>
                  </div>
                )}
                {inv.wallet_tx_id && (
                  <div className="col-span-2">
                    <span className="font-bold">Wallet TX:</span>{" "}
                    <span className="font-mono">{inv.wallet_tx_id}</span>
                  </div>
                )}
              </div>

              {/* Footer actions */}
              <div className="flex items-center gap-3">
                {inv.status !== "PAID" && (
                  <button
                    onClick={() => { setModal(MODAL_CLOSED); setTimeout(() => openEdit(inv), 50); }}
                    className="flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 transition"
                  >
                    <Pencil className="w-4 h-4" /> Edit Invoice
                  </button>
                )}
                <button
                  onClick={() => setModal(MODAL_CLOSED)}
                  className="rounded-full border theme-border px-4 py-2.5 text-sm font-semibold theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Generate Invoice Modal ─────────────────────────────────────────────── */}
      {modal.mode === "GENERATE" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { if (!genLoading) setModal(MODAL_CLOSED); }}
          />
          <div className="relative w-full max-w-lg theme-bg-card border theme-border rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">New Invoice</div>
                <div className="mt-1 font-bold theme-text-main">Generate Payout Invoice</div>
              </div>
              <button
                onClick={() => { if (!genLoading) setModal(MODAL_CLOSED); }}
                disabled={genLoading}
                className="rounded-full p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">Publisher</label>
              {pubLoading ? (
                <div className="flex items-center gap-2 text-sm theme-text-muted py-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading publishers…
                </div>
              ) : publishers.length === 0 ? (
                <p className="text-sm theme-text-muted py-2">No publishers with wallets found.</p>
              ) : (
                <select
                  value={genPublisher}
                  onChange={e => setGenPublisher(e.target.value)}
                  disabled={genLoading}
                  className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm theme-text-main disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">— Select publisher —</option>
                  {publishers.map(p => (
                    <option key={p.publisher_id} value={p.publisher_id}>
                      {p.full_name} · {p.email} · Avail: {formatCurrency(p.available_balance)}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">Period Start</label>
                <input type="date" value={genStart} max={genEnd || todayStr()} onChange={e => setGenStart(e.target.value)} disabled={genLoading}
                  className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm theme-text-main disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">Period End</label>
                <input type="date" value={genEnd} min={genStart} max={todayStr()} onChange={e => setGenEnd(e.target.value)} disabled={genLoading}
                  className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm theme-text-main disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">Gross Amount (USD)</label>
                <input ref={grossRef} type="number" min="0.01" step="0.01" value={genGross} onChange={e => setGenGross(e.target.value)} disabled={genLoading} placeholder="0.00"
                  className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm font-bold theme-text-main disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">Fee (USD)</label>
                <input type="number" min="0" step="0.01" value={genFee} onChange={e => setGenFee(e.target.value)} disabled={genLoading} placeholder="0.00"
                  className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm theme-text-main disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
            </div>

            {genNet > 0 && (
              <div className="mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Net Payout</span>
                <div className="mt-1 text-2xl font-black text-emerald-600">{formatCurrency(genNet)}</div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">Payout Method</label>
              <select value={genMethod} onChange={e => setGenMethod(e.target.value)} disabled={genLoading}
                className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm theme-text-main disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                {PAYOUT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">
                Notes <span className="normal-case font-normal">(optional)</span>
              </label>
              <textarea value={genNotes} onChange={e => setGenNotes(e.target.value)} disabled={genLoading} rows={2} maxLength={500} placeholder="Internal notes…"
                className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm theme-text-main disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none" />
            </div>

            {genError && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{genError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button onClick={() => void submitGenerate()} disabled={genLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition">
                {genLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Plus className="w-4 h-4" /> Create Invoice</>}
              </button>
              <button onClick={() => { if (!genLoading) setModal(MODAL_CLOSED); }} disabled={genLoading}
                className="rounded-full border theme-border px-4 py-2.5 text-sm font-semibold theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Invoice Modal ─────────────────────────────────────────────────── */}
      {modal.mode === "EDIT" && modal.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { if (!editLoading) setModal(MODAL_CLOSED); }}
          />
          <div className="relative w-full max-w-lg theme-bg-card border theme-border rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Edit Invoice</div>
                <div className="mt-1 font-mono font-bold theme-text-main">{modal.invoice.invoice_number}</div>
              </div>
              <button
                onClick={() => { if (!editLoading) setModal(MODAL_CLOSED); }}
                disabled={editLoading}
                className="rounded-full p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Publisher (read-only) */}
            <div className="mb-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border theme-border px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-1">Publisher (locked)</div>
              <div className="text-sm font-semibold theme-text-main">{modal.invoice.publisher_name}</div>
              <div className="text-xs theme-text-muted">{modal.invoice.publisher_email}</div>
            </div>

            {/* Billing period */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">Period Start</label>
                <input type="date" value={editStart} max={editEnd || todayStr()} onChange={e => setEditStart(e.target.value)} disabled={editLoading}
                  className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm theme-text-main disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">Period End</label>
                <input type="date" value={editEnd} min={editStart} max={todayStr()} onChange={e => setEditEnd(e.target.value)} disabled={editLoading}
                  className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm theme-text-main disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
            </div>

            {/* Amounts */}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">Gross Amount (USD)</label>
                <input ref={editGrossRef} type="number" min="0.01" step="0.01" value={editGross} onChange={e => setEditGross(e.target.value)} disabled={editLoading} placeholder="0.00"
                  className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm font-bold theme-text-main disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">Fee (USD)</label>
                <input type="number" min="0" step="0.01" value={editFee} onChange={e => setEditFee(e.target.value)} disabled={editLoading} placeholder="0.00"
                  className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm theme-text-main disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
              </div>
            </div>

            {editNet > 0 && (
              <div className="mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Net Payout</span>
                <div className="mt-1 text-2xl font-black text-emerald-600">{formatCurrency(editNet)}</div>
              </div>
            )}

            {/* Payout method */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">Payout Method</label>
              <select value={editMethod} onChange={e => setEditMethod(e.target.value)} disabled={editLoading}
                className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm theme-text-main disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500">
                {PAYOUT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">
                Notes <span className="normal-case font-normal">(optional)</span>
              </label>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} disabled={editLoading} rows={2} maxLength={500} placeholder="Internal notes…"
                className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm theme-text-main disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none" />
            </div>

            {editError && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{editError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button onClick={() => void submitEdit()} disabled={editLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed transition">
                {editLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Pencil className="w-4 h-4" /> Save Changes</>}
              </button>
              <button onClick={() => { if (!editLoading) setModal(MODAL_CLOSED); }} disabled={editLoading}
                className="rounded-full border theme-border px-4 py-2.5 text-sm font-semibold theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mark Paid Modal ────────────────────────────────────────────────────── */}
      {modal.mode === "PAY" && modal.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { if (!payLoading) setModal(MODAL_CLOSED); }}
          />
          <div className="relative w-full max-w-md theme-bg-card border theme-border rounded-3xl p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Mark Invoice Paid</div>
                <div className="mt-1 font-bold theme-text-main font-mono">{modal.invoice.invoice_number}</div>
                <div className="text-xs theme-text-muted">{modal.invoice.publisher_name} · {modal.invoice.publisher_email}</div>
              </div>
              <button
                onClick={() => { if (!payLoading) setModal(MODAL_CLOSED); }}
                disabled={payLoading}
                className="rounded-full p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Net Amount to Deduct</span>
              <div className="mt-1 text-2xl font-black text-emerald-600">
                {formatCurrency(modal.invoice.net_amount)}
              </div>
              <div className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">
                Gross {formatCurrency(modal.invoice.gross_amount)}
                {Number(modal.invoice.fee_amount) > 0 ? ` − Fee ${formatCurrency(modal.invoice.fee_amount)}` : ""}
              </div>
            </div>

            <div className="mb-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
              This will deduct{" "}
              <strong>{formatCurrency(modal.invoice.net_amount)}</strong> from{" "}
              {modal.invoice.publisher_name}&apos;s available wallet balance and create a WITHDRAWAL transaction.
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2">
                Description <span className="normal-case font-normal">(optional)</span>
              </label>
              <input
                type="text" maxLength={200} value={payDesc}
                onChange={e => { setPayDesc(e.target.value); setPayError(null); }}
                onKeyDown={e => { if (e.key === "Enter" && !payLoading) void submitPay(); }}
                disabled={payLoading}
                placeholder={`Payment for ${modal.invoice.invoice_number}`}
                className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm theme-text-main disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {payError && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{payError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button onClick={() => void submitPay()} disabled={payLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition">
                {payLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : <><Send className="w-4 h-4" /> Confirm Payment</>}
              </button>
              <button onClick={() => { if (!payLoading) setModal(MODAL_CLOSED); }} disabled={payLoading}
                className="rounded-full border theme-border px-4 py-2.5 text-sm font-semibold theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ────────────────────────────────────────────────── */}
      {modal.mode === "DELETE" && modal.invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { if (!delLoading) setModal(MODAL_CLOSED); }}
          />
          <div className="relative w-full max-w-md theme-bg-card border theme-border rounded-3xl p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] font-bold text-rose-500">Delete Invoice</div>
                <div className="mt-1 font-mono font-bold theme-text-main">{modal.invoice.invoice_number}</div>
              </div>
              <button
                onClick={() => { if (!delLoading) setModal(MODAL_CLOSED); }}
                disabled={delLoading}
                className="rounded-full p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 px-4 py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-rose-700 dark:text-rose-400 mb-1">
                    This action cannot be undone.
                  </div>
                  <div className="text-xs text-rose-600 dark:text-rose-400 space-y-1">
                    <div>Invoice: <strong>{modal.invoice.invoice_number}</strong></div>
                    <div>Publisher: <strong>{modal.invoice.publisher_name}</strong></div>
                    <div>
                      Amount: <strong>{formatCurrency(modal.invoice.gross_amount)}</strong> gross
                      {Number(modal.invoice.fee_amount) > 0 ? ` / ${formatCurrency(modal.invoice.net_amount)} net` : ""}
                    </div>
                    <div>Period: <strong>{modal.invoice.period_start} → {modal.invoice.period_end}</strong></div>
                  </div>
                </div>
              </div>
            </div>

            {delError && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{delError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => void confirmDelete()}
                disabled={delLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                {delLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</>
                ) : (
                  <><Trash2 className="w-4 h-4" /> Delete Invoice</>
                )}
              </button>
              <button
                onClick={() => { if (!delLoading) setModal(MODAL_CLOSED); }}
                disabled={delLoading}
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
