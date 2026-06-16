import { NextFunction, Response } from 'express';
import { AuthRequest } from '../types/auth.js';
import * as service from '../services/offer-landing-pages.service.js';

export async function handleListLandingPages(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.offerId);
    const pages = await service.listLandingPages(offerId);
    res.json({ landing_pages: pages });
  } catch (error) {
    next(error);
  }
}

export async function handleCreateLandingPage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.offerId);
    const page = await service.createLandingPage(offerId, req.body);
    res.status(201).json({ landing_page: page });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateLandingPage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = await service.updateLandingPage(req.params.id, req.body);
    res.json({ landing_page: page });
  } catch (error) {
    next(error);
  }
}

export async function handleDeleteLandingPage(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await service.deleteLandingPage(req.params.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
