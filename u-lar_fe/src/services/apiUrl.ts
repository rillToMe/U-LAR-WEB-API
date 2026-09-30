/**
 * Konfigurasi alamat API yang dipakai bersama oleh semua domain: panel admin,
 * web ujian, dan halaman materi.
 *
 * Modul ini sengaja tidak mengimpor apa pun - tidak axios, tidak
 * `lib/session.ts`. Alasannya: `services/api.ts` adalah instance axios milik
 * admin (token admin, refresh diam-diam, tendang ke /login saat 401).
 * Mengimpor `API_BASE_URL` dari sana menarik semua kode di dalam modul itu juga,
 * sehingga halaman /materi yang tanpa login ikut membawa machinery sesi admin,
 * dan /ujian membawa refresh token admin.
 *
 * Dipisah ke sini, alamat API dan penggabungan URL berkas tetap bisa dipakai
 * semua domain tanpa menarik dependensi domain tertentu.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  `http://${window.location.hostname}:5116/api/v1`;

/**
 * Alamat lengkap berkas yang disimpan API, mis. gambar diagram materi yang
 * diunggah admin. Path relatif seperti "/uploads/materials/x.png" digabung
 * dengan alamat API yang sedang dipakai - bukan dengan alamat halaman web -
 * supaya gambar tetap terbuka dari localhost maupun dari IP LAN game.
 * Alamat lengkap (http/https), data URL, dan path protokol-relatif dipakai
 * apa adanya.
 */
export function resolveApiFileUrl(pathOrUrl: string): string {
  if (
    pathOrUrl === "" ||
    pathOrUrl.startsWith("//") ||
    /^[a-z][a-z0-9+.-]*:/i.test(pathOrUrl)
  ) {
    return pathOrUrl;
  }

  const origin = new URL(API_BASE_URL, window.location.href).origin;

  return `${origin}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}
