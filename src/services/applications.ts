const API_URL = "/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface ApplicationRecord {
  id: string;
  offer_id: number;
  publisher_id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requested_at: string | null;
  reviewed_at: string | null;
  reviewed_by_admin_id: string | null;
  rejection_reason: string | null;
  comments: string | null;
  created_at: string;
  updated_at: string;
  offer_name?: string;
  offer_logo_url?: string | null;
  publisher_full_name?: string | null;
  publisher_company_name?: string | null;
}

export async function listApplications(filters?: {
  offer_id?: number;
  status?: string;
}): Promise<ApplicationRecord[]> {
  const params = new URLSearchParams();
  if (filters?.offer_id !== undefined) params.set("offer_id", String(filters.offer_id));
  if (filters?.status) params.set("status", filters.status);

  const res = await fetch(`${API_URL}/applications?${params.toString()}`, { headers: authHeaders() });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to fetch applications");
  }
  const d = await res.json();
  return (d.applications ?? []) as ApplicationRecord[];
}

export async function approveApplication(id: string): Promise<ApplicationRecord> {
  const res = await fetch(`${API_URL}/applications/${id}/approve`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to approve application");
  }
  const d = await res.json();
  return d.application as ApplicationRecord;
}

export async function rejectApplication(id: string, rejection_reason?: string): Promise<ApplicationRecord> {
  const res = await fetch(`${API_URL}/applications/${id}/reject`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ rejection_reason: rejection_reason || null }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to reject application");
  }
  const d = await res.json();
  return d.application as ApplicationRecord;
}
