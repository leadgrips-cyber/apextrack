import React, { useEffect, useMemo, useState } from "react";
import { Search, CheckCircle, ArrowRight, Unlink2 } from "lucide-react";
import { listManagers, bulkAssignPublishers, type ManagerRecord } from "../../services/managers";

interface Publisher {
  id: string;
  email: string;
  full_name: string;
  company_name: string | null;
  country_code: string | null;
  account_status: string;
  assigned_manager_id: string | null;
  manager_name: string | null;
}

const API_URL = "/api";

async function fetchPublishers(): Promise<Publisher[]> {
  const token = localStorage.getItem("admin_token") || "";
  const res = await fetch(`${API_URL}/publishers?page_size=200`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Failed to load publishers (${res.status})`);
  const data = await res.json();
  return (data.publishers ?? []) as Publisher[];
}

export function ManagerAssignView() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [managers, setManagers] = useState<ManagerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedPublisherIds, setSelectedPublisherIds] = useState<string[]>([]);
  const [targetManagerId, setTargetManagerId] = useState("");
  const [acting, setActing] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([fetchPublishers(), listManagers()])
      .then(([pubs, mgrs]) => {
        setPublishers(pubs);
        setManagers(mgrs);
        if (mgrs.length > 0) setTargetManagerId(mgrs[0].id);
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load data"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filteredPublishers = useMemo(() => {
    return publishers.filter((p) => {
      const matchesSearch =
        p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All" ||
        p.account_status.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [publishers, searchTerm, statusFilter]);

  const totalAssigned = publishers.filter((p) => p.assigned_manager_id).length;
  const totalUnassigned = publishers.length - totalAssigned;

  const statusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "ACTIVE") return "bg-emerald-100 text-emerald-800 border border-emerald-300";
    if (s === "PENDING") return "bg-amber-100 text-amber-800 border border-amber-300";
    return "bg-slate-100 text-slate-800 border border-slate-300";
  };

  const toggleSelect = (id: string) =>
    setSelectedPublisherIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleSelectAll = () => {
    if (selectedPublisherIds.length === filteredPublishers.length && filteredPublishers.length > 0) {
      setSelectedPublisherIds([]);
    } else {
      setSelectedPublisherIds(filteredPublishers.map((p) => p.id));
    }
  };

  const doAssign = async (managerId: string | null, label: string) => {
    if (selectedPublisherIds.length === 0) return;
    setActing(true);
    setActionMsg(null);
    try {
      const count = await bulkAssignPublishers(selectedPublisherIds, managerId);
      setActionMsg(`${label}: ${count} publisher(s) updated.`);
      setSelectedPublisherIds([]);
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setActing(false);
    }
  };

  const selectedManager = managers.find((m) => m.id === targetManagerId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Managers</div>
        <h2 className="mt-2 text-2xl font-black theme-text-main">Affiliate Assignment Management</h2>
        <p className="mt-1 theme-text-muted text-sm">Assign, transfer, or remove publisher-to-manager assignments.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Total Publishers", publishers.length, "theme-text-main"],
          ["Assigned", totalAssigned, "text-emerald-600"],
          ["Unassigned", totalUnassigned, "text-rose-600"],
          ["Managers", managers.length, "theme-text-main"],
        ].map(([label, val, cls]) => (
          <div key={label as string} className="theme-bg-card border theme-border rounded-3xl p-5">
            <div className="text-xs font-semibold theme-text-secondary">{label as string}</div>
            <div className={`text-3xl font-black mt-2 ${cls as string}`}>{val as number}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 px-5 py-4 text-sm text-rose-700">{error}</div>
      )}
      {actionMsg && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-sm text-emerald-800 font-semibold">{actionMsg}</div>
      )}

      {loading ? (
        <div className="theme-bg-card border theme-border rounded-3xl p-8 text-center text-sm theme-text-muted">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 theme-bg-card border theme-border rounded-3xl p-6">
            <h3 className="text-sm font-bold theme-text-main mb-4">Publisher Directory</h3>
            <div className="mb-4 space-y-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or email…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 theme-bg-well border theme-border rounded-xl text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold theme-text-secondary block mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-2 py-2 theme-bg-well border theme-border rounded-xl text-xs theme-text-main focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="border theme-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b theme-border theme-bg-well">
                    <th className="px-3 py-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 cursor-pointer"
                        checked={selectedPublisherIds.length === filteredPublishers.length && filteredPublishers.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    {["Name", "Email", "Status", "Current Manager"].map((h) => (
                      <th key={h} className="text-left px-3 py-3 text-xs font-bold theme-text-secondary">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPublishers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-sm theme-text-muted">No publishers match filters.</td>
                    </tr>
                  ) : (
                    filteredPublishers.map((p) => (
                      <tr
                        key={p.id}
                        className="border-b theme-border hover:theme-bg-well cursor-pointer transition-colors"
                        onClick={() => toggleSelect(p.id)}
                      >
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 cursor-pointer"
                            checked={selectedPublisherIds.includes(p.id)}
                            onChange={() => toggleSelect(p.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-3 py-3 text-xs font-semibold theme-text-main">{p.full_name}</td>
                        <td className="px-3 py-3 text-xs font-mono theme-text-muted">{p.email}</td>
                        <td className="px-3 py-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${statusBadge(p.account_status)}`}>
                            {p.account_status}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-xs theme-text-main">
                          {p.manager_name ?? <span className="theme-text-muted italic">Unassigned</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-xs theme-text-muted mt-3">
              Showing {filteredPublishers.length} of {publishers.length} publishers • {selectedPublisherIds.length} selected
            </p>
          </div>

          <div className="theme-bg-card border theme-border rounded-3xl p-6 h-fit space-y-4">
            <h3 className="text-sm font-bold theme-text-main">Target Manager</h3>
            {managers.length === 0 ? (
              <p className="text-xs theme-text-muted">No managers found. Create one first.</p>
            ) : (
              <>
                <select
                  value={targetManagerId}
                  onChange={(e) => setTargetManagerId(e.target.value)}
                  className="w-full px-3 py-2 theme-bg-well border theme-border rounded-xl text-sm theme-text-main focus:outline-none"
                >
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.full_name} ({m.assigned_count ?? 0} assigned)
                    </option>
                  ))}
                </select>
                {selectedManager && (
                  <div className="space-y-2 text-xs theme-text-muted">
                    <div><span className="font-semibold theme-text-secondary">Email: </span>{selectedManager.email}</div>
                    {selectedManager.settings?.telegram && (
                      <div><span className="font-semibold theme-text-secondary">Telegram: </span>{selectedManager.settings.telegram}</div>
                    )}
                    <div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${selectedManager.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {selectedManager.is_active ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className="theme-bg-card border theme-border rounded-3xl p-6">
        <h3 className="text-sm font-bold theme-text-main mb-4">Bulk Assignment Actions</h3>
        <div className="flex gap-3 flex-wrap">
          <button
            disabled={!targetManagerId || selectedPublisherIds.length === 0 || acting}
            onClick={() => doAssign(targetManagerId, "Assigned")}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle size={16} /> Assign Selected Affiliates
          </button>
          <button
            disabled={!targetManagerId || selectedPublisherIds.length === 0 || acting}
            onClick={() => doAssign(targetManagerId, "Transferred")}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowRight size={16} /> Transfer To Another Manager
          </button>
          <button
            disabled={selectedPublisherIds.length === 0 || acting}
            onClick={() => doAssign(null, "Unassigned")}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Unlink2 size={16} /> Remove Assignment
          </button>
        </div>
      </div>
    </div>
  );
}
