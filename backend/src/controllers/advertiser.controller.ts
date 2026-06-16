import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from "../types/auth.js";
import {
  AdvertiserCreatePayload,
  AdvertiserFilterParams,
  AdvertiserUpdatePayload,
} from "../types/advertiser.js";
import {
  signupAdvertiser,
  loginAdvertiser,
  createAdvertiser,
  updateAdvertiser,
  activateAdvertiser,
  deactivateAdvertiser,
  getAdvertiser,
  listAdvertisers,
  getAdvertiserCounts,
} from "../services/advertiser.service.js";

function isClientError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return (
    err.message.includes('required')         ||
    err.message.includes('already exists')   ||
    err.message.includes('not found')        ||
    err.message.includes('Invalid')          ||
    err.message.includes('awaiting')         ||
    err.message.includes('at least')
  );
}

// ── Public ─────────────────────────────────────────────────────────────────────

export async function handleAdvertiserSignup(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const adv = await signupAdvertiser(req.body);
    res.status(201).json({
      success: true,
      message: 'Your advertiser account is awaiting admin approval.',
      advertiser: {
        id:           adv.id,
        company_name: adv.company_name,
        contact_name: adv.contact_name,
        email:        adv.email,
        status:       adv.status,
      },
    });
  } catch (err) {
    if (isClientError(err)) {
      res.status(400).json({ message: (err as Error).message });
      return;
    }
    next(err);
  }
}

export async function handleAdvertiserLogin(
  req: Request, res: Response, next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await loginAdvertiser(email, password);
    res.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'Account awaiting admin approval') {
      res.status(403).json({ message: err.message });
      return;
    }
    if (isClientError(err)) {
      res.status(401).json({ message: (err as Error).message });
      return;
    }
    next(err);
  }
}

// ── Admin ──────────────────────────────────────────────────────────────────────

export async function handleGetAdvertiserCounts(
  _req: AuthRequest, res: Response, next: NextFunction
): Promise<void> {
  try {
    const counts = await getAdvertiserCounts();
    res.json({ counts });
  } catch (err) {
    next(err);
  }
}

export async function handleListAdvertisers(
  req: AuthRequest, res: Response, next: NextFunction
): Promise<void> {
  try {
    const filters: AdvertiserFilterParams = {
      status:    req.query.status    as any     || undefined,
      search:    req.query.search    as string  || undefined,
    };
    if (req.query.is_active !== undefined) {
      filters.is_active = req.query.is_active === 'true';
    }
    const advertisers = await listAdvertisers(filters);
    res.json({ advertisers });
  } catch (err) {
    next(err);
  }
}

export async function handleGetAdvertiser(
  req: AuthRequest, res: Response, next: NextFunction
): Promise<void> {
  try {
    const adv = await getAdvertiser(req.params.id);
    res.json({ advertiser: adv });
  } catch (err) {
    if (isClientError(err)) {
      res.status(404).json({ message: (err as Error).message });
      return;
    }
    next(err);
  }
}

export async function handleCreateAdvertiser(
  req: AuthRequest, res: Response, next: NextFunction
): Promise<void> {
  try {
    const payload = req.body as AdvertiserCreatePayload;
    const adv = await createAdvertiser(payload, req.user?.sub || '');
    res.status(201).json({ advertiser: adv });
  } catch (err) {
    if (isClientError(err)) {
      res.status(400).json({ message: (err as Error).message });
      return;
    }
    next(err);
  }
}

export async function handleUpdateAdvertiser(
  req: AuthRequest, res: Response, next: NextFunction
): Promise<void> {
  try {
    const payload = req.body as AdvertiserUpdatePayload;
    const adv = await updateAdvertiser(req.params.id, payload);
    res.json({ advertiser: adv });
  } catch (err) {
    if (isClientError(err)) {
      res.status(400).json({ message: (err as Error).message });
      return;
    }
    next(err);
  }
}

export async function handleActivateAdvertiser(
  req: AuthRequest, res: Response, next: NextFunction
): Promise<void> {
  try {
    const adv = await activateAdvertiser(req.params.id);
    res.json({ advertiser: adv });
  } catch (err) {
    if (isClientError(err)) {
      res.status(404).json({ message: (err as Error).message });
      return;
    }
    next(err);
  }
}

export async function handleDeactivateAdvertiser(
  req: AuthRequest, res: Response, next: NextFunction
): Promise<void> {
  try {
    const adv = await deactivateAdvertiser(req.params.id);
    res.json({ advertiser: adv });
  } catch (err) {
    if (isClientError(err)) {
      res.status(404).json({ message: (err as Error).message });
      return;
    }
    next(err);
  }
}
