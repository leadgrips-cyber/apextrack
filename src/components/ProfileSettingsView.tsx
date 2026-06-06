import React, { useState } from "react";
import { User, Mail, ShieldAlert, Settings, Sliders, CheckCircle, Phone, Globe, MapPin, Building, Hash, Lock, ShieldCheck } from "lucide-react";

export function ProfileSettingsView() {
  // Personal & Company Information state
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Doe");
  const [email, setEmail] = useState("demo@apextrack.net");
  const [phone, setPhone] = useState("+1 (555) 234-5678");
  const [companyName, setCompanyName] = useState("John Doe Media INC");
  const [website, setWebsite] = useState("https://highconversionmedia.com");
  const [taxId, setTaxId] = useState("US-99-1234567");

  // Messaging channels
  const [telegram, setTelegram] = useState("@johndoe_traffic");
  const [teamsId, setTeamsId] = useState("teams.johndoe_media");
  const [whatsApp, setWhatsApp] = useState("+1 (555) 987-6543");

  // Geographical Address info
  const [address, setAddress] = useState("120 Performance Way, Suite 400");
  const [city, setCity] = useState("Wilmington");
  const [stateName, setStateName] = useState("Delaware");
  const [country, setCountry] = useState("United States");
  const [postalCode, setPostalCode] = useState("19801");

  // Security Credentials fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Two-Factor Authentication Toggle
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [tfaSuccessMessage, setTfaSuccessMessage] = useState("");

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState("");

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess(false);

    if (!currentPassword) {
      setPwdError("Please enter your current identity password to confirm security changes.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("New password inputs do not match. Re-verify spelling.");
      return;
    }
    if (newPassword.length < 6) {
      setPwdError("Target password length must be at least 6 characters.");
      return;
    }

    setPwdSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPwdSuccess(false), 3000);
  };

  const toggle2FA = () => {
    const nextState = !twoFactorEnabled;
    setTwoFactorEnabled(nextState);
    if (nextState) {
      setTfaSuccessMessage("2FA successfully enabled! Credentials verified via simulated Google Authenticator handshake.");
    } else {
      setTfaSuccessMessage("2FA disabled. Password now serves as the single authority factor.");
    }
    setTimeout(() => setTfaSuccessMessage(""), 4000);
  };

  return (
    <div className="space-y-6 font-sans animate-fadeIn" id="profile-settings-root">
      
      {/* Page Header */}
      <div className="theme-bg-card border theme-border p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <h2 className="text-lg font-bold theme-text-main tracking-tight flex items-center gap-1.5">
            <Settings className="w-5 h-5 text-cyan-500" />
            Profile & Publisher Settings
          </h2>
          <p className="text-xs theme-text-muted">
            Configure partner metadata, geographic details, instant messenger handles, tax identifier numbers, and account credentials security.
          </p>
        </div>
        <div className="theme-bg-well px-2.5 py-1 rounded text-[10px] theme-text-muted font-mono border theme-border select-all shrink-0">
          Account Status: <span className="text-emerald-600 dark:text-emerald-400 font-bold">VERIFIED PLATINUM PARTNER</span>
        </div>
      </div>

      <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PERSONAL, COMPANY & ADDRESS DETAILS: LEFT (7/12) */}
        <div className="lg:col-span-8 space-y-6">
          
          {profileSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-900/40 p-3.5 rounded-xl font-mono text-[11px] flex items-center gap-2">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              <span>Full Publisher Profile has been compiled, cached and synchronized across distributed master nodes successfully!</span>
            </div>
          )}

          {/* Section 1: Business Identity */}
          <div className="theme-bg-card border theme-border p-6 rounded-2xl space-y-4 shadow-xs">
            <h3 className="theme-text-main text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-cyan-500" />
              Business Identity & Contacts
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">Publisher Account Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">Contact Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">Primary Traffic Website / Landing Domain</label>
                <input
                  type="url"
                  required
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">Tax Identification ID (EIN/W8)</label>
                <input
                  type="text"
                  required
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main font-mono"
                  placeholder="e.g. US-XX-XXXXXX"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">Company Legal Entity Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">Telegram Username</label>
                  <input
                    type="text"
                    required
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">Microsoft Teams ID</label>
                  <input
                    type="text"
                    required
                    value={teamsId}
                    onChange={(e) => setTeamsId(e.target.value)}
                    className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">WhatsApp (optional)</label>
                  <input
                    type="text"
                    value={whatsApp}
                    onChange={(e) => setWhatsApp(e.target.value)}
                    className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Physical Address Location Details */}
          <div className="theme-bg-card border theme-border p-6 rounded-2xl space-y-4 shadow-xs">
            <h3 className="theme-text-main text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-500" />
              Corporate Registered Address
            </h3>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">Address Line</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main"
                  placeholder="Street and suite/apartment description"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">State / Province</label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="mt-1 block w-full px-3 py-2.5 theme-bg-well border theme-border rounded-xl theme-text-main font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end select-none">
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-6 py-3 rounded-xl uppercase font-mono text-xs tracking-wider transition cursor-pointer"
            >
              Update Publisher Profile Record Files
            </button>
          </div>

        </div>

      </form>

      {/* CREDENTIALS & 2FA MANAGEMENT PANEL: RIGHT (5/12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Password override form (7/12 for spacing rhythm) */}
        <div className="lg:col-span-7 bg-white dark:theme-bg-card border theme-border p-6 rounded-2xl space-y-4 shadow-xs">
          
          <h3 className="theme-text-main text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-cyan-500" />
            Security & Corporate Password overrides
          </h3>

          <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs font-sans">
            
            {pwdError && (
              <div className="bg-rose-50 dark:bg-rose-955/40 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-900/30 p-2.5 rounded-xl font-mono text-[10px]">
                ⚠️ {pwdError}
              </div>
            )}

            {pwdSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-900/30 p-2.5 rounded-xl font-mono text-[10px]">
                ✓ Security credentials cached updated successfully.
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">Current Verification Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border theme-border rounded-xl theme-text-main font-mono text-xs focus:outline-none focus:border-cyan-500"
                placeholder="Required to compile overrides"
              />
            </div>

            <div className="border-t theme-border pt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">New Target Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters recommended"
                    className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border theme-border rounded-xl theme-text-main font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold theme-text-muted font-mono">Confirm New Target Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat target password exactly"
                    className="mt-1 block w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border theme-border rounded-xl theme-text-main font-mono text-xs focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 dark:bg-slate-950 border border-slate-800 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl uppercase font-mono text-[10px] tracking-wide transition cursor-pointer select-none"
            >
              Verify & Save credentials update
            </button>

          </form>

        </div>

        {/* 2FA SETUP TOGGLE CARD: (5/12 for spacing rhythm) */}
        <div className="lg:col-span-5 theme-bg-card border theme-border p-6 rounded-2xl flex flex-col justify-between space-y-4 shadow-xs">
          
          <div className="space-y-3">
            <h3 className="theme-text-main text-xs font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-500" />
              2FA Authentication Guard
            </h3>

            <p className="text-[11px] theme-text-muted leading-relaxed">
              Require dual token entry (authenticator App code) upon login from new device addresses, password overrides or billing gateway changes.
            </p>

            {tfaSuccessMessage && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-900 p-2.5 rounded-xl text-[10px] leading-relaxed">
                {tfaSuccessMessage}
              </div>
            )}

            <div className="bg-slate-50 dark:theme-bg-well border theme-border p-3.5 rounded-xl flex items-center justify-between text-xs select-none">
              <div className="space-y-0.5">
                <span className="font-bold theme-text-main">Multi-factor (2FA) Status</span>
                <span className={`text-[10px] block font-mono font-bold ${twoFactorEnabled ? "text-emerald-500" : "text-amber-500"}`}>
                  {twoFactorEnabled ? "● ACTIVE & ENFORCED" : "○ DISABLED (Standard security)"}
                </span>
              </div>

              <button
                type="button"
                onClick={toggle2FA}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-mono tracking-wide uppercase font-bold cursor-pointer transition ${
                  twoFactorEnabled
                    ? "bg-rose-500 hover:bg-rose-450 text-white"
                    : "bg-cyan-550 hover:bg-cyan-500 text-white"
                }`}
              >
                {twoFactorEnabled ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>

          <div className="theme-bg-well border theme-border p-3.5 rounded-xl text-[10px] theme-text-secondary">
            <span className="font-bold text-cyan-600 dark:text-cyan-400 block font-mono">SECURITY HARMONIZATION</span>
            All verified publishers on Level-3 ApexTrack commission schemes must maintain authenticated communication channels to secure payment disbursements wallets against MITM threat channels.
          </div>

        </div>

      </div>

    </div>
  );
}
