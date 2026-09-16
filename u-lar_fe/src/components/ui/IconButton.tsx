import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Nama tombol untuk screen reader — wajib karena isinya hanya ikon. */
  label: string;
  variant?: "ghost" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

/* Hover cuma mengubah warna: tanpa scale/translate supaya tidak berlebihan. */
const variantClasses = {
  ghost:
    "text-fg-subtle hover:bg-surface-hover hover:text-fg active:bg-surface",
  secondary:
    "border border-border bg-surface text-fg-subtle hover:border-border-strong hover:bg-surface-hover hover:text-fg",
  danger: "text-fg-subtle hover:bg-danger-surface hover:text-danger",
};

const sizeClasses = {
  sm: "size-8 rounded-lg",
  md: "size-9 rounded-lg",
  lg: "size-11 rounded-lg",
};

export default function IconButton({
  children,
  label,
  variant = "ghost",
  size = "md",
  className = "",
  type = "button",
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={`
        inline-flex
        shrink-0
        items-center
        justify-center
        transition-colors
        duration-150
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-ring
        disabled:pointer-events-none
        disabled:opacity-50
        motion-reduce:transition-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
