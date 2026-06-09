import { managerActivity } from "./managerDemoData";
import { MessageSquare, Edit3 } from "lucide-react";

export function ManagerCommunicationView() {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Communication Center</div>
        <div className="mt-2 text-2xl font-black theme-text-main">Publisher messages and internal notes</div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="col-span-1 theme-bg-card border theme-border rounded-3xl p-4">
          <div className="text-sm font-semibold theme-text-main">Conversations</div>
          <div className="mt-4 space-y-3">
            {managerActivity.map((m) => (
              <div key={m.id} className="p-3 rounded-xl theme-bg-well border theme-border">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{m.title}</div>
                  <div className="text-xs theme-text-muted">{m.timestamp}</div>
                </div>
                <div className="mt-1 text-sm theme-text-muted">{m.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2 theme-bg-card border theme-border rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold theme-text-main">Conversation Preview</div>
            <button className="rounded-full border theme-border px-3 py-2 text-xs font-semibold theme-text-secondary inline-flex items-center gap-2"><Edit3 className="w-4 h-4" /> Add Note</button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border theme-border">
              <div className="text-sm font-semibold">Manager</div>
              <div className="mt-1 text-sm theme-text-muted">Please provide the advertiser VAT documents for the EU campaign.</div>
              <div className="mt-2 text-xs theme-text-muted">2 hours ago</div>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border theme-border">
              <div className="text-sm font-semibold">Publisher</div>
              <div className="mt-1 text-sm theme-text-muted">Files uploaded to the portal, see attachment.</div>
              <div className="mt-2 text-xs theme-text-muted">1 hour ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
