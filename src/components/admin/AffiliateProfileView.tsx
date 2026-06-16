import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Save,
  KeyRound,
} from "lucide-react";
import * as publishersApi from "../../services/publishers";

interface AffiliateProfileViewProps {
  affiliate: {
    publisherId: string;
    assignedManagerId: string | null;
    id: string;
    registrationDate: string;
    fullName: string;
    email: string;
    country: string;
    manager: string;
    status: "Pending" | "Active" | "Disabled";
  };
  onBack: () => void;
}

type AffiliateStatus = "Pending" | "Active" | "Disabled";

function mapAccountStatus(apiStatus: string): AffiliateStatus {
  const s = apiStatus.toLowerCase();
  if (s === "active") return "Active";
  if (s === "pending") return "Pending";
  return "Disabled";
}

const statusClasses: Record<AffiliateStatus, string> = {
  Pending: "bg-amber-100 text-amber-800 border border-amber-200",
  Active: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  Disabled: "bg-rose-100 text-rose-800 border border-rose-200",
};

const inputCls =
  "w-full rounded-2xl border theme-border bg-white px-3 py-2 text-sm theme-text-main focus:outline-none focus:border-cyan-400 placeholder:text-slate-400";
const labelCls = "block text-xs uppercase tracking-[0.2em] font-bold theme-text-muted mb-1";

const PAYMENT_TERMS = ["Weekly", "Bi-Weekly", "Net7", "Net15", "Net30", "Net45"];
const ACCOUNT_STATUSES = ["pending", "active", "suspended", "blocked"];

interface ProfileForm {
  full_name: string;
  email: string;
  login_name: string;
  company_name: string;
  country_code: string;
  account_status: string;
  new_password: string;
  phone: string;
  telegram: string;
  skype: string;
  whatsapp: string;
  website: string;
  address: string;
  city: string;
  state_name: string;
  postal_code: string;
  payment_method: string;
  payment_details: string;
  payment_term: string;
  internal_notes: string;
  traffic_quality_notes: string;
  risk_score: string;
}

const emptyForm = (): ProfileForm => ({
  full_name: "",
  email: "",
  login_name: "",
  company_name: "",
  country_code: "",
  account_status: "pending",
  new_password: "",
  phone: "",
  telegram: "",
  skype: "",
  whatsapp: "",
  website: "",
  address: "",
  city: "",
  state_name: "",
  postal_code: "",
  payment_method: "",
  payment_details: "",
  payment_term: "",
  internal_notes: "",
  traffic_quality_notes: "",
  risk_score: "",
});

function metaStr(meta: Record<string, unknown> | null | undefined, key: string): string {
  if (!meta) return "";
  const v = meta[key];
  return typeof v === "string" ? v : "";
}

export function AffiliateProfileView({ affiliate: initialAffiliate, onBack }: AffiliateProfileViewProps) {
  const [displayName, setDisplayName] = useState(initialAffiliate.fullName);
  const [affiliateCode, setAffiliateCode] = useState(initialAffiliate.id);
  const [registrationDate, setRegistrationDate] = useState(initialAffiliate.registrationDate);
  const [currentStatus, setCurrentStatus] = useState<AffiliateStatus>(initialAffiliate.status);
  const [currentManager, setCurrentManager] = useState(initialAffiliate.manager);

  const [form, setForm] = useState<ProfileForm>(emptyForm());
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [managers, setManagers] = useState<publishersApi.ManagerRecord[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState(initialAffiliate.assignedManagerId || "");
  const [saveManagerLoading, setSaveManagerLoading] = useState(false);
  const [saveManagerError, setSaveManagerError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    setProfileLoading(true);
    setProfileError(null);
    publishersApi
      .getPublisherById(initialAffiliate.publisherId)
      .then((pub) => {
        const meta = pub.profile_metadata || {};
        setDisplayName(pub.full_name);
        setAffiliateCode(pub.affiliate_code);
        setRegistrationDate(pub.created_at.substring(0, 10));
        setCurrentStatus(mapAccountStatus(pub.account_status));
        setCurrentManager(pub.manager_name || "Unassigned");
        setSelectedManagerId(pub.assigned_manager_id || "");
        setForm({
          full_name: pub.full_name || "",
          email: pub.email || "",
          login_name: pub.login_name || "",
          company_name: pub.company_name || "",
          country_code: pub.country_code || "",
          account_status: pub.account_status?.toLowerCase() || "pending",
          new_password: "",
          phone: metaStr(meta, "phone"),
          telegram: metaStr(meta, "telegram"),
          skype: metaStr(meta, "skype"),
          whatsapp: metaStr(meta, "whatsapp"),
          website: metaStr(meta, "website"),
          address: metaStr(meta, "address"),
          city: metaStr(meta, "city"),
          state_name: metaStr(meta, "state_name"),
          postal_code: metaStr(meta, "postal_code"),
          payment_method: metaStr(meta, "payment_method"),
          payment_details: metaStr(meta, "payment_details"),
          payment_term: metaStr(meta, "payment_term"),
          internal_notes: metaStr(meta, "internal_notes"),
          traffic_quality_notes: metaStr(meta, "traffic_quality_notes"),
          risk_score: metaStr(meta, "risk_score"),
        });
      })
      .catch((err: any) => setProfileError(err.message || "Failed to load profile"))
      .finally(() => setProfileLoading(false));
  }, [initialAffiliate.publisherId]);

  useEffect(() => {
    publishersApi.getManagers().then(setManagers).catch(() => {});
  }, []);

  const set = (field: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSaveProfile = async () => {
    setSaveLoading(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const payload: publishersApi.UpdatePublisherProfilePayload = {
        full_name: form.full_name || undefined,
        email: form.email || undefined,
        login_name: form.login_name || undefined,
        company_name: form.company_name || undefined,
        country_code: form.country_code || undefined,
        account_status: form.account_status || undefined,
        new_password: form.new_password || undefined,
        phone: form.phone || undefined,
        telegram: form.telegram || undefined,
        skype: form.skype || undefined,
        whatsapp: form.whatsapp || undefined,
        website: form.website || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        state_name: form.state_name || undefined,
        postal_code: form.postal_code || undefined,
        payment_method: form.payment_method || undefined,
        payment_details: form.payment_details || undefined,
        payment_term: form.payment_term || undefined,
        internal_notes: form.internal_notes || undefined,
        traffic_quality_notes: form.traffic_quality_notes || undefined,
        risk_score: form.risk_score || undefined,
      };
      const updated = await publishersApi.updatePublisherProfile(initialAffiliate.publisherId, payload);
      setDisplayName(updated.full_name);
      setCurrentStatus(mapAccountStatus(updated.account_status));
      setForm((prev) => ({ ...prev, new_password: "" }));
      setSaveSuccess("Profile saved successfully.");
    } catch (err: any) {
      setSaveError(err.message || "Failed to save profile");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveManager = async () => {
    if (!selectedManagerId) return;
    setSaveManagerLoading(true);
    setSaveManagerError(null);
    try {
      const updated = await publishersApi.assignManager(initialAffiliate.publisherId, selectedManagerId);
      const managerName =
        updated.manager_name || managers.find((m) => m.id === selectedManagerId)?.full_name || "Assigned";
      setCurrentManager(managerName);
    } catch (err: any) {
      setSaveManagerError(err.message || "Failed to assign manager");
    } finally {
      setSaveManagerLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const updated = await publishersApi.approveAffiliate(initialAffiliate.publisherId);
      setCurrentStatus(mapAccountStatus(updated.account_status));
      setForm((prev) => ({ ...prev, account_status: updated.account_status.toLowerCase() }));
      setActionSuccess("Affiliate approved and activated.");
    } catch (err: any) {
      setActionError(err.message || "Failed to approve affiliate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisable = async () => {
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const updated = await publishersApi.disableAffiliate(initialAffiliate.publisherId);
      setCurrentStatus(mapAccountStatus(updated.account_status));
      setForm((prev) => ({ ...prev, account_status: updated.account_status.toLowerCase() }));
      setActionSuccess("Affiliate suspended.");
    } catch (err: any) {
      setActionError(err.message || "Failed to suspend affiliate");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-full p-2 hover:bg-slate-100 transition"
        >
          <ArrowLeft className="h-5 w-5 theme-text-main" />
        </button>
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Affiliate Profile</div>
          <h2 className="mt-2 text-2xl font-black theme-text-main">{displayName}</h2>
          <p className="text-sm theme-text-muted mt-1">{affiliateCode}</p>
        </div>
      </div>

      {profileLoading && (
        <div className="flex items-center gap-3 py-4 text-sm theme-text-muted">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
          Loading profile…
        </div>
      )}
      {profileError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-2 text-amber-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {profileError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ── Main Form ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Save feedback */}
          {saveSuccess && (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle className="w-4 h-4 shrink-0" />{saveSuccess}
            </div>
          )}
          {saveError && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-center gap-2 text-sm text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />{saveError}
            </div>
          )}

          {/* Account Details */}
          <div className="rounded-3xl border theme-border bg-white p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] theme-text-muted">Account Details</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Full Name</label>
                <input type="text" value={form.full_name} onChange={set("full_name")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" value={form.email} onChange={set("email")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Username (Login)</label>
                <input type="text" value={form.login_name} onChange={set("login_name")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Company</label>
                <input type="text" value={form.company_name} onChange={set("company_name")} placeholder="Optional" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Country Code</label>
                <input type="text" value={form.country_code} onChange={set("country_code")} placeholder="e.g. US" maxLength={2} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Account Status</label>
                <select value={form.account_status} onChange={set("account_status")} className={inputCls}>
                  {ACCOUNT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>
                <KeyRound className="inline w-3 h-3 mr-1" />
                Reset Password
              </label>
              <input
                type="password"
                value={form.new_password}
                onChange={set("new_password")}
                placeholder="Leave blank to keep current password"
                autoComplete="new-password"
                className={inputCls}
              />
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-3xl border theme-border bg-white p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] theme-text-muted">Contact Info</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Phone</label>
                <input type="text" value={form.phone} onChange={set("phone")} placeholder="Optional" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Telegram</label>
                <input type="text" value={form.telegram} onChange={set("telegram")} placeholder="@handle" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Skype</label>
                <input type="text" value={form.skype} onChange={set("skype")} placeholder="Skype username" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>WhatsApp</label>
                <input type="text" value={form.whatsapp} onChange={set("whatsapp")} placeholder="+1 555 000 0000" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="rounded-3xl border theme-border bg-white p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] theme-text-muted">Address</h3>
            <div>
              <label className={labelCls}>Street Address</label>
              <input type="text" value={form.address} onChange={set("address")} placeholder="Optional" className={inputCls} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelCls}>City</label>
                <input type="text" value={form.city} onChange={set("city")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>State / Region</label>
                <input type="text" value={form.state_name} onChange={set("state_name")} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Postal Code</label>
                <input type="text" value={form.postal_code} onChange={set("postal_code")} className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Website</label>
              <input type="url" value={form.website} onChange={set("website")} placeholder="https://" className={inputCls} />
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-3xl border theme-border bg-white p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] theme-text-muted">Payment Settings</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Payment Method</label>
                <input type="text" value={form.payment_method} onChange={set("payment_method")} placeholder="e.g. Wire, PayPal, Crypto" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Payment Term</label>
                <select value={form.payment_term} onChange={set("payment_term")} className={inputCls}>
                  <option value="">— Select term —</option>
                  {PAYMENT_TERMS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelCls}>Payment Details</label>
              <textarea
                value={form.payment_details}
                onChange={set("payment_details")}
                placeholder="Account number, wallet address, PayPal email, etc."
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          {/* Admin Notes */}
          <div className="rounded-3xl border theme-border bg-white p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] theme-text-muted">Admin Notes</h3>
            <div>
              <label className={labelCls}>Internal Notes</label>
              <textarea
                value={form.internal_notes}
                onChange={set("internal_notes")}
                placeholder="Internal notes visible to admins only…"
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className={labelCls}>Traffic Quality Notes</label>
              <textarea
                value={form.traffic_quality_notes}
                onChange={set("traffic_quality_notes")}
                placeholder="Notes on traffic quality, fraud flags, etc."
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className={labelCls}>Risk Score</label>
              <input
                type="text"
                value={form.risk_score}
                onChange={set("risk_score")}
                placeholder="e.g. Low / Medium / High or numeric"
                className={inputCls}
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saveLoading || profileLoading}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile
            </button>
          </div>
        </div>

        {/* ── Sidebar ───────────────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-6">

          {/* Quick Summary */}
          <div className="rounded-3xl border theme-border bg-slate-50 p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-600">Quick Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Status:</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClasses[currentStatus]}`}>
                  {currentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Manager:</span>
                <span className="font-semibold theme-text-main text-right max-w-[120px] truncate">{currentManager}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Affiliate ID:</span>
                <span className="font-mono text-xs theme-text-muted">{affiliateCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Member Since:</span>
                <span className="font-semibold theme-text-main">{registrationDate}</span>
              </div>
            </div>
          </div>

          {/* Manager Assignment */}
          <div className="rounded-3xl border theme-border bg-white p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] theme-text-muted">Assigned Manager</h3>
            <select
              value={selectedManagerId}
              onChange={(e) => setSelectedManagerId(e.target.value)}
              className={inputCls}
            >
              <option value="">— Select a manager —</option>
              {managers.map((mgr) => (
                <option key={mgr.id} value={mgr.id}>
                  {mgr.full_name}
                </option>
              ))}
            </select>
            {saveManagerError && <p className="text-xs text-rose-600">{saveManagerError}</p>}
            <button
              onClick={handleSaveManager}
              disabled={saveManagerLoading || !selectedManagerId}
              className="w-full inline-flex items-center justify-center rounded-full bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saveManagerLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : null}
              Save Assignment
            </button>
          </div>

          {/* Approval Workflow */}
          <div className="rounded-3xl border theme-border bg-white p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] theme-text-muted">Approval Workflow</h3>

            {actionSuccess && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />{actionSuccess}
              </div>
            )}
            {actionError && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />{actionError}
              </div>
            )}

            <button
              onClick={handleApprove}
              disabled={isSubmitting || currentStatus === "Active"}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Approve & Activate
            </button>
            <button
              onClick={handleDisable}
              disabled={isSubmitting || currentStatus === "Disabled"}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Suspend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
