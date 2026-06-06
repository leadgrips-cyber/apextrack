export interface CoreSystemPrinciple {
  id: string;
  title: string;
  description: string;
  highlights: string[];
}

export interface UserRoleDefinition {
  role: string;
  description: string;
  permissions: string[];
  keyKPIs: string[];
  typicalWorkflows: string[];
}

export const APEXTRACK_SYSTEM_OVERVIEW = {
  projectName: "ApexTrack",
  tagline: "Enterprise-Grade Real-Time Affiliate Tracking & Attribution Ledger Engine",
  inspirationLegacy: ["Trackier", "Affise", "Everflow", "HasOffers"],
  architectureHighlights: [
    {
      title: "Stateless High-Concurrency Click Gateway",
      description: "Fast redirect engine designed for sub-10ms latency. Written in a highly-performant async request loop with multi-region CDN and Redis lookup."
    },
    {
      title: "Double-Entry Bookkeeping Attribution Ledger",
      description: "Guarantees zero-loss tracking of clicks, impressions, postbacks, and payout adjustments, ensuring all transactions reconcile with high-precision database states."
    },
    {
      title: "Real-Time Edge Fraud Sieve (REFS)",
      description: "Proprietary filter evaluating device characteristics, IP-reputation lists, proxy score, click-to-conversion-time (CTCT), and velocity curves at the edge-level before incrementing clicks."
    },
    {
      title: "Universal Macro Router (UMR)",
      description: "Resolves sub-affiliate IDs, dynamic creative tags, custom sub-parameters (sub1-sub5), smart redirection, and device-level OS routing."
    }
  ],
  coreFormulas: [
    { name: "Click-Through Rate (CTR)", formula: "(Impressions / Clicks) * 100", purpose: "Determines creative and publisher performance ratio" },
    { name: "Conversion Rate (CR)", formula: "(Conversions / Clicks) * 100", purpose: "Measures landing page or registration flow efficiency" },
    { name: "Earnings Per Click (EPC)", formula: "(Total Approved Revenue / Total Clicks)", purpose: "Principal valuation metric for publishers to judge offer yield" },
    { name: "Return on Investment (ROI)", formula: "((Revenue - Cost) / Cost) * 100", purpose: "Advertiser-side profitability metric" },
    { name: "Payout Margin", formula: "((Advertiser Revenue - Publisher Payout) / Advertiser Revenue) * 100", purpose: "Network profit margin per campaign block" },
    { name: "Invalid Click / Fraud Ratio", formula: "(Blocked Clicks / Total Attempted Clicks) * 100", purpose: "Security and publisher compliance health index" }
  ]
};

export const CORE_SYSTEM_PRINCIPLES: CoreSystemPrinciple[] = [
  {
    id: "att-ledger",
    title: "Immutable Attribution Ledger",
    description: "Every touchpoint represents a locked event record. Conversions and reversals operate strictly via ledger adjustment transactions to prevent historic reporting drift.",
    highlights: [
      "Click hash serves as the absolute single source of truth (SSOT).",
      "Dynamic conversion adjustments track timestamp, reason code, and admin agent details.",
      "Support for multi-currency conversion paths with historical rate-locking."
    ]
  },
  {
    id: "edge-routing",
    title: "Edge Optimization & Geotargeting",
    description: "Dynamic offer routing occurs nearest to the consumer. Pre-evaluated serverless rules evaluate location, device parameters, capability models, and cap limits within a 2.1 millisecond regional edge window.",
    highlights: [
      "Geolocation checks utilize localized MaxMind Db IP registries loaded in RAM.",
      "OS and Device capability routing based on user-agent pattern tables.",
      "Cap enforcement counts updated via high-frequency regional sync queues."
    ]
  },
  {
    id: "real-time-sieve",
    title: "Comprehensive Security & Transparency",
    description: "Ensuring both publishers and advertisers have cryptographically provable transaction states. Leverages real-time log streaming and fraud scores for bulletproof disputes.",
    highlights: [
      "Transparent block logs visible to publishers showing exact rulesets triggered.",
      "Unique transaction hashing prevents postback spam and duplicate replays.",
      "Strict TLS 1.3 handshake enforcement on all incoming and outgoing secure integrations."
    ]
  },
  {
    id: "automated-optimization",
    title: "Programmatic Automation & Performance Guard",
    description: "System parameters are evaluated in safe background threads to self-correct campaign trajectories. Overperforming partners are scaled up, while poor-converting or fraudulent traffic sinks are automatically throttled to guarantee high advertiser ROI.",
    highlights: [
      "Performance rules pause publishers automatically if CR falls below minimum thresholds.",
      "Automated click cap triggers redirect spillover traffic to optimal fallback offers dynamically.",
      "Real-time notifications pushed to account managers when campaign budgets deplete."
    ]
  },
  {
    id: "cross-border-settlement",
    title: "Multi-Currency Sovereignty Ledger",
    description: "Unified double-entry bookkeeping with dynamic, auto-hedged foreign exchange locks. Transactions from multi-national advertisers are settled instantly, matching dynamic global publisher wallets in chosen corridors.",
    highlights: [
      "Dynamic rate locks at conversion timestamp to protect the platform from macro FX volatility.",
      "Multi-currency reserves support (USD, EUR, GBP, INR, JPY, and crypto tokens like USDT).",
      "Automatic ledger reconciliation balancing all multi-currency debits and credits to base currency parameters."
    ]
  }
];

export const USER_ROLES: UserRoleDefinition[] = [
  {
    role: "Admin (Network Owner)",
    description: "Full orchestrator of the affiliate program. Governs master advertiser catalogs, reviews global margins, manages custom billing loops, monitors platform-wide fraud filters, and provisions staff access.",
    permissions: [
      "Full Create-Read-Update-Delete (CRUD) on Offers, Publishers, Advertisers, and Globals",
      "Billing execution, credit and wallet adjustments, payout conversions, and bank wire logs",
      "Fraud parameter customization (IP scoring, CTCT cutoff limits, postback verification keys)",
      "Re-allocation of sub-IDs, smart link weight adjustment, custom SQL-based schema configuration",
      "Configure programmatic Offer Sync (CPAPI) ingestion endpoints and automatic scheduler rates",
      "Establish site-wide Automation Rules and trigger thresholds for affiliate traffic",
      "System audit log viewing and full user account masquerading for rapid troubleshooting"
    ],
    keyKPIs: [
      "Network Gross Margin ($ and %)",
      "Daily Platform Traffic Volumes & Active Clicks",
      "Average Client Retention Rate & Payout Velocity",
      "Blocked Traffic Ratio / Blocked Postbacks",
      "SaaS Automation Effectiveness & Prevented Spend Drainage",
      "FX Hedge Margin variance"
    ],
    typicalWorkflows: [
      "Daily billing reconciliation & multi-currency conversion path checks",
      "High-risk publisher compliance checks & automation rule modifications",
      "Advertiser credit risk evaluations & custom domain SSL provisions",
      "Offer cap limit resets and manual payouts adjustments"
    ]
  },
  {
    role: "Publisher (Affiliate / Resource Partner)",
    description: "External audience traffic generators. Use ApexTrack tools to extract smart tracking links, review clean metrics dashboards, optimize source placements, configure custom postback triggers, and cash out built-up wallet items.",
    permissions: [
      "Access authorized offers, requesting custom approvals with traffic declarations",
      "Configure custom global or offer-specific tracking postbacks (S2S, Pixel, Iframe)",
      "Generate custom tracking links with subID queries (sub1-sub5)",
      "Register white-label custom tracking domains and track SSL status",
      "Integrate Mobile App Attribution parameters and fetch Deferred Deep Linking SDK setups",
      "View detailed reports grouped by subIDs, country, device, offer type, and date",
      "Request payout payouts and update payment details in preferred currency (USD, EUR, USDT-TRC20)"
    ],
    keyKPIs: [
      "Earnings Per Click (EPC)",
      "Total Approved Conversions / Clicks",
      "Daily Payout Balance ($)",
      "Conversion Rate (CR)",
      "Click Density Analytics & Mobile Core App Metrics"
    ],
    typicalWorkflows: [
      "Running multi-parameter marketing tests using subID tracking",
      "Setting up custom CNAME domains with SSL overrides to bypass blocklists",
      "Setting up pixel fallback cascades for non-converting geolocations",
      "Checking daily payout states & submitting billing vouchers"
    ]
  },
  {
    role: "Advertiser (Sponsor / Brand Owner)",
    description: "The source campaigns, financing budgets and payouts structures. Feed offer targets into ApexTrack, deliver conversion tracking pixels, track conversion metrics audits, adjust custom cap limitations, and dispute fraudulent referrals.",
    permissions: [
      "Create, configure, and monitor proprietary campaigns/offers",
      "Configure custom click caps (Daily, Weekly, Monthly, Lifetime budget weights)",
      "Upload and manage visual creative items, image assets, HTML files, and deep links",
      "Define specific targeting parameters (OS models, Browser language, Carriers)",
      "Manage account balances, upload prepayments via Stripe, wire, or bank card",
      "Review conversions list, uploading manual approvals / rejections with CSV uploads"
    ],
    keyKPIs: [
      "Campaign ROI (%)",
      "Cost Per Acquisition (CPA) Validation",
      "Daily Ad Spend Velocity & Payout Cap Drain",
      "Disputed Conversion Ratio",
      "Creative Ad Banner Click-Through Ratio (CTR)"
    ],
    typicalWorkflows: [
      "Adjusting caps during peak seasonal events",
      "Conducting CTR evaluations of visual assets",
      "Executing retroactive verification of batch conversions",
      "Funding advertiser wallet balances"
    ]
  }
];
