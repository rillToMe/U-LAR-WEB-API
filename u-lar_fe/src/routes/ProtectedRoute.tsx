import { Navigate, Outlet } from "react-router-dom";
import { ADMIN_ROLE } from "../lib/session";

export default function ProtectedRoute() {
  const token = localStorage.getItem("accessToken");
  const userRaw = localStorage.getItem("user");

  if (!token || !userRaw) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userRaw) as { role?: string };

  // Superadmin juga admin: role SUPER_ADMIN harus tetap lolos ke panel,
  // kalau tidak dia terkunci dari seluruh halaman padahal endpoint-nya
  // mengizinkan. Role admin biasa tetap "ADMIN".
  if (user.role !== ADMIN_ROLE.admin && user.role !== ADMIN_ROLE.superAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}