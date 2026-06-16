import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getPublicBranding } from "../services/network-settings";

export interface BrandingConfig {
  networkName: string;
  trackingDomain: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  loginBgUrl: string | null;
  loginDomain: string | null;
  supportEmail: string | null;
  turnstileEnabled: boolean;
  turnstileSiteKey: string;
}

const DEFAULT_BRANDING: BrandingConfig = {
  networkName: "Network",
  trackingDomain: "http://localhost:3000",
  logoUrl: null,
  faviconUrl: null,
  loginBgUrl: null,
  loginDomain: null,
  supportEmail: null,
  turnstileEnabled: false,
  turnstileSiteKey: "",
};

const BrandingContext = createContext<BrandingConfig>(DEFAULT_BRANDING);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);

  useEffect(() => {
    getPublicBranding()
      .then((data) => {
        setBranding({
          networkName:      data.networkName     || DEFAULT_BRANDING.networkName,
          trackingDomain:   data.trackingDomain  || DEFAULT_BRANDING.trackingDomain,
          logoUrl:          data.logoUrl         || null,
          faviconUrl:       data.faviconUrl      || null,
          loginBgUrl:       data.loginBgUrl      || null,
          loginDomain:      data.loginDomain     || null,
          supportEmail:     data.supportEmail    || null,
          turnstileEnabled: data.turnstileEnabled ?? false,
          turnstileSiteKey: data.turnstileSiteKey ?? "",
        });
      })
      .catch(() => {
        // Silently fall back to defaults — table may not exist in this environment yet
      });
  }, []);

  useEffect(() => {
    document.title = branding.networkName;
  }, [branding.networkName]);

  useEffect(() => {
    if (!branding.faviconUrl) return;
    let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = branding.faviconUrl;
  }, [branding.faviconUrl]);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding(): BrandingConfig {
  return useContext(BrandingContext);
}
