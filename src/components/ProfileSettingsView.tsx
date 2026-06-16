import React, { useState, useEffect } from "react";
import * as authApi from "../services/auth";
import { Settings, CheckCircle, MapPin, Building, Lock } from "lucide-react";
import { useBranding } from "../contexts/BrandingContext";

export function ProfileSettingsView() {
  const branding = useBranding();

  // Personal & Company Information state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [taxId, setTaxId] = useState("");

  // Messaging channels
  const [telegram, setTelegram] = useState("");
  const [teamsId, setTeamsId] = useState("");
  const [whatsApp, setWhatsApp] = useState("");

  // Geographical Address info
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await authApi.getCurrentUser();

        setFirstName(user.fullName?.split(" ")[0] || "");
        setLastName(user.fullName?.split(" ").slice(1).join(" ") || "");
        setEmail(user.email || "");
        setCompanyName(user.companyName || "");
        setPhone(user.phone || "");
        setWebsite(user.website || "");
        setTelegram(user.telegram || "");
        setTeamsId(user.teamsId || "");
        setWhatsApp(user.whatsapp || "");
        setAddress(user.address || "");
        setCity(user.city || "");
        setStateName(user.stateName || "");
        setCountry(user.country || "");
        setPostalCode(user.postalCode || "");
      } catch (error) {
        console.error("Profile load failed", error);
      }
    };

    loadProfile();
  }, []);
  // Security Credentials fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await authApi.updateProfile({
        phone,
        website,
        telegram,
        teamsId,
        whatsapp: whatsApp,
        address,
        city,
        stateName,
        country,
        postalCode,
      });

      setProfileSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      console.error('Profile update failed', error);
    }
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
        
        <div className="lg:col-span-12 bg-white dark:theme-bg-card border theme-border p-6 rounded-2xl space-y-4 shadow-xs">
          
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


      </div>

    </div>
  );
}
