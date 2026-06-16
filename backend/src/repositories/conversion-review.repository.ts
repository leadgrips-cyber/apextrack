import { query } from "../db/index.js";
import * as postbackRepository from "./postback.repository.js";

function endDateClause(col: string, paramIdx: number): string {
  return `${col} < ($${paramIdx}::date + INTERVAL '1 day')`;
}

export interface ConversionReviewRecord {
  id: string;
  click_id: string;
  offer_id: number;
  offer_name: string;
  advertiser_name: string | null;
  publisher_id: string;
  publisher_email: string;
  publisher_name: string;
  payout_amount: string;
  revenue_amount: string;
  conversion_status: string;
  event_timestamp: string;
  validated_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export async function listConversionsForReview(filters: {
  status?: string;
  startDate?: string;
  endDate?: string;
  offerId?: number;
  publisherId?: string;
  publisherEmail?: string;
  search?: string;
  page: number;
  pageSize: number;
}): Promise<{ rows: ConversionReviewRecord[]; total: number }> {
  const clauses: string[] = [];
  const p: unknown[] = [];

  if (filters.status) {
    p.push(filters.status.toUpperCase());
    clauses.push(`c.conversion_status = $${p.length}`);
  }
  if (filters.startDate) {
    p.push(filters.startDate);
    clauses.push(`c.event_timestamp >= $${p.length}`);
  }
  if (filters.endDate) {
    p.push(filters.endDate);
    clauses.push(endDateClause('c.event_timestamp', p.length));
  }
  if (filters.offerId) {
    p.push(filters.offerId);
    clauses.push(`c.offer_id = $${p.length}`);
  }
  if (filters.publisherId) {
    p.push(filters.publisherId);
    clauses.push(`c.publisher_id = $${p.length}`);
  }
  if (filters.publisherEmail) {
    p.push(`%${filters.publisherEmail}%`);
    clauses.push(`p.email ILIKE $${p.length}`);
  }
  if (filters.search) {
    p.push(`%${filters.search}%`);
    const idx = p.length;
    clauses.push(`(o.name ILIKE $${idx} OR p.email ILIKE $${idx} OR c.id::TEXT ILIKE $${idx})`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const countP = [...p];

  p.push(filters.pageSize, (filters.page - 1) * filters.pageSize);
  const limitIdx = p.length - 1;
  const offsetIdx = p.length;

  const [rowsResult, countResult] = await Promise.all([
    query<ConversionReviewRecord>(
      `SELECT
         c.id,
         c.click_id,
         c.offer_id,
         o.name AS offer_name,
         a.company_name AS advertiser_name,
         c.publisher_id,
         p.email AS publisher_email,
         p.full_name AS publisher_name,
         c.payout_amount::TEXT,
         c.revenue_amount::TEXT,
         c.conversion_status,
         c.event_timestamp,
         c.validated_at,
         c.rejected_at,
         c.rejection_reason,
         c.created_at
       FROM conversions c
       JOIN offers o ON c.offer_id = o.id
       LEFT JOIN advertisers a ON o.advertiser_id = a.id
       JOIN publishers p ON c.publisher_id = p.id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      p
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) FROM conversions c
       JOIN offers o ON c.offer_id = o.id
       LEFT JOIN advertisers a ON o.advertiser_id = a.id
       JOIN publishers p ON c.publisher_id = p.id
       ${where}`,
      countP
    ),
  ]);

  return { rows: rowsResult.rows, total: Number(countResult.rows[0]?.count ?? 0) };
}

export async function findConversionById(id: string) {
  const result = await query<{
    id: string;
    publisher_id: string;
    offer_id: number;
    payout_amount: string;
    conversion_status: string;
  }>(
    `SELECT id, publisher_id, offer_id, payout_amount::TEXT, conversion_status
     FROM conversions WHERE id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function approveConversion(id: string): Promise<{ conversion: ConversionReviewRecord; walletUpdated: boolean }> {
  const conversion = await findConversionById(id);
  if (!conversion) {
    throw new Error('Conversion not found');
  }
  if (conversion.conversion_status !== 'PENDING') {
    throw new Error(`Conversion is already ${conversion.conversion_status.toLowerCase()}, cannot approve`);
  }

  const wallet = await postbackRepository.findWalletByPublisher(conversion.publisher_id);
  if (!wallet) {
    throw new Error('Publisher wallet not found');
  }

  const payoutAmount = Number(conversion.payout_amount);

  await postbackRepository.runTransaction(async (client) => {
    // Approve: move from pending_balance to available_balance
    const updatedWallet = await postbackRepository.updateWalletBalance(client, wallet.id, {
      availableDelta: payoutAmount,
      pendingDelta: -payoutAmount,
    });

    await client.query(
      `UPDATE conversions
       SET conversion_status = 'APPROVED', validated_at = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    await postbackRepository.createWalletTransaction(client, {
      wallet_id: updatedWallet.id,
      publisher_id: conversion.publisher_id,
      conversion_id: id,
      offer_id: conversion.offer_id,
      transaction_type: 'CREDIT',
      amount: payoutAmount,
      currency: updatedWallet.currency,
      balance_after: Number(updatedWallet.available_balance),
      reference_type: 'MANUAL_APPROVAL',
      description: 'Conversion approved by admin',
      metadata: { conversion_id: id },
    });
  });

  const updated = await query<ConversionReviewRecord>(
    `SELECT
       c.id, c.click_id, c.offer_id,
       o.name AS offer_name,
       a.company_name AS advertiser_name,
       c.publisher_id,
       p.email AS publisher_email,
       p.full_name AS publisher_name,
       c.payout_amount::TEXT,
       c.revenue_amount::TEXT,
       c.conversion_status,
       c.event_timestamp,
       c.validated_at,
       c.rejected_at,
       c.rejection_reason,
       c.created_at
     FROM conversions c
     JOIN offers o ON c.offer_id = o.id
     LEFT JOIN advertisers a ON o.advertiser_id = a.id
     JOIN publishers p ON c.publisher_id = p.id
     WHERE c.id = $1`,
    [id]
  );

  return { conversion: updated.rows[0], walletUpdated: true };
}

export async function rejectConversion(id: string, rejectionReason: string): Promise<{ conversion: ConversionReviewRecord; walletUpdated: boolean }> {
  const conversion = await findConversionById(id);
  if (!conversion) {
    throw new Error('Conversion not found');
  }
  if (conversion.conversion_status !== 'PENDING') {
    throw new Error(`Conversion is already ${conversion.conversion_status.toLowerCase()}, cannot reject`);
  }

  const wallet = await postbackRepository.findWalletByPublisher(conversion.publisher_id);
  if (!wallet) {
    throw new Error('Publisher wallet not found');
  }

  const payoutAmount = Number(conversion.payout_amount);

  await postbackRepository.runTransaction(async (client) => {
    // Reject: remove from pending_balance, no available credit
    const updatedWallet = await postbackRepository.updateWalletBalance(client, wallet.id, {
      availableDelta: 0,
      pendingDelta: -payoutAmount,
    });

    await client.query(
      `UPDATE conversions
       SET conversion_status = 'REJECTED',
           rejected_at = NOW(),
           rejection_reason = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [id, rejectionReason || 'Rejected by admin']
    );

    await postbackRepository.createWalletTransaction(client, {
      wallet_id: updatedWallet.id,
      publisher_id: conversion.publisher_id,
      conversion_id: id,
      offer_id: conversion.offer_id,
      transaction_type: 'RELEASE',
      amount: payoutAmount,
      currency: updatedWallet.currency,
      balance_after: Number(updatedWallet.pending_balance),
      reference_type: 'MANUAL_REJECTION',
      description: 'Conversion rejected by admin — pending hold released',
      metadata: { conversion_id: id, rejection_reason: rejectionReason },
    });
  });

  const updated = await query<ConversionReviewRecord>(
    `SELECT
       c.id, c.click_id, c.offer_id,
       o.name AS offer_name,
       a.company_name AS advertiser_name,
       c.publisher_id,
       p.email AS publisher_email,
       p.full_name AS publisher_name,
       c.payout_amount::TEXT,
       c.revenue_amount::TEXT,
       c.conversion_status,
       c.event_timestamp,
       c.validated_at,
       c.rejected_at,
       c.rejection_reason,
       c.created_at
     FROM conversions c
     JOIN offers o ON c.offer_id = o.id
     LEFT JOIN advertisers a ON o.advertiser_id = a.id
     JOIN publishers p ON c.publisher_id = p.id
     WHERE c.id = $1`,
    [id]
  );

  return { conversion: updated.rows[0], walletUpdated: true };
}

// Statuses whose payout lives in pending_balance
const PENDING_STATUSES = ['PENDING'];
// Statuses whose payout lives in available_balance
const CREDITED_STATUSES = ['APPROVED', 'DISPUTED'];

function walletDeltas(
  oldStatus: string,
  newStatus: string,
  payout: number
): { pendingDelta: number; availableDelta: number; skipWallet: boolean } {
  const from = oldStatus.toUpperCase();
  const to = newStatus.toUpperCase();

  // PAID transitions are handled by the payout module — skip wallet here
  if (from === 'PAID' || to === 'PAID') {
    return { pendingDelta: 0, availableDelta: 0, skipWallet: true };
  }

  let pendingDelta = 0;
  let availableDelta = 0;

  if (PENDING_STATUSES.includes(from))  pendingDelta  -= payout;
  if (CREDITED_STATUSES.includes(from)) availableDelta -= payout;
  if (PENDING_STATUSES.includes(to))    pendingDelta  += payout;
  if (CREDITED_STATUSES.includes(to))   availableDelta += payout;

  return { pendingDelta, availableDelta, skipWallet: false };
}

export interface ConversionHistoryRow {
  id: string;
  old_status: string | null;
  new_status: string;
  changed_by_email: string | null;
  reason: string | null;
  created_at: string;
}

export async function updateConversionStatus(
  id: string,
  newStatus: string,
  adminId: string | null,
  adminEmail: string | null,
  reason: string | null
): Promise<{ conversion: ConversionReviewRecord; walletUpdated: boolean }> {
  const conversion = await findConversionById(id);
  if (!conversion) throw new Error('Conversion not found');

  const oldStatus = conversion.conversion_status;
  const normalizedNew = newStatus.toUpperCase();
  const validStatuses = ['REVIEW_QUEUE', 'PENDING', 'APPROVED', 'REJECTED', 'DISPUTED', 'PAID'];
  if (!validStatuses.includes(normalizedNew)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }
  if (oldStatus === normalizedNew) {
    throw new Error(`Conversion is already ${normalizedNew}`);
  }

  const payoutAmount = Number(conversion.payout_amount);
  const { pendingDelta, availableDelta, skipWallet } = walletDeltas(oldStatus, normalizedNew, payoutAmount);

  const wallet = await postbackRepository.findWalletByPublisher(conversion.publisher_id);
  if (!wallet) throw new Error('Publisher wallet not found');

  await postbackRepository.runTransaction(async (client) => {
    // Build UPDATE fields
    const setFields: string[] = [
      `conversion_status = '${normalizedNew}'`,
      `updated_at = NOW()`,
    ];
    if (normalizedNew === 'APPROVED') {
      setFields.push(`validated_at = NOW()`);
    } else if (normalizedNew === 'REJECTED') {
      setFields.push(`rejected_at = NOW()`);
      if (reason) setFields.push(`rejection_reason = ${client.escapeLiteral ? client.escapeLiteral(reason) : `'${reason.replace(/'/g, "''")}'`}`);
    }

    await client.query(
      `UPDATE conversions SET ${setFields.join(', ')} WHERE id = $1`,
      [id]
    );

    // Audit trail
    await client.query(
      `INSERT INTO conversion_status_history
         (conversion_id, old_status, new_status, changed_by_admin_id, changed_by_email, reason, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [id, oldStatus, normalizedNew, adminId, adminEmail, reason]
    );

    if (!skipWallet && (pendingDelta !== 0 || availableDelta !== 0)) {
      const updatedWallet = await postbackRepository.updateWalletBalance(client, wallet.id, {
        availableDelta,
        pendingDelta,
      });

      const txType = availableDelta > 0 ? 'CREDIT'
        : availableDelta < 0 ? 'ADJUSTMENT'
        : pendingDelta > 0 ? 'HOLD'
        : 'RELEASE';

      const amount = Math.abs(availableDelta) || Math.abs(pendingDelta);
      const balanceAfter = availableDelta !== 0
        ? Number(updatedWallet.available_balance)
        : Number(updatedWallet.pending_balance);

      await postbackRepository.createWalletTransaction(client, {
        wallet_id: updatedWallet.id,
        publisher_id: conversion.publisher_id,
        conversion_id: id,
        offer_id: conversion.offer_id,
        transaction_type: txType,
        amount,
        currency: updatedWallet.currency,
        balance_after: balanceAfter,
        reference_type: 'ADMIN_STATUS_CHANGE',
        description: `Conversion status changed: ${oldStatus} → ${normalizedNew}`,
        metadata: { old_status: oldStatus, new_status: normalizedNew, admin_email: adminEmail, reason },
      });
    }
  });

  const updated = await query<ConversionReviewRecord>(
    `SELECT
       c.id, c.click_id, c.offer_id,
       o.name AS offer_name,
       a.company_name AS advertiser_name,
       c.publisher_id,
       p.email AS publisher_email,
       p.full_name AS publisher_name,
       c.payout_amount::TEXT,
       c.revenue_amount::TEXT,
       c.conversion_status,
       c.event_timestamp,
       c.validated_at,
       c.rejected_at,
       c.rejection_reason,
       c.created_at
     FROM conversions c
     JOIN offers o ON c.offer_id = o.id
     LEFT JOIN advertisers a ON o.advertiser_id = a.id
     JOIN publishers p ON c.publisher_id = p.id
     WHERE c.id = $1`,
    [id]
  );

  return { conversion: updated.rows[0], walletUpdated: !skipWallet && (pendingDelta !== 0 || availableDelta !== 0) };
}

export async function getConversionHistory(id: string): Promise<ConversionHistoryRow[]> {
  const result = await query<ConversionHistoryRow>(
    `SELECT id, old_status, new_status, changed_by_email, reason, created_at
     FROM conversion_status_history
     WHERE conversion_id = $1
     ORDER BY created_at ASC`,
    [id]
  );
  return result.rows;
}
