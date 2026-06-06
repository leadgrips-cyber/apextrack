export interface ScreenAction {
  name: string;
  type: "button" | "form" | "filter" | "workflow" | "export";
  description: string;
  outcome: string;
}

export interface ScreenDefinition {
  id: string;
  name: string;
  description: string;
  menuItem: string;
  widgets: string[];
  actions: ScreenAction[];
  reports: string[];
}

export interface PortalDefinition {
  portalName: string;
  targetRole: string;
  overview: string;
  menuHierarchy: string[];
  screens: ScreenDefinition[];
}

export const APEXTRACK_PORTALS: PortalDefinition[] = [
  {
    portalName: "Admin Portal",
    targetRole: "Admin (Network Owner / Account Managers / Compliance Staff)",
    overview: "Centralized power grid and back-office cockpit. Provides holistic control over database records, global risk tolerances, network billing settlement pipelines, currency ratios, and administrative tools.",
    menuHierarchy: [
      "Dashboard Node",
      "Offer Control Engine",
      "Offer Sync Automation (CPAPI)",
      "Smart KPI Automation Rules",
      "Partner Directories (Publisher / Advertiser)",
      "Financial Ledger Registry (Invoices / Adjustments / FX)",
      "Safety Center (Fraud Rules / Blacklists)",
      "White-Label SSL Domain Control Room",
      "BI Aggregate Reporting Node",
      "Multi-Tenant Agency Staff Hierarchy Settings",
      "System Configurations (MFA / SMTP / Web API)"
    ],
    screens: [
      {
        id: "admin-dashboard",
        name: "Command Control Overview",
        description: "Real-time master operational display aggregating multi-source metrics and highlighting system variances.",
        menuItem: "Dashboard Node",
        widgets: [
          "Network Profit margin Gauge (Net Revenue - Publisher Payout)",
          "Live System traffic Volume (Active click and impressions/sec)",
          "Fraud Flag Trigger Alert Log Feed",
          "Top Converting Affiliates / Cost-Incurring Advertisers lists",
          "Currency reserve balance counters (USD, EUR, USDT)"
        ],
        actions: [
          {
            name: "Platform Pause",
            type: "button",
            description: "Closes public tracking links temporarily for emergency database maintenance.",
            outcome: "Routes entire platform traffic seamlessly to neutral fallback links without losing data sessions."
          },
          {
            name: "Run Reconciliation check",
            type: "workflow",
            description: "Validates double-entry database totals against current client ledger balances.",
            outcome: "Generates an absolute variance card to reveal drift anomalies if any exist."
          },
          {
            name: "Masquerade Session",
            type: "button",
            description: "Impersonates any publisher or advertiser account to diagnose dashboard layout questions.",
            outcome: "Launches dynamic client browser view in locked administrative simulation mode."
          }
        ],
        reports: [
          "Hourly platform click velocity index",
          "Network net profit margin percentages",
          "Partner quality rankings roster"
        ]
      },
      {
        id: "admin-offer-wizard",
        name: "Offer Wizard & Targeting Engine",
        description: "Creates, clones, and modifies tracking profiles, configuring campaign cost schedules, geolocations, and fallback redirections.",
        menuItem: "Offer Control Engine",
        widgets: [
          "Core details form (Name, Status: Active/Suspended, Type: CPA/CPI/CPL)",
          "Price commission tiers matrix (Dynamic Cost Payout vs Publisher Payout values)",
          "Routing maps constructor list (Redirects according to Geos, Devices, OS versions)",
          "Cap control registers form (Daily, Monthly, Lifetime caps)"
        ],
        actions: [
          {
            name: "Push Campaign Live",
            type: "button",
            description: "Validates variables and syncs campaign rules to active regional routing caches.",
            outcome: "Assigns dynamic IDs and initiates click-capturing services globally."
          },
          {
            name: "Set Cap Fallback Target",
            type: "form",
            description: "Assigns a secondary fallback campaign to capture traffic if budget caps are exceeded.",
            outcome: "Configures real-time routing engines to auto-transfer spillover users immediately."
          },
          {
            name: "Sync Out of State Caps",
            type: "workflow",
            description: "Refreshes high-frequency memory values for active campaigns manually.",
            outcome: "Resynchronizes regional edge traffic counters instantly."
          }
        ],
        reports: [
          "Offer-specific click-to-conversion rates (CR)",
          "Cap exhaustion indicators",
          "Fallback redirection frequency audit"
        ]
      },
      {
        id: "admin-offer-sync",
        name: "CPAPI Offer Sync Automation Hub",
        description: "Monitors, schedules, and programmatically maps campaign metadata from remote tracker feeds directly into ApexTrack.",
        menuItem: "Offer Sync Automation (CPAPI)",
        widgets: [
          "Active Synced Api Feeds Lists (Trackier, Affise, Everflow networks)",
          "Incoming Sync Insertion Success Ratios Gage",
          "Manual Overrides Rate Lock-in parameters matrix",
          "Last Sync Execution logs list"
        ],
        actions: [
          {
            name: "Add Sync Feed",
            type: "form",
            description: "Wires database fields dynamically mapping upstream variable templates.",
            outcome: "Initializes background sync records under chosen schedulers."
          },
          {
            name: "Trigger Manual Sync Batch",
            type: "button",
            description: "Queries external trackers immediately to import active listings.",
            outcome: "Imports new files, updates matching rates, and logs differences."
          }
        ],
        reports: [
          "Deduplicated synced campaigns count growth charts",
          "Upstream status change indicators roster",
          "Rate disparity log feeds"
        ]
      },
      {
        id: "admin-automation-rules",
        name: "Smart KPI Automation Suite Dashboard",
        description: "Systematic performance checker tracking live publisher conversion metrics and triggering budget protections.",
        menuItem: "Smart KPI Automation Rules",
        widgets: [
          "Count of Currently Triggered Alarms & Active Blocks",
          "Rules Constructor Editor Form (Metric conditions: EPC, CR, CTR, clicks thresholds)",
          "Historical Block logs graph displaying saved ad spend curves"
        ],
        actions: [
          {
            name: "Establish Smart Performance Rule",
            type: "form",
            description: "Wires specified mathematical parameters to target client affiliate portfolios.",
            outcome: "Saves alert conditions to daemon evaluators immediately."
          },
          {
            name: "Acknowledge & Release Block",
            type: "button",
            description: "Restores standard routing channels for manually verified publishers.",
            outcome: "Clears block parameters on active edge routers."
          }
        ],
        reports: [
          "Prevented ad spend drainage projections",
          "Historical auto-paused affiliates metrics",
          "CR anomaly detection reports"
        ]
      },
      {
        id: "admin-partner-mngr",
        name: "Partner Audits & Performance Registry",
        description: "Central catalog tracking affiliate profiles, validating application queues, setting client tax codes, and adjusting custom margins.",
        menuItem: "Partner Directories",
        widgets: [
          "Pending application queue lists",
          "Profile configuration maps (Bank wires info, Skype/Telegram handler strings)",
          "Publisher custom margins matrix overrides grid",
          "Client credit-risk thresholds calculator"
        ],
        actions: [
          {
            name: "Approve Publisher",
            type: "button",
            description: "Vets pending publisher and triggers account credential delivery.",
            outcome: "Swaps candidate status to ACTIVE and spawns dedicated balance ledgers."
          },
          {
            name: "Suspend Publisher Links",
            type: "button",
            description: "Terminates specific affiliate promotion capabilities due to fraud alerts.",
            outcome: "Instructs edge-gateway channels to drop associated click strings immediately."
          },
          {
            name: "Set Custom Payout Scale",
            type: "form",
            description: "Assigns tailored payout values to high-performing affiliates for specific campaigns.",
            outcome: "Overrides standard offer prices for matching publisher parameters."
          }
        ],
        reports: [
          "Publisher fraud-index metrics history",
          "Partner traffic share distribution graph",
          "Partner lifetime-value performance lists"
        ]
      },
      {
        id: "admin-sieve-configs",
        name: "Fraud Sieve Control Console",
        description: "Configuration engine managing device evaluation profiles, IP-blacklist tables, proxy thresholds, and automated threat mitigations.",
        menuItem: "Safety Center",
        widgets: [
          "Proxy-threat threshold sliders (Minimum score tolerance range 0-100)",
          "Click-To-Conversion window inputs (CTCT minimum allowable duration checks)",
          "Dynamic patterns definitions card (Banned ISPs, User-Agents)",
          "Platform block lists tables (Identified suspicious tracking variables)"
        ],
        actions: [
          {
            name: "Update Threat Threshold",
            type: "form",
            description: "Alters score caps at which traffic must be flagged as proxy/non-human.",
            outcome: "Re-calibrates edge router intelligence parameters immediately."
          },
          {
            name: "Flush Blacklist Cache",
            type: "button",
            description: "Clears and rebuilds edge threat parameters with verified historical logs.",
            outcome: "Syncs platform defense parameters across active servers."
          },
          {
            name: "Export Block Log CSV",
            type: "export",
            description: "Downloads comprehensive reports of suspicious traffic behaviors.",
            outcome: "Provides evidence logs for resolving advertiser disputes."
          }
        ],
        reports: [
          "Blocked clicks distribution by cause (CTCT speed, proxy flag, IP blacklist)",
          "Publishers scoring highest threat evaluations",
          "Fraud sieve false-positive diagnostic summaries"
        ]
      },
      {
        id: "admin-domain-ssl",
        name: "Let's Encrypt SSL & Domain Registry",
        description: "Administrative gateway whitelisting and provisioning TLS keys for secure whitelabeled publisher domains.",
        menuItem: "White-Label SSL Domain Control Room",
        widgets: [
          "CNAME Verification Whitelist table",
          "SSL Certificate Expiry Alert feeds widget",
          "Routing redirects volume charts per custom hostname"
        ],
        actions: [
          {
            name: "Verify Domain DNS",
            type: "button",
            description: "Performs CNAME lookup verifying connection states before generating keys.",
            outcome: "Swaps DNS status state to verified if points to platform proxy."
          },
          {
            name: "Trigger ACME SSL Issue",
            type: "workflow",
            description: "Dispatches Let's Encrypt API requests and registers TLS keys to proxy hosts.",
            outcome: "Rebuilds secure ports routing configurations immediately."
          }
        ],
        reports: [
          "Active SSL certificates health checklists",
          "Traffic redirection density per white-label endpoint"
        ]
      },
      {
        id: "admin-rates-fx",
        name: "Global Multi-Currency FX Ledger Engine",
        description: "Financial cockpit locks spot rates, hedges FX deviations, and updates cross-border campaign parameters.",
        menuItem: "Financial Ledger Registry (Invoices / Adjustments / FX)",
        widgets: [
          "System Currency Balance Ledger counts (USD, EUR, GBP, INR, JPY, USDT)",
          "Live Spot Rate delta ticker tables",
          "Lock-in cross-rate buffers matrix form (Default buffer multiplier: 1.25%)"
        ],
        actions: [
          {
            name: "Modify Local Currency Rate",
            type: "form",
            description: "Overrules dynamic spot checks to lock local transaction exchanges.",
            outcome: "Pre-empts currency losses on pending publisher payouts."
          },
          {
            name: "Audit Currency Ledger Reconciliation",
            type: "workflow",
            description: "Validates that all multi-currency transactions match base double-entry math.",
            outcome: "Issues transaction drift indicators card if float mismatches occur."
          }
        ],
        reports: [
          "FX hedge variance index charts",
          "Daily currency delta histories"
        ]
      },
      {
        id: "admin-rbac-tenants",
        name: "Staff Access Governance & Tenant Agency Node",
        description: "Configures staff directories, splits branch operations and delegates strict Role-Based Access controls.",
        menuItem: "Multi-Tenant Agency Staff Hierarchy Settings",
        widgets: [
          "Staff User permissions tables matrix",
          "Division Tenant and Group profiles list",
          "Operator event audit stream feeds widget"
        ],
        actions: [
          {
            name: "Authorize New Operator",
            type: "form",
            description: "Creates secure staff credentials and assigns target resource constraints.",
            outcome: "Initializes staff profiles restrictive query filters."
          },
          {
            name: "Revoke Privileges",
            type: "button",
            description: "Instantly terminates active sessions and blocks back-office access.",
            outcome: "Blocks credentials and clears token caches."
          }
        ],
        reports: [
          "System setting adjustment audit registries",
          "Staff team performance scoreboards"
        ]
      }
    ]
  },
  {
    portalName: "Publisher Portal",
    targetRole: "Publisher (Affiliates, Influencers, Media Buyers, Ad Networks)",
    overview: "Optimized workspace for traffic optimization. Enables partners to browse approved campaigns, build tracking URLs with up to five custom variables, configure postback notifications, and manage balances.",
    menuHierarchy: [
      "Overview Dashboard",
      "Offer Discovery Marketplace",
      "Tracking Link Studio",
      "White-Label Domains Configuration Center",
      "Mobile SDK & App Attribution Hub",
      "Outbound Postbacks Panel",
      "Financial Wallet (Transactions Ledger / Cashouts)",
      "BI Performance Analytics"
    ],
    screens: [
      {
        id: "pub-dashboard",
        name: "Overview Dashboard",
        description: "Sleek and responsive visual hub displaying live analytics, wallet balance figures, and active performance data.",
        menuItem: "Overview Dashboard",
        widgets: [
          "Performance Metric Cards (Clicks, Conversions, CTR, EPC, Earnings)",
          "Consolidated Earnings Area Chart",
          "Dynamic conversion logs list",
          "Quick wallet balance balance widgets"
        ],
        actions: [
          {
            name: "Withdraw Balances",
            type: "button",
            description: "Initiates withdrawal ticket for accumulated platform balances.",
            outcome: "Creates a pending request ledger record and escalates items to admin bookkeepers."
          },
          {
            name: "Period Filter",
            type: "filter",
            description: "Alters active graph scopes between today, yesterday, and year-to-date ranges.",
            outcome: "Re-computes and models metrics instantly across overview displays."
          }
        ],
        reports: [
          "Recent conversion statuses and timestamp logs",
          "Earnings by campaign breakdown",
          "SubID yield rankings"
        ]
      },
      {
        id: "pub-offer-marketplace",
        name: "Offer Discovery Marketplace",
        description: "Open directory highlighting allowed campaigns, payment models, geo profiles, and promotional rules.",
        menuItem: "Offer Discovery Marketplace",
        widgets: [
          "Offer cards grid with custom tags (CPI, Approved, In-Demand)",
          "Target search and filter tools (Categories, Allowed Countries, Payout ranges)",
          "Core offer detail sheet (Landing page previews, banned traffic lists, limits)"
        ],
        actions: [
          {
            name: "Request Offer Whitelist",
            type: "button",
            description: "Submits placement request for campaigns requiring admin validation.",
            outcome: "Appends application tickets to affiliate manager admin queues."
          },
          {
            name: "Generate Base Link",
            type: "button",
            description: "Quick-builds tracking codes for active, public-level offers.",
            outcome: "Displays primary affiliate link with preloaded tracker variables."
          }
        ],
        reports: [
          "Marketplace-wide average offer EPC indexes",
          "Recent promotional additions",
          "My approved offers list"
        ]
      },
      {
        id: "pub-link-studio",
        name: "Tracking Link Customizing Studio",
        description: "Utility page allowing affiliates to build out distinct links by mapping key identifier variables.",
        menuItem: "Tracking Link Studio",
        widgets: [
          "Offer selection form",
          "Variables mapping input (Inputs for sub1, sub2, sub3, sub4, sub5 variables)",
          "Dynamic link preview card (Formats links instantly with user-defined strings)"
        ],
        actions: [
          {
            name: "Copy Formatted URL",
            type: "button",
            description: "Copies finalized affiliate trace links directly to user system key clipboard.",
            outcome: "Places clean ready-to-run marketing links on partner keyrings."
          },
          {
            name: "Generate QR Token",
            type: "button",
            description: "Translates configured tracking strings to standard QR code formats.",
            outcome: "Renders QR code graphics on screen for print or digital deployment."
          }
        ],
        reports: [
          "Link build history checklist",
          "Most used affiliate parameter pairings",
          "QR download volumes tracking summaries"
        ]
      },
      {
        id: "pub-domain-setup",
        name: "Dedicated Custom Domain Configurator",
        description: "Enables affiliates to register and configure their own white-label tracking domains, obtaining SSL certificates automatically.",
        menuItem: "White-Label Domains Configuration Center",
        widgets: [
          "My Configured Custom CNAMES lists",
          "DNS Status indicator and setup guide widgets",
          "SSL handshake validation logs panel"
        ],
        actions: [
          {
            name: "Register Custom Domain",
            type: "form",
            description: "Submits dynamic tracking CNAME details to trigger verification queues.",
            outcome: "Adds CNAME pointer and prompts Let's Encrypt validation requests."
          }
        ],
        reports: [
          "Custom domain routing traffic logs",
          "SSL renew time checklists"
        ]
      },
      {
        id: "pub-mobile-sdk",
        name: "Mobile App Attribution & SDK Integration Center",
        description: "Allows mobile publishers to download SDK bundles, configure in-app conversion mappings, and extract deferred deeplinks parameters.",
        menuItem: "Mobile SDK & App Attribution Hub",
        widgets: [
          "App Key credentials & Download triggers card",
          "In-app attribution goals mappings matrix",
          "Live iOS SKAdNetwork callbacks ledger"
        ],
        actions: [
          {
            name: "Generate SDK Keys",
            type: "button",
            description: "Extracts cryptographic identifiers for target iOS/Android packages.",
            outcome: "Initializes app integration profile records inside servers."
          }
        ],
        reports: [
          "App open install velocities logs",
          "Deferred deep links route engagement charts"
        ]
      },
      {
        id: "pub-postback-config",
        name: "Outbound Postback Configurations",
        description: "Dynamic control panel enabling affiliates to tie custom Server-to-Server callbacks with system conversions.",
        menuItem: "Outbound Postbacks Panel",
        widgets: [
          "Active postback logs table",
          "Configure New Callback form (Variables macro selectors: {click_id}, {payout_amount})",
          "Callback testing suite"
        ],
        actions: [
          {
            name: "Save Outbound Postback",
            type: "button",
            description: "Registers postback settings to active database caches.",
            outcome: "Prepares system servers to execute postback callbacks automatically."
          },
          {
            name: "Test Callback Loopback",
            type: "button",
            description: "Simulates test conversion to inspect publisher connection responses.",
            outcome: "Fires test webhook and outputs HTTP code and payload response panels."
          }
        ],
        reports: [
          "Outbound postbacks execution status reports (Success rate vs Timeouts)",
          "Endpoint connection latency metrics",
          "Error logs list for failed integrations"
        ]
      }
    ]
  },
  {
    portalName: "Advertiser Portal",
    targetRole: "Advertiser (Brands, Merchants, Offer Originators)",
    overview: "Campaign oversight and financial cockpit. Enables merchants to update creative vaults, modify cap schedules, audit conversion logs, fund escrow accounts, and handle disputes.",
    menuHierarchy: [
      "Operations Dashboard",
      "My Campaigns Manager",
      "Creative Upload Vault",
      "Conversion Audit Ledger",
      "Billing & Escrow Payments"
    ],
    screens: [
      {
        id: "adv-dashboard",
        name: "Operations Dashboard",
        description: "Primary brand interface centering active campaigns health and tracking real-time ad spends.",
        menuItem: "Operations Dashboard",
        widgets: [
          "Spend KPI displays (Total Spend, Conversions, Cost-Per-Acquisition, ROI)",
          "Active Campaign budgets depletion indicators",
          "Incoming conversions feed tracker"
        ],
        actions: [
          {
            name: "Pause Active Campaign",
            type: "button",
            description: "Halts all incoming affiliate routing for selected campaign immediately.",
            outcome: "Safely updates edge server status configurations instantly."
          },
          {
            name: "Fund Escrow Balance",
            type: "button",
            description: "Opens payment drawer to upload prepayment tokens.",
            outcome: "Transitions to billing config panels for secure processing."
          }
        ],
        reports: [
          "Spend trends and daily delivery curves",
          "Conversions volume by country profiles",
          "Campaign conversion rates (CR)"
        ]
      },
      {
        id: "adv-campaigns-mngr",
        name: "Campaign Setup & Cap Editor",
        description: "Direct control space enabling advertisers to configure core campaign metrics, whitelists, and traffic ceilings.",
        menuItem: "My Campaigns Manager",
        widgets: [
          "Active campaigns table",
          "Target variables forms (Allowed OS types, country whitelists, landing page URLs)",
          "Real-time cap editor drawer (Adjust payouts limits, daily allocations)"
        ],
        actions: [
          {
            name: "Set Daily CAP Limit",
            type: "form",
            description: "Establishes automated click or budget caps on incoming campaigns.",
            outcome: "Instructs checking routines to halt campaign runs once limits are hit."
          },
          {
            name: "Update Target URL",
            type: "form",
            description: "Edits landing page targets for active campaigns.",
            outcome: "Syncs landing endpoints across global routing caches instantly."
          }
        ],
        reports: [
          "Real-time progress toward daily caps",
          "Target mismatch drop analysis",
          "SubID performance matrices"
        ]
      },
      {
        id: "adv-audit-ledger",
        name: "Conversion Verification & Disputes Audit",
        description: "Auditing control room allowing hand-reconciliation, manual CSV status syncing, and fraud logs inspection.",
        menuItem: "Conversion Audit Ledger",
        widgets: [
          "Conversion logs list (Displays statuses: Approved, Pending Validation, Rejected)",
          "Dynamic CSV batch upload zone",
          "Verification query forms"
        ],
        actions: [
          {
            name: "Dispute Conversion",
            type: "button",
            description: "Flags selected conversion as invalid or suspicious, adjusting associated balances.",
            outcome: "Registers dispute ticket in admin systems and holds payouts parameters pending evaluation."
          },
          {
            name: "Upload Status CSV",
            type: "form",
            description: "Processes structured spreadsheet with updated status values (Approved/Rejected) for bulk reconciliations.",
            outcome: "Batch processes updates, matches historical hashes, and adjusts balances automatically."
          }
        ],
        reports: [
          "Fraud ratio index mapping",
          "Conversion dispute success rates",
          "Discrepancy audit trend reports"
        ]
      }
    ]
  }
];
