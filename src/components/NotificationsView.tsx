import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  Check,
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
  CreditCard,
  Megaphone,
  Inbox,
} from "lucide-react";
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
  NotificationRecord,
} from "../services/notifications";

// Type badge icon based on notification_type
function getIcon(type: string) {
  switch (type) {
    case "approved":
      return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
    case "rejected":
      return <AlertTriangle className="w-5 h-5 text-rose-400" />;
    case "payout":
      return <CreditCard className="w-5 h-5 text-cyan-400" />;
    case "paused":
      return <PauseCircle className="w-5 h-5 text-slate-400" />;
    case "announcement":
      return <Megaphone className="w-5 h-5 text-indigo-400" />;
    default:
      return <Bell className="w-5 h-5 text-amber-400" />;
  }
}

function fmtDate(s: string) {
  return new Date(s).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PAGE_SIZE = 30;

export function NotificationsView() {
  const [rows, setRows] = useState<NotificationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listNotifications(page, PAGE_SIZE);
      setRows(result.rows);
      setTotal(result.total);
      setUnreadCount(result.unread_count);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleMarkOne(id: string) {
    try {
      await markAsRead(id);
      setRows((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}
  }

  async function handleMarkAll() {
    try {
      await markAllAsRead();
      setRows((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border theme-border bg-slate-50 dark:bg-slate-900 px-6 py-5">
        <div>
          <h2 className="text-lg font-bold theme-text-main flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </h2>
          <p className="text-xs theme-text-muted mt-1">
            System notifications — conversion updates, payouts, and account activity.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border theme-border text-xs font-semibold theme-text-secondary hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            Mark All Read
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-400 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Notifications list */}
      <div className="rounded-2xl border theme-border overflow-hidden">
        {loading ? (
          <div className="px-4 py-12 text-center text-sm theme-text-muted">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-16 text-center space-y-3">
            <Inbox className="w-10 h-10 mx-auto theme-text-muted opacity-30" />
            <p className="text-sm font-semibold theme-text-muted">No notifications yet.</p>
            <p className="text-xs theme-text-muted max-w-sm mx-auto">
              System events like conversion approvals, payouts, and account changes will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y theme-divide">
            {rows.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 px-5 py-4 transition border-l-4 ${
                  !n.is_read
                    ? "border-cyan-500 bg-cyan-50/30 dark:bg-cyan-900/10"
                    : "border-transparent hover:bg-slate-50 dark:hover:bg-slate-900/30"
                }`}
              >
                {/* Icon */}
                <div className="shrink-0 mt-0.5 p-2 rounded-xl border theme-border bg-slate-50 dark:bg-slate-900">
                  {getIcon(n.notification_type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {!n.is_read && (
                      <span className="text-[8px] font-bold bg-cyan-400 text-slate-950 px-1.5 py-0.5 rounded uppercase tracking-widest font-mono">
                        NEW
                      </span>
                    )}
                    <span className="text-xs font-mono theme-text-muted uppercase tracking-wider">
                      {n.notification_type}
                    </span>
                  </div>
                  <p className={`text-sm theme-text-main leading-snug ${!n.is_read ? "font-semibold" : ""}`}>
                    {n.title}
                  </p>
                  <p className="text-xs theme-text-muted mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] theme-text-muted mt-2 font-mono">{fmtDate(n.created_at)}</p>
                </div>

                {/* Mark-as-read button */}
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkOne(n.id)}
                    className="shrink-0 mt-1 px-2.5 py-1 rounded-lg border theme-border text-[10px] font-bold font-mono uppercase tracking-wider text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition"
                    title="Mark as read"
                  >
                    Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm theme-text-muted">
          <span>
            Page {page} of {totalPages} &middot; {total} total
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border theme-border hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl border theme-border hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
