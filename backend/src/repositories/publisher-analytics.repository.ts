import { query } from "../db/index.js";

export interface PublisherDashboardStats {
  total_clicks: number;
  total_conversions: number;
  total_payout: string;
  total_revenue: string;
  epc: string;
  cr: string;
  available_balance: string;
  pending_balance: string;
  withdrawn_balance: string;
}

export interface PublisherClickRow {
  click_id: string;
  offer_name: string;
  country_code: string | null;
  device_type: string | null;
  sub1: string | null;
  sub2: string | null;
  sub3: string | null;
  sub4: string | null;
  sub5: string | null;
  created_at: string;
}

export interface PublisherConversionRow {
  id: string;
  click_id: string;
  offer_name: string;
  conversion_status: string;
  payout_amount: string;
  revenue_amount: string;
  event_timestamp: string;
}

export interface PublisherDailyRow {
  date: string;
  clicks: number;
  conversions: number;
  payout: string;
  revenue: string;
  profit: string;
}

export interface PublisherOverviewRow {
  offer_name: string;
  clicks: number;
  conversions: number;
  payout: string;
  revenue: string;
}

export interface PublisherWalletTxRow {
  id: string;
  transaction_type: string;
  amount: string;
  description: string;
  balance_after: string;
  currency: string;
  created_at: string;
}

// Conversions shown in the publisher conversion LIST (includes PENDING so publisher
// knows their conversion is under review, but NOT REVIEW_QUEUE which is hidden).
const CONV_LIST_STATUSES = `c.conversion_status IN ('PENDING', 'APPROVED', 'PAID')`;

// Statuses that count toward publisher REVENUE/PAYOUT figures (approved/paid only).
const REVENUE_STATUSES = `c.conversion_status IN ('APPROVED', 'PAID')`;

// Helper: inclusive end-date filter for TIMESTAMPTZ columns.
// Using < (date + 1 day) avoids the midnight-exclusion bug with <= 'YYYY-MM-DD'.
function endDateClause(col: string, paramIdx: number): string {
  return `${col} < ($${paramIdx}::date + INTERVAL '1 day')`;
}

export async function getPublisherDashboardStats(
  publisherId: string,
  startDate?: string,
  endDate?: string
): Promise<PublisherDashboardStats> {
  const clickP: unknown[] = [publisherId];
  const clickClauses: string[] = ['cl.publisher_id = $1'];
  if (startDate) { clickP.push(startDate); clickClauses.push(`cl.created_at >= $${clickP.length}`); }
  if (endDate)   { clickP.push(endDate);   clickClauses.push(endDateClause('cl.created_at', clickP.length)); }

  const convP: unknown[] = [publisherId];
  const convClauses: string[] = [`c.publisher_id = $1`, REVENUE_STATUSES];
  if (startDate) { convP.push(startDate); convClauses.push(`c.event_timestamp >= $${convP.length}`); }
  if (endDate)   { convP.push(endDate);   convClauses.push(endDateClause('c.event_timestamp', convP.length)); }

  const [clickResult, convResult, walletResult] = await Promise.all([
    query<{ total_clicks: string }>(
      `SELECT COUNT(*) AS total_clicks FROM clicks cl WHERE ${clickClauses.join(' AND ')}`,
      clickP
    ),
    query<{ total_conversions: string; total_payout: string; total_revenue: string }>(
      `SELECT
         COUNT(*) AS total_conversions,
         COALESCE(SUM(c.payout_amount), 0)::TEXT AS total_payout,
         COALESCE(SUM(c.revenue_amount), 0)::TEXT AS total_revenue
       FROM conversions c
       WHERE ${convClauses.join(' AND ')}`,
      convP
    ),
    query<{ available_balance: string; pending_balance: string; withdrawn_balance: string }>(
      `SELECT available_balance::TEXT, pending_balance::TEXT, withdrawn_balance::TEXT
       FROM wallets WHERE publisher_id = $1 LIMIT 1`,
      [publisherId]
    ),
  ]);

  const clicks = Number(clickResult.rows[0]?.total_clicks ?? 0);
  const conversions = Number(convResult.rows[0]?.total_conversions ?? 0);
  const payout = Number(convResult.rows[0]?.total_payout ?? 0);
  const revenue = Number(convResult.rows[0]?.total_revenue ?? 0);
  const wallet = walletResult.rows[0];

  return {
    total_clicks: clicks,
    total_conversions: conversions,
    total_payout: payout.toFixed(2),
    total_revenue: revenue.toFixed(2),
    epc: clicks > 0 ? (payout / clicks).toFixed(4) : '0.0000',
    cr: clicks > 0 ? ((conversions / clicks) * 100).toFixed(2) : '0.00',
    available_balance: wallet?.available_balance ?? '0.000000',
    pending_balance: wallet?.pending_balance ?? '0.000000',
    withdrawn_balance: wallet?.withdrawn_balance ?? '0.000000',
  };
}

export async function getPublisherClickReport(
  publisherId: string,
  params: {
    startDate?: string;
    endDate?: string;
    offerId?: number;
    search?: string;
    page: number;
    pageSize: number;
  }
): Promise<{ rows: PublisherClickRow[]; total: number }> {
  const p: unknown[] = [publisherId];
  const clauses: string[] = ['cl.publisher_id = $1'];

  if (params.startDate) { p.push(params.startDate); clauses.push(`cl.created_at >= $${p.length}`); }
  if (params.endDate)   { p.push(params.endDate);   clauses.push(endDateClause('cl.created_at', p.length)); }
  if (params.offerId)   { p.push(params.offerId);   clauses.push(`cl.offer_id = $${p.length}`); }
  if (params.search) {
    p.push(`%${params.search}%`);
    const i = p.length;
    clauses.push(`(o.name ILIKE $${i} OR cl.click_id::TEXT ILIKE $${i})`);
  }

  const where = `WHERE ${clauses.join(' AND ')}`;
  const countP = [...p];
  p.push(params.pageSize, (params.page - 1) * params.pageSize);

  const [rowsResult, countResult] = await Promise.all([
    query<PublisherClickRow>(
      `SELECT
         cl.click_id,
         o.name AS offer_name,
         cl.country_code,
         cl.device_type,
         cl.sub1, cl.sub2, cl.sub3, cl.sub4, cl.sub5,
         cl.created_at
       FROM clicks cl
       JOIN offers o ON cl.offer_id = o.id
       ${where}
       ORDER BY cl.created_at DESC
       LIMIT $${p.length - 1} OFFSET $${p.length}`,
      p
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) FROM clicks cl
       JOIN offers o ON cl.offer_id = o.id
       ${where}`,
      countP
    ),
  ]);

  return { rows: rowsResult.rows, total: Number(countResult.rows[0]?.count ?? 0) };
}

export async function getPublisherConversionReport(
  publisherId: string,
  params: {
    startDate?: string;
    endDate?: string;
    offerId?: number;
    search?: string;
    page: number;
    pageSize: number;
  }
): Promise<{ rows: PublisherConversionRow[]; total: number }> {
  const p: unknown[] = [publisherId];
  // Publisher sees PENDING + APPROVED + PAID (not REVIEW_QUEUE or REJECTED)
  const clauses: string[] = [`c.publisher_id = $1`, CONV_LIST_STATUSES];

  if (params.startDate) { p.push(params.startDate); clauses.push(`c.event_timestamp >= $${p.length}`); }
  if (params.endDate)   { p.push(params.endDate);   clauses.push(endDateClause('c.event_timestamp', p.length)); }
  if (params.offerId)   { p.push(params.offerId);   clauses.push(`c.offer_id = $${p.length}`); }
  if (params.search) {
    p.push(`%${params.search}%`);
    const i = p.length;
    clauses.push(`(o.name ILIKE $${i} OR c.id::TEXT ILIKE $${i})`);
  }

  const where = `WHERE ${clauses.join(' AND ')}`;
  const countP = [...p];
  p.push(params.pageSize, (params.page - 1) * params.pageSize);

  const [rowsResult, countResult] = await Promise.all([
    query<PublisherConversionRow>(
      `SELECT
         c.id,
         c.click_id::TEXT,
         o.name AS offer_name,
         c.conversion_status,
         c.payout_amount::TEXT,
         c.revenue_amount::TEXT,
         c.event_timestamp
       FROM conversions c
       JOIN offers o ON c.offer_id = o.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${p.length - 1} OFFSET $${p.length}`,
      p
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) FROM conversions c
       JOIN offers o ON c.offer_id = o.id
       ${where}`,
      countP
    ),
  ]);

  return { rows: rowsResult.rows, total: Number(countResult.rows[0]?.count ?? 0) };
}

export async function getPublisherDailyReport(
  publisherId: string,
  startDate: string,
  endDate: string,
  offerId?: number
): Promise<PublisherDailyRow[]> {
  const clickP: unknown[] = [publisherId, startDate, endDate];
  const clickClauses: string[] = [
    'cl.publisher_id = $1',
    'cl.created_at >= $2',
    endDateClause('cl.created_at', 3),
  ];
  if (offerId) { clickP.push(offerId); clickClauses.push(`cl.offer_id = $${clickP.length}`); }

  const convP: unknown[] = [publisherId, startDate, endDate];
  const convClauses: string[] = [
    'c.publisher_id = $1',
    'c.event_timestamp >= $2',
    endDateClause('c.event_timestamp', 3),
    REVENUE_STATUSES,
  ];
  if (offerId) { convP.push(offerId); convClauses.push(`c.offer_id = $${convP.length}`); }

  const [clickResult, convResult] = await Promise.all([
    query<{ date: string; clicks: string }>(
      `SELECT DATE(cl.created_at)::TEXT AS date, COUNT(*) AS clicks
       FROM clicks cl WHERE ${clickClauses.join(' AND ')}
       GROUP BY DATE(cl.created_at)`,
      clickP
    ),
    query<{ date: string; conversions: string; payout: string; revenue: string }>(
      `SELECT
         DATE(c.event_timestamp)::TEXT AS date,
         COUNT(*) AS conversions,
         COALESCE(SUM(c.payout_amount), 0)::TEXT AS payout,
         COALESCE(SUM(c.revenue_amount), 0)::TEXT AS revenue
       FROM conversions c WHERE ${convClauses.join(' AND ')}
       GROUP BY DATE(c.event_timestamp)`,
      convP
    ),
  ]);

  const byDate = new Map<string, PublisherDailyRow>();

  for (const row of clickResult.rows) {
    byDate.set(row.date, { date: row.date, clicks: Number(row.clicks), conversions: 0, payout: '0.00', revenue: '0.00', profit: '0.00' });
  }
  for (const row of convResult.rows) {
    const existing = byDate.get(row.date) ?? { date: row.date, clicks: 0, conversions: 0, payout: '0.00', revenue: '0.00', profit: '0.00' };
    const pay = Number(row.payout);
    const rev = Number(row.revenue);
    byDate.set(row.date, { ...existing, conversions: Number(row.conversions), payout: pay.toFixed(2), revenue: rev.toFixed(2), profit: (rev - pay).toFixed(2) });
  }

  return Array.from(byDate.values()).sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPublisherOverviewReport(
  publisherId: string,
  startDate?: string,
  endDate?: string
): Promise<PublisherOverviewRow[]> {
  const clickP: unknown[] = [publisherId];
  const clickClauses: string[] = ['cl.publisher_id = $1'];
  if (startDate) { clickP.push(startDate); clickClauses.push(`cl.created_at >= $${clickP.length}`); }
  if (endDate)   { clickP.push(endDate);   clickClauses.push(endDateClause('cl.created_at', clickP.length)); }

  const convP: unknown[] = [publisherId];
  const convClauses: string[] = [`c.publisher_id = $1`, REVENUE_STATUSES];
  if (startDate) { convP.push(startDate); convClauses.push(`c.event_timestamp >= $${convP.length}`); }
  if (endDate)   { convP.push(endDate);   convClauses.push(endDateClause('c.event_timestamp', convP.length)); }

  const [clickResult, convResult] = await Promise.all([
    query<{ offer_name: string; clicks: string }>(
      `SELECT o.name AS offer_name, COUNT(*) AS clicks
       FROM clicks cl JOIN offers o ON cl.offer_id = o.id
       WHERE ${clickClauses.join(' AND ')}
       GROUP BY o.name`,
      clickP
    ),
    query<{ offer_name: string; conversions: string; payout: string; revenue: string }>(
      `SELECT o.name AS offer_name,
         COUNT(*) AS conversions,
         COALESCE(SUM(c.payout_amount), 0)::TEXT AS payout,
         COALESCE(SUM(c.revenue_amount), 0)::TEXT AS revenue
       FROM conversions c JOIN offers o ON c.offer_id = o.id
       WHERE ${convClauses.join(' AND ')}
       GROUP BY o.name`,
      convP
    ),
  ]);

  const byOffer = new Map<string, PublisherOverviewRow>();
  for (const row of clickResult.rows) {
    byOffer.set(row.offer_name, { offer_name: row.offer_name, clicks: Number(row.clicks), conversions: 0, payout: '0.00', revenue: '0.00' });
  }
  for (const row of convResult.rows) {
    const existing = byOffer.get(row.offer_name) ?? { offer_name: row.offer_name, clicks: 0, conversions: 0, payout: '0.00', revenue: '0.00' };
    byOffer.set(row.offer_name, { ...existing, conversions: Number(row.conversions), payout: Number(row.payout).toFixed(2), revenue: Number(row.revenue).toFixed(2) });
  }

  return Array.from(byOffer.values()).sort((a, b) => Number(b.payout) - Number(a.payout));
}

export async function getPublisherWalletBalance(
  publisherId: string
): Promise<{ available_balance: string; pending_balance: string; withdrawn_balance: string; hold_balance: string; currency: string } | null> {
  const result = await query<{ available_balance: string; pending_balance: string; withdrawn_balance: string; hold_balance: string; currency: string }>(
    `SELECT available_balance::TEXT, pending_balance::TEXT, withdrawn_balance::TEXT, hold_balance::TEXT, currency
     FROM wallets WHERE publisher_id = $1 LIMIT 1`,
    [publisherId]
  );
  return result.rows[0] || null;
}

export async function getPublisherWalletTransactions(
  publisherId: string,
  page: number,
  pageSize: number
): Promise<{ rows: PublisherWalletTxRow[]; total: number }> {
  const [rowsResult, countResult] = await Promise.all([
    query<PublisherWalletTxRow>(
      `SELECT id, transaction_type, amount::TEXT, description, balance_after::TEXT, currency, created_at
       FROM wallet_transactions
       WHERE publisher_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [publisherId, pageSize, (page - 1) * pageSize]
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) FROM wallet_transactions WHERE publisher_id = $1`,
      [publisherId]
    ),
  ]);

  return { rows: rowsResult.rows, total: Number(countResult.rows[0]?.count ?? 0) };
}
