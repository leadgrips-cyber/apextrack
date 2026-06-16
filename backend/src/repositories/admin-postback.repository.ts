import { query } from '../db/index.js';

// ─── Publisher Postbacks (admin-scoped CRUD) ─────────────────────────────────

export interface AdminPostbackRow {
  id: string;
  publisher_id: string;
  publisher_email: string;
  publisher_name: string;
  offer_id: number | null;
  offer_name: string | null;
  callback_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function findAllPostbacksAdmin(params: {
  publisherId?: string;
  offerId?: number;
  page: number;
  pageSize: number;
}): Promise<{ rows: AdminPostbackRow[]; total: number }> {
  const clauses: string[] = [];
  const p: unknown[] = [];

  if (params.publisherId) {
    p.push(params.publisherId);
    clauses.push(`pp.publisher_id = $${p.length}`);
  }
  if (params.offerId !== undefined) {
    p.push(params.offerId);
    clauses.push(`pp.offer_id = $${p.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const countP = [...p];

  p.push(params.pageSize);
  const limitIdx = p.length;
  p.push((params.page - 1) * params.pageSize);
  const offsetIdx = p.length;

  const [rowsResult, countResult] = await Promise.all([
    query<AdminPostbackRow>(
      `SELECT
         pp.id,
         pp.publisher_id,
         pub.email    AS publisher_email,
         pub.full_name AS publisher_name,
         pp.offer_id,
         o.name       AS offer_name,
         pp.callback_url,
         pp.is_active,
         pp.created_at,
         pp.updated_at
       FROM publisher_postbacks pp
       JOIN publishers pub ON pp.publisher_id = pub.id
       LEFT JOIN offers o ON pp.offer_id = o.id
       ${where}
       ORDER BY pp.created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      p
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) FROM publisher_postbacks pp
       JOIN publishers pub ON pp.publisher_id = pub.id
       LEFT JOIN offers o ON pp.offer_id = o.id
       ${where}`,
      countP
    ),
  ]);

  return { rows: rowsResult.rows, total: Number(countResult.rows[0]?.count ?? 0) };
}

export async function findPostbackByIdAdmin(id: string): Promise<AdminPostbackRow | null> {
  const result = await query<AdminPostbackRow>(
    `SELECT
       pp.id,
       pp.publisher_id,
       pub.email    AS publisher_email,
       pub.full_name AS publisher_name,
       pp.offer_id,
       o.name       AS offer_name,
       pp.callback_url,
       pp.is_active,
       pp.created_at,
       pp.updated_at
     FROM publisher_postbacks pp
     JOIN publishers pub ON pp.publisher_id = pub.id
     LEFT JOIN offers o ON pp.offer_id = o.id
     WHERE pp.id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function insertPostbackAdmin(params: {
  publisher_id: string;
  offer_id: number | null;
  callback_url: string;
  is_active: boolean;
}): Promise<AdminPostbackRow> {
  const inserted = await query<{ id: string }>(
    `INSERT INTO publisher_postbacks (publisher_id, offer_id, callback_url, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, NOW(), NOW())
     RETURNING id`,
    [params.publisher_id, params.offer_id, params.callback_url, params.is_active]
  );
  return findPostbackByIdAdmin(inserted.rows[0].id) as Promise<AdminPostbackRow>;
}

export async function updatePostbackAdmin(
  id: string,
  payload: { offer_id?: number | null; callback_url?: string; is_active?: boolean }
): Promise<AdminPostbackRow | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if ('offer_id' in payload) {
    values.push(payload.offer_id ?? null);
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

  if (fields.length > 0) {
    values.push(id);
    await query(
      `UPDATE publisher_postbacks SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length}`,
      values
    );
  }

  return findPostbackByIdAdmin(id);
}

export async function deletePostbackAdmin(id: string): Promise<boolean> {
  const result = await query(`DELETE FROM publisher_postbacks WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}

// ─── Postback test helper ────────────────────────────────────────────────────

export async function findPostbackForTest(id: string): Promise<{
  callback_url: string;
  publisher_id: string;
  offer_id: number | null;
} | null> {
  const result = await query<{ callback_url: string; publisher_id: string; offer_id: number | null }>(
    `SELECT callback_url, publisher_id, offer_id FROM publisher_postbacks WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

// ─── Advertiser Postback Logs (inbound — from conversions.s2s_payload) ───────

export interface AdvertiserPostbackLogRow {
  id: string;
  click_id: string;
  transaction_id: string;
  conversion_status: string;
  offer_name: string;
  publisher_email: string;
  publisher_name: string;
  revenue_amount: string;
  payout_amount: string;
  s2s_payload: Record<string, unknown> | null;
  event_timestamp: string;
  created_at: string;
}

export async function findAdvertiserPostbackLogs(params: {
  page: number;
  pageSize: number;
  offerId?: number;
  publisherId?: string;
}): Promise<{ rows: AdvertiserPostbackLogRow[]; total: number }> {
  const clauses: string[] = ['c.s2s_payload IS NOT NULL'];
  const p: unknown[] = [];

  if (params.offerId) {
    p.push(params.offerId);
    clauses.push(`c.offer_id = $${p.length}`);
  }
  if (params.publisherId) {
    p.push(params.publisherId);
    clauses.push(`c.publisher_id = $${p.length}`);
  }

  const where = `WHERE ${clauses.join(' AND ')}`;
  const countP = [...p];

  p.push(params.pageSize);
  const limitIdx = p.length;
  p.push((params.page - 1) * params.pageSize);
  const offsetIdx = p.length;

  const [rowsResult, countResult] = await Promise.all([
    query<AdvertiserPostbackLogRow>(
      `SELECT
         c.id,
         c.click_id::TEXT,
         COALESCE(c.external_reference, '') AS transaction_id,
         c.conversion_status,
         o.name            AS offer_name,
         pub.email         AS publisher_email,
         pub.full_name     AS publisher_name,
         c.revenue_amount::TEXT,
         c.payout_amount::TEXT,
         c.s2s_payload,
         c.event_timestamp,
         c.created_at
       FROM conversions c
       JOIN offers o ON c.offer_id = o.id
       JOIN publishers pub ON c.publisher_id = pub.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      p
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) FROM conversions c
       JOIN offers o ON c.offer_id = o.id
       JOIN publishers pub ON c.publisher_id = pub.id
       ${where}`,
      countP
    ),
  ]);

  return { rows: rowsResult.rows, total: Number(countResult.rows[0]?.count ?? 0) };
}

// ─── Affiliate Postback Logs (outbound — from postbacks queue) ───────────────

export interface AffiliatePostbackLogRow {
  id: string;
  conversion_id: string;
  publisher_email: string;
  publisher_name: string;
  offer_name: string;
  destination_url: string;
  status: string;
  last_response_code: number | null;
  last_response_body: string | null;
  attempt_count: number;
  last_attempt_at: string | null;
  created_at: string;
}

export async function findAffiliatePostbackLogs(params: {
  page: number;
  pageSize: number;
  offerId?: number;
  publisherId?: string;
  status?: string;
}): Promise<{ rows: AffiliatePostbackLogRow[]; total: number }> {
  const clauses: string[] = [];
  const p: unknown[] = [];

  if (params.offerId) {
    p.push(params.offerId);
    clauses.push(`pb.offer_id = $${p.length}`);
  }
  if (params.publisherId) {
    p.push(params.publisherId);
    clauses.push(`pb.publisher_id = $${p.length}`);
  }
  if (params.status) {
    p.push(params.status.toUpperCase());
    clauses.push(`pb.status::TEXT = $${p.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const countP = [...p];

  p.push(params.pageSize);
  const limitIdx = p.length;
  p.push((params.page - 1) * params.pageSize);
  const offsetIdx = p.length;

  const [rowsResult, countResult] = await Promise.all([
    query<AffiliatePostbackLogRow>(
      `SELECT
         pb.id,
         pb.conversion_id::TEXT,
         pub.email         AS publisher_email,
         pub.full_name     AS publisher_name,
         o.name            AS offer_name,
         pb.destination_url,
         pb.status::TEXT,
         pb.last_response_code,
         pb.last_response_body,
         pb.attempt_count,
         pb.last_attempt_at,
         pb.created_at
       FROM postbacks pb
       JOIN offers o ON pb.offer_id = o.id
       JOIN publishers pub ON pb.publisher_id = pub.id
       ${where}
       ORDER BY pb.created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      p
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) FROM postbacks pb
       JOIN offers o ON pb.offer_id = o.id
       JOIN publishers pub ON pb.publisher_id = pub.id
       ${where}`,
      countP
    ),
  ]);

  return { rows: rowsResult.rows, total: Number(countResult.rows[0]?.count ?? 0) };
}
