const API_URL = "/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function authHeadersNoContentType() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return { Authorization: `Bearer ${token}` };
}

export type CreativeType = "IMAGE" | "BANNER" | "LOGO" | "HTML" | "VIDEO_URL" | "TRACKING_LINK";

export interface OfferCreativeRecord {
  id: string;
  offer_id: number;
  name: string;
  creative_type: CreativeType;
  file_url: string | null;
  dimensions: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreativeFormPayload {
  name: string;
  creative_type: CreativeType;
  file_url?: string | null;
  dimensions?: string | null;
  notes?: string | null;
}

export async function listCreatives(offerId: number): Promise<OfferCreativeRecord[]> {
  const res = await fetch(`${API_URL}/offers/${offerId}/creatives`, { headers: authHeaders() });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to fetch creatives");
  }
  const d = await res.json();
  return (d.creatives ?? []) as OfferCreativeRecord[];
}

export async function createCreative(offerId: number, payload: CreativeFormPayload): Promise<OfferCreativeRecord> {
  const res = await fetch(`${API_URL}/offers/${offerId}/creatives`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to create creative");
  }
  const d = await res.json();
  return d.creative as OfferCreativeRecord;
}

export async function updateCreative(offerId: number, id: string, payload: Partial<CreativeFormPayload>): Promise<OfferCreativeRecord> {
  const res = await fetch(`${API_URL}/offers/${offerId}/creatives/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to update creative");
  }
  const d = await res.json();
  return d.creative as OfferCreativeRecord;
}

export async function deleteCreative(offerId: number, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/offers/${offerId}/creatives/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to delete creative");
  }
}

export async function uploadCreativeFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/upload/creative`, {
    method: "POST",
    headers: authHeadersNoContentType(),
    body: formData,
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Upload failed");
  }
  const d = await res.json();
  return d.url as string;
}
