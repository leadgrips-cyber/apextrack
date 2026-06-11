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
    network_name: payload.network_name ?? existing?.network_name ?? 'ApexTrack',
    tracking_domain: payload.tracking_domain ?? existing?.tracking_domain ?? 'http://localhost:3000',
    login_domain: 'login_domain' in payload ? payload.login_domain : (existing?.login_domain ?? null),
    support_email: 'support_email' in payload ? payload.support_email : (existing?.support_email ?? null),
    logo_url: 'logo_url' in payload ? payload.logo_url : (existing?.logo_url ?? null),
    favicon_url: 'favicon_url' in payload ? payload.favicon_url : (existing?.favicon_url ?? null),
    login_bg_url: 'login_bg_url' in payload ? payload.login_bg_url : (existing?.login_bg_url ?? null),
  };

  const result = await query<NetworkSettingsRecord>(
    `INSERT INTO network_settings (id, network_name, tracking_domain, login_domain, support_email, logo_url, favicon_url, login_bg_url, updated_at, updated_by_admin_id)
     VALUES (1, $1, $2, $3, $4, $5, $6, $7, NOW(), $8)
     ON CONFLICT (id) DO UPDATE SET
       network_name       = EXCLUDED.network_name,
       tracking_domain    = EXCLUDED.tracking_domain,
       login_domain       = EXCLUDED.login_domain,
       support_email      = EXCLUDED.support_email,
       logo_url           = EXCLUDED.logo_url,
       favicon_url        = EXCLUDED.favicon_url,
       login_bg_url       = EXCLUDED.login_bg_url,
       updated_at         = NOW(),
       updated_by_admin_id = EXCLUDED.updated_by_admin_id
     RETURNING *`,
    [
      merged.network_name,
      merged.tracking_domain,
      merged.login_domain,
      merged.support_email,
      merged.logo_url,
      merged.favicon_url,
      merged.login_bg_url,
      adminId,
    ]
  );
  return result.rows[0];
}
