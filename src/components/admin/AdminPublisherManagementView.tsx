import { useMemo, useState } from "react";
import { Search, Eye, ShieldCheck } from "lucide-react";
import { adminPublishers } from "./adminDemoData";

const statusClasses: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Suspended: "bg-rose-100 text-rose-700",
};

export function AdminPublisherManagementView() {
  const [searchValue, setSearchValue] = useState("");

  const filteredPublishers = useMemo(
    () =>
      adminPublishers.filter((publisher) =>
        `${publisher.name} ${publisher.company}`.toLowerCase().includes(searchValue.toLowerCase())
      ),
    [searchValue]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">
            Publisher Management
          </div>
          <div className="mt-2 text-2xl font-black theme-text-main">Publisher list and review workflows</div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search publishers"
              className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-950 px-10 py-3 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <button className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-500 transition flex items-center gap-2 justify-center">
            <ShieldCheck className="w-4 h-4" />
            Review Pending
          </button>
        </div>
      </div>

      <div className="rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Publisher</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Tier</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Offers</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Revenue</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-6 py-4 text-right text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredPublishers.map((publisher) => (
              <tr key={publisher.id}>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="font-semibold theme-text-main">{publisher.name}</div>
                  <div className="text-sm theme-text-muted">{publisher.company}</div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{publisher.tier}</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{publisher.offers}</td>
                <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{publisher.revenue}</td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[publisher.status]}`}>
                    {publisher.status}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right">
                  <button className="text-xs font-semibold text-cyan-600 hover:text-cyan-500 transition inline-flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    View
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
