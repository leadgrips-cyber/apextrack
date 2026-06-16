import { query } from "../db/index.js";
import { ApplicationCreatePayload, ApplicationFilterParams, ApplicationReviewPayload, OfferApplicationRecord } from "../types/application.js";

export async function findApplicationById(applicationId: string): Promise<OfferApplicationRecord | null> {
  const result = await query<OfferApplicationRecord>(
    'SELECT * FROM offer_applications WHERE id = $1 LIMIT 1',
    [applicationId]
  );
  return result.rows[0] || null;
}

export async function findApplicationByOfferAndPublisher(offerId: number, publisherId: string): Promise<OfferApplicationRecord | null> {
  const result = await query<OfferApplicationRecord>(
    'SELECT * FROM offer_applications WHERE offer_id = $1 AND publisher_id = $2 LIMIT 1',
    [offerId, publisherId]
  );
  return result.rows[0] || null;
}

export async function insertApplication(publisherId: string, payload: ApplicationCreatePayload): Promise<OfferApplicationRecord> {
  const result = await query<OfferApplicationRecord>(
    `INSERT INTO offer_applications (
       offer_id,
       publisher_id,
       status,
       comments,
       submission_data,
       created_at,
       updated_at
     ) VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) RETURNING *`,
    [payload.offer_id, publisherId, 'PENDING', payload.comments || null, payload.submission_data || null]
  );
  return result.rows[0];
}

export async function findApplications(filters: ApplicationFilterParams = {}): Promise<OfferApplicationRecord[]> {
  const clauses: string[] = [];
  const values: Array<unknown> = [];

  if (filters.status) {
    values.push(filters.status);
    clauses.push(`oa.status = $${values.length}`);
  }

  if (filters.offer_id !== undefined) {
    values.push(filters.offer_id);
    clauses.push(`oa.offer_id = $${values.length}`);
  }

  if (filters.publisher_id) {
    values.push(filters.publisher_id);
    clauses.push(`oa.publisher_id = $${values.length}`);
  }

  if (filters.search) {
    const term = `%${filters.search}%`;
    const n1 = values.length + 1;
    const n2 = values.length + 2;
    const n3 = values.length + 3;
    values.push(term, term, term);
    clauses.push(`(o.name ILIKE $${n1} OR p.full_name ILIKE $${n2} OR p.company_name ILIKE $${n3})`);
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';

  const result = await query<OfferApplicationRecord>(
    `SELECT
       oa.id,
       oa.offer_id,
       oa.publisher_id,
       oa.status,
       oa.requested_at,
       oa.reviewed_at,
       oa.reviewed_by_admin_id,
       oa.rejection_reason,
       oa.comments,
       oa.submission_data,
       oa.created_at,
       oa.updated_at,
       o.name        AS offer_name,
       o.offer_logo_url AS offer_logo_url,
       p.full_name   AS publisher_full_name,
       p.company_name AS publisher_company_name
     FROM offer_applications oa
     LEFT JOIN offers     o ON o.id = oa.offer_id
     LEFT JOIN publishers p ON p.id = oa.publisher_id
     ${whereClause}
     ORDER BY oa.requested_at DESC
     LIMIT 500`,
    values
  );
  return result.rows;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string,
  adminId: string,
  reviewPayload: ApplicationReviewPayload = {}
): Promise<OfferApplicationRecord | null> {
  const result = await query<OfferApplicationRecord>(
    `UPDATE offer_applications
       SET status = $1,
           reviewed_at = NOW(),
           reviewed_by_admin_id = $2,
           rejection_reason = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
    [status, adminId, reviewPayload.rejection_reason || null, applicationId]
  );
  return result.rows[0] || null;
}
