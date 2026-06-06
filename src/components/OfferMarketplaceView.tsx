import React, { useState, useMemo } from "react";
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
  Info
} from "lucide-react";
import { SYSTEM_POSTBACK_PLACEHOLDERS } from "../data/publisherDemo";

interface OfferMarketplaceViewProps {
  onNavigate: (view: string) => void;
  selectedOfferId: string | null;
  setSelectedOfferId: (id: string | null) => void;
  offers: any[];
  setOffers: React.Dispatch<React.SetStateAction<any[]>>;
  onAddNotification: (
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
  onAddNotification
}: OfferMarketplaceViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "App Install" | "Crypto" | "Finance" | "E-commerce" | "Nutra">("All");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Link generation custom states inside the Offer Detail layout
  const [pubSub1, setPubSub1] = useState("");
  const [pubSub2, setPubSub2] = useState("");
  const [selectedLanderId, setSelectedLanderId] = useState("");

  // Postback states inside Offer Detail
  const [postbackUrlInput, setPostbackUrlInput] = useState("");
  const [pbTrigger, setPbTrigger] = useState("conversion");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Request Access Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [promotionalMethodInput, setPromotionalMethodInput] = useState("");
  const [primaryTrafficInput, setPrimaryTrafficInput] = useState("");
  const [estimatedDailyVolumeInput, setEstimatedDailyVolumeInput] = useState("");
  const [landingPageUrlInput, setLandingPageUrlInput] = useState("");
  const [additionalNotesInput, setAdditionalNotesInput] = useState("");
  const [targetRequestOfferId, setTargetRequestOfferId] = useState<string | null>(null);

  // Admin Panel states
  const [adminRejectionReason, setAdminRejectionReason] = useState("");
  const [showAdminRejectionForm, setShowAdminRejectionForm] = useState(false);
  const [adminMoreInfoMessage, setAdminMoreInfoMessage] = useState("");
  const [showAdminMoreInfoForm, setShowAdminMoreInfoForm] = useState(false);
  const [adminDialogLogs, setAdminDialogLogs] = useState<{ id: string; sender: string; text: string; time: string }[]>([]);

  // Find targeted offer if any
  const currentOffer = useMemo(() => {
    if (!selectedOfferId) return null;
    return offers.find(o => o.id === selectedOfferId) || null;
  }, [selectedOfferId, offers]);

  // Set default lander when changing currently inspected offer
  useMemo(() => {
    if (currentOffer && currentOffer.landers && currentOffer.landers.length > 0) {
      setSelectedLanderId(currentOffer.landers[0].id);
      setPostbackUrlInput(`https://callback.my-tracker-system.com/receive?click_id={click_id}&payout={payout}&sub1={sub1}`);
    } else {
      setSelectedLanderId("");
    }
  }, [currentOffer]);

  // Filters calculation
  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      const matchesSearch = offer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            offer.id.includes(searchQuery) || 
                            offer.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "All" || offer.category === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab, offers]);

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Helper compiled tracking link
  const generatedTrackingUrl = useMemo(() => {
    if (!currentOffer) return "";
    let url = `https://track.apextrack.com/click?aff_id=2081&offer_id=${currentOffer.id}`;
    if (selectedLanderId) url += `&lander_id=${selectedLanderId}`;
    if (pubSub1) url += `&sub1=${encodeURIComponent(pubSub1)}`;
    if (pubSub2) url += `&sub2=${encodeURIComponent(pubSub2)}`;
    return url;
  }, [currentOffer, selectedLanderId, pubSub1, pubSub2]);

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
    setEstimatedDailyVolumeInput("");
    setLandingPageUrlInput("");
    setAdditionalNotesInput("");
    setShowRequestModal(true);
  };

  // Submit request access handler
  const handleSubmitRequestAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRequestOfferId) return;

    // Transition offer status to pending_approval in state
    setOffers(prevOffers => prevOffers.map(o => {
      if (o.id === targetRequestOfferId) {
        return { ...o, status: "pending_approval" };
      }
      return o;
    }));

    // Raise notification
    onAddNotification(
      "announcement",
      "Offer Access Requested",
      `Your traffic request for Campaign #${targetRequestOfferId} is now pending network representative security audit.`,
      targetRequestOfferId
    );

    setShowRequestModal(false);
    setTargetRequestOfferId(null);
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
            className="bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition select-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace list
          </button>
        </div>

        {/* 🛑 ACTIVE WORKFLOW ALERTS AND BANNERS */}
        {isPending && (
          <div className="bg-amber-950/60 text-amber-300 border border-amber-900 p-5 rounded-2xl flex items-start gap-3.5 shadow-md animate-pulse">
            <Clock className="w-5 h-5 mt-0.5 text-amber-400 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold uppercase tracking-wider font-mono">APPLICATION REVIEW PENDING</h4>
              <p className="text-xs text-slate-300 leading-normal">
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
                <div className="bg-slate-950 p-2.5 rounded border border-rose-900/30 text-[10px] text-rose-400 font-mono mt-1.5">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md relative">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-cyan-950 text-cyan-400 text-[9px] font-bold font-mono px-2 py-0.5 rounded border border-cyan-900 uppercase">
                {currentOffer.category}
              </span>
              <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase border ${
                currentOffer.status === "open_access" 
                  ? "bg-slate-950 text-emerald-400 border-slate-800" 
                  : currentOffer.status === "approved"
                  ? "bg-emerald-950 text-emerald-300 border-emerald-900"
                  : currentOffer.status === "pending_approval"
                  ? "bg-amber-950 text-amber-300 border-amber-900"
                  : currentOffer.status === "rejected"
                  ? "bg-rose-950 text-rose-400 border-rose-900"
                  : "bg-amber-950 text-amber-400 border-amber-900"
              }`}>
                {currentOffer.status === "requires_approval" ? "Approval Required" : currentOffer.status.replace("_", " ")}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              {currentOffer.name}
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              {currentOffer.description}
            </p>
          </div>

          {/* Right quick stats summary */}
          <div className="lg:col-span-4 bg-slate-950/80 p-4 rounded-xl border border-slate-850 flex flex-col justify-between space-y-4">
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
            
            {/* GEOGRAPHIC GEO TARGET CHIPS */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <strong className="text-white text-xs uppercase font-mono tracking-wider block">
                Allowed Geo Targets ({currentOffer.geos.length})
              </strong>
              <div className="flex flex-wrap gap-1.5">
                {currentOffer.geos.map((geo: string) => (
                  <span key={geo} className="bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg text-xs font-bold font-mono tracking-wide flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    {geo}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 font-mono leading-normal">
                Clicks originating from unsupported geographic positions will route dynamically to a fallback catalogue.
              </p>
            </div>

            {/* TRAFFIC RESTRICTIONS RULE CARD */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <strong className="text-white text-xs uppercase font-mono tracking-wider block flex items-center gap-1.5 text-rose-450">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Traffic Limitations (STRICT POLICY)
              </strong>
              
              <ul className="space-y-1.5">
                {currentOffer.trafficRestrictions.map((restrict: string, rIdx: number) => (
                  <li key={rIdx} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-rose-500 font-bold block mt-0.5">•</span>
                    <span>{restrict}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* DIRECT LANDERS & PREVIEWS - HIDE IF CAMPAIGN ACCESSIBLE SECTIONS REQUIRE IT */}
            {isAccessible ? (
              // Show Approved Landing Pages section ONLY if admin added landing pages to the offer
              currentOffer.landers && currentOffer.landers.length > 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 animate-fadeIn">
                  <strong className="text-white text-xs uppercase font-mono tracking-wider block text-emerald-400">
                    ✓ Approved Landing Pages ({currentOffer.landers.length})
                  </strong>

                  <div className="space-y-2">
                    {currentOffer.landers.map((lander: any) => (
                      <div key={lander.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between text-xs gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <strong className="text-slate-200 block truncate font-sans">{lander.name}</strong>
                          <code className="text-[10px] text-slate-500 block truncate font-mono">{lander.url}</code>
                        </div>
                        <a
                          href={lander.url}
                          target="_blank"
                          rel="noreferrer referrer"
                          className="bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-800 transition text-[10px] select-none flex items-center gap-1 shrink-0"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Preview
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null // If no landing pages exist: Hide the section completely
            ) : (
              // Hides landing pages on requires approval / pending / rejected states
              null
            )}

            {/* CREATIVE AD BANNER CHIPS - HIDE IF CAMPAIGN ACCESSIBLE SECTIONS REQUIRE IT */}
            {isAccessible ? (
              // Show Available Media Assets & Banner Sizes ONLY if media assets exist
              currentOffer.creatives && currentOffer.creatives.length > 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 animate-fadeIn">
                  <strong className="text-white text-xs uppercase font-mono tracking-wider block text-emerald-400">
                    ✓ Available Media Assets & Banner Sizes ({currentOffer.creatives.length})
                  </strong>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentOffer.creatives.map((creative: any) => (
                      <div key={creative.id} className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center justify-between text-xs gap-2">
                        <div className="space-y-0.5">
                          <strong className="text-slate-200 block text-xs">{creative.name}</strong>
                          <span className="text-[10px] text-slate-500 font-mono uppercase">Size: {creative.size} / {creative.type}</span>
                        </div>
                        <button
                          onClick={() => handleCopy(`<a href="${generatedTrackingUrl}"><img src="https://media-server.apextrack.com/ad/${creative.id}" width="${creative.size.split('x')[0]}" height="${creative.size.split('x')[1]}"/></a>`, `creative_${creative.id}`)}
                          className="bg-slate-900 hover:bg-slate-850 text-cyan-400 text-[10px] font-mono px-2 py-1 rounded border border-slate-800 shrink-0"
                        >
                          {copiedKey === `creative_${creative.id}` ? "Copied HTML!" : "Get Tag"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null // If no assets exist: Hide the section completely
            ) : (
              // Hides creative download URLs on restricted states
              null
            )}

            {/* DISCUSSION CHAT STREAM WITH MANAGER FOR PENDING & ACTIVE */}
            {!isRequiresApproval && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3.5">
                <strong className="text-white text-xs uppercase font-mono tracking-wider block flex items-center gap-1 text-cyan-400">
                  <Info className="w-4 h-4 text-cyan-400" />
                  Traffic Audit Message Dialogue
                </strong>

                {adminDialogLogs.length === 0 ? (
                  <p className="text-[10px] text-slate-500 font-mono">No communication logs recorded for this campaign application.</p>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {adminDialogLogs.map(log => (
                      <div key={log.id} className={`p-2.5 rounded-lg text-xs ${log.sender.includes("Sophia") ? "bg-cyan-950/20 border border-cyan-900/40" : "bg-slate-950 border border-slate-850"}`}>
                        <div className="flex justify-between items-center text-[9px] font-mono font-bold uppercase tracking-wider mb-1">
                          <span className={log.sender.includes("Sophia") ? "text-cyan-400" : "text-slate-400"}>{log.sender}</span>
                          <span className="text-slate-600">{log.time}</span>
                        </div>
                        <p className="text-slate-300 text-xs font-mono">{log.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="Submit message response to AM Sophia..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handlePublisherReplyMoreInfo((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-white placeholder-slate-700"
                  />
                  <span className="text-[9px] text-slate-500 pt-1 font-mono">Press Enter to dispatch chat message.</span>
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
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 animate-fadeIn" id="tracking-link-generator-box">
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
                    
                    {currentOffer.landers && currentOffer.landers.length > 0 && (
                      <div>
                        <label className="block text-[10px] uppercase font-semibold text-slate-400">
                          Select Target Lander
                        </label>
                        <select
                          value={selectedLanderId}
                          onChange={(e) => setSelectedLanderId(e.target.value)}
                          className="mt-1 block w-full px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-cyan-500"
                        >
                          {currentOffer.landers.map((lan: any) => (
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

                    {/* Generated code results block */}
                    <div className="space-y-1 pt-1">
                      <span className="block text-[10px] uppercase font-bold text-slate-400">
                        Ready Generated Tracking URL
                      </span>
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-2">
                        <p className="text-[11px] font-mono text-cyan-300 break-all select-all leading-normal">
                          {generatedTrackingUrl}
                        </p>
                        <button
                          onClick={() => handleCopy(generatedTrackingUrl, "aff_tracking_link")}
                          className="w-full bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white py-1.5 rounded-lg border border-slate-800 text-[10px] font-bold uppercase tracking-wider transition flex items-center justify-center gap-1 select-none cursor-pointer"
                        >
                          {copiedKey === "aff_tracking_link" ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              Copied Link Asset
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy Tracking URL
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>

                {/* SCREEN 10: DYNAMIC INSIDE POSTBACK SETUP */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 animate-fadeIn">
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
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center space-y-4">
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
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 font-sans">
              <strong className="text-white text-xs uppercase font-mono tracking-wider block">
                Technical Spec Sheet
              </strong>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between border-b border-slate-850 pb-1.5">
                  <span className="text-slate-505">Device compatibility:</span>
                  <span className="text-slate-205 font-mono font-bold text-slate-200">{currentOffer.devices}</span>
                </div>
                <div className="flex justify-between border-b border-slate-850 pb-1.5">
                  <span className="text-slate-505">Tracking Protocol:</span>
                  <span className="text-slate-205 font-mono text-cyan-400">Affise Redirect v3 S2S</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-505">Publisher Commission:</span>
                  <span className="text-emerald-400 font-bold font-mono">100% Guaranteed</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* 🛡️ REQUEST ACCESS POPUP MODAL (EVERFLOW / TRACKIER-STYLE) */}
        {showRequestModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="request-access-modal">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative space-y-4">
              
              <button
                onClick={() => setShowRequestModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-950 dark:hover:text-white p-1.5 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition"
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

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-505 dark:text-slate-400 font-mono">
                    3. Estimated Daily Volume <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={estimatedDailyVolumeInput}
                    onChange={(e) => setEstimatedDailyVolumeInput(e.target.value)}
                    placeholder="e.g. 500+ clicks/day, 50 conversions/day"
                    className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-855 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-505 dark:text-slate-400 font-mono">
                    4. Landing Page URL <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="url"
                    value={landingPageUrlInput}
                    onChange={(e) => setLandingPageUrlInput(e.target.value)}
                    placeholder="https://yourbrand.com/prelander"
                    className="block w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-855 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:border-cyan-505 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase font-bold text-slate-505 dark:text-slate-400 font-mono">
                    5. Additional Notes <span className="text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={additionalNotesInput}
                    onChange={(e) => setAdditionalNotesInput(e.target.value)}
                    placeholder="Any comments, requests for custom tracker nodes etc."
                    className="block w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-slate-855 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:border-cyan-500 text-xs"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-850 text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal font-mono flex items-start gap-2">
                  <Info className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span>By submitting, Campaign Access will transition to <strong>Pending Approval</strong> state immediately in compliance with affiliate standard reviews.</span>
                </div>

                <button
                  type="submit"
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold py-3 rounded-xl uppercase font-mono tracking-wider transition cursor-pointer"
                >
                  Submit Request
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
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
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
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          {(["All", "App Install", "Crypto", "Finance", "E-commerce", "Nutra"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                activeTab === tab 
                  ? "bg-slate-950 text-cyan-400 font-bold border border-cyan-900/50"
                  : "text-slate-400 hover:bg-slate-950/40 hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Text Search Input */}
        <div className="relative min-w-[240px] w-full md:w-auto">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search campaign names..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

      </div>

      {/* RESULTS LIST TABLE (Everflow / Trackier classic high-density design) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        
        {filteredOffers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 space-y-2 bg-slate-950/60">
            <HelpCircle className="w-8 h-8 text-slate-700 mx-auto" />
            <p className="text-sm font-mono">No matching campaign catalog records found.</p>
            <p className="text-xs">Adjust search terms or reset category vertical filters above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800 text-left">
              
              <thead className="bg-slate-950 text-[10px] tracking-wider text-slate-400 font-mono uppercase">
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

              <tbody className="divide-y divide-slate-800 text-xs text-slate-300 leading-normal">
                {filteredOffers.map((offer) => {
                  const isReadyToLink = offer.status === "open_access" || offer.status === "approved";
                  
                  return (
                    <tr key={offer.id} className="hover:bg-slate-950/30 transition duration-100">
                      
                      {/* ID */}
                      <td className="px-4 py-3.5 text-center font-mono text-slate-500 font-bold select-all bg-slate-950/20">
                        {offer.id}
                      </td>

                      {/* Name & Vertical */}
                      <td className="px-4 py-3.5">
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
                      </td>

                      {/* GEO Coverage */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {offer.geos.slice(0, 3).map((g: string) => (
                            <span key={g} className="bg-slate-950 text-slate-400 px-1 py-0.2 rounded font-mono text-[9px] font-bold border border-slate-850">
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
                      <td className="px-4 py-3.5 font-mono text-cyan-300 font-extrabold text-[13px]">
                        ${offer.payoutValue.toFixed(2)}
                      </td>

                      {/* Caps */}
                      <td className="px-4 py-3.5 text-slate-400 font-mono truncate max-w-[120px]" title={offer.caps}>
                        {offer.caps}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 font-mono">
                        {offer.status === "open_access" ? (
                          <span className="bg-slate-950 text-slate-400 text-[8px] font-bold py-0.5 px-2 rounded uppercase tracking-wider border border-slate-850">
                            Open Access
                          </span>
                        ) : offer.status === "approved" ? (
                          <span className="bg-emerald-950/60 text-emerald-400 text-[8px] font-bold py-0.5 px-2 rounded uppercase tracking-wider border border-emerald-900/50 flex items-center justify-center gap-0.5 w-fit">
                            <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                            Approved
                          </span>
                        ) : offer.status === "pending_approval" ? (
                          <span className="bg-amber-950 text-amber-300 text-[8px] font-bold py-0.5 px-2 rounded uppercase tracking-wider border border-amber-900/50 animate-pulse">
                            Pending Approval
                          </span>
                        ) : offer.status === "rejected" ? (
                          <span className="bg-rose-955 text-rose-300 text-[8px] font-bold py-0.5 px-2 rounded uppercase tracking-wider border border-rose-900/50">
                            Rejected
                          </span>
                        ) : (
                          <span className="bg-amber-950/60 text-amber-400 text-[8px] font-bold py-0.5 px-2 rounded uppercase tracking-wider border border-amber-900/50">
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
                              className="bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-300 hover:text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer select-none"
                            >
                              Request Access
                            </button>
                          ) : (
                            <button
                              onClick={() => setSelectedOfferId(offer.id)}
                              className="bg-slate-950 border border-slate-800 hover:border-slate-705 text-slate-400 hover:text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer"
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

    </div>
  );
}
