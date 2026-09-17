import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Interval 250 ms: angka detik di layar tidak akan pernah tertinggal satu detik
 * penuh, dan biayanya masih jauh lebih murah daripada dampak visualnya.
 */
const TICK_MS = 250;

export interface CountdownTimer {
  remainingSeconds: number;
  /**
   * Menyetel ulang hitungan dari angka server. Dipakai saat sesi pertama kali
   * dimuat — servernya yang menentukan, bukan jam HP.
   */
  sync: (seconds: number) => void;
  /**
   * Menyesuaikan hitungan dengan angka server tanpa pernah menambah waktu.
   * Balasan auto-save bisa datang terlambat dan membawa sisa waktu yang lebih
   * lama; itu harus diabaikan.
   */
  syncFromServer: (seconds: number) => void;
}

/**
 * Hitung mundur berbasis tenggat waktu, bukan pengurangan per detik. Efeknya:
 * tab yang di-background browser (timer di-throttle) tetap menunjukkan sisa
 * waktu yang benar begitu kembali dilihat.
 */
export function useCountdownTimer(onExpire: () => void): CountdownTimer {
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const deadlineRef = useRef(0);
  const remainingRef = useRef(0);
  const armedRef = useRef(false);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);

  // Callback terbaru disimpan di ref supaya interval tidak perlu dipasang ulang
  // setiap render (dan tidak ikut me-reset hitungannya).
  useEffect(() => {
    onExpireRef.current = onExpire;
  });

  const sync = useCallback((seconds: number) => {
    const safe = Math.max(0, Math.floor(seconds));

    deadlineRef.current = Date.now() + safe * 1000;
    remainingRef.current = safe;
    armedRef.current = true;
    expiredRef.current = false;

    setRemainingSeconds(safe);
  }, []);

  const syncFromServer = useCallback(
    (seconds: number) => {
      if (Math.max(0, Math.floor(seconds)) < remainingRef.current) {
        sync(seconds);
      }
    },
    [sync]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      if (!armedRef.current) {
        return;
      }

      const next = Math.max(
        0,
        Math.ceil((deadlineRef.current - Date.now()) / 1000)
      );

      if (next !== remainingRef.current) {
        remainingRef.current = next;
        setRemainingSeconds(next);
      }

      if (next === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpireRef.current();
      }
    }, TICK_MS);

    return () => clearInterval(timer);
  }, []);

  return { remainingSeconds, sync, syncFromServer };
}

/** mm:ss, atau h:mm:ss kalau ujiannya lebih dari sejam. */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  const pad = (value: number) => value.toString().padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

/** Durasi yang dibaca manusia, untuk halaman daftar & hasil ujian. */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} detik`;
  }

  return seconds === 0
    ? `${minutes} menit`
    : `${minutes} menit ${seconds} detik`;
}
