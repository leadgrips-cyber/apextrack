import React, { useState } from "react";
import { Key, Copy, Check, RefreshCw, Terminal, Info, Globe, ShieldAlert, Sliders } from "lucide-react";

export function ApiAccessView() {
  const [apiKey, setApiKey] = useState("idx_pub_live_9a8f821c33b74052adef91e9ffd981h902");
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [ipWhiteList, setIpWhiteList] = useState("184.22.90.11\n74.120.244.5");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Curl example block code
  const curlExample = `curl -X GET "https://api.apextrack.com/v2/offers" \\
  -H "Accept: application/json" \\
  -H "x-apextrack-api-key: ${apiKey}"`;

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

  const handleSaveIps = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="api-access-view">
      
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            <Key className="w-5 h-5 text-cyan-400" />
            Developer Security Tokens & API Keys
          </h2>
          <p className="text-xs text-slate-400">
            Fetch offers, campaign landing metadata, and reports dynamically into your software layer.
          </p>
        </div>
        <div className="bg-slate-950 px-2.5 py-1 rounded text-[10px] text-slate-400 font-mono border border-slate-900 select-all shrink-0">
          Core Gateway: <span className="text-cyan-400 font-bold">API Access Tokens (v2.0)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* TOKENS GENERATION BOX: LEFT (7/12) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
          
          <div className="space-y-3">
            <h3 className="text-white text-xs font-bold uppercase font-mono tracking-wider">
              Private Security Authentication token
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Authenticate API loops by passing the following private hash token directly inside the <code>x-apextrack-api-key</code> HTTP request header. Maintain token secrecy.
            </p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-850 flex flex-col md:flex-row items-center justify-between gap-4">
              <code className="text-cyan-300 font-mono text-xs break-all select-all font-semibold select-none leading-normal">
                {apiKey}
              </code>
              
              <div className="flex items-center gap-2 shrink-0 select-none">
                <button
                  onClick={handleCopyKey}
                  className="bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 text-xs transition flex items-center gap-1 font-mono uppercase cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
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
                  className="bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-900 text-slate-950 px-2.5 py-1.5 rounded-lg text-xs transition font-mono uppercase font-black cursor-pointer"
                  title="Generate NEW random API gateway secret"
                >
                  {isRegenerating ? <RefreshCw className="w-4 h-4 animate-spin text-slate-950" /> : "Regen"}
                </button>
              </div>
            </div>
          </div>

          {/* IP whitelist constraints */}
          <form onSubmit={handleSaveIps} className="space-y-3 pt-2">
            <div className="space-y-0.5">
              <strong className="text-white text-xs uppercase font-mono tracking-wider block">
                Restrict access by client IP Whitelists (Recommended)
              </strong>
              <p className="text-slate-450 text-[11px]">
                API query gateways will instantly reject payloads originating from IP addresses omitted from this listing. Enter one IP address per line.
              </p>
            </div>

            {saveSuccess && (
              <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 p-2 text-xs rounded-lg">
                ✓ Whitelisted IP parameters indexed updated on gateway security rules.
              </div>
            )}

            <textarea
              value={ipWhiteList}
              onChange={(e) => setIpWhiteList(e.target.value)}
              rows={3}
              placeholder="e.g. 192.168.1.10"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 leading-normal focus:outline-none focus:border-cyan-500"
            />

            <button
              type="submit"
              className="bg-slate-950 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition select-none cursor-pointer font-mono uppercase"
            >
              Save IP Access Whitelists
            </button>
          </form>

        </div>

        {/* INTEGRATION DOCS & CURL: RIGHT (5/12) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-white text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-cyan-400" />
              API Shell Query terminal Code
            </h3>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Download current campaign catalogs in JSON formats using standard Unix query tools:
            </p>

            <pre className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-cyan-300 text-[10px] font-mono whitespace-pre-wrap select-all leading-normal">
              {curlExample}
            </pre>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
              <strong className="text-[10px] uppercase font-bold text-slate-500 font-mono block">
                API Rate throttling guidelines
              </strong>
              <p className="text-[11px] text-slate-400 leading-normal">
                Standard affiliate profiles are limited to <strong>20,000 requests hourly</strong>. Contact support dynamically for premium web-scale real-time API rates clearance.
              </p>
            </div>
          </div>

          <div className="bg-cyan-950/20 border border-cyan-850/40 rounded-xl p-3 flex gap-2 text-[10px] text-cyan-400 leading-relaxed">
            <ShieldAlert className="w-5 h-5 shrink-0 text-cyan-400" />
            <span>Never bundle API keys directly inside javascript codes targeted for public client browsers; proxy queries securely through your server backend.</span>
          </div>

        </div>

      </div>

    </div>
  );
}
