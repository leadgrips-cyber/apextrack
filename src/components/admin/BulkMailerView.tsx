import { useState, useEffect, useCallback } from "react";
import { Send, Users, RefreshCw, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, Settings } from "lucide-react";
import {
  listEmailTemplates,
  previewBulkCount,
  sendBulkMail,
  getSmtpStatus,
  type EmailTemplate,
} from "../../services/mailer";

const INPUT = "w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 transition";
const LABEL = "block text-[10px] font-bold uppercase tracking-[0.18em] theme-text-muted mb-1.5";

const RECIPIENT_TYPES = [
  { value: 'publisher',  label: 'Affiliates (Publishers)' },
  { value: 'advertiser', label: 'Advertisers' },
  { value: 'manager',    label: 'Affiliate Managers' },
] as const;

const PUBLISHER_STATUSES  = ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED', 'DEACTIVATED'];
const ADVERTISER_STATUSES = ['PENDING', 'ACTIVE', 'PAUSED', 'SUSPENDED'];

export function BulkMailerView() {
  const [recipientType, setRecipientType] = useState<'publisher' | 'advertiser' | 'manager'>('publisher');
  const [statusFilter,  setStatusFilter]  = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [templates,     setTemplates]     = useState<EmailTemplate[]>([]);
  const [templateSlug,  setTemplateSlug]  = useState("custom");
  const [subject,       setSubject]       = useState("");
  const [bodyHtml,      setBodyHtml]      = useState("");
  const [preview,       setPreview]       = useState(false);
  const [count,         setCount]         = useState<number | null>(null);
  const [counting,      setCounting]      = useState(false);
  const [sending,       setSending]       = useState(false);
  const [msg,           setMsg]           = useState<{ ok: boolean; text: string } | null>(null);
  const [confirm,       setConfirm]       = useState(false);
  const [smtpEnabled,   setSmtpEnabled]   = useState<boolean | null>(null);
  const [smtpLoading,   setSmtpLoading]   = useState(true);

  useEffect(() => {
    listEmailTemplates()
      .then((tpls) => setTemplates(tpls.filter((t) => t.is_active)))
      .catch(() => {});

    getSmtpStatus()
      .then((configured) => setSmtpEnabled(configured))
      .finally(() => setSmtpLoading(false));
  }, []);

  useEffect(() => {
    if (templateSlug === 'custom') return;
    const tpl = templates.find((t) => t.slug === templateSlug);
    if (tpl) { setSubject(tpl.subject); setBodyHtml(tpl.body_html); }
  }, [templateSlug, templates]);

  const fetchCount = useCallback(async () => {
    setCounting(true);
    try {
      const n = await previewBulkCount(recipientType, {
        status:  statusFilter  || undefined,
        country: countryFilter || undefined,
      });
      setCount(n);
    } catch {
      setCount(null);
    } finally {
      setCounting(false);
    }
  }, [recipientType, statusFilter, countryFilter]);

  async function handleSend() {
    if (!subject.trim() || !bodyHtml.trim()) {
      setMsg({ ok: false, text: "Subject and body are required." });
      return;
    }
    setSending(true);
    setMsg(null);
    setConfirm(false);
    try {
      const result = await sendBulkMail({
        recipient_type: recipientType,
        template_slug:  templateSlug !== 'custom' ? templateSlug : undefined,
        subject,
        body_html: bodyHtml,
        filters: {
          status:  statusFilter  || undefined,
          country: countryFilter || undefined,
        },
      });
      setMsg({
        ok: true,
        text: `Done. Sent: ${result.sent} / Failed: ${result.failed} / Total: ${result.total}`,
      });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Bulk send failed." });
    } finally {
      setSending(false);
    }
  }

  const statusOptions = recipientType === 'advertiser' ? ADVERTISER_STATUSES : PUBLISHER_STATUSES;
  const showFilters   = recipientType !== 'manager';

  const allLabel = recipientType === 'publisher'
    ? 'All Affiliates'
    : recipientType === 'advertiser'
    ? 'All Advertisers'
    : 'All Managers';

  return (
    <div className="p-6 max-w-3xl space-y-6">

      {/* Header */}
      <div className="flex items-center gap-2">
        <Send className="w-5 h-5 text-cyan-500" />
        <h1 className="text-xl font-black theme-text-main">Bulk Mailer</h1>
      </div>

      {/* SMTP warning */}
      {!smtpLoading && smtpEnabled === false && (
        <div className="rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-700 dark:text-amber-400">
            <p className="font-semibold">SMTP not configured</p>
            <p className="text-xs mt-0.5">
              Configure SMTP settings first before sending bulk emails.{" "}
              <a href="#smtp-settings" className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-200 transition">
                Go to SMTP Settings
              </a>
            </p>
          </div>
          <Settings className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 ml-auto" />
        </div>
      )}

      {msg && (
        <div className={`rounded-xl border px-4 py-3 flex items-center gap-2 text-sm ${
          msg.ok
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400'
        }`}>
          {msg.ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {msg.text}
        </div>
      )}

      {/* Recipients */}
      <div className="theme-bg-card border theme-border rounded-2xl p-5 space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted border-b theme-border pb-3">
          Recipients
        </h2>

        <div className="flex gap-3 flex-wrap">
          {RECIPIENT_TYPES.map((rt) => (
            <button
              key={rt.value}
              type="button"
              onClick={() => { setRecipientType(rt.value); setStatusFilter(""); setCount(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition ${
                recipientType === rt.value
                  ? 'bg-cyan-600 border-cyan-600 text-white'
                  : 'theme-border theme-text-main hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              {rt.label}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Filter by Status</label>
              <select value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCount(null); }}
                className={INPUT}>
                <option value="">{allLabel}</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()} {recipientType === 'publisher' ? 'Affiliates' : recipientType === 'advertiser' ? 'Advertisers' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={LABEL}>Filter by Country</label>
              <input value={countryFilter}
                onChange={(e) => { setCountryFilter(e.target.value); setCount(null); }}
                placeholder={recipientType === 'publisher' ? 'Country code, e.g. US or GB' : 'Country name, e.g. United States'}
                className={INPUT} />
              <p className="text-[10px] theme-text-muted mt-1">
                {recipientType === 'publisher'
                  ? 'Affiliates store 2-letter country codes (ISO 3166-1 alpha-2)'
                  : 'Advertisers store full country names'}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button type="button" onClick={fetchCount} disabled={counting}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 theme-text-main font-semibold px-4 py-2 rounded-xl text-sm transition disabled:opacity-50">
            {counting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
            Preview Count
          </button>
          {count !== null && !counting && (
            <span className="text-sm font-bold theme-text-main">
              <span className="text-cyan-600">{count}</span> recipients will receive this email
              {!statusFilter && <span className="text-xs font-normal theme-text-muted ml-1">({allLabel})</span>}
            </span>
          )}
        </div>
      </div>

      {/* Message */}
      <div className="theme-bg-card border theme-border rounded-2xl p-5 space-y-4">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] theme-text-muted border-b theme-border pb-3">
          Message
        </h2>

        <div>
          <label className={LABEL}>Template</label>
          <select value={templateSlug} onChange={(e) => setTemplateSlug(e.target.value)} className={INPUT}>
            <option value="custom">— Custom (write below) —</option>
            {templates.map((t) => (
              <option key={t.slug} value={t.slug}>{t.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={LABEL}>Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject line — supports {{variables}}"
            className={INPUT} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={LABEL} style={{ margin: 0 }}>HTML Body</label>
            <button type="button"
              onClick={() => setPreview((v) => !v)}
              className="flex items-center gap-1 text-xs theme-text-muted hover:text-cyan-600 transition font-semibold">
              {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {preview ? 'Edit' : 'Preview'}
            </button>
          </div>

          {preview ? (
            <div className="rounded-xl border theme-border overflow-hidden bg-white" style={{ minHeight: 280 }}>
              <iframe srcDoc={bodyHtml} title="Preview" className="w-full border-0" style={{ height: 360 }}
                sandbox="allow-same-origin" />
            </div>
          ) : (
            <textarea value={bodyHtml} onChange={(e) => setBodyHtml(e.target.value)}
              rows={12}
              placeholder="<p>Hi {{first_name}}, ...</p>"
              className="w-full rounded-xl border theme-border bg-slate-950 text-slate-100 px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 transition resize-y"
              spellCheck={false} />
          )}
          <p className="text-[10px] theme-text-muted mt-1">
            Supports: {'{{first_name}} {{last_name}} {{email}} {{network_name}} {{login_url}}'}
          </p>
        </div>

        {/* Send */}
        {!confirm ? (
          <button type="button"
            disabled={!subject.trim() || !bodyHtml.trim() || sending || counting || smtpEnabled === false}
            onClick={async () => {
              if (count === null) await fetchCount();
              setConfirm(true);
            }}
            title={smtpEnabled === false ? "Configure SMTP settings first" : undefined}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition disabled:opacity-40">
            {counting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {counting ? "Checking recipients…" : smtpEnabled === false ? "SMTP Not Configured" : "Send Bulk Email"}
          </button>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">
              Confirm bulk send to <strong>{count ?? '?'}</strong> recipients
              {!statusFilter && <span className="font-normal"> ({allLabel})</span>}?
              {count !== null && count > 100 && (
                <span className="block text-amber-600 mt-0.5">Large send — may take several minutes to complete.</span>
              )}
            </span>
            <button onClick={handleSend} disabled={sending}
              className="ml-auto flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition disabled:opacity-50">
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              {sending ? "Sending…" : "Yes, Send"}
            </button>
            <button onClick={() => setConfirm(false)} disabled={sending}
              className="text-xs theme-text-muted hover:theme-text-main font-semibold transition px-2 py-1.5 rounded-lg">
              Cancel
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
