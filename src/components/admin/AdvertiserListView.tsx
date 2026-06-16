import { useEffect, useRef, useState } from "react";
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Plus,
  Eye,
  Pencil,
  UserCheck,
  UserX,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
} from "lucide-react";
import * as api from "../../services/advertisers";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(ts: string) {
  return ts?.substring(0, 10) ?? "—";
}

function fmtDateTime(ts: string) {
  return ts?.substring(0, 16).replace("T", " ") ?? "—";
}

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:    "bg-emerald-100 text-emerald-700",
  PENDING:   "bg-amber-100 text-amber-700",
  SUSPENDED: "bg-rose-100 text-rose-600",
  PAUSED:    "bg-slate-100 text-slate-600",
};

function statusBadge(status: string, is_active: boolean) {
  if (status === "PENDING")   return "bg-amber-100 text-amber-700";
  if (is_active)              return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-500";
}

function statusLabel(status: string, is_active: boolean) {
  if (status === "PENDING") return "Pending";
  if (is_active)            return "Active";
  return "Inactive";
}

const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Angola","Argentina","Armenia","Australia",
  "Austria","Azerbaijan","Bangladesh","Belarus","Belgium","Bolivia","Bosnia",
  "Brazil","Bulgaria","Cambodia","Canada","Chile","China","Colombia","Croatia",
  "Czech Republic","Denmark","Dominican Republic","Ecuador","Egypt","Estonia",
  "Ethiopia","Finland","France","Georgia","Germany","Ghana","Greece","Guatemala",
  "Honduras","Hungary","India","Indonesia","Iran","Iraq","Ireland","Israel",
  "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Latvia",
  "Lebanon","Libya","Lithuania","Malaysia","Mexico","Moldova","Morocco",
  "Mozambique","Myanmar","Nepal","Netherlands","New Zealand","Nicaragua",
  "Nigeria","Norway","Pakistan","Panama","Paraguay","Peru","Philippines","Poland",
  "Portugal","Romania","Russia","Saudi Arabia","Senegal","Serbia","Singapore",
  "Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","Sweden",
  "Switzerland","Taiwan","Tanzania","Thailand","Tunisia","Turkey","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay",
  "Uzbekistan","Venezuela","Vietnam","Yemen","Zimbabwe","Other",
];

// ─── Modal types ──────────────────────────────────────────────────────────────

type ModalMode = "CLOSED" | "ADD" | "VIEW" | "EDIT" | "DEACTIVATE";
interface ModalState { mode: ModalMode; adv?: api.AdvertiserRecord; }
const MODAL_CLOSED: ModalState = { mode: "CLOSED" };

const PAGE_SIZE = 20;

// ─── Empty form ───────────────────────────────────────────────────────────────

const emptyForm = {
  company_name: "", contact_name: "", email: "",
  phone: "", website: "", country: "", messenger_contact: "", notes: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AdvertiserListView({ onCreateNew: _ignored }: { onCreateNew?: () => void }) {

  // ── Counts ───────────────────────────────────────────────────────────────────
  const [counts, setCounts]               = useState<api.AdvertiserCounts | null>(null);
  const [countsLoading, setCountsLoading] = useState(true);

  // ── List ─────────────────────────────────────────────────────────────────────
  const [advertisers, setAdvertisers]     = useState<api.AdvertiserRecord[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  // ── Filters ──────────────────────────────────────────────────────────────────
  const [tab, setTab]                     = useState("ALL");
  const [searchInput, setSearchInput]     = useState("");
  const [searchApplied, setSearchApplied] = useState("");
  const [page, setPage]                   = useState(1);

  // ── Modal ─────────────────────────────────────────────────────────────────────
  const [modal, setModal]                 = useState<ModalState>(MODAL_CLOSED);

  // ── Add/Edit form ─────────────────────────────────────────────────────────────
  const [form, setForm]                   = useState(emptyForm);
  const [formLoading, setFormLoading]     = useState(false);
  const [formError, setFormError]         = useState<string | null>(null);

  // ── Deactivate confirm ────────────────────────────────────────────────────────
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [deactivateError, setDeactivateError]     = useState<string | null>(null);

  const companyRef = useRef<HTMLInputElement>(null);

  // ─── Loaders ──────────────────────────────────────────────────────────────────

  function loadCounts() {
    let cancelled = false;
    setCountsLoading(true);
    api.getAdvertiserCounts()
      .then(c  => { if (!cancelled) setCounts(c); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setCountsLoading(false); });
    return () => { cancelled = true; };
  }

  function loadList() {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const filters: Parameters<typeof api.listAdvertisers>[0] = {
      search: searchApplied || undefined,
    };
    if (tab === "ACTIVE")   filters.is_active = true;
    if (tab === "PENDING")  filters.status    = "PENDING";
    if (tab === "INACTIVE") { filters.is_active = false; filters.status = "SUSPENDED" as any; }

    api.listAdvertisers(filters)
      .then(data  => { if (!cancelled) setAdvertisers(data); })
      .catch(err  => { if (!cancelled) setError((err as Error).message || "Failed to load advertisers"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => loadCounts(), []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setPage(1); return loadList(); }, [tab, searchApplied]);

  useEffect(() => {
    if (modal.mode === "ADD" || modal.mode === "EDIT") {
      setTimeout(() => companyRef.current?.focus(), 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.mode]);

  // ─── Filter helpers ────────────────────────────────────────────────────────────

  function applySearch() {
    setPage(1);
    setSearchApplied(searchInput.trim());
  }

  function clearSearch() {
    setSearchInput("");
    setSearchApplied("");
    setPage(1);
  }

  // ─── Add modal ─────────────────────────────────────────────────────────────────

  function openAdd() {
    setForm(emptyForm);
    setFormError(null);
    setModal({ mode: "ADD" });
  }

  async function submitAdd() {
    if (!form.company_name.trim()) { setFormError("Company name is required."); return; }
    if (!form.contact_name.trim()) { setFormError("Contact name is required."); return; }
    if (!form.email.trim())        { setFormError("Email is required."); return; }

    setFormLoading(true);
    setFormError(null);
    try {
      await api.createAdvertiser({
        company_name:      form.company_name.trim(),
        contact_name:      form.contact_name.trim(),
        email:             form.email.trim(),
        phone:             form.phone.trim()             || undefined,
        website:           form.website.trim()           || undefined,
        country:           form.country                  || undefined,
        messenger_contact: form.messenger_contact.trim() || undefined,
        notes:             form.notes.trim()             || undefined,
        status:            "ACTIVE",
      });
      setModal(MODAL_CLOSED);
      loadCounts();
      loadList();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create advertiser");
    } finally {
      setFormLoading(false);
    }
  }

  // ─── View modal ───────────────────────────────────────────────────────────────

  function openView(adv: api.AdvertiserRecord) {
    setModal({ mode: "VIEW", adv });
  }

  // ─── Edit modal ───────────────────────────────────────────────────────────────

  function openEdit(adv: api.AdvertiserRecord) {
    setForm({
      company_name:      adv.company_name,
      contact_name:      adv.contact_name,
      email:             adv.email,
      phone:             adv.phone             ?? "",
      website:           adv.website           ?? "",
      country:           adv.country           ?? "",
      messenger_contact: adv.messenger_contact ?? "",
      notes:             adv.notes             ?? "",
    });
    setFormError(null);
    setModal({ mode: "EDIT", adv });
  }

  async function submitEdit() {
    if (!modal.adv) return;
    if (!form.company_name.trim()) { setFormError("Company name is required."); return; }
    if (!form.contact_name.trim()) { setFormError("Contact name is required."); return; }
    if (!form.email.trim())        { setFormError("Email is required."); return; }

    setFormLoading(true);
    setFormError(null);
    try {
      await api.updateAdvertiser(modal.adv.id, {
        company_name:      form.company_name.trim(),
        contact_name:      form.contact_name.trim(),
        email:             form.email.trim(),
        phone:             form.phone.trim()             || undefined,
        website:           form.website.trim()           || undefined,
        country:           form.country                  || undefined,
        messenger_contact: form.messenger_contact.trim() || undefined,
        notes:             form.notes.trim()             || undefined,
      });
      setModal(MODAL_CLOSED);
      loadList();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to update advertiser");
    } finally {
      setFormLoading(false);
    }
  }

  // ─── Activate inline ──────────────────────────────────────────────────────────

  async function handleActivate(adv: api.AdvertiserRecord) {
    try {
      await api.activateAdvertiser(adv.id);
      loadCounts();
      loadList();
    } catch (err) {
      console.error("Activate failed:", err);
    }
  }

  // ─── Deactivate confirm ───────────────────────────────────────────────────────

  function openDeactivate(adv: api.AdvertiserRecord) {
    setDeactivateError(null);
    setModal({ mode: "DEACTIVATE", adv });
  }

  async function confirmDeactivate() {
    if (!modal.adv) return;
    setDeactivateLoading(true);
    setDeactivateError(null);
    try {
      await api.deactivateAdvertiser(modal.adv.id);
      setModal(MODAL_CLOSED);
      loadCounts();
      loadList();
    } catch (err) {
      setDeactivateError(err instanceof Error ? err.message : "Failed to deactivate");
    } finally {
      setDeactivateLoading(false);
    }
  }

  // ─── Pagination ───────────────────────────────────────────────────────────────

  const totalPages   = Math.max(1, Math.ceil(advertisers.length / PAGE_SIZE));
  const pageSlice    = advertisers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ─── Shared form fields ───────────────────────────────────────────────────────

  const inputCls = "w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 px-4 py-3 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60";
  const labelCls = "block text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-2";

  function FormFields({ disabled }: { disabled?: boolean }) {
    return (
      <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Company Name *</label>
            <input ref={modal.mode === "ADD" ? companyRef : undefined}
              value={form.company_name}
              onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
              disabled={disabled} placeholder="Acme Corp" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Contact Person *</label>
            <input value={form.contact_name}
              onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
              disabled={disabled} placeholder="John Smith" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              disabled={disabled} placeholder="contact@company.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <select value={form.country}
              onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
              disabled={disabled} className={inputCls}>
              <option value="">— Select country —</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input type="tel" value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              disabled={disabled} placeholder="+1 555 000 0000" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Website</label>
            <input value={form.website}
              onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
              disabled={disabled} placeholder="https://company.com" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Messenger Contact</label>
            <input value={form.messenger_contact}
              onChange={e => setForm(f => ({ ...f, messenger_contact: e.target.value }))}
              disabled={disabled} placeholder="Telegram / WhatsApp / Skype" className={inputCls} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Notes <span className="normal-case font-normal">(internal)</span></label>
            <textarea value={form.notes} rows={2}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              disabled={disabled} placeholder="Internal notes…" className={`${inputCls} resize-none`} />
          </div>
        </div>
      </>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Advertisers</div>
        <h2 className="mt-1 text-2xl font-black theme-text-main">Advertiser Management</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total",    icon: Building2,    value: counts?.total,    cls: "text-slate-600",   bg: "bg-slate-100 dark:bg-slate-900" },
          { label: "Active",   icon: CheckCircle2, value: counts?.active,   cls: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Pending",  icon: Clock,        value: counts?.pending,  cls: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-900/20" },
          { label: "Inactive", icon: UserX,        value: counts?.inactive, cls: "text-slate-400",   bg: "bg-slate-50 dark:bg-slate-900" },
        ].map(({ label, icon: Icon, value, cls, bg }) => (
          <div key={label} className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">{label}</div>
              <div className={`rounded-2xl ${bg} p-2.5 ${cls}`}><Icon className="w-4 h-4" /></div>
            </div>
            <div className="mt-5">
              {countsLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
              ) : (
                <div className={`text-3xl font-black ${cls}`}>{(value ?? 0).toLocaleString()}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Table section */}
      <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Advertiser List</div>
            <div className="mt-1 text-sm theme-text-muted">{advertisers.length.toLocaleString()} advertisers</div>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 transition self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Add Advertiser
          </button>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 mb-4 flex-wrap">
          {["ALL", "ACTIVE", "PENDING", "INACTIVE"].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.18em] transition ${
                tab === t
                  ? "bg-cyan-600 text-white"
                  : "border theme-border theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900"
              }`}>
              {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-cyan-600 shrink-0" />}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted pointer-events-none" />
            <input type="text" value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && applySearch()}
              placeholder="Search company, contact, email, country"
              className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-900 pl-9 pr-4 py-2 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <button onClick={applySearch}
            className="rounded-full bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition">
            Search
          </button>
          {searchApplied && (
            <button onClick={clearSearch}
              className="rounded-full border theme-border px-3 py-2 text-xs theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition">
              Clear
            </button>
          )}
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        ) : (
          <>
            <div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b theme-border">
                    {["Company","Contact","Email","Country","Status","Created","Actions"].map(h => (
                      <th key={h} className={`pb-3 ${h === "Actions" ? "text-right pr-0" : "text-left pr-3"} text-xs font-bold uppercase tracking-[0.2em] theme-text-muted whitespace-nowrap`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.length === 0 && !loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center">
                        <Building2 className="w-8 h-8 mx-auto mb-2 theme-text-muted opacity-30" />
                        <div className="text-sm theme-text-muted">
                          {searchApplied ? "No advertisers match your search." : "No advertisers yet. Add the first one."}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pageSlice.map(adv => (
                      <tr key={adv.id}
                        className="border-b theme-border last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 pr-3 max-w-[180px]">
                          <div className="font-semibold theme-text-main truncate">{adv.company_name}</div>
                          <div className="text-xs font-mono theme-text-muted">{adv.id.slice(0, 8)}…</div>
                        </td>
                        <td className="py-3 pr-3 whitespace-nowrap theme-text-main">{adv.contact_name}</td>
                        <td className="py-3 pr-3 theme-text-muted text-xs">{adv.email}</td>
                        <td className="py-3 pr-3 theme-text-muted text-xs whitespace-nowrap">
                          {adv.country || <span className="opacity-30">—</span>}
                        </td>
                        <td className="py-3 pr-3 whitespace-nowrap">
                          <span className={`text-[10px] uppercase tracking-[0.22em] font-bold px-2 py-1 rounded-full ${statusBadge(adv.status, adv.is_active)}`}>
                            {statusLabel(adv.status, adv.is_active)}
                          </span>
                        </td>
                        <td className="py-3 pr-3 text-xs font-mono theme-text-muted whitespace-nowrap">
                          {fmtDate(adv.created_at)}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button onClick={() => openView(adv)} title="View"
                              className="rounded-full border theme-border p-1.5 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => openEdit(adv)} title="Edit"
                              className="rounded-full border theme-border p-1.5 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {adv.is_active ? (
                              <button onClick={() => openDeactivate(adv)} title="Deactivate"
                                className="rounded-full border border-rose-200 p-1.5 text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition">
                                <UserX className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button onClick={() => void handleActivate(adv)} title="Activate"
                                className="rounded-full border border-emerald-200 p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition">
                                <UserCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {advertisers.length > PAGE_SIZE && (
              <div className="mt-4 pt-4 border-t theme-border flex items-center justify-between gap-4">
                <span className="text-xs theme-text-muted">
                  {advertisers.length.toLocaleString()} total · Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                    className="rounded-full border theme-border p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="rounded-full border theme-border p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ── View Modal ────────────────────────────────────────────────────────── */}
      {modal.mode === "VIEW" && modal.adv && (() => {
        const adv = modal.adv;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(MODAL_CLOSED)} />
            <div className="relative w-full max-w-lg theme-bg-card border theme-border rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3 mb-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Advertiser Details</div>
                  <div className="mt-1 text-xl font-black theme-text-main">{adv.company_name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-[0.22em] font-bold px-2.5 py-1.5 rounded-full ${statusBadge(adv.status, adv.is_active)}`}>
                    {statusLabel(adv.status, adv.is_active)}
                  </span>
                  <button onClick={() => setModal(MODAL_CLOSED)}
                    className="rounded-full p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border theme-border px-4 py-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Users className="w-3.5 h-3.5 theme-text-muted" />
                    <span className="text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Contact</span>
                  </div>
                  <div className="font-semibold theme-text-main">{adv.contact_name}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border theme-border px-4 py-3">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Mail className="w-3.5 h-3.5 theme-text-muted" />
                      <span className="text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Email</span>
                    </div>
                    <div className="text-sm theme-text-main break-all">{adv.email}</div>
                  </div>
                  {adv.country && (
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border theme-border px-4 py-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <MapPin className="w-3.5 h-3.5 theme-text-muted" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Country</span>
                      </div>
                      <div className="text-sm theme-text-main">{adv.country}</div>
                    </div>
                  )}
                  {adv.phone && (
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border theme-border px-4 py-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Phone className="w-3.5 h-3.5 theme-text-muted" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Phone</span>
                      </div>
                      <div className="text-sm theme-text-main">{adv.phone}</div>
                    </div>
                  )}
                  {adv.website && (
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border theme-border px-4 py-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Globe className="w-3.5 h-3.5 theme-text-muted" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Website</span>
                      </div>
                      <div className="text-sm theme-text-main break-all">{adv.website}</div>
                    </div>
                  )}
                  {adv.messenger_contact && (
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border theme-border px-4 py-3 sm:col-span-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <MessageSquare className="w-3.5 h-3.5 theme-text-muted" />
                        <span className="text-xs font-bold uppercase tracking-[0.2em] theme-text-muted">Messenger</span>
                      </div>
                      <div className="text-sm theme-text-main">{adv.messenger_contact}</div>
                    </div>
                  )}
                </div>

                {adv.notes && (
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.2em] theme-text-muted mb-1">Internal Notes</div>
                    <div className="text-sm theme-text-main whitespace-pre-wrap">{adv.notes}</div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs theme-text-muted pt-2 border-t theme-border">
                  <div><span className="font-bold">Created:</span> {fmtDateTime(adv.created_at)}</div>
                  <div><span className="font-bold">Updated:</span> {fmtDateTime(adv.updated_at)}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button onClick={() => { setModal(MODAL_CLOSED); setTimeout(() => openEdit(adv), 50); }}
                  className="flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 transition">
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                {adv.is_active ? (
                  <button onClick={() => { setModal(MODAL_CLOSED); setTimeout(() => openDeactivate(adv), 50); }}
                    className="flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition">
                    <UserX className="w-4 h-4" /> Deactivate
                  </button>
                ) : (
                  <button onClick={() => { setModal(MODAL_CLOSED); void handleActivate(adv); }}
                    className="flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition">
                    <UserCheck className="w-4 h-4" /> Activate
                  </button>
                )}
                <button onClick={() => setModal(MODAL_CLOSED)}
                  className="rounded-full border theme-border px-4 py-2.5 text-sm font-semibold theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Add Modal ─────────────────────────────────────────────────────────── */}
      {modal.mode === "ADD" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { if (!formLoading) setModal(MODAL_CLOSED); }} />
          <div className="relative w-full max-w-lg theme-bg-card border theme-border rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">New Advertiser</div>
                <div className="mt-1 font-bold theme-text-main">Add Advertiser</div>
              </div>
              <button onClick={() => { if (!formLoading) setModal(MODAL_CLOSED); }} disabled={formLoading}
                className="rounded-full p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <FormFields disabled={formLoading} />

            {formError && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{formError}
              </div>
            )}

            <div className="flex items-center gap-3 mt-5">
              <button onClick={() => void submitAdd()} disabled={formLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-40 transition">
                {formLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Plus className="w-4 h-4" /> Add Advertiser</>}
              </button>
              <button onClick={() => { if (!formLoading) setModal(MODAL_CLOSED); }} disabled={formLoading}
                className="rounded-full border theme-border px-4 py-2.5 text-sm font-semibold theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ────────────────────────────────────────────────────────── */}
      {modal.mode === "EDIT" && modal.adv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { if (!formLoading) setModal(MODAL_CLOSED); }} />
          <div className="relative w-full max-w-lg theme-bg-card border theme-border rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Edit Advertiser</div>
                <div className="mt-1 font-bold theme-text-main">{modal.adv.company_name}</div>
              </div>
              <button onClick={() => { if (!formLoading) setModal(MODAL_CLOSED); }} disabled={formLoading}
                className="rounded-full p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <FormFields disabled={formLoading} />

            {formError && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{formError}
              </div>
            )}

            <div className="flex items-center gap-3 mt-5">
              <button onClick={() => void submitEdit()} disabled={formLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-40 transition">
                {formLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Pencil className="w-4 h-4" /> Save Changes</>}
              </button>
              <button onClick={() => { if (!formLoading) setModal(MODAL_CLOSED); }} disabled={formLoading}
                className="rounded-full border theme-border px-4 py-2.5 text-sm font-semibold theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Deactivate Confirm ────────────────────────────────────────────────── */}
      {modal.mode === "DEACTIVATE" && modal.adv && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => { if (!deactivateLoading) setModal(MODAL_CLOSED); }} />
          <div className="relative w-full max-w-md theme-bg-card border theme-border rounded-3xl p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] font-bold text-amber-500">Deactivate Advertiser</div>
                <div className="mt-1 font-bold theme-text-main">{modal.adv.company_name}</div>
              </div>
              <button onClick={() => { if (!deactivateLoading) setModal(MODAL_CLOSED); }} disabled={deactivateLoading}
                className="rounded-full p-2 theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 px-4 py-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                  <div className="font-semibold">This will block the advertiser from logging in.</div>
                  <div>Advertiser: <strong>{modal.adv.company_name}</strong></div>
                  <div>Contact: <strong>{modal.adv.contact_name}</strong></div>
                  <div>Email: <strong>{modal.adv.email}</strong></div>
                </div>
              </div>
            </div>

            {deactivateError && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center gap-2 text-rose-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />{deactivateError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button onClick={() => void confirmDeactivate()} disabled={deactivateLoading}
                className="flex-1 flex items-center justify-center gap-2 rounded-full bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-400 disabled:opacity-40 transition">
                {deactivateLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Deactivating…</> : <><UserX className="w-4 h-4" /> Deactivate</>}
              </button>
              <button onClick={() => { if (!deactivateLoading) setModal(MODAL_CLOSED); }} disabled={deactivateLoading}
                className="rounded-full border theme-border px-4 py-2.5 text-sm font-semibold theme-text-muted hover:bg-slate-100 dark:hover:bg-slate-900 disabled:opacity-40 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
