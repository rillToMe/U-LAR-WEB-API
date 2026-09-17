import Button from "../ui/Button";
import BottomSheet from "../ui/BottomSheet";
import type { QuestionMarker } from "../../types/exam";

interface QuestionGridProps {
  markers: QuestionMarker[];
  /** Soal yang sedang dibuka diberi outline supaya posisinya jelas. */
  currentId?: number | null;
  onSelect: (questionId: number) => void;
}

export function QuestionGrid({
  markers,
  currentId,
  onSelect,
}: QuestionGridProps) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {markers.map((marker) => {
        const isCurrent = marker.id === currentId;

        // Warna menjawab status pengerjaan, sedangkan ragu-ragu selalu
        // berwarna kuning: penuh kalau sudah dijawab, pucat kalau belum.
        const tone = marker.flagged
          ? marker.answered
            ? "bg-warning text-warning-fg hover:bg-warning-hover"
            : "border border-warning-border bg-warning-surface text-warning hover:border-warning"
          : marker.answered
            ? "bg-success text-surface hover:bg-success-hover"
            : "border border-border-strong bg-surface text-fg-muted hover:border-accent-border hover:bg-surface-hover";

        const status = [
          marker.answered ? "sudah dijawab" : "belum dijawab",
          marker.flagged ? "ditandai ragu-ragu" : null,
        ]
          .filter(Boolean)
          .join(", ");

        return (
          <button
            key={marker.id}
            type="button"
            onClick={() => onSelect(marker.id)}
            aria-current={isCurrent ? "true" : undefined}
            aria-label={`Soal ${marker.number}, ${status}`}
            className={`flex h-11 min-w-11 items-center justify-center rounded-xl text-sm font-semibold tabular-nums transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${tone} ${
              isCurrent ? "outline-2 outline-offset-2 outline-ring" : ""
            }`}
          >
            {marker.number}
          </button>
        );
      })}
    </div>
  );
}

export function QuestionLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-fg-subtle">
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="size-3 rounded bg-success" />
        Terjawab
      </span>

      <span className="inline-flex items-center gap-2">
        <span
          aria-hidden="true"
          className="size-3 rounded border border-border-strong bg-surface"
        />
        Belum
      </span>

      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="flex items-center gap-0.5">
          <span className="size-3 rounded bg-warning" />
          <span className="size-3 rounded border border-warning-border bg-warning-surface" />
        </span>
        Ragu-ragu
        <span className="text-fg-placeholder">(penuh = terjawab)</span>
      </span>
    </div>
  );
}

interface QuestionNavigatorProps {
  open: boolean;
  onClose: () => void;
  markers: QuestionMarker[];
  currentId: number;
  answeredCount: number;
  flaggedCount: number;
  totalQuestions: number;
  onSelect: (questionId: number) => void;
  onSubmit: () => void;
}

/**
 * Panel "semua nomor soal" berbentuk bottom sheet — pola yang tepat di HP
 * karena seluruh isinya tetap terjangkau jempol. Selain untuk melompat antar
 * soal, di sinilah tombol kumpulkan ujian berada — jadi mahasiswa selalu
 * melihat status kelengkapan jawabannya sebelum menekan tombol itu.
 */
export default function QuestionNavigator({
  open,
  onClose,
  markers,
  currentId,
  answeredCount,
  flaggedCount,
  totalQuestions,
  onSelect,
  onSubmit,
}: QuestionNavigatorProps) {
  const unansweredCount = totalQuestions - answeredCount;
  const lastMarker = markers[markers.length - 1];
  const onLastQuestion =
    lastMarker !== undefined && lastMarker.id === currentId;

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Navigasi Soal"
      description={`${answeredCount} dari ${totalQuestions} soal sudah dijawab.`}
      // Kumpulkan hanya boleh terjangkau dari soal terakhir. Dari soal
      // lain, tombol ini cuma menuntun ke sana.
      footer={
        onLastQuestion ? (
          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={onSubmit}
          >
            Kumpulkan Ujian
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => onSelect(lastMarker.id)}
          >
            Ke Soal Terakhir →
          </Button>
        )
      }
    >
      <div className="space-y-4">
        <QuestionLegend />

        <QuestionGrid
          markers={markers}
          currentId={currentId}
          onSelect={onSelect}
        />

        {/* Dua-duanya butuh perhatian, jadi dikumpulkan dalam satu kartu
            supaya sheet tidak penuh peringatan yang mirip. */}
        {(flaggedCount > 0 || unansweredCount > 0) && (
          <div className="space-y-1 rounded-xl border border-warning-border bg-warning-surface px-3 py-2.5 text-xs text-fg-muted">
            {flaggedCount > 0 && (
              <p>
                <span className="font-semibold text-warning">
                  {flaggedCount} soal
                </span>{" "}
                ditandai ragu-ragu - ditampilkan kuning di atas, periksa
                lagi sebelum dikumpulkan.
              </p>
            )}

            {unansweredCount > 0 && (
              <p>
                <span className="font-semibold text-warning">
                  {unansweredCount} soal
                </span>{" "}
                belum dijawab - nilainya dihitung nol kalau dikumpulkan
                sekarang.
              </p>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  );
}
