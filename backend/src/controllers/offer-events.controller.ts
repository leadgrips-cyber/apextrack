import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.js';
import * as svc from '../services/offer-events.service.js';

function badRequest(res: Response, message: string) {
  res.status(400).json({ message });
}

export async function handleListEvents(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.offerId);
    if (!offerId) { badRequest(res, 'offerId is required'); return; }
    const events = await svc.listOfferEvents(offerId);
    res.json({ events });
  } catch (err) { next(err); }
}

export async function handleCreateEvent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const offerId = Number(req.params.offerId);
    if (!offerId) { badRequest(res, 'offerId is required'); return; }
    const { event_token, event_name, approval_mode, is_active } = req.body;
    const event = await svc.createOfferEvent(offerId, {
      event_token: String(event_token ?? ''),
      event_name: String(event_name ?? ''),
      approval_mode: String(approval_mode || 'AUTO_APPROVE'),
      is_active: is_active !== false,
    });
    res.status(201).json({ event });
  } catch (err: any) {
    if (err.message?.match(/required|must|already exists/i)) { badRequest(res, err.message); return; }
    next(err);
  }
}

export async function handleUpdateEvent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { event_token, event_name, approval_mode, is_active } = req.body;
    const patch: Record<string, unknown> = {};
    if (event_token !== undefined)   patch.event_token = String(event_token);
    if (event_name !== undefined)    patch.event_name = String(event_name);
    if (approval_mode !== undefined) patch.approval_mode = String(approval_mode);
    if (is_active !== undefined)     patch.is_active = Boolean(is_active);
    const event = await svc.updateOfferEvent(id, patch as any);
    res.json({ event });
  } catch (err: any) {
    if (err.message === 'Event not found') { res.status(404).json({ message: err.message }); return; }
    if (err.message?.match(/required|must|already exists/i)) { badRequest(res, err.message); return; }
    next(err);
  }
}

export async function handleDeleteEvent(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await svc.deleteOfferEvent(req.params.id);
    res.json({ success: true });
  } catch (err: any) {
    if (err.message === 'Event not found') { res.status(404).json({ message: err.message }); return; }
    next(err);
  }
}
