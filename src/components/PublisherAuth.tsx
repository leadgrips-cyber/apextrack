import React, { useState } from "react";
import * as authApi from "../services/auth";
import { useBranding } from "../contexts/BrandingContext";
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Globe, 
  AlertCircle, 
  RefreshCw, 
  Layers, 
  ShieldAlert, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  Building,
  MapPin,
  Send,
  HelpCircle,
  FileText
} from "lucide-react";

interface PublisherAuthProps {
  currentView: "login" | "register" | "forgot" | "verify";
  setView: (view: "login" | "register" | "forgot" | "verify" | "app") => void;
  onLoginSuccess: (email: string) => void;
}

export function PublisherAuth({ currentView, setView, onLoginSuccess }: PublisherAuthProps) {
  const branding = useBranding();

  // Login form states
  const [loginEmail, setLoginEmail] = useState("demo@apextrack.net");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [rememberMe, setRememberMe] = useState(true);

  // Step tracker for redesigned Affiliate Application registration
  const [registerStep, setRegisterStep] = useState(1);

  // STEP 1 — Account Information
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // STEP 2 — Address Information
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");

  // STEP 3 — Traffic Information (Free Text Fields / No vertical dropdown!)
  const [affiliateDuration, setAffiliateDuration] = useState("");
  const [monthlyTrafficVolume, setMonthlyTrafficVolume] = useState("");
  const [currentNetworks, setCurrentNetworks] = useState("");
  const [trafficSources, setTrafficSources] = useState("");
  const [promotionMethods, setPromotionMethods] = useState("");
  const [mainNiches, setMainNiches] = useState(""); // Free text vertical niche field!
  const [websiteUrls, setWebsiteUrls] = useState("");

  // STEP 4 — Contact Information
  const [telegramUsername, setTelegramUsername] = useState("");
  const [teamsId, setTeamsId] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // STEP 5 — Terms & Conditions Verification
  const [antiFraudChecked, setAntiFraudChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState(false);

  // General workflow control states
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");

  // Handle standard Login Submission
const handleLoginSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setErrorMessage("");
  setSuccessMessage("");
  setIsLoading(true);

  try {
    await authApi.login(loginEmail, loginPassword);

    onLoginSuccess(loginEmail);
    setView("app");
  } catch (error: any) {
    setErrorMessage(error.message || "Login failed");
  } finally {
    setIsLoading(false);
  }
};

  // Move forward in registration steps
  const nextRegisterStep = () => {
    setErrorMessage("");
    
    if (registerStep === 1) {
      if (!firstName || !lastName || !registerEmail || !registerPassword || !confirmPassword) {
        setErrorMessage("Please complete all account information fields to proceed.");
        return;
      }
      if (!registerEmail.includes("@")) {
        setErrorMessage("Please provide a valid account email address.");
        return;
      }
      if (registerPassword !== confirmPassword) {
        setErrorMessage("Passwords do not match. Please verify spelling.");
        return;
      }
      if (registerPassword.length < 6) {
        setErrorMessage("Password must be at least 6 characters for regulatory security.");
        return;
      }
    }

    if (registerStep === 2) {
      if (!companyName || !address || !city || !stateName || !postalCode || !country) {
        setErrorMessage("Please fill all corporate and address details.");
        return;
      }
    }

    if (registerStep === 3) {
      if (!affiliateDuration || !monthlyTrafficVolume || !trafficSources || !promotionMethods || !mainNiches || !websiteUrls) {
        setErrorMessage("All traffic and promotion fields are required to verify affiliate quality.");
        return;
      }
    }

    if (registerStep === 4) {
      if (!telegramUsername || !teamsId) {
        setErrorMessage("Telegram username and Microsoft Teams ID are required for account manager review.");
        return;
      }
    }

    setRegisterStep(prev => prev + 1);
  };

  const prevRegisterStep = () => {
    setErrorMessage("");
    setRegisterStep(prev => Math.max(1, prev - 1));
  };

  // Handle registration final submit
 const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!antiFraudChecked || !termsChecked) {
      setErrorMessage("You must accept both the Anti Fraud Agreement and the Publisher Terms of Service.");
      return;
    }

    if (captchaAnswer.trim() !== "12") {
      setCaptchaError(true);
      setErrorMessage("Incorrect CAPTCHA response. Please solve the calculation to proceed.");
      return;
    }

   setCaptchaError(false);
setIsLoading(true);

try {
  await authApi.register(
    registerEmail,
    registerPassword,
    `${firstName} ${lastName}`,
    registerEmail.split("@")[0],
    companyName
  );

  setSuccessMessage("Registration successful!");
  setView("login");
} catch (error: any) {
  setErrorMessage(error.message || "Registration failed");
} finally {
  setIsLoading(false);
}
};
  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage("Credentials OTP key has been dispatched. Enter verification token. Code: APEX-9851");
      setView("verify");
    }, 800);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    setTimeout(() => {
      setIsLoading(false);
      if (verifyCode.trim().toUpperCase() !== "APEX-9851" && verifyCode.trim() !== "9851") {
        setErrorMessage("Incorrect OTP verification block. Use APEX-9851 to bypass.");
        return;
      }
      onLoginSuccess(registerEmail || loginEmail);
      setView("app");
    }, 700);
  };

  return (
    <div
      className="min-h-screen theme-bg-page flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-150"
      id="auth-root"
      style={branding.loginBgUrl ? {
        backgroundImage: `url(${branding.loginBgUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      } : undefined}
    >
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2 select-none">
          <div className="bg-cyan-500 text-slate-950 p-2.5 rounded-xl font-black shadow-lg shadow-cyan-500/20">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.networkName} className="w-6 h-6 object-contain" />
            ) : (
              <Layers className="w-6 h-6 animate-pulse" />
            )}
          </div>
          <span className="text-xl font-black theme-text-main font-mono tracking-tight uppercase">
            {branding.networkName}
          </span>
        </div>
        
        <h2 className="text-3xl font-black theme-text-main tracking-tight">
          {currentView === "login" && "Affiliate Portal Sign In"}
          {currentView === "register" && "Affiliate Application"}
          {currentView === "forgot" && "Recover Security Access Token"}
          {currentView === "verify" && "Assert Identity Security Key"}
        </h2>
        
        <p className="mt-2 text-xs theme-text-muted font-mono uppercase tracking-wider">
          {currentView === "login" && "Direct Real-time High Volume S2S Commission Ledger"}
          {currentView === "register" && `Step ${registerStep} of 5 — Active Publisher Evaluation`}
          {currentView === "forgot" && "Re-verify digital credentials node"}
          {currentView === "verify" && "Two-factor active HSM validation token required"}
        </p>
      </div>

      {/* Main Authentication Box */}
      <div className="sm:mx-auto sm:w-full sm:max-w-xl animate-fadeIn" id="auth-panel-wrapper">
        <div className="theme-bg-card py-8 px-6 sm:px-8 shadow-xl rounded-2xl border theme-border">
          
          {/* Messages Alerts feedback */}
          {errorMessage && (
            <div className="mb-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-250 dark:border-rose-900 rounded-xl p-3 flex gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-250 dark:border-emerald-900 rounded-xl p-3 flex gap-2 text-xs text-emerald-800 dark:text-emerald-400">
              <ShieldCheck className="w-4.5 h-4.5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SCREEN 1: CLEAN LOGIN VIEW */}
          {currentView === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold theme-text-muted uppercase tracking-wider font-mono">
                  Business Email Address
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main text-xs focus:border-cyan-500 focus:outline-none transition shadow-xs"
                    placeholder="e.g. payout@media-agency.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold theme-text-muted uppercase tracking-wider font-mono">
                  Security Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main text-xs focus:border-cyan-500 focus:outline-none transition font-mono shadow-xs"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 select-none">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded theme-border text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="ml-2 text-xs theme-text-secondary">
                    Remember Me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => { setErrorMessage(""); setSuccessMessage(""); setView("forgot"); }}
                  className="text-xs text-cyan-500 dark:text-cyan-400 hover:underline font-mono focus:outline-none cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors duration-150 shadow-md shadow-cyan-500/10 cursor-pointer flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting Secure Ledger...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          )}

          {/* SCREEN 2: MULTI-STEP REGISTRATION VIEW */}
          {currentView === "register" && (
            <div className="space-y-6">
              
              {/* Stepper Progress indicators */}
              <div className="flex items-center justify-between font-mono text-[9px] font-bold select-none border theme-border rounded-2xl bg-slate-50 dark:theme-bg-well p-3.5">
                {[
                  { step: 1, label: "Account" },
                  { step: 2, label: "Address" },
                  { step: 3, label: "Traffic" },
                  { step: 4, label: "Contact" },
                  { step: 5, label: "Terms" }
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-1">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border font-mono ${
                      registerStep === item.step 
                        ? "bg-cyan-550 border-cyan-550 text-white font-bold" 
                        : registerStep > item.step 
                        ? "bg-emerald-550 border-emerald-550 text-white"
                        : "theme-bg-page theme-border theme-text-secondary"
                    }`}>
                      {registerStep > item.step ? <Check className="w-3 h-3" /> : item.step}
                    </span>
                    <span className={registerStep === item.step ? "text-cyan-600 dark:text-cyan-400 font-bold" : "theme-text-muted"}>
                      {item.label}
                    </span>
                    {item.step < 5 && <span className="theme-text-muted mx-1">/</span>}
                  </div>
                ))}
              </div>

              {/* STEP FORM INJECTS */}
              <div className="space-y-4">
                
                {/* STEP 1: Account Information */}
                {registerStep === 1 && (
                  <div className="space-y-4 animate-fadeIn text-xs font-sans">
                    <h3 className="text-sm font-bold theme-text-main font-mono border-b theme-border pb-1.5 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-cyan-500" /> STEP 1 — Account Credentials
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">First Name</label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-cyan-500 focus:outline-none"
                          placeholder="John"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">Last Name</label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-cyan-500 focus:outline-none"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">Active email address</label>
                      <input
                        type="email"
                        required
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-cyan-500 focus:outline-none font-mono"
                        placeholder="john.doe@conversionagency.com"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">Password</label>
                        <input
                          type="password"
                          required
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-cyan-500 focus:outline-none font-mono"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">Confirm Password</label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-cyan-500 focus:outline-none font-mono"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Address Information */}
                {registerStep === 2 && (
                  <div className="space-y-4 animate-fadeIn text-xs font-sans">
                    <h3 className="text-sm font-bold theme-text-main font-mono border-b theme-border pb-1.5 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-cyan-500" /> STEP 2 — Corporate & Geographic Address
                    </h3>

                    <div>
                      <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">Company / Agency legal name</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-cyan-500 focus:outline-none"
                        placeholder="John Doe Media INC"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">Street Address Line</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-cyan-500 focus:outline-none"
                        placeholder="120 Performance Way, Suite 400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">City</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-cyan-500 focus:outline-none"
                          placeholder="Wilmington"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">State / Province</label>
                        <input
                          type="text"
                          required
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-cyan-500 focus:outline-none"
                          placeholder="Delaware"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">Postal Code</label>
                        <input
                          type="text"
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-cyan-500 focus:outline-none font-mono"
                          placeholder="19801"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">Country</label>
                        <input
                          type="text"
                          required
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main focus:border-cyan-500 focus:outline-none"
                          placeholder="United States"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Traffic Information */}
                {registerStep === 3 && (
                  <div className="space-y-4 animate-fadeIn text-xs font-sans">
                    <h3 className="text-sm font-bold theme-text-main font-mono border-b theme-border pb-1.5 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-cyan-500" /> STEP 3 — Digital Traffic & Campaign Methods
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono leading-tight">
                          Affiliate Experience?
                        </label>
                        <input
                          type="text"
                          required
                          value={affiliateDuration}
                          onChange={(e) => setAffiliateDuration(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 bg-slate-50 border theme-border rounded-xl theme-text-main"
                          placeholder="e.g. 4 Years"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono leading-tight">
                          Monthly traffic volume?
                        </label>
                        <input
                          type="text"
                          required
                          value={monthlyTrafficVolume}
                          onChange={(e) => setMonthlyTrafficVolume(e.target.value)}
                          className="mt-1 block w-full px-3 py-2 bg-slate-50 border theme-border rounded-xl theme-text-main"
                          placeholder="e.g. 150,000 Click Hits"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">Current affiliate networks</label>
                      <input
                        type="text"
                        required
                        value={currentNetworks}
                        onChange={(e) => setCurrentNetworks(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main"
                        placeholder="e.g. OGAds, ClickDealer, MaxBounty"
                      />
                    </div>

                    {/* niches vertical free text field! NO DROPDOWN */}
                    <div>
                      <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">
                        Main niches / Verticals <span className="text-red-500 font-bold font-sans">(TYPE FREELY — NO DROPDOWNS)</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={mainNiches}
                        onChange={(e) => setMainNiches(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 theme-bg-well border border-cyan-500/40 rounded-xl theme-text-main font-semibold"
                        placeholder="e.g. Finance leads, mobile helper apps utility overlays, locked content"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">Describe Your Traffic Sources</label>
                      <textarea
                        required
                        rows={2}
                        value={trafficSources}
                        onChange={(e) => setTrafficSources(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 theme-bg-well border theme-border rounded-xl theme-text-main text-xs"
                        placeholder="Explain how users find your links (e.g. organic TikTok content, native RevContent banners)..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">Describe your promotion methods</label>
                      <textarea
                        required
                        rows={2}
                        value={promotionMethods}
                        onChange={(e) => setPromotionMethods(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 theme-bg-well border theme-border rounded-xl theme-text-main text-xs"
                        placeholder="Explain conversion techniques (e.g. standard reward locker page, direct pre-landers, email lists)..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">Primary Traffic Website URLs</label>
                      <textarea
                        required
                        rows={1}
                        value={websiteUrls}
                        onChange={(e) => setWebsiteUrls(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 theme-bg-well border theme-border rounded-xl theme-text-main text-xs font-mono"
                        placeholder="e.g. https://www.techportalmedia.com, https://myprotrafficsite.org"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4: Contact Information */}
                {registerStep === 4 && (
                  <div className="space-y-4 animate-fadeIn text-xs font-sans">
                    <h3 className="text-sm font-bold theme-text-main font-mono border-b theme-border pb-1.5 flex items-center gap-1.5">
                      <Send className="w-4 h-4 text-cyan-500" /> STEP 4 — Secure Instant Messaging Addresses
                    </h3>

                    <p className="text-[10px] theme-text-muted leading-relaxed">
                      We require real-time contact IDs to match your account proposal with one of our specialized affiliate network managers.
                    </p>

                    <div>
                      <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">Telegram Username</label>
                      <input
                        type="text"
                        required
                        value={telegramUsername}
                        onChange={(e) => setTelegramUsername(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 theme-bg-well border border-cyan-500/30 rounded-xl theme-text-main font-mono"
                        placeholder="e.g. @johndoe_traffic"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">Microsoft Teams ID</label>
                      <input
                        type="text"
                        required
                        value={teamsId}
                        onChange={(e) => setTeamsId(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 theme-bg-well border border-cyan-500/30 rounded-xl theme-text-main font-mono"
                        placeholder="e.g. live:johndoe_media"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold theme-text-secondary uppercase font-mono">WhatsApp Address (Optional)</label>
                      <input
                        type="tel"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main font-mono"
                        placeholder="e.g. +1-555-019-2182"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 5: Terms & Conditions & Anti Fraud & Submit */}
                {registerStep === 5 && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fadeIn text-xs font-sans">
                    <h3 className="text-sm font-bold theme-text-main font-mono border-b theme-border pb-1.5 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-cyan-500" /> STEP 5 — Regulatory Agreements & CAPTCHA Verify
                    </h3>

                    <div className="space-y-3">
                      
                      {/* Anti Fraud agreement block */}
                      <div className="theme-bg-well p-3.5 rounded-xl border border-rose-350 dark:border-rose-950/60 flex items-start gap-2.5">
                        <input
                          id="antifraud"
                          type="checkbox"
                          checked={antiFraudChecked}
                          onChange={(e) => setAntiFraudChecked(e.target.checked)}
                          className="mt-0.5 h-4.5 w-4.5 rounded text-cyan-500 cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <label htmlFor="antifraud" className="font-bold text-rose-700 dark:text-rose-400 block cursor-pointer select-none">
                            Strict Anti-Fraud Agreement
                          </label>
                          <p className="text-[10px] theme-text-secondary leading-normal">
                            I affirm that I will never purchase fake leads, inject cookie stuffing script overlays, simulate automated click bots, hijack IP proxies or cloakers, or participate in illegal conversion systems. I accept that suspicion of fraud triggers immediate lifetime account suspension and forfeiture of all balances.
                          </p>
                        </div>
                      </div>

                      {/* General publisher terms */}
                      <div className="theme-bg-well p-3.5 rounded-xl border theme-border flex items-start gap-2.5">
                        <input
                          id="generalterms"
                          type="checkbox"
                          checked={termsChecked}
                          onChange={(e) => setTermsChecked(e.target.checked)}
                          className="mt-0.5 h-4.5 w-4.5 rounded text-cyan-500 cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <label htmlFor="generalterms" className="font-bold theme-text-main block cursor-pointer select-none">
                            Publisher Terms of Service (TOS)
                          </label>
                          <p className="text-[10px] theme-text-secondary leading-normal">
                            I agree to the publisher terms, payouts timing conditions (NET-15 standard holds), mandatory S2S reconciliations parameters, and tax identity documentation requests.
                          </p>
                        </div>
                      </div>

                      {/* Simulated Interactive Captcha verify challenge block */}
                      <div className="bg-cyan-50/50 dark:bg-cyan-950/20 p-4 border border-cyan-200 dark:border-cyan-900 rounded-xl space-y-2 text-center">
                        <span className="font-bold text-cyan-700 dark:text-cyan-400 font-mono block text-[10px] uppercase">
                          🛡️ Secure Anti-Bot Gate Check
                        </span>
                        
                        <div className="flex items-center justify-center gap-1.5 py-1 text-sm font-black font-mono">
                          <span className="text-slate-700 dark:text-slate-350 bg-slate-150 dark:theme-bg-well px-2 py-1 rounded">5</span>
                          <span>+</span>
                          <span className="text-slate-700 dark:text-slate-350 bg-slate-150 dark:theme-bg-well px-2 py-1 rounded">7</span>
                          <span>=</span>
                          <input
                            type="text"
                            maxLength={3}
                            value={captchaAnswer}
                            onChange={(e) => setCaptchaAnswer(e.target.value)}
                            className={`w-12 text-center px-1 py-1 rounded font-mono font-bold text-slate-900 dark:text-white border ${
                              captchaError 
                                ? "border-rose-500 bg-rose-50 dark:bg-rose-950" 
                                : "border-cyan-500/50 bg-white dark:bg-slate-950"
                            }`}
                            placeholder="?"
                          />
                        </div>
                        <p className="text-[9px] theme-text-muted font-mono">
                          Perform calculation dynamically to prove human authority.
                        </p>
                      </div>

                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-black py-3 rounded-xl uppercase font-mono tracking-wider text-xs select-none cursor-pointer text-center block"
                    >
                      {isLoading ? "Verifying Token Handshake..." : "Submit Affiliate Proposal Application"}
                    </button>

                  </form>
                )}

              </div>

              {/* Steps control nav handles */}
              <div className="flex justify-between items-center pt-2 select-none">
                {registerStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevRegisterStep}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold rounded-xl theme-text-main transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Prev Step
                  </button>
                ) : (
                  <div></div>
                )}

                {registerStep < 5 && (
                  <button
                    type="button"
                    onClick={nextRegisterStep}
                    className="flex items-center gap-1.5 px-5 py-2 bg-cyan-550 hover:bg-cyan-500 text-white xs font-semibold rounded-xl transition cursor-pointer font-mono uppercase text-[10px]"
                  >
                    Next Step <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

            </div>
          )}

          {/* SCREEN 3: FORGOT PASSWORD VIEW */}
          {currentView === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold theme-text-muted uppercase tracking-wider font-mono">
                  Registered Account Email
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main text-xs focus:border-cyan-500 focus:outline-none transition shadow-xs font-mono"
                    placeholder="e.g. register@partner.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors duration-150 shadow-md cursor-pointer"
              >
                {isLoading ? "Asserting AES HSM Token..." : "Initiate OTP Recovery Checkpoint"}
              </button>
            </form>
          )}

          {/* SCREEN 4: EMAIL VERIFICATION OTP VIEW */}
          {currentView === "verify" && (
            <form onSubmit={handleVerifySubmit} className="space-y-4 font-sans text-xs">
              <div className="theme-bg-well p-4 rounded-xl border theme-border space-y-3">
                <span className="text-[11px] theme-text-secondary block leading-normal">
                  Security Gateway Checklist: Enter verification OTP token <strong className="text-cyan-600 dark:text-cyan-400 font-mono">APEX-9851</strong> dispatched to registered session to authorize secure ledger access:
                </span>
                
                <div>
                  <label className="block text-[10px] uppercase font-black text-center theme-text-muted font-mono tracking-wider">
                    Dynamic OTP Bypass Key
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="APEX-9851"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                    className="mt-1 text-center font-mono tracking-widest text-lg font-bold block w-full py-2.5 theme-bg-page border border-cyan-500 rounded-xl text-cyan-500 dark:text-cyan-400 focus:outline-none focus:border-cyan-500 text-sm"
                  />
                </div>

                <div className="text-[9px] theme-text-muted font-mono flex justify-between items-center select-none pt-1">
                  <span>AES Keyed HSM Token Verification</span>
                  <button type="button" onClick={() => setVerifyCode("APEX-9851")} className="text-cyan-500 hover:underline">Autofill APEX-9851</button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors duration-150 cursor-pointer"
              >
                {isLoading ? "Synchronizing Credentials Ledger..." : "Assert Verification & Connect Dashboard"}
              </button>
            </form>
          )}

          {/* Links navigation switches */}
          <div className="mt-6 pt-4 border-t theme-border text-center text-xs theme-text-secondary space-y-3">
            
            {currentView === "login" && (
              <div>
                First time applying for an account?{" "}
                <button
                  type="button"
                  onClick={() => { setErrorMessage(""); setSuccessMessage(""); setView("register"); setRegisterStep(1); }}
                  className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  Apply to Become a Publisher
                </button>
              </div>
            )}

            {(currentView === "register" || currentView === "forgot" || currentView === "verify") && (
              <div>
                Already have active credentials?{" "}
                <button
                  type="button"
                  onClick={() => { setErrorMessage(""); setSuccessMessage(""); setView("login"); }}
                  className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold cursor-pointer"
                >
                  Return to secure portal Login
                </button>
              </div>
            )}

            {currentView === "login" && (
              <div className="text-center pt-1 text-[10px] theme-text-muted font-sans uppercase">
                Secure SSL Encrypted Connection
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
