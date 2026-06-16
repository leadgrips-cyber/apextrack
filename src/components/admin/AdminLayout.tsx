import React, { useState } from "react";
import { Search, Plus, Menu, X, LogOut, ArrowLeft } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { useBranding } from "../../contexts/BrandingContext";

interface AdminLayoutProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  adminName: string;
  onLogout: () => void;
  onReturnToPublisher?: () => void;
  onCreateOffer?: () => void;
  children: React.ReactNode;
}

export function AdminLayout({
  activeSection,
  setActiveSection,
  adminName,
  onLogout,
  onReturnToPublisher,
  onCreateOffer,
  children,
}: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const branding = useBranding();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="hidden lg:block shrink-0">
        <AdminSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onLogout={onLogout}
        />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="theme-bg-card border-b theme-border h-16 flex items-center justify-between px-6 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden theme-text-muted hover:theme-text-main hover:theme-bg-well p-2 rounded-xl transition"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex flex-col text-sm">
              <span className="font-black theme-text-main uppercase tracking-[0.22em] text-slate-900 dark:text-white">
                {branding.networkName}
              </span>
              <span className="text-[10px] theme-text-muted uppercase tracking-wider font-mono">
                {adminName}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {onReturnToPublisher && (
              <button
                onClick={onReturnToPublisher}
                className="text-xs font-semibold uppercase tracking-[0.24em] px-3 py-2 rounded-xl border theme-border theme-bg-well theme-text-secondary hover:theme-text-main transition"
              >
                <ArrowLeft className="w-4 h-4 inline-block mr-2" /> Publisher View
              </button>
            )}

            <button
              onClick={onCreateOffer}
              className="group flex items-center gap-2 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition"
            >
              <Plus className="w-4 h-4" />
              New Offer
            </button>

            <button
              onClick={onLogout}
              className="rounded-xl border theme-border px-3 py-2 text-xs font-semibold theme-text-secondary hover:theme-text-main hover:bg-slate-100 dark:hover:bg-slate-900 transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="lg:hidden absolute inset-x-0 top-16 z-40 bg-slate-50 dark:bg-slate-950 border-b theme-border shadow-sm">
            <div className="flex flex-col p-4 space-y-4">
              {[
                {
                  title: "Core",
                  items: [
                    { id: "admin-dashboard", label: "Dashboard" },
                    { id: "admin-publishers", label: "Publisher Management" },
                  ],
                },
                {
                  title: "Offer Management",
                  items: [
                    { id: "admin-offers", label: "Offer List" },
                    { id: "admin-applications", label: "Pending Offer Requests" },
                    { id: "admin-offer-create", label: "Create Offer" },
                  ],
                },
                {
                  title: "Affiliates",
                  items: [
                    { id: "admin-affiliates-list", label: "Affiliate List" },
                    { id: "admin-affiliates-pending", label: "Pending Affiliates" },
                    { id: "admin-affiliates-active", label: "Active Affiliates" },
                    { id: "admin-affiliates-disabled", label: "Disabled Affiliates" },
                    { id: "admin-affiliates-create", label: "Create Affiliate" },
                    { id: "admin-affiliates-postbacks", label: "Affiliate Postbacks" },
                    { id: "admin-affiliates-billing", label: "Affiliate Billing" },
                    { id: "admin-postback-test", label: "Postback Test" },
                  ],
                },
                {
                  title: "Affiliate Managers",
                  items: [
                    { id: "admin-managers-list", label: "Manager List" },
                    { id: "admin-managers-create", label: "Create Manager" },
                    { id: "admin-managers-assign", label: "Assign Affiliates" },
                    { id: "admin-managers-performance", label: "Manager Performance" },
                  ],
                },
                {
                  title: "Reports",
                  items: [
                    { id: "admin-reports-overview", label: "Overview Report" },
                    { id: "admin-reports-daily", label: "Daily Report" },
                    { id: "admin-reports-click", label: "Click Report" },
                    { id: "admin-reports-conversion", label: "Conversion Report" },
                  ],
                },
                {
                  title: "Advertisers",
                  items: [
                    { id: "admin-advertisers-list", label: "Advertiser List" },
                    { id: "admin-advertisers-create", label: "Create Advertiser" },
                    { id: "admin-advertisers-billing", label: "Advertiser Billing" },
                    { id: "admin-advertisers-reports", label: "Advertiser Reports" },
                  ],
                },
                {
                  title: "Finance",
                  items: [
                    { id: "admin-finance-revenue", label: "Revenue" },
                    { id: "admin-finance-payouts", label: "Payouts" },
                    { id: "admin-finance-invoices", label: "Invoices" },
                  ],
                },
                {
                  title: "System",
                  items: [
                    { id: "admin-system-settings", label: "Settings" },
                    { id: "admin-network-settings", label: "Network Settings" },
                    { id: "admin-system-roles", label: "Roles & Permissions" },
                    { id: "admin-system-audit", label: "Audit Logs" },
                  ],
                },
              ].map((group) => (
                <div key={group.title} className="space-y-2">
                  <div className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">
                    {group.title}
                  </div>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold ${
                        activeSection === item.id ? "bg-cyan-600 text-white" : "theme-text-main hover:bg-slate-100 dark:hover:bg-slate-900"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
          <div className="max-w-7xl mx-auto pb-24">{children}</div>
        </main>
      </div>
    </div>
  );
}
