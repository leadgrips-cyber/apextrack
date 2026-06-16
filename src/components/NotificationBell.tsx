import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, X, Inbox } from "lucide-react";
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  NotificationRecord,
} from "../services/notifications";

interface NotificationBellProps {
  onViewAll: () => void;
}

function fmtDate(s: string) {
  return new Date(s).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationBell({ onViewAll }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const result = await listNotifications(1, 20);
      setNotifications(result.rows);
      setUnreadCount(result.unread_count);
    } catch {
      // silent — backend may be offline
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  async function handleMarkOne(id: string) {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }

  async function handleMarkAll() {
    setLoading(true);
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
    setLoading(false);
  }

  function handleViewAll() {
    setOpen(false);
    onViewAll();
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl theme-bg-well border theme-border theme-text-muted hover:theme-text-main transition h-9 w-9 flex items-center justify-center cursor-pointer"
        title="Notifications"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none pointer-events-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] bg-white dark:bg-slate-900 border theme-border rounded-2xl shadow-2xl z-50 overflow-hidden">

          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b theme-border">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-500" />
              <span className="text-sm font-bold theme-text-main">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  disabled={loading}
                  className="text-[10px] font-semibold text-cyan-500 hover:text-cyan-400 transition px-2 py-1 rounded-lg hover:bg-cyan-50 dark:hover:bg-cyan-900/20 disabled:opacity-50"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg theme-text-muted hover:theme-text-main transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Inbox className="w-8 h-8 mx-auto mb-2 theme-text-muted opacity-40" />
                <p className="text-sm theme-text-muted">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b theme-border last:border-0 flex items-start gap-3 transition ${
                    !n.is_read
                      ? "bg-cyan-50/50 dark:bg-cyan-900/10"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                  }`}
                >
                  <div
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      !n.is_read ? "bg-cyan-500" : "bg-transparent"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs theme-text-main leading-snug ${
                        !n.is_read ? "font-semibold" : ""
                      }`}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs theme-text-muted mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[10px] theme-text-muted mt-1 font-mono">
                      {fmtDate(n.created_at)}
                    </p>
                  </div>
                  {!n.is_read && (
                    <button
                      onClick={() => handleMarkOne(n.id)}
                      className="p-1.5 rounded-lg text-cyan-500 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition shrink-0"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t theme-border bg-slate-50 dark:bg-slate-950/50">
            <button
              onClick={handleViewAll}
              className="w-full text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition text-center py-1"
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
