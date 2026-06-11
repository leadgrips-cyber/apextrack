import React, { useState } from "react";
import { Key, Copy, Check, RefreshCw, Terminal, ShieldAlert } from "lucide-react";
import { useBranding } from "../contexts/BrandingContext";

export function ApiAccessView() {
  const branding = useBranding();
  const [apiKey, setApiKey] = useState("idx_pub_live_9a8f821c33b74052adef91e9ffd981h902");
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const apiHeaderName = `x-${branding.networkName.toLowerCase().replace(/\s+/g, "-")}-api-key`;
  const curlExample = `curl -X GET "https://api.example.com/v2/offers" \\
  -H "Accept: application/json" \\
  -H "${apiHeaderName}: ${apiKey}"`;

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateKey = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
      const chars = "abcdef0123456789";
      let hex = "";
      for (let i = 0; i < 32; i++) {
        hex += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setApiKey(`idx_pub_live_${hex}`);
    }, 1000);
  };

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="api-access-view">
      <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-950 tracking-tight flex items-center gap-1.5">
            <Key className="w-5 h-5 text-cyan-500" />
            API Access & Documentation
          </h2>
          <p className="text-sm text-slate-600">
            Manage your publisher API key and review supported request examples for secure backend integration.
          </p>
        </div>
        <div className="bg-slate-50 px-2.5 py-1 rounded text-[10px] text-slate-600 font-mono border border-slate-200 select-all shrink-0">
          Core Gateway: <span className="text-cyan-600 font-bold">API Access Tokens (v2.0)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-2xl space-y-6 shadow-sm">
          <div className="space-y-3">
            <h3 className="text-slate-950 text-xs font-bold uppercase font-mono tracking-wider">
              Private Security Authentication token
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Authenticate API loops by passing the following private hash token directly inside the <code>{apiHeaderName}</code> HTTP request header.
            </p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <code className="text-slate-900 font-mono text-xs break-all select-all font-semibold leading-normal">
                {apiKey}
              </code>
              <div className="flex items-center gap-2 shrink-0 select-none">
                <button
                  onClick={handleCopyKey}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 text-xs transition flex items-center gap-1 font-mono uppercase cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={handleRegenerateKey}
                  disabled={isRegenerating}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-200 text-white px-2.5 py-1.5 rounded-lg text-xs transition font-mono uppercase font-black cursor-pointer"
                  title="Generate a new API key"
                >
                  {isRegenerating ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : "Regenerate"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-slate-600 text-xs leading-relaxed">
            <strong className="text-slate-950">Note:</strong> IP whitelisting is managed from the Admin Panel only. Publishers can use this page solely to copy, regenerate, and review API documentation.
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-4">
            <h3 className="text-slate-950 text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-500" />
              API Documentation & CURL Examples
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Use these examples to integrate secure API calls from your server backend with the publisher key.
            </p>
            <pre className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-[10px] font-mono whitespace-pre-wrap select-all leading-normal">
              {curlExample}
            </pre>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-[10px] text-slate-600">
              <strong className="block uppercase tracking-wider text-slate-700 font-bold text-[10px] font-mono">Usage Guidelines</strong>
              <p>Send the <code>x-apextrack-api-key</code> header on every request and proxy from your backend. Do not expose this key in browser-side JavaScript.</p>
            </div>
          </div>
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-3 text-[10px] text-cyan-700 leading-relaxed">
            <ShieldAlert className="w-5 h-5 shrink-0 text-cyan-600" />
            Keep API keys secret. Admin-managed whitelists are enforced outside of publisher view.
          </div>
        </div>
      </div>
    </div>
  );
}
