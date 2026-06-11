import { X, Printer, CheckCircle, Layers } from "lucide-react";
import { DemoInvoice } from "../data/publisherDemo";
import { useBranding } from "../contexts/BrandingContext";

interface InvoiceDetailModalProps {
  invoice: DemoInvoice | null;
  onClose: () => void;
}

export function InvoiceDetailModal({ invoice, onClose }: InvoiceDetailModalProps) {
  const branding = useBranding();
  if (!invoice) return null;

  // Dynamically generate realistic printable itemized rows depending on invoice properties
  const simulatedLineItems = [
    {
      offerName: "NordVPNSecure - Multi Device CPA (WW)",
      leads: Math.floor(invoice.amount / 5.2),
      rate: 3.80,
      subtotal: (Math.floor(invoice.amount / 5.2) * 3.80)
    },
    {
      offerName: "Apex Trading App - CPA Lead Campaign",
      leads: Math.floor((invoice.amount - (Math.floor(invoice.amount / 5.2) * 3.80)) / 4.20),
      rate: 4.20,
      subtotal: invoice.amount - (Math.floor(invoice.amount / 5.2) * 3.80)
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans animate-fadeIn" id="invoice-details-overlay">
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Modal Upper header controls */}
        <div className="bg-slate-950/80 p-4 border-b border-slate-850 flex justify-between items-center select-none text-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 font-mono">Invoice Reference Hash:</span>
            <code className="text-cyan-300 font-mono text-xs font-bold">{invoice.id}</code>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-900 rounded-lg transition"
              title="Print Receipt ledger"
            >
              <Printer className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-rose-400 p-1.5 hover:bg-slate-900 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet Canvas */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-350 leading-relaxed scrollbar-thin">
          
          {/* Statement Branding Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-850 pb-6">
            
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="bg-cyan-500 text-slate-500 p-1.5 rounded font-black shrink-0">
                  <Layers className="w-3.5 h-3.5 text-slate-950" />
                </div>
                <span className="text-sm font-black text-white font-mono tracking-tight uppercase">
                  Apex<span className="text-cyan-400">Track</span> Ltd.
                </span>
              </div>
              <p className="text-[10px] text-slate-550 font-mono">
                100 Marina Bay Sands, Tower 3 Suite 1400<br />
                Singapore, 018956<br />
                VAT ID: SG-2081109A
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className={`inline-block font-mono font-bold text-[9px] py-0.5 px-2 rounded uppercase border ${
                invoice.status.toLowerCase() === "paid"
                  ? "bg-emerald-950 text-emerald-400 border-emerald-900/40"
                  : "bg-amber-950 text-amber-400 border-amber-900/40"
              }`}>
                Payment {invoice.status}
              </span>
              <div className="text-[11px] font-mono text-slate-500">
                Statement Date: <span className="text-white font-semibold">{invoice.generatedDate}</span><br />
                Billing Cycle: <span className="text-white font-semibold">{invoice.period}</span>
              </div>
            </div>

          </div>

          {/* Publisher Particulars info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block mb-1">Affiliate Payee Detail:</span>
              <p className="font-bold text-slate-200">John Doe Media INC</p>
              <p className="text-[10px] text-slate-400 leading-normal">
                Email: demo@apextrack.net<br />
                Affiliate Account Ref ID: #2081<br />
                Registered Address: Wilmington Delaware USA
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-[9px] uppercase font-bold text-slate-500 font-mono block mb-1">Disbursement Destination:</span>
              <p className="font-bold text-slate-200 font-mono text-[11px]">{invoice.payoutMethod}</p>
              <p className="text-[10px] text-slate-500 leading-normal break-all font-mono">
                Hash Address:<br />
                TY981zXaBv7pQLk881mQpn9421H902ZpE2
              </p>
            </div>
          </div>

          {/* INVOICE ITEMIZATION */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <table className="min-w-full text-left divide-y divide-slate-800">
              <thead className="bg-slate-950 text-[9px] font-mono uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Statement Line-Item Description</th>
                  <th className="px-4 py-2.5 text-center">Gross Conversions</th>
                  <th className="px-4 py-2.5 text-right">Commission Rate</th>
                  <th className="px-4 py-2.5 text-right w-28">Line Sum Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                
                {simulatedLineItems.map((item, idx) => (
                  <tr key={idx} className="text-slate-350 font-mono">
                    <td className="px-4 py-3">
                      <strong className="text-slate-200 block font-sans">{item.offerName}</strong>
                      <span className="text-[10px] text-slate-500 block">S2S verified conversion attribution stream</span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400">{item.leads} validated</td>
                    <td className="px-4 py-3 text-right text-slate-450">${item.rate.toFixed(2)} CPA</td>
                    <td className="px-4 py-3 text-right text-slate-200 font-bold">${item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          {/* STATEMENT TOTAL BALANCES RECONCILIATIONS */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-64 space-y-1.5 font-mono text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Gross Revenue subtotal:</span>
                <span className="text-white">${invoice.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing fee release details:</span>
                <span className="text-slate-550">${invoice.fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-850 pt-2 text-xs font-bold font-mono">
                <span className="text-slate-200">Reconciled release total:</span>
                <span className="text-cyan-300 text-sm font-black">${invoice.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic hash signature validation */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-1.5 font-mono text-[9px] text-slate-500 leading-normal">
            <div>Cryptographical Ledger Authentication Block signature:</div>
            <div className="text-cyan-500/80 break-all select-all select-none">
              MD5-SALT-RELEASE-HASH-SHA256-49a8f110c92-APE-RECO-779Z-DISB-9a008f88
            </div>
          </div>

        </div>

        {/* Modal Action footer */}
        <div className="bg-slate-950/80 p-4 border-t border-slate-850 flex justify-between items-center shrink-0">
          <span className="text-[10px] text-slate-550 font-mono flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            Double-checked by {branding.networkName} Internal Accounting Compliance Division
          </span>
          <button
            onClick={onClose}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-[10px] font-mono uppercase tracking-wider transition cursor-pointer select-none"
          >
            Acknowledge & Close
          </button>
        </div>

      </div>

    </div>
  );
}
