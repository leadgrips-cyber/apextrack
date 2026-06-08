import { PostbackRequestPayload } from "../types/postback.js";
import * as postbackRepository from "../repositories/postback.repository.js";
import * as publisherPostbackService from "./publisher-postback.service.js";

const ALLOWED_STATUSES = ['pending', 'approved', 'rejected'] as const;

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

export async function handlePostback(payload: PostbackRequestPayload, rawPayload: Record<string, unknown>) {
  if (!payload.click_id) {
    throw new Error('click_id is required');
  }

  const status = validateStatus(payload.status);
  const payoutAmount = parseNumericValue(payload.payout, 'payout');
  const revenueAmount = parseNumericValue(payload.revenue, 'revenue');
  const transactionId = payload.transaction_id;
  if (!transactionId) {
    throw new Error('transaction_id is required');
  }

  const click = await postbackRepository.findClickById(payload.click_id);
  if (!click) {
    throw new Error('Click not found');
  }

  const alreadyExists = await postbackRepository.conversionExists(payload.click_id);
  if (alreadyExists) {
    throw new Error('Conversion already exists for this click');
  }

  const wallet = await postbackRepository.findWalletByPublisher(click.publisher_id);
  if (!wallet) {
    throw new Error('Publisher wallet not found');
  }

  let availableDelta = 0;
  let pendingDelta = 0;
  let transactionType = 'ADJUSTMENT';
  let description = 'Conversion recorded';
  if (status === 'pending') {
    pendingDelta = payoutAmount;
    transactionType = 'HOLD';
    description = 'Pending conversion credit';
  } else if (status === 'approved') {
    availableDelta = payoutAmount;
    transactionType = 'CREDIT';
    description = 'Approved conversion credit';
  } else {
    transactionType = 'ADJUSTMENT';
    description = 'Rejected conversion recorded';
  }

  const result = await postbackRepository.runTransaction(async (client) => {
    const conversion = await postbackRepository.createConversion(client, {
      click_id: payload.click_id,
      offer_id: click.offer_id,
      publisher_id: click.publisher_id,
      payout_amount: payoutAmount,
      revenue_amount: revenueAmount,
      status,
      transactionId,
      payload: rawPayload,
    });

    const updatedWallet = await postbackRepository.updateWalletBalance(client, wallet.id, {
      availableDelta,
      pendingDelta,
    });

    const balanceAfter = status === 'approved'
      ? Number(updatedWallet.available_balance)
      : status === 'pending'
      ? Number(updatedWallet.pending_balance)
      : Number(updatedWallet.available_balance);

    await postbackRepository.createWalletTransaction(client, {
      wallet_id: updatedWallet.id,
      publisher_id: click.publisher_id,
      conversion_id: conversion.id,
      offer_id: click.offer_id,
      transaction_type: transactionType,
      amount: status === 'rejected' ? 0 : payoutAmount,
      currency: updatedWallet.currency,
      balance_after: balanceAfter,
      reference_type: 'S2S_POSTBACK',
      description,
      metadata: {
        transactionId,
        status,
      },
    });

    await postbackRepository.savePostbackLog(client, {
      conversion_id: conversion.id,
      click_id: click.click_id,
      offer_id: click.offer_id,
      publisher_id: click.publisher_id,
      payload: rawPayload,
      status: status.toUpperCase(),
    });

    return conversion;
  });

  await publisherPostbackService.processPublisherPostbacksForConversion(click, result, status);
  return result;
}
