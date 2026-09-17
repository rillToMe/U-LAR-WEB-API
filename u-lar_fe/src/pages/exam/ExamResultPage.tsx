import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../components/common/toastContext";
import { formatDuration } from "../../hooks/useCountdownTimer";
import { getApiErrorMessage } from "../../services/apiError";
import { getExamSummary } from "../../services/examApi";
import type { ExamSummary, SubmitExamItem } from "../../types/exam";

/** Ikon status tiap soal pada daftar tinjauan hasil. */
function ItemStatus({ item }: { item: SubmitExamItem }) {
  if (item.type === "essay") {
    return (
      <span className="shrink-0 rounded-full bg-accent-surface px-2 py-0.5 text-[11px] font-medium text-accent">
        {item.answered ? "Menunggu nilai" : "Tidak dijawab"}
      </span>
    );
  }

  if (!item.answered) {
    return (
      <span className="shrink-0 rounded-full bg-surface-hover px-2 py-0.5 text-[11px] font-medium text-fg-subtle">
        Tidak dijawab
      </span>
    );
  }

  return item.isCorrect ? (
    <span className="shrink-0 rounded-full bg-success-surface px-2 py-0.5 text-[11px] font-medium text-success-fg">
      Benar
    </span>
  ) : (
    <span className="shrink-0 rounded-full bg-danger-surface px-2 py-0.5 text-[11px] font-medium text-danger">
      Salah
    </span>
  );
}

function StatBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "danger" | "muted" | "accent";
}) {
  const toneClasses = {
    success: "border-success-border bg-success-surface text-success-fg",
    danger: "border-danger-border bg-danger-surface text-danger",
    muted: "border-border bg-surface-muted text-fg",
    accent: "border-accent-border bg-accent-surface text-accent",
  } as const;

  return (
    <div className={`rounded-xl border px-3 py-3 ${toneClasses[tone]}`}>
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-[11px] font-medium text-fg-muted">
        {label}
      </p>
    </div>
  );
}

export default function ExamResultPage() {
  const { resultId: resultIdParam } = useParams<{
    resultId: string;
  }>();
  const resultId = Number(resultIdParam);
  const navigate = useNavigate();
  const toast = useToast();

  const [summary, setSummary] = useState<ExamSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getExamSummary(resultId)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setSummary(data);
        setError("");
      })
      .catch((loadError) => {
        if (cancelled) {
          return;
        }

        // Ujian belum dikumpulkan — kembalikan ke halaman pengerjaan.
        if (
          isAxiosError(loadError) &&
          loadError.response?.status === 409
        ) {
          navigate(`/ujian/sesi/${resultId}`, { replace: true });
          return;
        }

        console.error(loadError);

        const message = getApiErrorMessage(
          loadError,
          "Gagal memuat hasil ujian."
        );

        setError(message);
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [navigate, resultId, toast]);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Hasil Ujian
        </p>

        <h1 className="mt-1 text-xl font-bold text-fg">
          {summary?.examTitle ?? "Memuat hasil..."}
        </h1>
      </header>

      {loading && (
        <div
          role="status"
          aria-label="Memuat hasil ujian"
          className="space-y-3"
        >
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <span className="sr-only">Memuat hasil ujian...</span>
        </div>
      )}

      {!loading && error !== "" && (
        <div
          role="alert"
          className="rounded-2xl border border-danger-border bg-danger-surface p-5"
        >
          <p className="text-sm font-semibold text-danger">
            Hasil gagal dimuat
          </p>

          <p className="mt-1 text-sm text-danger">{error}</p>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Muat ulang
          </Button>
        </div>
      )}

      {!loading && summary && (
        <>
          {/* Nilai akhir */}
          <section
            className={`rounded-2xl border p-6 text-center ${
              summary.passed
                ? "border-success-border bg-success-surface"
                : "border-danger-border bg-danger-surface"
            }`}
          >
            <p className="text-sm font-medium text-fg-muted">
              Nilai Anda
            </p>

            <p
              className={`mt-1 text-5xl font-bold tabular-nums ${
                summary.passed ? "text-success-fg" : "text-danger"
              }`}
            >
              {summary.score}
            </p>

            <p className="mt-1 text-xs text-fg-subtle">
              Nilai minimal kelulusan {summary.passingScore}
            </p>

            <p
              className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                summary.passed
                  ? "bg-success-fg text-surface"
                  : "bg-danger text-danger-fg"
              }`}
            >
              {summary.passed ? "LULUS" : "BELUM LULUS"}
            </p>
          </section>

          {/* Rincian jawaban */}
          <section className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold text-fg">
              Rincian Jawaban
            </h2>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <StatBox
                label="Benar"
                value={summary.correctCount}
                tone="success"
              />
              <StatBox
                label="Salah"
                value={summary.wrongCount}
                tone="danger"
              />
              <StatBox
                label="Kosong"
                value={summary.unansweredCount}
                tone="muted"
              />
            </div>

            <dl className="mt-3 space-y-1.5 text-xs text-fg-subtle">
              <div className="flex justify-between gap-3">
                <dt>Total soal</dt>
                <dd className="font-medium tabular-nums text-fg-muted">
                  {summary.totalQuestions}
                </dd>
              </div>

              <div className="flex justify-between gap-3">
                <dt>Waktu pengerjaan</dt>
                <dd className="font-medium tabular-nums text-fg-muted">
                  {formatDuration(summary.durationSeconds)}
                </dd>
              </div>

              <div className="flex justify-between gap-3">
                <dt>Dikumpulkan</dt>
                <dd className="font-medium text-fg-muted">
                  {new Date(summary.finishedAt).toLocaleString(
                    "id-ID"
                  )}
                </dd>
              </div>
            </dl>

            {summary.pendingEssayCount > 0 && (
              <p className="mt-3 rounded-xl border border-accent-border bg-accent-surface px-3 py-2.5 text-xs text-fg-muted">
                <span className="font-semibold text-accent">
                  {summary.pendingEssayCount} soal uraian
                </span>{" "}
                belum dinilai dosen, jadi nilai di atas bisa berubah
                setelah penilaian manual.
              </p>
            )}
          </section>

          {/* Tinjauan per soal */}
          <section className="rounded-2xl border border-border bg-surface p-4">
            <h2 className="text-sm font-semibold text-fg">
              Tinjauan Soal
            </h2>

            <ol className="mt-3 divide-y divide-border">
              {summary.items.map((item) => (
                <li
                  key={item.questionId}
                  className="flex items-start justify-between gap-3 py-3"
                >
                  <div className="flex min-w-0 gap-2">
                    <span className="shrink-0 text-xs font-semibold tabular-nums text-fg-subtle">
                      {item.orderNumber}.
                    </span>

                    <p className="min-w-0 text-xs leading-5 text-fg-muted">
                      {item.questionText}
                    </p>
                  </div>

                  <ItemStatus item={item} />
                </li>
              ))}
            </ol>
          </section>

          <Button
            type="button"
            size="lg"
            className="w-full"
            onClick={() => navigate("/ujian", { replace: true })}
          >
            Kembali ke Daftar Ujian
          </Button>
        </>
      )}
    </div>
  );
}
