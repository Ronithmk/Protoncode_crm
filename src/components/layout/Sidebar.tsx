// ============================================================
// components/layout/Sidebar.tsx
// Dynamic sidebar — reads active module from URL, loads the
// correct sidebar config, and filters items by role.
// No role checks in JSX. Pure config-driven rendering.
// ============================================================

import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import {
  MODULE_SIDEBAR,
  filterByRole,
  getModuleFromPath,
  MAIN_NAV,
} from "../../config/navigationConfig";
import { useRole } from "../../store/useAuthStore";

// ─────────────────────────────────────────────
// Icon map — maps string icon names to SVG elements
// In production: import from lucide-react directly
// ─────────────────────────────────────────────
const IconMap: Record<string, React.FC<{ className?: string }>> = {
  LayoutDashboard: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    </svg>
  ),
  CheckSquare: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Bell: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Users: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  UserCircle: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Workflow: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
    </svg>
  ),
  GitBranch: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Upload: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  CalendarDays: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Dumbbell: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  PhoneCall: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  ListOrdered: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  AlertCircle: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CheckCircle2: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  UserX: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 10h-6" />
    </svg>
  ),
  IndianRupee: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7H17M17 12H9.5a3.5 3.5 0 010-7" />
    </svg>
  ),
  TrendingUp: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  DollarSign: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <line x1="12" y1="1" x2="12" y2="23" strokeLinecap="round" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" strokeLinecap="round" />
    </svg>
  ),
  Target: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  PieChart: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
  ),
  UserCog: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  ShieldCheck: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  UserPlus: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zM22 11h-6m3-3v6" />
    </svg>
  ),
  Activity: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Settings2: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Lock: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Plug: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12H3m2 0a9 9 0 1018 0 9 9 0 00-18 0zm14 0h2M8 12h8" />
    </svg>
  ),
  MessageCircle: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Megaphone: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  Layers: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  RefreshCcw: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M1 4v6h6M23 20v-6h-6" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" />
    </svg>
  ),
  BarChart3: ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M18 9v9M14 5v13M10 11v7M6 15v5" />
    </svg>
  ),
};

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const Component = IconMap[name];
  return Component ? <Component className={className} /> : <span className={className}>·</span>;
};

// ─────────────────────────────────────────────
// MODULE LABEL MAP — shown as section title in sidebar
// ─────────────────────────────────────────────
const MODULE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  leads: "Leads",
  schedule: "Schedule",
  renewals: "Renewals",
  reports: "Reports",
  users: "Users",
  settings: "Settings",
};

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const role = useRole();
  const location = useLocation();

  const activeModule = getModuleFromPath(location.pathname);
  const rawItems = MODULE_SIDEBAR[activeModule] ?? [];
  const sidebarItems = filterByRole(rawItems, role);

  // Derive the parent nav item label for the section header
  const moduleLabel = MODULE_LABELS[activeModule] ?? activeModule;

  // Also show quick-jump to all allowed modules (collapsed mini nav)
 // const allModules = filterByRole(MAIN_NAV, role);

  return (
    <aside
      className={cn(
        "flex flex-col flex-shrink-0 bg-surface border-r border-theme",
        "transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "overflow-hidden z-10",
        collapsed ? "w-[52px]" : "w-[220px]"
      )}
      style={{ minHeight: "100%" }}
    >
      {/* Section label */}
      <div
        className={cn(
          "flex items-center gap-2.5 border-b border-theme",
          "transition-all duration-200",
          collapsed ? "px-0 py-3.5 justify-center" : "px-4 py-3.5"
        )}
      >
        {!collapsed && (
          <span className="text-[11px] font-semibold text-secondary tracking-widest uppercase">
            {moduleLabel}
          </span>
        )}
        {collapsed && (
          <div className="w-6 h-6 rounded-md bg-indigo-500/10 flex items-center justify-center">
            <Icon
              name={MAIN_NAV.find((n) => n.id === activeModule)?.icon ?? "LayoutDashboard"}
              className="w-3.5 h-3.5 text-indigo-400"
            />
          </div>
        )}
      </div>

      {/* Sidebar items */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5 overflow-y-auto">
        {sidebarItems.map((item) => {
          // Exact match for root paths, prefix match for sub-paths
          const isActive =
            item.path === `/${activeModule}`
              ? location.pathname === item.path || location.pathname === item.path + "/"
              : location.pathname.startsWith(item.path);

          return (
            <div key={item.id}>
              {item.dividerBefore && !collapsed && (
                <div className="my-2 h-px bg-theme opacity-20 mx-2" />
              )}
              {item.dividerBefore && collapsed && <div className="my-2 h-px bg-theme opacity-20" />}

              <NavLink
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center rounded-lg transition-all duration-150 group",
                  "text-[13px] font-medium select-none",
                  collapsed ? "px-0 py-2 justify-center" : "gap-2.5 px-3 py-2",
                  isActive
                    ? "bg-card text-primary"
                    : "text-secondary hover:text-primary hover-theme"
                )}
              >
                {/* Active indicator bar */}
                {!collapsed && (
                  <span
                    className={cn(
                      "w-0.5 h-4 rounded-full flex-shrink-0 transition-all",
                      isActive ? "bg-indigo-500" : "bg-transparent"
                    )}
                  />
                )}

                <Icon
                  name={item.icon}
                  className={cn(
                    "flex-shrink-0 transition-colors",
                    collapsed ? "w-4.5 h-4.5" : "w-4 h-4",
                    isActive ? "text-indigo-400" : "text-current"
                  )}
                />

                {!collapsed && (
                  <span className="truncate leading-none">{item.label}</span>
                )}
              </NavLink>
            </div>
          );
        })}

        {sidebarItems.length === 0 && (
          <div className={cn("py-6 text-center", collapsed ? "hidden" : "block")}>
            <p className="text-[11px] text-secondary">No items available</p>
          </div>
        )}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggle}
        className={cn(
          "flex items-center gap-2 mx-2 mb-3 px-3 py-2 rounded-lg",
          "text-secondary hover:text-primary hover-theme",
          "text-[11px] font-medium transition-all duration-150 border border-transparent hover:border-theme",
          collapsed ? "justify-center px-0" : ""
        )}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          className={cn("w-3.5 h-3.5 transition-transform duration-200", collapsed ? "rotate-180" : "")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        {!collapsed && <span>Collapse</span>}
      </button>
    </aside>
  );
};
