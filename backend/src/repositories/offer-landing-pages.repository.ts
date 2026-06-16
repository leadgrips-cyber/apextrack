import { query } from "../db/index.js";

export interface OfferLandingPageRow {
  id: string;
  offer_id: number;
  name: string;
  url: string;
  preview_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function listLandingPages(offerId: number): Promise<OfferLandingPageRow[]> {
  const result = await query<OfferLandingPageRow>(
    `SELECT id, offer_id, name, url, preview_url, is_active, created_at, updated_at
     FROM offer_landing_pages WHERE offer_id = $1 ORDER BY created_at ASC`,
    [offerId]
  );
  return result.rows;
}

export async function insertLandingPage(params: {
  offer_id: number;
  name: string;
  url: string;
  preview_url: string | null;
  is_active: boolean;
}): Promise<OfferLandingPageRow> {
  const result = await query<OfferLandingPageRow>(
    `INSERT INTO offer_landing_pages (offer_id, name, url, preview_url, is_active, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) RETURNING *`,
    [params.offer_id, params.name, params.url, params.preview_url, params.is_active]
  );
  return result.rows[0];
}

export async function updateLandingPage(
  id: string,
  params: Partial<{ name: string; url: string; preview_url: string | null; is_active: boolean }>
): Promise<OfferLandingPageRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (params.name !== undefined) { values.push(params.name); fields.push(`name = $${values.length}`); }
  if (params.url !== undefined) { values.push(params.url); fields.push(`url = $${values.length}`); }
  if (params.preview_url !== undefined) { values.push(params.preview_url); fields.push(`preview_url = $${values.length}`); }
  if (params.is_active !== undefined) { values.push(params.is_active); fields.push(`is_active = $${values.length}`); }

  if (fields.length === 0) {
    const r = await query<OfferLandingPageRow>(
      'SELECT id, offer_id, name, url, preview_url, is_active, created_at, updated_at FROM offer_landing_pages WHERE id = $1',
      [id]
    );
    return r.rows[0] ?? null;
  }

  values.push(id);
  const result = await query<OfferLandingPageRow>(
    `UPDATE offer_landing_pages SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
    values
  );
  return result.rows[0] ?? null;
}

export async function deleteLandingPage(id: string): Promise<boolean> {
  const result = await query('DELETE FROM offer_landing_pages WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
