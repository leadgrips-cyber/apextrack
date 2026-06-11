const API_URL = "http://localhost:3000/api";

function authHeaders() {
  // Admin panel APIs require role="admin". Prefer admin_token (stored during
  // login for accounts that exist in the admins table) over publisher token.
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export interface PublisherRecord {
  id: string;
  affiliate_code: string;
  full_name: string;
  email: string;
  company_name: string | null;
  country_code: string | null;
  account_status: string;
  approval_status: string;
  assigned_manager_id: string | null;
  manager_name: string | null;
  is_active: boolean;
  created_at: string;
  total_clicks: number;
  total_conversions: number;
  total_revenue: number;
  total_payout: number;
}

export interface ManagerRecord {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface PublisherListResponse {
  publishers: PublisherRecord[];
  pagination: { total: number; page: number; pageSize: number };
}

export async function listPublishers(filters?: {
  status?: string;
  search?: string;
  page?: number;
}): Promise<PublisherListResponse> {
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.search) params.set("search", filters.search);
  if (filters?.page) params.set("page", String(filters.page));

  const response = await fetch(`${API_URL}/publishers?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to fetch affiliates");
  }
  return response.json();
}

export async function getManagers(): Promise<ManagerRecord[]> {
  const response = await fetch(`${API_URL}/publishers/managers`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to fetch managers");
  }
  const data = await response.json();
  return data.managers as ManagerRecord[];
}

export interface CreateAffiliatePayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  country_code: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  assigned_manager_id: string | null;
  telegram: string | null;
  skype: string | null;
  whatsapp: string | null;
  tracking_domain: string | null;
  traffic_source: string | null;
  postback_url: string | null;
}

export async function createAffiliate(payload: CreateAffiliatePayload): Promise<PublisherRecord> {
  const response = await fetch(`${API_URL}/publishers`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || 'Failed to create affiliate');
  }
  const data = await response.json();
  return data.publisher as PublisherRecord;
}

export async function activateAffiliate(publisherId: string): Promise<PublisherRecord> {
  const response = await fetch(`${API_URL}/publishers/${publisherId}/reactivate`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to activate affiliate");
  }
  const data = await response.json();
  return data.publisher as PublisherRecord;
}

export async function disableAffiliate(publisherId: string): Promise<PublisherRecord> {
  const response = await fetch(`${API_URL}/publishers/${publisherId}/suspend`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to disable affiliate");
  }
  const data = await response.json();
  return data.publisher as PublisherRecord;
}

export async function assignManager(publisherId: string, managerId: string): Promise<PublisherRecord> {
  const response = await fetch(`${API_URL}/publishers/${publisherId}/assign-manager`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ manager_id: managerId }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to assign manager");
  }
  const data = await response.json();
  return data.publisher as PublisherRecord;
}

export interface PublisherDetailRecord extends PublisherRecord {
  login_name: string;
  timezone: string | null;
  currency: string;
  updated_at: string;
  approved_at: string | null;
  rejected_reason: string | null;
}

export async function getPublisherById(publisherId: string): Promise<PublisherDetailRecord> {
  const response = await fetch(`${API_URL}/publishers/${publisherId}`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to fetch publisher");
  }
  const data = await response.json();
  return data.publisher as PublisherDetailRecord;
}

export async function approveAffiliate(publisherId: string): Promise<PublisherRecord> {
  const response = await fetch(`${API_URL}/publishers/${publisherId}/approve`, {
    method: "PATCH",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to approve affiliate");
  }
  const data = await response.json();
  return data.publisher as PublisherRecord;
}
