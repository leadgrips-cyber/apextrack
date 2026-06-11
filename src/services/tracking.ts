const API_URL = "http://localhost:3000/api";

function authHeaders() {
  const token = localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface TrackingLink {
  id: string;
  publisher_id: string;
  offer_id: number;
  sub1?: string | null;
  sub2?: string | null;
  sub3?: string | null;
  sub4?: string | null;
  sub5?: string | null;
  tracking_url: string;
  created_at: string;
  updated_at: string;
}

export interface TrackingLinkPayload {
  offer_id: number;
  sub1?: string;
  sub2?: string;
  sub3?: string;
  sub4?: string;
  sub5?: string;
}

export async function listTrackingLinks(): Promise<TrackingLink[]> {
  const response = await fetch(`${API_URL}/tracking`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to fetch tracking links");
  }
  const data = await response.json();
  return (data.links ?? []) as TrackingLink[];
}

export async function generateTrackingLink(payload: TrackingLinkPayload): Promise<TrackingLink> {
  const response = await fetch(`${API_URL}/tracking`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to generate tracking link");
  }
  const data = await response.json();
  return data.trackingLink as TrackingLink;
}
