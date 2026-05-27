import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuthContext } from '../hooks/AuthContext';
import type { UserRole } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: UserRole;
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.rol !== role) {
    // Redirect to the correct portal based on actual role
    if (user?.rol === 'CLIENTE') return <Navigate to="/cliente/dashboard" replace />;
    if (user?.rol === 'ADMIN_AGENCIA') return <Navigate to="/agencia/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
