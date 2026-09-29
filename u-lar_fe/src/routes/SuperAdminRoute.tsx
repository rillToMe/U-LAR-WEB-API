import { Navigate, Outlet } from "react-router-dom";
import { isSuperAdminSession } from "../lib/session";

/**
 * Membatasi halaman yang hanya boleh dibuka superadmin.
 *
 * Ini murni pembatas tampilan di sisi web - guard sesungguhnya ada di API
 * (AdminUserController memakai [Authorize(Roles = SuperAdmin)]). Kalau guard
 * ini dihapus, halamannya masih menolak dibuka karena server tetap 403.
 */
export default function SuperAdminRoute() {
  const hasSession = localStorage.getItem("user") !== null;

  if (!hasSession) {
    return <Navigate to="/login" replace />;
  }

  if (!isSuperAdminSession()) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
