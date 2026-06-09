import React from "react";

export function AdvertiserListView() {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Advertisers</div>
      <h2 className="mt-2 text-2xl font-black theme-text-main">Advertiser List</h2>

      <div className="mt-6 overflow-x-auto rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-[10px] uppercase">Name</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase">Campaigns</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-6 py-4">Demo Advertiser</td>
              <td className="px-6 py-4">3</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
