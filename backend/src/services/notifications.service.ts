import * as repo from '../repositories/notifications.repository.js';

export async function listNotifications(publisherId: string, page: number, pageSize: number) {
  return repo.listNotifications(publisherId, page, Math.min(pageSize, 100));
}

export async function getUnreadCount(publisherId: string) {
  return repo.getUnreadCount(publisherId);
}

export async function markOneAsRead(publisherId: string, id: string) {
  return repo.markOneAsRead(publisherId, id);
}

export async function markAllAsRead(publisherId: string) {
  return repo.markAllAsRead(publisherId);
}

export async function createNotification(params: {
  publisher_id: string;
  title: string;
  message: string;
  notification_type?: string;
}) {
  return repo.createNotification({
    publisher_id: params.publisher_id,
    title: params.title,
    message: params.message,
    notification_type: params.notification_type ?? 'system',
  });
}
