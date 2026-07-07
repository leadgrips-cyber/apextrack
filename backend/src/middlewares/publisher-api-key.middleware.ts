import crypto from 'crypto';
import { NextFunction, Response } from 'express';
import { query } from "../db/index.js";
import { PublisherApiRequest } from "../types/publisherApi.js";

interface ApiTokenRow {
  id: string;
  publisher_id: string | null;
  scopes: string[];
  is_active: boolean;
  expires_at: string | null;
}

interface PublisherRow {
  id: string;
  email: string;
  account_status: string;
  is_active: boolean;
}

// Publishers may present their key as a standard Bearer token, the generic
// X-API-Key header, or the branded "x-<network-name>-api-key" header shown
// in the dashboard's usage example (network name is admin-configurable, so
// we match any header ending in -api-key rather than hardcoding one brand).
function extractRawToken(req: PublisherApiRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const value = authHeader.slice(7).trim();
    if (value.startsWith('pub_')) return value;
  }

  for (const [name, value] of Object.entries(req.headers)) {
    if (!/-api-key$/i.test(name)) continue;
    const headerValue = Array.isArray(value) ? value[0] : value;
    if (typeof headerValue === 'string' && headerValue.trim().startsWith('pub_')) {
      return headerValue.trim();
    }
  }

  return null;
}

export async function authenticatePublisherApiKey(
  req: PublisherApiRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const rawToken = extractRawToken(req);
    if (!rawToken) {
      res.status(401).json({
        error: 'MISSING_API_KEY',
        message: 'Provide your API key via "Authorization: Bearer pub_..." or an "*-api-key" header.',
      });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenResult = await query<ApiTokenRow>(
      `SELECT id, publisher_id, scopes, is_active, expires_at
       FROM api_tokens
       WHERE token_hash = $1
       LIMIT 1`,
      [tokenHash]
    );
    const token = tokenResult.rows[0];

    if (!token || !token.publisher_id) {
      res.status(401).json({ error: 'INVALID_API_KEY', message: 'This API key is not recognized.' });
      return;
    }
    if (!token.is_active) {
      res.status(401).json({ error: 'REVOKED_API_KEY', message: 'This API key has been revoked. Generate a new one from the dashboard.' });
      return;
    }
    if (token.expires_at && new Date(token.expires_at).getTime() < Date.now()) {
      res.status(401).json({ error: 'EXPIRED_API_KEY', message: 'This API key has expired. Generate a new one from the dashboard.' });
      return;
    }
    if (!token.scopes || !token.scopes.includes('read')) {
      res.status(403).json({ error: 'INSUFFICIENT_SCOPE', message: 'This API key does not have the required scope.' });
      return;
    }

    const publisherResult = await query<PublisherRow>(
      `SELECT id, email, account_status, is_active FROM publishers WHERE id = $1 LIMIT 1`,
      [token.publisher_id]
    );
    const publisher = publisherResult.rows[0];
    if (!publisher || !publisher.is_active || publisher.account_status !== 'ACTIVE') {
      res.status(403).json({ error: 'ACCOUNT_NOT_ACTIVE', message: 'This publisher account is not active.' });
      return;
    }

    // Best-effort last-used tracking; must never block the request.
    query(`UPDATE api_tokens SET last_used_at = NOW() WHERE id = $1`, [token.id]).catch(() => {});

    req.user = {
      sub: publisher.id,
      role: 'publisher',
      email: publisher.email,
      issuedAt: Math.floor(Date.now() / 1000),
      expiresAt: 0,
    };
    req.apiKeyScopes = token.scopes;
    next();
  } catch (error) {
    next(error);
  }
}
