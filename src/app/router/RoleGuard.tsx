import { Navigate } from "react-router-dom";
import { useRole } from "../../store/useAuthStore";
import type { Role } from "../../config/navigationConfig";

export const RoleGuard = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: Role[];
}) => {
  const role = useRole();

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};