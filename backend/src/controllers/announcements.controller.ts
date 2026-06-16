import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.js';
import * as svc from '../services/announcements.service.js';

// Publisher-facing: active announcements only
export async function handleListActiveAnnouncements(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const rows = await svc.listActiveAnnouncements();
    res.json({ announcements: rows });
  } catch (err) {
    next(err);
  }
}

// Admin: list all (active + inactive)
export async function handleAdminListAnnouncements(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(String(req.query.pageSize ?? '50'), 10)));
    const result = await svc.listAllAnnouncements(page, pageSize);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

// Admin: create announcement
export async function handleAdminCreateAnnouncement(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const adminId = req.user?.sub;
    if (!adminId) { res.status(401).json({ message: 'Unauthorized' }); return; }
    const { title, message, is_active = true } = req.body;
    if (!title || !message) { res.status(400).json({ message: 'title and message are required' }); return; }
    const row = await svc.createAnnouncement({ title, message, is_active: Boolean(is_active), admin_id: adminId });
    res.status(201).json({ announcement: row });
  } catch (err) {
    next(err);
  }
}

// Admin: update announcement
export async function handleAdminUpdateAnnouncement(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { title, message, is_active } = req.body;
    const updated = await svc.updateAnnouncement(id, {
      ...(title !== undefined && { title }),
      ...(message !== undefined && { message }),
      ...(is_active !== undefined && { is_active: Boolean(is_active) }),
    });
    res.json({ announcement: updated });
  } catch (err: any) {
    if (err.message === 'Announcement not found') { res.status(404).json({ message: err.message }); return; }
    next(err);
  }
}

// Admin: delete announcement
export async function handleAdminDeleteAnnouncement(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await svc.deleteAnnouncement(id);
    res.json({ success: true });
  } catch (err: any) {
    if (err.message === 'Announcement not found') { res.status(404).json({ message: err.message }); return; }
    next(err);
  }
}
