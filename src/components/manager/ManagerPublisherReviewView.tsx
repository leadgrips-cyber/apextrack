import { useEffect, useMemo, useState } from "react";
import { Search, Eye, CheckCircle, AlertCircle, HelpCircle, MessageSquare } from "lucide-react";
import {
  getManagerPublishers,
  savePublisherManagerNotes,
  type ManagerPublisher,
} from "../../services/managers";

interface Props {
  managerId: string;
}

type Recommendation = "Approve" | "Reject" | "Need More Information" | null;

function getRecommendation(p: ManagerPublisher): Recommendation {
  const r = (p.profile_metadata?.manager_recommendation as string | undefined) ?? null;
  if (r === "Approve" || r === "Reject" || r === "Need More Information") return r;
  return null;
}

function getNotes(p: ManagerPublisher): string {
  return (p.profile_metadata?.manager_notes as string | undefined) ?? "";
}

const statusClasses: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-rose-100 text-rose-700",
};

const tabs = ["All", "Pending Review", "Recommended Approvals", "Recommended Rejections", "Need More Information"] as const;
type Tab = typeof tabs[number];

function publisherTab(p: ManagerPublisher): Tab {
  const r = getRecommendation(p);
  if (r === "Approve") return "Recommended Approvals";
  if (r === "Reject") return "Recommended Rejections";
  if (r === "Need More Information") return "Need More Information";
  return "Pending Review";
}

export function ManagerPublisherReviewView({ managerId }: Props) {
  const [publishers, setPublishers] = useState<ManagerPublisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [selected, setSelected] = useState<ManagerPublisher | null>(null);
  const [draftNotes, setDraftNotes] = useState("");
  const [draftRec, setDraftRec] = useState<Recommendation>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const load = () => {
    if (!managerId) return;
    setLoading(true);
    getManagerPublishers(managerId)
      .then(setPublishers)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load publishers"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [managerId]);

  const filtered = useMemo(() => {
    return publishers.filter((p) => {
      const matchSearch = `${p.full_name} ${p.email} ${p.company_name ?? ""}`.toLowerCase().includes(query.toLowerCase());
      const matchTab = activeTab === "All" || publisherTab(p) === activeTab;
      return matchSearch && matchTab;
    });
  }, [publishers, query, activeTab]);

  const tabCount = (tab: Tab) =>
    tab === "All" ? publishers.length : publishers.filter((p) => publisherTab(p) === tab).length;

  const openReview = (p: ManagerPublisher) => {
    setSelected(p);
    setDraftNotes(getNotes(p));
    setDraftRec(getRecommendation(p));
    setSaveMsg(null);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const savedAt = new Date().toISOString();
      await savePublisherManagerNotes(selected.id, draftNotes, draftRec);
      setSaveMsg("Review saved.");
      setPublishers((prev) =>
        prev.map((p) =>
          p.id === selected.id
            ? {
                ...p,
                profile_metadata: {
                  ...(p.profile_metadata ?? {}),
                  manager_notes: draftNotes,
                  manager_recommendation: draftRec,
                  manager_notes_updated_at: savedAt,
                },
              }
            : p
        )
      );
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : "Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Publisher Review</div>
          <div className="mt-2 text-2xl font-black theme-text-main">Assigned Affiliates</div>
          <p className="mt-1 text-sm theme-text-muted">Review assigned publishers and record recommendations. Final decisions are made by Admin.</p>
        </div>
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search publishers"
            className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-950 px-10 py-3 text-sm theme-text-main focus:outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-2xl font-semibold text-sm whitespace-nowrap transition-colors ${
              activeTab === tab ? "bg-cyan-600 text-white" : "border theme-border theme-text-secondary hover:theme-bg-card"
            }`}
          >
            {tab}
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-white/20 rounded-full text-xs">
              {tabCount(tab)}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-sm text-rose-700">{error}</div>
      )}

      {loading ? (
        <div className="theme-bg-card border theme-border rounded-3xl p-8 text-center text-sm theme-text-muted">Loading publishers…</div>
      ) : (
        <div className="overflow-x-auto rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {["Publisher", "Status", "Recommendation", "Notes", "Joined", "Action"].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-[10px] uppercase tracking-widest theme-text-secondary font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm theme-text-muted">
                    No publishers in this category.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const rec = getRecommendation(p);
                  const notes = getNotes(p);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                      <td className="px-6 py-5">
                        <div className="font-semibold theme-text-main">{p.full_name}</div>
                        <div className="text-xs font-mono theme-text-muted">{p.email}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[p.account_status] ?? "bg-slate-100 text-slate-700"}`}>
                          {p.account_status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {rec ? (
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${rec === "Approve" ? "bg-emerald-100 text-emerald-700" : rec === "Reject" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>
                            {rec === "Approve" && <CheckCircle className="w-3 h-3" />}
                            {rec === "Reject" && <AlertCircle className="w-3 h-3" />}
                            {rec === "Need More Information" && <HelpCircle className="w-3 h-3" />}
                            {rec}
                          </span>
                        ) : (
                          <span className="text-xs theme-text-muted italic">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-5 max-w-xs">
                        <p className="text-xs theme-text-muted truncate">{notes || <span className="italic">None</span>}</p>
                      </td>
                      <td className="px-6 py-5 text-xs font-mono theme-text-muted">
                        {new Date(p.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => openReview(p)}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-600 hover:text-cyan-700"
                        >
                          <Eye className="w-4 h-4" /> Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b theme-border sticky top-0 bg-white dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black theme-text-main">{selected.full_name}</h2>
                  <p className="text-sm theme-text-muted mt-0.5">{selected.email}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-lg theme-text-muted hover:theme-text-main">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="theme-bg-well border theme-border rounded-xl p-3">
                  <p className="text-xs theme-text-secondary mb-1">Status</p>
                  <p className="font-semibold theme-text-main">{selected.account_status}</p>
                </div>
                <div className="theme-bg-well border theme-border rounded-xl p-3">
                  <p className="text-xs theme-text-secondary mb-1">Country</p>
                  <p className="font-semibold theme-text-main">{selected.country_code ?? "—"}</p>
                </div>
                <div className="theme-bg-well border theme-border rounded-xl p-3">
                  <p className="text-xs theme-text-secondary mb-1">Affiliate Code</p>
                  <p className="font-mono text-sm theme-text-main">{selected.affiliate_code}</p>
                </div>
                <div className="theme-bg-well border theme-border rounded-xl p-3">
                  <p className="text-xs theme-text-secondary mb-1">Registered</p>
                  <p className="font-mono text-sm theme-text-main">{new Date(selected.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="border-t theme-border pt-5">
                <h3 className="text-sm font-bold theme-text-main mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Manager Review
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-2">Notes</label>
                    <textarea
                      value={draftNotes}
                      onChange={(e) => setDraftNotes(e.target.value)}
                      placeholder="Add your review notes…"
                      className="w-full px-3 py-2 theme-bg-well border theme-border rounded-xl text-sm theme-text-main focus:outline-none resize-none"
                      rows={4}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-2">Recommendation</label>
                    <select
                      value={draftRec ?? ""}
                      onChange={(e) => setDraftRec((e.target.value as Recommendation) || null)}
                      className="w-full px-3 py-2 theme-bg-well border theme-border rounded-xl text-sm theme-text-main focus:outline-none"
                    >
                      <option value="">No recommendation yet</option>
                      <option value="Approve">Approve</option>
                      <option value="Reject">Reject</option>
                      <option value="Need More Information">Need More Information</option>
                    </select>
                  </div>
                  <p className="text-xs theme-text-muted bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
                    Manager notes and recommendations are advisory. Final decisions are made by Admin.
                  </p>
                  {(selected.profile_metadata?.manager_notes_updated_at as string | undefined) && (
                    <p className="text-[10px] font-mono theme-text-muted">
                      Last updated: {new Date(selected.profile_metadata?.manager_notes_updated_at as string).toLocaleString()}
                    </p>
                  )}
                  {saveMsg && (
                    <p className="text-xs font-semibold text-emerald-700">{saveMsg}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-xl text-sm font-semibold hover:bg-cyan-700 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save Review"}
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-xl text-sm font-semibold hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
