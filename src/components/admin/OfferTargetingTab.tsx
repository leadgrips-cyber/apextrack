import React, { useEffect, useRef, useState } from "react";
import {
  Shield,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  X,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import * as api from "../../services/offerTargeting";
import type { TargetingRuleRecord, RuleType, Operator, Action } from "../../services/offerTargeting";

interface Props {
  offerId: number;
}

const RULE_TYPES: { value: RuleType; label: string }[] = [
  { value: "COUNTRY", label: "Country" },
  { value: "OS",      label: "OS" },
  { value: "DEVICE",  label: "Device" },
  { value: "BROWSER", label: "Browser" },
  { value: "ISP",     label: "ISP" },
];

const OPERATORS: { value: Operator; label: string }[] = [
  { value: "IS",     label: "Is" },
  { value: "IS_NOT", label: "Is Not" },
];

const ACTIONS: { value: Action; label: string; color: string }[] = [
  { value: "BLOCK", label: "Block",  color: "text-red-600 bg-red-50 border-red-200" },
  { value: "ALLOW", label: "Allow",  color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
];

const OS_OPTIONS = [
  { value: "windows", label: "Windows" },
  { value: "mac",     label: "macOS" },
  { value: "linux",   label: "Linux" },
  { value: "ios",     label: "iOS" },
  { value: "android", label: "Android" },
];

const DEVICE_OPTIONS = [
  { value: "desktop", label: "Desktop" },
  { value: "mobile",  label: "Mobile" },
  { value: "tablet",  label: "Tablet" },
];

const BROWSER_OPTIONS = [
  { value: "chrome",  label: "Chrome" },
  { value: "firefox", label: "Firefox" },
  { value: "safari",  label: "Safari" },
  { value: "edge",    label: "Edge" },
  { value: "opera",   label: "Opera" },
  { value: "ie",      label: "Internet Explorer" },
];

const COUNTRY_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL_COUNTRIES", label: "🌍 All Countries" },
  { value: "AF", label: "Afghanistan" }, { value: "AL", label: "Albania" }, { value: "DZ", label: "Algeria" },
  { value: "AS", label: "American Samoa" }, { value: "AD", label: "Andorra" }, { value: "AO", label: "Angola" },
  { value: "AI", label: "Anguilla" }, { value: "AG", label: "Antigua and Barbuda" }, { value: "AR", label: "Argentina" },
  { value: "AM", label: "Armenia" }, { value: "AW", label: "Aruba" }, { value: "AU", label: "Australia" },
  { value: "AT", label: "Austria" }, { value: "AZ", label: "Azerbaijan" }, { value: "BS", label: "Bahamas" },
  { value: "BH", label: "Bahrain" }, { value: "BD", label: "Bangladesh" }, { value: "BB", label: "Barbados" },
  { value: "BY", label: "Belarus" }, { value: "BE", label: "Belgium" }, { value: "BZ", label: "Belize" },
  { value: "BJ", label: "Benin" }, { value: "BM", label: "Bermuda" }, { value: "BT", label: "Bhutan" },
  { value: "BO", label: "Bolivia" }, { value: "BA", label: "Bosnia and Herzegovina" }, { value: "BW", label: "Botswana" },
  { value: "BR", label: "Brazil" }, { value: "BN", label: "Brunei" }, { value: "BG", label: "Bulgaria" },
  { value: "BF", label: "Burkina Faso" }, { value: "BI", label: "Burundi" }, { value: "CV", label: "Cabo Verde" },
  { value: "KH", label: "Cambodia" }, { value: "CM", label: "Cameroon" }, { value: "CA", label: "Canada" },
  { value: "KY", label: "Cayman Islands" }, { value: "CF", label: "Central African Republic" }, { value: "TD", label: "Chad" },
  { value: "CL", label: "Chile" }, { value: "CN", label: "China" }, { value: "CO", label: "Colombia" },
  { value: "KM", label: "Comoros" }, { value: "CR", label: "Costa Rica" }, { value: "CI", label: "Côte d'Ivoire" },
  { value: "HR", label: "Croatia" }, { value: "CY", label: "Cyprus" }, { value: "CZ", label: "Czech Republic" },
  { value: "DK", label: "Denmark" }, { value: "DJ", label: "Djibouti" }, { value: "DM", label: "Dominica" },
  { value: "DO", label: "Dominican Republic" }, { value: "EC", label: "Ecuador" }, { value: "EG", label: "Egypt" },
  { value: "SV", label: "El Salvador" }, { value: "GQ", label: "Equatorial Guinea" }, { value: "ER", label: "Eritrea" },
  { value: "EE", label: "Estonia" }, { value: "SZ", label: "Eswatini" }, { value: "ET", label: "Ethiopia" },
  { value: "FK", label: "Falkland Islands" }, { value: "FO", label: "Faroe Islands" }, { value: "FJ", label: "Fiji" },
  { value: "FI", label: "Finland" }, { value: "FR", label: "France" }, { value: "GF", label: "French Guiana" },
  { value: "PF", label: "French Polynesia" }, { value: "GA", label: "Gabon" }, { value: "GM", label: "Gambia" },
  { value: "GE", label: "Georgia" }, { value: "DE", label: "Germany" }, { value: "GH", label: "Ghana" },
  { value: "GI", label: "Gibraltar" }, { value: "GR", label: "Greece" }, { value: "GL", label: "Greenland" },
  { value: "GD", label: "Grenada" }, { value: "GP", label: "Guadeloupe" }, { value: "GU", label: "Guam" },
  { value: "GT", label: "Guatemala" }, { value: "GG", label: "Guernsey" }, { value: "GN", label: "Guinea" },
  { value: "GW", label: "Guinea-Bissau" }, { value: "GY", label: "Guyana" }, { value: "HT", label: "Haiti" },
  { value: "HN", label: "Honduras" }, { value: "HK", label: "Hong Kong" }, { value: "HU", label: "Hungary" },
  { value: "IS", label: "Iceland" }, { value: "IN", label: "India" }, { value: "ID", label: "Indonesia" },
  { value: "IQ", label: "Iraq" }, { value: "IE", label: "Ireland" }, { value: "IM", label: "Isle of Man" },
  { value: "IL", label: "Israel" }, { value: "IT", label: "Italy" }, { value: "JM", label: "Jamaica" },
  { value: "JP", label: "Japan" }, { value: "JE", label: "Jersey" }, { value: "JO", label: "Jordan" },
  { value: "KZ", label: "Kazakhstan" }, { value: "KE", label: "Kenya" }, { value: "KI", label: "Kiribati" },
  { value: "KW", label: "Kuwait" }, { value: "KG", label: "Kyrgyzstan" }, { value: "LA", label: "Laos" },
  { value: "LV", label: "Latvia" }, { value: "LB", label: "Lebanon" }, { value: "LS", label: "Lesotho" },
  { value: "LR", label: "Liberia" }, { value: "LY", label: "Libya" }, { value: "LI", label: "Liechtenstein" },
  { value: "LT", label: "Lithuania" }, { value: "LU", label: "Luxembourg" }, { value: "MO", label: "Macao" },
  { value: "MG", label: "Madagascar" }, { value: "MW", label: "Malawi" }, { value: "MY", label: "Malaysia" },
  { value: "MV", label: "Maldives" }, { value: "ML", label: "Mali" }, { value: "MT", label: "Malta" },
  { value: "MH", label: "Marshall Islands" }, { value: "MQ", label: "Martinique" }, { value: "MR", label: "Mauritania" },
  { value: "MU", label: "Mauritius" }, { value: "YT", label: "Mayotte" }, { value: "MX", label: "Mexico" },
  { value: "FM", label: "Micronesia" }, { value: "MD", label: "Moldova" }, { value: "MC", label: "Monaco" },
  { value: "MN", label: "Mongolia" }, { value: "ME", label: "Montenegro" }, { value: "MS", label: "Montserrat" },
  { value: "MA", label: "Morocco" }, { value: "MZ", label: "Mozambique" }, { value: "MM", label: "Myanmar" },
  { value: "NA", label: "Namibia" }, { value: "NR", label: "Nauru" }, { value: "NP", label: "Nepal" },
  { value: "NL", label: "Netherlands" }, { value: "NC", label: "New Caledonia" }, { value: "NZ", label: "New Zealand" },
  { value: "NI", label: "Nicaragua" }, { value: "NE", label: "Niger" }, { value: "NG", label: "Nigeria" },
  { value: "NU", label: "Niue" }, { value: "NF", label: "Norfolk Island" }, { value: "MK", label: "North Macedonia" },
  { value: "MP", label: "Northern Mariana Islands" }, { value: "NO", label: "Norway" }, { value: "OM", label: "Oman" },
  { value: "PK", label: "Pakistan" }, { value: "PW", label: "Palau" }, { value: "PS", label: "Palestine" },
  { value: "PA", label: "Panama" }, { value: "PG", label: "Papua New Guinea" }, { value: "PY", label: "Paraguay" },
  { value: "PE", label: "Peru" }, { value: "PH", label: "Philippines" }, { value: "PN", label: "Pitcairn Islands" },
  { value: "PL", label: "Poland" }, { value: "PT", label: "Portugal" }, { value: "PR", label: "Puerto Rico" },
  { value: "QA", label: "Qatar" }, { value: "RE", label: "Réunion" }, { value: "RO", label: "Romania" },
  { value: "RU", label: "Russia" }, { value: "RW", label: "Rwanda" }, { value: "KN", label: "Saint Kitts and Nevis" },
  { value: "LC", label: "Saint Lucia" }, { value: "VC", label: "Saint Vincent and the Grenadines" }, { value: "WS", label: "Samoa" },
  { value: "SM", label: "San Marino" }, { value: "ST", label: "São Tomé and Príncipe" }, { value: "SA", label: "Saudi Arabia" },
  { value: "SN", label: "Senegal" }, { value: "RS", label: "Serbia" }, { value: "SC", label: "Seychelles" },
  { value: "SL", label: "Sierra Leone" }, { value: "SG", label: "Singapore" }, { value: "SK", label: "Slovakia" },
  { value: "SI", label: "Slovenia" }, { value: "SB", label: "Solomon Islands" }, { value: "SO", label: "Somalia" },
  { value: "ZA", label: "South Africa" }, { value: "KR", label: "South Korea" }, { value: "SS", label: "South Sudan" },
  { value: "ES", label: "Spain" }, { value: "LK", label: "Sri Lanka" }, { value: "SD", label: "Sudan" },
  { value: "SR", label: "Suriname" }, { value: "SE", label: "Sweden" }, { value: "CH", label: "Switzerland" },
  { value: "SY", label: "Syria" }, { value: "TW", label: "Taiwan" }, { value: "TJ", label: "Tajikistan" },
  { value: "TZ", label: "Tanzania" }, { value: "TH", label: "Thailand" }, { value: "TL", label: "Timor-Leste" },
  { value: "TG", label: "Togo" }, { value: "TO", label: "Tonga" }, { value: "TT", label: "Trinidad and Tobago" },
  { value: "TN", label: "Tunisia" }, { value: "TR", label: "Turkey" }, { value: "TM", label: "Turkmenistan" },
  { value: "TC", label: "Turks and Caicos Islands" }, { value: "TV", label: "Tuvalu" }, { value: "UG", label: "Uganda" },
  { value: "UA", label: "Ukraine" }, { value: "AE", label: "United Arab Emirates" }, { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" }, { value: "UY", label: "Uruguay" }, { value: "UZ", label: "Uzbekistan" },
  { value: "VU", label: "Vanuatu" }, { value: "VA", label: "Vatican City" }, { value: "VE", label: "Venezuela" },
  { value: "VN", label: "Vietnam" }, { value: "EH", label: "Western Sahara" }, { value: "YE", label: "Yemen" },
  { value: "ZM", label: "Zambia" }, { value: "ZW", label: "Zimbabwe" },
];

const selectCls = "w-full rounded-xl border theme-border bg-white dark:bg-slate-950 px-3 py-2 text-sm theme-text-main focus:outline-none focus:ring-2 focus:ring-cyan-400";

function actionBadge(action: Action) {
  const a = ACTIONS.find(x => x.value === action);
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${a?.color}`}>
      {a?.label ?? action}
    </span>
  );
}

function statusBadge(is_active: boolean) {
  return is_active
    ? <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">Active</span>
    : <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-500 px-2 py-0.5 text-[10px] font-bold">Disabled</span>;
}

function CountrySearchSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const allCountriesOpt = COUNTRY_OPTIONS[0]; // "ALL_COUNTRIES" always first
  const regularOptions = COUNTRY_OPTIONS.slice(1);
  const filtered = search
    ? [
        ...(allCountriesOpt.label.toLowerCase().includes(search.toLowerCase()) ? [allCountriesOpt] : []),
        ...regularOptions.filter(
          c =>
            c.label.toLowerCase().includes(search.toLowerCase()) ||
            c.value.toLowerCase().includes(search.toLowerCase())
        ),
      ].slice(0, 60)
    : COUNTRY_OPTIONS.slice(0, 61);

  const selectedLabel = COUNTRY_OPTIONS.find(c => c.value === value)?.label ?? "";
  const displayText = open ? search : selectedLabel || "Search country…";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          type="text"
          value={displayText}
          onFocus={() => { setOpen(true); setSearch(""); }}
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          placeholder="Search country…"
          className={`${selectCls} pr-8 ${!open && selectedLabel ? "" : "text-slate-400"}`}
        />
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      </div>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-950 border theme-border rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-slate-400">No countries found</div>
          ) : (
            filtered.map(c => (
              <div
                key={c.value}
                onMouseDown={() => { onChange(c.value); setOpen(false); setSearch(""); }}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 ${c.value === value ? "bg-cyan-50 dark:bg-cyan-900/20 font-semibold" : ""}`}
              >
                <span className="font-mono font-bold text-xs text-slate-400 w-7 flex-shrink-0">{c.value}</span>
                <span className="theme-text-main">{c.label}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StaticSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={selectCls}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function RuleValueSelector({ ruleType, value, onChange }: { ruleType: RuleType; value: string; onChange: (v: string) => void }) {
  switch (ruleType) {
    case "COUNTRY":
      return <CountrySearchSelect value={value} onChange={onChange} />;
    case "OS":
      return <StaticSelect value={value || "windows"} onChange={onChange} options={OS_OPTIONS} />;
    case "DEVICE":
      return <StaticSelect value={value || "desktop"} onChange={onChange} options={DEVICE_OPTIONS} />;
    case "BROWSER":
      return <StaticSelect value={value || "chrome"} onChange={onChange} options={BROWSER_OPTIONS} />;
    case "ISP":
      return (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="ISP name (e.g. Vodafone)"
          className={selectCls}
        />
      );
  }
}

function defaultValueForType(ruleType: RuleType): string {
  switch (ruleType) {
    case "COUNTRY": return "";
    case "OS":      return "windows";
    case "DEVICE":  return "desktop";
    case "BROWSER": return "chrome";
    case "ISP":     return "";
  }
}

const EMPTY_FORM = { rule_type: "COUNTRY" as RuleType, operator: "IS" as Operator, rule_value: "", action: "BLOCK" as Action };

export function OfferTargetingTab({ offerId }: Props) {
  const [rules, setRules] = useState<TargetingRuleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => { load(); }, [offerId]);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      setRules(await api.listRules(offerId));
    } catch (err: any) {
      setLoadError(err.message || "Failed to load rules");
    } finally {
      setLoading(false);
    }
  }

  function handleTypeChange(ruleType: RuleType) {
    setForm(prev => ({ ...prev, rule_type: ruleType, rule_value: defaultValueForType(ruleType) }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.rule_value.trim()) { setFormError("Select or enter a value"); return; }
    setSaving(true);
    setFormError(null);
    try {
      const rule = await api.createRule(offerId, form.rule_type, form.operator, form.rule_value, form.action);
      setRules(prev => [...prev, rule]);
      setForm(prev => ({ ...prev, rule_value: defaultValueForType(prev.rule_type) }));
    } catch (err: any) {
      setFormError(err.message || "Failed to create rule");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(rule: TargetingRuleRecord) {
    setActingId(rule.id);
    setActionError(null);
    try {
      const updated = await api.updateRule(offerId, rule.id, { is_active: !rule.is_active });
      setRules(prev => prev.map(r => r.id === rule.id ? updated : r));
    } catch (err: any) {
      setActionError(err.message || "Failed to update rule");
    } finally {
      setActingId(null);
    }
  }

  async function handleDelete(rule: TargetingRuleRecord) {
    setActingId(rule.id);
    setActionError(null);
    try {
      await api.deleteRule(offerId, rule.id);
      setRules(prev => prev.filter(r => r.id !== rule.id));
    } catch (err: any) {
      setActionError(err.message || "Failed to delete rule");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="flex items-center justify-between rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-cyan-500" />
        <h2 className="text-sm font-bold theme-text-main">Targeting Rules</h2>
        <span className="ml-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 text-[10px] font-semibold">
          {rules.length} rule{rules.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="rounded-2xl border theme-border bg-amber-50 dark:bg-amber-900/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-400 flex gap-2">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <div>
          Rules are evaluated for every click. <strong>BLOCK</strong> rules reject the click and no record is stored.
          <strong> ALLOW</strong> rules override any BLOCK for the same click — use them to whitelist exceptions.
          Evaluation order: ALLOW overrides BLOCK.
        </div>
      </div>

      {/* Add rule form */}
      <div className="rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest theme-text-muted mb-4">Add Rule</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Rule type */}
            <div>
              <label className="block text-xs theme-text-muted mb-1 font-semibold">Type</label>
              <select
                value={form.rule_type}
                onChange={e => handleTypeChange(e.target.value as RuleType)}
                className={selectCls}
              >
                {RULE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            {/* Operator */}
            <div>
              <label className="block text-xs theme-text-muted mb-1 font-semibold">Operator</label>
              <select
                value={form.operator}
                onChange={e => setForm(prev => ({ ...prev, operator: e.target.value as Operator }))}
                className={selectCls}
              >
                {OPERATORS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {/* Value — dynamic per rule type */}
            <div>
              <label className="block text-xs theme-text-muted mb-1 font-semibold">Value</label>
              <RuleValueSelector
                ruleType={form.rule_type}
                value={form.rule_value}
                onChange={v => setForm(prev => ({ ...prev, rule_value: v }))}
              />
            </div>
            {/* Action */}
            <div>
              <label className="block text-xs theme-text-muted mb-1 font-semibold">Action</label>
              <select
                value={form.action}
                onChange={e => setForm(prev => ({ ...prev, action: e.target.value as Action }))}
                className={selectCls}
              >
                {ACTIONS.map(a => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>

          {form.rule_type === "ISP" && (
            <p className="text-[11px] text-slate-400">ISP rules are stored but cannot be enforced without a GeoIP provider. They have no effect on traffic.</p>
          )}
          {formError && (
            <p className="text-xs text-red-500">{formError}</p>
          )}
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-cyan-600 px-5 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add Rule
          </button>
        </form>
      </div>

      {/* Rules table */}
      <div className="rounded-3xl border theme-border bg-white dark:bg-slate-950 shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              {["Type", "Operator", "Value", "Action", "Status", ""].map(h => (
                <th key={h} className="px-4 py-4 text-left text-[10px] uppercase tracking-widest text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" /> Loading…
              </td></tr>
            ) : loadError ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-red-500">{loadError}</td></tr>
            ) : rules.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-12 text-center">
                <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No targeting rules yet. All traffic is accepted.</p>
              </td></tr>
            ) : (
              rules.map(rule => {
                const isActing = actingId === rule.id;
                const displayValue = rule.rule_type === "COUNTRY"
                  ? `${COUNTRY_OPTIONS.find(c => c.value === rule.rule_value)?.label ?? rule.rule_value} (${rule.rule_value})`
                  : rule.rule_value;
                return (
                  <tr key={rule.id} className={`transition-colors ${!rule.is_active ? "opacity-50" : ""}`}>
                    <td className="px-4 py-4 text-sm font-semibold theme-text-main whitespace-nowrap">{rule.rule_type}</td>
                    <td className="px-4 py-4 text-sm theme-text-muted whitespace-nowrap">{rule.operator === "IS" ? "Is" : "Is Not"}</td>
                    <td className="px-4 py-4 text-sm font-mono theme-text-main">{displayValue}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{actionBadge(rule.action)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{statusBadge(rule.is_active)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggle(rule)}
                          disabled={isActing}
                          title={rule.is_active ? "Disable rule" : "Enable rule"}
                          className="rounded-xl p-1.5 text-xs font-semibold theme-text-muted hover:theme-text-main transition disabled:opacity-50"
                        >
                          {isActing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : rule.is_active ? (
                            <ToggleRight className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(rule)}
                          disabled={isActing}
                          title="Delete rule"
                          className="rounded-xl p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                        >
                          {isActing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
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
