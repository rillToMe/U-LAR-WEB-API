import { formatCountdown } from "../../hooks/useCountdownTimer";

/** Sisa waktu di bawah 5 menit mulai diberi warna peringatan. */
const WARNING_SECONDS = 5 * 60;

/** Satu menit terakhir ditandai bahaya dan diberi denyut. */
const DANGER_SECONDS = 60;

interface ExamHeaderProps {
  examTitle: string;
  questionNumber: number;
  totalQuestions: number;
  answeredCount: number;
  remainingSeconds: number;
}

/* Warna indikator, bukan angkanya, yang memberi tahu waktu menipis — supaya
   tidak perlu membaca angka untuk sadar waktu hampir habis. */
const timerTones = {
  normal: "border-border-strong bg-surface-hover text-fg",
  warning: "border-warning-border bg-warning-surface text-warning",
  danger: "border-danger-border bg-danger-surface text-danger",
} as const;

export default function ExamHeader({
  examTitle,
  questionNumber,
  totalQuestions,
  answeredCount,
  remainingSeconds,
}: ExamHeaderProps) {
  const tone =
    remainingSeconds <= DANGER_SECONDS
      ? "danger"
      : remainingSeconds <= WARNING_SECONDS
        ? "warning"
        : "normal";

  const progress =
    totalQuestions === 0
      ? 0
      : Math.round((answeredCount / totalQuestions) * 100);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto w-full max-w-md px-4 py-3 lg:max-w-7xl lg:px-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-fg">
              {examTitle}
            </p>

            <p className="mt-0.5 text-xs text-fg-subtle">
              Soal {questionNumber} dari {totalQuestions}
            </p>
          </div>

          <div
            role="timer"
            aria-label={`Sisa waktu ${formatCountdown(remainingSeconds)}`}
            className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 ${
              timerTones[tone]
            } ${
              tone === "danger"
                ? "motion-safe:animate-pulse"
                : ""
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="size-4"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5V12l3 1.8" />
            </svg>

            <span className="text-sm font-semibold tabular-nums">
              {formatCountdown(remainingSeconds)}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div
            role="progressbar"
            aria-label="Soal yang sudah dijawab"
            aria-valuemin={0}
            aria-valuemax={totalQuestions}
            aria-valuenow={answeredCount}
            className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover"
          >
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>

          <span className="shrink-0 text-xs font-medium tabular-nums text-fg-subtle">
            {answeredCount}/{totalQuestions}
          </span>
        </div>
      </div>
    </header>
  );
}
