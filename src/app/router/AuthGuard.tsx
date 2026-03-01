import { Navigate, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "../../store/useAuthStore";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};