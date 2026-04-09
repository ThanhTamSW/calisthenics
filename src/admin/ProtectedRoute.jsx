import { Navigate, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "./auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}

