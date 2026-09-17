import { useCallback, useEffect, useState } from "react";

/**
 * Menutup jalan pintas selama ujian berlangsung: klik kanan, copy, cut, paste,
 * dan drag. Seleksi teks sudah diblokir lewat kelas `.exam-locked` di
 * `styles/exam.css` supaya tidak perlu ikut menyentuh event `selectstart`.
 *
 * Catatan jujur: semua ini hanya mempersulit, bukan mencegah. Yang benar-benar
 * mengikat mahasiswa adalah waktu yang dihitung server dan pemeriksaan ulang
 * saat jawaban disimpan.
 */
export function useExamSecurity(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    function block(event: Event) {
      event.preventDefault();
    }

    const blockedEvents = [
      "contextmenu",
      "copy",
      "cut",
      "paste",
      "dragstart",
    ] as const;

    blockedEvents.forEach((name) =>
      document.addEventListener(name, block)
    );

    return () => {
      blockedEvents.forEach((name) =>
        document.removeEventListener(name, block)
      );
    };
  }, [enabled]);
}

export interface FullscreenGuard {
  supported: boolean;
  active: boolean;
  /** Harus dipanggil dari gesture pengguna (klik/tap), kalau tidak ditolak. */
  enter: () => void;
}

export function useFullscreen(): FullscreenGuard {
  // Request Fullscreen API tidak tersedia di Safari iOS versi HP — permintaan
  // izin jadi tombol mati, bukan sesuatu yang bisa diandalkan. Fitur ini
  // karena itu bersifat imbauan, bukan syarat ikut ujian.
  const [supported] = useState(
    () =>
      typeof document !== "undefined" &&
      typeof document.documentElement.requestFullscreen === "function"
  );

  const [active, setActive] = useState(
    () =>
      typeof document !== "undefined" &&
      document.fullscreenElement != null
  );

  useEffect(() => {
    function onChange() {
      setActive(document.fullscreenElement != null);
    }

    document.addEventListener("fullscreenchange", onChange);

    return () =>
      document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enter = useCallback(() => {
    if (!supported) {
      return;
    }

    void document.documentElement.requestFullscreen().catch(() => {
      // Ditolak browser: mode layar penuh memang tidak bisa dipaksakan.
    });
  }, [supported]);

  return { supported, active, enter };
}
