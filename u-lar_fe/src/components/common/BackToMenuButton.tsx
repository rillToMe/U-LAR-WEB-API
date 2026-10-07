import { useState } from "react";
import Button from "../ui/Button";
import ConfirmModal from "../ui/ConfirmModal";
import { closeWebView, isRunningInUnity } from "../../lib/unityBridge";

interface BackToMenuButtonProps {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;

  /**
   * Kalau diisi, student diminta konfirmasi dulu sebelum WebView ditutup.
   *
   * Diperakai di halaman sesi ujian: keluar di tengah pengerjaan menyisakan
   * waktu di server yang tetap berjalan, jadi student sebaiknya tahu
   * konsekuensinya sebelum menekan.
   */
  confirm?: {
    title: string;
    description: string;
  };
}

/**
 * Tombol "Kembali ke Menu" - menutup WebView dan balik ke scene MainMenu.
 *
 * Di browser biasa komponen ini tidak merender apa pun: student yang membuka
 * /ujian atau /materi di HP sendiri tidak punya game untuk kembali ke sana, jadi
 * menampilkan tombol hanya akan membuat mereka mencari tombol yang tidak pernah
 * bekerja.
 */
export default function BackToMenuButton({
  variant = "secondary",
  size = "sm",
  className,
  confirm,
}: BackToMenuButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!isRunningInUnity()) {
    return null;
  }

  function leave() {
    setConfirmOpen(false);

    closeWebView();
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => {
          if (confirm === undefined) {
            closeWebView();

            return;
          }

          setConfirmOpen(true);
        }}
      >
        Kembali ke Menu
      </Button>

      {confirm !== undefined && (
        <ConfirmModal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={leave}
          title={confirm.title}
          description={confirm.description}
          confirmLabel="Iya, Kembali ke Menu"
          cancelLabel="Lanjut Mengerjakan"
        />
      )}
    </>
  );
}
