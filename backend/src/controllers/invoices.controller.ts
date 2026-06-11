import { Request, Response, NextFunction } from 'express';
import {
  fetchInvoicesSummary,
  fetchInvoices,
  fetchInvoiceById,
  createNewInvoice,
  payInvoice,
  holdInvoice,
  unholdInvoice,
  editInvoice,
  removeInvoice,
} from "../services/invoices.service.js";

function isClientError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return (
    err.message.includes('required') ||
    err.message.includes('positive') ||
    err.message.includes('non-negative') ||
    err.message.includes('less than') ||
    err.message.includes('not found') ||
    err.message.includes('already paid') ||
    err.message.includes('Insufficient')
  );
}

export async function handleGetInvoicesSummary(
  _req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const summary = await fetchInvoicesSummary();
    res.json({ summary });
  } catch (err) {
    next(err);
  }
}

export async function handleListInvoices(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const { page, page_size, status, search, start_date, end_date } = req.query;
    const result = await fetchInvoices({
      page:      page      ? Number(page)      : undefined,
      pageSize:  page_size ? Number(page_size) : undefined,
      status:    typeof status     === 'string' ? status     : undefined,
      search:    typeof search     === 'string' ? search     : undefined,
      startDate: typeof start_date === 'string' ? start_date : undefined,
      endDate:   typeof end_date   === 'string' ? end_date   : undefined,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleGetInvoice(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const invoice = await fetchInvoiceById(req.params.id);
    if (!invoice) { res.status(404).json({ message: 'Invoice not found' }); return; }
    res.json({ invoice });
  } catch (err) {
    next(err);
  }
}

export async function handleCreateInvoice(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const {
      publisher_id, period_start, period_end,
      gross_amount, fee_amount, payout_method, notes,
    } = req.body;
    const invoice = await createNewInvoice({
      publisherId:  publisher_id,
      periodStart:  period_start,
      periodEnd:    period_end,
      grossAmount:  Number(gross_amount),
      feeAmount:    Number(fee_amount ?? 0),
      payoutMethod: payout_method,
      notes,
    });
    res.status(201).json({ invoice });
  } catch (err) {
    if (isClientError(err)) {
      res.status(400).json({ message: (err as Error).message });
      return;
    }
    next(err);
  }
}

export async function handleMarkInvoicePaid(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const { description } = req.body;
    const result = await payInvoice({ invoiceId: req.params.id, description });
    res.json({
      success: true,
      invoice: result.invoice,
      wallet_transaction_id: result.wallet_transaction_id,
    });
  } catch (err) {
    if (isClientError(err)) {
      res.status(400).json({ message: (err as Error).message });
      return;
    }
    next(err);
  }
}

export async function handleHoldInvoice(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const invoice = await holdInvoice(req.params.id);
    res.json({ invoice });
  } catch (err) {
    if (isClientError(err)) {
      res.status(404).json({ message: (err as Error).message });
      return;
    }
    next(err);
  }
}

export async function handleUnholdInvoice(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const invoice = await unholdInvoice(req.params.id);
    res.json({ invoice });
  } catch (err) {
    if (isClientError(err)) {
      res.status(404).json({ message: (err as Error).message });
      return;
    }
    next(err);
  }
}

export async function handleUpdateInvoice(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const body = req.body as Record<string, unknown>;
    const params: Parameters<typeof editInvoice>[1] = {};

    if (body.period_start  !== undefined) params.periodStart  = body.period_start  as string;
    if (body.period_end    !== undefined) params.periodEnd    = body.period_end    as string;
    if (body.gross_amount  !== undefined) params.grossAmount  = Number(body.gross_amount);
    if (body.fee_amount    !== undefined) params.feeAmount    = Number(body.fee_amount);
    if ('payout_method' in body)         params.payoutMethod = (body.payout_method as string | null) ?? null;
    if ('notes' in body)                 params.notes        = (body.notes as string | null) ?? null;

    const invoice = await editInvoice(req.params.id, params);
    res.json({ invoice });
  } catch (err) {
    if (isClientError(err)) {
      res.status(400).json({ message: (err as Error).message });
      return;
    }
    next(err);
  }
}

export async function handleDeleteInvoice(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    await removeInvoice(req.params.id);
    res.json({ success: true });
  } catch (err) {
    if (isClientError(err)) {
      res.status(400).json({ message: (err as Error).message });
      return;
    }
    next(err);
  }
}
