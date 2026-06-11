import { PoolClient } from 'pg';
import { query, pool } from "../db/index.js";

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

export interface WalletTransactionRow {
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
  const result = await query<PayoutsSummary>(
    `SELECT
       COALESCE(SUM(available_balance), 0)::TEXT  AS total_available_balance,
       COALESCE(SUM(pending_balance),   0)::TEXT  AS total_pending_balance,
       COALESCE(SUM(withdrawn_balance), 0)::TEXT  AS total_withdrawn_balance
     FROM wallets`,
    []
  );
  return result.rows[0] || {
    total_available_balance: '0',
    total_pending_balance:   '0',
    total_withdrawn_balance: '0',
  };
}

export async function getPublishersWithBalances(params: {
  page: number;
  pageSize: number;
  search?: string;
  minAvailable?: number;
}): Promise<{ rows: PublisherWithBalance[]; total: number }> {
  const clauses: string[] = [];
  const p: unknown[] = [];

  if (params.search) {
    p.push(`%${params.search.toLowerCase()}%`);
    clauses.push(`(LOWER(pub.email) LIKE $${p.length} OR LOWER(pub.full_name) LIKE $${p.length})`);
  }

  if (params.minAvailable !== undefined && params.minAvailable > 0) {
    p.push(params.minAvailable);
    clauses.push(`w.available_balance >= $${p.length}`);
  }

  const where   = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const countP  = [...p];

  p.push(params.pageSize, (params.page - 1) * params.pageSize);
  const limitN  = p.length - 1;
  const offsetN = p.length;

  const [rowsResult, countResult] = await Promise.all([
    query<PublisherWithBalance>(
      `SELECT
         pub.id   AS publisher_id,
         pub.full_name,
         pub.email,
         pub.affiliate_code,
         w.currency,
         w.available_balance::TEXT,
         w.pending_balance::TEXT,
         w.withdrawn_balance::TEXT
       FROM wallets w
       JOIN publishers pub ON pub.id = w.publisher_id
       ${where}
       ORDER BY w.available_balance DESC
       LIMIT $${limitN} OFFSET $${offsetN}`,
      p
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)
       FROM wallets w
       JOIN publishers pub ON pub.id = w.publisher_id
       ${where}`,
      countP
    ),
  ]);

  return { rows: rowsResult.rows, total: Number(countResult.rows[0]?.count ?? 0) };
}

export async function getWalletTransactions(params: {
  page: number;
  pageSize: number;
  publisherId?: string;
  transactionType?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ rows: WalletTransactionRow[]; total: number }> {
  const clauses: string[] = [];
  const p: unknown[] = [];

  if (params.publisherId)     { p.push(params.publisherId);                   clauses.push(`wt.publisher_id = $${p.length}`); }
  if (params.transactionType) { p.push(params.transactionType.toUpperCase()); clauses.push(`wt.transaction_type = $${p.length}`); }
  if (params.startDate)       { p.push(params.startDate);                     clauses.push(`wt.created_at >= $${p.length}`); }
  if (params.endDate)         { p.push(params.endDate);                       clauses.push(`wt.created_at <= $${p.length}`); }

  const where  = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const countP = [...p];

  p.push(params.pageSize, (params.page - 1) * params.pageSize);
  const limitN  = p.length - 1;
  const offsetN = p.length;

  const [rowsResult, countResult] = await Promise.all([
    query<WalletTransactionRow>(
      `SELECT
         wt.id,
         wt.publisher_id,
         pub.email     AS publisher_email,
         pub.full_name AS publisher_name,
         wt.wallet_id,
         wt.transaction_type,
         wt.amount::TEXT,
         wt.currency,
         wt.balance_after::TEXT,
         COALESCE(wt.description, '') AS description,
         wt.created_at
       FROM wallet_transactions wt
       JOIN publishers pub ON pub.id = wt.publisher_id
       ${where}
       ORDER BY wt.created_at DESC
       LIMIT $${limitN} OFFSET $${offsetN}`,
      p
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) FROM wallet_transactions wt ${where}`,
      countP
    ),
  ]);

  return { rows: rowsResult.rows, total: Number(countResult.rows[0]?.count ?? 0) };
}

export async function processManualPayout(params: {
  publisherId: string;
  amount: number;
  description: string;
}): Promise<{
  wallet_transaction_id: string;
  new_available_balance: string;
  new_withdrawn_balance: string;
}> {
  const client: PoolClient = await pool.connect();
  try {
    await client.query('BEGIN');

    const walletResult = await client.query<{
      id: string;
      available_balance: string;
      withdrawn_balance: string;
      currency: string;
    }>(
      'SELECT id, available_balance, withdrawn_balance, currency FROM wallets WHERE publisher_id = $1 LIMIT 1 FOR UPDATE',
      [params.publisherId]
    );

    const wallet = walletResult.rows[0];
    if (!wallet) {
      throw new Error('Publisher wallet not found');
    }

    const available = Number(wallet.available_balance);
    if (params.amount > available) {
      throw new Error(
        `Insufficient balance. Available: ${available.toFixed(2)}, Requested: ${params.amount.toFixed(2)}`
      );
    }

    const updatedWallet = await client.query<{
      available_balance: string;
      withdrawn_balance: string;
    }>(
      `UPDATE wallets
         SET available_balance = available_balance - $1,
             withdrawn_balance = withdrawn_balance + $1,
             updated_at        = NOW()
         WHERE id = $2
         RETURNING available_balance, withdrawn_balance`,
      [params.amount, wallet.id]
    );

    const newBalances  = updatedWallet.rows[0];
    const balanceAfter = Number(newBalances.available_balance);

    const txResult = await client.query<{ id: string }>(
      `INSERT INTO wallet_transactions (
         wallet_id, publisher_id, transaction_type, amount, currency,
         balance_after, reference_type, description, metadata, created_at, updated_at
       ) VALUES ($1, $2, 'WITHDRAWAL', $3, $4, $5, 'MANUAL_PAYOUT', $6, '{}', NOW(), NOW())
       RETURNING id`,
      [
        wallet.id,
        params.publisherId,
        params.amount,
        wallet.currency,
        balanceAfter,
        params.description,
      ]
    );

    await client.query('COMMIT');

    return {
      wallet_transaction_id: txResult.rows[0].id,
      new_available_balance: newBalances.available_balance,
      new_withdrawn_balance: newBalances.withdrawn_balance,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
