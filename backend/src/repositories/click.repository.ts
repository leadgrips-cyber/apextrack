import { query } from "../db/index.js";
import { OfferApplicationStatus, OfferRecord, PublisherStatus, ClickRecord } from "../types/click.js";

export async function findOfferById(offerId: number): Promise<OfferRecord | null> {
  const result = await query<OfferRecord>(
    'SELECT id, name, slug, status, requires_publisher_approval, landing_page_url FROM offers WHERE id = $1 LIMIT 1',
    [offerId]
  );
  return result.rows[0] || null;
}

export async function findPublisherById(publisherId: string): Promise<PublisherStatus | null> {
  const result = await query<PublisherStatus>(
    'SELECT id, is_active FROM publishers WHERE id = $1 LIMIT 1',
    [publisherId]
  );
  return result.rows[0] || null;
}

export async function findApprovedOfferApplication(offerId: number, publisherId: string): Promise<OfferApplicationStatus | null> {
  const result = await query<OfferApplicationStatus>(
    'SELECT id, status FROM offer_applications WHERE offer_id = $1 AND publisher_id = $2 AND status = $3 LIMIT 1',
    [offerId, publisherId, 'APPROVED']
  );
  return result.rows[0] || null;
}

export async function saveClick(clickId: string, payload: Partial<ClickRecord>): Promise<ClickRecord> {
  const result = await query<ClickRecord>(
    `INSERT INTO clicks (
       click_id,
       offer_id,
       publisher_id,
       sub1,
       sub2,
       sub3,
       sub4,
       sub5,
       click_ip,
       country_code,
       device_type,
       user_agent,
       referrer,
       redirect_url,
       landing_page_url,
       created_at,
       updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW(),NOW())
     RETURNING *`,
    [
      clickId,
      payload.offer_id,
      payload.publisher_id,
      payload.sub1 || null,
      payload.sub2 || null,
      payload.sub3 || null,
      payload.sub4 || null,
      payload.sub5 || null,
      payload.click_ip,
      payload.country_code || null,
      payload.device_type || null,
      payload.user_agent || null,
      payload.referrer || null,
      payload.redirect_url,
      payload.landing_page_url,
    ]
  );

  return result.rows[0];
}
