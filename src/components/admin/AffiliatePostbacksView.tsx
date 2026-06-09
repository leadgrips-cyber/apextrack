import React, { useState } from "react";
import { Copy, Check, Plus, Edit2, Trash2 } from "lucide-react";

type PostbackEvent = "click" | "lead" | "sale" | "approved" | "rejected";
type PostbackMethod = "GET" | "POST";

interface PostbackConfig {
  id: string;
  affiliate: string;
  event: PostbackEvent;
  method: PostbackMethod;
  url: string;
  status: "Active" | "Inactive";
  lastFired: string;
}

const SAMPLE_POSTBACKS: PostbackConfig[] = [
  {
    id: "pb-1",
    affiliate: "Avery Chan Media",
    event: "click",
    method: "GET",
    url: "https://avery-media.com/postback?clickid={clickid}&offer={offer_id}",
    status: "Active",
    lastFired: "2026-06-09 14:35:22",
  },
  {
    id: "pb-2",
    affiliate: "Avery Chan Media",
    event: "sale",
    method: "POST",
    url: "https://avery-media.com/postback",
    status: "Active",
    lastFired: "2026-06-09 14:28:15",
  },
  {
    id: "pb-3",
    affiliate: "Global Traffic Network",
    event: "lead",
    method: "GET",
    url: "https://gtn-network.io/callbacks?txn={transaction_id}&status={status}",
    status: "Active",
    lastFired: "2026-06-09 14:15:43",
  },
  {
    id: "pb-4",
    affiliate: "Premium Affiliates Inc",
    event: "approved",
    method: "POST",
    url: "https://premium-aff.com/api/events",
    status: "Inactive",
    lastFired: "2026-06-08 22:10:00",
  },
];

const TOKENS = ["{clickid}", "{transaction_id}", "{status}", "{payout}", "{revenue}", "{affiliate_id}"];

const AFFILIATES = [
  "Avery Chan Media",
  "Global Traffic Network",
  "Premium Affiliates Inc",
  "Digital Marketing Co",
  "Performance Traders LLC",
];

export function AffiliatePostbacksView() {
  const [selectedAffiliate, setSelectedAffiliate] = useState("Avery Chan Media");
  const [postbackUrl, setPostbackUrl] = useState("https://your.server.com/postback");
  const [selectedEvent, setSelectedEvent] = useState<PostbackEvent>("click");
  const [selectedMethod, setSelectedMethod] = useState<PostbackMethod>("GET");
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  const getEventColor = (event: PostbackEvent) => {
    const colors: Record<PostbackEvent, string> = {
      click: "bg-blue-100 text-blue-700",
      lead: "bg-indigo-100 text-indigo-700",
      sale: "bg-emerald-100 text-emerald-700",
      approved: "bg-cyan-100 text-cyan-700",
      rejected: "bg-rose-100 text-rose-700",
    };
    return colors[event];
  };

  const getMethodColor = (method: PostbackMethod) => {
    return method === "GET" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-indigo-50 text-indigo-700 border-indigo-200";
  };

  const getStatusColor = (status: string) => {
    return status === "Active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-slate-50 text-slate-600 border-slate-200";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Affiliates</div>
          <h2 className="mt-2 text-2xl font-black theme-text-main">Affiliate Postback Management</h2>
          <p className="mt-2 text-sm theme-text-muted max-w-2xl">Configure postback URLs per affiliate and event type.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.6fr]">
        <div className="space-y-6">
          <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
            <div className="mb-6">
              <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Postback Configuration</div>
              <p className="mt-2 text-sm theme-text-muted">Set up or modify postback URLs for your selected affiliate.</p>
            </div>

            <div className="space-y-4">
              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Select Affiliate</span>
                <select
                  value={selectedAffiliate}
                  onChange={(e) => setSelectedAffiliate(e.target.value)}
                  className="w-full rounded-2xl border theme-border bg-white px-4 py-3 text-sm theme-text-main focus:outline-none"
                >
                  {AFFILIATES.map((aff) => (
                    <option key={aff} value={aff}>
                      {aff}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Event Type</span>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value as PostbackEvent)}
                    className="w-full rounded-2xl border theme-border bg-white px-4 py-3 text-sm theme-text-main focus:outline-none"
                  >
                    <option value="click">Click</option>
                    <option value="lead">Lead</option>
                    <option value="sale">Sale</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>

                <label className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">HTTP Method</span>
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value as PostbackMethod)}
                    className="w-full rounded-2xl border theme-border bg-white px-4 py-3 text-sm theme-text-main focus:outline-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Postback URL</span>
                <textarea
                  value={postbackUrl}
                  onChange={(e) => setPostbackUrl(e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border theme-border bg-white px-4 py-3 text-sm theme-text-main focus:outline-none font-mono text-xs"
                  placeholder="https://your.server.com/postback?clickid={clickid}&offer={offer_id}&status={status}"
                />
              </label>

              <button className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-cyan-600 text-white px-6 py-3 text-sm font-semibold hover:bg-cyan-500 transition">
                <Plus className="w-4 h-4" />
                Create Postback
              </button>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
            <div className="mb-6">
              <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Dynamic Tokens</div>
              <p className="mt-2 text-sm theme-text-muted">Insert variables into URLs.</p>
            </div>

            <div className="space-y-2">
              {TOKENS.map((token) => (
                <button
                  key={token}
                  onClick={() => copyToClipboard(token)}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition border theme-border text-left"
                >
                  <span className="text-xs font-mono font-bold theme-text-main">{token}</span>
                  {copiedToken === token ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4 theme-text-muted" />
                  )}
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Active Postbacks</div>
          <p className="mt-2 text-sm theme-text-muted">All configured postback URLs and their current status.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b theme-border">
                <th className="text-left py-3 px-4 text-xs font-bold theme-text-muted uppercase tracking-wide">Affiliate</th>
                <th className="text-left py-3 px-4 text-xs font-bold theme-text-muted uppercase tracking-wide">Event</th>
                <th className="text-left py-3 px-4 text-xs font-bold theme-text-muted uppercase tracking-wide">Method</th>
                <th className="text-left py-3 px-4 text-xs font-bold theme-text-muted uppercase tracking-wide">URL</th>
                <th className="text-left py-3 px-4 text-xs font-bold theme-text-muted uppercase tracking-wide">Status</th>
                <th className="text-left py-3 px-4 text-xs font-bold theme-text-muted uppercase tracking-wide">Last Fired</th>
                <th className="text-left py-3 px-4 text-xs font-bold theme-text-muted uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_POSTBACKS.map((pb) => (
                <tr key={pb.id} className="border-b theme-border hover:bg-slate-50/50 transition">
                  <td className="py-4 px-4 text-xs font-semibold theme-text-main">{pb.affiliate}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getEventColor(pb.event)}`}>
                      {pb.event}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getMethodColor(pb.method)}`}>
                      {pb.method}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs font-mono theme-text-muted max-w-xs truncate">{pb.url}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(pb.status)}`}>
                      {pb.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-xs font-mono theme-text-main">{pb.lastFired}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 transition" title="Edit">
                        <Edit2 className="w-4 h-4 text-cyan-600" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 transition" title="Delete">
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
