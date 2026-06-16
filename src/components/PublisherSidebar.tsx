import { useState, useEffect } from "react";
import { useBranding } from "../contexts/BrandingContext";
import {
  LayoutGrid,
  Globe,
  CheckCircle,
  Link2,
  Radio,
  Key,
  BarChart3,
  Wallet,
  FileText,
  Settings,
  LogOut,
  Mail,
  Layers,
  MessageCircle,
  UserCircle,
} from "lucide-react";

interface ManagerInfo {
  id: string;
  full_name: string;
  email: string;
  telegram: string | null;
  teams: string | null;
}

interface PublisherSidebarProps {
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  onLogout: () => void;
  publisherName: string;
}

const API_URL = "/api";

export function PublisherSidebar({ activeScreen, setActiveScreen, onLogout, publisherName }: PublisherSidebarProps) {
  const branding = useBranding();

  const [manager, setManager] = useState<ManagerInfo | null>(null);
  const [affiliateCode, setAffiliateCode] = useState<string>("");
  const [managerLoaded, setManagerLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setManagerLoaded(true);
      return;
    }
    fetch(`${API_URL}/publisher/me/manager`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data: { manager: ManagerInfo | null; affiliateCode: string | null }) => {
        setManager(data.manager ?? null);
        setAffiliateCode(data.affiliateCode ?? "");
      })
      .catch(() => {/* leave defaults */})
      .finally(() => setManagerLoaded(true));
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid, premium: false },
    { id: "marketplace", label: "All Offers", icon: Globe, premium: false },
    { id: "my-offers", label: "My Offers", icon: CheckCircle, premium: false },
    { id: "reports", label: "Reports Ledger", icon: BarChart3, premium: false },
    { id: "link-generator", label: "Tracking Links", icon: Link2, premium: false },
    { id: "postbacks", label: "Postback Setup", icon: Radio, premium: false },
    { id: "api-access", label: "API Access Tokens", icon: Key, premium: true },
    { id: "wallet", label: "My Wallet Balance", icon: Wallet, premium: false },
    { id: "invoices", label: "Invoices & Billing", icon: FileText, premium: false },
    { id: "profile", label: "Profile Settings", icon: Settings, premium: false },
  ];

  const telegramHandle = manager?.telegram
    ? manager.telegram.replace(/^@/, "")
    : null;

  return (
    <aside className="w-68 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 font-sans shadow-sm" id="publisher-sidebar">

      {/* Brand Header */}
      <div className="p-5 border-b theme-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt={branding.networkName} className="w-4 h-4 object-contain shrink-0" />
          ) : (
            <div className="bg-cyan-500 text-slate-950 p-2 rounded-lg font-black shadow-md shadow-cyan-500/10 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-black theme-text-main font-mono tracking-tight uppercase leading-none">
              {branding.networkName}
            </span>
            <span className="text-[9px] theme-text-muted font-mono tracking-widest pt-0.5 uppercase">
              Publisher Hub
            </span>
          </div>
        </div>
        <span className="bg-cyan-100 text-cyan-700 text-[8px] font-mono px-1.5 py-0.5 rounded border border-cyan-200 font-bold">
          LIVE
        </span>
      </div>

      {/* Logged in User Widget */}
      <div className="px-4 py-3 theme-bg-well border-b theme-border flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-cyan-900/10 dark:bg-cyan-900/60 border border-cyan-300 dark:border-cyan-700/50 flex items-center justify-center text-xs font-black text-cyan-600 dark:text-cyan-300 uppercase shrink-0">
          {publisherName.charAt(0) || "P"}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold theme-text-main truncate leading-tight">
            {publisherName || "—"}
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-mono theme-text-muted">
              {affiliateCode ? `Affiliate ID: ${affiliateCode}` : "Loading…"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Nav Items */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id || (item.id === "marketplace" && activeScreen.startsWith("offers/"));
          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition duration-150 relative select-none ${
                isActive
                  ? "theme-bg-well text-cyan-600 dark:text-cyan-400 font-semibold border-l-2 border-cyan-500"
                  : "theme-text-secondary hover:theme-bg-well hover:theme-text-main border-l-2 border-transparent"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-cyan-550 dark:text-cyan-400" : "theme-text-muted opacity-80"}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.premium && (
                <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 text-[8px] px-1 py-0.2 rounded border border-amber-300 dark:border-amber-900 text-center font-mono font-bold">
                  DEV
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Dedicated AM (Account Manager) Widget */}
      <div className="p-3 mx-3 mb-1 theme-bg-well rounded-xl border theme-border flex flex-col gap-2">
        <div className="text-[9px] font-bold theme-text-muted uppercase tracking-wider font-mono">
          Dedicated Account Manager
        </div>

        {!managerLoaded ? (
          <p className="text-[10px] theme-text-muted">Loading…</p>
        ) : manager ? (
          <>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300 shrink-0">
                {manager.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-[11px] leading-tight min-w-0">
                <span className="theme-text-main font-bold truncate">{manager.full_name}</span>
                <span className="theme-text-muted truncate font-mono text-[9px]">{manager.email}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono">
              <a
                href={`mailto:${manager.email}`}
                className="theme-bg-card hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded theme-text-secondary hover:text-cyan-600 dark:hover:text-cyan-400 transition flex items-center justify-center gap-1 border theme-border"
              >
                <Mail className="w-2.5 h-2.5 shrink-0" />
                Email AM
              </a>
              {telegramHandle ? (
                <a
                  href={`tg://resolve?domain=${telegramHandle}`}
                  className="theme-bg-card hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded theme-text-secondary hover:text-cyan-600 dark:hover:text-cyan-400 transition flex items-center justify-center gap-1 border theme-border"
                >
                  <MessageCircle className="w-2.5 h-2.5 shrink-0" />
                  Telegram
                </a>
              ) : (
                <span className="p-1 rounded theme-text-muted text-[9px] flex items-center justify-center gap-1 border theme-border opacity-50">
                  <MessageCircle className="w-2.5 h-2.5 shrink-0" />
                  No TG
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 py-1">
            <UserCircle className="w-4 h-4 theme-text-muted shrink-0" />
            <span className="text-[10px] theme-text-muted">No Manager Assigned</span>
          </div>
        )}
      </div>

      {/* Support Email */}
      {branding.supportEmail && (
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <a
            href={`mailto:${branding.supportEmail}`}
            className="flex items-center gap-2 text-[10px] theme-text-muted hover:text-cyan-600 transition truncate"
          >
            <Mail className="w-3 h-3 shrink-0" />
            <span className="font-mono truncate">{branding.supportEmail}</span>
          </a>
        </div>
      )}

      {/* Footer Log Out Area */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
        <button
          onClick={onLogout}
          className="theme-text-muted hover:theme-text-main hover:text-rose-650 dark:hover:text-rose-400 text-xs font-semibold flex items-center gap-2 cursor-pointer transition select-none outline-none"
        >
          <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-450 shrink-0" />
          Exit Securely
        </button>
        <span className="theme-text-muted opacity-60 font-mono text-[9px]">Server: UTC-2026</span>
      </div>

    </aside>
  );
}
