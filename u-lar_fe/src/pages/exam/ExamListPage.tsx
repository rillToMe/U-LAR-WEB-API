import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../components/common/toastContext";
import { formatCountdown } from "../../hooks/useCountdownTimer";
import { getApiErrorMessage } from "../../services/apiError";
import {
  clearExamSession,
  getExamUser,
  getExams,
  startExam,
} from "../../services/examApi";
import type { ExamListItem, ExamSessionStatus } from "../../types/exam";

/* Label status dipisah dari warna supaya mahasiswa tidak perlu menebak arti
   warnanya. */
const statusLabels: Record<ExamSessionStatus, string> = {
  not_started: "Belum dikerjakan",
  in_progress: "Sedang dikerjakan",
  finished: "Sudah dikumpulkan",
};

function ExamListSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-label="Memuat daftar ujian">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border bg-surface p-5"
        >
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <Skeleton className="mt-5 h-11 w-full rounded-xl" />
        </div>
      ))}
      <span className="sr-only">Memuat daftar ujian...</span>
    </div>
  );
}

export default function ExamListPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [exams, setExams] = useState<ExamListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const user = getExamUser();

  useEffect(() => {
    // Halaman ini tidak pernah mengganti query, jadi cukup satu kali muat.
    // Flag `cancelled` mencegah setState setelah halaman ditinggalkan.
    let cancelled = false;

    getExams()
      .then((data) => {
        if (cancelled) {
          return;
        }

        setExams(data);
        setError("");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        console.error(error);
        setError(
          getApiErrorMessage(error, "Gagal mengambil daftar ujian.")
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleLogout() {
    clearExamSession();
    navigate("/ujian/login", { replace: true });
  }

  async function handleStart(exam: ExamListItem) {
    setActiveId(exam.id);

    try {
      const session = await startExam(exam.id);

      navigate(`/ujian/sesi/${session.resultId}`);
    } catch (error) {
      console.error(error);
      toast.error(
        getApiErrorMessage(error, "Gagal memulai ujian.")
      );
    } finally {
      setActiveId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            Web Ujian
          </p>

          <h1 className="mt-1 truncate text-xl font-bold text-fg">
            {user ? `Halo, ${user.name}` : "Daftar Ujian"}
          </h1>

          {user && (
            <p className="mt-0.5 text-sm text-fg-subtle">
              NIM {user.nim}
            </p>
          )}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setLogoutOpen(true)}
        >
          Keluar
        </Button>
      </header>

      {loading && <ExamListSkeleton />}

      {!loading && error !== "" && (
        <div
          role="alert"
          className="rounded-2xl border border-danger-border bg-danger-surface p-5"
        >
          <p className="text-sm font-semibold text-danger">
            Daftar ujian gagal dimuat
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

      {!loading && error === "" && exams.length === 0 && (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="font-medium text-fg">Belum ada ujian</p>

          <p className="mt-1 text-sm text-fg-subtle">
            Dosen belum membuka ujian apa pun untuk Anda.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {exams.map((exam) => {
          const inProgress = exam.status === "in_progress";
          const finished = exam.status === "finished";
          const busy = activeId === exam.id;

          return (
            <article
              key={exam.id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-fg">
                  {exam.title}
                </h2>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    finished
                      ? "bg-success-surface text-success-fg"
                      : inProgress
                        ? "bg-warning-surface text-warning"
                        : "bg-surface-hover text-fg-subtle"
                  }`}
                >
                  {statusLabels[exam.status]}
                </span>
              </div>

              {exam.description && (
                <p className="mt-2 text-sm leading-6 text-fg-subtle">
                  {exam.description}
                </p>
              )}

              <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-surface-muted px-2 py-2.5">
                  <dt className="text-[11px] text-fg-subtle">
                    Durasi
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-fg">
                    {exam.durationMinutes} mnt
                  </dd>
                </div>

                <div className="rounded-xl bg-surface-muted px-2 py-2.5">
                  <dt className="text-[11px] text-fg-subtle">
                    Soal
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-fg">
                    {exam.questionCount}
                  </dd>
                </div>

                <div className="rounded-xl bg-surface-muted px-2 py-2.5">
                  <dt className="text-[11px] text-fg-subtle">
                    Nilai lulus
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-fg">
                    {exam.passingScore}
                  </dd>
                </div>
              </dl>

              {inProgress && exam.remainingSeconds !== null && (
                <p className="mt-3 rounded-xl border border-warning-border bg-warning-surface px-3 py-2 text-xs text-fg-muted">
                  Waktu tersisa{" "}
                  <span className="font-semibold tabular-nums text-warning">
                    {formatCountdown(exam.remainingSeconds)}
                  </span>
                  . Lanjutkan sebelum waktunya habis.
                </p>
              )}

              {finished && exam.score !== null && (
                <p
                  className={`mt-3 rounded-xl border px-3 py-2 text-xs ${
                    exam.passed
                      ? "border-success-border bg-success-surface text-fg-muted"
                      : "border-danger-border bg-danger-surface text-fg-muted"
                  }`}
                >
                  Nilai terakhir{" "}
                  <span className="font-semibold tabular-nums text-fg">
                    {exam.score}
                  </span>{" "}
                  - {exam.passed ? "lulus" : "belum lulus"}. Percobaan
                  ke-{exam.attempt}.
                </p>
              )}

              {/* Mobile: tombol bertumpuk penuh; desktop: sejajar horizontal. */}
              <div className="mt-4 grid gap-2 lg:grid-cols-2">
                {inProgress && exam.resultId !== null && (
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    onClick={() =>
                      navigate(`/ujian/sesi/${exam.resultId}`)
                    }
                  >
                    Lanjutkan Ujian
                  </Button>
                )}

                {finished && exam.resultId !== null && (
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    onClick={() =>
                      navigate(`/ujian/hasil/${exam.resultId}`)
                    }
                  >
                    Lihat Hasil
                  </Button>
                )}

                {finished && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    loading={busy}
                    onClick={() => handleStart(exam)}
                  >
                    Kerjakan Ulang
                  </Button>
                )}

                {exam.status === "not_started" && (
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    loading={busy}
                    onClick={() => handleStart(exam)}
                  >
                    Mulai Ujian
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <ConfirmModal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Yakin keluar dari ujian?"
        description="Jawaban yang sudah tersimpan tetap aman."
        confirmLabel="Iya, Keluar"
        cancelLabel="Tetap di Sini"
      />
    </div>
  );
}
