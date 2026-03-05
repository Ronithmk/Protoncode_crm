// ============================================================
// features/dashboard/index.tsx
// Single export consumed by the router.
// Reads the logged-in role and renders the correct dashboard.
// Add new roles here — never put role logic in the router.
// ============================================================

import { useRole } from "../../store/useAuthStore";
import { AdminDashboard } from "./AdminDashboard";
import { CenterManagerDashboard } from "./CenterManagerDashboard";
import { FMDashboard } from "./FMDashboard";
import { HRDashboard } from "./HRDashboard";
import { RMDashboard } from "./RMDashboard";
import { SalesManagerDashboard } from "./SalesManagerDashboard";
import { TrainingManagerDashboard } from "./TrainingManagerDashboard";
 

export const DashboardOverview = () => {
  const role = useRole();

  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return <AdminDashboard />;
    case "RM":
      return <RMDashboard />;
    case "FM":
      return <FMDashboard />;
    case "CENTER_MANAGER":
      return <CenterManagerDashboard />;
    case "SALES_MANAGER":
      return <SalesManagerDashboard />;
    case "TRAINING_MANAGER":
      return <TrainingManagerDashboard />;
    case "HR":
      return <HRDashboard />;
    default:
      return <AdminDashboard />;
  }
};
