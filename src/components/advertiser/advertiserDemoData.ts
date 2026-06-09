export type AdvertiserMetric = {
  id: string;
  label: string;
  value: string;
  delta: string;
  description: string;
};

export type AdvertiserCampaignItem = {
  id: string;
  name: string;
  category: string;
  status: "Active" | "Paused" | "Pending";
  spend: string;
  conversions: string;
  cpa: string;
  geo: string;
};

export type AdvertiserConversionStat = {
  id: string;
  date: string;
  clicks: number;
  conversions: number;
  revenue: string;
};

export type AdvertiserTransaction = {
  id: string;
  date: string;
  type: string;
  amount: string;
  status: string;
};

export type AdvertiserReportFilter = {
  id: string;
  label: string;
  value: string;
};

export const advertiserMetrics: AdvertiserMetric[] = [
  {
    id: "campaigns",
    label: "Total Campaigns",
    value: "84",
    delta: "+4.8%",
    description: "Active and paused campaigns in the portfolio",
  },
  {
    id: "active",
    label: "Active Campaigns",
    value: "52",
    delta: "+1.2%",
    description: "Campaigns currently delivering traffic",
  },
  {
    id: "spend",
    label: "Total Spend",
    value: "$1.14M",
    delta: "+9.7%",
    description: "Ad spend across the selected period",
  },
  {
    id: "conversions",
    label: "Conversions",
    value: "18,620",
    delta: "+12.4%",
    description: "Total conversion events recorded",
  },
];

export const advertiserCampaigns: AdvertiserCampaignItem[] = [
  {
    id: "camp-101",
    name: "KetoDiet Shred",
    category: "Health & Wellness",
    status: "Active",
    spend: "$34,200",
    conversions: "3,850",
    cpa: "$8.90",
    geo: "US, CA, AU",
  },
  {
    id: "camp-102",
    name: "Crypto Wealth Academy",
    category: "Finance",
    status: "Paused",
    spend: "$16,800",
    conversions: "1,198",
    cpa: "$14.00",
    geo: "Global",
  },
  {
    id: "camp-103",
    name: "Luxury Essentials Trial",
    category: "E-commerce",
    status: "Pending",
    spend: "$7,400",
    conversions: "620",
    cpa: "$11.90",
    geo: "US, EU",
  },
  {
    id: "camp-104",
    name: "Mobile Gaming VIP",
    category: "Gaming",
    status: "Active",
    spend: "$28,600",
    conversions: "2,240",
    cpa: "$9.40",
    geo: "US, BR",
  },
  {
    id: "camp-105",
    name: "SaaS Enterprise CRM",
    category: "B2B Software",
    status: "Active",
    spend: "$18,700",
    conversions: "980",
    cpa: "$19.10",
    geo: "EU, UK",
  },
];

export const advertiserConversionStats: AdvertiserConversionStat[] = [
  { id: "conv-1", date: "Jun 1", clicks: 14_280, conversions: 460, revenue: "$62,300" },
  { id: "conv-2", date: "Jun 2", clicks: 15_120, conversions: 490, revenue: "$66,800" },
  { id: "conv-3", date: "Jun 3", clicks: 15_980, conversions: 531, revenue: "$72,100" },
  { id: "conv-4", date: "Jun 4", clicks: 14_760, conversions: 475, revenue: "$64,500" },
  { id: "conv-5", date: "Jun 5", clicks: 16_230, conversions: 512, revenue: "$69,400" },
];

export const advertiserTransactions: AdvertiserTransaction[] = [
  { id: "txn-001", date: "Jun 7, 2026", type: "Deposit", amount: "$50,000", status: "Completed" },
  { id: "txn-002", date: "Jun 2, 2026", type: "Ad Spend", amount: "-$12,420", status: "Settled" },
  { id: "txn-003", date: "May 27, 2026", type: "Deposit", amount: "$20,000", status: "Completed" },
  { id: "txn-004", date: "May 25, 2026", type: "Ad Spend", amount: "-$8,960", status: "Settled" },
  { id: "txn-005", date: "May 18, 2026", type: "Refund", amount: "$1,200", status: "Processed" },
];

export const advertiserFilters: AdvertiserReportFilter[] = [
  { id: "f-1", label: "Last 7 days", value: "7d" },
  { id: "f-2", label: "Last 30 days", value: "30d" },
  { id: "f-3", label: "This quarter", value: "q1" },
  { id: "f-4", label: "All time", value: "all" },
];
