import { useState, useEffect } from "react";
import { Save, Globe, CheckCircle2, AlertCircle, Loader2, Users } from "lucide-react";
import {
  getAdminNetworkSettings,
  updateAdminNetworkSettings,
  type NetworkSettings,
} from "../../services/network-settings";

const EMPTY: NetworkSettings = {
  network_name: "",
  tracking_domain: "",
  login_domain: null,
  support_email: null,
  logo_url: null,
  favicon_url: null,
  login_bg_url: null,
  email_verification_required: false,
  auto_approve_publishers: false,
};

const INPUT  = "w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm theme-text-main placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition";
const LABEL  = "block text-[10px] font-bold uppercase tracking-[0.18em] theme-text-muted mb-1.5";

export function AdminNetworkSettingsView() {
  const [form, setForm]       = useState<NetworkSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getAdminNetworkSettings()
      .then((s) => setForm(s))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(field: keyof NetworkSettings, value: string) {
    setForm((prev) => ({ ...prev, [field]: value || null }));
    setSuccess(false);
    setError(null);
  }

  function handleToggle(field: keyof NetworkSettings) {
    setForm((prev) => ({ ...prev, [field]: !prev[field] }));
    setSuccess(false);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await updateAdminNetworkSettings({
        network_name:              form.network_name,
        tracking_domain:           form.tracking_domain,
        login_domain:              form.login_domain,
        support_email:             form.support_email,
        logo_url:                  form.logo_url,
        favicon_url:               form.favicon_url,
        login_bg_url:              form.login_bg_url,
        email_verification_required: form.email_verification_required,
        auto_approve_publishers:   form.auto_approve_publishers,
      });
      setForm(updated);
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-cyan-500" />
        <h1 className="text-xl font-black theme-text-main">Network Settings</h1>
      </div>
      <p className="text-sm theme-text-muted -mt-4">
        Configure your network's branding and domain settings.
      </p>

      {/* Feedback banners */}
      {error && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 flex items-center gap-2 text-sm text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0" />{error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0" />Settings saved successfully.
        </div>
      )}

      {/* General */}
      <div className="theme-bg-card border theme-border rounded-2xl p-5 space-y-5">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted border-b theme-border pb-3">
          General
        </h2>
        <Field label="Network Name *" value={form.network_name ?? ""} onChange={(v) => handleChange("network_name", v)} placeholder="My Affiliate Network" />
        <Field label="Tracking Domain *" value={form.tracking_domain ?? ""} onChange={(v) => handleChange("tracking_domain", v)} placeholder="https://track.example.com" />
        <Field label="Login Domain" value={form.login_domain ?? ""} onChange={(v) => handleChange("login_domain", v)} placeholder="https://app.example.com" />
        <Field label="Support Email" value={form.support_email ?? ""} onChange={(v) => handleChange("support_email", v)} placeholder="support@example.com" type="email" />
      </div>

      {/* Branding */}
      <div className="theme-bg-card border theme-border rounded-2xl p-5 space-y-5">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted border-b theme-border pb-3">
          Branding
        </h2>

        <div>
          <Field label="Logo URL" value={form.logo_url ?? ""} onChange={(v) => handleChange("logo_url", v)} placeholder="https://cdn.example.com/logo.png" />
          {form.logo_url && (
            <div className="mt-3 p-3 rounded-xl border theme-border bg-slate-50 dark:bg-slate-900 inline-block">
              <img
                src={form.logo_url}
                alt="Logo preview"
                className="h-10 object-contain"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            </div>
          )}
        </div>

        <Field label="Favicon URL" value={form.favicon_url ?? ""} onChange={(v) => handleChange("favicon_url", v)} placeholder="https://cdn.example.com/favicon.ico" />

        <div>
          <Field label="Login Background URL" value={form.login_bg_url ?? ""} onChange={(v) => handleChange("login_bg_url", v)} placeholder="https://cdn.example.com/bg.jpg" />
          {form.login_bg_url && (
            <div className="mt-3 rounded-xl overflow-hidden border theme-border" style={{ height: 80 }}>
              <img
                src={form.login_bg_url}
                alt="Login background preview"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Live preview */}
      <div className="theme-bg-card border theme-border rounded-2xl p-5 space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted border-b theme-border pb-3">
          Preview
        </h2>
        <p className="text-xs theme-text-muted">Reflects unsaved values — save to apply.</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            { label: "Network Name",    value: form.network_name },
            { label: "Tracking Domain", value: form.tracking_domain },
            { label: "Login Domain",    value: form.login_domain },
            { label: "Support Email",   value: form.support_email },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] theme-text-muted mb-1">{label}</div>
              <div className="text-sm theme-text-main font-mono break-all">
                {value || <span className="italic theme-text-muted">Not set</span>}
              </div>
            </div>
          ))}
        </div>

        {form.logo_url && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] theme-text-muted mb-1">Logo</div>
            <img
              src={form.logo_url}
              alt="Logo"
              className="h-10 object-contain rounded border theme-border bg-white dark:bg-slate-900 p-1"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          </div>
        )}
      </div>

      {/* Publisher Approval */}
      <div className="theme-bg-card border theme-border rounded-2xl p-5 space-y-5">
        <div className="flex items-center gap-2 border-b theme-border pb-3">
          <Users className="w-4 h-4 text-cyan-500" />
          <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted">
            Publisher Approval
          </h2>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm font-semibold theme-text-main">Auto-Approve Publishers</div>
            <div className="text-xs theme-text-muted mt-0.5">
              When enabled, publishers are activated immediately after email verification.
              When disabled (default), publishers remain <span className="font-semibold text-amber-600 dark:text-amber-400">Pending</span> until an admin manually approves them.
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={!!form.auto_approve_publishers}
            onClick={() => handleToggle("auto_approve_publishers")}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${form.auto_approve_publishers ? "bg-cyan-600" : "bg-slate-300 dark:bg-slate-600"}`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${form.auto_approve_publishers ? "translate-x-5" : "translate-x-0"}`}
            />
          </button>
        </div>

        {form.auto_approve_publishers && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Auto-approve is <strong>ON</strong>. New publishers will be activated immediately after verifying their email with no admin review.</span>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>

    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}

function Field({ label, value, onChange, placeholder, type = "text" }: FieldProps) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={INPUT}
      />
    </div>
  );
}
