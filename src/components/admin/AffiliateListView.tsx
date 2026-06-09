import React, { useMemo, useState } from "react";
import { Search, Plus, Download, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface AffiliateListViewProps {
  title?: string;
  subtitle?: string;
  onViewProfile?: (affiliate: AffiliateRecord) => void;
}

type AffiliateStatus = "Pending" | "Active" | "Disabled";
type Recommendation = "Approve" | "Reject" | "Pending" | null;

interface AffiliateRecord {
  id: string;
  registrationDate: string;
  fullName: string;
  email: string;
  country: string;
  manager: string;
  status: AffiliateStatus;
  phone?: string;
  company?: string;
  website?: string;
  trafficSources?: string[];
  experience?: string;
  monthlyVolume?: string;
  managerNotes?: string;
  recommendation?: Recommendation;
  password?: string;
  telegram?: string;
  skype?: string;
  whatsapp?: string;
  trackingDomain?: string;
  postbackUrl?: string;
  registrationIp?: string;
  lastLoginIp?: string;
  signupTimestamp?: string;
  notesHistory?: Array<{
    note: string;
    manager: string;
    timestamp: string;
  }>;
}

const AFFILIATES: AffiliateRecord[] = [
  { id: "APX-9413", registrationDate: "2026-05-18", fullName: "Isabella Nguyen", email: "isabella.nguyen@adcore.io", country: "United States", manager: "Evan Chen", status: "Active", phone: "+1-555-0101", company: "Comet Media", website: "https://adcore.io", trafficSources: ["Display Networks", "Native Ads"], experience: "5+ years affiliate marketing", monthlyVolume: "500K - 1M impressions", managerNotes: "", recommendation: "Pending", password: "••••••••", telegram: "@isabella_media", skype: "isabella.nguyen", whatsapp: "+1-555-0101", trackingDomain: "track.cometmedia.io", postbackUrl: "https://api.cometmedia.io/postback", registrationIp: "203.0.113.42", lastLoginIp: "203.0.113.45", signupTimestamp: "2026-05-18 14:23:15", notesHistory: [{ note: "Initial application received. Verification in progress.", manager: "System", timestamp: "2026-05-18 14:23:15" }] },
  { id: "APX-9332", registrationDate: "2026-05-15", fullName: "Carlos Medina", email: "carlos.medina@leadshift.com", country: "Mexico", manager: "Sofia Becker", status: "Active", phone: "+1-555-0102", company: "Nova Labs", website: "https://leadshift.com", trafficSources: ["Organic Search", "Social Media"], experience: "3+ years in digital marketing", monthlyVolume: "100K - 500K impressions", managerNotes: "", recommendation: "Pending", password: "••••••••", telegram: "@carlosmedina", skype: "carlos.medina.pro", whatsapp: "+52-55-1234-5678", trackingDomain: "track.novalabs.mx", postbackUrl: "https://api.novalabs.mx/postback", registrationIp: "198.51.100.55", lastLoginIp: "198.51.100.58", signupTimestamp: "2026-05-15 10:45:30", notesHistory: [{ note: "Strong social media presence. Approved for onboarding.", manager: "Sofia Becker", timestamp: "2026-05-16 09:12:00" }] },
  { id: "APX-9256", registrationDate: "2026-05-10", fullName: "Nina Harper", email: "nina.harper@primelead.io", country: "United States", manager: "Evan Chen", status: "Active", phone: "+1-555-0103", company: "Pulse Reach", website: "https://primelead.io", trafficSources: ["Email Marketing", "SEO"], experience: "4+ years in performance marketing", monthlyVolume: "250K - 750K impressions", managerNotes: "", recommendation: "Approve", password: "••••••••", telegram: "@ninaharper_io", skype: "nina.harper.leads", whatsapp: "+1-555-0103", trackingDomain: "track.primelead.io", postbackUrl: "https://api.primelead.io/postback", registrationIp: "192.0.2.10", lastLoginIp: "192.0.2.12", signupTimestamp: "2026-05-10 08:15:45", notesHistory: [{ note: "Excellent conversion metrics. Immediate approval recommended.", manager: "Evan Chen", timestamp: "2026-05-11 11:22:00" }] },
  { id: "APX-9178", registrationDate: "2026-05-08", fullName: "Marek Jankowski", email: "marek.jankowski@clickflow.pro", country: "Poland", manager: "Talia Ortiz", status: "Pending", phone: "+48-12-345-6789", company: "Aurora Traffic Co.", website: "https://clickflow.pro", trafficSources: ["Direct Traffic", "Referral"], experience: "2+ years affiliate marketing", monthlyVolume: "50K - 200K impressions", managerNotes: "Verification of traffic sources required.", recommendation: null, password: "••••••••", telegram: "@marek_traffic", skype: "marek.jankowski.pro", whatsapp: "+48-12-345-6789", trackingDomain: "track.clickflow.pro", postbackUrl: "https://api.clickflow.pro/postback", registrationIp: "81.163.45.123", lastLoginIp: "81.163.45.125", signupTimestamp: "2026-05-08 16:30:20", notesHistory: [{ note: "New applicant. Pending traffic source verification.", manager: "Talia Ortiz", timestamp: "2026-05-08 16:30:20" }, { note: "Traffic sources look legitimate. Awaiting compliance documents.", manager: "Talia Ortiz", timestamp: "2026-05-09 13:45:00" }] },
  { id: "APX-9024", registrationDate: "2026-05-04", fullName: "Sophie Laurent", email: "sophie.laurent@revenuebox.io", country: "France", manager: "Sofia Becker", status: "Active", phone: "+33-1-23-45-67", company: "Revenue Box", website: "https://revenuebox.io", trafficSources: ["Banner Ads", "Content Marketing"], experience: "6+ years in digital advertising", monthlyVolume: "1M+ impressions", managerNotes: "", recommendation: "Approve", password: "••••••••", telegram: "@sophielaurent_ads", skype: "sophie.laurent.fr", whatsapp: "+33-6-12-34-56-78", trackingDomain: "track.revenuebox.io", postbackUrl: "https://api.revenuebox.io/postback", registrationIp: "90.84.161.25", lastLoginIp: "90.84.161.28", signupTimestamp: "2026-05-04 11:15:40", notesHistory: [{ note: "Premium tier affiliate. Full access granted.", manager: "Sofia Becker", timestamp: "2026-05-05 08:00:00" }] },
  { id: "APX-8891", registrationDate: "2026-04-28", fullName: "Mateo Alvarez", email: "mateo.alvarez@trafficlab.com", country: "Spain", manager: "Sofia Becker", status: "Pending", phone: "+34-91-234-5678", company: "Traffic Lab", website: "https://trafficlab.com", trafficSources: ["PPC", "Social Ads"], experience: "3+ years in traffic generation", monthlyVolume: "300K - 800K impressions", managerNotes: "Awaiting compliance documentation.", recommendation: null, password: "••••••••", telegram: "@mateotraffic", skype: "mateo.alvarez.traffic", whatsapp: "+34-91-234-5678", trackingDomain: "track.trafficlab.es", postbackUrl: "https://api.trafficlab.es/postback", registrationIp: "84.123.45.67", lastLoginIp: "84.123.45.70", signupTimestamp: "2026-04-28 09:20:15", notesHistory: [{ note: "Compliant application. Waiting for KYC document submission.", manager: "Sofia Becker", timestamp: "2026-04-28 09:20:15" }, { note: "Documents pending. Follow up required.", manager: "Sofia Becker", timestamp: "2026-04-30 14:30:00" }] },
  { id: "APX-8720", registrationDate: "2026-04-22", fullName: "Priya Desai", email: "priya.desai@revenueflow.co", country: "India", manager: "Talia Ortiz", status: "Active", phone: "+91-22-1234-5678", company: "Revenue Flow", website: "https://revenueflow.co", trafficSources: ["YouTube", "Blog"], experience: "4+ years in content marketing", monthlyVolume: "200K - 600K impressions", managerNotes: "", recommendation: "Approve", password: "••••••••", telegram: "@priya_revenue", skype: "priya.desai.content", whatsapp: "+91-98765-43210", trackingDomain: "track.revenueflow.in", postbackUrl: "https://api.revenueflow.co/postback", registrationIp: "115.248.100.45", lastLoginIp: "115.248.100.48", signupTimestamp: "2026-04-22 13:50:25", notesHistory: [{ note: "Content creator with strong audience. Approved.", manager: "Talia Ortiz", timestamp: "2026-04-23 10:15:00" }] },
  { id: "APX-8615", registrationDate: "2026-04-18", fullName: "Oliver Reid", email: "oliver.reid@smartclick.net", country: "Canada", manager: "Evan Chen", status: "Disabled", phone: "+1-416-234-5678", company: "Smart Click", website: "https://smartclick.net", trafficSources: ["Mobile", "Web"], experience: "2+ years affiliate", monthlyVolume: "100K impressions", managerNotes: "Account suspended due to policy violations.", recommendation: "Reject", password: "••••••••", telegram: "@oliver_smart", skype: "oliver.reid.ca", whatsapp: "+1-416-234-5678", trackingDomain: "track.smartclick.ca", postbackUrl: "https://api.smartclick.ca/postback", registrationIp: "24.84.100.15", lastLoginIp: "24.84.100.18", signupTimestamp: "2026-04-18 15:40:50", notesHistory: [{ note: "Fraudulent activity detected. Account flagged for review.", manager: "Evan Chen", timestamp: "2026-04-20 11:00:00" }, { note: "Confirmed policy violation. Account permanently suspended.", manager: "Evan Chen", timestamp: "2026-04-21 09:30:00" }] },
  { id: "APX-8497", registrationDate: "2026-04-12", fullName: "Lina Kovacs", email: "lina.kovacs@leadforge.io", country: "Hungary", manager: "Sofia Becker", status: "Active", phone: "+36-1-234-5678", company: "Lead Forge", website: "https://leadforge.io", trafficSources: ["CPA Networks", "Arbitrage"], experience: "5+ years in lead generation", monthlyVolume: "600K - 1.2M impressions", managerNotes: "", recommendation: "Approve", password: "••••••••", telegram: "@lina_leadforge", skype: "lina.kovacs.leads", whatsapp: "+36-30-123-4567", trackingDomain: "track.leadforge.hu", postbackUrl: "https://api.leadforge.hu/postback", registrationIp: "91.132.234.56", lastLoginIp: "91.132.234.59", signupTimestamp: "2026-04-12 12:25:30", notesHistory: [{ note: "Experienced lead generator. Premium features enabled.", manager: "Sofia Becker", timestamp: "2026-04-13 08:00:00" }] },
  { id: "APX-8364", registrationDate: "2026-04-05", fullName: "Jackson Park", email: "jackson.park@conversionhub.com", country: "Australia", manager: "Talia Ortiz", status: "Pending", phone: "+61-2-1234-5678", company: "Conversion Hub", website: "https://conversionhub.com", trafficSources: ["Influencer", "Partnership"], experience: "3+ years in performance marketing", monthlyVolume: "150K - 400K impressions", managerNotes: "Under review - high quality traffic", recommendation: "Pending", password: "••••••••", telegram: "@jackson_conversions", skype: "jackson.park.au", whatsapp: "+61-4-0123-4567", trackingDomain: "track.conversionhub.au", postbackUrl: "https://api.conversionhub.au/postback", registrationIp: "101.189.45.23", lastLoginIp: "101.189.45.26", signupTimestamp: "2026-04-05 10:12:00", notesHistory: [{ note: "High quality traffic source. Influencer partnerships verified.", manager: "Talia Ortiz", timestamp: "2026-04-05 10:12:00" }, { note: "Awaiting final review before approval.", manager: "Talia Ortiz", timestamp: "2026-04-06 15:20:00" }] },
  { id: "APX-8230", registrationDate: "2026-03-29", fullName: "Katerina Petrova", email: "katerina.petrova@zoomclicks.com", country: "Czech Republic", manager: "Evan Chen", status: "Active", phone: "+420-2-1234-5678", company: "Zoom Clicks", website: "https://zoomclicks.com", trafficSources: ["Display", "Programmatic"], experience: "6+ years in traffic", monthlyVolume: "700K - 1.5M impressions", managerNotes: "", recommendation: "Approve", password: "••••••••", telegram: "@katerina_zoom", skype: "katerina.petrova.cz", whatsapp: "+420-603-456-789", trackingDomain: "track.zoomclicks.cz", postbackUrl: "https://api.zoomclicks.cz/postback", registrationIp: "88.103.45.67", lastLoginIp: "88.103.45.70", signupTimestamp: "2026-03-29 14:35:45", notesHistory: [{ note: "Top tier traffic provider. VIP status assigned.", manager: "Evan Chen", timestamp: "2026-03-30 09:00:00" }] },
  { id: "APX-8114", registrationDate: "2026-03-21", fullName: "David Kim", email: "david.kim@affinityad.com", country: "South Korea", manager: "Talia Ortiz", status: "Active", phone: "+82-2-1234-5678", company: "Affinity Ads", website: "https://affinityad.com", trafficSources: ["App Installs", "Web"], experience: "4+ years in mobile marketing", monthlyVolume: "400K - 900K impressions", managerNotes: "", recommendation: "Approve", password: "••••••••", telegram: "@david_affinity", skype: "david.kim.mobile", whatsapp: "+82-10-1234-5678", trackingDomain: "track.affinityad.kr", postbackUrl: "https://api.affinityad.kr/postback", registrationIp: "58.127.89.45", lastLoginIp: "58.127.89.48", signupTimestamp: "2026-03-21 11:20:15", notesHistory: [{ note: "Mobile traffic specialist. Approved for app install campaigns.", manager: "Talia Ortiz", timestamp: "2026-03-22 08:30:00" }] },
  { id: "APX-7993", registrationDate: "2026-03-13", fullName: "Amara Mensah", email: "amara.mensah@pulsemedia.io", country: "Ghana", manager: "Sofia Becker", status: "Disabled", phone: "+233-21-234-5678", company: "Pulse Media", website: "https://pulsemedia.io", trafficSources: ["Underground", "Bot Traffic"], experience: "1+ year affiliate", monthlyVolume: "Unknown", managerNotes: "Fraudulent activity detected - account terminated.", recommendation: "Reject", password: "••••••••", telegram: "@amara_pulse", skype: "amara.mensah.media", whatsapp: "+233-24-123-4567", trackingDomain: "track.pulsemedia.io", postbackUrl: "https://api.pulsemedia.io/postback", registrationIp: "197.232.56.78", lastLoginIp: "197.232.56.81", signupTimestamp: "2026-03-13 09:15:30", notesHistory: [{ note: "Suspicious traffic patterns detected during onboarding.", manager: "Sofia Becker", timestamp: "2026-03-14 10:00:00" }, { note: "Confirmed bot traffic usage. Account permanently banned.", manager: "Sofia Becker", timestamp: "2026-03-15 11:45:00" }] },
  { id: "APX-7851", registrationDate: "2026-03-02", fullName: "Leah Thompson", email: "leah.thompson@conversiondrive.com", country: "United Kingdom", manager: "Evan Chen", status: "Pending", phone: "+44-20-1234-5678", company: "Conversion Drive", website: "https://conversiondrive.com", trafficSources: ["Organic", "Direct"], experience: "2+ years affiliate marketing", monthlyVolume: "80K - 250K impressions", managerNotes: "Awaiting KYC verification", recommendation: null, password: "••••••••", telegram: "@leah_conversions", skype: "leah.thompson.uk", whatsapp: "+44-7700-123456", trackingDomain: "track.conversiondrive.co.uk", postbackUrl: "https://api.conversiondrive.co.uk/postback", registrationIp: "87.98.234.56", lastLoginIp: "87.98.234.59", signupTimestamp: "2026-03-02 13:40:20", notesHistory: [{ note: "Application received. KYC documents requested.", manager: "Evan Chen", timestamp: "2026-03-02 13:40:20" }, { note: "Awaiting identity verification completion.", manager: "Evan Chen", timestamp: "2026-03-05 09:15:00" }] },
  { id: "APX-7712", registrationDate: "2026-02-24", fullName: "Rafael Costa", email: "rafael.costa@trafficpulse.com", country: "Brazil", manager: "Sofia Becker", status: "Active", phone: "+55-11-1234-5678", company: "Traffic Pulse", website: "https://trafficpulse.com", trafficSources: ["Social", "Email"], experience: "5+ years affiliate", monthlyVolume: "550K - 1.1M impressions", managerNotes: "", recommendation: "Approve", password: "••••••••", telegram: "@rafael_traffic", skype: "rafael.costa.br", whatsapp: "+55-11-98765-4321", trackingDomain: "track.trafficpulse.br", postbackUrl: "https://api.trafficpulse.br/postback", registrationIp: "187.126.45.67", lastLoginIp: "187.126.45.70", signupTimestamp: "2026-02-24 16:55:30", notesHistory: [{ note: "Established traffic provider. Full platform access granted.", manager: "Sofia Becker", timestamp: "2026-02-25 08:00:00" }] },
];

const statusClasses: Record<AffiliateStatus, string> = {
  Pending: "bg-amber-100 text-amber-800 border border-amber-200",
  Active: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  Disabled: "bg-rose-100 text-rose-800 border border-rose-200",
};

export function AffiliateListView({
  title = "Affiliate List",
  subtitle = "Manage publisher accounts, review status, and apply administrative actions.",
  onViewProfile,
}: AffiliateListViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [managerFilter, setManagerFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const countries = useMemo(() => Array.from(new Set(AFFILIATES.map((item) => item.country))).sort(), []);
  const managers = useMemo(() => Array.from(new Set(AFFILIATES.map((item) => item.manager))).sort(), []);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredAffiliates = useMemo(
    () =>
      AFFILIATES.filter((affiliate) => {
        const text = `${affiliate.fullName} ${affiliate.email} ${affiliate.id}`.toLowerCase();
        const matchesSearch = normalizedSearch ? text.includes(normalizedSearch) : true;
        const matchesStatus = statusFilter ? affiliate.status === statusFilter : true;
        const matchesCountry = countryFilter ? affiliate.country === countryFilter : true;
        const matchesManager = managerFilter ? affiliate.manager === managerFilter : true;
        return matchesSearch && matchesStatus && matchesCountry && matchesManager;
      }).sort((a, b) => (a.registrationDate > b.registrationDate ? -1 : 1)),
    [normalizedSearch, statusFilter, countryFilter, managerFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filteredAffiliates.length / pageSize));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const pagedAffiliates = filteredAffiliates.slice((currentPageSafe - 1) * pageSize, currentPageSafe * pageSize);

  const pageRange = useMemo(() => {
    const pages: number[] = [];
    for (let index = 1; index <= totalPages; index += 1) {
      pages.push(index);
    }
    return pages;
  }, [totalPages]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setter(event.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Affiliates</div>
          <h2 className="mt-2 text-2xl font-black theme-text-main">{title}</h2>
          <p className="mt-2 text-sm theme-text-muted max-w-2xl">{subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition">
            <Plus className="w-4 h-4" />
            Create Affiliate
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border theme-border bg-white px-4 py-2 text-xs font-semibold theme-text-secondary hover:bg-slate-100 transition">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Search Affiliate</span>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 theme-text-muted" />
            <input
              type="search"
              value={search}
              onChange={handleFilterChange(setSearch)}
              placeholder="Search name, email, or ID"
              className="w-full rounded-2xl border theme-border bg-white px-10 py-3 text-sm theme-text-main focus:outline-none"
            />
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Status Filter</span>
          <select
            value={statusFilter}
            onChange={handleFilterChange(setStatusFilter)}
            className="w-full rounded-2xl border theme-border bg-white px-4 py-3 text-sm theme-text-main"
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
            <option value="Disabled">Disabled</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Country Filter</span>
          <select
            value={countryFilter}
            onChange={handleFilterChange(setCountryFilter)}
            className="w-full rounded-2xl border theme-border bg-white px-4 py-3 text-sm theme-text-main"
          >
            <option value="">All countries</option>
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Manager Filter</span>
          <select
            value={managerFilter}
            onChange={handleFilterChange(setManagerFilter)}
            className="w-full rounded-2xl border theme-border bg-white px-4 py-3 text-sm theme-text-main"
          >
            <option value="">All managers</option>
            {managers.map((manager) => (
              <option key={manager} value={manager}>
                {manager}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Registration Date</th>
              <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Affiliate ID</th>
              <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Full Name</th>
              <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Email</th>
              <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Country</th>
              <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Manager</th>
              <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Status</th>
              <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {pagedAffiliates.map((affiliate) => (
              <tr key={affiliate.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4 text-sm theme-text-secondary">{affiliate.registrationDate}</td>
                <td className="px-5 py-4 text-sm font-semibold theme-text-main">{affiliate.id}</td>
                <td className="px-5 py-4 text-sm theme-text-main">{affiliate.fullName}</td>
                <td className="px-5 py-4 text-sm theme-text-secondary">{affiliate.email}</td>
                <td className="px-5 py-4 text-sm theme-text-secondary">{affiliate.country}</td>
                <td className="px-5 py-4 text-sm theme-text-secondary">{affiliate.manager}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${statusClasses[affiliate.status]}`}>
                    {affiliate.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right align-top">
                  <details className="relative inline-block text-left">
                    <summary className="inline-flex cursor-pointer items-center gap-2 rounded-full border theme-border bg-slate-50 px-4 py-2 text-xs font-semibold theme-text-secondary hover:bg-slate-100 transition">
                      Actions
                      <ChevronDown className="h-4 w-4" />
                    </summary>
                    <div className="absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-3xl border theme-border bg-white text-left shadow-xl">
                      <button onClick={() => onViewProfile?.(affiliate)} className="w-full px-4 py-3 text-left text-sm theme-text-main hover:bg-slate-50 transition">
                        View Profile
                      </button>
                      <button className="w-full px-4 py-3 text-left text-sm theme-text-main hover:bg-slate-50 transition">
                        Login As Affiliate
                      </button>
                      <button className="w-full px-4 py-3 text-left text-sm theme-text-main hover:bg-slate-50 transition">
                        Assign Manager
                      </button>
                      <button className="w-full px-4 py-3 text-left text-sm theme-text-main hover:bg-slate-50 transition">
                        Activate Account
                      </button>
                      <button className="w-full px-4 py-3 text-left text-sm text-rose-600 hover:bg-slate-50 transition">
                        Disable Account
                      </button>
                    </div>
                  </details>
                </td>
              </tr>
            ))}
            {pagedAffiliates.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-sm theme-text-muted">
                  No affiliates match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
        <div className="text-sm theme-text-muted">
          Showing {pagedAffiliates.length === 0 ? 0 : (currentPageSafe - 1) * pageSize + 1} - {Math.min(currentPageSafe * pageSize, filteredAffiliates.length)} of {filteredAffiliates.length} affiliates
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border theme-border bg-white px-2 py-1">
          <button
            type="button"
            disabled={currentPageSafe === 1}
            onClick={() => setCurrentPage(Math.max(1, currentPageSafe - 1))}
            className="inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold theme-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {pageRange.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`min-w-[34px] rounded-full px-3 py-2 text-sm font-semibold transition ${
                page === currentPageSafe ? "bg-cyan-600 text-white" : "theme-text-secondary hover:bg-slate-100"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            disabled={currentPageSafe === totalPages}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPageSafe + 1))}
            className="inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold theme-text-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
