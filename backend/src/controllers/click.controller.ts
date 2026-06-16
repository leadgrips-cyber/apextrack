import { Request, Response, NextFunction } from 'express';
import { createClickEvent } from "../services/click.service.js";
import { ClickRequestQuery } from "../types/click.js";

export async function trackClick(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query as unknown as ClickRequestQuery;
    const ipAddress: string = String((req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || '');
    const userAgent = req.headers['user-agent'] as string | undefined;
    const referrer = (req.headers.referer as string | undefined) || (req.headers.referrer as string | undefined);
    const userAgentString = userAgent ?? '';
    const referrerString = referrer ?? '';

    const { redirectUrl } = await createClickEvent(
      query,
      req.headers as Record<string, unknown>,
      ipAddress,
      String(userAgent ?? ''),
      String(referrer ?? '')
    );
    res.redirect(302, redirectUrl);
  } catch (error: any) {
    if (error?.code === "TARGETING_BLOCKED") {
      res.status(403).json({ success: false, reason: "TARGETING_BLOCKED", message: error.message });
      return;
    }
    if (error?.code === "CLICK_CAP_REACHED") {
      res.status(429).json({ success: false, reason: "CLICK_CAP_REACHED", message: error.message });
      return;
    }
    next(error);
  }
}
