import * as trackingRepository from "../repositories/tracking.repository.js";
import * as offerRepository from "../repositories/offer.repository.js";
import { TrackingLinkCreatePayload, TrackingLinkRecord } from "../types/tracking.js";

function buildTrackingUrl(publisherId: string, payload: TrackingLinkCreatePayload) {
  const params = new URLSearchParams({
    offer_id: String(payload.offer_id),
    publisher_id: publisherId,
  });

  if (payload.sub1) params.append('sub1', payload.sub1);
  if (payload.sub2) params.append('sub2', payload.sub2);
  if (payload.sub3) params.append('sub3', payload.sub3);
  if (payload.sub4) params.append('sub4', payload.sub4);
  if (payload.sub5) params.append('sub5', payload.sub5);

  return `/api/click?${params.toString()}`;
}

export async function generateTrackingLink(publisherId: string, payload: TrackingLinkCreatePayload): Promise<TrackingLinkRecord> {
  const offer = await offerRepository.findOfferById(payload.offer_id);
  if (!offer) {
    throw new Error('Offer not found');
  }
  if (offer.status !== 'ACTIVE') {
    throw new Error('Offer is not active');
  }

  if (offer.requires_publisher_approval) {
    const approved = await trackingRepository.findApprovedOfferApplication(payload.offer_id, publisherId);
    if (!approved) {
      throw new Error('Offer application must be approved to generate tracking links');
    }
  }

  const trackingUrl = buildTrackingUrl(publisherId, payload);
  return trackingRepository.upsertTrackingLink(publisherId, payload, trackingUrl);
}

export async function listTrackingLinks(publisherId: string): Promise<TrackingLinkRecord[]> {
  return trackingRepository.findTrackingLinksByPublisher(publisherId);
}

export async function getTrackingLinkDetails(publisherId: string, linkId: string): Promise<TrackingLinkRecord> {
  const link = await trackingRepository.findTrackingLinkByIdForPublisher(linkId, publisherId);
  if (!link) {
    throw new Error('Tracking link not found');
  }

  return link;
}
