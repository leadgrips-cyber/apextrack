import { NextFunction, Response } from 'express';
import { AuthRequest } from '../types/auth.js';
import * as landingRepo from '../repositories/offer-landing-pages.repository.js';
import * as creativesRepo from '../repositories/offer-creatives.repository.js';
import * as targetingRepo from '../repositories/targeting.repository.js';

export async function handleGetPublisherDetail(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.offerId);
    if (!offerId || isNaN(offerId)) {
      res.status(400).json({ error: 'Invalid offer ID' });
      return;
    }

    const [landingPages, creatives, activeRules] = await Promise.all([
      landingRepo.listLandingPages(offerId),
      creativesRepo.listCreatives(offerId),
      targetingRepo.listActiveRules(offerId),
    ]);

    const allowed_geos = activeRules
      .filter(r => r.rule_type === 'COUNTRY' && r.action === 'ALLOW')
      .map(r => r.rule_value);

    const allowed_devices = activeRules
      .filter(r => r.rule_type === 'DEVICE' && r.action === 'ALLOW')
      .map(r => r.rule_value);

    res.json({
      landing_pages: landingPages.filter(lp => lp.is_active),
      creatives,
      allowed_geos,
      allowed_devices,
    });
  } catch (error) {
    next(error);
  }
}
