import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";
import {
  buttonBaseClass,
  buttonSizeClasses,
  buttonVariantClasses,
} from "./buttonStyles";

interface LinkButtonProps extends LinkProps {
  children: ReactNode;
  variant?: keyof typeof buttonVariantClasses;
  size?: keyof typeof buttonSizeClasses;
}

/**
 * Tautan yang tampil sebagai tombol.
 *
 * Halaman publik banyak mengarahkan pengguna ke halaman lain (materi, ujian,
 * panel admin), dan tautan itu harus tampil sebagai tombol - bukan tautan teks
 * yang mudah terlewat. Navigasinya tetap lewat `Link` supaya perpindahan
 * halaman tidak memuat ulang seluruh aplikasi.
 *
 * Gayanya diambil dari Button supaya tombol dan tautan-tombol tidak pernah
 * berbeda warna atau ukuran.
 */
export default function LinkButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: LinkButtonProps) {
  return (
    <Link
      className={`
        ${buttonBaseClass}
        ${buttonVariantClasses[variant]}
        ${buttonSizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </Link>
  );
}
