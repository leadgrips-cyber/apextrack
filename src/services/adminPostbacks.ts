const API_URL = "/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, { headers: authHeaders(), ...options });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || `Request failed: ${response.status}`);
  }
  return response.json();
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminPostbackRow {
  id: string;
  publisher_id: string;
  publisher_email: string;
  publisher_name: string;
  offer_id: number | null;
  offer_name: string | null;
  callback_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminPostbackListResult {
  rows: AdminPostbackRow[];
  total: number;
}

export interface AdvertiserPostbackLogRow {
  id: string;
  click_id: string;
  transaction_id: string;
  conversion_status: string;
  offer_name: string;
  publisher_email: string;
  publisher_name: string;
  revenue_amount: string;
  payout_amount: string;
  s2s_payload: Record<string, unknown> | null;
  event_timestamp: string;
  created_at: string;
}

export interface AffiliatePostbackLogRow {
  id: string;
  conversion_id: string;
  publisher_email: string;
  publisher_name: string;
  offer_name: string;
  destination_url: string;
  status: string;
  last_response_code: number | null;
  last_response_body: string | null;
  attempt_count: number;
  last_attempt_at: string | null;
  created_at: string;
}

export interface PostbackTestResult {
  resolved_url: string;
  status_code: number;
  response_body: string;
  response_time_ms: number;
  success: boolean;
}

export interface PostbackLogListResult<T> {
  rows: T[];
  total: number;
}

// ─── Publisher Postbacks CRUD ────────────────────────────────────────────────

export async function listAdminPostbacks(params: {
  publisherId?: string;
  offerId?: number;
  page?: number;
  pageSize?: number;
}): Promise<AdminPostbackListResult> {
  const q = new URLSearchParams();
  if (params.publisherId) q.set("publisherId", params.publisherId);
  if (params.offerId)     q.set("offerId", String(params.offerId));
  q.set("page",     String(params.page     ?? 1));
  q.set("pageSize", String(params.pageSize ?? 50));
  return fetchJSON(`${API_URL}/admin/postbacks?${q}`);
}

export async function createAdminPostback(payload: {
  publisher_id: string;
  offer_id?: number | null;
  callback_url: string;
  is_active?: boolean;
}): Promise<AdminPostbackRow> {
  return fetchJSON(`${API_URL}/admin/postbacks`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminPostback(
  id: string,
  payload: { offer_id?: number | null; callback_url?: string; is_active?: boolean }
): Promise<AdminPostbackRow> {
  return fetchJSON(`${API_URL}/admin/postbacks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminPostback(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/admin/postbacks/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok && response.status !== 204) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || `Delete failed: ${response.status}`);
  }
}

// ─── Postback Test ───────────────────────────────────────────────────────────

export async function testAdminPostback(payload: {
  postback_id: string;
  click_id?: string;
  offer_id?: string;
  publisher_id?: string;
  payout?: string;
  revenue?: string;
  status?: string;
  sub1?: string;
  sub2?: string;
  sub3?: string;
  sub4?: string;
  sub5?: string;
}): Promise<PostbackTestResult> {
  return fetchJSON(`${API_URL}/admin/postbacks/test`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ─── Advertiser Postback Logs ────────────────────────────────────────────────

export async function listAdvertiserLogs(params: {
  offerId?: number;
  publisherId?: string;
  page?: number;
  pageSize?: number;
}): Promise<PostbackLogListResult<AdvertiserPostbackLogRow>> {
  const q = new URLSearchParams();
  if (params.offerId)     q.set("offerId", String(params.offerId));
  if (params.publisherId) q.set("publisherId", params.publisherId);
  q.set("page",     String(params.page     ?? 1));
  q.set("pageSize", String(params.pageSize ?? 50));
  return fetchJSON(`${API_URL}/admin/postbacks/logs/advertiser?${q}`);
}

// ─── Affiliate Postback Logs ─────────────────────────────────────────────────

export async function listAffiliateLogs(params: {
  offerId?: number;
  publisherId?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<PostbackLogListResult<AffiliatePostbackLogRow>> {
  const q = new URLSearchParams();
  if (params.offerId)     q.set("offerId", String(params.offerId));
  if (params.publisherId) q.set("publisherId", params.publisherId);
  if (params.status)      q.set("status", params.status);
  q.set("page",     String(params.page     ?? 1));
  q.set("pageSize", String(params.pageSize ?? 50));
  return fetchJSON(`${API_URL}/admin/postbacks/logs/affiliate?${q}`);
}
