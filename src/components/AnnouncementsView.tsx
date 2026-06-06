import React, { useState } from "react";
import { 
  Megaphone, 
  Plus, 
  Send, 
  Clock, 
  AlertTriangle, 
  Info, 
  Flame, 
  Wrench, 
  ShieldCheck, 
  ArrowRight,
  Filter,
  CheckCircle
} from "lucide-react";

export interface NetworkAnnouncement {
  id: string;
  category: "Network News" | "New Offers" | "Payout Updates" | "Maintenance Notices" | "Compliance Alerts";
  title: string;
  content: string;
  author: string;
  timestamp: string;
  isImportant?: boolean;
}

interface AnnouncementsViewProps {
  announcements: NetworkAnnouncement[];
  onPublishAnnouncement: (newAnn: Omit<NetworkAnnouncement, "id" | "timestamp">) => void;
}

export function AnnouncementsView({ announcements, onPublishAnnouncement }: AnnouncementsViewProps) {
  const [filterCat, setFilterCat] = useState<string>("all");
  
  // Admin composer form states
  const [showAdminComposer, setShowAdminComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NetworkAnnouncement["category"]>("Network News");
  const [isImportant, setIsImportant] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const filteredAnnouncements = announcements.filter(ann => {
    if (filterCat === "all") return true;
    return ann.category === filterCat;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "New Offers":
        return <Flame className="w-5 h-5 text-amber-400" />;
      case "Payout Updates":
        return <ShieldCheck className="w-5 h-5 text-cyan-400" />;
      case "Maintenance Notices":
        return <Wrench className="w-5 h-5 text-sky-450" />;
      case "Compliance Alerts":
        return <AlertTriangle className="w-5 h-5 text-rose-450" />;
      case "Network News":
      default:
        return <Info className="w-5 h-5 text-purple-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "New Offers":
        return "bg-amber-950 text-amber-400 border-amber-900";
      case "Payout Updates":
        return "bg-cyan-950 text-cyan-450 border-cyan-900";
      case "Maintenance Notices":
        return "bg-slate-950 text-slate-400 border-slate-900";
      case "Compliance Alerts":
        return "bg-rose-950 text-rose-450 border-rose-900";
      case "Network News":
      default:
        return "bg-purple-950 text-purple-450 border-purple-900";
    }
  };

  const handleSubmitAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onPublishAnnouncement({
      title,
      content,
      category,
      author: "AM Sophia (Network Administrator rep)",
      isImportant
    });

    setTitle("");
    setContent("");
    setCategory("Network News");
    setIsImportant(false);
    setBroadcastSuccess(true);
    setTimeout(() => {
      setBroadcastSuccess(false);
      setShowAdminComposer(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="announcements-center-view">
      
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-indigo-400" />
            Network Announcements Center
          </h2>
          <p className="text-xs text-slate-400">
            Official announcements, compliance alerts, new campaign additions, and server maintenance bulletins.
          </p>
        </div>

        <button
          onClick={() => setShowAdminComposer(!showAdminComposer)}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-xl text-xs font-mono font-bold transition select-none flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          {showAdminComposer ? "Close Composer" : "Publish Announcement (Admin)"}
        </button>
      </div>

      {/* ADMIN COMPOSER POPUP BOX */}
      {showAdminComposer && (
        <div className="bg-slate-900 border-2 border-cyan-500/40 p-5 rounded-2xl space-y-4 shadow-lg animate-fadeIn">
          <div className="space-y-1 pb-1 border-b border-slate-800">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-1">
              <Send className="w-4.5 h-4.5" />
              SIMULATED ADMINISTRATION ADVERTISER PANEL
            </h3>
            <p className="text-[10px] text-slate-500 font-mono">
              Use this console to compose a network bulletin. Changes will persist during this active session dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmitAnnouncement} className="space-y-3.5 text-xs">
            {broadcastSuccess && (
              <div className="bg-emerald-950/60 text-emerald-400 border border-emerald-900/40 p-3 rounded-lg text-xs flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Bulletin published successfully! Streamed instantly to all publisher client layouts.</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Topic / Category Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NetworkAnnouncement["category"])}
                  className="mt-1 block w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="Network News">Network News</option>
                  <option value="New Offers">New Offers</option>
                  <option value="Payout Updates">Payout Updates</option>
                  <option value="Maintenance Notices">Maintenance Notices</option>
                  <option value="Compliance Alerts">Compliance Alerts</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 font-mono">
                  Priority Action Flag
                </label>
                <label className="mt-2.5 flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <span className="text-slate-350 text-xs font-semibold">Mark as Highlighted / Critical Bulletin</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 font-mono">
                Heading Line Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Scheduled Core PostgreSQL Database Upgrades for API Speed"
                className="mt-1 block w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-500 font-mono">
                Message Body Markup Text
              </label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                placeholder="Write clear, comprehensive instructions for affiliates..."
                className="mt-1 block w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 placeholder-slate-705 focus:outline-none focus:border-cyan-500 text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition font-mono uppercase tracking-wider text-xs flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              Publish Announcement Bulletin
            </button>
          </form>
        </div>
      )}

      {/* FILTER CONTROL BAR */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <Filter className="w-4 h-4 text-cyan-500" />
          <span>Category Filter:</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {[
            { value: "all", label: "All Bulletins" },
            { value: "Network News", label: "Network News" },
            { value: "New Offers", label: "New Offers" },
            { value: "Payout Updates", label: "Payout Updates" },
            { value: "Maintenance Notices", label: "Maintenance Notices" },
            { value: "Compliance Alerts", label: "Compliance Alerts" }
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterCat(cat.value)}
              className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition font-sans ${
                filterCat === cat.value
                  ? "bg-slate-950 text-cyan-400 border border-cyan-900/50 font-bold"
                  : "text-slate-400 hover:bg-slate-950/40 hover:text-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ANNOUNCEMENTS LOG FEED */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 text-center py-16 rounded-2xl text-slate-500 space-y-2">
            <Megaphone className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-sm font-semibold font-mono uppercase tracking-wide">No bulletins match this filter.</p>
            <p className="text-xs">Try selecting another topic category above or compose a custom admin post.</p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className={`bg-slate-900 border rounded-2xl p-5 md:p-6 shadow-sm space-y-4 transition hover:border-slate-700 duration-150 ${
                ann.isImportant ? "border-l-4 border-l-rose-500 border-slate-800" : "border-slate-800"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-850 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider font-bold uppercase border ${getCategoryColor(ann.category)}`}>
                    {ann.category}
                  </span>
                  {ann.isImportant && (
                    <span className="text-[8px] bg-rose-950 text-rose-455 font-bold px-2 py-0.5 border border-rose-900 rounded font-mono uppercase tracking-widest animate-pulse">
                      IMPORTANT NOTICE
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-slate-540 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{ann.timestamp}</span>
                </div>
              </div>

              <div className="space-y-2 font-sans">
                <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
                  <span className="p-1 bg-slate-950 rounded-lg border border-slate-850">
                    {getCategoryIcon(ann.category)}
                  </span>
                  {ann.title}
                </h3>
                
                <p className="text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line p-3 bg-slate-950 rounded-xl border border-slate-850">
                  {ann.content}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-855 text-[10px] text-slate-500 font-mono flex justify-between items-center">
                <span>Published by: <strong className="text-slate-400">{ann.author}</strong></span>
                <span className="text-[9px] text-cyan-405 flex items-center gap-1 uppercase">
                  Verified Security Ledger
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
