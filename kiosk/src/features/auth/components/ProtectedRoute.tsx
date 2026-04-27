import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { User, Kiosk } from "../../../core/types";

interface ProtectedRouteProps {
  user: User | null;
  selectedKiosk: Kiosk | null;
  requireKiosk?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  user, 
  selectedKiosk, 
  requireKiosk = true 
}) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireKiosk && !selectedKiosk) {
    return <Navigate to="/select" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
