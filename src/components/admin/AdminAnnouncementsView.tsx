import { useEffect, useState, useCallback } from "react";
import { Megaphone, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X, Check } from "lucide-react";
import {
  listAdminAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  AnnouncementRecord,
} from "../../services/announcements";

function fmtDate(s: string) {
  return new Date(s).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

interface FormState {
  title: string;
  message: string;
  is_active: boolean;
}

const EMPTY_FORM: FormState = { title: "", message: "", is_active: true };

export function AdminAnnouncementsView() {
  const [rows, setRows] = useState<AnnouncementRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAdminAnnouncements(page, PAGE_SIZE);
      setRows(result.rows);
      setTotal(result.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(row: AnnouncementRecord) {
    setEditId(row.id);
    setForm({ title: row.title, message: row.message, is_active: row.is_active });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title.trim()) { setFormError("Title is required"); return; }
    if (!form.message.trim()) { setFormError("Message is required"); return; }
    setSaving(true);
    setFormError(null);
    try {
      if (editId) {
        await updateAnnouncement(editId, form);
      } else {
        await createAnnouncement(form);
      }
      setShowForm(false);
      setPage(1);
      load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(row: AnnouncementRecord) {
    try {
      await updateAnnouncement(row.id, { is_active: !row.is_active });
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteAnnouncement(deleteId);
      setDeleteId(null);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black theme-text-main tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-indigo-400" />
            Announcements
          </h1>
          <p className="text-sm theme-text-muted mt-1">
            Broadcast messages displayed on the publisher dashboard. Active announcements are shown to all publishers.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-500 transition"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border theme-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 border-b theme-border">
                <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Message</th>
                <th className="text-center px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Created</th>
                <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Updated</th>
                <th className="text-right px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y theme-divide">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center theme-text-muted text-sm">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center theme-text-muted text-sm">No announcements yet. Create the first one.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold theme-text-main">{row.title}</p>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-xs theme-text-muted truncate" title={row.message}>{row.message}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(row)} title="Toggle active">
                      {row.is_active
                        ? <ToggleRight className="w-5 h-5 text-emerald-500 mx-auto" />
                        : <ToggleLeft className="w-5 h-5 text-slate-400 mx-auto" />}
                    </button>
                    <p className={`text-[10px] mt-0.5 font-mono ${row.is_active ? "text-emerald-500" : "text-slate-400"}`}>
                      {row.is_active ? "Active" : "Inactive"}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs theme-text-muted whitespace-nowrap">{fmtDate(row.created_at)}</td>
                  <td className="px-4 py-3 text-xs theme-text-muted whitespace-nowrap">{fmtDate(row.updated_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(row)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 theme-text-muted transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(row.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-500 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm theme-text-muted">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border theme-border hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            >Prev</button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl border theme-border hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            >Next</button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border theme-border shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold theme-text-main">
                {editId ? "Edit Announcement" : "New Announcement"}
              </h2>
              <button onClick={() => setShowForm(false)} className="theme-text-muted hover:text-rose-400 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold theme-text-muted uppercase tracking-wider mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Scheduled Maintenance Notice"
                className="w-full rounded-xl border theme-border bg-white dark:bg-slate-800 theme-text-main text-sm px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold theme-text-muted uppercase tracking-wider mb-1">Message *</label>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                placeholder="Write the announcement message here…"
                className="w-full rounded-xl border theme-border bg-white dark:bg-slate-800 theme-text-main text-sm px-3 py-2 resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold theme-text-main">Active</label>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
              >
                {form.is_active
                  ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                  : <ToggleLeft className="w-6 h-6 text-slate-400" />}
              </button>
              <span className="text-xs theme-text-muted">
                {form.is_active ? "Visible to publishers" : "Hidden from publishers"}
              </span>
            </div>

            {formError && (
              <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                {formError}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl border theme-border text-sm theme-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-500 disabled:opacity-50 transition"
              >
                {saving ? "Saving…" : (
                  <><Check className="w-4 h-4" />{editId ? "Save Changes" : "Create"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border theme-border shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-bold theme-text-main">Delete Announcement?</h2>
            <p className="text-sm theme-text-muted">
              This will permanently remove the announcement. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl border theme-border text-sm theme-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 disabled:opacity-50 transition"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
