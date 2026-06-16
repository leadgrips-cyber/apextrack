import { PostbackRequestPayload } from "../types/postback.js";
import * as postbackRepository from "../repositories/postback.repository.js";
import * as publisherPostbackService from "./publisher-postback.service.js";
import { checkConversionCaps } from "./caps.service.js";

const ALLOWED_STATUSES = ['pending', 'approved', 'rejected', 'review_queue'] as const;
type AllowedStatus = typeof ALLOWED_STATUSES[number];

function parseNumericValue(value: string, name: string) {
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric < 0) {
    throw new Error(`${name} must be a non-negative number`);
  }
  return numeric;
}

function validateStatus(status: string): AllowedStatus {
  const normalized = status.toLowerCase();
  if (!ALLOWED_STATUSES.includes(normalized as AllowedStatus)) {
    throw new Error('Invalid status; expected pending, approved, or rejected');
  }
  return normalized as AllowedStatus;
}

function walletDeltas(status: string, payoutAmount: number) {
  if (status === 'review_queue') {
    return { availableDelta: 0, pendingDelta: 0, transactionType: 'ADJUSTMENT', description: 'New conversion queued for admin review', balanceField: 'none' as const, txAmount: 0 };
  }
  if (status === 'pending') {
    return { availableDelta: 0, pendingDelta: payoutAmount, transactionType: 'HOLD', description: 'Pending conversion credit', balanceField: 'pending' as const, txAmount: payoutAmount };
  }
  if (status === 'approved') {
    return { availableDelta: payoutAmount, pendingDelta: 0, transactionType: 'CREDIT', description: 'Approved conversion credit', balanceField: 'available' as const, txAmount: payoutAmount };
  }
  return { availableDelta: 0, pendingDelta: 0, transactionType: 'ADJUSTMENT', description: 'Rejected conversion recorded', balanceField: 'none' as const, txAmount: 0 };
}

export async function handlePostback(payload: PostbackRequestPayload, rawPayload: Record<string, unknown>) {
  if (!payload.click_id) throw new Error('click_id is required');

  const click = await postbackRepository.findClickById(payload.click_id);
  if (!click) throw new Error('Click not found');

  // ── Event-based flow ────────────────────────────────────────────────────────
  if (payload.event?.trim()) {
    const eventToken = payload.event.trim().toLowerCase();
    const eventConfig = await postbackRepository.findActiveEventByToken(click.offer_id, eventToken);
    if (!eventConfig) {
      throw new Error(`Event "${eventToken}" not found or inactive for this offer`);
    }

    const alreadyExists = await postbackRepository.conversionExistsForEvent(payload.click_id, eventConfig.id);
    if (alreadyExists) {
      throw new Error(`Conversion already exists for click ${payload.click_id} and event "${eventToken}"`);
    }

    // Offer is the single financial source — event only controls approval workflow
    const offerFinancials = await postbackRepository.findOfferPayoutAmount(click.offer_id);
    const payoutAmount  = offerFinancials ? Number(offerFinancials.payout_amount) : 0;
    const revenueAmount = 0;
    const status: AllowedStatus = eventConfig.approval_mode === 'MANUAL_REVIEW' ? 'review_queue' : 'approved';

    const transactionId = payload.transaction_id?.trim() || `${payload.click_id}-${eventToken}`;

    const wallet = await postbackRepository.findWalletByPublisher(click.publisher_id);
    if (!wallet) throw new Error('Publisher wallet not found');

    // ── Conversion cap enforcement ────────────────────────────────────────────
    const convCapResult = await checkConversionCaps(click.offer_id);
    if (convCapResult.blocked) {
      throw Object.assign(new Error(convCapResult.reason), { code: 'CONVERSION_CAP_REACHED' });
    }

    const { availableDelta, pendingDelta, transactionType, description, balanceField, txAmount } = walletDeltas(status, payoutAmount);

    const conversion = await postbackRepository.runTransaction(async (client) => {
      const created = await postbackRepository.createConversion(client, {
        click_id: payload.click_id,
        offer_id: click.offer_id,
        publisher_id: click.publisher_id,
        offer_event_id: eventConfig.id,
        payout_amount: payoutAmount,
        revenue_amount: revenueAmount,
        status,
        transactionId,
        payload: rawPayload,
      });

      const updatedWallet = await postbackRepository.updateWalletBalance(client, wallet.id, { availableDelta, pendingDelta });

      const balanceAfter = balanceField === 'available'
        ? Number(updatedWallet.available_balance)
        : balanceField === 'pending'
        ? Number(updatedWallet.pending_balance)
        : 0;

      await postbackRepository.createWalletTransaction(client, {
        wallet_id: updatedWallet.id,
        publisher_id: click.publisher_id,
        conversion_id: created.id,
        offer_id: click.offer_id,
        transaction_type: transactionType,
        amount: txAmount,
        currency: updatedWallet.currency,
        balance_after: balanceAfter,
        reference_type: 'S2S_POSTBACK',
        description,
        metadata: { transactionId, status, approvalMode: eventConfig.approval_mode, eventToken, eventId: eventConfig.id, payoutSource: 'offer' },
      });

      return created;
    });

    try {
      await publisherPostbackService.enqueuePublisherPostbacks(click, conversion, status);
    } catch (err) {
      console.error('[postback] Failed to enqueue publisher postbacks:', err);
    }

    return conversion;
  }

  // ── Legacy flow (no event param) ────────────────────────────────────────────
  const advertiserStatus = validateStatus(payload.status);
  const payoutAmount  = parseNumericValue(payload.payout, 'payout');
  const revenueAmount = parseNumericValue(payload.revenue, 'revenue');
  const transactionId = payload.transaction_id;
  if (!transactionId) throw new Error('transaction_id is required');

  const alreadyExists = await postbackRepository.conversionExists(payload.click_id);
  if (alreadyExists) throw new Error('Conversion already exists for this click');

  const approvalMode = await postbackRepository.findOfferApprovalMode(click.offer_id);
  const status: AllowedStatus = approvalMode === 'MANUAL_REVIEW' ? 'review_queue' : advertiserStatus;

  const wallet = await postbackRepository.findWalletByPublisher(click.publisher_id);
  if (!wallet) throw new Error('Publisher wallet not found');

  // ── Conversion cap enforcement ──────────────────────────────────────────────
  const convCapResult = await checkConversionCaps(click.offer_id);
  if (convCapResult.blocked) {
    throw Object.assign(new Error(convCapResult.reason), { code: 'CONVERSION_CAP_REACHED' });
  }

  const { availableDelta, pendingDelta, transactionType, description, balanceField, txAmount } = walletDeltas(status, payoutAmount);

  const conversion = await postbackRepository.runTransaction(async (client) => {
    const created = await postbackRepository.createConversion(client, {
      click_id: payload.click_id,
      offer_id: click.offer_id,
      publisher_id: click.publisher_id,
      offer_event_id: null,
      payout_amount: payoutAmount,
      revenue_amount: revenueAmount,
      status,
      transactionId,
      payload: rawPayload,
    });

    const updatedWallet = await postbackRepository.updateWalletBalance(client, wallet.id, { availableDelta, pendingDelta });

    const balanceAfter = balanceField === 'available'
      ? Number(updatedWallet.available_balance)
      : balanceField === 'pending'
      ? Number(updatedWallet.pending_balance)
      : 0;

    await postbackRepository.createWalletTransaction(client, {
      wallet_id: updatedWallet.id,
      publisher_id: click.publisher_id,
      conversion_id: created.id,
      offer_id: click.offer_id,
      transaction_type: transactionType,
      amount: txAmount,
      currency: updatedWallet.currency,
      balance_after: balanceAfter,
      reference_type: 'S2S_POSTBACK',
      description,
      metadata: { transactionId, status, approvalMode },
    });

    return created;
  });

  try {
    await publisherPostbackService.enqueuePublisherPostbacks(click, conversion, status);
  } catch (err) {
    console.error('[postback] Failed to enqueue publisher postbacks:', err);
  }

  return conversion;
}
