import { NextFunction, Response } from 'express';
import { AuthRequest } from "../types/auth.js";
import {
  getDashboardSummary,
  getChartData,
  getTopPublishersData,
  getTopOffersData,
  getRecentConversionsData,
  getRecentPostbacksData,
  getRevenueByOfferData,
  getRevenueTransactionsData,
  getClickReportData,
  getConversionReportData,
  getDailyReportData,
} from "../services/analytics.service.js";

function parsePositiveNumber(value: unknown, fallback: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }
  return Math.floor(numeric);
}

function parseISODate(value: unknown): string | undefined {
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  try {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) {
      return undefined;
    }
    return date.toISOString();
  } catch {
    return undefined;
  }
}

function parseDateParam(value: unknown): string | undefined {
  if (!value || typeof value !== 'string') return undefined;
  const s = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return undefined;
  return Number.isFinite(new Date(s).getTime()) ? s : undefined;
}

export async function handleGetDashboardSummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const startDate = parseISODate(req.query.start_date);
    const endDate = parseISODate(req.query.end_date);

    const summary = await getDashboardSummary(startDate, endDate);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

export async function handleGetChartData(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const startDate = parseISODate(req.query.start_date);
    const endDate = parseISODate(req.query.end_date);

    if (!startDate || !endDate) {
      res.status(400).json({ message: 'start_date and end_date are required' });
      return;
    }

    const chartData = await getChartData(startDate, endDate);
    res.json(chartData);
  } catch (error) {
    next(error);
  }
}

export async function handleGetTopPublishers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const limit = parsePositiveNumber(req.query.limit, 10);
    const startDate = parseISODate(req.query.start_date);
    const endDate = parseISODate(req.query.end_date);

    const publishers = await getTopPublishersData(limit, startDate, endDate);
    res.json({ publishers, count: publishers.length });
  } catch (error) {
    next(error);
  }
}

export async function handleGetTopOffers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const limit = parsePositiveNumber(req.query.limit, 10);
    const startDate = parseISODate(req.query.start_date);
    const endDate = parseISODate(req.query.end_date);

    const offers = await getTopOffersData(limit, startDate, endDate);
    res.json({ offers, count: offers.length });
  } catch (error) {
    next(error);
  }
}

export async function handleGetRecentConversions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const limit = parsePositiveNumber(req.query.limit, 20);

    const conversions = await getRecentConversionsData(limit);
    res.json({ conversions, count: conversions.length });
  } catch (error) {
    next(error);
  }
}

export async function handleGetRecentPostbacks(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const limit = parsePositiveNumber(req.query.limit, 20);

    const postbacks = await getRecentPostbacksData(limit);
    res.json({ postbacks, count: postbacks.length });
  } catch (error) {
    next(error);
  }
}

export async function handleGetRevenueByOffer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page     = parsePositiveNumber(req.query.page, 1);
    const pageSize = parsePositiveNumber(req.query.page_size, 25);
    const sortBy   = typeof req.query.sort_by  === 'string' ? req.query.sort_by  : undefined;
    const sortDir  = typeof req.query.sort_dir === 'string' ? req.query.sort_dir : undefined;
    const startDate = parseISODate(req.query.start_date);
    const endDate   = parseISODate(req.query.end_date);

    const result = await getRevenueByOfferData({ page, pageSize, sortBy, sortDir, startDate, endDate });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleGetClickReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page      = parsePositiveNumber(req.query.page, 1);
    const pageSize  = parsePositiveNumber(req.query.page_size, 25);
    const startDate = parseDateParam(req.query.start_date);
    const endDate   = parseDateParam(req.query.end_date);
    const offerId   = req.query.offer_id ? Number(req.query.offer_id) : undefined;
    const publisherEmail = typeof req.query.publisher_email === 'string' && req.query.publisher_email ? req.query.publisher_email : undefined;
    const search    = typeof req.query.search === 'string' && req.query.search ? req.query.search : undefined;

    const result = await getClickReportData({ page, pageSize, startDate, endDate, offerId, publisherEmail, search });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleGetConversionReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page      = parsePositiveNumber(req.query.page, 1);
    const pageSize  = parsePositiveNumber(req.query.page_size, 25);
    const startDate = parseDateParam(req.query.start_date);
    const endDate   = parseDateParam(req.query.end_date);
    const offerId   = req.query.offer_id ? Number(req.query.offer_id) : undefined;
    const status    = typeof req.query.status          === 'string' && req.query.status          ? req.query.status          : undefined;
    const publisherEmail = typeof req.query.publisher_email === 'string' && req.query.publisher_email ? req.query.publisher_email : undefined;
    const search    = typeof req.query.search          === 'string' && req.query.search          ? req.query.search          : undefined;

    const result = await getConversionReportData({ page, pageSize, startDate, endDate, offerId, status, publisherEmail, search });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleGetDailyReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const startDate = parseDateParam(req.query.start_date);
    const endDate   = parseDateParam(req.query.end_date);

    if (!startDate || !endDate) {
      res.status(400).json({ message: 'start_date and end_date are required' });
      return;
    }

    const offerId   = req.query.offer_id ? Number(req.query.offer_id) : undefined;
    const publisherEmail = typeof req.query.publisher_email === 'string' && req.query.publisher_email ? req.query.publisher_email : undefined;

    const rows = await getDailyReportData({ startDate, endDate, offerId, publisherEmail });
    res.json({ rows });
  } catch (error) {
    next(error);
  }
}

export async function handleGetRevenueTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page      = parsePositiveNumber(req.query.page, 1);
    const pageSize  = parsePositiveNumber(req.query.page_size, 25);
    const startDate = parseISODate(req.query.start_date);
    const endDate   = parseISODate(req.query.end_date);
    const status    = typeof req.query.status       === 'string' && req.query.status       ? req.query.status       : undefined;
    const publisherId = typeof req.query.publisher_id === 'string' && req.query.publisher_id ? req.query.publisher_id : undefined;
    const offerId   = req.query.offer_id ? Number(req.query.offer_id) : undefined;

    const result = await getRevenueTransactionsData({ page, pageSize, startDate, endDate, status, offerId, publisherId });
    res.json(result);
  } catch (error) {
    next(error);
  }
}
