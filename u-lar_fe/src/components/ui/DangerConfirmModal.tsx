import { useState } from "react";
import type { ReactNode } from "react";
import Button from "./Button";
import Modal from "./Modal";

interface DangerConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;

  /** Judul dialog, mis. "Hapus admin". */
  title: string;

  /** Nama yang harus diketik ulang untuk mengonfirmasi, mis. username. */
  confirmPhrase: string;

  /** Ringkasan singkat yang tampil di langkah pertama. */
  summary?: ReactNode;

  /** Rincian akibat, tampil di langkah kedua. */
  effects: ReactNode;

  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
}

type Step = "intent" | "effects" | "type";

/**
 * Konfirmasi tindakan destruktif ala GitHub, tiga langkah.
 *
 * Delete student/admin tidak bisa dibatalkan, jadi satu klik "Ya" terlalu
 * rawan salah target. Alurnya sengaja memaksa membaca dari niat → akibat →
 * ketik nama, persis seperti GitHub untuk delete repository.
 *
 * ConfirmModal biasa (satu klik) masih cukup untuk tindakan yang tidak
 * merusak data, mis. keluar dari panel.
 */
export default function DangerConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  confirmPhrase,
  summary,
  effects,
  confirmLabel,
  cancelLabel = "Batal",
  loading = false,
}: DangerConfirmModalProps) {
  const [step, setStep] = useState<Step>("intent");
  const [typed, setTyped] = useState("");

  // Dialog yang ditutup lalu dibuka lagi harus mulai dari langkah pertama,
  // bukan menyisakan ketikan dari percobaan sebelumnya.
  function handleClose() {
    if (loading) {
      return;
    }

    setStep("intent");
    setTyped("");
    onClose();
  }

  const typedMatches = typed.trim() === confirmPhrase;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      description={step === "type" ? `Ketik "${confirmPhrase}" untuk melanjutkan.` : undefined}
      size="sm"
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            {step === "intent" ? cancelLabel : "Kembali"}
          </Button>

          {step === "intent" && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep("effects")}
            >
              Saya ingin menghapus
            </Button>
          )}

          {step === "effects" && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep("type")}
            >
              Saya mengerti akibatnya
            </Button>
          )}

          {step === "type" && (
            <Button
              type="button"
              variant="danger"
              onClick={onConfirm}
              loading={loading}
              disabled={!typedMatches}
            >
              {confirmLabel}
            </Button>
          )}
        </>
      }
    >
      {step === "intent" && summary}

      {step === "effects" && (
        <>
          <div className="mb-4 flex gap-3 rounded-lg border border-warning-border bg-warning-surface p-3.5">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="size-5 shrink-0 text-warning"
            >
              <path d="M12 9v4M12 17h.01" />
              <path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
            </svg>

            <p className="text-sm leading-6 text-fg">
              Tindakan ini tidak bisa dibatalkan. Baca dulu akibatnya.
            </p>
          </div>

          <div className="text-sm leading-6 text-fg-muted">{effects}</div>
        </>
      )}

      {step === "type" && (
        <input
          type="text"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          placeholder={confirmPhrase}
          aria-label={`Ketik ${confirmPhrase} untuk konfirmasi`}
          autoComplete="off"
          autoFocus
          className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-fg-placeholder hover:border-fg-placeholder focus:border-danger focus:ring-2 focus:ring-danger-border"
        />
      )}
    </Modal>
  );
}
