// ============================================================
// router/index.tsx  (UPDATED — wires all feature pages)
// ============================================================

import { createBrowserRouter, Navigate } from "react-router-dom";
import { MainLayout } from "../../app/layout/MainLayout";

// Dashboard
import { DashboardOverview } from "../../features/dashboard/dashboard.index";

// Leads
import { LeadsList, LeadsPipeline } from "../../features/leads/LeadsList";
import { LeadDetail } from "../../features/leads/LeadDetail";

// Schedule
import { ScheduleCalendar, TrialsPage } from "../../features/schedule/ScheduleCalendar";

// Reports
import {
  ReportsPage,
  LeadReportsPage,
  SalesReportsPage,
  TrialConversionPage,
  SourceAnalyticsPage,
} from "../../features/reports/ReportsPage";

// Users
import { UsersListPage, RolesPage } from "../../features/users/UsersPage";

// Settings
import {
  GeneralSettings,
  SecuritySettings,
  IntegrationsSettings,
  WhatsAppSettings,
  MetaAdsSettings,
  LeadStagesSettings,
} from "../../features/settings/SettingsPage";

// ─── PLACEHOLDER (for pages not yet built) ───────────────
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-6">
    <h1 className="text-xl font-bold text-white">{title}</h1>
    <p className="text-slate-500 mt-2 text-[13px]">Coming soon</p>
  </div>
);

// ─── ROUTER ──────────────────────────────────────────────
export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/dashboard" replace /> },
  {
    element: <MainLayout />,
    children: [
      // ── Dashboard ──────────────────────────────────────
      { path: "/dashboard",              element: <DashboardOverview /> },
      { path: "/dashboard/tasks",        element: <Placeholder title="My Tasks" /> },
      { path: "/dashboard/notifications",element: <Placeholder title="Notifications" /> },

      // ── Leads ──────────────────────────────────────────
      { path: "/leads",          element: <LeadsList /> },
      { path: "/leads/:id",      element: <LeadDetail /> },
      { path: "/leads/mine",     element: <LeadsList /> },
      { path: "/leads/pipeline", element: <LeadsPipeline /> },
      { path: "/leads/sources",  element: <Placeholder title="Lead Sources" /> },
      { path: "/leads/import",   element: <Placeholder title="Import Leads" /> },

      // ── Schedule ───────────────────────────────────────
      { path: "/schedule",           element: <ScheduleCalendar /> },
      { path: "/schedule/trials",    element: <TrialsPage /> },
      { path: "/schedule/followups", element: <Placeholder title="Follow-ups" /> },
      { path: "/schedule/batches",   element: <Placeholder title="Batch Schedule" /> },

      // ── Renewals ───────────────────────────────────────
      { path: "/renewals",           element: <Placeholder title="Due Renewals" /> },
      { path: "/renewals/completed", element: <Placeholder title="Renewed Members" /> },
      { path: "/renewals/lapsed",    element: <Placeholder title="Lapsed Members" /> },
      { path: "/renewals/revenue",   element: <Placeholder title="Revenue Summary" /> },

      // ── Reports ────────────────────────────────────────
      { path: "/reports",          element: <ReportsPage /> },
      { path: "/reports/leads",    element: <LeadReportsPage /> },
      { path: "/reports/sales",    element: <SalesReportsPage /> },
      { path: "/reports/trials",   element: <TrialConversionPage /> },
      { path: "/reports/sources",  element: <SourceAnalyticsPage /> },

      // ── Users ──────────────────────────────────────────
      { path: "/users",          element: <UsersListPage /> },
      { path: "/users/roles",    element: <RolesPage /> },
      { path: "/users/invite",   element: <Placeholder title="Invite User" /> },
      { path: "/users/activity", element: <Placeholder title="Activity Log" /> },

      // ── Settings ───────────────────────────────────────
      { path: "/settings",                element: <GeneralSettings /> },
      { path: "/settings/security",       element: <SecuritySettings /> },
      { path: "/settings/integrations",   element: <IntegrationsSettings /> },
      { path: "/settings/whatsapp",       element: <WhatsAppSettings /> },
      { path: "/settings/meta",           element: <MetaAdsSettings /> },
      { path: "/settings/stages",         element: <LeadStagesSettings /> },
    ],
  },
]);