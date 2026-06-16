import { NextFunction, Response } from 'express';
import { AuthRequest } from "../types/auth.js";
import * as conversionReviewService from "../services/conversion-review.service.js";

export async function handleListConversions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await conversionReviewService.listConversions({
      status: req.query.status as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      offerId: req.query.offerId ? Number(req.query.offerId) : undefined,
      publisherId: req.query.publisherId as string | undefined,
      publisherEmail: req.query.publisherEmail as string | undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? Number(req.query.page) : undefined,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleApproveConversion(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const result = await conversionReviewService.approveConversion(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleRejectConversion(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body as { rejection_reason: string };
    const result = await conversionReviewService.rejectConversion(id, rejection_reason);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body as { status: string; reason?: string };
    const adminId = req.user?.sub || null;
    const adminEmail = req.user?.email || null;
    const result = await conversionReviewService.updateStatus(id, status, adminId, adminEmail, reason || null);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleGetHistory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const history = await conversionReviewService.getHistory(id);
    res.json({ history });
  } catch (error) {
    next(error);
  }
}
