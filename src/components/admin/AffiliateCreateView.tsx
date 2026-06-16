import React, { useEffect, useMemo, useState } from "react";
import { createAffiliate, getManagers, ManagerRecord } from "../../services/publishers";

const COUNTRY_TO_ISO: Record<string, string> = {
  "United States": "US",
  "Canada": "CA",
  "United Kingdom": "GB",
  "Brazil": "BR",
  "India": "IN",
  "Spain": "ES",
  "Poland": "PL",
  "Australia": "AU",
};

const STATUS_MAP: Record<StatusOption, "PENDING" | "ACTIVE" | "SUSPENDED"> = {
  Pending: "PENDING",
  Active: "ACTIVE",
  Disabled: "SUSPENDED",
};

const countryOptions = [
  "United States",
  "Canada",
  "United Kingdom",
  "Brazil",
  "India",
  "Spain",
  "Poland",
  "Australia",
];

const trackingDomains = ["track.apextrack.com", "go.affilinet.com", "secure.clickhub.io", "trk.trafficflow.net"];
const trafficSources = ["Facebook", "Google Ads", "Native Push", "Email", "Taboola", "Custom DSP"];
const statusOptions = ["Pending", "Active", "Disabled"] as const;

type StatusOption = (typeof statusOptions)[number];

type FieldState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  telegramId: string;
  skypeId: string;
  whatsapp: string;
  status: StatusOption;
  manager: string;
  domain: string;
  trafficSource: string;
  postbackUrl: string;
};

interface AffiliateCreateViewProps {
  onSuccess?: () => void;
}

export function AffiliateCreateView({ onSuccess }: AffiliateCreateViewProps) {
  const [fields, setFields] = useState<FieldState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    telegramId: "",
    skypeId: "",
    whatsapp: "",
    status: "Pending",
    manager: "",
    domain: trackingDomains[0],
    trafficSource: trafficSources[0],
    postbackUrl: "",
  });

  const [touched, setTouched] = useState<Record<keyof FieldState, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    country: false,
    telegramId: false,
    skypeId: false,
    whatsapp: false,
    status: false,
    manager: false,
    domain: false,
    trafficSource: false,
    postbackUrl: false,
  });

  const [managers, setManagers] = useState<ManagerRecord[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    getManagers().then(setManagers).catch(() => {});
  }, []);

  const sampleAffiliateId = useMemo(() => {
    const id = Math.floor(1000 + Math.random() * 8999);
    return `APX-${id}`;
  }, []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email);
  const passwordValid = fields.password.length >= 8;
  const confirmPasswordValid = fields.password === fields.confirmPassword && fields.confirmPassword.length > 0;
  const postbackValid = fields.postbackUrl === "" || /^(https?:\/\/).+/.test(fields.postbackUrl);
  const requiredFieldsValid =
    fields.firstName.trim() !== "" &&
    fields.lastName.trim() !== "" &&
    emailValid &&
    passwordValid &&
    confirmPasswordValid &&
    fields.country !== "" &&
    (fields.status as string) !== "" &&
    fields.domain !== "" &&
    fields.trafficSource !== "" &&
    postbackValid;

  const handleChange = (key: keyof FieldState) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFields((current) => ({ ...current, [key]: event.target.value }));
  };

  const handleBlur = (key: keyof FieldState) => () => {
    setTouched((current) => ({ ...current, [key]: true }));
  };

  const resetForm = () => {
    setFields({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      country: "",
      telegramId: "",
      skypeId: "",
      whatsapp: "",
      status: "Pending",
      manager: "",
      domain: trackingDomains[0],
      trafficSource: trafficSources[0],
      postbackUrl: "",
    });
    setTouched({
      firstName: false,
      lastName: false,
      email: false,
      password: false,
      confirmPassword: false,
      country: false,
      telegramId: false,
      skypeId: false,
      whatsapp: false,
      status: false,
      manager: false,
      domain: false,
      trafficSource: false,
      postbackUrl: false,
    });
    setSubmitError(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await createAffiliate({
        first_name: fields.firstName.trim(),
        last_name: fields.lastName.trim(),
        email: fields.email.trim().toLowerCase(),
        password: fields.password,
        country_code: COUNTRY_TO_ISO[fields.country] ?? fields.country,
        status: STATUS_MAP[fields.status],
        assigned_manager_id: fields.manager || null,
        telegram: fields.telegramId.trim() || null,
        skype: fields.skypeId.trim() || null,
        whatsapp: fields.whatsapp.trim() || null,
        tracking_domain: fields.domain || null,
        traffic_source: fields.trafficSource || null,
        postback_url: fields.postbackUrl.trim() || null,
      });
      onSuccess?.();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create affiliate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (isError: boolean) =>
    `w-full rounded-2xl border px-4 py-3 text-sm theme-text-main focus:outline-none ${
      isError ? "border-rose-300 bg-rose-50" : "theme-border bg-white"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Affiliates</div>
          <h2 className="mt-2 text-2xl font-black theme-text-main">Create Affiliate</h2>
          <p className="mt-2 text-sm theme-text-muted max-w-2xl">
            Create a new affiliate profile with account settings, tracking domains, and source assignments.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Basic Information</div>
                <p className="mt-2 text-sm theme-text-muted">Capture the affiliate's name, login email, and communication IDs.</p>
              </div>
              <span className="rounded-full border theme-border bg-slate-50 px-3 py-1 text-[11px] font-semibold theme-text-secondary">Required</span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">First Name</span>
                <input
                  type="text"
                  value={fields.firstName}
                  onChange={handleChange("firstName")}
                  onBlur={handleBlur("firstName")}
                  className={inputClass(touched.firstName && fields.firstName.trim() === "")}
                  placeholder="Avery"
                />
                {touched.firstName && fields.firstName.trim() === "" && (
                  <p className="text-rose-600 text-xs">First name is required.</p>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Last Name</span>
                <input
                  type="text"
                  value={fields.lastName}
                  onChange={handleChange("lastName")}
                  onBlur={handleBlur("lastName")}
                  className={inputClass(touched.lastName && fields.lastName.trim() === "")}
                  placeholder="Chan"
                />
                {touched.lastName && fields.lastName.trim() === "" && (
                  <p className="text-rose-600 text-xs">Last name is required.</p>
                )}
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Email</span>
                <input
                  type="email"
                  value={fields.email}
                  onChange={handleChange("email")}
                  onBlur={handleBlur("email")}
                  className={inputClass(touched.email && !emailValid)}
                  placeholder="avery.chan@example.com"
                />
                {touched.email && !fields.email && (
                  <p className="text-rose-600 text-xs">Email is required.</p>
                )}
                {touched.email && fields.email && !emailValid && (
                  <p className="text-rose-600 text-xs">Enter a valid email address.</p>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Password</span>
                <input
                  type="password"
                  value={fields.password}
                  onChange={handleChange("password")}
                  onBlur={handleBlur("password")}
                  className={inputClass(touched.password && !passwordValid)}
                  placeholder="Create a secure password"
                />
                {touched.password && !fields.password && (
                  <p className="text-rose-600 text-xs">Password is required.</p>
                )}
                {touched.password && fields.password && !passwordValid && (
                  <p className="text-rose-600 text-xs">Password must be at least 8 characters.</p>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Confirm Password</span>
                <input
                  type="password"
                  value={fields.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  className={inputClass(touched.confirmPassword && !confirmPasswordValid)}
                  placeholder="Confirm the password"
                />
                {touched.confirmPassword && !fields.confirmPassword && (
                  <p className="text-rose-600 text-xs">Confirmation is required.</p>
                )}
                {touched.confirmPassword && fields.confirmPassword && !confirmPasswordValid && (
                  <p className="text-rose-600 text-xs">Passwords must match.</p>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Country</span>
                <select
                  value={fields.country}
                  onChange={handleChange("country")}
                  onBlur={handleBlur("country")}
                  className={inputClass(touched.country && fields.country === "")}
                >
                  <option value="">Select country</option>
                  {countryOptions.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {touched.country && fields.country === "" && (
                  <p className="text-rose-600 text-xs">Country is required.</p>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Telegram ID</span>
                <input
                  type="text"
                  value={fields.telegramId}
                  onChange={handleChange("telegramId")}
                  onBlur={handleBlur("telegramId")}
                  className={inputClass(false)}
                  placeholder="@avery_affiliate"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Skype ID</span>
                <input
                  type="text"
                  value={fields.skypeId}
                  onChange={handleChange("skypeId")}
                  onBlur={handleBlur("skypeId")}
                  className={inputClass(false)}
                  placeholder="avery.chan"
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">WhatsApp</span>
                <input
                  type="text"
                  value={fields.whatsapp}
                  onChange={handleChange("whatsapp")}
                  onBlur={handleBlur("whatsapp")}
                  className={inputClass(false)}
                  placeholder="+1 555 555 0123"
                />
              </label>
            </div>
          </section>

          <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Tracking</div>
              <p className="mt-2 text-sm theme-text-muted">Define the default tracking domain and traffic source for this affiliate.</p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Default Tracking Domain</span>
                <select
                  value={fields.domain}
                  onChange={handleChange("domain")}
                  onBlur={handleBlur("domain")}
                  className={inputClass(touched.domain && fields.domain === "")}
                >
                  {trackingDomains.map((domain) => (
                    <option key={domain} value={domain}>
                      {domain}
                    </option>
                  ))}
                </select>
                {touched.domain && fields.domain === "" && (
                  <p className="text-rose-600 text-xs">Tracking domain is required.</p>
                )}
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Traffic Source</span>
                <select
                  value={fields.trafficSource}
                  onChange={handleChange("trafficSource")}
                  onBlur={handleBlur("trafficSource")}
                  className={inputClass(touched.trafficSource && fields.trafficSource === "")}
                >
                  {trafficSources.map((source) => (
                    <option key={source} value={source}>
                      {source}
                    </option>
                  ))}
                </select>
                {touched.trafficSource && fields.trafficSource === "" && (
                  <p className="text-rose-600 text-xs">Traffic source is required.</p>
                )}
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Postback URL</span>
                <input
                  type="text"
                  value={fields.postbackUrl}
                  onChange={handleChange("postbackUrl")}
                  onBlur={handleBlur("postbackUrl")}
                  className={inputClass(touched.postbackUrl && !postbackValid)}
                  placeholder="https://your.server.com/postback?click_id={clickid}&status={status}"
                />
                {touched.postbackUrl && fields.postbackUrl && !postbackValid && (
                  <p className="text-rose-600 text-xs">Enter a valid URL starting with http:// or https://</p>
                )}
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Account Settings</div>
              <p className="mt-2 text-sm theme-text-muted">Configure affiliate account status, ID, and manager assignment.</p>
            </div>

            <div className="mt-6 space-y-4">
              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Affiliate ID</span>
                <input type="text" value={sampleAffiliateId} readOnly className="w-full rounded-2xl border theme-border bg-slate-50 px-4 py-3 text-sm theme-text-main" />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Status</span>
                <select
                  value={fields.status}
                  onChange={handleChange("status")}
                  onBlur={handleBlur("status")}
                  className={inputClass(touched.status && (fields.status as string) === "")}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {touched.status && (fields.status as string) === "" && (
                  <p className="text-rose-600 text-xs">Status is required.</p>
                )}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Assign Manager</span>
                <select
                  value={fields.manager}
                  onChange={handleChange("manager")}
                  onBlur={handleBlur("manager")}
                  className={inputClass(false)}
                >
                  <option value="">No manager assigned</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Actions</div>
              </div>
            </div>

            {submitError && (
              <p className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                {submitError}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                disabled={!requiredFieldsValid || isSubmitting}
                onClick={handleSubmit}
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                  requiredFieldsValid && !isSubmitting
                    ? "bg-cyan-600 text-white hover:bg-cyan-500"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Creating..." : "Create Affiliate"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-full border theme-border bg-white px-6 py-3 text-sm font-semibold theme-text-secondary hover:bg-slate-100 transition"
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
