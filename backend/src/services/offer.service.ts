import * as offerRepository from "../repositories/offer.repository.js";
import { OfferCreatePayload, OfferFilterParams, OfferRecord, OfferUpdatePayload, TrackingProtocol } from "../types/offer.js";

const TRACKING_PROTOCOLS: TrackingProtocol[] = ['S2S', 'COOKIE', 'PIXEL', 'SERVER'];
const OFFER_STATUSES = ['DRAFT', 'ACTIVE', 'PAUSED', 'EXHAUSTED', 'CLOSED', 'ARCHIVED'] as const;

type OfferStatusLiteral = typeof OFFER_STATUSES[number];

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 180);
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return false;
}

function normalizeJson(value: unknown): Record<string, unknown> | null {
  if (!value) return null;
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return { value };
    }
  }
  return null;
}

function normalizeTrackingProtocol(value: unknown): TrackingProtocol {
  const protocol = String(value || 'S2S').toUpperCase() as TrackingProtocol;
  return TRACKING_PROTOCOLS.includes(protocol) ? protocol : 'S2S';
}

function normalizeStatus(value: unknown): OfferStatusLiteral {
  const status = String(value || 'DRAFT').toUpperCase();
  return OFFER_STATUSES.includes(status as OfferStatusLiteral) ? (status as OfferStatusLiteral) : 'DRAFT';
}

export async function createOffer(payload: OfferCreatePayload, adminId: string) {
  const name = payload.name?.trim();
  if (!name) {
    throw new Error('Offer name is required');
  }

  const landingUrl = payload.landing_page_url?.trim();
  if (!landingUrl) {
    throw new Error('Landing page URL is required');
  }

  const offerPayload: OfferCreatePayload & { slug: string; status: OfferStatusLiteral; requires_publisher_approval: boolean; target_geos: string[]; target_devices: string[]; currency: string; default_affiliate_commission: number; tracking_protocol: TrackingProtocol } = {
    name,
    slug: payload.slug?.trim() ? toSlug(payload.slug) : toSlug(name),
    category: payload.category?.trim() || 'General',
    status: normalizeStatus(payload.status),
    requires_publisher_approval: normalizeBoolean(payload.requires_publisher_approval),
    payout_type: payload.payout_type.trim(),
    payout_amount: payload.payout_amount,
    currency: payload.currency?.trim() || 'USD',
    target_geos: normalizeStringArray(payload.target_geos),
    target_devices: normalizeStringArray(payload.target_devices),
    landing_page_url: landingUrl,
    preview_url: payload.preview_url?.trim() || undefined,
    terms: payload.terms?.trim() || undefined,
    caps: normalizeJson(payload.caps),
    traffic_rules: normalizeJson(payload.traffic_rules),
    default_affiliate_commission: payload.default_affiliate_commission ?? 0,
    tracking_protocol: normalizeTrackingProtocol(payload.tracking_protocol),
    admin_notes: payload.admin_notes?.trim() || undefined,
    advertiser_id: payload.advertiser_id || null,
  };

  return await offerRepository.insertOffer({
    ...offerPayload,
    created_by_admin_id: adminId || null,
  });
}

export async function updateOffer(offerId: number, payload: OfferUpdatePayload) {
  const updates: OfferUpdatePayload = {};

  if (payload.name !== undefined) updates.name = payload.name.trim();
  if (payload.slug !== undefined) updates.slug = payload.slug.trim() || toSlug(payload.name || '');
  if (payload.category !== undefined) updates.category = payload.category.trim();
  if (payload.status !== undefined) updates.status = normalizeStatus(payload.status);
  if (payload.requires_publisher_approval !== undefined) updates.requires_publisher_approval = normalizeBoolean(payload.requires_publisher_approval);
  if (payload.payout_type !== undefined) updates.payout_type = payload.payout_type.trim();
  if (payload.payout_amount !== undefined) updates.payout_amount = payload.payout_amount;
  if (payload.currency !== undefined) updates.currency = payload.currency.trim();
  if (payload.target_geos !== undefined) updates.target_geos = normalizeStringArray(payload.target_geos);
  if (payload.target_devices !== undefined) updates.target_devices = normalizeStringArray(payload.target_devices);
  if (payload.landing_page_url !== undefined) updates.landing_page_url = payload.landing_page_url.trim();
  if (payload.preview_url !== undefined) updates.preview_url = payload.preview_url?.trim() || undefined;
  if (payload.terms !== undefined) updates.terms = payload.terms?.trim() || undefined;
  if (payload.caps !== undefined) updates.caps = normalizeJson(payload.caps);
  if (payload.traffic_rules !== undefined) updates.traffic_rules = normalizeJson(payload.traffic_rules);
  if (payload.default_affiliate_commission !== undefined) updates.default_affiliate_commission = payload.default_affiliate_commission;
  if (payload.tracking_protocol !== undefined) updates.tracking_protocol = normalizeTrackingProtocol(payload.tracking_protocol);
  if (payload.admin_notes !== undefined) updates.admin_notes = payload.admin_notes?.trim() || undefined;
  if (payload.advertiser_id !== undefined) updates.advertiser_id = payload.advertiser_id || null;

  const updated = await offerRepository.updateOfferById(offerId, updates);
  if (!updated) {
    throw new Error('Offer not found');
  }

  return updated;
}

export async function pauseOffer(offerId: number) {
  const updated = await offerRepository.updateOfferStatus(offerId, 'PAUSED');
  if (!updated) {
    throw new Error('Offer not found');
  }
  return updated;
}

export async function activateOffer(offerId: number) {
  const updated = await offerRepository.updateOfferStatus(offerId, 'ACTIVE');
  if (!updated) {
    throw new Error('Offer not found');
  }
  return updated;
}

export async function archiveOffer(offerId: number) {
  const updated = await offerRepository.archiveOfferById(offerId);
  if (!updated) {
    throw new Error('Offer not found');
  }
  return updated;
}

export async function getOfferDetails(offerId: number) {
  const offer = await offerRepository.findOfferById(offerId);
  if (!offer) {
    throw new Error('Offer not found');
  }
  return offer;
}

export async function listOffers(filters: OfferFilterParams) {
  return await offerRepository.findOffers(filters);
}
