const API_URL = "http://localhost:3000/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function postJSON<T>(url: string, body: unknown, headers?: Record<string, string>): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: headers ?? { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as any).message || `Request failed: ${response.status}`);
  return data as T;
}

async function putJSON<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as any).message || `Request failed: ${response.status}`);
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdvertiserRecord {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  country?: string | null;
  messenger_contact?: string | null;
  status: string;
  is_active: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdvertiserCounts {
  total: number;
  active: number;
  pending: number;
  inactive: number;
}

export interface AdvertiserFormPayload {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  website?: string;
  country?: string;
  messenger_contact?: string;
  status?: string;
  notes?: string;
}

export interface AdvertiserSignupPayload {
  company_name: string;
  contact_name: string;
  email: string;
  password: string;
  country?: string;
  website?: string;
  messenger_contact?: string;
}

// ─── Public ───────────────────────────────────────────────────────────────────

export interface AdvertiserSignupResult {
  success: boolean;
  message: string;
  advertiser?: { id: string; company_name: string; contact_name: string; email: string; status: string };
}

export async function signupAdvertiser(
  payload: AdvertiserSignupPayload
): Promise<AdvertiserSignupResult> {
  return postJSON<AdvertiserSignupResult>(
    `${API_URL}/advertisers/signup`,
    payload,
    { "Content-Type": "application/json" }
  );
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getAdvertiserCounts(): Promise<AdvertiserCounts> {
  const response = await fetch(`${API_URL}/advertisers/counts`, { headers: authHeaders() });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as any).message || "Failed to load counts");
  return (data as { counts: AdvertiserCounts }).counts;
}

export async function listAdvertisers(filters?: {
  search?: string;
  status?: string;
  is_active?: boolean;
}): Promise<AdvertiserRecord[]> {
  const params = new URLSearchParams();
  if (filters?.search)                           params.set("search",    filters.search);
  if (filters?.status)                           params.set("status",    filters.status);
  if (filters?.is_active !== undefined)          params.set("is_active", String(filters.is_active));

  const response = await fetch(`${API_URL}/advertisers?${params.toString()}`, { headers: authHeaders() });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as any).message || "Failed to fetch advertisers");
  return ((data as any).advertisers ?? []) as AdvertiserRecord[];
}

export async function getAdvertiser(advertiserId: string): Promise<AdvertiserRecord> {
  const response = await fetch(`${API_URL}/advertisers/${advertiserId}`, { headers: authHeaders() });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as any).message || "Failed to fetch advertiser");
  return (data as { advertiser: AdvertiserRecord }).advertiser;
}

export async function createAdvertiser(payload: AdvertiserFormPayload): Promise<AdvertiserRecord> {
  const response = await fetch(`${API_URL}/advertisers`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((data as any).message || "Failed to create advertiser");
  return (data as { advertiser: AdvertiserRecord }).advertiser;
}

export async function updateAdvertiser(
  advertiserId: string,
  payload: Partial<AdvertiserFormPayload>
): Promise<AdvertiserRecord> {
  const result = await putJSON<{ advertiser: AdvertiserRecord }>(
    `${API_URL}/advertisers/${advertiserId}`,
    payload
  );
  return result.advertiser;
}

export async function activateAdvertiser(advertiserId: string): Promise<AdvertiserRecord> {
  const result = await postJSON<{ advertiser: AdvertiserRecord }>(
    `${API_URL}/advertisers/${advertiserId}/activate`,
    {},
    authHeaders()
  );
  return result.advertiser;
}

export async function deactivateAdvertiser(advertiserId: string): Promise<AdvertiserRecord> {
  const result = await postJSON<{ advertiser: AdvertiserRecord }>(
    `${API_URL}/advertisers/${advertiserId}/deactivate`,
    {},
    authHeaders()
  );
  return result.advertiser;
}
