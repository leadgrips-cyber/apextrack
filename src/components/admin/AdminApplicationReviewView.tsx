import { useMemo, useState } from "react";
import { Search, CheckCircle2, XCircle, ClipboardList } from "lucide-react";
import { adminApplications } from "./adminDemoData";

export function AdminApplicationReviewView() {
  const [filter, setFilter] = useState("");

  const visibleApplications = useMemo(
    () =>
      adminApplications.filter((application) =>
        `${application.publisher} ${application.company} ${application.requestedOffer} ${application.details}`
          .toLowerCase()
          .includes(filter.toLowerCase())
      ),
    [filter]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">
            Application Review
          </div>
          <div className="mt-2 text-2xl font-black theme-text-main">Pending approvals and publisher requests</div>
        </div>

        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder="Filter applications"
            className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-950 px-10 py-3 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {visibleApplications.map((application) => (
          <div key={application.id} className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold theme-text-main">{application.publisher}</div>
                <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mt-1">{application.company}</div>
              </div>
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-200">
                {application.submitted}
              </div>
            </div>

            <div className="mt-4 text-sm theme-text-muted">Requested offer: <span className="font-semibold theme-text-main">{application.requestedOffer}</span></div>
            <div className="mt-3 text-sm theme-text-main">{application.details}</div>
            <div className="mt-4 text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Risk score</div>
            <div className="mt-2 flex items-center justify-between gap-4">
              <div className="rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 px-3 py-2 text-sm font-semibold text-cyan-700 dark:text-cyan-200">
                {application.score}
              </div>
              <div className="flex items-center gap-2">
                <button className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition">
                  <CheckCircle2 className="w-4 h-4" />
                  Approve
                </button>
                <button className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-200 transition">
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="theme-bg-well border theme-border rounded-3xl p-5 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
          <ClipboardList className="w-4 h-4" />
          Review note
        </div>
        <div className="mt-3 text-slate-500 dark:text-slate-400">
          These cards represent mock review actions for future admin workflows. Approve and reject actions are shown for UI demonstration only.
        </div>
      </div>
    </div>
  );
}
