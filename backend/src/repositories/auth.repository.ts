import { query } from "../db/index.js";
import { AdminRecord, PublisherRecord, RegisterRequest } from "../types/auth.js";

export async function findPublisherByEmail(email: string): Promise<PublisherRecord | null> {
  const result = await query<PublisherRecord>(
    'SELECT * FROM publishers WHERE email = $1 LIMIT 1',
    [email]
  );

  return result.rows[0] || null;
}

export async function findAdminByEmail(email: string): Promise<AdminRecord | null> {
  const result = await query<AdminRecord>(
    'SELECT * FROM admins WHERE email = $1 LIMIT 1',
    [email]
  );

  return result.rows[0] || null;
}

export async function createPublisher(payload: RegisterRequest, passwordHash: string): Promise<PublisherRecord> {
  const loginName = payload.loginName || payload.email.split('@')[0];
  const affiliateCode = `AFF-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  const result = await query<PublisherRecord>(
    `INSERT INTO publishers (
        email,
        login_name,
        full_name,
        company_name,
        country_code,
        timezone,
        affiliate_code,
        password_hash,
        is_active,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, NOW(), NOW())
      RETURNING *`,
    [
      payload.email,
      loginName,
      payload.fullName,
      payload.companyName || null,
      payload.countryCode || null,
      payload.timezone || null,
      affiliateCode,
      passwordHash,
    ]
  );

  return result.rows[0];
}

export async function updatePublisherProfileMetadata(
  publisherId: string,
  profileMetadata: Record<string, string | null>
): Promise<PublisherRecord> {
  const result = await query<PublisherRecord>(
    `UPDATE publishers
     SET profile_metadata = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [profileMetadata, publisherId]
  );

  return result.rows[0];
}

export async function markPublisherLastLogin(publisherId: string) {
  await query('UPDATE publishers SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1', [publisherId]);
}

export async function markAdminLastLogin(adminId: string) {
  await query('UPDATE admins SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1', [adminId]);
}
