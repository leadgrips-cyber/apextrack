import { NextFunction, Response } from 'express';
import { AuthRequest } from "../types/auth.js";
import { TrackingLinkCreatePayload } from "../types/tracking.js";
import { generateTrackingLink, getTrackingLinkDetails, listTrackingLinks } from "../services/tracking.service.js";

export async function handleGenerateTrackingLink(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user?.sub;
    if (!publisherId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const payload = req.body as TrackingLinkCreatePayload;
    const trackingLink = await generateTrackingLink(publisherId, payload);
    res.status(201).json({ trackingLink });
  } catch (error) {
    next(error);
  }
}

export async function handleListTrackingLinks(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user?.sub;
    if (!publisherId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const links = await listTrackingLinks(publisherId);
    res.json({ links });
  } catch (error) {
    next(error);
  }
}

export async function handleGetTrackingLinkDetails(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user?.sub;
    if (!publisherId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const link = await getTrackingLinkDetails(publisherId, req.params.id);
    res.json({ link });
  } catch (error) {
    next(error);
  }
}
