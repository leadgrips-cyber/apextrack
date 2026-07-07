import { query } from "../db/index.js";

// Read-only reporting queries for the external Publisher API.
// These are intentionally separate from publisher-analytics.repository.ts
// (the internal dashboard's data source) so this module can be added,
// tested, and reasoned about without touching any existing tracking,
// conversion, or dashboard-reporting code path.

const SETTLED_STATUSES = `('APPROVED', 'PAID')`;
const VISIBLE_STATUSES = `<> 'REJECTED'`; // publishers should see every conversion attempt except ones explicitly rejected as fraud/invalid

export interface ReportRange {
  from?: string;
  to?: string;
  offerId?: number;
}

function dateClauses(column: string, range: ReportRange, values: unknown[]): string[] {
  const clauses: string[] = [];
  if (range.from) {
    values.push(range.from);
    clauses.push(`${column} >= $${values.length}`);
  }
  if (range.to) {
    values.push(range.to);
    clauses.push(`${column} <= $${values.length}`);
  }
  return clauses;
}

export interface ClickReportRow {
  click_id: string;
  offer_id: number;
  offer_name: string;
  sub1: string | null;
  sub2: string | null;
  sub3: string | null;
  sub4: string | null;
  sub5: string | null;
  country_code: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  created_at: string;
}

export async function getClickReport(
  publisherId: string,
  range: ReportRange,
  page: number,
  pageSize: number
): Promise<{ rows: ClickReportRow[]; total: number }> {
  const values: unknown[] = [publisherId];
  const clauses = ['cl.publisher_id = $1', ...dateClauses('cl.created_at', range, values)];
  if (range.offerId) {
    values.push(range.offerId);
    clauses.push(`cl.offer_id = $${values.length}`);
  }
  const where = `WHERE ${clauses.join(' AND ')}`;

  const totalResult = await query<{ count: string }>(
    `SELECT COUNT(*) FROM clicks cl ${where}`,
    values
  );

  const limitValues = [...values, pageSize, (page - 1) * pageSize];
  const rowsResult = await query<ClickReportRow>(
    `SELECT cl.click_id, cl.offer_id, o.name AS offer_name, cl.sub1, cl.sub2, cl.sub3, cl.sub4, cl.sub5,
            cl.country_code, cl.device_type, cl.browser, cl.os, cl.referrer, cl.created_at
     FROM clicks cl
     JOIN offers o ON o.id = cl.offer_id
     ${where}
     ORDER BY cl.created_at DESC
     LIMIT $${limitValues.length - 1} OFFSET $${limitValues.length}`,
    limitValues
  );

  return { rows: rowsResult.rows, total: Number(totalResult.rows[0]?.count ?? 0) };
}

export interface ConversionReportRow {
  id: string;
  click_id: string;
  offer_id: number;
  offer_name: string;
  event_token: string | null;
  event_name: string | null;
  conversion_status: string;
  payout_amount: string;
  revenue_amount: string;
  currency: string;
  event_timestamp: string;
}

export async function getConversionReport(
  publisherId: string,
  range: ReportRange,
  status: string | undefined,
  page: number,
  pageSize: number
): Promise<{ rows: ConversionReportRow[]; total: number }> {
  const values: unknown[] = [publisherId];
  const clauses = ['c.publisher_id = $1', ...dateClauses('c.event_timestamp', range, values)];
  if (range.offerId) {
    values.push(range.offerId);
    clauses.push(`c.offer_id = $${values.length}`);
  }
  if (status) {
    values.push(status);
    clauses.push(`c.conversion_status = $${values.length}`);
  }
  const where = `WHERE ${clauses.join(' AND ')}`;

  const totalResult = await query<{ count: string }>(
    `SELECT COUNT(*) FROM conversions c ${where}`,
    values
  );

  const limitValues = [...values, pageSize, (page - 1) * pageSize];
  const rowsResult = await query<ConversionReportRow>(
    `SELECT c.id, c.click_id, c.offer_id, o.name AS offer_name,
            oe.event_token, oe.event_name,
            c.conversion_status, c.payout_amount, c.revenue_amount, c.currency, c.event_timestamp
     FROM conversions c
     JOIN offers o ON o.id = c.offer_id
     LEFT JOIN offer_events oe ON oe.id = c.offer_event_id
     ${where}
     ORDER BY c.event_timestamp DESC
     LIMIT $${limitValues.length - 1} OFFSET $${limitValues.length}`,
    limitValues
  );

  return { rows: rowsResult.rows, total: Number(totalResult.rows[0]?.count ?? 0) };
}

export interface DailyReportRow {
  day: string;
  clicks: number;
  conversions: number;
  approved_conversions: number;
  payout: string;
  revenue: string;
  epc: string;
  cr: string;
}

export async function getDailyReport(publisherId: string, range: ReportRange): Promise<DailyReportRow[]> {
  const clickValues: unknown[] = [publisherId];
  const clickClauses = ['publisher_id = $1', ...dateClauses('created_at', range, clickValues)];
  const clicksByDay = await query<{ day: string; clicks: string }>(
    `SELECT to_char(created_at, 'YYYY-MM-DD') AS day, COUNT(*) AS clicks
     FROM clicks WHERE ${clickClauses.join(' AND ')}
     GROUP BY 1 ORDER BY 1`,
    clickValues
  );

  const convValues: unknown[] = [publisherId];
  const convClauses = ['publisher_id = $1', ...dateClauses('event_timestamp', range, convValues)];
  const convByDay = await query<{ day: string; conversions: string; approved_conversions: string; payout: string; revenue: string }>(
    `SELECT to_char(event_timestamp, 'YYYY-MM-DD') AS day,
            COUNT(*) FILTER (WHERE conversion_status ${VISIBLE_STATUSES}) AS conversions,
            COUNT(*) FILTER (WHERE conversion_status IN ${SETTLED_STATUSES}) AS approved_conversions,
            COALESCE(SUM(payout_amount) FILTER (WHERE conversion_status IN ${SETTLED_STATUSES}), 0) AS payout,
            COALESCE(SUM(revenue_amount) FILTER (WHERE conversion_status IN ${SETTLED_STATUSES}), 0) AS revenue
     FROM conversions WHERE ${convClauses.join(' AND ')}
     GROUP BY 1 ORDER BY 1`,
    convValues
  );

  const byDay = new Map<string, DailyReportRow>();
  for (const row of clicksByDay.rows) {
    byDay.set(row.day, {
      day: row.day,
      clicks: Number(row.clicks),
      conversions: 0,
      approved_conversions: 0,
      payout: '0.00',
      revenue: '0.00',
      epc: '0.0000',
      cr: '0.00',
    });
  }
  for (const row of convByDay.rows) {
    const existing = byDay.get(row.day) ?? {
      day: row.day, clicks: 0, conversions: 0, approved_conversions: 0, payout: '0.00', revenue: '0.00', epc: '0.0000', cr: '0.00',
    };
    existing.conversions = Number(row.conversions);
    existing.approved_conversions = Number(row.approved_conversions);
    existing.payout = Number(row.payout).toFixed(2);
    existing.revenue = Number(row.revenue).toFixed(2);
    byDay.set(row.day, existing);
  }

  const days = Array.from(byDay.values()).sort((a, b) => a.day.localeCompare(b.day));
  for (const d of days) {
    d.epc = d.clicks > 0 ? (Number(d.payout) / d.clicks).toFixed(4) : '0.0000';
    d.cr = d.clicks > 0 ? ((d.approved_conversions / d.clicks) * 100).toFixed(2) : '0.00';
  }
  return days;
}

export interface EventReportRow {
  offer_id: number;
  offer_name: string;
  event_token: string | null;
  event_name: string | null;
  conversions: number;
  approved_conversions: number;
  payout: string;
  revenue: string;
}

export async function getEventReport(publisherId: string, range: ReportRange): Promise<EventReportRow[]> {
  const values: unknown[] = [publisherId];
  const clauses = ['c.publisher_id = $1', ...dateClauses('c.event_timestamp', range, values)];
  const where = `WHERE ${clauses.join(' AND ')}`;

  const result = await query<{
    offer_id: number; offer_name: string; event_token: string | null; event_name: string | null;
    conversions: string; approved_conversions: string; payout: string; revenue: string;
  }>(
    `SELECT c.offer_id, o.name AS offer_name, oe.event_token, oe.event_name,
            COUNT(*) FILTER (WHERE c.conversion_status ${VISIBLE_STATUSES}) AS conversions,
            COUNT(*) FILTER (WHERE c.conversion_status IN ${SETTLED_STATUSES}) AS approved_conversions,
            COALESCE(SUM(c.payout_amount) FILTER (WHERE c.conversion_status IN ${SETTLED_STATUSES}), 0) AS payout,
            COALESCE(SUM(c.revenue_amount) FILTER (WHERE c.conversion_status IN ${SETTLED_STATUSES}), 0) AS revenue
     FROM conversions c
     JOIN offers o ON o.id = c.offer_id
     LEFT JOIN offer_events oe ON oe.id = c.offer_event_id
     ${where}
     GROUP BY c.offer_id, o.name, oe.event_token, oe.event_name
     ORDER BY o.name, oe.event_name NULLS FIRST`,
    values
  );

  return result.rows.map((r) => ({
    offer_id: r.offer_id,
    offer_name: r.offer_name,
    event_token: r.event_token,
    event_name: r.event_name,
    conversions: Number(r.conversions),
    approved_conversions: Number(r.approved_conversions),
    payout: Number(r.payout).toFixed(2),
    revenue: Number(r.revenue).toFixed(2),
  }));
}

export interface SummaryReport {
  total_clicks: number;
  total_conversions: number;
  approved_conversions: number;
  total_payout: string;
  total_revenue: string;
  epc: string;
  cr: string;
  rpc: string;
  wallet: {
    available_balance: string;
    pending_balance: string;
    withdrawn_balance: string;
    hold_balance: string;
    currency: string;
  } | null;
}

export async function getSummaryReport(publisherId: string, range: ReportRange): Promise<SummaryReport> {
  const clickValues: unknown[] = [publisherId];
  const clickClauses = ['publisher_id = $1', ...dateClauses('created_at', range, clickValues)];
  const clicksResult = await query<{ count: string }>(
    `SELECT COUNT(*) FROM clicks WHERE ${clickClauses.join(' AND ')}`,
    clickValues
  );
  const totalClicks = Number(clicksResult.rows[0]?.count ?? 0);

  const convValues: unknown[] = [publisherId];
  const convClauses = ['publisher_id = $1', ...dateClauses('event_timestamp', range, convValues)];
  const convResult = await query<{ conversions: string; approved_conversions: string; payout: string; revenue: string }>(
    `SELECT
       COUNT(*) FILTER (WHERE conversion_status ${VISIBLE_STATUSES}) AS conversions,
       COUNT(*) FILTER (WHERE conversion_status IN ${SETTLED_STATUSES}) AS approved_conversions,
       COALESCE(SUM(payout_amount) FILTER (WHERE conversion_status IN ${SETTLED_STATUSES}), 0) AS payout,
       COALESCE(SUM(revenue_amount) FILTER (WHERE conversion_status IN ${SETTLED_STATUSES}), 0) AS revenue
     FROM conversions WHERE ${convClauses.join(' AND ')}`,
    convValues
  );
  const conv = convResult.rows[0];
  const totalPayout = Number(conv?.payout ?? 0);
  const totalRevenue = Number(conv?.revenue ?? 0);
  const approvedConversions = Number(conv?.approved_conversions ?? 0);

  const walletResult = await query<{ available_balance: string; pending_balance: string; withdrawn_balance: string; hold_balance: string; currency: string }>(
    `SELECT available_balance, pending_balance, withdrawn_balance, hold_balance, currency FROM wallets WHERE publisher_id = $1 LIMIT 1`,
    [publisherId]
  );

  return {
    total_clicks: totalClicks,
    total_conversions: Number(conv?.conversions ?? 0),
    approved_conversions: approvedConversions,
    total_payout: totalPayout.toFixed(2),
    total_revenue: totalRevenue.toFixed(2),
    epc: totalClicks > 0 ? (totalPayout / totalClicks).toFixed(4) : '0.0000',
    cr: totalClicks > 0 ? ((approvedConversions / totalClicks) * 100).toFixed(2) : '0.00',
    rpc: totalClicks > 0 ? (totalRevenue / totalClicks).toFixed(4) : '0.0000',
    wallet: walletResult.rows[0] ?? null,
  };
}
