import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  buttonBaseClass,
  buttonSizeClasses,
  buttonVariantClasses,
} from "./buttonStyles";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: keyof typeof buttonVariantClasses;
  size?: keyof typeof buttonSizeClasses;
  loading?: boolean;
}

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
        ${buttonBaseClass}
        ${buttonVariantClasses[variant]}
        ${buttonSizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? "Memproses..." : children}
    </button>
  );
}
