import crypto from 'crypto';
import { query } from '../db/index.js';
import * as verificationRepo from '../repositories/verification.repository.js';
import * as mailerSvc from './mailer.service.js';

const TOKEN_EXPIRY_HOURS = 24;
const RESEND_RATE_LIMIT_SECONDS = 60;

function generateRawToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

async function getLoginUrl(): Promise<string> {
  const result = await query<{ login_domain: string | null; tracking_domain: string }>(
    `SELECT login_domain, tracking_domain FROM network_settings WHERE id = 1 LIMIT 1`
  );
  const row = result.rows[0];
  const url = row?.login_domain ?? row?.tracking_domain ?? '';
  return url.replace(/\/+$/, '');
}

export async function sendVerificationEmail(
  userType: 'publisher' | 'advertiser',
  userId: string,
  email: string,
  firstName: string
): Promise<void> {
  const recentToken = await verificationRepo.getMostRecentActiveToken(userType, userId);
  if (recentToken) {
    const elapsed = Date.now() - new Date(recentToken.created_at).getTime();
    if (elapsed < RESEND_RATE_LIMIT_SECONDS * 1000) {
      const waitSecs = Math.ceil((RESEND_RATE_LIMIT_SECONDS * 1000 - elapsed) / 1000);
      throw new Error(`Please wait ${waitSecs} seconds before requesting another verification email`);
    }
  }

  await verificationRepo.invalidateUnusedTokens(userType, userId);

  const rawToken = generateRawToken();
  const tokenHash = verificationRepo.hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  await verificationRepo.createVerificationToken(userType, userId, tokenHash, expiresAt);

  const loginUrl = await getLoginUrl();
  const verificationLink = `${loginUrl}?token=${rawToken}`;

  await mailerSvc.sendTemplateEmail(email, 'email_verification', {
    first_name: firstName,
    verification_link: verificationLink,
  });
}

export async function verifyEmailToken(rawToken: string): Promise<{
  status: 'verified' | 'already_verified' | 'expired' | 'invalid';
  user_type?: 'publisher' | 'advertiser';
}> {
  const tokenHash = verificationRepo.hashToken(rawToken);
  const record = await verificationRepo.findTokenByHash(tokenHash);

  if (!record) return { status: 'invalid' };
  if (record.used_at) return { status: 'already_verified', user_type: record.user_type };
  if (new Date(record.expires_at) < new Date()) return { status: 'expired', user_type: record.user_type };

  await verificationRepo.markTokenUsed(record.id);

  if (record.user_type === 'publisher') {
    await query(
      `UPDATE publishers SET email_verified = TRUE, email_verified_at = NOW() WHERE id = $1`,
      [record.user_id]
    );

    // If auto_approve_publishers is enabled, activate the publisher immediately
    const netResult = await query<{ auto_approve_publishers: boolean }>(
      `SELECT auto_approve_publishers FROM network_settings WHERE id = 1 LIMIT 1`
    );
    const autoApprove = netResult.rows[0]?.auto_approve_publishers ?? false;
    if (autoApprove) {
      await query(
        `UPDATE publishers
            SET account_status = 'ACTIVE', approval_status = 'APPROVED', is_active = TRUE
          WHERE id = $1 AND account_status = 'PENDING'`,
        [record.user_id]
      );
    }
  } else {
    await query(
      `UPDATE advertisers SET email_verified = TRUE, email_verified_at = NOW() WHERE id = $1`,
      [record.user_id]
    );
  }

  return { status: 'verified', user_type: record.user_type };
}

export async function resendVerificationEmail(
  email: string,
  userType: 'publisher' | 'advertiser'
): Promise<void> {
  if (userType === 'publisher') {
    const result = await query<{ id: string; full_name: string; email_verified: boolean }>(
      `SELECT id, full_name, email_verified FROM publishers WHERE email = $1 LIMIT 1`,
      [email]
    );
    const user = result.rows[0];
    if (!user) throw new Error('Account not found');
    if (user.email_verified) throw new Error('Email is already verified');
    const firstName = (user.full_name ?? '').split(' ')[0] ?? '';
    await sendVerificationEmail('publisher', user.id, email, firstName);
  } else {
    const result = await query<{ id: string; contact_name: string; email_verified: boolean }>(
      `SELECT id, contact_name, email_verified FROM advertisers WHERE email = $1 LIMIT 1`,
      [email]
    );
    const user = result.rows[0];
    if (!user) throw new Error('Account not found');
    if (user.email_verified) throw new Error('Email is already verified');
    const firstName = (user.contact_name ?? '').split(' ')[0] ?? '';
    await sendVerificationEmail('advertiser', user.id, email, firstName);
  }
}
