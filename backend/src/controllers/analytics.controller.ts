import { NextFunction, Response } from 'express';
import { AuthRequest } from "../types/auth.js";
import {
  getDashboardSummary,
  getChartData,
  getTopPublishersData,
  getTopOffersData,
  getRecentConversionsData,
  getRecentPostbacksData,
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
