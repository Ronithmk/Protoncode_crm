import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import {
  MAIN_NAV,
  filterByRole,
  getModuleFromPath,
} from "../../config/navigationConfig";
import { useRole, useSetRole, useUser } from "../../store/useAuthStore";
import type { Role } from "../../config/navigationConfig";

const ALL_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "RM",
  "FM",
  "TRAINING_MANAGER",
  "HR",
];

const ROLE_COLORS: Record<Role, string> = {
  SUPER_ADMIN: "text-indigo-400",
  ADMIN: "text-violet-400",
  RM: "text-emerald-400",
  FM: "text-amber-400",
  TRAINING_MANAGER: "text-pink-400",
  HR: "text-slate-400",
};

export const Header = () => {
  const role = useRole();
  const user = useUser();
  const setRole = useSetRole();
  const location = useLocation();

  const activeModule = getModuleFromPath(location.pathname);
  const visibleNav = filterByRole(MAIN_NAV, role);

  return (
   <header className="h-16 bg-surface border-b border-theme flex items-center px-4 gap-2 flex-shrink-0 z-20">

      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-4 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/30">
          ⚔
        </div>
        <span className="text-[13px] font-bold text-theme tracking-tight hidden sm:block">
          Proton<span className="text-indigo-500">CRM</span>
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-5 bg-theme opacity-20 mr-2 flex-shrink-0" />

      {/* Main navigation */}
      <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-none">
        {visibleNav.map((item) => {
          const isActive = activeModule === item.id;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium",
                "whitespace-nowrap transition-all duration-150 select-none",
                "text-muted hover:text-theme hover-theme",
                isActive && "text-theme bg-card border-b-2 border-indigo-500"
              )}
            >
              {item.label}
              {item.badge && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-500 text-[10px] font-semibold leading-none">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Right section */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-card border border-theme rounded-lg px-3 py-1.5 w-44 hover:border-indigo-500 transition-colors">
          <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-[12px] text-theme placeholder:text-muted outline-none w-full"
          />
          <span className="text-muted text-[10px] font-mono">⌘K</span>
        </div>

        {/* Role switcher */}
        <div className="flex items-center gap-1.5 bg-card border border-theme rounded-lg px-2 py-1.5">
          <span className="text-[10px] text-muted font-medium hidden lg:block">
            Role:
          </span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className={cn(
              "bg-transparent text-[11px] font-semibold outline-none cursor-pointer text-theme"
            )}
          >
            {ALL_ROLES.map((r) => (
              <option key={r} value={r} className="bg-surface text-theme">
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-theme hover-theme transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500/40 to-violet-500/40 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-[11px] font-bold">
            {user?.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div className="hidden lg:block">
            <p className="text-[12px] font-semibold text-theme leading-none">
              {user?.name.split(" ")[0]}
            </p>
            <p className="text-[10px] font-medium leading-none mt-0.5 text-muted">
              {role}
            </p>
          </div>
        </div>

      </div>
    </header>
  );
};
