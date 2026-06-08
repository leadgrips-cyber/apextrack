import { NextFunction, Response } from 'express';
import { AuthRequest } from "../types/auth.js";
import {
  applyForOffer,
  approveApplication,
  getApplicationDetails,
  listApplications,
  listPublisherApplications,
  rejectApplication,
} from "../services/application.service.js";
import { ApplicationCreatePayload, ApplicationFilterParams, ApplicationReviewPayload } from "../types/application.js";

function parseStatus(value: unknown) {
  if (!value) return undefined;
  return String(value).toUpperCase();
}

export async function handleApplyForOffer(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user?.sub;
    if (!publisherId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const payload = req.body as ApplicationCreatePayload;
    const application = await applyForOffer(publisherId, payload);
    res.status(201).json({ application });
  } catch (error) {
    next(error);
  }
}

export async function handleListPublisherApplications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user?.sub;
    if (!publisherId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const filters: ApplicationFilterParams = {
      status: parseStatus(req.query.status) as any,
      offer_id: req.query.offer_id ? Number(req.query.offer_id) : undefined,
    };

    const applications = await listPublisherApplications(publisherId, filters);
    res.json({ applications });
  } catch (error) {
    next(error);
  }
}

export async function handleListApplications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const filters: ApplicationFilterParams = {
      status: parseStatus(req.query.status) as any,
      offer_id: req.query.offer_id ? Number(req.query.offer_id) : undefined,
      publisher_id: req.query.publisher_id as string | undefined,
    };

    const applications = await listApplications(filters);
    res.json({ applications });
  } catch (error) {
    next(error);
  }
}

export async function handleApproveApplication(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const applicationId = req.params.id;
    const adminId = req.user?.sub;
    if (!adminId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const application = await approveApplication(applicationId, adminId);
    res.json({ application });
  } catch (error) {
    next(error);
  }
}

export async function handleRejectApplication(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const applicationId = req.params.id;
    const adminId = req.user?.sub;
    if (!adminId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const payload = req.body as ApplicationReviewPayload;
    const application = await rejectApplication(applicationId, adminId, payload);
    res.json({ application });
  } catch (error) {
    next(error);
  }
}

export async function handleGetApplicationDetails(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const applicationId = req.params.id;
    const application = await getApplicationDetails(applicationId);
    res.json({ application });
  } catch (error) {
    next(error);
  }
}
