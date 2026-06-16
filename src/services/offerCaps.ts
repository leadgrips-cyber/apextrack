const API_URL = "http://localhost:3000/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface OfferCapsRecord {
  id: string;
  offer_id: number;
  daily_click_cap: number | null;
  hourly_click_cap: number | null;
  daily_conversion_cap: number | null;
  hourly_conversion_cap: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

async function request<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getCaps(offerId: number): Promise<OfferCapsRecord | null> {
  const d = await request<{ caps: OfferCapsRecord | null }>(
    `${API_URL}/offers/${offerId}/caps`,
    { headers: authHeaders() }
  );
  return d.caps;
}

export async function saveCaps(
  offerId: number,
  payload: {
    daily_click_cap?: number | null;
    hourly_click_cap?: number | null;
    daily_conversion_cap?: number | null;
    hourly_conversion_cap?: number | null;
    is_active: boolean;
  }
): Promise<OfferCapsRecord> {
  const d = await request<{ caps: OfferCapsRecord }>(
    `${API_URL}/offers/${offerId}/caps`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }
  );
  return d.caps;
}
