import React, { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Loader2, X, CheckCircle, XCircle } from "lucide-react";
import * as api from "../../services/offerLandingPages";

type LandingPage = api.OfferLandingPageRecord;

const inputCls =
  "w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400";
const labelCls = "block text-xs font-semibold theme-text-muted mb-1";

const emptyForm = { name: "", url: "", preview_url: "", is_active: true };
type FormState = typeof emptyForm;

interface Props {
  offerId: number;
}

export function OfferLandingPagesTab({ offerId }: Props) {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LandingPage | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => { load(); }, [offerId]);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      setPages(await api.listLandingPages(offerId));
    } catch (err: any) {
      setLoadError(err.message || "Failed to load landing pages");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(page: LandingPage) {
    setEditing(page);
    setForm({ name: page.name, url: page.url, preview_url: page.preview_url || "", is_active: page.is_active });
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setFormError(null);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const payload: api.LandingPageFormPayload = {
        name: form.name.trim(),
        url: form.url.trim(),
        preview_url: form.preview_url.trim() || null,
        is_active: form.is_active,
      };
      if (editing) {
        const updated = await api.updateLandingPage(offerId, editing.id, payload);
        setPages((p) => p.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        const created = await api.createLandingPage(offerId, payload);
        setPages((p) => [...p, created]);
      }
      closeForm();
    } catch (err: any) {
      setFormError(err.message || "Failed to save");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(page: LandingPage) {
    setDeletingId(page.id);
    setActionError(null);
    try {
      await api.deleteLandingPage(offerId, page.id);
      setPages((p) => p.filter((x) => x.id !== page.id));
    } catch (err: any) {
      setActionError(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggle(page: LandingPage) {
    setTogglingId(page.id);
    try {
      const updated = await api.updateLandingPage(offerId, page.id, { is_active: !page.is_active });
      setPages((p) => p.map((x) => (x.id === updated.id ? updated : x)));
    } catch { }
    finally { setTogglingId(null); }
  }

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="flex items-center justify-between rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {showForm && (
        <div className="theme-bg-card border theme-border rounded-3xl p-6 max-w-xl">
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold theme-text-main">{editing ? "Edit Landing Page" : "Add Landing Page"}</h3>
              <button type="button" onClick={closeForm} className="theme-text-muted hover:theme-text-main"><X className="w-4 h-4" /></button>
            </div>

            {formError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{formError}</div>
            )}

            <div>
              <label className={labelCls}>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputCls} placeholder="e.g. Main Landing Page" />
            </div>
            <div>
              <label className={labelCls}>Landing URL *</label>
              <input name="url" value={form.url} onChange={handleChange} required className={inputCls} placeholder="https://..." />
            </div>
            <div>
              <label className={labelCls}>Preview URL</label>
              <input name="preview_url" value={form.preview_url} onChange={handleChange} className={inputCls} placeholder="https://... (optional)" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="lp_active" name="is_active" checked={form.is_active} onChange={handleChange} className="w-4 h-4 rounded border theme-border accent-cyan-600" />
              <label htmlFor="lp_active" className="text-sm theme-text-main cursor-pointer">Active</label>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeForm} className="rounded-2xl border theme-border px-4 py-2 text-sm font-semibold theme-text-secondary hover:theme-text-main transition">Cancel</button>
              <button type="submit" disabled={formLoading} className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 transition flex items-center gap-2 disabled:opacity-50">
                {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Save Changes" : "Add Page"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold theme-text-main">{pages.length} landing page{pages.length !== 1 ? "s" : ""}</span>
          {!showForm && (
            <button onClick={openCreate} className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 transition flex items-center gap-2">
              <Plus className="w-4 h-4" />Add Page
            </button>
          )}
        </div>

        <div className="rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-5 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">Name</th>
                <th className="px-5 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">URL</th>
                <th className="px-5 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-5 py-4 text-right text-[10px] uppercase tracking-widest text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-400"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</td></tr>
              ) : loadError ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-red-500">{loadError}</td></tr>
              ) : pages.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-400">No landing pages yet. Add your first one.</td></tr>
              ) : pages.map((page) => {
                const isDeleting = deletingId === page.id;
                const isToggling = togglingId === page.id;
                return (
                  <tr key={page.id}>
                    <td className="px-5 py-4 text-sm font-medium theme-text-main whitespace-nowrap">{page.name}</td>
                    <td className="px-5 py-4 max-w-xs">
                      <a href={page.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-600 hover:underline break-all">{page.url}</a>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <button onClick={() => handleToggle(page)} disabled={isToggling || isDeleting} className="inline-flex items-center gap-1 text-xs font-semibold disabled:opacity-50">
                        {isToggling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : page.is_active ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <XCircle className="w-3.5 h-3.5 text-slate-400" />}
                        <span className={page.is_active ? "text-emerald-600" : "text-slate-400"}>{page.is_active ? "Active" : "Inactive"}</span>
                      </button>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                      <button onClick={() => openEdit(page)} disabled={isDeleting || isToggling} className="rounded-full border theme-border px-3 py-1.5 text-xs font-semibold theme-text-secondary hover:theme-text-main transition inline-flex items-center gap-1.5 disabled:opacity-50">
                        <Edit3 className="w-3.5 h-3.5" />Edit
                      </button>
                      <button onClick={() => handleDelete(page)} disabled={isDeleting || isToggling} className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition inline-flex items-center gap-1.5 disabled:opacity-50">
                        {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
