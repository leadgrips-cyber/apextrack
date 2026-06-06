import { useState } from "react";
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
  const [publisherName, setPublisherName] = useState("John Doe Media INC");

  // Statefully manage offers to allow interactive publisher approval workflow
  const [offers, setOffers] = useState<any[]>(() => {
    return [
      {
        id: "1092",
        name: "NordVPNSecure - Multi Device CPA (WW)",
        category: "App Install",
        payoutType: "CPA",
        payoutValue: 3.80,
        currency: "USD",
        geos: ["US", "CA", "DE", "FR", "GB", "AU"],
        status: "open_access",
        description: "NordVPNSecure is the leading privacy platform. User must download the desktop/mobile application, register, and complete a premium subscription start (1-month or higher). Immediate tracking conversion postback setup available.",
        rawUrl: "https://nordvpnsecure-tracker.com/landing?aff=apextrack",
        trafficRestrictions: ["No Incentivized traffic", "No Search Brand bidding", "No Popunder with auto-download", "Adult traffic allowed with warnings"],
        devices: "Desktop, MacBook, iPhone, Android TV",
        caps: "100 conversions / daily cap limit per publisher",
        previewUrl: "https://nordvpnsecure.example.com",
        landers: [
          { id: "lan-1", name: "Default High Converting Lander (Squeeze Page)", url: "https://nordvpnsecure.example.com/lander1" },
          { id: "lan-2", name: "Cybersecurity Threat Alert Lander", url: "https://nordvpnsecure.example.com/lander2" },
          { id: "lan-3", name: "68% Off Special Event Landing", url: "https://nordvpnsecure.example.com/lander3" }
        ],
        creatives: [
          { id: "cr-1", name: "NordVPN Premium Banner Clean Blue", size: "300x250", type: "Display GIF" },
          { id: "cr-2", name: "Cyber Protection Threat Animated Widget", size: "728x90", type: "HTML5 Creative" },
          { id: "cr-3", name: "Privacy First Device Slider", size: "160x600", type: "Static PNG" }
        ]
      },
      {
        id: "1093",
        name: "CoinLedger crypto - Decentralized wallet SignUp",
        category: "Crypto",
        payoutType: "CPL",
        payoutValue: 12.50,
        currency: "USD",
        geos: ["US", "GB", "NL", "SG", "CH", "AE"],
        status: "requires_approval",
        description: "Premium cryptographic smart wallet registration flow. Verified Email + Phone number is required for user account clearance. Double-enrollment fraud checks will void double IP accounts instantly.",
        rawUrl: "https://coinledger.cryptotrx.com/ref?aid=apex",
        trafficRestrictions: ["Strictly No Fraud", "No Email spamming/scraping", "No incentivized virtual currencies integration"],
        devices: "Smartphones & Mobile Browsers Only",
        caps: "25 leads daily cap. Request AM check-in for cap updates.",
        previewUrl: "https://coinledger.example.com",
        landers: [
          { id: "lan-4", name: "Dynamic Cryptographic App Store Squeeze", url: "https://coinledger.example.com/lander" },
          { id: "lan-5", name: "Beta Wallet SignUp Survey", url: "https://coinledger.example.com/survey" }
        ],
        creatives: [
          { id: "cr-4", name: "CoinLedger Mobile app Appstore Banner", size: "320x50", type: "Static PNG" },
          { id: "cr-5", name: "Decentralized Crypto wallet 3D Visualizer", size: "300x250", type: "Display GIF" }
        ]
      },
      {
        id: "1094",
        name: "Apex Trading App - Mobile Install (iOS/Android)",
        category: "Finance",
        payoutType: "CPI",
        payoutValue: 4.20,
        currency: "USD",
        geos: ["US", "CA", "GB", "IE", "DE", "JP"],
        status: "open_access",
        description: "Install, open, and register an active user profile within Apex Trading App. Multi-attribute tracking converts instantly when user finishes verification.",
        rawUrl: "https://apex-trading.tracker.com/app",
        trafficRestrictions: ["Only mobile traffic", "Ad-wrappers blocked", "No incentivized signups"],
        devices: "iOS Touch devices, Android OS build v10+",
        caps: "500 installs / daily limit",
        previewUrl: "https://apextrading.example.com/app",
        landers: [
          { id: "lan-6", name: "Direct App Store DeepLink", url: "https://apextrading.example.com/appstore-deep" },
          { id: "lan-7", name: "Introductory Trading Platform Lander", url: "https://apextrading.example.com/main" }
        ],
        creatives: [
          { id: "cr-6", name: "Finance Chart Static Banner", size: "300x250", type: "Static PNG" },
          { id: "cr-7", name: "Interactive Stock Selector Panel", size: "300x600", type: "HTML5 Interactive" }
        ]
      },
      {
        id: "1095",
        name: "FastHomeLoan - Instant Cash Lead Quote",
        category: "Finance",
        payoutType: "CPL",
        payoutValue: 28.00,
        currency: "USD",
        geos: ["US", "CA"],
        status: "open_access",
        description: "Mortgage refinance and home loan short quote. Homeowners must submit valid social-proof details, contact address, and request pre-approval.",
        rawUrl: "https://fasthomeloan-preapprovals.com/cpa",
        trafficRestrictions: ["US Target Only", "No Co-registration lists", "No Craigslist traffic allowed"],
        devices: "PCs and Mobile web browsers",
        caps: "No Maximum Daily Caps",
        previewUrl: "https://fasthomeloan.example.com",
        landers: [
          { id: "lan-8", name: "Zip-Code Fast Form Lead Screen", url: "https://fasthomeloan.example.com/zipform" }
        ],
        creatives: [
          { id: "cr-8", name: "Get Home Loan Rates Standard Header", size: "728x90", type: "Static PNG" },
          { id: "cr-9", name: "Fast Refinance Calculator Box", size: "300x250", type: "Static PNG" }
        ]
      },
      {
        id: "1096",
        name: "KetoDiet Shred - CPS Health Offer (WW)",
        category: "Nutra",
        payoutType: "CPS",
        payoutValue: 65.00,
        currency: "USD",
        geos: ["US", "CA", "GB", "DE", "FR", "ES", "IT", "BR", "MX"],
        status: "open_access",
        description: "High-paying weight loss and nutrition supplement offer. Convert user purchases securely using CC or local wallet gateways. Conversion registers instantly upon order verification.",
        rawUrl: "https://ketoshred-retail.com/payout",
        trafficRestrictions: ["No Fake Celebrity Endorsements", "No spam message alerts"],
        devices: "All Devices compatible with browser cookie tracking",
        caps: "Unlimited, premium traffic scaling approved",
        previewUrl: "https://ketoshred.example.com",
        landers: [
          { id: "lan-9", name: "Medical Weightloss Editorial Quiz", url: "https://ketoshred.example.com/quizl" },
          { id: "lan-10", name: "Keto Diet Direct Product Purchase", url: "https://ketoshred.example.com/checkout" }
        ],
        creatives: [
          { id: "cr-10", name: "Before-After Diet Progression Grid", size: "300x250", type: "Static JPG" },
          { id: "cr-11", name: "Summer Fitness Checklist Squeeze Card", size: "160x600", type: "Display GIF" }
        ]
      },
      {
        id: "1097",
        name: "SaaS Enterprise CRM - 14-Day Free Trial Sign-Up",
        category: "CPA Lead",
        payoutType: "CPL",
        payoutValue: 8.50,
        currency: "USD",
        geos: ["US", "GB", "CA", "DE", "FR", "SG", "AU"],
        status: "requires_approval",
        description: "Integrate premium B2B workflows. Small-business owners can register for a 14-day fully featured dashboard trial. Only company domains clearance verified, free-tier registration tracking enabled.",
        rawUrl: "https://saascrm.example.com/join",
        trafficRestrictions: ["B2B Traffic Only", "No Search Engine Trademark bidding keywords", "No Incentives allowed"],
        devices: "Desktop Only (Chrome, Firefox, Safari desktop builds)",
        caps: "50 daily conversion approvals",
        previewUrl: "https://saascrm.example.com",
        landers: [
          { id: "lan-11", name: "SaaS Main Pricing Comparison Matrix", url: "https://saascrm.example.com/pricing" },
          { id: "lan-12", name: "Enterprises CRM Demo Video Lander", url: "https://saascrm.example.com/demo" }
        ],
        creatives: [
          { id: "cr-12", name: "CRM Modern Platform UI Dashboard Snippet", size: "300x250", type: "Display GIF" }
        ]
      },
      {
        id: "1098",
        name: "Luxury Essentials - Premium Apparel Shop Sale",
        category: "E-commerce",
        payoutType: "CPS",
        payoutValue: 18.00,
        currency: "USD",
        geos: ["WW"],
        status: "requires_approval",
        description: "Earn 18% rev-share of gross luxury cart purchases. Excellent seasonal checkout deals, custom promo codes enabled. Temporarily paused due to warehouse maintenance limits.",
        rawUrl: "https://luxuryessentials.example.com/catalog",
        trafficRestrictions: ["No Trademark bidding", "No discount scraping code directories"],
        devices: "Desktop and Mobile responsive layouts supported",
        caps: "Currently Paused",
        previewUrl: "https://luxuryessentials.example.com",
        landers: [], // No landing pages – validates conditional section hide rule
        creatives: [] // No creatives / banners – validates conditional section hide rule
      }
    ];
  });

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
        return <TrackingLinkView />;
      case "postbacks":
        return <PostbackSetupView />;
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
                // Clear selected offer view when moving away from marketplace tab
                if (screen !== "marketplace") setSelectedOfferId(null);
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
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-40 lg:hidden flex flex-col p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-cyan-500 text-slate-950 p-2 rounded-lg font-black shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-black text-white font-mono uppercase">
                      Apex<span className="text-cyan-400">Track</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-slate-400 hover:text-rose-400 p-1 bg-slate-900 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col space-y-2 overflow-y-auto pr-1">
                  {[
                    { id: "dashboard", label: "Dashboard" },
                    { id: "marketplace", label: "Offer Marketplace" },
                    { id: "my-offers", label: "My Offers" },
                    { id: "notifications", label: "Notifications" },
                    { id: "announcements", label: "Announcements" },
                    { id: "link-generator", label: "Tracking Links" },
                    { id: "postbacks", label: "Postback Setup" },
                    { id: "api-access", label: "API Access Tokens" },
                    { id: "reports", label: "Reports Ledger" },
                    { id: "wallet", label: "Disbursement Wallet" },
                    { id: "profile", label: "Profile settings" }
                  ].map((it) => (
                    <button
                      key={it.id}
                      onClick={() => {
                        setActiveScreen(it.id);
                        if (it.id !== "marketplace") setSelectedOfferId(null);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-semibold ${
                        activeScreen === it.id ? "bg-slate-900 border border-slate-850 text-cyan-400" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {it.label}
                    </button>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-850 flex items-center justify-between">
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
