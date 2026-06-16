import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.js';
import { query } from '../db/index.js';
import * as verificationSvc from '../services/verification.service.js';

export async function handleVerifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token } = req.body as { token?: string };
    if (!token?.trim()) {
      res.status(400).json({ message: 'token is required' });
      return;
    }
    const result = await verificationSvc.verifyEmailToken(token.trim());
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function handleResendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, user_type } = req.body as { email?: string; user_type?: string };
    if (!email?.includes('@')) {
      res.status(400).json({ message: 'Valid email is required' });
      return;
    }
    if (user_type !== 'publisher' && user_type !== 'advertiser') {
      res.status(400).json({ message: 'user_type must be publisher or advertiser' });
      return;
    }
    await verificationSvc.resendVerificationEmail(email, user_type);
    res.json({ success: true, message: 'Verification email sent' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send verification email';
    if (msg.includes('Please wait')) {
      res.status(429).json({ message: msg });
      return;
    }
    if (msg.includes('already verified')) {
      res.status(409).json({ message: msg });
      return;
    }
    if (msg.toLowerCase().includes('smtp') || msg.toLowerCase().includes('mail')) {
      res.status(503).json({ message: 'Email delivery is not available. Please contact the administrator.' });
      return;
    }
    res.status(400).json({ message: msg });
  }
}

export async function handleGetVerificationStats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const [pubResult, advResult] = await Promise.all([
      query<{ verified: string; unverified: string }>(`
        SELECT
          COUNT(*) FILTER (WHERE email_verified = TRUE)  AS verified,
          COUNT(*) FILTER (WHERE email_verified = FALSE) AS unverified
        FROM publishers
      `),
      query<{ verified: string; unverified: string }>(`
        SELECT
          COUNT(*) FILTER (WHERE email_verified = TRUE)  AS verified,
          COUNT(*) FILTER (WHERE email_verified = FALSE) AS unverified
        FROM advertisers
      `),
    ]);
    res.json({
      publishers: {
        verified:   parseInt(pubResult.rows[0]?.verified   ?? '0', 10),
        unverified: parseInt(pubResult.rows[0]?.unverified ?? '0', 10),
      },
      advertisers: {
        verified:   parseInt(advResult.rows[0]?.verified   ?? '0', 10),
        unverified: parseInt(advResult.rows[0]?.unverified ?? '0', 10),
      },
    });
  } catch (err) {
    next(err);
  }
}
