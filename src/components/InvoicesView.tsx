import React, { useState, useMemo } from "react";
import { FileText, Download, CheckCircle, Clock, AlertTriangle, Eye, Printer, Search, RefreshCw, X } from "lucide-react";
import { DEMO_INVOICES, DemoInvoice } from "../data/publisherDemo";
import { InvoiceDetailModal } from "./InvoiceDetailModal";

export function InvoicesView() {
  const [selectedInvoice, setSelectedInvoice] = useState<DemoInvoice | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "Paid" | "Unpaid" | "Hold" | "Processing">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadNotification, setDownloadNotification] = useState<string | null>(null);

  // Filter invoices listing
  const filteredInvoices = useMemo(() => {
    return DEMO_INVOICES.filter(inv => {
      const matchStatus = statusFilter === "all" || inv.status === statusFilter;
      const matchSearch = inv.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.period.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [statusFilter, searchQuery]);

  // Simulate downloading a structured PDF statement file
  const handleDownloadPDF = (inv: DemoInvoice) => {
    const textLedger = `========================================================================
                      APEXTRACK LTD - INVOICE STATEMENT RECEIPT
                    Generated on State Route Ledger Network: 2026
========================================================================
Invoice Reference Ref:    ${inv.id}
Invoice Tracking Code:    ${inv.invoiceNumber}
Statement Billing Cycle:  ${inv.period}
Posting Generation Date:  ${inv.generatedDate}
Current Settlement Node:  ${inv.status.toUpperCase()}
Preferred Payout Method:  ${inv.payoutMethod}
------------------------------------------------------------------------
ITEMIZED BILLING RECONCILIATIONS:

1. High Volume S2S Verified CPA Conversions:
   - Commission Volume Reconciled Base Sum:     $${inv.amount.toFixed(2)} USD
   - Administrative System Processing Fee:       $${inv.fee.toFixed(2)} USD
   ---------------------------------------------------------------------
   RECONCILED DISBURSEMENT READY SUB-TOTAL:     $${(inv.amount - inv.fee).toFixed(2)} USD

========================================================================
LEDGER CRYPTOGRAPHICAL SHA256 HEX DIGEST VALUE:
F8a99s77fSDe77mS9120gK66aQpEee33b9A11pL902ccZZ910_MD5_SALT_VERIFIED
========================================================================`;

    const blob = new Blob([textLedger], { type: "text/plain;charset=utf-8" });
    const blobUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = blobUrl;
    downloadLink.download = `payout-claim-statement-${inv.id}.txt`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(blobUrl);

    setDownloadNotification(`PDF/Receipt file statement dispatched successfully for ${inv.id}!`);
    setTimeout(() => {
      setDownloadNotification(null);
    }, 3000);
  };

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="invoices-view-root">
      
      {/* Page Header */}
      <div className="theme-bg-card border theme-border p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-lg font-bold theme-text-main tracking-tight flex items-center gap-1.5">
            <FileText className="w-5 h-5 text-cyan-500" />
            Invoices & Billing Statements
          </h2>
          <p className="text-xs theme-text-muted">
            Track historical account releases, examine billing statements, download receipt PDFs, and inspect validation logs.
          </p>
        </div>
        <div className="theme-bg-well px-2.5 py-1 rounded text-[10px] theme-text-muted font-mono border theme-border select-all shrink-0">
          Sync Time: <span className="text-cyan-600 dark:text-cyan-400 font-bold font-mono">12:41:00 UTC</span>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="theme-bg-card border theme-border p-4 rounded-xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        
        {/* Status Tab buttons */}
        <div className="flex flex-wrap gap-1 select-none">
          {(["all", "Paid", "Unpaid", "Hold", "Processing"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-sans cursor-pointer transition ${
                statusFilter === status
                  ? "bg-cyan-550 text-white"
                  : "theme-bg-well theme-text-secondary hover:bg-slate-200/55 dark:hover:bg-slate-800"
              }`}
            >
              {status === "all" ? "Show All" : status}
            </button>
          ))}
        </div>

        {/* Text query input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 theme-bg-well border theme-border rounded-xl theme-text-main text-xs focus:outline-none focus:border-cyan-500"
            placeholder="Search invoice id or description..."
          />
        </div>

      </div>

      {downloadNotification && (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-950 p-3 rounded-xl text-xs flex items-center justify-between">
          <span>{downloadNotification}</span>
          <button onClick={() => setDownloadNotification(null)} className="theme-text-main">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* INVOICE GRID AND TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* INVOICES LISTING TABLE: LEFT (8/12) */}
        <div className="lg:col-span-8 theme-bg-card border theme-border p-6 rounded-2xl shadow-xs space-y-4">
          <h3 className="theme-text-main text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-cyan-500" />
            Statements Ledger ({filteredInvoices.length} Found)
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left divide-y theme-border">
              <thead className="theme-table-header text-[10px] font-mono uppercase theme-text-muted tracking-wider">
                <tr>
                  <th className="px-4 py-3 border-b theme-border">Invoice ID</th>
                  <th className="px-4 py-3 border-b theme-border">Billing Cycle Period</th>
                  <th className="px-4 py-3 border-b theme-border text-right">Raw Amount</th>
                  <th className="px-4 py-3 border-b theme-border text-center">Settlement Status</th>
                  <th className="px-4 py-3 border-b theme-border text-center">Invoice Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y theme-border text-xs text-slate-700 dark:text-slate-300">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 theme-text-muted italic">
                      Zero matching invoices found under current filter constraints.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/10 font-mono">
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        {inv.id}
                        <span className="text-[10px] text-slate-450 block font-normal">{inv.invoiceNumber}</span>
                      </td>
                      <td className="px-4 py-3.5 theme-text-secondary font-sans max-w-xs truncate">{inv.period}</td>
                      <td className="px-4 py-3.5 text-right font-black text-slate-900 dark:text-white">${inv.amount.toFixed(2)}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold border rounded-full capitalize ${
                          inv.status === "Paid" 
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900"
                            : inv.status === "Hold"
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-250 dark:border-rose-900"
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-250 dark:border-amber-900"
                        }`}>
                          {inv.status === "Paid" && <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />}
                          {inv.status === "Unpaid" && <Clock className="w-3 h-3 text-amber-500 shrink-0" />}
                          {inv.status === "Hold" && <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />}
                          {inv.status === "Processing" && <RefreshCw className="w-3 h-3 text-amber-500 animate-spin shrink-0" />}
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 select-none">
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-350 p-1.5 rounded-lg transition"
                            title="Print Spec Ledger / View Spec Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPDF(inv)}
                            className="bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 text-cyan-600 dark:text-cyan-400 p-1.5 rounded-lg transition"
                            title="Download simulated PDF statement"
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
        </div>

        {/* INLINE INVOICE QUICK DETAILED BOX: RIGHT (4/12) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="theme-bg-card border theme-border p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="theme-text-main text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Printer className="w-4 h-4 text-cyan-500" />
              Focus Statement Analyzer
            </h3>
            
            {selectedInvoice ? (
              <div className="space-y-4 animate-fadeIn text-xs text-slate-755 dark:text-slate-300">
                <div className="flex items-center justify-between pb-2 border-b theme-border text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-250">Statement {selectedInvoice.id}</span>
                  <button onClick={() => setSelectedInvoice(null)} className="text-rose-500 font-bold font-sans">
                    Clear Frame
                  </button>
                </div>

                <div className="space-y-1 bg-slate-50 dark:theme-bg-well p-3 rounded-xl border theme-border font-mono text-[11px] leading-relaxed">
                  <div>Ref Num: <span className="font-bold theme-text-main">{selectedInvoice.invoiceNumber}</span></div>
                  <div>Period: <span className="font-bold theme-text-main">{selectedInvoice.period}</span></div>
                  <div>Generated: <span className="font-bold theme-text-main">{selectedInvoice.generatedDate}</span></div>
                  <div>Payout: <span className="font-bold theme-text-main">{selectedInvoice.payoutMethod}</span></div>
                  <div>Invoice status: <span className="font-bold text-cyan-600 dark:text-cyan-400">{selectedInvoice.status}</span></div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between font-mono font-semibold text-xs">
                    <span>Gross payout commission:</span>
                    <span className="theme-text-main">${selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-mono text-slate-500">
                    <span>Line ledger processing fee:</span>
                    <span>${selectedInvoice.fee.toFixed(2)}</span>
                  </div>
                  <hr className="theme-border" />
                  <div className="flex justify-between font-mono font-bold text-sm text-cyan-600 dark:text-cyan-400">
                    <span>Reconciled Release:</span>
                    <span>${(selectedInvoice.amount).toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 select-none">
                  <button
                    onClick={() => handleDownloadPDF(selectedInvoice)}
                    className="w-full bg-cyan-500 hover:bg-cyan-455 text-slate-950 font-bold py-2.5 rounded-xl uppercase tracking-wider font-mono text-[10px] flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    Download PDF Claim Statement
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center theme-text-muted italic text-xs leading-relaxed">
                Click the <Eye className="w-3.5 h-3.5 inline mx-0.5" /> action icon on any invoice listing row to pull its itemized statement details into this focus frame view.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RENDER DIGNIFIED CUSTOM POPUP SPEC WORKBOOK */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

    </div>
  );
}
