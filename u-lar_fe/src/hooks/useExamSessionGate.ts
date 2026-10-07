import { useEffect, useState } from "react";
import {
  isRunningInUnity,
  requestUnityExamSession,
  type UnityExamSession,
} from "../lib/unityBridge";
import {
  clearExamSession,
  getExamToken,
  saveExamSessionFromGame,
} from "../services/examApi";

export type ExamSessionGate =
  | { phase: "checking" }
  | { phase: "ready" }
  | { phase: "anonymous" };

/**
 * Berapa lama menunggu jawaban game sebelum menyerah dan memakai form login.
 * Di perangkat lambat halaman tetap harus punya jalan keluar, jadi jangan
 * dibuat terlalu pendek.
 */
const WAIT_TIMEOUT_MS = 3000;

/**
 * Kondisi awal dibaca sekali saat mount: token dari kunjungan sebelumnya
 * langsung dipakai, dan di luar game tidak ada yang bisa ditanya sehingga
 * langsung ke form. Dua-duanya selesai tanpa perlu menunggu.
 */
function initialGate(): ExamSessionGate {
  if (getExamToken()) {
    return { phase: "ready" };
  }

  if (!isRunningInUnity()) {
    return { phase: "anonymous" };
  }

  return { phase: "checking" };
}

/**
 * Menyiapkan sesi mahasiswa untuk halaman ujian.
 *
 * Kalau student sudah login di game, WebView otomatis memakainya tanpa
 * minta NIM + password lagi. Token datang lewat bridge Unity, bukan query
 * URL, jadi tidak bocor ke riwayat browser atau log server.
 *
 * Kalau student logout di game, game membalas "tidak ada sesi" dan sesi web
 * ikut dibersihkan - inilah yang membuat logout di game berlaku di web.
 *
 * Form login tetap dipertahankan sebagai cadangan: student yang membuka
 * halaman ini di browser biasa, atau yang jawabannya tidak sampai dalam
 * batas waktu, tetap bisa login sendiri seperti biasa.
 */
export function useExamSessionGate(): ExamSessionGate {
  const [gate, setGate] = useState<ExamSessionGate>(initialGate);

  useEffect(() => {
    // Sudah selesai di kondisi awal: tidak ada yang perlu ditanyakan.
    if (gate.phase !== "checking") {
      return;
    }

    let settled = false;

    function finish(next: ExamSessionGate) {
      if (settled) {
        return;
      }

      settled = true;
      setGate(next);
    }

    function onSession(session: UnityExamSession | null) {
      if (session === null || !session.token) {
        // Game tidak punya sesi (student logout). Sesi web yang tersisa
        // dibuang supaya tidak dipakai lanjut setelah logout.
        clearExamSession();
        finish({ phase: "anonymous" });

        return;
      }

      saveExamSessionFromGame(session);
      finish({ phase: "ready" });
    }

    const stop = requestUnityExamSession(onSession);

    const timeoutId = setTimeout(() => {
      // Game tidak menjawab. Jangan hapus sesi di sini - bisa saja jawabannya
      // telat; cukup izinkan form login sebagai cadangan.
      stop();
      finish({ phase: "anonymous" });
    }, WAIT_TIMEOUT_MS);

    return () => {
      clearTimeout(timeoutId);
      stop();
    };
  }, [gate.phase]);

  return gate;
}
