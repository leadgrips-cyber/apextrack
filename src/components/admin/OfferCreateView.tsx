import { useEffect, useState } from "react";
import { Save, Tag, AlertCircle, CheckCircle2, Loader2, DollarSign, Globe, Monitor, ArrowLeft } from "lucide-react";
import { createOffer, type OfferFormPayload } from "../../services/offers";
import { listCategories, type CategoryRecord } from "../../services/offerCategories";
import { listAdvertisers, type AdvertiserRecord } from "../../services/advertisers";

const INPUT = "w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 transition";
const LABEL = "block text-[10px] font-bold uppercase tracking-[0.18em] theme-text-muted mb-1.5";
const SECTION = "theme-bg-card border theme-border rounded-2xl p-5 space-y-4";

const PAYOUT_TYPES  = ["CPA", "CPL", "CPS", "CPC", "CPI", "CPM", "REVENUE_SHARE"];
const CURRENCIES    = ["USD", "EUR", "GBP", "CAD", "AUD"];
const DEVICES       = ["desktop", "mobile", "tablet"];
const TRACKING_PROTOCOLS = ["S2S", "COOKIE", "PIXEL", "SERVER"];

const EMPTY: OfferFormPayload = {
  name: "",
  category: "",
  payout_type: "CPA",
  payout_amount: 0,
  advertiser_payout: 0,
  affiliate_payout: 0,
  affiliate_revenue_share_percent: null,
  currency: "USD",
  landing_page_url: "",
  preview_url: "",
  conversion_approval_mode: "AUTO_APPROVE",
  target_geos: [],
  target_devices: [],
  status: "DRAFT",
  requires_publisher_approval: false,
  tracking_protocol: "S2S",
  admin_notes: "",
  terms: "",
  advertiser_id: null,
};

export function OfferCreateView() {
  const [form, setForm]           = useState<OfferFormPayload>(EMPTY);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [advertisers, setAdvertisers] = useState<AdvertiserRecord[]>([]);
  const [geoInput, setGeoInput]   = useState("");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState<string | null>(null);

  useEffect(() => {
    listCategories(true).then(setCategories).catch(() => {});
    listAdvertisers().then(setAdvertisers).catch(() => {});
  }, []);

  function set<K extends keyof OfferFormPayload>(key: K, val: OfferFormPayload[K]) {
    setForm(f => ({ ...f, [key]: val }));
    setError(null);
    setSuccess(null);
  }

  function toggleDevice(d: string) {
    const cur = form.target_devices ?? [];
    set("target_devices", cur.includes(d) ? cur.filter(x => x !== d) : [...cur, d]);
  }

  function addGeo() {
    const code = geoInput.trim().toUpperCase();
    if (!code || code.length < 2) return;
    const cur = form.target_geos ?? [];
    if (!cur.includes(code)) set("target_geos", [...cur, code]);
    setGeoInput("");
  }

  function removeGeo(code: string) {
    set("target_geos", (form.target_geos ?? []).filter(g => g !== code));
  }

  // Keep payout_amount in sync with affiliate_payout (payout_amount is the canonical field for affiliate pay)
  function setAffiliatePayout(val: number) {
    setForm(f => ({ ...f, affiliate_payout: val, payout_amount: val }));
  }

  async function handleSave() {
    if (!form.name.trim()) { setError("Offer name is required."); return; }
    if (!form.category)    { setError("Category is required.");   return; }
    if (!form.landing_page_url.trim()) { setError("Landing page URL is required."); return; }
    if (!form.payout_type) { setError("Payout type is required."); return; }

    const isRevShare = form.payout_type === "REVENUE_SHARE";
    if (isRevShare && !form.affiliate_revenue_share_percent) {
      setError("Revenue Share % is required."); return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const affiliatePayout = isRevShare ? 0 : (form.affiliate_payout ?? 0);
      const payload: OfferFormPayload = {
        ...form,
        payout_amount:  affiliatePayout,
        advertiser_payout: isRevShare ? 0 : (form.advertiser_payout ?? 0),
        affiliate_payout: affiliatePayout,
        affiliate_revenue_share_percent: isRevShare ? (form.affiliate_revenue_share_percent ?? null) : null,
        advertiser_id:  form.advertiser_id || null,
        preview_url:    form.preview_url    || undefined,
        admin_notes:    form.admin_notes    || undefined,
        terms:          form.terms          || undefined,
      };
      const created = await createOffer(payload);
      setSuccess(`Offer "${created.name}" created (ID: ${created.id}).`);
      setForm(EMPTY);
      setGeoInput("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create offer");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300 shrink-0">
          <Tag className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-xl font-black theme-text-main">Create Offer</h1>
          <p className="text-xs theme-text-muted">New offer will be saved as DRAFT unless you change the status.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 px-4 py-3 flex items-start gap-2 text-sm text-rose-700 dark:text-rose-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />{success}
        </div>
      )}

      {/* Basic Info */}
      <div className={SECTION}>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted border-b theme-border pb-3">Basic Info</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={LABEL}>Offer Name <span className="text-rose-500">*</span></label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Credit Card Signup — US" className={INPUT} />
          </div>

          <div>
            <label className={LABEL}>Category <span className="text-rose-500">*</span></label>
            <select value={form.category} onChange={e => set("category", e.target.value)} className={INPUT}>
              <option value="">— Select Category —</option>
              {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className={LABEL}>Status</label>
            <select value={form.status ?? "DRAFT"} onChange={e => set("status", e.target.value)} className={INPUT}>
              {["DRAFT", "ACTIVE", "PAUSED", "CLOSED"].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className={LABEL}>Advertiser</label>
            <select value={form.advertiser_id ?? ""} onChange={e => set("advertiser_id", e.target.value || null)} className={INPUT}>
              <option value="">— No Advertiser —</option>
              {advertisers.map(a => <option key={a.id} value={a.id}>{a.company_name}</option>)}
            </select>
          </div>

          <div>
            <label className={LABEL}>Tracking Protocol</label>
            <select value={form.tracking_protocol ?? "S2S"} onChange={e => set("tracking_protocol", e.target.value)} className={INPUT}>
              {TRACKING_PROTOCOLS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={LABEL}>Landing Page URL <span className="text-rose-500">*</span></label>
          <input value={form.landing_page_url} onChange={e => set("landing_page_url", e.target.value)} placeholder="https://offer-page.com/lander?aff={affiliate_id}" className={INPUT} />
        </div>

        <div>
          <label className={LABEL}>Preview URL</label>
          <input value={form.preview_url ?? ""} onChange={e => set("preview_url", e.target.value)} placeholder="https://offer-page.com/preview" className={INPUT} />
        </div>
      </div>

      {/* Payout */}
      <div className={SECTION}>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted border-b theme-border pb-3 flex items-center gap-2">
          <DollarSign className="w-3.5 h-3.5 text-cyan-500" /> Payout
        </h2>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={LABEL}>Payout Type <span className="text-rose-500">*</span></label>
            <select value={form.payout_type} onChange={e => set("payout_type", e.target.value)} className={INPUT}>
              {PAYOUT_TYPES.map(p => (
                <option key={p} value={p}>{p === "REVENUE_SHARE" ? "Revenue Share" : p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={LABEL}>Currency</label>
            <select value={form.currency ?? "USD"} onChange={e => set("currency", e.target.value)} className={INPUT}>
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className={LABEL}>Conversion Approval</label>
            <select value={form.conversion_approval_mode ?? "AUTO_APPROVE"} onChange={e => set("conversion_approval_mode", e.target.value)} className={INPUT}>
              <option value="AUTO_APPROVE">Auto Approve</option>
              <option value="MANUAL_REVIEW">Manual Review</option>
            </select>
          </div>
        </div>

        {form.payout_type === "REVENUE_SHARE" ? (
          <div>
            <label className={LABEL}>Affiliate Revenue Share % <span className="text-rose-500">*</span></label>
            <div className="relative">
              <input type="number" min="0" max="100" step="0.01"
                value={form.affiliate_revenue_share_percent ?? ""}
                onChange={e => set("affiliate_revenue_share_percent", parseFloat(e.target.value) || null)}
                className={INPUT} placeholder="e.g. 30" />
            </div>
            <p className="mt-1 text-[11px] theme-text-muted">Affiliate earns this % of the revenue the advertiser reports per conversion.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Advertiser Payout (what advertiser pays you)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-mono">$</span>
                <input type="number" min="0" step="0.01"
                  value={form.advertiser_payout ?? 0}
                  onChange={e => set("advertiser_payout", parseFloat(e.target.value) || 0)}
                  className={`${INPUT} pl-7`} placeholder="0.00" />
              </div>
            </div>

            <div>
              <label className={LABEL}>Affiliate Payout (what affiliate earns)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-mono">$</span>
                <input type="number" min="0" step="0.01"
                  value={form.affiliate_payout ?? 0}
                  onChange={e => setAffiliatePayout(parseFloat(e.target.value) || 0)}
                  className={`${INPUT} pl-7`} placeholder="0.00" />
              </div>
            </div>
          </div>
        )}

        {/* Margin / Revenue Share preview */}
        {form.payout_type === "REVENUE_SHARE" && (form.affiliate_revenue_share_percent ?? 0) > 0 && (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border theme-border px-4 py-3 flex items-center justify-between text-sm">
            <span className="theme-text-muted text-xs font-semibold uppercase tracking-widest">Revenue Share</span>
            <span className="font-black font-mono text-emerald-600">
              {Number(form.affiliate_revenue_share_percent).toFixed(2)}% of advertiser revenue
            </span>
          </div>
        )}
        {form.payout_type !== "REVENUE_SHARE" && ((form.advertiser_payout ?? 0) > 0 || (form.affiliate_payout ?? 0) > 0) && (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border theme-border px-4 py-3 flex items-center justify-between text-sm">
            <span className="theme-text-muted text-xs font-semibold uppercase tracking-widest">Network Margin</span>
            <span className={`font-black font-mono ${
              (form.advertiser_payout ?? 0) - (form.affiliate_payout ?? 0) >= 0
                ? "text-emerald-600"
                : "text-rose-600"
            }`}>
              ${((form.advertiser_payout ?? 0) - (form.affiliate_payout ?? 0)).toFixed(2)} per conversion
            </span>
          </div>
        )}
      </div>

      {/* Targeting */}
      <div className={SECTION}>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted border-b theme-border pb-3 flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-cyan-500" /> Targeting
        </h2>

        <div>
          <label className={LABEL}>Target GEOs (country codes)</label>
          <div className="flex gap-2">
            <input
              value={geoInput}
              onChange={e => setGeoInput(e.target.value.toUpperCase())}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addGeo(); } }}
              placeholder="US, GB, CA…"
              maxLength={3}
              className={`${INPUT} flex-1 uppercase font-mono`}
            />
            <button type="button" onClick={addGeo}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition shrink-0">
              Add
            </button>
          </div>
          {(form.target_geos ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(form.target_geos ?? []).map(geo => (
                <span key={geo} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 text-xs font-bold font-mono">
                  {geo}
                  <button onClick={() => removeGeo(geo)} className="hover:text-rose-500 transition ml-0.5">×</button>
                </span>
              ))}
            </div>
          )}
          {(form.target_geos ?? []).length === 0 && (
            <p className="text-xs theme-text-muted mt-1">Leave empty to allow all GEOs.</p>
          )}
        </div>

        <div>
          <label className={LABEL}>Target Devices</label>
          <div className="flex gap-3 flex-wrap">
            {DEVICES.map(d => (
              <label key={d} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox"
                  checked={(form.target_devices ?? []).includes(d)}
                  onChange={() => toggleDevice(d)}
                  className="h-4 w-4 rounded text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-sm theme-text-main capitalize font-semibold">
                  <Monitor className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-slate-400" />
                  {d}
                </span>
              </label>
            ))}
          </div>
          {(form.target_devices ?? []).length === 0 && (
            <p className="text-xs theme-text-muted mt-1">Leave empty to allow all devices.</p>
          )}
        </div>
      </div>

      {/* Approval Settings */}
      <div className={SECTION}>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted border-b theme-border pb-3">Approval Settings</h2>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <button type="button"
            onClick={() => set("requires_publisher_approval", !form.requires_publisher_approval)}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
              form.requires_publisher_approval ? "bg-cyan-500" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${
              form.requires_publisher_approval ? "translate-x-5" : "translate-x-0.5"
            }`} />
          </button>
          <div>
            <div className="text-sm font-semibold theme-text-main">Requires Publisher Approval</div>
            <div className="text-xs theme-text-muted">Publishers must apply and be approved before accessing this offer.</div>
          </div>
        </label>
      </div>

      {/* Notes & Terms */}
      <div className={SECTION}>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted border-b theme-border pb-3">Notes & Terms</h2>

        <div>
          <label className={LABEL}>Admin Notes (internal only)</label>
          <textarea rows={3} value={form.admin_notes ?? ""}
            onChange={e => set("admin_notes", e.target.value)}
            placeholder="Internal notes visible only to admins…"
            className={`${INPUT} resize-none`} />
        </div>

        <div>
          <label className={LABEL}>Publisher Terms</label>
          <textarea rows={4} value={form.terms ?? ""}
            onChange={e => set("terms", e.target.value)}
            placeholder="Rules and terms shown to publishers when applying or running this offer…"
            className={`${INPUT} resize-none`} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Creating…" : "Create Offer"}
        </button>
        <button type="button" onClick={() => setForm(EMPTY)}
          className="flex items-center gap-2 border theme-border theme-text-secondary font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition">
          <ArrowLeft className="w-4 h-4" /> Reset
        </button>
      </div>

    </div>
  );
}
