import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Edit3, Loader2, X, Building2 } from "lucide-react";
import * as advertisersApi from "../../services/advertisers";

type AdvertiserRecord = advertisersApi.AdvertiserRecord;

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PAUSED: "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-red-100 text-red-600",
  PENDING: "bg-slate-100 text-slate-600",
};

interface AdvertiserListViewProps {
  onCreateNew?: () => void;
}

export function AdvertiserListView({ onCreateNew }: AdvertiserListViewProps) {
  const [advertisers, setAdvertisers] = useState<AdvertiserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    loadAdvertisers();
  }, []);

  async function loadAdvertisers() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await advertisersApi.listAdvertisers();
      setAdvertisers(data);
    } catch (err: any) {
      setLoadError(err.message || "Failed to load advertisers");
    } finally {
      setIsLoading(false);
    }
  }

  const visible = useMemo(
    () =>
      advertisers.filter((a) =>
        `${a.company_name} ${a.contact_name} ${a.email}`
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      ),
    [advertisers, searchValue]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Advertisers</div>
          <div className="mt-2 text-2xl font-black theme-text-main">Advertiser List</div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search advertisers..."
              className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-950 px-10 py-3 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-500 transition flex items-center gap-2 justify-center"
            >
              <Plus className="w-4 h-4" />
              New Advertiser
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Company</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Contact</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Email</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Website</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Status</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading advertisers...
                </td>
              </tr>
            ) : loadError ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-red-500">{loadError}</td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  {searchValue ? "No advertisers match your search." : "No advertisers yet. Create the first one."}
                </td>
              </tr>
            ) : (
              visible.map((adv) => (
                <tr key={adv.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="font-semibold theme-text-main">{adv.company_name}</div>
                    <div className="text-xs theme-text-muted font-mono">{adv.id.slice(0, 8)}…</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{adv.contact_name}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-muted">{adv.email}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-muted">
                    {adv.website ? (
                      <span className="truncate max-w-[160px] block">{adv.website}</span>
                    ) : (
                      <span className="text-slate-300 dark:text-slate-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[adv.status] || "bg-slate-100 text-slate-700"}`}>
                      {adv.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-muted">
                    {new Date(adv.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
