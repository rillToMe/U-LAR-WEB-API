/**
 * Gaya bersama tombol.
 *
 * Dipisah dari `Button.tsx` karena aturan fast refresh: berkas komponen hanya
 * boleh mengekspor komponen. Polanya sama dengan `themeContext.ts` dan
 * `toastContext.ts` di components/common.
 *
 * Dipakai `Button` (tombol) dan `LinkButton` (tautan yang tampil sebagai
 * tombol) supaya keduanya tidak pernah berbeda warna atau ukuran.
 */

/* Hover hanya mengubah warna (tanpa transform/shadow) supaya feedback-nya
   jelas tapi tidak berlebihan. */
export const buttonVariantClasses = {
  primary: "bg-primary text-primary-fg hover:bg-primary-hover",
  secondary:
    "border border-border-strong bg-surface text-fg-muted hover:border-fg-placeholder hover:bg-surface-hover hover:text-fg",
  danger: "bg-danger text-danger-fg hover:bg-danger-hover",
  ghost: "text-fg-subtle hover:bg-surface-hover hover:text-fg",
};

export const buttonSizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
};

/** Gaya dasar tombol: bentuk, fokus, dan keadaan nonaktif. */
export const buttonBaseClass = `
        inline-flex
        items-center
        justify-center
        rounded-lg
        font-medium
        transition-colors
        duration-150
        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-ring
        disabled:pointer-events-none
        disabled:opacity-50
      `;
