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
} from "lucide-react";

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

const navGroups = [
  {
    id: "core",
    label: "Core",
    icon: LayoutGrid,
    items: [
      { id: "admin-dashboard", label: "Dashboard", icon: LayoutGrid },
      { id: "admin-publishers", label: "Publisher Management", icon: Users },
      { id: "admin-offers", label: "Offer Management", icon: Tag },
      { id: "admin-applications", label: "Application Review", icon: ClipboardList },
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
      { id: "admin-affiliates-postbacks", label: "Affiliate Postbacks", icon: Repeat },
      { id: "admin-affiliates-billing", label: "Affiliate Billing", icon: CreditCard },
      { id: "admin-postback-test", label: "Postback Test", icon: Activity },
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
      { id: "admin-managers-performance", label: "Manager Performance", icon: BarChart3 },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: FileText,
    items: [
      { id: "admin-reports-overview", label: "Overview Report", icon: Activity },
      { id: "admin-reports-daily", label: "Daily Report", icon: FileText },
      { id: "admin-reports-click", label: "Click Report", icon: BarChart3 },
      { id: "admin-reports-conversion", label: "Conversion Report", icon: Tag },
    ],
  },
  {
    id: "advertisers",
    label: "Advertisers",
    icon: Building2,
    items: [
      { id: "admin-advertisers-list", label: "Advertiser List", icon: Users },
      { id: "admin-advertisers-create", label: "Create Advertiser", icon: Plus },
      { id: "admin-advertisers-billing", label: "Advertiser Billing", icon: CreditCard },
      { id: "admin-advertisers-reports", label: "Advertiser Reports", icon: FileText },
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
    ],
  },
  {
    id: "system",
    label: "System",
    icon: Settings,
    items: [
      { id: "admin-system-settings", label: "Settings", icon: Settings },
      { id: "admin-system-roles", label: "Roles & Permissions", icon: Shield },
      { id: "admin-system-audit", label: "Audit Logs", icon: ClipboardList },
    ],
  },
];

export function AdminSidebar({ activeSection, setActiveSection, onLogout }: AdminSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(Object.fromEntries(navGroups.map((group) => [group.id, true])));

  return (
    <aside className="w-72 bg-white dark:bg-slate-950 border-r theme-border flex flex-col h-screen shrink-0 font-sans shadow-sm">
      <div className="p-6 border-b theme-border">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500 text-slate-950 p-3 rounded-2xl shadow-lg shadow-cyan-500/10">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black uppercase tracking-[0.25em] theme-text-main">ApexTrack</div>
            <div className="text-[10px] theme-text-muted uppercase tracking-widest font-mono pt-0.5">Admin Console</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-auto px-4 py-6 space-y-4 scrollbar-thin">
        {navGroups.map((group) => {
          const GroupIcon = group.icon;
          const isExpanded = expandedGroups[group.id];

          return (
            <div key={group.id} className="space-y-2">
              <button
                type="button"
                onClick={() => setExpandedGroups((prev) => ({ ...prev, [group.id]: !prev[group.id] }))}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border theme-border bg-slate-50 dark:bg-slate-900 text-sm font-semibold theme-text-main hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-300">
                    <GroupIcon className="w-4 h-4" />
                  </span>
                  <span>{group.label}</span>
                </span>
                <ChevronDown className={`w-4 h-4 transition ${isExpanded ? "rotate-180" : ""}`} />
              </button>

              {isExpanded && (
                <div className="space-y-2 pl-4">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-left transition ${
                          isActive ? "bg-cyan-600 text-white" : "theme-text-main hover:bg-slate-100 dark:hover:bg-slate-900"
                        }`}
                      >
                        <ItemIcon className="w-4 h-4" />
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
