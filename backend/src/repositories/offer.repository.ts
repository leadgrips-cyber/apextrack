import { query } from "../db/index.js";
import { OfferCreatePayload, OfferFilterParams, OfferRecord, OfferUpdatePayload } from "../types/offer.js";

export async function findOfferById(offerId: number): Promise<OfferRecord | null> {
  const result = await query<OfferRecord>(
    'SELECT * FROM offers WHERE id = $1 LIMIT 1',
    [offerId]
  );
  return result.rows[0] || null;
}

export async function findOffers(filters: OfferFilterParams = {}): Promise<OfferRecord[]> {
  const clauses: string[] = [];
  const values: Array<string | boolean> = [];

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`status = $${values.length}`);
  }

  if (filters.category) {
    values.push(filters.category);
    clauses.push(`category ILIKE $${values.length}`);
  }

  if (filters.geo) {
    values.push(filters.geo.toUpperCase());
    clauses.push(`target_geos @> ARRAY[$${values.length}]::TEXT[]`);
  }

  if (filters.device) {
    values.push(filters.device.toLowerCase());
    clauses.push(`target_devices @> ARRAY[$${values.length}]::TEXT[]`);
  }

  if (typeof filters.requires_publisher_approval === 'boolean') {
    values.push(filters.requires_publisher_approval);
    clauses.push(`requires_publisher_approval = $${values.length}`);
  }

  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    values.push(searchTerm, searchTerm, searchTerm, searchTerm);
    clauses.push(`(name ILIKE $${values.length - 3} OR category ILIKE $${values.length - 2} OR slug ILIKE $${values.length - 1} OR landing_page_url ILIKE $${values.length})`);
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const result = await query<OfferRecord>(
    `SELECT * FROM offers ${whereClause} ORDER BY created_at DESC LIMIT 200`,
    values
  );

  return result.rows;
}

export async function insertOffer(payload: OfferCreatePayload & { created_by_admin_id: string | null }): Promise<OfferRecord> {
  const result = await query<OfferRecord>(
    `INSERT INTO offers (
       name,
       slug,
       category,
       status,
       requires_publisher_approval,
       payout_type,
       payout_amount,
       currency,
       target_geos,
       target_devices,
       landing_page_url,
       preview_url,
       terms,
       caps,
       traffic_rules,
       default_affiliate_commission,
       tracking_protocol,
       admin_notes,
       created_by_admin_id,
       created_at,
       updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,NOW(),NOW())
     RETURNING *`,
    [
      payload.name,
      payload.slug,
      payload.category,
      payload.status || 'DRAFT',
      payload.requires_publisher_approval ?? false,
      payload.payout_type,
      payload.payout_amount,
      payload.currency || 'USD',
      payload.target_geos || [],
      payload.target_devices || [],
      payload.landing_page_url,
      payload.preview_url || null,
      payload.terms || null,
      payload.caps || null,
      payload.traffic_rules || null,
      payload.default_affiliate_commission ?? 0,
      payload.tracking_protocol || 'S2S',
      payload.admin_notes || null,
      payload.created_by_admin_id,
    ]
  );
  return result.rows[0];
}

export async function updateOfferById(offerId: number, updates: OfferUpdatePayload): Promise<OfferRecord | null> {
  const fields: string[] = [];
  const values: Array<unknown> = [];

  const addField = (key: string, value: unknown) => {
    values.push(value);
    fields.push(`${key} = $${values.length}`);
  };

  if (updates.name !== undefined) addField('name', updates.name);
  if (updates.slug !== undefined) addField('slug', updates.slug);
  if (updates.category !== undefined) addField('category', updates.category);
  if (updates.status !== undefined) addField('status', updates.status);
  if (updates.requires_publisher_approval !== undefined) addField('requires_publisher_approval', updates.requires_publisher_approval);
  if (updates.payout_type !== undefined) addField('payout_type', updates.payout_type);
  if (updates.payout_amount !== undefined) addField('payout_amount', updates.payout_amount);
  if (updates.currency !== undefined) addField('currency', updates.currency);
  if (updates.target_geos !== undefined) addField('target_geos', updates.target_geos);
  if (updates.target_devices !== undefined) addField('target_devices', updates.target_devices);
  if (updates.landing_page_url !== undefined) addField('landing_page_url', updates.landing_page_url);
  if (updates.preview_url !== undefined) addField('preview_url', updates.preview_url);
  if (updates.terms !== undefined) addField('terms', updates.terms);
  if (updates.caps !== undefined) addField('caps', updates.caps);
  if (updates.traffic_rules !== undefined) addField('traffic_rules', updates.traffic_rules);
  if (updates.default_affiliate_commission !== undefined) addField('default_affiliate_commission', updates.default_affiliate_commission);
  if (updates.tracking_protocol !== undefined) addField('tracking_protocol', updates.tracking_protocol);
  if (updates.admin_notes !== undefined) addField('admin_notes', updates.admin_notes);

  if (fields.length === 0) {
    return findOfferById(offerId);
  }

  values.push(offerId);
  const result = await query<OfferRecord>(
    `UPDATE offers SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

export async function updateOfferStatus(offerId: number, status: string): Promise<OfferRecord | null> {
  const result = await query<OfferRecord>(
    `UPDATE offers SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, offerId]
  );
  return result.rows[0] || null;
}

export async function archiveOfferById(offerId: number): Promise<OfferRecord | null> {
  return updateOfferStatus(offerId, 'ARCHIVED');
}
