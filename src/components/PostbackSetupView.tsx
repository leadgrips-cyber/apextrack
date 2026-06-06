import React, { useState, useMemo } from "react";
import { Radio, RefreshCw, Layers, Sliders, Play, Code, CheckCircle, HelpCircle } from "lucide-react";
import { DEMO_OFFERS, SYSTEM_POSTBACK_PLACEHOLDERS } from "../data/publisherDemo";

export function PostbackSetupView() {
  const approvedOffers = useMemo(() => DEMO_OFFERS.filter(o => o.status === "active"), []);

  // Postback states
  const [globalPostbackUrl, setGlobalPostbackUrl] = useState("https://my-affiliate-network-server.com/callback?click_id={click_id}&offer_id={offer_id}&payout={payout}&source={sub1}");
  const [selectedOfferId, setSelectedOfferId] = useState("global");
  const [targetEvent, setTargetEvent] = useState("lead");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Testing Sandbox Console states
  const [testUrl, setTestUrl] = useState("https://callback-listener.io/api/v1/apextrack?click_id=APEX_9851_CLICK_TEST&offer_id=1092&payout=3.80&source=ppc_ads");
  const [testOutputLog, setTestOutputLog] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  // Update simulator testing URL based on selection helper
  const handleAutofillSimulatorUrl = (offerId: string) => {
    const offerObj = approvedOffers.find(o => o.id === offerId) || approvedOffers[0];
    const payoutStr = offerObj ? offerObj.payoutValue.toFixed(2) : "5.00";
    const idVal = offerObj ? offerObj.id : "1092";
    setTestUrl(`https://callback-listener.io/api/v1/apextrack?click_id=APEX_CLICK_${Math.floor(Math.random() * 89999 + 10000)}&offer_id=${idVal}&payout=${payoutStr}&source=facebook_campaign_9`);
  };

  const handleSavePostbackSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Run the premium terminal test simulation logs
  const handleFireTestTrigger = () => {
    if (!testUrl) return;
    setIsTesting(true);
    setTestOutputLog(prev => [
      `[${new Date().toTimeString().split(" ")[0]}] Initiate Server-to-Server attribution loop...`,
      `[SYSTEM] Connecting to remote host endpoint: "${testUrl.substring(0, 40)}..."`,
      ...prev
    ]);

    setTimeout(() => {
      setIsTesting(false);
      setTestOutputLog(prev => [
        `[${new Date().toTimeString().split(" ")[0]}] SUCCESS: S2S loop established. Server returned HTTP/200 OK.`,
        `[PAYLOAD SENT] click_id: verified, payout: reconciled, signature: valid_md5`,
        `[RESPONSE BODY] {"status":"processed","ledger_id":"tx_recon_${Math.floor(Math.random() * 8999 + 1000)}"}`,
        ...prev
      ]);
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="postback-setup-view">
      
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            <Radio className="w-5 h-5 text-cyan-400" />
            Global S2S Postback Integrations
          </h2>
          <p className="text-xs text-slate-400">
            Configure automated Server-to-Server webhooks executed instantaneously upon validated campaign leads.
          </p>
        </div>
        <div className="bg-slate-950 px-2.5 py-1 rounded text-[10px] text-slate-400 font-mono border border-slate-900 select-all shrink-0">
          Core Engine: <span className="text-cyan-400 font-bold">API Webhooks Gateway</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CONFIGURATION SCHEMAS CARD: LEFT (7/12) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-white text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Postback Mapping Setup
          </h3>

          <form onSubmit={handleSavePostbackSettings} className="space-y-4 text-xs">
            
            {saveSuccess && (
              <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 p-3 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Postback configurations indexed and deployed across tracking servers successfully.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 font-mono">
                  Target Scope Definition
                </label>
                <select
                  value={selectedOfferId}
                  onChange={(e) => {
                    setSelectedOfferId(e.target.value);
                    if (e.target.value !== "global") {
                      handleAutofillSimulatorUrl(e.target.value);
                    }
                  }}
                  className="mt-1 block w-full px-3 py-2 bg-slate-1000 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-cyan-500 font-semibold"
                >
                  <option value="global">Global - Applies to ALL offers</option>
                  <option disabled>--- Single Campaign Overrides ---</option>
                  {approvedOffers.map(o => (
                    <option key={o.id} value={o.id}>[{o.id}] {o.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-semibold text-slate-500 font-mono">
                  Trigger Event Type
                </label>
                <select
                  value={targetEvent}
                  onChange={(e) => setTargetEvent(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-slate-1000 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="lead">Lead Approval (Default)</option>
                  <option value="click">Click Hit (Unfiltered redirection)</option>
                  <option value="chargeback">Refund / Chargeback reversal</option>
                  <option value="fraud">Fraud trigger warning auto-block</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-500 font-mono">
                Postback Webhook URL (HTTP Link)
              </label>
              <textarea
                required
                value={globalPostbackUrl}
                onChange={(e) => {
                  setGlobalPostbackUrl(e.target.value);
                  setTestUrl(e.target.value);
                }}
                rows={4}
                className="mt-1 block w-full p-3 bg-slate-1000 border border-slate-800 rounded-xl text-slate-200 font-mono text-[11px] focus:outline-none focus:border-cyan-500 leading-normal"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl uppercase tracking-wider font-mono text-xs cursor-pointer transition select-none"
            >
              Verify & Save Active Postback Webhook
            </button>

          </form>

          {/* Tokens matrix guidelines */}
          <div className="bg-slate-950 rounded-xl border border-slate-850 p-4 space-y-3">
            <span className="text-xs uppercase font-bold text-slate-400 font-mono block">
              S2S Parameter Placeholder Tokens Matrix
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SYSTEM_POSTBACK_PLACEHOLDERS.map((cur) => (
                <div key={cur.token} className="text-xs space-y-0.5">
                  <code className="text-cyan-400 font-bold text-[11px] font-mono bg-slate-900 px-1 border border-slate-800 rounded text-left">
                    {cur.token}
                  </code>
                  <p className="text-slate-400 text-[10px] leading-normal">{cur.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* TEST SIMULATOR UTILS: RIGHT (5/12) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-white text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Code className="w-4 h-4 text-cyan-400" />
              S2S Sandbox Debugger Terminal
            </h3>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Input a simulated callback URL below. Hit &apos;Fire Sandbox Webhook&apos; to verify S2S routing connectivity.
            </p>

            <div className="space-y-2 text-xs">
              <label className="block text-[10px] uppercase font-semibold text-slate-500 font-mono">
                Sandbox Test URL Address (Fully Compiled):
              </label>
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono text-[10px]"
              />
            </div>

            {/* Simulated Debug Console logs */}
            <div className="space-y-2">
              <span className="block text-[10px] uppercase font-semibold text-slate-500 font-mono">
                Debugger Terminal Outputs:
              </span>
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl max-h-48 overflow-y-auto font-mono text-[10px] leading-relaxed select-text text-cyan-300/80 space-y-1.5">
                {testOutputLog.length === 0 ? (
                  <span className="text-slate-600 block text-center py-6 italic select-none">
                    [Console idle. Dispatched webhooks appear in this matrix.]
                  </span>
                ) : (
                  testOutputLog.map((logStr, lIdx) => (
                    <div
                      key={lIdx}
                      className={
                        logStr.includes("SUCCESS")
                          ? "text-emerald-400 font-bold"
                          : logStr.includes("PAYLOAD")
                          ? "text-white"
                          : "text-slate-400"
                      }
                    >
                      {logStr}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          <button
            onClick={handleFireTestTrigger}
            disabled={isTesting}
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-750 hover:bg-slate-1000 text-slate-200 py-3.5 rounded-xl font-bold font-mono tracking-wider text-xs uppercase flex items-center justify-center gap-2 transition cursor-pointer select-none"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                Firing Sandbox Webhook...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-200" />
                Fire Sandbox Webhook
              </>
            )}
          </button>

        </div>

      </div>

    </div>
  );
}
