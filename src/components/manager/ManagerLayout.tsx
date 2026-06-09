import { useState } from "react";
import { Menu, X, LogOut, ArrowLeft } from "lucide-react";
import { ManagerSidebar } from "./ManagerSidebar";

interface ManagerLayoutProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  managerName: string;
  onLogout: () => void;
  onReturnToPublisher?: () => void;
  children: React.ReactNode;
}

export function ManagerLayout({ activeSection, setActiveSection, managerName, onLogout, onReturnToPublisher, children }: ManagerLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="hidden lg:block shrink-0">
        <ManagerSidebar activeSection={activeSection} setActiveSection={setActiveSection} onLogout={onLogout} />
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="theme-bg-card border-b theme-border h-16 flex items-center justify-between px-6 shadow-xs">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden theme-text-muted hover:theme-text-main hover:theme-bg-well p-2 rounded-xl transition">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex flex-col text-sm">
              <span className="font-black theme-text-main uppercase tracking-[0.22em] text-slate-900 dark:text-white">Affiliate Manager</span>
              <span className="text-[10px] theme-text-muted uppercase tracking-widest font-mono">{managerName}</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {onReturnToPublisher && (
              <button onClick={onReturnToPublisher} className="text-xs font-semibold uppercase tracking-[0.24em] px-3 py-2 rounded-xl border theme-border theme-bg-well theme-text-secondary hover:theme-text-main transition">
                <ArrowLeft className="w-4 h-4 inline-block mr-2" /> Publisher View
              </button>
            )}
            <button onClick={onLogout} className="rounded-xl border theme-border px-3 py-2 text-xs font-semibold theme-text-secondary hover:theme-text-main hover:bg-slate-100 dark:hover:bg-slate-900 transition flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </header>

        {mobileMenuOpen && (
          <div className="lg:hidden absolute inset-x-0 top-16 z-40 bg-slate-50 dark:bg-slate-950 border-b theme-border shadow-sm">
            <div className="flex flex-col p-4 space-y-2">
              <button onClick={() => { setActiveSection("manager-dashboard"); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold ${activeSection === "manager-dashboard" ? "bg-cyan-600 text-white" : "theme-text-main"}`}>Dashboard</button>
              <button onClick={() => { setActiveSection("manager-publishers"); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold ${activeSection === "manager-publishers" ? "bg-cyan-600 text-white" : "theme-text-main"}`}>Publisher Review</button>
              <button onClick={() => { setActiveSection("manager-offers-approval"); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold ${activeSection === "manager-offers-approval" ? "bg-cyan-600 text-white" : "theme-text-main"}`}>Offer Approval</button>
              <button onClick={() => { setActiveSection("manager-communication"); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold ${activeSection === "manager-communication" ? "bg-cyan-600 text-white" : "theme-text-main"}`}>Communication</button>
              <button onClick={() => { setActiveSection("manager-performance"); setMobileMenuOpen(false); }} className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold ${activeSection === "manager-performance" ? "bg-cyan-600 text-white" : "theme-text-main"}`}>Performance</button>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-6 py-6 scrollbar-thin">
          <div className="max-w-7xl mx-auto pb-24">{children}</div>
        </main>
      </div>
    </div>
  );
}
