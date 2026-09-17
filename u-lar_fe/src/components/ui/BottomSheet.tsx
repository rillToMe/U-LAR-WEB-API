import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import IconButton from "./IconButton";
import { useBodyScrollLock } from "../../hooks/useBodyScrollLock";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Menempel di dasar sheet, selalu terlihat tanpa menggulir. */
  footer?: ReactNode;
}

/** Jarak minimal (px) sebelum sapuan ke bawah dianggap niat menutup. */
const DISMISS_THRESHOLD_PX = 80;

/** Durasi transisi masuk/keluar sheet — harus sinkron dengan CSS. */
const TRANSITION_MS = 220;

/**
 * Lembaran yang naik dari dasar layar, pola standar pilihan di HP untuk
 * keputusan sekali lihat. Berbeda dari Modal (dialog di tengah di desktop),
 * sheet ini selalu menempel dasar — di desktop dibatasi lebarnya dan tetap
 * di bawah.
 *
 * Interaksi sentuh yang didukung:
 * - Sapuan ke bawah pada drag handle (atau header) menutup sheet, jari
 *   diikuti dengan sedikit perlawanan (rubber-band).
 * - Sapuan pelan tidak menutup — sheet memantul kembali ke posisinya.
 *
 * Animasi keluar (semua jalur tutup, termasuk tombol X dan backdrop) adalah
 * transisi transform ke bawah layar, lalu `onClose` dipanggil setelah
 * transisinya selesai supaya unmount tidak memotong animasi.
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: BottomSheetProps) {
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  /** Sheet sedang memainkan animasi keluar; `open` masih true di parent. */
  const [closing, setClosing] = useState(false);
  /** Posisi sheet saat animasi keluar dimulai (px dari posisi terbuka). */
  const [exitFrom, setExitFrom] = useState(0);

  /** Titik awal sapuan; null berarti tidak sedang menyeret. */
  const dragStartRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  useBodyScrollLock(open);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // Escape untuk desktop; sepenuhnya pelengkap, di HP memang tidak ada.
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  /**
   * Memainkan animasi keluar dari posisi `fromOffset` px ke bawah layar,
   * lalu memanggil `onClose` setelah transisi selesai. Reset `closing`
   * dilakukan di callback yang sama — bukan di effect — supaya state sudah
   * bersih saat parent mengubah `open` menjadi false.
   */
  const closeWithAnimation = useCallback(
    (fromOffset: number) => {
      if (closing) {
        return;
      }

      setClosing(true);
      setDragging(false);
      setExitFrom(fromOffset);

      closeTimerRef.current = window.setTimeout(() => {
        closeTimerRef.current = null;
        setClosing(false);
        setDragOffset(0);
        onClose();
      }, TRANSITION_MS);
    },
    [closing, onClose]
  );

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    if (closeTimerRef.current !== null) {
      return;
    }

    dragStartRef.current = event.touches[0].clientY;
    setDragging(true);
  }, []);

  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    const startY = dragStartRef.current;

    if (startY === null) {
      return;
    }

    const delta = event.touches[0].clientY - startY;

    if (delta > 0) {
      // Mengikuti jari dengan perlawanan (rubber-band), bukan 1:1.
      setDragOffset(delta * 0.6);
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const startY = dragStartRef.current;

    dragStartRef.current = null;
    setDragging(false);

    if (startY === null) {
      return;
    }

    setDragOffset((offset) => {
      if (offset > DISMISS_THRESHOLD_PX) {
        closeWithAnimation(offset);
        return offset;
      }

      // Belapak memantul kembali ke posisi semula.
      return 0;
    });
  }, [closeWithAnimation]);

  if (!open && !closing) {
    return null;
  }

  // Saat menutup: transisi bergerak dari posisi terakhir ke bawah layar.
  const position = closing ? exitFrom : dragOffset;
  const exitTransform = closing
    ? `translateY(${window.innerHeight}px)`
    : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup"
        onClick={closing ? undefined : () => closeWithAnimation(0)}
        disabled={closing}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 motion-reduce:transition-none ${
          closing ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={
          dragging || exitTransform === undefined
            ? {
                transform: `translateY(${position}px)`,
                transition: dragging
                  ? "none"
                  : `transform ${TRANSITION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
              }
            : {
                transform: exitTransform,
                transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.32, 0.72, 0, 1)`,
              }
        }
        className={`relative flex max-h-[88dvh] w-full max-w-md flex-col rounded-t-2xl bg-surface shadow-2xl pb-[env(safe-area-inset-bottom)] ${
          closing
            ? ""
            : "animate-[exam-sheet-up_220ms_cubic-bezier(0.32,0.72,0,1)_both] motion-reduce:animate-none"
        }`}
      >
        {/* Drag handle + header: satu area sapuan yang sama */}
        <div
          className="shrink-0 touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex justify-center pt-2.5 pb-1">
            <span
              aria-hidden="true"
              className="h-1.5 w-12 rounded-full bg-border-strong"
            />
          </div>

          <div className="flex items-start justify-between gap-3 px-5 pb-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-fg">{title}</h2>

              {description && (
                <p className="mt-1 text-sm text-fg-subtle">{description}</p>
              )}
            </div>

            <IconButton
              label="Tutup"
              onClick={
                closing ? undefined : () => closeWithAnimation(position)
              }
              disabled={closing}
              className="size-11 shrink-0"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
                className="size-5"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </IconButton>
          </div>
        </div>

        {/* Isi yang menggulir. overscroll-contain menahan sisa gulir supaya
            tidak merambat ke halaman di belakang sheet. */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
          {children}
        </div>

        {/* Footer menempel di dasar: tombol keputusan selalu terjangkau
            jempol tanpa menggulir dulu. */}
        {footer && (
          <div className="shrink-0 border-t px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
