import { NextFunction, Response } from 'express';
import { AuthRequest } from '../types/auth.js';
import * as service from '../services/offer-assignments.service.js';

export async function handleListPublishersWithAssignment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const offerId = Number(req.params.offerId);
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const publishers = await service.listPublishersWithAssignment(offerId, search);
    res.json({ publishers });
  } catch (error) {
    next(error);
  }
}

export async function handleAssignPublisher(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const offerId = Number(req.params.offerId);
    const adminId = req.user?.sub ?? '';
    const { publisher_id } = req.body as { publisher_id: string };
    await service.assignPublisher(offerId, publisher_id, adminId);
    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function handleUnassignPublisher(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const offerId = Number(req.params.offerId);
    const publisherId = req.params.publisherId;
    await service.unassignPublisher(offerId, publisherId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function handleBulkAssign(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const offerId = Number(req.params.offerId);
    const adminId = req.user?.sub ?? '';
    const { publisher_ids } = req.body as { publisher_ids: string[] };
    if (!Array.isArray(publisher_ids)) {
      res.status(400).json({ message: 'publisher_ids must be an array' });
      return;
    }
    await service.bulkAssign(offerId, publisher_ids, adminId);
    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
}

export async function handleBulkUnassign(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const offerId = Number(req.params.offerId);
    const { publisher_ids } = req.body as { publisher_ids: string[] };
    if (!Array.isArray(publisher_ids)) {
      res.status(400).json({ message: 'publisher_ids must be an array' });
      return;
    }
    await service.bulkUnassign(offerId, publisher_ids);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
