const API_URL = "http://localhost:3000/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface ConversionReviewRecord {
  id: string;
  click_id: string;
  offer_id: number;
  offer_name: string;
  advertiser_name: string | null;
  publisher_id: string;
  publisher_email: string;
  publisher_name: string;
  payout_amount: string;
  revenue_amount: string;
  conversion_status: string;
  event_timestamp: string;
  validated_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface ListConversionsResponse {
  conversions: ConversionReviewRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ListConversionsFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  offerId?: number;
  publisherId?: string;
  publisherEmail?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listConversions(filters: ListConversionsFilters = {}): Promise<ListConversionsResponse> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);
  if (filters.offerId) params.set("offerId", String(filters.offerId));
  if (filters.publisherId) params.set("publisherId", filters.publisherId);
  if (filters.publisherEmail) params.set("publisherEmail", filters.publisherEmail);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));

  const response = await fetch(`${API_URL}/conversions/review?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to fetch conversions");
  }
  return response.json();
}

export async function approveConversion(id: string): Promise<{ conversion: ConversionReviewRecord; walletUpdated: boolean }> {
  const response = await fetch(`${API_URL}/conversions/review/${id}/approve`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to approve conversion");
  }
  return response.json();
}

export async function rejectConversion(id: string, rejectionReason: string): Promise<{ conversion: ConversionReviewRecord; walletUpdated: boolean }> {
  const response = await fetch(`${API_URL}/conversions/review/${id}/reject`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ rejection_reason: rejectionReason }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to reject conversion");
  }
  return response.json();
}

export async function updateConversionStatus(
  id: string,
  status: string,
  reason?: string
): Promise<{ conversion: ConversionReviewRecord; walletUpdated: boolean }> {
  const response = await fetch(`${API_URL}/conversions/review/${id}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status, reason }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to update conversion status");
  }
  return response.json();
}

export interface ConversionHistoryRow {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_by_email: string | null;
  reason: string | null;
  created_at: string;
}

export async function getConversionHistory(id: string): Promise<{ history: ConversionHistoryRow[] }> {
  const response = await fetch(`${API_URL}/conversions/review/${id}/history`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to fetch conversion history");
  }
  return response.json();
}
