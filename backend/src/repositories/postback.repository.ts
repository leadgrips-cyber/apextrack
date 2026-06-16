import { PoolClient } from 'pg';
import { query, pool } from "../db/index.js";
import { ConversionRecord, WalletRecord, WalletTransactionRecord } from "../types/postback.js";

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

// Legacy check (no event): one conversion per click
export async function conversionExists(clickId: string) {
  const result = await query<{ id: string }>(
    'SELECT id FROM conversions WHERE click_id = $1 AND offer_event_id IS NULL LIMIT 1',
    [clickId]
  );
  return (result.rowCount ?? 0) > 0;
}

// Event-based check: one conversion per (click, event)
export async function conversionExistsForEvent(clickId: string, offerEventId: string) {
  const result = await query<{ id: string }>(
    'SELECT id FROM conversions WHERE click_id = $1 AND offer_event_id = $2 LIMIT 1',
    [clickId, offerEventId]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function findActiveEventByToken(offerId: number, eventToken: string) {
  const result = await query<{
    id: string;
    event_token: string;
    event_name: string;
    approval_mode: 'AUTO_APPROVE' | 'MANUAL_REVIEW';
    is_active: boolean;
  }>(
    `SELECT id, event_token, event_name, approval_mode, is_active
     FROM offer_events
     WHERE offer_id = $1 AND event_token = $2 AND is_active = TRUE
     LIMIT 1`,
    [offerId, eventToken]
  );
  return result.rows[0] ?? null;
}

export async function findOfferPayoutAmount(offerId: number): Promise<{ payout_amount: string } | null> {
  const result = await query<{ payout_amount: string }>(
    'SELECT payout_amount FROM offers WHERE id = $1 LIMIT 1',
    [offerId]
  );
  return result.rows[0] ?? null;
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
  offer_event_id: string | null;
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
       offer_event_id,
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
     ) VALUES ($1,$2,$3,$4,$5,$6,NOW(),NULL,$7,$8,$9,$10,$11,$12,NOW(),NOW())
     RETURNING *`,
    [
      params.click_id,
      params.offer_id,
      params.publisher_id,
      params.offer_event_id,
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

export async function insertPostbackQueueEntry(params: {
  conversion_id: string;
  offer_id: number;
  publisher_id: string;
  publisher_postback_id: string;
  click_id: string;
  destination_url: string;
  http_method: string;
  payload: Record<string, string>;
}): Promise<void> {
  await query(
    `INSERT INTO postbacks (
       conversion_id,
       offer_id,
       publisher_id,
       publisher_postback_id,
       click_id,
       destination_url,
       http_method,
       payload,
       status,
       attempt_count,
       next_retry_at,
       created_at,
       updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'QUEUED',0,NOW(),NOW(),NOW())`,
    [
      params.conversion_id,
      params.offer_id,
      params.publisher_id,
      params.publisher_postback_id,
      params.click_id,
      params.destination_url,
      params.http_method,
      params.payload,
    ]
  );
}

export async function findOfferApprovalMode(offerId: number): Promise<'AUTO_APPROVE' | 'MANUAL_REVIEW'> {
  const result = await query<{ conversion_approval_mode: string }>(
    'SELECT conversion_approval_mode FROM offers WHERE id = $1 LIMIT 1',
    [offerId]
  );
  const mode = result.rows[0]?.conversion_approval_mode;
  return mode === 'MANUAL_REVIEW' ? 'MANUAL_REVIEW' : 'AUTO_APPROVE';
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
