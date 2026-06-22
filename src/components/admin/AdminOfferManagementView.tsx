import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, Edit3, PauseCircle, CheckCircle, Archive, X, Loader2, ArrowLeft, Upload, Zap, LayoutDashboard } from "lucide-react";
import * as offersApi from "../../services/offers";
import * as advertisersApi from "../../services/advertisers";
import { OfferEventsPanel } from "./OfferEventsPanel";
import { OfferDetailView } from "./OfferDetailView";
import {
  TrackingPlatformSection,
  IntegrationConfig,
  DEFAULT_INTEGRATION_CONFIG,
  configToIntegrationSettings,
  integrationSettingsToConfig,
} from "./TrackingPlatformSection";

type OfferRecord = offersApi.OfferRecord;
type AdvertiserRecord = advertisersApi.AdvertiserRecord;

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Paused: "bg-amber-100 text-amber-700",
  Draft: "bg-slate-100 text-slate-700",
  Archived: "bg-red-100 text-red-600",
  Exhausted: "bg-orange-100 text-orange-700",
  Closed: "bg-gray-100 text-gray-600",
};

function mapStatus(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "Active",
    PAUSED: "Paused",
    DRAFT: "Draft",
    ARCHIVED: "Archived",
    EXHAUSTED: "Exhausted",
    CLOSED: "Closed",
  };
  return map[status] ?? status;
}

const emptyForm = {
  name: "",
  category: "General",
  payout_type: "CPA",
  payout_amount: "0",
  advertiser_payout: "0",
  affiliate_payout: "0",
  currency: "USD",
  landing_page_url: "",
  preview_url: "",
  offer_logo_url: "",
  conversion_approval_mode: "AUTO_APPROVE",
  target_geos: "",
  target_devices: "",
  status: "DRAFT",
  visibility: "public" as "public" | "request_approval" | "private",
  default_affiliate_commission: "0",
  tracking_protocol: "S2S",
  admin_notes: "",
  terms: "",
  advertiser_id: "",
};

type FormState = typeof emptyForm;

function offerToForm(offer: OfferRecord): FormState {
  return {
    name: offer.name,
    category: offer.category,
    payout_type: offer.payout_type,
    payout_amount: String(offer.payout_amount),
    advertiser_payout: String(offer.advertiser_payout ?? offer.payout_amount),
    affiliate_payout: String(offer.affiliate_payout ?? offer.payout_amount),
    currency: offer.currency,
    landing_page_url: offer.landing_page_url,
    preview_url: offer.preview_url || "",
    offer_logo_url: offer.offer_logo_url || "",
    conversion_approval_mode: offer.conversion_approval_mode || "AUTO_APPROVE",
    target_geos: (offer.target_geos || []).join(", "),
    target_devices: (offer.target_devices || []).join(", "),
    status: offer.status,
    visibility: offer.requires_publisher_approval ? "request_approval" : "public",
    default_affiliate_commission: String(offer.default_affiliate_commission),
    tracking_protocol: offer.tracking_protocol,
    admin_notes: offer.admin_notes || "",
    terms: offer.terms || "",
    advertiser_id: offer.advertiser_id || "",
  };
}

function formToPayload(form: FormState): offersApi.OfferFormPayload {
  const affiliatePayout = Number(form.affiliate_payout) || 0;
  const advertiserPayout = Number(form.advertiser_payout) || 0;
  return {
    name: form.name.trim(),
    category: form.category.trim() || "General",
    payout_type: form.payout_type,
    payout_amount: affiliatePayout,
    advertiser_payout: advertiserPayout,
    affiliate_payout: affiliatePayout,
    currency: form.currency.trim() || "USD",
    landing_page_url: form.landing_page_url.trim(),
    preview_url: form.preview_url.trim() || undefined,
    offer_logo_url: form.offer_logo_url.trim() || null,
    conversion_approval_mode: form.conversion_approval_mode || "AUTO_APPROVE",
    target_geos: form.target_geos.split(",").map((s) => s.trim()).filter(Boolean),
    target_devices: form.target_devices.split(",").map((s) => s.trim()).filter(Boolean),
    status: "ACTIVE",
    requires_publisher_approval: form.visibility === "request_approval" || form.visibility === "private",
    default_affiliate_commission: Number(form.default_affiliate_commission) || 0,
    tracking_protocol: form.tracking_protocol as any,
    admin_notes: form.admin_notes.trim() || undefined,
    terms: form.terms.trim() || undefined,
    advertiser_id: form.advertiser_id.trim() || null,
  };
}

export function AdminOfferManagementView({ openCreateOnMount }: { openCreateOnMount?: boolean } = {}) {
  const [view, setView] = useState<"list" | "create" | "edit" | "events" | "detail">(openCreateOnMount ? "create" : "list");
  const [eventsOffer, setEventsOffer] = useState<OfferRecord | null>(null);
  const [detailOffer, setDetailOffer] = useState<OfferRecord | null>(null);
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [advertisers, setAdvertisers] = useState<AdvertiserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [editingOffer, setEditingOffer] = useState<OfferRecord | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [integrationConfig, setIntegrationConfig] = useState<IntegrationConfig>(DEFAULT_INTEGRATION_CONFIG);

  useEffect(() => {
    loadOffers();
    loadAdvertisers();
  }, []);

  async function loadOffers() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await offersApi.listAdminOffers();
      setOffers(data);
    } catch (err: any) {
      setLoadError(err.message || "Failed to load offers");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAdvertisers() {
    try {
      const data = await advertisersApi.listAdvertisers();
      setAdvertisers(data);
    } catch {
      // Non-fatal: dropdown just shows empty
    }
  }

  const visibleOffers = useMemo(
    () =>
      offers.filter((offer) =>
        `${offer.name} ${offer.category} ${(offer.target_geos || []).join(" ")} ${offer.slug}`
          .toLowerCase()
          .includes(searchValue.toLowerCase())
      ),
    [offers, searchValue]
  );

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    setLogoUploadError(null);
    try {
      const payload = new FormData();
      payload.append("logo", file);
      const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
      const res = await fetch("/api/upload/offer-logo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: payload,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as any).message || "Upload failed");
      }
      const d = await res.json();
      setFormData((prev) => ({ ...prev, offer_logo_url: d.url }));
    } catch (err: any) {
      setLogoUploadError(err.message || "Logo upload failed");
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  function openCreate() {
    setEditingOffer(null);
    setFormData(emptyForm);
    setIntegrationConfig(DEFAULT_INTEGRATION_CONFIG);
    setFormError(null);
    setLogoUploadError(null);
    setView("create");
  }

  function openEdit(offer: OfferRecord) {
    setEditingOffer(offer);
    setFormData(offerToForm(offer));
    setIntegrationConfig(integrationSettingsToConfig(offer.integration_settings));
    setFormError(null);
    setLogoUploadError(null);
    setView("edit");
  }

  function closeForm() {
    setView("list");
    setEditingOffer(null);
    setIntegrationConfig(DEFAULT_INTEGRATION_CONFIG);
    setFormError(null);
    setLogoUploadError(null);
  }

  function openEvents(offer: OfferRecord) {
    setEventsOffer(offer);
    setView("events");
  }

  function openDetail(offer: OfferRecord) {
    setDetailOffer(offer);
    setView("detail");
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const payload = formToPayload(formData);
      payload.integration_settings = configToIntegrationSettings(integrationConfig);
      let saved: OfferRecord;
      if (editingOffer) {
        saved = await offersApi.updateOffer(editingOffer.id, payload);
        setOffers((prev) => prev.map((o) => (o.id === saved.id ? saved : o)));
      } else {
        saved = await offersApi.createOffer(payload);
        setOffers((prev) => [saved, ...prev]);
      }
      closeForm();
    } catch (err: any) {
      setFormError(err.message || "Failed to save offer");
    } finally {
      setFormLoading(false);
    }
  }

  async function handlePause(offer: OfferRecord) {
    setActionLoading(offer.id);
    setActionError(null);
    try {
      const updated = await offersApi.pauseOffer(offer.id);
      setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err: any) {
      setActionError(err.message || "Failed to pause offer");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleActivate(offer: OfferRecord) {
    setActionLoading(offer.id);
    setActionError(null);
    try {
      const updated = await offersApi.activateOffer(offer.id);
      setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err: any) {
      setActionError(err.message || "Failed to activate offer");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleArchive(offer: OfferRecord) {
    setActionLoading(offer.id);
    setActionError(null);
    try {
      const updated = await offersApi.archiveOffer(offer.id);
      setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err: any) {
      setActionError(err.message || "Failed to archive offer");
    } finally {
      setActionLoading(null);
    }
  }

  const inputCls =
    "w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400";
  const labelCls = "block text-xs font-semibold theme-text-muted mb-1";

  if (view === "events" && eventsOffer) {
    return (
      <OfferEventsPanel
        offerId={eventsOffer.id}
        offerName={eventsOffer.name}
        onBack={() => setView("list")}
      />
    );
  }

  if (view === "detail" && detailOffer) {
    return (
      <OfferDetailView
        offer={detailOffer}
        advertisers={advertisers}
        onBack={() => setView("list")}
        onOfferUpdated={(updated) => {
          setDetailOffer(updated);
          setOffers((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        }}
      />
    );
  }

  // Full-page form — shown instead of the list when creating or editing
  if (view === "create" || view === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={closeForm}
            className="rounded-xl border theme-border px-3 py-2 text-xs font-semibold theme-text-secondary hover:theme-text-main transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Offer List
          </button>
          <div>
            <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Offer Management</div>
            <div className="mt-1 text-2xl font-black theme-text-main">
              {editingOffer ? `Edit Offer #${editingOffer.id}` : "Create Offer"}
            </div>
          </div>
        </div>

        <div className="max-w-2xl theme-bg-card border theme-border rounded-3xl shadow-sm">
          <form onSubmit={handleSave} className="p-6 space-y-4">
            {formError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>Name *</label>
                <input name="name" value={formData.name} onChange={handleFormChange} required className={inputCls} placeholder="Offer name" />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <input name="category" value={formData.category} onChange={handleFormChange} className={inputCls} placeholder="e.g. Health & Wellness" />
              </div>
              <div>
                <label className={labelCls}>Payout Type *</label>
                <select name="payout_type" value={formData.payout_type} onChange={handleFormChange} required className={inputCls}>
                  <option value="CPA">CPA – Cost Per Action</option>
                  <option value="CPL">CPL – Cost Per Lead</option>
                  <option value="CPS">CPS – Cost Per Sale</option>
                  <option value="CPI">CPI – Cost Per Install</option>
                  <option value="CPC">CPC – Cost Per Click</option>
                  <option value="FLAT">Flat Rate</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Advertiser Payout *</label>
                <input name="advertiser_payout" type="number" min="0" step="0.01" value={formData.advertiser_payout} onChange={handleFormChange} required className={inputCls} placeholder="0.00" />
                <p className="mt-1 text-[10px] theme-text-muted">What the advertiser pays per conversion.</p>
              </div>
              <div>
                <label className={labelCls}>Affiliate Payout *</label>
                <input name="affiliate_payout" type="number" min="0" step="0.01" value={formData.affiliate_payout} onChange={handleFormChange} required className={inputCls} placeholder="0.00" />
                <p className="mt-1 text-[10px] theme-text-muted">What the affiliate earns per conversion.</p>
              </div>
              <div>
                <label className={labelCls}>Currency</label>
                <input name="currency" value={formData.currency} onChange={handleFormChange} className={inputCls} placeholder="USD" />
              </div>
              <div className="flex items-end pb-2">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border theme-border px-3 py-2 text-xs w-full">
                  <span className="theme-text-muted">System Profit: </span>
                  <span className={`font-bold ${Number(formData.advertiser_payout) - Number(formData.affiliate_payout) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    ${(Number(formData.advertiser_payout) - Number(formData.affiliate_payout)).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Landing Page URL *</label>
                <input name="landing_page_url" value={formData.landing_page_url} onChange={handleFormChange} required className={inputCls} placeholder="https://..." />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Preview URL</label>
                <input name="preview_url" value={formData.preview_url} onChange={handleFormChange} className={inputCls} placeholder="https://... (optional)" />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Offer Logo</label>
                {formData.offer_logo_url ? (
                  <div className="flex items-center gap-3 mt-1">
                    <img src={formData.offer_logo_url} alt="Offer logo" className="w-12 h-12 object-contain rounded-lg border theme-border" />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, offer_logo_url: "" }))}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center gap-2">
                    <label className="cursor-pointer rounded-xl border theme-border px-3 py-2 text-xs font-semibold theme-text-secondary hover:theme-text-main transition inline-flex items-center gap-2">
                      {logoUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      {logoUploading ? "Uploading..." : "Upload Logo"}
                      <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoUpload} disabled={logoUploading} />
                    </label>
                    <span className="text-xs theme-text-muted">PNG, JPG, WEBP — max 2MB</span>
                  </div>
                )}
                {logoUploadError && <p className="mt-1 text-xs text-red-500">{logoUploadError}</p>}
              </div>
              <div>
                <label className={labelCls}>Conversion Approval Mode</label>
                <select name="conversion_approval_mode" value={formData.conversion_approval_mode} onChange={handleFormChange} className={inputCls}>
                  <option value="AUTO_APPROVE">Auto Approve – Conversions credited immediately</option>
                  <option value="MANUAL_REVIEW">Manual Review – Admin reviews each conversion</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Target GEOs (comma separated)</label>
                <input name="target_geos" value={formData.target_geos} onChange={handleFormChange} className={inputCls} placeholder="US, CA, AU" />
              </div>
              <div>
                <label className={labelCls}>Target Devices (comma separated)</label>
                <input name="target_devices" value={formData.target_devices} onChange={handleFormChange} className={inputCls} placeholder="desktop, mobile" />
              </div>
              <div>
                <label className={labelCls}>Tracking Protocol</label>
                <select name="tracking_protocol" value={formData.tracking_protocol} onChange={handleFormChange} className={inputCls}>
                  <option value="S2S">S2S</option>
                  <option value="COOKIE">Cookie</option>
                  <option value="PIXEL">Pixel</option>
                  <option value="SERVER">Server</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Visibility</label>
                <select name="visibility" value={formData.visibility} onChange={handleFormChange} className={inputCls}>
                  <option value="public">Public – Open to all publishers</option>
                  <option value="request_approval">Request Approval – Publishers must apply</option>
                  <option value="private">Private – Not visible to publishers</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Advertiser (internal — never shown to publishers)</label>
                <select name="advertiser_id" value={formData.advertiser_id} onChange={handleFormChange} className={inputCls}>
                  <option value="">— No advertiser assigned —</option>
                  {advertisers.map((adv) => (
                    <option key={adv.id} value={adv.id}>{adv.company_name}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Admin Notes</label>
                <textarea name="admin_notes" value={formData.admin_notes} onChange={handleFormChange} rows={2} className={inputCls} placeholder="Internal notes..." />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Terms</label>
                <textarea name="terms" value={formData.terms} onChange={handleFormChange} rows={2} className={inputCls} placeholder="Offer terms and conditions..." />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={closeForm} className="rounded-2xl border theme-border px-5 py-2.5 text-sm font-semibold theme-text-secondary hover:theme-text-main transition">
                Cancel
              </button>
              <button type="submit" disabled={formLoading} className="rounded-2xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 transition flex items-center gap-2 disabled:opacity-50">
                {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingOffer ? "Save Changes" : "Create Offer"}
              </button>
            </div>
          </form>
        </div>

        <div className="max-w-2xl">
          <TrackingPlatformSection
            config={integrationConfig}
            landingPageUrl={formData.landing_page_url}
            onChange={setIntegrationConfig}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">
            Offer Management
          </div>
          <div className="mt-2 text-2xl font-black theme-text-main">
            Review and manage offer lifecycles
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search offers"
              className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-950 px-10 py-3 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>
          <button
            onClick={openCreate}
            className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-500 transition flex items-center gap-2 justify-center"
          >
            <Plus className="w-4 h-4" />
            Create Offer
          </button>
        </div>
      </div>

      {/* Action error banner */}
      {actionError && (
        <div className="flex items-center justify-between rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="ml-4 text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Offer
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Advertiser
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Category
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Payout
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Model
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Geo
              </th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Status
              </th>
              <th className="px-6 py-4 text-right text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading offers...
                </td>
              </tr>
            ) : loadError ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-red-500">
                  {loadError}
                </td>
              </tr>
            ) : visibleOffers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-400">
                  {searchValue
                    ? "No offers match your search."
                    : "No offers yet. Create your first offer."}
                </td>
              </tr>
            ) : (
              visibleOffers.map((offer) => {
                const displayStatus = mapStatus(offer.status);
                const isActing = actionLoading === offer.id;
                const geos = (offer.target_geos || []).join(", ") || "Global";
                return (
                  <tr key={offer.id}>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {offer.offer_logo_url ? (
                          <img src={offer.offer_logo_url} alt="" className="w-9 h-9 rounded-lg object-contain border theme-border flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
                        )}
                        <div>
                          <div className="font-semibold theme-text-main">{offer.name}</div>
                          <div className="text-sm theme-text-muted">Offer #{offer.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">
                      {offer.advertiser_name ?? (
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">
                      {offer.category}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm">
                      <div className="theme-text-main font-medium">${Number(offer.affiliate_payout ?? offer.payout_amount).toFixed(2)} <span className="text-xs theme-text-muted">{offer.payout_type}</span></div>
                      {(offer.advertiser_payout ?? 0) > 0 && (
                        <div className="text-xs text-cyan-600">Adv: ${Number(offer.advertiser_payout).toFixed(2)}</div>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">
                      {offer.payout_type}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm theme-text-main">{geos}</td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[displayStatus] || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {displayStatus}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <button
                          onClick={() => openDetail(offer)}
                          disabled={isActing}
                          className="rounded-full bg-cyan-600 text-white px-2.5 py-1.5 text-xs font-semibold hover:bg-cyan-500 transition inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          Manage
                        </button>
                        <button
                          onClick={() => openEdit(offer)}
                          disabled={isActing}
                          className="rounded-full border theme-border px-2.5 py-1.5 text-xs font-semibold theme-text-secondary hover:theme-text-main transition inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => openEvents(offer)}
                          disabled={isActing}
                          className="rounded-full border theme-border px-2.5 py-1.5 text-xs font-semibold theme-text-secondary hover:theme-text-main transition inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Events
                        </button>

                        {offer.status === "ACTIVE" && (
                          <button
                            onClick={() => handlePause(offer)}
                            disabled={isActing}
                            className="rounded-full bg-amber-100 px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-200 transition inline-flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isActing ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <PauseCircle className="w-3.5 h-3.5" />
                            )}
                            Pause
                          </button>
                        )}

                        {(offer.status === "PAUSED" || offer.status === "DRAFT") && (
                          <button
                            onClick={() => handleActivate(offer)}
                            disabled={isActing}
                            className="rounded-full bg-emerald-100 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 transition inline-flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isActing ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                            Activate
                          </button>
                        )}

                        {offer.status !== "ARCHIVED" && (
                          <button
                            onClick={() => handleArchive(offer)}
                            disabled={isActing}
                            className="rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition inline-flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {isActing ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Archive className="w-3.5 h-3.5" />
                            )}
                            Archive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
