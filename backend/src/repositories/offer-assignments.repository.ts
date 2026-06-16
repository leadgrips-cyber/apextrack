import { query } from "../db/index.js";

export interface PublisherWithAssignmentRow {
  id: string;
  full_name: string;
  company_name: string | null;
  email: string;
  affiliate_code: string;
  account_status: string;
  is_assigned: boolean;
  assigned_at: string | null;
}

export async function listPublishersWithAssignmentStatus(
  offerId: number,
  search?: string
): Promise<PublisherWithAssignmentRow[]> {
  const values: unknown[] = [offerId];
  const clauses: string[] = ["p.account_status = 'ACTIVE'"];

  if (search?.trim()) {
    const term = `%${search.trim().toLowerCase()}%`;
    values.push(term);
    const n = values.length;
    clauses.push(
      `(LOWER(p.full_name) LIKE $${n} OR LOWER(p.email) LIKE $${n} OR LOWER(p.affiliate_code) LIKE $${n} OR LOWER(COALESCE(p.company_name,'')) LIKE $${n})`
    );
  }

  const where = `WHERE ${clauses.join(' AND ')}`;

  const result = await query<PublisherWithAssignmentRow>(
    `SELECT
       p.id,
       p.full_name,
       p.company_name,
       p.email,
       p.affiliate_code,
       p.account_status,
       (opa.publisher_id IS NOT NULL) AS is_assigned,
       opa.assigned_at
     FROM publishers p
     LEFT JOIN offer_publisher_assignments opa
       ON opa.publisher_id = p.id AND opa.offer_id = $1
     ${where}
     ORDER BY is_assigned DESC, LOWER(p.full_name) ASC
     LIMIT 1000`,
    values
  );

  return result.rows;
}

export async function assignPublisher(
  offerId: number,
  publisherId: string,
  adminId: string
): Promise<void> {
  await query(
    `INSERT INTO offer_publisher_assignments (offer_id, publisher_id, assigned_by_admin_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (offer_id, publisher_id) DO NOTHING`,
    [offerId, publisherId, adminId]
  );
}

export async function unassignPublisher(
  offerId: number,
  publisherId: string
): Promise<void> {
  await query(
    `DELETE FROM offer_publisher_assignments WHERE offer_id = $1 AND publisher_id = $2`,
    [offerId, publisherId]
  );
}

export async function bulkAssignPublishers(
  offerId: number,
  publisherIds: string[],
  adminId: string
): Promise<void> {
  if (publisherIds.length === 0) return;
  await query(
    `INSERT INTO offer_publisher_assignments (offer_id, publisher_id, assigned_by_admin_id)
     SELECT $1, unnest($2::UUID[]), $3
     ON CONFLICT (offer_id, publisher_id) DO NOTHING`,
    [offerId, publisherIds, adminId]
  );
}

export async function bulkUnassignPublishers(
  offerId: number,
  publisherIds: string[]
): Promise<void> {
  if (publisherIds.length === 0) return;
  await query(
    `DELETE FROM offer_publisher_assignments
     WHERE offer_id = $1 AND publisher_id = ANY($2::UUID[])`,
    [offerId, publisherIds]
  );
}

export async function countAssignedPublishers(offerId: number): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM offer_publisher_assignments WHERE offer_id = $1`,
    [offerId]
  );
  return Number(result.rows[0]?.count ?? 0);
}
