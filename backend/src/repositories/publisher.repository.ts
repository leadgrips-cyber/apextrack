import { query } from "../db/index.js";
import { OfferApplicationRecord } from "../types/application.js";
import { TrackingLinkRecord } from "../types/tracking.js";

export interface PublisherAdminRecord {
  id: string;
  email: string;
  login_name: string;
  full_name: string;
  company_name?: string | null;
  country_code?: string | null;
  timezone?: string | null;
  account_status: string;
  approval_status: string;
  assigned_manager_id?: string | null;
  manager_name?: string | null;
  affiliate_code: string;
  is_active: boolean;
  currency: string;
  profile_metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  approved_at?: string | null;
  rejected_reason?: string | null;
  email_verified?: boolean;
  total_clicks: number;
  total_conversions: number;
  total_revenue: string;
  total_payout: string;
}

export interface ManagerRecord {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface PublisherWalletRecord {
  id: string;
  publisher_id: string;
  currency: string;
  available_balance: string;
  pending_balance: string;
  withdrawn_balance: string;
  hold_balance: string;
  reserved_balance: string;
  created_at: string;
  updated_at: string;
}

export interface PublisherListFilters {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

function normalizeAccountStatus(status?: string): string | undefined {
  if (!status || typeof status !== 'string') {
    return undefined;
  }

  const normalized = status.trim().toLowerCase();
  if (normalized === 'pending') return 'PENDING';
  if (normalized === 'active') return 'ACTIVE';
  if (normalized === 'suspended') return 'SUSPENDED';
  if (normalized === 'blocked' || normalized === 'deactivated') return 'DEACTIVATED';
  return undefined;
}

export async function findPublishers(filters: PublisherListFilters) {
  const clauses: string[] = [];
  const values: unknown[] = [];

  if (filters.status) {
    const status = normalizeAccountStatus(filters.status);
    if (status) {
      values.push(status);
      clauses.push(`account_status = $${values.length}`);
    }
  }

  if (filters.search) {
    values.push(`%${filters.search.trim().toLowerCase()}%`);
    clauses.push(
      `(LOWER(email) LIKE $${values.length} OR LOWER(login_name) LIKE $${values.length} OR LOWER(full_name) LIKE $${values.length} OR LOWER(company_name) LIKE $${values.length} OR LOWER(affiliate_code) LIKE $${values.length})`
    );
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const page = Number(filters.page ?? 1) || 1;
  const pageSize = Number(filters.pageSize ?? 25) || 25;
  const offset = (page - 1) * pageSize;

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) FROM publishers ${whereClause}`,
    values
  );
  const total = Number(countResult.rows[0]?.count ?? 0);

  const result = await query<PublisherAdminRecord>(
    `SELECT
       p.id,
       p.email,
       p.login_name,
       p.full_name,
       p.company_name,
       p.country_code,
       p.timezone,
       p.account_status,
       p.approval_status,
       p.assigned_manager_id,
       mgr.full_name AS manager_name,
       p.affiliate_code,
       p.is_active,
       p.currency,
       p.created_at,
       p.updated_at,
       p.approved_at,
       p.rejected_reason,
       p.email_verified,
       COALESCE(click_stats.total_clicks, 0) AS total_clicks,
       COALESCE(conv_stats.total_conversions, 0) AS total_conversions,
       COALESCE(conv_stats.total_revenue, 0) AS total_revenue,
       COALESCE(conv_stats.total_payout, 0) AS total_payout
     FROM publishers p
     LEFT JOIN admins mgr ON mgr.id = p.assigned_manager_id
     LEFT JOIN (
       SELECT publisher_id, COUNT(*) AS total_clicks FROM clicks GROUP BY publisher_id
     ) click_stats ON click_stats.publisher_id = p.id
     LEFT JOIN (
       SELECT publisher_id,
              COUNT(*) AS total_conversions,
              COALESCE(SUM(revenue_amount), 0) AS total_revenue,
              COALESCE(SUM(payout_amount), 0) AS total_payout
       FROM conversions
       GROUP BY publisher_id
     ) conv_stats ON conv_stats.publisher_id = p.id
     ${whereClause}
     ORDER BY p.created_at DESC
     LIMIT $${values.length + 1}
     OFFSET $${values.length + 2}`,
    [...values, pageSize, offset]
  );

  return {
    publishers: result.rows,
    total,
    page,
    pageSize,
  };
}

export async function findPublisherById(publisherId: string): Promise<PublisherAdminRecord | null> {
  const result = await query<PublisherAdminRecord>(
    `SELECT
       p.id,
       p.email,
       p.login_name,
       p.full_name,
       p.company_name,
       p.country_code,
       p.timezone,
       p.account_status,
       p.approval_status,
       p.assigned_manager_id,
       mgr.full_name AS manager_name,
       p.affiliate_code,
       p.is_active,
       p.currency,
       p.profile_metadata,
       p.created_at,
       p.updated_at,
       p.approved_at,
       p.rejected_reason,
       p.email_verified,
       COALESCE(click_stats.total_clicks, 0) AS total_clicks,
       COALESCE(conv_stats.total_conversions, 0) AS total_conversions,
       COALESCE(conv_stats.total_revenue, 0) AS total_revenue,
       COALESCE(conv_stats.total_payout, 0) AS total_payout
     FROM publishers p
     LEFT JOIN admins mgr ON mgr.id = p.assigned_manager_id
     LEFT JOIN (
       SELECT publisher_id, COUNT(*) AS total_clicks FROM clicks GROUP BY publisher_id
     ) click_stats ON click_stats.publisher_id = p.id
     LEFT JOIN (
       SELECT publisher_id,
              COUNT(*) AS total_conversions,
              COALESCE(SUM(revenue_amount), 0) AS total_revenue,
              COALESCE(SUM(payout_amount), 0) AS total_payout
       FROM conversions
       GROUP BY publisher_id
     ) conv_stats ON conv_stats.publisher_id = p.id
     WHERE p.id = $1
     LIMIT 1`,
    [publisherId]
  );

  return result.rows[0] || null;
}

export async function updatePublisherStatus(
  publisherId: string,
  updates: {
    account_status?: string;
    approval_status?: string;
    is_active?: boolean;
    approved_at?: string | null;
    rejected_reason?: string | null;
    assigned_manager_id?: string | null;
  }
): Promise<PublisherAdminRecord | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.account_status !== undefined) {
    fields.push(`account_status = $${values.length + 1}`);
    values.push(updates.account_status);
  }
  if (updates.approval_status !== undefined) {
    fields.push(`approval_status = $${values.length + 1}`);
    values.push(updates.approval_status);
  }
  if (updates.is_active !== undefined) {
    fields.push(`is_active = $${values.length + 1}`);
    values.push(updates.is_active);
  }
  if (updates.approved_at !== undefined) {
    fields.push(`approved_at = $${values.length + 1}`);
    values.push(updates.approved_at);
  }
  if (updates.rejected_reason !== undefined) {
    fields.push(`rejected_reason = $${values.length + 1}`);
    values.push(updates.rejected_reason);
  }
  if (updates.assigned_manager_id !== undefined) {
    fields.push(`assigned_manager_id = $${values.length + 1}`);
    values.push(updates.assigned_manager_id);
  }

  if (fields.length === 0) {
    return findPublisherById(publisherId);
  }

  const result = await query<PublisherAdminRecord>(
    `UPDATE publishers
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length + 1}
       RETURNING id, email, login_name, full_name, company_name, country_code, timezone, account_status,
                 approval_status, assigned_manager_id, affiliate_code, is_active, currency, created_at, updated_at,
                 approved_at, rejected_reason`,
    [...values, publisherId]
  );

  return result.rows[0] || null;
}

export interface PublisherProfileUpdates {
  full_name?: string;
  email?: string;
  login_name?: string;
  company_name?: string;
  country_code?: string;
  account_status?: string;
  password_hash?: string;
  profile_metadata_patch?: Record<string, unknown>;
}

export async function updatePublisherProfile(
  publisherId: string,
  updates: PublisherProfileUpdates
): Promise<PublisherAdminRecord | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.full_name !== undefined) { fields.push(`full_name = $${values.length + 1}`); values.push(updates.full_name); }
  if (updates.email !== undefined)     { fields.push(`email = $${values.length + 1}`);     values.push(updates.email); }
  if (updates.login_name !== undefined){ fields.push(`login_name = $${values.length + 1}`);values.push(updates.login_name); }
  if (updates.company_name !== undefined){ fields.push(`company_name = $${values.length + 1}`); values.push(updates.company_name); }
  if (updates.country_code !== undefined){ fields.push(`country_code = $${values.length + 1}`); values.push(updates.country_code || null); }
  if (updates.account_status !== undefined){ fields.push(`account_status = $${values.length + 1}`); values.push(updates.account_status); }
  if (updates.password_hash !== undefined){ fields.push(`password_hash = $${values.length + 1}`); values.push(updates.password_hash); }

  if (updates.profile_metadata_patch && Object.keys(updates.profile_metadata_patch).length > 0) {
    fields.push(`profile_metadata = COALESCE(profile_metadata, '{}'::jsonb) || $${values.length + 1}::jsonb`);
    values.push(JSON.stringify(updates.profile_metadata_patch));
  }

  if (fields.length === 0) return findPublisherById(publisherId);

  values.push(publisherId);
  await query(
    `UPDATE publishers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length}`,
    values
  );
  return findPublisherById(publisherId);
}

export async function findPublisherWallet(publisherId: string): Promise<PublisherWalletRecord | null> {
  const result = await query<PublisherWalletRecord>(
    'SELECT * FROM wallets WHERE publisher_id = $1 LIMIT 1',
    [publisherId]
  );
  return result.rows[0] || null;
}

export async function ensurePublisherWallet(publisherId: string): Promise<PublisherWalletRecord> {
  const result = await query<PublisherWalletRecord>(
    `INSERT INTO wallets (publisher_id, currency, available_balance, pending_balance, withdrawn_balance, hold_balance, reserved_balance, created_at, updated_at)
     VALUES ($1, 'USD', 0, 0, 0, 0, 0, NOW(), NOW())
     ON CONFLICT (publisher_id) DO UPDATE SET updated_at = wallets.updated_at
     RETURNING *`,
    [publisherId]
  );
  return result.rows[0];
}

export async function findPublisherApplicationsByPublisher(publisherId: string): Promise<OfferApplicationRecord[]> {
  const result = await query<OfferApplicationRecord>(
    `SELECT *
     FROM offer_applications
     WHERE publisher_id = $1
     ORDER BY requested_at DESC
     LIMIT 200`,
    [publisherId]
  );
  return result.rows;
}

export async function findPublisherTrackingLinksByPublisher(publisherId: string): Promise<TrackingLinkRecord[]> {
  const result = await query<TrackingLinkRecord>(
    `SELECT *
     FROM tracking_links
     WHERE publisher_id = $1
     ORDER BY created_at DESC
     LIMIT 200`,
    [publisherId]
  );
  return result.rows;
}

export async function findManagersForAssignment(): Promise<ManagerRecord[]> {
  const result = await query<ManagerRecord>(
    `SELECT id, full_name, email, role
     FROM admins
     WHERE is_active = TRUE AND role = 'AFFILIATE_MANAGER'
     ORDER BY full_name ASC`,
    []
  );
  return result.rows;
}

export async function bulkAssignPublishers(
  publisherIds: string[],
  managerId: string | null
): Promise<number> {
  if (publisherIds.length === 0) return 0;
  const placeholders = publisherIds.map((_, i) => `$${i + 2}`).join(', ');
  const result = await query(
    `UPDATE publishers SET assigned_manager_id = $1, updated_at = NOW()
     WHERE id IN (${placeholders})`,
    [managerId, ...publisherIds]
  );
  return result.rowCount ?? 0;
}

export async function findAdminById(adminId: string): Promise<ManagerRecord | null> {
  const result = await query<ManagerRecord>(
    `SELECT id, full_name, email, role FROM admins WHERE id = $1 AND is_active = TRUE LIMIT 1`,
    [adminId]
  );
  return result.rows[0] || null;
}

export interface AdminCreatePublisherPayload {
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  country_code: string;
  account_status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  approval_status: string;
  is_active: boolean;
  assigned_manager_id: string | null;
  telegram: string | null;
  skype: string | null;
  whatsapp: string | null;
  tracking_domain: string | null;
  traffic_source: string | null;
  postback_url: string | null;
}

export async function insertPublisherByAdmin(payload: AdminCreatePublisherPayload): Promise<PublisherAdminRecord> {
  const loginName = payload.email.split('@')[0];
  const affiliateCode = `AFF-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const fullName = `${payload.first_name} ${payload.last_name}`.trim();

  const profileMetadata = {
    telegram: payload.telegram,
    skype: payload.skype,
    whatsapp: payload.whatsapp,
    tracking_domain: payload.tracking_domain,
    traffic_source: payload.traffic_source,
    postback_url: payload.postback_url,
  };

  const result = await query<PublisherAdminRecord>(
    `INSERT INTO publishers (
       email, login_name, full_name, country_code, affiliate_code,
       password_hash, account_status, approval_status, is_active,
       assigned_manager_id, profile_metadata, created_at, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
     RETURNING id, email, login_name, full_name, company_name, country_code, timezone,
               account_status, approval_status, assigned_manager_id, affiliate_code,
               is_active, currency, created_at, updated_at, approved_at, rejected_reason`,
    [
      payload.email,
      loginName,
      fullName,
      payload.country_code,
      affiliateCode,
      payload.password_hash,
      payload.account_status,
      payload.approval_status,
      payload.is_active,
      payload.assigned_manager_id,
      profileMetadata,
    ]
  );

  const row = result.rows[0];
  return {
    ...row,
    manager_name: null,
    total_clicks: 0,
    total_conversions: 0,
    total_revenue: '0',
    total_payout: '0',
  };
}

export interface PublisherManagerInfo {
  affiliate_code: string;
  manager_id: string | null;
  manager_full_name: string | null;
  manager_email: string | null;
  manager_settings: { telegram?: string | null; teams?: string | null } | null;
}

export async function getPublisherManagerInfo(publisherId: string): Promise<PublisherManagerInfo | null> {
  const result = await query<PublisherManagerInfo>(
    `SELECT
       p.affiliate_code,
       a.id AS manager_id,
       a.full_name AS manager_full_name,
       a.email AS manager_email,
       a.settings AS manager_settings
     FROM publishers p
     LEFT JOIN admins a ON a.id = p.assigned_manager_id AND a.role = 'AFFILIATE_MANAGER'
     WHERE p.id = $1`,
    [publisherId]
  );
  return result.rows[0] ?? null;
}
