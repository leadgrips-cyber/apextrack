import { useState, useEffect } from "react";
import { Key, Copy, Check, RefreshCw, Terminal, ShieldAlert, AlertCircle, Loader2, BookOpen, ExternalLink } from "lucide-react";
import { useBranding } from "../contexts/BrandingContext";

interface ApiToken {
  id: string;
  description: string;
  scopes: string[];
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
}

export function ApiAccessView() {
  const branding = useBranding();
  const [token, setToken] = useState<ApiToken | null>(null);
  const [rawToken, setRawToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiHeaderName = `x-${branding.networkName.toLowerCase().replace(/\s+/g, "-")}-api-key`;

  useEffect(() => {
    const authToken = localStorage.getItem("token");
    if (!authToken) { setLoading(false); return; }
    fetch("/api/publisher/me/api-token", {
      headers: { Authorization: `Bearer ${authToken}` },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load API token");
        const data = await r.json();
        setToken(data.token ?? null);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError(null);
    const authToken = localStorage.getItem("token");
    if (!authToken) { setIsRegenerating(false); return; }
    try {
      const r = await fetch("/api/publisher/me/api-token/regenerate", {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!r.ok) throw new Error("Failed to generate token");
      const data = await r.json();
      setToken(data.token);
      setRawToken(data.raw_token);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayToken = rawToken ?? (token ? "(token hidden — regenerate to reveal)" : null);
  const curlExample = displayToken && displayToken !== "(token hidden — regenerate to reveal)"
    ? `curl -X GET "${window.location.origin}/api/offers" \\\n  -H "Accept: application/json" \\\n  -H "${apiHeaderName}: ${displayToken}"`
    : `curl -X GET "${window.location.origin}/api/offers" \\\n  -H "Accept: application/json" \\\n  -H "${apiHeaderName}: <your-api-token>"`;

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="api-access-view">
      <div className="theme-bg-card border theme-border p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-lg font-bold theme-text-main tracking-tight flex items-center gap-1.5">
            <Key className="w-5 h-5 text-cyan-500" />
            API Access
          </h2>
          <p className="text-sm theme-text-secondary">
            Manage your publisher API key for secure backend integration.
          </p>
        </div>
        <a
          href="/api-docs"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 border theme-border hover:bg-slate-100 dark:hover:bg-slate-800 theme-text-main px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold transition cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          API Documentation
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 theme-bg-card border theme-border p-6 rounded-2xl space-y-6 shadow-xs">
            <div className="space-y-3">
              <h3 className="theme-text-main text-xs font-bold uppercase font-mono tracking-wider">
                API Token
              </h3>

              {error && (
                <div className="flex items-center gap-2 text-rose-600 text-xs bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              {rawToken && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300">
                  <strong>Copy your token now.</strong> It will not be shown again after you leave this page.
                </div>
              )}

              <div className="p-4 theme-bg-well rounded-xl border theme-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {displayToken ? (
                  <code className="theme-text-main font-mono text-xs break-all select-all font-semibold leading-normal flex-1">
                    {displayToken}
                  </code>
                ) : (
                  <span className="theme-text-muted text-xs italic flex-1">
                    No API token yet. Click "Generate Token" to create one.
                  </span>
                )}
                <div className="flex items-center gap-2 shrink-0 select-none">
                  {displayToken && displayToken !== "(token hidden — regenerate to reveal)" && (
                    <button
                      onClick={() => handleCopy(displayToken)}
                      className="theme-bg-card border theme-border hover:bg-slate-100 dark:hover:bg-slate-800 theme-text-main px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1 font-mono uppercase cursor-pointer"
                    >
                      {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  )}
                  <button
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-xs transition font-mono uppercase font-bold cursor-pointer flex items-center gap-1"
                  >
                    {isRegenerating ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Working…</> : token ? "Regenerate" : "Generate Token"}
                  </button>
                </div>
              </div>

              {token && (
                <div className="text-[10px] theme-text-muted font-mono space-y-0.5">
                  <div>Scopes: {token.scopes.join(", ")}</div>
                  <div>Created: {new Date(token.created_at).toLocaleDateString()}</div>
                  {token.last_used_at && <div>Last used: {new Date(token.last_used_at).toLocaleDateString()}</div>}
                  {token.expires_at && <div>Expires: {new Date(token.expires_at).toLocaleDateString()}</div>}
                </div>
              )}
            </div>

            <div className="theme-bg-well rounded-xl border theme-border p-4 text-xs theme-text-secondary leading-relaxed">
              <strong className="theme-text-main">Note:</strong> Keep your API token secret. Never expose it in client-side JavaScript. Regenerating a token invalidates the previous one immediately.
            </div>
          </div>

          <div className="lg:col-span-5 theme-bg-card border theme-border p-6 rounded-2xl flex flex-col justify-between space-y-6 shadow-xs">
            <div className="space-y-4">
              <h3 className="theme-text-main text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-500" />
                Usage Example
              </h3>
              <pre className="p-4 theme-bg-well border theme-border rounded-xl theme-text-main text-[10px] font-mono whitespace-pre-wrap select-all leading-normal">
                {curlExample}
              </pre>
              <div className="theme-bg-well p-4 rounded-xl border theme-border text-[10px] theme-text-secondary space-y-1">
                <strong className="block uppercase tracking-wider theme-text-main font-bold text-[10px] font-mono">Guidelines</strong>
                <p>Pass your token in the <code>{apiHeaderName}</code> header on every request. Proxy from your backend — do not expose in browser JavaScript.</p>
              </div>
            </div>
            <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900 rounded-xl p-3 text-[10px] text-cyan-700 dark:text-cyan-300 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>API tokens are hashed in the database. Only you can see the raw token immediately after generation.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
