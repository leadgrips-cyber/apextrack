import React, { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  MailCheck,
  RefreshCw,
  Send,
  Layers,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Globe,
  Users,
  BarChart2,
  Check,
  HelpCircle,
} from "lucide-react";
import { signupAdvertiser, type AdvertiserSignupPayload } from "../services/advertisers";
import { loadSignupQuestions, submitSignupResponses, type SignupQuestion } from "../services/signup-questions";
import { resendVerificationEmail } from "../services/verification";
import { DynamicQuestionField } from "./DynamicQuestionField";
import { TurnstileWidget } from "./TurnstileWidget";
import { useBranding } from "../contexts/BrandingContext";

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bangladesh","Belarus","Belgium","Bolivia","Bosnia",
  "Brazil","Bulgaria","Cambodia","Canada","Chile","China","Colombia","Croatia",
  "Czech Republic","Denmark","Dominican Republic","Ecuador","Egypt","Estonia",
  "Ethiopia","Finland","France","Georgia","Germany","Ghana","Greece","Guatemala",
  "Honduras","Hungary","India","Indonesia","Iran","Iraq","Ireland","Israel",
  "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Latvia",
  "Lebanon","Libya","Lithuania","Malaysia","Mexico","Moldova","Morocco",
  "Mozambique","Myanmar","Nepal","Netherlands","New Zealand","Nicaragua",
  "Nigeria","Norway","Pakistan","Panama","Paraguay","Peru","Philippines","Poland",
  "Portugal","Romania","Russia","Saudi Arabia","Senegal","Serbia","Singapore",
  "Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","Sweden",
  "Switzerland","Taiwan","Tanzania","Thailand","Tunisia","Turkey","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay",
  "Uzbekistan","Venezuela","Vietnam","Yemen","Zimbabwe","Other",
];

interface Props {
  onBackToLogin: () => void;
}

export function AdvertiserSignupView({ onBackToLogin }: Props) {
  const branding = useBranding();
  const [advertiserQuestions, setAdvertiserQuestions] = useState<SignupQuestion[]>([]);
  const [dynAnswers, setDynAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    loadSignupQuestions("advertiser").then(setAdvertiserQuestions).catch(() => {});
  }, []);

  const [form, setForm] = useState<AdvertiserSignupPayload & { confirm_password: string }>({
    company_name: "",
    contact_name: "",
    email: "",
    password: "",
    confirm_password: "",
    country: "",
    website: "",
    messenger_contact: "",
  });
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [success, setSuccess]         = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [verifyEmail, setVerifyEmail] = useState<string | null>(null);
  const [resendMsg, setResendMsg]     = useState("");
  const [resending, setResending]     = useState(false);

  const inputCls = "w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60 transition";
  const labelStyle: React.CSSProperties = { color: "#334155" };
  const labelCls = "block text-xs font-semibold uppercase tracking-wide mb-2";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.company_name.trim()) { setError("Company name is required."); return; }
    if (!form.contact_name.trim()) { setError("Contact person name is required."); return; }
    if (!form.email.trim())        { setError("Email address is required."); return; }
    if (form.password.length < 8)  { setError("Password must be at least 8 characters."); return; }
    if (form.password !== form.confirm_password) { setError("Passwords do not match."); return; }

    if (branding.turnstileEnabled && !turnstileToken) {
      setError("Please complete the CAPTCHA verification.");
      return;
    }

    for (const q of advertiserQuestions) {
      if (q.is_required && !dynAnswers[q.id]?.trim()) {
        setError("Please answer all required questions before submitting.");
        return;
      }
    }

    setLoading(true);
    try {
      const payload: AdvertiserSignupPayload & { 'cf-turnstile-response'?: string } = {
        company_name:      form.company_name.trim(),
        contact_name:      form.contact_name.trim(),
        email:             form.email.trim(),
        password:          form.password,
        country:           form.country           || undefined,
        website:           form.website?.trim()   || undefined,
        messenger_contact: form.messenger_contact?.trim() || undefined,
      };
      if (branding.turnstileEnabled && turnstileToken) {
        payload['cf-turnstile-response'] = turnstileToken;
      }
      const result = await signupAdvertiser(payload);

      if (advertiserQuestions.length > 0 && result?.advertiser?.id) {
        const responses = advertiserQuestions
          .map((q) => ({ question_id: q.id, answer: dynAnswers[q.id] ?? "" }))
          .filter((r) => r.answer.trim() !== "");
        if (responses.length > 0) {
          try {
            await submitSignupResponses({ advertiser_id: result.advertiser.id, responses });
          } catch { /* non-blocking */ }
        }
      }

      setVerifyEmail(form.email.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Verification-sent screen (shown after successful signup) ─────────────────
  if (verifyEmail) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center space-y-5">
          <div className="flex justify-center">
            <div className="rounded-full bg-cyan-100 dark:bg-cyan-900/30 p-5">
              <MailCheck className="w-10 h-10 text-cyan-500" />
            </div>
          </div>
          <h1 className="text-2xl font-black theme-text-main">Check Your Email</h1>
          <p className="theme-text-muted text-sm leading-relaxed">
            Your advertiser account has been created. We sent a verification link to{" "}
            <strong className="theme-text-main">{verifyEmail}</strong>.
          </p>
          <p className="theme-text-muted text-sm">
            Your account also requires admin approval before you can log in.
          </p>
          <button
            onClick={async () => {
              setResendMsg("");
              setResending(true);
              try {
                await resendVerificationEmail(verifyEmail, "advertiser");
                setResendMsg("Verification email sent.");
              } catch (e: unknown) {
                setResendMsg((e as Error).message || "Failed to resend.");
              } finally {
                setResending(false);
              }
            }}
            disabled={resending}
            className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 theme-text-main font-semibold px-5 py-2 rounded-xl text-sm transition disabled:opacity-50"
          >
            {resending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {resending ? "Sending…" : "Resend Verification Email"}
          </button>
          {resendMsg && (
            <p className={`text-xs font-semibold ${resendMsg.includes("sent") ? "text-emerald-600" : "text-rose-500"}`}>
              {resendMsg}
            </p>
          )}
          <button onClick={onBackToLogin}
            className="block text-xs theme-text-muted hover:text-cyan-600 transition mx-auto">
            Back to login
          </button>
        </div>
      </div>
    );
  }

  // ── Legacy success screen (kept for non-email-verification environments) ──────
  if (success) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-5">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-2xl font-black theme-text-main mb-3">Application Received</h1>
          <p className="theme-text-muted text-sm leading-relaxed mb-2">
            Your advertiser account is awaiting admin approval.
          </p>
          <p className="theme-text-muted text-sm leading-relaxed mb-8">
            You'll be able to log in once your account has been reviewed and activated
            by our team. This typically takes 1–2 business days.
          </p>
          <button onClick={onBackToLogin}
            className="rounded-full bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 transition">
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex overflow-x-hidden">

      {/* ── LEFT PANEL: Why Advertisers Choose Us (hidden on mobile/tablet) ──── */}
      <div
        className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between p-10 xl:p-14 overflow-hidden shrink-0"
        style={{ background: "linear-gradient(145deg, #4338ca 0%, #2563eb 55%, #0284c7 100%)" }}
      >
        {/* Depth glows only — no dark overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-violet-400 opacity-20 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-cyan-400 opacity-15 blur-[100px]" />
        </div>

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-3 select-none">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.networkName} className="w-10 h-10 object-contain rounded-xl" />
          ) : (
            <div className="bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950 p-2.5 rounded-2xl">
              <Layers className="w-6 h-6" />
            </div>
          )}
          <span className="text-white font-black text-lg uppercase tracking-widest">{branding.networkName}</span>
        </div>

        {/* Middle: Main content */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest"
              style={{ background: "rgba(167,139,250,0.25)", border: "1px solid rgba(167,139,250,0.55)", color: "#c4b5fd" }}>
              <Building2 className="w-3.5 h-3.5" />
              Advertiser Platform
            </div>
            <h1 className="text-4xl xl:text-5xl font-black leading-[1.05] tracking-tight text-white">
              Why Advertisers<br />
              <span style={{ background: "linear-gradient(90deg, #22d3ee, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Choose {branding.networkName}
              </span>
            </h1>
            <p className="text-slate-100 text-sm xl:text-[15px] leading-relaxed max-w-sm">
              Access a curated network of high-performing publishers. Real-time data, transparent reporting, and only pay for verified results.
            </p>
          </div>

          {/* Benefit rows */}
          <div className="space-y-3">
            {[
              { icon: Activity,    iconColor: "#22d3ee", iconBg: "rgba(6,182,212,0.3)",   title: "Performance-Based Pricing",   desc: "Pay only for real conversions — CPA, CPL, CPS, or RevShare." },
              { icon: ShieldAlert, iconColor: "#a78bfa", iconBg: "rgba(139,92,246,0.3)",  title: "AI-Powered Fraud Protection", desc: "Multi-layer filtering keeps your budget safe and data clean." },
              { icon: BarChart2,   iconColor: "#34d399", iconBg: "rgba(52,211,153,0.3)",  title: "Real-Time Analytics",         desc: "Live dashboards — clicks, conversions, EPC, revenue by source." },
              { icon: Globe,       iconColor: "#60a5fa", iconBg: "rgba(96,165,250,0.3)",  title: "Global Traffic Reach",        desc: "Publishers operating in 150+ countries across every vertical." },
              { icon: Users,       iconColor: "#fbbf24", iconBg: "rgba(251,191,36,0.3)",  title: "Dedicated Account Managers",  desc: "A personal contact who knows your campaigns and goals." },
            ].map(({ icon: Icon, iconColor, iconBg, title, desc }) => (
              <div key={title} className="flex items-start gap-3 p-3.5 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.22)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: iconBg }}>
                  <Icon className="w-[18px] h-[18px]" style={{ color: iconColor }} />
                </div>
                <div>
                  <div className="text-white text-sm font-bold leading-tight">{title}</div>
                  <div className="text-slate-100 text-[11px] leading-relaxed mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Trust badges */}
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "SSL Secured",     icon: ShieldCheck },
              { label: "Fraud Protected", icon: ShieldAlert },
              { label: "24/7 Support",    icon: HelpCircle },
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] text-white font-semibold"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}>
                <Icon className="w-3 h-3 text-emerald-300" />
                {label}
              </div>
            ))}
          </div>
          {branding.supportEmail && (
            <div className="text-xs text-slate-200">
              Support: <a href={`mailto:${branding.supportEmail}`} className="text-cyan-300 hover:underline font-mono">{branding.supportEmail}</a>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: Signup Form ──────────────────────────────────────────── */}
      <div className="flex-1 theme-bg overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-lg">

            {/* Logo / brand (shown only on mobile since left panel is hidden) */}
            <div className="flex flex-col items-center mb-8 lg:hidden">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg mb-3">
                {branding.logoUrl ? (
                  <img src={branding.logoUrl} alt={branding.networkName} className="w-10 h-10 object-contain rounded-xl" />
                ) : (
                  <Building2 className="w-7 h-7 text-white" />
                )}
              </div>
              <div className="text-xs uppercase tracking-[0.28em] font-bold theme-text-muted">{branding.networkName}</div>
            </div>

            {/* Heading (always visible) */}
            <div className="mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#0f172a" }}>Advertiser Sign Up</h1>
              <p className="mt-1.5 text-sm font-medium" style={{ color: "#475569" }}>
                Create your advertiser account. An admin will review and activate it.
              </p>
            </div>

            <form onSubmit={e => void handleSubmit(e)}
              className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm space-y-5">

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                {/* Company Name */}
                <div className="sm:col-span-2">
                  <label className={labelCls} style={labelStyle}>Company Name *</label>
                  <input value={form.company_name}
                    onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                    disabled={loading} placeholder="Acme Corp" className={inputCls}
                    autoComplete="organization" autoFocus />
                </div>

                {/* Contact Person */}
                <div className="sm:col-span-2">
                  <label className={labelCls} style={labelStyle}>Contact Person *</label>
                  <input value={form.contact_name}
                    onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                    disabled={loading} placeholder="Your full name" className={inputCls}
                    autoComplete="name" />
                </div>

                {/* Email */}
                <div className="sm:col-span-2">
                  <label className={labelCls} style={labelStyle}>Email Address *</label>
                  <input type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    disabled={loading} placeholder="you@company.com" className={inputCls}
                    autoComplete="email" />
                </div>

                {/* Password */}
                <div>
                  <label className={labelCls} style={labelStyle}>Password *</label>
                  <div className="relative">
                    <input type={showPw ? "text" : "password"} value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      disabled={loading} placeholder="Min. 8 characters" className={`${inputCls} pr-11`}
                      autoComplete="new-password" />
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:text-cyan-600 transition">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className={labelCls} style={labelStyle}>Confirm Password *</label>
                  <div className="relative">
                    <input type={showConfirm ? "text" : "password"} value={form.confirm_password}
                      onChange={e => setForm(f => ({ ...f, confirm_password: e.target.value }))}
                      disabled={loading} placeholder="Repeat password" className={`${inputCls} pr-11`}
                      autoComplete="new-password" />
                    <button type="button" tabIndex={-1}
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:text-cyan-600 transition">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className={labelCls} style={labelStyle}>Country</label>
                  <select value={form.country ?? ""}
                    onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    disabled={loading} className={inputCls}>
                    <option value="">— Select country —</option>
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Website */}
                <div>
                  <label className={labelCls} style={labelStyle}>Website <span className="normal-case font-normal">(optional)</span></label>
                  <input value={form.website ?? ""}
                    onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                    disabled={loading} placeholder="https://company.com" className={inputCls}
                    autoComplete="url" />
                </div>

                {/* Messenger */}
                <div className="sm:col-span-2">
                  <label className={labelCls} style={labelStyle}>Messenger Contact <span className="normal-case font-normal">(optional)</span></label>
                  <input value={form.messenger_contact ?? ""}
                    onChange={e => setForm(f => ({ ...f, messenger_contact: e.target.value }))}
                    disabled={loading} placeholder="Telegram / WhatsApp / Skype handle" className={inputCls} />
                </div>

              </div>

              {advertiserQuestions.length > 0 && (
                <div className="space-y-4 pt-2 border-t theme-border">
                  <div className="text-xs font-bold uppercase tracking-[0.2em] theme-text-muted pt-1">Additional Questions</div>
                  {advertiserQuestions.map((q) => (
                    <DynamicQuestionField
                      key={q.id}
                      question={q}
                      value={dynAnswers[q.id] ?? ""}
                      onChange={(val) => setDynAnswers((prev) => ({ ...prev, [q.id]: val }))}
                      disabled={loading}
                    />
                  ))}
                </div>
              )}

              {branding.turnstileEnabled && (
                <div className="flex justify-center">
                  <TurnstileWidget
                    siteKey={branding.turnstileSiteKey}
                    onVerify={(token) => setTurnstileToken(token)}
                    onExpire={() => setTurnstileToken("")}
                  />
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-rose-700 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 transition">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : "Submit Application"}
              </button>

              <p className="text-center text-sm theme-text-muted">
                Already have an account?{" "}
                <button type="button" onClick={onBackToLogin}
                  className="font-semibold text-cyan-600 hover:text-cyan-500 transition">
                  Sign in
                </button>
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
