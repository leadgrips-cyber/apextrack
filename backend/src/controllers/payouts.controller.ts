import { NextFunction, Response } from 'express';
import { AuthRequest } from "../types/auth.js";
import {
  getPayoutsSummary,
  getPublishersWithBalances,
  getWalletTransactions,
  processManualPayout,
} from "../services/payouts.service.js";

function parsePositiveNumber(value: unknown, fallback: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
  return Math.floor(numeric);
}

function parseISODate(value: unknown): string | undefined {
  if (!value || typeof value !== 'string') return undefined;
  try {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return undefined;
    return date.toISOString();
  } catch {
    return undefined;
  }
}

export async function handleGetPayoutsSummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const summary = await getPayoutsSummary();
    res.json({ summary });
  } catch (error) {
    next(error);
  }
}

export async function handleGetPublishersWithBalances(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page         = parsePositiveNumber(req.query.page, 1);
    const pageSize     = parsePositiveNumber(req.query.page_size, 25);
    const search       = typeof req.query.search       === 'string' && req.query.search       ? req.query.search       : undefined;
    const minAvailable = req.query.min_available !== undefined ? Number(req.query.min_available) : undefined;

    const result = await getPublishersWithBalances({ page, pageSize, search, minAvailable });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleGetWalletTransactions(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page            = parsePositiveNumber(req.query.page, 1);
    const pageSize        = parsePositiveNumber(req.query.page_size, 25);
    const publisherId     = typeof req.query.publisher_id     === 'string' && req.query.publisher_id     ? req.query.publisher_id     : undefined;
    const transactionType = typeof req.query.transaction_type === 'string' && req.query.transaction_type ? req.query.transaction_type : undefined;
    const startDate       = parseISODate(req.query.start_date);
    const endDate         = parseISODate(req.query.end_date);

    const result = await getWalletTransactions({ page, pageSize, publisherId, transactionType, startDate, endDate });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleProcessManualPayout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { publisher_id, amount, description } = req.body as {
      publisher_id?: unknown;
      amount?: unknown;
      description?: unknown;
    };

    if (!publisher_id || typeof publisher_id !== 'string') {
      res.status(400).json({ message: 'publisher_id is required and must be a string' });
      return;
    }

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ message: 'amount must be a positive number' });
      return;
    }

    const parsedDescription = typeof description === 'string' && description.trim()
      ? description.trim()
      : undefined;

    const result = await processManualPayout({
      publisherId: publisher_id,
      amount:      parsedAmount,
      description: parsedDescription,
    });

    res.json({ success: true, ...result });
  } catch (error) {
    if (
      error instanceof Error && (
        error.message.includes('Insufficient balance') ||
        error.message.includes('not found')            ||
        error.message.includes('required')             ||
        error.message.includes('positive number')
      )
    ) {
      res.status(400).json({ message: error.message });
      return;
    }
    next(error);
  }
}
