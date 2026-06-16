import { useState } from "react";
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useBranding } from "../contexts/BrandingContext";
import { resetPassword } from "../services/auth";

interface ResetPasswordScreenProps {
  token: string;
  onGoToLogin: () => void;
}

export function ResetPasswordScreen({ token, onGoToLogin }: ResetPasswordScreenProps) {
  const branding = useBranding();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err: unknown) {
      setError((err as Error).message || "Password reset failed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-5">
          <div className="flex justify-center">
            <div className="rounded-full bg-emerald-100 p-4">
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-xl font-black text-slate-900">Password Reset</h2>
          <p className="text-sm text-slate-600">
            Your password has been updated. You can now log in with your new credentials.
          </p>
          <button
            onClick={onGoToLogin}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-xl text-sm transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-1">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.networkName} className="h-10 mx-auto object-contain" />
          ) : (
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-600">{branding.networkName}</p>
          )}
          <h2 className="text-xl font-black text-slate-900 mt-3">Set New Password</h2>
          <p className="text-sm text-slate-500">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repeat new password"
                required
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-600 text-sm bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition"
          >
            {isLoading ? "Updating…" : "Reset Password"}
          </button>
        </form>

        <button
          onClick={onGoToLogin}
          className="w-full text-center text-xs text-slate-500 hover:text-cyan-600 transition"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
