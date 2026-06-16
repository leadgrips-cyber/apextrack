import crypto from 'crypto';
import { query } from '../db/index.js';
import { VerificationTokenRecord } from '../types/verification.js';

export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export async function createVerificationToken(
  userType: 'publisher' | 'advertiser',
  userId: string,
  tokenHash: string,
  expiresAt: Date
): Promise<void> {
  await query(
    `INSERT INTO email_verification_tokens (user_type, user_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userType, userId, tokenHash, expiresAt]
  );
}

export async function findTokenByHash(tokenHash: string): Promise<VerificationTokenRecord | null> {
  const result = await query<VerificationTokenRecord>(
    `SELECT * FROM email_verification_tokens WHERE token_hash = $1 LIMIT 1`,
    [tokenHash]
  );
  return result.rows[0] ?? null;
}

export async function markTokenUsed(id: string): Promise<void> {
  await query(
    `UPDATE email_verification_tokens SET used_at = NOW() WHERE id = $1`,
    [id]
  );
}

export async function invalidateUnusedTokens(
  userType: 'publisher' | 'advertiser',
  userId: string
): Promise<void> {
  await query(
    `UPDATE email_verification_tokens SET used_at = NOW()
     WHERE user_type = $1 AND user_id = $2 AND used_at IS NULL`,
    [userType, userId]
  );
}

export async function getMostRecentActiveToken(
  userType: 'publisher' | 'advertiser',
  userId: string
): Promise<VerificationTokenRecord | null> {
  const result = await query<VerificationTokenRecord>(
    `SELECT * FROM email_verification_tokens
     WHERE user_type = $1 AND user_id = $2 AND used_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [userType, userId]
  );
  return result.rows[0] ?? null;
}
