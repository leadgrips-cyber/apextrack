import React, { useState, useMemo, useEffect } from "react";
import { Radio, RefreshCw, Play, Code, CheckCircle, Info } from "lucide-react";
import { DEMO_OFFERS } from "../data/publisherDemo";

export function PostbackSetupView() {
  const [globalPostbackUrl, setGlobalPostbackUrl] = useState(
    "https://tracker.com/postback?click_id={click_id}&payout={payout}"
  );

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Test tool state (real fetch-based test)
  const [isTesting, setIsTesting] = useState(false);
  type TestResult = { url: string; status?: number; ok?: boolean; body?: string; error?: string };
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testClickId, setTestClickId] = useState("APEX_TEST_CLICK_1234");
  const [testPayout, setTestPayout] = useState("5.00");
  const [testOutputLog, setTestOutputLog] = useState<string[]>([]);

  const TOKEN_LIST = ["{click_id}", "{offer_id}", "{payout}", "{sub1}", "{sub2}", "{sub3}", "{sub4}", "{sub5}"];

  // Offer override compact selector
  const approvedOffers = useMemo(() => DEMO_OFFERS.filter((o) => o.status === "active"), []);
  const [selectedOfferId, setSelectedOfferId] = useState<string>("");
  const [offerOverrideUrl, setOfferOverrideUrl] = useState("");
  const [offerOverrides, setOfferOverrides] = useState<Record<string, string>>({});

  const selectedOffer = useMemo(() => approvedOffers.find((o) => o.id === selectedOfferId) || null, [approvedOffers, selectedOfferId]);

  // keep the offerOverrideUrl field synchronized with the selected offer
  useEffect(() => {
    setOfferOverrideUrl(
      selectedOfferId ? offerOverrides[selectedOfferId] || "" : ""
    );
  }, [selectedOfferId, offerOverrides]);

  const handleOfferChange = (offerId: string) => {
    // only set the selected offer id here; the useEffect will update the URL
    setSelectedOfferId(offerId);
  };

  const handleSaveOfferOverride = () => {
    if (!selectedOfferId) return;
    setOfferOverrides((prev) => ({ ...prev, [selectedOfferId]: offerOverrideUrl.trim() }));
  };

  const handleRemoveOfferOverride = () => {
    if (!selectedOfferId) return;
    setOfferOverrides((prev) => {
      const copy = { ...prev };
      delete copy[selectedOfferId];
      return copy;
    });
    setOfferOverrideUrl("");
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const buildFinalUrl = (offerId?: string) => {
    const template = offerId && offerOverrides[offerId] ? offerOverrides[offerId] : globalPostbackUrl;
    const clickId = `APEX_TEST_${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const payout = (selectedOffer?.payoutValue ?? 1).toFixed(2);
    let url = template;
    url = url.replace(/\{click_id\}/g, encodeURIComponent(clickId));
    url = url.replace(/\{payout\}/g, encodeURIComponent(payout));
    url = url.replace(/\{offer_id\}/g, encodeURIComponent(offerId || "TEST_OFFER"));
    url = url.replace(/\{sub1\}/g, "").replace(/\{sub2\}/g, "").replace(/\{sub3\}/g, "").replace(/\{sub4\}/g, "").replace(/\{sub5\}/g, "");
    return url;
  };

  const handleFireTestPostback = async () => {
    const offerId = selectedOfferId || "";
    const url = buildFinalUrl(offerId || undefined);
    setIsTesting(true);
    setTestResult(null);
    setTestOutputLog((prev) => [`[${new Date().toTimeString().split(" ")[0]}] Sending test postback to ${url}`, ...prev]);
    try {
      const resp = await fetch(url, { method: "GET" });
      const body = await resp.text();
      setTestResult({ url, status: resp.status, ok: resp.ok, body });
      setTestOutputLog((prev) => [`[${new Date().toTimeString().split(" ")[0]}] Response: ${resp.status} - ${resp.statusText}`, ...prev]);
+      setTestOutputLog((prev) => [`[${new Date().toTimeString().split(" ")[0]}] Body: ${body}`, ...prev]);
    } catch (err: any) {
      setTestResult({ url, error: String(err) });
      setTestOutputLog((prev) => [`[${new Date().toTimeString().split(" ")[0]}] ERROR: ${String(err)}`, ...prev]);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="postback-setup-view">
      <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-950 tracking-tight flex items-center gap-1.5">
            <Radio className="w-5 h-5 text-cyan-500" />
            Publisher Postback Settings
          </h2>
          <p className="text-sm text-slate-600">Event names are controlled by the network administrator. Publishers only provide a single global callback URL.</p>
        </div>
        <div className="bg-slate-50 px-2.5 py-1 rounded text-[10px] text-slate-600 font-mono border border-slate-200 select-all shrink-0">Enterprise</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
          <h3 className="text-slate-950 text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1">
            <Code className="w-4 h-4 text-cyan-500" />
            Global Postback Configuration
          </h3>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-2xl flex items-center gap-2 shadow-sm">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm font-medium">✓ Global postback saved successfully.</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-semibold text-slate-600 font-mono">Global Postback URL</label>
              <textarea
                value={globalPostbackUrl}
                onChange={(e) => setGlobalPostbackUrl(e.target.value)}
                rows={3}
                className="mt-1 block w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <p className="text-sm text-slate-500">Conversion event types are managed by the network administrator. Publishers only provide a callback URL.</p>
            </div>
            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl uppercase tracking-wider text-xs transition select-none">Save Postback Settings</button>
          </form>

          <div className="mt-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
            <h4 className="text-[11px] font-semibold text-slate-900 mb-2">Offer Postback Override</h4>
            <p className="text-[11px] text-slate-500 mb-3">Select a single offer to provide an optional override. Leave blank to use the Global Postback URL.</p>

            <label className="block text-[10px] uppercase font-semibold text-slate-600 font-mono mt-3">Select Offer</label>
            <select
              value={selectedOfferId}
              onChange={(e) => handleOfferChange(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
            >
              <option value="">-- choose an offer --</option>
              {approvedOffers.map((o) => (
                <option key={o.id} value={o.id}>{`${o.id} - ${o.name}`}</option>
              ))}
            </select>

            {selectedOffer ? (
              <div className="mt-3 space-y-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                  <div className="font-bold text-slate-900">Selected Offer</div>
                  <div className="text-slate-600 text-[13px] mt-1">ID: {selectedOffer.id}</div>
                  <div className="text-slate-600 text-[13px] mt-1">{selectedOffer.name} · <span className="text-slate-500">Status: {selectedOffer.status}</span> · <span className="text-slate-500">Payout: ${selectedOffer.payoutValue.toFixed(2)}</span></div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-semibold text-slate-600 font-mono">Offer Postback URL</label>
                  <input value={offerOverrideUrl} onChange={(e) => setOfferOverrideUrl(e.target.value)} placeholder={globalPostbackUrl} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono" />
                </div>

                <div className="flex gap-2">
                  <button onClick={handleSaveOfferOverride} className="mt-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-3 rounded-xl text-xs">Save Override</button>
                  <button onClick={handleRemoveOfferOverride} className="mt-2 border border-slate-200 text-slate-600 bg-white font-medium py-2 px-3 rounded-xl text-xs">Remove Override</button>
                </div>

                <div className="mt-2">
                  {offerOverrides[selectedOffer.id] ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>Using Offer-Specific Postback URL</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
                      <Info className="w-4 h-4 text-slate-500" />
                      <span>Using Global Postback URL</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-3 text-[11px] text-slate-500">No offer selected.</div>
            )}
          </div>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3 text-xs">
            <span className="font-semibold uppercase text-[10px] text-slate-600 tracking-wider">Postback Token Reference</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {TOKEN_LIST.map((t) => (
                <div key={t} className="bg-slate-100 border border-slate-200 px-3 py-1 rounded font-mono text-cyan-700 text-[11px]">{t}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-4">
            <h3 className="text-slate-950 text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Code className="w-4 h-4 text-cyan-500" />
              Postback Test Tool
            </h3>

            <div className="space-y-3">
              <label className="block text-[10px] uppercase font-semibold text-slate-600 font-mono">Click ID</label>
              <input value={testClickId} onChange={(e) => setTestClickId(e.target.value)} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono" />

              <label className="block text-[10px] uppercase font-semibold text-slate-600 font-mono">Payout</label>
              <input value={testPayout} onChange={(e) => setTestPayout(e.target.value)} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-mono" />
            </div>

            <div>
              <button onClick={handleFireTestPostback} disabled={isTesting} className="w-full bg-cyan-600 border border-cyan-600 hover:bg-cyan-500 text-white py-3.5 rounded-xl font-bold font-mono tracking-wider text-xs uppercase flex items-center justify-center gap-2 transition disabled:opacity-70 cursor-pointer select-none">
                {isTesting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    Firing Test Postback...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-white" />
                    Fire Test Postback
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded max-h-48 overflow-y-auto font-mono text-[11px] text-slate-700 mt-2">
              {testOutputLog.length === 0 ? <div className="text-slate-500 italic">[No test activity yet]</div> : testOutputLog.map((l, i) => <div key={i} className="mb-1">{l}</div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
