// ============================================================
// features/auth/LoginPage.tsx
// AI Command Center — full page, both themes, mobile-ready
// - Left panel: content vertically centered (not top-cramped)
// - Header buttons (Download App, IT Support) now in LoginHeader.tsx
// - Mobile: single-column stacked layout
// - All auth logic untouched
// ============================================================

import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import { useLogin } from "../../store/useAuthStore";
import { useThemeStore } from "../../store/useThemeStore";
import { MAIN_NAV, filterByRole } from "../../config/navigationConfig";
import type { Role } from "../../config/navigationConfig";
import type { User } from "../../store/useAuthStore";
import { LoginHeader } from "./LoginHeader";

// ─── DEMO CREDENTIALS ────────────────────────────────────
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
  ADMIN:            { color:"#a78bfa", icon:"◈",  desc:"Centre admin — leads, schedule, renewals, settings" },
  CENTER_MANAGER:   { color:"#22d3ee", icon:"🏢", desc:"Centre Manager — full centre ops, staff, renewals, reports" },
  SALES_MANAGER:    { color:"#f97316", icon:"📊", desc:"Sales Manager — pipeline, team performance, lead reports" },
  RM:               { color:"#34d399", icon:"📞", desc:"Relationship Manager — leads, calls, trials" },
  FM:               { color:"#fbbf24", icon:"💳", desc:"Finance Manager — renewals, memberships, revenue" },
  TRAINING_MANAGER: { color:"#f472b6", icon:"🥋", desc:"Training Manager — schedule, trials, batches" },
  HR:               { color:"#94a3b8", icon:"◎",  desc:"HR — read-only dashboard access" },
};

const AI_FEATURES = [
  { icon: "✦", label: "AI lead scoring & smart prioritisation" },
  { icon: "◎", label: "Renewal predictions & churn detection" },
  { icon: "⚡", label: "WhatsApp & Meta automation" },
  { icon: "◈", label: "Role-based intelligent dashboards" },
];

// ─── THEME TOKENS ────────────────────────────────────────
const T = {
  dark: {
    pageBg:               "#0d1117",
    leftBg:               "rgba(15,20,35,0.95)",
    rightBg:              "rgba(22,27,34,0.97)",
    cardBorder:           "rgba(99,102,241,0.22)",
    panelDivider:         "rgba(99,102,241,0.15)",
    gridLine:             "rgba(99,102,241,0.06)",
    dotColor:             "rgba(99,102,241,0.18)",
    orbColor1:            "rgba(99,102,241,0.10)",
    orbColor2:            "rgba(139,92,246,0.07)",
    orbColor3:            "rgba(52,211,153,0.05)",
    scanBeam:             "linear-gradient(90deg,transparent,rgba(99,102,241,0.25),transparent)",
    nodeLine:             "rgba(99,102,241,0.28)",
    aiBadgeBg:            "rgba(99,102,241,0.12)",
    aiBadgeBorder:        "rgba(99,102,241,0.28)",
    featIconBg:           "rgba(99,102,241,0.10)",
    featIconBorder:       "rgba(99,102,241,0.22)",
    divider:              "rgba(99,102,241,0.15)",
    poweredBorder:        "rgba(99,102,241,0.14)",
    submitDisabledBg:     "rgba(99,102,241,0.15)",
    submitDisabledBorder: "rgba(99,102,241,0.20)",
    itSupportText:        "#fbbf24",
    heading:              "#f1f5f9",
    headingAlt:           "#f8fafc",
    sub:                  "#64748b",
    muted:                "#4a5568",
    copyright:            "#2d3748",
    featText:             "#64748b",
    badgeText:            "#818cf8",
    poweredBy:            "#4a5568",
    demoLabel:            "#4a5568",
    dividerTxt:           "#4a5568",
  },
  light: {
    pageBg:               "#f0f2f8",
    leftBg:               "rgba(238,240,255,0.97)",
    rightBg:              "rgba(255,255,255,0.98)",
    cardBorder:           "rgba(99,102,241,0.20)",
    panelDivider:         "rgba(99,102,241,0.15)",
    gridLine:             "rgba(99,102,241,0.07)",
    dotColor:             "rgba(99,102,241,0.13)",
    orbColor1:            "rgba(99,102,241,0.07)",
    orbColor2:            "rgba(139,92,246,0.05)",
    orbColor3:            "rgba(52,211,153,0.04)",
    scanBeam:             "linear-gradient(90deg,transparent,rgba(99,102,241,0.15),transparent)",
    nodeLine:             "rgba(99,102,241,0.20)",
    aiBadgeBg:            "rgba(99,102,241,0.08)",
    aiBadgeBorder:        "rgba(99,102,241,0.22)",
    featIconBg:           "rgba(99,102,241,0.08)",
    featIconBorder:       "rgba(99,102,241,0.18)",
    divider:              "rgba(99,102,241,0.15)",
    poweredBorder:        "rgba(99,102,241,0.12)",
    submitDisabledBg:     "rgba(99,102,241,0.08)",
    submitDisabledBorder: "rgba(99,102,241,0.18)",
    itSupportText:        "#d97706",
    heading:              "#1e1b4b",
    headingAlt:           "#1e1b4b",
    sub:                  "#475569",
    muted:                "#64748b",
    copyright:            "#94a3b8",
    featText:             "#475569",
    badgeText:            "#4338ca",
    poweredBy:            "#64748b",
    demoLabel:            "#64748b",
    dividerTxt:           "#94a3b8",
  },
} as const;

// ─── INPUT ───────────────────────────────────────────────
const AuthInput = ({
  label, type = "text", placeholder, value, onChange, suffix, autoComplete,
}: {
  label: string; type?: string; placeholder?: string; value: string;
  onChange: (v: string) => void; suffix?: React.ReactNode; autoComplete?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold text-secondary">{label}</label>
    <div className="relative">
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete}
        className={cn(
          "w-full bg-card border border-theme rounded-xl px-4 py-3",
          "text-[13px] text-primary placeholder:text-secondary outline-none",
          "focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20",
          "transition-colors duration-150",
          suffix && "pr-12"
        )}
      />
      {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
    </div>
  </div>
);

// ─── DEMO CARD ───────────────────────────────────────────
const DemoCard = ({
  account, selected, onSelect,
}: {
  account: (typeof DEMO_ACCOUNTS)[0]; selected: boolean; onSelect: () => void;
}) => {
  const meta = ROLE_META[account.role];
  return (
    <button
      type="button" onClick={onSelect}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 cursor-pointer",
        selected
          ? "border-[var(--role-color)] bg-[var(--role-bg)]"
          : "border-theme bg-surface hover:border-[var(--primary-color)] hover:bg-base"
      )}
      style={{ "--role-color": meta.color, "--role-bg": `${meta.color}14` } as React.CSSProperties}
    >
      <span className="text-base leading-none flex-shrink-0">{meta.icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] truncate transition-colors"
          style={{ color: selected ? meta.color : "var(--color-text-primary)", fontWeight: 700 }}>
          {account.name}
        </p>
        <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: meta.color, opacity: 0.85 }}>
          {account.role.replace("_", " ")}
        </p>
      </div>
    </button>
  );
};

// ─── MAIN PAGE ───────────────────────────────────────────
export const LoginPage = () => {
  const navigate  = useNavigate();
  const login     = useLogin();
  const { resolvedTheme } = useThemeStore();
  const isDark = resolvedTheme === "dark";
  const tk = isDark ? T.dark : T.light;

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPw, setShowPw]             = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);

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
    setTimeout(() => {
      const account = DEMO_ACCOUNTS.find(
        a => a.email === email.trim().toLowerCase() && a.password === password
      );
      if (!account) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
      const { password: _pw, ...user } = account;
      login(user);
      const firstNav = filterByRole(MAIN_NAV, user.role)[0];
      navigate(firstNav?.path ?? "/dashboard", { replace: true });
    }, 700);
  };

  const selectedAccount = DEMO_ACCOUNTS.find(a => a.email === selectedDemo);
  const canSubmit = !loading && !!email && !!password;

  return (
    <div className="min-h-screen flex flex-col overflow-hidden relative"
      style={{ background: tk.pageBg, transition: "background 0.3s" }}>

      {/* ── Animations ── */}
      <style>{`
        @keyframes lp-pulse  { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.35;transform:scale(.8);} }
        @keyframes lp-fadeup { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:none;} }
        @keyframes lp-scan   { 0%{transform:translateY(-100%);opacity:0;} 8%{opacity:1;} 92%{opacity:1;} 100%{transform:translateY(900%);opacity:0;} }
        @keyframes lp-orb    { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(18px,-14px) scale(1.04);} 66%{transform:translate(-10px,8px) scale(.97);} }
        @keyframes lp-blink  { 0%,100%{opacity:.2;} 50%{opacity:1;} }
        .lp-card  { animation: lp-fadeup .35s ease both; }
        .lp-feat  { animation: lp-fadeup .5s ease both; }
        .lp-feat:nth-child(1){ animation-delay:.08s; }
        .lp-feat:nth-child(2){ animation-delay:.18s; }
        .lp-feat:nth-child(3){ animation-delay:.28s; }
        .lp-feat:nth-child(4){ animation-delay:.38s; }
        .lp-nd1 { animation: lp-blink 2.2s ease infinite 0s;   }
        .lp-nd2 { animation: lp-blink 2.2s ease infinite .75s; }
        .lp-nd3 { animation: lp-blink 2.2s ease infinite 1.5s; }
        .lp-scan-anim { animation: lp-scan 7s ease-in-out infinite; }
        .lp-submit-active {
          background: linear-gradient(135deg,#6366f1,#8b5cf6) !important;
          box-shadow: 0 6px 20px rgba(99,102,241,.4) !important;
          color: #fff !important;
          border: none !important;
        }
        .lp-submit-active:hover:not(:disabled) {
          background: linear-gradient(135deg,#4f46e5,#7c3aed) !important;
          box-shadow: 0 8px 26px rgba(99,102,241,.5) !important;
        }
        @media (max-width: 767px) {
          .lp-left-panel { display: none !important; }
          .lp-right-panel { padding: 24px 20px !important; }
          .lp-mobile-brand { display: flex !important; }
        }
        @media (min-width: 768px) {
          .lp-mobile-brand { display: none !important; }
        }
      `}</style>

      {/* ── Floating orbs ── */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
        <div style={{ position:"absolute", width:560, height:560, borderRadius:"50%", background:`radial-gradient(circle,${tk.orbColor1} 0%,transparent 65%)`, top:-130, left:-90, animation:"lp-orb 13s ease-in-out infinite" }} />
        <div style={{ position:"absolute", width:380, height:380, borderRadius:"50%", background:`radial-gradient(circle,${tk.orbColor2} 0%,transparent 65%)`, bottom:-70, right:-70, animation:"lp-orb 16s ease-in-out infinite reverse" }} />
        <div style={{ position:"absolute", width:280, height:280, borderRadius:"50%", background:`radial-gradient(circle,${tk.orbColor3} 0%,transparent 65%)`, top:"38%", right:"14%", animation:"lp-orb 11s ease-in-out infinite 2.5s" }} />
      </div>

      {/* ── Neural dot grid ── */}
      <div style={{
        position:"fixed", inset:0, zIndex:0, pointerEvents:"none",
        backgroundImage:`radial-gradient(${tk.dotColor} 1px,transparent 1px)`,
        backgroundSize:"32px 32px",
        maskImage:"radial-gradient(ellipse 75% 75% at 50% 50%,black 30%,transparent 100%)",
        WebkitMaskImage:"radial-gradient(ellipse 75% 75% at 50% 50%,black 30%,transparent 100%)",
      }} />

      {/* ── HEADER ── */}
      <LoginHeader />

      {/* ── Main two-panel layout ── */}
      <div className="lp-card flex-1 grid grid-cols-1 md:grid-cols-2 relative overflow-hidden"
        style={{ zIndex:10, borderTop:`1px solid ${tk.cardBorder}` }}>

        {/* ════ LEFT PANEL ════ */}
        <div className="lp-left-panel relative flex flex-col justify-center overflow-hidden"
          style={{ background:tk.leftBg, borderRight:`1px solid ${tk.panelDivider}`, transition:"background 0.3s", padding:"0 64px" }}>

          {/* Inner dot-grid */}
          <div style={{
            position:"absolute", inset:0, pointerEvents:"none",
            backgroundImage:`linear-gradient(${tk.gridLine} 1px,transparent 1px),linear-gradient(90deg,${tk.gridLine} 1px,transparent 1px)`,
            backgroundSize:"40px 40px",
          }} />

          {/* Scan line */}
          <div className="lp-scan-anim" style={{ position:"absolute", left:0, right:0, height:2, background:tk.scanBeam, pointerEvents:"none" }} />

          {/* Neural node decorations */}
          <div style={{ position:"absolute", right:28, top:"30%", display:"flex", flexDirection:"column", gap:48, pointerEvents:"none" }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:28, height:1, background:tk.nodeLine }} />
                <div className={`lp-nd${i}`} style={{ width:7, height:7, borderRadius:"50%", background:"#6366f1", boxShadow:"0 0 8px rgba(99,102,241,.55)" }} />
              </div>
            ))}
          </div>

          {/* Content block */}
          <div className="relative" style={{ zIndex:1, maxWidth:480 }}>

            {/* Logo */}
            <div className="flex items-center gap-3" style={{ marginBottom:32 }}>
              <div className="w-10 h-10 rounded-[11px] flex items-center justify-center text-xl flex-shrink-0"
                style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow:"0 0 24px rgba(99,102,241,.45)" }}>
                ⚔
              </div>
              <div>
                <p className="text-[16px] font-extrabold tracking-tight" style={{ color:tk.heading }}>
                  Proton<span style={{ color:"#818cf8" }}>CRM</span>
                </p>
                <p className="text-[10px] tracking-widest uppercase" style={{ color:tk.muted }}>
                  Martial Arts Management
                </p>
              </div>
            </div>

            {/* AI badge */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:tk.aiBadgeBg, border:`1px solid ${tk.aiBadgeBorder}`, borderRadius:20, padding:"5px 14px", marginBottom:24 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#34d399", flexShrink:0, animation:"lp-pulse 2s ease-in-out infinite", boxShadow:"0 0 8px rgba(52,211,153,.55)" }} />
              <span style={{ fontSize:11, fontWeight:700, color:tk.badgeText, letterSpacing:"0.07em", textTransform:"uppercase" }}>
                AI-Powered CRM
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-extrabold leading-tight" style={{ fontSize:34, color:tk.headingAlt, letterSpacing:"-0.03em", marginBottom:14 }}>
              Manage every lead,<br />
              <span style={{ background:"linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                every belt earned.
              </span>
            </h1>

            <p style={{ fontSize:13, color:tk.sub, lineHeight:1.8, marginBottom:36 }}>
              A unified AI platform for your martial arts academy — from the first enquiry through trial, membership, and renewal.
            </p>

            {/* AI features */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {AI_FEATURES.map(f => (
                <div key={f.label} className="lp-feat" style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:tk.featIconBg, border:`1px solid ${tk.featIconBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0, color:"#818cf8" }}>
                    {f.icon}
                  </div>
                  <span style={{ fontSize:13, color:tk.featText }}>{f.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <p className="absolute bottom-6 left-16 text-[11px]" style={{ color:tk.copyright, zIndex:1 }}>
            © 2025 Dojo Martial Arts · All rights reserved
          </p>
        </div>

        {/* ════ RIGHT PANEL ════ */}
        <div className="lp-right-panel flex flex-col justify-center overflow-y-auto"
          style={{ background:tk.rightBg, padding:"72px 64px 48px", transition:"background 0.3s" }}>

          {/* Mobile-only brand */}
          <div className="lp-mobile-brand items-center gap-3" style={{ marginBottom:24 }}>
            <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg"
              style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              ⚔
            </div>
            <div>
              <p className="text-[15px] font-extrabold tracking-tight" style={{ color:tk.heading }}>
                Proton<span style={{ color:"#818cf8" }}>CRM</span>
              </p>
              <p className="text-[9px] tracking-widest uppercase" style={{ color:tk.muted }}>Martial Arts Management</p>
            </div>
          </div>

          <h2 className="font-extrabold mb-1" style={{ fontSize:22, color:tk.heading, letterSpacing:"-0.02em" }}>
            Sign in
          </h2>
          <p style={{ fontSize:13, color:tk.sub, marginBottom:24 }}>
            Select a demo account or enter credentials manually.
          </p>

          {/* Demo accounts */}
          <div style={{ marginBottom:20 }}>
            <p style={{ fontSize:10, fontWeight:700, color:tk.demoLabel, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>
              Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <DemoCard
                  key={acc.email} account={acc}
                  selected={selectedDemo === acc.email}
                  onSelect={() => fillDemo(acc)}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3" style={{ marginBottom:20 }}>
            <div style={{ flex:1, height:1, background:tk.divider }} />
            <span style={{ fontSize:11, color:tk.dividerTxt }}>or enter manually</span>
            <div style={{ flex:1, height:1, background:tk.divider }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AuthInput
              label="Email address" type="email" placeholder="you@dojo.com"
              value={email} onChange={v => { setEmail(v); setError(""); }} autoComplete="email"
            />
            <AuthInput
              label="Password" type={showPw ? "text" : "password"} placeholder="••••••••"
              value={password} onChange={v => { setPassword(v); setError(""); }}
              autoComplete="current-password"
              suffix={
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="text-secondary hover:text-primary transition-colors text-sm">
                  {showPw ? "🙈" : "👁"}
                </button>
              }
            />

            {/* Forgot credentials hint */}
            <p style={{ fontSize:11, color:tk.sub, textAlign:"right", marginTop:-8 }}>
              Forgot credentials?{" "}
              <button
                type="button"
                onClick={() => alert("IT Support: Contact your system administrator or call +91 98765 43210.")}
                style={{ background:"none", border:"none", padding:0, color:tk.itSupportText, fontWeight:600, cursor:"pointer", fontSize:11 }}
              >
                Contact IT Support
              </button>
            </p>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl danger-bg danger-border">
                <span className="text-sm">⚠</span>
                <span className="text-[12px] danger-text">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className={cn(
                "mt-1 py-3 rounded-xl text-[14px] font-bold transition-all duration-200",
                canSubmit ? "lp-submit-active" : ""
              )}
              style={canSubmit ? {} : {
                background: tk.submitDisabledBg,
                border:     `1px solid ${tk.submitDisabledBorder}`,
                color:      tk.sub,
                cursor:     "not-allowed",
                opacity:    0.7,
              }}
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
            <div className="mt-4 px-4 py-3 rounded-xl border" style={{
              background:  `${ROLE_META[selectedAccount.role].color}10`,
              borderColor: `${ROLE_META[selectedAccount.role].color}28`,
            }}>
              <p className="text-[11px] font-bold mb-0.5" style={{ color: ROLE_META[selectedAccount.role].color }}>
                {ROLE_META[selectedAccount.role].icon} {selectedAccount.role.replace("_"," ")} — {selectedAccount.name}
              </p>
              <p className="text-[11px] text-secondary">{ROLE_META[selectedAccount.role].desc}</p>
            </div>
          )}

          {/* Powered by Claude AI */}
          <div style={{ marginTop:20, paddingTop:16, borderTop:`1px solid ${tk.poweredBorder}`, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:"#6366f1", flexShrink:0, animation:"lp-pulse 2s ease-in-out infinite" }} />
            <span style={{ fontSize:11, color:tk.poweredBy }}>Powered by</span>
            <span style={{ fontSize:11, fontWeight:700, background:"linear-gradient(135deg,#6366f1,#a78bfa)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
              Proton AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};