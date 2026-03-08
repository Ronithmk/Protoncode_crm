// ============================================================
// components/layout/Header.tsx  (UPDATED)
// Top-level module navigation bar.
//
// Changes from v1:
//  - Dev role switcher REMOVED — role is now session-owned
//  - User menu added: name, email, centre, role chip, logout
//  - useLogout() + navigate("/login") on sign-out
// ============================================================

import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../../utils/cn";
import {
  MAIN_NAV,
  filterByRole,
  getModuleFromPath,
} from "../../config/navigationConfig";
import { useRole, useUser, useLogout } from "../../store/useAuthStore";
import type { Role } from "../../config/navigationConfig";
import { useThemeStore } from "../../store/useThemeStore";

// ─── ROLE COLOURS ────────────────────────────────────────
const ROLE_COLORS: Record<Role, { text: string; bg: string; border: string }> = {
  SUPER_ADMIN:      { text:"text-indigo-400",  bg:"bg-indigo-500/10",  border:"border-indigo-500/20" },
  ADMIN:            { text:"text-violet-400",  bg:"bg-violet-500/10",  border:"border-violet-500/20" },
  CENTER_MANAGER:   { text:"text-cyan-400",    bg:"bg-cyan-500/10",    border:"border-cyan-500/20" },
  SALES_MANAGER:    { text:"text-orange-400",  bg:"bg-orange-500/10",  border:"border-orange-500/20" },
  RM:               { text:"text-emerald-400", bg:"bg-emerald-500/10", border:"border-emerald-500/20" },
  FM:               { text:"text-amber-400",   bg:"bg-amber-500/10",   border:"border-amber-500/20" },
  TRAINING_MANAGER: { text:"text-pink-400",    bg:"bg-pink-500/10",    border:"border-pink-500/20" },
  HR:               { text:"text-slate-400",   bg:"bg-slate-500/10",   border:"border-slate-500/20" },
};

// ─── USER DROPDOWN MENU ──────────────────────────────────
const UserMenu = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const user = useUser();
  const role = useRole();
  const logout = useLogout();
  const navigate = useNavigate();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open || !user) return null;

  const roleStyle = ROLE_COLORS[role];
  const initials = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    onClose();
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div
      ref={ref}
      className="absolute top-[calc(100%+6px)] right-0 w-56 bg-card border border-theme rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
    >
      {/* Profile block */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-theme">
        <div className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0",
          "bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-indigo-500/30 text-indigo-300"
        )}>
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-primary truncate">{user.name}</p>
          <p className="text-[11px] text-secondary truncate">{user.email}</p>
        </div>
      </div>

      {/* Role + centre */}
      <div className="px-4 py-2.5 border-b border-theme">
        <div className="flex items-center justify-between">
          <span className={cn(
            "text-[10px] font-bold px-2.5 py-0.5 rounded-full border",
            roleStyle.text, roleStyle.bg, roleStyle.border
          )}>
            {role.replace("_", " ")}
          </span>
          <span className="text-[11px] text-secondary">{user.center}</span>
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        {[
          { icon:"◎",  label:"My Profile" },
          { icon:"⚙",  label:"Account Settings" },
        ].map(item => (
          <button
            key={item.label}
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[12px] text-secondary hover:text-primary hover:bg-white/[0.04] transition-colors text-left"
          >
            <span className="text-[13px]">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="h-px bg-theme" />

      {/* Sign out */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-3 px-4 py-3 text-[12px] text-red-400 hover:bg-red-500/5 transition-colors text-left"
      >
        <span className="text-[13px]">→</span>
        Sign out
      </button>
    </div>
  );
};

// ─── HEADER ──────────────────────────────────────────────
export const Header = () => {
  const role = useRole();
  const user = useUser();
  const location = useLocation();
  
  const { resolvedTheme, setTheme } = useThemeStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const activeModule = getModuleFromPath(location.pathname);
  const visibleNav = filterByRole(MAIN_NAV, role);

  const roleStyle = ROLE_COLORS[role];
  const initials = user?.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() ?? "??";

  return (
    <header className="h-14 bg-card border-b border-theme flex items-center px-4 gap-2 flex-shrink-0 z-20 relative">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-4 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-primary shadow-lg shadow-indigo-500/30">
          ⚔
        </div>
        <span className="text-[13px] font-bold text-primary tracking-tight hidden sm:block">
          Proton<span className="text-indigo-400">CRM</span>
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-5 border-divider mr-2 flex-shrink-0" />

      {/* Main nav tabs */}
      <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto">
        {visibleNav.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium",
                "whitespace-nowrap transition-all duration-150 select-none",
                "text-secondary hover:text-primary hover-theme",
                isActive && [
                  "text-primary",
                  "bg-surface",
                  "after:absolute after:bottom-[2px] after:left-3 after:right-3",
                  "after:h-0.5 after:rounded-full after:bg-[var(--primary-color)]",
                ]
              )}
            >
              {item.label}
              {item.badge && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-semibold leading-none">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-surface border border-theme rounded-lg px-3 py-1.5 w-44 hover-theme transition-colors">
          <svg className="w-3.5 h-3.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-[12px] text-primary placeholder:text-secondary outline-none w-full"
          />
          <span className="text-secondary text-[10px] font-mono">⌘K</span>
        </div>

        {/* Role chip — display only, not clickable */}
        <div className={cn(
          "hidden lg:flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border",
          roleStyle.text, roleStyle.bg, roleStyle.border
        )}>
          {role?.replace("_", " ")}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
          className="w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-primary hover:bg-white/5 transition-colors"
        >
          {resolvedTheme === "dark" ? (
            // Sun icon
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"
              />
            </svg>
          ) : (
            // Moon icon
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M21 12.79A9 9 0 1111.21 3c0 .34.02.67.05 1A7 7 0 0021 12.79z"
              />
            </svg>
          )}
        </button>

        {/* Notification bell */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-secondary hover:text-primary hover-theme transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </button>

        {/* User avatar + menu trigger */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(p => !p)}
            className={cn(
              "flex items-center gap-2 px-2 py-1 rounded-lg border transition-all duration-150 cursor-pointer",
               menuOpen
                ? "bg-surface border-theme"
                : "bg-surface border-theme hover-theme"
            )}
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500/40 to-violet-500/40 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-[10px] font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-[11px] font-semibold text-primary leading-none">
                {user?.name.split(" ")[0]}
              </p>
              <p className="text-[9px] text-secondary leading-none mt-0.5">
                {user?.center}
              </p>
            </div>
            <svg
              className={cn("w-3 h-3 text-secondary transition-transform", menuOpen && "rotate-180")}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <UserMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </div>
      </div>
    </header>
  );
};
