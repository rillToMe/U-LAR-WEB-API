import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("accessToken");
  const userRaw = localStorage.getItem("user");

  if (!token || !userRaw) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userRaw);

  if (user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}