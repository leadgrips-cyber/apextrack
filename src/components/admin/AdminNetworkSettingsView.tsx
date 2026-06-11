import { useState, useEffect } from "react";
import { Save, Globe } from "lucide-react";
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
};

export function AdminNetworkSettingsView() {
  const [form, setForm] = useState<NetworkSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await updateAdminNetworkSettings({
        network_name: form.network_name,
        tracking_domain: form.tracking_domain,
        login_domain: form.login_domain,
        support_email: form.support_email,
        logo_url: form.logo_url,
        favicon_url: form.favicon_url,
        login_bg_url: form.login_bg_url,
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Globe className="h-6 w-6 text-cyan-500" />
        <h1 className="text-2xl font-bold text-white">Network Settings</h1>
      </div>
      <p className="text-gray-400 text-sm">
        Configure your network's branding and domain settings.
      </p>

      {error && (
        <div className="bg-red-900/40 border border-red-600 rounded-lg p-3 text-red-300 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/40 border border-green-600 rounded-lg p-3 text-green-300 text-sm">
          Settings saved successfully.
        </div>
      )}

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          General
        </h2>

        <Field
          label="Network Name"
          value={form.network_name ?? ""}
          onChange={(v) => handleChange("network_name", v)}
          placeholder="My Affiliate Network"
          required
        />
        <Field
          label="Tracking Domain"
          value={form.tracking_domain ?? ""}
          onChange={(v) => handleChange("tracking_domain", v)}
          placeholder="https://track.example.com"
          required
        />
        <Field
          label="Login Domain"
          value={form.login_domain ?? ""}
          onChange={(v) => handleChange("login_domain", v)}
          placeholder="https://app.example.com"
        />
        <Field
          label="Support Email"
          value={form.support_email ?? ""}
          onChange={(v) => handleChange("support_email", v)}
          placeholder="support@example.com"
          type="email"
        />
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
          Branding
        </h2>

        <Field
          label="Logo URL"
          value={form.logo_url ?? ""}
          onChange={(v) => handleChange("logo_url", v)}
          placeholder="https://cdn.example.com/logo.png"
        />
        {form.logo_url && (
          <img
            src={form.logo_url}
            alt="Logo preview"
            className="h-12 object-contain rounded border border-gray-600"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}

        <Field
          label="Favicon URL"
          value={form.favicon_url ?? ""}
          onChange={(v) => handleChange("favicon_url", v)}
          placeholder="https://cdn.example.com/favicon.ico"
        />
        <Field
          label="Login Background URL"
          value={form.login_bg_url ?? ""}
          onChange={(v) => handleChange("login_bg_url", v)}
          placeholder="https://cdn.example.com/bg.jpg"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          <Save className="h-4 w-4" />
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
  required?: boolean;
  type?: string;
}

function Field({ label, value, onChange, placeholder, required, type = "text" }: FieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-300">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      />
    </div>
  );
}
