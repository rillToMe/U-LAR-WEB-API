import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantClasses = {
  primary:
    "bg-primary text-primary-fg hover:bg-primary-hover",
  secondary:
    "border border-border-strong bg-surface text-fg-muted hover:bg-surface-hover",
  danger:
    "bg-danger text-danger-fg hover:bg-danger-hover",
  ghost:
    "text-fg-subtle hover:bg-surface-hover",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex
        items-center
        justify-center
        rounded-lg
        font-medium
        transition
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? "Memproses..." : children}
    </button>
  );
}