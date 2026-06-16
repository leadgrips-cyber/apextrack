import React, { useEffect, useState } from "react";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import * as api from "../../services/offerCategories";
import type { CategoryRecord } from "../../services/offerCategories";

const inputCls =
  "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400";

export function OfferCategoriesView() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Create form
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Delete confirm
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      setCategories(await api.listCategories(false));
    } catch (err: any) {
      setLoadError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await api.createCategory(newName.trim());
      setCategories(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
    } catch (err: any) {
      setCreateError(err.message || "Failed to create category");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(cat: CategoryRecord) {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditError(null);
  }

  async function handleSaveEdit(id: string) {
    if (!editName.trim()) { setEditError("Name is required"); return; }
    setSavingId(id);
    setEditError(null);
    try {
      const updated = await api.updateCategory(id, { name: editName.trim() });
      setCategories(prev =>
        prev.map(c => c.id === id ? updated : c).sort((a, b) => a.name.localeCompare(b.name))
      );
      setEditingId(null);
    } catch (err: any) {
      setEditError(err.message || "Failed to save");
    } finally {
      setSavingId(null);
    }
  }

  async function handleToggle(cat: CategoryRecord) {
    setSavingId(cat.id);
    try {
      const updated = await api.updateCategory(cat.id, { is_active: !cat.is_active });
      setCategories(prev => prev.map(c => c.id === cat.id ? updated : c));
    } catch {
      // toggle reverts automatically on re-render
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      setLoadError(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  const active = categories.filter(c => c.is_active).length;
  const inactive = categories.length - active;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Offer Management</div>
        <h2 className="mt-1 text-2xl font-black theme-text-main">Offer Categories</h2>
        <p className="mt-1 text-xs theme-text-muted">
          Manage categories used to classify offers. Publishers filter by active categories in the marketplace.
        </p>
      </div>

      {loadError && (
        <div className="flex items-center justify-between rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <span>{loadError}</span>
          <button onClick={() => setLoadError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: categories.length, color: "text-slate-700 dark:text-slate-200" },
          { label: "Active", value: active, color: "text-emerald-600" },
          { label: "Disabled", value: inactive, color: "text-slate-400" },
        ].map(s => (
          <div key={s.label} className="theme-bg-card border theme-border rounded-2xl p-4 text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-[10px] uppercase tracking-widest theme-text-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Create form */}
      <div className="theme-bg-card border theme-border rounded-3xl p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest theme-text-muted mb-4 flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> Add Category
        </h3>
        <form onSubmit={handleCreate} className="flex gap-3 items-start">
          <div className="flex-1">
            <input
              type="text"
              value={newName}
              onChange={e => { setNewName(e.target.value); setCreateError(null); }}
              placeholder="Category name (e.g. Finance, Health, iGaming)"
              maxLength={128}
              className={inputCls}
            />
            {createError && <p className="mt-1 text-xs text-red-500">{createError}</p>}
          </div>
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="rounded-2xl bg-cyan-600 px-5 py-2 text-sm font-bold text-white hover:bg-cyan-500 transition flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Category
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="theme-bg-card border theme-border rounded-3xl overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              {["Name", "Slug", "Status", "Created", "Actions"].map(h => (
                <th key={h} className="px-5 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading…
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center">
                  <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No categories yet. Add your first category above.</p>
                </td>
              </tr>
            ) : (
              categories.map(cat => {
                const isEditing = editingId === cat.id;
                const isSaving = savingId === cat.id;
                const isConfirmingDelete = confirmDeleteId === cat.id;

                return (
                  <tr key={cat.id} className={`transition-colors ${!cat.is_active ? "opacity-50" : ""}`}>
                    <td className="px-5 py-4">
                      {isEditing ? (
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={editName}
                            onChange={e => { setEditName(e.target.value); setEditError(null); }}
                            maxLength={128}
                            className={`${inputCls} text-xs`}
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === "Enter") handleSaveEdit(cat.id);
                              if (e.key === "Escape") cancelEdit();
                            }}
                          />
                          {editError && <p className="text-[11px] text-red-500">{editError}</p>}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                          <span className="text-sm font-semibold theme-text-main">{cat.name}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <code className="text-xs text-slate-400 font-mono">{cat.slug}</code>
                    </td>

                    <td className="px-5 py-4">
                      {cat.is_active ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">Active</span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 text-[10px] font-bold">Disabled</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs theme-text-muted whitespace-nowrap">
                      {new Date(cat.created_at).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4">
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-600 font-semibold">Delete?</span>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            disabled={deletingId === cat.id}
                            className="rounded-lg bg-red-500 text-white px-2 py-1 text-[10px] font-bold hover:bg-red-600 transition disabled:opacity-50"
                          >
                            {deletingId === cat.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Confirm"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-semibold theme-text-muted hover:theme-text-main transition"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : isEditing ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSaveEdit(cat.id)}
                            disabled={isSaving}
                            className="rounded-xl p-1.5 text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50"
                            title="Save"
                          >
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-xl p-1.5 theme-text-muted hover:theme-text-main transition"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => startEdit(cat)}
                            className="rounded-xl p-1.5 theme-text-muted hover:text-cyan-600 hover:bg-cyan-50 transition"
                            title="Edit name"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggle(cat)}
                            disabled={isSaving}
                            className="rounded-xl p-1.5 theme-text-muted hover:theme-text-main transition disabled:opacity-50"
                            title={cat.is_active ? "Disable" : "Enable"}
                          >
                            {isSaving
                              ? <Loader2 className="w-4 h-4 animate-spin" />
                              : cat.is_active
                              ? <ToggleRight className="w-4 h-4 text-emerald-500" />
                              : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(cat.id)}
                            className="rounded-xl p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          Disabling a category hides it from the publisher marketplace filter and offer creation dropdown.
          Existing offers retain their category value. Deleting a category does <strong>not</strong> change existing offers.
        </span>
      </div>
    </div>
  );
}
