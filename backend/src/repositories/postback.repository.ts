import { PoolClient } from 'pg';
import { query, pool } from "../db/index.js";
import { ConversionRecord, PostbackLogRecord, WalletRecord, WalletTransactionRecord, PostbackRequestPayload } from "../types/postback.js";

export async function findClickById(clickId: string) {
  const result = await query<{
    click_id: string;
    offer_id: number;
    publisher_id: string;
    sub1?: string;
    sub2?: string;
    sub3?: string;
    sub4?: string;
    sub5?: string;
  }>(
    'SELECT click_id, offer_id, publisher_id, sub1, sub2, sub3, sub4, sub5 FROM clicks WHERE click_id = $1 LIMIT 1',
    [clickId]
  );
  return result.rows[0] || null;
}

export async function conversionExists(clickId: string) {
  const result = await query<{ id: string }>(
    'SELECT id FROM conversions WHERE click_id = $1 LIMIT 1',
    [clickId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function findWalletByPublisher(publisherId: string) {
  const result = await query<WalletRecord>(
    'SELECT * FROM wallets WHERE publisher_id = $1 LIMIT 1',
    [publisherId]
  );
  return result.rows[0] || null;
}

export async function createConversion(client: PoolClient, params: {
  click_id: string;
  offer_id: number;
  publisher_id: string;
  payout_amount: number;
  revenue_amount: number;
  status: string;
  transactionId: string;
  payload: Record<string, unknown>;
}) {
  const result = await client.query<ConversionRecord>(
    `INSERT INTO conversions (
       click_id,
       offer_id,
       publisher_id,
       conversion_type,
       conversion_status,
       event_timestamp,
       validated_at,
       payout_amount,
       revenue_amount,
       currency,
       revenue_currency,
       external_reference,
       s2s_payload,
       created_at,
       updated_at
     ) VALUES ($1,$2,$3,$4,$5,NOW(),NULL,$6,$7,$8,$9,$10,$11,NOW(),NOW())
     RETURNING *`,
    [
      params.click_id,
      params.offer_id,
      params.publisher_id,
      'S2S',
      params.status.toUpperCase(),
      params.payout_amount,
      params.revenue_amount,
      'USD',
      'USD',
      params.transactionId,
      params.payload,
    ]
  );
  return result.rows[0];
}

export async function updateWalletBalance(client: PoolClient, walletId: string, update: { availableDelta: number; pendingDelta: number }) {
  const result = await client.query<WalletRecord>(
    `UPDATE wallets
       SET available_balance = available_balance + $1,
           pending_balance = pending_balance + $2,
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
    [update.availableDelta, update.pendingDelta, walletId]
  );
  return result.rows[0];
}

export async function createWalletTransaction(client: PoolClient, params: {
  wallet_id: string;
  publisher_id: string;
  conversion_id: string;
  offer_id: number;
  transaction_type: string;
  amount: number;
  currency: string;
  balance_after: number;
  reference_type: string;
  description: string;
  metadata: Record<string, unknown>;
}) {
  const result = await client.query<WalletTransactionRecord>(
    `INSERT INTO wallet_transactions (
       wallet_id,
       publisher_id,
       conversion_id,
       offer_id,
       transaction_type,
       amount,
       currency,
       balance_after,
       reference_type,
       description,
       metadata,
       created_at,
       updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW(),NOW())
     RETURNING *`,
    [
      params.wallet_id,
      params.publisher_id,
      params.conversion_id,
      params.offer_id,
      params.transaction_type,
      params.amount,
      params.currency,
      params.balance_after,
      params.reference_type,
      params.description,
      params.metadata,
    ]
  );
  return result.rows[0];
}

export async function savePostbackLog(client: PoolClient, params: {
  conversion_id: string;
  click_id: string;
  offer_id: number;
  publisher_id: string;
  payload: Record<string, unknown>;
  status: string;
}) {
  const result = await client.query<PostbackLogRecord>(
    `INSERT INTO postbacks (
       conversion_id,
       offer_id,
       publisher_id,
       destination_url,
       payload,
       status,
       attempt_count,
       created_at,
       updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,1,NOW(),NOW())
     RETURNING *`,
    [
      params.conversion_id,
      params.offer_id,
      params.publisher_id,
      '',
      params.payload,
      params.status.toUpperCase(),
    ]
  );
  return result.rows[0];
}

export async function runTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
