import React, { useMemo, useState } from "react";

type ManagerStatus = "Pending" | "Active" | "Disabled";

export function ManagerCreateView() {
  const [fields, setFields] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    employeeId: "",
    department: "",
    designation: "",
    joiningDate: "",
    region: "",
    team: "",
    maxAffiliates: "",
    managerStatus: "Pending" as ManagerStatus,
    revenueTarget: "",
    conversionTarget: "",
    notes: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const sampleEmployeeId = useMemo(() => {
    const id = Math.floor(10000 + Math.random() * 89999);
    return `EMP-${id}`;
  }, []);

  // initialize employeeId on mount
  React.useEffect(() => {
    setFields((f) => ({ ...f, employeeId: sampleEmployeeId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email);
  const passwordValid = fields.password.length >= 8;
  const confirmValid = fields.password === fields.confirmPassword && fields.confirmPassword.length > 0;
  const phoneValid = fields.phone.trim().length >= 7;
  const maxAffiliatesValid = fields.maxAffiliates === "" || Number(fields.maxAffiliates) >= 0;

  const requiredValid =
    fields.fullName.trim() !== "" &&
    emailValid &&
    passwordValid &&
    confirmValid &&
    phoneValid &&
    fields.department.trim() !== "" &&
    fields.designation.trim() !== "" &&
    fields.joiningDate.trim() !== "" &&
    fields.region.trim() !== "" &&
    fields.team.trim() !== "" &&
    maxAffiliatesValid;

  const inputClass = (isError: boolean) =>
    `w-full rounded-2xl border px-4 py-3 text-sm theme-text-main focus:outline-none ${
      isError ? "border-rose-300 bg-rose-50" : "theme-border bg-white"
    }`;

  const handleChange = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setFields((s) => ({ ...s, [key]: value }));
  };

  const handleBlur = (key: string) => () => setTouched((t) => ({ ...t, [key]: true }));

  const resetForm = () => {
    setFields({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      employeeId: sampleEmployeeId,
      department: "",
      designation: "",
      joiningDate: "",
      region: "",
      team: "",
      maxAffiliates: "",
      managerStatus: "Pending",
      revenueTarget: "",
      conversionTarget: "",
      notes: "",
    });
    setTouched({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Managers</div>
          <h2 className="mt-2 text-2xl font-black theme-text-main">Create Manager</h2>
          <p className="mt-2 text-sm theme-text-muted max-w-2xl">Add a new affiliate manager and configure assignment rules and targets.</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Manager Information</div>
                <p className="mt-2 text-sm theme-text-muted">Primary login and contact details for the manager.</p>
              </div>
              <span className="rounded-full border theme-border bg-slate-50 px-3 py-1 text-[11px] font-semibold theme-text-secondary">Required</span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 sm:col-span-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Full Name</span>
                <input placeholder="Jordan Miles" value={fields.fullName} onChange={handleChange("fullName")} onBlur={handleBlur("fullName")} className={inputClass(touched["fullName"] && fields.fullName.trim() === "")} />
                {touched["fullName"] && fields.fullName.trim() === "" && <p className="text-rose-600 text-xs">Full name is required.</p>}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Email</span>
                <input type="email" placeholder="jordan.miles@apextrack.com" value={fields.email} onChange={handleChange("email")} onBlur={handleBlur("email")} className={inputClass(touched["email"] && !emailValid)} />
                {touched["email"] && !fields.email && <p className="text-rose-600 text-xs">Email is required.</p>}
                {touched["email"] && fields.email && !emailValid && <p className="text-rose-600 text-xs">Enter a valid email address.</p>}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Phone Number</span>
                <input type="tel" placeholder="+1 555 555 0123" value={fields.phone} onChange={handleChange("phone")} onBlur={handleBlur("phone")} className={inputClass(touched["phone"] && !phoneValid)} />
                {touched["phone"] && !fields.phone && <p className="text-rose-600 text-xs">Phone is required.</p>}
                {touched["phone"] && fields.phone && !phoneValid && <p className="text-rose-600 text-xs">Enter a valid phone number.</p>}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Password</span>
                <input type="password" placeholder="Create a secure password" value={fields.password} onChange={handleChange("password")} onBlur={handleBlur("password")} className={inputClass(touched["password"] && !passwordValid)} />
                {touched["password"] && !fields.password && <p className="text-rose-600 text-xs">Password is required.</p>}
                {touched["password"] && fields.password && !passwordValid && <p className="text-rose-600 text-xs">Password must be at least 8 characters.</p>}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Confirm Password</span>
                <input type="password" placeholder="Confirm password" value={fields.confirmPassword} onChange={handleChange("confirmPassword")} onBlur={handleBlur("confirmPassword")} className={inputClass(touched["confirmPassword"] && !confirmValid)} />
                {touched["confirmPassword"] && !fields.confirmPassword && <p className="text-rose-600 text-xs">Confirmation is required.</p>}
                {touched["confirmPassword"] && fields.confirmPassword && !confirmValid && <p className="text-rose-600 text-xs">Passwords must match.</p>}
              </label>
            </div>
          </section>

          <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Employment Details</div>
              <p className="mt-2 text-sm theme-text-muted">Set internal identifiers and employment metadata.</p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Employee ID</span>
                <input type="text" value={fields.employeeId} readOnly className="w-full rounded-2xl border theme-border bg-slate-50 px-4 py-3 text-sm theme-text-main" />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Department</span>
                <select value={fields.department} onChange={handleChange("department")} onBlur={handleBlur("department")} className={inputClass(touched["department"] && fields.department === "") }>
                  <option value="">Select department</option>
                  <option>Affiliate Management</option>
                  <option>Account Services</option>
                  <option>Compliance</option>
                  <option>Tech Ops</option>
                </select>
                {touched["department"] && fields.department === "" && <p className="text-rose-600 text-xs">Department is required.</p>}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Designation</span>
                <input placeholder="Senior Affiliate Manager" value={fields.designation} onChange={handleChange("designation")} onBlur={handleBlur("designation")} className={inputClass(touched["designation"] && fields.designation.trim() === "")} />
                {touched["designation"] && fields.designation.trim() === "" && <p className="text-rose-600 text-xs">Designation is required.</p>}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Joining Date</span>
                <input type="date" value={fields.joiningDate} onChange={handleChange("joiningDate")} onBlur={handleBlur("joiningDate")} className={inputClass(touched["joiningDate"] && fields.joiningDate === "")} />
                {touched["joiningDate"] && fields.joiningDate === "" && <p className="text-rose-600 text-xs">Joining date is required.</p>}
              </label>
            </div>
          </section>

          <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Performance Targets</div>
              <p className="mt-2 text-sm theme-text-muted">Optional monthly targets and notes for the manager.</p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Revenue Target (USD)</span>
                <input type="number" min="0" placeholder="50000" value={fields.revenueTarget} onChange={handleChange("revenueTarget")} className={inputClass(false)} />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Conversion Target</span>
                <input type="number" min="0" placeholder="150" value={fields.conversionTarget} onChange={handleChange("conversionTarget")} className={inputClass(false)} />
              </label>

              <label className="space-y-2 sm:col-span-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Notes</span>
                <textarea placeholder="Notes about performance expectations" value={fields.notes} onChange={handleChange("notes")} className="w-full rounded-2xl border theme-border bg-white px-4 py-3 text-sm theme-text-main" rows={4} />
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Assignment Rules</div>
              <p className="mt-2 text-sm theme-text-muted">Where this manager will be assigned and limits applied.</p>
            </div>

            <div className="mt-6 space-y-4">
              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Region</span>
                <select value={fields.region} onChange={handleChange("region")} onBlur={handleBlur("region")} className={inputClass(touched["region"] && fields.region === "")}>
                  <option value="">Select region</option>
                  <option>North America</option>
                  <option>EMEA</option>
                  <option>APAC</option>
                  <option>LATAM</option>
                </select>
                {touched["region"] && fields.region === "" && <p className="text-rose-600 text-xs">Region is required.</p>}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Team</span>
                <select value={fields.team} onChange={handleChange("team")} onBlur={handleBlur("team")} className={inputClass(touched["team"] && fields.team === "")}>
                  <option value="">Select team</option>
                  <option>Team Alpha</option>
                  <option>Team Beta</option>
                  <option>Team Gamma</option>
                </select>
                {touched["team"] && fields.team === "" && <p className="text-rose-600 text-xs">Team selection is required.</p>}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Maximum Affiliates Allowed</span>
                <input type="number" min="0" placeholder="200" value={fields.maxAffiliates} onChange={handleChange("maxAffiliates")} onBlur={handleBlur("maxAffiliates")} className={inputClass(touched["maxAffiliates"] && !maxAffiliatesValid)} />
                {touched["maxAffiliates"] && !maxAffiliatesValid && <p className="text-rose-600 text-xs">Enter a positive number.</p>}
              </label>

              <label className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.24em] font-bold theme-text-muted">Manager Status</span>
                <select value={fields.managerStatus} onChange={handleChange("managerStatus")} onBlur={handleBlur("managerStatus")} className={inputClass(touched["managerStatus"] && fields.managerStatus === "") }>
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </label>
            </div>
          </section>

          <section className="theme-bg-card border theme-border rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] font-bold theme-text-muted">Actions</div>
                <p className="mt-2 text-sm theme-text-muted">This form is UI-only and does not persist data.</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" disabled={!requiredValid} className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${requiredValid ? "bg-cyan-600 text-white hover:bg-cyan-500" : "bg-slate-200 text-slate-500 cursor-not-allowed"}`}>
                Create Manager
              </button>

              <button type="button" onClick={resetForm} className="inline-flex items-center justify-center rounded-full border theme-border bg-white px-6 py-3 text-sm font-semibold theme-text-secondary hover:bg-slate-100 transition">
                Reset
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
