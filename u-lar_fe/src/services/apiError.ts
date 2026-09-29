import { isAxiosError } from "axios";
import { logger } from "../lib/logger";

interface ProblemDetails {
  title?: string;
  detail?: string;
  code?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}

/**
 * Terjemahan pesan berdasarkan `code` dari backend. Backend mengirim kode
 * stabil; pemetaan bahasa sepenuhnya di sini supaya pesan ke user seragam
 * dan bebas istilah teknis.
 */
const CODE_MESSAGE: Record<string, string> = {
  invalid_credentials:
    "Username/NIM atau password salah. Periksa kembali data masuk Anda.",
  unauthorized: "Sesi Anda telah berakhir. Silakan masuk kembali.",
  forbidden: "Anda tidak memiliki akses untuk melakukan tindakan ini.",
  not_found: "Data yang dituju tidak ditemukan.",
  conflict: "Data sudah ada di dalam sistem dan tidak bisa diduplikasi.",
  validation_failed:
    "Data yang dikirim tidak valid. Mohon periksa kembali isian Anda.",
  internal_error:
    "Terjadi kendala pada server kami. Silakan coba beberapa saat lagi.",
};

/** Cadangan untuk respons lama yang belum punya field `code`. */
const STATUS_MESSAGE: Record<number, string> = {
  400: "Data yang dikirim tidak valid. Mohon periksa kembali isian Anda.",
  401: "Sesi Anda telah berakhir. Silakan masuk kembali.",
  403: "Anda tidak memiliki akses untuk melakukan tindakan ini.",
  404: "Data yang dituju tidak ditemukan.",
  409: "Data sudah ada di dalam sistem dan tidak bisa diduplikasi.",
  500: "Terjadi kendala pada server kami. Silakan coba beberapa saat lagi.",
};

/**
 * Mengubah kegagalan request menjadi pesan siap tampil untuk user.
 * Sumber pesan, berurutan: masalah jaringan → error per field validasi →
 * kode dari backend → status HTTP → fallback pemanggil.
 * Detail teknis server (`title`/`detail`) sengaja tidak ditampilkan.
 */
export function getApiErrorMessage(
  error: unknown,
  fallback: string = "Terjadi kesalahan yang tidak diketahui. Silakan coba lagi."
): string {
  if (!isAxiosError(error)) {
    return fallback;
  }

  if (error.code === "ERR_NETWORK") {
    return "Gagal terhubung ke sistem. Periksa koneksi internet Anda atau coba muat ulang halaman.";
  }

  if (error.code === "ECONNABORTED") {
    return "Waktu koneksi habis sebelum server merespons. Silakan coba beberapa saat lagi.";
  }

  const status = error.response?.status;
  const problem = error.response?.data as ProblemDetails | undefined;

  const fieldErrors = problem?.errors
    ? Object.values(problem.errors).flat().filter(Boolean)
    : [];

  if (fieldErrors.length > 0) {
    return fieldErrors.join(" ");
  }

  const byCode = problem?.code ? CODE_MESSAGE[problem.code] : undefined;

  if (byCode) {
    return byCode;
  }

  if (status && STATUS_MESSAGE[status]) {
    return STATUS_MESSAGE[status];
  }

  return fallback;
}

/**
 * Satu panggilan untuk catch site: mencatat konteks operasi ke console
 * (untuk debugging developer) sekaligus menghasilkan pesan user-facing.
 *
 *   setError(describeApiError("ExamListPage", error, "Gagal memuat ujian."));
 */
export function describeApiError(
  scope: string,
  error: unknown,
  fallback?: string
): string {
  logger.error(scope, "Request gagal", error);

  return getApiErrorMessage(error, fallback);
}
