import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Clock, XCircle, Loader2, RefreshCw, ArrowRight } from "lucide-react";
import { verifyEmailToken, resendVerificationEmail } from "../services/verification";
import { useBranding } from "../contexts/BrandingContext";

type VerifyStatus = "loading" | "verified" | "already_verified" | "expired" | "invalid";

interface Props {
  token: string;
  onGoToLogin: () => void;
}

export function VerifyEmailScreen({ token, onGoToLogin }: Props) {
  const branding = useBranding();
  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [userType, setUserType] = useState<"publisher" | "advertiser" | undefined>();
  const [resendEmail, setResendEmail] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(60);
    const iv = setInterval(() => {
      setCooldown((c) => { if (c <= 1) { clearInterval(iv); return 0; } return c - 1; });
    }, 1000);
  };

  useEffect(() => {
    verifyEmailToken(token)
      .then((result) => {
        setStatus(result.status as VerifyStatus);
        setUserType(result.user_type);
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const handleResend = async () => {
    if (!resendEmail.includes("@") || !userType) return;
    setResending(true);
    setResendMsg("");
    try {
      await resendVerificationEmail(resendEmail, userType);
      setResendMsg("Verification email sent. Check your inbox.");
      startCooldown();
    } catch (e: unknown) {
      setResendMsg(e instanceof Error ? e.message : "Failed to resend.");
    } finally {
      setResending(false);
    }
  };

  const CARD = "min-h-screen theme-bg-page flex items-center justify-center p-6";
  const INNER = "w-full max-w-md theme-bg-card border theme-border rounded-3xl p-8 shadow-lg text-center space-y-5";

  if (status === "loading") {
    return (
      <div className={CARD}>
        <div className={INNER}>
          <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mx-auto" />
          <p className="text-sm theme-text-muted">Verifying your email…</p>
        </div>
      </div>
    );
  }

  if (status === "verified") {
    return (
      <div className={CARD}>
        <div className={INNER}>
          <div className="flex justify-center">
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-2xl font-black theme-text-main">Email Verified!</h1>
          <p className="text-sm theme-text-muted leading-relaxed">
            Your email address has been verified. You can now sign in to your{" "}
            {userType === "advertiser" ? "advertiser" : "affiliate"} account.
          </p>
          <button
            onClick={onGoToLogin}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
          >
            Sign In <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (status === "already_verified") {
    return (
      <div className={CARD}>
        <div className={INNER}>
          <div className="flex justify-center">
            <div className="rounded-full bg-cyan-100 dark:bg-cyan-900/30 p-4">
              <CheckCircle2 className="w-10 h-10 text-cyan-500" />
            </div>
          </div>
          <h1 className="text-2xl font-black theme-text-main">Already Verified</h1>
          <p className="text-sm theme-text-muted leading-relaxed">
            This email address has already been verified. You can sign in to your account.
          </p>
          <button
            onClick={onGoToLogin}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
          >
            Sign In <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className={CARD}>
        <div className={INNER}>
          <div className="flex justify-center">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-4">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
          </div>
          <h1 className="text-2xl font-black theme-text-main">Link Expired</h1>
          <p className="text-sm theme-text-muted leading-relaxed">
            This verification link has expired. Links are valid for 24 hours.
            Enter your email below to receive a new verification link.
          </p>
          <div className="space-y-3 text-left">
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
            <button
              onClick={handleResend}
              disabled={resending || !resendEmail.includes("@") || cooldown > 0}
              className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition disabled:opacity-50"
            >
              {resending ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              {resending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Send New Verification Email"}
            </button>
            {resendMsg && (
              <p className={`text-xs text-center ${resendMsg.includes("sent") ? "text-emerald-600" : "text-rose-500"}`}>
                {resendMsg}
              </p>
            )}
          </div>
          <button onClick={onGoToLogin} className="text-xs theme-text-muted hover:text-cyan-600 transition">
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  // invalid
  return (
    <div className={CARD}>
      <div className={INNER}>
        <div className="flex justify-center">
          <div className="rounded-full bg-rose-100 dark:bg-rose-900/30 p-4">
            <XCircle className="w-10 h-10 text-rose-500" />
          </div>
        </div>
        <h1 className="text-2xl font-black theme-text-main">Invalid Link</h1>
        <p className="text-sm theme-text-muted leading-relaxed">
          This verification link is invalid or has already been used. If you need a new link,
          please sign up again or contact support.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onGoToLogin}
            className="inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
          >
            Back to Sign In <ArrowRight className="w-4 h-4" />
          </button>
          {branding.supportEmail && (
            <a
              href={`mailto:${branding.supportEmail}`}
              className="text-xs theme-text-muted hover:text-cyan-600 transition"
            >
              Contact support: {branding.supportEmail}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
