import React, { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
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
    phone?: string;
    company?: string;
    website?: string;
    trafficSources?: string[];
    experience?: string;
    monthlyVolume?: string;
    managerNotes?: string;
    recommendation?: "Approve" | "Reject" | "Pending" | "Need More Information" | null;
    telegram?: string;
    skype?: string;
    whatsapp?: string;
    trackingDomain?: string;
    postbackUrl?: string;
    registrationIp?: string;
    lastLoginIp?: string;
    signupTimestamp?: string;
    notesHistory?: Array<{ note: string; manager: string; timestamp: string }>;
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

const recommendationColors: Record<string, string> = {
  Approve: "text-emerald-600 border-emerald-300 bg-emerald-50",
  Reject: "text-rose-600 border-rose-300 bg-rose-50",
  Pending: "text-amber-600 border-amber-300 bg-amber-50",
  "Need More Information": "text-blue-600 border-blue-300 bg-blue-50",
};

export function AffiliateProfileView({ affiliate: initialAffiliate, onBack }: AffiliateProfileViewProps) {
  const [affiliate, setAffiliate] = useState(initialAffiliate);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [managers, setManagers] = useState<publishersApi.ManagerRecord[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState(initialAffiliate.assignedManagerId || "");
  const [saveManagerLoading, setSaveManagerLoading] = useState(false);
  const [saveManagerError, setSaveManagerError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [notesHistory, setNotesHistory] = useState(initialAffiliate.notesHistory || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Load full publisher details from API on mount
  useEffect(() => {
    setProfileLoading(true);
    setProfileError(null);
    publishersApi
      .getPublisherById(initialAffiliate.publisherId)
      .then((pub) => {
        setAffiliate((prev) => ({
          ...prev,
          id: pub.affiliate_code,
          fullName: pub.full_name,
          email: pub.email,
          country: pub.country_code || "N/A",
          registrationDate: pub.created_at.substring(0, 10),
          signupTimestamp: pub.created_at,
          company: pub.company_name || undefined,
          manager: pub.manager_name || "Unassigned",
          assignedManagerId: pub.assigned_manager_id,
          status: mapAccountStatus(pub.account_status),
        }));
        setSelectedManagerId(pub.assigned_manager_id || "");
      })
      .catch((err: any) => setProfileError(err.message || "Failed to load profile"))
      .finally(() => setProfileLoading(false));
  }, [initialAffiliate.publisherId]);

  useEffect(() => {
    publishersApi.getManagers().then(setManagers).catch(() => {});
  }, []);

  const handleSaveManager = async () => {
    if (!selectedManagerId) return;
    setSaveManagerLoading(true);
    setSaveManagerError(null);
    try {
      const updated = await publishersApi.assignManager(affiliate.publisherId, selectedManagerId);
      const managerName =
        updated.manager_name || managers.find((m) => m.id === selectedManagerId)?.full_name || "Assigned";
      setAffiliate((prev) => ({ ...prev, manager: managerName, assignedManagerId: selectedManagerId }));
    } catch (err: any) {
      setSaveManagerError(err.message || "Failed to assign manager");
    } finally {
      setSaveManagerLoading(false);
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const timestamp = new Date().toISOString().replace("T", " ").substring(0, 16);
      setNotesHistory((prev) => [...prev, { note: newNote, manager: "Admin", timestamp }]);
      setNewNote("");
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const updated = await publishersApi.approveAffiliate(affiliate.publisherId);
      setAffiliate((prev) => ({ ...prev, status: mapAccountStatus(updated.account_status) }));
      setActionSuccess("Affiliate approved and activated successfully.");
    } catch (err: any) {
      setActionError(err.message || "Failed to approve affiliate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const updated = await publishersApi.disableAffiliate(affiliate.publisherId);
      setAffiliate((prev) => ({ ...prev, status: mapAccountStatus(updated.account_status) }));
      setActionSuccess("Affiliate suspended successfully.");
    } catch (err: any) {
      setActionError(err.message || "Failed to suspend affiliate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetRecommendation = (rec: "Approve" | "Reject" | "Need More Information") => {
    setAffiliate((prev) => ({ ...prev, recommendation: rec }));
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
          <h2 className="mt-2 text-2xl font-black theme-text-main">{affiliate.fullName}</h2>
          <p className="text-sm theme-text-muted mt-1">{affiliate.id}</p>
        </div>
      </div>

      {/* Profile Loading / Error */}
      {profileLoading && (
        <div className="flex items-center gap-3 py-4 text-sm theme-text-muted">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
          Loading full profile data...
        </div>
      )}
      {profileError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-2 text-amber-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {profileError} — showing partial data from list view.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="rounded-3xl border theme-border bg-white p-6 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] theme-text-muted">Basic Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Affiliate ID</p>
                <p className="text-sm font-semibold theme-text-main">{affiliate.id}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Full Name</p>
                <p className="text-sm font-semibold theme-text-main">{affiliate.fullName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Email</p>
                <p className="text-sm theme-text-main">{affiliate.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Phone</p>
                <p className="text-sm theme-text-main">{affiliate.phone || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Country</p>
                <p className="text-sm theme-text-main">{affiliate.country}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Registration Date</p>
                <p className="text-sm theme-text-main">{affiliate.registrationDate}</p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="rounded-3xl border theme-border bg-white p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] theme-text-muted">Company Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Company</p>
                <p className="text-sm theme-text-main">{affiliate.company || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Website</p>
                <p className="text-sm theme-text-main">{affiliate.website || "Not provided"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-2">Traffic Sources</p>
              {affiliate.trafficSources && affiliate.trafficSources.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {affiliate.trafficSources.map((source) => (
                    <span
                      key={source}
                      className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Not provided</p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Experience</p>
                <p className="text-sm theme-text-main">{affiliate.experience || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Monthly Volume</p>
                <p className="text-sm theme-text-main">{affiliate.monthlyVolume || "Not provided"}</p>
              </div>
            </div>
          </div>

          {/* Contact & Integration */}
          <div className="rounded-3xl border theme-border bg-white p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] theme-text-muted">Contact & Integration</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Telegram</p>
                <p className="text-sm theme-text-main">{affiliate.telegram || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Skype</p>
                <p className="text-sm theme-text-main">{affiliate.skype || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">WhatsApp</p>
                <p className="text-sm theme-text-main">{affiliate.whatsapp || "Not provided"}</p>
              </div>
            </div>
            <div className="grid gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Tracking Domain</p>
                <p className="text-sm font-mono theme-text-main">{affiliate.trackingDomain || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Postback URL</p>
                <p className="text-sm font-mono theme-text-main break-all">{affiliate.postbackUrl || "Not provided"}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Registration IP</p>
                <p className="text-sm font-mono theme-text-main">{affiliate.registrationIp || "Not provided"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Last Login IP</p>
                <p className="text-sm font-mono theme-text-main">{affiliate.lastLoginIp || "Not provided"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-1">Signup Timestamp</p>
              <p className="text-sm theme-text-main">{affiliate.signupTimestamp || affiliate.registrationDate}</p>
            </div>
          </div>

          {/* Manager Notes History */}
          <div className="rounded-3xl border theme-border bg-white p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] theme-text-muted">Manager Notes History</h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {notesHistory.length > 0 ? (
                notesHistory.map((entry, idx) => (
                  <div key={idx} className="border-l-4 border-slate-300 pl-4 py-2">
                    <p className="text-sm theme-text-main">{entry.note}</p>
                    <div className="flex justify-between mt-1 text-xs text-slate-500">
                      <span>{entry.manager}</span>
                      <span>{entry.timestamp}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No notes recorded yet.</p>
              )}
            </div>

            <div className="border-t theme-border pt-4">
              <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-2">Add New Note</p>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add internal review notes..."
                className="w-full rounded-2xl border theme-border bg-white px-4 py-3 text-sm theme-text-main focus:outline-none min-h-[80px] resize-none"
              />
              <button
                onClick={handleAddNote}
                className="mt-2 inline-flex items-center rounded-full bg-slate-200 px-4 py-2 text-xs font-semibold theme-text-main hover:bg-slate-300 transition"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Account Status */}
          <div className="rounded-3xl border theme-border bg-white p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] theme-text-muted">Account Status</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-2">Status</p>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusClasses[affiliate.status]}`}
                >
                  {affiliate.status}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted mb-2">Assigned Manager</p>
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  className="w-full rounded-2xl border theme-border bg-white px-3 py-2 text-sm theme-text-main"
                >
                  <option value="">— Select a manager —</option>
                  {managers.map((mgr) => (
                    <option key={mgr.id} value={mgr.id}>
                      {mgr.full_name}
                    </option>
                  ))}
                </select>
                {saveManagerError && <p className="mt-1 text-xs text-rose-600">{saveManagerError}</p>}
                <button
                  onClick={handleSaveManager}
                  disabled={saveManagerLoading || !selectedManagerId}
                  className="mt-2 w-full inline-flex items-center justify-center rounded-full bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {saveManagerLoading ? "Saving..." : "Save Assignment"}
                </button>
              </div>
            </div>
          </div>

          {/* Recommendation Badge */}
          {affiliate.recommendation && (
            <div className={`rounded-3xl border p-6 space-y-3 ${recommendationColors[affiliate.recommendation]}`}>
              <div className="flex items-center gap-2">
                {affiliate.recommendation === "Approve" && <CheckCircle className="h-5 w-5" />}
                {affiliate.recommendation === "Reject" && <XCircle className="h-5 w-5" />}
                {(affiliate.recommendation === "Pending" || affiliate.recommendation === "Need More Information") && (
                  <AlertCircle className="h-5 w-5" />
                )}
                <h4 className="font-bold">Recommendation</h4>
              </div>
              <p className="text-sm font-semibold">{affiliate.recommendation}</p>
            </div>
          )}

          {/* Recommendation Buttons */}
          <div className="rounded-3xl border theme-border bg-white p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] theme-text-muted mb-4">Recommendation</h3>
            <button
              onClick={() => handleSetRecommendation("Approve")}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                affiliate.recommendation === "Approve"
                  ? "bg-emerald-600 text-white"
                  : "border theme-border bg-white theme-text-main hover:bg-emerald-50"
              }`}
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
            <button
              onClick={() => handleSetRecommendation("Reject")}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                affiliate.recommendation === "Reject"
                  ? "bg-rose-600 text-white"
                  : "border theme-border bg-white theme-text-main hover:bg-rose-50"
              }`}
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
            <button
              onClick={() => handleSetRecommendation("Need More Information")}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                affiliate.recommendation === "Need More Information"
                  ? "bg-blue-600 text-white"
                  : "border theme-border bg-white theme-text-main hover:bg-blue-50"
              }`}
            >
              <AlertCircle className="h-4 w-4" />
              More Info
            </button>
          </div>

          {/* Approval Workflow */}
          <div className="rounded-3xl border theme-border bg-white p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] theme-text-muted mb-4">Approval Workflow</h3>

            {actionSuccess && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0" />
                {actionSuccess}
              </div>
            )}
            {actionError && (
              <div className="rounded-2xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {actionError}
              </div>
            )}

            <button
              onClick={handleApprove}
              disabled={isSubmitting || affiliate.status === "Active"}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Approve & Activate
            </button>
            <button
              onClick={handleReject}
              disabled={isSubmitting || affiliate.status === "Disabled"}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Reject & Disable
            </button>
          </div>

          {/* Quick Summary */}
          <div className="rounded-3xl border theme-border bg-slate-50 p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-[0.24em] text-slate-600">Quick Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Status:</span>
                <span className="font-semibold theme-text-main">{affiliate.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Manager:</span>
                <span className="font-semibold theme-text-main">{affiliate.manager}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Member Since:</span>
                <span className="font-semibold theme-text-main">{affiliate.registrationDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
