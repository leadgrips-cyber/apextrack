import { useState, useEffect } from "react";
import * as authApi from "./services/auth";
import { PublisherAuth } from "./components/PublisherAuth";
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
import { InvoiceDetailModal } from "./components/InvoiceDetailModal";
import { ProfileSettingsView } from "./components/ProfileSettingsView";
import { NotificationsView, PublisherNotification } from "./components/NotificationsView";
import { AnnouncementsView, NetworkAnnouncement } from "./components/AnnouncementsView";
import {
  AdminLayout,
  AdminDashboardView as AdminDashboardUI,
  AdminPublisherManagementView,
  AdminOfferManagementView,
  AdminApplicationReviewView,
  AffiliateListView,
  AffiliateProfileView,
  AffiliateCreateView,
  AffiliatePostbacksView,
  AffiliateBillingView,
  PostbackTestView,
  ManagerListView,
  ManagerCreateView,
  ManagerAssignView,
  ManagerPerformanceView as AdminManagerPerformanceView,
  AdvertiserListView,
  AdvertiserCreateView,
  AdvertiserBillingView,
  AdvertiserReportsView,
  ReportsDailyView,
  ReportsClickView,
  ReportsConversionView,
  FinanceRevenueView,
  FinancePayoutsView,
  FinanceInvoicesView,
  SystemSettingsView,
} from "./components/admin";
import {
  ManagerLayout,
  ManagerDashboardView,
  ManagerPublisherReviewView,
  ManagerOfferApprovalView,
  ManagerCommunicationView,
  ManagerPerformanceView,
} from "./components/manager";
import {
  AdvertiserLayout,
  AdvertiserDashboardView,
  AdvertiserCampaignManagementView,
  AdvertiserConversionTrackingView,
  AdvertiserBillingWalletView,
  AdvertiserReportsView as AdvertiserPortalReportsView,
} from "./components/advertiser";

import { DEMO_INVOICES, DemoInvoice } from "./data/publisherDemo";
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
  // Authentication & session simulation states
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [authScreen, setAuthScreen] = useState<"login" | "register" | "forgot" | "verify">("login");
  
  // Navigation tabs of the authorized publisher portal
  // Maps to: dashboard, marketplace, my-offers, link-generator, postbacks, api-access, reports, wallet, invoices, profile, notifications, announcements
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [isDark, setIsDark] = useState(false);
  
  // Custom deep campaign states
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<DemoInvoice | null>(null);
  const [selectedAffiliate, setSelectedAffiliate] = useState<any | null>(null);
  const [publisherName, setPublisherName] = useState("John Doe Media INC");
useEffect(() => {
  const loadUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const user = await authApi.getCurrentUser();

      setPublisherName(user.fullName || user.companyName || "Publisher");
      setIsLoggedIn(true);
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
        const normalizedOffers = Array.isArray(data)
          ? data.map((offer: any) => ({
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
                offer.status === "ACTIVE"
                  ? "open_access"
                  : offer.status === "PAUSED" || offer.status === "DRAFT"
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
  }, []);

  // Statefully manage publisher notifications
  const [notifications, setNotifications] = useState<PublisherNotification[]>(() => {
    return [
      {
        id: "nt-1",
        type: "approved",
        title: "Offer Approved",
        message: "Your application for campaign #1094 Apex Trading App was successfully approved by AM Sophia.",
        timestamp: "2026-06-06 10:30",
        isRead: false,
        offerId: "1094"
      },
      {
        id: "nt-2",
        type: "rejected",
        title: "Offer Rejected",
        message: "Campaign #1097 SaaS Enterprise CRM access request was unfortunately rejected by management.",
        timestamp: "2026-06-05 14:15",
        isRead: false,
        offerId: "1097",
        rejectionReason: "Primary geographic traffic stream volume is originating from untested regional proxy node routes."
      },
      {
        id: "nt-3",
        type: "payout",
        title: "Payout Released",
        message: "A monthly wire disbursement of $2,850.00 USD was successfully executed to Citibank Account ending in *9981.",
        timestamp: "2026-06-01 02:00",
        isRead: true
      },
      {
        id: "nt-4",
        type: "paused",
        title: "Offer Paused",
        message: "Luxury Essentials campaign #1098 has been paused temporarily by the advertiser.",
        timestamp: "2026-05-28 09:12",
        isRead: true,
        offerId: "1097"
      },
      {
        id: "nt-5",
        type: "activated",
        title: "Offer Activated",
        message: "KetoDiet Shred - CPS Health Offer #1096 has been activated for your tracking roster.",
        timestamp: "2026-05-20 09:30",
        isRead: true,
        offerId: "1096"
      },
      {
        id: "nt-6",
        type: "announcement",
        title: "System Announcements",
        message: "Scheduled platform-wide indexing upgrades on the server core database have been planned.",
        timestamp: "2026-05-15 13:00",
        isRead: true
      }
    ];
  });

  // Statefully manage network announcements
  const [announcements, setAnnouncements] = useState<NetworkAnnouncement[]>(() => {
    return [
      {
        id: "an-1",
        category: "Network News",
        title: "ApexTrack Launches Click Attribution Engine v4.1",
        content: "We have fully upgraded our redirection proxy engine, achieving record conversion postback routing response times under 12 milliseconds across EU and US nodes. This prevents click loss during scaling windows.",
        author: "Sophia Kovalski (AM Representative)",
        timestamp: "2026-06-06 11:22",
        isImportant: true
      },
      {
        id: "an-2",
        category: "New Offers",
        title: "KetoDiet Shred Released with Exclusive 65% CPS Commission",
        content: "A brand new global Nutra vertical KetoDiet Shred is now open for traffic mapping. High conversion rates observed in preliminary trial groups in US, CA, and EU.",
        author: "AM Sophia",
        timestamp: "2026-06-05 09:40",
        isImportant: false
      },
      {
        id: "an-3",
        category: "Payout Updates",
        title: "Invoicing Ledgers Successfully Reconciled for Net-15",
        content: "Payout statements covering May affiliate earnings have been verified. Invoices are transit-locked and being scheduled for PayPal / Wire disbursement sweeps.",
        author: "Billing Support",
        timestamp: "2026-06-01 10:00",
        isImportant: false
      },
      {
        id: "an-4",
        category: "Maintenance Notices",
        title: "Scheduled Server Database Infrastructure Maintenance",
        content: "Please note that server API networks will undergo indexing routine optimization on Sunday, June 7 from 03:00 to 05:00 UTC. Clicks will continue registering, but live visual dashboard syncs may experience temporary delays.",
        author: "Sysadmin Team",
        timestamp: "2026-05-29 18:00",
        isImportant: false
      },
      {
        id: "an-5",
        category: "Compliance Alerts",
        title: "Immediate Warning: Incentive Traffic Rules Violations",
        content: "Affiliates are strictly warned against running incentivized virtual currencies, browser lockups, or duplicate IP email lists on standard financial Lead campaigns. Violating publishers will have their payout cleared revenue balance frozen.",
        author: "Compliance Dept",
        timestamp: "2026-05-20 14:10",
        isImportant: true
      }
    ];
  });

  // Notifications operational triggers
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  // Publisher submits announcement triggers
  const handlePublishAnnouncement = (newAnn: Omit<NetworkAnnouncement, "id" | "timestamp">) => {
    const formattedDate = new Date().toISOString().replace("T", " ").substring(0, 16);
    const fresh: NetworkAnnouncement = {
      ...newAnn,
      id: "an-" + Date.now(),
      timestamp: formattedDate
    };
    setAnnouncements(prev => [fresh, ...prev]);

    // Add alert trigger companion notification as requested
    const alertNotif: PublisherNotification = {
      id: "nt-" + Date.now(),
      type: "announcement",
      title: `System Announcement: ${newAnn.title}`,
      message: `${newAnn.content.substring(0, 120)}... published on affiliate dashboard.`,
      timestamp: formattedDate,
      isRead: false
    };
    setNotifications(prev => [alertNotif, ...prev]);
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
            onAddNotification={(type, title, message, offerId, rejectionReason) => {
              const formattedDate = new Date().toISOString().replace("T", " ").substring(0, 16);
              setNotifications(prev => [
                {
                  id: "nt-" + Date.now(),
                  type,
                  title,
                  message,
                  timestamp: formattedDate,
                  isRead: false,
                  offerId,
                  rejectionReason
                },
                ...prev
              ]);
            }}
          />
        );
      case "my-offers":
        return (
          <MyOffersView
            setSelectedOfferId={(id) => {
              setSelectedOfferId(id);
              setActiveScreen("marketplace");
            }}
            offers={offers}
          />
        );
      case "notifications":
        return (
          <NotificationsView
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDeleteNotification={handleDeleteNotification}
            onClearAll={handleClearAllNotifications}
          />
        );
      case "announcements":
        return (
          <AnnouncementsView
            announcements={announcements}
            onPublishAnnouncement={handlePublishAnnouncement}
          />
        );
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
            advertiserName="ApexTrack Advertiser"
            onLogout={() => {
              setIsLoggedIn(false);
              setAuthScreen("login");
            }}
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
      case "manager-performance":
        return (
          <ManagerLayout
            activeSection={activeScreen}
            setActiveSection={setActiveScreen}
            managerName="Affiliate Manager"
            onLogout={() => {
              setIsLoggedIn(false);
              setAuthScreen("login");
            }}
            onReturnToPublisher={() => setActiveScreen("dashboard")}
          >
            {activeScreen === "manager-dashboard" && <ManagerDashboardView />}
            {activeScreen === "manager-publishers" && <ManagerPublisherReviewView />}
            {activeScreen === "manager-offers-approval" && <ManagerOfferApprovalView />}
            {activeScreen === "manager-communication" && <ManagerCommunicationView />}
            {activeScreen === "manager-performance" && <ManagerPerformanceView />}
          </ManagerLayout>
        );
      case "admin-dashboard":
      case "admin-publishers":
      case "admin-offers":
      case "admin-applications":
      case "admin-affiliates-list":
      case "admin-affiliates-profile":
      case "admin-affiliates-pending":
      case "admin-affiliates-active":
      case "admin-affiliates-disabled":
      case "admin-affiliates-create":
      case "admin-affiliates-postbacks":
      case "admin-affiliates-billing":
      case "admin-postback-test":
      case "admin-managers-list":
      case "admin-managers-create":
      case "admin-managers-assign":
      case "admin-managers-performance":
      case "admin-reports-overview":
      case "admin-reports-daily":
      case "admin-reports-click":
      case "admin-reports-conversion":
      case "admin-advertisers-list":
      case "admin-advertisers-create":
      case "admin-advertisers-billing":
      case "admin-advertisers-reports":
      case "admin-finance-revenue":
      case "admin-finance-payouts":
      case "admin-finance-invoices":
      case "admin-system-settings":
      case "admin-system-roles":
      case "admin-system-audit":
        return (
          <AdminLayout
            activeSection={activeScreen}
            setActiveSection={setActiveScreen}
            adminName="ApexTrack Admin"
            onLogout={() => {
              setIsLoggedIn(false);
              setAuthScreen("login");
            }}
            onReturnToPublisher={() => setActiveScreen("dashboard")}
          >
            {activeScreen === "admin-dashboard" && <AdminDashboardUI />}
            {activeScreen === "admin-publishers" && <AdminPublisherManagementView />}
            {activeScreen === "admin-offers" && <AdminOfferManagementView />}
            {activeScreen === "admin-applications" && <AdminApplicationReviewView />}
            {activeScreen === "admin-affiliates-list" && <AffiliateListView onViewProfile={(affiliate) => { setSelectedAffiliate(affiliate); setActiveScreen("admin-affiliates-profile"); }} />}
            {activeScreen === "admin-affiliates-profile" && selectedAffiliate && <AffiliateProfileView affiliate={selectedAffiliate} onBack={() => { setActiveScreen("admin-affiliates-list"); setSelectedAffiliate(null); }} />}
            {activeScreen === "admin-affiliates-pending" && <AffiliateListView title="Pending Affiliates" subtitle="Affiliates awaiting approval or compliance review." onViewProfile={(affiliate) => { setSelectedAffiliate(affiliate); setActiveScreen("admin-affiliates-profile"); }} />}
            {activeScreen === "admin-affiliates-active" && <AffiliateListView title="Active Affiliates" subtitle="Affiliates currently approved and generating traffic." onViewProfile={(affiliate) => { setSelectedAffiliate(affiliate); setActiveScreen("admin-affiliates-profile"); }} />}
            {activeScreen === "admin-affiliates-disabled" && <AffiliateListView title="Disabled Affiliates" subtitle="Affiliates that are currently suspended or restricted." onViewProfile={(affiliate) => { setSelectedAffiliate(affiliate); setActiveScreen("admin-affiliates-profile"); }} />}
            {activeScreen === "admin-affiliates-create" && <AffiliateCreateView />}
            {activeScreen === "admin-affiliates-postbacks" && <AffiliatePostbacksView />}
            {activeScreen === "admin-affiliates-billing" && <AffiliateBillingView />}
            {activeScreen === "admin-postback-test" && <PostbackTestView />}
            {activeScreen === "admin-managers-list" && <ManagerListView />}
            {activeScreen === "admin-managers-create" && <ManagerCreateView />}
            {activeScreen === "admin-managers-assign" && <ManagerAssignView />}
            {activeScreen === "admin-managers-performance" && <AdminManagerPerformanceView />}
            {activeScreen === "admin-reports-overview" && <AdminDashboardUI />}
            {activeScreen === "admin-reports-daily" && <ReportsDailyView />}
            {activeScreen === "admin-reports-click" && <ReportsClickView />}
            {activeScreen === "admin-reports-conversion" && <ReportsConversionView />}
            {activeScreen === "admin-advertisers-list" && <AdvertiserListView />}
            {activeScreen === "admin-advertisers-create" && <AdvertiserCreateView />}
            {activeScreen === "admin-advertisers-billing" && <AdvertiserBillingView />}
            {activeScreen === "admin-advertisers-reports" && <AdvertiserReportsView />}
            {activeScreen === "admin-finance-revenue" && <FinanceRevenueView />}
            {activeScreen === "admin-finance-payouts" && <FinancePayoutsView />}
            {activeScreen === "admin-finance-invoices" && <FinanceInvoicesView />}
            {activeScreen === "admin-system-settings" && <SystemSettingsView />}
            {activeScreen === "admin-system-roles" && <SystemSettingsView title="Roles & Permissions" description="Placeholder for roles, permissions and access control workflows." />}
            {activeScreen === "admin-system-audit" && <SystemSettingsView title="Audit Logs" description="Placeholder for audit trail and administrative event logs." />}
          </AdminLayout>
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

  // When a full admin/advertiser/manager panel is active, render it as a separate full-screen layout
  // and avoid mounting the Publisher sidebar or publisher shell.
  if (isLoggedIn && activeScreen.startsWith("admin-")) {
    return (
      <div className={`min-h-screen ${isDark ? "dark" : ""} theme-bg-page theme-text-main flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden relative`}>
        <AdminLayout
          activeSection={activeScreen}
          setActiveSection={setActiveScreen}
          adminName="ApexTrack Admin"
          onLogout={() => {
            setIsLoggedIn(false);
            setAuthScreen("login");
          }}
          onReturnToPublisher={() => setActiveScreen("dashboard")}
        >
          {activeScreen === "admin-dashboard" && <AdminDashboardUI />}
          {activeScreen === "admin-publishers" && <AdminPublisherManagementView />}
          {activeScreen === "admin-offers" && <AdminOfferManagementView />}
          {activeScreen === "admin-applications" && <AdminApplicationReviewView />}
          {activeScreen === "admin-affiliates-list" && <AffiliateListView onViewProfile={(affiliate) => { setSelectedAffiliate(affiliate); setActiveScreen("admin-affiliate-profile"); }} />}
          {activeScreen === "admin-affiliate-profile" && selectedAffiliate && <AffiliateProfileView affiliate={selectedAffiliate} onBack={() => { setActiveScreen("admin-affiliates-list"); setSelectedAffiliate(null); }} />}
          {activeScreen === "admin-affiliates-pending" && <AffiliateListView title="Pending Affiliates" subtitle="Affiliates awaiting approval or compliance review." onViewProfile={(affiliate) => { setSelectedAffiliate(affiliate); setActiveScreen("admin-affiliate-profile"); }} />}
          {activeScreen === "admin-affiliates-active" && <AffiliateListView title="Active Affiliates" subtitle="Affiliates currently approved and generating traffic." onViewProfile={(affiliate) => { setSelectedAffiliate(affiliate); setActiveScreen("admin-affiliate-profile"); }} />}
          {activeScreen === "admin-affiliates-disabled" && <AffiliateListView title="Disabled Affiliates" subtitle="Affiliates that are currently suspended or restricted." onViewProfile={(affiliate) => { setSelectedAffiliate(affiliate); setActiveScreen("admin-affiliate-profile"); }} />}
          {activeScreen === "admin-affiliates-create" && <AffiliateCreateView />}
          {activeScreen === "admin-affiliates-postbacks" && <AffiliatePostbacksView />}
          {activeScreen === "admin-affiliates-billing" && <AffiliateBillingView />}
          {activeScreen === "admin-postback-test" && <PostbackTestView />}
          {activeScreen === "admin-managers-list" && <ManagerListView />}
          {activeScreen === "admin-managers-create" && <ManagerCreateView />}
          {activeScreen === "admin-managers-assign" && <ManagerAssignView />}
          {activeScreen === "admin-managers-performance" && <AdminManagerPerformanceView />}
          {activeScreen === "admin-reports-overview" && <AdminDashboardUI />}
          {activeScreen === "admin-reports-daily" && <ReportsDailyView />}
          {activeScreen === "admin-reports-click" && <ReportsClickView />}
          {activeScreen === "admin-reports-conversion" && <ReportsConversionView />}
          {activeScreen === "admin-advertisers-list" && <AdvertiserListView />}
          {activeScreen === "admin-advertisers-create" && <AdvertiserCreateView />}
          {activeScreen === "admin-advertisers-billing" && <AdvertiserBillingView />}
          {activeScreen === "admin-advertisers-reports" && <AdvertiserReportsView />}
          {activeScreen === "admin-finance-revenue" && <FinanceRevenueView />}
          {activeScreen === "admin-finance-payouts" && <FinancePayoutsView />}
          {activeScreen === "admin-finance-invoices" && <FinanceInvoicesView />}
          {activeScreen === "admin-system-settings" && <SystemSettingsView />}
          {activeScreen === "admin-system-roles" && <SystemSettingsView title="Roles & Permissions" description="Placeholder for roles, permissions and access control workflows." />}
          {activeScreen === "admin-system-audit" && <SystemSettingsView title="Audit Logs" description="Placeholder for audit trail and administrative event logs." />}
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
          advertiserName="ApexTrack Advertiser"
          onLogout={() => {
            setIsLoggedIn(false);
            setAuthScreen("login");
          }}
          onReturnToPublisher={() => setActiveScreen("dashboard")}
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
          managerName="Affiliate Manager"
          onLogout={() => {
            setIsLoggedIn(false);
            setAuthScreen("login");
          }}
          onReturnToPublisher={() => setActiveScreen("dashboard")}
        >
          {activeScreen === "manager-dashboard" && <ManagerDashboardView />}
          {activeScreen === "manager-publishers" && <ManagerPublisherReviewView />}
          {activeScreen === "manager-offers-approval" && <ManagerOfferApprovalView />}
          {activeScreen === "manager-communication" && <ManagerCommunicationView />}
          {activeScreen === "manager-performance" && <ManagerPerformanceView />}
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
                 setSelectedInvoice(null);
              }}
              publisherName={publisherName}
              unreadNotificationsCount={notifications.filter(n => !n.isRead).length}
              onLogout={() => {
                setIsLoggedIn(false);
                setAuthScreen("login");
              }}
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
                    APEXTRACK PARTNER NETWORK
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

                <div className="hidden md:flex flex-col text-right leading-tight max-w-[150px]">
                  <span className="text-xs font-bold theme-text-main truncate">{publisherName}</span>
                  <span className="text-[9px] font-mono theme-text-muted">Tier-1 VIP Affiliate Account</span>
                </div>

                <div className="w-8.5 h-8.5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 border border-cyan-200 dark:border-cyan-800/60 text-xs font-bold text-cyan-600 dark:text-cyan-300 flex items-center justify-center select-none uppercase shrink-0">
                  {publisherName.charAt(0) || "P"}
                </div>

                {activeScreen !== "admin-dashboard" && activeScreen !== "admin-publishers" && activeScreen !== "admin-offers" && activeScreen !== "admin-applications" && activeScreen !== "advertiser-dashboard" && activeScreen !== "advertiser-campaigns" && activeScreen !== "advertiser-tracking" && activeScreen !== "advertiser-billing" && activeScreen !== "advertiser-reports" && activeScreen !== "manager-dashboard" && activeScreen !== "manager-publishers" && activeScreen !== "manager-offers-approval" && activeScreen !== "manager-communication" && activeScreen !== "manager-performance" && (
                  <button
                    onClick={() => setActiveScreen("admin-dashboard")}
                    className="hidden md:inline-flex theme-bg-well border theme-border hover:bg-slate-100 dark:hover:bg-slate-900 theme-text-secondary hover:theme-text-main px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-wider transition font-medium select-none cursor-pointer duration-100"
                  >
                    Admin Panel
                  </button>
                )}
                {activeScreen !== "admin-dashboard" && activeScreen !== "admin-publishers" && activeScreen !== "admin-offers" && activeScreen !== "admin-applications" && activeScreen !== "advertiser-dashboard" && activeScreen !== "advertiser-campaigns" && activeScreen !== "advertiser-tracking" && activeScreen !== "advertiser-billing" && activeScreen !== "advertiser-reports" && activeScreen !== "manager-dashboard" && activeScreen !== "manager-publishers" && activeScreen !== "manager-offers-approval" && activeScreen !== "manager-communication" && activeScreen !== "manager-performance" && (
                  <button
                    onClick={() => setActiveScreen("advertiser-dashboard")}
                    className="hidden md:inline-flex theme-bg-well border theme-border hover:bg-slate-100 dark:hover:bg-slate-900 theme-text-secondary hover:theme-text-main px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-wider transition font-medium select-none cursor-pointer duration-100"
                  >
                    Advertiser Panel
                  </button>
                )}
                {activeScreen !== "admin-dashboard" && activeScreen !== "admin-publishers" && activeScreen !== "admin-offers" && activeScreen !== "admin-applications" && activeScreen !== "advertiser-dashboard" && activeScreen !== "advertiser-campaigns" && activeScreen !== "advertiser-tracking" && activeScreen !== "advertiser-billing" && activeScreen !== "advertiser-reports" && activeScreen !== "manager-dashboard" && activeScreen !== "manager-publishers" && activeScreen !== "manager-offers-approval" && activeScreen !== "manager-communication" && activeScreen !== "manager-performance" && (
                  <button
                    onClick={() => setActiveScreen("manager-dashboard")}
                    className="hidden md:inline-flex theme-bg-well border theme-border hover:bg-slate-100 dark:hover:bg-slate-900 theme-text-secondary hover:theme-text-main px-3 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-wider transition font-medium select-none cursor-pointer duration-100"
                  >
                    Manager Panel
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsLoggedIn(false);
                    setAuthScreen("login");
                  }}
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
                      Apex<span className="text-cyan-600">Track</span>
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
                    { id: "notifications", label: "Notifications" },
                    { id: "announcements", label: "Announcements" },
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
                          setSelectedInvoice(null);
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
                  <span className="text-[10px] text-slate-500 font-mono">Affiliate ID: #2081</span>
                  <button
                    onClick={() => {
                      setIsLoggedIn(false);
                      setAuthScreen("login");
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
        <div className="min-h-screen theme-bg-page flex flex-col items-center justify-center p-4 relative overflow-hidden">
          
          {/* Ambient graphics bubbles background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-full max-w-md pb-24 z-10">
            <PublisherAuth
              currentView={authScreen}
              setView={(view) => {
                if (view === "app") {
                  setIsLoggedIn(true);
                  setActiveScreen("dashboard");
                } else {
                  setAuthScreen(view);
                }
              }}
              onLoginSuccess={(name) => {
                if (name) setPublisherName(name);
                setIsLoggedIn(true);
                setActiveScreen("dashboard");
              }}
            />
          </div>

        </div>
      )}

      {/* -------------------------------------------------------------
          OVERLAY MODAL DETAIL SHEET: INDIVIDUAL DIGITAL INVOICE
          ------------------------------------------------------------- */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

    </div>
  );
}
