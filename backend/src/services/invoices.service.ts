import {
  getInvoicesSummary,
  listInvoices,
  getInvoiceById,
  generateInvoiceNumber,
  createInvoice,
  markInvoicePaid,
  setInvoiceStatus,
  updateInvoice as updateInvoiceRepo,
  deleteInvoice as deleteInvoiceRepo,
  type InvoiceRow,
  type InvoicesSummary,
} from "../repositories/invoices.repository.js";

export type { InvoiceRow, InvoicesSummary };

export async function fetchInvoicesSummary(): Promise<InvoicesSummary> {
  return getInvoicesSummary();
}

export async function fetchInvoices(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ invoices: InvoiceRow[]; total: number; page: number; pageSize: number }> {
  const page     = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(Math.max(1, Number(params.pageSize) || 25), 100);
  const { rows, total } = await listInvoices({ ...params, page, pageSize });
  return { invoices: rows, total, page, pageSize };
}

export async function fetchInvoiceById(id: string): Promise<InvoiceRow | null> {
  return getInvoiceById(id);
}

export async function createNewInvoice(params: {
  publisherId: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  feeAmount: number;
  payoutMethod?: string;
  notes?: string;
}): Promise<InvoiceRow> {
  if (!params.publisherId)     throw new Error('publisherId is required');
  if (!params.periodStart)     throw new Error('periodStart is required');
  if (!params.periodEnd)       throw new Error('periodEnd is required');
  if (!(params.grossAmount > 0)) throw new Error('grossAmount must be a positive number');
  if (params.feeAmount < 0)    throw new Error('feeAmount must be non-negative');
  if (params.feeAmount >= params.grossAmount) {
    throw new Error('feeAmount must be less than grossAmount');
  }

  const netAmount     = Number((params.grossAmount - params.feeAmount).toFixed(2));
  const invoiceNumber = await generateInvoiceNumber();

  return createInvoice({
    invoiceNumber,
    publisherId:  params.publisherId,
    periodStart:  params.periodStart,
    periodEnd:    params.periodEnd,
    grossAmount:  params.grossAmount,
    feeAmount:    params.feeAmount,
    netAmount,
    payoutMethod: params.payoutMethod,
    notes:        params.notes,
  });
}

export async function payInvoice(params: {
  invoiceId: string;
  description?: string;
}): Promise<{ invoice: InvoiceRow; wallet_transaction_id: string }> {
  if (!params.invoiceId) throw new Error('invoiceId is required');
  const description = params.description?.trim() || 'Invoice payout';
  return markInvoicePaid({ invoiceId: params.invoiceId, description });
}

export async function holdInvoice(id: string): Promise<InvoiceRow> {
  const result = await setInvoiceStatus(id, 'HOLD');
  if (!result) throw new Error('Invoice not found or already paid');
  return result;
}

export async function unholdInvoice(id: string): Promise<InvoiceRow> {
  const result = await setInvoiceStatus(id, 'PENDING');
  if (!result) throw new Error('Invoice not found or already paid');
  return result;
}

export async function editInvoice(
  id: string,
  params: {
    periodStart?:  string;
    periodEnd?:    string;
    grossAmount?:  number;
    feeAmount?:    number;
    payoutMethod?: string | null;
    notes?:        string | null;
  }
): Promise<InvoiceRow> {
  const hasGross = params.grossAmount !== undefined;
  const hasFee   = params.feeAmount   !== undefined;

  if (hasGross || hasFee) {
    const current = await getInvoiceById(id);
    if (!current) throw new Error('Invoice not found');
    if (current.status === 'PAID') throw new Error('Paid invoices cannot be edited');

    const gross = hasGross ? params.grossAmount! : Number(current.gross_amount);
    const fee   = hasFee   ? params.feeAmount!   : Number(current.fee_amount);

    if (!(gross > 0))  throw new Error('grossAmount must be a positive number');
    if (fee < 0)       throw new Error('feeAmount must be non-negative');
    if (fee >= gross)  throw new Error('feeAmount must be less than grossAmount');

    const result = await updateInvoiceRepo(id, {
      ...params,
      grossAmount: gross,
      feeAmount:   fee,
      netAmount:   Number((gross - fee).toFixed(2)),
    });
    if (!result) throw new Error('Invoice not found or already paid');
    return result;
  }

  const result = await updateInvoiceRepo(id, params);
  if (!result) throw new Error('Invoice not found or already paid');
  return result;
}

export async function removeInvoice(id: string): Promise<void> {
  const deleted = await deleteInvoiceRepo(id);
  if (!deleted) throw new Error('Invoice not found or already paid');
}
