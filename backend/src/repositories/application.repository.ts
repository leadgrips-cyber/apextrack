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
    clauses.push(`status = $${values.length}`);
  }

  if (filters.offer_id !== undefined) {
    values.push(filters.offer_id);
    clauses.push(`offer_id = $${values.length}`);
  }

  if (filters.publisher_id) {
    values.push(filters.publisher_id);
    clauses.push(`publisher_id = $${values.length}`);
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  const result = await query<OfferApplicationRecord>(
    `SELECT * FROM offer_applications ${whereClause} ORDER BY requested_at DESC LIMIT 200`,
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
