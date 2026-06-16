const API_URL = "/api";

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

// ─── Reports ────────────────────────────────────────────────────────────────

export interface ClickReportRow {
  click_id: string;
  offer_name: string;
  affiliate_name: string;
  affiliate_email: string;
  country_code: string | null;
  device_type: string | null;
  sub1: string | null;
  sub2: string | null;
  sub3: string | null;
  sub4: string | null;
  sub5: string | null;
  created_at: string;
}

export interface ConversionReportRow {
  id: string;
  transaction_id: string;
  click_id: string;
  offer_name: string;
  advertiser_name: string | null;
  affiliate_name: string;
  affiliate_email: string;
  conversion_status: string;
  payout_amount: string;
  revenue_amount: string;
  event_timestamp: string;
  validated_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
}

export interface DailyReportRow {
  date: string;
  clicks: number;
  conversions: number;
  revenue: string;
  payout: string;
  profit: string;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  offerId?: number;
  publisherEmail?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

function buildReportParams(filters: ReportFilters & { status?: string }): string {
  const p = new URLSearchParams();
  if (filters.startDate)      p.set('start_date', filters.startDate);
  if (filters.endDate)        p.set('end_date', filters.endDate);
  if (filters.offerId)        p.set('offer_id', String(filters.offerId));
  if (filters.publisherEmail) p.set('publisher_email', filters.publisherEmail);
  if (filters.search)         p.set('search', filters.search);
  if (filters.status)         p.set('status', filters.status);
  if (filters.page)           p.set('page', String(filters.page));
  if (filters.pageSize)       p.set('page_size', String(filters.pageSize));
  return p.toString();
}

export async function getClickReport(
  filters: ReportFilters
): Promise<{ rows: ClickReportRow[]; total: number; page: number; pageSize: number }> {
  return fetchJSON(`${API_URL}/analytics/reports/clicks?${buildReportParams(filters)}`);
}

export async function getConversionReport(
  filters: ReportFilters & { status?: string }
): Promise<{ rows: ConversionReportRow[]; total: number; page: number; pageSize: number }> {
  return fetchJSON(`${API_URL}/analytics/reports/conversions?${buildReportParams(filters)}`);
}

export async function getDailyReport(
  filters: { startDate: string; endDate: string; offerId?: number; publisherEmail?: string }
): Promise<DailyReportRow[]> {
  const data = await fetchJSON<{ rows: DailyReportRow[] }>(
    `${API_URL}/analytics/reports/daily?${buildReportParams(filters)}`
  );
  return data.rows;
}

export function downloadCSV(rows: Record<string, unknown>[], filename: string): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [
    headers.join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(',')),
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
