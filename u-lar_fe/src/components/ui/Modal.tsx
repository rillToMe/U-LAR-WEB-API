import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Button from "./Button";

let modalStack: number[] = [];
let nextModalId = 0;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  dirty?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  dirty = false,
}: ModalProps) {
  const [confirmClose, setConfirmClose] = useState(false);
  const instanceId = useRef(0);

  useEffect(() => {
    if (!open) {
      setConfirmClose(false);
      return;
    }

    const id = ++nextModalId;
    instanceId.current = id;
    modalStack.push(id);

    return () => {
      modalStack = modalStack.filter((item) => item !== id);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (
        modalStack[modalStack.length - 1] !==
        instanceId.current
      ) {
        return;
      }

      if (confirmClose) {
        setConfirmClose(false);
        return;
      }

      if (dirty) {
        setConfirmClose(true);
        return;
      }

      onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, confirmClose, dirty, onClose]);

  function requestClose() {
    if (dirty) {
      setConfirmClose(true);
      return;
    }
    onClose();
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup modal"
        onClick={requestClose}
        className="absolute inset-0 bg-fg/40"
      />

      {/* Modal */}
      <div
        className={`relative w-full ${sizeClasses[size]} rounded-xl bg-surface shadow-xl`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-fg">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm text-fg-subtle">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={requestClose}
            className="rounded-lg px-2 py-1 text-fg-subtle hover:bg-surface-hover hover:text-fg"
            aria-label="Tutup"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 border-t px-6 py-4">
            {footer}
          </div>
        )}
      </div>

      {/* Unsaved changes confirm */}
      {confirmClose && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Batalkan"
            onClick={() => setConfirmClose(false)}
            className="absolute inset-0 bg-fg/40"
          />
          <div className="relative w-full max-w-sm rounded-xl bg-surface p-6 shadow-xl">
            <h3 className="text-base font-semibold text-fg">
              Keluar dari modal?
            </h3>
            <p className="mt-2 text-sm text-fg-subtle">
              Masih ada isian yang belum disimpan. Jika keluar,
              data yang sudah diketik akan hilang.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setConfirmClose(false)}
              >
                Tetap di Sini
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={onClose}
              >
                Keluar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}