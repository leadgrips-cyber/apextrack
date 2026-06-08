import { query } from "../db/index.js";
import {
  PublisherPostbackCreatePayload,
  PublisherPostbackLogRecord,
  PublisherPostbackRecord,
  PublisherPostbackUpdatePayload,
} from "../types/publisherPostback.js";

export async function findPublisherPostbacks(publisherId: string): Promise<PublisherPostbackRecord[]> {
  const result = await query<PublisherPostbackRecord>(
    `SELECT * FROM publisher_postbacks WHERE publisher_id = $1 ORDER BY created_at DESC LIMIT 200`,
    [publisherId]
  );
  return result.rows;
}

export async function findPublisherPostbackById(publisherId: string, id: string): Promise<PublisherPostbackRecord | null> {
  const result = await query<PublisherPostbackRecord>(
    `SELECT * FROM publisher_postbacks WHERE id = $1 AND publisher_id = $2 LIMIT 1`,
    [id, publisherId]
  );
  return result.rows[0] || null;
}

export async function insertPublisherPostback(
  publisherId: string,
  payload: PublisherPostbackCreatePayload
): Promise<PublisherPostbackRecord> {
  const result = await query<PublisherPostbackRecord>(
    `INSERT INTO publisher_postbacks (
       publisher_id,
       offer_id,
       callback_url,
       is_active,
       created_at,
       updated_at
     ) VALUES ($1,$2,$3,$4,NOW(),NOW()) RETURNING *`,
    [publisherId, payload.offer_id || null, payload.callback_url, payload.is_active ?? true]
  );
  return result.rows[0];
}

export async function updatePublisherPostbackById(
  publisherId: string,
  id: string,
  payload: PublisherPostbackUpdatePayload
): Promise<PublisherPostbackRecord | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (payload.offer_id !== undefined) {
    values.push(payload.offer_id);
    fields.push(`offer_id = $${values.length}`);
  }
  if (payload.callback_url !== undefined) {
    values.push(payload.callback_url);
    fields.push(`callback_url = $${values.length}`);
  }
  if (payload.is_active !== undefined) {
    values.push(payload.is_active);
    fields.push(`is_active = $${values.length}`);
  }

  if (fields.length === 0) {
    return findPublisherPostbackById(publisherId, id);
  }

  values.push(id, publisherId);
  const result = await query<PublisherPostbackRecord>(
    `UPDATE publisher_postbacks SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length - 1} AND publisher_id = $${values.length} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deletePublisherPostbackById(publisherId: string, id: string): Promise<boolean> {
  const result = await query(
    `DELETE FROM publisher_postbacks WHERE id = $1 AND publisher_id = $2`,
    [id, publisherId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function findActivePostbacksForConversion(
  offerId: number,
  publisherId: string
): Promise<PublisherPostbackRecord[]> {
  const result = await query<PublisherPostbackRecord>(
    `SELECT * FROM publisher_postbacks
     WHERE publisher_id = $1
       AND is_active = TRUE
       AND (offer_id IS NULL OR offer_id = $2)
     ORDER BY offer_id DESC, created_at DESC`,
    [publisherId, offerId]
  );
  return result.rows;
}

export async function savePublisherPostbackLog(
  payload: Omit<PublisherPostbackLogRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<PublisherPostbackLogRecord> {
  const result = await query<PublisherPostbackLogRecord>(
    `INSERT INTO publisher_postback_logs (
       publisher_postback_id,
       conversion_id,
       click_id,
       offer_id,
       publisher_id,
       request_url,
       response_code,
       response_body,
       status,
       created_at,
       updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW()) RETURNING *`,
    [
      payload.publisher_postback_id,
      payload.conversion_id,
      payload.click_id,
      payload.offer_id,
      payload.publisher_id,
      payload.request_url,
      payload.response_code || null,
      payload.response_body || null,
      payload.status,
    ]
  );
  return result.rows[0];
}
