import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import IconButton from "../ui/IconButton";
import { ToastContext } from "./toastContext";
import type { ToastVariant } from "./toastContext";

/** Lama notifikasi tampil sebelum menutup sendiri (ms). */
const AUTO_DISMISS: Record<ToastVariant, number> = {
  success: 4000,
  info: 4500,
  error: 6500,
};

/** Harus sama dengan `duration-300` pada kelas animasi di bawah. */
const EXIT_DURATION = 300;

/** Batas notifikasi yang menumpuk supaya layar tidak penuh. */
const MAX_TOASTS = 4;

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
  duration: number;
}

const toneStyles: Record<
  ToastVariant,
  { card: string; icon: string }
> = {
  success: {
    card: "border-success-border bg-success-surface",
    icon: "text-success-fg",
  },
  error: {
    card: "border-danger-border bg-danger-surface",
    icon: "text-danger",
  },
  info: {
    card: "border-accent-border bg-accent-surface",
    icon: "text-accent",
  },
};

function ToastIcon({ variant }: { variant: ToastVariant }) {
  const iconProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    className: "size-4",
  } as const;

  if (variant === "success") {
    return (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="m8.5 12.5 2.5 2.5 4.5-5" />
      </svg>
    );
  }

  if (variant === "error") {
    return (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
    );
  }

  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

/**
 * Kartu notifikasi yang meluncur masuk dari sisi kanan, menutup sendiri
 * setelah `duration`, lalu meluncur keluar. Bisa dipakai lepas dari
 * `<ToastProvider>` — cukup render dengan `onDismiss` yang membuangnya dari
 * state pemanggil (dipanggil setelah animasi keluar selesai).
 */
export function Toast({
  message,
  variant = "info",
  duration,
  onDismiss,
}: {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onDismiss: () => void;
}) {
  const [state, setState] = useState<"enter" | "open" | "leave">(
    "enter"
  );

  // Simpan callback terakhir di ref supaya timer tidak ikut di-reset hanya
  // karena pemanggil mengirim arrow function baru.
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  // Animasi masuk baru jalan kalau elemen sempat dirender dalam keadaan
  // tersembunyi lebih dulu.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setState("open"));

    return () => cancelAnimationFrame(frame);
  }, []);

  const autoDismiss = duration ?? AUTO_DISMISS[variant];

  useEffect(() => {
    if (state !== "open") {
      return;
    }

    const timer = setTimeout(() => setState("leave"), autoDismiss);

    return () => clearTimeout(timer);
  }, [state, autoDismiss]);

  // Beri tahu pemanggil setelah animasi keluar selesai.
  useEffect(() => {
    if (state !== "leave") {
      return;
    }

    const timer = setTimeout(
      () => onDismissRef.current(),
      EXIT_DURATION
    );

    return () => clearTimeout(timer);
  }, [state]);

  const isVisible = state === "open";

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border p-4 shadow-lg transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${
        toneStyles[variant].card
      } ${
        isVisible
          ? "translate-x-0 opacity-100"
          : "translate-x-[calc(100%_+_1rem)] opacity-0"
      }`}
    >
      <span
        className={`flex size-7 shrink-0 items-center justify-center rounded-full bg-surface ${toneStyles[variant].icon}`}
      >
        <ToastIcon variant={variant} />
      </span>

      <p className="flex-1 pt-1 text-sm font-medium text-fg">
        {message}
      </p>

      <IconButton
        size="sm"
        onClick={() => setState("leave")}
        label="Tutup notifikasi"
        title="Tutup notifikasi"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-4"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </IconButton>
    </div>
  );
}

/**
 * Menyediakan `useToast()` untuk seluruh aplikasi. Pasang sekali di akar
 * aplikasi: notifikasi ditampilkan lewat portal di atas halaman mana pun
 * (termasuk saat modal terbuka) sehingga tidak menggeser layout dashboard.
 *
 * Setiap notifikasi pada dasarnya pesan yang sama dengan yang dulu ditulis
 * sebagai banner di dalam halaman, jadi satu tempat untuk semua info.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextIdRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) =>
      current.filter((toast) => toast.id !== id)
    );
  }, []);

  const notify = useCallback(
    (
      message: string,
      options?: { variant?: ToastVariant; duration?: number }
    ) => {
      const variant = options?.variant ?? "info";

      setToasts((current) => [
        ...current.slice(-(MAX_TOASTS - 1)),
        {
          id: (nextIdRef.current += 1),
          message,
          variant,
          duration: options?.duration ?? AUTO_DISMISS[variant],
        },
      ]);
    },
    []
  );

  const value = useMemo(
    () => ({
      notify,
      dismiss,
      success: (message: string) =>
        notify(message, { variant: "success" as const }),
      error: (message: string) =>
        notify(message, { variant: "error" as const }),
      info: (message: string) =>
        notify(message, { variant: "info" as const }),
    }),
    [notify, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {createPortal(
        <div className="pointer-events-none fixed right-4 top-4 z-[70] flex w-[min(24rem,calc(100vw_-_2rem))] flex-col gap-3">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              variant={toast.variant}
              duration={toast.duration}
              onDismiss={() => dismiss(toast.id)}
            />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
