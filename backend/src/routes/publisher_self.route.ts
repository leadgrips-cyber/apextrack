import crypto from 'crypto';
import { Router, Response, NextFunction } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { AuthRequest } from "../types/auth.js";
import { getPublisherManagerInfo } from "../repositories/publisher.repository.js";
import { query } from "../db/index.js";

const router = Router();
router.use(authenticateJwt, authorizeRoles('publisher'));

router.get('/manager', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const info = await getPublisherManagerInfo(req.user.sub);
    if (!info) {
      res.json({ manager: null, affiliateCode: null });
      return;
    }
    const settings = info.manager_settings;
    const manager = info.manager_id
      ? {
          id: info.manager_id,
          full_name: info.manager_full_name,
          email: info.manager_email,
          telegram: settings?.telegram ?? null,
          teams: settings?.teams ?? null,
        }
      : null;
    res.json({ manager, affiliateCode: info.affiliate_code });
  } catch (error) {
    next(error);
  }
});

router.get('/invoices', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return; }
    const result = await query(
      `SELECT id, invoice_number, period_start, period_end, gross_amount, fee_amount, net_amount,
              status, payout_method, notes, generated_at, paid_at
       FROM payout_invoices
       WHERE publisher_id = $1
       ORDER BY generated_at DESC`,
      [req.user.sub]
    );
    res.json({ invoices: result.rows });
  } catch (error) { next(error); }
});

router.get('/approved-offers', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return; }
    const result = await query(
      `SELECT
         o.id,
         o.name,
         o.slug,
         o.category,
         o.status,
         o.payout_type,
         o.payout_amount,
         o.currency,
         o.target_geos,
         o.target_devices,
         o.landing_page_url,
         o.preview_url,
         o.offer_logo_url,
         o.requires_publisher_approval,
         o.caps,
         o.terms,
         o.traffic_rules,
         a.company_name AS advertiser_name,
         oa.reviewed_at AS approved_at
       FROM offer_applications oa
       INNER JOIN offers o ON o.id = oa.offer_id
       LEFT JOIN advertisers a ON a.id = o.advertiser_id
       WHERE oa.publisher_id = $1
         AND oa.status = 'APPROVED'
         AND o.status = 'ACTIVE'
       ORDER BY oa.reviewed_at DESC`,
      [req.user.sub]
    );
    res.json({ offers: result.rows });
  } catch (error) { next(error); }
});

router.get('/api-token', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return; }
    const result = await query(
      `SELECT id, description, scopes, created_at, last_used_at, expires_at
       FROM api_tokens
       WHERE publisher_id = $1 AND is_active = true
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.sub]
    );
    if (result.rows.length === 0) {
      res.json({ token: null });
      return;
    }
    res.json({ token: result.rows[0] });
  } catch (error) { next(error); }
});

router.post('/api-token/regenerate', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) { res.status(401).json({ message: 'Unauthorized' }); return; }
    // Deactivate all existing tokens for this publisher
    await query(
      `UPDATE api_tokens SET is_active = false, updated_at = NOW() WHERE publisher_id = $1`,
      [req.user.sub]
    );
    // Generate new token
    const rawToken = `pub_${crypto.randomBytes(32).toString('hex')}`;
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const insertResult = await query(
      `INSERT INTO api_tokens (publisher_id, token_hash, description, scopes, is_active)
       VALUES ($1, $2, 'Publisher API Token', ARRAY['read','write'], true)
       RETURNING id, description, scopes, created_at`,
      [req.user.sub, tokenHash]
    );
    res.json({ token: insertResult.rows[0], raw_token: rawToken });
  } catch (error) { next(error); }
});

export default router;
