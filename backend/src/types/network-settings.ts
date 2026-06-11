export interface NetworkSettingsRecord {
  id: number;
  network_name: string;
  tracking_domain: string;
  login_domain: string | null;
  support_email: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  login_bg_url: string | null;
  updated_at: string;
  updated_by_admin_id: string | null;
}

export interface NetworkSettingsUpdatePayload {
  network_name?: string;
  tracking_domain?: string;
  login_domain?: string | null;
  support_email?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  login_bg_url?: string | null;
}

export interface PublicNetworkSettings {
  networkName: string;
  trackingDomain: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  loginBgUrl: string | null;
}
