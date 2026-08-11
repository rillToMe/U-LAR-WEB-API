import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
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
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup modal"
        onClick={onClose}
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
            onClick={onClose}
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
    </div>
  );
}