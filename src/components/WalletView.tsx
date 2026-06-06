import React, { useState } from "react";
import { Wallet, DollarSign, ArrowUpRight, CheckCircle, RefreshCw, AlertCircle, ShieldCheck, Landmark } from "lucide-react";
import { DEMO_TRANSACTIONS } from "../data/publisherDemo";

export function WalletView() {
  // Balance state trackers
  const [availableBalance, setAvailableBalance] = useState(3390.80);
  const [pendingBalance, setPendingBalance] = useState(450.00);
  const [paidBalance, setPaidBalance] = useState(18480.00);

  // Dynamic payment fields states
  const [paymentMethod, setPaymentMethod] = useState("PayPal");
  
  // PayPal field
  const [paypalEmail, setPaypalEmail] = useState("paypal-payee@highconvmedia.com");
  // Payoneer field
  const [payoneerEmail, setPayoneerEmail] = useState("payoneer-payee@highconvmedia.com");
  // USDT field
  const [usdtAddress, setUsdtAddress] = useState("TY981zXaBv7pQLk881mQpn9421H902ZpE2");
  // Wire fields
  const [wireBankName, setWireBankName] = useState("Chase Manhattan Bank");
  const [wireAccountNumber, setWireAccountNumber] = useState("9981-2244-1029-90");
  const [wireSwiftCode, setWireSwiftCode] = useState("CHASUS33XXX");
  const [wireBeneficiaryName, setWireBeneficiaryName] = useState("John Doe Media INC");

  // General configuration state
  const [minDisbursement, setMinDisbursement] = useState("100");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Withdrawal Request values
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState("");
  const [withdrawError, setWithdrawError] = useState("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  const handleSavePaymentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleWithdrawRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError("");
    setWithdrawSuccess("");

    const amountNum = parseFloat(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError("Please enter a valid positive withdrawal amount.");
      return;
    }

    if (amountNum > availableBalance) {
      setWithdrawError(`Insufficient funds. Your maximum claimable balance is $${availableBalance.toFixed(2)}.`);
      return;
    }

    if (amountNum < parseFloat(minDisbursement)) {
      setWithdrawError(`Requested amount is below your configured minimum threshold of $${minDisbursement}.00.`);
      return;
    }

    setIsSubmittingWithdraw(true);
    setTimeout(() => {
      setIsSubmittingWithdraw(false);
      setAvailableBalance(prev => prev - amountNum);
      setWithdrawSuccess(`Success! Your withdrawal request for $${amountNum.toFixed(2)} has been submitted. Verification reference: APX-WD-${Math.floor(Math.random() * 89999 + 10000)}.`);
      setWithdrawAmount("");
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="wallet-ledger-root">
      
      {/* Page Header */}
      <div className="theme-bg-card border theme-border p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-lg font-bold theme-text-main tracking-tight flex items-center gap-1.5">
            <Wallet className="w-5 h-5 text-cyan-500" />
            My Wallet Balances
          </h2>
          <p className="text-xs theme-text-muted">
            Manage your account ledger, configure payment receivers dynamically, and request direct balance withdrawals.
          </p>
        </div>
        <div className="theme-bg-well px-2.5 py-1 rounded text-[10px] theme-text-muted font-mono border theme-border select-all shrink-0">
          Billing Status: <span className="text-cyan-600 dark:text-cyan-400 font-bold">Standard NET-15 Ready</span>
        </div>
      </div>

      {/* THREE BALANCES KPI CARDS & WITHDRAW INSTRUCTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Available Balance */}
        <div className="theme-bg-card border border-cyan-300 dark:border-cyan-800/30 p-5 rounded-2xl space-y-2 relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl"></div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold block">Available Balance</span>
          <div className="text-3xl font-black font-mono theme-text-main leading-none">
            ${availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono pt-1">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" /> Reconciled & ready for payout
          </span>
        </div>

        {/* Pending Balance */}
        <div className="theme-bg-card border theme-border p-5 rounded-2xl space-y-2 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider theme-text-muted font-bold block">Pending Balance</span>
          <div className="text-3xl font-black font-mono theme-text-main leading-none">
            ${pendingBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-mono pt-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" /> Escrow verification period
          </span>
        </div>

        {/* Paid Balance (Total lifetimes disbursed) */}
        <div className="theme-bg-card border theme-border p-5 rounded-2xl space-y-2 shadow-xs">
          <span className="text-[10px] font-mono uppercase tracking-wider theme-text-muted font-bold block">Paid Balance</span>
          <div className="text-3xl font-black font-mono theme-text-main leading-none">
            ${paidBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] theme-text-muted block font-mono pt-1">
            Transferred safely across historical invoices
          </span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PAYMENT GATEWAY PREFERENCES: LEFT (7/12) */}
        <div className="lg:col-span-7 theme-bg-card border theme-border p-6 rounded-2xl space-y-5 shadow-xs">
          <h3 className="theme-text-main text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Landmark className="w-4 h-4 text-cyan-500" />
            Payout Gateway Preferences
          </h3>

          <form onSubmit={handleSavePaymentConfig} className="space-y-4 text-xs font-sans">
            
            {saveSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-900/40 p-2.5 rounded-xl font-mono text-[11px]">
                ✓ Payout gateway configuration token parameters stored successfully.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">
                  Preferred Payment Protocol
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main font-semibold focus:outline-none focus:border-cyan-500"
                >
                  <option value="PayPal">PayPal Holdings</option>
                  <option value="Payoneer">Payoneer Global</option>
                  <option value="USDT TRC20">USDT TRC20 (Tether crypto)</option>
                  <option value="Wire Transfer">Bank Wire Transfer / SWIFT</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">
                  Minimum Payout Threshold (USD)
                </label>
                <select
                  value={minDisbursement}
                  onChange={(e) => setMinDisbursement(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:outline-none focus:border-cyan-500"
                >
                  <option value="100">$100.00 Minimum release threshold</option>
                  <option value="250">$250.00 Recommended tier</option>
                  <option value="500">$500.00 Professional accounts</option>
                  <option value="1000">$1,000.00 Executive volume accounts</option>
                </select>
              </div>
            </div>

            {/* DYNAMIC PAYMENT METHOD FIELDS */}
            <div className="p-4 bg-slate-50 dark:theme-bg-well rounded-2xl border theme-border space-y-3">
              <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 font-mono block">
                Required Destination Parameters of {paymentMethod}
              </span>

              {paymentMethod === "PayPal" && (
                <div>
                  <label className="block text-[10px] uppercase font-semibold theme-text-muted font-mono">
                    PayPal Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-950 border theme-border rounded-xl theme-text-main font-mono"
                    placeholder="e.g. payout@media-agency.com"
                  />
                  <span className="text-[10px] theme-text-muted block mt-1">PayPal standard processing fees applied at release time.</span>
                </div>
              )}

              {paymentMethod === "Payoneer" && (
                <div>
                  <label className="block text-[10px] uppercase font-semibold theme-text-muted font-mono">
                    Payoneer Account Email
                  </label>
                  <input
                    type="email"
                    required
                    value={payoneerEmail}
                    onChange={(e) => setPayoneerEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-950 border theme-border rounded-xl theme-text-main font-mono"
                    placeholder="e.g. business@payoneer-billing.com"
                  />
                </div>
              )}

              {paymentMethod === "USDT TRC20" && (
                <div>
                  <label className="block text-[10px] uppercase font-semibold theme-text-muted font-mono">
                    USDT TRC20 Crypto Wallet Address
                  </label>
                  <input
                    type="text"
                    required
                    value={usdtAddress}
                    onChange={(e) => setUsdtAddress(e.target.value)}
                    className="mt-1 block w-full px-3 py-2.5 bg-white dark:bg-slate-950 border theme-border rounded-xl theme-text-main font-mono text-xs"
                    placeholder="TRC20 Wallet Address Starting with T..."
                  />
                  <span className="text-[10px] text-rose-500 font-medium block mt-1">WARNING: Input only TRC-20 addresses. ERC-20 transfers will result in loss of funds.</span>
                </div>
              )}

              {paymentMethod === "Wire Transfer" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-semibold theme-text-muted font-mono">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        required
                        value={wireBankName}
                        onChange={(e) => setWireBankName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-950 border theme-border rounded-xl theme-text-main"
                        placeholder="e.g. Citibank N.A."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold theme-text-muted font-mono">
                        Account Number / IBAN
                      </label>
                      <input
                        type="text"
                        required
                        value={wireAccountNumber}
                        onChange={(e) => setWireAccountNumber(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-950 border theme-border rounded-xl theme-text-main font-mono"
                        placeholder="Domestic or International format"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-semibold theme-text-muted font-mono">
                        IFSC / SWIFT Code
                      </label>
                      <input
                        type="text"
                        required
                        value={wireSwiftCode}
                        onChange={(e) => setWireSwiftCode(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-950 border theme-border rounded-xl theme-text-main font-mono"
                        placeholder="BIC/SWIFT Code"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold theme-text-muted font-mono">
                        Beneficiary Name
                      </label>
                      <input
                        type="text"
                        required
                        value={wireBeneficiaryName}
                        onChange={(e) => setWireBeneficiaryName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-950 border theme-border rounded-xl theme-text-main"
                        placeholder="Exact name registered at bank account"
                      />
                    </div>
                  </div>
                </div>
              )}

            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl uppercase font-mono text-xs tracking-wider transition select-none cursor-pointer"
            >
              Update Payment Gateway Details
            </button>

          </form>

        </div>

        {/* WITHDRAWAL REQUEST ACTION PANEL: RIGHT (5/12) */}
        <div className="lg:col-span-5 bg-white dark:theme-bg-card border theme-border p-6 rounded-2xl flex flex-col justify-between space-y-6 shadow-xs">
          
          <div className="space-y-4">
            <h3 className="theme-text-main text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-cyan-500 animate-pulse" />
              Withdrawal Request claims
            </h3>

            <p className="text-[11px] theme-text-muted leading-relaxed">
              Manually request partial or complete payout disbursement from your ready available holdings pool.
            </p>

            <form onSubmit={handleWithdrawRequestSubmit} className="space-y-4">
              
              {withdrawError && (
                <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-900 rounded-xl p-3 text-xs">
                  {withdrawError}
                </div>
              )}

              {withdrawSuccess && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-900 rounded-xl p-3 text-xs leading-relaxed">
                  {withdrawSuccess}
                </div>
              )}

              <div className="space-y-2 text-xs">
                <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">
                  Disbursement Amount (USD)
                </label>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    $
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    step="0.01"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="block w-full pl-7 pr-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main text-sm focus:outline-none focus:border-cyan-500 font-mono font-bold"
                    placeholder="Enter amount, e.g. 500"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] theme-text-muted">
                  <span>Current Threshold Limit: ${minDisbursement}.00</span>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(availableBalance.toFixed(2))}
                    className="text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    Withdraw All
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingWithdraw}
                className="w-full bg-slate-900 dark:bg-slate-950 border border-slate-800 hover:bg-slate-800 text-white font-bold py-3 rounded-xl uppercase font-mono text-xs tracking-wider transition cursor-pointer select-none"
              >
                {isSubmittingWithdraw ? "Verifying Ledger Holds..." : "Request Manual Withdrawal Release"}
              </button>

            </form>

          </div>

          <div className="theme-bg-well border theme-border p-4 rounded-xl space-y-2 text-[10px] theme-text-secondary">
            <span className="font-bold text-cyan-600 dark:text-cyan-400 uppercase block font-mono">Disbursement Sandbox Rule</span>
            <p className="leading-normal">
              Internal checks reconcile S2S click records against conversion callback payloads before launching transactions to PayPal, Payoneer, TRC-20, or Wire networks. Check the Invoices screen to download PDF billing statements.
            </p>
          </div>

        </div>

      </div>

      {/* HISTORIC LEDGER TRANSACTIONS FOOTER */}
      <div className="theme-bg-card border theme-border p-6 rounded-2xl shadow-xs">
        <h3 className="theme-text-main text-xs font-bold uppercase font-mono tracking-wider mb-4 flex items-center gap-1.5">
          <RefreshCw className="w-4 h-4 text-cyan-500" />
          Historic Account Transactions Ledger
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left divide-y theme-border">
            <thead className="theme-table-header text-[10px] font-mono uppercase theme-text-muted tracking-wider">
              <tr>
                <th className="px-4 py-3 border-b theme-border">Trans Id</th>
                <th className="px-4 py-3 border-b theme-border">Posting Date</th>
                <th className="px-4 py-3 border-b theme-border">Description Notes</th>
                <th className="px-4 py-3 border-b theme-border text-center">Operation Status</th>
                <th className="px-4 py-3 border-b theme-border text-right">Sum (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-border text-xs text-slate-700 dark:text-slate-300">
              {DEMO_TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/20 font-mono">
                  <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{tx.id}</td>
                  <td className="px-4 py-3 theme-text-muted whitespace-nowrap">{tx.date}</td>
                  <td className="px-4 py-3 theme-text-secondary font-sans leading-snug">{tx.notes}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full capitalize bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
                      {tx.status}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-black ${tx.amount > 0 ? "text-emerald-600" : "text-rose-600 dark:text-rose-400"}`}>
                    {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
