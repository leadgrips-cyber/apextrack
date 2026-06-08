import { NextFunction, Response } from 'express';
import { AuthRequest } from "../types/auth.js";
import {
  approvePublisher,
  blockPublisher,
  getPublisherDetails,
  getPublisherWallet,
  listPublisherApplications,
  listPublisherTrackingLinks,
  listPublishers,
  reactivatePublisher,
  suspendPublisher,
} from "../services/publisher.service.js";

function parsePositiveNumber(value: unknown, fallback: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }
  return Math.max(1, Math.floor(numeric));
}

export async function handleListPublishers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = parsePositiveNumber(req.query.page, 1);
    const pageSize = parsePositiveNumber(req.query.page_size, 25);

    const publishers = await listPublishers({
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
      page,
      pageSize,
    });

    res.json(publishers);
  } catch (error) {
    next(error);
  }
}

export async function handleGetPublisherDetails(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const publisher = await getPublisherDetails(publisherId);
    res.json({ publisher });
  } catch (error) {
    next(error);
  }
}

export async function handleApprovePublisher(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const publisher = await approvePublisher(publisherId);
    res.json({ publisher });
  } catch (error) {
    next(error);
  }
}

export async function handleSuspendPublisher(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const publisher = await suspendPublisher(publisherId);
    res.json({ publisher });
  } catch (error) {
    next(error);
  }
}

export async function handleReactivatePublisher(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const publisher = await reactivatePublisher(publisherId);
    res.json({ publisher });
  } catch (error) {
    next(error);
  }
}

export async function handleBlockPublisher(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const publisher = await blockPublisher(publisherId);
    res.json({ publisher });
  } catch (error) {
    next(error);
  }
}

export async function handleGetPublisherWallet(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const wallet = await getPublisherWallet(publisherId);
    res.json({ wallet });
  } catch (error) {
    next(error);
  }
}

export async function handleListPublisherApplications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const applications = await listPublisherApplications(publisherId);
    res.json({ applications });
  } catch (error) {
    next(error);
  }
}

export async function handleListPublisherTrackingLinks(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const trackingLinks = await listPublisherTrackingLinks(publisherId);
    res.json({ trackingLinks });
  } catch (error) {
    next(error);
  }
}
