import { query } from "../db/index.js";
import { AdvertiserRecord, AdvertiserCreatePayload, AdvertiserFilterParams, AdvertiserUpdatePayload } from "../types/advertiser.js";

export async function findAdvertiserById(id: string): Promise<AdvertiserRecord | null> {
  const result = await query<AdvertiserRecord>(
    'SELECT * FROM advertisers WHERE id = $1 LIMIT 1',
    [id]
  );
  return result.rows[0] || null;
}

export async function findAdvertisers(filters: AdvertiserFilterParams = {}): Promise<AdvertiserRecord[]> {
  const clauses: string[] = [];
  const values: Array<string> = [];

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`status = $${values.length}`);
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    values.push(term, term, term);
    clauses.push(`(company_name ILIKE $${values.length - 2} OR contact_name ILIKE $${values.length - 1} OR email ILIKE $${values.length})`);
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const result = await query<AdvertiserRecord>(
    `SELECT * FROM advertisers ${whereClause} ORDER BY company_name ASC LIMIT 500`,
    values
  );
  return result.rows;
}

export async function insertAdvertiser(
  payload: AdvertiserCreatePayload & { created_by_admin_id: string | null }
): Promise<AdvertiserRecord> {
  const result = await query<AdvertiserRecord>(
    `INSERT INTO advertisers (
       company_name, contact_name, email, phone, website, status, notes, created_by_admin_id, created_at, updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW())
     RETURNING *`,
    [
      payload.company_name,
      payload.contact_name,
      payload.email,
      payload.phone || null,
      payload.website || null,
      payload.status || 'ACTIVE',
      payload.notes || null,
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
  const values: Array<unknown> = [];

  const addField = (key: string, value: unknown) => {
    values.push(value);
    fields.push(`${key} = $${values.length}`);
  };

  if (updates.company_name !== undefined) addField('company_name', updates.company_name);
  if (updates.contact_name !== undefined) addField('contact_name', updates.contact_name);
  if (updates.email !== undefined) addField('email', updates.email);
  if (updates.phone !== undefined) addField('phone', updates.phone || null);
  if (updates.website !== undefined) addField('website', updates.website || null);
  if (updates.status !== undefined) addField('status', updates.status);
  if (updates.notes !== undefined) addField('notes', updates.notes || null);

  if (fields.length === 0) {
    return findAdvertiserById(id);
  }

  values.push(id);
  const result = await query<AdvertiserRecord>(
    `UPDATE advertisers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}
