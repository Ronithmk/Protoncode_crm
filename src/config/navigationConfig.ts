// ============================================================
// navigationConfig.ts
// Single source of truth for all navigation + RBAC rules.
// No role checks should ever be scattered in JSX.
// ============================================================

export type Role =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "CENTER_MANAGER"
  | "SALES_MANAGER"
  | "RM"
  | "FM"
  | "TRAINING_MANAGER"
  | "HR";

export type NavItem = {
  id: string;
  label: string;
  path: string;
  icon: string;          // lucide-react icon name (string reference)
  roles: Role[];         // which roles can see this item
  badge?: string;        // optional badge text e.g. "New"
};

export type SidebarItem = {
  id: string;
  label: string;
  path: string;          // relative to parent module path
  icon: string;
  roles: Role[];
  dividerBefore?: boolean;
};

export type ModuleSidebarMap = {
  [moduleId: string]: SidebarItem[];
};

// ─────────────────────────────────────────────
// ALL ROLES — convenience constant
// ─────────────────────────────────────────────
const ALL_ROLES: Role[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "CENTER_MANAGER",
  "SALES_MANAGER",
  "RM",
  "FM",
  "TRAINING_MANAGER",
  "HR",
];

// ─────────────────────────────────────────────
// MAIN HEADER NAVIGATION
// Top-level modules shown in the header.
// ─────────────────────────────────────────────
export const MAIN_NAV: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: "LayoutDashboard",
    roles: ALL_ROLES,
  },
  {
    id: "leads",
    label: "Leads",
    path: "/leads",
    icon: "Users",
    roles: ["SUPER_ADMIN", "CENTER_MANAGER", "SALES_MANAGER", "ADMIN", "RM"],
  },
  {
    id: "schedule",
    label: "Schedule",
    path: "/schedule",
    icon: "CalendarDays",
    roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "RM", "TRAINING_MANAGER"],
  },
  {
    id: "renewals",
    label: "Renewals",
    path: "/renewals",
    icon: "RefreshCcw",
    roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "FM"],
  },
  {
    id: "reports",
    label: "Reports",
    path: "/reports",
    icon: "BarChart3",
    roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "SALES_MANAGER", "FM", "TRAINING_MANAGER"],
  },
  {
    id: "users",
    label: "Users",
    path: "/users",
    icon: "UserCog",  
    roles: ["SUPER_ADMIN", "CENTER_MANAGER"], // CENTER_MANAGER: own centre staff only
  },
  {
    id: "settings",
    label: "Settings",
    path: "/settings",
    icon: "Settings2",
    roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER"],
  },
];

// ─────────────────────────────────────────────
// MODULE SIDEBAR MAP
// Each top-level module maps to its own sidebar items.
// paths here are FULL paths (for React Router matching).
// ─────────────────────────────────────────────
export const MODULE_SIDEBAR: ModuleSidebarMap = {
  dashboard: [
    {
      id: "overview",
      label: "Overview",
      path: "/dashboard",
      icon: "LayoutDashboard",
      roles: ALL_ROLES,
    },
    {
      id: "my-tasks",
      label: "My Tasks",
      path: "/dashboard/tasks",
      icon: "CheckSquare",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "SALES_MANAGER", "RM", "FM", "TRAINING_MANAGER"],
    },
    {
      id: "notifications",
      label: "Notifications",
      path: "/dashboard/notifications",
      icon: "Bell",
      roles: ALL_ROLES,
    },
  ],

  leads: [
    {
      id: "all-leads",
      label: "All Leads",
      path: "/leads",
      icon: "Users",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "SALES_MANAGER", "RM"],
    },
    {
      id: "my-leads",
      label: "My Leads",
      path: "/leads/mine",
      icon: "UserCircle",
      roles: ["RM"],
    },
    {
      id: "pipeline",
      label: "Pipeline",
      path: "/leads/pipeline",
      icon: "Workflow",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "SALES_MANAGER", "RM"],
    },
    {
      id: "lead-sources",
      label: "Lead Sources",
      path: "/leads/sources",
      icon: "GitBranch",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "SALES_MANAGER"],
      dividerBefore: true,
    },
    {
      id: "import",
      label: "Import Leads",
      path: "/leads/import",
      icon: "Upload",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER"],
    },
  ],

  schedule: [
    {
      id: "calendar",
      label: "Calendar",
      path: "/schedule",
      icon: "CalendarDays",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "RM", "TRAINING_MANAGER"],
    },
    {
      id: "trials",
      label: "Trials",
      path: "/schedule/trials",
      icon: "Dumbbell",
      roles: ["SUPER_ADMIN", "ADMIN","CENTER_MANAGER", "RM", "TRAINING_MANAGER"],
    },
    {
      id: "followups",
      label: "Follow-ups",
      path: "/schedule/followups",
      icon: "PhoneCall",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "RM"],
    },
    {
      id: "batch-schedule",
      label: "Batch Schedule",
      path: "/schedule/batches",
      icon: "ListOrdered",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "TRAINING_MANAGER"],
      dividerBefore: true,
    },
  ],

  renewals: [
    {
      id: "due-renewals",
      label: "Due Renewals",
      path: "/renewals",
      icon: "AlertCircle",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "FM"],
    },
    {
      id: "renewed",
      label: "Renewed",
      path: "/renewals/completed",
      icon: "CheckCircle2",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "FM"],
    },
    {
      id: "lapsed",
      label: "Lapsed Members",
      path: "/renewals/lapsed",
      icon: "UserX",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "FM"],
    },
    {
      id: "revenue",
      label: "Revenue Summary",
      path: "/renewals/revenue",
      icon: "IndianRupee",
      roles: ["SUPER_ADMIN", "CENTER_MANAGER", "FM"],
      dividerBefore: true,
    },
  ],

  reports: [
    {
      id: "lead-reports",
      label: "Lead Reports",
      path: "/reports/leads",
      icon: "TrendingUp",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "SALES_MANAGER", "FM"],
    },
    {
      id: "sales-reports",
      label: "Sales Reports",
      path: "/reports/sales",
      icon: "DollarSign",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "SALES_MANAGER", "FM"],
    },
    {
      id: "trial-conversion",
      label: "Trial Conversion",
      path: "/reports/trials",
      icon: "Target",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "TRAINING_MANAGER"],
    },
    {
      id: "source-analytics",
      label: "Source Analytics",
      path: "/reports/sources",
      icon: "PieChart",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER", "SALES_MANAGER"],
      dividerBefore: true,
    },
  ],

  users: [
    {
      id: "all-users",
      label: "All Users",
      path: "/users",
      icon: "Users",
      roles: ["SUPER_ADMIN", "CENTER_MANAGER"], // CENTER_MANAGER sees own-centre staff only
    },
    {
      id: "roles",
      label: "Roles & Permissions",
      path: "/users/roles",
      icon: "ShieldCheck",
      roles: ["SUPER_ADMIN"],
    },
    {
      id: "invite",
      label: "Invite User",
      path: "/users/invite",
      icon: "UserPlus",
      roles: ["SUPER_ADMIN", "CENTER_MANAGER"],
    },
    {
      id: "activity-log",
      label: "Activity Log",
      path: "/users/activity",
      icon: "Activity",
      roles: ["SUPER_ADMIN"],
      dividerBefore: true,
    },
  ],

  settings: [
    {
      id: "general",
      label: "General",
      path: "/settings",
      icon: "Settings2",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER"],
    },
    {
      id: "security",
      label: "Security",
      path: "/settings/security",
      icon: "Lock",
      roles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      id: "integrations",
      label: "Integrations",
      path: "/settings/integrations",
      icon: "Plug",
      roles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      path: "/settings/whatsapp",
      icon: "MessageCircle",
      roles: ["SUPER_ADMIN", "ADMIN", "CENTER_MANAGER"],
      dividerBefore: true,
    },
    {
      id: "meta-ads",
      label: "Meta Ads",
      path: "/settings/meta",
      icon: "Megaphone",
      roles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
      id: "lead-stages",
      label: "Lead Stages",
      path: "/settings/stages",
      icon: "Layers",
      roles: ["SUPER_ADMIN"],
      dividerBefore: true,
    },
  ],
};

// ─────────────────────────────────────────────
// UTILITY: filter nav items for a given role
// ─────────────────────────────────────────────
export const filterByRole = <T extends { roles: Role[] }>(
  items: T[],
  role: Role
): T[] => items.filter((item) => item.roles.includes(role));

// ─────────────────────────────────────────────
// UTILITY: resolve active module id from pathname
// e.g. "/leads/mine" → "leads"
// ─────────────────────────────────────────────
export const getModuleFromPath = (pathname: string): string => {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment ?? "dashboard";
};
