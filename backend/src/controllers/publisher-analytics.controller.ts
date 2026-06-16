import { Response, NextFunction } from 'express';
import { AuthRequest } from "../types/auth.js";
import * as repo from "../repositories/publisher-analytics.repository.js";

export async function handleGetDashboardStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user!.sub;
    const { start_date, end_date } = req.query as Record<string, string>;
    const stats = await repo.getPublisherDashboardStats(
      publisherId,
      start_date || undefined,
      end_date || undefined
    );
    res.json({ stats });
  } catch (err) { next(err); }
}

export async function handleGetClickReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user!.sub;
    const q = req.query as Record<string, string>;
    const result = await repo.getPublisherClickReport(publisherId, {
      startDate: q.start_date || undefined,
      endDate: q.end_date || undefined,
      offerId: q.offer_id ? Number(q.offer_id) : undefined,
      search: q.search || undefined,
      page: Math.max(1, Number(q.page) || 1),
      pageSize: Math.min(200, Math.max(1, Number(q.page_size) || 25)),
    });
    res.json(result);
  } catch (err) { next(err); }
}

export async function handleGetConversionReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user!.sub;
    const q = req.query as Record<string, string>;
    const result = await repo.getPublisherConversionReport(publisherId, {
      startDate: q.start_date || undefined,
      endDate: q.end_date || undefined,
      offerId: q.offer_id ? Number(q.offer_id) : undefined,
      search: q.search || undefined,
      page: Math.max(1, Number(q.page) || 1),
      pageSize: Math.min(200, Math.max(1, Number(q.page_size) || 25)),
    });
    res.json(result);
  } catch (err) { next(err); }
}

export async function handleGetDailyReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user!.sub;
    const q = req.query as Record<string, string>;
    if (!q.start_date || !q.end_date) {
      res.status(400).json({ message: 'start_date and end_date are required' });
      return;
    }
    const rows = await repo.getPublisherDailyReport(
      publisherId,
      q.start_date,
      q.end_date,
      q.offer_id ? Number(q.offer_id) : undefined
    );
    res.json({ rows });
  } catch (err) { next(err); }
}

export async function handleGetOverviewReport(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user!.sub;
    const q = req.query as Record<string, string>;
    const rows = await repo.getPublisherOverviewReport(
      publisherId,
      q.start_date || undefined,
      q.end_date || undefined
    );
    res.json({ rows });
  } catch (err) { next(err); }
}

export async function handleGetWalletBalance(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user!.sub;
    const wallet = await repo.getPublisherWalletBalance(publisherId);
    if (!wallet) {
      res.status(404).json({ message: 'Wallet not found' });
      return;
    }
    res.json({ wallet });
  } catch (err) { next(err); }
}

export async function handleGetWalletTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user!.sub;
    const q = req.query as Record<string, string>;
    const result = await repo.getPublisherWalletTransactions(
      publisherId,
      Math.max(1, Number(q.page) || 1),
      Math.min(100, Math.max(1, Number(q.page_size) || 25))
    );
    res.json(result);
  } catch (err) { next(err); }
}
