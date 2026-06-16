import { useState } from "react";
import {
  LayoutGrid,
  Users,
  Tag,
  ClipboardList,
  ShieldCheck,
  Shield,
  Settings,
  DollarSign,
  ListChecks,
  Plus,
  Repeat,
  CreditCard,
  Activity,
  BarChart3,
  FileText,
  Building2,
  UserCheck,
  ChevronDown,
  LogOut,
  Globe,
  CheckSquare,
  Link2,
  Megaphone,
  Mail,
  Send,
  MailOpen,
  Settings2,
} from "lucide-react";
import { useBranding } from "../../contexts/BrandingContext";

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

const navGroups = [
  {
    id: "offers",
    label: "Offer Management",
    icon: Tag,
    items: [
      { id: "admin-offers", label: "Offer List", icon: ListChecks },
      { id: "admin-applications", label: "Pending Offer Requests", icon: ClipboardList },
      { id: "admin-offer-create", label: "Create Offer", icon: Plus },
      { id: "admin-offer-categories", label: "Categories", icon: Tag },
      { id: "admin-advertiser-postback-generator", label: "Advertiser Postbacks", icon: Link2 },
      { id: "admin-offer-postbacks", label: "Offer Postbacks", icon: Repeat },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: FileText,
    items: [
      { id: "admin-reports-daily", label: "Daily Report", icon: FileText },
      { id: "admin-reports-click", label: "Click Report", icon: BarChart3 },
      { id: "admin-reports-conversion", label: "Conversion Report", icon: Tag },
      { id: "admin-conversion-review", label: "Conversion Review", icon: CheckSquare },
      { id: "admin-advertiser-postback-logs", label: "Advertiser Postback Logs", icon: Activity },
      { id: "admin-affiliate-postback-logs", label: "Affiliate Postback Logs", icon: Repeat },
    ],
  },
  {
    id: "affiliates",
    label: "Affiliates",
    icon: Users,
    items: [
      { id: "admin-affiliates-list", label: "Affiliate List", icon: ListChecks },
      { id: "admin-affiliates-pending", label: "Pending Affiliates", icon: FileText },
      { id: "admin-affiliates-active", label: "Active Affiliates", icon: ShieldCheck },
      { id: "admin-affiliates-disabled", label: "Disabled Affiliates", icon: Shield },
      { id: "admin-affiliates-create", label: "Create Affiliate", icon: Plus },
    ],
  },
  {
    id: "managers",
    label: "Affiliate Managers",
    icon: UserCheck,
    items: [
      { id: "admin-managers-list", label: "Manager List", icon: Users },
      { id: "admin-managers-create", label: "Create Manager", icon: Plus },
      { id: "admin-managers-assign", label: "Assign Affiliates", icon: Repeat },
    ],
  },
  {
    id: "advertisers",
    label: "Advertisers",
    icon: Building2,
    items: [
      { id: "admin-advertisers-list", label: "Advertiser List", icon: Users },
      { id: "admin-advertisers-create", label: "Create Advertiser", icon: Plus },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    items: [
      { id: "admin-finance-revenue", label: "Revenue", icon: DollarSign },
      { id: "admin-finance-payouts", label: "Payouts", icon: Repeat },
      { id: "admin-finance-invoices", label: "Invoices", icon: FileText },
      { id: "admin-finance-transactions", label: "Finance Transactions", icon: CreditCard },
    ],
  },
  {
    id: "mailer",
    label: "Mailer",
    icon: Mail,
    items: [
      { id: "admin-smtp-settings",    label: "SMTP Settings",    icon: Settings2 },
      { id: "admin-email-templates",  label: "Email Templates",  icon: MailOpen  },
      { id: "admin-bulk-mailer",      label: "Bulk Mailer",      icon: Send      },
      { id: "admin-email-logs",       label: "Email Logs",       icon: Activity  },
    ],
  },
  {
    id: "system",
    label: "System",
    icon: Settings,
    items: [
      { id: "admin-announcements",          label: "Announcements",       icon: Megaphone  },
      { id: "admin-network-settings",       label: "Network Settings",    icon: Globe      },
      { id: "admin-signup-questions",       label: "Signup Questions",    icon: ListChecks },
      { id: "admin-email-verification",     label: "Email Verification",  icon: Mail       },
    ],
  },
];

export function AdminSidebar({ activeSection, setActiveSection, onLogout }: AdminSidebarProps) {
  const branding = useBranding();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const toggleGroup = (groupId: string) => {
    setExpandedGroup((prev) => (prev === groupId ? null : groupId));
  };

  return (
    <aside className="w-72 bg-white dark:bg-slate-950 border-r theme-border flex flex-col h-screen shrink-0 font-sans shadow-sm">
      <div className="p-6 border-b theme-border">
        <div className="flex items-center gap-3">
          {branding.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt={branding.networkName}
              className="w-10 h-10 object-contain rounded-xl shrink-0"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          ) : (
            <div className="bg-cyan-500 text-slate-950 p-3 rounded-2xl shadow-lg shadow-cyan-500/10 flex items-center justify-center shrink-0">
              <LayoutGrid className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="text-sm font-black uppercase tracking-[0.25em] theme-text-main">{branding.networkName}</div>
            <div className="text-[10px] theme-text-muted uppercase tracking-widest font-mono pt-0.5">Admin Console</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-auto px-4 py-6 space-y-2 scrollbar-thin">
        {/* Dashboard — standalone top-level item */}
        <button
          type="button"
          onClick={() => setActiveSection("admin-dashboard")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-left transition ${
            activeSection === "admin-dashboard"
              ? "bg-cyan-600 text-white"
              : "border theme-border bg-slate-50 dark:bg-slate-900 theme-text-main hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <span className={`flex h-8 w-8 items-center justify-center rounded-2xl shrink-0 ${
            activeSection === "admin-dashboard"
              ? "bg-cyan-500/30 text-white"
              : "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300"
          }`}>
            <LayoutGrid className="w-4 h-4" />
          </span>
          <span>Dashboard</span>
        </button>

        {/* Collapsible groups */}
        {navGroups.map((group) => {
          const GroupIcon = group.icon;
          const isExpanded = expandedGroup === group.id;
          const hasActive = group.items.some((item) => item.id === activeSection);

          return (
            <div key={group.id} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold theme-text-main transition ${
                  hasActive
                    ? "border-cyan-200 dark:border-cyan-800/40 bg-cyan-50 dark:bg-cyan-950/20"
                    : "theme-border bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-2xl shrink-0 bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300">
                    <GroupIcon className="w-4 h-4" />
                  </span>
                  <span>{group.label}</span>
                </span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
              </button>

              {isExpanded && (
                <div className="space-y-1 pl-4 pb-1">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-semibold text-left transition ${
                          isActive
                            ? "bg-cyan-600 text-white"
                            : "theme-text-main hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <ItemIcon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-5 border-t theme-border">
        <div className="mb-3 text-[10px] uppercase tracking-[0.3em] theme-text-muted font-bold font-mono">Admin Access</div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border theme-border px-4 py-3 text-sm font-semibold theme-text-secondary hover:bg-slate-100 dark:hover:bg-slate-900 transition"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
