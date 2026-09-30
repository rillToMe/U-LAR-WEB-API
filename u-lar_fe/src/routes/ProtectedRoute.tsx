import { Navigate, Outlet } from "react-router-dom";
import { isAdminRole, isAdminSessionActive, readAdminSession } from "../lib/session";

/**
 * Guard halaman admin. Syaratnya dibaca dari lib/session (satu sumber
 * kebenaran), bukan parses localStorage sendiri — sudah termasuk cek token
 * dan masa berlakunya, jadi halaman tidak sempat tampil dengan sesi yang
 * sudah mati lalu langsung tendang balik ke login.
 *
 * Superadmin juga admin: role SUPER_ADMIN harus tetap lolos ke panel,
 * kalau tidak dia terkunci dari seluruh halaman padahal endpoint-nya
 * mengizinkan.
 */
export default function ProtectedRoute() {
  if (!isAdminSessionActive()) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdminRole(readAdminSession()?.role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
