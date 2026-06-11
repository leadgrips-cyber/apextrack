import { NextFunction, Response } from 'express';
import { AuthRequest } from "../types/auth.js";
import {
  createAdvertiser,
  updateAdvertiser,
  getAdvertiser,
  listAdvertisers,
} from "../services/advertiser.service.js";
import { AdvertiserCreatePayload, AdvertiserFilterParams, AdvertiserStatus, AdvertiserUpdatePayload } from "../types/advertiser.js";

export async function handleListAdvertisers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const filters: AdvertiserFilterParams = {
      status: req.query.status as AdvertiserStatus | undefined,
      search: req.query.search as string | undefined,
    };
    const advertisers = await listAdvertisers(filters);
    res.json({ advertisers });
  } catch (error) {
    next(error);
  }
}

export async function handleGetAdvertiser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const advertiser = await getAdvertiser(req.params.id);
    res.json({ advertiser });
  } catch (error) {
    next(error);
  }
}

export async function handleCreateAdvertiser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const payload = req.body as AdvertiserCreatePayload;
    const adminId = req.user?.sub || '';
    const advertiser = await createAdvertiser(payload, adminId);
    res.status(201).json({ advertiser });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateAdvertiser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const payload = req.body as AdvertiserUpdatePayload;
    const advertiser = await updateAdvertiser(req.params.id, payload);
    res.json({ advertiser });
  } catch (error) {
    next(error);
  }
}
