// Logic ✅

import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    // redirect to login page if not authenticated
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
