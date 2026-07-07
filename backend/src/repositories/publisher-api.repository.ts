import { query } from "../db/index.js";

// Small, self-contained read queries backing the external Publisher API's
// authorization checks. Deliberately independent of the tracking/application
// modules so this file can be added without touching their logic.

export async function hasApprovedApplication(offerId: number, publisherId: string): Promise<boolean> {
  const result = await query<{ id: string }>(
    `SELECT id FROM offer_applications WHERE offer_id = $1 AND publisher_id = $2 AND status = 'APPROVED' LIMIT 1`,
    [offerId, publisherId]
  );
  return result.rows.length > 0;
}

export interface ApprovedOfferRow {
  id: number;
  name: string;
  slug: string;
  category: string;
  payout_type: string;
  payout_amount: string;
  currency: string;
  target_geos: string[];
  target_devices: string[];
  landing_page_url: string;
  preview_url: string | null;
  offer_logo_url: string | null;
  approved_at: string | null;
}

export async function listApprovedOffers(publisherId: string): Promise<ApprovedOfferRow[]> {
  const result = await query<ApprovedOfferRow>(
    `SELECT o.id, o.name, o.slug, o.category, o.payout_type, o.payout_amount, o.currency,
            o.target_geos, o.target_devices, o.landing_page_url, o.preview_url, o.offer_logo_url,
            oa.reviewed_at AS approved_at
     FROM offer_applications oa
     JOIN offers o ON o.id = oa.offer_id
     WHERE oa.publisher_id = $1 AND oa.status = 'APPROVED' AND o.status = 'ACTIVE'
     ORDER BY oa.reviewed_at DESC`,
    [publisherId]
  );
  return result.rows;
}
