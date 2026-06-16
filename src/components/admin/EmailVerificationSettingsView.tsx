import { useState, useEffect } from "react";
import {
  MailCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  Users,
} from "lucide-react";
import { getAdminNetworkSettings, updateAdminNetworkSettings } from "../../services/network-settings";
import { getVerificationStats } from "../../services/verification";

const INPUT = "w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:opacity-50";
const LABEL = "block text-[10px] font-bold uppercase tracking-[0.18em] theme-text-muted mb-1.5";

const TURNSTILE_SECRET_MASK = '••••••••';

interface Stats {
  publishers: { verified: number; unverified: number };
  advertisers: { verified: number; unverified: number };
}

export function EmailVerificationSettingsView() {
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState<{ ok: boolean; text: string } | null>(null);
  const [stats, setStats]         = useState<Stats | null>(null);

  // Email verification settings
  const [verificationRequired, setVerificationRequired] = useState(false);

  // Turnstile settings
  const [turnstileEnabled, setTurnstileEnabled]   = useState(false);
  const [turnstileSiteKey, setTurnstileSiteKey]   = useState("");
  const [turnstileSecretKey, setTurnstileSecretKey] = useState("");
  const [secretKeyIsSet, setSecretKeyIsSet]       = useState(false);
  const [showSecret, setShowSecret]               = useState(false);

  useEffect(() => {
    Promise.all([
      getAdminNetworkSettings(),
      getVerificationStats().catch(() => null),
    ]).then(([settings, verStats]) => {
      setVerificationRequired((settings as any).email_verification_required ?? false);
      setTurnstileEnabled((settings as any).turnstile_enabled ?? false);
      setTurnstileSiteKey((settings as any).turnstile_site_key ?? "");
      // Secret key is masked; don't populate the input
      setSecretKeyIsSet(
        !!(settings as any).turnstile_secret_key &&
        (settings as any).turnstile_secret_key !== ''
      );
      if (verStats) setStats(verStats);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const payload: Record<string, unknown> = {
        email_verification_required: verificationRequired,
        turnstile_enabled: turnstileEnabled,
        turnstile_site_key: turnstileSiteKey,
      };
      // Only include secret key if user typed a new value (not empty, not the mask)
      if (turnstileSecretKey && turnstileSecretKey !== TURNSTILE_SECRET_MASK) {
        payload.turnstile_secret_key = turnstileSecretKey;
      }
      await updateAdminNetworkSettings(payload as any);
      setMsg({ ok: true, text: "Settings saved successfully." });
      setTurnstileSecretKey("");
      setSecretKeyIsSet(true);
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Failed to save settings." });
    } finally {
      setSaving(false);
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
    <div className="p-6 max-w-2xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-2">
        <MailCheck className="w-5 h-5 text-cyan-500" />
        <h1 className="text-xl font-black theme-text-main">Email Verification</h1>
      </div>

      {msg && (
        <div className={`rounded-xl border px-4 py-3 flex items-center gap-2 text-sm ${
          msg.ok
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
        }`}>
          {msg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* Verification Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              label: "Affiliates",
              verified: stats.publishers.verified,
              unverified: stats.publishers.unverified,
            },
            {
              label: "Advertisers",
              verified: stats.advertisers.verified,
              unverified: stats.advertisers.unverified,
            },
          ].map((s) => (
            <div key={s.label} className="theme-bg-card border theme-border rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] theme-text-muted">
                <Users className="w-3.5 h-3.5" /> {s.label}
              </div>
              <div className="flex justify-between text-sm">
                <span className="theme-text-muted">Verified</span>
                <span className="font-black text-emerald-600">{s.verified}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="theme-text-muted">Unverified</span>
                <span className="font-black text-amber-500">{s.unverified}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Email Verification Settings */}
      <div className="theme-bg-card border theme-border rounded-2xl p-5 space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted border-b theme-border pb-3">
          Verification Requirement
        </h2>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold theme-text-main">Require Email Verification to Login</p>
            <p className="text-xs theme-text-muted mt-0.5">
              When enabled, publishers must verify their email before they can sign in.
              When disabled, they can log in but see an unverified warning.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setVerificationRequired((v) => !v)}
            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors ${
              verificationRequired ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${
              verificationRequired ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Turnstile Settings */}
      <div className="theme-bg-card border theme-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b theme-border pb-3">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted">
            Cloudflare Turnstile (CAPTCHA)
          </h2>
          <button
            type="button"
            onClick={() => setTurnstileEnabled((v) => !v)}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
              turnstileEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${
              turnstileEnabled ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>

        <p className="text-xs theme-text-muted">
          When enabled, Cloudflare Turnstile CAPTCHA is shown on both affiliate and advertiser signup forms.
          Obtain your site key and secret key from the Cloudflare dashboard.
        </p>

        <div>
          <label className={LABEL}>Site Key <span className="normal-case font-normal">(public — shown in browser)</span></label>
          <input
            value={turnstileSiteKey}
            onChange={(e) => setTurnstileSiteKey(e.target.value)}
            className={INPUT}
            placeholder="0x4AAAAAAA..."
          />
        </div>

        <div>
          <label className={LABEL}>Secret Key <span className="normal-case font-normal">(server-side only)</span></label>
          <div className="relative">
            <input
              type={showSecret ? "text" : "password"}
              value={turnstileSecretKey}
              onChange={(e) => setTurnstileSecretKey(e.target.value)}
              className={`${INPUT} pr-10`}
              placeholder={secretKeyIsSet ? "(saved — leave blank to keep)" : "0x4AAAAAAA..."}
              autoComplete="new-password"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowSecret((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:text-cyan-500 transition"
            >
              {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {secretKeyIsSet && !turnstileSecretKey && (
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Secret key is saved. Leave blank to keep existing.
            </p>
          )}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {saving ? "Saving…" : "Save Settings"}
      </button>

    </div>
  );
}
