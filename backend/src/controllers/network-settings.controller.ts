import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from "../types/auth.js";
import { NetworkSettingsUpdatePayload } from "../types/network-settings.js";
import * as networkSettingsService from "../services/network-settings.service.js";

const SECRET_MASK = '••••••••';

function maskSettings(settings: Record<string, unknown>) {
  return {
    ...settings,
    turnstile_secret_key:        settings.turnstile_secret_key ? SECRET_MASK : '',
    turnstile_secret_key_is_set: !!settings.turnstile_secret_key,
  };
}

export async function handleGetSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const settings = await networkSettingsService.getSettings();
    res.json({ settings: maskSettings(settings as unknown as Record<string, unknown>) });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdateSettings(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const adminId = req.user?.sub ?? '';
    const body = { ...req.body } as NetworkSettingsUpdatePayload & { turnstile_secret_key?: string };
    // Strip the mask so it isn't saved as a literal placeholder
    if (body.turnstile_secret_key === SECRET_MASK || body.turnstile_secret_key === '') {
      delete body.turnstile_secret_key;
    }
    const settings = await networkSettingsService.updateSettings(body, adminId);
    res.json({ settings: maskSettings(settings as unknown as Record<string, unknown>) });
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
