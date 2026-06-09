import React, { useState, useMemo } from "react";
import { Search, Filter, ArrowRight, Link2, Unlink2, CheckCircle } from "lucide-react";

type AffiliateStatus = "Active" | "Inactive" | "Pending";

interface Affiliate {
  id: string;
  name: string;
  country: string;
  status: AffiliateStatus;
  currentManager: string;
  revenue: number;
  commissionRate: number;
}

interface Manager {
  id: string;
  name: string;
  email: string;
  region: string;
  currentAffiliateCount: number;
  maximumAllowedAffiliates: number;
}

interface AssignmentHistory {
  id: string;
  date: string;
  affiliate: string;
  previousManager: string;
  newManager: string;
  assignedBy: string;
}

const SAMPLE_AFFILIATES: Affiliate[] = [
  {
    id: "AFF-001",
    name: "Avery Chan Media",
    country: "United States",
    status: "Active",
    currentManager: "Sarah Johnson",
    revenue: 45230.50,
    commissionRate: 25,
  },
  {
    id: "AFF-002",
    name: "Global Traffic Network",
    country: "Canada",
    status: "Active",
    currentManager: "Sarah Johnson",
    revenue: 32150.00,
    commissionRate: 20,
  },
  {
    id: "AFF-003",
    name: "Premium Affiliates Inc",
    country: "United Kingdom",
    status: "Pending",
    currentManager: "Unassigned",
    revenue: 0,
    commissionRate: 0,
  },
  {
    id: "AFF-004",
    name: "Digital Marketing Co",
    country: "Germany",
    status: "Active",
    currentManager: "Marcus Chen",
    revenue: 28900.75,
    commissionRate: 22,
  },
  {
    id: "AFF-005",
    name: "Performance Traders LLC",
    country: "Australia",
    status: "Inactive",
    currentManager: "Unassigned",
    revenue: 5200.00,
    commissionRate: 18,
  },
  {
    id: "AFF-006",
    name: "Media Ventures Asia",
    country: "Singapore",
    status: "Active",
    currentManager: "Lisa Wang",
    revenue: 38600.25,
    commissionRate: 24,
  },
  {
    id: "AFF-007",
    name: "Traffic Innovations",
    country: "France",
    status: "Active",
    currentManager: "Sarah Johnson",
    revenue: 22300.00,
    commissionRate: 21,
  },
  {
    id: "AFF-008",
    name: "Direct Response Partners",
    country: "Netherlands",
    status: "Pending",
    currentManager: "Unassigned",
    revenue: 0,
    commissionRate: 0,
  },
];

const SAMPLE_MANAGERS: Manager[] = [
  {
    id: "MGR-001",
    name: "Sarah Johnson",
    email: "sarah.johnson@apextrack.com",
    region: "North America",
    currentAffiliateCount: 3,
    maximumAllowedAffiliates: 10,
  },
  {
    id: "MGR-002",
    name: "Marcus Chen",
    email: "marcus.chen@apextrack.com",
    region: "APAC",
    currentAffiliateCount: 1,
    maximumAllowedAffiliates: 8,
  },
  {
    id: "MGR-003",
    name: "Lisa Wang",
    email: "lisa.wang@apextrack.com",
    region: "APAC",
    currentAffiliateCount: 1,
    maximumAllowedAffiliates: 8,
  },
  {
    id: "MGR-004",
    name: "James Mitchell",
    email: "james.mitchell@apextrack.com",
    region: "EMEA",
    currentAffiliateCount: 0,
    maximumAllowedAffiliates: 10,
  },
];

const SAMPLE_ASSIGNMENT_HISTORY: AssignmentHistory[] = [
  {
    id: "hist-1",
    date: "2026-06-08 15:42:00",
    affiliate: "Media Ventures Asia",
    previousManager: "Unassigned",
    newManager: "Lisa Wang",
    assignedBy: "Admin User",
  },
  {
    id: "hist-2",
    date: "2026-06-07 10:15:30",
    affiliate: "Digital Marketing Co",
    previousManager: "Sarah Johnson",
    newManager: "Marcus Chen",
    assignedBy: "Admin User",
  },
  {
    id: "hist-3",
    date: "2026-06-06 14:28:00",
    affiliate: "Traffic Innovations",
    previousManager: "Unassigned",
    newManager: "Sarah Johnson",
    assignedBy: "Admin User",
  },
  {
    id: "hist-4",
    date: "2026-06-05 09:10:45",
    affiliate: "Global Traffic Network",
    previousManager: "James Mitchell",
    newManager: "Sarah Johnson",
    assignedBy: "Admin User",
  },
];

export function ManagerAssignView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AffiliateStatus | "All">("All");
  const [countryFilter, setCountryFilter] = useState("All");
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(SAMPLE_AFFILIATES[0]);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(SAMPLE_MANAGERS[0]);
  const [selectedAffiliates, setSelectedAffiliates] = useState<string[]>([]);

  // Get unique countries
  const countries = useMemo(
    () => ["All", ...Array.from(new Set(SAMPLE_AFFILIATES.map((a) => a.country)))],
    []
  );

  // Calculate summary metrics
  const totalAffiliates = SAMPLE_AFFILIATES.length;
  const assignedAffiliates = SAMPLE_AFFILIATES.filter((a) => a.currentManager !== "Unassigned").length;
  const unassignedAffiliates = totalAffiliates - assignedAffiliates;
  const totalManagers = SAMPLE_MANAGERS.length;

  // Filter affiliates
  const filteredAffiliates = useMemo(() => {
    return SAMPLE_AFFILIATES.filter((affiliate) => {
      const matchesSearch =
        affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All" || affiliate.status === statusFilter;
      const matchesCountry = countryFilter === "All" || affiliate.country === countryFilter;
      return matchesSearch && matchesStatus && matchesCountry;
    });
  }, [searchTerm, statusFilter, countryFilter]);

  const getStatusColor = (status: AffiliateStatus) => {
    switch (status) {
      case "Active":
        return "bg-emerald-100 text-emerald-800 border border-emerald-300";
      case "Inactive":
        return "bg-slate-100 text-slate-800 border border-slate-300";
      case "Pending":
        return "bg-amber-100 text-amber-800 border border-amber-300";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const toggleAffiliateSelection = (affiliateId: string) => {
    setSelectedAffiliates((prev) =>
      prev.includes(affiliateId) ? prev.filter((id) => id !== affiliateId) : [...prev, affiliateId]
    );
  };

  const capacityPercentage = selectedManager
    ? Math.round((selectedManager.currentAffiliateCount / selectedManager.maximumAllowedAffiliates) * 100)
    : 0;

  return (
    <div>
      <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Managers</div>
      <h2 className="mt-2 text-2xl font-black theme-text-main">Affiliate Assignment Management</h2>
      <p className="mt-1 theme-text-muted text-sm">Manage affiliate-to-manager assignments and track assignment history.</p>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="theme-bg-card border theme-border rounded-3xl p-6">
          <h3 className="text-xs font-semibold theme-text-secondary mb-2">Total Affiliates</h3>
          <div className="text-4xl font-black theme-text-main">{totalAffiliates}</div>
          <p className="text-xs theme-text-muted mt-2">All affiliate accounts</p>
        </div>

        <div className="theme-bg-card border theme-border rounded-3xl p-6">
          <h3 className="text-xs font-semibold theme-text-secondary mb-2">Assigned Affiliates</h3>
          <div className="text-4xl font-black text-emerald-600">{assignedAffiliates}</div>
          <p className="text-xs theme-text-muted mt-2">Active manager assignments</p>
        </div>

        <div className="theme-bg-card border theme-border rounded-3xl p-6">
          <h3 className="text-xs font-semibold theme-text-secondary mb-2">Unassigned Affiliates</h3>
          <div className="text-4xl font-black text-rose-600">{unassignedAffiliates}</div>
          <p className="text-xs theme-text-muted mt-2">Pending manager assignment</p>
        </div>

        <div className="theme-bg-card border theme-border rounded-3xl p-6">
          <h3 className="text-xs font-semibold theme-text-secondary mb-2">Total Managers</h3>
          <div className="text-4xl font-black theme-text-main">{totalManagers}</div>
          <p className="text-xs theme-text-muted mt-2">Active account managers</p>
        </div>
      </div>

      {/* Main Assignment Panel */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Affiliate Table */}
        <div className="lg:col-span-2 theme-bg-card border theme-border rounded-3xl p-6">
          <h3 className="text-sm font-bold theme-text-main mb-4">Affiliate Directory</h3>

          {/* Search and Filters */}
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search by affiliate name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 theme-bg-well border theme-border rounded-xl text-sm theme-text-main placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold theme-text-secondary mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AffiliateStatus | "All")}
                  className="w-full px-2 py-2 theme-bg-well border theme-border rounded-xl text-xs theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold theme-text-secondary mb-1">Country</label>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full px-2 py-2 theme-bg-well border theme-border rounded-xl text-xs theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Affiliates Table */}
          <div className="overflow-x-auto border theme-border rounded-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b theme-border bg-opacity-50 theme-bg-well">
                  <th className="px-3 py-3 text-left">
                    <input
                      type="checkbox"
                      className="w-4 h-4 cursor-pointer"
                      checked={selectedAffiliates.length === filteredAffiliates.length && filteredAffiliates.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAffiliates(filteredAffiliates.map((a) => a.id));
                        } else {
                          setSelectedAffiliates([]);
                        }
                      }}
                    />
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-bold theme-text-secondary">ID</th>
                  <th className="text-left px-3 py-3 text-xs font-bold theme-text-secondary">Name</th>
                  <th className="text-left px-3 py-3 text-xs font-bold theme-text-secondary">Country</th>
                  <th className="text-left px-3 py-3 text-xs font-bold theme-text-secondary">Status</th>
                  <th className="text-left px-3 py-3 text-xs font-bold theme-text-secondary">Current Manager</th>
                </tr>
              </thead>
              <tbody>
                {filteredAffiliates.map((affiliate) => (
                  <tr
                    key={affiliate.id}
                    className="border-b theme-border hover:bg-opacity-50 hover:theme-bg-well transition-colors cursor-pointer"
                    onClick={() => setSelectedAffiliate(affiliate)}
                  >
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 cursor-pointer"
                        checked={selectedAffiliates.includes(affiliate.id)}
                        onChange={() => toggleAffiliateSelection(affiliate.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-3 py-3 text-xs font-mono theme-text-main">{affiliate.id}</td>
                    <td className="px-3 py-3 text-xs font-semibold theme-text-main">{affiliate.name}</td>
                    <td className="px-3 py-3 text-xs theme-text-main">{affiliate.country}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getStatusColor(affiliate.status)}`}>
                        {affiliate.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs theme-text-main font-semibold">{affiliate.currentManager}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs theme-text-muted mt-3">
            Showing {filteredAffiliates.length} of {totalAffiliates} affiliates • {selectedAffiliates.length} selected
          </p>
        </div>

        {/* Right: Manager Details Card */}
        <div className="theme-bg-card border theme-border rounded-3xl p-6 h-fit">
          <h3 className="text-sm font-bold theme-text-main mb-4">Manager Details</h3>

          {selectedManager ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold theme-text-secondary mb-1">Manager Name</p>
                <p className="text-sm font-bold theme-text-main">{selectedManager.name}</p>
              </div>

              <div>
                <p className="text-xs font-semibold theme-text-secondary mb-1">Email</p>
                <p className="text-xs theme-text-main font-mono break-all">{selectedManager.email}</p>
              </div>

              <div>
                <p className="text-xs font-semibold theme-text-secondary mb-1">Region</p>
                <p className="text-sm theme-text-main">{selectedManager.region}</p>
              </div>

              <div>
                <p className="text-xs font-semibold theme-text-secondary mb-2">Affiliate Capacity</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs theme-text-main font-semibold">
                      {selectedManager.currentAffiliateCount} / {selectedManager.maximumAllowedAffiliates}
                    </span>
                    <span className="text-xs font-bold text-cyan-600">{capacityPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        capacityPercentage > 80 ? "bg-rose-500" : capacityPercentage > 50 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${capacityPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t theme-border">
                <select
                  value={selectedManager.id}
                  onChange={(e) => {
                    const manager = SAMPLE_MANAGERS.find((m) => m.id === e.target.value);
                    if (manager) setSelectedManager(manager);
                  }}
                  className="w-full px-3 py-2 theme-bg-well border theme-border rounded-xl text-xs theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {SAMPLE_MANAGERS.map((mgr) => (
                    <option key={mgr.id} value={mgr.id}>
                      {mgr.name} ({mgr.currentAffiliateCount}/{mgr.maximumAllowedAffiliates})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <p className="text-xs theme-text-muted">Select a manager to view details</p>
          )}
        </div>
      </div>

      {/* Bulk Assignment Actions */}
      <div className="mt-6 theme-bg-card border theme-border rounded-3xl p-6">
        <h3 className="text-sm font-bold theme-text-main mb-4">Bulk Assignment Actions</h3>
        <div className="flex gap-3 flex-wrap">
          <button
            disabled={!selectedManager || selectedAffiliates.length === 0}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle size={16} /> Assign Selected Affiliates
          </button>
          <button
            disabled={selectedAffiliates.length === 0}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-semibold hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowRight size={16} /> Transfer To Another Manager
          </button>
          <button
            disabled={selectedAffiliates.length === 0}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Unlink2 size={16} /> Remove Assignment
          </button>
        </div>
      </div>

      {/* Assignment History Table */}
      <div className="mt-6 theme-bg-card border theme-border rounded-3xl p-6">
        <h3 className="text-sm font-bold theme-text-main mb-4">Assignment History</h3>
        <div className="overflow-x-auto border theme-border rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b theme-border bg-opacity-50 theme-bg-well">
                <th className="text-left px-4 py-3 text-xs font-bold theme-text-secondary">Date</th>
                <th className="text-left px-4 py-3 text-xs font-bold theme-text-secondary">Affiliate</th>
                <th className="text-left px-4 py-3 text-xs font-bold theme-text-secondary">Previous Manager</th>
                <th className="text-left px-4 py-3 text-xs font-bold theme-text-secondary">New Manager</th>
                <th className="text-left px-4 py-3 text-xs font-bold theme-text-secondary">Assigned By</th>
                <th className="text-left px-4 py-3 text-xs font-bold theme-text-secondary">Action</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_ASSIGNMENT_HISTORY.map((history) => (
                <tr key={history.id} className="border-b theme-border hover:bg-opacity-50 hover:theme-bg-well transition-colors">
                  <td className="px-4 py-3 text-xs font-mono theme-text-main">{history.date}</td>
                  <td className="px-4 py-3 text-xs font-semibold theme-text-main">{history.affiliate}</td>
                  <td className="px-4 py-3 text-xs theme-text-main">{history.previousManager}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-emerald-600">{history.newManager}</td>
                  <td className="px-4 py-3 text-xs theme-text-main">{history.assignedBy}</td>
                  <td className="px-4 py-3">
                    <button className="text-cyan-600 hover:text-cyan-700 font-semibold text-xs">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
