import React, { useState, useEffect, useRef } from "react";
import * as authApi from "../services/auth";
import { EmailNotVerifiedError, AccountPendingError, AccountRejectedError, AccountSuspendedError, forgotPassword as apiForgotPassword } from "../services/auth";
import { resendVerificationEmail } from "../services/verification";
import { useBranding } from "../contexts/BrandingContext";
import { loadSignupQuestions, submitSignupResponses, type SignupQuestion } from "../services/signup-questions";
import { DynamicQuestionField } from "./DynamicQuestionField";
import { TurnstileWidget } from "./TurnstileWidget";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Globe,
  AlertCircle,
  RefreshCw,
  Layers,
  ShieldAlert,
  Check,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Building,
  MapPin,
  Send,
  HelpCircle,
  FileText,
  MailCheck,
  ChevronRight,
  Activity,
} from "lucide-react";

interface PublisherAuthProps {
  currentView: "login" | "register" | "forgot";
  setView: (view: "login" | "register" | "forgot" | "app") => void;
  onLoginSuccess: (email: string) => void;
  onAdvertiserSignup?: () => void;
}

export function PublisherAuth({ currentView, setView, onLoginSuccess, onAdvertiserSignup }: PublisherAuthProps) {
  const branding = useBranding();

  // Login form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Step tracker for redesigned Affiliate Application registration
  const [registerStep, setRegisterStep] = useState(1);

  // STEP 1 — Account Information
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // STEP 2 — Address Information
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  const [affiliateDuration, setAffiliateDuration] = useState("");
  const [monthlyTrafficVolume, setMonthlyTrafficVolume] = useState("");
  const [currentNetworks, setCurrentNetworks] = useState("");
  const [trafficSources, setTrafficSources] = useState("");
  const [promotionMethods, setPromotionMethods] = useState("");
  const [mainNiches, setMainNiches] = useState("");

  // STEP 4 — Contact Information
  const [telegramUsername, setTelegramUsername] = useState("");
  const [teamsId, setTeamsId] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // STEP 5 — Terms & Conditions Verification
  const [antiFraudChecked, setAntiFraudChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState(false);
  const [captchaA] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [captchaB] = useState(() => Math.floor(Math.random() * 9) + 1);

  // Resend email cooldown (seconds)
  const [resendCooldown, setResendCooldown] = useState(0);

  // Dynamic signup questions
  const [publisherQuestions, setPublisherQuestions] = useState<SignupQuestion[]>([]);
  const [dynAnswers, setDynAnswers] = useState<Record<number, string>>({});

  // Turnstile CAPTCHA token (set by widget callback)
  const [turnstileToken, setTurnstileToken] = useState("");

  // After registration: show "check your email" notice
  const [pendingVerification, setPendingVerification] = useState<{ email: string } | null>(null);
  // Non-fatal error when signup responses fail to save (registration still succeeded)
  const [signupSaveError, setSignupSaveError] = useState<string | null>(null);

  // After login blocked by unverified email: show resend UI
  const [loginUnverified, setLoginUnverified] = useState<{ email: string } | null>(null);
  const [resendMsg, setResendMsg] = useState("");
  const [resending, setResending] = useState(false);

  // After login blocked by account status
  const [loginPending, setLoginPending] = useState<string | null>(null);
  const [loginRejected, setLoginRejected] = useState<string | null>(null);
  const [loginSuspended, setLoginSuspended] = useState<string | null>(null);

  // General workflow control states
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle standard Login Submission
const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setErrorMessage("");
  setSuccessMessage("");
  setLoginUnverified(null);
  setLoginPending(null);
  setLoginRejected(null);
  setLoginSuspended(null);
  setResendMsg("");
  setIsLoading(true);

  try {
    await authApi.login(loginEmail, loginPassword);
    onLoginSuccess(loginEmail);
    setView("app");
  } catch (error: unknown) {
    if (error instanceof EmailNotVerifiedError) {
      setLoginUnverified({ email: error.email || loginEmail });
    } else if (error instanceof AccountPendingError) {
      setLoginPending(error.message);
    } else if (error instanceof AccountRejectedError) {
      setLoginRejected(error.message);
    } else if (error instanceof AccountSuspendedError) {
      setLoginSuspended(error.message);
    } else {
      setErrorMessage((error as Error).message || "Login failed");
    }
  } finally {
    setIsLoading(false);
  }
};

  // Load publisher signup questions on mount
  useEffect(() => {
    loadSignupQuestions("publisher")
      .then(setPublisherQuestions)
      .catch(() => {});
  }, []);

  // Close country dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Terms is step 5 without questions, step 6 when questions exist
  const termsStep = publisherQuestions.length > 0 ? 6 : 5;

  // Move forward in registration steps
  const nextRegisterStep = () => {
    setErrorMessage("");
    
    if (registerStep === 1) {
      if (!firstName || !lastName || !registerEmail || !registerPassword || !confirmPassword) {
        setErrorMessage("Please complete all account information fields to proceed.");
        return;
      }
      if (!registerEmail.includes("@")) {
        setErrorMessage("Please provide a valid account email address.");
        return;
      }
      if (registerPassword !== confirmPassword) {
        setErrorMessage("Passwords do not match. Please verify spelling.");
        return;
      }
      if (registerPassword.length < 6) {
        setErrorMessage("Password must be at least 6 characters for regulatory security.");
        return;
      }
    }

    if (registerStep === 2) {
      if (!companyName || !address || !city || !stateName || !postalCode || !country) {
        setErrorMessage("Please fill all corporate and address details.");
        return;
      }
    }

    if (registerStep === 3) {
      if (!affiliateDuration || !monthlyTrafficVolume || !trafficSources || !promotionMethods || !mainNiches) {
        setErrorMessage("All traffic and promotion fields are required to verify affiliate quality.");
        return;
      }
    }

    if (registerStep === 4) {
      if (!telegramUsername || !teamsId) {
        setErrorMessage("Telegram username and Microsoft Teams ID are required for account manager review.");
        return;
      }
    }

    if (registerStep === 5 && publisherQuestions.length > 0) {
      for (const q of publisherQuestions) {
        if (q.is_required && !dynAnswers[q.id]?.trim()) {
          setErrorMessage("Please answer all required questions before proceeding.");
          return;
        }
      }
    }

    setRegisterStep(prev => prev + 1);
  };

  const prevRegisterStep = () => {
    setErrorMessage("");
    setRegisterStep(prev => Math.max(1, prev - 1));
  };

  // Handle registration final submit
 const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!antiFraudChecked || !termsChecked) {
      setErrorMessage("You must accept both the Anti Fraud Agreement and the Publisher Terms of Service.");
      return;
    }

    // When Turnstile is enabled, require its token; otherwise use the math CAPTCHA
    if (branding.turnstileEnabled) {
      if (!turnstileToken) {
        setErrorMessage("Please complete the CAPTCHA verification.");
        return;
      }
    } else {
      if (captchaAnswer.trim() !== String(captchaA + captchaB)) {
        setCaptchaError(true);
        setErrorMessage("Incorrect CAPTCHA response. Please solve the calculation to proceed.");
        return;
      }
    }

   setCaptchaError(false);
setIsLoading(true);

try {
  const regResult = await authApi.register(
    registerEmail,
    registerPassword,
    `${firstName} ${lastName}`,
    registerEmail.split("@")[0],
    companyName,
    branding.turnstileEnabled ? turnstileToken : undefined
  );

  if (publisherQuestions.length > 0 && regResult?.id) {
    const responses = publisherQuestions
      .map((q) => ({ question_id: q.id, answer: dynAnswers[q.id] ?? "" }))
      .filter((r) => r.answer.trim() !== "");
    if (responses.length > 0) {
      try {
        await submitSignupResponses({ publisher_id: regResult.id as string, responses });
      } catch (err) {
            setSignupSaveError(
              (err as Error).message || "Your signup answers could not be saved. Please contact support."
            );
          }
    }
  }

  setPendingVerification({ email: registerEmail });
} catch (error: unknown) {
  setErrorMessage((error as Error).message || "Registration failed");
} finally {
  setIsLoading(false);
}
};
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await apiForgotPassword(loginEmail.trim().toLowerCase());
      setSuccessMessage(
        "If an account with that email exists, a password reset link has been sent. Check your inbox."
      );
    } catch {
      setSuccessMessage(
        "If an account with that email exists, a password reset link has been sent. Check your inbox."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend cooldown helper ──────────────────────────────────────────────────
  const startResendCooldown = () => {
    setResendCooldown(60);
    const iv = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(iv); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  // ── Resend helper (for loginUnverified UI) ──────────────────────────────────
  const handleResendVerification = async () => {
    if (!loginUnverified) return;
    setResending(true);
    setResendMsg("");
    try {
      await resendVerificationEmail(loginUnverified.email, "publisher");
      setResendMsg("Verification email sent. Check your inbox.");
      startResendCooldown();
    } finally {
      setResending(false);
    }
  };

  // ── Pending email verification screen (shown after registration) ────────────
  if (pendingVerification) {
    return (
      <div className="min-h-screen theme-bg-page flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="theme-bg-card py-8 px-6 sm:px-8 shadow-xl rounded-2xl border theme-border text-center space-y-5">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                <MailCheck className="w-10 h-10 text-[#065907]" />
              </div>
            </div>
            <h2 className="text-xl font-black theme-text-main">Check Your Email</h2>
            {signupSaveError && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700 text-left">
                <strong>Note:</strong> Your account was created, but your signup answers could not be saved: {signupSaveError}
              </div>
            )}
            <p className="text-sm theme-text-muted leading-relaxed">
              Your account has been created. We sent a verification link to{" "}
              <strong className="theme-text-main">{pendingVerification.email}</strong>.
              Click the link in the email to activate your account.
            </p>
            <p className="text-xs font-medium" style={{ color: "#475569" }}>
              Didn't receive it? Check your spam folder or request a new link below.
            </p>
            <button
              onClick={async () => {
                setResendMsg("");
                setResending(true);
                try {
                  await resendVerificationEmail(pendingVerification.email, "publisher");
                  setResendMsg("New verification email sent.");
                  startResendCooldown();
                } catch (e: unknown) {
                  setResendMsg((e as Error).message || "Failed to resend.");
                } finally {
                  setResending(false);
                }
              }}
              disabled={resending || resendCooldown > 0}
              className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 theme-text-main font-semibold px-5 py-2 rounded-xl text-sm transition disabled:opacity-50"
            >
              {resending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {resending ? "Sending…" : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Verification Email"}
            </button>
            {resendMsg && (
              <p className={`text-xs font-semibold ${resendMsg.includes("sent") ? "text-emerald-600" : "text-rose-500"}`}>
                {resendMsg}
              </p>
            )}
            <button
              onClick={() => { setPendingVerification(null); setView("login"); }}
              className="block text-xs theme-text-muted hover:text-[#065907] transition mx-auto"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isRegister = currentView === "register";

  return (
    <div className="min-h-screen flex selection:bg-[#065907] selection:text-white" id="auth-root">

      {/* ── LEFT PANEL: Premium Marketing (login / forgot) ──────────────────── */}
      {!isRegister && (
        <div
          className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between p-10 xl:p-14 overflow-hidden"
          style={{
            background: branding.loginBgUrl
              ? `url(${branding.loginBgUrl}) center/cover no-repeat`
              : "linear-gradient(145deg, #19380F 0%, #1f4714 50%, #173510 100%)",
          }}
        >
          {/* Subtle depth layer — NOT a dark overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-green-400 opacity-20 blur-[120px]" />
            <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-lime-400 opacity-15 blur-[100px]" />
          </div>

          {/* Top: Logo + Name */}
          <div className="relative z-10 flex items-center gap-3 select-none">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.networkName} className="w-10 h-10 object-contain rounded-xl" />
            ) : (
              <div className="bg-gradient-to-br from-[#065907] to-[#0a7a0c] text-white p-2.5 rounded-2xl">
                <Layers className="w-6 h-6" />
              </div>
            )}
            <span className="font-black text-lg uppercase tracking-widest" style={{ color: "#F1F1FA" }}>
              {branding.networkName}
            </span>
          </div>

          {/* Middle: Main marketing content */}
          <div className="relative z-10 space-y-8">

            {currentView === "login" ? (
              <>
                {/* Tag + Headline */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-widest"
                    style={{ background: "rgba(6,182,212,0.25)", border: "1px solid rgba(6,182,212,0.6)", color: "#67e8f9" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                    CPA · CPL · CPS · RevShare
                  </div>
                  <h1 className="text-4xl xl:text-5xl font-black leading-[1.05] tracking-tight" style={{ color: "#F1F1FA" }}>
                    Scale Your<br />
                    <span style={{ color: "#FFA439" }}>
                      Affiliate Revenue
                    </span>
                  </h1>
                  <p className="text-sm xl:text-[15px] leading-relaxed max-w-sm" style={{ color: "#F1F1FA" }}>
                    Grow with premium CPA, CPL, CPS and RevShare campaigns. Real-time analytics, smart optimization, and automated payouts.
                  </p>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "$100M+",  label: "Paid Out" },
                    { value: "50K+",    label: "Publishers" },
                    { value: "150+",    label: "Countries" },
                    { value: "24/7",    label: "Support" },
                  ].map(({ value, label }) => (
                    <div key={label} className="rounded-2xl px-4 py-3.5 text-center"
                      style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.30)" }}>
                      <div className="text-3xl font-black" style={{ color: "#F1F1FA" }}>{value}</div>
                      <div className="text-xs font-bold mt-1" style={{ color: "#F1F1FA" }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Feature cards — 2×2 grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Activity,    iconColor: "#22d3ee", iconBg: "rgba(6,182,212,0.3)",   title: "Real-Time Tracking", desc: "Live click & conversion data with millisecond precision" },
                    { icon: ShieldAlert, iconColor: "#a78bfa", iconBg: "rgba(139,92,246,0.3)",  title: "Smart Anti-Fraud",   desc: "AI-powered traffic protection for clean data" },
                    { icon: Globe,       iconColor: "#34d399", iconBg: "rgba(52,211,153,0.3)",  title: "Global Offers",      desc: "Premium campaigns across 150+ countries" },
                    { icon: ArrowRight,  iconColor: "#fbbf24", iconBg: "rgba(251,191,36,0.3)",  title: "Fast Payouts",       desc: "Automated weekly payments, multiple methods" },
                  ].map(({ icon: Icon, iconColor, iconBg, title, desc }) => (
                    <div key={title} className="rounded-2xl p-4 space-y-2.5"
                      style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.22)" }}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{ background: iconBg }}>
                        <Icon className="w-4 h-4" style={{ color: iconColor }} />
                      </div>
                      <div className="text-xs font-bold leading-tight" style={{ color: "#F1F1FA" }}>{title}</div>
                      <div className="text-[10px] leading-relaxed" style={{ color: "#F1F1FA" }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* Forgot password copy */
              <div className="space-y-5">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(6,182,212,0.25)", border: "1px solid rgba(6,182,212,0.5)" }}>
                  <Lock className="w-7 h-7 text-cyan-300" />
                </div>
                <h1 className="text-4xl font-black leading-tight" style={{ color: "#F1F1FA" }}>
                  Account<br />Recovery
                </h1>
                <p className="text-sm leading-relaxed max-w-xs" style={{ color: "#F1F1FA" }}>
                  Enter your registered email address and we'll send you a secure link to reset your password instantly.
                </p>
                <div className="space-y-3 pt-2">
                  {["Link expires in 1 hour for security", "No password is stored in plain text", "Reach support if you lost email access"].map((t) => (
                    <div key={t} className="flex items-start gap-2.5 text-sm" style={{ color: "#F1F1FA" }}>
                      <Check className="w-3.5 h-3.5 text-cyan-300 mt-0.5 shrink-0" />
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom: Trust badges + support */}
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                { label: "SSL Secured",     icon: ShieldCheck },
                { label: "Fraud Protected", icon: ShieldAlert },
                { label: "24/7 Support",    icon: HelpCircle },
              ].map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#F1F1FA" }}>
                  <Icon className="w-3 h-3 text-emerald-300" />
                  {label}
                </div>
              ))}
            </div>
            <div className="text-xs space-y-0.5" style={{ color: "#F1F1FA" }}>
              {branding.loginDomain && <div>Portal: <span className="font-mono" style={{ color: "#F1F1FA" }}>{branding.loginDomain}</span></div>}
              {branding.supportEmail && (
                <div>Support: <a href={`mailto:${branding.supportEmail}`} className="hover:underline font-mono" style={{ color: "#F1F1FA" }}>{branding.supportEmail}</a></div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── LEFT PANEL: Register Progress (shown only for register, hidden on mobile) ── */}
      {isRegister && (
        <div className="hidden lg:flex lg:w-80 xl:w-[380px] shrink-0 flex-col justify-between p-10 overflow-hidden relative"
          style={{ background: "linear-gradient(145deg, #19380F 0%, #1f4714 50%, #173510 100%)" }}>

          {/* Depth glows — not dark overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-green-400 opacity-20 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-lime-400 opacity-15 blur-[90px]" />
          </div>

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3 select-none">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.networkName} className="w-9 h-9 object-contain rounded-xl" />
            ) : (
              <div className="bg-gradient-to-br from-[#065907] to-[#0a7a0c] text-white p-2 rounded-xl">
                <Layers className="w-5 h-5" />
              </div>
            )}
            <span className="font-black text-base uppercase tracking-widest" style={{ color: "#FFFFFF" }}>{branding.networkName}</span>
          </div>

          {/* Headline + steps */}
          <div className="relative z-10 space-y-6">
            <div>
              <h2 className="text-2xl font-black leading-tight" style={{ color: "#FFFFFF" }}>Join Our<br /><span style={{ color: "#FFA439" }}>Affiliate Network</span></h2>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "#FFFFFF" }}>
                Complete the application to access premium campaigns and real-time reporting.
              </p>
            </div>

            <div className="space-y-1">
              {[
                { step: 1, label: "Account Credentials" },
                { step: 2, label: "Company & Address" },
                { step: 3, label: "Traffic & Promotion" },
                { step: 4, label: "Contact Details" },
                ...(publisherQuestions.length > 0 ? [{ step: 5, label: "Additional Questions" }] : []),
                { step: termsStep, label: "Terms & Agreement" },
              ].map(({ step, label }, idx, arr) => {
                const isActive   = registerStep === step;
                const isComplete = registerStep > step;
                const isLast     = idx === arr.length - 1;
                return (
                  <div key={step}>
                    <div
                      className="flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all"
                      style={isActive ? { background: "rgba(255,255,255,0.18)", boxShadow: "0 0 0 1px rgba(255,255,255,0.25)" } : {}}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black transition-all"
                        style={
                          isActive   ? { background: "#06b6d4", color: "#0f172a", boxShadow: "0 0 12px rgba(6,182,212,0.6)" } :
                          isComplete ? { background: "#10b981", color: "#ffffff" } :
                                       { background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.35)", color: "#FFFFFF" }
                        }
                      >
                        {isComplete ? <Check className="w-4 h-4" /> : step}
                      </div>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: isActive ? "#ffffff" : isComplete ? "#6ee7b7" : "#FFFFFF" }}
                      >
                        {label}
                      </span>
                    </div>
                    {!isLast && (
                      <div className="ml-[27px] w-0.5 h-3"
                        style={{ background: isComplete ? "rgba(16,185,129,0.5)" : "rgba(255,255,255,0.15)" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 text-xs" style={{ color: "#FFFFFF" }}>
            {branding.supportEmail && (
              <div>Support: <a href={`mailto:${branding.supportEmail}`} className="hover:underline" style={{ color: "#FFFFFF" }}>{branding.supportEmail}</a></div>
            )}
          </div>
        </div>
      )}

      {/* ── RIGHT PANEL: Form ────────────────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col justify-center overflow-y-auto theme-bg-page ${isRegister ? "py-10 px-4 sm:px-8" : "py-10 px-4 sm:px-8 lg:px-12"}`}>

        {/* Mobile-only logo header */}
        <div className={`lg:hidden text-center mb-8 ${isRegister ? "" : ""}`}>
          <div className="flex items-center justify-center gap-3 select-none">
            <div className="bg-[#065907] text-white p-2.5 rounded-2xl font-black shadow-lg shadow-[#065907]/20">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={branding.networkName} className="w-6 h-6 object-contain" />
              ) : (
                <Layers className="w-6 h-6" />
              )}
            </div>
            <span className="text-xl font-black theme-text-main tracking-tight uppercase">{branding.networkName}</span>
          </div>
        </div>

        {/* Page heading */}
        <div className={`mx-auto w-full mb-6 ${isRegister ? "max-w-3xl" : "max-w-md"}`}>
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: "#0f172a" }}>
            {currentView === "login" && "Sign In"}
            {currentView === "register" && "Affiliate Application"}
            {currentView === "forgot" && "Reset Password"}
          </h2>
          <p className="mt-1.5 text-sm font-medium" style={{ color: "#475569" }}>
            {currentView === "login" && "Access your account dashboard and performance reports"}
            {currentView === "register" && `Step ${registerStep} of ${termsStep} — Complete your affiliate application`}
            {currentView === "forgot" && "Enter your email to receive a reset link"}
          </p>
        </div>

      {/* Main Authentication Box */}
      <div className={`mx-auto w-full animate-fadeIn ${isRegister ? "max-w-3xl" : "max-w-md"}`} id="auth-panel-wrapper">
        <div className="theme-bg-card shadow-2xl rounded-3xl border theme-border overflow-hidden">
          <div className={`py-8 ${isRegister ? "px-8 sm:px-10" : "px-6 sm:px-8"}`}>
          
          {/* Messages Alerts feedback */}
          {errorMessage && (
            <div className="mb-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-250 dark:border-rose-900 rounded-xl p-3 flex gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-250 dark:border-emerald-900 rounded-xl p-3 flex gap-2 text-xs text-emerald-800 dark:text-emerald-400">
              <ShieldCheck className="w-4.5 h-4.5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Email-not-verified banner on login */}
          {currentView === "login" && loginUnverified && (
            <div className="mb-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                <MailCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Email not verified.</strong> Check your inbox for a verification link or request a new one.
                </span>
              </div>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resending || resendCooldown > 0}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition disabled:opacity-50"
              >
                {resending ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                {resending ? "Sending…" : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend verification email"}
              </button>
              {resendMsg && (
                <p className={`text-[10px] font-semibold ${resendMsg.includes("sent") ? "text-emerald-600" : "text-rose-500"}`}>
                  {resendMsg}
                </p>
              )}
            </div>
          )}

          {/* Account pending banner */}
          {currentView === "login" && loginPending && (
            <div className="mb-5 bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700 rounded-xl p-3.5 flex items-start gap-2 text-xs text-blue-700 dark:text-blue-300">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
              <span>
                <strong>Account under review.</strong> {loginPending}
              </span>
            </div>
          )}

          {/* Account rejected banner */}
          {currentView === "login" && loginRejected && (
            <div className="mb-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 rounded-xl p-3.5 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6m0-6 6 6"/></svg>
              <span>
                <strong>Application not approved.</strong> {loginRejected}
              </span>
            </div>
          )}

          {/* Account suspended banner */}
          {currentView === "login" && loginSuspended && (
            <div className="mb-5 bg-orange-50 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-700 rounded-xl p-3.5 flex items-start gap-2 text-xs text-orange-700 dark:text-orange-300">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01"/><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
              <span>
                <strong>Account suspended.</strong> {loginSuspended}
              </span>
            </div>
          )}

          {/* SCREEN 1: CLEAN LOGIN VIEW */}
          {currentView === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>
                  Business Email Address
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main text-xs focus:border-[#065907] focus:outline-none transition shadow-xs"
                    placeholder="e.g. payout@media-agency.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>
                  Security Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main text-xs focus:border-[#065907] focus:outline-none transition font-mono shadow-xs"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 select-none">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded theme-border text-[#065907] focus:ring-0 cursor-pointer"
                  />
                  <span className="ml-2 text-xs font-medium" style={{ color: "#374151" }}>
                    Remember Me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => { setErrorMessage(""); setSuccessMessage(""); setView("forgot"); }}
                  className="text-xs text-[#065907] hover:underline font-mono focus:outline-none cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#065907] hover:bg-[#074a08] font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors duration-150 shadow-md shadow-[#065907]/10 cursor-pointer flex items-center justify-center gap-2"
                style={{ color: '#FFFFFF' }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting Secure Ledger...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          )}

          {/* SCREEN 2: MULTI-STEP REGISTRATION VIEW */}
          {currentView === "register" && (
            <div className="space-y-6">
              
              {/* Stepper Progress indicators */}
              {(() => {
                const steps = [
                  { step: 1, label: "Account" },
                  { step: 2, label: "Address" },
                  { step: 3, label: "Traffic" },
                  { step: 4, label: "Contact" },
                  ...(publisherQuestions.length > 0 ? [{ step: 5, label: "Questions" }] : []),
                  { step: termsStep, label: "Terms" },
                ];
                return (
                  <div className="mb-6">
                    <div className="flex items-center justify-between select-none">
                      {steps.map((item, index) => (
                        <React.Fragment key={item.step}>
                          <div className="flex flex-col items-center gap-1.5">
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                                registerStep === item.step
                                  ? "shadow-lg scale-110"
                                  : registerStep > item.step
                                  ? "bg-emerald-500 text-white"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                              }`}
                              style={registerStep === item.step ? { backgroundColor: '#065907', color: '#FFFFFF' } : undefined}
                            >
                              {registerStep > item.step ? <Check className="w-4 h-4" /> : item.step}
                            </span>
                            <span className={`text-[10px] font-bold uppercase tracking-wide hidden sm:block ${
                              registerStep === item.step ? "text-[#065907]" :
                              registerStep > item.step ? "text-emerald-600" : ""
                            }`} style={{ color: registerStep === item.step ? "#065907" : registerStep > item.step ? "#059669" : "#334155" }}>
                              {item.label}
                            </span>
                          </div>
                          {index < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${
                              registerStep > item.step ? "bg-emerald-400" : "bg-slate-200 dark:bg-slate-700"
                            }`} />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* STEP FORM INJECTS */}
              <div className="space-y-4">
                
                {/* STEP 1: Account Information */}
                {registerStep === 1 && (
                  <div className="space-y-5 animate-fadeIn">
                    <div>
                      <h3 className="text-base font-bold flex items-center gap-2 mb-0.5" style={{ color: "#0f172a" }}>
                        <User className="w-4 h-4 text-[#065907]" /> Account Credentials
                      </h3>
                      <p className="text-xs font-medium" style={{ color: "#475569" }}>Create your affiliate account login details.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>First Name</label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-[#065907] focus:outline-none"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>Last Name</label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-[#065907] focus:outline-none"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>Active email address</label>
                      <input
                        type="email"
                        required
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-[#065907] focus:outline-none font-mono"
                        placeholder="john.doe@conversionagency.com"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>Password</label>
                        <input
                          type="password"
                          required
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-[#065907] focus:outline-none font-mono"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>Confirm Password</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-[#065907] focus:outline-none font-mono"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Address Information */}
                {registerStep === 2 && (
                  <div className="space-y-5 animate-fadeIn">
                    <div>
                      <h3 className="text-base font-bold flex items-center gap-2 mb-0.5" style={{ color: "#0f172a" }}>
                        <Building className="w-4 h-4 text-[#065907]" /> Company & Address
                      </h3>
                      <p className="text-xs font-medium" style={{ color: "#475569" }}>Provide your business address for verification.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>Company / Agency legal name</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-[#065907] focus:outline-none"
                        placeholder="John Doe Media INC"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>Street Address Line</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-[#065907] focus:outline-none"
                        placeholder="120 Performance Way, Suite 400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>City</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-[#065907] focus:outline-none"
                          placeholder="Wilmington"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>State / Province</label>
                        <input
                          type="text"
                          required
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-[#065907] focus:outline-none"
                          placeholder="Delaware"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>Postal Code</label>
                        <input
                          type="text"
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-[#065907] focus:outline-none font-mono"
                          placeholder="19801"
                        />
                      </div>
                      <div ref={countryRef} className="relative">
                        <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>Country</label>
                        <div
                          className="mt-1 flex items-center justify-between w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus-within:border-[#065907] cursor-pointer"
                          onClick={() => { setCountryOpen(o => !o); setCountrySearch(""); }}
                        >
                          <span className={country ? "text-sm" : "text-sm theme-text-muted"}>
                            {country || "Select country…"}
                          </span>
                          <ChevronRight className={`w-4 h-4 theme-text-muted transition-transform ${countryOpen ? "rotate-90" : ""}`} />
                        </div>
                        {countryOpen && (
                          <div className="absolute z-50 mt-1 w-full theme-bg-card border theme-border rounded-xl shadow-xl overflow-hidden">
                            <div className="p-2 border-b theme-border">
                              <input
                                autoFocus
                                type="text"
                                value={countrySearch}
                                onChange={e => setCountrySearch(e.target.value)}
                                placeholder="Search countries…"
                                className="w-full px-3 py-2 text-sm theme-bg-well border theme-border rounded-lg theme-text-main focus:border-[#065907] focus:outline-none"
                                onClick={e => e.stopPropagation()}
                              />
                            </div>
                            <div className="max-h-52 overflow-y-auto">
                              {["Afghanistan","Albania","Algeria","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahrain","Bangladesh","Belarus","Belgium","Bolivia","Bosnia and Herzegovina","Brazil","Bulgaria","Cambodia","Canada","Chile","China","Colombia","Croatia","Cyprus","Czech Republic","Denmark","Ecuador","Egypt","El Salvador","Estonia","Ethiopia","Finland","France","Georgia","Germany","Ghana","Greece","Guatemala","Honduras","Hungary","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Latvia","Lebanon","Libya","Lithuania","Luxembourg","Malaysia","Mexico","Moldova","Morocco","Myanmar","Nepal","Netherlands","New Zealand","Nicaragua","Nigeria","Norway","Oman","Pakistan","Panama","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Saudi Arabia","Senegal","Serbia","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria","Taiwan","Tanzania","Thailand","Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zimbabwe"]
                                .filter(c => c.toLowerCase().includes(countrySearch.toLowerCase()))
                                .map(c => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => { setCountry(c); setCountryOpen(false); setCountrySearch(""); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm theme-text-main hover:bg-green-50 dark:hover:bg-green-950/30 transition ${country === c ? "bg-green-50 dark:bg-green-950/30 text-[#065907] dark:text-green-400 font-semibold" : ""}`}
                                  >
                                    {c}
                                  </button>
                                ))
                              }
                            </div>
                          </div>
                        )}
                        <input type="hidden" required value={country} />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Traffic Information */}
                {registerStep === 3 && (
                  <div className="space-y-5 animate-fadeIn">
                    <div>
                      <h3 className="text-base font-bold flex items-center gap-2 mb-0.5" style={{ color: "#0f172a" }}>
                        <Globe className="w-4 h-4 text-[#065907]" /> Traffic & Promotion Methods
                      </h3>
                      <p className="text-xs font-medium" style={{ color: "#475569" }}>Tell us about your traffic sources and promotion strategy.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide leading-tight" style={{ color: "#334155" }}>
                          Affiliate Experience?
                        </label>
                        <input
                          type="text"
                          required
                          value={affiliateDuration}
                          onChange={(e) => setAffiliateDuration(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 bg-slate-50 border theme-border rounded-xl theme-text-main"
                          placeholder="e.g. 4 Years"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wide leading-tight" style={{ color: "#334155" }}>
                          Monthly traffic volume?
                        </label>
                        <input
                          type="text"
                          required
                          value={monthlyTrafficVolume}
                          onChange={(e) => setMonthlyTrafficVolume(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 bg-slate-50 border theme-border rounded-xl theme-text-main"
                          placeholder="e.g. 150,000 Click Hits"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>Current affiliate networks</label>
                      <input
                        type="text"
                        required
                        value={currentNetworks}
                        onChange={(e) => setCurrentNetworks(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main"
                        placeholder="e.g. OGAds, ClickDealer, MaxBounty"
                      />
                    </div>

                    {/* niches vertical free text field! NO DROPDOWN */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>
                        Main niches / Verticals
                      </label>
                      <input
                        type="text"
                        required
                        value={mainNiches}
                        onChange={(e) => setMainNiches(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 theme-bg-well border border-[#065907]/40 rounded-xl theme-text-main font-semibold"
                        placeholder="e.g. Finance leads, mobile helper apps utility overlays, locked content"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>Describe Your Traffic Sources</label>
                      <textarea
                        required
                        rows={2}
                        value={trafficSources}
                        onChange={(e) => setTrafficSources(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 theme-bg-well border theme-border rounded-xl theme-text-main text-xs"
                        placeholder="Explain how users find your links (e.g. organic TikTok content, native RevContent banners)..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>Describe your promotion methods</label>
                      <textarea
                        required
                        rows={2}
                        value={promotionMethods}
                        onChange={(e) => setPromotionMethods(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 theme-bg-well border theme-border rounded-xl theme-text-main text-xs"
                        placeholder="Explain conversion techniques (e.g. standard reward locker page, direct pre-landers, email lists)..."
                      />
                    </div>

                  </div>
                )}

                {/* STEP 4: Contact Information */}
                {registerStep === 4 && (
                  <div className="space-y-5 animate-fadeIn">
                    <div>
                      <h3 className="text-base font-bold flex items-center gap-2 mb-0.5" style={{ color: "#0f172a" }}>
                        <Send className="w-4 h-4 text-[#065907]" /> Instant Messaging Contacts
                      </h3>
                      <p className="text-xs font-medium" style={{ color: "#475569" }}>
                        Provide your contact handles so our affiliate managers can reach you directly.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>Telegram Username</label>
                      <input
                        type="text"
                        required
                        value={telegramUsername}
                        onChange={(e) => setTelegramUsername(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 theme-bg-well border border-[#065907]/30 rounded-xl theme-text-main font-mono"
                        placeholder="e.g. @johndoe_traffic"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>Microsoft Teams ID</label>
                      <input
                        type="text"
                        required
                        value={teamsId}
                        onChange={(e) => setTeamsId(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 theme-bg-well border border-[#065907]/30 rounded-xl theme-text-main font-mono"
                        placeholder="e.g. live:johndoe_media"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: "#334155" }}>WhatsApp Address (Optional)</label>
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main font-mono"
                        placeholder="e.g. +1-555-019-2182"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5: Dynamic Signup Questions (only shown when questions exist) */}
                {registerStep === 5 && publisherQuestions.length > 0 && (
                  <div className="space-y-5 animate-fadeIn">
                    <div>
                      <h3 className="text-base font-bold flex items-center gap-2 mb-0.5" style={{ color: "#0f172a" }}>
                        <HelpCircle className="w-4 h-4 text-[#065907]" /> Additional Questions
                      </h3>
                      <p className="text-xs font-medium" style={{ color: "#475569" }}>Please answer the following questions to complete your application.</p>
                    </div>
                    {publisherQuestions.map((q) => (
                      <DynamicQuestionField
                        key={q.id}
                        question={q}
                        value={dynAnswers[q.id] ?? ""}
                        onChange={(val) => setDynAnswers((prev) => ({ ...prev, [q.id]: val }))}
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                )}

                {/* Terms & Conditions & Anti Fraud & Submit */}
                {registerStep === termsStep && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-5 animate-fadeIn">
                    <div>
                      <h3 className="text-base font-bold flex items-center gap-2 mb-0.5" style={{ color: "#0f172a" }}>
                        <FileText className="w-4 h-4 text-[#065907]" /> Agreements & Verification
                      </h3>
                      <p className="text-xs font-medium" style={{ color: "#475569" }}>Review and accept the terms before submitting your application.</p>
                    </div>

                    <div className="space-y-3">
                      
                      {/* Anti Fraud agreement block */}
                      <div className="theme-bg-well p-3.5 rounded-xl border border-rose-350 dark:border-rose-950/60 flex items-start gap-2.5">
                        <input
                          id="antifraud"
                          type="checkbox"
                          checked={antiFraudChecked}
                          onChange={(e) => setAntiFraudChecked(e.target.checked)}
                          className="mt-0.5 h-4.5 w-4.5 rounded text-[#065907] cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <label htmlFor="antifraud" className="font-bold text-rose-700 dark:text-rose-400 block cursor-pointer select-none">
                            Strict Anti-Fraud Agreement
                          </label>
                          <p className="text-[10px] theme-text-secondary leading-normal">
                            I affirm that I will never purchase fake leads, inject cookie stuffing script overlays, simulate automated click bots, hijack IP proxies or cloakers, or participate in illegal conversion systems. I accept that suspicion of fraud triggers immediate lifetime account suspension and forfeiture of all balances.
                          </p>
                        </div>
                      </div>

                      {/* General publisher terms */}
                      <div className="theme-bg-well p-3.5 rounded-xl border theme-border flex items-start gap-2.5">
                        <input
                          id="generalterms"
                          type="checkbox"
                          checked={termsChecked}
                          onChange={(e) => setTermsChecked(e.target.checked)}
                          className="mt-0.5 h-4.5 w-4.5 rounded text-[#065907] cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <label htmlFor="generalterms" className="font-bold theme-text-main block cursor-pointer select-none">
                            Publisher Terms of Service (TOS)
                          </label>
                          <p className="text-[10px] theme-text-secondary leading-normal">
                            I agree to the publisher terms, payouts timing conditions (NET-15 standard holds), mandatory S2S reconciliations parameters, and tax identity documentation requests.
                          </p>
                        </div>
                      </div>

                      {/* CAPTCHA: Turnstile when enabled, math puzzle otherwise */}
                      {branding.turnstileEnabled ? (
                        <div className="bg-green-50/50 dark:bg-green-950/20 p-4 border border-[#065907]/20 dark:border-[#065907]/30 rounded-xl space-y-2 text-center">
                          <span className="font-bold text-[#065907] dark:text-green-400 font-mono block text-[10px] uppercase">
                            Bot Protection
                          </span>
                          <div className="flex justify-center">
                            <TurnstileWidget
                              siteKey={branding.turnstileSiteKey}
                              onVerify={(token) => setTurnstileToken(token)}
                              onExpire={() => setTurnstileToken("")}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-green-50/50 dark:bg-green-950/20 p-4 border border-[#065907]/20 dark:border-[#065907]/30 rounded-xl space-y-2 text-center">
                          <span className="font-bold text-[#065907] dark:text-green-400 font-mono block text-[10px] uppercase">
                            Secure Anti-Bot Gate Check
                          </span>
                          <div className="flex items-center justify-center gap-1.5 py-1 text-sm font-black font-mono">
                            <span className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{captchaA}</span>
                            <span>+</span>
                            <span className="text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{captchaB}</span>
                            <span>=</span>
                            <input
                              type="text"
                              maxLength={3}
                              value={captchaAnswer}
                              onChange={(e) => setCaptchaAnswer(e.target.value)}
                              className={`w-12 text-center px-1 py-1 rounded font-mono font-bold text-slate-900 dark:text-white border ${
                                captchaError
                                  ? "border-rose-500 bg-rose-50 dark:bg-rose-950"
                                  : "border-[#065907]/50 bg-white dark:bg-slate-950"
                              }`}
                              placeholder="?"
                            />
                          </div>
                          <p className="text-[9px] theme-text-muted font-mono">
                            Perform calculation dynamically to prove human authority.
                          </p>
                        </div>
                      )}

                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-black py-3 rounded-xl uppercase font-mono tracking-wider text-xs select-none cursor-pointer text-center block"
                    >
                      {isLoading ? "Verifying Token Handshake..." : "Submit Affiliate Proposal Application"}
                    </button>

                  </form>
                )}

              </div>

              {/* Steps control nav handles */}
              <div className="flex justify-between items-center pt-2 select-none">
                {registerStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevRegisterStep}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold rounded-xl theme-text-main transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Prev Step
                  </button>
                ) : (
                  <div></div>
                )}

                {registerStep < termsStep && (
                  <button
                    type="button"
                    onClick={nextRegisterStep}
                    className="flex items-center gap-1.5 px-5 py-2 bg-[#065907] hover:bg-[#074a08] text-xs font-semibold rounded-xl transition cursor-pointer font-mono uppercase"
                    style={{ color: '#FFFFFF' }}
                  >
                    Next Step <ArrowRight className="w-3.5 h-3.5" style={{ color: '#FFFFFF' }} />
                  </button>
                )}
              </div>

            </div>
          )}

          {/* SCREEN 3: FORGOT PASSWORD VIEW */}
          {currentView === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold theme-text-muted uppercase tracking-wider font-mono">
                  Registered Account Email
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main text-xs focus:border-[#065907] focus:outline-none transition shadow-xs font-mono"
                    placeholder="e.g. register@partner.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#065907] hover:bg-[#074a08] text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors duration-150 shadow-md cursor-pointer"
              >
                {isLoading ? "Asserting AES HSM Token..." : "Initiate OTP Recovery Checkpoint"}
              </button>
            </form>
          )}


          {/* Links navigation switches */}
          <div className="mt-6 pt-4 border-t theme-border text-center text-xs theme-text-secondary space-y-3">
            
            {currentView === "login" && (
              <div>
                First time applying for an account?{" "}
                <button
                  type="button"
                  onClick={() => { setErrorMessage(""); setSuccessMessage(""); setView("register"); setRegisterStep(1); }}
                  className="text-[#065907] hover:underline font-bold cursor-pointer"
                >
                  Apply to Become a Publisher
                </button>
              </div>
            )}

            {currentView === "login" && onAdvertiserSignup && (
              <div>
                Are you an advertiser?{" "}
                <button
                  type="button"
                  onClick={onAdvertiserSignup}
                  className="text-[#065907] hover:underline font-bold cursor-pointer"
                >
                  Sign up here
                </button>
              </div>
            )}

            {(currentView === "register" || currentView === "forgot") && (
              <div>
                Already have active credentials?{" "}
                <button
                  type="button"
                  onClick={() => { setErrorMessage(""); setSuccessMessage(""); setView("login"); }}
                  className="text-[#065907] hover:underline font-bold cursor-pointer"
                >
                  Return to secure portal Login
                </button>
              </div>
            )}

            {currentView === "login" && (
              <div className="text-center pt-1 text-[10px] theme-text-muted font-sans uppercase">
                Secure SSL Encrypted Connection
              </div>
            )}

            {currentView === "login" && (branding.loginDomain || branding.supportEmail) && (
              <div className="text-center text-[10px] theme-text-muted space-y-1 pt-1 lg:hidden">
                {branding.loginDomain && (
                  <div>Portal: <span className="font-mono">{branding.loginDomain}</span></div>
                )}
                {branding.supportEmail && (
                  <div>Support: <a href={`mailto:${branding.supportEmail}`} className="text-[#065907] hover:underline font-mono">{branding.supportEmail}</a></div>
                )}
              </div>
            )}

          </div>

          </div>{/* end inner padding div */}
        </div>
      </div>

      </div>{/* end right panel */}
    </div>
  );
}
