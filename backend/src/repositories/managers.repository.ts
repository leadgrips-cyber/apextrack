import { query } from "../db/index.js";

export interface ManagerRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  settings: { telegram?: string | null; teams?: string | null } | null;
  created_at: string;
  updated_at: string;
}

export interface ManagerWithStats extends ManagerRecord {
  assigned_count: number;
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

export interface ManagerPublisherRecord {
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

export interface ManagerApplicationRecord {
  id: string;
  offer_id: number;
  offer_name: string;
  publisher_id: string;
  publisher_name: string;
  status: string;
  requested_at: string;
  comments: string | null;
}

export async function listManagersWithStats(): Promise<ManagerWithStats[]> {
  const result = await query<ManagerWithStats>(
    `SELECT
       a.id, a.email, a.full_name, a.role, a.is_active, a.settings, a.created_at, a.updated_at,
       COALESCE(p.cnt, 0) AS assigned_count
     FROM admins a
     LEFT JOIN (
       SELECT assigned_manager_id, COUNT(*) AS cnt
       FROM publishers
       WHERE assigned_manager_id IS NOT NULL
       GROUP BY assigned_manager_id
     ) p ON p.assigned_manager_id = a.id
     WHERE a.role = 'AFFILIATE_MANAGER'
     ORDER BY a.full_name ASC`,
    []
  );
  return result.rows;
}

export async function findManagerById(id: string): Promise<ManagerRecord | null> {
  const result = await query<ManagerRecord>(
    `SELECT id, email, full_name, role, is_active, settings, created_at, updated_at
     FROM admins WHERE id = $1 AND role = 'AFFILIATE_MANAGER' LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

export interface InsertManagerPayload {
  full_name: string;
  email: string;
  password_hash: string;
  is_active: boolean;
  telegram: string | null;
  teams: string | null;
}

export async function insertManager(payload: InsertManagerPayload): Promise<ManagerRecord> {
  const settings = { telegram: payload.telegram, teams: payload.teams };
  const result = await query<ManagerRecord>(
    `INSERT INTO admins (email, full_name, role, is_active, password_hash, settings, created_at, updated_at)
     VALUES ($1, $2, 'AFFILIATE_MANAGER', $3, $4, $5, NOW(), NOW())
     RETURNING id, email, full_name, role, is_active, settings, created_at, updated_at`,
    [payload.email, payload.full_name, payload.is_active, payload.password_hash, JSON.stringify(settings)]
  );
  return result.rows[0];
}

export interface UpdateManagerPayload {
  full_name?: string;
  email?: string;
  password_hash?: string;
  is_active?: boolean;
  telegram?: string | null;
  teams?: string | null;
}

export async function updateManager(id: string, payload: UpdateManagerPayload): Promise<ManagerRecord | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (payload.full_name !== undefined) {
    fields.push(`full_name = $${values.length + 1}`);
    values.push(payload.full_name);
  }
  if (payload.email !== undefined) {
    fields.push(`email = $${values.length + 1}`);
    values.push(payload.email);
  }
  if (payload.password_hash !== undefined) {
    fields.push(`password_hash = $${values.length + 1}`);
    values.push(payload.password_hash);
  }
  if (payload.is_active !== undefined) {
    fields.push(`is_active = $${values.length + 1}`);
    values.push(payload.is_active);
  }
  if (payload.telegram !== undefined || payload.teams !== undefined) {
    const patch: Record<string, string | null> = {};
    if (payload.telegram !== undefined) patch.telegram = payload.telegram;
    if (payload.teams !== undefined) patch.teams = payload.teams;
    fields.push(`settings = COALESCE(settings, '{}'::jsonb) || $${values.length + 1}::jsonb`);
    values.push(JSON.stringify(patch));
  }

  if (fields.length === 0) return findManagerById(id);

  values.push(id);
  const result = await query<ManagerRecord>(
    `UPDATE admins
     SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${values.length} AND role = 'AFFILIATE_MANAGER'
     RETURNING id, email, full_name, role, is_active, settings, created_at, updated_at`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteManager(id: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM admins WHERE id = $1 AND role = 'AFFILIATE_MANAGER'`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getManagerStats(managerId: string): Promise<ManagerStats> {
  const result = await query<{
    assigned: string;
    approved: string;
    pending: string;
    total_clicks: string;
    total_conversions: string;
    total_revenue: string;
    total_payout: string;
  }>(
    `SELECT
       COUNT(p.id) AS assigned,
       COUNT(p.id) FILTER (WHERE p.account_status = 'ACTIVE') AS approved,
       COUNT(p.id) FILTER (WHERE p.account_status = 'PENDING') AS pending,
       COALESCE(SUM(ck.total_clicks), 0) AS total_clicks,
       COALESCE(SUM(cv.total_conversions), 0) AS total_conversions,
       COALESCE(SUM(cv.total_revenue), 0) AS total_revenue,
       COALESCE(SUM(cv.total_payout), 0) AS total_payout
     FROM publishers p
     LEFT JOIN (
       SELECT publisher_id, COUNT(*) AS total_clicks FROM clicks GROUP BY publisher_id
     ) ck ON ck.publisher_id = p.id
     LEFT JOIN (
       SELECT publisher_id,
              COUNT(*) AS total_conversions,
              COALESCE(SUM(revenue_amount), 0) AS total_revenue,
              COALESCE(SUM(payout_amount), 0) AS total_payout
       FROM conversions
       GROUP BY publisher_id
     ) cv ON cv.publisher_id = p.id
     WHERE p.assigned_manager_id = $1`,
    [managerId]
  );

  const row = result.rows[0];
  return {
    assigned: Number(row?.assigned ?? 0),
    approved: Number(row?.approved ?? 0),
    pending: Number(row?.pending ?? 0),
    total_clicks: Number(row?.total_clicks ?? 0),
    total_conversions: Number(row?.total_conversions ?? 0),
    total_revenue: String(row?.total_revenue ?? '0'),
    total_payout: String(row?.total_payout ?? '0'),
  };
}

export async function findPublishersByManager(managerId: string): Promise<ManagerPublisherRecord[]> {
  const result = await query<ManagerPublisherRecord>(
    `SELECT id, email, full_name, company_name, country_code,
            account_status, approval_status, affiliate_code, profile_metadata, created_at
     FROM publishers
     WHERE assigned_manager_id = $1
     ORDER BY created_at DESC`,
    [managerId]
  );
  return result.rows;
}

export async function findApplicationsByManager(managerId: string): Promise<ManagerApplicationRecord[]> {
  const result = await query<ManagerApplicationRecord>(
    `SELECT oa.id, oa.offer_id, o.name AS offer_name,
            oa.publisher_id, p.full_name AS publisher_name,
            oa.status, oa.requested_at, oa.comments
     FROM offer_applications oa
     JOIN publishers p ON p.id = oa.publisher_id
     JOIN offers o ON o.id = oa.offer_id
     WHERE p.assigned_manager_id = $1
     AND oa.status = 'PENDING'
     ORDER BY oa.requested_at DESC`,
    [managerId]
  );
  return result.rows;
}
