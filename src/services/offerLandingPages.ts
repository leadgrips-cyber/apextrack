const API_URL = "/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface OfferLandingPageRecord {
  id: string;
  offer_id: number;
  name: string;
  url: string;
  preview_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LandingPageFormPayload {
  name: string;
  url: string;
  preview_url?: string | null;
  is_active?: boolean;
}

export async function listLandingPages(offerId: number): Promise<OfferLandingPageRecord[]> {
  const res = await fetch(`${API_URL}/offers/${offerId}/landing-pages`, { headers: authHeaders() });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to fetch landing pages");
  }
  const d = await res.json();
  return (d.landing_pages ?? []) as OfferLandingPageRecord[];
}

export async function createLandingPage(offerId: number, payload: LandingPageFormPayload): Promise<OfferLandingPageRecord> {
  const res = await fetch(`${API_URL}/offers/${offerId}/landing-pages`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to create landing page");
  }
  const d = await res.json();
  return d.landing_page as OfferLandingPageRecord;
}

export async function updateLandingPage(offerId: number, id: string, payload: Partial<LandingPageFormPayload>): Promise<OfferLandingPageRecord> {
  const res = await fetch(`${API_URL}/offers/${offerId}/landing-pages/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to update landing page");
  }
  const d = await res.json();
  return d.landing_page as OfferLandingPageRecord;
}

export async function deleteLandingPage(offerId: number, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/offers/${offerId}/landing-pages/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to delete landing page");
  }
}
