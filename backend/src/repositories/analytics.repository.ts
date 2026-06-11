import { query } from "../db/index.js";

export interface DashboardSummary {
  total_publishers: number;
  active_publishers: number;
  total_offers: number;
  active_offers: number;
  total_clicks: number;
  total_conversions: number;
  total_revenue: string;
  total_payout: string;
  profit: string;
}

export interface DailyMetrics {
  date: string;
  clicks: number;
  conversions: number;
  revenue: string;
  profit: string;
}

export interface TopPublisher {
  id: string;
  email: string;
  full_name: string;
  affiliate_code: string;
  total_clicks: number;
  total_conversions: number;
  total_revenue: string;
  total_payout: string;
}

export interface TopOffer {
  id: number;
  name: string;
  slug: string;
  category: string;
  total_clicks: number;
  total_conversions: number;
  total_revenue: string;
  total_payout: string;
}

export interface RecentConversion {
  id: string;
  click_id: string;
  offer_id: number;
  offer_name: string;
  publisher_id: string;
  publisher_email: string;
  conversion_status: string;
  payout_amount: string;
  revenue_amount: string;
  event_timestamp: string;
  created_at: string;
}

export interface RecentPostback {
  id: string;
  conversion_id: string;
  offer_id: number;
  offer_name: string;
  publisher_id: string;
  publisher_email: string;
  status: string;
  destination_url: string;
  created_at: string;
}

export async function getDashboardSummary(startDate?: string, endDate?: string): Promise<DashboardSummary> {
  const dateFilter = startDate && endDate 
    ? `AND c.event_timestamp >= $1 AND c.event_timestamp <= $2`
    : '';
  const dateParams = startDate && endDate ? [startDate, endDate] : [];

  const result = await query<DashboardSummary>(
    `SELECT
       (SELECT COUNT(*) FROM publishers) AS total_publishers,
       (SELECT COUNT(*) FROM publishers WHERE account_status = 'ACTIVE' AND is_active = TRUE) AS active_publishers,
       (SELECT COUNT(*) FROM offers) AS total_offers,
       (SELECT COUNT(*) FROM offers WHERE status = 'ACTIVE') AS active_offers,
       (SELECT COUNT(*) FROM clicks) AS total_clicks,
       (SELECT COUNT(*) FROM conversions ${dateFilter.replace('c.', 'event_timestamp')}) AS total_conversions,
       COALESCE(SUM(c.revenue_amount)::TEXT, '0') AS total_revenue,
       COALESCE(SUM(c.payout_amount)::TEXT, '0') AS total_payout,
       COALESCE((SUM(c.revenue_amount) - SUM(c.payout_amount))::TEXT, '0') AS profit
     FROM conversions c
     ${dateFilter}`,
    dateParams
  );

  return result.rows[0] || {
    total_publishers: 0,
    active_publishers: 0,
    total_offers: 0,
    active_offers: 0,
    total_clicks: 0,
    total_conversions: 0,
    total_revenue: '0',
    total_payout: '0',
    profit: '0',
  };
}

export async function getDailyMetrics(startDate: string, endDate: string): Promise<DailyMetrics[]> {
  const result = await query<DailyMetrics>(
    `SELECT
       DATE(c.event_timestamp)::TEXT AS date,
       COALESCE(SUM(CASE WHEN cl.published_at::DATE = DATE(c.event_timestamp) THEN 1 ELSE 0 END), 0) AS clicks,
       COUNT(c.id) AS conversions,
       COALESCE(SUM(c.revenue_amount)::TEXT, '0') AS revenue,
       COALESCE((SUM(c.revenue_amount) - SUM(c.payout_amount))::TEXT, '0') AS profit
     FROM conversions c
     LEFT JOIN clicks cl ON c.click_id = cl.click_id
     WHERE c.event_timestamp >= $1 AND c.event_timestamp <= $2
     GROUP BY DATE(c.event_timestamp)
     ORDER BY DATE(c.event_timestamp) DESC
     LIMIT 90`,
    [startDate, endDate]
  );

  return result.rows;
}

export async function getTopPublishers(limit: number = 10, startDate?: string, endDate?: string): Promise<TopPublisher[]> {
  const dateFilter = startDate && endDate 
    ? 'WHERE c.event_timestamp >= $1 AND c.event_timestamp <= $2'
    : '';
  const params = startDate && endDate ? [startDate, endDate, limit] : [limit];
  const paramCount = params.length;

  const result = await query<TopPublisher>(
    `SELECT
       p.id,
       p.email,
       p.full_name,
       p.affiliate_code,
       COALESCE(click_stats.total_clicks, 0) AS total_clicks,
       COUNT(c.id) AS total_conversions,
       COALESCE(SUM(c.revenue_amount)::TEXT, '0') AS total_revenue,
       COALESCE(SUM(c.payout_amount)::TEXT, '0') AS total_payout
     FROM publishers p
     LEFT JOIN (
       SELECT publisher_id, COUNT(*) AS total_clicks FROM clicks GROUP BY publisher_id
     ) click_stats ON click_stats.publisher_id = p.id
     LEFT JOIN conversions c ON c.publisher_id = p.id ${dateFilter ? 'AND ' + dateFilter.substring(6) : ''}
     GROUP BY p.id, p.email, p.full_name, p.affiliate_code, click_stats.total_clicks
     ORDER BY total_conversions DESC
     LIMIT $${paramCount}`,
    [...params.slice(0, paramCount - 1), params[paramCount - 1]]
  );

  return result.rows;
}

export async function getTopOffers(limit: number = 10, startDate?: string, endDate?: string): Promise<TopOffer[]> {
  const dateFilter = startDate && endDate 
    ? 'WHERE c.event_timestamp >= $1 AND c.event_timestamp <= $2'
    : '';
  const params = startDate && endDate ? [startDate, endDate, limit] : [limit];
  const paramCount = params.length;

  const result = await query<TopOffer>(
    `SELECT
       o.id,
       o.name,
       o.slug,
       o.category,
       COALESCE(click_stats.total_clicks, 0) AS total_clicks,
       COUNT(c.id) AS total_conversions,
       COALESCE(SUM(c.revenue_amount)::TEXT, '0') AS total_revenue,
       COALESCE(SUM(c.payout_amount)::TEXT, '0') AS total_payout
     FROM offers o
     LEFT JOIN (
       SELECT offer_id, COUNT(*) AS total_clicks FROM clicks GROUP BY offer_id
     ) click_stats ON click_stats.offer_id = o.id
     LEFT JOIN conversions c ON c.offer_id = o.id ${dateFilter ? 'AND ' + dateFilter.substring(6) : ''}
     GROUP BY o.id, o.name, o.slug, o.category, click_stats.total_clicks
     ORDER BY total_conversions DESC
     LIMIT $${paramCount}`,
    [...params.slice(0, paramCount - 1), params[paramCount - 1]]
  );

  return result.rows;
}

export async function getRecentConversions(limit: number = 20): Promise<RecentConversion[]> {
  const result = await query<RecentConversion>(
    `SELECT
       c.id,
       c.click_id,
       c.offer_id,
       o.name AS offer_name,
       c.publisher_id,
       p.email AS publisher_email,
       c.conversion_status,
       c.payout_amount::TEXT,
       c.revenue_amount::TEXT,
       c.event_timestamp,
       c.created_at
     FROM conversions c
     JOIN offers o ON c.offer_id = o.id
     JOIN publishers p ON c.publisher_id = p.id
     ORDER BY c.created_at DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows;
}

export interface RevenueByOffer {
  offer_id: number;
  offer_name: string;
  slug: string;
  category: string;
  total_clicks: number;
  total_conversions: number;
  total_revenue: string;
  total_payout: string;
  profit: string;
}

export interface RevenueTransaction {
  id: string;
  click_id: string;
  offer_id: number;
  offer_name: string;
  publisher_id: string;
  publisher_email: string;
  conversion_status: string;
  payout_amount: string;
  revenue_amount: string;
  profit: string;
  event_timestamp: string;
  created_at: string;
}

const OFFER_SORT_EXPR: Record<string, string> = {
  total_revenue:    'COALESCE(SUM(c.revenue_amount), 0)',
  total_payout:     'COALESCE(SUM(c.payout_amount), 0)',
  profit:           '(COALESCE(SUM(c.revenue_amount), 0) - COALESCE(SUM(c.payout_amount), 0))',
  total_conversions: 'COUNT(c.id)',
  offer_name:       'o.name',
};

export async function getRevenueByOffer(params: {
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir?: string;
}): Promise<{ rows: RevenueByOffer[]; total: number }> {
  const sortExpr = OFFER_SORT_EXPR[params.sortBy ?? ''] ?? OFFER_SORT_EXPR.total_revenue;
  const dir = params.sortDir?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const p: unknown[] = [];

  let dateJoinFilter = '';
  if (params.startDate && params.endDate) {
    p.push(params.startDate, params.endDate);
    dateJoinFilter = `AND c.event_timestamp >= $1 AND c.event_timestamp <= $2`;
  }

  p.push(params.pageSize, (params.page - 1) * params.pageSize);
  const limitN = p.length - 1;
  const offsetN = p.length;

  const [rowsResult, countResult] = await Promise.all([
    query<RevenueByOffer>(
      `SELECT
         o.id AS offer_id,
         o.name AS offer_name,
         o.slug,
         o.category,
         COALESCE(cs.total_clicks, 0) AS total_clicks,
         COUNT(c.id) AS total_conversions,
         COALESCE(SUM(c.revenue_amount), 0)::TEXT AS total_revenue,
         COALESCE(SUM(c.payout_amount), 0)::TEXT AS total_payout,
         (COALESCE(SUM(c.revenue_amount), 0) - COALESCE(SUM(c.payout_amount), 0))::TEXT AS profit
       FROM offers o
       LEFT JOIN (
         SELECT offer_id, COUNT(*) AS total_clicks FROM clicks GROUP BY offer_id
       ) cs ON cs.offer_id = o.id
       LEFT JOIN conversions c ON c.offer_id = o.id ${dateJoinFilter}
       GROUP BY o.id, o.name, o.slug, o.category, cs.total_clicks
       ORDER BY ${sortExpr} ${dir} NULLS LAST
       LIMIT $${limitN} OFFSET $${offsetN}`,
      p
    ),
    query<{ count: string }>('SELECT COUNT(*) FROM offers', []),
  ]);

  return { rows: rowsResult.rows, total: Number(countResult.rows[0]?.count ?? 0) };
}

export async function getRevenueTransactions(params: {
  startDate?: string;
  endDate?: string;
  status?: string;
  offerId?: number;
  publisherId?: string;
  page: number;
  pageSize: number;
}): Promise<{ rows: RevenueTransaction[]; total: number }> {
  const clauses: string[] = [];
  const p: unknown[] = [];

  if (params.startDate)   { p.push(params.startDate);               clauses.push(`c.event_timestamp >= $${p.length}`); }
  if (params.endDate)     { p.push(params.endDate);                 clauses.push(`c.event_timestamp <= $${p.length}`); }
  if (params.status)      { p.push(params.status.toUpperCase());    clauses.push(`c.conversion_status = $${p.length}`); }
  if (params.offerId)     { p.push(params.offerId);                 clauses.push(`c.offer_id = $${p.length}`); }
  if (params.publisherId) { p.push(params.publisherId);             clauses.push(`c.publisher_id = $${p.length}`); }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const countP = [...p];

  p.push(params.pageSize, (params.page - 1) * params.pageSize);
  const limitN = p.length - 1;
  const offsetN = p.length;

  const [rowsResult, countResult] = await Promise.all([
    query<RevenueTransaction>(
      `SELECT
         c.id,
         c.click_id,
         c.offer_id,
         o.name AS offer_name,
         c.publisher_id,
         p.email AS publisher_email,
         c.conversion_status,
         c.payout_amount::TEXT,
         c.revenue_amount::TEXT,
         (c.revenue_amount - c.payout_amount)::TEXT AS profit,
         c.event_timestamp,
         c.created_at
       FROM conversions c
       JOIN offers o ON c.offer_id = o.id
       JOIN publishers p ON c.publisher_id = p.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${limitN} OFFSET $${offsetN}`,
      p
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) FROM conversions c ${where}`,
      countP
    ),
  ]);

  return { rows: rowsResult.rows, total: Number(countResult.rows[0]?.count ?? 0) };
}

export async function getRecentPostbacks(limit: number = 20): Promise<RecentPostback[]> {
  const result = await query<RecentPostback>(
    `SELECT
       pb.id,
       pb.conversion_id,
       pb.offer_id,
       o.name AS offer_name,
       pb.publisher_id,
       p.email AS publisher_email,
       pb.status,
       pb.destination_url,
       pb.created_at
     FROM postbacks pb
     JOIN offers o ON pb.offer_id = o.id
     JOIN publishers p ON pb.publisher_id = p.id
     ORDER BY pb.created_at DESC
     LIMIT $1`,
    [limit]
  );

  return result.rows;
}
