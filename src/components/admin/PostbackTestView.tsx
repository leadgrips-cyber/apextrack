import { useEffect, useState } from "react";
import { Send, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  listAdminPostbacks,
  testAdminPostback,
  AdminPostbackRow,
  PostbackTestResult,
} from "../../services/adminPostbacks";
import { listAdminOffers, OfferRecord } from "../../services/offers";

interface TestForm {
  postback_id: string;
  click_id: string;
  payout: string;
  revenue: string;
  status: string;
  sub1: string;
  sub2: string;
  sub3: string;
  sub4: string;
  sub5: string;
}

const EMPTY_FORM: TestForm = {
  postback_id: "",
  click_id:    "test-click-001",
  payout:      "5.00",
  revenue:     "10.00",
  status:      "approved",
  sub1: "", sub2: "", sub3: "", sub4: "", sub5: "",
};

function StatusBadge({ code }: { code: number }) {
  if (code === 0) return (
    <span className="inline-flex items-center gap-1 text-rose-400 font-mono text-sm">
      <XCircle className="w-4 h-4" /> Connection failed
    </span>
  );
  if (code >= 200 && code < 300) return (
    <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-sm">
      <CheckCircle className="w-4 h-4" /> {code} OK
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-amber-400 font-mono text-sm">
      <XCircle className="w-4 h-4" /> {code}
    </span>
  );
}

export function PostbackTestView() {
  const [postbacks, setPostbacks] = useState<AdminPostbackRow[]>([]);
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [filterOffer, setFilterOffer] = useState("");
  const [loadingPostbacks, setLoadingPostbacks] = useState(false);

  const [form, setForm] = useState<TestForm>(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<PostbackTestResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    listAdminOffers().then(setOffers).catch(() => {});
  }, []);

  useEffect(() => {
    setLoadingPostbacks(true);
    listAdminPostbacks({
      offerId: filterOffer ? Number(filterOffer) : undefined,
      page: 1,
      pageSize: 200,
    })
      .then((r) => setPostbacks(r.rows))
      .catch(() => {})
      .finally(() => setLoadingPostbacks(false));
  }, [filterOffer]);

  const selectedPostback = postbacks.find((p) => p.id === form.postback_id);

  async function handleSend() {
    if (!form.postback_id) { setTestError("Select a postback first"); return; }
    setSending(true);
    setResult(null);
    setTestError(null);
    try {
      const res = await testAdminPostback({
        postback_id:  form.postback_id,
        click_id:     form.click_id,
        offer_id:     selectedPostback?.offer_id ? String(selectedPostback.offer_id) : undefined,
        publisher_id: selectedPostback?.publisher_id,
        payout:       form.payout,
        revenue:      form.revenue,
        status:       form.status,
        sub1: form.sub1 || undefined,
        sub2: form.sub2 || undefined,
        sub3: form.sub3 || undefined,
        sub4: form.sub4 || undefined,
        sub5: form.sub5 || undefined,
      });
      setResult(res);
    } catch (e: any) {
      setTestError(e.message);
    } finally {
      setSending(false);
    }
  }

  function field(key: keyof TestForm, label: string, placeholder?: string) {
    return (
      <div>
        <label className="block text-xs font-semibold theme-text-muted uppercase tracking-wider mb-1">{label}</label>
        <input
          type="text"
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full rounded-xl border theme-border bg-white dark:bg-slate-800 theme-text-main text-sm px-3 py-2 font-mono"
        />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black theme-text-main tracking-tight">Postback Test</h1>
        <p className="text-sm theme-text-muted mt-1">Fire a real HTTP request to a publisher postback URL and inspect the response.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Configuration */}
        <div className="space-y-5">
          <div className="rounded-2xl border theme-border p-5 space-y-4">
            <h2 className="text-sm font-bold theme-text-main uppercase tracking-wider">Select Postback</h2>

            <div>
              <label className="block text-xs font-semibold theme-text-muted uppercase tracking-wider mb-1">Filter by Offer</label>
              <select
                value={filterOffer}
                onChange={(e) => setFilterOffer(e.target.value)}
                className="w-full rounded-xl border theme-border bg-white dark:bg-slate-900 theme-text-main text-sm px-3 py-2"
              >
                <option value="">All Offers</option>
                {offers.map((o) => (
                  <option key={o.id} value={String(o.id)}>{o.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold theme-text-muted uppercase tracking-wider mb-1">Postback *</label>
              <select
                value={form.postback_id}
                onChange={(e) => setForm((f) => ({ ...f, postback_id: e.target.value }))}
                className="w-full rounded-xl border theme-border bg-white dark:bg-slate-900 theme-text-main text-sm px-3 py-2"
              >
                <option value="">
                  {loadingPostbacks ? "Loading…" : "Select postback…"}
                </option>
                {postbacks.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.publisher_email} {p.offer_name ? `— ${p.offer_name}` : "— Global"}
                  </option>
                ))}
              </select>

              {selectedPostback && (
                <p className="text-xs font-mono theme-text-muted mt-1 break-all">{selectedPostback.callback_url}</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border theme-border p-5 space-y-4">
            <h2 className="text-sm font-bold theme-text-main uppercase tracking-wider">Test Parameters</h2>

            {field("click_id", "Click ID", "test-click-001")}

            <div className="grid grid-cols-2 gap-3">
              {field("payout", "Payout", "5.00")}
              {field("revenue", "Revenue", "10.00")}
            </div>

            <div>
              <label className="block text-xs font-semibold theme-text-muted uppercase tracking-wider mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full rounded-xl border theme-border bg-white dark:bg-slate-900 theme-text-main text-sm px-3 py-2"
              >
                <option value="approved">approved</option>
                <option value="pending">pending</option>
                <option value="rejected">rejected</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {field("sub1", "sub1")}
              {field("sub2", "sub2")}
              {field("sub3", "sub3")}
              {field("sub4", "sub4")}
              {field("sub5", "sub5")}
            </div>
          </div>

          {testError && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 px-4 py-3 text-sm">{testError}</div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || !form.postback_id}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-cyan-600 text-white font-semibold hover:bg-cyan-500 disabled:opacity-50 transition"
          >
            {sending ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Fire Test Request
              </>
            )}
          </button>
        </div>

        {/* Right — Result */}
        <div className="space-y-4">
          <div className="rounded-2xl border theme-border p-5 space-y-4 min-h-[300px]">
            <h2 className="text-sm font-bold theme-text-main uppercase tracking-wider">Response</h2>

            {!result && !sending && (
              <div className="flex items-center justify-center h-48 text-sm theme-text-muted">
                Fire a test request to see the response.
              </div>
            )}

            {sending && (
              <div className="flex items-center justify-center h-48 text-sm theme-text-muted gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                Waiting for response…
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <StatusBadge code={result.status_code} />
                  <span className="text-xs theme-text-muted font-mono">{result.response_time_ms}ms</span>
                </div>

                <div>
                  <p className="text-xs font-semibold theme-text-muted uppercase tracking-wider mb-1">Resolved URL</p>
                  <p className="font-mono text-xs theme-text-secondary break-all bg-slate-50 dark:bg-slate-900 rounded-xl px-3 py-2">{result.resolved_url}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold theme-text-muted uppercase tracking-wider mb-1">Response Body</p>
                  <pre className="font-mono text-xs theme-text-secondary bg-slate-50 dark:bg-slate-900 rounded-xl px-3 py-2 overflow-x-auto whitespace-pre-wrap break-all max-h-60">
                    {result.response_body || <span className="italic theme-text-muted">(empty body)</span>}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
