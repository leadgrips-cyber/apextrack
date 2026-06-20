const API_URL = "/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface OfferRecord {
  id: number;
  name: string;
  slug: string;
  category: string;
  status: string;
  requires_publisher_approval: boolean;
  payout_type: string;
  payout_amount: number;
  advertiser_payout: number;
  affiliate_payout: number;
  affiliate_revenue_share_percent?: number | null;
  currency: string;
  target_geos: string[];
  target_devices: string[];
  landing_page_url: string;
  preview_url?: string | null;
  offer_logo_url?: string | null;
  conversion_approval_mode?: string;
  terms?: string | null;
  traffic_rules?: Record<string, unknown> | null;
  default_affiliate_commission: number;
  tracking_protocol: string;
  admin_notes?: string | null;
  advertiser_id?: string | null;
  advertiser_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfferFormPayload {
  name: string;
  category: string;
  payout_type: string;
  payout_amount: number;
  advertiser_payout?: number;
  affiliate_payout?: number;
  affiliate_revenue_share_percent?: number | null;
  currency: string;
  landing_page_url: string;
  preview_url?: string;
  offer_logo_url?: string | null;
  conversion_approval_mode?: string;
  target_geos?: string[];
  target_devices?: string[];
  status?: string;
  requires_publisher_approval?: boolean;
  default_affiliate_commission?: number;
  tracking_protocol?: string;
  admin_notes?: string;
  terms?: string;
  traffic_rules?: Record<string, unknown> | null;
  advertiser_id?: string | null;
}

export async function listAdminOffers(filters?: {
  search?: string;
  status?: string;
  category?: string;
}): Promise<OfferRecord[]> {
  const params = new URLSearchParams();
  if (filters?.search) params.set("search", filters.search);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.category) params.set("category", filters.category);

  const response = await fetch(`${API_URL}/offers?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to fetch offers");
  }
  const data = await response.json();
  return (data.offers ?? []) as OfferRecord[];
}

export async function createOffer(payload: OfferFormPayload): Promise<OfferRecord> {
  const response = await fetch(`${API_URL}/offers`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to create offer");
  }
  const data = await response.json();
  return data.offer as OfferRecord;
}

export async function updateOffer(offerId: number, payload: Partial<OfferFormPayload>): Promise<OfferRecord> {
  const response = await fetch(`${API_URL}/offers/${offerId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to update offer");
  }
  const data = await response.json();
  return data.offer as OfferRecord;
}

export async function pauseOffer(offerId: number): Promise<OfferRecord> {
  const response = await fetch(`${API_URL}/offers/${offerId}/pause`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to pause offer");
  }
  const data = await response.json();
  return data.offer as OfferRecord;
}

export async function activateOffer(offerId: number): Promise<OfferRecord> {
  const response = await fetch(`${API_URL}/offers/${offerId}/activate`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to activate offer");
  }
  const data = await response.json();
  return data.offer as OfferRecord;
}

export async function archiveOffer(offerId: number): Promise<OfferRecord> {
  const response = await fetch(`${API_URL}/offers/${offerId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to archive offer");
  }
  const data = await response.json();
  return data.offer as OfferRecord;
}
