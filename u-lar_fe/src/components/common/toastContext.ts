import { createContext, useContext } from "react";

export type ToastVariant = "success" | "error" | "info";

export interface ToastOptions {
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastContextValue {
  /** Kirim notifikasi dengan pengaturan paling bebas. */
  notify: (message: string, options?: ToastOptions) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  dismiss: (id: number) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Dipakai untuk memunculkan notifikasi dari komponen mana pun, tanpa perlu
 * menaruh elemen notifikasi di dalam layout halaman.
 *
 *   const toast = useToast();
 *   toast.success("Mahasiswa berhasil diaktifkan.");
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast harus dipakai di dalam <ToastProvider>.");
  }

  return context;
}
