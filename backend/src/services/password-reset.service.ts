import crypto from 'crypto';
import { query } from '../db/index.js';
import { sendTemplateEmail } from './mailer.service.js';

const TOKEN_EXPIRY_HOURS = 1;

function generateRawToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

export async function requestPasswordReset(email: string): Promise<void> {
  const pubResult = await query<{ id: string; full_name: string }>(
    `SELECT id, full_name FROM publishers WHERE email = $1 LIMIT 1`,
    [email]
  );

  let userType: 'publisher' | 'advertiser' | null = null;
  let userId: string | null = null;
  let firstName = '';

  if (pubResult.rows.length > 0) {
    userType = 'publisher';
    userId = pubResult.rows[0].id;
    firstName = (pubResult.rows[0].full_name ?? '').split(' ')[0] ?? '';
  } else {
    const advResult = await query<{ id: string; contact_name: string }>(
      `SELECT id, contact_name FROM advertisers WHERE email = $1 LIMIT 1`,
      [email]
    );
    if (advResult.rows.length > 0) {
      userType = 'advertiser';
      userId = advResult.rows[0].id;
      firstName = (advResult.rows[0].contact_name ?? '').split(' ')[0] ?? '';
    }
  }

  if (!userType || !userId) {
    // Silent success — do not reveal whether the email is registered
    return;
  }

  // Invalidate any previous unused tokens
  await query(
    `UPDATE password_reset_tokens SET used_at = NOW()
     WHERE user_type = $1 AND user_id = $2 AND used_at IS NULL`,
    [userType, userId]
  );

  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await query(
    `INSERT INTO password_reset_tokens (user_type, user_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userType, userId, tokenHash, expiresAt]
  );

  const settingsResult = await query<{ login_domain: string | null; tracking_domain: string }>(
    `SELECT login_domain, tracking_domain FROM network_settings WHERE id = 1 LIMIT 1`
  );
  const row = settingsResult.rows[0];
  const baseUrl = (row?.login_domain ?? row?.tracking_domain ?? '').replace(/\/+$/, '');
  const resetLink = `${baseUrl}?reset_token=${rawToken}`;

  await sendTemplateEmail(email, 'password_reset', {
    first_name: firstName,
    reset_link: resetLink,
  });
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<{ userType: 'publisher' | 'advertiser' }> {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const tokenHash = hashToken(rawToken);
  const result = await query<{
    id: string;
    user_type: 'publisher' | 'advertiser';
    user_id: string;
    expires_at: string;
    used_at: string | null;
  }>(
    `SELECT id, user_type, user_id, expires_at, used_at
     FROM password_reset_tokens WHERE token_hash = $1 LIMIT 1`,
    [tokenHash]
  );

  const token = result.rows[0];
  if (!token) throw new Error('Invalid or expired reset link');
  if (token.used_at) throw new Error('This reset link has already been used');
  if (new Date(token.expires_at) < new Date()) throw new Error('Reset link has expired');

  const { hashPassword } = await import('../utils/hash.js');
  const passwordHash = await hashPassword(newPassword);

  if (token.user_type === 'publisher') {
    await query(
      `UPDATE publishers SET password_hash = $1 WHERE id = $2`,
      [passwordHash, token.user_id]
    );
  } else {
    await query(
      `UPDATE advertisers SET password_hash = $1 WHERE id = $2`,
      [passwordHash, token.user_id]
    );
  }

  await query(
    `UPDATE password_reset_tokens SET used_at = NOW() WHERE id = $1`,
    [token.id]
  );

  return { userType: token.user_type };
}
