import React, { useState, useMemo } from "react";
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Check, 
  Filter,
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
  Megaphone,
  CreditCard,
  Monitor,
  MapPin,
  Clock
} from "lucide-react";

// Publisher safe ledger log entry interface - 100% compliant with general directives
interface PublisherLogEntry {
  date: string;          // e.g. "2026-06-06"
  timestamp: string;     // e.g. "2026-06-06 12:41:03"
  clickId: string;
  conversionId: string;
  offerId: string;
  offerName: string;
  country: string;
  device: string;        // iOS, Android, macOS, Windows, Linux
  ip: string;
  status: "Validated" | "Processing" | "Hold" | "Rejected";
  clickStatus: "Redirected" | "Duplicate IP Rejected" | "Proxy Blocked";
  payout: number;
  revenue: number;
  salesAmount: number;
  affS1: string;
  affS2: string;
  affS3: string;
  affS4: string;
  affS5: string;
  clickOrigin: string; // e.g. "Social Ad", "Search Portal"
  userAgent: string;
  referrer: string;
  conversionType: "CPL" | "CPA" | "CPI" | "CPS";
}

// Strictly private secure master dataset assigned entirely to the publisher
const MASTER_DATASET: PublisherLogEntry[] = [
  {
    date: "2026-06-06",
    timestamp: "2026-06-06 12:41:03",
    clickId: "CLK-9840192-A8",
    conversionId: "CNV-00810-TRX",
    offerId: "1092",
    offerName: "NordVPNSecure - Multi Device CPA (WW)",
    country: "US",
    device: "macOS",
    ip: "172.56.21.89",
    status: "Validated",
    clickStatus: "Redirected",
    payout: 3.80,
    revenue: 4.80,
    salesAmount: 25.00,
    affS1: "fb_campaign_9",
    affS2: "us_mac",
    affS3: "adgroup3",
    affS4: "social_promo",
    affS5: "creative_v1",
    clickOrigin: "Direct Partner Lander",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/114.0",
    referrer: "https://facebook.com/my-ad-buyer",
    conversionType: "CPA"
  },
  {
    date: "2026-06-06",
    timestamp: "2026-06-06 12:39:15",
    clickId: "CLK-9840193-X2",
    conversionId: "CNV-00811-Q8Z",
    offerId: "1094",
    offerName: "Apex Trading App - Mobile Install (iOS/Android)",
    country: "DE",
    device: "iOS",
    ip: "85.214.99.102",
    status: "Validated",
    clickStatus: "Redirected",
    payout: 4.20,
    revenue: 5.50,
    salesAmount: 0.00,
    affS1: "google_search_br",
    affS2: "de_ios",
    affS3: "mob_app_install",
    affS4: "search_engine_traffic",
    affS5: "lander_v2",
    clickOrigin: "Search Portal Redirect",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5) Safari_604.1",
    referrer: "https://google.de/search",
    conversionType: "CPI"
  },
  {
    date: "2026-06-06",
    timestamp: "2026-06-06 12:31:12",
    clickId: "CLK-9840195-F3",
    conversionId: "CNV-00812-M11",
    offerId: "1095",
    offerName: "FastHomeLoan - Instant Cash Lead Quote",
    country: "US",
    device: "Windows",
    ip: "198.84.201.33",
    status: "Validated",
    clickStatus: "Redirected",
    payout: 28.00,
    revenue: 35.00,
    salesAmount: 120.00,
    affS1: "native_revcontent",
    affS2: "us_win",
    affS3: "lead_gen_co",
    affS4: "native_widget_3",
    affS5: "headline_a",
    clickOrigin: "Direct Partner Lander",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64) Chrome/114.0",
    referrer: "https://revcontent.com/widget-f3",
    conversionType: "CPL"
  },
  {
    date: "2026-06-05",
    timestamp: "2026-06-05 18:15:30",
    clickId: "CLK-9839712-W6",
    conversionId: "CNV-00816-R90",
    offerId: "1095",
    offerName: "FastHomeLoan - Instant Cash Lead Quote",
    country: "US",
    device: "Linux",
    ip: "185.112.144.20",
    status: "Rejected",
    clickStatus: "Proxy Blocked",
    payout: 0.00,
    revenue: 0.00,
    salesAmount: 0.00,
    affS1: "fake_leads_bot",
    affS2: "proxy",
    affS3: "bot_attack",
    affS4: "bad_traffic_node",
    affS5: "blacklist_ip",
    clickOrigin: "Proxy Network Access",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) Chrome/113.0",
    referrer: "",
    conversionType: "CPL"
  },
  {
    date: "2026-06-05",
    timestamp: "2026-06-05 10:44:03",
    clickId: "CLK-9840197-U5",
    conversionId: "CNV-00813-A42",
    offerId: "1096",
    offerName: "KetoDiet Shred - CPS Health Offer (WW)",
    country: "CA",
    device: "Android",
    ip: "204.101.44.15",
    status: "Validated",
    clickStatus: "Redirected",
    payout: 65.00,
    revenue: 85.00,
    salesAmount: 149.00,
    affS1: "insta_fitness",
    affS2: "ca_android",
    affS3: "shred_influ",
    affS4: "health_blog",
    affS5: "square_banner",
    clickOrigin: "Social Ad Traffic",
    userAgent: "Mozilla/5.0 (Linux; Android 13) Chrome/112.0 Mobile",
    referrer: "https://instagram.com/p/fitness-june",
    conversionType: "CPS"
  },
  {
    date: "2026-06-04",
    timestamp: "2026-06-04 09:12:55",
    clickId: "CLK-9840194-N0",
    conversionId: "CNV-00814-K09",
    offerId: "1093",
    offerName: "CoinLedger crypto - Decentralized wallet SignUp",
    country: "SG",
    device: "Android",
    ip: "103.241.12.5",
    status: "Processing",
    clickStatus: "Redirected",
    payout: 12.50,
    revenue: 16.00,
    salesAmount: 0.00,
    affS1: "telegram_crypto",
    affS2: "tg_sub",
    affS3: "btc_signals",
    affS4: "crypto_group",
    affS5: "pinned_ad",
    clickOrigin: "Direct Partner Lander",
    userAgent: "Mozilla/5.0 (Linux; Android 12) Telegram/9.5.5",
    referrer: "https://t.me/crypto-bulletin",
    conversionType: "CPL"
  },
  {
    date: "2026-06-03",
    timestamp: "2026-06-03 14:15:30",
    clickId: "CLK-9840198-D4",
    conversionId: "CNV-00815-H81",
    offerId: "1092",
    offerName: "NordVPNSecure - Multi Device CPA (WW)",
    country: "FR",
    device: "Windows",
    ip: "62.253.119.8",
    status: "Hold",
    clickStatus: "Redirected",
    payout: 3.80,
    revenue: 4.80,
    salesAmount: 25.00,
    affS1: "email_newsletter",
    affS2: "uk_win",
    affS3: "june_blast",
    affS4: "tech_newsletter_a",
    affS5: "subject_v4",
    clickOrigin: "Direct Partner Lander",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64) Safari/537.36",
    referrer: "https://mail.google.com",
    conversionType: "CPA"
  },
  {
    date: "2026-06-02",
    timestamp: "2026-06-02 11:21:05",
    clickId: "CLK-9831122-Q1",
    conversionId: "CNV-00820-AA8",
    offerId: "1094",
    offerName: "Apex Trading App - Mobile Install (iOS/Android)",
    country: "GB",
    device: "iOS",
    ip: "81.99.124.23",
    status: "Validated",
    clickStatus: "Redirected",
    payout: 4.20,
    revenue: 5.50,
    salesAmount: 0.00,
    affS1: "native_revcontent",
    affS2: "uk_ios",
    affS3: "adtech",
    affS4: "mobile_web",
    affS5: "interstitial_ad",
    clickOrigin: "Mobile Redirect Link",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_1) Chrome/108",
    referrer: "https://highpayoutads.com/out",
    conversionType: "CPI"
  },
  {
    date: "2026-06-01",
    timestamp: "2026-06-01 16:11:42",
    clickId: "CLK-9830012-P3",
    conversionId: "CNV-00821-ZZ9",
    offerId: "1092",
    offerName: "NordVPNSecure - Multi Device CPA (WW)",
    country: "DE",
    device: "macOS",
    ip: "109.112.44.89",
    status: "Validated",
    clickStatus: "Redirected",
    payout: 3.80,
    revenue: 4.80,
    salesAmount: 39.00,
    affS1: "google_search_br",
    affS2: "de_mac",
    affS3: "premium_vpn",
    affS4: "brand_keywords",
    affS5: "promo_text",
    clickOrigin: "Search Portal Redirect",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) Safari/605.1.15",
    referrer: "https://google.de/search",
    conversionType: "CPA"
  }
];

// Clean simulated clicks mapped to secure publisher format
const EXTRA_CLICKS_DATA = [
  { date: "2026-06-06", country: "US", offerName: "NordVPNSecure - Multi Device CPA (WW)", ip: "172.56.21.90", device: "macOS", clickOrigin: "Direct Link", affS1: "fb_campaign_9", affS2: "us_mac", affS3: "adgroup3", affS4: "social_promo", affS5: "creative_v1", userAgent: "Chrome/114.0", r: "https://facebook.com" },
  { date: "2026-06-06", country: "DE", offerName: "Apex Trading App - Mobile Install (iOS/Android)", ip: "85.214.99.110", device: "iOS", clickOrigin: "Search Portal", affS1: "google_search_br", affS2: "de_ios", affS3: "mob_app_install", affS4: "search_engine_traffic", affS5: "lander_v2", userAgent: "Safari/16.5", r: "https://google.de" },
  { date: "2026-06-05", country: "US", offerName: "FastHomeLoan - Instant Cash Lead Quote", ip: "198.84.201.35", device: "Windows", clickOrigin: "Native Widget", affS1: "native_revcontent", affS2: "us_win", affS3: "lead_gen_co", affS4: "native_widget_3", affS5: "headline_a", userAgent: "Edge/114.0", r: "https://revcontent.com" },
  { date: "2026-06-04", country: "SG", offerName: "CoinLedger crypto - Decentralized wallet SignUp", ip: "103.241.12.10", device: "Android", clickOrigin: "Social Ad", affS1: "telegram_crypto", affS2: "tg_sub", affS3: "btc_signals", affS4: "crypto_group", affS5: "pinned_ad", userAgent: "Telegram/9.5", r: "https://t.me" },
  { date: "2026-06-03", country: "FR", offerName: "NordVPNSecure - Multi Device CPA (WW)", ip: "62.253.119.12", device: "Windows", clickOrigin: "Email Blast", affS1: "email_newsletter", affS2: "uk_win", affS3: "june_blast", affS4: "tech_newsletter_a", affS5: "subject_v4", userAgent: "Chrome/112.0", r: "https://mail.yahoo.com" },
  { date: "2026-06-02", country: "GB", offerName: "Apex Trading App - Mobile Install (iOS/Android)", ip: "81.99.124.30", device: "iOS", clickOrigin: "Direct Link", affS1: "native_revcontent", affS2: "uk_ios", affS3: "adtech", affS4: "mobile_web", affS5: "interstitial_ad", userAgent: "Chrome/108.0", r: "https://highpayoutads.com" },
  { date: "2026-06-01", country: "DE", offerName: "NordVPNSecure - Multi Device CPA (WW)", ip: "109.112.44.100", device: "macOS", clickOrigin: "Search Engine", affS1: "google_search_br", affS2: "de_mac", affS3: "premium_vpn", affS4: "brand_keywords", affS5: "promo_text", userAgent: "Firefox/112.0", r: "https://google.de" }
];

export function ReportsView() {
  const [activeReportTab, setActiveReportTab] = useState<"daily" | "overview" | "clicks" | "conversions">("daily");
  
  // Date Timeline Filter States - defaults to all range (June 1 - June 7)
  const [dateRangeSelector, setDateRangeSelector] = useState<"all" | "today" | "yesterday" | "last7">("all");
  const [customStartDate, setCustomStartDate] = useState("2026-06-01");
  const [customEndDate, setCustomEndDate] = useState("2026-06-07");

  // Publisher Safe Filters: Offer, Country, Device, Audit Status (No Advertiser or Affiliate filters)
  const [offerFilter, setOfferFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [copiedCsv, setCopiedCsv] = useState(false);

  // -------------------------------------------------------------
  // NOTIFICATIONS LIST (PUBLISHER-SAFE - NO ADVERTISER DETAILS)
  // -------------------------------------------------------------
  const [notifications] = useState([
    {
      id: 1,
      type: "approved",
      title: "Offer Approved",
      text: "Campaign #1094 Apex Trading App has been approved for sub ID traffic sources.",
      time: "10 minutes ago"
    },
    {
      id: 2,
      type: "paused",
      title: "Offer Paused",
      text: "Campaign #1098 Luxury Essentials has been temporarily paused for partner optimization.",
      time: "2 hours ago"
    },
    {
      id: 3,
      type: "rejected",
      title: "Offer Rejected",
      text: "Campaign #1097 B2B SaaS Enterprise CRM request was rejected due to geo mismatched traffic profile.",
      time: "5 hours ago"
    },
    {
      id: 4,
      type: "payout",
      title: "Payout Released",
      text: "A payout of $2,850.00 USD has been dispatched to Citibank Ledger nodes (NET-15).",
      time: "Yesterday"
    },
    {
      id: 5,
      type: "announcement",
      title: "System Announcement",
      text: "Network Upgrade: S2S Click Attribution and POSTBACK ping speeds have been improved to < 12ms.",
      time: "2 days ago"
    }
  ]);

  const [notificationsOpen, setNotificationsOpen] = useState(true);

  // Helper arrays for options extracted dynamically from the dataset
  const offersList = useMemo(() => ["all", ...new Set(MASTER_DATASET.map(x => x.offerName))], []);
  const countriesList = useMemo(() => ["all", ...new Set(MASTER_DATASET.map(x => x.country))], []);
  const devicesList = useMemo(() => ["all", ...new Set(MASTER_DATASET.map(x => x.device))], []);
  const statusList = useMemo(() => ["all", "Validated", "Processing", "Hold", "Rejected"], []);

  // Filter application core logic on Conversions dataset
  const filteredConversionsList = useMemo(() => {
    return MASTER_DATASET.filter((row) => {
      // 1. Date Range Filter
      if (dateRangeSelector === "today") {
        if (row.date !== "2026-06-06") return false;
      } else if (dateRangeSelector === "yesterday") {
        if (row.date !== "2026-06-05") return false;
      } else if (dateRangeSelector === "last7") {
        const rowDate = new Date(row.date);
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        if (rowDate < start || rowDate > end) return false;
      }

      // 2. Active Publisher Filters
      if (offerFilter !== "all" && row.offerName !== offerFilter) return false;
      if (countryFilter !== "all" && row.country !== countryFilter) return false;
      if (deviceFilter !== "all" && row.device !== deviceFilter) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;

      return true;
    });
  }, [dateRangeSelector, customStartDate, customEndDate, offerFilter, countryFilter, deviceFilter, statusFilter]);

  // Filter application on Clicks dataset (Conversions + simulated clicks)
  const filteredClicksList = useMemo(() => {
    const allClicks: Array<{
      date: string;
      timestamp: string;
      clickId: string;
      country: string;
      clickOrigin: string;
      offerName: string;
      ip: string;
      device: string;
      userAgent: string;
      referrer: string;
      affS1: string;
      affS2: string;
      affS3: string;
      affS4: string;
      affS5: string;
    }> = [];

    // Conversions originate from clicks
    MASTER_DATASET.forEach(conv => {
      allClicks.push({
        date: conv.date,
        timestamp: conv.timestamp,
        clickId: conv.clickId,
        country: conv.country,
        clickOrigin: conv.clickOrigin,
        offerName: conv.offerName,
        ip: conv.ip,
        device: conv.device,
        userAgent: conv.userAgent,
        referrer: conv.referrer,
        affS1: conv.affS1,
        affS2: conv.affS2,
        affS3: conv.affS3,
        affS4: conv.affS4,
        affS5: conv.affS5,
      });
    });

    // Add simulated click hits
    EXTRA_CLICKS_DATA.forEach((clk, i) => {
      allClicks.push({
        date: clk.date,
        timestamp: `${clk.date} 08:30:10`,
        clickId: `CLK-SIM-${i}59B`,
        country: clk.country,
        clickOrigin: clk.clickOrigin,
        offerName: clk.offerName,
        ip: clk.ip,
        device: clk.device,
        userAgent: clk.userAgent,
        referrer: clk.r,
        affS1: clk.affS1,
        affS2: clk.affS2,
        affS3: clk.affS3,
        affS4: clk.affS4,
        affS5: clk.affS5,
      });
    });

    return allClicks.filter((row) => {
      // 1. Date Range Filter
      if (dateRangeSelector === "today") {
        if (row.date !== "2026-06-06") return false;
      } else if (dateRangeSelector === "yesterday") {
        if (row.date !== "2026-06-05") return false;
      } else if (dateRangeSelector === "last7") {
        const rowDate = new Date(row.date);
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        if (rowDate < start || rowDate > end) return false;
      }

      // 2. Active Publisher Filters
      if (offerFilter !== "all" && row.offerName !== offerFilter) return false;
      if (countryFilter !== "all" && row.country !== countryFilter) return false;
      if (deviceFilter !== "all" && row.device !== deviceFilter) return false;

      return true;
    });
  }, [dateRangeSelector, customStartDate, customEndDate, offerFilter, countryFilter, deviceFilter]);

  // -------------------------------------------------------------
  // DAILY REPORT COMPILATION (GROUP-BY-DATE)
  // Columns: Date, Clicks, Conversions, Revenue, Payout, Conversion Rate, APV, EPC
  // -------------------------------------------------------------
  const compiledDailyReport = useMemo(() => {
    const datesMap: { [date: string]: {
      clicks: number;
      conversions: number;
      revenue: number;
      payout: number;
    }} = {};

    const allExpectedDates = ["2026-06-07", "2026-06-06", "2026-06-05", "2026-06-04", "2026-06-03", "2026-06-02", "2026-06-01"];
    allExpectedDates.forEach(d => {
      datesMap[d] = { clicks: 0, conversions: 0, revenue: 0, payout: 0 };
    });

    filteredConversionsList.forEach((conv) => {
      if (!datesMap[conv.date]) {
        datesMap[conv.date] = { clicks: 0, conversions: 0, revenue: 0, payout: 0 };
      }
      datesMap[conv.date].conversions += 1;
      datesMap[conv.date].revenue += conv.revenue;
      datesMap[conv.date].payout += conv.payout;
    });

    filteredClicksList.forEach((clk) => {
      if (!datesMap[clk.date]) {
        datesMap[clk.date] = { clicks: 0, conversions: 0, revenue: 0, payout: 0 };
      }
      datesMap[clk.date].clicks += 1;
    });

    return Object.keys(datesMap).map((date) => {
      const node = datesMap[date];
      const conversionRate = node.clicks > 0 ? (node.conversions / node.clicks) * 100 : 0;
      const apv = node.conversions > 0 ? node.payout / node.conversions : 0;
      const epc = node.clicks > 0 ? node.payout / node.clicks : 0;

      return {
        date,
        clicks: node.clicks,
        conversions: node.conversions,
        revenue: node.revenue,
        payout: node.payout,
        conversionRate,
        apv,
        epc
      };
    })
    .filter(row => {
      if (dateRangeSelector === "today") return row.date === "2026-06-06";
      if (dateRangeSelector === "yesterday") return row.date === "2026-06-05";
      if (dateRangeSelector === "last7") {
        return row.date >= customStartDate && row.date <= customEndDate;
      }
      return true; // "all"
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredConversionsList, filteredClicksList, dateRangeSelector, customStartDate, customEndDate]);

  // -------------------------------------------------------------
  // OVERVIEW REPORT COMPILATION (GROUP-BY-OFFER)
  // Columns: Offer, Clicks, Conversions, Revenue, Payout, Conversion Rate, APV, EPC
  // -------------------------------------------------------------
  const compiledOverviewReport = useMemo(() => {
    const offerMap: { [offerName: string]: {
      clicks: number;
      conversions: number;
      revenue: number;
      payout: number;
    }} = {};

    filteredConversionsList.forEach((conv) => {
      if (!offerMap[conv.offerName]) {
        offerMap[conv.offerName] = { clicks: 0, conversions: 0, revenue: 0, payout: 0 };
      }
      offerMap[conv.offerName].conversions += 1;
      offerMap[conv.offerName].revenue += conv.revenue;
      offerMap[conv.offerName].payout += conv.payout;
    });

    filteredClicksList.forEach((clk) => {
      if (!offerMap[clk.offerName]) {
        offerMap[clk.offerName] = { clicks: 0, conversions: 0, revenue: 0, payout: 0 };
      }
      offerMap[clk.offerName].clicks += 1;
    });

    return Object.keys(offerMap).map((offerName) => {
      const node = offerMap[offerName];
      const conversionRate = node.clicks > 0 ? (node.conversions / node.clicks) * 100 : 0;
      const apv = node.conversions > 0 ? node.payout / node.conversions : 0;
      const epc = node.clicks > 0 ? node.payout / node.clicks : 0;

      return {
        offerName,
        clicks: node.clicks,
        conversions: node.conversions,
        revenue: node.revenue,
        payout: node.payout,
        conversionRate,
        apv,
        epc
      };
    }).sort((a, b) => b.payout - a.payout);
  }, [filteredConversionsList, filteredClicksList]);

  // -------------------------------------------------------------
  // ACCUMULATED VALUES FOR SUMMARY TOTAL HEADER/FOOTER ROW
  // -------------------------------------------------------------
  const totalsSummary = useMemo(() => {
    let clicks = 0;
    let conversions = 0;
    let revenue = 0;
    let payout = 0;

    compiledDailyReport.forEach((row) => {
      clicks += row.clicks;
      conversions += row.conversions;
      revenue += row.revenue;
      payout += row.payout;
    });

    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
    const apv = conversions > 0 ? payout / conversions : 0;
    const epc = clicks > 0 ? payout / clicks : 0;

    return {
      clicks,
      conversions,
      revenue,
      payout,
      conversionRate,
      apv,
      epc
    };
  }, [compiledDailyReport]);

  // Dynamic Private CSV Export for the active report tab
  const handleExportCSV = () => {
    let content = "";
    const filename = `apextrack-publisher-report-${activeReportTab}.csv`;

    if (activeReportTab === "daily") {
      content = "Date,Clicks,Conversions,Revenue,Payout,Conversion Rate,APV,EPC\n" +
        compiledDailyReport.map(d => 
          `"${d.date}",${d.clicks},${d.conversions},$${d.revenue.toFixed(2)},$${d.payout.toFixed(2)},${d.conversionRate.toFixed(2)}%,$${d.apv.toFixed(2)},$${d.epc.toFixed(3)}`
        ).join("\n");
    } else if (activeReportTab === "overview") {
      content = "Offer,Clicks,Conversions,Revenue,Payout,Conversion Rate,APV,EPC\n" +
        compiledOverviewReport.map(o => 
          `"${o.offerName}",${o.clicks},${o.conversions},$${o.revenue.toFixed(2)},$${o.payout.toFixed(2)},${o.conversionRate.toFixed(2)}%,$${o.apv.toFixed(2)},$${o.epc.toFixed(3)}`
        ).join("\n");
    } else if (activeReportTab === "clicks") {
      content = "Date,Country,Click,Device,User Agent,Gross Click Count,Aff S1,Aff S2,Aff S3,Aff S4,Aff S5\n" +
        filteredClicksList.map(c => 
          `"${c.timestamp}","${c.country}","${c.clickId}","${c.device}","${c.userAgent}",1,"${c.affS1}","${c.affS2}","${c.affS3}","${c.affS4}","${c.affS5}"`
        ).join("\n");
    } else if (activeReportTab === "conversions") {
      content = "Date,Country,Conversion Status,Conversion ID,Offer Name,Conversion Type,Revenue,Payout,Aff S1,Aff S2,Aff S3,Aff S4,Aff S5\n" +
        filteredConversionsList.map(v => 
          `"${v.timestamp}","${v.country}","${v.status}","${v.conversionId}","${v.offerName}","${v.conversionType}",$${v.revenue.toFixed(2)},$${v.payout.toFixed(2)},"${v.affS1}","${v.affS2}","${v.affS3}","${v.affS4}","${v.affS5}"`
        ).join("\n");
    }

    navigator.clipboard.writeText(content);
    
    // Fallback file download triggers
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2500);
  };

  const clearAllFilters = () => {
    setOfferFilter("all");
    setCountryFilter("all");
    setDeviceFilter("all");
    setStatusFilter("all");
    setDateRangeSelector("all");
  };

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="reports-ledger-root">
      
      {/* -------------------------------------------------------------
          HEADER & CSV DOWNLOAD DOCK
          ------------------------------------------------------------- */}
      <div className="theme-bg-card border theme-border p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm bg-slate-900 border-slate-800">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-500" />
            Performance Ledger (Partner Accounts)
          </h2>
          <p className="text-xs text-slate-400">
            Secure partner stats feed. Audit dynamic timelines, filter traffic parameters, track custom sub-attributes, and download ledger logs.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition select-none uppercase tracking-wider cursor-pointer shadow-sm shadow-cyan-500/10"
        >
          {copiedCsv ? (
            <>
              <Check className="w-4 h-4 text-emerald-950" />
              CSV Dispatched
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Commission CSV
            </>
          )}
        </button>
      </div>

      {/* -------------------------------------------------------------
          LIVE NOTIFICATIONS FEEDS BLOCK (REQUIRED)
          ------------------------------------------------------------- */}
      <div className="theme-bg-card border theme-border rounded-2xl overflow-hidden shadow-sm bg-slate-900 border-slate-800">
        <button 
          onClick={() => setNotificationsOpen(!notificationsOpen)}
          className="w-full flex items-center justify-between p-4 bg-slate-950/60 border-b border-slate-850 hover:bg-slate-850/35 transition select-none text-left"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-cyan-500" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200">Affiliate Alerts & Notifications Feed</span>
              <span className="text-[10px] block text-slate-500 font-mono font-bold uppercase">Live Broadcast (5 items)</span>
            </div>
          </div>
          <span className="text-xs text-cyan-500 font-bold font-mono">
            {notificationsOpen ? "Collapse Feed [−]" : "Expand Announcements [+]"}
          </span>
        </button>

        {notificationsOpen && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 bg-slate-950/60 font-sans text-xs">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-3 rounded-xl border flex flex-col justify-between space-y-2.5 relative transition-all duration-300 ${
                  notif.type === "approved" 
                    ? "bg-emerald-50 border-emerald-200 text-slate-900"
                    : notif.type === "paused"
                    ? "bg-amber-50 border-amber-200 text-slate-900"
                    : notif.type === "rejected"
                    ? "bg-rose-50 border-rose-200 text-slate-900"
                    : notif.type === "payout"
                    ? "bg-cyan-50 border-cyan-200 text-slate-900"
                    : "bg-slate-50 border-slate-200 text-slate-900"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold uppercase font-mono text-[9px] tracking-wider">
                    {notif.type === "approved" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    {notif.type === "paused" && <PauseCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                    {notif.type === "rejected" && <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                    {notif.type === "payout" && <CreditCard className="w-3.5 h-3.5 text-cyan-600 shrink-0" />}
                    {notif.type === "announcement" && <Megaphone className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    <span>{notif.title}</span>
                  </div>
                  <p className="text-[10px] leading-normal text-slate-700">{notif.text}</p>
                </div>
                <span className="block text-[8px] font-mono text-slate-400 text-right">{notif.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          TAB SELECTOR
          ------------------------------------------------------------- */}
      <div className="flex border-b border-slate-800 select-none overflow-x-auto pb-px gap-1">
        {[
          { tab: "daily", label: "Daily Report Timeline", desc: "Interactive Daily Ledger" },
          { tab: "overview", label: "Overview Report", desc: "Breakdown Grouped by Offer" },
          { tab: "clicks", label: "Clicks Report Logs", desc: "SubIDs & Real-time Paths" },
          { tab: "conversions", label: "Conversions Report", desc: "Commission & Callback Logs" }
        ].map((item) => (
          <button
            key={item.tab}
            onClick={() => setActiveReportTab(item.tab as any)}
            className={`px-5 py-3 border-b-2 font-sans transition shrink-0 text-left cursor-pointer ${
              activeReportTab === item.tab
                ? "border-cyan-500 text-cyan-400 font-bold"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <span className="block text-xs font-bold leading-tight font-sans">{item.label}</span>
            <span className="text-[10px] block opacity-70 font-mono font-medium">{item.desc}</span>
          </button>
        ))}
      </div>

      {/* -------------------------------------------------------------
          PUBLISHER ACTIVE CONTROLS panel (NO ADVERTISER AND NO AFFILIATE FILTERS)
          ------------------------------------------------------------- */}
      <div className="theme-bg-card border theme-border p-4 rounded-xl space-y-4 shadow-sm bg-slate-900 border-slate-800">
        
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-mono text-slate-300 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-cyan-500" />
            Active Partner Filters
          </span>

          <button 
            onClick={clearAllFilters}
            className="text-[10px] font-mono font-bold text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" /> Clear Active Filters
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 text-xs">
          
          {/* Timeline Range Filter */}
          <div>
            <label className="block text-[9px] font-bold font-mono uppercase text-slate-500 tracking-wider">Timeline</label>
            <select
              value={dateRangeSelector}
              onChange={(e) => setDateRangeSelector(e.target.value as any)}
              className="mt-1 block w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 cursor-pointer focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            >
              <option value="all">June 1 - June 7</option>
              <option value="today">Today (June 6)</option>
              <option value="yesterday">Yesterday (June 5)</option>
              <option value="last7">Custom Range</option>
            </select>
          </div>

          {/* Offer Filter */}
          <div>
            <label className="block text-[9px] font-bold font-mono uppercase text-slate-500 tracking-wider">Offer Category</label>
            <select
              value={offerFilter}
              onChange={(e) => setOfferFilter(e.target.value)}
              className="mt-1 block w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 cursor-pointer focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            >
              {offersList.map(o => (
                <option key={o} value={o}>{o === "all" ? "All Active Offers" : o.split(" - ")[0]}</option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-[9px] font-bold font-mono uppercase text-slate-500 tracking-wider">Country Geo</label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="mt-1 block w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 cursor-pointer focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            >
              {countriesList.map(c => (
                <option key={c} value={c}>{c === "all" ? "All Countries" : c}</option>
              ))}
            </select>
          </div>

          {/* Device Filter */}
          <div>
            <label className="block text-[9px] font-bold font-mono uppercase text-slate-500 tracking-wider">Agent Device</label>
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="mt-1 block w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 cursor-pointer focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            >
              {devicesList.map(d => (
                <option key={d} value={d}>{d === "all" ? "All Devices" : d}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[9px] font-bold font-mono uppercase text-slate-500 tracking-wider">Audit Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 block w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 cursor-pointer focus:outline-none focus:border-cyan-500 font-mono text-[11px]"
            >
              {statusList.map(s => (
                <option key={s} value={s}>{s === "all" ? "All Postback Statuses" : s}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Custom Start/End fields shown when custom range selected */}
        {dateRangeSelector === "last7" && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-850 animate-fadeIn text-xs">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Define Active Bounds:</span>
            </div>
            
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <span className="text-slate-500 font-mono">➡</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
            
            <p className="text-[10px] text-slate-400 italic">Dynamic calculations update securely below.</p>
          </div>
        )}

      </div>

      {/* -------------------------------------------------------------
          ACTIVE VIEWPORT SHEETS (MAPPED PERFECTLY TO DIRECTIVES)
          ------------------------------------------------------------- */}
      <div className="theme-bg-card border theme-border rounded-2xl overflow-hidden shadow-sm bg-slate-900 border-slate-800">
        
        {/* REPORT TYPE 1: DAILY PERFORMANCE TIMELINE */}
        {activeReportTab === "daily" && (
          <div className="overflow-x-auto select-none">
            <table className="min-w-full divide-y divide-slate-850 text-left">
              <thead className="bg-slate-950 text-[10px] tracking-wider font-mono uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-center">Clicks</th>
                  <th className="px-5 py-3 text-center">Conversions</th>
                  <th className="px-5 py-3 text-right">Revenue</th>
                  <th className="px-5 py-3 text-right">Payout</th>
                  <th className="px-5 py-3 text-center">Conversion Rate</th>
                  <th className="px-5 py-3 text-right">APV</th>
                  <th className="px-5 py-3 text-right">EPC</th>
                </tr>
              </thead>
              
              {/* TOTAL AGGREGATIONS HEADER ROW */}
              <tbody className="bg-slate-900 font-mono text-[11px] font-bold text-cyan-450 border-b border-slate-850">
                <tr>
                  <td className="px-5 py-3.5 uppercase text-slate-300 font-sans font-bold">TOTAL AGGREGATES</td>
                  <td className="px-5 py-3.5 text-center text-sky-400">{totalsSummary.clicks}</td>
                  <td className="px-5 py-3.5 text-center text-amber-500">{totalsSummary.conversions}</td>
                  <td className="px-5 py-3.5 text-right text-indigo-300">${totalsSummary.revenue.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-right text-emerald-400">${totalsSummary.payout.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-center text-slate-300">{totalsSummary.conversionRate.toFixed(2)}%</td>
                  <td className="px-5 py-3.5 text-right">${totalsSummary.apv.toFixed(2)}</td>
                  <td className="px-5 py-3.5 text-right">${totalsSummary.epc.toFixed(3)}</td>
                </tr>
              </tbody>

              <tbody className="divide-y divide-slate-850 text-[11px] text-slate-400 font-mono bg-slate-900/40">
                {compiledDailyReport.map((day, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/20 transition">
                    <td className="px-5 py-3.5 font-bold text-white flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                      {day.date}
                    </td>
                    <td className="px-5 py-3.5 text-center text-sky-400">{day.clicks}</td>
                    <td className="px-5 py-3.5 text-center text-amber-505">{day.conversions}</td>
                    <td className="px-5 py-3.5 text-right text-indigo-300">${day.revenue.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-right text-emerald-400 font-bold">${day.payout.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-center text-slate-450">{day.conversionRate.toFixed(2)}%</td>
                    <td className="px-5 py-3.5 text-right">${day.apv.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-right">${day.epc.toFixed(3)}</td>
                  </tr>
                ))}
                
                {compiledDailyReport.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-500 font-semibold uppercase text-xs">
                      No matching records found belonging to current filter timeline.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT TYPE 2: OVERVIEW REPORT GROUPED BY OFFER */}
        {activeReportTab === "overview" && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-850 text-left">
              <thead className="bg-slate-950 text-[10px] tracking-wider font-mono uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Offer</th>
                  <th className="px-5 py-3 text-center">Clicks</th>
                  <th className="px-5 py-3 text-center">Conversions</th>
                  <th className="px-5 py-3 text-right">Revenue</th>
                  <th className="px-5 py-3 text-right">Payout</th>
                  <th className="px-5 py-3 text-center">Conversion Rate</th>
                  <th className="px-5 py-3 text-right">APV</th>
                  <th className="px-5 py-3 text-right">EPC</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-850 text-[11px] text-slate-400 font-mono bg-slate-900/40">
                {compiledOverviewReport.map((off, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/20 transition">
                    <td className="px-5 py-3.5 font-bold text-white truncate max-w-xs" title={off.offerName}>
                      {off.offerName}
                    </td>
                    <td className="px-5 py-3.5 text-center text-sky-400">{off.clicks}</td>
                    <td className="px-5 py-3.5 text-center text-amber-505">{off.conversions}</td>
                    <td className="px-5 py-3.5 text-right text-indigo-300">${off.revenue.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-right text-emerald-400 font-semibold">${off.payout.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-center text-slate-450">{off.conversionRate.toFixed(2)}%</td>
                    <td className="px-5 py-3.5 text-right">${off.apv.toFixed(2)}</td>
                    <td className="px-5 py-3.5 text-right">${off.epc.toFixed(3)}</td>
                  </tr>
                ))}

                {compiledOverviewReport.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-500 font-semibold uppercase text-xs">
                      No active offers recorded within filters boundaries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT TYPE 3: CLICKS REPORT LOGS WITH SUBID COLUMNS 1-5 */}
        {activeReportTab === "clicks" && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-850 text-left">
              <thead className="bg-slate-950 text-[10px] tracking-wider font-mono uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Country</th>
                  <th className="px-5 py-3">Click</th>
                  <th className="px-5 py-3">Device</th>
                  <th className="px-5 py-3">User Agent</th>
                  <th className="px-5 py-3 text-center">Gross Click Count</th>
                  <th className="px-5 py-3">Aff S1</th>
                  <th className="px-5 py-3">Aff S2</th>
                  <th className="px-5 py-3">Aff S3</th>
                  <th className="px-5 py-3">Aff S4</th>
                  <th className="px-5 py-3">Aff S5</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-850 text-[11px] text-slate-400 font-mono bg-slate-900/40">
                {filteredClicksList.map((clk, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/20 transition">
                    <td className="px-5 py-3 font-medium text-white truncate max-w-[120px]" title={clk.timestamp}>
                      {clk.timestamp}
                    </td>
                    <td className="px-5 py-3 text-slate-300 font-bold uppercase tracking-wide">
                      {clk.country}
                    </td>
                    <td className="px-5 py-3 text-cyan-400 font-mono select-all">
                      {clk.clickId}
                    </td>
                    <td className="px-5 py-3 text-indigo-300">
                      {clk.device}
                    </td>
                    <td className="px-5 py-3 text-slate-500 truncate max-w-[120px]" title={clk.userAgent}>
                      {clk.userAgent}
                    </td>
                    <td className="px-5 py-3 text-center text-slate-300 font-black">
                      1
                    </td>
                    <td className="px-5 py-3 text-slate-450 truncate max-w-[100px]" title={clk.affS1}>
                      {clk.affS1 || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-450 truncate max-w-[100px]" title={clk.affS2}>
                      {clk.affS2 || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-450 truncate max-w-[100px]" title={clk.affS3}>
                      {clk.affS3 || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-450 truncate max-w-[100px]" title={clk.affS4}>
                      {clk.affS4 || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-450 truncate max-w-[100px]" title={clk.affS5}>
                      {clk.affS5 || "—"}
                    </td>
                  </tr>
                ))}

                {filteredClicksList.length === 0 && (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-slate-500 font-semibold uppercase text-xs">
                      No matching redirects registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT TYPE 4: CONVERSIONS REPORT LOGS */}
        {activeReportTab === "conversions" && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-850 text-left">
              <thead className="bg-slate-950 text-[10px] tracking-wider font-mono uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Country</th>
                  <th className="px-5 py-3">Conversion Status</th>
                  <th className="px-5 py-3">Conversion ID</th>
                  <th className="px-5 py-3">Offer Name</th>
                  <th className="px-5 py-3">Conversion Type</th>
                  <th className="px-5 py-3 text-right">Revenue</th>
                  <th className="px-5 py-3 text-right">Payout</th>
                  <th className="px-5 py-3">Aff S1</th>
                  <th className="px-5 py-3">Aff S2</th>
                  <th className="px-5 py-3">Aff S3</th>
                  <th className="px-5 py-3">Aff S4</th>
                  <th className="px-5 py-3">Aff S5</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-850 text-[11px] text-slate-400 font-mono bg-slate-900/40">
                {filteredConversionsList.map((cnv, idx) => (
                  <tr key={idx} className="hover:bg-slate-850/20 transition">
                    <td className="px-5 py-3 font-medium text-white truncate max-w-[120px]" title={cnv.timestamp}>
                      {cnv.timestamp}
                    </td>
                    <td className="px-5 py-3 text-slate-300 uppercase tracking-wide font-bold">
                      {cnv.country}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wide uppercase ${
                        cnv.status === "Validated"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : cnv.status === "Processing"
                          ? "bg-slate-950 text-slate-400 border border-slate-800"
                          : cnv.status === "Hold"
                          ? "bg-amber-950 text-amber-400 border border-amber-800"
                          : "bg-rose-955 text-rose-300 border border-rose-900"
                      }`}>
                        {cnv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-cyan-400 font-mono select-all">
                      {cnv.conversionId}
                    </td>
                    <td className="px-5 py-3 text-white truncate max-w-[150px]" title={cnv.offerName}>
                      {cnv.offerName.split(" - ")[0]}
                    </td>
                    <td className="px-5 py-3 text-slate-400">
                      {cnv.conversionType}
                    </td>
                    <td className="px-5 py-3 text-right text-indigo-300">
                      ${cnv.revenue.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right text-emerald-400 font-bold">
                      ${cnv.payout.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-slate-450 truncate max-w-[100px]" title={cnv.affS1}>
                      {cnv.affS1 || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-450 truncate max-w-[100px]" title={cnv.affS2}>
                      {cnv.affS2 || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-450 truncate max-w-[100px]" title={cnv.affS3}>
                      {cnv.affS3 || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-450 truncate max-w-[100px]" title={cnv.affS4}>
                      {cnv.affS4 || "—"}
                    </td>
                    <td className="px-5 py-3 text-slate-450 truncate max-w-[100px]" title={cnv.affS5}>
                      {cnv.affS5 || "—"}
                    </td>
                  </tr>
                ))}

                {filteredConversionsList.length === 0 && (
                  <tr>
                    <td colSpan={13} className="text-center py-10 text-slate-500 font-semibold uppercase text-xs">
                      No validated/processing conversions recorded in timing boundaries.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
      
    </div>
  );
}

export default ReportsView;
