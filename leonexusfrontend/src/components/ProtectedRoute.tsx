import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'DEALER' | 'BUYER';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  redirectTo = '/signin'
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user, 'requiredRole:', requiredRole);

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('ProtectedRoute - Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to signin');
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole && user?.role !== requiredRole) {
    console.log('ProtectedRoute - Role mismatch, redirecting to appropriate dashboard');
    // Redirect to appropriate dashboard based on user role
    const redirectPath = user?.role === 'DEALER' ? '/dashboard' : '/buyer-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  console.log('ProtectedRoute - All checks passed, rendering children');
  return <>{children}</>;
};

export default ProtectedRoute;
