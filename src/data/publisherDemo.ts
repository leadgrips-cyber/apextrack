export interface DemoOffer {
  id: string;
  name: string;
  category: "App Install" | "CPA Lead" | "Crypto" | "Finance" | "E-commerce" | "Nutra";
  payoutType: "CPL" | "CPA" | "CPI" | "CPS";
  payoutValue: number;
  currency: string;
  geos: string[];
  status: "active" | "requires_approval" | "paused";
  description: string;
  rawUrl: string;
  trafficRestrictions: string[];
  caps: string;
  previewUrl: string;
  landers: { id: string; name: string; url: string }[];
  creatives: { id: string; name: string; size: string; type: string }[];
}

export interface DemoTransaction {
  id: string;
  date: string;
  type: "Cleared Revenue" | "payout" | "Hold Release" | "Bonus";
  amount: number;
  status: "completed" | "pending" | "processing" | "failed";
  notes: string;
}

export interface DemoInvoice {
  id: string;
  invoiceNumber: string;
  period: string;
  generatedDate: string;
  amount: number;
  status: "Paid" | "Unpaid" | "Hold" | "Processing";
  payoutMethod: string;
  fee: number;
}

export interface DemoReportRow {
  date: string;
  offer: string;
  offerId: string;
  clicks: number;
  conversions: number;
  payout: number;
  epc: number;
  cr: number;
}

// Complete Mock Datasets
export const DEMO_OFFERS: DemoOffer[] = [
  {
    id: "1092",
    name: "NordVPNSecure - Multi Device CPA (WW)",
    category: "App Install",
    payoutType: "CPA",
    payoutValue: 3.80,
    currency: "USD",
    geos: ["US", "CA", "DE", "FR", "GB", "AU"],
    status: "active",
    description: "NordVPNSecure is the leading privacy platform. User must download the desktop/mobile application, register, and complete a premium subscription start (1-month or higher). Immediate tracking conversion postback setup available.",
    rawUrl: "https://nordvpnsecure-tracker.com/landing?aff=apextrack",
    trafficRestrictions: ["No Incentivized traffic", "No Search Brand bidding", "No Popunder with auto-download", "Adult traffic allowed with warnings"],
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
    status: "active",
    description: "Install, open, and register an active user profile within Apex Trading App. Multi-attribute tracking converts instantly when user finishes verification.",
    rawUrl: "https://apex-trading.tracker.com/app",
    trafficRestrictions: ["Only mobile traffic", "Ad-wrappers blocked", "No incentivized signups"],
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
    status: "active",
    description: "Mortgage refinance and home loan short quote. Homeowners must submit valid social-proof details, contact address, and request pre-approval.",
    rawUrl: "https://fasthomeloan-preapprovals.com/cpa",
    trafficRestrictions: ["US Target Only", "No Co-registration lists", "No Craigslist traffic allowed"],
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
    status: "active",
    description: "High-paying weight loss and nutrition supplement offer. Convert user purchases securely using CC or local wallet gateways. Conversion registers instantly upon order verification.",
    rawUrl: "https://ketoshred-retail.com/payout",
    trafficRestrictions: ["No Fake Celebrity Endorsements", "No spam message alerts"],
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
    status: "paused",
    description: "Earn 18% rev-share of gross luxury cart purchases. Excellent seasonal checkout deals, custom promo codes enabled. Temporarily paused due to warehouse maintenance limits.",
    rawUrl: "https://luxuryessentials.example.com/catalog",
    trafficRestrictions: ["No Trademark bidding", "No discount scraping code directories"],
    caps: "Currently Paused",
    previewUrl: "https://luxuryessentials.example.com",
    landers: [
      { id: "lan-13", name: "High Contrast Luxury Collection Homepage", url: "https://luxuryessentials.example.com/collection" }
    ],
    creatives: []
  }
];

export const DEMO_TRANSACTIONS: DemoTransaction[] = [
  { id: "TX-4091", date: "2026-06-05 14:22", type: "Cleared Revenue", amount: 1420.50, status: "completed", notes: "Cleared conversions week ending May 29" },
  { id: "TX-4090", date: "2026-06-01 02:00", type: "payout", amount: -2850.00, status: "completed", notes: "Monthly direct wire transfer payout to Citibank (A/C: *9981)" },
  { id: "TX-4089", date: "2026-05-28 11:15", type: "Hold Release", amount: 450.00, status: "completed", notes: "Released secondary cryptographic fraud hold, verified authentic" },
  { id: "TX-4088", date: "2026-05-20 09:30", type: "Bonus", amount: 250.00, status: "completed", notes: "NordVPN volume bonus tier incentive award" },
  { id: "TX-4087", date: "2026-05-15 14:02", type: "Cleared Revenue", amount: 1200.00, status: "completed", notes: "Cleared conversions week ending May 08" },
  { id: "TX-4086", date: "2026-05-01 01:00", type: "payout", amount: -1980.00, status: "completed", notes: "Monthly PayPal wire payout" },
  { id: "TX-4085", date: "2026-04-28 18:40", type: "Cleared Revenue", amount: 980.00, status: "completed", notes: "Cleared conversions ledger audit OK" }
];

export const DEMO_INVOICES: DemoInvoice[] = [
  { id: "INV-6072", invoiceNumber: "APX-2026-06-01", period: "May 01, 2026 - May 31, 2026", generatedDate: "2026-06-01", amount: 3320.50, status: "Paid", payoutMethod: "International Wire Transfer (USD)", fee: 15.00 },
  { id: "INV-6071", invoiceNumber: "APX-2026-05-01", period: "Apr 01, 2026 - Apr 30, 2026", generatedDate: "2026-05-01", amount: 1980.00, status: "Paid", payoutMethod: "PayPal Wallet Ledger", fee: 0.00 },
  { id: "INV-6070", invoiceNumber: "APX-2026-04-01", period: "Mar 01, 2026 - Mar 31, 2026", generatedDate: "2026-04-01", amount: 2450.00, status: "Paid", payoutMethod: "International Wire Transfer (USD)", fee: 15.00 },
  { id: "INV-6069", invoiceNumber: "APX-2026-03-01", period: "Feb 01, 2026 - Feb 28, 2026", generatedDate: "2026-03-01", amount: 890.00, status: "Paid", payoutMethod: "Tether (USDT ERC-20)", fee: 2.00 },
  { id: "INV-6073", invoiceNumber: "APX-2026-07-01_DRAFT", period: "Jun 01, 2026 - Jun 05, 2026", generatedDate: "2026-06-06", amount: 1420.50, status: "Unpaid", payoutMethod: "International Wire Transfer (USD)", fee: 15.00 }
];

export const DEMO_REPORTS: DemoReportRow[] = [
  { date: "2026-06-05", offer: "NordVPNSecure - Multi Device CPA (WW)", offerId: "1092", clicks: 1250, conversions: 58, payout: 220.40, epc: 0.176, cr: 4.64 },
  { date: "2026-06-05", offer: "Apex Trading App - Mobile Install (iOS/Android)", offerId: "1094", clicks: 840, conversions: 35, payout: 147.00, epc: 0.175, cr: 4.17 },
  { date: "2026-06-04", offer: "NordVPNSecure - Multi Device CPA (WW)", offerId: "1092", clicks: 1400, conversions: 61, payout: 231.80, epc: 0.165, cr: 4.36 },
  { date: "2026-06-04", offer: "FastHomeLoan - Instant Cash Lead Quote", offerId: "1095", clicks: 120, conversions: 8, payout: 224.00, epc: 1.866, cr: 6.67 },
  { date: "2026-06-03", offer: "NordVPNSecure - Multi Device CPA (WW)", offerId: "1092", clicks: 1100, conversions: 49, payout: 186.20, epc: 0.169, cr: 4.45 },
  { date: "2026-06-03", offer: "CoinLedger crypto - Decentralized wallet SignUp", offerId: "1093", clicks: 180, conversions: 12, payout: 150.00, epc: 0.833, cr: 6.67 },
  { date: "2026-06-02", offer: "Apex Trading App - Mobile Install (iOS/Android)", offerId: "1094", clicks: 920, conversions: 41, payout: 172.20, epc: 0.187, cr: 4.46 },
  { date: "2026-06-02", offer: "FastHomeLoan - Instant Cash Lead Quote", offerId: "1095", clicks: 110, conversions: 7, payout: 196.00, epc: 1.781, cr: 6.36 },
  { date: "2026-06-01", offer: "KetoDiet Shred - CPS Health Offer (WW)", offerId: "1096", clicks: 310, conversions: 5, payout: 325.00, epc: 1.048, cr: 1.61 },
  { date: "2026-06-01", offer: "NordVPNSecure - Multi Device CPA (WW)", offerId: "1092", clicks: 1320, conversions: 52, payout: 197.60, epc: 0.149, cr: 3.94 }
];

export const REPLAY_TRAFFIC_LOGS = [
  { time: "11:41:02", offer: "NordVPNSecure", geo: "US", type: "click", status: "Redirected", sub1: "fb_campaign_9", sub2: "adgroup3" },
  { time: "11:40:44", offer: "Apex Trading App", geo: "DE", type: "click", status: "Redirected", sub1: "google_search", sub2: "mobile_ios" },
  { time: "11:39:15", offer: "FastHomeLoan", geo: "US", type: "conversion", status: "Converted", sub1: "native_network", payout: "$28.00" },
  { time: "11:38:50", offer: "KetoDiet Shred", geo: "CA", type: "conversion", status: "Converted", sub1: "insta_influencer", payout: "$65.00" },
  { time: "11:38:12", offer: "NordVPNSecure", geo: "GB", type: "click", status: "Redirected", sub1: "newsletter_june", sub2: "banner" },
  { time: "11:37:41", offer: "CoinLedger crypto", geo: "SG", type: "click", status: "Duplicate IP Rejected", sub1: "tg_group_btc", error: "Duplicate Fingerprint" }
];

export const SYSTEM_POSTBACK_PLACEHOLDERS = [
  { token: "{click_id}", desc: "Unique click parameter token registered in system" },
  { token: "{offer_id}", desc: "Identifier of the conversion offer triggered" },
  { token: "{payout}", desc: "Earned payout value generated in USD currency format" },
  { token: "{sub1}", desc: "First sub-affiliate custom parameter tracking segment" },
  { token: "{sub2}", desc: "Second sub-affiliate custom tracking segment" },
  { token: "{sub3}", desc: "Third sub-affiliate custom tracking segment" },
  { token: "{sub4}", desc: "Fourth sub-affiliate custom tracking segment" },
  { token: "{sub5}", desc: "Fifth sub-affiliate custom tracking segment" },
  { token: "{country}", desc: "Geographic country representation (ISO-2 code)" },
  { token: "{transaction_id}", desc: "Attribution ledger record transaction security ID" }
];
