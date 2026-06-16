const API_URL = "http://localhost:3000/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface PublisherAssignmentRecord {
  id: string;
  full_name: string;
  company_name: string | null;
  email: string;
  affiliate_code: string;
  account_status: string;
  is_assigned: boolean;
  assigned_at: string | null;
}

export async function listPublishersWithAssignment(
  offerId: number,
  search?: string
): Promise<PublisherAssignmentRecord[]> {
  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  const res = await fetch(`${API_URL}/offers/${offerId}/assignments?${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to fetch affiliates");
  }
  const d = await res.json();
  return (d.publishers ?? []) as PublisherAssignmentRecord[];
}

export async function assignPublisher(offerId: number, publisherId: string): Promise<void> {
  const res = await fetch(`${API_URL}/offers/${offerId}/assignments`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ publisher_id: publisherId }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to assign affiliate");
  }
}

export async function unassignPublisher(offerId: number, publisherId: string): Promise<void> {
  const res = await fetch(`${API_URL}/offers/${offerId}/assignments/${publisherId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to remove affiliate");
  }
}

export async function bulkAssign(offerId: number, publisherIds: string[]): Promise<void> {
  const res = await fetch(`${API_URL}/offers/${offerId}/assignments/bulk-assign`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ publisher_ids: publisherIds }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to bulk assign");
  }
}

export async function bulkUnassign(offerId: number, publisherIds: string[]): Promise<void> {
  const res = await fetch(`${API_URL}/offers/${offerId}/assignments/bulk-unassign`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ publisher_ids: publisherIds }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to bulk remove");
  }
}
