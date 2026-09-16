import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import IconButton from "./IconButton";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  id,
  type,
  className = "",
  ...props
}: InputProps) {
  const [reveal, setReveal] = useState(false);

  const isPassword = type === "password";

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-fg-muted"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={id}
          type={isPassword && reveal ? "text" : type}
          className={`
            w-full
            rounded-lg
            border
            px-3
            py-2.5
            text-sm
            bg-surface
            text-fg
            outline-none
            transition
            focus:ring-2
            ${isPassword ? "pr-11" : ""}
            ${
              error
                ? "border-danger focus:border-danger focus:ring-danger-border"
                : "border-border-strong focus:border-accent focus:ring-accent-border"
            }
            ${className}
          `}
          {...props}
        />

        {isPassword && (
          <IconButton
            onClick={() => setReveal((value) => !value)}
            label={
              reveal
                ? "Sembunyikan password"
                : "Tampilkan password"
            }
            aria-pressed={reveal}
            className="absolute right-1 top-1/2 -translate-y-1/2"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="size-5"
            >
              {reveal ? (
                <path d="M3.98 8.22A10.48 10.48 0 0 0 1.93 12c1.29 4.34 5.31 7.5 10.07 7.5.99 0 1.95-.14 2.86-.4M6.23 6.23A10.45 10.45 0 0 1 12 4.5c4.76 0 8.77 3.16 10.07 7.5a10.52 10.52 0 0 1-4.3 5.77M6.23 6.23 3 3m3.23 3.23 3.65 3.65m7.89 7.89L21 21m-3.23-3.23-3.65-3.65m0 0a3 3 0 1 0-4.24-4.24" />
              ) : (
                <>
                  <path d="M2.04 12.32a1.01 1.01 0 0 1 0-.64C3.42 7.51 7.36 4.5 12 4.5c4.64 0 8.57 3.01 9.96 7.18.07.21.07.43 0 .64-1.39 4.17-5.32 7.18-9.96 7.18-4.64 0-8.58-3.01-9.96-7.18Z" />
                  <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </>
              )}
            </svg>
          </IconButton>
        )}
      </div>

      {error && (
        <p className="text-sm text-danger">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="text-xs text-fg-subtle">
          {helperText}
        </p>
      )}
    </div>
  );
}
