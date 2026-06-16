const API_URL = "/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: authHeaders() });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || `Request failed: ${response.status}`);
  }
  return response.json();
}

export interface RevenueSummary {
  total_publishers: number;
  active_publishers: number;
  total_offers: number;
  active_offers: number;
  total_clicks: number;
  total_conversions: number;
  total_revenue: string;
  total_payout: string;
  profit: string;
}

export interface RevenueByOffer {
  offer_id: number;
  offer_name: string;
  slug: string;
  category: string;
  total_clicks: number;
  total_conversions: number;
  total_revenue: string;
  total_payout: string;
  profit: string;
}

export interface RevenueTransaction {
  id: string;
  click_id: string;
  offer_id: number;
  offer_name: string;
  publisher_id: string;
  publisher_email: string;
  conversion_status: string;
  payout_amount: string;
  revenue_amount: string;
  profit: string;
  event_timestamp: string;
  created_at: string;
}

export async function getRevenueSummary(startDate?: string, endDate?: string): Promise<RevenueSummary> {
  const qs = new URLSearchParams();
  if (startDate) qs.set("start_date", startDate);
  if (endDate)   qs.set("end_date",   endDate);
  const data = await fetchJSON<{ summary: RevenueSummary }>(
    `${API_URL}/analytics/dashboard/summary?${qs.toString()}`
  );
  return data.summary;
}

export async function getRevenueByOffer(params: {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ offers: RevenueByOffer[]; total: number; page: number; pageSize: number }> {
  const qs = new URLSearchParams();
  if (params.page)      qs.set("page",      String(params.page));
  if (params.pageSize)  qs.set("page_size", String(params.pageSize));
  if (params.sortBy)    qs.set("sort_by",   params.sortBy);
  if (params.sortDir)   qs.set("sort_dir",  params.sortDir);
  if (params.startDate) qs.set("start_date", params.startDate);
  if (params.endDate)   qs.set("end_date",   params.endDate);
  return fetchJSON(`${API_URL}/analytics/finance/revenue-by-offer?${qs.toString()}`);
}

export async function getRevenueTransactions(params: {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  offerId?: number;
  publisherId?: string;
}): Promise<{ transactions: RevenueTransaction[]; total: number; page: number; pageSize: number }> {
  const qs = new URLSearchParams();
  if (params.page)        qs.set("page",         String(params.page));
  if (params.pageSize)    qs.set("page_size",     String(params.pageSize));
  if (params.startDate)   qs.set("start_date",    params.startDate);
  if (params.endDate)     qs.set("end_date",       params.endDate);
  if (params.status)      qs.set("status",         params.status);
  if (params.offerId)     qs.set("offer_id",       String(params.offerId));
  if (params.publisherId) qs.set("publisher_id",   params.publisherId);
  return fetchJSON(`${API_URL}/analytics/finance/transactions?${qs.toString()}`);
}

// ─── Payouts ─────────────────────────────────────────────────────────────────

export interface PayoutsSummary {
  total_available_balance: string;
  total_pending_balance: string;
  total_withdrawn_balance: string;
}

export interface PublisherWithBalance {
  publisher_id: string;
  full_name: string;
  email: string;
  affiliate_code: string;
  currency: string;
  available_balance: string;
  pending_balance: string;
  withdrawn_balance: string;
}

export interface WalletTransaction {
  id: string;
  publisher_id: string;
  publisher_email: string;
  publisher_name: string;
  wallet_id: string;
  transaction_type: string;
  amount: string;
  currency: string;
  balance_after: string;
  description: string;
  created_at: string;
}

export async function getPayoutsSummary(): Promise<PayoutsSummary> {
  const data = await fetchJSON<{ summary: PayoutsSummary }>(
    `${API_URL}/analytics/finance/payouts/summary`
  );
  return data.summary;
}

export async function getPublishersWithBalances(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  minAvailable?: number;
}): Promise<{ publishers: PublisherWithBalance[]; total: number; page: number; pageSize: number }> {
  const qs = new URLSearchParams();
  if (params.page)         qs.set("page",         String(params.page));
  if (params.pageSize)     qs.set("page_size",     String(params.pageSize));
  if (params.search)       qs.set("search",        params.search);
  if (params.minAvailable !== undefined) qs.set("min_available", String(params.minAvailable));
  return fetchJSON(`${API_URL}/analytics/finance/payouts/publishers?${qs.toString()}`);
}

export async function getWalletTransactions(params: {
  page?: number;
  pageSize?: number;
  publisherId?: string;
  transactionType?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ transactions: WalletTransaction[]; total: number; page: number; pageSize: number }> {
  const qs = new URLSearchParams();
  if (params.page)            qs.set("page",             String(params.page));
  if (params.pageSize)        qs.set("page_size",         String(params.pageSize));
  if (params.publisherId)     qs.set("publisher_id",      params.publisherId);
  if (params.transactionType) qs.set("transaction_type",  params.transactionType);
  if (params.startDate)       qs.set("start_date",        params.startDate);
  if (params.endDate)         qs.set("end_date",           params.endDate);
  return fetchJSON(`${API_URL}/analytics/finance/payouts/transactions?${qs.toString()}`);
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export interface InvoicesSummary {
  total_invoices: string;
  total_gross: string;
  pending_count: string;
  pending_gross: string;
  paid_count: string;
  paid_gross: string;
  hold_count: string;
  hold_gross: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  publisher_id: string;
  publisher_name: string;
  publisher_email: string;
  period_start: string;
  period_end: string;
  gross_amount: string;
  fee_amount: string;
  net_amount: string;
  status: "PENDING" | "PAID" | "HOLD";
  payout_method: string | null;
  notes: string | null;
  wallet_tx_id: string | null;
  generated_at: string;
  paid_at: string | null;
  created_at: string;
}

export async function getInvoicesSummary(): Promise<InvoicesSummary> {
  const data = await fetchJSON<{ summary: InvoicesSummary }>(
    `${API_URL}/analytics/finance/invoices/summary`
  );
  return data.summary;
}

export async function getInvoices(params: {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ invoices: Invoice[]; total: number; page: number; pageSize: number }> {
  const qs = new URLSearchParams();
  if (params.page)      qs.set("page",       String(params.page));
  if (params.pageSize)  qs.set("page_size",  String(params.pageSize));
  if (params.status)    qs.set("status",     params.status);
  if (params.search)    qs.set("search",     params.search);
  if (params.startDate) qs.set("start_date", params.startDate);
  if (params.endDate)   qs.set("end_date",   params.endDate);
  return fetchJSON(`${API_URL}/analytics/finance/invoices?${qs.toString()}`);
}

export async function createInvoice(params: {
  publisherId: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  feeAmount: number;
  payoutMethod?: string;
  notes?: string;
}): Promise<{ invoice: Invoice }> {
  const response = await fetch(`${API_URL}/analytics/finance/invoices`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      publisher_id:  params.publisherId,
      period_start:  params.periodStart,
      period_end:    params.periodEnd,
      gross_amount:  params.grossAmount,
      fee_amount:    params.feeAmount,
      payout_method: params.payoutMethod,
      notes:         params.notes,
    }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function markInvoicePaid(
  invoiceId: string,
  description?: string
): Promise<{ success: boolean; invoice: Invoice; wallet_transaction_id: string }> {
  const response = await fetch(`${API_URL}/analytics/finance/invoices/${invoiceId}/pay`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ description }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function holdInvoice(invoiceId: string): Promise<{ invoice: Invoice }> {
  const response = await fetch(`${API_URL}/analytics/finance/invoices/${invoiceId}/hold`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function unholdInvoice(invoiceId: string): Promise<{ invoice: Invoice }> {
  const response = await fetch(`${API_URL}/analytics/finance/invoices/${invoiceId}/unhold`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({}),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function updateInvoice(
  invoiceId: string,
  params: {
    periodStart?:  string;
    periodEnd?:    string;
    grossAmount?:  number;
    feeAmount?:    number;
    payoutMethod?: string | null;
    notes?:        string | null;
  }
): Promise<{ invoice: Invoice }> {
  const body: Record<string, unknown> = {};
  if (params.periodStart  !== undefined) body.period_start  = params.periodStart;
  if (params.periodEnd    !== undefined) body.period_end    = params.periodEnd;
  if (params.grossAmount  !== undefined) body.gross_amount  = params.grossAmount;
  if (params.feeAmount    !== undefined) body.fee_amount    = params.feeAmount;
  if ('payoutMethod' in params)          body.payout_method = params.payoutMethod;
  if ('notes' in params)                 body.notes         = params.notes;

  const response = await fetch(`${API_URL}/analytics/finance/invoices/${invoiceId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
  }
  return response.json();
}

export async function deleteInvoice(invoiceId: string): Promise<{ success: boolean }> {
  const response = await fetch(`${API_URL}/analytics/finance/invoices/${invoiceId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
  }
  return response.json();
}

// ─── Payouts (continued) ──────────────────────────────────────────────────────

export async function processManualPayout(params: {
  publisherId: string;
  amount: number;
  description?: string;
}): Promise<{
  success: boolean;
  wallet_transaction_id: string;
  new_available_balance: string;
  new_withdrawn_balance: string;
}> {
  const response = await fetch(`${API_URL}/analytics/finance/payouts/process`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      publisher_id: params.publisherId,
      amount:       params.amount,
      description:  params.description,
    }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message || `Request failed: ${response.status}`);
  }
  return response.json();
}
