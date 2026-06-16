const API_URL = "/api";

function authHeaders() {
  const token = localStorage.getItem("token") || localStorage.getItem("admin_token") || "";
  return { Authorization: `Bearer ${token}` };
}

export interface PublisherLandingPage {
  id: string;
  name: string;
  url: string;
  preview_url: string | null;
}

export interface PublisherCreative {
  id: string;
  name: string;
  creative_type: string;
  file_url: string | null;
  dimensions: string | null;
  notes: string | null;
}

export interface PublisherOfferDetail {
  landing_pages: PublisherLandingPage[];
  creatives: PublisherCreative[];
  allowed_geos: string[];
  allowed_devices: string[];
}

export async function getPublisherDetail(offerId: number | string): Promise<PublisherOfferDetail> {
  const res = await fetch(`${API_URL}/offers/${offerId}/publisher-detail`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || `Failed to load offer detail: ${res.status}`);
  }
  return res.json();
}
