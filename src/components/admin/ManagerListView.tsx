import React from "react";

export function ManagerListView() {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Managers</div>
      <h2 className="mt-2 text-2xl font-black theme-text-main">Manager List</h2>

      <div className="mt-6 overflow-x-auto rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-4 text-left text-[10px] uppercase">Name</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase">Role</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase">Assigned Affiliates</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-6 py-4">Demo Manager</td>
              <td className="px-6 py-4">Senior AM</td>
              <td className="px-6 py-4">12</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
