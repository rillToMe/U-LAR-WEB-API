import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";
import Skeleton from "../../components/ui/Skeleton";
import SkeletonImage from "../../components/ui/SkeletonImage";
import ConfirmModal from "../../components/ui/ConfirmModal";
import ExamFormModal from "../../components/exams/ExamFormModal";
import EssayGradingModal from "../../components/exams/EssayGradingModal";
import QuestionFormModal from "../../components/exams/QuestionFormModal";
import { useToast } from "../../components/common/toastContext";
import { getApiErrorMessage } from "../../services/apiError";
import {
  deleteExam,
  deleteQuestion,
  getExamDetail,
  updateExamStatus,
} from "../../services/examBankApi";
import type {
  ExamDetail,
  ExamQuestionItem,
} from "../../types/examBank";

export default function ExamDetailPage() {
  const { examId: examIdParam } = useParams<{ examId: string }>();
  const examId = Number(examIdParam);
  const navigate = useNavigate();
  const toast = useToast();

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [examFormOpen, setExamFormOpen] = useState(false);
  const [gradingOpen, setGradingOpen] = useState(false);
  const [questionFormOpen, setQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] =
    useState<ExamQuestionItem | null>(null);
  const [deletingQuestion, setDeletingQuestion] =
    useState<ExamQuestionItem | null>(null);
  const [deletingExam, setDeletingExam] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getExamDetail(examId)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setExam(data);
        setError("");
      })
      .catch((loadError) => {
        if (cancelled) {
          return;
        }

        console.error(loadError);
        setError(
          getApiErrorMessage(loadError, "Gagal mengambil detail ujian.")
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
  }, [examId, reloadKey]);

  function reload(message: string) {
    toast.success(message);
    setReloadKey((key) => key + 1);
  }

  async function handleToggleStatus() {
    if (!exam) {
      return;
    }

    setBusy(true);

    try {
      const response = await updateExamStatus(exam.id, !exam.isActive);

      reload(response.message);
    } catch (statusError) {
      console.error(statusError);
      toast.error(
        getApiErrorMessage(statusError, "Gagal mengubah status ujian.")
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteExam() {
    if (!exam) {
      return;
    }

    setBusy(true);

    try {
      const response = await deleteExam(exam.id);

      toast.success(response.message);
      navigate("/admin/exams", { replace: true });
    } catch (deleteError) {
      console.error(deleteError);
      toast.error(
        getApiErrorMessage(deleteError, "Gagal menghapus ujian.")
      );
      setBusy(false);
    } finally {
      setDeletingExam(false);
    }
  }

  async function handleDeleteQuestion() {
    if (!deletingQuestion) {
      return;
    }

    setBusy(true);

    try {
      const response = await deleteQuestion(deletingQuestion.id);

      setDeletingQuestion(null);
      reload(response.message);
    } catch (deleteError) {
      console.error(deleteError);
      toast.error(
        getApiErrorMessage(deleteError, "Gagal menghapus soal.")
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Memuat detail ujian"
        className="space-y-4"
      >
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <span className="sr-only">Memuat detail ujian...</span>
      </div>
    );
  }

  if (error !== "" || !exam) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-danger-border bg-danger-surface p-5"
      >
        <p className="text-sm font-semibold text-danger">
          Detail ujian gagal dimuat
        </p>

        <p className="mt-1 text-sm text-danger">
          {error || "Ujian tidak ditemukan."}
        </p>

        <Link
          to="/admin/exams"
          className="mt-4 inline-flex text-sm font-medium text-link underline-offset-4 hover:text-link-hover hover:underline"
        >
          ← Kembali ke Bank Soal
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/admin/exams"
          className="text-sm font-medium text-link underline-offset-4 hover:text-link-hover hover:underline"
        >
          ← Bank Soal
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-fg">
              {exam.title}
            </h1>

            {exam.description && (
              <p className="mt-1 max-w-2xl text-sm text-fg-subtle">
                {exam.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={handleToggleStatus}
            >
              {exam.isActive ? "Nonaktifkan" : "Aktifkan"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setGradingOpen(true)}
            >
              Nilai Essay
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setExamFormOpen(true)}
            >
              Ubah
            </Button>

            <IconButton
              variant="danger"
              label={`Hapus ujian ${exam.title}`}
              title="Hapus ujian"
              onClick={() => setDeletingExam(true)}
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
                <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
              </svg>
            </IconButton>
          </div>
        </div>
      </div>

      {/* Ringkasan ujian */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Status", value: exam.isActive ? "Aktif" : "Nonaktif" },
          { label: "Durasi", value: `${exam.durationMinutes} menit` },
          { label: "Nilai lulus", value: String(exam.passingScore) },
          {
            label: "Soal",
            value: String(exam.questions.length),
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border bg-surface px-4 py-3"
          >
            <p className="text-xs text-fg-subtle">{item.label}</p>

            <p className="mt-1 text-sm font-semibold text-fg">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {!exam.isActive && (
        <p className="rounded-xl border border-warning-border bg-warning-surface px-4 py-3 text-xs text-fg-muted">
          Ujian ini tidak muncul di web ujian mahasiswa. Aktifkan
          setelah soalnya siap.
        </p>
      )}

      {/* Daftar soal */}
      <div className="overflow-hidden rounded-xl border bg-surface">
        <div className="flex items-center justify-between border-b px-6 py-4 max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4">
          <div>
            <h2 className="font-semibold text-fg">Daftar Soal</h2>

            <p className="mt-1 text-sm text-fg-subtle">
              {exam.questions.length} soal • {exam.studentCount}{" "}
              mahasiswa pernah mengerjakan
            </p>
          </div>

          <Button
            type="button"
            className="max-md:w-full"
            onClick={() => {
              setEditingQuestion(null);
              setQuestionFormOpen(true);
            }}
          >
            + Tambah Soal
          </Button>
        </div>

        {exam.questions.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-fg">Belum ada soal</p>

            <p className="mt-1 text-sm text-fg-subtle">
              Ujian tanpa soal belum bisa diaktifkan.
            </p>

            <Button
              type="button"
              size="sm"
              className="mt-4"
              onClick={() => {
                setEditingQuestion(null);
                setQuestionFormOpen(true);
              }}
            >
              + Tambah Soal
            </Button>
          </div>
        )}

        {exam.questions.length > 0 && (
          <ol className="divide-y">
            {exam.questions.map((question) => (
              <li
                key={question.id}
                className="px-6 py-5 max-md:px-4"
              >
                {/* Baris atas: label soal dan tombol aksinya. Tombol tidak
                    dibuat kolom sendiri supaya isi soal memakai lebar penuh
                    — terutama di layar HP. */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-fg-subtle">
                      Soal {question.orderNumber}
                    </span>

                    <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-fg-subtle">
                      {question.type === "essay"
                        ? "Uraian"
                        : "Pilihan Ganda"}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <IconButton
                      variant="secondary"
                      label={`Ubah soal ${question.orderNumber}`}
                      title="Ubah soal"
                      onClick={() => {
                        setEditingQuestion(question);
                        setQuestionFormOpen(true);
                      }}
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
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                      </svg>
                    </IconButton>

                    <IconButton
                      variant="danger"
                      label={`Hapus soal ${question.orderNumber}`}
                      title="Hapus soal"
                      onClick={() => setDeletingQuestion(question)}
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
                        <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
                      </svg>
                    </IconButton>
                  </div>
                </div>

                <p className="mt-2 whitespace-pre-line text-sm font-medium text-fg">
                  {question.questionText}
                </p>

                {question.image && (
                  <SkeletonImage
                    src={question.image}
                    aspectRatio="16 / 9"
                    className="mt-3 max-w-lg rounded-xl border border-border"
                    alt={`Gambar soal ${question.orderNumber}`}
                  />
                )}

                {question.type === "essay" && question.answerKey && (
                  <div className="mt-3 rounded-lg border border-accent-border bg-accent-surface px-3 py-2.5">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                      Kunci Jawaban
                    </p>

                    <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-fg-muted">
                      {question.answerKey}
                    </p>
                  </div>
                )}

                {question.options.length > 0 && (
                  <ul className="mt-3 space-y-1.5">
                    {question.options.map((option) => (
                      <li
                        key={option.id}
                        className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-xs ${
                          option.isCorrect
                            ? "border-success-border bg-success-surface text-fg"
                            : "border-border bg-surface-muted text-fg-muted"
                        }`}
                      >
                        {option.isCorrect && (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                            className="mt-0.5 size-3.5 shrink-0 text-success-fg"
                          >
                            <path d="m5 13 4 4L19 7" />
                          </svg>
                        )}

                        <span className="min-w-0">
                          {option.optionText}
                        </span>

                        {option.isCorrect && (
                          <span className="ml-auto shrink-0 text-[11px] font-semibold text-success-fg">
                            Kunci
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Dipasang hanya saat terbuka supaya isian form selalu dibuat ulang. */}
      {examFormOpen && (
        <ExamFormModal
          open
          onClose={() => setExamFormOpen(false)}
          onSaved={reload}
          initial={{
            id: exam.id,
            title: exam.title,
            description: exam.description,
            passingScore: exam.passingScore,
            durationMinutes: exam.durationMinutes,
          }}
        />
      )}

      {questionFormOpen && (
        <QuestionFormModal
          open
          onClose={() => setQuestionFormOpen(false)}
          onSaved={reload}
          examId={exam.id}
          question={editingQuestion}
        />
      )}

      {gradingOpen && (
        <EssayGradingModal
          open
          examId={exam.id}
          onClose={() => setGradingOpen(false)}
        />
      )}

      <ConfirmModal
        open={deletingQuestion !== null}
        onClose={() => setDeletingQuestion(null)}
        onConfirm={handleDeleteQuestion}
        loading={busy}
        title="Hapus soal ini?"
        description="Soal dan pilihan jawabannya dihapus permanen."
        confirmLabel="Hapus Soal"
      >
        <p className="whitespace-pre-line text-sm text-fg-muted">
          {deletingQuestion?.questionText}
        </p>
      </ConfirmModal>

      <ConfirmModal
        open={deletingExam}
        onClose={() => setDeletingExam(false)}
        onConfirm={handleDeleteExam}
        loading={busy}
        title="Hapus ujian ini?"
        description="Ujian tidak bisa dihapus kalau sudah dikerjakan mahasiswa."
        confirmLabel="Hapus Ujian"
      >
        <p className="text-sm text-fg-muted">
          Ujian{" "}
          <span className="font-semibold text-fg">{exam.title}</span>{" "}
          beserta {exam.questions.length} soalnya akan dihapus
          permanen.
        </p>
      </ConfirmModal>
    </div>
  );
}
