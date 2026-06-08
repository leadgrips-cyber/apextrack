import { Request, Response, NextFunction } from 'express';
import { handlePostback } from "../services/postback.service.js";
import { PostbackRequestPayload, PostbackStatus } from "../types/postback.js";

function parsePostbackStatus(value: unknown): PostbackStatus {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'pending' || normalized === 'approved' || normalized === 'rejected') {
    return normalized;
  }
  throw new Error('Invalid postback status');
}

function buildPayload(input: Record<string, unknown>): PostbackRequestPayload {
  return {
    click_id: String(input.click_id || ''),
    payout: String(input.payout || ''),
    revenue: String(input.revenue || ''),
    status: parsePostbackStatus(input.status),
    transaction_id: String(input.transaction_id || ''),
  };
}

export async function getPostback(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = buildPayload(req.query as Record<string, unknown>);
    const conversion = await handlePostback(payload, req.query as Record<string, unknown>);
    res.status(201).json({ conversion });
  } catch (error) {
    next(error);
  }
}

export async function postPostback(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = buildPayload(req.body as Record<string, unknown>);
    const conversion = await handlePostback(payload, req.body as Record<string, unknown>);
    res.status(201).json({ conversion });
  } catch (error) {
    next(error);
  }
}
