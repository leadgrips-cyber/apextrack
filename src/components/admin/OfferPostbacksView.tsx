import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Trash2, Check, X, Copy, ToggleLeft, ToggleRight } from "lucide-react";
import {
  listAdminPostbacks,
  createAdminPostback,
  updateAdminPostback,
  deleteAdminPostback,
  AdminPostbackRow,
} from "../../services/adminPostbacks";
import { listPublishers } from "../../services/publishers";
import { listAdminOffers, OfferRecord } from "../../services/offers";

const VALID_TOKENS = [
  "{click_id}",
  "{offer_id}",
  "{publisher_id}",
  "{payout}",
  "{revenue}",
  "{status}",
  "{sub1}",
  "{sub2}",
  "{sub3}",
  "{sub4}",
  "{sub5}",
];

function TokenBadge({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(token).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900 transition"
      title="Click to copy"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {token}
    </button>
  );
}

interface FormState {
  publisher_id: string;
  callback_url: string;
  is_active: boolean;
}

const EMPTY_FORM: FormState = {
  publisher_id: "",
  callback_url: "",
  is_active: true,
};

export function OfferPostbacksView() {
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [selectedOfferId, setSelectedOfferId] = useState<string>("");

  const [rows, setRows] = useState<AdminPostbackRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [publishers, setPublishers] = useState<{ id: string; email: string; full_name: string }[]>([]);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    listAdminOffers().then(setOffers).catch(() => {});
    listPublishers({ page: 1 })
      .then((r) => setPublishers(r.publishers))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    if (!selectedOfferId) { setRows([]); setTotal(0); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await listAdminPostbacks({
        offerId: Number(selectedOfferId),
        page,
        pageSize: PAGE_SIZE,
      });
      setRows(result.rows);
      setTotal(result.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedOfferId, page]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(row: AdminPostbackRow) {
    setEditId(row.id);
    setForm({
      publisher_id: row.publisher_id,
      callback_url: row.callback_url,
      is_active:    row.is_active,
    });
    setFormError(null);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.publisher_id && !editId) { setFormError("Publisher is required"); return; }
    if (!form.callback_url.trim()) { setFormError("Callback URL is required"); return; }
    if (!selectedOfferId) { setFormError("Select an offer first"); return; }
    setSaving(true);
    setFormError(null);
    try {
      if (editId) {
        await updateAdminPostback(editId, {
          callback_url: form.callback_url.trim(),
          is_active:    form.is_active,
        });
      } else {
        await createAdminPostback({
          publisher_id: form.publisher_id,
          offer_id:     Number(selectedOfferId),
          callback_url: form.callback_url.trim(),
          is_active:    form.is_active,
        });
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

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteAdminPostback(deleteId);
      setDeleteId(null);
      load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  async function toggleActive(row: AdminPostbackRow) {
    try {
      await updateAdminPostback(row.id, { is_active: !row.is_active });
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const selectedOffer = offers.find((o) => String(o.id) === selectedOfferId);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black theme-text-main tracking-tight">Offer Postbacks</h1>
          <p className="text-sm theme-text-muted mt-1">Manage publisher postbacks scoped to a specific offer.</p>
        </div>
        {selectedOfferId && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-500 transition"
          >
            <Plus className="w-4 h-4" />
            Add Postback
          </button>
        )}
      </div>

      {/* Token reference */}
      <div className="rounded-2xl border theme-border bg-slate-50 dark:bg-slate-900 p-4">
        <p className="text-xs theme-text-muted font-semibold uppercase tracking-wider mb-2">Available Tokens</p>
        <div className="flex flex-wrap gap-2">
          {VALID_TOKENS.map((t) => <TokenBadge key={t} token={t} />)}
        </div>
      </div>

      {/* Offer selector */}
      <div className="flex items-center gap-3">
        <select
          value={selectedOfferId}
          onChange={(e) => { setSelectedOfferId(e.target.value); setPage(1); }}
          className="rounded-xl border theme-border bg-white dark:bg-slate-900 theme-text-main text-sm px-3 py-2 min-w-[280px]"
        >
          <option value="">Select an offer…</option>
          {offers.map((o) => (
            <option key={o.id} value={String(o.id)}>{o.name}</option>
          ))}
        </select>
        {selectedOffer && (
          <span className="text-sm theme-text-muted">{total} postback{total !== 1 ? "s" : ""} for this offer</span>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 px-4 py-3 text-sm">{error}</div>
      )}

      {!selectedOfferId ? (
        <div className="rounded-2xl border theme-border bg-slate-50 dark:bg-slate-900 p-12 text-center">
          <p className="text-sm theme-text-muted">Select an offer above to view and manage its postbacks.</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="rounded-2xl border theme-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b theme-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Publisher</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Callback URL</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Active</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Created</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold theme-text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y theme-divide">
                  {loading ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center theme-text-muted text-sm">Loading…</td></tr>
                  ) : rows.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-8 text-center theme-text-muted text-sm">No postbacks for this offer.</td></tr>
                  ) : rows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition">
                      <td className="px-4 py-3">
                        <div className="font-medium theme-text-main">{row.publisher_email}</div>
                        <div className="text-xs theme-text-muted">{row.publisher_name}</div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <span className="font-mono text-xs theme-text-secondary break-all">{row.callback_url}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleActive(row)} title="Toggle active">
                          {row.is_active
                            ? <ToggleRight className="w-5 h-5 text-emerald-500" />
                            : <ToggleLeft  className="w-5 h-5 text-slate-400" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs theme-text-muted">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
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
        </>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border theme-border shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold theme-text-main">
                {editId ? "Edit Postback" : "Add Postback"}
              </h2>
              <button onClick={() => setShowForm(false)} className="theme-text-muted hover:text-rose-400 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedOffer && (
              <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 px-3 py-2 text-xs text-cyan-400">
                Offer: <span className="font-semibold">{selectedOffer.name}</span>
              </div>
            )}

            {!editId && (
              <div>
                <label className="block text-xs font-semibold theme-text-muted uppercase tracking-wider mb-1">Publisher *</label>
                <select
                  value={form.publisher_id}
                  onChange={(e) => setForm((f) => ({ ...f, publisher_id: e.target.value }))}
                  className="w-full rounded-xl border theme-border bg-white dark:bg-slate-800 theme-text-main text-sm px-3 py-2"
                >
                  <option value="">Select publisher…</option>
                  {publishers.map((p) => (
                    <option key={p.id} value={p.id}>{p.email} — {p.full_name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold theme-text-muted uppercase tracking-wider mb-1">Callback URL *</label>
              <input
                type="url"
                value={form.callback_url}
                onChange={(e) => setForm((f) => ({ ...f, callback_url: e.target.value }))}
                placeholder="https://example.com/postback?cid={click_id}&payout={payout}"
                className="w-full rounded-xl border theme-border bg-white dark:bg-slate-800 theme-text-main text-sm px-3 py-2 font-mono"
              />
              <p className="text-xs theme-text-muted mt-1">Use tokens above to inject dynamic values.</p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold theme-text-main">Active</label>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
              >
                {form.is_active
                  ? <ToggleRight className="w-6 h-6 text-emerald-500" />
                  : <ToggleLeft  className="w-6 h-6 text-slate-400" />}
              </button>
            </div>

            {formError && (
              <div className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">{formError}</div>
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
                className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-500 disabled:opacity-50 transition"
              >
                {saving ? "Saving…" : editId ? "Save Changes" : "Create Postback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border theme-border shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-bold theme-text-main">Delete Postback?</h2>
            <p className="text-sm theme-text-muted">This will permanently remove the postback URL. This cannot be undone.</p>
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
