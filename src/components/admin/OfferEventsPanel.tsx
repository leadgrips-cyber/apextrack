import React, { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Loader2, X, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import * as eventsApi from "../../services/offerEvents";

type OfferEventRecord = eventsApi.OfferEventRecord;

interface Props {
  offerId: number;
  offerName: string;
  onBack: () => void;
  embedded?: boolean;
}

const emptyForm = {
  event_token: "",
  event_name: "",
  approval_mode: "AUTO_APPROVE" as "AUTO_APPROVE" | "MANUAL_REVIEW",
  is_active: true,
};

type FormState = typeof emptyForm;

const inputCls =
  "w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400";
const labelCls = "block text-xs font-semibold theme-text-muted mb-1";

export function OfferEventsPanel({ offerId, offerName, onBack, embedded = false }: Props) {
  const [events, setEvents] = useState<OfferEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<OfferEventRecord | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, [offerId]);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await eventsApi.listOfferEvents(offerId);
      setEvents(data);
    } catch (err: any) {
      setLoadError(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingEvent(null);
    setForm(emptyForm);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(ev: OfferEventRecord) {
    setEditingEvent(ev);
    setForm({
      event_token: ev.event_token,
      event_name: ev.event_name,
      approval_mode: ev.approval_mode,
      is_active: ev.is_active,
    });
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingEvent(null);
    setFormError(null);
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const payload: eventsApi.OfferEventFormPayload = {
        event_token: form.event_token.trim(),
        event_name: form.event_name.trim(),
        approval_mode: form.approval_mode,
        is_active: form.is_active,
      };
      if (editingEvent) {
        const updated = await eventsApi.updateOfferEvent(offerId, editingEvent.id, payload);
        setEvents((prev) => prev.map((ev) => (ev.id === updated.id ? updated : ev)));
      } else {
        const created = await eventsApi.createOfferEvent(offerId, payload);
        setEvents((prev) => [...prev, created]);
      }
      closeForm();
    } catch (err: any) {
      setFormError(err.message || "Failed to save event");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(ev: OfferEventRecord) {
    setDeletingId(ev.id);
    setDeleteError(null);
    try {
      await eventsApi.deleteOfferEvent(offerId, ev.id);
      setEvents((prev) => prev.filter((e) => e.id !== ev.id));
    } catch (err: any) {
      setDeleteError(err.message || "Failed to delete event");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(ev: OfferEventRecord) {
    setTogglingId(ev.id);
    try {
      const updated = await eventsApi.updateOfferEvent(offerId, ev.id, {
        is_active: !ev.is_active,
      });
      setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    } catch {
      // swallow — user can retry
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header — hidden when embedded inside OfferDetailView tabs */}
      {!embedded && (
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="rounded-xl border theme-border px-3 py-2 text-xs font-semibold theme-text-secondary hover:theme-text-main transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Offers
          </button>
          <div>
            <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Event Manager</div>
            <div className="mt-1 text-2xl font-black theme-text-main">{offerName}</div>
          </div>
        </div>
      )}

      {deleteError && (
        <div className="flex items-center justify-between rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Inline form */}
      {showForm && (
        <div className="max-w-xl theme-bg-card border theme-border rounded-3xl shadow-sm">
          <form onSubmit={handleSave} className="p-6 space-y-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold theme-text-main">
                {editingEvent ? "Edit Event" : "Create Event"}
              </h2>
              <button type="button" onClick={closeForm} className="theme-text-muted hover:theme-text-main">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div>
              <label className={labelCls}>
                Event Token * <span className="font-normal">(lowercase letters, numbers, underscores)</span>
              </label>
              <input
                name="event_token"
                value={form.event_token}
                onChange={handleFormChange}
                required
                pattern="[a-z0-9_]+"
                className={inputCls}
                placeholder="e.g. lead, ftd, sale, deposit, registration"
                disabled={!!editingEvent}
              />
              {editingEvent && (
                <p className="mt-1 text-xs theme-text-muted">Token cannot be changed after creation.</p>
              )}
            </div>

            <div>
              <label className={labelCls}>Event Name *</label>
              <input
                name="event_name"
                value={form.event_name}
                onChange={handleFormChange}
                required
                className={inputCls}
                placeholder="e.g. First Time Deposit"
              />
            </div>

            <div>
              <label className={labelCls}>Approval Mode</label>
              <select
                name="approval_mode"
                value={form.approval_mode}
                onChange={handleFormChange}
                className={inputCls}
              >
                <option value="AUTO_APPROVE">Auto Approve — Credited immediately</option>
                <option value="MANUAL_REVIEW">Manual Review — Admin reviews first</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active_check"
                name="is_active"
                checked={form.is_active}
                onChange={handleFormChange}
                className="rounded border theme-border w-4 h-4 accent-cyan-600"
              />
              <label htmlFor="is_active_check" className="text-sm theme-text-main cursor-pointer">
                Event is active (accepts postbacks)
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-2xl border theme-border px-5 py-2.5 text-sm font-semibold theme-text-secondary hover:theme-text-main transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 transition flex items-center gap-2 disabled:opacity-50"
              >
                {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingEvent ? "Save Changes" : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold theme-text-main">
            {events.length} event{events.length !== 1 ? "s" : ""} defined
          </h2>
          {!showForm && (
            <button
              onClick={openCreate}
              className="rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Event
            </button>
          )}
        </div>

        <div className="rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-5 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">Token</th>
                <th className="px-5 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">Name</th>
                <th className="px-5 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">Approval</th>
                <th className="px-5 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-5 py-4 text-right text-[10px] uppercase tracking-widest text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Loading events...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-red-500">
                    {loadError}
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-slate-400">
                    No events defined for this offer yet. Add your first event.
                  </td>
                </tr>
              ) : (
                events.map((ev) => {
                  const isDeleting = deletingId === ev.id;
                  const isToggling = togglingId === ev.id;
                  return (
                    <tr key={ev.id}>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-0.5">
                          {ev.event_token}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm theme-text-main">{ev.event_name}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            ev.approval_mode === "AUTO_APPROVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {ev.approval_mode === "AUTO_APPROVE" ? "Auto" : "Manual"}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(ev)}
                          disabled={isToggling || isDeleting}
                          className="inline-flex items-center gap-1 text-xs font-semibold transition disabled:opacity-50"
                          title={ev.is_active ? "Click to disable" : "Click to enable"}
                        >
                          {isToggling ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : ev.is_active ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          )}
                          <span className={ev.is_active ? "text-emerald-600" : "text-slate-400"}>
                            {ev.is_active ? "Active" : "Disabled"}
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => openEdit(ev)}
                          disabled={isDeleting || isToggling}
                          className="rounded-full border theme-border px-3 py-1.5 text-xs font-semibold theme-text-secondary hover:theme-text-main transition inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ev)}
                          disabled={isDeleting || isToggling}
                          className="rounded-full bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
