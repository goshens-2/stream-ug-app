import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppState } from '../context/AppStateContext';

interface ProtectedRouteProps {
  /**
   * When true, only signed-in users whose profile has `isAdmin` set (backed
   * by the `is_admin` column/RLS policies in `supabase/schema.sql`) may
   * access these routes; everyone else is redirected to `/browse`.
   */
  requireAdmin?: boolean;
}

/**
 * Guards nested routes, redirecting unauthenticated visitors to the login
 * page, and (optionally) non-admin users away from admin-only routes.
 */
export function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, currentUser, authLoading } = useAppState();
  const location = useLocation();

  if (authLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireAdmin && !currentUser?.isAdmin) {
    return <Navigate to="/browse" replace />;
  }

  return <Outlet />;
}
