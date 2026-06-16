import { Request, Response, NextFunction } from "express";
import * as svc from "../services/caps.service.js";

function offerId(req: Request): number {
  return Number(req.params.offerId);
}

export async function handleGetCaps(req: Request, res: Response, next: NextFunction) {
  try {
    const caps = await svc.getCaps(offerId(req));
    res.json({ caps: caps ?? null });
  } catch (err) { next(err); }
}

export async function handleSaveCaps(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      daily_click_cap,
      hourly_click_cap,
      daily_conversion_cap,
      hourly_conversion_cap,
      is_active,
    } = req.body as {
      daily_click_cap?: number | null;
      hourly_click_cap?: number | null;
      daily_conversion_cap?: number | null;
      hourly_conversion_cap?: number | null;
      is_active?: boolean;
    };

    const caps = await svc.saveCaps(offerId(req), {
      daily_click_cap:       daily_click_cap       ?? null,
      hourly_click_cap:      hourly_click_cap      ?? null,
      daily_conversion_cap:  daily_conversion_cap  ?? null,
      hourly_conversion_cap: hourly_conversion_cap ?? null,
      is_active:             is_active             ?? true,
    });
    res.json({ caps });
  } catch (err: any) {
    if (err.message?.includes(">= 0")) {
      res.status(400).json({ message: err.message });
      return;
    }
    next(err);
  }
}
