import { useState, useEffect } from "react";
import { useBranding } from "./contexts/BrandingContext";
import * as authApi from "./services/auth";
import { PublisherAuth } from "./components/PublisherAuth";
import { AdvertiserSignupView } from "./components/AdvertiserSignupView";
import { PublisherSidebar } from "./components/PublisherSidebar";
import { PublisherDashboardView } from "./components/PublisherDashboardView";
import { OfferMarketplaceView } from "./components/OfferMarketplaceView";
import { MyOffersView } from "./components/MyOffersView";
import { TrackingLinkView } from "./components/TrackingLinkView";
import { PostbackSetupView } from "./components/PostbackSetupView";
import { ApiAccessView } from "./components/ApiAccessView";
import { ReportsView } from "./components/ReportsView";
import { WalletView } from "./components/WalletView";
import { InvoicesView } from "./components/InvoicesView";
import { ProfileSettingsView } from "./components/ProfileSettingsView";
import { NotificationsView } from "./components/NotificationsView";
import { NotificationBell } from "./components/NotificationBell";
import {
  AdminLayout,
  AdminDashboardView as AdminDashboardUI,
  AdminOfferManagementView,
  AdminApplicationReviewView,
  AffiliateListView,
  AffiliateProfileView,
  AffiliateCreateView,
  AffiliatePostbacksView,
  PostbackTestView,
  ManagerListView,
  ManagerCreateView,
  ManagerAssignView,
  AdvertiserListView,
  AdvertiserCreateView,
  ReportsDailyView,
  ReportsClickView,
  ReportsConversionView,
  FinanceRevenueView,
  FinancePayoutsView,
  FinanceInvoicesView,
  FinanceTransactionsView,
  ConversionReviewView,
  OfferPostbacksView,
  AdvertiserPostbackLogsView,
  AffiliatePostbackLogsView,
  AdvertiserPostbackGeneratorView,
  AdminAnnouncementsView,
  OfferCategoriesView,
  SignupQuestionsView,
  SmtpSettingsView,
  EmailTemplatesView,
  BulkMailerView,
  EmailLogsView,
  EmailVerificationSettingsView,
  OfferCreateView,
  AdminNetworkSettingsView,
} from "./components/admin";
import { VerifyEmailScreen } from "./components/VerifyEmailScreen";
import { ResetPasswordScreen } from "./components/ResetPasswordScreen";
import {
  ManagerLayout,
  ManagerDashboardView,
  ManagerPublisherReviewView,
  ManagerOfferApprovalView,
  ManagerCommunicationView,
  ManagerNotesView,
} from "./components/manager";
import {
  AdvertiserLayout,
  AdvertiserDashboardView,
  AdvertiserCampaignManagementView,
  AdvertiserConversionTrackingView,
  AdvertiserBillingWalletView,
  AdvertiserReportsView as AdvertiserPortalReportsView,
} from "./components/advertiser";

import { 
  HelpCircle, 
  Menu, 
  X, 
  Key, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  ArrowRight,
  Globe,
  Wallet,
  Sun,
  Moon
} from "lucide-react";

export default function App() {
  const branding = useBranding();

  // Detect email verification token in URL (e.g., ?token=xxx)
  const [verifyToken] = useState(() => new URLSearchParams(window.location.search).get("token"));
  // Detect password reset token in URL (e.g., ?reset_token=xxx)
  const [resetToken] = useState(() => new URLSearchParams(window.location.search).get("reset_token"));

  // Authentication & session simulation states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string>("");
  const [authScreen, setAuthScreen] = useState<"login" | "register" | "forgot" | "advertiser-signup">("login");

  // Navigation tabs of the authorized publisher portal
  // Maps to: dashboard, marketplace, my-offers, link-generator, postbacks, api-access, reports, wallet, invoices, profile, notifications, announcements
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [userId, setUserId] = useState<string>("");
  const [isDark, setIsDark] = useState(false);
  
  // Custom deep campaign states
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [selectedAffiliate, setSelectedAffiliate] = useState<any | null>(null);
  const [publisherName, setPublisherName] = useState("");
useEffect(() => {
  const loadUser = async () => {
    const token = localStorage.getItem("token");
    const adminToken = localStorage.getItem("admin_token");

    if (!token && !adminToken) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const user = await authApi.getCurrentUser();

      setPublisherName(user.fullName || user.companyName || "Publisher");
      setUserRole(user.role);
      setIsLoggedIn(true);
      if (user.role === "admin" && user.adminRole === "AFFILIATE_MANAGER") {
        setUserId(user.id ?? "");
        setActiveScreen("manager-dashboard");
      } else if (user.role === "admin") {
        setActiveScreen("admin-dashboard");
      }
    } catch (error) {
      console.error(error);
      setIsLoggedIn(false);
    }
  };

  loadUser();
}, []);
  // Statefully manage offers to allow interactive publisher approval workflow
  const [offers, setOffers] = useState<any[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);

  useEffect(() => {
    const loadOffers = async () => {
      setOffersLoading(true);
      setOffersError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setOffers([]);
        setOffersLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/offers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to load offers (${response.status})`);
        }

        const data = await response.json();
        const normalizedOffers = Array.isArray(data.offers)
          ? data.offers.map((offer: any) => ({
              ...offer,
              id: offer.id?.toString?.() ?? "",
              payoutType: offer.payout_type ?? offer.payoutType ?? "CPA",
              payoutValue: Number(offer.payout_amount ?? offer.payoutValue ?? 0),
              geos: Array.isArray(offer.target_geos)
                ? offer.target_geos
                : Array.isArray(offer.geos)
                ? offer.geos
                : [],
              devices: Array.isArray(offer.target_devices)
                ? offer.target_devices.join(", ")
                : offer.target_devices ?? offer.devices ?? "",
              rawUrl: offer.landing_page_url ?? offer.rawUrl ?? "",
              caps: offer.caps ?? "Live offer details available on request",
              description: offer.description ?? "",
              previewUrl: offer.preview_url ?? offer.previewUrl ?? "",
              landers: offer.landers ?? [],
              creatives: offer.creatives ?? [],
              status:
                offer.status === "ACTIVE" && !offer.requires_publisher_approval
                  ? "open_access"
                  : offer.status === "ACTIVE" && offer.requires_publisher_approval
                  ? "requires_approval"
                  : offer.status?.toString?.().toLowerCase?.() ?? "unknown",
            }))
          : [];

        setOffers(normalizedOffers);
      } catch (error: any) {
        console.error(error);
        setOffersError(error.message || "Unable to load offers.");
      } finally {
        setOffersLoading(false);
      }
    };

    loadOffers();
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin_token");
    setIsLoggedIn(false);
    setAuthScreen("login");
  };

  // Mobile menu visibility
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Map activeScreen keyword triggers into visual rendering subviews
  const renderActiveViewport = () => {
    switch (activeScreen) {
      case "dashboard":
        return (
          <PublisherDashboardView 
            onNavigate={(screen) => {
              setActiveScreen(screen);
              setSelectedOfferId(null);
            }} 
          />
        );
      case "marketplace":
        return (
          <OfferMarketplaceView
            onNavigate={(view) => {
              setActiveScreen(view);
            }}
            selectedOfferId={selectedOfferId}
            setSelectedOfferId={setSelectedOfferId}
            offers={offers}
            setOffers={setOffers}
          />
        );
      case "my-offers":
        return (
          <MyOffersView
            setSelectedOfferId={(id) => {
              setSelectedOfferId(id);
              setActiveScreen("marketplace");
            }}
          />
        );
      case "notifications":
        return <NotificationsView />;
      case "link-generator":
        return <TrackingLinkView offers={offers} />;
      case "postbacks":
        return <PostbackSetupView offers={offers} />;
      case "api-access":
        return <ApiAccessView />;
      case "reports":
        return <ReportsView />;
      case "wallet":
        return <WalletView />;
      case "invoices":
        return <InvoicesView />;
      case "profile":
        return <ProfileSettingsView />;
      case "advertiser-dashboard":
      case "advertiser-campaigns":
      case "advertiser-tracking":
      case "advertiser-billing":
      case "advertiser-reports":
        return (
          <AdvertiserLayout
            activeSection={activeScreen}
            setActiveSection={setActiveScreen}
            advertiserName={publisherName || "Advertiser"}
            onLogout={handleLogout}
            onReturnToPublisher={() => setActiveScreen("dashboard")}
          >
            {activeScreen === "advertiser-dashboard" && <AdvertiserDashboardView />}
            {activeScreen === "advertiser-campaigns" && <AdvertiserCampaignManagementView />}
            {activeScreen === "advertiser-tracking" && <AdvertiserConversionTrackingView />}
            {activeScreen === "advertiser-billing" && <AdvertiserBillingWalletView />}
            {activeScreen === "advertiser-reports" && <AdvertiserPortalReportsView />}
          </AdvertiserLayout>
        );
      case "manager-dashboard":
      case "manager-publishers":
      case "manager-offers-approval":
      case "manager-communication":
      case "manager-notes":
        return (
          <ManagerLayout
            activeSection={activeScreen}
            setActiveSection={setActiveScreen}
            managerName={publisherName || "Manager"}
            onLogout={handleLogout}
            onReturnToPublisher={() => setActiveScreen("dashboard")}
          >
            {activeScreen === "manager-dashboard" && <ManagerDashboardView managerId={userId} />}
            {activeScreen === "manager-publishers" && <ManagerPublisherReviewView managerId={userId} />}
            {activeScreen === "manager-offers-approval" && <ManagerOfferApprovalView managerId={userId} />}
            {activeScreen === "manager-communication" && <ManagerCommunicationView managerId={userId} />}
            {activeScreen === "manager-notes" && <ManagerNotesView managerId={userId} />}
          </ManagerLayout>
        );
      default:
        return (
          <PublisherDashboardView 
            onNavigate={(screen) => {
              setActiveScreen(screen);
              setSelectedOfferId(null);
            }} 
          />
        );
    }
  };

  // Standalone password reset screen: intercept before any auth/portal rendering
  if (resetToken) {
    return (
      <div className={`min-h-screen ${isDark ? "dark" : ""} theme-bg-page theme-text-main font-sans`}>
        <ResetPasswordScreen
          token={resetToken}
          onGoToLogin={() => {
            window.history.pushState({}, "", "/");
            window.location.reload();
          }}
        />
      </div>
    );
  }

  // Standalone email verification screen: intercept before any auth/portal rendering
  if (verifyToken) {
    return (
      <div className={`min-h-screen ${isDark ? "dark" : ""} theme-bg-page theme-text-main font-sans`}>
        <VerifyEmailScreen
          token={verifyToken}
          onGoToLogin={() => {
            window.history.pushState({}, "", "/");
            window.location.reload();
          }}
        />
      </div>
    );
  }

  // When a full admin/advertiser/manager panel is active, render it as a separate full-screen layout
  // and avoid mounting the Publisher sidebar or publisher shell.
  if (isLoggedIn && activeScreen.startsWith("admin-")) {
    return (
      <div className={`min-h-screen ${isDark ? "dark" : ""} theme-bg-page theme-text-main flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden relative`}>
        <AdminLayout
          activeSection={activeScreen}
          setActiveSection={setActiveScreen}
          adminName={publisherName}
          onLogout={handleLogout}
          onCreateOffer={() => setActiveScreen("admin-offer-create")}
        >
          {activeScreen === "admin-dashboard" && <AdminDashboardUI />}
          {activeScreen === "admin-offers" && <AdminOfferManagementView />}
          {activeScreen === "admin-offer-create" && <OfferCreateView />}
          {activeScreen === "admin-applications" && <AdminApplicationReviewView />}
          {activeScreen === "admin-affiliates-list" && <AffiliateListView onViewProfile={(affiliate) => { setSelectedAffiliate(affiliate); setActiveScreen("admin-affiliate-profile"); }} onCreateAffiliate={() => { console.log("NAVIGATE_TO_ADMIN_AFFILIATES_CREATE"); setActiveScreen("admin-affiliates-create"); }} />}
          {activeScreen === "admin-affiliate-profile" && selectedAffiliate && <AffiliateProfileView affiliate={selectedAffiliate} onBack={() => { setActiveScreen("admin-affiliates-list"); setSelectedAffiliate(null); }} />}
          {activeScreen === "admin-affiliates-pending" && <AffiliateListView title="Pending Affiliates" subtitle="Affiliates awaiting approval or compliance review." initialStatusFilter="Pending" onViewProfile={(affiliate) => { setSelectedAffiliate(affiliate); setActiveScreen("admin-affiliate-profile"); }} onCreateAffiliate={() => setActiveScreen("admin-affiliates-create")} />}
          {activeScreen === "admin-affiliates-active" && <AffiliateListView title="Active Affiliates" subtitle="Affiliates currently approved and generating traffic." initialStatusFilter="Active" onViewProfile={(affiliate) => { setSelectedAffiliate(affiliate); setActiveScreen("admin-affiliate-profile"); }} onCreateAffiliate={() => setActiveScreen("admin-affiliates-create")} />}
          {activeScreen === "admin-affiliates-disabled" && <AffiliateListView title="Disabled Affiliates" subtitle="Affiliates that are currently suspended or restricted." initialStatusFilter="Disabled" onViewProfile={(affiliate) => { setSelectedAffiliate(affiliate); setActiveScreen("admin-affiliate-profile"); }} onCreateAffiliate={() => setActiveScreen("admin-affiliates-create")} />}
          {activeScreen === "admin-affiliates-create" && <AffiliateCreateView onSuccess={() => setActiveScreen("admin-affiliates-list")} />}
          {activeScreen === "admin-affiliates-postbacks" && <AffiliatePostbacksView />}
          {activeScreen === "admin-postback-test" && <PostbackTestView />}
          {activeScreen === "admin-managers-list" && <ManagerListView />}
          {activeScreen === "admin-managers-create" && <ManagerCreateView />}
          {activeScreen === "admin-managers-assign" && <ManagerAssignView />}
          {activeScreen === "admin-reports-daily" && <ReportsDailyView />}
          {activeScreen === "admin-reports-click" && <ReportsClickView />}
          {activeScreen === "admin-reports-conversion" && <ReportsConversionView />}
          {activeScreen === "admin-advertisers-list" && <AdvertiserListView onCreateNew={() => setActiveScreen("admin-advertisers-create")} />}
          {activeScreen === "admin-advertisers-create" && <AdvertiserCreateView onSuccess={() => setActiveScreen("admin-advertisers-list")} onCancel={() => setActiveScreen("admin-advertisers-list")} />}
          {activeScreen === "admin-finance-revenue" && <FinanceRevenueView />}
          {activeScreen === "admin-finance-payouts" && <FinancePayoutsView />}
          {activeScreen === "admin-finance-invoices" && <FinanceInvoicesView />}
          {activeScreen === "admin-finance-transactions" && <FinanceTransactionsView />}
          {activeScreen === "admin-network-settings" && <AdminNetworkSettingsView />}
          {activeScreen === "admin-announcements" && <AdminAnnouncementsView />}
          {activeScreen === "admin-signup-questions" && <SignupQuestionsView />}
          {activeScreen === "admin-smtp-settings"       && <SmtpSettingsView />}
          {activeScreen === "admin-email-templates"   && <EmailTemplatesView />}
          {activeScreen === "admin-bulk-mailer"       && <BulkMailerView />}
          {activeScreen === "admin-email-logs"        && <EmailLogsView />}
          {activeScreen === "admin-email-verification" && <EmailVerificationSettingsView />}
          {activeScreen === "admin-conversion-review" && <ConversionReviewView />}
          {activeScreen === "admin-offer-postbacks" && <OfferPostbacksView />}
          {activeScreen === "admin-advertiser-postback-generator" && <AdvertiserPostbackGeneratorView />}
          {activeScreen === "admin-advertiser-postback-logs" && <AdvertiserPostbackLogsView />}
          {activeScreen === "admin-affiliate-postback-logs" && <AffiliatePostbackLogsView />}
          {activeScreen === "admin-offer-categories" && <OfferCategoriesView />}
        </AdminLayout>
      </div>
    );
  }

  if (isLoggedIn && activeScreen.startsWith("advertiser-")) {
    return (
      <div className={`min-h-screen ${isDark ? "dark" : ""} theme-bg-page theme-text-main flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden relative`}>
        <AdvertiserLayout
          activeSection={activeScreen}
          setActiveSection={setActiveScreen}
          advertiserName={publisherName || "Advertiser"}
          onLogout={handleLogout}
        >
          {activeScreen === "advertiser-dashboard" && <AdvertiserDashboardView />}
          {activeScreen === "advertiser-campaigns" && <AdvertiserCampaignManagementView />}
          {activeScreen === "advertiser-tracking" && <AdvertiserConversionTrackingView />}
          {activeScreen === "advertiser-billing" && <AdvertiserBillingWalletView />}
          {activeScreen === "advertiser-reports" && <AdvertiserPortalReportsView />}
        </AdvertiserLayout>
      </div>
    );
  }

  if (isLoggedIn && activeScreen.startsWith("manager-")) {
    return (
      <div className={`min-h-screen ${isDark ? "dark" : ""} theme-bg-page theme-text-main flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden relative`}>
        <ManagerLayout
          activeSection={activeScreen}
          setActiveSection={setActiveScreen}
          managerName={publisherName || "Manager"}
          onLogout={handleLogout}
        >
          {activeScreen === "manager-dashboard" && <ManagerDashboardView managerId={userId} />}
          {activeScreen === "manager-publishers" && <ManagerPublisherReviewView managerId={userId} />}
          {activeScreen === "manager-offers-approval" && <ManagerOfferApprovalView managerId={userId} />}
          {activeScreen === "manager-communication" && <ManagerCommunicationView managerId={userId} />}
          {activeScreen === "manager-notes" && <ManagerNotesView managerId={userId} />}
        </ManagerLayout>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "dark" : ""} theme-bg-page theme-text-main flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden relative`}>
      
      {/* -------------------------------------------------------------
          PORTAL SYSTEM DECORATED SHELL (WHEN AUTHENTICATED)
          ------------------------------------------------------------- */}
      {isLoggedIn ? (
        <div className="flex flex-row h-screen w-screen overflow-hidden">
          
          {/* Main Desktop Left Navigation Sidebar */}
          <div className="hidden lg:block shrink-0">
            <PublisherSidebar
              activeScreen={activeScreen}
              setActiveScreen={(screen) => {
                setActiveScreen(screen);
                 // Always clear detail view states when navigating via sidebar
                 setSelectedOfferId(null);
              }}
              publisherName={publisherName}
              onLogout={handleLogout}
            />
          </div>

          {/* Right Shell Area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden theme-bg-page">
            
            {/* Header top taskbar elements */}
            <header className="theme-bg-card border-b theme-border shrink-0 h-16 flex items-center justify-between px-6 z-30 shadow-xs">
              
              <div className="flex items-center gap-3">
                {/* Mobile Menu Action Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden theme-text-muted hover:theme-text-main hover:theme-bg-well p-1.5 rounded-lg transition"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                <div className="flex items-center gap-2 font-mono">
                  <span className="text-xs uppercase tracking-widest text-cyan-600 dark:text-cyan-400 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-500 dark:text-cyan-400" />
                    {branding.networkName.toUpperCase()} PARTNER NETWORK
                  </span>
                  <span className="hidden md:inline-block theme-bg-well text-[9px] text-emerald-600 dark:text-emerald-400 border theme-border px-2 py-0.5 rounded font-bold">
                    Ledger Secure Engine v4.1
                  </span>
                </div>
              </div>

              {/* Account Quick Status Widget */}
              <div className="flex items-center gap-3 select-none">
                
                {/* Light/Dark Toggle Switch */}
                <button
                  onClick={() => setIsDark(!isDark)}
                  className="p-2 rounded-xl theme-bg-well border theme-border theme-text-muted hover:theme-text-main transition shadow-xs cursor-pointer mr-1 flex items-center justify-center h-9 w-9"
                  title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
                </button>

                <NotificationBell onViewAll={() => setActiveScreen("notifications")} />

                <div className="hidden md:flex flex-col text-right leading-tight max-w-[150px]">
                  <span className="text-xs font-bold theme-text-main truncate">{publisherName}</span>
                  <span className="text-[9px] font-mono theme-text-muted">Publisher Account</span>
                </div>

                <div className="w-8.5 h-8.5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 border border-cyan-200 dark:border-cyan-800/60 text-xs font-bold text-cyan-600 dark:text-cyan-300 flex items-center justify-center select-none uppercase shrink-0">
                  {publisherName.charAt(0) || "P"}
                </div>

                <button
                  onClick={handleLogout}
                  className="hidden md:inline-flex theme-bg-well border theme-border hover:bg-rose-50 dark:hover:bg-rose-950/20 theme-text-secondary hover:text-rose-600 dark:hover:text-rose-455 px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-wider transition font-medium select-none cursor-pointer duration-100"
                >
                  Logout
                </button>

              </div>

            </header>

            {/* Mobile Header navigation layout overlay */}
            {mobileMenuOpen && (
              <div className="absolute inset-0 bg-slate-50/95 backdrop-blur-md z-40 lg:hidden flex flex-col p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-cyan-500 text-slate-950 p-2 rounded-lg font-black shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-black text-slate-950 font-mono uppercase">
                      {branding.networkName}
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-slate-600 hover:text-rose-600 p-1 bg-slate-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col space-y-2 overflow-y-auto pr-1">
                  {[
                    { id: "dashboard", label: "Dashboard" },
                    { id: "marketplace", label: "All Offers" },
                    { id: "my-offers", label: "My Offers" },
                    { id: "reports", label: "Reports Ledger" },
                    { id: "link-generator", label: "Tracking Links" },
                    { id: "postbacks", label: "Postback Setup" },
                    { id: "api-access", label: "API Access Tokens" },
                    { id: "wallet", label: "My Wallet Balance" },
                    { id: "invoices", label: "Invoices & Billing" },
                    { id: "profile", label: "Profile Settings" }
                  ].map((it) => (
                    <button
                      key={it.id}
                      onClick={() => {
                        setActiveScreen(it.id);
                          // Always clear detail view states when navigating via mobile menu
                          setSelectedOfferId(null);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold ${
                        activeScreen === it.id ? "bg-cyan-600 border border-cyan-600 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">Publisher Portal</span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-rose-400 font-bold"
                  >
                    Logout Securely
                  </button>
                </div>
              </div>
            )}

            {/* Main scrollable viewport frame */}
            <main className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
              <div className="max-w-6xl mx-auto pb-24">
                {renderActiveViewport()}
              </div>
            </main>

          </div>

        </div>
      ) : (
        /* -------------------------------------------------------------
            AUTHENTICATION SHELL VIEWS (Registration, Login, Recovery)
            ------------------------------------------------------------- */
        authScreen === "advertiser-signup" ? (
          <AdvertiserSignupView onBackToLogin={() => setAuthScreen("login")} />
        ) : (
          <>
              <PublisherAuth
                currentView={authScreen}
                onAdvertiserSignup={() => setAuthScreen("advertiser-signup")}
                setView={(view) => {
                  if (view === "app") {
                    (async () => {
                      try {
                        const user = await authApi.getCurrentUser();
                        setUserRole(user.role);
                        setIsLoggedIn(true);
                        if (user.role === "admin" && user.adminRole === "AFFILIATE_MANAGER") {
                          setUserId(user.id ?? "");
                          setActiveScreen("manager-dashboard");
                        } else if (user.role === "admin") {
                          setActiveScreen("admin-dashboard");
                        } else {
                          setActiveScreen("dashboard");
                        }
                      } catch {
                        const role = localStorage.getItem("admin_token") ? "admin" : "publisher";
                        setUserRole(role);
                        setIsLoggedIn(true);
                        setActiveScreen(role === "admin" ? "admin-dashboard" : "dashboard");
                      }
                    })();
                  } else {
                    setAuthScreen(view);
                  }
                }}
                onLoginSuccess={async (name) => {
                  if (name) setPublisherName(name);
                  try {
                    const user = await authApi.getCurrentUser();
                    setUserRole(user.role);
                    setIsLoggedIn(true);
                    if (user.role === "admin" && user.adminRole === "AFFILIATE_MANAGER") {
                      setUserId(user.id ?? "");
                      setActiveScreen("manager-dashboard");
                    } else if (user.role === "admin") {
                      setActiveScreen("admin-dashboard");
                    } else {
                      setActiveScreen("dashboard");
                    }
                  } catch {
                    const role = localStorage.getItem("admin_token") ? "admin" : "publisher";
                    setUserRole(role);
                    setIsLoggedIn(true);
                    setActiveScreen(role === "admin" ? "admin-dashboard" : "dashboard");
                  }
                }}
              />
          </>
        )
      )}

      {/* -------------------------------------------------------------
          OVERLAY MODAL DETAIL SHEET: INDIVIDUAL DIGITAL INVOICE
          ------------------------------------------------------------- */}

    </div>
  );
}
