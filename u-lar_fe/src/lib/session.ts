/**
 * Pembacaan sesi admin dari localStorage.
 *
 * Sesi ditulis LoginPage setelah login berhasil. Dipisah di satu tempat
 * supaya Nav, SuperAdminRoute, dan AdminsPage tidak masing-masing parses
 * localStorage dengan cara sendiri.
 */

/**
 * Nilai role admin. Harus sama dengan `UserRoles` di backend
 * (`Domain/Common/UserRoles.cs`). Role mahasiswa sengaja tidak ada di sini
 * karena tidak dipakai panel admin.
 */
export const ADMIN_ROLE = {
  admin: "ADMIN",
  superAdmin: "SUPER_ADMIN",
} as const;

export interface AdminSession {
  adminId?: number;
  username?: string;
  role?: string;
}

export function readAdminSession(): AdminSession | null {
  const raw = localStorage.getItem("user");

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AdminSession;

    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

/** Id admin yang sedang login, atau null kalau sesinya tidak terbaca. */
export function currentAdminId(): number | null {
  const id = readAdminSession()?.adminId;

  return typeof id === "number" ? id : null;
}

/** Nama role admin yang sedang login, atau null kalau tidak terbaca. */
export function currentAdminRole(): string | null {
  return readAdminSession()?.role ?? null;
}

/** Superadmin berarti role-nya persis SUPER_ADMIN. */
export function isSuperAdminSession(): boolean {
  return currentAdminRole() === ADMIN_ROLE.superAdmin;
}
