import { NextFunction, Request, Response } from 'express';
import { AuthRequest } from '../types/auth.js';
import * as repo from '../repositories/admin-postback.repository.js';

const TOKEN_PATTERN = /\{(click_id|offer_id|publisher_id|payout|revenue|status|sub1|sub2|sub3|sub4|sub5)\}/gi;

// ─── Publisher Postbacks CRUD ────────────────────────────────────────────────

export async function handleListPostbacks(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page     = req.query.page     ? Number(req.query.page)     : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 50;

    const result = await repo.findAllPostbacksAdmin({
      publisherId: req.query.publisherId as string | undefined,
      offerId:     req.query.offerId ? Number(req.query.offerId) : undefined,
      page,
      pageSize,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleCreatePostback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { publisher_id, offer_id, callback_url, is_active } = req.body as {
      publisher_id: string;
      offer_id?: number | null;
      callback_url: string;
      is_active?: boolean;
    };

    if (!publisher_id || !callback_url) {
      res.status(400).json({ message: 'publisher_id and callback_url are required' });
      return;
    }

    const row = await repo.insertPostbackAdmin({
      publisher_id,
      offer_id:    offer_id ?? null,
      callback_url,
      is_active:   is_active ?? true,
    });
    res.status(201).json(row);
  } catch (error) {
    next(error);
  }
}

export async function handleUpdatePostback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const payload = req.body as { offer_id?: number | null; callback_url?: string; is_active?: boolean };
    const row = await repo.updatePostbackAdmin(id, payload);
    if (!row) {
      res.status(404).json({ message: 'Postback not found' });
      return;
    }
    res.json(row);
  } catch (error) {
    next(error);
  }
}

export async function handleDeletePostback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const deleted = await repo.deletePostbackAdmin(id);
    if (!deleted) {
      res.status(404).json({ message: 'Postback not found' });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

// ─── Postback Test ───────────────────────────────────────────────────────────

export async function handleTestPostback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const {
      postback_id,
      click_id,
      offer_id,
      publisher_id,
      payout,
      revenue,
      status,
      sub1 = '',
      sub2 = '',
      sub3 = '',
      sub4 = '',
      sub5 = '',
    } = req.body as {
      postback_id: string;
      click_id?: string;
      offer_id?: string;
      publisher_id?: string;
      payout?: string;
      revenue?: string;
      status?: string;
      sub1?: string;
      sub2?: string;
      sub3?: string;
      sub4?: string;
      sub5?: string;
    };

    if (!postback_id) {
      res.status(400).json({ message: 'postback_id is required' });
      return;
    }

    const postback = await repo.findPostbackForTest(postback_id);
    if (!postback) {
      res.status(404).json({ message: 'Postback not found' });
      return;
    }

    const vars: Record<string, string> = {
      click_id:     click_id     ?? '',
      offer_id:     offer_id     ?? String(postback.offer_id ?? ''),
      publisher_id: publisher_id ?? postback.publisher_id,
      payout:       payout       ?? '0.00',
      revenue:      revenue      ?? '0.00',
      status:       status       ?? 'approved',
      sub1, sub2, sub3, sub4, sub5,
    };

    const resolvedUrl = postback.callback_url.replace(
      TOKEN_PATTERN,
      (_, token: string) => vars[token.toLowerCase()] ?? ''
    );

    const startTime = Date.now();
    let statusCode = 0;
    let responseBody = '';

    try {
      const response = await fetch(resolvedUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(10_000),
      });
      statusCode    = response.status;
      responseBody  = (await response.text()).slice(0, 2048);
    } catch (err: any) {
      statusCode   = 0;
      responseBody = (err?.message ?? String(err)).slice(0, 512);
    }

    const responseTimeMs = Date.now() - startTime;

    res.json({
      resolved_url:    resolvedUrl,
      status_code:     statusCode,
      response_body:   responseBody,
      response_time_ms: responseTimeMs,
      success:         statusCode >= 200 && statusCode < 300,
    });
  } catch (error) {
    next(error);
  }
}

// ─── Log Endpoints ───────────────────────────────────────────────────────────

export async function handleAdvertiserLogs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page     = req.query.page     ? Number(req.query.page)     : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 50;

    const result = await repo.findAdvertiserPostbackLogs({
      page,
      pageSize,
      offerId:     req.query.offerId     ? Number(req.query.offerId)         : undefined,
      publisherId: req.query.publisherId as string | undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function handleAffiliateLogs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const page     = req.query.page     ? Number(req.query.page)     : 1;
    const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 50;

    const result = await repo.findAffiliatePostbackLogs({
      page,
      pageSize,
      offerId:     req.query.offerId     ? Number(req.query.offerId)         : undefined,
      publisherId: req.query.publisherId as string | undefined,
      status:      req.query.status      as string | undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}
