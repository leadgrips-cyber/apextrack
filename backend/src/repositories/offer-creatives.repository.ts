import { query } from "../db/index.js";

export interface OfferCreativeRow {
  id: string;
  offer_id: number;
  name: string;
  creative_type: string;
  file_url: string | null;
  dimensions: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function listCreatives(offerId: number): Promise<OfferCreativeRow[]> {
  const result = await query<OfferCreativeRow>(
    `SELECT id, offer_id, name, creative_type, file_url, dimensions, notes, created_at, updated_at
     FROM offer_creatives WHERE offer_id = $1 ORDER BY created_at ASC`,
    [offerId]
  );
  return result.rows;
}

export async function insertCreative(params: {
  offer_id: number;
  name: string;
  creative_type: string;
  file_url: string | null;
  dimensions: string | null;
  notes: string | null;
}): Promise<OfferCreativeRow> {
  const result = await query<OfferCreativeRow>(
    `INSERT INTO offer_creatives (offer_id, name, creative_type, file_url, dimensions, notes, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW()) RETURNING *`,
    [params.offer_id, params.name, params.creative_type, params.file_url, params.dimensions, params.notes]
  );
  return result.rows[0];
}

export async function updateCreative(
  id: string,
  params: Partial<{ name: string; creative_type: string; file_url: string | null; dimensions: string | null; notes: string | null }>
): Promise<OfferCreativeRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (params.name !== undefined) { values.push(params.name); fields.push(`name = $${values.length}`); }
  if (params.creative_type !== undefined) { values.push(params.creative_type); fields.push(`creative_type = $${values.length}`); }
  if (params.file_url !== undefined) { values.push(params.file_url); fields.push(`file_url = $${values.length}`); }
  if (params.dimensions !== undefined) { values.push(params.dimensions); fields.push(`dimensions = $${values.length}`); }
  if (params.notes !== undefined) { values.push(params.notes); fields.push(`notes = $${values.length}`); }

  if (fields.length === 0) {
    const r = await query<OfferCreativeRow>(
      'SELECT id, offer_id, name, creative_type, file_url, dimensions, notes, created_at, updated_at FROM offer_creatives WHERE id = $1',
      [id]
    );
    return r.rows[0] ?? null;
  }

  values.push(id);
  const result = await query<OfferCreativeRow>(
    `UPDATE offer_creatives SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
    values
  );
  return result.rows[0] ?? null;
}

export async function deleteCreative(id: string): Promise<boolean> {
  const result = await query('DELETE FROM offer_creatives WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
