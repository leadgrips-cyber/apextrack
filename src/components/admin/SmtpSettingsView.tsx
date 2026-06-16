import { useState, useEffect } from "react";
import { Settings2, Save, Send, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, RefreshCw } from "lucide-react";
import {
  getSmtpSettings,
  updateSmtpSettings,
  sendTestEmail,
  type SmtpSettings,
} from "../../services/mailer";

const INPUT = "w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:opacity-50";
const LABEL = "block text-[10px] font-bold uppercase tracking-[0.18em] theme-text-muted mb-1.5";

export function SmtpSettingsView() {
  const [form, setForm] = useState<Omit<SmtpSettings, 'id' | 'updated_at' | 'password_is_set'>>({
    host: '', port: 587, username: '', password: '',
    from_name: '', from_email: '', reply_to: '',
    secure: false, is_enabled: false,
  });
  const [passwordIsSet, setPasswordIsSet] = useState(false);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [showPw, setShowPw]         = useState(false);
  const [saveMsg, setSaveMsg]       = useState<{ ok: boolean; text: string } | null>(null);
  const [testTo, setTestTo]         = useState("");
  const [testing, setTesting]       = useState(false);
  const [testMsg, setTestMsg]       = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    getSmtpSettings()
      .then((s) => {
        setPasswordIsSet(s.password_is_set ?? false);
        setForm({
          host: s.host, port: s.port, username: s.username,
          // Keep password field empty — user must type a new value to change it
          password: '',
          from_name: s.from_name, from_email: s.from_email, reply_to: s.reply_to,
          secure: s.secure, is_enabled: s.is_enabled,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (key: keyof typeof form, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  async function handleSave() {
    setSaving(true);
    setSaveMsg(null);
    try {
      // Only send password if the admin typed a new value (non-empty)
      const payload = form.password
        ? form
        : { ...form, password: undefined };
      const updated = await updateSmtpSettings(payload);
      setPasswordIsSet(updated.password_is_set ?? false);
      setForm((f) => ({ ...f, password: '' }));
      setSaveMsg({ ok: true, text: "SMTP settings saved successfully." });
    } catch (err) {
      setSaveMsg({ ok: false, text: err instanceof Error ? err.message : "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (!testTo.includes('@')) { setTestMsg({ ok: false, text: "Enter a valid email address." }); return; }
    setTesting(true);
    setTestMsg(null);
    try {
      const res = await sendTestEmail(testTo);
      setTestMsg({ ok: res.success, text: res.message });
    } catch (err) {
      setTestMsg({ ok: false, text: err instanceof Error ? err.message : "Test failed." });
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black theme-text-main flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-cyan-500" /> SMTP Settings
          </h1>
          <p className="text-xs theme-text-muted mt-0.5">Configure outbound email delivery</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-xs font-bold theme-text-muted uppercase tracking-wider">
            {form.is_enabled ? "Enabled" : "Disabled"}
          </span>
          <button
            type="button"
            onClick={() => set('is_enabled', !form.is_enabled)}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
              form.is_enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${
              form.is_enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </label>
      </div>

      {saveMsg && (
        <div className={`rounded-xl border px-4 py-3 flex items-center gap-2 text-sm ${
          saveMsg.ok
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
        }`}>
          {saveMsg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {saveMsg.text}
        </div>
      )}

      {/* SMTP Config */}
      <div className="theme-bg-card border theme-border rounded-2xl p-6 space-y-5">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted border-b theme-border pb-3">
          Connection
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <label className={LABEL}>SMTP Host</label>
            <input value={form.host} onChange={(e) => set('host', e.target.value)}
              className={INPUT} placeholder="smtp.sendgrid.net" />
          </div>
          <div>
            <label className={LABEL}>Port</label>
            <input type="number" value={form.port}
              onChange={(e) => set('port', parseInt(e.target.value, 10) || 587)}
              className={INPUT} placeholder="587" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="secure"
            type="checkbox"
            checked={form.secure}
            onChange={(e) => set('secure', e.target.checked)}
            className="h-4 w-4 rounded text-cyan-500 focus:ring-cyan-500"
          />
          <label htmlFor="secure" className="text-sm theme-text-main cursor-pointer select-none">
            Use SSL/TLS (port 465) — uncheck for STARTTLS (port 587)
          </label>
        </div>

        <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted border-b theme-border pb-3 pt-2">
          Authentication
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Username</label>
            <input value={form.username} onChange={(e) => set('username', e.target.value)}
              className={INPUT} placeholder="apikey" autoComplete="off" />
          </div>
          <div>
            <label className={LABEL}>Password / API Key</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={form.password}
                onChange={(e) => set('password', e.target.value)}
                className={`${INPUT} pr-10`}
                placeholder={passwordIsSet ? '(saved — leave blank to keep)' : 'Enter password or API key'}
                autoComplete="new-password" />
              <button type="button" tabIndex={-1}
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:text-cyan-500 transition">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passwordIsSet && !form.password && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Password is saved. Leave blank to keep existing.
              </p>
            )}
          </div>
        </div>

        <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted border-b theme-border pb-3 pt-2">
          Sender Identity
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>From Name</label>
            <input value={form.from_name} onChange={(e) => set('from_name', e.target.value)}
              className={INPUT} placeholder="ApexTrack Network" />
          </div>
          <div>
            <label className={LABEL}>From Email</label>
            <input type="email" value={form.from_email} onChange={(e) => set('from_email', e.target.value)}
              className={INPUT} placeholder="no-reply@network.com" />
          </div>
        </div>

        <div>
          <label className={LABEL}>Reply-To Email <span className="normal-case font-normal">(optional)</span></label>
          <input type="email" value={form.reply_to} onChange={(e) => set('reply_to', e.target.value)}
            className={INPUT} placeholder="support@network.com" />
        </div>

        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>

      {/* Test Email */}
      <div className="theme-bg-card border theme-border rounded-2xl p-6 space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted border-b theme-border pb-3">
          Send Test Email
        </h2>
        <p className="text-xs theme-text-muted">
          Verify your SMTP configuration by sending a test email. Save settings first.
        </p>

        {testMsg && (
          <div className={`rounded-xl border px-4 py-3 flex items-center gap-2 text-sm ${
            testMsg.ok
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
          }`}>
            {testMsg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {testMsg.text}
          </div>
        )}

        <div className="flex gap-3">
          <input
            type="email"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="recipient@example.com"
            className={`${INPUT} flex-1`}
          />
          <button onClick={handleTest} disabled={testing}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition disabled:opacity-50 whitespace-nowrap">
            {testing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {testing ? "Sending…" : "Send Test"}
          </button>
        </div>
      </div>

    </div>
  );
}
