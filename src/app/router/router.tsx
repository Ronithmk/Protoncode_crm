// ============================================================
// router/index.tsx
// React Router v6 nested route setup.
// ALL authenticated routes nest under MainLayout.
// Role protection is handled by a <ProtectedRoute> wrapper.
// ============================================================

import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import { MainLayout } from "../../app/layout/MainLayout";
import { useIsAuthenticated, useRole } from "../../store/useAuthStore";
import {
  MODULE_SIDEBAR,
  filterByRole,
  getModuleFromPath,
} from "../../config/navigationConfig";
import { LoginPage } from "../../features/auth/LoginPage";
import { UnauthorizedPage } from "../../features/auth/UnauthorizedPage";
import { AuthGuard } from "./AuthGuard";
import { RoleGuard } from "./RoleGuard";
import { DashboardOverview } from "../../features/dashboard/dashboard.index";
import { LeadsList, LeadsPipeline } from "../../features/leads/LeadsList";
import { LeadDetail } from "../../features/leads/LeadDetail";
import { ScheduleCalendar, TrialsPage } from "../../features/schedule/ScheduleCalendar";
import { LeadReportsPage, ReportsPage, SalesReportsPage, SourceAnalyticsPage, TrialConversionPage } from "../../features/reports/ReportsPage";
import { RolesPage, UsersListPage } from "../../features/users/UsersPage";
import { GeneralSettings, IntegrationsSettings, LeadStagesSettings, MetaAdsSettings, SecuritySettings, WhatsAppSettings } from "../../features/settings/SettingsPage";

// ─────────────────────────────────────────────
// PROTECTED ROUTE WRAPPER
// Checks authentication and role-based access before rendering the page.   
// If not authenticated, redirects to /login.
// If authenticated but unauthorized, redirects to /unauthorized.
// ─────────────────────────────────────────────
const RootRedirect = () => {
  const isAuthenticated = useIsAuthenticated();

  return (
    <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
  );
};

// ─────────────────────────────────────────────
// PLACEHOLDER PAGE — used for all route pages
// In production: replace with real feature components
// ─────────────────────────────────────────────
const PlaceholderPage = ({
  title,
  description,
}: {
  title: string;
  description?: string;
}) => {
  const role = useRole();
  const location = useLocation();
  const activeModule = getModuleFromPath(location.pathname);
  const sidebarItems = filterByRole(MODULE_SIDEBAR[activeModule] ?? [], role);

  return (
    <div className="p-8 max-w-4xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        {description && (
          <p className="mt-1 text-[14px] text-[#7a8db8]">{description}</p>
        )}
      </div>

      {/* Route info card (dev utility) */}
      <div className="bg-[#0d1526] border border-[#1e2f52] rounded-xl p-5 mb-6">
        <p className="text-[11px] text-[#4a5a7a] font-semibold uppercase tracking-wider mb-3">
          Current Route Context
        </p>
        <div className="space-y-1.5">
          <div className="flex gap-3">
            <span className="text-[12px] text-[#4a5a7a] w-28">Pathname</span>
            <span className="text-[12px] text-indigo-400 font-mono">{location.pathname}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[12px] text-[#4a5a7a] w-28">Active Module</span>
            <span className="text-[12px] text-emerald-400 font-mono">{activeModule}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[12px] text-[#4a5a7a] w-28">Your Role</span>
            <span className="text-[12px] text-amber-400 font-mono">{role}</span>
          </div>
          <div className="flex gap-3">
            <span className="text-[12px] text-[#4a5a7a] w-28">Sidebar Items</span>
            <span className="text-[12px] text-white font-mono">
              {sidebarItems.map((i) => i.label).join(", ") || "None"}
            </span>
          </div>
        </div>
      </div>

      {/* Dummy content grid */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[#0d1526] border border-[#1e2f52] rounded-xl p-5 hover:border-[#2d4a80] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 mb-3" />
            <div className="h-3 bg-[#1e2f52] rounded w-3/4 mb-2" />
            <div className="h-2.5 bg-[#1e2f52] rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// ROUTER DEFINITION
// ─────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    // Root redirect
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    // All authenticated routes nest under MainLayout
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      // ── Dashboard ──────────────────────────────
      {
        path: "/dashboard",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN", "CENTER_MANAGER", "SALES_MANAGER", "RM","FM","TRAINING_MANAGER","HR"]}>
            <DashboardOverview />
          </RoleGuard >
        ),
      },
      {
        path: "/dashboard/tasks",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN", "CENTER_MANAGER", "SALES_MANAGER", "RM","FM","TRAINING_MANAGER"]}>
            <PlaceholderPage title="My Tasks" description="Pending actions assigned to you." />
          </RoleGuard >
        ),
      },
      {
        path: "/dashboard/notifications",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN", "CENTER_MANAGER", "SALES_MANAGER", "RM","FM","TRAINING_MANAGER","HR"]}>
            <PlaceholderPage title="Notifications" />
          </RoleGuard >
        ),
      },

      // ── Leads ──────────────────────────────────
      {
        path: "/leads",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN", "CENTER_MANAGER", "SALES_MANAGER", "RM"]}>
           <LeadsList /> 
          </RoleGuard >
        ),
      },
      {
        path: "/leads/:id",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN","RM"]}>
           <LeadDetail /> 
          </RoleGuard >
        ),
      },
      {
        path: "/leads/mine",
        element: (
          <RoleGuard  allowedRoles={["RM","SUPER_ADMIN"]}>
            <PlaceholderPage title="My Leads" description="Leads assigned to you." />
          </RoleGuard >
        ),
      },
      {
        path: "/leads/pipeline",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN","RM"]}>
            <LeadsPipeline />
          </RoleGuard >
        ),
      },
      {
        path: "/leads/sources",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN"]}>
            <PlaceholderPage title="Lead Sources" />
          </RoleGuard >
        ),
      },
      {
        path: "/leads/import",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN", "CENTER_MANAGER"]}>
            <PlaceholderPage title="Import Leads" />
          </RoleGuard >
        ),
      },

      // ── Schedule ───────────────────────────────
      {
        path: "/schedule",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN","RM","TRAINING_MANAGER", "CENTER_MANAGER"]}>
            <ScheduleCalendar />
          </RoleGuard >
        ),
      },
      {
        path: "/schedule/trials",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN","RM","TRAINING_MANAGER", "CENTER_MANAGER"]}>
            <TrialsPage />
          </RoleGuard >
        ),
      },
      {
        path: "/schedule/followups",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN", "CENTER_MANAGER", "RM"]}>
            <PlaceholderPage title="Follow-ups" />
          </RoleGuard >
        ),
      },
      {
        path: "/schedule/batches",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN", "CENTER_MANAGER", "TRAINING_MANAGER"]}>
            <PlaceholderPage title="Batch Schedule" />
          </RoleGuard >
        ),
      },

      // ── Renewals ───────────────────────────────
      {
        path: "/renewals",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN","FM", "CENTER_MANAGER"]}>
            <PlaceholderPage title="Due Renewals" />
          </RoleGuard >
        ),
      },
      {
        path: "/renewals/completed",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN","FM", "CENTER_MANAGER"]}>
            <PlaceholderPage title="Renewed Members" />
          </RoleGuard >
        ),
      },
      {
        path: "/renewals/lapsed",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN","FM", "CENTER_MANAGER"]}>
            <PlaceholderPage title="Lapsed Members" />
          </RoleGuard >
        ),
      },
      {
        path: "/renewals/revenue",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","FM"]}>
            <PlaceholderPage title="Revenue Summary" />
          </RoleGuard >
        ),
      },

      // ── Reports ────────────────────────────────
      {
        path: "/reports",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN","FM", "CENTER_MANAGER", "SALES_MANAGER", "TRAINING_MANAGER"]}>
            <ReportsPage /> 
          </RoleGuard >
        ),
      },
      {
        path: "/reports/leads",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN","FM", "CENTER_MANAGER", "SALES_MANAGER"]}>
            <LeadReportsPage /> 
          </RoleGuard >
        ),
      },
      {
        path: "/reports/sales",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN","FM", "CENTER_MANAGER", "SALES_MANAGER"]}>
            <SalesReportsPage />
          </RoleGuard >
        ),
      },
      {
        path: "/reports/trials",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN","TRAINING_MANAGER", "CENTER_MANAGER"]}>
            <TrialConversionPage />
          </RoleGuard >
        ),
      },
      {
        path: "/reports/sources",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN", "CENTER_MANAGER", "SALES_MANAGER"]}>
            <SourceAnalyticsPage />
          </RoleGuard >
        ),
      },

      // ── Users ──────────────────────────────────
      {
        path: "/users",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN", "CENTER_MANAGER"]}>
            <UsersListPage />
          </RoleGuard >
        ),
      },
      {
        path: "/users/roles",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN"]}>
            <RolesPage />
          </RoleGuard >
        ),
      },
      {
        path: "/users/invite",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN", "CENTER_MANAGER"]}>
            <PlaceholderPage title="Invite User" />
          </RoleGuard >
        ),
      },
      {
        path: "/users/activity",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN"]}>
            <PlaceholderPage title="Activity Log" />
          </RoleGuard >
        ),
      },

      // ── Settings ───────────────────────────────
      {
        path: "/settings",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN", "CENTER_MANAGER"]}>
            <GeneralSettings />
          </RoleGuard >
        ),
      },
      {
        path: "/settings/security",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN"]}>
            <SecuritySettings />
          </RoleGuard >
        ),
      },
      {
        path: "/settings/integrations",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN"]}>
            <IntegrationsSettings />
          </RoleGuard >
        ),
      },
      {
        path: "/settings/whatsapp",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN", "CENTER_MANAGER"]}>
            <WhatsAppSettings />
          </RoleGuard >
        ),
      },
      {
        path: "/settings/meta",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN","ADMIN"]}>
            <MetaAdsSettings />
          </RoleGuard >
        ),
      },
      {
        path: "/settings/stages",
        element: (
          <RoleGuard  allowedRoles={["SUPER_ADMIN"]}>
            <LeadStagesSettings />
          </RoleGuard >
        ),
      },
    ],
  },
]);
