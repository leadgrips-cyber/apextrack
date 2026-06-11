import * as payoutsRepository from "../repositories/payouts.repository.js";

function formatCurrency(value: unknown): string {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(2) : '0.00';
}

export interface PayoutsSummaryResponse {
  total_available_balance: string;
  total_pending_balance: string;
  total_withdrawn_balance: string;
}

export async function getPayoutsSummary(): Promise<PayoutsSummaryResponse> {
  const raw = await payoutsRepository.getPayoutsSummary();
  return {
    total_available_balance: formatCurrency(raw.total_available_balance),
    total_pending_balance:   formatCurrency(raw.total_pending_balance),
    total_withdrawn_balance: formatCurrency(raw.total_withdrawn_balance),
  };
}

export async function getPublishersWithBalances(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  minAvailable?: number;
}): Promise<{
  publishers: payoutsRepository.PublisherWithBalance[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page     = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(Math.max(1, Number(params.pageSize) || 25), 100);

  const { rows, total } = await payoutsRepository.getPublishersWithBalances({
    page,
    pageSize,
    search:       params.search,
    minAvailable: params.minAvailable,
  });

  return { publishers: rows, total, page, pageSize };
}

export async function getWalletTransactions(params: {
  page?: number;
  pageSize?: number;
  publisherId?: string;
  transactionType?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  transactions: payoutsRepository.WalletTransactionRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const page     = Math.max(1, Number(params.page) || 1);
  const pageSize = Math.min(Math.max(1, Number(params.pageSize) || 25), 100);

  const { rows, total } = await payoutsRepository.getWalletTransactions({
    page,
    pageSize,
    publisherId:     params.publisherId,
    transactionType: params.transactionType,
    startDate:       params.startDate,
    endDate:         params.endDate,
  });

  return { transactions: rows, total, page, pageSize };
}

export async function processManualPayout(params: {
  publisherId: string;
  amount: number;
  description?: string;
}): Promise<{
  wallet_transaction_id: string;
  new_available_balance: string;
  new_withdrawn_balance: string;
}> {
  if (!params.publisherId) {
    throw new Error('publisher_id is required');
  }
  if (!Number.isFinite(params.amount) || params.amount <= 0) {
    throw new Error('amount must be a positive number');
  }

  return payoutsRepository.processManualPayout({
    publisherId: params.publisherId,
    amount:      params.amount,
    description: params.description || 'Manual payout processed by admin',
  });
}
