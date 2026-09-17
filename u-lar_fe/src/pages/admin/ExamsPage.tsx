import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";
import Skeleton from "../../components/ui/Skeleton";
import ConfirmModal from "../../components/ui/ConfirmModal";
import ExamFormModal from "../../components/exams/ExamFormModal";
import type { ExamFormInitial } from "../../components/exams/ExamFormModal";
import { useToast } from "../../components/common/toastContext";
import { getApiErrorMessage } from "../../services/apiError";
import {
  deleteExam,
  getExams,
  updateExamStatus,
} from "../../services/examBankApi";
import type { ExamSummaryItem } from "../../types/examBank";

function ExamsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Memuat daftar ujian"
      className="overflow-hidden rounded-xl border bg-surface"
    >
      <div className="border-b px-6 py-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>

      <div className="space-y-3 p-6">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>

      <span className="sr-only">Memuat daftar ujian...</span>
    </div>
  );
}

export default function ExamsPage() {
  const toast = useToast();

  const [exams, setExams] = useState<ExamSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExamFormInitial | null>(null);
  const [deleting, setDeleting] = useState<ExamSummaryItem | null>(
    null
  );
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState<number | null>(
    null
  );
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getExams()
      .then((data) => {
        if (cancelled) {
          return;
        }

        setExams(data);
        setError("");
      })
      .catch((loadError) => {
        if (cancelled) {
          return;
        }

        console.error(loadError);
        setError(
          getApiErrorMessage(loadError, "Gagal mengambil daftar ujian.")
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
  }, [reloadKey]);

  function reload(message: string) {
    toast.success(message);
    setReloadKey((key) => key + 1);
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(exam: ExamSummaryItem) {
    setEditing({
      id: exam.id,
      title: exam.title,
      description: exam.description,
      passingScore: exam.passingScore,
      durationMinutes: exam.durationMinutes,
    });
    setFormOpen(true);
  }

  async function handleToggleStatus(exam: ExamSummaryItem) {
    setStatusBusyId(exam.id);

    try {
      const response = await updateExamStatus(exam.id, !exam.isActive);

      reload(response.message);
    } catch (statusError) {
      console.error(statusError);
      toast.error(
        getApiErrorMessage(
          statusError,
          `Gagal mengubah status ${exam.title}.`
        )
      );
    } finally {
      setStatusBusyId(null);
    }
  }

  async function handleDelete() {
    if (!deleting) {
      return;
    }

    setDeletingBusy(true);

    try {
      const response = await deleteExam(deleting.id);

      setDeleting(null);
      reload(response.message);
    } catch (deleteError) {
      console.error(deleteError);
      toast.error(
        getApiErrorMessage(deleteError, "Gagal menghapus ujian.")
      );
    } finally {
      setDeletingBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">Bank Soal</h1>

        <p className="mt-1 text-sm text-fg-subtle">
          Susun ujian dan soalnya. Ujian yang aktif akan muncul di web
          ujian mahasiswa.
        </p>
      </div>

      {loading && <ExamsSkeleton />}

      {!loading && (
        <div className="overflow-hidden rounded-xl border bg-surface">
          <div className="flex items-center justify-between border-b px-6 py-4 max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4">
            <div>
              <h2 className="font-semibold text-fg">Daftar Ujian</h2>

              <p className="mt-1 text-sm text-fg-subtle">
                Total {exams.length} ujian
              </p>
            </div>

            <Button
              type="button"
              className="max-md:w-full"
              onClick={openCreate}
            >
              + Buat Ujian
            </Button>
          </div>

          {error !== "" && exams.length === 0 && (
            <div
              role="alert"
              className="flex items-start gap-3 border-b border-danger-border bg-danger-surface px-6 py-4 max-md:px-4"
            >
              <div>
                <p className="text-sm font-semibold text-danger">
                  Data gagal dimuat
                </p>

                <p className="mt-0.5 text-sm text-danger">{error}</p>
              </div>
            </div>
          )}

          {exams.length === 0 && error === "" && (
            <div className="px-6 py-12 text-center">
              <p className="font-medium text-fg">Belum ada ujian</p>

              <p className="mt-1 text-sm text-fg-subtle">
                Buat ujian pertama, lalu tambahkan soalnya.
              </p>

              <Button
                type="button"
                size="sm"
                className="mt-4"
                onClick={openCreate}
              >
                + Buat Ujian
              </Button>
            </div>
          )}

          {exams.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm max-md:min-w-[960px]">
                <thead className="border-b bg-surface-muted">
                  <tr>
                    <th className="px-6 py-3 font-medium text-fg-subtle max-md:px-3">
                      Judul
                    </th>
                    <th className="px-6 py-3 font-medium text-fg-subtle max-md:px-3">
                      Soal
                    </th>
                    <th className="px-6 py-3 font-medium text-fg-subtle max-md:px-3">
                      Peserta
                    </th>
                    <th className="px-6 py-3 font-medium text-fg-subtle max-md:px-3">
                      Durasi
                    </th>
                    <th className="px-6 py-3 font-medium text-fg-subtle max-md:px-3">
                      Nilai Lulus
                    </th>
                    <th className="px-6 py-3 font-medium text-fg-subtle max-md:px-3">
                      Status
                    </th>
                    <th className="px-6 py-3 font-medium text-fg-subtle max-md:px-3">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {exams.map((exam) => (
                    <tr
                      key={exam.id}
                      className="hover:bg-surface-muted"
                    >
                      <td className="px-6 py-4 max-md:px-3">
                        <p className="font-medium text-fg">
                          {exam.title}
                        </p>

                        {exam.description && (
                          <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-fg-subtle">
                            {exam.description}
                          </p>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 tabular-nums text-fg-muted max-md:px-3">
                        {exam.questionCount}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 tabular-nums text-fg-muted max-md:px-3">
                        {exam.studentCount}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-fg-muted max-md:px-3">
                        {exam.durationMinutes} menit
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 tabular-nums text-fg-muted max-md:px-3">
                        {exam.passingScore}
                      </td>

                      <td className="px-6 py-4 max-md:px-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={exam.isActive}
                          aria-busy={statusBusyId === exam.id}
                          aria-label={`${
                            exam.isActive
                              ? "Nonaktifkan"
                              : "Aktifkan"
                          } ujian ${exam.title}`}
                          title={
                            exam.isActive
                              ? "Nonaktifkan"
                              : "Aktifkan"
                          }
                          disabled={statusBusyId === exam.id}
                          onClick={() => handleToggleStatus(exam)}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none ${
                            statusBusyId === exam.id
                              ? "animate-pulse "
                              : ""
                          }${
                            exam.isActive
                              ? "bg-success-fg hover:ring-2 hover:ring-success-border"
                              : "bg-fg-placeholder hover:ring-2 hover:ring-border-strong"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block size-5 rounded-full bg-surface shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none ${
                              exam.isActive
                                ? "translate-x-[1.375rem]"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </td>

                      <td className="px-6 py-4 max-md:px-3">
                        <div className="flex items-center gap-3">
                          <Link
                            to={`/admin/exams/${exam.id}`}
                            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:border-border-strong hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          >
                            Kelola Soal
                          </Link>

                          <IconButton
                            variant="secondary"
                            onClick={() => openEdit(exam)}
                            label={`Ubah ujian ${exam.title}`}
                            title="Ubah ujian"
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
                            onClick={() => setDeleting(exam)}
                            label={`Hapus ujian ${exam.title}`}
                            title="Hapus ujian"
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Dipasang hanya saat terbuka supaya isian form selalu dibuat ulang. */}
      {formOpen && (
        <ExamFormModal
          open
          onClose={() => setFormOpen(false)}
          onSaved={reload}
          initial={editing}
        />
      )}

      <ConfirmModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Hapus ujian ini?"
        description="Seluruh soal di dalamnya ikut terhapus."
        confirmLabel="Hapus Ujian"
      >
        <p className="text-sm text-fg-muted">
          Ujian{" "}
          <span className="font-semibold text-fg">
            {deleting?.title}
          </span>{" "}
          beserta {deleting?.questionCount ?? 0} soalnya akan dihapus
          permanen. Ujian yang sudah pernah dikerjakan mahasiswa tidak
          bisa dihapus - nonaktifkan saja.
        </p>
      </ConfirmModal>
    </div>
  );
}
