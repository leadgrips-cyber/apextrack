import { useState, useMemo } from "react";
import { managerMetrics, managerActivity } from "./managerDemoData";
import { Users, Tag, Activity, DollarSign, Eye, MessageSquare } from "lucide-react";

interface AssignedAffiliate {
  id: string;
  name: string;
  country: string;
  registrationDate: string;
  status: "Active" | "Pending" | "Suspended";
  reviewStatus: "Pending Review" | "Under Review" | "Recommended" | "Needs Info";
}

const SAMPLE_ASSIGNED_AFFILIATES: AssignedAffiliate[] = [
  {
    id: "AFF-001",
    name: "Avery Chan Media",
    country: "United States",
    registrationDate: "2026-05-15",
    status: "Pending",
    reviewStatus: "Pending Review",
  },
  {
    id: "AFF-002",
    name: "Global Traffic Network",
    country: "Canada",
    registrationDate: "2026-05-18",
    status: "Pending",
    reviewStatus: "Under Review",
  },
  {
    id: "AFF-006",
    name: "Media Ventures Asia",
    country: "Singapore",
    registrationDate: "2026-04-20",
    status: "Active",
    reviewStatus: "Recommended",
  },
];

export function ManagerDashboardView() {
  const [selectedAffiliate, setSelectedAffiliate] = useState<AssignedAffiliate | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-700";
      case "Pending":
        return "bg-amber-100 text-amber-700";
      case "Suspended":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getReviewStatusColor = (status: string) => {
    switch (status) {
      case "Pending Review":
        return "bg-slate-100 text-slate-700";
      case "Under Review":
        return "bg-blue-100 text-blue-700";
      case "Recommended":
        return "bg-emerald-100 text-emerald-700";
      case "Needs Info":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-4">
        {managerMetrics.map((m) => (
          <div key={m.id} className="theme-bg-card border theme-border rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs uppercase tracking-[0.25em] font-bold theme-text-muted">{m.label}</div>
              <div className="text-cyan-600 dark:text-cyan-400 font-black text-xl">{m.delta}</div>
            </div>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <div className="text-3xl font-black theme-text-main">{m.value}</div>
                <div className="mt-2 text-sm theme-text-muted">{m.description}</div>
              </div>
              <div className="rounded-2xl bg-slate-100 dark:bg-slate-900 p-3 text-cyan-600 dark:text-cyan-300">
                {m.id === "monthly" ? <DollarSign className="w-5 h-5" /> : m.id === "assigned" ? <Users className="w-5 h-5" /> : m.id === "active_offers" ? <Tag className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* My Assigned Affiliates Section */}
      <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Affiliate Management</div>
        <div className="mt-2 text-xl font-black theme-text-main">My Assigned Affiliates</div>
        <p className="mt-1 text-sm theme-text-muted">Review and manage your assigned affiliate accounts</p>

        <div className="mt-6 overflow-x-auto rounded-2xl border theme-border">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest theme-text-secondary">Affiliate ID</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest theme-text-secondary">Full Name</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest theme-text-secondary">Country</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest theme-text-secondary">Registration Date</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest theme-text-secondary">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest theme-text-secondary">Review Status</th>
                <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-widest theme-text-secondary">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {SAMPLE_ASSIGNED_AFFILIATES.map((affiliate) => (
                <tr key={affiliate.id}>
                  <td className="px-4 py-4 text-xs font-mono font-semibold theme-text-main">{affiliate.id}</td>
                  <td className="px-4 py-4 text-sm font-semibold theme-text-main">{affiliate.name}</td>
                  <td className="px-4 py-4 text-sm theme-text-main">{affiliate.country}</td>
                  <td className="px-4 py-4 text-xs font-mono theme-text-main">{affiliate.registrationDate}</td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(affiliate.status)}`}>
                      {affiliate.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getReviewStatusColor(affiliate.reviewStatus)}`}>
                      {affiliate.reviewStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => setSelectedAffiliate(affiliate)}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-600 hover:text-cyan-700"
                    >
                      <Eye className="w-4 h-4" /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Recent Activity</div>
          <div className="mt-6 space-y-4">
            {managerActivity.map((a) => (
              <div key={a.id} className="theme-bg-well border theme-border rounded-3xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold theme-text-main">{a.title}</div>
                    <div className="mt-1 text-sm theme-text-muted">{a.detail}</div>
                  </div>
                  <div className="text-xs font-semibold theme-text-muted">{a.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Quick Actions</div>
          <div className="mt-4 space-y-3">
            <button className="w-full rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white flex items-center justify-center gap-2 hover:bg-cyan-700">
              <Eye className="w-4 h-4" /> Review Assigned Affiliates
            </button>
            <button className="w-full rounded-2xl border theme-border px-4 py-3 text-sm font-semibold theme-text-secondary hover:bg-opacity-50 flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" /> View Manager Messages
            </button>
          </div>
        </div>
      </section>

      {/* Affiliate Review Modal - Simple Display */}
      {selectedAffiliate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-950 rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b theme-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black theme-text-main">{selectedAffiliate.name}</h2>
                  <p className="text-sm theme-text-muted mt-1">{selectedAffiliate.id}</p>
                </div>
                <button
                  onClick={() => setSelectedAffiliate(null)}
                  className="text-lg theme-text-muted hover:theme-text-main"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold theme-text-main mb-3">Current Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="theme-bg-well border theme-border rounded-xl p-3">
                    <p className="text-xs theme-text-secondary mb-1">Account Status</p>
                    <p className="font-semibold theme-text-main">{selectedAffiliate.status}</p>
                  </div>
                  <div className="theme-bg-well border theme-border rounded-xl p-3">
                    <p className="text-xs theme-text-secondary mb-1">Review Status</p>
                    <p className="font-semibold theme-text-main">{selectedAffiliate.reviewStatus}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold theme-text-main mb-3">Affiliate Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="theme-text-secondary">Registration Date:</span>
                    <span className="font-mono theme-text-main">{selectedAffiliate.registrationDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="theme-text-secondary">Country:</span>
                    <span className="theme-text-main">{selectedAffiliate.country}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t theme-border">
                <p className="text-xs theme-text-muted mb-3">
                  View the full affiliate profile in the Publisher Review section to add notes and recommendations.
                </p>
                <button
                  onClick={() => setSelectedAffiliate(null)}
                  className="w-full px-4 py-2 bg-slate-600 text-white rounded-xl text-sm font-semibold hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
