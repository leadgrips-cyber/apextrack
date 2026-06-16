const API_URL = "/api";

export interface ManagerRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  settings: { telegram?: string | null; teams?: string | null } | null;
  created_at: string;
  updated_at: string;
  assigned_count?: number;
}

export interface ManagerStats {
  assigned: number;
  approved: number;
  pending: number;
  total_clicks: number;
  total_conversions: number;
  total_revenue: string;
  total_payout: string;
}

export interface ManagerPublisher {
  id: string;
  email: string;
  full_name: string;
  company_name: string | null;
  country_code: string | null;
  account_status: string;
  approval_status: string;
  affiliate_code: string;
  profile_metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface ManagerApplication {
  id: string;
  offer_id: number;
  offer_name: string;
  publisher_id: string;
  publisher_name: string;
  status: string;
  requested_at: string;
  comments: string | null;
}

function adminToken(): string {
  return localStorage.getItem("admin_token") || "";
}

export async function listManagers(): Promise<ManagerRecord[]> {
  const res = await fetch(`${API_URL}/managers`, {
    headers: { Authorization: `Bearer ${adminToken()}` },
  });
  if (!res.ok) throw new Error(`Failed to load managers (${res.status})`);
  const data = await res.json();
  return data.managers as ManagerRecord[];
}

export async function createManager(payload: {
  full_name: string;
  email: string;
  password: string;
  telegram?: string;
  teams?: string;
  is_active: boolean;
}): Promise<ManagerRecord> {
  const res = await fetch(`${API_URL}/managers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken()}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create manager");
  return data.manager as ManagerRecord;
}

export async function updateManager(
  id: string,
  payload: {
    full_name?: string;
    email?: string;
    password?: string;
    telegram?: string | null;
    teams?: string | null;
    is_active?: boolean;
  }
): Promise<ManagerRecord> {
  const res = await fetch(`${API_URL}/managers/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken()}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update manager");
  return data.manager as ManagerRecord;
}

export async function deleteManager(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/managers/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${adminToken()}` },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || "Failed to delete manager");
  }
}

export async function getManagerStats(id: string): Promise<ManagerStats> {
  const res = await fetch(`${API_URL}/managers/${id}/stats`, {
    headers: { Authorization: `Bearer ${adminToken()}` },
  });
  if (!res.ok) throw new Error(`Failed to load manager stats (${res.status})`);
  return res.json() as Promise<ManagerStats>;
}

export async function getManagerPublishers(id: string): Promise<ManagerPublisher[]> {
  const res = await fetch(`${API_URL}/managers/${id}/publishers`, {
    headers: { Authorization: `Bearer ${adminToken()}` },
  });
  if (!res.ok) throw new Error(`Failed to load manager publishers (${res.status})`);
  const data = await res.json();
  return data.publishers as ManagerPublisher[];
}

export async function getManagerApplications(id: string): Promise<ManagerApplication[]> {
  const res = await fetch(`${API_URL}/managers/${id}/applications`, {
    headers: { Authorization: `Bearer ${adminToken()}` },
  });
  if (!res.ok) throw new Error(`Failed to load manager applications (${res.status})`);
  const data = await res.json();
  return data.applications as ManagerApplication[];
}

export async function bulkAssignPublishers(
  publisherIds: string[],
  managerId: string | null
): Promise<number> {
  const res = await fetch(`${API_URL}/publishers/bulk-assign`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken()}`,
    },
    body: JSON.stringify({ publisher_ids: publisherIds, manager_id: managerId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error((data as { message?: string }).message || "Bulk assignment failed");
  return (data as { updated: number }).updated;
}

export async function savePublisherManagerNotes(
  publisherId: string,
  notes: string,
  recommendation: string | null
): Promise<void> {
  const res = await fetch(`${API_URL}/publishers/${publisherId}/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken()}`,
    },
    body: JSON.stringify({
      manager_notes: notes,
      manager_recommendation: recommendation ?? undefined,
      manager_notes_updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || "Failed to save notes");
  }
}
