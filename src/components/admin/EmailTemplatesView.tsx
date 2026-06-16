import { useState, useEffect, useRef } from "react";
import { MailOpen, Save, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import {
  listEmailTemplates,
  updateEmailTemplate,
  type EmailTemplate,
} from "../../services/mailer";

const VARIABLES = [
  { key: "{{first_name}}",        desc: "Recipient first name" },
  { key: "{{last_name}}",         desc: "Recipient last name" },
  { key: "{{email}}",             desc: "Recipient email address" },
  { key: "{{network_name}}",      desc: "Network name from settings" },
  { key: "{{login_url}}",         desc: "Portal login URL" },
  { key: "{{verification_link}}", desc: "Email verification link" },
  { key: "{{reset_link}}",        desc: "Password reset link" },
  { key: "{{offer_name}}",        desc: "Offer title" },
  { key: "{{invoice_number}}",    desc: "Invoice reference number" },
  { key: "{{amount}}",            desc: "Monetary amount" },
  { key: "{{status}}",            desc: "Account or record status" },
];

const INPUT  = "w-full rounded-xl border theme-border bg-white dark:bg-slate-900 px-3 py-2.5 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 transition";
const LABEL  = "block text-[10px] font-bold uppercase tracking-[0.18em] theme-text-muted mb-1.5";

export function EmailTemplatesView() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selected, setSelected]   = useState<EmailTemplate | null>(null);
  const [subject,  setSubject]    = useState("");
  const [bodyHtml, setBodyHtml]   = useState("");
  const [isActive, setIsActive]   = useState(true);
  const [loading,  setLoading]    = useState(true);
  const [loadErr,  setLoadErr]    = useState<string | null>(null);
  const [saving,   setSaving]     = useState(false);
  const [msg,      setMsg]        = useState<{ ok: boolean; text: string } | null>(null);
  const [preview,  setPreview]    = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    listEmailTemplates()
      .then((tpls) => { setTemplates(tpls); if (tpls.length > 0) selectTemplate(tpls[0]); })
      .catch((err) => setLoadErr(err instanceof Error ? err.message : "Failed to load templates."))
      .finally(() => setLoading(false));
  }, []);

  function selectTemplate(tpl: EmailTemplate) {
    setSelected(tpl);
    setSubject(tpl.subject);
    setBodyHtml(tpl.body_html);
    setIsActive(tpl.is_active);
    setMsg(null);
    setPreview(false);
  }

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setMsg(null);
    try {
      const updated = await updateEmailTemplate(selected.slug, {
        subject,
        body_html: bodyHtml,
        is_active: isActive,
      });
      setTemplates((prev) => prev.map((t) => (t.slug === updated.slug ? updated : t)));
      setSelected(updated);
      setMsg({ ok: true, text: "Template saved." });
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Save failed." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (loadErr) {
    return (
      <div className="p-6 max-w-xl">
        <div className="rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 px-5 py-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">Failed to load templates</p>
            <p className="text-xs text-rose-600 dark:text-rose-500 mt-0.5">{loadErr}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">

      <div className="flex items-center gap-2">
        <MailOpen className="w-5 h-5 text-cyan-500" />
        <h1 className="text-xl font-black theme-text-main">Email Templates</h1>
        <span className="ml-2 text-xs theme-text-muted">{templates.length} templates</span>
      </div>

      <div className="flex gap-5 items-start">

        {/* Template list */}
        <div className="w-52 shrink-0 space-y-1">
          {templates.map((tpl) => (
            <button
              key={tpl.slug}
              type="button"
              onClick={() => selectTemplate(tpl)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between gap-2 ${
                selected?.slug === tpl.slug
                  ? 'bg-cyan-600 text-white'
                  : 'theme-text-main hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="truncate">{tpl.name}</span>
              {!tpl.is_active && (
                <span className={`shrink-0 text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                  selected?.slug === tpl.slug
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 theme-text-muted'
                }`}>OFF</span>
              )}
            </button>
          ))}
        </div>

        {/* Editor */}
        {selected && (
          <div className="flex-1 min-w-0 space-y-4">

            {/* Template header */}
            <div className="flex items-center justify-between gap-3 theme-bg-card border theme-border rounded-2xl px-5 py-3">
              <div>
                <div className="text-sm font-black theme-text-main">{selected.name}</div>
                <div className="text-[10px] theme-text-muted font-mono">{selected.slug}</div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <span className="text-xs theme-text-muted">{isActive ? 'Active' : 'Inactive'}</span>
                <button type="button"
                  onClick={() => setIsActive((v) => !v)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                    isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  }`}>
                  <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-0.5 ${
                    isActive ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </label>
            </div>

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

            {/* Subject */}
            <div>
              <label className={LABEL}>Subject Line</label>
              <input value={subject} onChange={(e) => setSubject(e.target.value)} className={INPUT} />
            </div>

            {/* HTML Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={LABEL} style={{ margin: 0 }}>HTML Body</label>
                <button
                  type="button"
                  onClick={() => setPreview((v) => !v)}
                  className="flex items-center gap-1.5 text-xs theme-text-muted hover:text-cyan-600 transition font-semibold"
                >
                  {preview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {preview ? 'Edit HTML' : 'Preview'}
                </button>
              </div>

              {preview ? (
                <div className="rounded-xl border theme-border overflow-hidden bg-white" style={{ minHeight: 400 }}>
                  <iframe
                    srcDoc={bodyHtml}
                    title="Email Preview"
                    className="w-full border-0"
                    style={{ height: 560 }}
                    sandbox="allow-same-origin"
                  />
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={bodyHtml}
                  onChange={(e) => setBodyHtml(e.target.value)}
                  rows={22}
                  className="w-full rounded-xl border theme-border bg-slate-950 text-slate-100 px-4 py-3 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-cyan-500 transition resize-y"
                  spellCheck={false}
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition disabled:opacity-50">
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : "Save Template"}
              </button>
            </div>

            {/* Variable reference */}
            <div className="theme-bg-well border theme-border rounded-2xl p-4">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] theme-text-muted mb-3">
                Available Variables
              </div>
              <div className="grid grid-cols-2 gap-2">
                {VARIABLES.map((v) => (
                  <div key={v.key} className="flex items-start gap-2">
                    <code
                      className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30 px-1.5 py-0.5 rounded shrink-0 cursor-pointer hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition"
                      onClick={() => {
                        const el = textareaRef.current;
                        if (!el) { setBodyHtml((b) => b + v.key); return; }
                        const start = el.selectionStart ?? bodyHtml.length;
                        const end = el.selectionEnd ?? bodyHtml.length;
                        const next = bodyHtml.slice(0, start) + v.key + bodyHtml.slice(end);
                        setBodyHtml(next);
                        requestAnimationFrame(() => {
                          el.focus();
                          el.selectionStart = el.selectionEnd = start + v.key.length;
                        });
                      }}
                      title="Click to insert at cursor"
                    >
                      {v.key}
                    </code>
                    <span className="text-[10px] theme-text-muted">{v.desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] theme-text-muted mt-3">Click a variable to insert it at the cursor position in the HTML editor.</p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
