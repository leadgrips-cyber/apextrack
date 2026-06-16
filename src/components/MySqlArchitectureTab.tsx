import { useState, useMemo } from "react";
import {
  Database,
  Key,
  Layers,
  Activity,
  HardDrive,
  Lightbulb,
  Workflow,
  Clipboard,
  Check,
  ShieldAlert,
  Sliders,
  TrendingUp,
  FileCode,
  Zap,
  Boxes,
  HelpCircle
} from "lucide-react";
import { MYSQL_ARCHITECTURE_SCHEMAS, MYSQL_MODULES, MysqlTable } from "../data/mysqlArchitecture";

// Position coordinates for the ER Diagram Nodes (x, y coordinates inside a 1000x800 SVG map)
const ER_COORDINATES: Record<string, { x: number; y: number; label: string; module: string }> = {
  users: { x: 100, y: 70, label: "users", module: "Authentication" },
  roles: { x: 75, y: 170, label: "roles", module: "Authentication" },
  permissions: { x: 150, y: 170, label: "permissions", module: "Authentication" },

  publishers: { x: 340, y: 70, label: "publishers", module: "Publisher Module" },
  publisher_profiles: { x: 230, y: 170, label: "publisher_profiles", module: "Publisher Module" },
  publisher_documents: { x: 340, y: 170, label: "publisher_documents", module: "Publisher Module" },
  publisher_api_keys: { x: 450, y: 170, label: "publisher_api_keys", module: "Publisher Module" },

  advertisers: { x: 670, y: 70, label: "advertisers", module: "Advertiser Module" },
  advertiser_profiles: { x: 580, y: 170, label: "advertiser_profiles", module: "Advertiser Module" },
  advertiser_api_keys: { x: 760, y: 170, label: "advertiser_api_keys", module: "Advertiser Module" },

  offers: { x: 500, y: 290, label: "offers", module: "Offer Module" },
  offer_categories: { x: 350, y: 290, label: "offer_categories", module: "Offer Module" },
  offer_caps: { x: 500, y: 390, label: "offer_caps", module: "Offer Module" },
  offer_landers: { x: 620, y: 390, label: "offer_landers", module: "Offer Module" },
  offer_creatives: { x: 380, y: 390, label: "offer_creatives", module: "Offer Module" },

  offer_access_requests: { x: 200, y: 290, label: "offer_access_requests", module: "Offer Approval" },
  offer_assignments: { x: 200, y: 390, label: "offer_assignments", module: "Offer Approval" },

  clicks: { x: 500, y: 500, label: "clicks", module: "Tracking Module" },
  click_logs: { x: 350, y: 500, label: "click_logs", module: "Tracking Module" },
  tracking_links: { x: 200, y: 500, label: "tracking_links", module: "Tracking Module" },

  conversions: { x: 670, y: 500, label: "conversions", module: "Conversion Module" },
  postbacks: { x: 780, y: 500, label: "postbacks", module: "Conversion Module" },
  conversion_logs: { x: 670, y: 600, label: "conversion_logs", module: "Conversion Module" },

  fraud_logs: { x: 350, y: 600, label: "fraud_logs", module: "Fraud Module" },
  device_fingerprints: { x: 200, y: 600, label: "device_fingerprints", module: "Fraud Module" },
  ip_reputation: { x: 200, y: 690, label: "ip_reputation", module: "Fraud Module" },

  wallets: { x: 500, y: 600, label: "wallets", module: "Billing Module" },
  transactions: { x: 500, y: 690, label: "transactions", module: "Billing Module" },
  invoices: { x: 620, y: 690, label: "invoices", module: "Billing Module" },
  payouts: { x: 380, y: 690, label: "payouts", module: "Billing Module" },

  daily_stats: { x: 890, y: 500, label: "daily_stats", module: "Reporting Module" },
  hourly_stats: { x: 890, y: 600, label: "hourly_stats", module: "Reporting Module" },
  report_cache: { x: 890, y: 390, label: "report_cache", module: "Reporting Module" },

  tickets: { x: 860, y: 70, label: "tickets", module: "Support Module" },
  ticket_messages: { x: 860, y: 170, label: "ticket_messages", module: "Support Module" },

  notifications: { x: 890, y: 690, label: "notifications", module: "Notifications" }
};

// Relation connections mapping lines between nodes to draw in ER diagram (source -> target)
const ER_RELATIONS = [
  // Auth relations
  { from: "roles", to: "permissions", label: "role_id" },
  { from: "users", to: "permissions", label: "implied_link", style: "dashed" },

  // Publisher relations
  { from: "publishers", to: "publisher_profiles", label: "publisher_id" },
  { from: "publishers", to: "publisher_documents", label: "publisher_id" },
  { from: "publishers", to: "publisher_api_keys", label: "publisher_id" },

  // Advertiser relations
  { from: "advertisers", to: "advertiser_profiles", label: "advertiser_id" },
  { from: "advertisers", to: "advertiser_api_keys", label: "advertiser_id" },
  { from: "users", to: "advertiser_profiles", label: "assigned_manager_id", style: "dashed" },

  // Offer relations
  { from: "advertisers", to: "offers", label: "advertiser_id" },
  { from: "offer_categories", to: "offers", label: "category_id" },
  { from: "offers", to: "offer_caps", label: "offer_id" },
  { from: "offers", to: "offer_landers", label: "offer_id" },
  { from: "offers", to: "offer_creatives", label: "offer_id" },
  { from: "offers", to: "offers", label: "fallback_offer_id", selfConnecting: true },

  // Offer approval
  { from: "offers", to: "offer_access_requests", label: "offer_id" },
  { from: "publishers", to: "offer_access_requests", label: "publisher_id" },
  { from: "offers", to: "offer_assignments", label: "offer_id" },
  { from: "publishers", to: "offer_assignments", label: "publisher_id" },

  // Tracking
  { from: "offers", to: "clicks", label: "offer_id" },
  { from: "publishers", to: "clicks", label: "publisher_id" },
  { from: "tracking_links", to: "clicks", label: "tracking_link_id" },
  { from: "clicks", to: "click_logs", label: "click_id" },
  { from: "offers", to: "tracking_links", label: "offer_id" },
  { from: "publishers", to: "tracking_links", label: "publisher_id" },

  // Conversions
  { from: "clicks", to: "conversions", label: "click_id" },
  { from: "conversions", to: "conversion_logs", label: "conversion_id" },
  { from: "publishers", to: "postbacks", label: "publisher_id" },
  { from: "offers", to: "postbacks", label: "offer_id" },

  // Fraud
  { from: "clicks", to: "fraud_logs", label: "click_id", style: "dashed" },

  // Billing
  { from: "publishers", to: "wallets", label: "owner_id", style: "dashed" },
  { from: "advertisers", to: "wallets", label: "owner_id", style: "dashed" },
  { from: "wallets", to: "transactions", label: "wallet_id" },
  { from: "advertisers", to: "invoices", label: "advertiser_id" },
  { from: "publishers", to: "payouts", label: "publisher_id" },

  // Support
  { from: "tickets", to: "ticket_messages", label: "ticket_id" }
];

export function MySqlArchitectureTab() {
  const [selectedModule, setSelectedModule] = useState<string>("Authentication");
  const [selectedTable, setSelectedTable] = useState<string>("users");
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Filter schemas to matching current module selection
  const filteredTables = useMemo(() => {
    return MYSQL_ARCHITECTURE_SCHEMAS.filter((t) => t.module === selectedModule);
  }, [selectedModule]);

  // Set the first table in the filtered module as active when selectedModule changes
  const handleModuleChange = (module: string) => {
    setSelectedModule(module);
    const related = MYSQL_ARCHITECTURE_SCHEMAS.filter((t) => t.module === module);
    if (related.length > 0) {
      setSelectedTable(related[0].tableName);
    }
  };

  // Find currently selected schema metrics details
  const activeSchema = useMemo(() => {
    return (
      MYSQL_ARCHITECTURE_SCHEMAS.find((t) => t.tableName === selectedTable) ||
      MYSQL_ARCHITECTURE_SCHEMAS[0]
    );
  }, [selectedTable]);

  // Copy helper action to clipboard
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  // Compile the absolute master SQL block containing all 32 tables
  const masterSqlString = useMemo(() => {
    let script = `-- =====================================================================\n`;
    script += `-- APEXTRACK ENTERPRISE PLATFORM ATTRIBUTION DATABASE ENGINE BLUEPRINT\n`;
    script += `-- TARGET DATABASE SYSTEM: MySQL 8.x / Amazon Aurora MySQL\n`;
    script += `-- DESIGNED & OPTIMIZED FOR: 100M+ Monthly Click Redirection & Attribution Ledgers\n`;
    script += `-- DATE GENERATED: 2026-06-06 UTC\n`;
    script += `-- =====================================================================\n\n`;
    script += `CREATE DATABASE IF NOT EXISTS \`apextrack_attribution\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n`;
    script += `USE \`apextrack_attribution\`;\n\n`;
    script += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    MYSQL_ARCHITECTURE_SCHEMAS.forEach((tbl) => {
      script += `-- ---------------------------------------------------------------------\n`;
      script += `-- MODULE: ${tbl.module.toUpperCase()} // TABLE: ${tbl.tableName}\n`;
      script += `-- DESCRIPTION: ${tbl.description}\n`;
      script += `-- SCALE ENGINE NOTE: ${tbl.scaleNotes}\n`;
      script += `-- ---------------------------------------------------------------------\n`;
      script += `${tbl.ddl}\n\n`;
    });

    script += `SET FOREIGN_KEY_CHECKS = 1;\n`;
    return script;
  }, []);

  return (
    <div className="lg:col-span-4 space-y-8 animate-fadeIn" id="mysql-arch-tab">
      
      {/* SLA Metrics Header Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-md">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-cyan-400">
            <Zap className="w-5 h-5" />
            <strong className="text-sm font-semibold uppercase tracking-wider font-mono">
              Redirect Concurrency
            </strong>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">100,000,000</p>
          <p className="text-slate-400 text-xs">
            Minimum target throughput clicks processed monthly with consistent sub-10ms processing latency.
          </p>
        </div>

        <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
          <div className="flex items-center gap-2 text-cyan-400">
            <Layers className="w-5 h-5" />
            <strong className="text-sm font-semibold uppercase tracking-wider font-mono">
              Partitioning Guard
            </strong>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">Range Bound</p>
          <p className="text-slate-400 text-xs">
            Dynamic monthly and weekly range partitioned databases prevent B-Tree index deep growth bloating bottlenecks.
          </p>
        </div>

        <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
          <div className="flex items-center gap-2 text-cyan-400">
            <Activity className="w-5 h-5" />
            <strong className="text-sm font-semibold uppercase tracking-wider font-mono">
              Ledger Integrity
            </strong>
          </div>
          <p className="text-2xl font-extrabold text-white font-mono">Double-Entry</p>
          <p className="text-slate-400 text-xs">
            Reconciled cryptographic balances cached dynamically inside secure wallets and audited via strict SQL constraints.
          </p>
        </div>
      </div>

      {/* SQL Exporter Quick Launcher */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-500/20 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-cyan-300">
            <FileCode className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Generate Monolithic Install DB Script</h3>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            Extract the entire database initialization SQL blueprint code for all 32 tables. Fully compatible with MySQL 8.0+, MariaDB 10.x, or write-scalable Amazon Aurora MySQL clusters. Includes keys, composite index configurations, and partitioning code.
          </p>
        </div>

        <button
          onClick={() => handleCopy(masterSqlString, "masterSql")}
          className="bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold px-5 py-3 rounded-lg text-sm transition shrink-0 flex items-center gap-2 font-mono shadow-md cursor-pointer select-none"
        >
          {copiedText === "masterSql" ? (
            <>
              <Check className="w-4 h-4 text-slate-950" />
              Copied Full Script!
            </>
          ) : (
            <>
              <Clipboard className="w-4 h-4 text-slate-950" />
              Copy Complete 32-Table SQL DDL
            </>
          )}
        </button>
      </div>

      {/* HIGH VISIBILITY SECTION: INTERACTIVE ER DIAGRAM DISPLAY MAP */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="space-y-1">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono flex items-center gap-2">
              <Boxes className="w-4 h-4 text-cyan-400" />
              Platform Entity Relational Map DB (v2.0 Schema)
            </h3>
            <p className="text-slate-400 text-xs">
              Interactive structural canvas mapping cross-module references. Hover nodes to light relational connecting lines, or click any node table to auto-scroll and inspect structural types.
            </p>
          </div>
          <div className="flex gap-4 text-[10px] uppercase font-mono text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 bg-cyan-500/80 rounded border border-cyan-400/50"></span>
              <span>Primary Table</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1.5 bg-slate-500 border-t border-slate-400"></span>
              <span>1:N Reference</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-1 px-1 bg-slate-800 border-t border-dashed border-slate-500"></span>
              <span>Weak/Virtual Link</span>
            </div>
          </div>
        </div>

        {/* ER MAP SVG CANVAS */}
        <div className="bg-slate-950 border border-slate-850 rounded-lg overflow-x-auto p-2 scrollbar-thin">
          <div className="min-w-[950px] relative select-none">
            <svg
              viewBox="0 0 1000 780"
              className="w-full h-auto text-slate-400"
              id="relational-er-svg"
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
                </marker>
              </defs>

              {/* Draw Connector Relations Mapping Lines */}
              {ER_RELATIONS.map((r, ri) => {
                const sNode = ER_COORDINATES[r.from];
                const tNode = ER_COORDINATES[r.to];

                if (!sNode || !tNode) return null;

                const isLineActive =
                  hoveredNode === r.from ||
                  hoveredNode === r.to ||
                  selectedTable === r.from ||
                  selectedTable === r.to;

                // Self connecting callback curve
                if (r.selfConnecting) {
                  return (
                    <path
                      key={ri}
                      d={`M ${sNode.x + 35} ${sNode.y} C ${sNode.x + 85} ${sNode.y - 45}, ${sNode.x + 85} ${sNode.y + 45}, ${sNode.x + 35} ${sNode.y + 12}`}
                      fill="none"
                      stroke={isLineActive ? "#22d3ee" : "#334155"}
                      strokeWidth={isLineActive ? 2 : 1}
                      strokeDasharray={r.style === "dashed" ? "4,4" : undefined}
                      markerEnd={isLineActive ? "url(#arrow-active)" : "url(#arrow)"}
                    />
                  );
                }

                return (
                  <g key={ri}>
                    <line
                      x1={sNode.x}
                      y1={sNode.y}
                      x2={tNode.x}
                      y2={tNode.y}
                      stroke={isLineActive ? "#22d3ee" : "#334155"}
                      strokeWidth={isLineActive ? 2 : 1}
                      strokeDasharray={r.style === "dashed" ? "4,4" : undefined}
                      markerEnd={isLineActive ? "url(#arrow-active)" : "url(#arrow)"}
                      className="transition duration-150"
                    />
                    {isLineActive && (
                      <rect
                        x={(sNode.x + tNode.x) / 2 - 40}
                        y={(sNode.y + tNode.y) / 2 - 8}
                        width="80"
                        height="16"
                        rx="3"
                        fill="#0f172a"
                        stroke="#0891b2"
                        strokeWidth="0.5"
                      />
                    )}
                    {isLineActive && (
                      <text
                        x={(sNode.x + tNode.x) / 2}
                        y={(sNode.y + tNode.y) / 2 + 4}
                        textAnchor="middle"
                        fill="#22d3ee"
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {r.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Draw Table Nodes */}
              {Object.entries(ER_COORDINATES).map(([key, item]) => {
                const isActive = selectedTable === key;
                const isHovered = hoveredNode === key;

                // Color themes by Module category
                let pinColors = {
                  bg: "bg-slate-900",
                  outline: "stroke-slate-800",
                  text: "fill-slate-300",
                  badge: "fill-cyan-400"
                };

                if (isActive || isHovered) {
                  pinColors = {
                    bg: "bg-cyan-950",
                    outline: "stroke-cyan-400",
                    text: "fill-cyan-100",
                    badge: "fill-cyan-200"
                  };
                }

                // Node size settings
                const width = 125;
                const height = 30;

                return (
                  <g
                    key={key}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedTable(key);
                      setSelectedModule(item.module);
                    }}
                    onMouseEnter={() => setHoveredNode(key)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <rect
                      x={item.x - width / 2}
                      y={item.y - height / 2}
                      width={width}
                      height={height}
                      rx="6"
                      fill={isActive ? "#0f212d" : "#0f172a"}
                      className={`transition duration-150 ${pinColors.outline}`}
                      strokeWidth={isActive ? 2 : 1}
                    />
                    <text
                      x={item.x}
                      y={item.y + 4}
                      textAnchor="middle"
                      className={`text-[9px] font-mono leading-none transition ${pinColors.text}`}
                      fontWeight={isActive ? "bold" : "normal"}
                    >
                      {item.label}
                    </text>
                    <circle
                      cx={item.x - width / 2 + 8}
                      cy={item.y}
                      r="3"
                      fill={
                        item.module === "Tracking Module" || item.module === "Conversion Module"
                          ? "#10b981"
                          : item.module === "Authentication"
                          ? "#3b82f6"
                          : "#8b5cf6"
                      }
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* THREE COLUMN SELECTOR AND DETAILED AUDITING MATRIX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Module Switcher List (Left Navigation) */}
        <div className="lg:col-span-3 space-y-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="pb-3 border-b border-slate-850">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              SaaS DB Modules
            </h3>
            <p className="text-slate-400 text-[11px] pt-1 leading-normal">
              Toggle specific clusters of the architecture below.
            </p>
          </div>

          <div className="space-y-1">
            {MYSQL_MODULES.map((m) => (
              <button
                key={m}
                onClick={() => handleModuleChange(m)}
                className={`w-full text-left p-2 rounded-lg text-xs transition border flex items-center justify-between ${
                  selectedModule === m
                    ? "bg-slate-950 border-cyan-800 text-white font-medium"
                    : "bg-slate-900/60 border-transparent text-slate-400 hover:bg-slate-950 hover:text-slate-200"
                }`}
              >
                <span className="truncate leading-none">{m}</span>
                <span className="bg-slate-800 text-slate-400 text-[9px] px-1.5 py-0.5 rounded border border-slate-705 shrink-0 ml-1">
                  {MYSQL_ARCHITECTURE_SCHEMAS.filter((t) => t.module === m).length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table Selector Box inside Current Module (Middle Navigation) */}
        <div className="lg:col-span-3 space-y-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
          <div className="pb-3 border-b border-slate-850">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              Module Tables ({filteredTables.length})
            </h3>
            <p className="text-slate-400 text-[11px] pt-1">
              Select specific table definitions to examine configurations.
            </p>
          </div>

          <div className="space-y-1">
            {filteredTables.map((tbl) => (
              <button
                key={tbl.tableName}
                onClick={() => setSelectedTable(tbl.tableName)}
                className={`w-full text-left p-2.5 rounded-lg text-xs transition border flex flex-col space-y-1 ${
                  selectedTable === tbl.tableName
                    ? "bg-slate-950 border-cyan-800 text-white font-medium shadow-sm"
                    : "bg-slate-900/60 border-transparent text-slate-400 hover:bg-slate-950 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <strong className="font-mono text-cyan-400 truncate">`{tbl.tableName}`</strong>
                  {tbl.partitioning && (
                    <span className="bg-emerald-950/60 text-emerald-400 text-[8px] tracking-wide px-1 rounded uppercase font-bold border border-emerald-900/50">
                      Partitioned
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 truncate w-full">
                  {tbl.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Core Field Auditing Engine & SQL DDL Terminal (Right Canvas) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-6 shadow-sm">
          
          <div className="space-y-2 pb-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="space-y-1">
              <span className="bg-slate-950 text-cyan-400 border border-slate-800 text-[9px] px-2 py-0.5 rounded font-mono uppercase tracking-widest block w-max">
                {activeSchema.module} Cluster Component
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight font-mono">
                Table: `{activeSchema.tableName}`
              </h2>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Engine type: <span className="text-cyan-400 font-bold">InnoDB / MySQL 8.x</span>
            </div>
          </div>

          {/* Description summary */}
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-2">
            <strong className="text-slate-400 text-xs font-semibold uppercase tracking-wide block">
              Core Table Description & Operations
            </strong>
            <p className="text-slate-300 text-xs leading-relaxed">{activeSchema.description}</p>
          </div>

          {/* Columns Specifications Grid */}
          <div className="space-y-2">
            <strong className="text-slate-400 text-xs font-semibold uppercase tracking-wide block flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Column Definitions & Constrains Matrix
            </strong>

            <div className="overflow-x-auto border border-slate-805 rounded-lg">
              <table className="min-w-full divide-y divide-slate-850 text-left">
                <thead className="bg-slate-950 text-[10px] tracking-wider text-slate-400 uppercase font-mono">
                  <tr>
                    <th className="px-3 py-2.5">Field</th>
                    <th className="px-3 py-2.5">Data Type</th>
                    <th className="px-3 py-2.5">Null</th>
                    <th className="px-3 py-2.5">Key</th>
                    <th className="px-3 py-2.5">Default</th>
                    <th className="px-3 py-2.5">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 text-[11px] leading-relaxed">
                  {activeSchema.fields.map((f, fi) => (
                    <tr key={fi} className="hover:bg-slate-950/40 transition">
                      <td className="px-3 py-2.5 font-mono text-white font-semibold select-all">
                        {f.name}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-cyan-300">{f.type}</td>
                      <td className="px-3 py-2.5 font-mono text-slate-500">
                        {f.nullable ? "YES" : "NO"}
                      </td>
                      <td className="px-3 py-2.5 font-mono">
                        {f.key ? (
                          <span
                            className={`px-1 rounded font-bold text-[9px] ${
                              f.key === "PRI"
                                ? "bg-cyan-950 text-cyan-400 border border-cyan-900"
                                : "bg-slate-800 text-slate-300 border border-slate-700"
                            }`}
                          >
                            {f.key}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-slate-400 truncate max-w-[100px]">
                        {f.defaultValue || (f.nullable ? "NULL" : "-")}
                      </td>
                      <td className="px-3 py-2.5 text-slate-300 tracking-tight leading-normal">
                        {f.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Indices recommendation block */}
          {activeSchema.indexes.length > 0 && (
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 space-y-3">
              <strong className="text-slate-400 text-xs font-semibold uppercase tracking-wide block flex items-center gap-1.5">
                <Key className="w-4 h-4 text-cyan-400" />
                Performance Indexing Schemas recommendation
              </strong>
              <div className="space-y-2">
                {activeSchema.indexes.map((idx, ind) => (
                  <div key={ind} className="text-xs space-y-1 border-b border-slate-900/60 pb-2 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <code className="bg-slate-900 text-cyan-300 px-1.5 py-0.5 rounded text-[10px] border border-slate-800 font-mono">
                        INDEX: {idx.name} ({idx.columns.join(", ")})
                      </code>
                      <span className="bg-indigo-950 text-indigo-400 text-[8px] px-1 rounded uppercase font-bold border border-indigo-900/40">
                        {idx.type}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-normal">{idx.purpose}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scale engine notes */}
          <div className="bg-gradient-to-tr from-slate-950 to-cyan-950/20 p-4 rounded-lg border border-indigo-500/10 space-y-2">
            <strong className="text-slate-400 text-xs font-semibold uppercase tracking-wide block flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              SLA Analytics & Overheads Strategy (100M+ Clicks)
            </strong>
            <p className="text-slate-300 text-xs leading-relaxed">{activeSchema.scaleNotes}</p>
            {activeSchema.partitioning && (
              <div className="bg-emerald-950/40 border border-emerald-900/40 rounded p-2 text-[10px] font-mono text-emerald-400 leading-normal">
                <strong>[HIGH SCALING] MySQL Table Partitioning Enabled:</strong>
                <p className="pt-1 text-slate-300">
                  Allows instant, lock-free removal of aged raw data using partitioned range truncations:
                </p>
                <code className="text-[10px] text-cyan-300 block pt-1 select-all">{activeSchema.partitioning}</code>
              </div>
            )}
          </div>

          {/* Pure copy-ready active DDL Code widget */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-slate-400 text-xs font-semibold uppercase tracking-wide block">
                Executable CREATE TABLE MySQL Syntax
              </strong>
              <button
                onClick={() => handleCopy(activeSchema.ddl, `ddl_${activeSchema.tableName}`)}
                className="text-xs text-cyan-400 hover:text-white bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono flex items-center gap-1 transition select-none cursor-pointer"
              >
                {copiedText === `ddl_${activeSchema.tableName}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied SQL!
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5" />
                    Copy SQL
                  </>
                )}
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-lg border border-slate-850 overflow-x-auto text-xs text-cyan-300/90 font-mono leading-normal select-all whitespace-pre">
              {activeSchema.ddl}
            </pre>
          </div>

        </div>
      </div>

      {/* FOOTER SLA GUIDE SECTION DETAILS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 shadow-sm" id="scale-sla-briefing">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider font-mono flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          SYSTEM CONFIGURATION SPECIFICATIONS FOR 100M CLICKS/MONTH Scale
        </h3>
        
        <p className="text-slate-300 text-xs leading-relaxed">
          Running any tracking server logging over 100M clicks monthly requires aligning more than just index definitions. To maintain reliable database responses under high transaction loads in MySQL or Amazon Aurora, the network infrastructure architecture must commit to the following operational parameters:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850/65 space-y-2">
            <strong className="text-cyan-400 font-mono block uppercase">1. Write Buffering & Cache Layers</strong>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              <strong>Never record click streams directly to ACID databases.</strong> Redirect microservices must cache all raw redirections inside dynamic Redis queues or write-scalable Apache Kafka logs instantly, resolving redirections under 5ms, then trigger batch insert processes every 10,000 requests.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850/65 space-y-2">
            <strong className="text-cyan-400 font-mono block uppercase">2. InnoDB Buffer Pool Allocation</strong>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Set <code>innodb_buffer_pool_size</code> to cover <strong>75% - 80%</strong> of system physical RAM. Keeps active B-Tree leaf node elements cached dynamically in system memory buffers and minimizes deep hardware sector I/O during heavy search operations.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850/65 space-y-2">
            <strong className="text-cyan-400 font-mono block uppercase">3. Partition Pruning Engine</strong>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Ensure queries retrieve matching dates during search checks. By executing <code>EXPLAIN</code>, verify queries use partition pruning rules directly instead of evaluating high-volume, global partitions layouts. Drop old click logs partitions dynamically using clean cron routines.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-850/65 space-y-2">
            <strong className="text-cyan-400 font-mono block uppercase">4. Double-Entry Financial Safety Locks</strong>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Isolate metrics write pipelines from financial audit systems. Keeps wallets balances locked inside <code>wallets</code> and tracks changes via un-alterable debit/credit indices inside <code>transactions</code> using MySQL serializable isolation checks to prevent race concurrency collisions.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
