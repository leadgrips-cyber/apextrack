import { query } from "../db/index.js";

export interface OfferCapsRecord {
  id: string;
  offer_id: number;
  daily_click_cap: number | null;
  hourly_click_cap: number | null;
  daily_conversion_cap: number | null;
  hourly_conversion_cap: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getCaps(offerId: number): Promise<OfferCapsRecord | null> {
  const result = await query<OfferCapsRecord>(
    `SELECT * FROM offer_caps WHERE offer_id = $1 LIMIT 1`,
    [offerId]
  );
  return result.rows[0] ?? null;
}

export async function upsertCaps(
  offerId: number,
  fields: {
    daily_click_cap?: number | null;
    hourly_click_cap?: number | null;
    daily_conversion_cap?: number | null;
    hourly_conversion_cap?: number | null;
    is_active?: boolean;
  }
): Promise<OfferCapsRecord> {
  const result = await query<OfferCapsRecord>(
    `INSERT INTO offer_caps
       (offer_id, daily_click_cap, hourly_click_cap, daily_conversion_cap, hourly_conversion_cap, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
     ON CONFLICT (offer_id) DO UPDATE SET
       daily_click_cap       = EXCLUDED.daily_click_cap,
       hourly_click_cap      = EXCLUDED.hourly_click_cap,
       daily_conversion_cap  = EXCLUDED.daily_conversion_cap,
       hourly_conversion_cap = EXCLUDED.hourly_conversion_cap,
       is_active             = EXCLUDED.is_active,
       updated_at            = NOW()
     RETURNING *`,
    [
      offerId,
      fields.daily_click_cap ?? null,
      fields.hourly_click_cap ?? null,
      fields.daily_conversion_cap ?? null,
      fields.hourly_conversion_cap ?? null,
      fields.is_active ?? true,
    ]
  );
  return result.rows[0];
}

// ── Live counting queries ─────────────────────────────────────────────────────

export async function countClicksToday(offerId: number): Promise<number> {
  const result = await query<{ n: string }>(
    `SELECT COUNT(*) AS n FROM clicks
     WHERE offer_id = $1
       AND created_at >= CURRENT_DATE`,
    [offerId]
  );
  return Number(result.rows[0]?.n ?? 0);
}

export async function countClicksThisHour(offerId: number): Promise<number> {
  const result = await query<{ n: string }>(
    `SELECT COUNT(*) AS n FROM clicks
     WHERE offer_id = $1
       AND created_at >= date_trunc('hour', NOW())`,
    [offerId]
  );
  return Number(result.rows[0]?.n ?? 0);
}

export async function countConversionsToday(offerId: number): Promise<number> {
  const result = await query<{ n: string }>(
    `SELECT COUNT(*) AS n FROM conversions
     WHERE offer_id = $1
       AND conversion_status <> 'REJECTED'
       AND created_at >= CURRENT_DATE`,
    [offerId]
  );
  return Number(result.rows[0]?.n ?? 0);
}

export async function countConversionsThisHour(offerId: number): Promise<number> {
  const result = await query<{ n: string }>(
    `SELECT COUNT(*) AS n FROM conversions
     WHERE offer_id = $1
       AND conversion_status <> 'REJECTED'
       AND created_at >= date_trunc('hour', NOW())`,
    [offerId]
  );
  return Number(result.rows[0]?.n ?? 0);
}
