import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { QuestionGrid, QuestionLegend } from "./QuestionNavigator";
import { formatCountdown } from "../../hooks/useCountdownTimer";
import type { QuestionMarker } from "../../types/exam";

interface SubmitConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  submitting: boolean;
  markers: QuestionMarker[];
  currentId: number | null;
  totalQuestions: number;
  answeredCount: number;
  pendingEssayCount: number;
  remainingSeconds: number;
  /** Melompat ke soal yang dipilih — dipakai untuk soal yang belum dijawab. */
  onSelect: (questionId: number) => void;
}

/**
 * Konfirmasi akhir sebelum ujian dikumpulkan. Isinya sengaja lengkap: berapa
 * soal yang terjawab, nomor mana saja yang masih kosong (dan bisa langsung
 * dibuka), serta berapa soal uraian yang menunggu penilaian manual — supaya
 * tidak ada jawaban yang tertinggal karena salah tekan.
 */
export default function SubmitConfirmModal({
  open,
  onClose,
  onConfirm,
  submitting,
  markers,
  currentId,
  totalQuestions,
  answeredCount,
  pendingEssayCount,
  remainingSeconds,
  onSelect,
}: SubmitConfirmModalProps) {
  const unansweredCount = totalQuestions - answeredCount;
  const unansweredNumbers = markers
    .filter((marker) => !marker.answered)
    .map((marker) => marker.number);
  const flaggedNumbers = markers
    .filter((marker) => marker.flagged)
    .map((marker) => marker.number);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Kumpulkan ujian sekarang?"
      description="Periksa sekali lagi - jawaban tidak bisa diubah setelah dikumpulkan."
      size="md"
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Periksa Lagi
          </Button>

          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            loading={submitting}
          >
            Kumpulkan Sekarang
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Ringkasan angka */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-success-border bg-success-surface px-4 py-3">
            <p className="text-2xl font-bold tabular-nums text-success-fg">
              {answeredCount}
            </p>
            <p className="mt-0.5 text-xs font-medium text-fg-muted">
              Sudah dijawab
            </p>
          </div>

          <div
            className={`rounded-xl border px-4 py-3 ${
              unansweredCount > 0
                ? "border-warning-border bg-warning-surface"
                : "border-border bg-surface-hover"
            }`}
          >
            <p
              className={`text-2xl font-bold tabular-nums ${
                unansweredCount > 0 ? "text-warning" : "text-fg"
              }`}
            >
              {unansweredCount}
            </p>
            <p className="mt-0.5 text-xs font-medium text-fg-muted">
              Belum dijawab
            </p>
          </div>
        </div>

        {/* Peringatan soal kosong, lengkap dengan nomornya */}
        {unansweredCount > 0 && (
          <div
            role="alert"
            className="rounded-xl border border-warning-border bg-warning-surface p-4"
          >
            <p className="text-sm font-semibold text-fg">
              Masih ada {unansweredCount} soal yang belum dijawab
            </p>

            <p className="mt-1 text-xs text-fg-muted">
              Nomor: {unansweredNumbers.join(", ")}. Soal yang tidak
              dijawab dihitung salah - tekan nomornya untuk kembali
              mengerjakan.
            </p>

            <div className="mt-3">
              <QuestionGrid
                markers={markers}
                currentId={currentId}
                onSelect={onSelect}
              />
            </div>
          </div>
        )}

        {unansweredCount === 0 && (
          <div className="rounded-xl border border-border bg-surface-muted p-4">
            <p className="text-sm font-medium text-fg">
              Semua soal sudah dijawab.
            </p>

            <p className="mt-1 text-xs text-fg-subtle">
              Tekan nomor soal di bawah kalau ingin memeriksa ulang
              jawaban Anda.
            </p>

            <div className="mt-3">
              <QuestionGrid
                markers={markers}
                currentId={currentId}
                onSelect={onSelect}
              />
            </div>
          </div>
        )}

        <QuestionLegend />

        {flaggedNumbers.length > 0 && (
          <p className="rounded-xl border border-warning-border bg-warning-surface px-3 py-2.5 text-xs text-fg-muted">
            <span className="font-semibold text-warning">
              {flaggedNumbers.length} soal
            </span>{" "}
            masih ditandai ragu-ragu: nomor{" "}
            {flaggedNumbers.join(", ")}. Anda tetap bisa mengumpulkan
            sekarang.
          </p>
        )}

        {pendingEssayCount > 0 && (
          <p className="rounded-xl border border-accent-border bg-accent-surface px-3 py-2.5 text-xs text-fg-muted">
            <span className="font-semibold text-accent">
              {pendingEssayCount} soal uraian
            </span>{" "}
            akan dinilai manual, jadi nilainya belum ikut terhitung.
          </p>
        )}

        <p className="text-xs text-fg-subtle">
          Sisa waktu saat ini{" "}
          <span className="font-medium tabular-nums text-fg-muted">
            {formatCountdown(remainingSeconds)}
          </span>
          . Anda tidak perlu menghabiskan waktunya.
        </p>
      </div>
    </Modal>
  );
}
