import { Navigate, Outlet } from "react-router-dom";
import { EXAM_LOGIN_PATH } from "../services/examApi";
import { useExamSessionGate } from "../hooks/useExamSessionGate";

/**
 * Penjaga route web ujian. Token dan datanya sengaja terpisah dari sesi admin,
 * jadi admin yang sedang login di browser yang sama tidak bisa membuka halaman
 * ujian — dan sebaliknya.
 *
 * Student yang sudah login di game tidak perlu mengetik NIM + password lagi:
 * halaman ini meminta sesi ke WebView game lebih dulu (lihat
 * `useExamSessionGate`). Sambil menunggu, yang ditampilkan hanya status
 * "menyiapkan" supaya halaman tidak pernah sempat tampil dalam keadaan salah.
 * Kalau tidak ada jawaban — dibuka di browser biasa, atau student memang
 * belum login — barulah dialihkan ke form login seperti biasa.
 */
export default function ExamProtectedRoute() {
  const gate = useExamSessionGate();

  if (gate.phase === "ready") {
    return <Outlet />;
  }

  if (gate.phase === "anonymous") {
    return <Navigate to={EXAM_LOGIN_PATH} replace />;
  }

  return (
    <div
      role="status"
      aria-label="Menyiapkan sesi"
      className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-surface-muted px-6 text-center"
    >
      <span
        aria-hidden="true"
        className="size-6 animate-spin rounded-full border-2 border-border border-t-accent motion-reduce:animate-none"
      />

      <p className="text-sm text-fg-subtle">Menyiapkan sesi...</p>
    </div>
  );
}
