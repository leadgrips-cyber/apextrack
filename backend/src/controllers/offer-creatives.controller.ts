import { NextFunction, Response } from 'express';
import { AuthRequest } from '../types/auth.js';
import * as service from '../services/offer-creatives.service.js';

export async function handleListCreatives(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.offerId);
    const creatives = await service.listCreatives(offerId);
    res.json({ creatives });
  } catch (error) {
    next(error);
  }
}

export async function handleCreateCreative(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.offerId);
    const creative = await service.createCreative(offerId, req.body);
    res.status(201).json({ creative });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateCreative(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const creative = await service.updateCreative(req.params.id, req.body);
    res.json({ creative });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteCreative(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await service.deleteCreative(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
