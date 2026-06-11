const API_URL = "http://localhost:3000/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface AdvertiserRecord {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdvertiserFormPayload {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  website?: string;
  status?: string;
  notes?: string;
}

export async function listAdvertisers(filters?: {
  search?: string;
  status?: string;
}): Promise<AdvertiserRecord[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.status) params.set("status", filters.status);

  const response = await fetch(`${API_URL}/advertisers?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to fetch advertisers");
  }
  const data = await response.json();
  return (data.advertisers ?? []) as AdvertiserRecord[];
}

export async function createAdvertiser(payload: AdvertiserFormPayload): Promise<AdvertiserRecord> {
  const response = await fetch(`${API_URL}/advertisers`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to create advertiser");
  }
  const data = await response.json();
  return data.advertiser as AdvertiserRecord;
}

export async function updateAdvertiser(
  advertiserId: string,
  payload: Partial<AdvertiserFormPayload>
): Promise<AdvertiserRecord> {
  const response = await fetch(`${API_URL}/advertisers/${advertiserId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to update advertiser");
  }
  const data = await response.json();
  return data.advertiser as AdvertiserRecord;
}
