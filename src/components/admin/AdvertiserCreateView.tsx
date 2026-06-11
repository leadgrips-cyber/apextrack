import React, { useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import * as advertisersApi from "../../services/advertisers";

interface AdvertiserCreateViewProps {
  onSuccess?: (advertiser: advertisersApi.AdvertiserRecord) => void;
  onCancel?: () => void;
}

const emptyForm = {
  company_name: "",
  contact_name: "",
  email: "",
  phone: "",
  website: "",
  status: "ACTIVE",
  notes: "",
};

type FormState = typeof emptyForm;

export function AdvertiserCreateView({ onSuccess, onCancel }: AdvertiserCreateViewProps) {
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const inputCls =
    "w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400";
  const labelCls = "block text-xs font-semibold theme-text-muted mb-1";

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const advertiser = await advertisersApi.createAdvertiser({
        company_name: formData.company_name.trim(),
        contact_name: formData.contact_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        website: formData.website.trim() || undefined,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      });
      setSaved(true);
      if (onSuccess) onSuccess(advertiser);
    } catch (err: any) {
      setError(err.message || "Failed to create advertiser");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {onCancel && (
          <button
            onClick={onCancel}
            className="rounded-xl border theme-border px-3 py-2 text-xs font-semibold theme-text-secondary hover:theme-text-main transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Advertisers</div>
          <div className="mt-1 text-2xl font-black theme-text-main">Create Advertiser</div>
        </div>
      </div>

      <div className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm max-w-2xl">
        {saved ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <span className="text-emerald-600 text-2xl font-bold">✓</span>
            </div>
            <p className="font-semibold theme-text-main">Advertiser created successfully.</p>
            <button
              onClick={() => { setFormData(emptyForm); setSaved(false); setError(null); }}
              className="rounded-2xl border theme-border px-4 py-2 text-sm font-semibold theme-text-secondary hover:theme-text-main transition"
            >
              Create Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>Company Name *</label>
                <input
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                  className={inputCls}
                  placeholder="Acme Corp"
                />
              </div>

              <div>
                <label className={labelCls}>Contact Name *</label>
                <input
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  required
                  className={inputCls}
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className={labelCls}>Email *</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputCls}
                  placeholder="contact@advertiser.com"
                />
              </div>

              <div>
                <label className={labelCls}>Phone</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="+1 555 000 0000"
                />
              </div>

              <div>
                <label className={labelCls}>Website</label>
                <input
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="https://advertiser.com"
                />
              </div>

              <div>
                <label className={labelCls}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputCls}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAUSED">Paused</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Notes (internal only)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className={inputCls}
                  placeholder="Internal notes about this advertiser..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="rounded-2xl border theme-border px-5 py-2.5 text-sm font-semibold theme-text-secondary hover:theme-text-main transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Advertiser
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
