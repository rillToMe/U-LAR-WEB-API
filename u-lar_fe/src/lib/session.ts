/**
 * Penyimpanan dan pembacaan sesi admin di browser.
 *
 * Ada tiga key, ketiganya milik panel admin saja. Endpoint ujian memakai
 * key sendiri (lihat services/examApi.ts) supaya sesi mahasiswa tidak
 * menimpa sesi admin di komputer yang sama.
 *
 * Sesi ditulis LoginPage setelah login berhasil dan oleh refresh senyap di
 * services/api.ts. Semua pembacaan lewat file ini supaya Nav, route guard,
 * dan halaman admin tidak masing-masing parses localStorage dengan cara
 * sendiri — termasuk parsing yang bisa gagal.
 */

/** Nilai role admin. Harus sama dengan `UserRoles` di backend
 * (`Domain/Common/UserRoles.cs`). Role mahasiswa sengaja tidak ada di sini
 * karena tidak dipakai panel admin. */
export const ADMIN_ROLE = {
  admin: "ADMIN",
  superAdmin: "SUPER_ADMIN",
} as const;

export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "adminRefreshToken";
export const SESSION_KEY = "user";

export interface AdminSession {
  adminId?: number;
  username?: string;
  role?: string;
  /** Epoch ms saat access token kedaluwarsa. Disimpan absolute supaya
   *  hitungan sisa waktu tetap benar setelah halaman di-reload. */
  expiresAt?: number;
}

export function readAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function readRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function readAdminSession(): AdminSession | null {
  const raw = localStorage.getItem(SESSION_KEY);

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

/**
 * Menulis satu sesi lengkap sekaligus, supaya tidak pernah ada keadaan
 * setengah-setengah di localStorage (access token ada tapi `user` belum).
 */
export function writeAdminSession(
  session: AdminSession,
  accessToken: string,
  refreshToken: string,
  expiresInSeconds: number
): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      ...session,
      expiresAt: Date.now() + expiresInSeconds * 1000,
    })
  );
}

export function clearAdminSession(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(SESSION_KEY);
}

/** Sisa waktu access token dalam ms; 0 kalau sudah lewat atau tidak terbaca. */
export function sessionTimeLeft(now: number = Date.now()): number {
  const expiresAt = readAdminSession()?.expiresAt;

  if (typeof expiresAt !== "number") {
    return 0;
  }

  return Math.max(0, expiresAt - now);
}

/**
 * Guard halaman. Sama persis dengan syarat minimal supaya login diterima:
 * ada access token, ada refresh token (kalau tidak, sesi tidak bisa
 * diperpanjang dan pasti mati dalam 15 menit), dan access tokennya belum
 * habis.
 *
 * Ini tetap hanya pembatas tampilan — API juga memeriksa sendiri.
 */
export function isAdminSessionActive(now: number = Date.now()): boolean {
  if (!readAccessToken() || !readRefreshToken()) {
    return false;
  }

  return sessionTimeLeft(now) > 0;
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

/** Guard peran untuk route: admin biasa dan superadmin sama-sama boleh. */
export function isAdminRole(role: string | null | undefined): boolean {
  return role === ADMIN_ROLE.admin || role === ADMIN_ROLE.superAdmin;
}
