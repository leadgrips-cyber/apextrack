import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from "../types/auth.js";
import { NetworkSettingsUpdatePayload } from "../types/network-settings.js";
import * as networkSettingsService from "../services/network-settings.service.js";

export async function handleGetSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const settings = await networkSettingsService.getSettings();
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const adminId = req.user?.sub ?? '';
    const payload = req.body as NetworkSettingsUpdatePayload;
    const settings = await networkSettingsService.updateSettings(payload, adminId);
    res.json({ settings });
  } catch (error) {
    next(error);
  }
}

export async function handleGetPublicSettings(_req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await networkSettingsService.getPublicSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
}
