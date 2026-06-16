import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  MapPin,
  CheckCircle,
  HelpCircle,
  Clock,
  Unlock,
  Lock,
  ArrowLeft,
  Settings,
  Link,
  Copy,
  Check,
  AlertTriangle,
  Award,
  Globe,
  ExternalLink,
  Tag,
  DollarSign,
  Briefcase,
  Layers,
  Send,
  X,
  FileText,
  Info,
  RefreshCw,
  Plus
} from "lucide-react";
import { SYSTEM_POSTBACK_PLACEHOLDERS } from "../data/publisherDemo";
import * as trackingApi from "../services/tracking";
import * as publicDetailApi from "../services/offerPublicDetail";
import type { PublisherOfferDetail } from "../services/offerPublicDetail";
import { listCategories } from "../services/offerCategories";
import { useBranding } from "../contexts/BrandingContext";

const COUNTRY_OPTIONS = [
  { value: "", label: "All Countries" },
  { value: "AF", label: "Afghanistan" },
  { value: "AL", label: "Albania" },
  { value: "DZ", label: "Algeria" },
  { value: "AS", label: "American Samoa" },
  { value: "AD", label: "Andorra" },
  { value: "AO", label: "Angola" },
  { value: "AI", label: "Anguilla" },
  { value: "AG", label: "Antigua and Barbuda" },
  { value: "AR", label: "Argentina" },
  { value: "AM", label: "Armenia" },
  { value: "AW", label: "Aruba" },
  { value: "AU", label: "Australia" },
  { value: "AT", label: "Austria" },
  { value: "AZ", label: "Azerbaijan" },
  { value: "BS", label: "Bahamas" },
  { value: "BH", label: "Bahrain" },
  { value: "BD", label: "Bangladesh" },
  { value: "BB", label: "Barbados" },
  { value: "BY", label: "Belarus" },
  { value: "BE", label: "Belgium" },
  { value: "BZ", label: "Belize" },
  { value: "BJ", label: "Benin" },
  { value: "BM", label: "Bermuda" },
  { value: "BT", label: "Bhutan" },
  { value: "BO", label: "Bolivia" },
  { value: "BA", label: "Bosnia and Herzegovina" },
  { value: "BW", label: "Botswana" },
  { value: "BR", label: "Brazil" },
  { value: "BN", label: "Brunei" },
  { value: "BG", label: "Bulgaria" },
  { value: "BF", label: "Burkina Faso" },
  { value: "BI", label: "Burundi" },
  { value: "CV", label: "Cabo Verde" },
  { value: "KH", label: "Cambodia" },
  { value: "CM", label: "Cameroon" },
  { value: "CA", label: "Canada" },
  { value: "KY", label: "Cayman Islands" },
  { value: "CF", label: "Central African Republic" },
  { value: "TD", label: "Chad" },
  { value: "CL", label: "Chile" },
  { value: "CN", label: "China" },
  { value: "CO", label: "Colombia" },
  { value: "KM", label: "Comoros" },
  { value: "CR", label: "Costa Rica" },
  { value: "CI", label: "Côte d'Ivoire" },
  { value: "HR", label: "Croatia" },
  { value: "CY", label: "Cyprus" },
  { value: "CZ", label: "Czech Republic" },
  { value: "DK", label: "Denmark" },
  { value: "DJ", label: "Djibouti" },
  { value: "DM", label: "Dominica" },
  { value: "DO", label: "Dominican Republic" },
  { value: "EC", label: "Ecuador" },
  { value: "EG", label: "Egypt" },
  { value: "SV", label: "El Salvador" },
  { value: "GQ", label: "Equatorial Guinea" },
  { value: "ER", label: "Eritrea" },
  { value: "EE", label: "Estonia" },
  { value: "SZ", label: "Eswatini" },
  { value: "ET", label: "Ethiopia" },
  { value: "FK", label: "Falkland Islands" },
  { value: "FO", label: "Faroe Islands" },
  { value: "FJ", label: "Fiji" },
  { value: "FI", label: "Finland" },
  { value: "FR", label: "France" },
  { value: "GF", label: "French Guiana" },
  { value: "PF", label: "French Polynesia" },
  { value: "GA", label: "Gabon" },
  { value: "GM", label: "Gambia" },
  { value: "GE", label: "Georgia" },
  { value: "DE", label: "Germany" },
  { value: "GH", label: "Ghana" },
  { value: "GI", label: "Gibraltar" },
  { value: "GR", label: "Greece" },
  { value: "GL", label: "Greenland" },
  { value: "GD", label: "Grenada" },
  { value: "GP", label: "Guadeloupe" },
  { value: "GU", label: "Guam" },
  { value: "GT", label: "Guatemala" },
  { value: "GN", label: "Guinea" },
  { value: "GW", label: "Guinea-Bissau" },
  { value: "GY", label: "Guyana" },
  { value: "HT", label: "Haiti" },
  { value: "HN", label: "Honduras" },
  { value: "HK", label: "Hong Kong" },
  { value: "HU", label: "Hungary" },
  { value: "IS", label: "Iceland" },
  { value: "IN", label: "India" },
  { value: "ID", label: "Indonesia" },
  { value: "IR", label: "Iran" },
  { value: "IQ", label: "Iraq" },
  { value: "IE", label: "Ireland" },
  { value: "IL", label: "Israel" },
  { value: "IT", label: "Italy" },
  { value: "JM", label: "Jamaica" },
  { value: "JP", label: "Japan" },
  { value: "JO", label: "Jordan" },
  { value: "KZ", label: "Kazakhstan" },
  { value: "KE", label: "Kenya" },
  { value: "KI", label: "Kiribati" },
  { value: "KW", label: "Kuwait" },
  { value: "KG", label: "Kyrgyzstan" },
  { value: "LA", label: "Laos" },
  { value: "LV", label: "Latvia" },
  { value: "LB", label: "Lebanon" },
  { value: "LS", label: "Lesotho" },
  { value: "LR", label: "Liberia" },
  { value: "LY", label: "Libya" },
  { value: "LI", label: "Liechtenstein" },
  { value: "LT", label: "Lithuania" },
  { value: "LU", label: "Luxembourg" },
  { value: "MO", label: "Macau" },
  { value: "MK", label: "North Macedonia" },
  { value: "MG", label: "Madagascar" },
  { value: "MW", label: "Malawi" },
  { value: "MY", label: "Malaysia" },
  { value: "MV", label: "Maldives" },
  { value: "ML", label: "Mali" },
  { value: "MT", label: "Malta" },
  { value: "MQ", label: "Martinique" },
  { value: "MR", label: "Mauritania" },
  { value: "MU", label: "Mauritius" },
  { value: "MX", label: "Mexico" },
  { value: "MD", label: "Moldova" },
  { value: "MC", label: "Monaco" },
  { value: "MN", label: "Mongolia" },
  { value: "ME", label: "Montenegro" },
  { value: "MS", label: "Montserrat" },
  { value: "MA", label: "Morocco" },
  { value: "MZ", label: "Mozambique" },
  { value: "MM", label: "Myanmar" },
  { value: "NA", label: "Namibia" },
  { value: "NR", label: "Nauru" },
  { value: "NP", label: "Nepal" },
  { value: "NL", label: "Netherlands" },
  { value: "NC", label: "New Caledonia" },
  { value: "NZ", label: "New Zealand" },
  { value: "NI", label: "Nicaragua" },
  { value: "NE", label: "Niger" },
  { value: "NG", label: "Nigeria" },
  { value: "KP", label: "North Korea" },
  { value: "NO", label: "Norway" },
  { value: "OM", label: "Oman" },
  { value: "PK", label: "Pakistan" },
  { value: "PS", label: "Palestine" },
  { value: "PA", label: "Panama" },
  { value: "PG", label: "Papua New Guinea" },
  { value: "PY", label: "Paraguay" },
  { value: "PE", label: "Peru" },
  { value: "PH", label: "Philippines" },
  { value: "PL", label: "Poland" },
  { value: "PT", label: "Portugal" },
  { value: "PR", label: "Puerto Rico" },
  { value: "QA", label: "Qatar" },
  { value: "RE", label: "Réunion" },
  { value: "RO", label: "Romania" },
  { value: "RU", label: "Russia" },
  { value: "RW", label: "Rwanda" },
  { value: "KN", label: "Saint Kitts and Nevis" },
  { value: "LC", label: "Saint Lucia" },
  { value: "VC", label: "Saint Vincent and the Grenadines" },
  { value: "WS", label: "Samoa" },
  { value: "SM", label: "San Marino" },
  { value: "ST", label: "São Tomé and Príncipe" },
  { value: "SA", label: "Saudi Arabia" },
  { value: "SN", label: "Senegal" },
  { value: "RS", label: "Serbia" },
  { value: "SC", label: "Seychelles" },
  { value: "SL", label: "Sierra Leone" },
  { value: "SG", label: "Singapore" },
  { value: "SK", label: "Slovakia" },
  { value: "SI", label: "Slovenia" },
  { value: "SB", label: "Solomon Islands" },
  { value: "SO", label: "Somalia" },
  { value: "ZA", label: "South Africa" },
  { value: "KR", label: "South Korea" },
  { value: "SS", label: "South Sudan" },
  { value: "ES", label: "Spain" },
  { value: "LK", label: "Sri Lanka" },
  { value: "SD", label: "Sudan" },
  { value: "SR", label: "Suriname" },
  { value: "SE", label: "Sweden" },
  { value: "CH", label: "Switzerland" },
  { value: "SY", label: "Syria" },
  { value: "TW", label: "Taiwan" },
  { value: "TJ", label: "Tajikistan" },
  { value: "TZ", label: "Tanzania" },
  { value: "TH", label: "Thailand" },
  { value: "TL", label: "Timor-Leste" },
  { value: "TG", label: "Togo" },
  { value: "TO", label: "Tonga" },
  { value: "TT", label: "Trinidad and Tobago" },
  { value: "TN", label: "Tunisia" },
  { value: "TR", label: "Turkey" },
  { value: "TM", label: "Turkmenistan" },
  { value: "TC", label: "Turks and Caicos Islands" },
  { value: "TV", label: "Tuvalu" },
  { value: "UG", label: "Uganda" },
  { value: "UA", label: "Ukraine" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "UY", label: "Uruguay" },
  { value: "UZ", label: "Uzbekistan" },
  { value: "VU", label: "Vanuatu" },
  { value: "VA", label: "Vatican City" },
  { value: "VE", label: "Venezuela" },
  { value: "VN", label: "Vietnam" },
  { value: "EH", label: "Western Sahara" },
  { value: "YE", label: "Yemen" },
  { value: "ZM", label: "Zambia" },
  { value: "ZW", label: "Zimbabwe" }
];

interface OfferMarketplaceViewProps {
  onNavigate: (view: string) => void;
  selectedOfferId: string | null;
  setSelectedOfferId: (id: string | null) => void;
  offers: any[];
  setOffers: React.Dispatch<React.SetStateAction<any[]>>;
  onAddNotification?: (
    type: "approved" | "rejected" | "payout" | "paused" | "activated" | "announcement",
    title: string,
    message: string,
    offerId?: string,
    rejectionReason?: string
  ) => void;
}

export function OfferMarketplaceView({
  onNavigate,
  selectedOfferId,
  setSelectedOfferId,
  offers,
  setOffers,
  onAddNotification = () => {},
}: OfferMarketplaceViewProps) {
  const branding = useBranding();
  const [categoryFilter, setCategoryFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [offerNameFilter, setOfferNameFilter] = useState("");
  const [offerIdFilter, setOfferIdFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    category: "",
    country: "",
    name: "",
    id: ""
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [marketplaceOffers, setMarketplaceOffers] = useState<any[]>([]);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);

  const normalizeApiOffer = (offer: any, appMap: Record<string, string> = {}) => {
    const dbStatus = offer.status || offer.offer_status || "";
    const requiresApproval = offer.requires_publisher_approval ?? false;
    const offerId = offer.id?.toString?.() ?? "";
    const existingApp = appMap[offerId];

    let mappedStatus: string;
    if (dbStatus === "ACTIVE") {
      if (!requiresApproval) {
        mappedStatus = "open_access";
      } else if (existingApp === "APPROVED") {
        mappedStatus = "approved";
      } else if (existingApp === "PENDING") {
        mappedStatus = "pending_approval";
      } else if (existingApp === "REJECTED") {
        mappedStatus = "rejected";
      } else {
        mappedStatus = "requires_approval";
      }
    } else {
      // PAUSED, DRAFT, ARCHIVED, EXHAUSTED, CLOSED — not visible to publishers
      mappedStatus = "unavailable";
    }

    // Explicit allowlist — no spread. Advertiser fields are intentionally excluded.
    // Publishers must never receive advertiser_id, advertiser_name, or any advertiser metadata.
    return {
      id: offerId,
      name: offer.name ?? "Untitled Offer",
      category: offer.category ?? "General",
      status: mappedStatus,
      payoutType: offer.payout_type ?? offer.payoutType ?? "CPA",
      payoutValue: Number(offer.payout_amount ?? offer.payoutValue ?? 0),
      currency: offer.currency ?? "USD",
      geos: Array.isArray(offer.target_geos) ? offer.target_geos : Array.isArray(offer.geos) ? offer.geos : [],
      devices: Array.isArray(offer.target_devices) ? offer.target_devices.join(", ") : offer.target_devices ?? offer.devices ?? "",
      rawUrl: offer.landing_page_url ?? offer.rawUrl ?? "",
      caps: typeof offer.caps === "string" ? offer.caps : offer.caps != null ? "Live offer details available on request" : "Live offer details available on request",
      landing_page_url: offer.landing_page_url ?? offer.rawUrl ?? "",
      requires_publisher_approval: requiresApproval,
      slug: offer.slug ?? "",
      terms: offer.terms ?? "",
      tracking_protocol: offer.tracking_protocol ?? "S2S",
      target_geos: Array.isArray(offer.target_geos) ? offer.target_geos : [],
      target_devices: Array.isArray(offer.target_devices) ? offer.target_devices : [],
      description: offer.description ?? "",
      specs: offer.specs ?? null,
      rejectionReason: offer.rejectionReason ?? null,
      logo_url: offer.offer_logo_url ?? null,
      traffic_rules: offer.traffic_rules ?? null,
    };
  };

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      setIsLoadingOffers(true);
      setOffersError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        if (!active) return;
        setOffersError("Missing authorization token.");
        setIsLoadingOffers(false);
        return;
      }

      try {
        const [offersRes, appsRes] = await Promise.all([
          fetch("http://localhost:3000/api/offers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3000/api/applications/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!offersRes.ok) {
          throw new Error(`Failed to load offers: ${offersRes.status}`);
        }

        const offersData = await offersRes.json();

        const appMap: Record<string, string> = {};
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          if (Array.isArray(appsData.applications)) {
            appsData.applications.forEach((app: any) => {
              appMap[String(app.offer_id)] = app.status;
            });
          }
        }

        if (!active) return;
        setApplicationMap(appMap);

        const mappedOffers = Array.isArray(offersData.offers)
          ? offersData.offers.map((o: any) => normalizeApiOffer(o, appMap))
          : [];
        setMarketplaceOffers(mappedOffers);
      } catch (error: any) {
        if (!active) return;
        setOffersError(error.message || "Unable to load offers.");
      } finally {
        if (!active) return;
        setIsLoadingOffers(false);
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, []);

  // Link generation custom states inside the Offer Detail layout
  const [pubSub1, setPubSub1] = useState("");
  const [pubSub2, setPubSub2] = useState("");
  const [selectedLanderId, setSelectedLanderId] = useState("");

  // Tracking link generated via backend API — same architecture as TrackingLinkView
  const [detailLink, setDetailLink] = useState<trackingApi.TrackingLink | null>(null);
  const [isGeneratingDetailLink, setIsGeneratingDetailLink] = useState(false);
  const [detailLinkError, setDetailLinkError] = useState<string | null>(null);

  // Postback states inside Offer Detail
  const [postbackUrlInput, setPostbackUrlInput] = useState("");
  const [pbTrigger, setPbTrigger] = useState("conversion");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Request Access Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [promotionalMethodInput, setPromotionalMethodInput] = useState("");
  const [primaryTrafficInput, setPrimaryTrafficInput] = useState("");
  const [targetRequestOfferId, setTargetRequestOfferId] = useState<string | null>(null);
  const [applicationMap, setApplicationMap] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Admin Panel states
  const [adminRejectionReason, setAdminRejectionReason] = useState("");
  const [showAdminRejectionForm, setShowAdminRejectionForm] = useState(false);
  const [adminMoreInfoMessage, setAdminMoreInfoMessage] = useState("");
  const [showAdminMoreInfoForm, setShowAdminMoreInfoForm] = useState(false);
  const [adminDialogLogs, setAdminDialogLogs] = useState<{ id: string; sender: string; text: string; time: string }[]>([]);

  // Publisher-detail: landing pages, creatives, allowed geos/devices from DB
  const [offerPublicDetail, setOfferPublicDetail] = useState<PublisherOfferDetail | null>(null);
  const [offerPublicDetailLoading, setOfferPublicDetailLoading] = useState(false);

  // Find targeted offer if any
  const currentOffer = useMemo(() => {
    if (!selectedOfferId) return null;
    return marketplaceOffers.find(o => o.id === selectedOfferId) || null;
  }, [selectedOfferId, marketplaceOffers]);

  // Fetch publisher detail (landing pages, creatives, geo/device targeting) when offer is selected
  useEffect(() => {
    if (!selectedOfferId) {
      setOfferPublicDetail(null);
      return;
    }
    let active = true;
    setOfferPublicDetailLoading(true);
    setOfferPublicDetail(null);
    publicDetailApi.getPublisherDetail(selectedOfferId)
      .then(data => { if (active) setOfferPublicDetail(data); })
      .catch(() => { /* non-fatal — sections hide when data is absent */ })
      .finally(() => { if (active) setOfferPublicDetailLoading(false); });
    return () => { active = false; };
  }, [selectedOfferId]);

  // Set default lander when landers become available
  useEffect(() => {
    const landers = offerPublicDetail?.landing_pages ?? [];
    if (landers.length > 0) {
      setSelectedLanderId(landers[0].id);
      setPostbackUrlInput(`https://callback.my-tracker-system.com/receive?click_id={click_id}&payout={payout}&sub1={sub1}`);
    } else {
      setSelectedLanderId("");
    }
  }, [offerPublicDetail]);

  // Load categories from DB (active only) for filter dropdown
  useEffect(() => {
    listCategories(true)
      .then(records => setDbCategories(records.map(r => r.name).sort((a, b) => a.localeCompare(b))))
      .catch(() => {/* non-fatal — filter will have no categories */});
  }, []);

  const categories = dbCategories;

  // Only these statuses are derived from ACTIVE offers and are visible in the marketplace
  const MARKETPLACE_VISIBLE = new Set(["open_access", "requires_approval", "approved", "pending_approval", "rejected"]);

  const filteredOffers = useMemo(() => {
    return marketplaceOffers.filter((offer) => {
      if (!MARKETPLACE_VISIBLE.has(offer.status)) return false;
      const matchesCategory = !appliedFilters.category || offer.category === appliedFilters.category;
      const matchesCountry = !appliedFilters.country || offer.geos.includes(appliedFilters.country);
      const matchesName = !appliedFilters.name || offer.name.toLowerCase().includes(appliedFilters.name.toLowerCase());
      const matchesId = !appliedFilters.id || offer.id.toLowerCase().includes(appliedFilters.id.toLowerCase());
      return matchesCategory && matchesCountry && matchesName && matchesId;
    });
  }, [appliedFilters, marketplaceOffers]);

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Reset generated link when offer changes
  useEffect(() => {
    setDetailLink(null);
    setDetailLinkError(null);
  }, [currentOffer?.id]);

  const handleGenerateDetailLink = async () => {
    if (!currentOffer) return;
    setIsGeneratingDetailLink(true);
    setDetailLinkError(null);
    try {
      const link = await trackingApi.generateTrackingLink({
        offer_id: Number(currentOffer.id),
        sub1: pubSub1 || undefined,
        sub2: pubSub2 || undefined,
      });
      setDetailLink(link);
    } catch (err: any) {
      setDetailLinkError(err.message || "Failed to generate tracking link");
    } finally {
      setIsGeneratingDetailLink(false);
    }
  };

  const detailLinkUrl = detailLink ? branding.trackingDomain + detailLink.tracking_url : null;

  // Simulated postback save trigger
  const handleSaveOfferPostback = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Open modal handler
  const handleOpenRequestModal = (offerId: string) => {
    setTargetRequestOfferId(offerId);
    setPromotionalMethodInput("");
    setPrimaryTrafficInput("");
    setSubmitError(null);
    setShowRequestModal(true);
  };

  // Submit request access handler
  const handleSubmitRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRequestOfferId) return;

    setSubmitting(true);
    setSubmitError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setSubmitError("Not authenticated.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          offer_id: Number(targetRequestOfferId),
          comments: promotionalMethodInput,
          submission_data: {
            traffic_source: primaryTrafficInput,
            promotion_method: promotionalMethodInput,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as any).message || "Failed to submit request.");
      }

      setApplicationMap(prev => ({ ...prev, [targetRequestOfferId]: "PENDING" }));
      setMarketplaceOffers(prev =>
        prev.map(o => o.id === targetRequestOfferId ? { ...o, status: "pending_approval" } : o)
      );

      onAddNotification(
        "announcement",
        "Offer Access Requested",
        `Your traffic request for Campaign #${targetRequestOfferId} is now pending network representative security audit.`,
        targetRequestOfferId
      );

      setShowRequestModal(false);
      setTargetRequestOfferId(null);
      setPromotionalMethodInput("");
      setPrimaryTrafficInput("");
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Admin Direct State Update Simulation
  const handleAdminApprove = (offerId: string) => {
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: "approved" } : o));
    onAddNotification(
      "approved",
      "Offer Access Approved",
      `Outstanding news! Your application for Campaign #${offerId} has been fully approved by our compliance bureau. Tracking link generator is active.`,
      offerId
    );
    setShowAdminRejectionForm(false);
    setShowAdminMoreInfoForm(false);
  };

  const handleAdminRejectSubmit = (e: React.FormEvent, offerId: string) => {
    e.preventDefault();
    const reason = adminRejectionReason.trim() || "Traffic origin mismatch or promotion model unsupported on this campaign.";
    setOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: "rejected", rejectionReason: reason } : o));
    
    onAddNotification(
      "rejected",
      "Offer Access Rejected",
      `Your request for Campaign #${offerId} was rejected during manual auditing. Reason details locked.`,
      offerId,
      reason
    );

    setAdminRejectionReason("");
    setShowAdminRejectionForm(false);
    setShowAdminMoreInfoForm(false);
  };

  const handleAdminMoreInfoSubmit = (e: React.FormEvent, offerId: string) => {
    e.preventDefault();
    const message = adminMoreInfoMessage.trim() || "Please describe if you have run Nutra campaigns on other networks.";
    
    // Log dialogue simulation
    setAdminDialogLogs(prev => [
      ...prev,
      {
        id: "msg-" + Date.now(),
        sender: "AM Sophia",
        text: message,
        time: "Just Now"
      }
    ]);

    onAddNotification(
      "announcement",
      "Details Required for Offer",
      `AM Sophia requested additional traffic metrics for Campaign #${offerId}: "${message}"`,
      offerId
    );

    setAdminMoreInfoMessage("");
    setShowAdminMoreInfoForm(false);
  };

  const handlePublisherReplyMoreInfo = (text: string) => {
    if (!text.trim()) return;
    setAdminDialogLogs(prev => [
      ...prev,
      {
        id: "msg-pub-" + Date.now(),
        sender: "You (Publisher)",
        text,
        time: "Just Now"
      }
    ]);
  };

  // Determine actual display status based on state
  const isAccessible = currentOffer && (currentOffer.status === "open_access" || currentOffer.status === "approved");
  const isPending = currentOffer && currentOffer.status === "pending_approval";
  const isRejected = currentOffer && currentOffer.status === "rejected";
  const isRequiresApproval = currentOffer && currentOffer.status === "requires_approval";

  // ---------------------------------------------------------
  // RENDER SEPARATE OFFER DETAIL PAGE
  // ---------------------------------------------------------
  if (currentOffer) {
    const deviceCompatibility = currentOffer.specs?.deviceCompatibility ?? currentOffer.devices ?? "";
    const trackingProtocol = currentOffer.specs?.trackingProtocol ?? "S2S";
    const adminNote = currentOffer.specs?.adminNote ?? "";

    return (
      <div className="space-y-6 font-sans animate-fadeIn" id="offer-details-view">
        
        {/* Mock Navigation Breadcrumbs bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="cursor-pointer hover:text-cyan-300" onClick={() => setSelectedOfferId(null)}>Offers</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-400">ID: {currentOffer.id}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-cyan-400 font-bold truncate max-w-[200px]">{currentOffer.name}</span>
            </div>
            {/* Real Everflow Simulated URL Path */}
            <div className="bg-slate-950 px-2 py-1 rounded inline-block text-[10px] text-slate-400 font-mono border border-slate-900 select-all">
              Path Routing: <span className="text-cyan-400 font-bold">/publisher/offers/{currentOffer.id}</span>
            </div>
          </div>

          <button
            onClick={() => setSelectedOfferId(null)}
            className="bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-950 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition select-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace list
          </button>
        </div>

        {/* 🛑 ACTIVE WORKFLOW ALERTS AND BANNERS */}
        {isPending && (
          <div className="bg-amber-50 text-amber-800 border border-amber-200 p-5 rounded-2xl flex items-start gap-3.5 shadow-sm animate-pulse">
            <Clock className="w-5 h-5 mt-0.5 text-amber-700 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold uppercase tracking-wider font-mono">APPLICATION REVIEW PENDING</h4>
              <p className="text-xs text-slate-700 leading-normal">
                Your application for Campaign #{currentOffer.id} is under review by our representative Sophia Kovalski (Affiliate Rep). Tracking links, direct landers, and banner creative assets will unlock immediately upon security clearance of your promotion methods.
              </p>
            </div>
          </div>
        )}

        {isRejected && (
          <div className="bg-rose-950/60 text-rose-300 border border-rose-900 p-5 rounded-2xl flex items-start gap-3.5 shadow-md">
            <AlertTriangle className="w-5 h-5 mt-0.5 text-rose-400 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold uppercase tracking-wider font-mono">ACCESS REQUEST DECLINED</h4>
              <p className="text-xs text-slate-300 leading-normal">
                Unfortunately, access was declined during audits.
              </p>
              {currentOffer.rejectionReason && (
                <div className="bg-rose-50 p-2.5 rounded border border-rose-200 text-[10px] text-rose-800 font-mono mt-1.5">
                  <strong>Declined Reason:</strong> {currentOffer.rejectionReason}
                </div>
              )}
              <p className="text-[10px] text-slate-400">
                Contact your assigned AM Sophia via Telegram (@AM_Sophia_Apex) to supply counter proof or apply for a traffic waiver.
              </p>
            </div>
          </div>
        )}

        {/* Dynamic header Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-cyan-950 text-cyan-400 text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-cyan-900 uppercase">
                {currentOffer.category}
              </span>
              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase border ${
                currentOffer.status === "open_access" 
                  ? "bg-slate-50 text-slate-800 border-slate-200" 
                  : currentOffer.status === "approved"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : currentOffer.status === "pending_approval"
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : currentOffer.status === "rejected"
                  ? "bg-rose-50 text-rose-800 border-rose-300"
                  : "bg-amber-100 text-amber-800 border-amber-300"
              }`}>
                {currentOffer.status === "requires_approval"
                  ? "Approval Required"
                  : currentOffer.status === "pending_approval"
                  ? "Requested / Pending"
                  : currentOffer.status.replace("_", " ")}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {currentOffer.logo_url && (
                <img src={currentOffer.logo_url} alt="" className="w-14 h-14 object-contain rounded-xl border border-slate-700 bg-slate-900 flex-shrink-0" />
              )}
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {currentOffer.name}
              </h2>
            </div>
            {currentOffer.terms && (
              <p className="text-slate-600 text-xs leading-relaxed">
                {currentOffer.terms}
              </p>
            )}
          </div>

          {/* Right quick stats summary */}
          <div className="lg:col-span-4 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono font-bold block">
                Approved Payout Rate
              </span>
              <div className="flex items-baseline gap-1 text-cyan-300">
                <span className="text-3xl font-black font-mono">${currentOffer.payoutValue.toFixed(2)}</span>
                <span className="text-xs font-bold font-mono uppercase text-slate-400">/{currentOffer.payoutType}</span>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-3 space-y-2 text-[11px] text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Targets geo caps:</span>
                <span className="text-white font-bold">{currentOffer.caps}</span>
              </div>
              <div className="flex justify-between">
                <span>Tracking Type:</span>
                <span className="text-white font-bold">API / Postback redirect S2S</span>
              </div>
            </div>
          </div>

        </div>

        {/* TWO COLUMN GRID DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT PANELS: GEOS, RESTRICTIONS, LANDERS (7/12) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* GEOGRAPHIC GEO TARGET CHIPS — from targeting rules, hide if empty */}
            {offerPublicDetail && offerPublicDetail.allowed_geos.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                <strong className="text-slate-950 text-xs uppercase font-mono tracking-wider block">
                  Allowed Geo Targets ({offerPublicDetail.allowed_geos.length})
                </strong>
                <div className="flex flex-wrap gap-1.5">
                  {offerPublicDetail.allowed_geos.map((geo: string) => (
                    <span key={geo} className="bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wide flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      {geo}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ALLOWED DEVICES — from targeting rules, hide if empty */}
            {offerPublicDetail && offerPublicDetail.allowed_devices.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                <strong className="text-slate-950 text-xs uppercase font-mono tracking-wider block">
                  Allowed Devices
                </strong>
                <div className="flex flex-wrap gap-1.5">
                  {offerPublicDetail.allowed_devices.map((device: string) => (
                    <span key={device} className="bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wide capitalize">
                      {device}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* TRAFFIC RESTRICTIONS — from offer traffic_rules.text, hide if empty */}
            {(() => {
              const tr = currentOffer.traffic_rules as any;
              const trafficText: string = tr?.text ?? tr?.value ?? "";
              if (!trafficText) return null;
              const lines = trafficText.split("\n").map((l: string) => l.trim()).filter(Boolean);
              if (lines.length === 0) return null;
              return (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                  <strong className="text-slate-950 text-xs uppercase font-mono tracking-wider flex items-center gap-1.5 text-rose-600">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Traffic Limitations (STRICT POLICY)
                  </strong>
                  <ul className="space-y-1.5">
                    {lines.map((line: string, i: number) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="text-rose-500 font-bold block mt-0.5">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}

            {/* LANDING PAGES — from DB, visible only when offer is accessible */}
            {isAccessible && offerPublicDetail && offerPublicDetail.landing_pages.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 animate-fadeIn shadow-sm">
                <strong className="text-slate-950 text-xs uppercase font-mono tracking-wider block text-emerald-600">
                  ✓ Approved Landing Pages ({offerPublicDetail.landing_pages.length})
                </strong>
                <div className="space-y-2">
                  {offerPublicDetail.landing_pages.map((lander) => (
                    <div key={lander.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between text-xs gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <strong className="text-slate-200 block truncate font-sans">{lander.name}</strong>
                        <code className="text-[10px] text-slate-500 block truncate font-mono">{lander.url}</code>
                      </div>
                      {lander.preview_url ? (
                        <a
                          href={lander.preview_url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 transition text-[10px] select-none flex items-center gap-1 shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Preview
                        </a>
                      ) : (
                        <a
                          href={lander.url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 transition text-[10px] select-none flex items-center gap-1 shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Open
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CREATIVES — from DB, visible only when offer is accessible */}
            {isAccessible && offerPublicDetail && offerPublicDetail.creatives.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 animate-fadeIn shadow-sm">
                <strong className="text-slate-950 text-xs uppercase font-mono tracking-wider block text-emerald-600">
                  ✓ Available Media Assets ({offerPublicDetail.creatives.length})
                </strong>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {offerPublicDetail.creatives.map((creative) => (
                    <div key={creative.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between text-xs gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <strong className="text-slate-200 block text-xs truncate">{creative.name}</strong>
                        <span className="text-[10px] text-slate-500 font-mono uppercase">
                          {creative.creative_type}{creative.dimensions ? ` / ${creative.dimensions}` : ""}
                        </span>
                        {creative.notes && (
                          <span className="text-[10px] text-slate-600 block truncate">{creative.notes}</span>
                        )}
                      </div>
                      {creative.file_url ? (
                        <a
                          href={creative.file_url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-900 hover:bg-slate-850 text-cyan-400 text-[10px] font-mono px-2 py-1 rounded border border-slate-800 shrink-0 flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Download
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>

          {/* RIGHT PANELS: LINK GENERATOR & S2S POSTBACKS (5/12) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* ACCESSIBLE WRAPPER: Generates links and postbacks ONLY if open_access or approved */}
            {isAccessible ? (
              <>
                {/* SCREEN 9: TRACKING LINK GENERATOR */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 animate-fadeIn shadow-sm" id="tracking-link-generator-box">
                  <div className="space-y-0.5">
                    <h3 className="text-white text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <Link className="w-3.5 h-3.5 text-cyan-400" />
                      Link Generator Workspace
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Compile sub-track parameters for individual media streams.
                    </p>
                  </div>

                  {/* Form elements */}
                  <div className="space-y-3 text-xs font-mono">
                    
                    {offerPublicDetail && offerPublicDetail.landing_pages.length > 0 && (
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-slate-400">
                          Select Target Lander
                        </label>
                        <select
                          value={selectedLanderId}
                          onChange={(e) => setSelectedLanderId(e.target.value)}
                          className="mt-1 block w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-cyan-500"
                        >
                          {offerPublicDetail.landing_pages.map((lan) => (
                            <option key={lan.id} value={lan.id}>{lan.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-slate-400">
                          Sub ID 1 (source)
                        </label>
                        <input
                          type="text"
                          value={pubSub1}
                          onChange={(e) => setPubSub1(e.target.value)}
                          placeholder="e.g. facebook_ads"
                          className="mt-1 block w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500 placeholder-slate-705"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-slate-400">
                          Sub ID 2 (creative)
                        </label>
                        <input
                          type="text"
                          value={pubSub2}
                          onChange={(e) => setPubSub2(e.target.value)}
                          placeholder="e.g. adset_9"
                          className="mt-1 block w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-cyan-500 placeholder-slate-705"
                        />
                      </div>
                    </div>

                    {/* Tracking link generate & display */}
                    <div className="space-y-2 pt-1">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">
                        Tracking URL
                      </span>

                      {detailLinkError && (
                        <div className="bg-rose-950/40 border border-rose-800 text-rose-300 text-[10px] p-2.5 rounded-lg font-mono">
                          {detailLinkError}
                        </div>
                      )}

                      {detailLinkUrl ? (
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                          <p className="text-[11px] font-mono text-cyan-300 break-all select-all leading-normal">
                            {detailLinkUrl}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCopy(detailLinkUrl, "aff_tracking_link")}
                              className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white py-1.5 rounded-lg border border-slate-800 text-[10px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1 select-none cursor-pointer"
                            >
                              {copiedKey === "aff_tracking_link" ? (
                                <><Check className="w-3.5 h-3.5 text-emerald-400" />Copied!</>
                              ) : (
                                <><Copy className="w-3.5 h-3.5" />Copy URL</>
                              )}
                            </button>
                            <button
                              onClick={() => { setDetailLink(null); setDetailLinkError(null); }}
                              className="px-3 bg-slate-900 hover:bg-slate-850 text-slate-400 py-1.5 rounded-lg border border-slate-800 text-[10px] transition cursor-pointer"
                              title="Generate new link"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={handleGenerateDetailLink}
                          disabled={isGeneratingDetailLink}
                          className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          {isGeneratingDetailLink ? (
                            <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Generating…</>
                          ) : (
                            <><Plus className="w-3.5 h-3.5" />Generate & Save Link</>
                          )}
                        </button>
                      )}
                    </div>

                  </div>
                </div>

                {/* SCREEN 10: DYNAMIC INSIDE POSTBACK SETUP */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 animate-fadeIn shadow-sm">
                  <div className="space-y-0.5">
                    <h3 className="text-white text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                      Dynamic S2S Postback Setup
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Bind server callbacks triggered dynamically by this campaign conversion.
                    </p>
                  </div>

                  <form onSubmit={handleSaveOfferPostback} className="space-y-3 text-xs">
                    
                    {saveSuccess && (
                      <div className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 p-2.5 rounded-lg text-[10px]">
                        ✓ Postback endpoint registered in our system index database!
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase text-slate-500 font-mono">Event Trigger</label>
                        <select
                          value={pbTrigger}
                          onChange={(e) => setPbTrigger(e.target.value)}
                          className="mt-1 block w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none focus:border-cyan-500"
                        >
                          <option value="conversion">Conversion (Default)</option>
                          <option value="click">Every Click Hit</option>
                          <option value="hold">Rejected Fraud Event</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-slate-500 font-mono">Method</label>
                        <select className="mt-1 block w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 focus:outline-none">
                          <option>GET HTTP (Fastest)</option>
                          <option>POST JSON</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase text-slate-500 font-mono">Server Endpoint Postback URL</label>
                      <textarea
                        required
                        value={postbackUrlInput}
                        onChange={(e) => setPostbackUrlInput(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 font-mono text-[10px] focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded-xl transition uppercase tracking-wider font-mono text-[10px] cursor-pointer"
                    >
                      Save Postback Endpoint Callback
                    </button>

                  </form>
                </div>
              </>
            ) : (
              /* RESTRICTED VIEWS OVERRIDES: Hide Link Generator workspace options, show requests center instead */
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-sm">
                <Lock className="w-10 h-10 text-amber-500/80 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-white font-mono">Tracking Links Restricted</h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    This offer requires explicit manager approval before tracking redirects can be routed. Clicking request sends traffic details to compliance auditing.
                  </p>
                </div>

                {isRequiresApproval && (
                  <button
                    onClick={() => handleOpenRequestModal(currentOffer.id)}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black py-3 rounded-xl text-xs uppercase font-mono tracking-wider transition cursor-pointer select-none"
                  >
                    Request Offer Access
                  </button>
                )}

                {isPending && (
                  <div className="bg-amber-950/40 text-amber-400 border border-amber-900/40 p-3 rounded-xl text-xs font-mono">
                    ⌛ Awaiting representative verification
                  </div>
                )}

                {isRejected && (
                  <div className="bg-rose-950/40 text-rose-455 border border-rose-900/40 p-3 rounded-xl text-xs font-mono">
                    ❌ Traffic parameters rejected
                  </div>
                )}
              </div>
            )}

            {/* QUICK PREVIEW SPEC SHEETS METRICS */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 font-sans shadow-sm">
                <strong className="text-slate-950 text-xs uppercase font-mono tracking-wider block">
                  Technical Specifications
                </strong>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-slate-850 pb-1.5">
                    <span className="text-slate-505">Device Compatibility:</span>
                    <span className="text-slate-205 font-mono font-bold text-slate-200">{deviceCompatibility}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-850 pb-1.5">
                    <span className="text-slate-505">Tracking Protocol:</span>
                    <span className="text-slate-205 font-mono text-cyan-400">{trackingProtocol}</span>
                  </div>
                  {adminNote && adminNote.trim().length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-505">Admin Note:</span>
                      <span className="text-slate-700 font-mono">{adminNote}</span>
                    </div>
                  )}
                </div>
            </div>

          </div>

        </div>

        {/* 🛡️ REQUEST ACCESS POPUP MODAL (EVERFLOW / TRACKIER-STYLE) */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="request-access-modal">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
              
              <button
                onClick={() => setShowRequestModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-950 border border-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="bg-cyan-100 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-900 text-cyan-700 dark:text-cyan-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                  Audits Handshake Access Request
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Applying for ID #{targetRequestOfferId} Campaign Access
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supply promotion methods to bypass manual hold parameters instantly.
                </p>
              </div>

              <form onSubmit={handleSubmitRequestAccess} className="space-y-4 text-xs">

                <div className="space-y-1 pb-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-505 dark:text-slate-400 font-mono">
                    1. How will you promote this offer? <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={promotionalMethodInput}
                    onChange={(e) => setPromotionalMethodInput(e.target.value)}
                    placeholder="Describe direct marketing pathways (e.g., standard newsletters to 15k finance subs, Facebook lookalike campaigns)..."
                    className="block w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-505 dark:text-slate-400 font-mono">
                    2. Traffic Source <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={primaryTrafficInput}
                    onChange={(e) => setPrimaryTrafficInput(e.target.value)}
                    placeholder="e.g. Email Lists, Native RevContent, SEO portals"
                    className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-855 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal font-mono flex items-start gap-2">
                  <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span>By submitting, Campaign Access will transition to <strong>Pending Approval</strong> state immediately in compliance with affiliate standard reviews.</span>
                </div>

                {submitError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl text-[11px] font-mono">
                    {submitError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-extrabold py-3 rounded-xl uppercase font-mono tracking-wider transition cursor-pointer"
                >
                  {submitting ? "Submitting…" : "Submit Request"}
                </button>

              </form>

            </div>
          </div>
        )}

      </div>
    );
  }

  // ---------------------------------------------------------
  // RENDER MAIN OFFERS LIST (SCREEN 6)
  // ---------------------------------------------------------
  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="offers-list-view">
      
      {/* Intro banner */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            <Briefcase className="w-5 h-5 text-cyan-400" />
            Offer Campaigns Marketplace
          </h2>
          <p className="text-xs text-slate-400">
            Apply, fetch trackers, generate unique sub-referrals, and integrate server-to-server callbacks.
          </p>
        </div>

        {/* Real Everflow Simulated URL Path */}
        <div className="bg-slate-950 px-2 py-1 rounded text-[10px] text-slate-400 font-mono border border-slate-900 select-all shrink-0">
          Path Routing: <span className="text-cyan-400 font-bold">/publisher/offers</span>
        </div>
      </div>

      {/* FILTER SEARCH PANEL */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-cyan-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Country</label>
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-cyan-500 focus:outline-none"
            >
              {COUNTRY_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Offer Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search offer name..."
                value={offerNameFilter}
                onChange={(e) => setOfferNameFilter(e.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-10 py-2 text-sm text-slate-800 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Offer ID</label>
            <input
              type="text"
              placeholder="Search offer ID..."
              value={offerIdFilter}
              onChange={(e) => setOfferIdFilter(e.target.value)}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setAppliedFilters({ category: categoryFilter, country: countryFilter, name: offerNameFilter, id: offerIdFilter })}
            className="h-12 rounded-xl bg-cyan-600 text-white text-xs font-semibold uppercase tracking-[0.24em] transition hover:bg-cyan-500"
          >
            SEARCH OFFERS
          </button>

          <button
            type="button"
            onClick={() => {
              setCategoryFilter("");
              setCountryFilter("");
              setOfferNameFilter("");
              setOfferIdFilter("");
              setAppliedFilters({ category: "", country: "", name: "", id: "" });
            }}
            className="h-12 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold uppercase tracking-[0.24em] transition hover:bg-slate-50"
          >
            CLEAR FILTERS
          </button>
        </div>
      </div>

      {/* RESULTS LIST TABLE (Everflow / Trackier classic high-density design) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        
        {isLoadingOffers ? (
          <div className="text-center py-16 text-slate-500 space-y-2 bg-slate-50">
            <Clock className="w-8 h-8 text-slate-700 mx-auto animate-spin" />
            <p className="text-sm font-mono">Loading marketplace offers...</p>
          </div>
        ) : offersError ? (
          <div className="text-center py-16 text-slate-500 space-y-2 bg-slate-50">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-sm font-mono">Unable to load offers.</p>
            <p className="text-xs text-slate-400">{offersError}</p>
          </div>
        ) : marketplaceOffers.length === 0 ? (
          <div className="text-center py-16 text-slate-500 space-y-2 bg-slate-50">
            <HelpCircle className="w-8 h-8 text-slate-700 mx-auto" />
            <p className="text-sm font-mono">No offers available.</p>
            <p className="text-xs">The marketplace did not return any active campaigns.</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-2 bg-slate-50">
            <HelpCircle className="w-8 h-8 text-slate-700 mx-auto" />
            <p className="text-sm font-mono">No offers found for selected filters.</p>
            <p className="text-xs">Try resetting filters or choosing a different country or category.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left">
              
              <thead className="bg-slate-50 text-[10px] tracking-wider text-slate-500 font-mono uppercase">
                <tr>
                  <th className="px-4 py-3 text-center w-14">ID</th>
                  <th className="px-4 py-3">Campaign Name & Category</th>
                  <th className="px-4 py-3">GEO Coverage</th>
                  <th className="px-4 py-3">payout type</th>
                  <th className="px-4 py-3">payout rate</th>
                  <th className="px-4 py-3">Target daily Caps</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Interactive Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800 text-xs text-slate-700 leading-normal">
                {filteredOffers.map((offer) => {
                  const isReadyToLink = offer.status === "open_access" || offer.status === "approved";
                  
                  return (
                    <tr key={offer.id} className="hover:bg-slate-50 transition duration-100">
                      
                      {/* ID */}
                      <td className="px-4 py-3.5 text-center font-mono text-slate-500 font-bold select-all bg-slate-50">
                        {offer.id}
                      </td>

                      {/* Name & Vertical */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {offer.logo_url ? (
                            <img src={offer.logo_url} alt="" className="w-7 h-7 object-contain rounded flex-shrink-0" />
                          ) : (
                            <div className="w-7 h-7 rounded bg-slate-800 flex-shrink-0" />
                          )}
                          <div className="space-y-0.5">
                            <span
                              className="font-bold text-slate-100 cursor-pointer hover:text-cyan-400 transition"
                              onClick={() => setSelectedOfferId(offer.id)}
                            >
                              {offer.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono tracking-wider block font-semibold uppercase">
                              Vertical: {offer.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* GEO Coverage */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {offer.geos.slice(0, 3).map((g: string) => (
                            <span key={g} className="bg-slate-50 text-slate-600 px-1 py-0.2 rounded font-mono text-[9px] font-bold border border-slate-200">
                              {g}
                            </span>
                          ))}
                          {offer.geos.length > 3 && (
                            <span className="text-[10px] text-slate-500 font-mono pt-0.5">
                              +{offer.geos.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5 text-center font-mono text-slate-400 uppercase font-bold text-[10px]">
                        {offer.payoutType}
                      </td>

                      {/* Payout */}
                      <td className="px-4 py-3.5 font-mono text-slate-900 font-extrabold text-[13px]">
                        ${offer.payoutValue.toFixed(2)}
                      </td>

                      {/* Caps */}
                      <td className="px-4 py-3.5 text-slate-400 font-mono truncate max-w-[120px]" title={offer.caps}>
                        {offer.caps}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 font-mono">
                        {offer.status === "open_access" ? (
                          <span className="bg-slate-50 text-slate-800 text-[8px] font-bold py-0.5 px-2 rounded uppercase tracking-wider border border-slate-200">
                            Open Access
                          </span>
                        ) : offer.status === "approved" ? (
                          <span className="bg-emerald-50 text-emerald-800 text-[8px] font-bold py-0.5 px-2 rounded uppercase tracking-wider border border-emerald-300 flex items-center justify-center gap-0.5 w-fit">
                            <CheckCircle className="w-2.5 h-2.5 text-emerald-700" />
                            Approved
                          </span>
                        ) : offer.status === "pending_approval" ? (
                          <span className="bg-amber-50 text-amber-800 text-[8px] font-bold py-0.5 px-2 rounded uppercase tracking-wider border border-amber-300 animate-pulse">
                            Requested / Pending
                          </span>
                        ) : offer.status === "rejected" ? (
                          <span className="bg-rose-50 text-rose-800 text-[8px] font-bold py-0.5 px-2 rounded uppercase tracking-wider border border-rose-300">
                            Rejected
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-[8px] font-bold py-0.5 px-2 rounded uppercase tracking-wider border border-amber-300">
                            Requires Approval
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right font-mono">
                        <div className="flex items-center justify-end gap-1.5">
                          {isReadyToLink ? (
                            <button
                              onClick={() => setSelectedOfferId(offer.id)}
                              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer select-none"
                            >
                              Get Tracker Link
                            </button>
                          ) : offer.status === "requires_approval" ? (
                            <button
                              onClick={() => handleOpenRequestModal(offer.id)}
                              className="bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-950 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer select-none"
                            >
                              Request Access
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedOfferId(offer.id)}
                              className="bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-950 font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer"
                            >
                              Inspect Specs
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* REQUEST ACCESS MODAL — rendered in list view */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="request-access-modal">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">

            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-950 border border-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="bg-cyan-100 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-900 text-cyan-700 dark:text-cyan-400 text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">
                Audits Handshake Access Request
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Applying for ID #{targetRequestOfferId} Campaign Access
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Supply promotion methods to bypass manual hold parameters instantly.
              </p>
            </div>

            <form onSubmit={handleSubmitRequestAccess} className="space-y-4 text-xs">

              <div className="space-y-1 pb-1">
                <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">
                  1. How will you promote this offer? <span className="text-rose-500 font-bold">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={promotionalMethodInput}
                  onChange={(e) => setPromotionalMethodInput(e.target.value)}
                  placeholder="Describe direct marketing pathways (e.g., standard newsletters to 15k finance subs, Facebook lookalike campaigns)..."
                  className="block w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-850 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">
                  2. Traffic Source <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={primaryTrafficInput}
                  onChange={(e) => setPrimaryTrafficInput(e.target.value)}
                  placeholder="e.g. Email Lists, Native RevContent, SEO portals"
                  className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-855 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:border-cyan-500 text-xs"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal font-mono flex items-start gap-2">
                <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>By submitting, Campaign Access will transition to <strong>Pending Approval</strong> state immediately in compliance with affiliate standard reviews.</span>
              </div>

              {submitError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-2.5 rounded-xl text-[11px] font-mono">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-extrabold py-3 rounded-xl uppercase font-mono tracking-wider transition cursor-pointer"
              >
                {submitting ? "Submitting…" : "Submit Request"}
              </button>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
