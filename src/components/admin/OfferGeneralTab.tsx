import React, { useEffect, useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import * as offersApi from "../../services/offers";
import * as advertisersApi from "../../services/advertisers";
import { listCategories } from "../../services/offerCategories";
import type { CategoryRecord } from "../../services/offerCategories";

type OfferRecord = offersApi.OfferRecord;
type AdvertiserRecord = advertisersApi.AdvertiserRecord;

const inputCls =
  "w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400";
const labelCls = "block text-xs font-semibold theme-text-muted mb-1";

function sectionHead(label: string) {
  return (
    <div className="col-span-2 pt-2">
      <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 pb-2 border-b theme-border">
        {label}
      </div>
    </div>
  );
}

interface Props {
  offer: OfferRecord;
  advertisers: AdvertiserRecord[];
  onSaved: (updated: OfferRecord) => void;
}

function getTrafficRulesText(offer: OfferRecord): string {
  const tr = offer.traffic_rules as any;
  if (!tr) return "";
  if (typeof tr.text === "string") return tr.text;
  if (typeof tr.value === "string") return tr.value;
  return "";
}

function offerToForm(offer: OfferRecord) {
  return {
    name: offer.name,
    category: offer.category,
    payout_type: offer.payout_type,
    payout_amount: String(offer.payout_amount),
    advertiser_payout: String(offer.advertiser_payout ?? offer.payout_amount),
    affiliate_payout: String(offer.affiliate_payout ?? offer.payout_amount),
    affiliate_revenue_share_percent: String(offer.affiliate_revenue_share_percent ?? ""),
    currency: offer.currency,
    landing_page_url: offer.landing_page_url,
    preview_url: offer.preview_url || "",
    offer_logo_url: offer.offer_logo_url || "",
    conversion_approval_mode: offer.conversion_approval_mode || "AUTO_APPROVE",
    status: offer.status,
    visibility: (offer.requires_publisher_approval ? "request_approval" : "public") as
      | "public"
      | "request_approval"
      | "private",
    default_affiliate_commission: String(offer.default_affiliate_commission),
    tracking_protocol: offer.tracking_protocol,
    admin_notes: offer.admin_notes || "",
    terms: offer.terms || "",
    traffic_rules: getTrafficRulesText(offer),
    advertiser_id: offer.advertiser_id || "",
  };
}

type FormState = ReturnType<typeof offerToForm>;

export function OfferGeneralTab({ offer, advertisers, onSaved }: Props) {
  const [form, setForm] = useState<FormState>(() => offerToForm(offer));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const [categoryOptions, setCategoryOptions] = useState<CategoryRecord[]>([]);

  useEffect(() => {
    listCategories(true).then(setCategoryOptions).catch(() => {/* non-fatal */});
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    setLogoError(null);
    try {
      const fd = new FormData();
      fd.append("logo", file);
      const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
      const res = await fetch("/api/upload/offer-logo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as any).message || "Upload failed");
      }
      const d = await res.json();
      setForm((prev) => ({ ...prev, offer_logo_url: d.url }));
    } catch (err: any) {
      setLogoError(err.message || "Logo upload failed");
    } finally {
      setLogoUploading(false);
      if (logoRef.current) logoRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const trafficRulesText = form.traffic_rules.trim();
      const isRevShare = form.payout_type === "REVENUE_SHARE";
      const affiliatePayout = isRevShare ? 0 : (Number(form.affiliate_payout) || 0);
      const advertiserPayout = isRevShare ? 0 : (Number(form.advertiser_payout) || 0);
      const payload: offersApi.OfferFormPayload = {
        name: form.name.trim(),
        category: form.category.trim() || "General",
        payout_type: form.payout_type,
        payout_amount: affiliatePayout,
        advertiser_payout: advertiserPayout,
        affiliate_payout: affiliatePayout,
        affiliate_revenue_share_percent: isRevShare
          ? (Number(form.affiliate_revenue_share_percent) || null)
          : null,
        currency: form.currency.trim() || "USD",
        landing_page_url: form.landing_page_url.trim(),
        preview_url: form.preview_url.trim() || undefined,
        offer_logo_url: form.offer_logo_url.trim() || null,
        conversion_approval_mode: form.conversion_approval_mode,
        status: form.status,
        requires_publisher_approval:
          form.visibility === "request_approval" || form.visibility === "private",
        default_affiliate_commission: Number(form.default_affiliate_commission) || 0,
        tracking_protocol: form.tracking_protocol as any,
        admin_notes: form.admin_notes.trim() || undefined,
        terms: form.terms.trim() || undefined,
        traffic_rules: trafficRulesText ? { text: trafficRulesText } : null,
        advertiser_id: form.advertiser_id.trim() || null,
      };
      const updated = await offersApi.updateOffer(offer.id, payload);
      onSaved(updated);
    } catch (err: any) {
      setSaveError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {saveError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      <div className="theme-bg-card border theme-border rounded-3xl p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sectionHead("Basic Information")}

          <div className="sm:col-span-2">
            <label className={labelCls}>Offer Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required className={inputCls} placeholder="Offer name" />
          </div>

          <div>
            <label className={labelCls}>Category</label>
            <select name="category" value={form.category} onChange={handleChange} className={inputCls}>
              <option value="">— Select category —</option>
              {categoryOptions.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
              {/* Keep current value selectable even if not in active categories */}
              {form.category && !categoryOptions.find(c => c.name === form.category) && (
                <option value={form.category}>{form.category}</option>
              )}
            </select>
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="EXHAUSTED">Exhausted</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Visibility</label>
            <select name="visibility" value={form.visibility} onChange={handleChange} className={inputCls}>
              <option value="public">Public — Open to all affiliates</option>
              <option value="request_approval">Request Approval — Affiliates must apply</option>
              <option value="private">Private — Not visible to affiliates</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Advertiser (internal)</label>
            <select name="advertiser_id" value={form.advertiser_id} onChange={handleChange} className={inputCls}>
              <option value="">— No advertiser —</option>
              {advertisers.map((a) => (
                <option key={a.id} value={a.id}>{a.company_name}</option>
              ))}
            </select>
          </div>

          {sectionHead("Tracking & URLs")}

          <div className="sm:col-span-2">
            <label className={labelCls}>Landing Page URL *</label>
            <input name="landing_page_url" value={form.landing_page_url} onChange={handleChange} required className={inputCls} placeholder="https://..." />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Preview URL</label>
            <input name="preview_url" value={form.preview_url} onChange={handleChange} className={inputCls} placeholder="https://... (optional)" />
          </div>

          <div>
            <label className={labelCls}>Tracking Protocol</label>
            <select name="tracking_protocol" value={form.tracking_protocol} onChange={handleChange} className={inputCls}>
              <option value="S2S">S2S</option>
              <option value="COOKIE">Cookie</option>
              <option value="PIXEL">Pixel</option>
              <option value="SERVER">Server</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Conversion Approval</label>
            <select name="conversion_approval_mode" value={form.conversion_approval_mode} onChange={handleChange} className={inputCls}>
              <option value="AUTO_APPROVE">Auto Approve</option>
              <option value="MANUAL_REVIEW">Manual Review</option>
            </select>
          </div>

          {sectionHead("Payout & Commission")}

          <div>
            <label className={labelCls}>Payout Type *</label>
            <select name="payout_type" value={form.payout_type} onChange={handleChange} required className={inputCls}>
              <option value="CPA">CPA – Cost Per Action</option>
              <option value="CPL">CPL – Cost Per Lead</option>
              <option value="CPS">CPS – Cost Per Sale</option>
              <option value="CPI">CPI – Cost Per Install</option>
              <option value="CPC">CPC – Cost Per Click</option>
              <option value="FLAT">Flat Rate</option>
              <option value="REVENUE_SHARE">Revenue Share</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Currency</label>
            <input name="currency" value={form.currency} onChange={handleChange} className={inputCls} placeholder="USD" />
          </div>

          {form.payout_type === "REVENUE_SHARE" ? (
            <div className="sm:col-span-2">
              <label className={labelCls}>Affiliate Revenue Share % *</label>
              <input
                name="affiliate_revenue_share_percent"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.affiliate_revenue_share_percent}
                onChange={handleChange}
                required
                className={inputCls}
                placeholder="e.g. 30"
              />
              <p className="mt-1 text-[11px] theme-text-muted">
                Affiliate earns this % of the revenue the advertiser reports per conversion.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className={labelCls}>Advertiser Payout *</label>
                <input name="advertiser_payout" type="number" min="0" step="0.01" value={form.advertiser_payout} onChange={handleChange} required className={inputCls} placeholder="0.00" />
                <p className="mt-1 text-[11px] theme-text-muted">What the advertiser pays per conversion.</p>
              </div>

              <div>
                <label className={labelCls}>Affiliate Payout *</label>
                <input name="affiliate_payout" type="number" min="0" step="0.01" value={form.affiliate_payout} onChange={handleChange} required className={inputCls} placeholder="0.00" />
                <p className="mt-1 text-[11px] theme-text-muted">What the affiliate earns per conversion.</p>
              </div>
            </>
          )}

          {/* Profit preview */}
          {form.payout_type === "REVENUE_SHARE" && Number(form.affiliate_revenue_share_percent) > 0 && (
            <div className="sm:col-span-2">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border theme-border px-4 py-3 flex items-center gap-6 text-xs">
                <span className="theme-text-muted">Payout Model: <strong className="text-cyan-600">Revenue Share</strong></span>
                <span className="font-bold text-emerald-600">
                  Affiliate earns {Number(form.affiliate_revenue_share_percent).toFixed(2)}% of advertiser revenue
                </span>
              </div>
            </div>
          )}
          {form.payout_type !== "REVENUE_SHARE" && (Number(form.advertiser_payout) > 0 || Number(form.affiliate_payout) > 0) && (
            <div className="sm:col-span-2">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border theme-border px-4 py-3 flex items-center gap-6 text-xs">
                <span className="theme-text-muted">Advertiser Payout: <strong className="theme-text-main">${Number(form.advertiser_payout).toFixed(2)}</strong></span>
                <span className="theme-text-muted">Affiliate Payout: <strong className="theme-text-main">${Number(form.affiliate_payout).toFixed(2)}</strong></span>
                <span className={`font-bold ${Number(form.advertiser_payout) - Number(form.affiliate_payout) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  System Profit: ${(Number(form.advertiser_payout) - Number(form.affiliate_payout)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {sectionHead("Branding")}

          <div className="sm:col-span-2">
            <label className={labelCls}>Offer Logo</label>
            {form.offer_logo_url ? (
              <div className="flex items-center gap-3 mt-1">
                <img src={form.offer_logo_url} alt="Offer logo" className="w-14 h-14 object-contain rounded-xl border theme-border" />
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, offer_logo_url: "" }))}
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
                  <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoUpload} disabled={logoUploading} />
                </label>
                <span className="text-xs theme-text-muted">PNG, JPG, WEBP — max 2MB</span>
              </div>
            )}
            {logoError && <p className="mt-1 text-xs text-red-500">{logoError}</p>}
          </div>

          {sectionHead("Notes & Terms")}

          <div className="sm:col-span-2">
            <label className={labelCls}>Admin Notes (internal, never shown to affiliates)</label>
            <textarea name="admin_notes" value={form.admin_notes} onChange={handleChange} rows={2} className={inputCls} placeholder="Internal notes..." />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Terms & Conditions</label>
            <textarea name="terms" value={form.terms} onChange={handleChange} rows={3} className={inputCls} placeholder="Offer terms..." />
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Traffic Rules (shown to publishers — one restriction per line)</label>
            <textarea
              name="traffic_rules"
              value={form.traffic_rules}
              onChange={handleChange}
              rows={4}
              className={inputCls}
              placeholder={"No Incent Traffic\nNo Adult Traffic\nNo Brand Bidding"}
            />
            <p className="mt-1 text-[11px] theme-text-muted">Leave empty to hide from publishers. Use the Targeting tab to enforce rules in the tracking engine.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-2xl bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 transition flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}
