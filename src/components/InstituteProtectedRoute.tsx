/**
 * InstituteProtectedRoute.tsx - Route Protection for Institute Dashboard
 *
 * Wraps routes that require institute authentication.
 * Redirects to login page if not authenticated or if accessing wrong institute.
 */

import { Navigate, useParams } from "react-router-dom";
import { getInstituteSession } from "@/services/instituteAuth";

interface InstituteProtectedRouteProps {
  children: React.ReactNode;
}

export const InstituteProtectedRoute = ({ children }: InstituteProtectedRouteProps) => {
  const { instituteId } = useParams<{ instituteId: string }>();
  const session = getInstituteSession();

  // Not logged in
  if (!session) {
    return <Navigate to="/institute/login" replace />;
  }

  // Logged in but trying to access different institute's dashboard
  if (instituteId && session.instituteId !== instituteId) {
    return <Navigate to={`/institute/${session.instituteId}/dashboard`} replace />;
  }

  return <>{children}</>;
};

export default InstituteProtectedRoute;
