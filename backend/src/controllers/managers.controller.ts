import { Response, NextFunction } from 'express';
import bcrypt from "bcryptjs";
import { AuthRequest } from "../types/auth.js";
import {
  listManagersWithStats,
  findManagerById,
  insertManager,
  updateManager,
  deleteManager,
  getManagerStats,
  findPublishersByManager,
  findApplicationsByManager,
} from "../repositories/managers.repository.js";

export async function handleListManagers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const managers = await listManagersWithStats();
    res.json({ managers });
  } catch (error) {
    next(error);
  }
}

export async function handleCreateManager(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { full_name, email, password, telegram, teams, is_active } = req.body as Record<string, unknown>;

    if (!full_name || typeof full_name !== 'string' || !full_name.trim()) {
      res.status(400).json({ message: 'full_name is required' });
      return;
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email as string)) {
      res.status(400).json({ message: 'valid email is required' });
      return;
    }
    if (!password || typeof password !== 'string' || (password as string).length < 8) {
      res.status(400).json({ message: 'password must be at least 8 characters' });
      return;
    }

    const str = (v: unknown): string | null =>
      typeof v === 'string' && v.trim() ? v.trim() : null;

    const password_hash = await bcrypt.hash(password as string, 12);

    const manager = await insertManager({
      full_name: (full_name as string).trim(),
      email: (email as string).trim().toLowerCase(),
      password_hash,
      is_active: is_active !== false,
      telegram: str(telegram),
      teams: str(teams),
    });

    res.status(201).json({ manager });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === '23505') {
      res.status(400).json({ message: 'A manager with this email already exists' });
      return;
    }
    next(error);
  }
}

export async function handleUpdateManager(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { full_name, email, password, telegram, teams, is_active } = req.body as Record<string, unknown>;

    const patch: {
      full_name?: string;
      email?: string;
      password_hash?: string;
      telegram?: string | null;
      teams?: string | null;
      is_active?: boolean;
    } = {};

    if (full_name !== undefined) patch.full_name = typeof full_name === 'string' ? full_name.trim() : String(full_name);
    if (email !== undefined) patch.email = typeof email === 'string' ? email.trim().toLowerCase() : String(email);
    if (password !== undefined && typeof password === 'string' && (password as string).length >= 8) {
      patch.password_hash = await bcrypt.hash(password as string, 12);
    }
    if (telegram !== undefined) patch.telegram = typeof telegram === 'string' && telegram.trim() ? telegram.trim() : null;
    if (teams !== undefined) patch.teams = typeof teams === 'string' && teams.trim() ? teams.trim() : null;
    if (is_active !== undefined) patch.is_active = Boolean(is_active);

    const manager = await updateManager(id, patch);
    if (!manager) {
      res.status(404).json({ message: 'Manager not found' });
      return;
    }

    res.json({ manager });
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === '23505') {
      res.status(400).json({ message: 'Email already in use' });
      return;
    }
    next(error);
  }
}

export async function handleDeleteManager(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const deleted = await deleteManager(id);
    if (!deleted) {
      res.status(404).json({ message: 'Manager not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function handleGetManagerStats(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const stats = await getManagerStats(id);
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

export async function handleGetManagerPublishers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const publishers = await findPublishersByManager(id);
    res.json({ publishers });
  } catch (error) {
    next(error);
  }
}

export async function handleGetManagerApplications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const applications = await findApplicationsByManager(id);
    res.json({ applications });
  } catch (error) {
    next(error);
  }
}
