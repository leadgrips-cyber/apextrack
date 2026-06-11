const API_URL = "http://localhost:3000/api";

function authHeaders() {
  const token = localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface PublisherPostback {
  id: string;
  publisher_id: string;
  offer_id: number | null;
  callback_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreatePostbackPayload {
  offer_id?: number;
  callback_url: string;
  is_active?: boolean;
}

export interface UpdatePostbackPayload {
  offer_id?: number | null;
  callback_url?: string;
  is_active?: boolean;
}

export async function listPostbacks(): Promise<PublisherPostback[]> {
  const response = await fetch(`${API_URL}/publisher-postbacks`, {
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to fetch postbacks");
  }
  const data = await response.json();
  return (data.postbacks ?? []) as PublisherPostback[];
}

export async function createPostback(payload: CreatePostbackPayload): Promise<PublisherPostback> {
  const response = await fetch(`${API_URL}/publisher-postbacks`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to create postback");
  }
  const data = await response.json();
  return data.postback as PublisherPostback;
}

export async function updatePostback(id: string, payload: UpdatePostbackPayload): Promise<PublisherPostback> {
  const response = await fetch(`${API_URL}/publisher-postbacks/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to update postback");
  }
  const data = await response.json();
  return data.postback as PublisherPostback;
}

export async function deletePostback(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/publisher-postbacks/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to delete postback");
  }
}
