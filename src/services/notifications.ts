const API_URL = "http://localhost:3000/api";

function publisherHeaders() {
  const token = localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface NotificationRecord {
  id: string;
  publisher_id: string;
  title: string;
  message: string;
  is_read: boolean;
  notification_type: string;
  created_at: string;
  updated_at: string;
}

export async function listNotifications(
  page = 1,
  pageSize = 20
): Promise<{ rows: NotificationRecord[]; total: number; unread_count: number }> {
  const res = await fetch(
    `${API_URL}/notifications?page=${page}&pageSize=${pageSize}`,
    { headers: publisherHeaders() }
  );
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function getUnreadCount(): Promise<number> {
  const res = await fetch(`${API_URL}/notifications/unread-count`, {
    headers: publisherHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch unread count");
  const data = await res.json();
  return data.count as number;
}

export async function markAsRead(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: "PATCH",
    headers: publisherHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark as read");
}

export async function markAllAsRead(): Promise<void> {
  const res = await fetch(`${API_URL}/notifications/read-all`, {
    method: "PATCH",
    headers: publisherHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark all as read");
}
