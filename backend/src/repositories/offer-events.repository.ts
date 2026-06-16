import { query } from "../db/index.js";

export interface OfferEventRow {
  id: string;
  offer_id: number;
  event_token: string;
  event_name: string;
  approval_mode: 'AUTO_APPROVE' | 'MANUAL_REVIEW';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function listEventsByOffer(offerId: number): Promise<OfferEventRow[]> {
  const result = await query<OfferEventRow>(
    `SELECT id, offer_id, event_token, event_name, approval_mode, is_active, created_at, updated_at
     FROM offer_events WHERE offer_id = $1 ORDER BY created_at ASC`,
    [offerId]
  );
  return result.rows;
}

export async function findEventById(id: string): Promise<OfferEventRow | null> {
  const result = await query<OfferEventRow>(
    `SELECT id, offer_id, event_token, event_name, approval_mode, is_active, created_at, updated_at
     FROM offer_events WHERE id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function findActiveEventByToken(offerId: number, eventToken: string): Promise<OfferEventRow | null> {
  const result = await query<OfferEventRow>(
    `SELECT id, offer_id, event_token, event_name, approval_mode, is_active, created_at, updated_at
     FROM offer_events
     WHERE offer_id = $1 AND event_token = $2 AND is_active = TRUE
     LIMIT 1`,
    [offerId, eventToken]
  );
  return result.rows[0] ?? null;
}

export async function insertEvent(params: {
  offer_id: number;
  event_token: string;
  event_name: string;
  approval_mode: 'AUTO_APPROVE' | 'MANUAL_REVIEW';
  is_active: boolean;
}): Promise<OfferEventRow> {
  const result = await query<OfferEventRow>(
    `INSERT INTO offer_events (offer_id, event_token, event_name, approval_mode, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, offer_id, event_token, event_name, approval_mode, is_active, created_at, updated_at`,
    [params.offer_id, params.event_token, params.event_name, params.approval_mode, params.is_active]
  );
  return result.rows[0];
}

export async function updateEvent(
  id: string,
  params: Partial<{
    event_token: string;
    event_name: string;
    approval_mode: 'AUTO_APPROVE' | 'MANUAL_REVIEW';
    is_active: boolean;
  }>
): Promise<OfferEventRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  if (params.event_token !== undefined)   { fields.push(`event_token = $${i++}`);   values.push(params.event_token); }
  if (params.event_name !== undefined)    { fields.push(`event_name = $${i++}`);    values.push(params.event_name); }
  if (params.approval_mode !== undefined) { fields.push(`approval_mode = $${i++}`); values.push(params.approval_mode); }
  if (params.is_active !== undefined)     { fields.push(`is_active = $${i++}`);     values.push(params.is_active); }

  if (fields.length === 0) return findEventById(id);

  values.push(id);
  const result = await query<OfferEventRow>(
    `UPDATE offer_events SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${i}
     RETURNING id, offer_id, event_token, event_name, approval_mode, is_active, created_at, updated_at`,
    values
  );
  return result.rows[0] ?? null;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const result = await query(`DELETE FROM offer_events WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}
