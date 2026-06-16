import React, { useEffect, useState } from "react";
import { Gauge, Loader2, Save, X, AlertCircle, ToggleLeft, ToggleRight } from "lucide-react";
import * as api from "../../services/offerCaps";
import type { OfferCapsRecord } from "../../services/offerCaps";

interface Props {
  offerId: number;
}

interface FormState {
  daily_click_cap:       string;
  hourly_click_cap:      string;
  daily_conversion_cap:  string;
  hourly_conversion_cap: string;
  is_active:             boolean;
}

function capsToForm(caps: OfferCapsRecord | null): FormState {
  return {
    daily_click_cap:       caps?.daily_click_cap       != null ? String(caps.daily_click_cap)       : "",
    hourly_click_cap:      caps?.hourly_click_cap      != null ? String(caps.hourly_click_cap)      : "",
    daily_conversion_cap:  caps?.daily_conversion_cap  != null ? String(caps.daily_conversion_cap)  : "",
    hourly_conversion_cap: caps?.hourly_conversion_cap != null ? String(caps.hourly_conversion_cap) : "",
    is_active:             caps?.is_active ?? true,
  };
}

function parseField(v: string): number | null {
  if (!v.trim()) return null;
  const n = Number(v);
  if (Number.isNaN(n) || n < 0) return null;
  return Math.floor(n);
}

export function OfferCappingTab({ offerId }: Props) {
  const [caps, setCaps]         = useState<OfferCapsRecord | null>(null);
  const [form, setForm]         = useState<FormState>(capsToForm(null));
  const [loading, setLoading]   = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved]       = useState(false);

  useEffect(() => { load(); }, [offerId]);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.getCaps(offerId);
      setCaps(data);
      setForm(capsToForm(data));
    } catch (err: any) {
      setLoadError(err.message || "Failed to load capping settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaved(false);

    const daily_click_cap       = parseField(form.daily_click_cap);
    const hourly_click_cap      = parseField(form.hourly_click_cap);
    const daily_conversion_cap  = parseField(form.daily_conversion_cap);
    const hourly_conversion_cap = parseField(form.hourly_conversion_cap);

    try {
      const updated = await api.saveCaps(offerId, {
        daily_click_cap,
        hourly_click_cap,
        daily_conversion_cap,
        hourly_conversion_cap,
        is_active: form.is_active,
      });
      setCaps(updated);
      setForm(capsToForm(updated));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save caps");
    } finally {
      setSaving(false);
    }
  }

  function setField(key: keyof FormState, value: string | boolean) {
    setForm(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        Loading capping settings…
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="py-8 text-center text-sm text-red-500">{loadError}</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Gauge className="w-4 h-4 text-cyan-500" />
        <h2 className="text-sm font-bold theme-text-main">Offer Caps</h2>
        {caps?.is_active ? (
          <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">Enforced</span>
        ) : (
          <span className="rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 text-[10px] font-bold">Disabled</span>
        )}
      </div>

      <div className="rounded-2xl border theme-border bg-amber-50 dark:bg-amber-900/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-400 flex gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          Caps are enforced in real-time at the tracking engine level. When a cap is reached, the click or conversion is
          rejected and <strong>not stored</strong>. Leave a field empty or 0 to disable that specific cap.
          Capping must be <strong>Enabled</strong> to take effect.
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Enable / Disable toggle */}
        <div className="rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold theme-text-main">Capping Enforcement</p>
              <p className="text-xs theme-text-muted mt-0.5">
                {form.is_active
                  ? "Active — caps below will be enforced on every click and conversion."
                  : "Disabled — all caps are bypassed regardless of values."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setField("is_active", !form.is_active)}
              className="ml-4 flex-shrink-0"
              title={form.is_active ? "Disable capping" : "Enable capping"}
            >
              {form.is_active
                ? <ToggleRight className="w-8 h-8 text-emerald-500" />
                : <ToggleLeft className="w-8 h-8 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Click Caps */}
        <div className="rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest theme-text-muted mb-4">Click Caps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CapField
              label="Daily Click Cap"
              description="Max clicks per calendar day (00:00–23:59 server time)"
              value={form.daily_click_cap}
              onChange={v => setField("daily_click_cap", v)}
              disabled={!form.is_active}
            />
            <CapField
              label="Hourly Click Cap"
              description="Max clicks per rolling clock hour"
              value={form.hourly_click_cap}
              onChange={v => setField("hourly_click_cap", v)}
              disabled={!form.is_active}
            />
          </div>
        </div>

        {/* Conversion Caps */}
        <div className="rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest theme-text-muted mb-4">Conversion Caps</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <CapField
              label="Daily Conversion Cap"
              description="Max conversions per calendar day (excludes REJECTED)"
              value={form.daily_conversion_cap}
              onChange={v => setField("daily_conversion_cap", v)}
              disabled={!form.is_active}
            />
            <CapField
              label="Hourly Conversion Cap"
              description="Max conversions per rolling clock hour"
              value={form.hourly_conversion_cap}
              onChange={v => setField("hourly_conversion_cap", v)}
              disabled={!form.is_active}
            />
          </div>
        </div>

        {/* Error / success */}
        {saveError && (
          <div className="flex items-center justify-between rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <span>{saveError}</span>
            <button type="button" onClick={() => setSaveError(null)}><X className="w-4 h-4" /></button>
          </div>
        )}
        {saved && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
            Capping settings saved successfully.
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-cyan-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-cyan-500 transition flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Caps
        </button>
      </form>
    </div>
  );
}

function CapField({
  label, description, value, onChange, disabled,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold theme-text-main mb-0.5">{label}</label>
      <p className="text-[11px] theme-text-muted mb-1.5">{description}</p>
      <input
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Unlimited"
        className="w-full rounded-xl border theme-border bg-white dark:bg-slate-950 px-3 py-2 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"
      />
    </div>
  );
}
