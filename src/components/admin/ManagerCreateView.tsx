import React, { useState } from "react";
import { createManager } from "../../services/managers";

export function ManagerCreateView() {
  const [fields, setFields] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    telegram: "",
    teams: "",
    isActive: true,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email);
  const passwordValid = fields.password.length >= 8;
  const confirmValid = fields.password === fields.confirmPassword && fields.confirmPassword.length > 0;

  const canSubmit =
    fields.fullName.trim() !== "" &&
    emailValid &&
    passwordValid &&
    confirmValid &&
    !submitting;

  const inputClass = (isError: boolean) =>
    `w-full rounded-2xl border px-4 py-3 text-sm theme-text-main focus:outline-none ${
      isError ? "border-rose-300 bg-rose-50" : "theme-border bg-white dark:bg-slate-950"
    }`;

  const handleChange =
    (key: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.type === "checkbox"
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
      setFields((s) => ({ ...s, [key]: value }));
    };

  const handleBlur = (key: string) => () =>
    setTouched((t) => ({ ...t, [key]: true }));

  const resetForm = () => {
    setFields({ fullName: "", email: "", password: "", confirmPassword: "", telegram: "", teams: "", isActive: true });
    setTouched({});
    setSubmitError(null);
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    if (!canSubmit) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await createManager({
        full_name: fields.fullName.trim(),
        email: fields.email.trim().toLowerCase(),
        password: fields.password,
        telegram: fields.telegram.trim() || undefined,
        teams: fields.teams.trim() || undefined,
        is_active: fields.isActive,
      });
      setSubmitted(true);
      resetForm();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create manager");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Managers</div>
        <h2 className="mt-2 text-2xl font-black theme-text-main">Create Manager</h2>
        <p className="mt-2 text-sm theme-text-muted max-w-2xl">Add a new affiliate manager account. Managers can log in to review and manage assigned affiliates.</p>
      </div>

      {submitted && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-sm text-emerald-800 font-semibold">
          Manager created successfully.
        </div>
      )}

      {submitError && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-sm text-rose-700 font-semibold">
          {submitError}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
            <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Manager Information</div>
            <p className="mt-1 text-sm theme-text-muted">Login credentials for the manager portal.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Full Name</span>
                <input
                  placeholder="Jordan Miles"
                  value={fields.fullName}
                  onChange={handleChange("fullName")}
                  onBlur={handleBlur("fullName")}
                  className={inputClass(touched["fullName"] && fields.fullName.trim() === "")}
                />
                {touched["fullName"] && fields.fullName.trim() === "" && (
                  <p className="text-rose-600 text-xs">Full name is required.</p>
                )}
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Email</span>
                <input
                  type="email"
                  placeholder="jordan.miles@apextrack.com"
                  value={fields.email}
                  onChange={handleChange("email")}
                  onBlur={handleBlur("email")}
                  className={inputClass(touched["email"] && !emailValid)}
                />
                {touched["email"] && !fields.email && <p className="text-rose-600 text-xs">Email is required.</p>}
                {touched["email"] && fields.email && !emailValid && (
                  <p className="text-rose-600 text-xs">Enter a valid email address.</p>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Password</span>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={fields.password}
                  onChange={handleChange("password")}
                  onBlur={handleBlur("password")}
                  className={inputClass(touched["password"] && !passwordValid)}
                />
                {touched["password"] && !fields.password && <p className="text-rose-600 text-xs">Password is required.</p>}
                {touched["password"] && fields.password && !passwordValid && (
                  <p className="text-rose-600 text-xs">Password must be at least 8 characters.</p>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Confirm Password</span>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={fields.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  className={inputClass(touched["confirmPassword"] && !confirmValid)}
                />
                {touched["confirmPassword"] && !fields.confirmPassword && (
                  <p className="text-rose-600 text-xs">Confirmation is required.</p>
                )}
                {touched["confirmPassword"] && fields.confirmPassword && !confirmValid && (
                  <p className="text-rose-600 text-xs">Passwords must match.</p>
                )}
              </label>
            </div>
          </section>

          <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
            <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Contact Handles</div>
            <p className="mt-1 text-sm theme-text-muted">Optional messaging handles for affiliate communication.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Telegram Username</span>
                <input
                  placeholder="@username"
                  value={fields.telegram}
                  onChange={handleChange("telegram")}
                  className={inputClass(false)}
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Teams Username</span>
                <input
                  placeholder="username@company.com"
                  value={fields.teams}
                  onChange={handleChange("teams")}
                  className={inputClass(false)}
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
            <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Status</div>
            <p className="mt-1 text-sm theme-text-muted">Manager portal access status.</p>

            <div className="mt-6">
              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Account Status</span>
                <select
                  value={fields.isActive ? "active" : "disabled"}
                  onChange={(e) =>
                    setFields((s) => ({ ...s, isActive: e.target.value === "active" }))
                  }
                  className={inputClass(false)}
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </label>
            </div>
          </section>

          <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                  canSubmit
                    ? "bg-cyan-600 text-white hover:bg-cyan-500"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              >
                {submitting ? "Creating…" : "Create Manager"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center rounded-full border theme-border bg-white dark:bg-slate-950 px-6 py-3 text-sm font-semibold theme-text-secondary hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              >
                Reset
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
