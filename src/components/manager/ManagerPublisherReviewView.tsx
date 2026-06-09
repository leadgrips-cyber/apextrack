import { useMemo, useState } from "react";
import { Search, Eye, MessageSquare, CheckCircle, AlertCircle, HelpCircle, Users } from "lucide-react";
import { managerPublishers, ManagerPublisher } from "./managerDemoData";

type ReviewStatus = "Pending Reviews" | "Recommended Approvals" | "Recommended Rejections" | "Need More Information";
type Recommendation = "Approve" | "Reject" | "Need More Information" | null;

interface PublisherWithReview extends ManagerPublisher {
  review?: {
    status: ReviewStatus;
    managerNotes: string;
    recommendation: Recommendation;
    lastUpdated: string;
  };
}

interface PublisherDetail extends PublisherWithReview {
  email?: string;
  phone?: string;
  telegram?: string;
  skype?: string;
  whatsapp?: string;
  trafficSources?: string[];
  experience?: string;
  monthlyVolume?: string;
  websiteUrls?: string[];
  socialUrls?: string[];
  registrationIp?: string;
  deviceInfo?: string;
  duplicateIndicators?: boolean;
}

const statusClasses: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Suspended: "bg-rose-100 text-rose-700",
};

const reviewStatusColors: Record<ReviewStatus, string> = {
  "Pending Reviews": "bg-slate-100 text-slate-700 border-l-4 border-slate-400",
  "Recommended Approvals": "bg-emerald-100 text-emerald-700 border-l-4 border-emerald-500",
  "Recommended Rejections": "bg-rose-100 text-rose-700 border-l-4 border-rose-500",
  "Need More Information": "bg-amber-100 text-amber-700 border-l-4 border-amber-500",
};

const enrichedPublishers: PublisherDetail[] = [
  {
    id: "m-p-1",
    name: "Comet Media Group",
    company: "Comet Media",
    tier: "Tier 2",
    status: "Active",
    offers: 12,
    revenue: "$86,400",
    assignedOn: "2026-01-12",
    email: "contact@cometmedia.com",
    phone: "+1-555-0101",
    telegram: "@cometweb",
    skype: "cometweb",
    whatsapp: "+1-555-0101",
    trafficSources: ["Display Networks", "Native Ads", "Direct Mail"],
    experience: "5+ years affiliate marketing",
    monthlyVolume: "500K - 1M impressions",
    websiteUrls: ["https://cometmedia.com"],
    socialUrls: ["https://linkedin.com/company/cometmedia"],
    registrationIp: "203.0.113.42",
    deviceInfo: "Desktop (Chrome on Windows 11)",
    duplicateIndicators: false,
    review: {
      status: "Pending Reviews",
      managerNotes: "Requires verification of traffic sources. Pending compliance document submission.",
      recommendation: null,
      lastUpdated: "2026-06-08",
    },
  },
  {
    id: "m-p-2",
    name: "Nova Growth Labs",
    company: "Nova Labs",
    tier: "Tier 1",
    status: "Pending",
    offers: 4,
    revenue: "$14,900",
    assignedOn: "2026-03-18",
    email: "support@novalabs.com",
    phone: "+1-555-0102",
    telegram: "@novalabs",
    skype: "novalabssupport",
    whatsapp: "+1-555-0102",
    trafficSources: ["Organic Search", "Social Media"],
    experience: "3+ years in digital marketing",
    monthlyVolume: "100K - 500K impressions",
    websiteUrls: ["https://novalabs.com"],
    socialUrls: ["https://twitter.com/novalabs"],
    registrationIp: "198.51.100.55",
    deviceInfo: "Mobile (Safari on iOS 17)",
    duplicateIndicators: false,
    review: {
      status: "Recommended Approvals",
      managerNotes: "Strong compliance history. All documents verified. Ready for onboarding.",
      recommendation: "Approve",
      lastUpdated: "2026-06-07",
    },
  },
  {
    id: "m-p-3",
    name: "Pulse Reach",
    company: "Pulse Reach Ltd.",
    tier: "Tier 3",
    status: "Active",
    offers: 22,
    revenue: "$143,200",
    assignedOn: "2025-12-02",
    email: "team@pulsereach.com",
    phone: "+1-555-0103",
    telegram: "@pulsereach",
    skype: "pulsereach",
    whatsapp: "+1-555-0103",
    trafficSources: ["Email Marketing", "Affiliate Networks"],
    experience: "8+ years affiliate network experience",
    monthlyVolume: "2M+ impressions",
    websiteUrls: ["https://pulsereach.com"],
    socialUrls: ["https://linkedin.com/company/pulsereach"],
    registrationIp: "192.0.2.100",
    deviceInfo: "Desktop (Firefox on Windows 10)",
    duplicateIndicators: false,
    review: {
      status: "Need More Information",
      managerNotes: "Need additional verification on high-volume claims. Requested audit reports.",
      recommendation: "Need More Information",
      lastUpdated: "2026-06-06",
    },
  },
  {
    id: "m-p-4",
    name: "Aurora Traffic Co.",
    company: "Aurora Traffic",
    tier: "Tier 1",
    status: "Suspended",
    offers: 1,
    revenue: "$3,100",
    assignedOn: "2025-09-27",
    email: "info@auroratraffic.com",
    phone: "+1-555-0104",
    telegram: "@auroratraffic",
    skype: "auroratraffic",
    whatsapp: "+1-555-0104",
    trafficSources: ["Unknown Source"],
    experience: "Unknown",
    monthlyVolume: "Unknown",
    websiteUrls: ["https://auroratraffic.com"],
    socialUrls: [],
    registrationIp: "192.0.2.200",
    deviceInfo: "VPN Detected",
    duplicateIndicators: true,
    review: {
      status: "Recommended Rejections",
      managerNotes: "Multiple compliance violations. Duplicate account indicators detected. VPN usage at registration.",
      recommendation: "Reject",
      lastUpdated: "2026-06-05",
    },
  },
];

export function ManagerPublisherReviewView() {
  const [query, setQuery] = useState("");
  const [selectedPublisher, setSelectedPublisher] = useState<PublisherDetail | null>(null);
  const [activeTab, setActiveTab] = useState<ReviewStatus>("Pending Reviews");
  const [managerNotes, setManagerNotes] = useState<Record<string, string>>({});
  const [recommendations, setRecommendations] = useState<Record<string, Recommendation>>({});

  const tabs: ReviewStatus[] = ["Pending Reviews", "Recommended Approvals", "Recommended Rejections", "Need More Information"];

  const visible = useMemo(
    () => enrichedPublishers.filter((p) => `${p.name} ${p.company}`.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const filteredByTab = useMemo(
    () => visible.filter((p) => p.review?.status === activeTab),
    [visible, activeTab]
  );

  const handleSaveReview = (publisherId: string) => {
    setRecommendations((prev) => ({
      ...prev,
      [publisherId]: recommendations[publisherId] || null,
    }));
    alert("Review saved. Awaiting admin decision on your recommendation.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Publisher Review</div>
          <div className="mt-2 text-2xl font-black theme-text-main">Affiliate Review Queue</div>
          <p className="mt-1 text-sm theme-text-muted">Review assigned publishers and recommend approvals or rejections. Final decisions made by Admin.</p>
        </div>
        <div className="relative w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search publishers"
            className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-950 px-10 py-3 text-sm theme-text-main"
          />
        </div>
      </div>

      {/* Review Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-2xl font-semibold text-sm whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "bg-cyan-600 text-white"
                : "border theme-border theme-text-secondary hover:theme-bg-card"
            }`}
          >
            {tab}
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-white/30 rounded-full text-xs">
              {visible.filter((p) => p.review?.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {/* Publishers Table */}
      <div className="overflow-x-auto rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">Publisher</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">Status</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">Manager Recommendation</th>
              <th className="px-6 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">Last Updated</th>
              <th className="px-6 py-4 text-right text-[10px] uppercase tracking-widest text-slate-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {filteredByTab.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm theme-text-muted">
                  No publishers in this category
                </td>
              </tr>
            ) : (
              filteredByTab.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="font-semibold theme-text-main">{p.name}</div>
                    <div className="text-sm theme-text-muted">{p.company}</div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    {p.review?.recommendation ? (
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          p.review.recommendation === "Approve"
                            ? "bg-emerald-100 text-emerald-700"
                            : p.review.recommendation === "Reject"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {p.review.recommendation === "Approve" && <CheckCircle className="w-3 h-3" />}
                        {p.review.recommendation === "Reject" && <AlertCircle className="w-3 h-3" />}
                        {p.review.recommendation === "Need More Information" && <HelpCircle className="w-3 h-3" />}
                        {p.review.recommendation}
                      </span>
                    ) : (
                      <span className="text-xs theme-text-muted">Pending decision</span>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-xs font-mono theme-text-muted">{p.review?.lastUpdated}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    <button
                      onClick={() => setSelectedPublisher(p)}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-600 hover:text-cyan-700"
                    >
                      <Eye className="w-4 h-4" /> Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Publisher Review Modal */}
      {selectedPublisher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b theme-border sticky top-0 bg-white dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black theme-text-main">{selectedPublisher.name}</h2>
                  <p className="text-sm theme-text-muted mt-1">{selectedPublisher.company}</p>
                </div>
                <button
                  onClick={() => setSelectedPublisher(null)}
                  className="text-lg theme-text-muted hover:theme-text-main"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-bold theme-text-main mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="theme-bg-well border theme-border rounded-xl p-4">
                    <p className="text-xs theme-text-secondary mb-1">Full Name</p>
                    <p className="font-semibold theme-text-main">{selectedPublisher.name}</p>
                  </div>
                  <div className="theme-bg-well border theme-border rounded-xl p-4">
                    <p className="text-xs theme-text-secondary mb-1">Company</p>
                    <p className="font-semibold theme-text-main">{selectedPublisher.company}</p>
                  </div>
                  <div className="theme-bg-well border theme-border rounded-xl p-4">
                    <p className="text-xs theme-text-secondary mb-1">Email</p>
                    <p className="font-mono text-sm theme-text-main">{selectedPublisher.email || "N/A"}</p>
                  </div>
                  <div className="theme-bg-well border theme-border rounded-xl p-4">
                    <p className="text-xs theme-text-secondary mb-1">Phone</p>
                    <p className="font-semibold theme-text-main">{selectedPublisher.phone || "N/A"}</p>
                  </div>
                  <div className="theme-bg-well border theme-border rounded-xl p-4">
                    <p className="text-xs theme-text-secondary mb-1">Telegram</p>
                    <p className="font-semibold theme-text-main">{selectedPublisher.telegram || "N/A"}</p>
                  </div>
                  <div className="theme-bg-well border theme-border rounded-xl p-4">
                    <p className="text-xs theme-text-secondary mb-1">Skype</p>
                    <p className="font-semibold theme-text-main">{selectedPublisher.skype || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Traffic Information */}
              <div>
                <h3 className="text-sm font-bold theme-text-main mb-4">Traffic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="theme-bg-well border theme-border rounded-xl p-4">
                    <p className="text-xs theme-text-secondary mb-1">Experience</p>
                    <p className="text-sm theme-text-main">{selectedPublisher.experience || "N/A"}</p>
                  </div>
                  <div className="theme-bg-well border theme-border rounded-xl p-4">
                    <p className="text-xs theme-text-secondary mb-1">Monthly Volume</p>
                    <p className="text-sm theme-text-main">{selectedPublisher.monthlyVolume || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Compliance Information */}
              <div>
                <h3 className="text-sm font-bold theme-text-main mb-4">Compliance Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="theme-bg-well border theme-border rounded-xl p-4">
                    <p className="text-xs theme-text-secondary mb-1">Registration IP</p>
                    <p className="font-mono text-sm theme-text-main">{selectedPublisher.registrationIp}</p>
                  </div>
                  <div className="theme-bg-well border theme-border rounded-xl p-4">
                    <p className="text-xs theme-text-secondary mb-1">Device Information</p>
                    <p className="text-sm theme-text-main">{selectedPublisher.deviceInfo}</p>
                  </div>
                  <div className="theme-bg-well border theme-border rounded-xl p-4">
                    <p className="text-xs theme-text-secondary mb-1">Duplicate Account Indicators</p>
                    <p className={`font-semibold ${selectedPublisher.duplicateIndicators ? "text-rose-600" : "text-emerald-600"}`}>
                      {selectedPublisher.duplicateIndicators ? "⚠ Detected" : "✓ None"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Manager Notes and Recommendation */}
              <div className="border-t theme-border pt-6">
                <h3 className="text-sm font-bold theme-text-main mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Manager Review
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-2">Your Notes</label>
                    <textarea
                      value={managerNotes[selectedPublisher.id] || selectedPublisher.review?.managerNotes || ""}
                      onChange={(e) => setManagerNotes((prev) => ({ ...prev, [selectedPublisher.id]: e.target.value }))}
                      placeholder="Add your review notes here..."
                      className="w-full px-3 py-2 theme-bg-well border theme-border rounded-xl text-sm theme-text-main placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold theme-text-secondary mb-2">Your Recommendation</label>
                    <select
                      value={recommendations[selectedPublisher.id] || selectedPublisher.review?.recommendation || ""}
                      onChange={(e) =>
                        setRecommendations((prev) => ({
                          ...prev,
                          [selectedPublisher.id]: (e.target.value as Recommendation) || null,
                        }))
                      }
                      className="w-full px-3 py-2 theme-bg-well border theme-border rounded-xl text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="">Select recommendation...</option>
                      <option value="Approve">Approve</option>
                      <option value="Reject">Reject</option>
                      <option value="Need More Information">Need More Information</option>
                    </select>
                  </div>

                  <p className="text-xs theme-text-muted bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2">
                    💡 Manager Note: You can add notes and recommendations, but the final approval/rejection decision is made by the Admin.
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t theme-border flex gap-3">
                <button
                  onClick={() => handleSaveReview(selectedPublisher.id)}
                  className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-xl text-sm font-semibold hover:bg-cyan-700"
                >
                  Save Review
                </button>
                <button
                  onClick={() => setSelectedPublisher(null)}
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-xl text-sm font-semibold hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
