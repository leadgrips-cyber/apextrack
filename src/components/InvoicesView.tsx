import { useState, useEffect, useMemo } from "react";
import { FileText, Download, CheckCircle, Clock, AlertTriangle, Eye, RefreshCw, Search, Loader2 } from "lucide-react";

interface PublisherInvoice {
  id: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  gross_amount: string;
  fee_amount: string;
  net_amount: string;
  status: "PENDING" | "PAID" | "HOLD";
  payout_method: string | null;
  notes: string | null;
  generated_at: string;
  paid_at: string | null;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function StatusBadge({ status }: { status: PublisherInvoice["status"] }) {
  if (status === "PAID") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900">
        <CheckCircle className="w-3 h-3 shrink-0" /> Paid
      </span>
    );
  }
  if (status === "HOLD") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900">
        <AlertTriangle className="w-3 h-3 shrink-0" /> Hold
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-900">
      <Clock className="w-3 h-3 shrink-0" /> Pending
    </span>
  );
}

export function InvoicesView() {
  const [invoices, setInvoices] = useState<PublisherInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<PublisherInvoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "PAID" | "PENDING" | "HOLD">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); setError("Not authenticated"); return; }
    fetch("http://localhost:3000/api/publisher/me/invoices", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Failed to load invoices (${r.status})`);
        const data = await r.json();
        setInvoices(data.invoices ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchStatus = statusFilter === "all" || inv.status === statusFilter;
      const matchSearch =
        !searchQuery ||
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.period_start.includes(searchQuery) ||
        inv.period_end.includes(searchQuery) ||
        (inv.notes ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [invoices, statusFilter, searchQuery]);

  const handleDownload = (inv: PublisherInvoice) => {
    const grossAmt = parseFloat(inv.gross_amount).toFixed(2);
    const feeAmt = parseFloat(inv.fee_amount).toFixed(2);
    const netAmt = parseFloat(inv.net_amount).toFixed(2);
    const content = `Invoice: ${inv.invoice_number}
Period:  ${inv.period_start} to ${inv.period_end}
Generated: ${formatDate(inv.generated_at)}
Status:    ${inv.status}
Payout Method: ${inv.payout_method ?? "N/A"}

Gross Amount:  $${grossAmt}
Fee:           $${feeAmt}
Net Amount:    $${netAmt}

${inv.notes ? `Notes: ${inv.notes}` : ""}`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${inv.invoice_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="invoices-view-root">
      <div className="theme-bg-card border theme-border p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-lg font-bold theme-text-main tracking-tight flex items-center gap-1.5">
            <FileText className="w-5 h-5 text-cyan-500" />
            Invoices & Billing Statements
          </h2>
          <p className="text-xs theme-text-muted">
            View and download your payout invoices.
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); setError(null); const token = localStorage.getItem("token"); if (!token) return; fetch("http://localhost:3000/api/publisher/me/invoices", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setInvoices(d.invoices ?? [])).catch(e => setError(e.message)).finally(() => setLoading(false)); }}
          className="theme-bg-well border theme-border px-3 py-1.5 rounded-xl text-xs theme-text-secondary hover:text-cyan-600 flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="theme-bg-card border theme-border p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="flex flex-wrap gap-1 select-none">
          {(["all", "PAID", "PENDING", "HOLD"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${statusFilter === s ? "bg-cyan-600 text-white" : "theme-bg-well theme-text-secondary hover:bg-slate-200/55 dark:hover:bg-slate-800"}`}
            >
              {s === "all" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 theme-bg-well border theme-border rounded-xl theme-text-main text-xs focus:outline-none focus:border-cyan-500"
            placeholder="Search invoice number or notes..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 theme-bg-card border theme-border p-6 rounded-2xl shadow-xs space-y-4">
          <h3 className="theme-text-main text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-cyan-500" />
            Invoices ({filteredInvoices.length})
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-rose-500 text-sm">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left divide-y theme-border">
                <thead className="theme-table-header text-[10px] font-mono uppercase theme-text-muted tracking-wider">
                  <tr>
                    <th className="px-4 py-3 border-b theme-border">Invoice</th>
                    <th className="px-4 py-3 border-b theme-border">Period</th>
                    <th className="px-4 py-3 border-b theme-border text-right">Amount</th>
                    <th className="px-4 py-3 border-b theme-border text-center">Status</th>
                    <th className="px-4 py-3 border-b theme-border text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-border text-xs text-slate-700 dark:text-slate-300">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 theme-text-muted italic">
                        No invoices found.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/10 font-mono">
                        <td className="px-4 py-3.5">
                          <span className="font-bold theme-text-main">{inv.invoice_number}</span>
                          <span className="block text-[10px] theme-text-muted font-normal">{formatDate(inv.generated_at)}</span>
                        </td>
                        <td className="px-4 py-3.5 theme-text-secondary font-sans">
                          {formatDate(inv.period_start)} – {formatDate(inv.period_end)}
                        </td>
                        <td className="px-4 py-3.5 text-right font-black theme-text-main">
                          ${parseFloat(inv.net_amount).toFixed(2)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <StatusBadge status={inv.status} />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5 select-none">
                            <button
                              onClick={() => setSelectedInvoice(selectedInvoice?.id === inv.id ? null : inv)}
                              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 p-1.5 rounded-lg transition"
                              title="View details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(inv)}
                              className="bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 text-cyan-600 dark:text-cyan-400 p-1.5 rounded-lg transition"
                              title="Download statement"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="lg:col-span-4">
          <div className="theme-bg-card border theme-border p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="theme-text-main text-xs font-bold uppercase font-mono tracking-wider">Invoice Detail</h3>
            {selectedInvoice ? (
              <div className="space-y-4 text-xs animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b theme-border">
                  <span className="font-bold theme-text-main">{selectedInvoice.invoice_number}</span>
                  <button onClick={() => setSelectedInvoice(null)} className="text-xs text-slate-400 hover:text-rose-500 transition">Clear</button>
                </div>
                <div className="space-y-1.5 bg-slate-50 dark:theme-bg-well p-3 rounded-xl border theme-border font-mono text-[11px] leading-relaxed">
                  <div>Period: <span className="font-bold theme-text-main">{formatDate(selectedInvoice.period_start)} – {formatDate(selectedInvoice.period_end)}</span></div>
                  <div>Generated: <span className="font-bold theme-text-main">{formatDate(selectedInvoice.generated_at)}</span></div>
                  {selectedInvoice.paid_at && <div>Paid: <span className="font-bold theme-text-main">{formatDate(selectedInvoice.paid_at)}</span></div>}
                  <div>Method: <span className="font-bold theme-text-main">{selectedInvoice.payout_method ?? "—"}</span></div>
                  <div>Status: <span className="font-bold text-cyan-600 dark:text-cyan-400">{selectedInvoice.status}</span></div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono text-xs">
                    <span className="theme-text-secondary">Gross Amount:</span>
                    <span className="theme-text-main font-semibold">${parseFloat(selectedInvoice.gross_amount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-mono text-xs">
                    <span className="theme-text-secondary">Fee:</span>
                    <span className="theme-text-muted">${parseFloat(selectedInvoice.fee_amount).toFixed(2)}</span>
                  </div>
                  <hr className="theme-border" />
                  <div className="flex justify-between font-mono font-bold text-sm text-cyan-600 dark:text-cyan-400">
                    <span>Net Amount:</span>
                    <span>${parseFloat(selectedInvoice.net_amount).toFixed(2)}</span>
                  </div>
                </div>
                {selectedInvoice.notes && (
                  <p className="text-xs theme-text-muted bg-slate-50 dark:theme-bg-well p-3 rounded-xl border theme-border">{selectedInvoice.notes}</p>
                )}
                <button
                  onClick={() => handleDownload(selectedInvoice)}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  Download Statement
                </button>
              </div>
            ) : (
              <div className="py-12 text-center theme-text-muted italic text-xs leading-relaxed">
                Click the <Eye className="w-3.5 h-3.5 inline mx-0.5" /> icon on any invoice to view details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
