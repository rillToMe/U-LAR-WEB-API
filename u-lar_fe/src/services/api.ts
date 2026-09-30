import axios, { type InternalAxiosRequestConfig } from "axios";
import {
  clearAdminSession,
  readAccessToken,
  readAdminSession,
  readRefreshToken,
  writeAdminSession,
} from "../lib/session";
import { API_BASE_URL } from "./apiUrl";
import type { SessionTokens } from "../types/auth";

/**
 * Instance axios khusus panel admin: menempelkan access token, memperpanjang
 * sesi diam-diam, dan mengakhiri sesi saat token benar-benar ditolak.
 *
 * Hanya file di domain admin yang boleh mengimpor modul ini. Domain lain
 * (web ujian, halaman materi) yang butuh alamat API atau penggabungan URL
 * berkas mengimpor `./apiUrl`, bukan modul ini - lihat catatan di sana.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Access token admin hanya berlaku 15 menit, tapi sesi boleh jauh lebih
 * lama. Jadi token diperpanjang diam-diam beberapa menit sebelum habis —
 * kalau tidak, admin yang sedang mengumpulkan soal akan tiba-tiba
 * dilempar ke halaman login di tengah pekerjaan.
 */
const REFRESH_LEEWAY_MS = 5 * 60 * 1000;

/** Config axios yang tandai sudah pernah dicoba ulang. */
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/**
 * Satu permintaan refresh yang sedang berjalan, dipakai bersama oleh semua
 * request yang butuh token baru. Tanpa ini, satu klik yang memuat beberapa
 * data akan menembak `/refresh` berkali-kali, dan karena token dirotasi
 * tiap kali, semuanya saling membatalkan.
 */
let inFlightRefresh: Promise<boolean> | null = null;

/**
 * Menyimpan hasil refresh ke localStorage, mempertahankan role & id.
 */
function storeRefreshedTokens(tokens: SessionTokens): boolean {
  const session = readAdminSession();

  if (!session) {
    return false;
  }

  writeAdminSession(
    {
      adminId: session.adminId,
      username: session.username,
      role: session.role,
    },
    tokens.accessToken,
    tokens.refreshToken,
    tokens.expiresInSeconds
  );

  return true;
}

/**
 * Memperpanjang sesi satu kali. `force` dipakai saat server sudah membalas
 * 401, karena saat itu access token benar-benar ditolak dan leeway 5 menit
 * tidak lagi relevan.
 *
 * Panggilannya memakai axios polos, bukan `api`: kalau lewat `api`, 401 dari
 * endpoint ini akan memicu interceptor yang memanggil fungsi ini lagi.
 */
async function refreshOnce(force: boolean): Promise<boolean> {
  const expiresAt = readAdminSession()?.expiresAt ?? 0;

  if (!force && Date.now() < expiresAt - REFRESH_LEEWAY_MS) {
    return true;
  }

  const refreshToken = readRefreshToken();

  if (!refreshToken) {
    return false;
  }

  inFlightRefresh ??= axios
    .post<SessionTokens>(`${API_BASE_URL}/Auth/admin/refresh`, {
      refreshToken,
    })
    .then((response) => storeRefreshedTokens(response.data))
    .catch(() => false)
    .finally(() => {
      inFlightRefresh = null;
    });

  return inFlightRefresh;
}

/**
 * Sesi sudah tidak bisa dipertahankan: cabut refresh token di server kalau
 * masih ada, lalu bersihkan storage dan bawa pengguna ke login.
 *
 * `notice` ditulis ke sessionStorage karena perpindahan ini melibatkan
 * reload penuh, jadi state React di halaman login ikut hilang.
 */
function endSession(notice: string): void {
  const refreshToken = readRefreshToken();

  if (refreshToken) {
    // Sengaja tidak di-await: kalau server tidak terjangkau, pengguna
    // tetap harus bisa keluar dari halaman sekarang juga.
    void axios
      .post(`${API_BASE_URL}/Auth/admin/logout`, { refreshToken })
      .catch(() => undefined);
  }

  clearAdminSession();
  sessionStorage.setItem("authNotice", notice);

  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

api.interceptors.request.use((config) => {
  const token = readAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    // 429 dari rate limiter: sesi bukan masalahnya, jadi jangan keluar.
    if (status === 429 || !readAccessToken()) {
      return Promise.reject(error);
    }

    // 403 = memang tidak punya hak, dan sesi tidak akan membaik dengan
    // login ulang. 404 = endpoint tidak ada. Keduanya bukan tanda sesi habis.
    if (status !== 401) {
      return Promise.reject(error);
    }

    // Request yang sudah dicoba refresh tidak dicoba lagi, supaya tidak
    // berputar sendiri. Flag ini ikut di config retry.
    const alreadyRetried = (error.config as RetriableConfig | undefined)?._retried;

    if (alreadyRetried || !(await refreshOnce(true))) {
      endSession("Sesi Anda berakhir. Silakan masuk kembali.");

      return Promise.reject(error);
    }

    const freshToken = readAccessToken();

    if (!freshToken) {
      endSession("Sesi Anda berakhir. Silakan masuk kembali.");

      return Promise.reject(error);
    }

    const retriedConfig = (error.config ?? {}) as RetriableConfig;

    retriedConfig._retried = true;
    retriedConfig.headers.Authorization = `Bearer ${freshToken}`;

    return api.request(retriedConfig);
  }
);

/**
 * Memastikan access token masih punya sisa waktu sebelum request dikirim.
 * Dipanggil dari komponen yang memuat data, bukan dari request interceptor,
 * supaya sesi yang sudah kedaluwarsa tidak sampai terlihat sebagai 401.
 */
export async function ensureFreshSession(): Promise<boolean> {
  return refreshOnce(false);
}
