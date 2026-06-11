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

export interface DashboardSummary {
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

export interface TopPublisher {
  id: string;
  email: string;
  full_name: string;
  affiliate_code: string;
  total_clicks: number;
  total_conversions: number;
  total_revenue: string;
  total_payout: string;
}

export interface TopOffer {
  id: number;
  name: string;
  slug: string;
  category: string;
  total_clicks: number;
  total_conversions: number;
  total_revenue: string;
  total_payout: string;
}

export interface RecentConversion {
  id: string;
  click_id: string;
  offer_id: number;
  offer_name: string;
  publisher_id: string;
  publisher_email: string;
  conversion_status: string;
  payout_amount: string;
  revenue_amount: string;
  event_timestamp: string;
  created_at: string;
}

export interface RecentPostback {
  id: string;
  conversion_id: string;
  offer_id: number;
  offer_name: string;
  publisher_id: string;
  publisher_email: string;
  status: string;
  destination_url: string;
  created_at: string;
}

export interface DailyMetric {
  date: string;
  clicks: number;
  conversions: number;
  revenue: string;
  profit: string;
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const data = await fetchJSON<{ summary: DashboardSummary }>(`${API_URL}/analytics/dashboard/summary`);
  return data.summary;
}

export async function getTopPublishers(limit = 5): Promise<TopPublisher[]> {
  const data = await fetchJSON<{ publishers: TopPublisher[] }>(`${API_URL}/analytics/dashboard/top-publishers?limit=${limit}`);
  return data.publishers;
}

export async function getTopOffers(limit = 5): Promise<TopOffer[]> {
  const data = await fetchJSON<{ offers: TopOffer[] }>(`${API_URL}/analytics/dashboard/top-offers?limit=${limit}`);
  return data.offers;
}

export async function getRecentConversions(limit = 8): Promise<RecentConversion[]> {
  const data = await fetchJSON<{ conversions: RecentConversion[] }>(`${API_URL}/analytics/dashboard/recent-conversions?limit=${limit}`);
  return data.conversions;
}

export async function getRecentPostbacks(limit = 5): Promise<RecentPostback[]> {
  const data = await fetchJSON<{ postbacks: RecentPostback[] }>(`${API_URL}/analytics/dashboard/recent-postbacks?limit=${limit}`);
  return data.postbacks;
}

export async function getChartData(startDate: string, endDate: string): Promise<DailyMetric[]> {
  const data = await fetchJSON<{ data: DailyMetric[] }>(
    `${API_URL}/analytics/dashboard/chart-data?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`
  );
  return data.data;
}
