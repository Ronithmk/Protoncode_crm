// ============================================================
// router/index.tsx
// React Router v6 nested route setup.
// ALL authenticated routes nest under MainLayout.
// Role protection is handled by a <ProtectedRoute> wrapper.
// ============================================================

import { createBrowserRouter, Navigate, useLocation } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { useRole } from "../store/useAuthStore";
import {
  MAIN_NAV,
  MODULE_SIDEBAR,
  filterByRole,
  getModuleFromPath,
} from "../config/navigationConfig";
import type { Role } from "../config/navigationConfig";

// ─────────────────────────────────────────────
// ROUTE GUARD — redirects if role lacks access
// ─────────────────────────────────────────────
const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) => {
  const role = useRole();
  const location = useLocation();

  if (!allowedRoles.includes(role)) {
    // Redirect to the first accessible route for this role
    const firstNav = filterByRole(MAIN_NAV, role)[0];
    return <Navigate to={firstNav?.path ?? "/dashboard"} replace />;
  }

  return <>{children}</>;
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
    element: <Navigate to="/dashboard" replace />,
  },
  {
    // All authenticated routes nest under MainLayout
    element: <MainLayout />,
    children: [
      // ── Dashboard ──────────────────────────────
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","RM","FM","TRAINING_MANAGER","HR"]}>
            <PlaceholderPage title="Dashboard Overview" description="Your command center." />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/tasks",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","RM","FM","TRAINING_MANAGER"]}>
            <PlaceholderPage title="My Tasks" description="Pending actions assigned to you." />
          </ProtectedRoute>
        ),
      },
      {
        path: "/dashboard/notifications",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","RM","FM","TRAINING_MANAGER","HR"]}>
            <PlaceholderPage title="Notifications" />
          </ProtectedRoute>
        ),
      },

      // ── Leads ──────────────────────────────────
      {
        path: "/leads",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","RM"]}>
            <PlaceholderPage title="All Leads" description="Full leads database." />
          </ProtectedRoute>
        ),
      },
      {
        path: "/leads/mine",
        element: (
          <ProtectedRoute allowedRoles={["RM","SUPER_ADMIN"]}>
            <PlaceholderPage title="My Leads" description="Leads assigned to you." />
          </ProtectedRoute>
        ),
      },
      {
        path: "/leads/pipeline",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","RM"]}>
            <PlaceholderPage title="Pipeline" description="Kanban-style lifecycle view." />
          </ProtectedRoute>
        ),
      },
      {
        path: "/leads/sources",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN"]}>
            <PlaceholderPage title="Lead Sources" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/leads/import",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN"]}>
            <PlaceholderPage title="Import Leads" />
          </ProtectedRoute>
        ),
      },

      // ── Schedule ───────────────────────────────
      {
        path: "/schedule",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","RM","TRAINING_MANAGER"]}>
            <PlaceholderPage title="Calendar" description="Schedule and appointments." />
          </ProtectedRoute>
        ),
      },
      {
        path: "/schedule/trials",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","RM","TRAINING_MANAGER"]}>
            <PlaceholderPage title="Trials" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/schedule/followups",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","RM"]}>
            <PlaceholderPage title="Follow-ups" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/schedule/batches",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","TRAINING_MANAGER"]}>
            <PlaceholderPage title="Batch Schedule" />
          </ProtectedRoute>
        ),
      },

      // ── Renewals ───────────────────────────────
      {
        path: "/renewals",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","FM"]}>
            <PlaceholderPage title="Due Renewals" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/renewals/completed",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","FM"]}>
            <PlaceholderPage title="Renewed Members" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/renewals/lapsed",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","FM"]}>
            <PlaceholderPage title="Lapsed Members" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/renewals/revenue",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","FM"]}>
            <PlaceholderPage title="Revenue Summary" />
          </ProtectedRoute>
        ),
      },

      // ── Reports ────────────────────────────────
      {
        path: "/reports/leads",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","FM"]}>
            <PlaceholderPage title="Lead Reports" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/reports/sales",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","FM"]}>
            <PlaceholderPage title="Sales Reports" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/reports/trials",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN","TRAINING_MANAGER"]}>
            <PlaceholderPage title="Trial Conversion" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/reports/sources",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN"]}>
            <PlaceholderPage title="Source Analytics" />
          </ProtectedRoute>
        ),
      },

      // ── Users ──────────────────────────────────
      {
        path: "/users",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <PlaceholderPage title="All Users" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/users/roles",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <PlaceholderPage title="Roles & Permissions" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/users/invite",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <PlaceholderPage title="Invite User" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/users/activity",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <PlaceholderPage title="Activity Log" />
          </ProtectedRoute>
        ),
      },

      // ── Settings ───────────────────────────────
      {
        path: "/settings",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN"]}>
            <PlaceholderPage title="General Settings" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings/security",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN"]}>
            <PlaceholderPage title="Security" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings/integrations",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN"]}>
            <PlaceholderPage title="Integrations" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings/whatsapp",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN"]}>
            <PlaceholderPage title="WhatsApp Automation" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings/meta",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN"]}>
            <PlaceholderPage title="Meta Ads Integration" />
          </ProtectedRoute>
        ),
      },
      {
        path: "/settings/stages",
        element: (
          <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
            <PlaceholderPage title="Lead Stage Configuration" />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
