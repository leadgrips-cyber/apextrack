import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  History,
  Download,
  Copy,
  Check,
} from "lucide-react";
import * as conversionReviewApi from "../../services/conversion-review";
import type { ConversionReviewRecord, ConversionHistoryRow } from "../../services/conversion-review";
import * as offersApi from "../../services/offers";
import { downloadCSV } from "../../services/analytics";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "REVIEW_QUEUE", label: "Review Queue" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "DISPUTED", label: "Disputed" },
  { value: "PAID", label: "Paid" },
];

const CHANGE_TO_OPTIONS = [
  { value: "REVIEW_QUEUE", label: "Review Queue" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "DISPUTED", label: "Disputed" },
  { value: "PAID", label: "Paid" },
];

const PAGE_SIZE = 25;

function today() { return new Date().toISOString().slice(0, 10); }
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const DATE_PRESETS = [
  { label: "Today",     start: today(),     end: today() },
  { label: "Yesterday", start: daysAgo(1),  end: daysAgo(1) },
  { label: "7 Days",    start: daysAgo(6),  end: today() },
  { label: "30 Days",   start: daysAgo(29), end: today() },
];

function statusBadge(status: string) {
  switch (status) {
    case "REVIEW_QUEUE":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 border border-blue-200">
          <Clock className="w-3 h-3" /> Review Queue
        </span>
      );
    case "PENDING":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    case "APPROVED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-3 h-3" /> Approved
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3" /> Rejected
        </span>
      );
    case "DISPUTED":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 border border-purple-200">
          Disputed
        </span>
      );
    case "PAID":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-700 border border-cyan-200">
          Paid
        </span>
      );
    default:
      return (
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 border border-slate-200">
          {status}
        </span>
      );
  }
}

function fmt(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <button
      onClick={handleCopy}
      title="Copy full ID"
      className="ml-1 inline-flex items-center justify-center rounded p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
    >
      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

interface StatusChangeModalProps {
  conversion: ConversionReviewRecord;
  targetStatus: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function StatusChangeModal({ conversion, targetStatus, onConfirm, onCancel, isLoading }: StatusChangeModalProps) {
  const [reason, setReason] = useState("");
  const needsReason = targetStatus === "REJECTED";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <ChevronDown className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Change Status</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Conversion <span className="font-mono font-bold text-slate-700">{conversion.id.slice(0, 8)}…</span>
              {" → "}
              <span className="font-bold text-slate-800 uppercase">{targetStatus.replace("_", " ")}</span>
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
            Reason {needsReason && <span className="text-rose-500">*</span>}
            {!needsReason && <span className="text-slate-400">(optional)</span>}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={needsReason ? "Required — explain why this conversion is being rejected…" : "Optional note for audit trail…"}
            rows={3}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-cyan-400 resize-none"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onConfirm(reason)}
            disabled={isLoading || (needsReason && !reason.trim())}
            className="flex-1 flex items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Confirm Change
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

interface HistoryPanelProps {
  conversionId: string;
  onClose: () => void;
}

function HistoryPanel({ conversionId, onClose }: HistoryPanelProps) {
  const [rows, setRows] = useState<ConversionHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    conversionReviewApi.getConversionHistory(conversionId)
      .then((res) => setRows(res.history))
      .catch((err: any) => setError(err.message || "Failed to load history"))
      .finally(() => setLoading(false));
  }, [conversionId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-600" />
            Status History
          </h3>
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-700 transition">Close</button>
        </div>
        <p className="text-xs text-slate-500 font-mono">ID: {conversionId}</p>
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : error ? (
            <p className="text-sm text-rose-600">{error}</p>
          ) : rows.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No status history recorded yet.</p>
          ) : (
            rows.map((row) => (
              <div key={row.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">{row.old_status ?? "(initial)"}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold text-slate-800 uppercase">{row.new_status.replace("_", " ")}</span>
                </div>
                {row.reason && (
                  <p className="text-xs text-slate-600 italic">"{row.reason}"</p>
                )}
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{row.changed_by_email ?? "System"}</span>
                  <span>{fmt(row.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function ConversionReviewView() {
  const [conversions, setConversions] = useState<ConversionReviewRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterOfferId, setFilterOfferId] = useState<number | undefined>(undefined);
  const [filterAffiliate, setFilterAffiliate] = useState("");

  const [offers, setOffers] = useState<{ id: number; name: string }[]>([]);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [statusChangeTarget, setStatusChangeTarget] = useState<{ conversion: ConversionReviewRecord; targetStatus: string } | null>(null);
  const [historyTarget, setHistoryTarget] = useState<string | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    offersApi.listAdminOffers()
      .then(list => setOffers(list.map(o => ({ id: o.id, name: o.name }))))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await conversionReviewApi.listConversions({
        status: filterStatus || undefined,
        search: filterSearch || undefined,
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
        offerId: filterOfferId,
        publisherEmail: filterAffiliate || undefined,
        page,
        pageSize: PAGE_SIZE,
      });
      setConversions(result.conversions);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message || "Failed to load conversions");
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, filterSearch, filterStartDate, filterEndDate, filterOfferId, filterAffiliate, page]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await conversionReviewApi.listConversions({
        status: filterStatus || undefined,
        search: filterSearch || undefined,
        startDate: filterStartDate || undefined,
        endDate: filterEndDate || undefined,
        offerId: filterOfferId,
        publisherEmail: filterAffiliate || undefined,
        page: 1,
        pageSize: 10000,
      });
      downloadCSV(
        result.conversions.map(c => ({
          conversion_id: c.id,
          click_id: c.click_id,
          offer: c.offer_name,
          advertiser: c.advertiser_name ?? "",
          affiliate: c.publisher_email,
          affiliate_name: c.publisher_name,
          status: c.conversion_status,
          payout: c.payout_amount,
          revenue: c.revenue_amount,
          conversion_time: c.event_timestamp,
          rejection_reason: c.rejection_reason ?? "",
        })),
        `conversion-review-${new Date().toISOString().slice(0, 10)}.csv`
      );
    } catch (err: any) {
      setActionError(err.message || "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  const handleStatusChange = (conversion: ConversionReviewRecord, targetStatus: string) => {
    if (!targetStatus || targetStatus === conversion.conversion_status) return;
    setStatusChangeTarget({ conversion, targetStatus });
  };

  const handleStatusConfirm = async (reason: string) => {
    if (!statusChangeTarget) return;
    const { conversion, targetStatus } = statusChangeTarget;
    setUpdatingId(conversion.id);
    setActionError(null);
    setActionSuccess(null);
    setStatusChangeTarget(null);
    try {
      await conversionReviewApi.updateConversionStatus(conversion.id, targetStatus, reason || undefined);
      setActionSuccess(`Conversion moved to ${targetStatus.replace("_", " ")}.`);
      load();
    } catch (err: any) {
      setActionError(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleFilterReset = () => {
    setFilterStatus("");
    setFilterSearch("");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterOfferId(undefined);
    setFilterAffiliate("");
    setPage(1);
  };

  const inputClass = "w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-cyan-400 placeholder:text-slate-400";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Reports</div>
          <h2 className="mt-2 text-2xl font-black theme-text-main">Conversion Review</h2>
          <p className="mt-2 text-sm theme-text-muted max-w-2xl">
            Review and manage conversion statuses. Use the status dropdown on each row to move a conversion to any status.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExport}
            disabled={isExporting || total === 0}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 transition"
          >
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export CSV
          </button>
          <button
            onClick={load}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-full border theme-border bg-white px-4 py-2 text-sm font-semibold theme-text-secondary hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="flex items-center gap-3 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {actionError}
        </div>
      )}

      <div className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 theme-text-muted" />
          <span className="text-xs uppercase tracking-[0.2em] font-bold theme-text-muted">Filters</span>
        </div>
        {/* Date presets */}
        <div className="flex flex-wrap gap-2 mb-3">
          {DATE_PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => { setFilterStartDate(p.start); setFilterEndDate(p.end); setPage(1); }}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold border transition ${
                filterStartDate === p.start && filterEndDate === p.end
                  ? "bg-cyan-600 border-cyan-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-cyan-400 hover:text-cyan-600"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, offer, affiliate…"
              value={filterSearch}
              onChange={(e) => { setFilterSearch(e.target.value); setPage(1); }}
              className={`${inputClass} pl-8`}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select
            value={filterOfferId ?? ""}
            onChange={(e) => { setFilterOfferId(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            className={inputClass}
          >
            <option value="">All Offers</option>
            {offers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
          <input
            type="text"
            placeholder="Affiliate email"
            value={filterAffiliate}
            onChange={(e) => { setFilterAffiliate(e.target.value); setPage(1); }}
            className={inputClass}
          />
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => { setFilterStartDate(e.target.value); setPage(1); }}
            className={inputClass}
          />
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => { setFilterEndDate(e.target.value); setPage(1); }}
            className={inputClass}
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleFilterReset}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="theme-bg-card border theme-border rounded-3xl shadow-sm overflow-hidden">
        {error ? (
          <div className="flex items-center gap-3 p-6 text-sm text-rose-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        ) : isLoading ? (
          <div className="flex items-center gap-3 p-6 text-sm theme-text-muted">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading conversions…
          </div>
        ) : conversions.length === 0 ? (
          <div className="p-8 text-center text-sm theme-text-muted">
            No conversions found matching the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1100px]">
              <thead>
                <tr className="border-b theme-border bg-slate-50 dark:bg-slate-900">
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold theme-text-muted whitespace-nowrap">Click ID</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold theme-text-muted">Offer / Advertiser</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold theme-text-muted">Affiliate</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.2em] font-bold theme-text-muted">Payout</th>
                  <th className="px-4 py-3 text-right text-[10px] uppercase tracking-[0.2em] font-bold theme-text-muted">Revenue</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold theme-text-muted whitespace-nowrap">Conversion Time</th>
                  <th className="px-4 py-3 text-left text-[10px] uppercase tracking-[0.2em] font-bold theme-text-muted">Status</th>
                  <th className="px-4 py-3 text-center text-[10px] uppercase tracking-[0.2em] font-bold theme-text-muted whitespace-nowrap">Change Status</th>
                  <th className="px-4 py-3 text-center text-[10px] uppercase tracking-[0.2em] font-bold theme-text-muted">History</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border">
                {conversions.map((c) => {
                  const isUpdating = updatingId === c.id;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[11px] text-slate-500 select-all">{c.click_id}</span>
                          <CopyButton text={c.click_id} />
                        </div>
                        <div className="text-[10px] theme-text-muted font-mono mt-0.5">{c.id.slice(0, 8)}…</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold theme-text-main text-xs max-w-[140px] truncate">{c.offer_name}</div>
                        <div className="text-[10px] theme-text-muted">{c.advertiser_name ?? "—"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs font-semibold theme-text-main truncate max-w-[140px]">{c.publisher_email}</div>
                        <div className="text-[10px] theme-text-muted truncate max-w-[140px]">{c.publisher_name}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-xs text-emerald-700">${Number(c.payout_amount).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-bold text-xs text-cyan-700">${Number(c.revenue_amount).toFixed(2)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs theme-text-main whitespace-nowrap">{fmt(c.event_timestamp)}</div>
                        {c.rejection_reason && c.conversion_status === "REJECTED" && (
                          <div className="text-[10px] text-rose-600 max-w-[120px] truncate mt-0.5" title={c.rejection_reason}>
                            {c.rejection_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">{statusBadge(c.conversion_status)}</td>
                      <td className="px-4 py-3 text-center">
                        {isUpdating ? (
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-400 mx-auto" />
                        ) : (
                          <select
                            value=""
                            onChange={(e) => handleStatusChange(c, e.target.value)}
                            className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-cyan-400 cursor-pointer hover:bg-slate-50 transition"
                          >
                            <option value="">Move to…</option>
                            {CHANGE_TO_OPTIONS
                              .filter((o) => o.value !== c.conversion_status)
                              .map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                          </select>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setHistoryTarget(c.id)}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
                        >
                          <History className="w-3 h-3" />
                          Log
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && total > 0 && (
          <div className="flex items-center justify-between gap-4 border-t theme-border px-5 py-3">
            <span className="text-xs theme-text-muted">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} conversions
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-full border theme-border px-3 py-1.5 text-xs font-semibold theme-text-secondary hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Prev
              </button>
              <span className="text-xs theme-text-muted px-2">
                {page} / {totalPages || 1}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-full border theme-border px-3 py-1.5 text-xs font-semibold theme-text-secondary hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {statusChangeTarget && (
        <StatusChangeModal
          conversion={statusChangeTarget.conversion}
          targetStatus={statusChangeTarget.targetStatus}
          onConfirm={handleStatusConfirm}
          onCancel={() => setStatusChangeTarget(null)}
          isLoading={updatingId === statusChangeTarget.conversion.id}
        />
      )}

      {historyTarget && (
        <HistoryPanel
          conversionId={historyTarget}
          onClose={() => setHistoryTarget(null)}
        />
      )}
    </div>
  );
}
