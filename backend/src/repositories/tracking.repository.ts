import { query } from "../db/index.js";
import { TrackingLinkCreatePayload, TrackingLinkRecord } from "../types/tracking.js";

export async function findApprovedOfferApplication(offerId: number, publisherId: string) {
  const result = await query<{ id: string }>(
    `SELECT id FROM offer_applications
     WHERE offer_id = $1
       AND publisher_id = $2
       AND status = 'APPROVED'
     LIMIT 1`,
    [offerId, publisherId]
  );
  return result.rows[0] || null;
}

export async function insertTrackingLink(publisherId: string, payload: TrackingLinkCreatePayload, trackingUrl: string): Promise<TrackingLinkRecord> {
  const result = await query<TrackingLinkRecord>(
    `INSERT INTO tracking_links (
       publisher_id,
       offer_id,
       sub1,
       sub2,
       sub3,
       sub4,
       sub5,
       tracking_url,
       created_at,
       updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW(),NOW()) RETURNING *`,
    [
      publisherId,
      payload.offer_id,
      payload.sub1 || null,
      payload.sub2 || null,
      payload.sub3 || null,
      payload.sub4 || null,
      payload.sub5 || null,
      trackingUrl,
    ]
  );
  return result.rows[0];
}

export async function findExistingTrackingLink(
  publisherId: string,
  payload: TrackingLinkCreatePayload
): Promise<TrackingLinkRecord | null> {
  const result = await query<TrackingLinkRecord>(
    `SELECT * FROM tracking_links
     WHERE publisher_id = $1
       AND offer_id = $2
       AND COALESCE(sub1, '') = COALESCE($3, '')
       AND COALESCE(sub2, '') = COALESCE($4, '')
       AND COALESCE(sub3, '') = COALESCE($5, '')
       AND COALESCE(sub4, '') = COALESCE($6, '')
       AND COALESCE(sub5, '') = COALESCE($7, '')
     LIMIT 1`,
    [
      publisherId,
      payload.offer_id,
      payload.sub1 || null,
      payload.sub2 || null,
      payload.sub3 || null,
      payload.sub4 || null,
      payload.sub5 || null,
    ]
  );
  return result.rows[0] || null;
}

export async function upsertTrackingLink(
  publisherId: string,
  payload: TrackingLinkCreatePayload,
  trackingUrl: string
): Promise<TrackingLinkRecord> {
  const existing = await findExistingTrackingLink(publisherId, payload);
  if (existing) return existing;

  try {
    return await insertTrackingLink(publisherId, payload, trackingUrl);
  } catch (err: any) {
    if (err.code === '23505') {
      const race = await findExistingTrackingLink(publisherId, payload);
      if (race) return race;
    }
    throw err;
  }
}

export async function findTrackingLinksByPublisher(publisherId: string): Promise<TrackingLinkRecord[]> {
  const result = await query<TrackingLinkRecord>(
    `SELECT * FROM tracking_links WHERE publisher_id = $1 ORDER BY created_at DESC LIMIT 200`,
    [publisherId]
  );
  return result.rows;
}

export async function findTrackingLinkByIdForPublisher(id: string, publisherId: string): Promise<TrackingLinkRecord | null> {
  const result = await query<TrackingLinkRecord>(
    `SELECT * FROM tracking_links WHERE id = $1 AND publisher_id = $2 LIMIT 1`,
    [id, publisherId]
  );
  return result.rows[0] || null;
}
