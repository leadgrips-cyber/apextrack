export interface FieldDefinition {
  name: string;
  type: string;
  constraints: string;
  description: string;
}

export interface TableBlueprint {
  tableName: string;
  primaryKey: string;
  description: string;
  foreignKeys: string[];
  fields: FieldDefinition[];
  indices: string[];
}

export const APEXTRACK_DATABASE_SCHEMAS: TableBlueprint[] = [
  {
    tableName: "publishers",
    primaryKey: "id (UUID)",
    description: "Holds partner profiles, application status, billing addresses, and assigned dynamic compliance tiers.",
    foreignKeys: [],
    fields: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique surrogate key identifying the publisher." },
      { name: "email", type: "VARCHAR(255)", constraints: "UNIQUE NOT NULL", description: "Primary account login and notification email." },
      { name: "company_name", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Business registration name." },
      { name: "status", type: "VARCHAR(50)", constraints: "DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'))", description: "Active operational state." },
      { name: "score_override", type: "INTEGER", constraints: "DEFAULT 100", description: "Custom compliance rating affecting real-time fraud filter thresholds." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT NOW()", description: "Onboarding submission time." }
    ],
    indices: ["idx_publishers_status", "idx_publishers_email"]
  },
  {
    tableName: "advertisers",
    primaryKey: "id (UUID)",
    description: "Stores merchant profiles, outstanding corporate credit restrictions, and account operational balances.",
    foreignKeys: [],
    fields: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique surrogate identifier for the merchant." },
      { name: "company_name", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Sponsor legal entity name." },
      { name: "status", type: "VARCHAR(50)", constraints: "DEFAULT 'ACTIVE'", description: "Account state ('ACTIVE', 'SUSPENDED', 'UNDER_REVIEW')." },
      { name: "escrow_balance", type: "DECIMAL(18,4)", constraints: "DEFAULT 0.0000", description: "Approved cash deposits currently available for campaigns." },
      { name: "credit_limit", type: "DECIMAL(18,2)", constraints: "DEFAULT 0.00", description: "Administrative overdraft line allowed before auto-pausing traffic." }
    ],
    indices: ["idx_advertisers_status"]
  },
  {
    tableName: "offers",
    primaryKey: "id (BIGINT / SERIAL)",
    description: "Definition registry of campaigns, target destinations, dynamic click cap metrics, and baseline conversion rates.",
    foreignKeys: ["advertiser_id (advertisers.id)"],
    fields: [
      { name: "id", type: "BIGSERIAL", constraints: "PRIMARY KEY", description: "Unique tracking offer ID." },
      { name: "advertiser_id", type: "UUID", constraints: "REFERENCES advertisers(id) ON DELETE RESTRICT", description: "Campaign source business partner." },
      { name: "name", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Public campaign label." },
      { name: "status", type: "VARCHAR(50)", constraints: "DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'EXHAUSTED'))", description: "Active execution phase of this offer." },
      { name: "payout_model", type: "VARCHAR(30)", constraints: "NOT NULL CHECK (payout_model IN ('CPA', 'CPC', 'CPI', 'CPL', 'CPS'))", description: "Accounting method defining conversion trigger goals." },
      { name: "landing_page_url", type: "TEXT", constraints: "NOT NULL", description: "Merchant destination web address parsing {click_id} macros." },
      { name: "fallback_offer_id", type: "BIGINT", constraints: "NULL REFERENCES offers(id)", description: "Self-referencing cascade link if target exhausts budgets." }
    ],
    indices: ["idx_offers_status", "idx_offers_advertiser"]
  },
  {
    tableName: "clicks",
    primaryKey: "click_id (CHAR(32))",
    description: "High-volume click tracking logs. Designed for massive scale with memory lookups and localized shards.",
    foreignKeys: ["offer_id (offers.id)", "publisher_id (publishers.id)"],
    fields: [
      { name: "click_id", type: "CHAR(32)", constraints: "PRIMARY KEY", description: "Generated md5 hash representing unique dynamic click identification code." },
      { name: "offer_id", type: "BIGINT", constraints: "REFERENCES offers(id)", description: "Destination program ID." },
      { name: "publisher_id", type: "UUID", constraints: "REFERENCES publishers(id)", description: "Sourcing partner." },
      { name: "sub1", type: "VARCHAR(255)", constraints: "NULL", description: "Publisher tracking parameter 1 (e.g. adgroup ID)." },
      { name: "sub2", type: "VARCHAR(255)", constraints: "NULL", description: "Publisher tracking parameter 2 (e.g. creative ID)." },
      { name: "ip_address", type: "INET", constraints: "NOT NULL", description: "Consumer connection IP." },
      { name: "country_code", type: "CHAR(2)", constraints: "NOT NULL", description: "ISO 2-letter resolution code matching geotarget filters." },
      { name: "user_agent", type: "TEXT", constraints: "NOT NULL", description: "Raw device application signature header." },
      { name: "is_fraud", type: "BOOLEAN", constraints: "DEFAULT FALSE", description: "Flag designating invalid bot or data-center matches." },
      { name: "created_at", type: "TIMESTAMP", constraints: "NOT NULL DEFAULT NOW()", description: "Exact millisecond click registration time." }
    ],
    indices: ["idx_clicks_offer_pub", "idx_clicks_created_at", "idx_clicks_ip_address"]
  },
  {
    tableName: "conversions",
    primaryKey: "id (UUID)",
    description: "Attributed transaction records mapping consumer goal events directly back to historic click logs.",
    foreignKeys: ["click_id (clicks.click_id)", "offer_id (offers.id)", "publisher_id (publishers.id)"],
    fields: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Surrogate tracking code identifier." },
      { name: "click_id", type: "CHAR(32)", constraints: "UNIQUE REFERENCES clicks(click_id)", description: "Original associated click hash." },
      { name: "offer_id", type: "BIGINT", constraints: "REFERENCES offers(id)", description: "Goal offering campaign." },
      { name: "publisher_id", type: "UUID", constraints: "REFERENCES publishers(id)", description: "Recipient partner ID." },
      { name: "security_token", type: "VARCHAR(128)", constraints: "NOT NULL", description: "MD5/SHA256 handshake hash confirming callback origin." },
      { name: "status", type: "VARCHAR(50)", constraints: "CHECK (status IN ('APPROVED', 'PENDING_QA', 'REJECTED'))", description: "Reconciliation evaluation metric." },
      { name: "sale_amount", type: "DECIMAL(18,4)", constraints: "DEFAULT 0.0000", description: "Conversion value (useful for CPS dynamic billing)." },
      { name: "payout", type: "DECIMAL(18,4)", constraints: "NOT NULL", description: "Fee to allocate to affiliate partner." },
      { name: "cost", type: "DECIMAL(18,4)", constraints: "NOT NULL", description: "Fee to bill to merchant advertiser." },
      { name: "ctct_seconds", type: "INTEGER", constraints: "NOT NULL", description: "Click-To-Conversion duration tracker." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT NOW()", description: "Registration click callback timeframe." }
    ],
    indices: ["idx_conversions_click_id", "idx_conversions_status", "idx_conversions_created_at"]
  },
  {
    tableName: "ledger_transactions",
    primaryKey: "id (UUID)",
    description: "Financial double-entry ledger ensuring math reconciliation and accurate client wallets.",
    foreignKeys: [],
    fields: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique transaction transaction tracing ID." },
      { name: "account_type", type: "VARCHAR(50)", constraints: "CHECK (account_type IN ('PUBLISHER_WALLET', 'ADVERTISER_ESCROW', 'NETWORK_GROSS_ASSET', 'NETWORK_REVENUE'))", description: "Target ledger segment." },
      { name: "account_id", type: "UUID", constraints: "NOT NULL", description: "Relational identifier mapping to publishers.id or advertisers.id." },
      { name: "entry_type", type: "VARCHAR(10)", constraints: "CHECK (entry_type IN ('DEBIT', 'CREDIT'))", description: "Financial adjust code indicating transaction value alignment." },
      { name: "amount", type: "DECIMAL(18,4)", constraints: "NOT NULL", description: "Financial shift value." },
      { name: "reference_id", type: "UUID", constraints: "NULL", description: "References associated objects (e.g. conversions.id, invoices.id)." },
      { name: "description", type: "TEXT", constraints: "NOT NULL", description: "Explanation detail for administrative audits." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT NOW()", description: "Double-entry execution timeframe." }
    ],
    indices: ["idx_ledger_account_lookups", "idx_ledger_reference"]
  },
  {
    tableName: "offer_sync_feeds",
    primaryKey: "id (UUID)",
    description: "Stores remote tracker feed details for programmatically importing campaigns (CPAPI offer ingestion configurations).",
    foreignKeys: ["agency_id (roles_rbac)"],
    fields: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique configuration identifier." },
      { name: "feed_url", type: "TEXT", constraints: "NOT NULL", description: "Remote JSON or XML endpoint of affiliate network targets." },
      { name: "auth_token", type: "VARCHAR(512)", constraints: "NOT NULL", description: "Network headers authentication string." },
      { name: "feed_type", type: "VARCHAR(50)", constraints: "NOT NULL CHECK (feed_type IN ('TRACKIER', 'AFFISE', 'EVERFLOW', 'HASOFFERS'))", description: "Source protocol type identifier." },
      { name: "is_active", type: "BOOLEAN", constraints: "DEFAULT TRUE", description: "Toggles recurring sync work scheduling." },
      { name: "cron_schedule", type: "VARCHAR(50)", constraints: "DEFAULT '0 * * * *'", description: "Hourly standard evaluation cycle values." },
      { name: "margin_multiplier", type: "DECIMAL(5,2)", constraints: "DEFAULT 1.15", description: "Gross profit buffer multiplier appended to ingested conversions costs." },
      { name: "last_run_at", type: "TIMESTAMP", constraints: "NULL", description: "Time of last sync process execution." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT NOW()", description: "Creation date." }
    ],
    indices: ["idx_sync_feeds_active", "idx_sync_feeds_last_run"]
  },
  {
    tableName: "automation_rules",
    primaryKey: "id (UUID)",
    description: "Stores logical rules executed periodically to track affiliate performance metrics and secure ad spend budgets.",
    foreignKeys: [],
    fields: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique rule identifier." },
      { name: "name", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Descriptive target rule label." },
      { name: "target_scope", type: "VARCHAR(50)", constraints: "NOT NULL CHECK (target_scope IN ('GLOBAL', 'OFFER', 'PUBLISHER', 'PLACEMENT'))", description: "Appraisal filter level parameter." },
      { name: "scope_id", type: "UUID", constraints: "NULL", description: "Binds rules logically to specified publisher or campaign IDs." },
      { name: "metric_type", type: "VARCHAR(50)", constraints: "NOT NULL CHECK (metric_type IN ('CR', 'EPC', 'CTR', 'CLICKS_WITHOUT_CONVERSION'))", description: "Variable metrics to audit." },
      { name: "clicks_threshold", type: "INTEGER", constraints: "DEFAULT 100", description: "Minimum sample size before rule actions can fire." },
      { name: "metric_limit", type: "DECIMAL(10,4)", constraints: "NOT NULL", description: "Critical threshold trigger parameter." },
      { name: "trigger_action", type: "VARCHAR(50)", constraints: "NOT NULL CHECK (trigger_action IN ('PAUSE_PUBLISHER', 'PAUSE_OFFER', 'EMAIL_MANAGER', 'REDIRECT_TRAFFIC'))", description: "Resolution action executing on trigger." },
      { name: "fallback_offer_id", type: "BIGINT", constraints: "NULL REFERENCES offers(id)", description: "Target transfer location if REDIRECT_TRAFFIC triggers." },
      { name: "is_active", type: "BOOLEAN", constraints: "DEFAULT TRUE", description: "Toggles live state." }
    ],
    indices: ["idx_automation_rules_scope", "idx_automation_rules_active"]
  },
  {
    tableName: "custom_domains",
    primaryKey: "id (UUID)",
    description: "Tracks custom whitelabeled tracking CNAMES registered by publishers, Let's Encrypt certificates status, and expiry schedules.",
    foreignKeys: ["publisher_id (publishers.id)"],
    fields: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique record identifier." },
      { name: "publisher_id", type: "UUID", constraints: "REFERENCES publishers(id) ON DELETE CASCADE", description: "Owning affiliate partner." },
      { name: "hostname", type: "VARCHAR(255)", constraints: "UNIQUE NOT NULL", description: "Publisher CNAME subdomain (e.g. tracking.affsite.com)." },
      { name: "dns_verified", type: "BOOLEAN", constraints: "DEFAULT FALSE", description: "Checks if DNS successfully registers tracking systems proxy CNAME keys." },
      { name: "ssl_status", type: "VARCHAR(50)", constraints: "DEFAULT 'PENDING' CHECK (ssl_status IN ('PENDING', 'ACTIVE', 'EXPIRED', 'FAILED'))", description: "Crypto status flags." },
      { name: "ssl_issued_at", type: "TIMESTAMP", constraints: "NULL", description: "Start of 90-day Let's Encrypt period." },
      { name: "ssl_expires_at", type: "TIMESTAMP", constraints: "NULL", description: "Expiration calendar timeline index." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT NOW()", description: "Submission date." }
    ],
    indices: ["idx_domains_hostname", "idx_domains_dns_verified", "idx_domains_publisher"]
  },
  {
    tableName: "mobile_app_profiles",
    primaryKey: "id (UUID)",
    description: "Identifies bundle identifiers, App keys and credentials for iOS or Android App Attribution SDK runs.",
    foreignKeys: ["publisher_id (publishers.id)"],
    fields: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique attribution profile identifier." },
      { name: "publisher_id", type: "UUID", constraints: "REFERENCES publishers(id)", description: "Owner of the traffic app channels." },
      { name: "bundle_id", type: "VARCHAR(255)", constraints: "NOT NULL", description: "Mobile package namespace identifier (e.g. com.game.promo)." },
      { name: "platform", type: "VARCHAR(50)", constraints: "NOT NULL CHECK (platform IN ('IOS', 'ANDROID'))", description: "Operating system target models." },
      { name: "sdk_api_key", type: "VARCHAR(128)", constraints: "UNIQUE NOT NULL", description: "Secure credential token compiled inside third-party mobile code." },
      { name: "deferred_deeplink_template", type: "TEXT", constraints: "NULL", description: "Base custom schema structure driving path routing." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT NOW()", description: "Onboarding time." }
    ],
    indices: ["idx_mobile_app_sdk_key", "idx_mobile_app_bundle"]
  },
  {
    tableName: "currency_settlements",
    primaryKey: "id (UUID)",
    description: "Balances multi-currency conversions and FX hedging margin locks to avoid cross-border payouts losses.",
    foreignKeys: ["conversion_id (conversions.id)"],
    fields: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique settlement identifier." },
      { name: "conversion_id", type: "UUID", constraints: "REFERENCES conversions(id) ON DELETE RESTRICT", description: "Origin point." },
      { name: "advertiser_currency", type: "VARCHAR(10)", constraints: "NOT NULL DEFAULT 'USD'", description: "Target debits currency corridor (e.g. EUR)." },
      { name: "publisher_currency", type: "VARCHAR(10)", constraints: "NOT NULL DEFAULT 'USD'", description: "Target payouts currency corridor (e.g. INR)." },
      { name: "spot_exchange_rate", type: "DECIMAL(18,6)", constraints: "NOT NULL", description: "Exact interbank rate checked at transaction timestamp." },
      { name: "hedged_exchange_rate", type: "DECIMAL(18,6)", constraints: "NOT NULL", description: "Applied conversion rate with safety margins locked-in." },
      { name: "system_hedging_margin", type: "DECIMAL(18,4)", constraints: "NOT NULL", description: "Earnings from rate adjustments." }
    ],
    indices: ["idx_currency_settlements_conv"]
  },
  {
    tableName: "agency_permission_roles",
    primaryKey: "id (UUID)",
    description: "Stores multi-tenant system administrators profiles, employee permissions templates and branch profiles.",
    foreignKeys: [],
    fields: [
      { name: "id", type: "UUID", constraints: "PRIMARY KEY DEFAULT gen_random_uuid()", description: "Unique operator identifier." },
      { name: "tenant_agency_id", type: "UUID", constraints: "NOT NULL", description: "Binds accounts to independent parent corporate divisions." },
      { name: "email", type: "VARCHAR(255)", constraints: "UNIQUE NOT NULL", description: "Staff operator login point." },
      { name: "role_category", type: "VARCHAR(100)", constraints: "NOT NULL CHECK (role_category IN ('GLOBAL_ADMIN', 'AFFILIATE_MANAGER', 'ADVERTISER_MANAGER', 'FINANCE_CONTROLLER'))", description: "RBAC authority access permissions card." },
      { name: "allowed_publishers_scope", type: "UUID[]", constraints: "NULL", description: "Limits visible grid dashboards to matching partner arrays." },
      { name: "is_active", type: "BOOLEAN", constraints: "DEFAULT TRUE", description: "Operational status toggling credentials." },
      { name: "created_at", type: "TIMESTAMP", constraints: "DEFAULT NOW()", description: "Creation date." }
    ],
    indices: ["idx_rbac_tenant_agency", "idx_rbac_email"]
  }
];

