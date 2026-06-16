import { query } from '../db/index.js';

export interface AnnouncementRow {
  id: string;
  title: string;
  message: string;
  is_active: boolean;
  created_by_admin_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function listActiveAnnouncements(): Promise<AnnouncementRow[]> {
  const result = await query<AnnouncementRow>(
    `SELECT id, title, message, is_active, created_by_admin_id, created_at, updated_at
     FROM announcements
     WHERE is_active = TRUE
     ORDER BY created_at DESC
     LIMIT 50`,
    []
  );
  return result.rows;
}

export async function listAllAnnouncements(
  page: number,
  pageSize: number
): Promise<{ rows: AnnouncementRow[]; total: number }> {
  const offset = (page - 1) * pageSize;

  const [rowsResult, countResult] = await Promise.all([
    query<AnnouncementRow>(
      `SELECT id, title, message, is_active, created_by_admin_id, created_at, updated_at
       FROM announcements
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [pageSize, offset]
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM announcements`,
      []
    ),
  ]);

  return {
    rows: rowsResult.rows,
    total: parseInt(countResult.rows[0]?.count ?? '0', 10),
  };
}

export async function insertAnnouncement(params: {
  title: string;
  message: string;
  is_active: boolean;
  admin_id: string;
}): Promise<AnnouncementRow> {
  const result = await query<AnnouncementRow>(
    `INSERT INTO announcements (title, message, is_active, created_by_admin_id, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING *`,
    [params.title, params.message, params.is_active, params.admin_id]
  );
  return result.rows[0];
}

export async function updateAnnouncement(
  id: string,
  params: Partial<{ title: string; message: string; is_active: boolean }>
): Promise<AnnouncementRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (params.title !== undefined) {
    values.push(params.title);
    fields.push(`title = $${values.length}`);
  }
  if (params.message !== undefined) {
    values.push(params.message);
    fields.push(`message = $${values.length}`);
  }
  if (params.is_active !== undefined) {
    values.push(params.is_active);
    fields.push(`is_active = $${values.length}`);
  }

  if (fields.length === 0) {
    const current = await query<AnnouncementRow>(
      `SELECT * FROM announcements WHERE id = $1`, [id]
    );
    return current.rows[0] ?? null;
  }

  values.push(id);
  const result = await query<AnnouncementRow>(
    `UPDATE announcements
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING *`,
    values
  );
  return result.rows[0] ?? null;
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM announcements WHERE id = $1`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}
