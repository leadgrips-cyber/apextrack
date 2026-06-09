import { useMemo } from "react";
import { managerOfferRequests } from "./managerDemoData";
import { CheckCircle2, XCircle, FileText } from "lucide-react";

export function ManagerOfferApprovalView() {
  const requests = useMemo(() => managerOfferRequests, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Offer Approval</div>
        <div className="mt-2 text-2xl font-black theme-text-main">Review publisher access requests</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {requests.map((r) => (
          <div key={r.id} className="theme-bg-card border theme-border rounded-3xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold theme-text-main">{r.offerName}</div>
                <div className="text-sm theme-text-muted">Requested by: {r.publisher}</div>
                <div className="mt-2 text-sm">{r.reason}</div>
              </div>
              <div className="text-xs theme-text-muted">{r.submitted}</div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"><CheckCircle2 className="w-4 h-4" /> Approve</button>
              <button className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-xs font-semibold text-rose-700"><XCircle className="w-4 h-4" /> Reject</button>
              <button className="inline-flex items-center gap-2 rounded-full border theme-border px-3 py-2 text-xs font-semibold theme-text-secondary"><FileText className="w-4 h-4" /> Notes</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
