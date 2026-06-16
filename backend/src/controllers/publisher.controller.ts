import { NextFunction, Response } from 'express';
import { AuthRequest } from "../types/auth.js";
import {
  adminCreatePublisher,
  approvePublisher,
  assignManager,
  blockPublisher,
  getPublisherDetails,
  getPublisherWallet,
  listManagers,
  listPublisherApplications,
  listPublisherTrackingLinks,
  listPublishers,
  reactivatePublisher,
  rejectPublisher,
  suspendPublisher,
  updatePublisherProfile,
} from "../services/publisher.service.js";
import { bulkAssignPublishers } from "../repositories/publisher.repository.js";

function parsePositiveNumber(value: unknown, fallback: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }
  return Math.max(1, Math.floor(numeric));
}

export async function handleListPublishers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page = parsePositiveNumber(req.query.page, 1);
    const pageSize = parsePositiveNumber(req.query.page_size, 25);

    const publishers = await listPublishers({
      status: req.query.status as string | undefined,
      search: req.query.search as string | undefined,
      page,
      pageSize,
    });

    res.json(publishers);
  } catch (error) {
    next(error);
  }
}

export async function handleGetPublisherDetails(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const publisher = await getPublisherDetails(publisherId);
    res.json({ publisher });
  } catch (error) {
    next(error);
  }
}

export async function handleApprovePublisher(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const publisher = await approvePublisher(publisherId);
    res.json({ publisher });
  } catch (error) {
    next(error);
  }
}

export async function handleRejectPublisher(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : undefined;
    const publisher = await rejectPublisher(publisherId, reason);
    res.json({ publisher });
  } catch (error) {
    next(error);
  }
}

export async function handleSuspendPublisher(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const publisher = await suspendPublisher(publisherId);
    res.json({ publisher });
  } catch (error) {
    next(error);
  }
}

export async function handleReactivatePublisher(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const publisher = await reactivatePublisher(publisherId);
    res.json({ publisher });
  } catch (error) {
    next(error);
  }
}

export async function handleBlockPublisher(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const publisher = await blockPublisher(publisherId);
    res.json({ publisher });
  } catch (error) {
    next(error);
  }
}

export async function handleGetPublisherWallet(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const wallet = await getPublisherWallet(publisherId);
    res.json({ wallet });
  } catch (error) {
    next(error);
  }
}

export async function handleListPublisherApplications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const applications = await listPublisherApplications(publisherId);
    res.json({ applications });
  } catch (error) {
    next(error);
  }
}

export async function handleListPublisherTrackingLinks(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const trackingLinks = await listPublisherTrackingLinks(publisherId);
    res.json({ trackingLinks });
  } catch (error) {
    next(error);
  }
}

export async function handleListManagers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const result = await listManagers();
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleAdminCreatePublisher(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const {
      first_name, last_name, email, password, country_code,
      status, assigned_manager_id, telegram, skype, whatsapp,
      tracking_domain, traffic_source, postback_url,
    } = req.body as Record<string, unknown>;

    if (!first_name || typeof first_name !== 'string' || !first_name.trim()) {
      res.status(400).json({ message: 'first_name is required' });
      return;
    }
    if (!last_name || typeof last_name !== 'string' || !last_name.trim()) {
      res.status(400).json({ message: 'last_name is required' });
      return;
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      res.status(400).json({ message: 'email is required' });
      return;
    }
    if (!password || typeof password !== 'string' || (password as string).length < 8) {
      res.status(400).json({ message: 'password must be at least 8 characters' });
      return;
    }
    if (!country_code || typeof country_code !== 'string') {
      res.status(400).json({ message: 'country_code is required' });
      return;
    }
    const validStatuses = ['PENDING', 'ACTIVE', 'SUSPENDED'] as const;
    if (!status || !validStatuses.includes(status as typeof validStatuses[number])) {
      res.status(400).json({ message: 'status must be PENDING, ACTIVE, or SUSPENDED' });
      return;
    }

    const str = (v: unknown): string | null =>
      typeof v === 'string' && v.trim() ? v.trim() : null;

    const publisher = await adminCreatePublisher({
      first_name: (first_name as string).trim(),
      last_name: (last_name as string).trim(),
      email: (email as string).trim().toLowerCase(),
      password: password as string,
      country_code: (country_code as string).trim().toUpperCase(),
      status: status as 'PENDING' | 'ACTIVE' | 'SUSPENDED',
      assigned_manager_id: str(assigned_manager_id),
      telegram: str(telegram),
      skype: str(skype),
      whatsapp: str(whatsapp),
      tracking_domain: str(tracking_domain),
      traffic_source: str(traffic_source),
      postback_url: str(postback_url),
    });

    res.status(201).json({ publisher });
  } catch (error: any) {
    if (error.message === 'A publisher with this email already exists') {
      res.status(400).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function handleAssignManager(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const { manager_id } = req.body as { manager_id?: string };
    if (!manager_id || typeof manager_id !== 'string' || !manager_id.trim()) {
      res.status(400).json({ message: 'manager_id is required' });
      return;
    }
    const publisher = await assignManager(publisherId, manager_id.trim());
    res.json({ publisher });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdatePublisherProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.params.id;
    const body = req.body as Record<string, unknown>;
    const str = (v: unknown): string | undefined =>
      typeof v === 'string' ? v : undefined;

    const publisher = await updatePublisherProfile(publisherId, {
      full_name:            str(body.full_name),
      email:                str(body.email),
      login_name:           str(body.login_name),
      company_name:         str(body.company_name),
      country_code:         str(body.country_code),
      account_status:       str(body.account_status),
      new_password:         str(body.new_password),
      phone:                str(body.phone),
      website:              str(body.website),
      address:              str(body.address),
      city:                 str(body.city),
      state_name:           str(body.state_name),
      postal_code:          str(body.postal_code),
      payment_method:       str(body.payment_method),
      payment_details:      str(body.payment_details),
      payment_term:         str(body.payment_term),
      internal_notes:       str(body.internal_notes),
      traffic_quality_notes: str(body.traffic_quality_notes),
      risk_score:           str(body.risk_score),
      telegram:             str(body.telegram),
      skype:                str(body.skype),
      whatsapp:             str(body.whatsapp),
      manager_notes:             str(body.manager_notes),
      manager_recommendation:    str(body.manager_recommendation),
      manager_notes_updated_at:  str(body.manager_notes_updated_at),
    });
    res.json({ publisher });
  } catch (error) {
    next(error);
  }
}

export async function handleBulkAssign(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { publisher_ids, manager_id } = req.body as { publisher_ids: unknown; manager_id: unknown };

    if (!Array.isArray(publisher_ids) || publisher_ids.length === 0) {
      res.status(400).json({ message: 'publisher_ids must be a non-empty array' });
      return;
    }
    if (!publisher_ids.every((id) => typeof id === 'string')) {
      res.status(400).json({ message: 'all publisher_ids must be strings' });
      return;
    }

    const resolvedManagerId = typeof manager_id === 'string' && manager_id.trim() ? manager_id.trim() : null;
    const count = await bulkAssignPublishers(publisher_ids as string[], resolvedManagerId);
    res.json({ updated: count });
  } catch (error) {
    next(error);
  }
}
