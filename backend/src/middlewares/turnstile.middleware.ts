import { Request, Response, NextFunction } from 'express';
import { query } from '../db/index.js';

export async function validateTurnstile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await query<{ turnstile_enabled: boolean; turnstile_secret_key: string }>(
      `SELECT turnstile_enabled, turnstile_secret_key FROM network_settings WHERE id = 1 LIMIT 1`
    );
    const settings = result.rows[0];

    if (!settings?.turnstile_enabled) {
      next();
      return;
    }

    const token = (req.body as Record<string, unknown>)['cf-turnstile-response'] as string | undefined;
    if (!token) {
      res.status(400).json({ message: 'CAPTCHA verification is required' });
      return;
    }

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: settings.turnstile_secret_key, response: token }),
    });

    const data = await verifyRes.json() as { success: boolean };
    if (!data.success) {
      res.status(403).json({ message: 'CAPTCHA verification failed. Please try again.' });
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
}
