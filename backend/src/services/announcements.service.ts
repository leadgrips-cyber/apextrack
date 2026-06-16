import * as repo from '../repositories/announcements.repository.js';

export async function listActiveAnnouncements() {
  return repo.listActiveAnnouncements();
}

export async function listAllAnnouncements(page: number, pageSize: number) {
  return repo.listAllAnnouncements(page, Math.min(pageSize, 100));
}

export async function createAnnouncement(params: {
  title: string;
  message: string;
  is_active: boolean;
  admin_id: string;
}) {
  if (!params.title.trim()) throw new Error('Title is required');
  if (!params.message.trim()) throw new Error('Message is required');
  return repo.insertAnnouncement(params);
}

export async function updateAnnouncement(
  id: string,
  params: Partial<{ title: string; message: string; is_active: boolean }>
) {
  const updated = await repo.updateAnnouncement(id, params);
  if (!updated) throw new Error('Announcement not found');
  return updated;
}

export async function deleteAnnouncement(id: string) {
  const deleted = await repo.deleteAnnouncement(id);
  if (!deleted) throw new Error('Announcement not found');
}
