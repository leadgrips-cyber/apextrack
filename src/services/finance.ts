const API_URL = "http://localhost:3000/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: authHeaders() });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || `Request failed: ${response.status}`);
  }
  return response.json();
}

export interface RevenueSummary {
  total_publishers: number;
  active_publishers: number;
  total_offers: number;
  active_offers: number;
  total_clicks: number;
  total_conversions: number;
  total_revenue: string;
  total_payout: string;
  profit: string;
}

export interface RevenueByOffer {
  offer_id: number;
  offer_name: string;
  slug: string;
  category: string;
  total_clicks: number;
  total_conversions: number;
  total_revenue: string;
  total_payout: string;
  profit: string;
}

export interface RevenueTransaction {
  id: string;
  click_id: string;
  offer_id: number;
  offer_name: string;
  publisher_id: string;
  publisher_email: string;
  conversion_status: string;
  payout_amount: string;
  revenue_amount: string;
  profit: string;
  event_timestamp: string;
  created_at: string;
}

export async function getRevenueSummary(startDate?: string, endDate?: string): Promise<RevenueSummary> {
  const qs = new URLSearchParams();
  if (startDate) qs.set("start_date", startDate);
  if (endDate)   qs.set("end_date",   endDate);
  const data = await fetchJSON<{ summary: RevenueSummary }>(
    `${API_URL}/analytics/dashboard/summary?${qs.toString()}`
  );
  return data.summary;
}

export async function getRevenueByOffer(params: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ offers: RevenueByOffer[]; total: number; page: number; pageSize: number }> {
  const qs = new URLSearchParams();
  if (params.page)      qs.set("page",      String(params.page));
  if (params.pageSize)  qs.set("page_size", String(params.pageSize));
  if (params.sortBy)    qs.set("sort_by",   params.sortBy);
  if (params.sortDir)   qs.set("sort_dir",  params.sortDir);
  if (params.startDate) qs.set("start_date", params.startDate);
  if (params.endDate)   qs.set("end_date",   params.endDate);
  return fetchJSON(`${API_URL}/analytics/finance/revenue-by-offer?${qs.toString()}`);
}

export async function getRevenueTransactions(params: {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  offerId?: number;
  publisherId?: string;
}): Promise<{ transactions: RevenueTransaction[]; total: number; page: number; pageSize: number }> {
  const qs = new URLSearchParams();
  if (params.page)        qs.set("page",         String(params.page));
  if (params.pageSize)    qs.set("page_size",     String(params.pageSize));
  if (params.startDate)   qs.set("start_date",    params.startDate);
  if (params.endDate)     qs.set("end_date",       params.endDate);
  if (params.status)      qs.set("status",         params.status);
  if (params.offerId)     qs.set("offer_id",       String(params.offerId));
  if (params.publisherId) qs.set("publisher_id",   params.publisherId);
  return fetchJSON(`${API_URL}/analytics/finance/transactions?${qs.toString()}`);
}
