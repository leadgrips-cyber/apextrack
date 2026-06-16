import { randomUUID } from 'crypto';
import { ClickRequestQuery, OfferRecord, PublisherStatus } from "../types/click.js";
import * as clickRepository from "../repositories/click.repository.js";
import { evaluateTargeting } from "./targeting.service.js";
import { checkClickCaps } from "./caps.service.js";

function parseDeviceType(userAgent?: string): string | null {
  if (!userAgent) return null;
  const ua = userAgent.toLowerCase();
  if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android') || ua.includes('ipad')) {
    return 'mobile';
  }
  if (ua.includes('tablet')) {
    return 'tablet';
  }
  return 'desktop';
}

function parseCountry(headers: Record<string, unknown>): string | null {
  const country = (headers['x-country-code'] as string) ||
    (headers['cf-ipcountry'] as string) ||
    (headers['x-appengine-country'] as string) ||
    (headers['x-vercel-country'] as string);
  return typeof country === 'string' && country.length === 2 ? country.toUpperCase() : null;
}

function ensureActiveOffer(offer: OfferRecord) {
  if (offer.status !== 'ACTIVE') {
    throw new Error('Offer is not active');
  }
}

function ensureActivePublisher(publisher: PublisherStatus) {
  if (!publisher.is_active) {
    throw new Error('Publisher account is not active');
  }
}

function ensurePublisherApprovedForOffer(offer: OfferRecord, publisherId: string) {
  if (!offer.requires_publisher_approval) {
    return;
  }

  return clickRepository.findApprovedOfferApplication(offer.id, publisherId);
}

export async function createClickEvent(
  query: ClickRequestQuery,
  headers: Record<string, unknown>,
  ipAddress: string,
  userAgent: string,
  referrer: string
) {
  const offerId = Number(query.offer_id);
  if (!offerId || Number.isNaN(offerId)) {
    throw new Error('Invalid offer_id');
  }

  if (!query.publisher_id) {
    throw new Error('publisher_id is required');
  }

  const offer = await clickRepository.findOfferById(offerId);
  if (!offer) {
    throw new Error('Offer not found');
  }

  ensureActiveOffer(offer);

  const publisher = await clickRepository.findPublisherById(query.publisher_id);
  if (!publisher) {
    throw new Error('Publisher not found');
  }

  ensureActivePublisher(publisher);

  if (offer.requires_publisher_approval) {
    const approved = await ensurePublisherApprovedForOffer(offer, query.publisher_id);
    if (!approved) {
      throw new Error('Publisher is not approved for this offer');
    }
  }

  const countryCode = parseCountry(headers);
  const deviceType  = parseDeviceType(userAgent);

  // ── Targeting enforcement ──────────────────────────────────────────────────
  const targetingResult = await evaluateTargeting(offer.id, {
    countryCode,
    deviceType,
    userAgent,
  });
  if (targetingResult.blocked) {
    throw Object.assign(new Error(targetingResult.reason), { code: "TARGETING_BLOCKED" });
  }

  // ── Click cap enforcement ──────────────────────────────────────────────────
  const capResult = await checkClickCaps(offer.id);
  if (capResult.blocked) {
    throw Object.assign(new Error(capResult.reason), { code: "CLICK_CAP_REACHED" });
  }

  const clickId = randomUUID();
  const clickData = {
    click_id: clickId,
    offer_id: offer.id,
    publisher_id: query.publisher_id,
    sub1: query.sub1 || null,
    sub2: query.sub2 || null,
    sub3: query.sub3 || null,
    sub4: query.sub4 || null,
    sub5: query.sub5 || null,
    click_ip: ipAddress,
    country_code: countryCode,
    device_type: deviceType,
    user_agent: userAgent || null,
    referrer: referrer || null,
    redirect_url: offer.landing_page_url,
    landing_page_url: offer.landing_page_url,
  } as const;

  const savedClick = await clickRepository.saveClick(clickId, clickData as any);
  return {
    click: savedClick,
    redirectUrl: offer.landing_page_url,
  };
}
