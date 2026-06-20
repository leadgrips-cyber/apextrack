import { randomUUID } from 'crypto';
import { ClickRequestQuery, OfferRecord, PublisherStatus } from "../types/click.js";
import * as clickRepository from "../repositories/click.repository.js";
import { evaluateTargeting } from "./targeting.service.js";
import { checkClickCaps } from "./caps.service.js";

const CLICK_MACRO_PATTERN = /\{(click_id|offer_id|publisher_id|sub1|sub2|sub3|sub4|sub5)\}/gi;

function resolveClickMacros(
  url: string,
  clickId: string,
  offerId: number,
  publisherId: string,
  subs: { sub1?: string | null; sub2?: string | null; sub3?: string | null; sub4?: string | null; sub5?: string | null }
): string {
  const vars: Record<string, string> = {
    click_id:     clickId,
    offer_id:     String(offerId),
    publisher_id: publisherId,
    sub1: subs.sub1 ?? '',
    sub2: subs.sub2 ?? '',
    sub3: subs.sub3 ?? '',
    sub4: subs.sub4 ?? '',
    sub5: subs.sub5 ?? '',
  };
  return url.replace(CLICK_MACRO_PATTERN, (_, token) => vars[token.toLowerCase()] ?? '');
}

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

  const redirectUrl = resolveClickMacros(
    offer.landing_page_url,
    clickId,
    offer.id,
    query.publisher_id,
    { sub1: query.sub1, sub2: query.sub2, sub3: query.sub3, sub4: query.sub4, sub5: query.sub5 }
  );

  console.log(`[click] ${clickId} offer=${offer.id} publisher=${query.publisher_id} → ${redirectUrl}`);

  return { click: savedClick, redirectUrl };
}
