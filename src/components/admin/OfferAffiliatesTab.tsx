import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  UserCheck,
  UserMinus,
  Users,
  Loader2,
  X,
  CheckSquare,
  Square,
  RefreshCw,
} from "lucide-react";
import * as api from "../../services/offerAssignments";

type Publisher = api.PublisherAssignmentRecord;

interface Props {
  offerId: number;
}

export function OfferAffiliatesTab({ offerId }: Props) {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actingId, setActingId] = useState<string | null>(null);
  const [bulkActing, setBulkActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Debounce search 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    load(debouncedSearch);
    setSelected(new Set());
  }, [offerId, debouncedSearch]);

  async function load(searchTerm?: string) {
    setLoading(true);
    setLoadError(null);
    try {
      setPublishers(await api.listPublishersWithAssignment(offerId, searchTerm));
    } catch (err: any) {
      setLoadError(err.message || "Failed to load affiliates");
    } finally {
      setLoading(false);
    }
  }

  // ── Single assign/unassign ────────────────────────────────────────────────
  async function handleAssign(pub: Publisher) {
    setActingId(pub.id);
    setActionError(null);
    try {
      await api.assignPublisher(offerId, pub.id);
      setPublishers((prev) =>
        prev.map((p) => (p.id === pub.id ? { ...p, is_assigned: true, assigned_at: new Date().toISOString() } : p))
      );
    } catch (err: any) {
      setActionError(err.message || "Failed to assign");
    } finally {
      setActingId(null);
    }
  }

  async function handleUnassign(pub: Publisher) {
    setActingId(pub.id);
    setActionError(null);
    try {
      await api.unassignPublisher(offerId, pub.id);
      setPublishers((prev) =>
        prev.map((p) => (p.id === pub.id ? { ...p, is_assigned: false, assigned_at: null } : p))
      );
    } catch (err: any) {
      setActionError(err.message || "Failed to remove");
    } finally {
      setActingId(null);
    }
  }

  // ── Bulk operations ───────────────────────────────────────────────────────
  async function handleBulkAssign() {
    const ids = [...selected].filter((id) => {
      const p = publishers.find((x) => x.id === id);
      return p && !p.is_assigned;
    });
    if (ids.length === 0) return;
    setBulkActing(true);
    setActionError(null);
    try {
      await api.bulkAssign(offerId, ids);
      setPublishers((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, is_assigned: true, assigned_at: new Date().toISOString() } : p))
      );
      setSelected(new Set());
    } catch (err: any) {
      setActionError(err.message || "Bulk assign failed");
    } finally {
      setBulkActing(false);
    }
  }

  async function handleBulkUnassign() {
    const ids = [...selected].filter((id) => {
      const p = publishers.find((x) => x.id === id);
      return p && p.is_assigned;
    });
    if (ids.length === 0) return;
    setBulkActing(true);
    setActionError(null);
    try {
      await api.bulkUnassign(offerId, ids);
      setPublishers((prev) =>
        prev.map((p) => (ids.includes(p.id) ? { ...p, is_assigned: false, assigned_at: null } : p))
      );
      setSelected(new Set());
    } catch (err: any) {
      setActionError(err.message || "Bulk remove failed");
    } finally {
      setBulkActing(false);
    }
  }

  // ── Selection helpers ─────────────────────────────────────────────────────
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const allVisible = publishers.map((p) => p.id);
  const allSelected = allVisible.length > 0 && allVisible.every((id) => selected.has(id));
  const someSelected = allVisible.some((id) => selected.has(id));

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allVisible));
    }
  }

  // ── Derived counts ────────────────────────────────────────────────────────
  const assignedCount = useMemo(() => publishers.filter((p) => p.is_assigned).length, [publishers]);
  const selectedUnassigned = useMemo(
    () => [...selected].filter((id) => publishers.find((p) => p.id === id && !p.is_assigned)).length,
    [selected, publishers]
  );
  const selectedAssigned = useMemo(
    () => [...selected].filter((id) => publishers.find((p) => p.id === id && p.is_assigned)).length,
    [selected, publishers]
  );

  return (
    <div className="space-y-4">
      {/* Error banner */}
      {actionError && (
        <div className="flex items-center justify-between rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header row: stats + search + refresh */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Assignment count badge */}
        <div className="flex items-center gap-2 rounded-2xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 px-4 py-2">
          <UserCheck className="w-4 h-4 text-cyan-600" />
          <span className="text-sm font-bold text-cyan-700 dark:text-cyan-400">
            {loading ? "—" : assignedCount} Assigned
          </span>
          {!loading && (
            <span className="text-xs text-cyan-500">/ {publishers.length} active</span>
          )}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or code…"
            className="w-full rounded-2xl border theme-border bg-white dark:bg-slate-950 pl-9 pr-4 py-2.5 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        {/* Refresh */}
        <button
          onClick={() => load(debouncedSearch)}
          disabled={loading}
          className="rounded-2xl border theme-border px-3 py-2.5 text-xs font-semibold theme-text-secondary hover:theme-text-main transition flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Bulk action bar — visible when any checkbox is ticked */}
      {someSelected && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border theme-border px-4 py-3">
          <span className="text-xs font-semibold theme-text-muted">
            {selected.size} selected
          </span>

          {selectedUnassigned > 0 && (
            <button
              onClick={handleBulkAssign}
              disabled={bulkActing}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {bulkActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
              Assign Selected ({selectedUnassigned})
            </button>
          )}

          {selectedAssigned > 0 && (
            <button
              onClick={handleBulkUnassign}
              disabled={bulkActing}
              className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {bulkActing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />}
              Remove Selected ({selectedAssigned})
            </button>
          )}

          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs theme-text-muted hover:theme-text-main transition"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="px-4 py-4 w-10">
                <button
                  onClick={toggleSelectAll}
                  className="theme-text-muted hover:theme-text-main transition"
                  title={allSelected ? "Deselect all" : "Select all"}
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-cyan-600" />
                  ) : someSelected ? (
                    <CheckSquare className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-4 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">Affiliate</th>
              <th className="px-4 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">Company</th>
              <th className="px-4 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">Code</th>
              <th className="px-4 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">Status</th>
              <th className="px-4 py-4 text-right text-[10px] uppercase tracking-widest text-slate-500">Assignment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                  Loading affiliates…
                </td>
              </tr>
            ) : loadError ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-red-500">{loadError}</td>
              </tr>
            ) : publishers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">
                    {search ? "No affiliates match your search." : "No active affiliates in the network yet."}
                  </p>
                </td>
              </tr>
            ) : (
              publishers.map((pub) => {
                const isActing = actingId === pub.id;
                const isSelected = selected.has(pub.id);
                return (
                  <tr
                    key={pub.id}
                    className={`transition-colors ${
                      pub.is_assigned
                        ? "bg-emerald-50/30 dark:bg-emerald-900/10"
                        : ""
                    } ${isSelected ? "bg-cyan-50/50 dark:bg-cyan-900/20" : ""}`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-4 w-10">
                      <button
                        onClick={() => toggleSelect(pub.id)}
                        className="theme-text-muted hover:theme-text-main transition"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-cyan-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Name + email */}
                    <td className="px-4 py-4 min-w-0">
                      <div className="text-sm font-semibold theme-text-main truncate max-w-[180px]">
                        {pub.full_name}
                      </div>
                      <div className="text-xs theme-text-muted truncate max-w-[180px]">
                        {pub.email}
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-4 py-4 text-sm theme-text-muted whitespace-nowrap">
                      {pub.company_name || <span className="text-slate-300 dark:text-slate-600">—</span>}
                    </td>

                    {/* Affiliate code */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-0.5">
                        {pub.affiliate_code}
                      </span>
                    </td>

                    {/* Assignment status */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {pub.is_assigned ? (
                        <div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-1 text-xs font-semibold">
                            <UserCheck className="w-3 h-3" />
                            Assigned
                          </span>
                          {pub.assigned_at && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(pub.assigned_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-1 text-xs font-semibold">
                          Not assigned
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      {pub.is_assigned ? (
                        <button
                          onClick={() => handleUnassign(pub)}
                          disabled={isActing || bulkActing}
                          className="rounded-full bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isActing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserMinus className="w-3.5 h-3.5" />
                          )}
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAssign(pub)}
                          disabled={isActing || bulkActing}
                          className="rounded-full bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isActing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          Assign
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
