// ============================================================
// features/auth/LoginPage.tsx
// Full-screen login page.
//
// - Demo account cards: one per role, click to auto-fill
// - Manual email + password entry supported
// - Password show/hide toggle
// - Calls useLogin() from useAuthStore on success
// - Navigates to the user's first accessible route after login
// - No role switcher — role is locked to the logged-in account
// ============================================================

import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useLogin } from "../../store/useAuthStore";
import { MAIN_NAV, filterByRole } from "../../config/navigationConfig";
import type { Role } from "../../config/navigationConfig";
import type { User } from "../../store/useAuthStore";

// ─── DEMO CREDENTIALS ────────────────────────────────────
// In production, replace credential checking with a real API call.
const DEMO_ACCOUNTS: (User & { password: string })[] = [
  { id:"U001", name:"Rajesh Kumar",  email:"rajesh@dojo.com",  password:"admin123",   role:"SUPER_ADMIN",      center:"All",         avatar:"RK" },
  { id:"U007", name:"Dev Admin",     email:"dev@dojo.com",     password:"admin123",   role:"ADMIN",             center:"Whitefield",  avatar:"DA" },
  { id:"U008", name:"Aryan TL",      email:"aryan@dojo.com",   password:"lead123",    role:"CENTER_MANAGER",   center:"Koramangala",  avatar:"AT" },
  { id:"U009", name:"Neha SM",       email:"neha@dojo.com",    password:"sales123",   role:"SALES_MANAGER",    center:"All",          avatar:"NS" },
  { id:"U002", name:"Priya R",       email:"priya@dojo.com",   password:"rm123",      role:"RM",                center:"Koramangala", avatar:"PR" },
  { id:"U004", name:"Meena Sharma",  email:"meena@dojo.com",   password:"fm123",      role:"FM",                center:"Koramangala", avatar:"MS" },
  { id:"U005", name:"Kiran TM",      email:"kiran@dojo.com",   password:"trainer123", role:"TRAINING_MANAGER",  center:"All",         avatar:"KT" },
  { id:"U006", name:"Anita HR",      email:"anita@dojo.com",   password:"hr123",      role:"HR",                center:"All",         avatar:"AH" },
];

// ─── ROLE META ───────────────────────────────────────────
const ROLE_META: Record<Role, { color: string; icon: string; desc: string }> = {
  SUPER_ADMIN:      { color:"#818cf8", icon:"⚡", desc:"Full system access — all modules, all centres" },
  ADMIN:            { color:"#a78bfa", icon:"◈", desc:"Centre admin — leads, schedule, renewals, settings" },
  CENTER_MANAGER:   { color:"#22d3ee", icon:"🏢", desc:"Centre Manager — full centre ops, staff, renewals, reports" },
  SALES_MANAGER:    { color:"#f97316", icon:"📊", desc:"Sales Manager — pipeline, team performance, lead reports" },
  RM:               { color:"#34d399", icon:"📞", desc:"Relationship Manager — leads, calls, trials" },
  FM:               { color:"#fbbf24", icon:"💳", desc:"Finance Manager — renewals, memberships, revenue" },
  TRAINING_MANAGER: { color:"#f472b6", icon:"🥋", desc:"Training Manager — schedule, trials, batches" },
  HR:               { color:"#94a3b8", icon:"◎",  desc:"HR — read-only dashboard access" },
};

// ─── INPUT ───────────────────────────────────────────────
const AuthInput = ({
  label, type = "text", placeholder, value, onChange, suffix,
  autoComplete,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: React.ReactNode;
  autoComplete?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold text-slate-400">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={cn(
          "w-full bg-[#162040] border border-[#1e2f52] rounded-xl px-4 py-3",
          "text-[13px] text-white placeholder:text-slate-600 outline-none",
          "focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20",
          "transition-colors duration-150",
          suffix && "pr-12"
        )}
      />
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
    </div>
  </div>
);

// ─── DEMO ACCOUNT CARD ───────────────────────────────────
const DemoCard = ({
  account, selected, onSelect,
}: {
  account: (typeof DEMO_ACCOUNTS)[0];
  selected: boolean;
  onSelect: () => void;
}) => {
  const meta = ROLE_META[account.role];
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer",
        selected
          ? "border-[var(--role-color)] bg-[var(--role-bg)]"
          : "border-[#1e2f52] bg-[#111d35] hover:border-[#2d4a80] hover:bg-[#162040]"
      )}
      style={{ "--role-color": meta.color, "--role-bg": `${meta.color}12` } as React.CSSProperties}
    >
      <span className="text-base leading-none flex-shrink-0">{meta.icon}</span>
      <div className="min-w-0">
        <p
          className="text-[11px] font-700 truncate transition-colors"
          style={{ color: selected ? meta.color : "#e8edf8", fontWeight: 700 }}
        >
          {account.name}
        </p>
        <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: meta.color, opacity: 0.8 }}>
          {account.role.replace("_", " ")}
        </p>
      </div>
    </button>
  );
};

// ─── MAIN PAGE ───────────────────────────────────────────
export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fill form from a demo account card click
  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[0]) => {
    setSelectedDemo(account.email);
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  };

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!email || !password) return;
    setError("");
    setLoading(true);

    // Simulate network latency (replace with a real API call)
    setTimeout(() => {
      const account = DEMO_ACCOUNTS.find(
        a => a.email === email.trim().toLowerCase() && a.password === password
      );

      if (!account) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      // Strip password before storing
      const { password: _pw, ...user } = account;

      // Commit to the auth store
      login(user);

      // Redirect to the first page this role can access
      const firstNav = filterByRole(MAIN_NAV, user.role)[0];
      navigate(firstNav?.path ?? "/dashboard", { replace: true });
    }, 700);
  };

  const selectedAccount = DEMO_ACCOUNTS.find(a => a.email === selectedDemo);

  return (
    <div className="min-h-screen bg-[#080e1a] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-radial-indigo pointer-events-none"
        style={{ background:"radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)" }} />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background:"radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)" }} />

      {/* Card */}
      <div className="w-full max-w-[900px] grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-[#1e2f52] shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative">

        {/* ── LEFT: Branding ── */}
        <div
          className="relative hidden md:flex flex-col justify-between p-12 bg-[#0d1526] border-r border-[#1e2f52] overflow-hidden"
        >
          {/* Dot-grid decoration */}
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{ backgroundImage:`linear-gradient(#1e2f52 1px, transparent 1px), linear-gradient(90deg, #1e2f52 1px, transparent 1px)`, backgroundSize:"40px 40px" }}
          />

          <div className="relative">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-[11px] bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xl shadow-[0_0_24px_rgba(99,102,241,0.45)]">
                ⚔
              </div>
              <div>
                <p className="text-[16px] font-extrabold text-white tracking-tight">
                  Proton<span className="text-indigo-400">CRM</span>
                </p>
                <p className="text-[10px] text-slate-500 tracking-widest uppercase">Martial Arts Management</p>
              </div>
            </div>

            <h1 className="text-[28px] font-extrabold text-white leading-tight mb-4">
              Manage every lead,<br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                every belt earned.
              </span>
            </h1>
            <p className="text-[13px] text-slate-500 leading-relaxed mb-10">
              A unified CRM for your martial arts academy — from the first enquiry through trial, membership, and renewal.
            </p>

            {[
              ["⬡", "Meta & WhatsApp lead import"],
              ["◈", "Role-based access per team member"],
              ["🥋", "Trial & batch schedule management"],
              ["💳", "Memberships, renewals & revenue"],
            ].map(([ic, txt]) => (
              <div key={txt} className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-sm flex-shrink-0">
                  {ic}
                </div>
                <span className="text-[12px] text-slate-400">{txt}</span>
              </div>
            ))}
          </div>

          <p className="relative text-[11px] text-slate-600">
            © 2025 Dojo Martial Arts · All rights reserved
          </p>
        </div>

        {/* ── RIGHT: Login form ── */}
        <div className="bg-[#0d1526] p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-[22px] font-extrabold text-white mb-1">Sign in</h2>
          <p className="text-[13px] text-slate-500 mb-7">
            Select a demo account or enter credentials manually.
          </p>

          {/* Demo account grid */}
          <div className="mb-6">
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2.5">
              Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <DemoCard
                  key={acc.email}
                  account={acc}
                  selected={selectedDemo === acc.email}
                  onSelect={() => fillDemo(acc)}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-[#1e2f52]" />
            <span className="text-[11px] text-slate-600">or enter manually</span>
            <div className="flex-1 h-px bg-[#1e2f52]" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AuthInput
              label="Email address"
              type="email"
              placeholder="you@dojo.com"
              value={email}
              onChange={v => { setEmail(v); setError(""); }}
              autoComplete="email"
            />
            <AuthInput
              label="Password"
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={v => { setPassword(v); setError(""); }}
              autoComplete="current-password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="text-slate-500 hover:text-white transition-colors text-sm"
                >
                  {showPw ? "🙈" : "👁"}
                </button>
              }
            />

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/8 border border-red-500/20">
                <span className="text-sm">⚠</span>
                <span className="text-[12px] text-red-400">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className={cn(
                "mt-1 py-3 rounded-xl text-[14px] font-bold text-white transition-all duration-200",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                "enabled:bg-gradient-to-r enabled:from-indigo-600 enabled:to-violet-600",
                "enabled:shadow-[0_6px_20px_rgba(99,102,241,0.35)]",
                "enabled:hover:from-indigo-500 enabled:hover:to-violet-500"
              )}
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : "Sign in →"}
            </button>
          </form>

          {/* Selected role hint */}
          {selectedAccount && (
            <div
              className="mt-5 px-4 py-3 rounded-xl border"
              style={{
                background: `${ROLE_META[selectedAccount.role].color}08`,
                borderColor: `${ROLE_META[selectedAccount.role].color}25`,
              }}
            >
              <p className="text-[11px] font-bold mb-0.5" style={{ color: ROLE_META[selectedAccount.role].color }}>
                {ROLE_META[selectedAccount.role].icon} {selectedAccount.role.replace("_", " ")} — {selectedAccount.name}
              </p>
              <p className="text-[11px] text-slate-500">{ROLE_META[selectedAccount.role].desc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
