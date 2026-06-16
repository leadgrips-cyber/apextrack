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
  const eventToken = input.event ? String(input.event).trim() : undefined;
  return {
    click_id: String(input.click_id || ''),
    event: eventToken || undefined,
    // payout/revenue/status are optional when event is provided (event config supplies them)
    payout: String(input.payout || '0'),
    revenue: String(input.revenue || '0'),
    status: eventToken ? 'approved' : parsePostbackStatus(input.status),
    transaction_id: String(input.transaction_id || ''),
  };
}

function handlePostbackError(error: unknown, res: Response, next: NextFunction) {
  const msg = error instanceof Error ? error.message : '';
  const code = (error as any)?.code;

  if (code === 'CONVERSION_CAP_REACHED') {
    return res.status(429).json({ success: false, reason: 'CONVERSION_CAP_REACHED', message: msg });
  }
  if (
    msg.includes('is required') ||
    msg.includes('not found') ||
    msg.includes('not found or inactive') ||
    msg.includes('Invalid status') ||
    msg.includes('Invalid postback') ||
    msg.includes('must be a non-negative')
  ) {
    return res.status(400).json({ message: msg });
  }
  if (msg.includes('already exists')) {
    return res.status(409).json({ message: msg });
  }
  return next(error);
}

export async function getPostback(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = buildPayload(req.query as Record<string, unknown>);
    const conversion = await handlePostback(payload, req.query as Record<string, unknown>);
    res.status(201).json({ conversion });
  } catch (error) {
    handlePostbackError(error, res, next);
  }
}

export async function postPostback(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = buildPayload(req.body as Record<string, unknown>);
    const conversion = await handlePostback(payload, req.body as Record<string, unknown>);
    res.status(201).json({ conversion });
  } catch (error) {
    handlePostbackError(error, res, next);
  }
}
