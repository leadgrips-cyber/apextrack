import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.js';
import * as svc from '../services/notifications.service.js';

export async function handleListNotifications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user?.sub;
    if (!publisherId) { res.status(401).json({ message: 'Unauthorized' }); return; }
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? '20'), 10)));
    const result = await svc.listNotifications(publisherId, page, pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleGetUnreadCount(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user?.sub;
    if (!publisherId) { res.status(401).json({ message: 'Unauthorized' }); return; }
    const count = await svc.getUnreadCount(publisherId);
    res.json({ count });
  } catch (err) {
    next(err);
  }
}

export async function handleMarkAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user?.sub;
    if (!publisherId) { res.status(401).json({ message: 'Unauthorized' }); return; }
    const { id } = req.params;
    await svc.markOneAsRead(publisherId, id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function handleMarkAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user?.sub;
    if (!publisherId) { res.status(401).json({ message: 'Unauthorized' }); return; }
    const count = await svc.markAllAsRead(publisherId);
    res.json({ updated: count });
  } catch (err) {
    next(err);
  }
}
