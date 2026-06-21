import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Search, Plus, Download, ChevronLeft, ChevronRight, ChevronDown, X } from "lucide-react";
import * as publishersApi from "../../services/publishers";

interface AffiliateListViewProps {
  title?: string;
  subtitle?: string;
  initialStatusFilter?: string;
  onViewProfile?: (affiliate: AffiliateRecord) => void;
  onCreateAffiliate?: () => void;
}

type AffiliateStatus = "Pending" | "Active" | "Disabled";

export interface AffiliateRecord {
  // Real DB UUID — used for all API calls
  publisherId: string;
  // Display fields
  id: string;
  registrationDate: string;
  fullName: string;
  email: string;
  country: string;
  manager: string;
  assignedManagerId: string | null;
  status: AffiliateStatus;
  email_verified?: boolean;
  // Optional profile fields
  phone?: string;
  company?: string;
  website?: string;
  trafficSources?: string[];
  experience?: string;
  monthlyVolume?: string;
  managerNotes?: string;
  recommendation?: "Approve" | "Reject" | "Pending" | null;
  password?: string;
  telegram?: string;
  skype?: string;
  whatsapp?: string;
  trackingDomain?: string;
  postbackUrl?: string;
  registrationIp?: string;
  lastLoginIp?: string;
  signupTimestamp?: string;
  notesHistory?: Array<{ note: string; manager: string; timestamp: string }>;
}

function mapAccountStatus(apiStatus: string): AffiliateStatus {
  const s = apiStatus.toLowerCase();
  if (s === "active") return "Active";
  if (s === "pending") return "Pending";
  return "Disabled";
}

function mapPublisherToAffiliate(p: publishersApi.PublisherRecord): AffiliateRecord {
  return {
    publisherId: p.id,
    id: p.affiliate_code,
    registrationDate: p.created_at.substring(0, 10),
    fullName: p.full_name,
    email: p.email,
    country: p.country_code || "N/A",
    manager: p.manager_name || "Unassigned",
    assignedManagerId: p.assigned_manager_id,
    status: mapAccountStatus(p.account_status),
    email_verified: p.email_verified,
    company: p.company_name || undefined,
  };
}

const statusClasses: Record<AffiliateStatus, string> = {
  Pending: "bg-amber-100 text-amber-800 border border-amber-200",
  Active: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  Disabled: "bg-rose-100 text-rose-800 border border-rose-200",
};

export function AffiliateListView({
  title = "Affiliate List",
  subtitle = "Manage publisher accounts, review status, and apply administrative actions.",
  initialStatusFilter,
  onViewProfile,
  onCreateAffiliate,
}: AffiliateListViewProps) {
  const [affiliates, setAffiliates] = useState<AffiliateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [managers, setManagers] = useState<publishersApi.ManagerRecord[]>([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter ?? "");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [managerFilter, setManagerFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Per-row action loading: stores publisherId of the affiliate being acted on
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Assign Manager modal state
  const [assignTarget, setAssignTarget] = useState<AffiliateRecord | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  const [assignLoading, setAssignLoading] = useState(false);

  // Resend verification state
  const [resendingVerification, setResendingVerification] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchAffiliates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await publishersApi.listPublishers();
      setAffiliates(data.publishers.map(mapPublisherToAffiliate));
    } catch (err: any) {
      setError(err.message || "Failed to load affiliates");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchManagers = useCallback(async () => {
    try {
      const data = await publishersApi.getManagers();
      setManagers(data);
    } catch {
      // Non-fatal: manager assignment will be unavailable but list still works
    }
  }, []);

  useEffect(() => {
    fetchAffiliates();
    fetchManagers();
  }, [fetchAffiliates, fetchManagers]);

  const countries = useMemo(
    () => Array.from(new Set(affiliates.map((a) => a.country).filter((c) => c !== "N/A"))).sort(),
    [affiliates]
  );
  const managerNames = useMemo(
    () => Array.from(new Set(affiliates.map((a) => a.manager).filter((m) => m !== "Unassigned"))).sort(),
    [affiliates]
  );

  const normalizedSearch = search.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      affiliates.filter((a) => {
        const text = `${a.fullName} ${a.email} ${a.id}`.toLowerCase();
        const matchSearch = normalizedSearch ? text.includes(normalizedSearch) : true;
        const matchStatus = statusFilter ? a.status === statusFilter : true;
        const matchCountry = countryFilter ? a.country === countryFilter : true;
        const matchManager = managerFilter ? a.manager === managerFilter : true;
        return matchSearch && matchStatus && matchCountry && matchManager;
      }).sort((a, b) => (a.registrationDate > b.registrationDate ? -1 : 1)),
    [affiliates, normalizedSearch, statusFilter, countryFilter, managerFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paged = filtered.slice((currentPageSafe - 1) * pageSize, currentPageSafe * pageSize);

  const pageRange = useMemo(() => {
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) pages.push(i);
    return pages;
  }, [totalPages]);

  const handleFilterChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setter(e.target.value);
      setCurrentPage(1);
    };

  const handleActivate = async (affiliate: AffiliateRecord) => {
    setActionLoading(affiliate.publisherId);
    setActionError(null);
    try {
      const updated = await publishersApi.activateAffiliate(affiliate.publisherId);
      setAffiliates((prev) =>
        prev.map((a) =>
          a.publisherId === affiliate.publisherId
            ? { ...a, status: mapAccountStatus(updated.account_status) }
            : a
        )
      );
    } catch (err: any) {
      setActionError(err.message || "Failed to activate affiliate");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDisable = async (affiliate: AffiliateRecord) => {
    setActionLoading(affiliate.publisherId);
    setActionError(null);
    try {
      const updated = await publishersApi.disableAffiliate(affiliate.publisherId);
      setAffiliates((prev) =>
        prev.map((a) =>
          a.publisherId === affiliate.publisherId
            ? { ...a, status: mapAccountStatus(updated.account_status) }
            : a
        )
      );
    } catch (err: any) {
      setActionError(err.message || "Failed to disable affiliate");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResendVerification = async (affiliate: AffiliateRecord) => {
    setResendingVerification(affiliate.publisherId);
    try {
      await publishersApi.resendVerificationEmail(affiliate.publisherId);
      setToast({ type: "success", message: "Verification email sent successfully" });
    } catch (err: any) {
      setToast({ type: "error", message: err.message || "Failed to resend verification email" });
    } finally {
      setResendingVerification(null);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const openAssignManager = (affiliate: AffiliateRecord) => {
    setAssignTarget(affiliate);
    setSelectedManagerId(affiliate.assignedManagerId || "");
    setActionError(null);
  };

  const handleAssignManager = async () => {
    if (!assignTarget || !selectedManagerId) return;
    setAssignLoading(true);
    setActionError(null);
    try {
      const updated = await publishersApi.assignManager(assignTarget.publisherId, selectedManagerId);
      const managerName = updated.manager_name || managers.find((m) => m.id === selectedManagerId)?.full_name || "Assigned";
      setAffiliates((prev) =>
        prev.map((a) =>
          a.publisherId === assignTarget.publisherId
            ? { ...a, manager: managerName, assignedManagerId: selectedManagerId }
            : a
        )
      );
      setAssignTarget(null);
    } catch (err: any) {
      setActionError(err.message || "Failed to assign manager");
    } finally {
      setAssignLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Affiliates</div>
          <h2 className="mt-2 text-2xl font-black theme-text-main">{title}</h2>
          <p className="mt-2 text-sm theme-text-muted max-w-2xl">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => { console.log("CREATE_AFFILIATE_CLICKED"); onCreateAffiliate?.(); }} className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition">
            <Plus className="w-4 h-4" />
            Create Affiliate
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border theme-border bg-white px-4 py-2 text-xs font-semibold theme-text-secondary hover:bg-slate-100 transition">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Action error banner */}
      {actionError && (
        <div className="flex items-center justify-between rounded-2xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm ${
          toast.type === "success"
            ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
            : "bg-rose-50 border border-rose-200 text-rose-700"
        }`}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Search Affiliate</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 theme-text-muted" />
            <input
              type="search"
              value={search}
              onChange={handleFilterChange(setSearch)}
              placeholder="Search name, email, or ID"
              className="w-full rounded-2xl border theme-border bg-white px-10 py-3 text-sm theme-text-main focus:outline-none"
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Status Filter</span>
          <select
            value={statusFilter}
            onChange={handleFilterChange(setStatusFilter)}
            className="w-full rounded-2xl border theme-border bg-white px-4 py-3 text-sm theme-text-main"
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Disabled">Disabled</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Country Filter</span>
          <select
            value={countryFilter}
            onChange={handleFilterChange(setCountryFilter)}
            className="w-full rounded-2xl border theme-border bg-white px-4 py-3 text-sm theme-text-main"
          >
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Manager Filter</span>
          <select
            value={managerFilter}
            onChange={handleFilterChange(setManagerFilter)}
            className="w-full rounded-2xl border theme-border bg-white px-4 py-3 text-sm theme-text-main"
          >
            <option value="">All managers</option>
            {managerNames.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Table */}
      <div>
        {loading ? (
          <div className="py-16 text-center text-sm theme-text-muted">Loading affiliates...</div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-rose-600">{error}</div>
        ) : (
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Registration Date</th>
                <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Affiliate ID</th>
                <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Full Name</th>
                <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Email</th>
                <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Country</th>
                <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Manager</th>
                <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Status</th>
                <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {paged.map((affiliate) => {
                const isActing = actionLoading === affiliate.publisherId;
                return (
                  <tr key={affiliate.publisherId} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 text-sm theme-text-secondary">{affiliate.registrationDate}</td>
                    <td className="px-5 py-4 text-sm font-semibold theme-text-main">{affiliate.id}</td>
                    <td className="px-5 py-4 text-sm theme-text-main">{affiliate.fullName}</td>
                    <td className="px-5 py-4 text-sm theme-text-secondary">{affiliate.email}</td>
                    <td className="px-5 py-4 text-sm theme-text-secondary">{affiliate.country}</td>
                    <td className="px-5 py-4 text-sm theme-text-secondary">{affiliate.manager}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusClasses[affiliate.status]}`}>
                        {affiliate.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right align-top">
                      <details className="relative inline-block text-left">
                        <summary className="inline-flex cursor-pointer items-center gap-2 rounded-full border theme-border bg-slate-50 px-4 py-2 text-xs font-semibold theme-text-secondary hover:bg-slate-100 transition">
                          {isActing ? "Working..." : "Actions"}
                          <ChevronDown className="h-4 w-4" />
                        </summary>
                        <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-3xl border theme-border bg-white text-left shadow-xl">
                          <button
                            onClick={() => onViewProfile?.(affiliate)}
                            className="w-full px-4 py-3 text-left text-sm theme-text-main hover:bg-slate-50 transition"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => openAssignManager(affiliate)}
                            disabled={isActing}
                            className="w-full px-4 py-3 text-left text-sm theme-text-main hover:bg-slate-50 transition disabled:opacity-50"
                          >
                            Assign Manager
                          </button>
                          {affiliate.email_verified === false && (
                            <button
                              onClick={() => handleResendVerification(affiliate)}
                              disabled={resendingVerification === affiliate.publisherId}
                              className="w-full px-4 py-3 text-left text-sm text-cyan-600 hover:bg-slate-50 transition disabled:opacity-50"
                            >
                              {resendingVerification === affiliate.publisherId ? "Sending..." : "Resend Verification"}
                            </button>
                          )}
                          {affiliate.status !== "Active" && (
                            <button
                              onClick={() => handleActivate(affiliate)}
                              disabled={isActing}
                              className="w-full px-4 py-3 text-left text-sm text-emerald-600 hover:bg-slate-50 transition disabled:opacity-50"
                            >
                              Activate Account
                            </button>
                          )}
                          {affiliate.status === "Active" && (
                            <button
                              onClick={() => handleDisable(affiliate)}
                              disabled={isActing}
                              className="w-full px-4 py-3 text-left text-sm text-rose-600 hover:bg-slate-50 transition disabled:opacity-50"
                            >
                              Disable Account
                            </button>
                          )}
                        </div>
                      </details>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm theme-text-muted">
                    No affiliates match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && (
        <div className="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
          <div className="text-sm theme-text-muted">
            Showing {paged.length === 0 ? 0 : (currentPageSafe - 1) * pageSize + 1}–{Math.min(currentPageSafe * pageSize, filtered.length)} of {filtered.length} affiliates
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border theme-border bg-white px-2 py-1">
            <button
              type="button"
              disabled={currentPageSafe === 1}
              onClick={() => setCurrentPage(Math.max(1, currentPageSafe - 1))}
              className="inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold theme-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageRange.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`min-w-[34px] rounded-full px-3 py-2 text-sm font-semibold transition ${
                  page === currentPageSafe ? "bg-cyan-600 text-white" : "theme-text-secondary hover:bg-slate-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPageSafe === totalPages}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPageSafe + 1))}
              className="inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold theme-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Assign Manager Modal */}
      {assignTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white border theme-border shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black theme-text-main">Assign Manager</h3>
                <p className="text-xs theme-text-muted mt-1">{assignTarget.fullName}</p>
              </div>
              <button
                onClick={() => setAssignTarget(null)}
                className="p-1 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4 theme-text-muted" />
              </button>
            </div>

            {actionError && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {actionError}
              </p>
            )}

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">
                Select Manager
              </label>
              {managers.length === 0 ? (
                <p className="text-sm theme-text-muted">No managers available. Create an admin with AFFILIATE_MANAGER role first.</p>
              ) : (
                <select
                  value={selectedManagerId}
                  onChange={(e) => setSelectedManagerId(e.target.value)}
                  className="w-full rounded-2xl border theme-border bg-white px-4 py-3 text-sm theme-text-main focus:outline-none"
                >
                  <option value="">— Select a manager —</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleAssignManager}
                disabled={assignLoading || !selectedManagerId}
                className="flex-1 rounded-full bg-cyan-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {assignLoading ? "Saving..." : "Save Assignment"}
              </button>
              <button
                onClick={() => setAssignTarget(null)}
                className="flex-1 rounded-full border theme-border px-4 py-2.5 text-xs font-semibold theme-text-secondary hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
