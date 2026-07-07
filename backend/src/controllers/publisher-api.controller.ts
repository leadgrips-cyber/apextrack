import { Response, NextFunction } from 'express';
import { PublisherApiRequest } from "../types/publisherApi.js";
import { TrackingLinkCreatePayload } from "../types/tracking.js";
import { ApiError } from "../utils/apiError.js";
import * as publisherApiService from "../services/publisher-api.service.js";

function publisherId(req: PublisherApiRequest): string {
  // Populated by authenticatePublisherApiKey — guaranteed present on every route in this router.
  return req.user!.sub;
}

function handleError(error: unknown, res: Response, next: NextFunction) {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ error: error.code, message: error.message });
    return;
  }
  next(error);
}

export async function handleWhoAmI(req: PublisherApiRequest, res: Response, next: NextFunction) {
  try {
    res.json({ publisher_id: publisherId(req), email: req.user!.email, scopes: req.apiKeyScopes ?? [] });
  } catch (error) { handleError(error, res, next); }
}

export async function handleListOffers(req: PublisherApiRequest, res: Response, next: NextFunction) {
  try {
    const offers = await publisherApiService.listPublicOffers(publisherId(req));
    res.json({ offers });
  } catch (error) { handleError(error, res, next); }
}

export async function handleListApprovedOffers(req: PublisherApiRequest, res: Response, next: NextFunction) {
  try {
    const offers = await publisherApiService.listApprovedOffers(publisherId(req));
    res.json({ offers });
  } catch (error) { handleError(error, res, next); }
}

export async function handleGetOffer(req: PublisherApiRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.id);
    if (!Number.isFinite(offerId)) throw new ApiError(400, 'VALIDATION_ERROR', 'offer id must be numeric.');
    const offer = await publisherApiService.getOfferDetail(offerId, publisherId(req));
    res.json({ offer });
  } catch (error) { handleError(error, res, next); }
}

export async function handleGetOfferCreatives(req: PublisherApiRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.id);
    if (!Number.isFinite(offerId)) throw new ApiError(400, 'VALIDATION_ERROR', 'offer id must be numeric.');
    const creatives = await publisherApiService.getOfferCreatives(offerId, publisherId(req));
    res.json({ creatives });
  } catch (error) { handleError(error, res, next); }
}

export async function handleGetOfferLandingPages(req: PublisherApiRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.id);
    if (!Number.isFinite(offerId)) throw new ApiError(400, 'VALIDATION_ERROR', 'offer id must be numeric.');
    const landingPages = await publisherApiService.getOfferLandingPages(offerId, publisherId(req));
    res.json({ landing_pages: landingPages });
  } catch (error) { handleError(error, res, next); }
}

export async function handleGetOfferTargeting(req: PublisherApiRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.id);
    if (!Number.isFinite(offerId)) throw new ApiError(400, 'VALIDATION_ERROR', 'offer id must be numeric.');
    const targeting = await publisherApiService.getOfferTargeting(offerId, publisherId(req));
    res.json(targeting);
  } catch (error) { handleError(error, res, next); }
}

export async function handleListCategories(_req: PublisherApiRequest, res: Response, next: NextFunction) {
  try {
    const categories = await publisherApiService.listCategories();
    res.json({ categories });
  } catch (error) { handleError(error, res, next); }
}

export async function handleListTrackingLinks(req: PublisherApiRequest, res: Response, next: NextFunction) {
  try {
    const links = await publisherApiService.listMyTrackingLinks(publisherId(req));
    res.json({ tracking_links: links });
  } catch (error) { handleError(error, res, next); }
}

export async function handleCreateTrackingLink(req: PublisherApiRequest, res: Response, next: NextFunction) {
  try {
    const payload = req.body as TrackingLinkCreatePayload;
    const trackingLink = await publisherApiService.createTrackingLink(publisherId(req), payload);
    res.status(201).json({ tracking_link: trackingLink });
  } catch (error) { handleError(error, res, next); }
}

export async function handleGetTrackingLink(req: PublisherApiRequest, res: Response, next: NextFunction) {
  try {
    const link = await publisherApiService.getTrackingLinkDetail(req.params.id, publisherId(req));
    res.json({ tracking_link: link });
  } catch (error) { handleError(error, res, next); }
}

export async function handleClickReport(req: PublisherApiRequest, res: Response, next: NextFunction) {
  try {
    const result = await publisherApiService.getClickReport(publisherId(req), req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { handleError(error, res, next); }
}

export async function handleConversionReport(req: PublisherApiRequest, res: Response, next: NextFunction) {
  try {
    const result = await publisherApiService.getConversionReport(publisherId(req), req.query as Record<string, unknown>);
    res.json(result);
  } catch (error) { handleError(error, res, next); }
}

export async function handleDailyReport(req: PublisherApiRequest, res: Response, next: NextFunction) {
  try {
    const rows = await publisherApiService.getDailyReport(publisherId(req), req.query as Record<string, unknown>);
    res.json({ rows });
  } catch (error) { handleError(error, res, next); }
}

export async function handleEventReport(req: PublisherApiRequest, res: Response, next: NextFunction) {
  try {
    const rows = await publisherApiService.getEventReport(publisherId(req), req.query as Record<string, unknown>);
    res.json({ rows });
  } catch (error) { handleError(error, res, next); }
}

export async function handleSummaryReport(req: PublisherApiRequest, res: Response, next: NextFunction) {
  try {
    const summary = await publisherApiService.getSummaryReport(publisherId(req), req.query as Record<string, unknown>);
    res.json(summary);
  } catch (error) { handleError(error, res, next); }
}
