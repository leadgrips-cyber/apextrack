import * as offerRepository from "../repositories/offer.repository.js";
import * as creativesRepository from "../repositories/offer-creatives.repository.js";
import * as landingPagesRepository from "../repositories/offer-landing-pages.repository.js";
import * as targetingRepository from "../repositories/targeting.repository.js";
import * as categoriesRepository from "../repositories/offer-categories.repository.js";
import * as offerEventsRepository from "../repositories/offer-events.repository.js";
import * as publisherApiRepository from "../repositories/publisher-api.repository.js";
import * as trackingService from "../services/tracking.service.js";
import * as reportsRepository from "../repositories/publisher-api-reports.repository.js";
import { OfferRecord } from "../types/offer.js";
import { TrackingLinkCreatePayload } from "../types/tracking.js";
import { ApiError } from "../utils/apiError.js";

// Fields that must never reach a publisher: internal admin/advertiser data,
// and network-economics fields that would reveal margin (advertiser_payout,
// revenue-share %). Publishers only ever need to know what THEY get paid.
function toPublicOfferShape(offer: OfferRecord) {
  const {
    advertiser_id, advertiser_name, admin_notes, created_by_admin_id,
    conversion_approval_mode, integration_settings, advertiser_payout,
    affiliate_revenue_share_percent, affiliate_payout,
    ...safe
  } = offer;
  return {
    ...safe,
    payout_amount: affiliate_payout ?? offer.payout_amount,
  };
}

async function loadActiveOfferOrThrow(offerId: number): Promise<OfferRecord> {
  const offer = await offerRepository.findOfferById(offerId);
  if (!offer || offer.status !== 'ACTIVE') {
    throw new ApiError(404, 'OFFER_NOT_FOUND', 'Offer not found.');
  }
  return offer;
}

async function assertOfferAccessible(offer: OfferRecord, publisherId: string): Promise<void> {
  if (offer.requires_publisher_approval) {
    const approved = await publisherApiRepository.hasApprovedApplication(offer.id, publisherId);
    if (!approved) {
      throw new ApiError(403, 'OFFER_NOT_APPROVED', 'You must be approved for this offer to access this resource.');
    }
  }
}

export async function listPublicOffers(publisherId: string) {
  const offers = await offerRepository.findOffers({ status: 'ACTIVE' });
  const approvedOffers = await publisherApiRepository.listApprovedOffers(publisherId);
  const approvedIds = new Set(approvedOffers.map((o) => o.id));
  return offers.map((offer) => ({
    ...toPublicOfferShape(offer),
    is_approved: approvedIds.has(offer.id),
  }));
}

export async function listApprovedOffers(publisherId: string) {
  return publisherApiRepository.listApprovedOffers(publisherId);
}

export async function getOfferDetail(offerId: number, publisherId: string) {
  const offer = await loadActiveOfferOrThrow(offerId);
  const isApproved = offer.requires_publisher_approval
    ? await publisherApiRepository.hasApprovedApplication(offer.id, publisherId)
    : true;
  const events = (await offerEventsRepository.listEventsByOffer(offer.id))
    .filter((e) => e.is_active)
    .map((e) => ({ event_token: e.event_token, event_name: e.event_name }));

  return {
    ...toPublicOfferShape(offer),
    is_approved: isApproved,
    events,
  };
}

export async function getOfferCreatives(offerId: number, publisherId: string) {
  const offer = await loadActiveOfferOrThrow(offerId);
  await assertOfferAccessible(offer, publisherId);
  return creativesRepository.listCreatives(offer.id);
}

export async function getOfferLandingPages(offerId: number, publisherId: string) {
  const offer = await loadActiveOfferOrThrow(offerId);
  await assertOfferAccessible(offer, publisherId);
  return (await landingPagesRepository.listLandingPages(offer.id)).filter((p) => p.is_active);
}

export async function getOfferTargeting(offerId: number, publisherId: string) {
  const offer = await loadActiveOfferOrThrow(offerId);
  await assertOfferAccessible(offer, publisherId);
  const rules = await targetingRepository.listActiveRules(offer.id);
  return {
    allowed_geos: offer.target_geos ?? [],
    allowed_devices: offer.target_devices ?? [],
    rules: rules.map((r) => ({
      rule_type: r.rule_type,
      operator: r.operator,
      rule_value: r.rule_value,
      action: r.action,
    })),
  };
}

export async function listCategories() {
  return categoriesRepository.listCategories(true);
}

export async function listMyTrackingLinks(publisherId: string) {
  return trackingService.listTrackingLinks(publisherId);
}

export async function createTrackingLink(publisherId: string, payload: TrackingLinkCreatePayload) {
  if (!payload || typeof payload.offer_id === 'undefined' || payload.offer_id === null) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'offer_id is required.');
  }
  try {
    return await trackingService.generateTrackingLink(publisherId, payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate tracking link.';
    if (message === 'Offer not found') throw new ApiError(404, 'OFFER_NOT_FOUND', message);
    if (message === 'Offer is not active') throw new ApiError(400, 'OFFER_NOT_ACTIVE', message);
    if (message.includes('must be approved')) throw new ApiError(403, 'OFFER_NOT_APPROVED', message);
    throw error;
  }
}

export async function getTrackingLinkDetail(linkId: string, publisherId: string) {
  try {
    return await trackingService.getTrackingLinkDetails(publisherId, linkId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Tracking link not found.';
    throw new ApiError(404, 'TRACKING_LINK_NOT_FOUND', message);
  }
}

function parsePagination(pageRaw: unknown, pageSizeRaw: unknown) {
  const page = Math.max(1, parseInt(String(pageRaw ?? '1'), 10) || 1);
  const pageSize = Math.min(200, Math.max(1, parseInt(String(pageSizeRaw ?? '50'), 10) || 50));
  return { page, pageSize };
}

function parseRange(query: Record<string, unknown>) {
  const from = typeof query.from === 'string' && query.from ? query.from : undefined;
  const to = typeof query.to === 'string' && query.to ? query.to : undefined;
  const offerId = query.offer_id ? Number(query.offer_id) : undefined;
  return { from, to, offerId };
}

export async function getClickReport(publisherId: string, rawQuery: Record<string, unknown>) {
  const { page, pageSize } = parsePagination(rawQuery.page, rawQuery.page_size);
  const range = parseRange(rawQuery);
  const { rows, total } = await reportsRepository.getClickReport(publisherId, range, page, pageSize);
  return { rows, total, page, pageSize };
}

export async function getConversionReport(publisherId: string, rawQuery: Record<string, unknown>) {
  const { page, pageSize } = parsePagination(rawQuery.page, rawQuery.page_size);
  const range = parseRange(rawQuery);
  const status = typeof rawQuery.status === 'string' ? rawQuery.status.toUpperCase() : undefined;
  const { rows, total } = await reportsRepository.getConversionReport(publisherId, range, status, page, pageSize);
  return { rows, total, page, pageSize };
}

export async function getDailyReport(publisherId: string, rawQuery: Record<string, unknown>) {
  const range = parseRange(rawQuery);
  return reportsRepository.getDailyReport(publisherId, range);
}

export async function getEventReport(publisherId: string, rawQuery: Record<string, unknown>) {
  const range = parseRange(rawQuery);
  return reportsRepository.getEventReport(publisherId, range);
}

export async function getSummaryReport(publisherId: string, rawQuery: Record<string, unknown>) {
  const range = parseRange(rawQuery);
  return reportsRepository.getSummaryReport(publisherId, range);
}
