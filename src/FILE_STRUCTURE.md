# Martial Arts CRM — File Structure

Complete `src/` reference. Every file has one clear responsibility.
Import from barrel `index` files wherever possible — never reach into
sub-folders directly from outside that module.

---

```
src/
│
├── main.tsx                              # App entry — ReactDOM.createRoot + RouterProvider
│
├── router/
│   └── index.tsx                         # React Router v6 — AuthGuard + all routes
│
├── types/
│   ├── crm.types.ts                      # All domain types (Lead, Task, TrialSession …)
│   └── index.ts                          # Re-exports everything from crm.types
│
├── data/
│   ├── mockData.ts                       # Mock data — swap each export for a TanStack Query hook
│   └── index.ts                          # Barrel — named exports for all mock datasets
│
├── utils/
│   ├── cn.ts                             # Tailwind class-merge helper (clsx + tailwind-merge)
│   └── index.ts                          # Barrel
│
├── config/
│   ├── navigationConfig.ts               # RBAC nav — MAIN_NAV, MODULE_SIDEBAR, filterByRole()
│   └── index.ts                          # Barrel
│
├── store/
│   ├── useAuthStore.ts                   # Zustand auth store — user, role, login(), logout()
│   └── index.ts                          # Barrel — useRole, useUser, useIsAuthenticated …
│
├── components/
│   ├── layout/
│   │   ├── MainLayout.tsx                # Shell — Header + Sidebar + <Outlet />
│   │   ├── Header.tsx                    # Top nav tabs + user menu + logout
│   │   ├── Sidebar.tsx                   # Module sidebar — role-filtered items from config
│   │   └── index.ts                      # Barrel
│   │
│   └── ui/
│       ├── index.tsx                     # All shared UI primitives
│       │                                 #   Button, Input, Select, Modal, Avatar,
│       │                                 #   StatCard, StageBadge, SourceBadge,
│       │                                 #   Table, Th, Td, Tr, Card, PageHeader,
│       │                                 #   EmptyState, ProgressBar, PriorityBadge …
│       └── index.ts                      # Barrel re-export
│
└── features/
    │
    ├── auth/
    │   ├── LoginPage.tsx                 # Full-screen login — demo cards per role
    │   └── index.ts                      # Barrel
    │
    ├── dashboard/
    │   ├── index.tsx                     # ← Router imports this. Reads role → renders correct dashboard.
    │   │
    │   ├── shared/
    │   │   └── DashboardPrimitives.tsx   # Card, CardHeader, StatCard, Btn, Avatar, StageBadge,
    │   │                                 # ProgressBar, MiniBarChart, TaskRow, TrialRow, EmptyRow,
    │   │                                 # STAGE_COLORS, ROLE_COLORS, LIFECYCLE_STAGES
    │   │
    │   ├── admin/
    │   │   └── AdminDashboard.tsx        # SUPER_ADMIN + ADMIN
    │   │                                 # Pipeline health, revenue, centres, team, recent leads
    │   │
    │   ├── rm/
    │   │   └── RMDashboard.tsx           # RM (Relationship Manager)
    │   │                                 # My leads, my tasks, hot leads, my pipeline, my trials
    │   │
    │   ├── fm/
    │   │   └── FMDashboard.tsx           # FM (Finance Manager)
    │   │                                 # Renewals due, revenue, plan breakdown, active members
    │   │
    │   ├── training/
    │   │   └── TrainingManagerDashboard.tsx  # TRAINING_MANAGER
    │   │                                     # Today's trials + confirm/done, batches, upcoming
    │   │
    │   └── hr/
    │       └── HRDashboard.tsx           # HR — read-only
    │                                     # Headcount, role/centre breakdown, staff directory
    │
    ├── leads/
    │   ├── LeadsList.tsx                 # exports: LeadsList, LeadsPipeline
    │   │                                 # Table with inline stage picker, pipeline kanban
    │   ├── LeadDetail.tsx                # exports: LeadDetail
    │   │                                 # Full lead workspace — timeline, tasks, trial booking
    │   └── index.ts                      # Barrel
    │
    ├── schedule/
    │   ├── ScheduleCalendar.tsx          # exports: ScheduleCalendar, TrialsPage
    │   └── index.ts                      # Barrel
    │
    ├── reports/
    │   ├── ReportsPage.tsx               # exports: ReportsPage
    │   │                                 # Lead funnel, source breakdown, revenue summary
    │   └── index.ts                      # Barrel
    │
    ├── users/
    │   ├── UsersPage.tsx                 # exports: UsersListPage, RolesPage
    │   │                                 # User list, role assignments, permissions matrix
    │   └── index.ts                      # Barrel
    │
    └── settings/
        ├── SettingsPage.tsx              # exports: SettingsPage (all sub-pages in one file)
        │                                 # General, Security, Integrations, WhatsApp, Meta Ads, Stages
        └── index.ts                      # Barrel
```

---

## Role → Dashboard mapping

| Role               | Dashboard file                          | What they see                                      |
|--------------------|-----------------------------------------|----------------------------------------------------|
| `SUPER_ADMIN`      | `admin/AdminDashboard.tsx`              | Full org: pipeline, revenue, centres, team, leads  |
| `ADMIN`            | `admin/AdminDashboard.tsx`              | Same as SUPER_ADMIN (centre-scoped in production)  |
| `RM`               | `rm/RMDashboard.tsx`                    | My leads, tasks, hot leads, pipeline, trials       |
| `FM`               | `fm/FMDashboard.tsx`                    | Renewals, revenue MTD, plan breakdown, members     |
| `TRAINING_MANAGER` | `training/TrainingManagerDashboard.tsx` | Today's trials, batches, status summary, upcoming  |
| `HR`               | `hr/HRDashboard.tsx`                    | Staff headcount, roles, centres — read-only        |

---

## Key rules

- **Never hard-code role checks in JSX** outside `features/dashboard/index.tsx`.
  All RBAC for navigation lives in `config/navigationConfig.ts`.
- **All theme colours use CSS variables** from your `index.css`:
  `var(--primary-color)`, `var(--success-color)`, `bg-card`, `text-primary`, etc.
  No raw hex in className strings.
- **Dashboard shared components** live in `dashboard/shared/DashboardPrimitives.tsx`.
  Import from there — never copy-paste into individual dashboards.
- **Mock data** → replace each `MOCK_*` export with a TanStack Query `useQuery` hook
  when connecting a real API. File path stays the same.
- **Router** imports only from barrel `index` files — never from deep paths like
  `features/dashboard/admin/AdminDashboard`.
