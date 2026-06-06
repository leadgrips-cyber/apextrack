import React, { useState } from "react";
import { 
  Bell, 
  Check, 
  CheckCircle2, 
  AlertTriangle, 
  PauseCircle, 
  CreditCard, 
  Megaphone, 
  Trash2, 
  Inbox,
  Filter
} from "lucide-react";

export interface PublisherNotification {
  id: string;
  type: "approved" | "rejected" | "requested" | "payout" | "paused" | "activated" | "announcement";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  offerId?: string;
  rejectionReason?: string;
}

interface NotificationsViewProps {
  notifications: PublisherNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
}

export function NotificationsView({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll
}: NotificationsViewProps) {
  const [filterType, setFilterType] = useState<string>("all");

  const filteredNotifications = notifications.filter(notif => {
    if (filterType === "all") return true;
    return notif.type === filterType;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "approved":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case "rejected":
        return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      case "requested":
        return <Bell className="w-5 h-5 text-amber-400" />;
      case "payout":
        return <CreditCard className="w-5 h-5 text-cyan-400" />;
      case "paused":
        return <PauseCircle className="w-5 h-5 text-slate-400" />;
      case "activated":
        return <Check className="w-5 h-5 text-sky-400" />;
      case "announcement":
      default:
        return <Megaphone className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "approved":
        return "bg-emerald-950 text-emerald-300 border-emerald-905";
      case "rejected":
        return "bg-rose-950 text-rose-300 border-rose-905";
      case "requested":
        return "bg-amber-950 text-amber-305 border-amber-900";
      case "payout":
        return "bg-cyan-950 text-cyan-300 border-cyan-905";
      case "paused":
        return "bg-slate-950 text-slate-300 border-slate-905";
      case "activated":
        return "bg-sky-950 text-sky-300 border-sky-905";
      case "announcement":
      default:
        return "bg-indigo-950 text-indigo-300 border-indigo-905";
    }
  };

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="notifications-viewport-workspace">
      
      {/* Page Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            Notifications Hub ({notifications.filter(v => !v.isRead).length} unread)
          </h2>
          <p className="text-xs text-slate-400">
            Real-time feed of campaign approvals, rejected traffic review warnings, published releases, and announcements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onMarkAllAsRead}
            disabled={notifications.every(n => n.isRead)}
            className="bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition select-none flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            Mark All Read
          </button>
          
          <button
            onClick={onClearAll}
            disabled={notifications.length === 0}
            className="bg-rose-950/20 border border-rose-900/50 hover:border-rose-800 text-rose-400 disabled:opacity-50 disabled:cursor-not-allowed px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition select-none flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      {/* FILTER CONTROL BAR */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-450">
          <Filter className="w-4 h-4 text-cyan-500" />
          <span>Category Filter:</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { value: "all", label: "All Items" },
            { value: "approved", label: "Approved Offers" },
            { value: "rejected", label: "Rejections" },
            { value: "requested", label: "Access Requests" },
            { value: "payout", label: "Payouts Released" },
            { value: "paused", label: "Paused Notifications" },
            { value: "activated", label: "Activated Offers" },
            { value: "announcement", label: "Network Bulletins" }
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterType(cat.value)}
              className={`px-3 py-1.5 rounded-lg font-semibold uppercase tracking-wider text-[10px] transition font-sans ${
                filterType === cat.value
                  ? "bg-slate-950 text-cyan-400 border border-cyan-900/50 font-bold"
                  : "text-slate-400 hover:bg-slate-950/40 hover:text-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* NOTIFICATIONS LIST CONTAINER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16 text-slate-500 space-y-3 bg-slate-950/40">
            <Inbox className="w-10 h-10 text-slate-700 mx-auto" />
            <p className="text-sm font-semibold font-mono uppercase tracking-wide">No current alerts logged.</p>
            <p className="text-xs max-w-sm mx-auto text-slate-450 leading-relaxed">
              When campaign relationships are updated or payouts are processed, secure notifications will be broadcast here automatically.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-850">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-5 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-sans border-l-4 ${
                  !notif.isRead 
                    ? "bg-cyan-500/[0.02] border-cyan-500" 
                    : "border-transparent hover:bg-slate-850/15"
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="shrink-0 mt-0.5 p-2 bg-slate-950 rounded-xl border border-slate-850">
                    {getIcon(notif.type)}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono tracking-wider font-bold uppercase border ${getBadgeColor(notif.type)}`}>
                        {notif.type}
                      </span>
                      {!notif.isRead && (
                        <span className="text-[8px] font-bold bg-cyan-400 text-slate-950 px-1 rounded uppercase tracking-widest font-mono">
                          NEW
                        </span>
                      )}
                      {notif.offerId && (
                        <span className="text-[9px] font-mono font-medium text-slate-500">
                          Offer ID: #{notif.offerId}
                        </span>
                      )}
                    </div>

                    <strong className="text-sm text-slate-200 block font-bold leading-tight">
                      {notif.title}
                    </strong>
                    
                    <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.rejectionReason && (
                      <div className="p-2.5 mt-2 bg-red-950/20 border border-red-900/40 text-[11px] text-rose-300 font-mono rounded-lg">
                        <strong>REJECTION NOTES:</strong> {notif.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-end gap-3 md:gap-2 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t border-slate-850 md:border-transparent">
                  <span className="text-[10px] text-slate-500 font-mono text-left md:text-right block">
                    {notif.timestamp}
                  </span>
                  
                  <div className="flex gap-2 ml-auto">
                    {!notif.isRead && (
                      <button
                        onClick={() => onMarkAsRead(notif.id)}
                        className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-cyan-400 hover:text-cyan-300 px-2.5 py-1 rounded text-[10px] font-bold font-mono transition uppercase cursor-pointer"
                        title="Mark as read"
                      >
                        Read OK
                      </button>
                    )}
                    
                    <button
                      onClick={() => onDeleteNotification(notif.id)}
                      className="bg-slate-950 border border-slate-850 hover:bg-rose-950/35 text-slate-500 hover:text-rose-400 p-1 rounded-lg transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
