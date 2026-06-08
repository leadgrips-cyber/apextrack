import * as publisherPostbackRepository from "../repositories/publisher-postback.repository.js";
import { PublisherPostbackCreatePayload, PublisherPostbackRecord, PublisherPostbackUpdatePayload } from "../types/publisherPostback.js";
import { ConversionRecord } from "../types/postback.js";
import { ClickRecord } from "../types/click.js";

type PublisherClickContext = Pick<ClickRecord, 'click_id' | 'offer_id' | 'publisher_id' | 'sub1' | 'sub2' | 'sub3' | 'sub4' | 'sub5'>;

const TOKEN_PATTERN = /\{(click_id|offer_id|publisher_id|payout|revenue|status|sub1|sub2|sub3|sub4|sub5)\}/gi;

function formatTokenValue(value: unknown) {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value);
}

function replaceTokens(url: string, variables: Record<string, string>): string {
  return url.replace(TOKEN_PATTERN, (_, token) => {
    return variables[token.toLowerCase()] ?? '';
  });
}

function buildPostbackVariables(
  click: PublisherClickContext,
  conversion: ConversionRecord,
  status: string
): Record<string, string> {
  return {
    click_id: click.click_id,
    offer_id: String(click.offer_id),
    publisher_id: click.publisher_id,
    payout: String(conversion.payout_amount),
    revenue: String(conversion.revenue_amount),
    status,
    sub1: formatTokenValue(click.sub1),
    sub2: formatTokenValue(click.sub2),
    sub3: formatTokenValue(click.sub3),
    sub4: formatTokenValue(click.sub4),
    sub5: formatTokenValue(click.sub5),
  };
}

export async function createPublisherPostback(
  publisherId: string,
  payload: PublisherPostbackCreatePayload
): Promise<PublisherPostbackRecord> {
  if (!payload.callback_url?.trim()) {
    throw new Error('callback_url is required');
  }

  return publisherPostbackRepository.insertPublisherPostback(publisherId, payload);
}

export async function updatePublisherPostback(
  publisherId: string,
  id: string,
  payload: PublisherPostbackUpdatePayload
): Promise<PublisherPostbackRecord> {
  const existing = await publisherPostbackRepository.findPublisherPostbackById(publisherId, id);
  if (!existing) {
    throw new Error('Postback not found');
  }

  const updated = await publisherPostbackRepository.updatePublisherPostbackById(publisherId, id, payload);
  if (!updated) {
    throw new Error('Postback not found');
  }

  return updated;
}

export async function deletePublisherPostback(
  publisherId: string,
  id: string
): Promise<void> {
  const deleted = await publisherPostbackRepository.deletePublisherPostbackById(publisherId, id);
  if (!deleted) {
    throw new Error('Postback not found');
  }
}

export async function listPublisherPostbacks(publisherId: string): Promise<PublisherPostbackRecord[]> {
  return publisherPostbackRepository.findPublisherPostbacks(publisherId);
}

export async function getPublisherPostback(
  publisherId: string,
  id: string
): Promise<PublisherPostbackRecord> {
  const postback = await publisherPostbackRepository.findPublisherPostbackById(publisherId, id);
  if (!postback) {
    throw new Error('Postback not found');
  }
  return postback;
}

export async function processPublisherPostbacksForConversion(
  click: PublisherClickContext,
  conversion: ConversionRecord,
  status: string
) {
  const postbacks = await publisherPostbackRepository.findActivePostbacksForConversion(
    click.offer_id,
    click.publisher_id
  );

  const variables = buildPostbackVariables(click, conversion, status);

  await Promise.all(
    postbacks.map(async (postback) => {
      const requestUrl = replaceTokens(postback.callback_url, variables);
      let responseCode: number | null = null;
      let responseBody: string | null = null;
      let logStatus = 'FAILED';

      try {
        const response = await fetch(requestUrl, { method: 'GET' });
        responseCode = response.status;
        responseBody = await response.text();
        logStatus = response.ok ? 'SUCCESS' : 'FAILED';
      } catch (error) {
        responseBody = String(error instanceof Error ? error.message : error);
      }

      await publisherPostbackRepository.savePublisherPostbackLog({
        publisher_postback_id: postback.id,
        conversion_id: conversion.id,
        click_id: click.click_id,
        offer_id: click.offer_id,
        publisher_id: click.publisher_id,
        request_url: requestUrl,
        response_code: responseCode,
        response_body: responseBody,
        status: logStatus,
      });
    })
  );
}
