import { useEffect } from "react";

/**
 * Penghitung overlay yang terbuka. Modal bisa menumpuk (mis. dialog
 * konfirmasi di atas modal lain), jadi kunci scroll hanya dibuka saat overlay
 * terakhir ikut ditutup — bukan saat salah satu saja ditutup.
 */
let lockCount = 0;
let previousBodyOverflow = "";
let previousHtmlOverflow = "";
let previousBodyPaddingRight = "";

function lockScroll() {
  lockCount += 1;

  if (lockCount > 1) {
    return;
  }

  // Hilangnya scrollbar membuat layout bergeser ke kanan; padding ini
  // mengompensasinya supaya isi halaman tidak "melompat" saat modal dibuka.
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;

  previousBodyOverflow = document.body.style.overflow;
  previousHtmlOverflow = document.documentElement.style.overflow;
  previousBodyPaddingRight = document.body.style.paddingRight;

  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

function unlockScroll() {
  lockCount -= 1;

  if (lockCount > 0) {
    return;
  }

  lockCount = 0;
  document.body.style.overflow = previousBodyOverflow;
  document.documentElement.style.overflow = previousHtmlOverflow;
  document.body.style.paddingRight = previousBodyPaddingRight;
}

/**
 * Mengunci scroll halaman di belakang overlay selama `active` bernilai true.
 * Dipakai modal dan laci menu di HP supaya halaman di belakangnya tidak ikut
 * bergerak saat pengguna menggulir.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) {
      return;
    }

    lockScroll();

    return unlockScroll;
  }, [active]);
}
