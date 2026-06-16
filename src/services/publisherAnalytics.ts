const API_URL = "http://localhost:3000/api";

function authHeaders() {
  const token = localStorage.getItem("token") || "";
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

export interface PublisherDashboardStats {
  total_clicks: number;
  total_conversions: number;
  total_payout: string;
  total_revenue: string;
  epc: string;
  cr: string;
  available_balance: string;
  pending_balance: string;
  withdrawn_balance: string;
}

export interface PublisherClickRow {
  click_id: string;
  offer_name: string;
  country_code: string | null;
  device_type: string | null;
  sub1: string | null;
  sub2: string | null;
  sub3: string | null;
  sub4: string | null;
  sub5: string | null;
  created_at: string;
}

export interface PublisherConversionRow {
  id: string;
  click_id: string;
  offer_name: string;
  conversion_status: string;
  payout_amount: string;
  revenue_amount: string;
  event_timestamp: string;
}

export interface PublisherDailyRow {
  date: string;
  clicks: number;
  conversions: number;
  payout: string;
  revenue: string;
  profit: string;
}

export interface PublisherOverviewRow {
  offer_name: string;
  clicks: number;
  conversions: number;
  payout: string;
  revenue: string;
}

export interface PublisherWalletBalance {
  available_balance: string;
  pending_balance: string;
  withdrawn_balance: string;
  hold_balance: string;
  currency: string;
}

export interface PublisherWalletTxRow {
  id: string;
  transaction_type: string;
  amount: string;
  description: string;
  balance_after: string;
  currency: string;
  created_at: string;
}

function buildParams(obj: Record<string, string | number | undefined>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== '') p.set(k, String(v));
  }
  return p.toString();
}

export async function getPublisherDashboardStats(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<PublisherDashboardStats> {
  const qs = buildParams({ start_date: params?.startDate, end_date: params?.endDate });
  const data = await fetchJSON<{ stats: PublisherDashboardStats }>(
    `${API_URL}/publisher-stats/dashboard${qs ? '?' + qs : ''}`
  );
  return data.stats;
}

export async function getPublisherClickReport(params: {
  startDate?: string;
  endDate?: string;
  offerId?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: PublisherClickRow[]; total: number }> {
  const qs = buildParams({
    start_date: params.startDate,
    end_date: params.endDate,
    offer_id: params.offerId,
    search: params.search,
    page: params.page,
    page_size: params.pageSize,
  });
  return fetchJSON(`${API_URL}/publisher-stats/clicks?${qs}`);
}

export async function getPublisherConversionReport(params: {
  startDate?: string;
  endDate?: string;
  offerId?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ rows: PublisherConversionRow[]; total: number }> {
  const qs = buildParams({
    start_date: params.startDate,
    end_date: params.endDate,
    offer_id: params.offerId,
    search: params.search,
    page: params.page,
    page_size: params.pageSize,
  });
  return fetchJSON(`${API_URL}/publisher-stats/conversions?${qs}`);
}

export async function getPublisherDailyReport(params: {
  startDate: string;
  endDate: string;
  offerId?: number;
}): Promise<PublisherDailyRow[]> {
  const qs = buildParams({ start_date: params.startDate, end_date: params.endDate, offer_id: params.offerId });
  const data = await fetchJSON<{ rows: PublisherDailyRow[] }>(
    `${API_URL}/publisher-stats/reports/daily?${qs}`
  );
  return data.rows;
}

export async function getPublisherOverviewReport(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<PublisherOverviewRow[]> {
  const qs = buildParams({ start_date: params?.startDate, end_date: params?.endDate });
  const data = await fetchJSON<{ rows: PublisherOverviewRow[] }>(
    `${API_URL}/publisher-stats/reports/overview${qs ? '?' + qs : ''}`
  );
  return data.rows;
}

export async function getPublisherWalletBalance(): Promise<PublisherWalletBalance> {
  const data = await fetchJSON<{ wallet: PublisherWalletBalance }>(
    `${API_URL}/publisher-stats/wallet`
  );
  return data.wallet;
}

export async function getPublisherWalletTransactions(params?: {
  page?: number;
  pageSize?: number;
}): Promise<{ rows: PublisherWalletTxRow[]; total: number }> {
  const qs = buildParams({ page: params?.page, page_size: params?.pageSize });
  return fetchJSON(`${API_URL}/publisher-stats/wallet/transactions${qs ? '?' + qs : ''}`);
}

export function downloadPublisherCSV(rows: Record<string, unknown>[], filename: string): void {
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
