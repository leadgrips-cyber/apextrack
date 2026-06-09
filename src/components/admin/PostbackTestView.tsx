import React, { useState } from "react";
import { Send, RefreshCw, Trash2 } from "lucide-react";

type PostbackEvent = "click" | "lead" | "sale" | "approved" | "rejected";
type TestResult = "Success" | "Failed" | "Pending";

interface TestHistory {
  id: string;
  date: string;
  affiliate: string;
  event: PostbackEvent;
  statusCode: string;
  responseTime: string;
  result: TestResult;
}

const SAMPLE_AFFILIATES = [
  "Avery Chan Media",
  "Global Traffic Network",
  "Premium Affiliates Inc",
  "Digital Marketing Co",
  "Performance Traders LLC",
];

const SAMPLE_OFFERS = [
  { id: "OF-001", name: "Premium Dating CPA" },
  { id: "OF-002", name: "Crypto Wallet Signup" },
  { id: "OF-003", name: "Mobile App Install" },
  { id: "OF-004", name: "Insurance Quote Lead" },
  { id: "OF-005", name: "E-commerce Product" },
];

const SAMPLE_TEST_HISTORY: TestHistory[] = [
  {
    id: "test-1",
    date: "2026-06-09 14:35:22",
    affiliate: "Avery Chan Media",
    event: "click",
    statusCode: "200",
    responseTime: "245ms",
    result: "Success",
  },
  {
    id: "test-2",
    date: "2026-06-09 14:28:15",
    affiliate: "Global Traffic Network",
    event: "sale",
    statusCode: "200",
    responseTime: "312ms",
    result: "Success",
  },
  {
    id: "test-3",
    date: "2026-06-09 14:15:43",
    affiliate: "Premium Affiliates Inc",
    event: "lead",
    statusCode: "500",
    responseTime: "1250ms",
    result: "Failed",
  },
  {
    id: "test-4",
    date: "2026-06-09 14:05:00",
    affiliate: "Digital Marketing Co",
    event: "approved",
    statusCode: "202",
    responseTime: "189ms",
    result: "Success",
  },
];

export function PostbackTestView() {
  const [selectedAffiliate, setSelectedAffiliate] = useState("Avery Chan Media");
  const [selectedOffer, setSelectedOffer] = useState("OF-001");
  const [selectedEvent, setSelectedEvent] = useState<PostbackEvent>("click");
  const [clickId, setClickId] = useState("click_123456789");
  const [transactionId, setTransactionId] = useState("txn_987654321");
  const [payout, setPayout] = useState("2.50");
  const [revenue, setRevenue] = useState("5.00");
  
  const [generatedUrl, setGeneratedUrl] = useState("https://your.server.com/postback?clickid={clickid}&offer=OF-001&event=click&payout=2.50&revenue=5.00");
  const [statusCode, setStatusCode] = useState("200");
  const [responseTime, setResponseTime] = useState("245ms");
  const [responseBody, setResponseBody] = useState('{"status": "OK", "message": "Postback received", "id": "pb_123456"}');

  const generateSampleUrl = () => {
    const url = `https://your.server.com/postback?clickid=${clickId}&offer=${selectedOffer}&event=${selectedEvent}&payout=${payout}&revenue=${revenue}&txn=${transactionId}`;
    setGeneratedUrl(url);
  };

  const sendTestPostback = () => {
    // Simulate postback sending (UI only)
    setStatusCode("200");
    setResponseTime(Math.floor(Math.random() * 500 + 150) + "ms");
    setResponseBody('{"status": "OK", "message": "Postback processed successfully", "txn_id": "' + transactionId + '"}');
  };

  const clearForm = () => {
    setClickId("click_123456789");
    setTransactionId("txn_987654321");
    setPayout("2.50");
    setRevenue("5.00");
    setGeneratedUrl("https://your.server.com/postback?clickid={clickid}&offer=OF-001&event=click&payout=2.50&revenue=5.00");
    setStatusCode("200");
    setResponseTime("245ms");
    setResponseBody('{"status": "OK", "message": "Postback received"}');
  };

  const getResultColor = (result: TestResult) => {
    switch (result) {
      case "Success":
        return "bg-emerald-100 text-emerald-800 border border-emerald-300";
      case "Failed":
        return "bg-rose-100 text-rose-800 border border-rose-300";
      case "Pending":
        return "bg-slate-100 text-slate-800 border border-slate-300";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusCodeColor = (code: string) => {
    if (code.startsWith("2")) return "text-emerald-600 font-semibold";
    if (code.startsWith("4")) return "text-amber-600 font-semibold";
    if (code.startsWith("5")) return "text-rose-600 font-semibold";
    return "text-slate-600";
  };

  return (
    <div>
      <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Affiliates</div>
      <h2 className="mt-2 text-2xl font-black theme-text-main">Postback Test Center</h2>
      <p className="mt-1 theme-text-muted text-sm">Validate affiliate and advertiser postbacks before production use.</p>

      {/* Test Form */}
      <div className="mt-6 theme-bg-card border theme-border rounded-3xl p-6">
        <h3 className="text-sm font-bold theme-text-main mb-4">Test Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Affiliate Dropdown */}
          <div>
            <label className="block text-xs font-semibold theme-text-secondary mb-2">Affiliate</label>
            <select
              value={selectedAffiliate}
              onChange={(e) => setSelectedAffiliate(e.target.value)}
              className="w-full px-3 py-2 theme-bg-well border theme-border rounded-xl text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {SAMPLE_AFFILIATES.map((aff) => (
                <option key={aff} value={aff}>
                  {aff}
                </option>
              ))}
            </select>
          </div>

          {/* Offer Dropdown */}
          <div>
            <label className="block text-xs font-semibold theme-text-secondary mb-2">Offer</label>
            <select
              value={selectedOffer}
              onChange={(e) => setSelectedOffer(e.target.value)}
              className="w-full px-3 py-2 theme-bg-well border theme-border rounded-xl text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {SAMPLE_OFFERS.map((offer) => (
                <option key={offer.id} value={offer.id}>
                  {offer.name} ({offer.id})
                </option>
              ))}
            </select>
          </div>

          {/* Event Dropdown */}
          <div>
            <label className="block text-xs font-semibold theme-text-secondary mb-2">Event Type</label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value as PostbackEvent)}
              className="w-full px-3 py-2 theme-bg-well border theme-border rounded-xl text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="click">Click</option>
              <option value="lead">Lead</option>
              <option value="sale">Sale</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Click ID Input */}
          <div>
            <label className="block text-xs font-semibold theme-text-secondary mb-2">Click ID</label>
            <input
              type="text"
              value={clickId}
              onChange={(e) => setClickId(e.target.value)}
              placeholder="e.g. click_123456789"
              className="w-full px-3 py-2 theme-bg-well border theme-border rounded-xl text-sm theme-text-main placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Transaction ID Input */}
          <div>
            <label className="block text-xs font-semibold theme-text-secondary mb-2">Transaction ID</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="e.g. txn_987654321"
              className="w-full px-3 py-2 theme-bg-well border theme-border rounded-xl text-sm theme-text-main placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Payout Input */}
          <div>
            <label className="block text-xs font-semibold theme-text-secondary mb-2">Payout</label>
            <input
              type="number"
              value={payout}
              onChange={(e) => setPayout(e.target.value)}
              placeholder="e.g. 2.50"
              step="0.01"
              className="w-full px-3 py-2 theme-bg-well border theme-border rounded-xl text-sm theme-text-main placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Revenue Input */}
          <div>
            <label className="block text-xs font-semibold theme-text-secondary mb-2">Revenue</label>
            <input
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              placeholder="e.g. 5.00"
              step="0.01"
              className="w-full px-3 py-2 theme-bg-well border theme-border rounded-xl text-sm theme-text-main placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={generateSampleUrl}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            Generate Sample URL
          </button>
          <button
            onClick={sendTestPostback}
            className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-sm font-semibold hover:bg-cyan-700 transition-colors flex items-center gap-2"
          >
            <Send size={16} /> Send Test Postback
          </button>
          <button
            onClick={clearForm}
            className="px-4 py-2 bg-slate-600 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} /> Clear
          </button>
        </div>
      </div>

      {/* Generated Postback Preview */}
      <div className="mt-6 theme-bg-card border theme-border rounded-3xl p-6">
        <h3 className="text-sm font-bold theme-text-main mb-3">Generated Postback URL</h3>
        <textarea
          value={generatedUrl}
          readOnly
          className="w-full px-3 py-3 theme-bg-well border theme-border rounded-xl text-xs font-mono theme-text-main focus:outline-none bg-opacity-50"
          rows={3}
        />
      </div>

      {/* Response Panel */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Code */}
        <div className="theme-bg-card border theme-border rounded-3xl p-6">
          <h3 className="text-xs font-semibold theme-text-secondary mb-2">Status Code</h3>
          <div className={`text-3xl font-black ${getStatusCodeColor(statusCode)}`}>{statusCode}</div>
          <p className="text-xs theme-text-muted mt-2">HTTP response code</p>
        </div>

        {/* Response Time */}
        <div className="theme-bg-card border theme-border rounded-3xl p-6">
          <h3 className="text-xs font-semibold theme-text-secondary mb-2">Response Time</h3>
          <div className="text-3xl font-black theme-text-main">{responseTime}</div>
          <p className="text-xs theme-text-muted mt-2">Server response latency</p>
        </div>

        {/* Result */}
        <div className="theme-bg-card border theme-border rounded-3xl p-6">
          <h3 className="text-xs font-semibold theme-text-secondary mb-2">Result</h3>
          <div className="mt-3">
            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${getResultColor(statusCode.startsWith("2") ? "Success" : "Failed")}`}>
              {statusCode.startsWith("2") ? "Success" : "Failed"}
            </span>
          </div>
          <p className="text-xs theme-text-muted mt-2">Test outcome</p>
        </div>
      </div>

      {/* Response Body */}
      <div className="mt-6 theme-bg-card border theme-border rounded-3xl p-6">
        <h3 className="text-sm font-bold theme-text-main mb-3">Response Body</h3>
        <textarea
          value={responseBody}
          readOnly
          className="w-full px-3 py-3 theme-bg-well border theme-border rounded-xl text-xs font-mono theme-text-main focus:outline-none bg-opacity-50"
          rows={4}
        />
      </div>

      {/* Test History Table */}
      <div className="mt-6 theme-bg-card border theme-border rounded-3xl p-6">
        <h3 className="text-sm font-bold theme-text-main mb-4">Test History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b theme-border">
                <th className="text-left px-4 py-3 text-xs font-bold theme-text-secondary">Date</th>
                <th className="text-left px-4 py-3 text-xs font-bold theme-text-secondary">Affiliate</th>
                <th className="text-left px-4 py-3 text-xs font-bold theme-text-secondary">Event</th>
                <th className="text-left px-4 py-3 text-xs font-bold theme-text-secondary">Status Code</th>
                <th className="text-left px-4 py-3 text-xs font-bold theme-text-secondary">Response Time</th>
                <th className="text-left px-4 py-3 text-xs font-bold theme-text-secondary">Result</th>
                <th className="text-left px-4 py-3 text-xs font-bold theme-text-secondary">Action</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_TEST_HISTORY.map((test) => (
                <tr key={test.id} className="border-b theme-border hover:bg-opacity-50 hover:theme-bg-well transition-colors">
                  <td className="px-4 py-3 text-xs font-mono theme-text-main">{test.date}</td>
                  <td className="px-4 py-3 text-xs theme-text-main">{test.affiliate}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold capitalize">
                      {test.event}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-xs font-mono ${getStatusCodeColor(test.statusCode)}`}>{test.statusCode}</td>
                  <td className="px-4 py-3 text-xs font-mono theme-text-main">{test.responseTime}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getResultColor(test.result)}`}>
                      {test.result}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-cyan-600 hover:text-cyan-700 font-semibold text-xs">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
