const API_URL = "/api";

function adminHeaders() {
  const token = localStorage.getItem("admin_token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface NetworkSettings {
  id?: number;
  network_name: string;
  tracking_domain: string;
  login_domain: string | null;
  support_email: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  login_bg_url: string | null;
  email_verification_required?: boolean;
  turnstile_enabled?: boolean;
  turnstile_site_key?: string;
  turnstile_secret_key?: string;
  auto_approve_publishers?: boolean;
  updated_at?: string;
  updated_by_admin_id?: string | null;
}

export interface PublicBranding {
  networkName: string;
  trackingDomain: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  loginBgUrl: string | null;
  loginDomain: string | null;
  supportEmail: string | null;
  turnstileEnabled?: boolean;
  turnstileSiteKey?: string;
}

export async function getAdminNetworkSettings(): Promise<NetworkSettings> {
  const response = await fetch(`${API_URL}/network-settings`, {
    headers: adminHeaders(),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to fetch network settings");
  }
  const data = await response.json();
  return data.settings as NetworkSettings;
}

export async function updateAdminNetworkSettings(
  payload: Partial<NetworkSettings>
): Promise<NetworkSettings> {
  const response = await fetch(`${API_URL}/network-settings`, {
    method: "PUT",
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error((data as any).message || "Failed to update network settings");
  }
  const data = await response.json();
  return data.settings as NetworkSettings;
}

export async function getPublicBranding(): Promise<PublicBranding> {
  const response = await fetch(`${API_URL}/network-settings/public`);
  if (!response.ok) {
    throw new Error("Failed to fetch public branding");
  }
  return response.json();
}
