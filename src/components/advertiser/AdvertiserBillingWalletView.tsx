import { advertiserTransactions } from "./advertiserDemoData";
import { CreditCard, Plus, RefreshCcw } from "lucide-react";

export function AdvertiserBillingWalletView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Billing & Wallet</div>
          <div className="mt-2 text-2xl font-black theme-text-main">Manage balance, deposits, and transactions</div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-500 transition inline-flex items-center gap-2 justify-center">
            <Plus className="w-4 h-4" />
            Deposit Funds
          </button>
          <button className="rounded-2xl border theme-border px-4 py-3 text-sm font-semibold theme-text-secondary hover:bg-slate-100 dark:hover:bg-slate-900 transition inline-flex items-center gap-2 justify-center">
            <RefreshCcw className="w-4 h-4" />
            Refresh Balance
          </button>
        </div>
      </div>

      <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Current Balance</div>
            <div className="mt-2 text-4xl font-black theme-text-main">$74,520</div>
            <div className="mt-1 text-sm theme-text-muted">Available budget for active campaigns</div>
          </div>
          <div className="rounded-3xl bg-cyan-50 dark:bg-cyan-950 p-4 text-cyan-700 dark:text-cyan-200">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </section>

      <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Transaction History</div>
            <div className="mt-2 text-sm theme-text-main">Recent deposits, spend, and refunds</div>
          </div>
          <span className="rounded-2xl bg-slate-100 dark:bg-slate-900 px-3 py-2 text-xs font-semibold theme-text-secondary">Last 30 days</span>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border theme-border bg-white dark:bg-slate-950">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Date</th>
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Type</th>
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Amount</th>
                <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {advertiserTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{txn.date}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{txn.type}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{txn.amount}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{txn.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
