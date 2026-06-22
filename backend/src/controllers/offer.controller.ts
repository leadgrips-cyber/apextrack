import { NextFunction, Response } from 'express';
import { AuthRequest } from "../types/auth.js";
import {
  createOffer,
  activateOffer,
  archiveOffer,
  rejectOffer,
  getOfferDetails,
  listOffers,
  pauseOffer,
  updateOffer,
} from "../services/offer.service.js";
import { OfferCreatePayload, OfferFilterParams, OfferRecord, OfferUpdatePayload, OfferStatus } from "../types/offer.js";
import { getOfferSummary } from "../repositories/offer.repository.js";

// Strip advertiser and internal fields before returning data to publisher role.
// Publishers must never see advertiser_id, advertiser_name, admin_notes, created_by_admin_id, or conversion_approval_mode.
function toPublisherOffer(offer: OfferRecord): Omit<OfferRecord, 'advertiser_id' | 'advertiser_name' | 'admin_notes' | 'created_by_admin_id' | 'conversion_approval_mode' | 'integration_settings'> {
  const { advertiser_id, advertiser_name, admin_notes, created_by_admin_id, conversion_approval_mode, integration_settings, ...safe } = offer;
  return safe;
}

function parseBooleanQuery(value: unknown): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  const normalized = String(value).toLowerCase();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return undefined;
}

export async function handleCreateOffer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const payload = req.body as OfferCreatePayload;
    const adminId = req.user?.sub || '';
    const offer = await createOffer(payload, adminId);
    res.status(201).json({ offer });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateOffer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.id);
    if (!offerId || Number.isNaN(offerId)) {
      res.status(400).json({ message: 'Invalid offer id' });
      return;
    }

    const payload = req.body as OfferUpdatePayload;
    const offer = await updateOffer(offerId, payload);
    res.json({ offer });
  } catch (error) {
    next(error);
  }
}

export async function handlePauseOffer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.id);
    if (!offerId || Number.isNaN(offerId)) {
      res.status(400).json({ message: 'Invalid offer id' });
      return;
    }

    const offer = await pauseOffer(offerId);
    res.json({ offer });
  } catch (error) {
    next(error);
  }
}

export async function handleActivateOffer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.id);
    if (!offerId || Number.isNaN(offerId)) {
      res.status(400).json({ message: 'Invalid offer id' });
      return;
    }

    const offer = await activateOffer(offerId);
    res.json({ offer });
  } catch (error) {
    next(error);
  }
}

export async function handleRejectOffer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.id);
    if (!offerId || Number.isNaN(offerId)) {
      res.status(400).json({ message: 'Invalid offer id' });
      return;
    }
    const offer = await rejectOffer(offerId);
    res.json({ offer });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteOffer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.id);
    if (!offerId || Number.isNaN(offerId)) {
      res.status(400).json({ message: 'Invalid offer id' });
      return;
    }

    const offer = await archiveOffer(offerId);
    res.status(200).json({ offer });
  } catch (error) {
    next(error);
  }
}

export async function handleGetOfferDetails(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.id);
    if (!offerId || Number.isNaN(offerId)) {
      res.status(400).json({ message: 'Invalid offer id' });
      return;
    }

    const offer = await getOfferDetails(offerId);
    const isPublisher = req.user?.role === 'publisher';
    if (isPublisher && offer.status !== 'ACTIVE') {
      res.status(404).json({ message: 'Offer not found' });
      return;
    }
    res.json({ offer: isPublisher ? toPublisherOffer(offer) : offer });
  } catch (error) {
    next(error);
  }
}

export async function handleGetOfferSummary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.id);
    if (!offerId || Number.isNaN(offerId)) {
      res.status(400).json({ message: 'Invalid offer id' });
      return;
    }
    const summary = await getOfferSummary(offerId);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}

export async function handleListOffers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const isPublisher = req.user?.role === 'publisher';

    const filters: OfferFilterParams = {
      // Publishers are locked to ACTIVE — they must never receive DRAFT, PAUSED, ARCHIVED, CLOSED, or EXHAUSTED offers
      status: isPublisher ? 'ACTIVE' : (req.query.status as OfferStatus | undefined),
      category: req.query.category as string | undefined,
      geo: req.query.geo as string | undefined,
      device: req.query.device as string | undefined,
      requires_publisher_approval: isPublisher ? undefined : parseBooleanQuery(req.query.requires_publisher_approval),
      search: req.query.search as string | undefined,
      // Publishers cannot filter by advertiser — omit even if they try to pass it
      advertiser_id: isPublisher ? undefined : req.query.advertiser_id as string | undefined,
    };

    const offers = await listOffers(filters);
    const responseOffers = isPublisher ? offers.map(toPublisherOffer) : offers;
    res.json({ offers: responseOffers });
  } catch (error) {
    next(error);
  }
}
