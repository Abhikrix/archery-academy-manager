import * as React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRoleHomePath } from "../utils/roleRoutes";

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const { loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-academy-black text-neutral-300">
        Loading academy access...
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to={getRoleHomePath(profile.role)} replace />;
  }

  return <Outlet />;
}
