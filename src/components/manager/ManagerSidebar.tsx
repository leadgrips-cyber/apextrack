import { LayoutGrid, Users, Tag, MessageSquare, StickyNote, LogOut } from "lucide-react";
import { useBranding } from "../../contexts/BrandingContext";

interface ManagerSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

const navItems = [
  { id: "manager-dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "manager-publishers", label: "Publisher Review", icon: Users },
  { id: "manager-offers-approval", label: "Offer Requests", icon: Tag },
  { id: "manager-communication", label: "Communication", icon: MessageSquare },
  { id: "manager-notes", label: "Notes", icon: StickyNote },
];

export function ManagerSidebar({ activeSection, setActiveSection, onLogout }: ManagerSidebarProps) {
  const branding = useBranding();

  return (
    <aside className="w-72 bg-white dark:bg-slate-950 border-r theme-border flex flex-col h-screen shrink-0 font-sans shadow-sm">
      <div className="p-6 border-b theme-border">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500 text-slate-950 p-3 rounded-2xl shadow-lg shadow-cyan-500/10">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-black uppercase tracking-[0.25em] theme-text-main">{branding.networkName}</div>
            <div className="text-[10px] theme-text-muted uppercase tracking-widest font-mono pt-0.5">Affiliate Manager</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-auto px-4 py-6 space-y-2 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-left transition ${isActive ? "bg-cyan-600 text-white" : "theme-text-main hover:bg-slate-100 dark:hover:bg-slate-900"}`}>
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-5 border-t theme-border">
        <div className="mb-3 text-[10px] uppercase tracking-[0.3em] theme-text-muted font-bold font-mono">Manager Actions</div>
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 rounded-2xl border theme-border px-4 py-3 text-sm font-semibold theme-text-secondary hover:bg-slate-100 dark:hover:bg-slate-900 transition">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
