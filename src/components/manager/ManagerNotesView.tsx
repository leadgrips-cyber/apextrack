import { useEffect, useState } from "react";
import { getManagerPublishers, savePublisherManagerNotes, type ManagerPublisher } from "../../services/managers";
import { Pencil, Save, X } from "lucide-react";

interface Props {
  managerId: string;
}

export function ManagerNotesView({ managerId }: Props) {
  const [publishers, setPublishers] = useState<ManagerPublisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNotes, setDraftNotes] = useState("");
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

  const startEdit = (p: ManagerPublisher) => {
    setEditingId(p.id);
    setDraftNotes((p.profile_metadata?.manager_notes as string | undefined) ?? "");
    setSaveMsg(null);
  };

  const cancelEdit = () => setEditingId(null);

  const saveNote = async (publisherId: string) => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const savedAt = new Date().toISOString();
      await savePublisherManagerNotes(publisherId, draftNotes, null);
      setPublishers((prev) =>
        prev.map((p) =>
          p.id === publisherId
            ? { ...p, profile_metadata: { ...(p.profile_metadata ?? {}), manager_notes: draftNotes, manager_notes_updated_at: savedAt } }
            : p
        )
      );
      setEditingId(null);
      setSaveMsg("Note saved.");
    } catch (e: unknown) {
      setSaveMsg(e instanceof Error ? e.message : "Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (s: string) => {
    const u = s.toUpperCase();
    if (u === "ACTIVE") return "bg-emerald-100 text-emerald-700";
    if (u === "PENDING") return "bg-amber-100 text-amber-700";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Notes</div>
        <div className="mt-2 text-2xl font-black theme-text-main">Publisher Notes</div>
        <p className="mt-1 text-sm theme-text-muted">Internal notes on your assigned publishers. Visible only to managers and admins.</p>
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-sm text-rose-700">{error}</div>
      )}
      {saveMsg && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-sm text-emerald-800 font-semibold">{saveMsg}</div>
      )}

      {loading ? (
        <div className="theme-bg-card border theme-border rounded-3xl p-8 text-center text-sm theme-text-muted">Loading publishers…</div>
      ) : publishers.length === 0 ? (
        <div className="theme-bg-card border theme-border rounded-3xl p-8 text-center text-sm theme-text-muted">
          No publishers assigned to you yet.
        </div>
      ) : (
        <div className="space-y-4">
          {publishers.map((p) => {
            const notes = (p.profile_metadata?.manager_notes as string | undefined) ?? "";
            const updatedAt = (p.profile_metadata?.manager_notes_updated_at as string | undefined) ?? null;
            const isEditing = editingId === p.id;

            return (
              <div key={p.id} className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-bold theme-text-main">{p.full_name}</div>
                    <div className="text-xs font-mono theme-text-muted">{p.email}</div>
                    <span className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-bold ${statusColor(p.account_status)}`}>
                      {p.account_status}
                    </span>
                  </div>
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(p)}
                      className="shrink-0 p-2 rounded-xl border theme-border theme-text-secondary hover:text-cyan-600 transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>

                <div className="mt-4">
                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        value={draftNotes}
                        onChange={(e) => setDraftNotes(e.target.value)}
                        placeholder="Add your notes about this publisher…"
                        className="w-full px-3 py-2 border theme-border rounded-xl text-sm theme-text-main bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                        rows={4}
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveNote(p.id)}
                          disabled={saving}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-semibold hover:bg-cyan-700 disabled:opacity-50"
                        >
                          <Save size={13} /> {saving ? "Saving…" : "Save Note"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="inline-flex items-center gap-1.5 px-4 py-2 border theme-border theme-text-secondary rounded-xl text-xs font-semibold hover:theme-bg-well"
                        >
                          <X size={13} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : notes ? (
                    <div className="space-y-1">
                      <p className="text-sm theme-text-main whitespace-pre-wrap">{notes}</p>
                      {updatedAt && (
                        <p className="text-[10px] theme-text-muted font-mono">
                          Last updated: {new Date(updatedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm theme-text-muted italic">No notes yet. Click edit to add one.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
