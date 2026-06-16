import React, { useEffect, useState } from "react";
import { listManagers, updateManager, deleteManager, type ManagerRecord } from "../../services/managers";
import { Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";

export function ManagerListView() {
  const [managers, setManagers] = useState<ManagerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editTelegram, setEditTelegram] = useState("");
  const [editTeams, setEditTeams] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    listManagers()
      .then(setManagers)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load managers"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const startEdit = (m: ManagerRecord) => {
    setEditingId(m.id);
    setEditName(m.full_name);
    setEditEmail(m.email);
    setEditTelegram(m.settings?.telegram ?? "");
    setEditTeams(m.settings?.teams ?? "");
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id: string) => {
    setSavingId(id);
    try {
      await updateManager(id, {
        full_name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        telegram: editTelegram.trim() || null,
        teams: editTeams.trim() || null,
      });
      setEditingId(null);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update manager");
    } finally {
      setSavingId(null);
    }
  };

  const toggleActive = async (m: ManagerRecord) => {
    setTogglingId(m.id);
    try {
      await updateManager(m.id, { is_active: !m.is_active });
      load();
    } catch {
      /* ignore */
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteManager(id);
      setConfirmDeleteId(null);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to delete manager");
    }
  };

  const total = managers.length;
  const active = managers.filter((m) => m.is_active).length;
  const disabled = total - active;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Managers</div>
        <h2 className="mt-2 text-2xl font-black theme-text-main">Manager List</h2>
        <p className="mt-2 text-sm theme-text-muted">All affiliate managers with portal access.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[["Total", total, "theme-text-main"], ["Active", active, "text-emerald-600"], ["Disabled", disabled, "text-slate-500"]].map(
          ([label, val, cls]) => (
            <div key={label as string} className="theme-bg-card border theme-border rounded-3xl p-5">
              <div className="text-xs uppercase tracking-widest font-bold theme-text-muted">{label as string}</div>
              <div className={`mt-2 text-3xl font-black ${cls as string}`}>{val as number}</div>
            </div>
          )
        )}
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-sm text-rose-700">{error}</div>
      )}

      {loading ? (
        <div className="theme-bg-card border theme-border rounded-3xl p-8 text-center text-sm theme-text-muted">
          Loading managers…
        </div>
      ) : managers.length === 0 ? (
        <div className="theme-bg-card border theme-border rounded-3xl p-8 text-center text-sm theme-text-muted">
          No managers found. Create one using the Create Manager form.
        </div>
      ) : (
        <div className="rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                {["Name", "Email", "Telegram", "Teams", "Assigned", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-4 text-left text-[10px] uppercase tracking-widest font-bold theme-text-secondary">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {managers.map((m) =>
                editingId === m.id ? (
                  <tr key={m.id} className="bg-cyan-50 dark:bg-cyan-950">
                    <td className="px-4 py-3">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-xl border theme-border px-3 py-2 text-sm theme-text-main bg-white dark:bg-slate-950 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full rounded-xl border theme-border px-3 py-2 text-sm theme-text-main bg-white dark:bg-slate-950 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={editTelegram}
                        onChange={(e) => setEditTelegram(e.target.value)}
                        placeholder="@username"
                        className="w-full rounded-xl border theme-border px-3 py-2 text-sm theme-text-main bg-white dark:bg-slate-950 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={editTeams}
                        onChange={(e) => setEditTeams(e.target.value)}
                        placeholder="user@company.com"
                        className="w-full rounded-xl border theme-border px-3 py-2 text-sm theme-text-main bg-white dark:bg-slate-950 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm theme-text-muted">{m.assigned_count ?? 0}</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveEdit(m.id)}
                          disabled={savingId === m.id}
                          className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 disabled:opacity-50"
                        >
                          {savingId === m.id ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-xs font-semibold theme-text-muted hover:theme-text-main"
                        >
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                    <td className="px-5 py-4 text-sm font-semibold theme-text-main">{m.full_name}</td>
                    <td className="px-5 py-4 text-xs font-mono theme-text-main">{m.email}</td>
                    <td className="px-5 py-4 text-xs theme-text-main">{m.settings?.telegram || <span className="theme-text-muted">—</span>}</td>
                    <td className="px-5 py-4 text-xs theme-text-main">{m.settings?.teams || <span className="theme-text-muted">—</span>}</td>
                    <td className="px-5 py-4 text-sm font-bold theme-text-main">{m.assigned_count ?? 0}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleActive(m)}
                        disabled={togglingId === m.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                          m.is_active
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {m.is_active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {m.is_active ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => startEdit(m)} className="text-cyan-600 hover:text-cyan-700 transition">
                          <Pencil size={15} />
                        </button>
                        {confirmDeleteId === m.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(m.id)}
                              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-xs font-semibold theme-text-muted hover:theme-text-main"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDeleteId(m.id)}
                            className="text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
