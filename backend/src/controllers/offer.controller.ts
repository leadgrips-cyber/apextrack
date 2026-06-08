import { NextFunction, Response } from 'express';
import { AuthRequest } from "../types/auth.js";
import {
  createOffer,
  activateOffer,
  archiveOffer,
  getOfferDetails,
  listOffers,
  pauseOffer,
  updateOffer,
} from "../services/offer.service.js";
import { OfferCreatePayload, OfferFilterParams, OfferUpdatePayload, OfferStatus } from "../types/offer.js";

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
    res.json({ offer });
  } catch (error) {
    next(error);
  }
}

export async function handleListOffers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const filters: OfferFilterParams = {
      status: req.query.status as OfferStatus | undefined,
      category: req.query.category as string | undefined,
      geo: req.query.geo as string | undefined,
      device: req.query.device as string | undefined,
      requires_publisher_approval: parseBooleanQuery(req.query.requires_publisher_approval),
      search: req.query.search as string | undefined,
    };

    const offers = await listOffers(filters);
    res.json({ offers });
  } catch (error) {
    next(error);
  }
}
