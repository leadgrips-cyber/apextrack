const API_URL = "/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface OfferSummary {
  pending_affiliates: number;
  approved_affiliates: number;
  rejected_affiliates: number;
  total_affiliates: number;
  active_events: number;
  clicks_total: number;
  conversions_total: number;
  revenue_total: number;
  payout_total: number;
  profit_total: number;
}

export async function fetchOfferSummary(offerId: number): Promise<OfferSummary> {
  const res = await fetch(`${API_URL}/offers/${offerId}/summary`, { headers: authHeaders() });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to fetch offer summary");
  }
  return res.json() as Promise<OfferSummary>;
}
