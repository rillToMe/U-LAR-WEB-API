import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Button from "./Button";
import IconButton from "./IconButton";

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

  function closeModal() {
    setConfirmClose(false);
    onClose();
  }

  function requestClose() {
    if (dirty) {
      setConfirmClose(true);
      return;
    }
    closeModal();
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup modal"
        onClick={requestClose}
        className="absolute inset-0 bg-fg/40"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${sizeClasses[size]} rounded-xl bg-surface shadow-xl max-md:flex max-md:max-h-dvh max-md:flex-col max-md:rounded-b-none`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b px-6 py-4 max-md:px-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-fg">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm text-fg-subtle">
                {description}
              </p>
            )}
          </div>

          <IconButton
            label="Tutup"
            onClick={requestClose}
            className="max-md:size-11"
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

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5 max-md:min-h-0 max-md:flex-1 max-md:px-4 max-md:py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end gap-3 border-t px-6 py-4 max-md:flex-col-reverse max-md:px-4 max-md:[&>button]:w-full">
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
          <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-xl bg-surface p-6 shadow-xl">
            <h3 className="text-base font-semibold text-fg">
              Keluar dari modal?
            </h3>
            <p className="mt-2 text-sm text-fg-subtle">
              Masih ada isian yang belum disimpan. Jika keluar,
              data yang sudah diketik akan hilang.
            </p>
            <div className="mt-6 flex justify-end gap-3 max-md:flex-col-reverse max-md:[&>button]:w-full">
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
                onClick={closeModal}
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