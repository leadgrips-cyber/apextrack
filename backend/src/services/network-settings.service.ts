import * as networkSettingsRepository from "../repositories/network-settings.repository.js";
import { NetworkSettingsUpdatePayload, PublicNetworkSettings } from "../types/network-settings.js";

const DEFAULTS = {
  network_name: 'ApexTrack',
  tracking_domain: 'http://localhost:3000',
  login_domain: null as null,
  support_email: null as null,
  logo_url: null as null,
  favicon_url: null as null,
  login_bg_url: null as null,
  email_verification_required: false,
  turnstile_enabled: false,
  turnstile_site_key: '',
  turnstile_secret_key: '',
  auto_approve_publishers: false,
};

export async function getSettings() {
  const settings = await networkSettingsRepository.getNetworkSettings();
  if (settings) return settings;
  return { id: 0, ...DEFAULTS, updated_at: new Date().toISOString(), updated_by_admin_id: null };
}

export async function getPublicSettings(): Promise<PublicNetworkSettings> {
  const settings = await networkSettingsRepository.getNetworkSettings();
  return {
    networkName:     settings?.network_name     ?? DEFAULTS.network_name,
    trackingDomain:  settings?.tracking_domain  ?? DEFAULTS.tracking_domain,
    logoUrl:         settings?.logo_url         ?? null,
    faviconUrl:      settings?.favicon_url      ?? null,
    loginBgUrl:      settings?.login_bg_url     ?? null,
    loginDomain:     settings?.login_domain     ?? null,
    supportEmail:    settings?.support_email    ?? null,
    turnstileEnabled: settings?.turnstile_enabled  ?? false,
    turnstileSiteKey: settings?.turnstile_site_key ?? '',
  };
}

export async function updateSettings(payload: NetworkSettingsUpdatePayload, adminId: string) {
  if (payload.network_name !== undefined && !payload.network_name.trim()) {
    throw new Error('Network name cannot be empty');
  }
  if (payload.tracking_domain !== undefined && !payload.tracking_domain.trim()) {
    throw new Error('Tracking domain cannot be empty');
  }
  return networkSettingsRepository.upsertNetworkSettings(payload, adminId);
}
