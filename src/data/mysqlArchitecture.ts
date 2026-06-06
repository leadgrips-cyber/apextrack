export interface MysqlField {
  name: string;
  type: string;
  nullable: boolean;
  key?: "PRI" | "UNI" | "MUL";
  defaultValue?: string;
  extra?: string;
  description: string;
}

export interface MysqlIndex {
  name: string;
  columns: string[];
  type: "INDEX" | "UNIQUE" | "PRIMARY KEY";
  purpose: string;
}

export interface MysqlForeignKey {
  column: string;
  referenceTable: string;
  referenceColumn: string;
  onDelete: string;
  onUpdate: string;
}

export interface MysqlTable {
  tableName: string;
  module: string;
  description: string;
  fields: MysqlField[];
  indexes: MysqlIndex[];
  foreignKeys: MysqlForeignKey[];
  partitioning?: string;
  scaleNotes: string;
  ddl: string;
}

export const MYSQL_MODULES = [
  "Authentication",
  "Publisher Module",
  "Advertiser Module",
  "Offer Module",
  "Offer Approval",
  "Tracking Module",
  "Conversion Module",
  "Fraud Module",
  "Reporting Module",
  "Billing Module",
  "Support Module",
  "Notifications"
];

export const MYSQL_ARCHITECTURE_SCHEMAS: MysqlTable[] = [
  // 1. AUTHENTICATION MODULE
  {
    tableName: "users",
    module: "Authentication",
    description: "Multi-tenant back-office operators, network administrators, account managers, and customer-facing staff accounts.",
    scaleNotes: "Low write volume, highly cached. Uses standard b-tree index lookup on email for session logins.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Primary login identification code." },
      { name: "email", type: "VARCHAR(191)", nullable: false, key: "UNI", description: "Primary unique email login credential." },
      { name: "password_hash", type: "VARCHAR(255)", nullable: false, description: "Bcrypt hash of the staff user password." },
      { name: "name", type: "VARCHAR(150)", nullable: false, description: "Display name of system staff member." },
      { name: "status", type: "TINYINT", nullable: false, defaultValue: "1", description: "1 = Active, 0 = Suspended, 2 = Pending Verification." },
      { name: "mfa_secret", type: "VARCHAR(128)", nullable: true, description: "Encrypted TOTP secret code for multi-factor logins." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Record onboarding timestamp." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Primary Key indexing." },
      { name: "idx_users_email", columns: ["email"], type: "UNIQUE", purpose: "Uniqueness constraint and rapid login lookup." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`users\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`email\` VARCHAR(191) NOT NULL,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`status\` TINYINT NOT NULL DEFAULT 1,
  \`mfa_secret\` VARCHAR(128) DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_users_email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "roles",
    module: "Authentication",
    description: "Security access definitions mapping back-office accounts to organizational divisions (e.g., Affiliate Manager, Finance Controller).",
    scaleNotes: "Extremely standard configuration dataset. Fully cached in-memory inside Redis layer.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Unique code identifying roles." },
      { name: "role_name", type: "VARCHAR(100)", nullable: false, key: "UNI", description: "Unique name identifier of administrative template role (e.g. GLOBAL_ADMIN)." },
      { name: "description", type: "VARCHAR(255)", nullable: true, description: "Descriptive label of back-office authority scopes." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Primary identifier lookup." },
      { name: "idx_roles_name", columns: ["role_name"], type: "UNIQUE", purpose: "Uniqueness of configured system roles." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`roles\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`role_name\` VARCHAR(100) NOT NULL,
  \`description\` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_roles_name\` (\`role_name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "permissions",
    module: "Authentication",
    description: "Granular access flags binding functional modules (Offers, Financial Ledgers, IP Whitelists) to specific operations.",
    scaleNotes: "Cached as an associative map. Checked during backend middleware processing.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Unique permission identifier." },
      { name: "role_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Binds granular privileges directly to roles indices." },
      { name: "target_module", type: "VARCHAR(50)", nullable: false, description: "Module code matching system features (e.g., offer_edit)." },
      { name: "can_write", type: "TINYINT(1)", nullable: false, defaultValue: "0", description: "Flag unlocking modification APIs (1 = Allowed, 0 = Read Only)." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Primary lookup index." },
      { name: "idx_permissions_role", columns: ["role_id", "target_module"], type: "UNIQUE", purpose: "Prevents duplicate permission binds." }
    ],
    foreignKeys: [
      { column: "role_id", referenceTable: "roles", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`permissions\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`role_id\` INT UNSIGNED NOT NULL,
  \`target_module\` VARCHAR(50) NOT NULL,
  \`can_write\` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_permissions_role\` (\`role_id\`, \`target_module\`),
  CONSTRAINT \`fk_permissions_role\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },

  // 2. PUBLISHER MODULE
  {
    tableName: "publishers",
    module: "Publisher Module",
    description: "Corporate files of affiliate marketing channels, system credentials, tracking links variables, and custom margins.",
    scaleNotes: "Low updates. Slices of publisher structures (IDs, statuses, dynamic scores) are synced to in-memory Redis keys.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "System level unique publisher identifier." },
      { name: "company_name", type: "VARCHAR(200)", nullable: false, description: "Public corporate business name." },
      { name: "email", type: "VARCHAR(191)", nullable: false, key: "UNI", description: "Primary administrator dashboard email." },
      { name: "password_hash", type: "VARCHAR(255)", nullable: false, description: "Secure hash of affiliate credentials." },
      { name: "status", type: "TINYINT", nullable: false, defaultValue: "1", description: "1 = Pending, 2 = Active, 3 = Under Review, 4 = Suspended." },
      { name: "dynamic_tier", type: "TINYINT", nullable: false, defaultValue: "1", description: "Calculated compliance level (e.g., 1 = Standard, 2 = Trusted, 3 = High Risk)." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Affiliate onboarding timestamp." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Direct surrogate identifier access." },
      { name: "idx_publishers_email", columns: ["email"], type: "UNIQUE", purpose: "Enforces unique logins." },
      { name: "idx_publishers_status", columns: ["status"], type: "INDEX", purpose: "Rapid publisher status scans and filtering." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`publishers\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`company_name\` VARCHAR(200) NOT NULL,
  \`email\` VARCHAR(191) NOT NULL,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`status\` TINYINT NOT NULL DEFAULT 1,
  \`dynamic_tier\` TINYINT NOT NULL DEFAULT 1,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_publishers_email\` (\`email\`),
  KEY \`idx_publishers_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "publisher_profiles",
    module: "Publisher Module",
    description: "Detailed operational profile of publishers: traffic focus geo-filters, company size, vertical specialties, and Tax codes.",
    scaleNotes: "Low read/update footprint. Structured as 1:1 metadata storage to minimize table widths on publishers directory queries.",
    fields: [
      { name: "publisher_id", type: "INT UNSIGNED", nullable: false, key: "PRI", description: "Relational identifier matching publishers." },
      { name: "primary_vertical", type: "VARCHAR(100)", nullable: false, description: "Core specialized category (e.g. Finance, Games)." },
      { name: "traffic_channels", type: "TEXT", nullable: true, description: "Promotional channels declared (e.g., Search PPC, Email newsletters, native mobile)." },
      { name: "skype_telegram", type: "VARCHAR(200)", nullable: true, description: "Direct contact handler of publishing team manager." },
      { name: "company_tax_id", type: "VARCHAR(100)", nullable: true, description: "National tax identification code for invoice generation." },
      { name: "payout_currency_code", type: "VARCHAR(3)", nullable: false, defaultValue: "'USD'", description: "Default currency preferred (USD, EUR, USDT-TRC20)." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["publisher_id"], type: "PRIMARY KEY", purpose: "One-to-one identifier matching publisher master records." }
    ],
    foreignKeys: [
      { column: "publisher_id", referenceTable: "publishers", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`publisher_profiles\` (
  \`publisher_id\` INT UNSIGNED NOT NULL,
  \`primary_vertical\` VARCHAR(100) NOT NULL,
  \`traffic_channels\` TEXT DEFAULT NULL,
  \`skype_telegram\` VARCHAR(200) DEFAULT NULL,
  \`company_tax_id\` VARCHAR(100) DEFAULT NULL,
  \`payout_currency_code\` VARCHAR(3) NOT NULL DEFAULT 'USD',
  PRIMARY KEY (\`publisher_id\`),
  CONSTRAINT \`fk_publisher_profiles_pub\` FOREIGN KEY (\`publisher_id\`) REFERENCES \`publishers\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "publisher_documents",
    module: "Publisher Module",
    description: "Legal documentation vault: copies of business registrations, government photo identifications, tax declarations, and W-8BEN vouchers.",
    scaleNotes: "Strict compliance repository. Contains references to secure AWS S3 objects with temporary pre-signed keys.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Unique identifier for uploaded document." },
      { name: "publisher_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Relational bind back to publishers." },
      { name: "document_type", type: "VARCHAR(50)", nullable: false, description: "Voucher category (e.g. TAX_ID, ID_PASSPORT, ADRESS_PROOF)." },
      { name: "secure_file_url", type: "VARCHAR(512)", nullable: false, description: "Secure object store link holding document media files." },
      { name: "review_status", type: "TINYINT", nullable: false, defaultValue: "1", description: "1 = Pending QA, 2 = Approved, 3 = Rejected / Requested Re-upload." },
      { name: "uploaded_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Audit trail timestamp." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Surrogate key structure." },
      { name: "idx_pub_docs_pub", columns: ["publisher_id"], type: "INDEX", purpose: "Lists files for individual clients easily." }
    ],
    foreignKeys: [
      { column: "publisher_id", referenceTable: "publishers", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`publisher_documents\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`publisher_id\` INT UNSIGNED NOT NULL,
  \`document_type\` VARCHAR(50) NOT NULL,
  \`secure_file_url\` VARCHAR(512) NOT NULL,
  \`review_status\` TINYINT NOT NULL DEFAULT 1,
  \`uploaded_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_pub_docs_pub\` (\`publisher_id\`),
  CONSTRAINT \`fk_pub_docs_pub\` FOREIGN KEY (\`publisher_id\`) REFERENCES \`publishers\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "publisher_api_keys",
    module: "Publisher Module",
    description: "Dynamic tracking API scopes, securing integrations mapping offers, statistics pulls, and tracking postback codes.",
    scaleNotes: "Queried on every Back-office API request. Key check uses SHA256 hashed matching to bypass database exposure of keys.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Unique registry system ID." },
      { name: "publisher_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Associated publisher identifier." },
      { name: "api_key_hash", type: "CHAR(64)", nullable: false, key: "UNI", description: "One-way SHA-255 cipher representing API client keys." },
      { name: "is_active", type: "TINYINT(1)", nullable: false, defaultValue: "1", description: "Bypasses key auth without database deletion if set to 0." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Establishment date." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Key index identifier access." },
      { name: "idx_api_keys_hash", columns: ["api_key_hash"], type: "UNIQUE", purpose: "Fastest exact index identification on keys pipeline." }
    ],
    foreignKeys: [
      { column: "publisher_id", referenceTable: "publishers", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`publisher_api_keys\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`publisher_id\` INT UNSIGNED NOT NULL,
  \`api_key_hash\` CHAR(64) NOT NULL,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_api_keys_hash\` (\`api_key_hash\`),
  KEY \`idx_api_keys_pub\` (\`publisher_id\`),
  CONSTRAINT \`fk_api_keys_pub\` FOREIGN KEY (\`publisher_id\`) REFERENCES \`publishers\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },

  // 3. ADVERTISER MODULE
  {
    tableName: "advertisers",
    module: "Advertiser Module",
    description: "Sponsoring merchant profiles tracking dynamic balances, system metrics, credit limits, and custom tracking security profiles.",
    scaleNotes: "Low changes. Balance tracks utilize double-entry transaction ledgers, this table provides structural totals cache.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Direct advertiser unique identification code." },
      { name: "company_name", type: "VARCHAR(200)", nullable: false, description: "Brand / Merchant organization entity name." },
      { name: "email", type: "VARCHAR(191)", nullable: false, key: "UNI", description: "Main administrator login credentials email." },
      { name: "password_hash", type: "VARCHAR(255)", nullable: false, description: "Secure hash of advertiser credentials." },
      { name: "status", type: "TINYINT", nullable: false, defaultValue: "1", description: "1 = Pending Audit, 2 = Active, 3 = Paused (Balance Issues), 4 = Suspended." },
      { name: "credit_limit", type: "DECIMAL(18,4)", nullable: false, defaultValue: "0.0000", description: "Allowed negative operational overdraft budget limit." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Account registration epoch." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Key database index tracker." },
      { name: "idx_advertisers_email", columns: ["email"], type: "UNIQUE", purpose: "Ensures unique logging ids." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`advertisers\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`company_name\` VARCHAR(200) NOT NULL,
  \`email\` VARCHAR(191) NOT NULL,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`status\` TINYINT NOT NULL DEFAULT 1,
  \`credit_limit\` DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_advertisers_email\` (\`email\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "advertiser_profiles",
    module: "Advertiser Module",
    description: "Administrative metadata of advertisers: business registration files, Tax codes, default billing domains, and system managers profiles.",
    scaleNotes: "Low read/update footprint. Structured as 1:1 metadata storage to minimize table widths on general query registers.",
    fields: [
      { name: "advertiser_id", type: "INT UNSIGNED", nullable: false, key: "PRI", description: "Relational identifier matching advertisers." },
      { name: "skype_telegram", type: "VARCHAR(200)", nullable: true, description: "Contact system details of advertiser's key rep." },
      { name: "tax_vatin_id", type: "VARCHAR(100)", nullable: true, description: "National tax identification code for invoice generation." },
      { name: "billing_street", type: "VARCHAR(255)", nullable: true, description: "Registered line of corporate office location." },
      { name: "billing_country", type: "CHAR(2)", nullable: true, description: "ISO 2-letter registration country code." },
      { name: "assigned_manager_id", type: "INT UNSIGNED", nullable: true, key: "MUL", description: "Relational bind to back-office users managing this advertiser." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["advertiser_id"], type: "PRIMARY KEY", purpose: "One-to-one mapping alignment." }
    ],
    foreignKeys: [
      { column: "advertiser_id", referenceTable: "advertisers", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" },
      { column: "assigned_manager_id", referenceTable: "users", referenceColumn: "id", onDelete: "SET NULL", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`advertiser_profiles\` (
  \`advertiser_id\` INT UNSIGNED NOT NULL,
  \`skype_telegram\` VARCHAR(200) DEFAULT NULL,
  \`tax_vatin_id\` VARCHAR(100) DEFAULT NULL,
  \`billing_street\` VARCHAR(255) DEFAULT NULL,
  \`billing_country\` CHAR(2) DEFAULT NULL,
  \`assigned_manager_id\` INT UNSIGNED DEFAULT NULL,
  PRIMARY KEY (\`advertiser_id\`),
  KEY \`idx_adv_prof_manager\` (\`assigned_manager_id\`),
  CONSTRAINT \`fk_adv_profiles_adv\` FOREIGN KEY (\`advertiser_id\`) REFERENCES \`advertisers\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_adv_profiles_mgr\` FOREIGN KEY (\`assigned_manager_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "advertiser_api_keys",
    module: "Advertiser Module",
    description: "API access credentials utilized by merchants to programmatically update campaigns, upload conversions approvals, and extract stats.",
    scaleNotes: "Low transaction overhead. Integrates sha256 encryption matching algorithms on queries.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Unique identifier for API credential." },
      { name: "advertiser_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Associated advertiser profile." },
      { name: "api_key_hash", type: "CHAR(64)", nullable: false, key: "UNI", description: "SHA-256 encrypted string of merchant API key." },
      { name: "is_active", type: "TINYINT(1)", nullable: false, defaultValue: "1", description: "1 = Allowed integration, 0 = Blocked key queries." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Creation date." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Key index tracker." },
      { name: "idx_adv_api_hash", columns: ["api_key_hash"], type: "UNIQUE", purpose: "Fastest key matching during API lookup requests." }
    ],
    foreignKeys: [
      { column: "advertiser_id", referenceTable: "advertisers", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`advertiser_api_keys\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`advertiser_id\` INT UNSIGNED NOT NULL,
  \`api_key_hash\` CHAR(64) NOT NULL,
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_adv_api_hash\` (\`api_key_hash\`),
  KEY \`idx_adv_api_adv\` (\`advertiser_id\`),
  CONSTRAINT \`fk_adv_api_adv\` FOREIGN KEY (\`advertiser_id\`) REFERENCES \`advertisers\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },

  // 4. OFFER MODULE
  {
    tableName: "offers",
    module: "Offer Module",
    description: "Campaign definitions, pricing variables, mapping categories, targeting filters, and default tracking parameters.",
    scaleNotes: "Frequent reads, rare writes. High-concurrency redirection engines cache this entire object structure in Redis.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Campaign offering identifier." },
      { name: "advertiser_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Sponsoring merchant partner." },
      { name: "category_id", type: "INT UNSIGNED", nullable: true, key: "MUL", description: "Offer indexing group classification." },
      { name: "name", type: "VARCHAR(255)", nullable: false, description: "Public campaign label." },
      { name: "payout_model", type: "VARCHAR(20)", nullable: false, description: "CPA (Cost Per Action), CPC (Click), CPI (Install), CPL (Lead), CPS (Sale)." },
      { name: "advertiser_payout", type: "DECIMAL(18,4)", nullable: false, description: "Amount merchant pays us per target conversion." },
      { name: "publisher_payout", type: "DECIMAL(18,4)", nullable: false, description: "Amount paid to publisher on approved conversion." },
      { name: "status", type: "TINYINT", nullable: false, defaultValue: "1", description: "1 = Draft, 2 = Active, 3 = Paused, 4 = Expired." },
      { name: "fallback_offer_id", type: "INT UNSIGNED", nullable: true, key: "MUL", description: "Dynamic transfer campaign if this offer triggers daily caps." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Record creation timestamp." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Highest speed identifier search." },
      { name: "idx_offers_advertiser", columns: ["advertiser_id", "status"], type: "INDEX", purpose: "Fast lists of merchant active campaigns." },
      { name: "idx_offers_category", columns: ["category_id"], type: "INDEX", purpose: "Fills portal category filters quickly." }
    ],
    foreignKeys: [
      { column: "advertiser_id", referenceTable: "advertisers", referenceColumn: "id", onDelete: "RESTRICT", onUpdate: "CASCADE" },
      { column: "fallback_offer_id", referenceTable: "offers", referenceColumn: "id", onDelete: "SET NULL", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`offers\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`advertiser_id\` INT UNSIGNED NOT NULL,
  \`category_id\` INT UNSIGNED DEFAULT NULL,
  \`name\` VARCHAR(255) NOT NULL,
  \`payout_model\` VARCHAR(20) NOT NULL,
  \`advertiser_payout\` DECIMAL(18,4) NOT NULL,
  \`publisher_payout\` DECIMAL(18,4) NOT NULL,
  \`status\` TINYINT NOT NULL DEFAULT 1,
  \`fallback_offer_id\` INT UNSIGNED DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_offers_advertiser\` (\`advertiser_id\`, \`status\`),
  KEY \`idx_offers_category\` (\`category_id\`),
  KEY \`idx_offers_fallback\` (\`fallback_offer_id\`),
  CONSTRAINT \`fk_offers_adv\` FOREIGN KEY (\`advertiser_id\`) REFERENCES \`advertisers\` (\`id\`) ON DELETE RESTRICT,
  CONSTRAINT \`fk_offers_fallback\` FOREIGN KEY (\`fallback_offer_id\`) REFERENCES \`offers\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "offer_categories",
    module: "Offer Module",
    description: "Campaign verticals classification hierarchy used to filter the publisher marketplace catalogs.",
    scaleNotes: "Infinitesimal data table size. Fully cached permanently in cluster memory.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Category identification index." },
      { name: "category_name", type: "VARCHAR(100)", nullable: false, key: "UNI", description: "Public descriptive name (e.g., VPN, Antivirus, Casino)." },
      { name: "slug", type: "VARCHAR(120)", nullable: false, key: "UNI", description: "URL route-friendly string for API requests." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Key database search path." },
      { name: "idx_categories_slug", columns: ["slug"], type: "UNIQUE", purpose: "Enforces neat URL routing uniqueness." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`offer_categories\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`category_name\` VARCHAR(100) NOT NULL,
  \`slug\` VARCHAR(120) NOT NULL,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_categories_name\` (\`category_name\`),
  UNIQUE KEY \`idx_categories_slug\` (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "offer_creatives",
    module: "Offer Module",
    description: "Visual assets, banner image references, advertising copy snippets, and promotional deep-linking setups.",
    scaleNotes: "Low database impact. Stores CDN asset URLs. Utilizes index queries on matching offer IDs.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Creative item unique identifier." },
      { name: "offer_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Relational link tying assets to parent campaign." },
      { name: "creative_name", type: "VARCHAR(150)", nullable: false, description: "Internal descriptive tag for creative item." },
      { name: "type", type: "VARCHAR(30)", nullable: false, description: "Format (e.g. BANNER_IMAGE, ZIP_HTML5, COPY_TEXT)." },
      { name: "asset_url", type: "VARCHAR(512)", nullable: false, description: "Content Delivery Network storage target link." },
      { name: "dimensions", type: "VARCHAR(20)", nullable: true, description: "Standard resolution parameters (e.g. 300x250, 728x90) if banner." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Key index locator." },
      { name: "idx_creatives_offer", columns: ["offer_id"], type: "INDEX", purpose: "Fast fetches on creatives library when offering dashboards load." }
    ],
    foreignKeys: [
      { column: "offer_id", referenceTable: "offers", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`offer_creatives\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`offer_id\` INT UNSIGNED NOT NULL,
  \`creative_name\` VARCHAR(150) NOT NULL,
  \`type\` VARCHAR(30) NOT NULL,
  \`asset_url\` VARCHAR(512) NOT NULL,
  \`dimensions\` VARCHAR(20) DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_creatives_offer\` (\`offer_id\`),
  CONSTRAINT \`fk_creatives_offer\` FOREIGN KEY (\`offer_id\`) REFERENCES \`offers\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "offer_landers",
    module: "Offer Module",
    description: "The targeted merchant transition locations. Enables multiple split-tested endpoints on a unified promotional campaign.",
    scaleNotes: "Directly parsed during sub-10ms redirections. Loaded from memory/Redis structure tags.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Lander destination unique ID." },
      { name: "offer_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Tying link to parent promotional campaign." },
      { name: "name", type: "VARCHAR(150)", nullable: false, description: "Descriptive label (e.g. Free Trial Lander, Discount Promo)." },
      { name: "url", type: "TEXT", nullable: false, description: "Merchant destination web address parsing {click_id}, {pub_id} macros." },
      { name: "weight", type: "TINYINT", nullable: false, defaultValue: "100", description: "Split-testing ratio metric (e.g. 50/50 weighting)." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Key indexing locator." },
      { name: "idx_landers_offer", columns: ["offer_id"], type: "INDEX", purpose: "Extracts landers mapping array for campaign routing splits." }
    ],
    foreignKeys: [
      { column: "offer_id", referenceTable: "offers", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`offer_landers\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`offer_id\` INT UNSIGNED NOT NULL,
  \`name\` VARCHAR(150) NOT NULL,
  \`url\` TEXT NOT NULL,
  \`weight\` TINYINT NOT NULL DEFAULT 100,
  PRIMARY KEY (\`id\`),
  KEY \`idx_landers_offer\` (\`offer_id\`),
  CONSTRAINT \`fk_landers_offer\` FOREIGN KEY (\`offer_id\`) REFERENCES \`offers\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "offer_caps",
    module: "Offer Module",
    description: "SaaS protection caps setting precise volume thresholds (clicks, budget spend, conversion triggers) over designated periods (Daily, Month, Life).",
    scaleNotes: "Updated continuously in memory. Persistent databases match totals periodically. In-memory counters block transitions if triggers trip.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Cap rule unique identification ID." },
      { name: "offer_id", type: "INT UNSIGNED", nullable: false, key: "UNI", description: "Associated campaign. One set of cap rules per offer." },
      { name: "cap_type", type: "TINYINT", nullable: false, description: "1 = Click counts block, 2 = Conversion counts block, 3 = Fiscal Budget limits." },
      { name: "daily_limit", type: "INT UNSIGNED", nullable: true, description: "Count allowed before auto-triggering fallback actions daily." },
      { name: "monthly_limit", type: "INT UNSIGNED", nullable: true, description: "Count allowed before auto-triggering fallback actions monthly." },
      { name: "current_daily_value", type: "INT UNSIGNED", nullable: false, defaultValue: "0", description: "Active today transaction accumulator status." },
      { name: "current_monthly_value", type: "INT UNSIGNED", nullable: false, defaultValue: "0", description: "Active month transaction accumulator status." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Key database index." },
      { name: "idx_caps_offer", columns: ["offer_id"], type: "UNIQUE", purpose: "Guarantees 1:1 binding per offer." }
    ],
    foreignKeys: [
      { column: "offer_id", referenceTable: "offers", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`offer_caps\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`offer_id\` INT UNSIGNED NOT NULL,
  \`cap_type\` TINYINT NOT NULL,
  \`daily_limit\` INT UNSIGNED DEFAULT NULL,
  \`monthly_limit\` INT UNSIGNED DEFAULT NULL,
  \`current_daily_value\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`current_monthly_value\` INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_caps_offer\` (\`offer_id\`),
  CONSTRAINT \`fk_caps_offer\` FOREIGN KEY (\`offer_id\`) REFERENCES \`offers\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },

  // 5. OFFER APPROVAL MODULE
  {
    tableName: "offer_access_requests",
    module: "Offer Approval",
    description: "Publisher requests to promote restricted campaigns. Stores traffic declarations, notes, and approval status queues.",
    scaleNotes: "Low transaction scale. Accessed inside back-office workflows when vetting publisher applications.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Access request identification ID." },
      { name: "offer_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Restricted campaign target identifier." },
      { name: "publisher_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Sourcing affiliate applicant identifier." },
      { name: "traffic_declaration", type: "TEXT", nullable: false, description: "Brief declaration describing how affiliate will promote campaign." },
      { name: "status", type: "TINYINT", nullable: false, defaultValue: "1", description: "1 = Pending Approval, 2 = Approved, 3 = Rejected, 4 = Revoked." },
      { name: "rejection_reason", type: "VARCHAR(255)", nullable: true, description: "Optional explanation detailed by administrator manager." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Application epoch timestamp." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Key index lookup." },
      { name: "idx_access_unique", columns: ["offer_id", "publisher_id"], type: "INDEX", purpose: "Prevents duplicate requests of restricted campaigns." }
    ],
    foreignKeys: [
      { column: "offer_id", referenceTable: "offers", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" },
      { column: "publisher_id", referenceTable: "publishers", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`offer_access_requests\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`offer_id\` INT UNSIGNED NOT NULL,
  \`publisher_id\` INT UNSIGNED NOT NULL,
  \`traffic_declaration\` TEXT NOT NULL,
  \`status\` TINYINT NOT NULL DEFAULT 1,
  \`rejection_reason\` VARCHAR(255) DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_access_unique\` (\`offer_id\`, \`publisher_id\`),
  KEY \`idx_access_pub\` (\`publisher_id\`),
  CONSTRAINT \`fk_access_offer\` FOREIGN KEY (\`offer_id\`) REFERENCES \`offers\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_access_pub\` FOREIGN KEY (\`publisher_id\`) REFERENCES \`publishers\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "offer_assignments",
    module: "Offer Approval",
    description: "Bridges active permissions. Matches publisher/offer allocations, maps dynamic custom payouts/costs margins overrides.",
    scaleNotes: "Queried inside transition pipelines. Highly cached in-memory. Allows setting premium payout levels for trusted publishers.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Active assignment identifier." },
      { name: "offer_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Target campaign." },
      { name: "publisher_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Allocated affiliate." },
      { name: "custom_publisher_payout", type: "DECIMAL(18,4)", nullable: true, description: "Allows custom payout override (standard checks default offer payout if null)." },
      { name: "custom_advertiser_cost", type: "DECIMAL(18,4)", nullable: true, description: "Allows custom billing override (standard checks default advertiser cost if null)." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Active assignment epoch." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Key database indexing." },
      { name: "idx_assignments_unq", columns: ["offer_id", "publisher_id"], type: "INDEX", purpose: "Ensures unique single bridge records mapping." }
    ],
    foreignKeys: [
      { column: "offer_id", referenceTable: "offers", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" },
      { column: "publisher_id", referenceTable: "publishers", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`offer_assignments\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`offer_id\` INT UNSIGNED NOT NULL,
  \`publisher_id\` INT UNSIGNED NOT NULL,
  \`custom_publisher_payout\` DECIMAL(18,4) DEFAULT NULL,
  \`custom_advertiser_cost\` DECIMAL(18,4) DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_assignments_unq\` (\`offer_id\`, \`publisher_id\`),
  KEY \`idx_assignments_pub\` (\`publisher_id\`),
  CONSTRAINT \`fk_assignments_offer\` FOREIGN KEY (\`offer_id\`) REFERENCES \`offers\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_assignments_pub\` FOREIGN KEY (\`publisher_id\`) REFERENCES \`publishers\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },

  // 6. TRACKING MODULE
  {
    tableName: "clicks",
    module: "Tracking Module",
    description: "HIGH CONCURRENCY transaction ledger logs of redirects. Optimized for massive throughput utilizing fast primary structures.",
    scaleNotes: "Optimized for 100M+ Clicks/Month. RANGE partitioned monthly by created_at. Uses compact binary id keys (BINARY(16) hashes representing UUIDv4 or custom structures).",
    partitioning: "PARTITION BY RANGE (TO_DAYS(created_at))",
    fields: [
      { name: "id", type: "BINARY(16)", nullable: false, key: "PRI", description: "Sub-millisecond tracking unique click identifier (UUID binary representation)." },
      { name: "offer_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Target campaign database index." },
      { name: "publisher_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Sourcing affiliate partner." },
      { name: "tracking_link_id", type: "INT UNSIGNED", nullable: false, description: "Generation blueprint reference identifier." },
      { name: "ip_address", type: "VARCHAR(45)", nullable: false, description: "Consumer connection client IPv4/IPv6 address." },
      { name: "country_code", type: "CHAR(2)", nullable: false, description: "ISO 2-letter geographical resolution code (e.g. US, IN, DE)." },
      { name: "is_fraud", type: "TINYINT(1)", nullable: false, defaultValue: "0", description: "Sieve check evaluation (1 = Fraudulent traffic block, 0 = Human/Legitimate pass)." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Dynamic click registration timestamp." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id", "created_at"], type: "PRIMARY KEY", purpose: "Composite Primary key including partitioning column." },
      { name: "idx_clicks_offer_pub", columns: ["offer_id", "publisher_id", "created_at"], type: "INDEX", purpose: "Rapid indices scan during conversion matches." },
      { name: "idx_clicks_date", columns: ["created_at"], type: "INDEX", purpose: "Pruning index for monthly range partitions database optimization." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`clicks\` (
  \`id\` BINARY(16) NOT NULL,
  \`offer_id\` INT UNSIGNED NOT NULL,
  \`publisher_id\` INT UNSIGNED NOT NULL,
  \`tracking_link_id\` INT UNSIGNED NOT NULL,
  \`ip_address\` VARCHAR(45) NOT NULL,
  \`country_code\` CHAR(2) NOT NULL,
  \`is_fraud\` TINYINT(1) NOT NULL DEFAULT 0,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`, \`created_at\`),
  KEY \`idx_clicks_offer_pub\` (\`offer_id\`, \`publisher_id\`, \`created_at\`),
  KEY \`idx_clicks_date\` (\`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (TO_DAYS(created_at)) (
  PARTITION p2026_06 VALUES LESS THAN (TO_DAYS('2026-07-01')),
  PARTITION p2026_07 VALUES LESS THAN (TO_DAYS('2026-08-01')),
  PARTITION p2026_08 VALUES LESS THAN (TO_DAYS('2026-09-01')),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);`
  },
  {
    tableName: "click_logs",
    module: "Tracking Module",
    description: "Heuristic analytics trace metrics details: publisher subIDs, user agents, fallback redirects triggers, and browser languages.",
    scaleNotes: "Optimized for 100M+ Clicks/Month. RANGE partitioned in lockstep with clicks table. Separated from clicks table to prevent broad row-sizes during click insert operations.",
    partitioning: "PARTITION BY RANGE (TO_DAYS(created_at))",
    fields: [
      { name: "click_id", type: "BINARY(16)", nullable: false, key: "PRI", description: "Surrogate key tracking back directly to clicks." },
      { name: "sub1", type: "VARCHAR(255)", nullable: true, description: "Dynamic tracking parameter 1 (e.g., adgroup identifier)." },
      { name: "sub2", type: "VARCHAR(255)", nullable: true, description: "Dynamic tracking parameter 2 (e.g., banner placement)." },
      { name: "sub3", type: "VARCHAR(255)", nullable: true, description: "Dynamic tracking parameter 3 (e.g., source campaign site)." },
      { name: "user_agent", type: "VARCHAR(512)", nullable: false, description: "Raw user agent connection browser header." },
      { name: "referer", type: "VARCHAR(512)", nullable: true, description: "Sourcing HTML dynamic referer." },
      { name: "created_at", type: "DATETIME", nullable: false, description: "Matching click creation timestamp constraint matching partitioning." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["click_id", "created_at"], type: "PRIMARY KEY", purpose: "Tied directly to clicks partitioning range locks." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`click_logs\` (
  \`click_id\` BINARY(16) NOT NULL,
  \`sub1\` VARCHAR(255) DEFAULT NULL,
  \`sub2\` VARCHAR(255) DEFAULT NULL,
  \`sub3\` VARCHAR(255) DEFAULT NULL,
  \`user_agent\` VARCHAR(512) NOT NULL,
  \`referer\` VARCHAR(512) DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL,
  PRIMARY KEY (\`click_id\`, \`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (TO_DAYS(created_at)) (
  PARTITION p2026_06 VALUES LESS THAN (TO_DAYS('2026-07-01')),
  PARTITION p2026_07 VALUES LESS THAN (TO_DAYS('2026-08-01')),
  PARTITION p2026_08 VALUES LESS THAN (TO_DAYS('2026-09-01')),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);`
  },
  {
    tableName: "tracking_links",
    module: "Tracking Module",
    description: "Registered tracking links blueprints routing publishers to explicit split-tested dynamic landing pages and redirects rules.",
    scaleNotes: "Low transaction volatility. Handled during back-office campaigns configurations.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Tracking link system ID." },
      { name: "offer_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Tied target campaign." },
      { name: "publisher_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Tied affiliate owner." },
      { name: "slug", type: "VARCHAR(50)", nullable: false, key: "UNI", description: "Uniquely generated URL token (e.g. tracking.site.com/click/slug)." },
      { name: "custom_payout_override", type: "DECIMAL(18,4)", nullable: true, description: "Custom dynamic payout assigned." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Onboarding tracking link creation date." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Identifier tracking node index." },
      { name: "idx_tracking_slug", columns: ["slug"], type: "UNIQUE", purpose: "Fastest lookup index to resolve landing targets upon redirects handshake." }
    ],
    foreignKeys: [
      { column: "offer_id", referenceTable: "offers", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" },
      { column: "publisher_id", referenceTable: "publishers", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`tracking_links\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`offer_id\` INT UNSIGNED NOT NULL,
  \`publisher_id\` INT UNSIGNED NOT NULL,
  \`slug\` VARCHAR(50) NOT NULL,
  \`custom_payout_override\` DECIMAL(18,4) DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_tracking_slug\` (\`slug\`),
  KEY \`idx_tracking_offer_pub\` (\`offer_id\`, \`publisher_id\`),
  CONSTRAINT \`fk_tracking_offer\` FOREIGN KEY (\`offer_id\`) REFERENCES \`offers\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_tracking_pub\` FOREIGN KEY (\`publisher_id\`) REFERENCES \`publishers\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },

  // 7. CONVERSION MODULE
  {
    tableName: "conversions",
    module: "Conversion Module",
    description: "Attributed conversion goals logged, mapping merchant callback requests directly back to click history records.",
    scaleNotes: "Optimized for rapid validation and duplicate postback suppression. Composite Primary key including partitioning created_at column.",
    partitioning: "PARTITION BY RANGE (TO_DAYS(created_at))",
    fields: [
      { name: "id", type: "BINARY(16)", nullable: false, key: "PRI", description: "Unique conversion tracking confirmation ID." },
      { name: "click_id", type: "BINARY(16)", nullable: false, key: "MUL", description: "Associated historic click identifier logic." },
      { name: "offer_id", type: "INT UNSIGNED", nullable: false, description: "Sponsoring campaign target." },
      { name: "publisher_id", type: "INT UNSIGNED", nullable: false, description: "Earning publisher partner index." },
      { name: "status", type: "TINYINT", nullable: false, defaultValue: "1", description: "1 = Pending QA, 2 = Approved, 3 = Rejected, 4 = Charged back (Refunded)." },
      { name: "payout", type: "DECIMAL(18,4)", nullable: false, description: "Capital allocated to affiliate partner wallet." },
      { name: "revenue", type: "DECIMAL(18,4)", nullable: false, description: "Capital invoiced to merchant advertiser." },
      { name: "transaction_id", type: "VARCHAR(150)", nullable: true, description: "Sponsoring merchant external checkout transaction reference." },
      { name: "click_to_conversion_sec", type: "INT UNSIGNED", nullable: false, description: "Duration trace tracker monitoring click offsets." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Trigger registration date." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id", "created_at"], type: "PRIMARY KEY", purpose: "Composite Primary Index binding partitioned dates." },
      { name: "idx_conversions_click", columns: ["click_id", "created_at"], type: "INDEX", purpose: "Used to prevent double postback conversions submissions instantly." },
      { name: "idx_conversions_pub_offer", columns: ["publisher_id", "offer_id", "status"], type: "INDEX", purpose: "Drives dashboard conversions lists grids." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`conversions\` (
  \`id\` BINARY(16) NOT NULL,
  \`click_id\` BINARY(16) NOT NULL,
  \`offer_id\` INT UNSIGNED NOT NULL,
  \`publisher_id\` INT UNSIGNED NOT NULL,
  \`status\` TINYINT NOT NULL DEFAULT 1,
  \`payout\` DECIMAL(18,4) NOT NULL,
  \`revenue\` DECIMAL(18,4) NOT NULL,
  \`transaction_id\` VARCHAR(150) DEFAULT NULL,
  \`click_to_conversion_sec\` INT UNSIGNED NOT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`, \`created_at\`),
  KEY \`idx_conversions_click\` (\`click_id\`, \`created_at\`),
  KEY \`idx_conversions_pub_offer\` (\`publisher_id\`, \`offer_id\`, \`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (TO_DAYS(created_at)) (
  PARTITION p2026_06 VALUES LESS THAN (TO_DAYS('2026-07-01')),
  PARTITION p2026_07 VALUES LESS THAN (TO_DAYS('2026-08-01')),
  PARTITION p2026_08 VALUES LESS THAN (TO_DAYS('2026-09-01')),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);`
  },
  {
    tableName: "postbacks",
    module: "Conversion Module",
    description: "Publisher client server-to-server tracking APIs configurations. Fired dynamically by system converters upon approved sales.",
    scaleNotes: "Low updates, extremely frequent reads when conversion handlers fetch outbound endpoints definitions.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Outbound postback registration ID." },
      { name: "publisher_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Target partner owning postback trigger definitions." },
      { name: "offer_id", type: "INT UNSIGNED", nullable: true, key: "MUL", description: "Optional restricted mapping (Global tracker if null, Offer-specific if bound)." },
      { name: "url_payload", type: "VARCHAR(1000)", nullable: false, description: "Publisher server endpoint parsing {sub1}, {click_id}, {payout} macro flags." },
      { name: "method", type: "VARCHAR(10)", nullable: false, defaultValue: "'GET'", description: "Trigger method configuration: GET, POST (JSON), POST (Form)." },
      { name: "is_active", type: "TINYINT(1)", nullable: false, defaultValue: "1", description: "Toggles execution rules." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Key index locator." },
      { name: "idx_postbacks_lookup", columns: ["publisher_id", "offer_id"], type: "INDEX", purpose: "Instant loading of postbacks maps upon incoming conversion logs execution." }
    ],
    foreignKeys: [
      { column: "publisher_id", referenceTable: "publishers", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" },
      { column: "offer_id", referenceTable: "offers", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`postbacks\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`publisher_id\` INT UNSIGNED NOT NULL,
  \`offer_id\` INT UNSIGNED DEFAULT NULL,
  \`url_payload\` VARCHAR(1000) NOT NULL,
  \`method\` VARCHAR(10) NOT NULL DEFAULT 'GET',
  \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (\`id\`),
  KEY \`idx_postbacks_lookup\` (\`publisher_id\`, \`offer_id\`),
  CONSTRAINT \`fk_postbacks_pub\` FOREIGN KEY (\`publisher_id\`) REFERENCES \`publishers\` (\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_postbacks_offer\` FOREIGN KEY (\`offer_id\`) REFERENCES \`offers\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "conversion_logs",
    module: "Conversion Module",
    description: "Detailed historic logs capturing outbound postback trigger payloads, response status codes, and latency matrices.",
    scaleNotes: "Optimized for 100M+ Clicks/Month. RANGE partitioned monthly to segment logs storage and prune old items cleanly.",
    partitioning: "PARTITION BY RANGE (TO_DAYS(created_at))",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", description: "System level conversion tracking log ID." },
      { name: "conversion_id", type: "BINARY(16)", nullable: false, description: "Matching conversion entity reference." },
      { name: "postback_id", type: "INT UNSIGNED", nullable: false, description: "Trigger configuration blueprint reference." },
      { name: "url_sent", type: "VARCHAR(2000)", nullable: false, description: "The exact URL triggered with compiled macros values." },
      { name: "request_payload", type: "TEXT", nullable: true, description: "Optional body blocks printed (mainly for POST configurations)." },
      { name: "response_status_code", type: "SMALLINT", nullable: false, description: "HTTP callback status code (e.g. 200 = Success, 503 = Server Timeout)." },
      { name: "response_body", type: "TEXT", nullable: true, description: "First 1000 characters of publisher server callback answer details." },
      { name: "latency_ms", type: "INT UNSIGNED", nullable: false, description: "Response handshaking speed metrics monitoring callback bottlenecks." },
      { name: "created_at", type: "DATETIME", nullable: false, description: "Log emission event date." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id", "created_at"], type: "PRIMARY KEY", purpose: "Composite Primary Key including partitioned date limits." },
      { name: "idx_conv_logs_parent", columns: ["conversion_id", "created_at"], type: "INDEX", purpose: "Traces all callbacks logs belonging to single conversions." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`conversion_logs\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`conversion_id\` BINARY(16) NOT NULL,
  \`postback_id\` INT UNSIGNED NOT NULL,
  \`url_sent\` VARCHAR(2000) NOT NULL,
  \`request_payload\` TEXT DEFAULT NULL,
  \`response_status_code\` SMALLINT NOT NULL,
  \`response_body\` TEXT DEFAULT NULL,
  \`latency_ms\` INT UNSIGNED NOT NULL,
  \`created_at\` DATETIME NOT NULL,
  PRIMARY KEY (\`id\`, \`created_at\`),
  KEY \`idx_conv_logs_parent\` (\`conversion_id\`, \`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (TO_DAYS(created_at)) (
  PARTITION p2026_06 VALUES LESS THAN (TO_DAYS('2026-07-01')),
  PARTITION p2026_07 VALUES LESS THAN (TO_DAYS('2026-08-01')),
  PARTITION p2026_08 VALUES LESS THAN (TO_DAYS('2026-09-01')),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);`
  },

  // 8. FRAUD MODULE
  {
    tableName: "fraud_logs",
    module: "Fraud Module",
    description: "Real-time records detailing flagged invalid or fraudulent tracking events, bot runs, whitelists bypasses, or proxy hits.",
    scaleNotes: "Optimized for rapid write queues. RANGE partitioned monthly by created_at. Handled during high velocity redirections.",
    partitioning: "PARTITION BY RANGE (TO_DAYS(created_at))",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", description: "Unique fraud log item ID." },
      { name: "offer_id", type: "INT UNSIGNED", nullable: false, description: "Target campaign." },
      { name: "publisher_id", type: "INT UNSIGNED", nullable: false, description: "Sourcing partner." },
      { name: "ip_address", type: "VARCHAR(45)", nullable: false, description: "Flagged connection client address." },
      { name: "fraud_mechanism", type: "VARCHAR(50)", nullable: false, description: "Rule triggered (e.g., BOT_AGENT, VPN_PROXY, FAST_CONVERSION, GEOLOCATION_MISMATCH)." },
      { name: "threat_score", type: "TINYINT UNSIGNED", nullable: false, description: "Calculated alarm weight (0 to 100 risk values)." },
      { name: "details_json", type: "TEXT", nullable: true, description: "Raw environmental payload parameters logging diagnostic features." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Flagged event timestamp." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id", "created_at"], type: "PRIMARY KEY", purpose: "Key index matching partitioning parameters." },
      { name: "idx_fraud_pub_mech", columns: ["publisher_id", "fraud_mechanism", "created_at"], type: "INDEX", purpose: "Traces block profiles and flags high risk affiliates." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`fraud_logs\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`offer_id\` INT UNSIGNED NOT NULL,
  \`publisher_id\` INT UNSIGNED NOT NULL,
  \`ip_address\` VARCHAR(45) NOT NULL,
  \`fraud_mechanism\` VARCHAR(50) NOT NULL,
  \`threat_score\` TINYINT UNSIGNED NOT NULL,
  \`details_json\` TEXT DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`, \`created_at\`),
  KEY \`idx_fraud_pub_mech\` (\`publisher_id\`, \`fraud_mechanism\`, \`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (TO_DAYS(created_at)) (
  PARTITION p2026_06 VALUES LESS THAN (TO_DAYS('2026-07-01')),
  PARTITION p2026_07 VALUES LESS THAN (TO_DAYS('2026-08-01')),
  PARTITION p2026_08 VALUES LESS THAN (TO_DAYS('2026-09-01')),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);`
  },
  {
    tableName: "device_fingerprints",
    module: "Fraud Module",
    description: "Calculated heuristics maps identifying unique client computer devices layout without browser cookies dependencies.",
    scaleNotes: "Extremely high query velocity. Used to bypass standard browser deletion limits. Looked up during conversion validation routes.",
    fields: [
      { name: "id", type: "BINARY(16)", nullable: false, key: "PRI", description: "MD5 hash tracking combined hashes of device profiles features." },
      { name: "canvas_hash", type: "VARCHAR(64)", nullable: true, description: "Unique browser canvas layout indicator." },
      { name: "screen_config", type: "VARCHAR(50)", nullable: false, description: "Screen scale constraints." },
      { name: "language_headers", type: "VARCHAR(150)", nullable: false, description: "Browser active operating parameters profiles." },
      { name: "last_seen_ip", type: "VARCHAR(45)", nullable: false, description: "Metadata mapping client network nodes history." },
      { name: "updated_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP", description: "Last seen timeline." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Direct surrogate key accessing device footprints." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`device_fingerprints\` (
  \`id\` BINARY(16) NOT NULL,
  \`canvas_hash\` VARCHAR(64) DEFAULT NULL,
  \`screen_config\` VARCHAR(50) NOT NULL,
  \`language_headers\` VARCHAR(150) NOT NULL,
  \`last_seen_ip\` VARCHAR(45) NOT NULL,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "ip_reputation",
    module: "Fraud Module",
    description: "Aggregated security tables mapping bad VPNs, data center bots ranges, and malware infected network targets.",
    scaleNotes: "High concurrency queries. Synchronized to local lookup lists in server memory. Query speeds under 1ms.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "IP reputation block configuration index." },
      { name: "ip_network", type: "VARCHAR(45)", nullable: false, key: "UNI", description: "CIDR subnet target definitions (e.g. 192.168.1.0/24)." },
      { name: "is_datacenter_proxy", type: "TINYINT(1)", nullable: false, defaultValue: "1", description: "Identifies automated systems (e.g., AWS hosts)." },
      { name: "asn_code", type: "INT UNSIGNED", nullable: true, description: "Autonomous System Number." },
      { name: "threat_score_default", type: "TINYINT UNSIGNED", nullable: false, defaultValue: "70", description: "Default weight (0 to 100 values)." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Key index search locator." },
      { name: "idx_network_range", columns: ["ip_network"], type: "UNIQUE", purpose: "Helps query subnet bounds using network lookup algorithms." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`ip_reputation\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`ip_network\` VARCHAR(45) NOT NULL,
  \`is_datacenter_proxy\` TINYINT(1) NOT NULL DEFAULT 1,
  \`asn_code\` INT UNSIGNED DEFAULT NULL,
  \`threat_score_default\` TINYINT UNSIGNED NOT NULL DEFAULT 70,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_network_range\` (\`ip_network\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },

  // 9. REPORTING MODULE
  {
    tableName: "report_cache",
    module: "Reporting Module",
    description: "SaaS BI dashboards queries cache. Saves expensive aggregations mapping custom timeframes, subIDs breakdowns, and margin models.",
    scaleNotes: "Highly scalable cache repository. Prevents recalculating historical charts. Cleared if older conversions receive updates.",
    fields: [
      { name: "cache_key", type: "VARCHAR(64)", nullable: false, key: "PRI", description: "Unique signature calculated matching query arguments parameters." },
      { name: "payload_data", type: "MEDIUMTEXT", nullable: false, description: "Pre-compiled JSON arrays driving interactive charts." },
      { name: "expires_at", type: "DATETIME", nullable: false, description: "Validation limit time (e.g., hourly updates limits)." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["cache_key"], type: "PRIMARY KEY", purpose: "Fastest exact index identification during query intercepts." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`report_cache\` (
  \`cache_key\` VARCHAR(64) NOT NULL,
  \`payload_data\` MEDIUMTEXT NOT NULL,
  \`expires_at\` DATETIME NOT NULL,
  PRIMARY KEY (\`cache_key\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "daily_stats",
    module: "Reporting Module",
    description: "Pre-compiled daily activity totals tracking publisher performance counters: impressions, clicks, approvals, budgets, margins.",
    scaleNotes: "Extremely read intensive. Pre-calculated incrementally by batch schedulers. Drastically minimizes analytical queries lookup overheads.",
    fields: [
      { name: "stat_date", type: "DATE", nullable: false, key: "PRI", description: "Specific compilation date scale boundary." },
      { name: "offer_id", type: "INT UNSIGNED", nullable: false, key: "PRI", description: "Associated campaign database index." },
      { name: "publisher_id", type: "INT UNSIGNED", nullable: false, key: "PRI", description: "Earning partner identifier." },
      { name: "clicks_count", type: "INT UNSIGNED", nullable: false, defaultValue: "0", description: "Accumulated daily click volume." },
      { name: "conversions_count", type: "INT UNSIGNED", nullable: false, defaultValue: "0", description: "Accumulated daily approved conversion event actions." },
      { name: "revenue_accrued", type: "DECIMAL(18,4)", nullable: false, defaultValue: "0.0000", description: "Merchant budget cost accumulated." },
      { name: "payout_accrued", type: "DECIMAL(18,4)", nullable: false, defaultValue: "0.0000", description: "Publisher payout commission accumulated." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["stat_date", "offer_id", "publisher_id"], type: "PRIMARY KEY", purpose: "Composite Primary alignment for exact matching scans." },
      { name: "idx_daily_pub_date", columns: ["publisher_id", "stat_date"], type: "INDEX", purpose: "Fastest analytics retrieval inside publisher workspaces dashboards." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`daily_stats\` (
  \`stat_date\` DATE NOT NULL,
  \`offer_id\` INT UNSIGNED NOT NULL,
  \`publisher_id\` INT UNSIGNED NOT NULL,
  \`clicks_count\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`conversions_count\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`revenue_accrued\` DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  \`payout_accrued\` DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  PRIMARY KEY (\`stat_date\`, \`offer_id\`, \`publisher_id\`),
  KEY \`idx_daily_pub_date\` (\`publisher_id\`, \`stat_date\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "hourly_stats",
    module: "Reporting Module",
    description: "Pre-compiled hourly performance registers. Bridges realtime trend indicators feeds inside back-office platforms.",
    scaleNotes: "RANGE Partitioned weekly in high volume tracking networks to enable fast index processing and automatic historical data truncation.",
    partitioning: "PARTITION BY RANGE (YEARWEEK(stat_date_hour))",
    fields: [
      { name: "stat_date_hour", type: "DATETIME", nullable: false, key: "PRI", description: "Specific matching hour (e.g. 2026-06-06 11:00:00)." },
      { name: "offer_id", type: "INT UNSIGNED", nullable: false, key: "PRI", description: "Target campaign." },
      { name: "publisher_id", type: "INT UNSIGNED", nullable: false, key: "PRI", description: "Earning partner." },
      { name: "clicks_count", type: "INT UNSIGNED", nullable: false, defaultValue: "0", description: "Hourly clicks count." },
      { name: "conversions_count", type: "INT UNSIGNED", nullable: false, defaultValue: "0", description: "Hourly approved conversions count." },
      { name: "payout_accrued", type: "DECIMAL(18,4)", nullable: false, defaultValue: "0.0000", description: "Hourly cost allocations." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["stat_date_hour", "offer_id", "publisher_id"], type: "PRIMARY KEY", purpose: "Composite Primary Key alignment." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`hourly_stats\` (
  \`stat_date_hour\` DATETIME NOT NULL,
  \`offer_id\` INT UNSIGNED NOT NULL,
  \`publisher_id\` INT UNSIGNED NOT NULL,
  \`clicks_count\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`conversions_count\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`payout_accrued\` DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  PRIMARY KEY (\`stat_date_hour\`, \`offer_id\`, \`publisher_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (YEARWEEK(stat_date_hour)) (
  PARTITION p2026_w22 VALUES LESS THAN (202623),
  PARTITION p2026_w23 VALUES LESS THAN (202624),
  PARTITION p2026_w24 VALUES LESS THAN (202625),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);`
  },

  // 10. BILLING MODULE
  {
    tableName: "wallets",
    module: "Billing Module",
    description: "Account parameters caching live fiscal assets: approved credits, escrow reserves, floating payouts and unpaid balances.",
    scaleNotes: "Low database concurrency. Values are verified using double-entry transactions reconciliation.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Unique wallet registry ID." },
      { name: "owner_type", type: "TINYINT", nullable: false, description: "1 = Publisher wallet, 2 = Advertiser prepayment escrow." },
      { name: "owner_id", type: "INT UNSIGNED", nullable: false, key: "UNI", description: "Relational mapping matching publisher or advertiser primary keys." },
      { name: "available_balance", type: "DECIMAL(18,4)", nullable: false, defaultValue: "0.0000", description: "Approved withdrawable/usable capital status." },
      { name: "pending_clearance", type: "DECIMAL(18,4)", nullable: false, defaultValue: "0.0000", description: "Conversions payouts currently held in verification QA cycles." },
      { name: "currency_code", type: "VARCHAR(3)", nullable: false, defaultValue: "'USD'", description: "Primary currency code parameter." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Surrogate PK index track." },
      { name: "idx_wallet_owner", columns: ["owner_type", "owner_id"], type: "UNIQUE", purpose: "Fastest single alignment of wallets profiles allocations." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`wallets\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`owner_type\` TINYINT NOT NULL,
  \`owner_id\` INT UNSIGNED NOT NULL,
  \`available_balance\` DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  \`pending_clearance\` DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  \`currency_code\` VARCHAR(3) NOT NULL DEFAULT 'USD',
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_wallet_owner\` (\`owner_type\`, \`owner_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "transactions",
    module: "Billing Module",
    description: "Un-alterable double-entry bookkeeping ledgers database. Tracks all balances shifts: escrow loading, payout payouts, and conversion accrual overrides.",
    scaleNotes: "Extremely critical validation trace. Balanced and locked. Uses auto-generated UUIDv4 strings for absolute indexing safety.",
    fields: [
      { name: "id", type: "BINARY(16)", nullable: false, key: "PRI", description: "Double-entry unique ledger transaction index." },
      { name: "wallet_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Target wallet receiving adjustments." },
      { name: "type", type: "TINYINT", nullable: false, description: "1 = Conversion credit, 2 = Prepayment load, 3 = Payout cashout, 4 = Tax/Operational debit." },
      { name: "entry_type", type: "VARCHAR(10)", nullable: false, description: "DEBIT (subtraction), CREDIT (addition)." },
      { name: "amount", type: "DECIMAL(18,4)", nullable: false, description: "Transaction value shift scale." },
      { name: "reference_type", type: "VARCHAR(50)", nullable: true, description: "Identifies source module triggers (e.g. CONVERSION_ID, INVOICE_ID, MANUAL)." },
      { name: "reference_id", type: "VARCHAR(64)", nullable: true, description: "Specific target index of matching triggers." },
      { name: "description", type: "VARCHAR(255)", nullable: false, description: "Administrative explanation details track." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Double-entry operational timestamp." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Absolute identifier indexing." },
      { name: "idx_transactions_wallet", columns: ["wallet_id", "created_at"], type: "INDEX", purpose: "Fastest audit loading when extracting wallet transaction histories profiles." }
    ],
    foreignKeys: [
      { column: "wallet_id", referenceTable: "wallets", referenceColumn: "id", onDelete: "RESTRICT", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`transactions\` (
  \`id\` BINARY(16) NOT NULL,
  \`wallet_id\` INT UNSIGNED NOT NULL,
  \`type\` TINYINT NOT NULL,
  \`entry_type\` VARCHAR(10) NOT NULL,
  \`amount\` DECIMAL(18,4) NOT NULL,
  \`reference_type\` VARCHAR(50) DEFAULT NULL,
  \`reference_id\` VARCHAR(64) DEFAULT NULL,
  \`description\` VARCHAR(255) NOT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_transactions_wallet\` (\`wallet_id\`, \`created_at\`),
  CONSTRAINT \`fk_transactions_wallet\` FOREIGN KEY (\`wallet_id\`) REFERENCES \`wallets\` (\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "invoices",
    module: "Billing Module",
    description: "Official tax bills and operational invoices raised against advertisers for monthly campaigns costs.",
    scaleNotes: "Low bulk traffic overhead. Audited during finance cycles.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Invoice identification index." },
      { name: "advertiser_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Tied sponsor billing profile." },
      { name: "invoice_number", type: "VARCHAR(50)", nullable: false, key: "UNI", description: "Official accounting unique code (e.g. INV-2026-06-003)." },
      { name: "total_amount", type: "DECIMAL(18,4)", nullable: false, description: "Aggregate bill amount due." },
      { name: "status", type: "TINYINT", nullable: false, defaultValue: "1", description: "1 = Draft, 2 = Sent, 3 = Paid, 4 = Overdue, 5 = Written off." },
      { name: "due_date", type: "DATE", nullable: false, description: "Finance lock-in date constraints." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Invoice generation date." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Key index locator." },
      { name: "idx_invoices_num", columns: ["invoice_number"], type: "UNIQUE", purpose: "Tax auditing verification index." }
    ],
    foreignKeys: [
      { column: "advertiser_id", referenceTable: "advertisers", referenceColumn: "id", onDelete: "RESTRICT", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`invoices\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`advertiser_id\` INT UNSIGNED NOT NULL,
  \`invoice_number\` VARCHAR(50) NOT NULL,
  \`total_amount\` DECIMAL(18,4) NOT NULL,
  \`status\` TINYINT NOT NULL DEFAULT 1,
  \`due_date\` DATE NOT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`idx_invoices_num\` (\`invoice_number\`),
  KEY \`idx_invoices_adv\` (\`advertiser_id\`),
  CONSTRAINT \`fk_invoices_adv\` FOREIGN KEY (\`advertiser_id\`) REFERENCES \`advertisers\` (\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "payouts",
    module: "Billing Module",
    description: "Scheduled cashout actions detailing payments sent to affiliate partners, fee conversions, and wire instructions.",
    scaleNotes: "Low databases concurrency. Critical payout ledger audits trace files.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Payout cashout confirmation ID." },
      { name: "publisher_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Recipient partner." },
      { name: "amount", type: "DECIMAL(18,4)", nullable: false, description: "Fiscal cash processed." },
      { name: "payment_channel", type: "VARCHAR(50)", nullable: false, description: "Gateway matching targets (e.g. PayPal, WIRE_TRANSFER, USDT_TRC20)." },
      { name: "transfer_reference", type: "VARCHAR(255)", nullable: true, description: "Bank confirmation hash or blockchain transaction hash." },
      { name: "status", type: "TINYINT", nullable: false, defaultValue: "1", description: "1 = Pending processing, 2 = Processing locks, 3 = Transferred, 4 = Cancelled." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Initiation date." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Key index lookup." },
      { name: "idx_payouts_pub", columns: ["publisher_id", "status"], type: "INDEX", purpose: "Publisher payment histories dashboard loader." }
    ],
    foreignKeys: [
      { column: "publisher_id", referenceTable: "publishers", referenceColumn: "id", onDelete: "RESTRICT", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`payouts\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`publisher_id\` INT UNSIGNED NOT NULL,
  \`amount\` DECIMAL(18,4) NOT NULL,
  \`payment_channel\` VARCHAR(50) NOT NULL,
  \`transfer_reference\` VARCHAR(255) DEFAULT NULL,
  \`status\` TINYINT NOT NULL DEFAULT 1,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_payouts_pub\` (\`publisher_id\`, \`status\`),
  CONSTRAINT \`fk_payouts_pub\` FOREIGN KEY (\`publisher_id\`) REFERENCES \`publishers\` (\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },

  // 11. SUPPORT MODULE
  {
    tableName: "tickets",
    module: "Support Module",
    description: "Back-office ticketing registers tracking disputes, approvals queues allocations, integration questions, and tech questions.",
    scaleNotes: "Low transaction weight. Accessed by administrative customer satisfaction operators.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Support ticket index." },
      { name: "requester_type", type: "TINYINT", nullable: false, description: "1 = Publisher submitted, 2 = Advertiser submitted." },
      { name: "requester_id", type: "INT UNSIGNED", nullable: false, description: "Relational identifier matching matching partner primary key." },
      { name: "subject", type: "VARCHAR(150)", nullable: false, description: "Short descriptive problem summary details." },
      { name: "priority", type: "TINYINT", nullable: false, defaultValue: "1", description: "1 = Low, 2 = Medium, 3 = Critical." },
      { name: "status", type: "TINYINT", nullable: false, defaultValue: "1", description: "1 = Open, 2 = Staff Answered, 3 = Client Replied, 4 = Closed." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Opening timestamp." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Key index locator." },
      { name: "idx_tickets_lookup", columns: ["requester_type", "requester_id", "status"], type: "INDEX", purpose: "Dashboard support tables catalog queries solver." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`tickets\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`requester_type\` TINYINT NOT NULL,
  \`requester_id\` INT UNSIGNED NOT NULL,
  \`subject\` VARCHAR(150) NOT NULL,
  \`priority\` TINYINT NOT NULL DEFAULT 1,
  \`status\` TINYINT NOT NULL DEFAULT 1,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_tickets_lookup\` (\`requester_type\`, \`requester_id\`, \`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },
  {
    tableName: "ticket_messages",
    module: "Support Module",
    description: "Detailed message threads of support tickets. Stores rich-text markdown details of communications.",
    scaleNotes: "Low throughput. Highly cached in active threads configurations.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Ticketing dialogue item unique ID." },
      { name: "ticket_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "Parent support ticket bind." },
      { name: "sender_type", type: "TINYINT", nullable: false, description: "1 = Client, 2 = Support Staff admin." },
      { name: "sender_id", type: "INT UNSIGNED", nullable: false, description: "Relational user identifier." },
      { name: "message_body", type: "TEXT", nullable: false, description: "Detailed markdown copy of client/staff dialog." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Posting time." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Dialogue segment search locator." },
      { name: "idx_ticket_msg_parent", columns: ["ticket_id", "created_at"], type: "INDEX", purpose: "Chronologically lists discussion boards components." }
    ],
    foreignKeys: [
      { column: "ticket_id", referenceTable: "tickets", referenceColumn: "id", onDelete: "CASCADE", onUpdate: "CASCADE" }
    ],
    ddl: `CREATE TABLE \`ticket_messages\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`ticket_id\` INT UNSIGNED NOT NULL,
  \`sender_type\` TINYINT NOT NULL,
  \`sender_id\` INT UNSIGNED NOT NULL,
  \`message_body\` TEXT NOT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_ticket_msg_parent\` (\`ticket_id\`, \`created_at\`),
  CONSTRAINT \`fk_ticket_msg_parent\` FOREIGN KEY (\`ticket_id\`) REFERENCES \`tickets\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  },

  // 12. NOTIFICATIONS MODULE
  {
    tableName: "notifications",
    module: "Notifications",
    description: "SaaS automatic broadcasts: critical alerts, automated rules fires, budgets cap limits tripped, billing reconciliations, and ticket reminders.",
    scaleNotes: "Medium scale. Uses read/unread flags partitions to allow archiving historical notices.",
    fields: [
      { name: "id", type: "INT UNSIGNED", nullable: false, key: "PRI", extra: "AUTO_INCREMENT", description: "Broadcast notification item." },
      { name: "target_user_type", type: "TINYINT", nullable: false, description: "1 = Support Admin staff, 2 = Publisher partner, 3 = Advertiser merchant." },
      { name: "target_user_id", type: "INT UNSIGNED", nullable: false, key: "MUL", description: "The receiving client ID index." },
      { name: "alert_level", type: "VARCHAR(20)", nullable: false, description: "INFO, WARNING (e.g. Budget Cap 80%), CRITICAL (Auto-Paused Rule)." },
      { name: "message", type: "VARCHAR(512)", nullable: false, description: "Standard descriptive notification body copy." },
      { name: "is_read", type: "TINYINT(1)", nullable: false, defaultValue: "0", description: "Read status flag (1 = Acknowledged, 0 = Unread notice alert)." },
      { name: "created_at", type: "DATETIME", nullable: false, defaultValue: "CURRENT_TIMESTAMP", description: "Trigger date." }
    ],
    indexes: [
      { name: "PRIMARY", columns: ["id"], type: "PRIMARY KEY", purpose: "Notification trace index key." },
      { name: "idx_notifications_user_read", columns: ["target_user_type", "target_user_id", "is_read"], type: "INDEX", purpose: "Fast pulls of outstanding logs to render notification badges." }
    ],
    foreignKeys: [],
    ddl: `CREATE TABLE \`notifications\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT,
  \`target_user_type\` TINYINT NOT NULL,
  \`target_user_id\` INT UNSIGNED NOT NULL,
  \`alert_level\` VARCHAR(20) NOT NULL,
  \`message\` VARCHAR(512) NOT NULL,
  \`is_read\` TINYINT(1) NOT NULL DEFAULT 0,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_notifications_user_read\` (\`target_user_type\`, \`target_user_id\`, \`is_read\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  }
];
