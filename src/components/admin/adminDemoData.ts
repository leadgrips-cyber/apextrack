import { ReactNode } from "react";

export type AdminMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  description: string;
};

export type AdminActivityItem = {
  id: string;
  title: string;
  description: string;
  detail: string;
  timestamp: string;
  badge: string;
};

export type AdminPublisherItem = {
  id: string;
  name: string;
  company: string;
  tier: string;
  status: "Active" | "Pending" | "Suspended";
  offers: number;
  revenue: string;
  joined: string;
};

export type AdminOfferItem = {
  id: string;
  name: string;
  category: string;
  payout: string;
  model: string;
  status: "Active" | "Paused" | "Review";
  geo: string;
  traffic: string;
};

export type AdminApplicationItem = {
  id: string;
  publisher: string;
  company: string;
  requestedOffer: string;
  submitted: string;
  details: string;
  score: string;
};

export const adminMetrics: AdminMetric[] = [
  {
    id: "publishers",
    label: "Total Publishers",
    value: "1,248",
    delta: "+6.4%",
    description: "Active publisher accounts in the network",
  },
  {
    id: "offers",
    label: "Active Offers",
    value: "372",
    delta: "+2.1%",
    description: "Live offers available for traffic",
  },
  {
    id: "applications",
    label: "Pending Applications",
    value: "28",
    delta: "-1.9%",
    description: "Applications awaiting review",
  },
  {
    id: "revenue",
    label: "Revenue Overview",
    value: "$1.92M",
    delta: "+14.3%",
    description: "Revenue processed this quarter",
  },
];

export const adminRecentActivity: AdminActivityItem[] = [
  {
    id: "activity-1",
    title: "New publisher onboarded",
    description: "Comet Media Group has been approved and assigned a dedicated AM.",
    detail: "Tier 2, 8 approved offers",
    timestamp: "2 hours ago",
    badge: "Publisher",
  },
  {
    id: "activity-2",
    title: "Offer paused for compliance review",
    description: "Luxury Health kit has been temporarily paused pending geo validation.",
    detail: "Offer ID: 1104",
    timestamp: "5 hours ago",
    badge: "Offer",
  },
  {
    id: "activity-3",
    title: "Approval request received",
    description: "A publisher application for a new ad vertical is waiting admin review.",
    detail: "SaaS CRM Segment",
    timestamp: "8 hours ago",
    badge: "Application",
  },
  {
    id: "activity-4",
    title: "Weekly payout cleared",
    description: "Payment run completed for May performance revenue.",
    detail: "$192k settled",
    timestamp: "1 day ago",
    badge: "Revenue",
  },
];

export const adminPublishers: AdminPublisherItem[] = [
  {
    id: "pub-001",
    name: "Comet Media Group",
    company: "Comet Media",
    tier: "Tier 2",
    status: "Active",
    offers: 12,
    revenue: "$86,400",
    joined: "2025-11-04",
  },
  {
    id: "pub-002",
    name: "Nova Growth Labs",
    company: "Nova Labs",
    tier: "Tier 1",
    status: "Pending",
    offers: 4,
    revenue: "$14,900",
    joined: "2026-03-18",
  },
  {
    id: "pub-003",
    name: "Pulse Reach",
    company: "Pulse Reach Ltd.",
    tier: "Tier 3",
    status: "Active",
    offers: 22,
    revenue: "$143,200",
    joined: "2024-12-12",
  },
  {
    id: "pub-004",
    name: "Aurora Traffic Co.",
    company: "Aurora Traffic",
    tier: "Tier 1",
    status: "Suspended",
    offers: 1,
    revenue: "$3,100",
    joined: "2025-09-27",
  },
  {
    id: "pub-005",
    name: "Helix Performance",
    company: "Helix Performance Media",
    tier: "Tier 2",
    status: "Active",
    offers: 15,
    revenue: "$117,800",
    joined: "2026-01-09",
  },
];

export const adminOffers: AdminOfferItem[] = [
  {
    id: "offer-101",
    name: "KetoDiet Shred",
    category: "Health & Wellness",
    payout: "$42 CPA",
    model: "CPA",
    status: "Active",
    geo: "US, CA, AU",
    traffic: "6.2M",
  },
  {
    id: "offer-102",
    name: "SaaS Enterprise CRM",
    category: "B2B Software",
    payout: "$18 CPL",
    model: "CPL",
    status: "Review",
    geo: "EU, UK",
    traffic: "1.8M",
  },
  {
    id: "offer-103",
    name: "Luxury Essentials Trial",
    category: "E-commerce",
    payout: "$9 CPS",
    model: "CPS",
    status: "Paused",
    geo: "US, EU",
    traffic: "4.4M",
  },
  {
    id: "offer-104",
    name: "Crypto Wealth Academy",
    category: "Finance",
    payout: "$62 CPA",
    model: "CPA",
    status: "Active",
    geo: "Global",
    traffic: "5.0M",
  },
  {
    id: "offer-105",
    name: "Mobile Gaming VIP",
    category: "Gaming",
    payout: "$27 CPS",
    model: "CPS",
    status: "Active",
    geo: "US, BR",
    traffic: "3.1M",
  },
];

export const adminApplications: AdminApplicationItem[] = [
  {
    id: "app-301",
    publisher: "Nova Growth Labs",
    company: "Nova Labs",
    requestedOffer: "SaaS Enterprise CRM",
    submitted: "2026-06-07",
    details: "Request includes projected business vertical traffic from organic channels, compliance documents attached.",
    score: "High match",
  },
  {
    id: "app-302",
    publisher: "Aurora Traffic Co.",
    company: "Aurora Traffic",
    requestedOffer: "Luxury Essentials Trial",
    submitted: "2026-06-06",
    details: "Request is pending geo validation due to higher EU volume and incentive traffic flags.",
    score: "Medium match",
  },
  {
    id: "app-303",
    publisher: "Pulse Reach",
    company: "Pulse Reach Ltd.",
    requestedOffer: "Crypto Wealth Academy",
    submitted: "2026-06-05",
    details: "Request includes banking vertical compliance and previously approved finance campaigns.",
    score: "High match",
  },
  {
    id: "app-304",
    publisher: "Helix Performance",
    company: "Helix Performance Media",
    requestedOffer: "Mobile Gaming VIP",
    submitted: "2026-06-04",
    details: "Request is for an existing campaign upsell; publisher has strong mobile traffic history.",
    score: "Strong match",
  },
];
