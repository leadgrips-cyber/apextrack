import * as analyticsRepository from "../repositories/analytics.repository.js";

export interface DashboardMetrics {
  summary: analyticsRepository.DashboardSummary;
  startDate?: string;
  endDate?: string;
}

export interface ChartDataResponse {
  data: analyticsRepository.DailyMetrics[];
  startDate: string;
  endDate: string;
}

function formatNumberMetric(value: unknown): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatCurrencyMetric(value: unknown): string {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toFixed(2) : '0.00';
}

export async function getDashboardSummary(startDate?: string, endDate?: string): Promise<DashboardMetrics> {
  const summary = await analyticsRepository.getDashboardSummary(startDate, endDate);

  return {
    summary: {
      total_publishers: formatNumberMetric(summary.total_publishers),
      active_publishers: formatNumberMetric(summary.active_publishers),
      total_offers: formatNumberMetric(summary.total_offers),
      active_offers: formatNumberMetric(summary.active_offers),
      total_clicks: formatNumberMetric(summary.total_clicks),
      total_conversions: formatNumberMetric(summary.total_conversions),
      total_revenue: formatCurrencyMetric(summary.total_revenue),
      total_payout: formatCurrencyMetric(summary.total_payout),
      profit: formatCurrencyMetric(summary.profit),
    },
    startDate,
    endDate,
  };
}

export async function getChartData(startDate: string, endDate: string): Promise<ChartDataResponse> {
  if (!startDate || !endDate) {
    throw new Error('startDate and endDate are required');
  }

  const dailyMetrics = await analyticsRepository.getDailyMetrics(startDate, endDate);

  return {
    data: dailyMetrics.map((metric) => ({
      date: metric.date,
      clicks: formatNumberMetric(metric.clicks),
      conversions: formatNumberMetric(metric.conversions),
      revenue: formatCurrencyMetric(metric.revenue),
      profit: formatCurrencyMetric(metric.profit),
    })),
    startDate,
    endDate,
  };
}

export async function getTopPublishersData(
  limit: number = 10,
  startDate?: string,
  endDate?: string
): Promise<analyticsRepository.TopPublisher[]> {
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  return analyticsRepository.getTopPublishers(limit, startDate, endDate);
}

export async function getTopOffersData(
  limit: number = 10,
  startDate?: string,
  endDate?: string
): Promise<analyticsRepository.TopOffer[]> {
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  return analyticsRepository.getTopOffers(limit, startDate, endDate);
}

export async function getRecentConversionsData(limit: number = 20): Promise<analyticsRepository.RecentConversion[]> {
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  return analyticsRepository.getRecentConversions(limit);
}

export async function getRecentPostbacksData(limit: number = 20): Promise<analyticsRepository.RecentPostback[]> {
  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  return analyticsRepository.getRecentPostbacks(limit);
}

export async function getRevenueByOfferData(params: {
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: string;
}): Promise<{
  offers: analyticsRepository.RevenueByOffer[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(Math.max(1, Number(params.pageSize) || 25), 100);

  const { rows, total } = await analyticsRepository.getRevenueByOffer({
    startDate: params.startDate,
    endDate: params.endDate,
    page,
    pageSize,
    sortBy: params.sortBy,
    sortDir: params.sortDir,
  });

  return { offers: rows, total, page, pageSize };
}

export async function getRevenueTransactionsData(params: {
  startDate?: string;
  endDate?: string;
  status?: string;
  offerId?: number;
  publisherId?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  transactions: analyticsRepository.RevenueTransaction[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(Math.max(1, Number(params.pageSize) || 25), 100);

  const { rows, total } = await analyticsRepository.getRevenueTransactions({
    startDate: params.startDate,
    endDate: params.endDate,
    status: params.status,
    offerId: params.offerId,
    publisherId: params.publisherId,
    page,
    pageSize,
  });

  return { transactions: rows, total, page, pageSize };
}
