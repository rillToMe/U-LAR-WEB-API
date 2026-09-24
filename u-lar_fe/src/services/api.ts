import axios from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  `http://${window.location.hostname}:5116/api/v1`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

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

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      localStorage.getItem("accessToken")
    ) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);