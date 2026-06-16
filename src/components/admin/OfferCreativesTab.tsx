import React, { useEffect, useRef, useState } from "react";
import { Plus, Edit3, Trash2, Loader2, X, Download, Eye, Upload } from "lucide-react";
import * as api from "../../services/offerCreatives";

type Creative = api.OfferCreativeRecord;
type CreativeType = api.CreativeType;

const inputCls =
  "w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400";
const labelCls = "block text-xs font-semibold theme-text-muted mb-1";

const CREATIVE_TYPES: CreativeType[] = ["IMAGE", "BANNER", "LOGO", "HTML", "VIDEO_URL", "TRACKING_LINK"];
const UPLOAD_TYPES: CreativeType[] = ["IMAGE", "BANNER", "LOGO"];

const typeBadge: Record<CreativeType, string> = {
  IMAGE: "bg-blue-100 text-blue-700",
  BANNER: "bg-purple-100 text-purple-700",
  LOGO: "bg-cyan-100 text-cyan-700",
  HTML: "bg-amber-100 text-amber-700",
  VIDEO_URL: "bg-pink-100 text-pink-700",
  TRACKING_LINK: "bg-slate-100 text-slate-700",
};

const emptyForm = {
  name: "",
  creative_type: "IMAGE" as CreativeType,
  file_url: "",
  dimensions: "",
  notes: "",
};
type FormState = typeof emptyForm;

interface Props { offerId: number; }

export function OfferCreativesTab({ offerId }: Props) {
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Creative | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, [offerId]);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      setCreatives(await api.listCreatives(offerId));
    } catch (err: any) {
      setLoadError(err.message || "Failed to load creatives");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setUploadError(null);
    setShowForm(true);
  }

  function openEdit(c: Creative) {
    setEditing(c);
    setForm({ name: c.name, creative_type: c.creative_type as CreativeType, file_url: c.file_url || "", dimensions: c.dimensions || "", notes: c.notes || "" });
    setFormError(null);
    setUploadError(null);
    setShowForm(true);
  }

  function closeForm() { setShowForm(false); setEditing(null); setFormError(null); setUploadError(null); }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await api.uploadCreativeFile(file);
      setForm((p) => ({ ...p, file_url: url }));
    } catch (err: any) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const payload: api.CreativeFormPayload = {
        name: form.name.trim(),
        creative_type: form.creative_type,
        file_url: form.file_url.trim() || null,
        dimensions: form.dimensions.trim() || null,
        notes: form.notes.trim() || null,
      };
      if (editing) {
        const updated = await api.updateCreative(offerId, editing.id, payload);
        setCreatives((p) => p.map((x) => (x.id === updated.id ? updated : x)));
      } else {
        const created = await api.createCreative(offerId, payload);
        setCreatives((p) => [...p, created]);
      }
      closeForm();
    } catch (err: any) {
      setFormError(err.message || "Failed to save");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(c: Creative) {
    setDeletingId(c.id);
    setActionError(null);
    try {
      await api.deleteCreative(offerId, c.id);
      setCreatives((p) => p.filter((x) => x.id !== c.id));
    } catch (err: any) {
      setActionError(err.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  const needsUpload = UPLOAD_TYPES.includes(form.creative_type);

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
              <h3 className="text-sm font-bold theme-text-main">{editing ? "Edit Creative" : "Add Creative"}</h3>
              <button type="button" onClick={closeForm} className="theme-text-muted hover:theme-text-main"><X className="w-4 h-4" /></button>
            </div>

            {formError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{formError}</div>
            )}

            <div>
              <label className={labelCls}>Creative Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required className={inputCls} placeholder="e.g. 300x250 Banner" />
            </div>

            <div>
              <label className={labelCls}>Type *</label>
              <select name="creative_type" value={form.creative_type} onChange={handleChange} className={inputCls}>
                {CREATIVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {needsUpload && (
              <div>
                <label className={labelCls}>File</label>
                {form.file_url ? (
                  <div className="flex items-center gap-3 mt-1">
                    <img src={form.file_url} alt="" className="w-16 h-16 object-contain rounded-xl border theme-border" />
                    <button type="button" onClick={() => setForm((p) => ({ ...p, file_url: "" }))} className="text-xs text-red-500 hover:text-red-700 font-semibold">Remove</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <label className="cursor-pointer rounded-xl border theme-border px-3 py-2 text-xs font-semibold theme-text-secondary hover:theme-text-main transition inline-flex items-center gap-2">
                      {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      {uploading ? "Uploading..." : "Upload File"}
                      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                    <span className="text-xs theme-text-muted">PNG, JPG, WEBP, GIF — max 5MB</span>
                  </div>
                )}
                {uploadError && <p className="mt-1 text-xs text-red-500">{uploadError}</p>}
              </div>
            )}

            {(form.creative_type === "VIDEO_URL" || form.creative_type === "TRACKING_LINK") && (
              <div>
                <label className={labelCls}>{form.creative_type === "VIDEO_URL" ? "Video URL" : "Tracking Link URL"}</label>
                <input name="file_url" value={form.file_url} onChange={handleChange} className={inputCls} placeholder="https://..." />
              </div>
            )}

            <div>
              <label className={labelCls}>Dimensions</label>
              <input name="dimensions" value={form.dimensions} onChange={handleChange} className={inputCls} placeholder="e.g. 300x250, 728x90" />
            </div>

            <div>
              <label className={labelCls}>Notes</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className={inputCls} placeholder="Optional notes..." />
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeForm} className="rounded-2xl border theme-border px-4 py-2 text-sm font-semibold theme-text-secondary hover:theme-text-main transition">Cancel</button>
              <button type="submit" disabled={formLoading} className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 transition flex items-center gap-2 disabled:opacity-50">
                {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Save Changes" : "Add Creative"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold theme-text-main">{creatives.length} creative{creatives.length !== 1 ? "s" : ""}</span>
          {!showForm && (
            <button onClick={openCreate} className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 transition flex items-center gap-2">
              <Plus className="w-4 h-4" />Add Creative
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-400"><Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />Loading...</div>
        ) : loadError ? (
          <div className="py-10 text-center text-sm text-red-500">{loadError}</div>
        ) : creatives.length === 0 ? (
          <div className="rounded-3xl border theme-border bg-white dark:bg-slate-950 px-6 py-12 text-center text-sm text-slate-400">No creatives yet. Add your first creative.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {creatives.map((c) => {
              const isDeleting = deletingId === c.id;
              return (
                <div key={c.id} className="theme-bg-card border theme-border rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold theme-text-main">{c.name}</div>
                      {c.dimensions && <div className="text-xs theme-text-muted mt-0.5">{c.dimensions}</div>}
                    </div>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${typeBadge[c.creative_type as CreativeType] ?? "bg-slate-100 text-slate-700"}`}>
                      {c.creative_type}
                    </span>
                  </div>

                  {c.file_url && UPLOAD_TYPES.includes(c.creative_type as CreativeType) && (
                    <img src={c.file_url} alt={c.name} className="w-full h-24 object-contain rounded-xl border theme-border bg-slate-50 dark:bg-slate-900" />
                  )}

                  {c.file_url && !UPLOAD_TYPES.includes(c.creative_type as CreativeType) && (
                    <a href={c.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-600 hover:underline break-all block">{c.file_url}</a>
                  )}

                  {c.notes && <p className="text-xs theme-text-muted">{c.notes}</p>}

                  <div className="flex items-center gap-2 pt-1">
                    {c.file_url && (
                      <>
                        <a href={c.file_url} target="_blank" rel="noopener noreferrer" className="rounded-full border theme-border px-3 py-1.5 text-xs font-semibold theme-text-secondary hover:theme-text-main transition inline-flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5" />Preview
                        </a>
                        <a href={c.file_url} download className="rounded-full border theme-border px-3 py-1.5 text-xs font-semibold theme-text-secondary hover:theme-text-main transition inline-flex items-center gap-1.5">
                          <Download className="w-3.5 h-3.5" />Download
                        </a>
                      </>
                    )}
                    <button onClick={() => openEdit(c)} className="rounded-full border theme-border px-3 py-1.5 text-xs font-semibold theme-text-secondary hover:theme-text-main transition inline-flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" />Edit
                    </button>
                    <button onClick={() => handleDelete(c)} disabled={isDeleting} className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition inline-flex items-center gap-1.5 disabled:opacity-50">
                      {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
