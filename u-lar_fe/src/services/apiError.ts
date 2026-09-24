import { AxiosError } from "axios";

interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

const STATUS_MESSAGE: Record<number, string> = {
  400: "Data yang dikirim tidak valid. Mohon periksa kembali isian Anda.",
  401: "Sesi Anda telah berakhir. Silakan masuk kembali.",
  403: "Anda tidak memiliki akses untuk melakukan tindakan ini.",
  404: "Data yang dituju tidak ditemukan.",
  409: "Data sudah ada di dalam sistem dan tidak bisa diduplikasi.",
  500: "Terjadi kendala pada server kami. Silakan coba beberapa saat lagi.",
};

export function getApiErrorMessage(
  error: unknown,
  fallback: string = "Terjadi kesalahan yang tidak diketahui. Silakan coba lagi."
): string {
  if (!(error instanceof AxiosError)) {
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

  const serverMessage = problem?.detail?.trim() || problem?.title?.trim();

  if (serverMessage) {
    return serverMessage;
  }

  if (status && STATUS_MESSAGE[status]) {
    return STATUS_MESSAGE[status];
  }
  
  if (status) {
    return `${fallback} (Kode status: ${status})`;
  }

  return fallback;
}