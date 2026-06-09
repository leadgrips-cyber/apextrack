import { useMemo, useState } from "react";
import { Search, Plus, Edit3, PauseCircle, CheckCircle } from "lucide-react";
import { adminOffers } from "./adminDemoData";

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Paused: "bg-amber-100 text-amber-700",
  Review: "bg-slate-100 text-slate-700",
};

export function AdminOfferManagementView() {
  const [searchValue, setSearchValue] = useState("");

  const visibleOffers = useMemo(
    () =>
      adminOffers.filter((offer) =>
        `${offer.name} ${offer.category} ${offer.geo}`.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [searchValue]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">
            Offer Management
          </div>
          <div className="mt-2 text-2xl font-black theme-text-main">Review and manage offer lifecycles</div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search offers"
              className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-950 px-10 py-3 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <button className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-500 transition flex items-center gap-2 justify-center">
            <Plus className="w-4 h-4" />
            Create Offer
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Offer</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Category</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Payout</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Model</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Geo</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-6 py-4 text-right text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {visibleOffers.map((offer) => (
              <tr key={offer.id}>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="font-semibold theme-text-main">{offer.name}</div>
                  <div className="text-sm theme-text-muted">{offer.traffic} traffic potential</div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{offer.category}</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{offer.payout}</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{offer.model}</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{offer.geo}</td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[offer.status]}`}>
                    {offer.status}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right space-x-2">
                  <button className="rounded-full border theme-border px-3 py-2 text-xs font-semibold theme-text-secondary hover:theme-text-main transition inline-flex items-center gap-2">
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </button>
                  <button className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-200 transition inline-flex items-center gap-2">
                    <PauseCircle className="w-4 h-4" />
                    Pause
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
