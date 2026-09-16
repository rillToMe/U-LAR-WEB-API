import { AxiosError } from "axios";

/**
 * Backend mengirim ProblemDetails (RFC 7807) dengan pesan spesifik di `title`,
 * misal "NIM 23076052 sudah terdaftar.". Sebelumnya pesan itu dibuang dan
 * diganti teks generik, jadi admin tidak tahu penyebab kegagalan.
 * Helper ini mengambil pesan paling spesifik yang tersedia.
 */
interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

const STATUS_MESSAGE: Record<number, string> = {
  400: "Data yang dikirim tidak valid. Periksa kembali isian form.",
  401: "Sesi login sudah berakhir. Silakan masuk ulang.",
  403: "Akun Anda tidak punya izin untuk tindakan ini.",
  404: "Data yang dituju tidak ditemukan. Mungkin sudah dihapus.",
  409: "Data bentrok dengan yang sudah ada di sistem.",
  500: "Server bermasalah saat memproses permintaan. Coba lagi sebentar.",
};

export function getApiErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (!(error instanceof AxiosError)) {
    return fallback;
  }

  if (error.code === "ERR_NETWORK") {
    return "Tidak bisa terhubung ke server. Pastikan backend berjalan lalu coba lagi.";
  }

  if (error.code === "ECONNABORTED") {
    return "Permintaan timeout sebelum server menjawab. Coba lagi.";
  }

  const status = error.response?.status;
  const problem = error.response?.data as ProblemDetails | undefined;

  // Validasi model dari [ApiController] — tampilkan field yang salah.
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
    return `${fallback} Server menjawab dengan status ${status}.`;
  }

  return fallback;
}
