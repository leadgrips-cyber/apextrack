import { query } from "../db/index.js";
import { NetworkSettingsRecord, NetworkSettingsUpdatePayload } from "../types/network-settings.js";

export async function getNetworkSettings(): Promise<NetworkSettingsRecord | null> {
  const result = await query<NetworkSettingsRecord>(
    'SELECT * FROM network_settings LIMIT 1'
  );
  return result.rows[0] || null;
}

export async function upsertNetworkSettings(
  payload: NetworkSettingsUpdatePayload,
  adminId: string
): Promise<NetworkSettingsRecord> {
  const existing = await getNetworkSettings();

  const merged = {
    network_name:                payload.network_name                ?? existing?.network_name                ?? 'ApexTrack',
    tracking_domain:             payload.tracking_domain             ?? existing?.tracking_domain             ?? 'http://localhost:3000',
    login_domain:                'login_domain'                in payload ? payload.login_domain                : (existing?.login_domain                ?? null),
    support_email:               'support_email'               in payload ? payload.support_email               : (existing?.support_email               ?? null),
    logo_url:                    'logo_url'                    in payload ? payload.logo_url                    : (existing?.logo_url                    ?? null),
    favicon_url:                 'favicon_url'                 in payload ? payload.favicon_url                 : (existing?.favicon_url                 ?? null),
    login_bg_url:                'login_bg_url'                in payload ? payload.login_bg_url                : (existing?.login_bg_url                ?? null),
    email_verification_required: 'email_verification_required' in payload ? payload.email_verification_required : (existing?.email_verification_required ?? false),
    turnstile_enabled:           'turnstile_enabled'           in payload ? payload.turnstile_enabled           : (existing?.turnstile_enabled           ?? false),
    turnstile_site_key:          'turnstile_site_key'          in payload ? payload.turnstile_site_key          : (existing?.turnstile_site_key          ?? ''),
    turnstile_secret_key:        'turnstile_secret_key'        in payload ? payload.turnstile_secret_key        : (existing?.turnstile_secret_key        ?? ''),
    auto_approve_publishers:     'auto_approve_publishers'     in payload ? payload.auto_approve_publishers     : (existing?.auto_approve_publishers     ?? false),
  };

  const result = await query<NetworkSettingsRecord>(
    `INSERT INTO network_settings (
        id, network_name, tracking_domain, login_domain, support_email,
        logo_url, favicon_url, login_bg_url,
        email_verification_required, turnstile_enabled, turnstile_site_key, turnstile_secret_key,
        auto_approve_publishers,
        updated_at, updated_by_admin_id
      )
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13)
     ON CONFLICT (id) DO UPDATE SET
       network_name                = EXCLUDED.network_name,
       tracking_domain             = EXCLUDED.tracking_domain,
       login_domain                = EXCLUDED.login_domain,
       support_email               = EXCLUDED.support_email,
       logo_url                    = EXCLUDED.logo_url,
       favicon_url                 = EXCLUDED.favicon_url,
       login_bg_url                = EXCLUDED.login_bg_url,
       email_verification_required = EXCLUDED.email_verification_required,
       turnstile_enabled           = EXCLUDED.turnstile_enabled,
       turnstile_site_key          = EXCLUDED.turnstile_site_key,
       turnstile_secret_key        = EXCLUDED.turnstile_secret_key,
       auto_approve_publishers     = EXCLUDED.auto_approve_publishers,
       updated_at                  = NOW(),
       updated_by_admin_id         = EXCLUDED.updated_by_admin_id
     RETURNING *`,
    [
      merged.network_name,
      merged.tracking_domain,
      merged.login_domain,
      merged.support_email,
      merged.logo_url,
      merged.favicon_url,
      merged.login_bg_url,
      merged.email_verification_required,
      merged.turnstile_enabled,
      merged.turnstile_site_key,
      merged.turnstile_secret_key,
      merged.auto_approve_publishers,
      adminId,
    ]
  );
  return result.rows[0];
}
