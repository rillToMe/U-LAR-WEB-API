import SkeletonImage from "../ui/SkeletonImage";
import type { ExamSessionQuestion } from "../../types/exam";

/** Status penyimpanan jawaban satu soal. */
export type SaveState = "idle" | "saving" | "saved" | "error";

interface QuestionCardProps {
  question: ExamSessionQuestion;
  /** Nomor urut tampil (1-based), bukan order_number dari database. */
  number: number;
  selectedOptionId: number | null;
  answerText: string;
  saveState: SaveState;
  /** Soal ini ditandai "ragu-ragu" oleh mahasiswa. */
  flagged: boolean;
  /** Penanda sedang dikirim ke server — tombolnya dikunci sementara. */
  flagging: boolean;
  onSelectOption: (optionId: number) => void;
  onChangeAnswerText: (value: string) => void;
  onToggleFlag: () => void;
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") {
    return null;
  }

  if (state === "saving") {
    return (
      <span
        role="status"
        className="inline-flex shrink-0 items-center gap-1.5 text-xs text-fg-subtle"
      >
        <span className="size-3 animate-spin rounded-full border-2 border-border-strong border-t-accent motion-reduce:animate-none" />
        Menyimpan
      </span>
    );
  }

  if (state === "saved") {
    return (
      <span
        role="status"
        className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-success-fg"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-3.5"
        >
          <path d="m5 13 4 4L19 7" />
        </svg>
        Tersimpan
      </span>
    );
  }

  return (
    <span
      role="status"
      className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-danger"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        aria-hidden="true"
        className="size-3.5"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v4M12 16h.01" />
      </svg>
      Gagal tersimpan
    </span>
  );
}

export default function QuestionCard({
  question,
  number,
  selectedOptionId,
  answerText,
  saveState,
  flagged,
  flagging,
  onSelectOption,
  onChangeAnswerText,
  onToggleFlag,
}: QuestionCardProps) {
  const isEssay = question.type === "essay";

  return (
    <article className="exam-locked rounded-2xl border border-border bg-surface p-4 shadow-sm lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-x-8 lg:p-6">
      {/* Kolom kiri (desktop): pernyataan soal. */}
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-surface px-2.5 py-1 text-xs font-semibold text-accent">
              Soal {number}
            </span>

            <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-fg-subtle">
              {isEssay ? "Uraian" : "Pilihan Ganda"}
            </span>
          </div>

          <SaveIndicator state={saveState} />
        </div>

        {question.image && (
          <SkeletonImage
            src={question.image}
            aspectRatio="16 / 9"
            className="mt-4 rounded-xl border border-border bg-surface-muted"
          />
        )}

        <p className="mt-4 whitespace-pre-line text-base leading-relaxed font-medium text-fg">
          {question.questionText}
        </p>
      </div>

      {/* Kolom kanan (desktop): tempat menjawab, di tengah vertikal supaya
          tidak tampak seperti kartu kosong yang terlalu tinggi. */}
      <div className="flex min-w-0 flex-col lg:justify-center lg:border-l lg:border-border lg:pl-8">
        <div className="mt-4 lg:mt-0">
          {isEssay ? (
            <div className="space-y-2">
              <textarea
                value={answerText}
                onChange={(event) =>
                  onChangeAnswerText(event.target.value)
                }
                rows={6}
                placeholder="Tulis jawaban Anda di sini..."
                aria-label={`Jawaban soal ${number}`}
                className="w-full resize-y rounded-xl border border-border-strong bg-surface p-4 text-sm leading-relaxed text-fg outline-none transition-colors duration-150 placeholder:text-fg-placeholder hover:border-fg-placeholder focus:border-accent focus:ring-2 focus:ring-accent-border"
              />

              <p className="text-xs text-fg-subtle">
                Jawaban tersimpan otomatis setelah Anda berhenti mengetik.
              </p>
            </div>
          ) : (
            <div
              role="radiogroup"
              aria-label={`Pilihan jawaban soal ${number}`}
              className="space-y-2.5"
            >
              {question.options.map((option) => {
                const checked = selectedOptionId === option.id;

                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring ${
                      checked
                        ? "border-accent bg-accent-surface"
                        : "border-border-strong bg-surface hover:border-accent-border hover:bg-surface-hover"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option.id}
                      checked={checked}
                      onChange={() => onSelectOption(option.id)}
                      className="sr-only"
                    />

                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150 ${
                        checked
                          ? "border-accent bg-accent"
                          : "border-border-strong"
                      }`}
                    >
                      {checked && (
                        <span className="size-2.5 rounded-full bg-accent-fg" />
                      )}
                    </span>

                    <span
                      className={`text-sm leading-relaxed ${
                        checked
                          ? "font-medium text-fg"
                          : "text-fg-muted"
                      }`}
                    >
                      {option.optionText}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Penanda ragu-ragu menempel di area jawaban — dekat dengan apa
            yang sedang ditinjau ulang, dan tidak menyita satu baris penuh
            di dasar kartu. */}
        <div className="mt-4 flex flex-col items-start gap-1.5">
          <button
            type="button"
            onClick={onToggleFlag}
            disabled={flagging}
            aria-pressed={flagged}
            className={`inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-60 ${
              flagged
                ? "border-warning-border bg-warning-surface text-warning"
                : "border-border-strong bg-surface text-fg-muted hover:bg-surface-hover"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill={flagged ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="size-4 shrink-0"
            >
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <path d="M4 22v-7" fill="none" />
            </svg>

            {flagged ? "Ditandai ragu-ragu" : "Tandai ragu-ragu"}
          </button>

          {flagged && (
            <p className="text-xs text-fg-subtle">
              Tekan lagi untuk melepas tandanya. Nomor soal ini
              ditampilkan kuning di navigasi soal.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
