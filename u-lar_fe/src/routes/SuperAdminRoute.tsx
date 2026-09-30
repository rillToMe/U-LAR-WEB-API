import { Navigate, Outlet } from "react-router-dom";
import { isSuperAdminSession } from "../lib/session";

/**
 * Membatasi halaman yang hanya boleh dibuka superadmin.
 *
 * Ini murni pembatas tampilan di sisi web - guard sesungguhnya ada di API
 * (AdminUserController memakai [Authorize(Roles = SuperAdmin)]). Kalau guard
 * ini dihapus, halamannya masih menolak dibuka karena server tetap 403.
 *
 * Sesi tidak dicek ulang di sini: `ProtectedRoute` sudah menjaganya di
 * outlet induk, jadi cukup `isSuperAdminSession()` yang membaca role dari
 * localStorage — tanpa logika parsing sendiri.
 */
export default function SuperAdminRoute() {
  if (!isSuperAdminSession()) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
