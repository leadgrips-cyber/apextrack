export type ManagerMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  description: string;
};

export type ManagerPublisher = {
  id: string;
  name: string;
  company: string;
  tier: string;
  status: "Active" | "Pending" | "Suspended";
  offers: number;
  revenue: string;
  assignedOn: string;
};

export type OfferApprovalRequest = {
  id: string;
  publisher: string;
  offerName: string;
  reason: string;
  submitted: string;
};

export type ManagerActivity = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  badge: string;
};

export const managerMetrics: ManagerMetric[] = [
  { id: "assigned", label: "Assigned Publishers", value: "86", delta: "+3%", description: "Publishers managed this month" },
  { id: "pending", label: "Pending Applications", value: "12", delta: "-1%", description: "Awaiting review by manager" },
  { id: "active_offers", label: "Active Offers", value: "214", delta: "+1.6%", description: "Offers actively managed" },
  { id: "monthly", label: "Monthly Revenue", value: "$243k", delta: "+7.2%", description: "Revenue under your portfolio" },
];

export const managerPublishers: ManagerPublisher[] = [
  { id: "m-p-1", name: "Comet Media Group", company: "Comet Media", tier: "Tier 2", status: "Active", offers: 12, revenue: "$86,400", assignedOn: "2026-01-12" },
  { id: "m-p-2", name: "Nova Growth Labs", company: "Nova Labs", tier: "Tier 1", status: "Pending", offers: 4, revenue: "$14,900", assignedOn: "2026-03-18" },
  { id: "m-p-3", name: "Pulse Reach", company: "Pulse Reach Ltd.", tier: "Tier 3", status: "Active", offers: 22, revenue: "$143,200", assignedOn: "2025-12-02" },
  { id: "m-p-4", name: "Aurora Traffic Co.", company: "Aurora Traffic", tier: "Tier 1", status: "Suspended", offers: 1, revenue: "$3,100", assignedOn: "2025-09-27" },
];

export const managerOfferRequests: OfferApprovalRequest[] = [
  { id: "req-1", publisher: "Nova Growth Labs", offerName: "SaaS Enterprise CRM", reason: "Organic B2B inventory validated", submitted: "2026-06-07" },
  { id: "req-2", publisher: "Aurora Traffic Co.", offerName: "Luxury Essentials Trial", reason: "Request for EU upsell test", submitted: "2026-06-06" },
  { id: "req-3", publisher: "Pulse Reach", offerName: "Crypto Wealth Academy", reason: "Finance vertical history attached", submitted: "2026-06-05" },
];

export const managerActivity: ManagerActivity[] = [
  { id: "a-1", title: "Publisher review completed", detail: "Reviewed Comet Media onboarding docs.", timestamp: "3 hours ago", badge: "Review" },
  { id: "a-2", title: "Offer request escalated", detail: "SaaS CRM access requested by Nova Growth Labs.", timestamp: "6 hours ago", badge: "Offer" },
  { id: "a-3", title: "Message sent to publisher", detail: "Requested additional compliance docs.", timestamp: "1 day ago", badge: "Message" },
];
