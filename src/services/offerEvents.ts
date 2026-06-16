const API_URL = "http://localhost:3000/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface OfferEventRecord {
  id: string;
  offer_id: number;
  event_token: string;
  event_name: string;
  approval_mode: "AUTO_APPROVE" | "MANUAL_REVIEW";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OfferEventFormPayload {
  event_token: string;
  event_name: string;
  approval_mode: "AUTO_APPROVE" | "MANUAL_REVIEW";
  is_active?: boolean;
}

export async function listOfferEvents(offerId: number): Promise<OfferEventRecord[]> {
  const response = await fetch(`${API_URL}/offers/${offerId}/events`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to fetch offer events");
  }
  const data = await response.json();
  return (data.events ?? []) as OfferEventRecord[];
}

export async function createOfferEvent(
  offerId: number,
  payload: OfferEventFormPayload
): Promise<OfferEventRecord> {
  const response = await fetch(`${API_URL}/offers/${offerId}/events`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to create offer event");
  }
  const data = await response.json();
  return data.event as OfferEventRecord;
}

export async function updateOfferEvent(
  offerId: number,
  eventId: string,
  payload: Partial<OfferEventFormPayload>
): Promise<OfferEventRecord> {
  const response = await fetch(`${API_URL}/offers/${offerId}/events/${eventId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to update offer event");
  }
  const data = await response.json();
  return data.event as OfferEventRecord;
}

export async function deleteOfferEvent(offerId: number, eventId: string): Promise<void> {
  const response = await fetch(`${API_URL}/offers/${offerId}/events/${eventId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to delete offer event");
  }
}
