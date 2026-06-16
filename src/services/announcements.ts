const API_URL = "http://localhost:3000/api";

function publisherHeaders() {
  const token = localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function adminHeaders() {
  const token = localStorage.getItem("admin_token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface AnnouncementRecord {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  created_by_admin_id: string | null;
  created_at: string;
  updated_at: string;
}

// Publisher: active announcements only
export async function listActiveAnnouncements(): Promise<AnnouncementRecord[]> {
  const res = await fetch(`${API_URL}/announcements`, {
    headers: publisherHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch announcements");
  const data = await res.json();
  return data.announcements as AnnouncementRecord[];
}

// Admin: all announcements
export async function listAdminAnnouncements(
  page = 1,
  pageSize = 50
): Promise<{ rows: AnnouncementRecord[]; total: number }> {
  const res = await fetch(
    `${API_URL}/admin/announcements?page=${page}&pageSize=${pageSize}`,
    { headers: adminHeaders() }
  );
  if (!res.ok) throw new Error("Failed to fetch announcements");
  return res.json();
}

export async function createAnnouncement(data: {
  title: string;
  message: string;
  is_active: boolean;
}): Promise<AnnouncementRecord> {
  const res = await fetch(`${API_URL}/admin/announcements`, {
    method: "POST",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || "Failed to create announcement");
  }
  const result = await res.json();
  return result.announcement as AnnouncementRecord;
}

export async function updateAnnouncement(
  id: string,
  data: Partial<{ title: string; message: string; is_active: boolean }>
): Promise<AnnouncementRecord> {
  const res = await fetch(`${API_URL}/admin/announcements/${id}`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || "Failed to update announcement");
  }
  const result = await res.json();
  return result.announcement as AnnouncementRecord;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/admin/announcements/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message || "Failed to delete announcement");
  }
}
