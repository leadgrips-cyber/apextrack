import { Request, Response, NextFunction } from 'express';
import { handlePostback } from "../services/postback.service.js";
import { PostbackRequestPayload, PostbackStatus } from "../types/postback.js";

// Resolves DEFAULT_POSTBACK_STATUS env var at module load; falls back to 'approved'
const DEFAULT_POSTBACK_STATUS: PostbackStatus = (() => {
  const env = (process.env.DEFAULT_POSTBACK_STATUS ?? '').trim().toLowerCase() as PostbackStatus;
  return (['approved', 'pending', 'rejected', 'review_queue'] as PostbackStatus[]).includes(env)
    ? env
    : 'approved';
})();

// Maps every known external status alias → internal PostbackStatus
const STATUS_MAP: Record<string, PostbackStatus> = {
  // APPROVED
  'approved':   'approved', 'approve':    'approved', '1':          'approved',
  'success':    'approved', 'converted':  'approved', 'conversion': 'approved',
  'lead':       'approved', 'sale':       'approved', 'confirmed':  'approved',
  'ok':         'approved',
  // PENDING
  'pending':    'pending',  '2':          'pending',  'hold':       'pending',
  'waiting':    'pending',  'review':     'pending',
  // REJECTED
  'rejected':   'rejected', 'declined':   'rejected', '3':          'rejected',
  'failed':     'rejected', 'cancelled':  'rejected', 'canceled':   'rejected',
  'fraud':      'rejected', 'invalid':    'rejected',
  // DISPUTED / CHARGEBACK → review_queue (admin holds conversion; no wallet credit)
  'disputed':   'review_queue', 'chargeback': 'review_queue', '5': 'review_queue',
};

function normalizePostbackStatus(value: unknown): PostbackStatus {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return DEFAULT_POSTBACK_STATUS;
  const mapped = STATUS_MAP[raw];
  if (mapped !== undefined) return mapped;
  throw new Error(`Invalid postback status: "${raw}"`);
}

// Returns the first non-empty value from input for any of the given key aliases
function firstDefined(input: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    const v = input[key];
    if (v !== undefined && v !== null && String(v).trim() !== '') return v;
  }
  return undefined;
}

function buildPayload(input: Record<string, unknown>): PostbackRequestPayload {
  const eventToken = input.event ? String(input.event).trim() : undefined;
  return {
    click_id:       String(firstDefined(input, 'click_id', 'clickid', 'cid', 'aff_click_id', 'sub1', 'ref_id') ?? ''),
    event:          eventToken || undefined,
    payout:         String(firstDefined(input, 'payout', 'sum', 'commission', 'amount') ?? '0'),
    revenue:        String(firstDefined(input, 'revenue', 'sale_amount', 'price', 'order_sum') ?? '0'),
    status:         eventToken ? 'approved' : normalizePostbackStatus(input.status),
    transaction_id: String(firstDefined(input, 'transaction_id', 'transactionid', 'order_id', 'orderid', 'external_id') ?? ''),
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
