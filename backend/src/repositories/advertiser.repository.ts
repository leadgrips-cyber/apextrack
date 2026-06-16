import { query } from "../db/index.js";
import {
  AdvertiserRecord,
  AdvertiserSignupPayload,
  AdvertiserCreatePayload,
  AdvertiserFilterParams,
  AdvertiserUpdatePayload,
} from "../types/advertiser.js";

export async function findAdvertiserById(id: string): Promise<AdvertiserRecord | null> {
  const result = await query<AdvertiserRecord>(
    'SELECT * FROM advertisers WHERE id = $1 LIMIT 1',
    [id]
  );
  return result.rows[0] || null;
}

export async function findAdvertiserByEmail(email: string): Promise<AdvertiserRecord | null> {
  const result = await query<AdvertiserRecord>(
    'SELECT * FROM advertisers WHERE email = $1 LIMIT 1',
    [email]
  );
  return result.rows[0] || null;
}

export async function findAdvertisers(filters: AdvertiserFilterParams = {}): Promise<AdvertiserRecord[]> {
  const clauses: string[] = [];
  const values: unknown[] = [];

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`status = $${values.length}`);
  }

  if (filters.is_active !== undefined) {
    values.push(filters.is_active);
    clauses.push(`is_active = $${values.length}`);
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    values.push(term, term, term, term);
    clauses.push(
      `(company_name ILIKE $${values.length - 3} OR contact_name ILIKE $${values.length - 2} OR email ILIKE $${values.length - 1} OR country ILIKE $${values.length})`
    );
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const result = await query<AdvertiserRecord>(
    `SELECT * FROM advertisers ${where} ORDER BY created_at DESC LIMIT 500`,
    values
  );
  return result.rows;
}

export async function getAdvertiserCounts(): Promise<{
  total: number; active: number; pending: number; inactive: number;
}> {
  const result = await query<{
    total: string; active: string; pending: string; inactive: string;
  }>(`
    SELECT
      COUNT(*)                                              AS total,
      COUNT(*) FILTER (WHERE is_active = TRUE)             AS active,
      COUNT(*) FILTER (WHERE status = 'PENDING')           AS pending,
      COUNT(*) FILTER (WHERE is_active = FALSE AND status != 'PENDING') AS inactive
    FROM advertisers
  `);
  const row = result.rows[0];
  return {
    total:    Number(row.total),
    active:   Number(row.active),
    pending:  Number(row.pending),
    inactive: Number(row.inactive),
  };
}

export async function insertAdvertiserSignup(
  payload: AdvertiserSignupPayload & { password_hash: string }
): Promise<AdvertiserRecord> {
  const result = await query<AdvertiserRecord>(
    `INSERT INTO advertisers (
       company_name, contact_name, email, password_hash,
       website, country, messenger_contact,
       status, is_active, created_at, updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,'PENDING',FALSE,NOW(),NOW())
     RETURNING *`,
    [
      payload.company_name,
      payload.contact_name,
      payload.email.toLowerCase(),
      payload.password_hash,
      payload.website   || null,
      payload.country   || null,
      payload.messenger_contact || null,
    ]
  );
  return result.rows[0];
}

export async function insertAdvertiser(
  payload: AdvertiserCreatePayload & { created_by_admin_id: string | null }
): Promise<AdvertiserRecord> {
  const result = await query<AdvertiserRecord>(
    `INSERT INTO advertisers (
       company_name, contact_name, email, phone, website,
       country, messenger_contact, status, is_active, notes,
       created_by_admin_id, created_at, updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,TRUE,$9,$10,NOW(),NOW())
     RETURNING *`,
    [
      payload.company_name,
      payload.contact_name,
      payload.email.toLowerCase(),
      payload.phone             || null,
      payload.website           || null,
      payload.country           || null,
      payload.messenger_contact || null,
      payload.status            || 'ACTIVE',
      payload.notes             || null,
      payload.created_by_admin_id,
    ]
  );
  return result.rows[0];
}

export async function updateAdvertiserById(
  id: string,
  updates: AdvertiserUpdatePayload
): Promise<AdvertiserRecord | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  function add(col: string, val: unknown) {
    values.push(val);
    fields.push(`${col} = $${values.length}`);
  }

  if (updates.company_name    !== undefined) add('company_name',    updates.company_name);
  if (updates.contact_name    !== undefined) add('contact_name',    updates.contact_name);
  if (updates.email           !== undefined) add('email',           updates.email.toLowerCase());
  if (updates.phone           !== undefined) add('phone',           updates.phone || null);
  if (updates.website         !== undefined) add('website',         updates.website || null);
  if (updates.country         !== undefined) add('country',         updates.country || null);
  if (updates.messenger_contact !== undefined) add('messenger_contact', updates.messenger_contact || null);
  if (updates.status          !== undefined) add('status',          updates.status);
  if (updates.notes           !== undefined) add('notes',           updates.notes || null);

  if (fields.length === 0) return findAdvertiserById(id);

  values.push(id);
  const result = await query<AdvertiserRecord>(
    `UPDATE advertisers SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${values.length} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function setAdvertiserActive(id: string, active: boolean): Promise<AdvertiserRecord | null> {
  const status = active ? 'ACTIVE' : 'SUSPENDED';
  const result = await query<AdvertiserRecord>(
    `UPDATE advertisers SET is_active = $1, status = $2, updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [active, status, id]
  );
  return result.rows[0] || null;
}

export async function markAdvertiserLastLogin(id: string): Promise<void> {
  await query(
    'UPDATE advertisers SET updated_at = NOW() WHERE id = $1',
    [id]
  );
}
