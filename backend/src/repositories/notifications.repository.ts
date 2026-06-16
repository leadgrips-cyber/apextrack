import { query } from '../db/index.js';

export interface NotificationRow {
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
  publisherId: string,
  page: number,
  pageSize: number
): Promise<{ rows: NotificationRow[]; total: number; unread_count: number }> {
  const offset = (page - 1) * pageSize;

  const [rowsResult, countResult, unreadResult] = await Promise.all([
    query<NotificationRow>(
      `SELECT * FROM notifications
       WHERE publisher_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [publisherId, pageSize, offset]
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM notifications WHERE publisher_id = $1`,
      [publisherId]
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM notifications WHERE publisher_id = $1 AND is_read = FALSE`,
      [publisherId]
    ),
  ]);

  return {
    rows: rowsResult.rows,
    total: parseInt(countResult.rows[0]?.count ?? '0', 10),
    unread_count: parseInt(unreadResult.rows[0]?.count ?? '0', 10),
  };
}

export async function getUnreadCount(publisherId: string): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM notifications WHERE publisher_id = $1 AND is_read = FALSE`,
    [publisherId]
  );
  return parseInt(result.rows[0]?.count ?? '0', 10);
}

export async function markOneAsRead(publisherId: string, id: string): Promise<boolean> {
  const result = await query(
    `UPDATE notifications SET is_read = TRUE, updated_at = NOW()
     WHERE id = $1 AND publisher_id = $2 AND is_read = FALSE`,
    [id, publisherId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function markAllAsRead(publisherId: string): Promise<number> {
  const result = await query(
    `UPDATE notifications SET is_read = TRUE, updated_at = NOW()
     WHERE publisher_id = $1 AND is_read = FALSE`,
    [publisherId]
  );
  return result.rowCount ?? 0;
}

export async function createNotification(params: {
  publisher_id: string;
  title: string;
  message: string;
  notification_type: string;
}): Promise<NotificationRow> {
  const result = await query<NotificationRow>(
    `INSERT INTO notifications (publisher_id, title, message, notification_type, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING *`,
    [params.publisher_id, params.title, params.message, params.notification_type]
  );
  return result.rows[0];
}
