import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  getStudents,
  updateStudentStatus,
} from "../../services/studentApi";
import { getApiErrorMessage } from "../../services/apiError";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useToast } from "../../components/common/toastContext";
import type {
  PagedResult,
  StudentListItem,
  StudentListParams,
} from "../../types/student";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";
import Skeleton from "../../components/ui/Skeleton";

/** Satu halaman menampung 30 mahasiswa (sama dengan default backend). */
const PAGE_SIZE = 30;

const statusFilters = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
] as const;

type StatusFilter = (typeof statusFilters)[number]["value"];

const CreateStudentModal = lazy(
  () => import("../../components/students/CreateStudentModal")
);
const StudentDetailModal = lazy(
  () => import("../../components/students/StudentDetailModal")
);

function StudentsSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-xl border bg-surface"
      role="status"
      aria-label="Memuat daftar mahasiswa"
    >
      <div className="flex items-center justify-between border-b px-6 py-4 max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4">
        <div>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg max-md:w-full" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm max-md:min-w-[860px]">
          <thead className="border-b bg-surface-muted">
            <tr>
              {Array.from({ length: 6 }, (_, index) => (
                <th key={index} className="px-6 py-3 max-md:px-3">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {Array.from({ length: 7 }, (_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: 6 }, (_, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 max-md:px-3">
                    <Skeleton
                      className={`h-4 ${
                        cellIndex === 1 || cellIndex === 2
                          ? "w-32"
                          : "w-24"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <span className="sr-only">Memuat data mahasiswa...</span>
    </div>
  );
}

export default function StudentsPage() {
  const [paged, setPaged] = useState<PagedResult<StudentListItem> | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState<number | null>(
    null
  );
  const [updatingStatusId, setUpdatingStatusId] = useState<
    number | null
  >(null);
  const [reloadKey, setReloadKey] = useState(0);
  const hasLoadedRef = useRef(false);
  const toast = useToast();

  // Nilai inilah yang dipakai untuk memanggil API, bukan `search`, jadi
  // request hanya terjadi setelah pengguna berhenti mengetik.
  const debouncedSearch = useDebouncedValue(search, 350);
  const appliedSearch = debouncedSearch.trim();

  const isFiltering =
    appliedSearch !== "" || statusFilter !== "all";

  useEffect(() => {
    const controller = new AbortController();

    if (hasLoadedRef.current) {
      setRefreshing(true);
    }

    const params: StudentListParams = {
      search: appliedSearch === "" ? undefined : appliedSearch,
      isActive:
        statusFilter === "all"
          ? undefined
          : statusFilter === "active",
      page,
      pageSize: PAGE_SIZE,
    };

    getStudents(params, controller.signal)
      .then((data) => {
        setPaged(data);
        setError("");
        hasLoadedRef.current = true;

        // Halaman terakhir bisa jadi kosong kalau datanya berkurang
        // (mis. status diubah saat filter "Aktif" menyala).
        if (data.totalPages > 0 && data.page > data.totalPages) {
          setPage(data.totalPages);
        }
      })
      .catch((error) => {
        // Permintaan lama yang dibatalkan bukan kegagalan.
        if (controller.signal.aborted) {
          return;
        }

        console.error(error);

        const message = getApiErrorMessage(
          error,
          "Gagal mengambil data mahasiswa."
        );

        setError(message);
        toast.error(message);
      })
      .finally(() => {
        if (controller.signal.aborted) {
          return;
        }

        setLoading(false);
        setRefreshing(false);
      });

    return () => controller.abort();
  }, [appliedSearch, statusFilter, page, reloadKey, toast]);

  const students = paged?.items ?? [];
  const totalItems = paged?.totalItems ?? 0;
  const totalPages = paged?.totalPages ?? 0;

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusFilterChange(value: StatusFilter) {
    setStatusFilter(value);
    setPage(1);
  }

  function handleResetFilter() {
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  }

  async function handleToggleStatus(student: StudentListItem) {
    setUpdatingStatusId(student.id);

    try {
      const result = await updateStudentStatus(
        student.id,
        !student.isActive
      );

      toast.success(result.message);
      setReloadKey((key) => key + 1);
    } catch (error) {
      console.error(error);
      toast.error(
        getApiErrorMessage(
          error,
          `Gagal memperbarui status ${student.name}.`
        )
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-fg">
          Mahasiswa
        </h1>

        <p className="mt-1 text-sm text-fg-subtle">
          Kelola akun mahasiswa U-LAR.
        </p>
      </div>

      {/* Loading */}
      {loading && <StudentsSkeleton />}

      {/* Table */}
      {!loading && (
        <div className="overflow-hidden rounded-xl border bg-surface">
          {/* Table Header */}
          <div className="flex items-center justify-between border-b px-6 py-4 max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4">
            <div>
              <h2 className="font-semibold text-fg">
                Daftar Mahasiswa
              </h2>

              <p className="mt-1 text-sm text-fg-subtle">
                {isFiltering
                  ? `Ditemukan ${totalItems} mahasiswa`
                  : `Total ${totalItems} mahasiswa`}
              </p>
            </div>

            <Button
              type="button"
              className="max-md:w-full"
              onClick={() => setIsCreateOpen(true)}
            >
              + Tambah Mahasiswa
            </Button>
          </div>

          {/* Pencarian & filter */}
          <div className="flex flex-wrap items-center gap-3 border-b px-6 py-3 max-md:px-4">
            <div className="relative flex-1 max-md:w-full max-md:flex-none">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-fg-placeholder">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="size-4"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  handleSearchChange(event.target.value)
                }
                placeholder="Cari NIM, nama, atau email..."
                aria-label="Cari mahasiswa"
                className="w-full rounded-lg border border-border-strong bg-surface py-2.5 pl-9 pr-11 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-fg-placeholder hover:border-fg-placeholder focus:border-accent focus:ring-2 focus:ring-accent-border"
              />

              {search !== "" && (
                <IconButton
                  size="sm"
                  onClick={() => handleSearchChange("")}
                  label="Bersihkan pencarian"
                  title="Bersihkan pencarian"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="size-4"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </IconButton>
              )}
            </div>

            <div
              role="group"
              aria-label="Filter status mahasiswa"
              className="flex items-center gap-1 rounded-lg border border-border bg-surface-muted p-1"
            >
              {statusFilters.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    handleStatusFilterChange(option.value)
                  }
                  aria-pressed={statusFilter === option.value}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                    statusFilter === option.value
                      ? "bg-surface text-fg shadow-sm"
                      : "text-fg-subtle hover:bg-surface hover:text-fg"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {refreshing && (
              <span
                role="status"
                className="inline-flex items-center gap-2 text-xs font-medium text-fg-subtle"
              >
                <span className="size-3.5 animate-spin rounded-full border-2 border-border-strong border-t-accent motion-reduce:animate-none" />
                Memuat
              </span>
            )}
          </div>

          {/* Empty State */}
          {/* Error hanya ditahan di layar kalau belum ada data untuk
              ditampilkan; kalau data lama masih ada, cukup lewat toast. */}
          {error !== "" && students.length === 0 && (
            <div
              role="alert"
              className="flex items-start gap-3 border-b border-danger-border bg-danger-surface px-6 py-4 max-md:px-4"
            >
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface text-danger">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="size-3.5"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
              </span>

              <div>
                <p className="text-sm font-semibold text-danger">
                  Data gagal dimuat
                </p>

                <p className="mt-0.5 text-sm text-danger">
                  {error}
                </p>
              </div>
            </div>
          )}

          {students.length === 0 && error === "" && (
            <div className="px-6 py-12 text-center">
              {isFiltering ? (
                <>
                  <p className="font-medium text-fg">
                    Mahasiswa tidak ditemukan
                  </p>

                  <p className="mt-1 text-sm text-fg-subtle">
                    Tidak ada mahasiswa yang cocok dengan
                    pencarian atau filter yang dipilih.
                  </p>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={handleResetFilter}
                  >
                    Reset pencarian & filter
                  </Button>
                </>
              ) : (
                <>
                  <p className="font-medium text-fg">
                    Belum ada mahasiswa
                  </p>

                  <p className="mt-1 text-sm text-fg-subtle">
                    Belum ada akun mahasiswa yang dibuat.
                  </p>
                </>
              )}
            </div>
          )}

          {students.length > 0 && (
            /* Data Table */
            <div
              aria-busy={refreshing}
              className={`overflow-x-auto transition-opacity duration-200 ${
                refreshing ? "opacity-60" : ""
              }`}
            >
              <table className="w-full text-left text-sm max-md:min-w-[860px]">
                <thead className="border-b bg-surface-muted">
                  <tr>
                    <th className="px-6 py-3 max-md:px-3 font-medium text-fg-subtle">
                      NIM
                    </th>

                    <th className="px-6 py-3 max-md:px-3 font-medium text-fg-subtle">
                      Nama
                    </th>

                    <th className="px-6 py-3 max-md:px-3 font-medium text-fg-subtle">
                      Email
                    </th>

                    <th className="px-6 py-3 max-md:px-3 font-medium text-fg-subtle">
                      Status
                    </th>

                    <th className="px-6 py-3 max-md:px-3 font-medium text-fg-subtle">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-surface-muted"
                    >
                      {/* NIM */}
                      <td className="whitespace-nowrap px-6 py-4 max-md:px-3 font-medium text-fg">
                        {student.nim}
                      </td>

                      {/* Nama */}
                      <td className="whitespace-nowrap px-6 py-4 max-md:px-3 text-fg-muted">
                        {student.name}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 max-md:px-3 text-fg-muted">
                        {student.email}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 max-md:px-3">
                        {student.isActive ? (
                          <span className="inline-flex rounded-full bg-success-surface px-2.5 py-1 text-xs font-medium text-success-fg">
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-surface-hover px-2.5 py-1 text-xs font-medium text-fg-subtle">
                            Nonaktif
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 max-md:px-3">
                        <div className="flex items-center gap-3">
                          <IconButton
                            variant="secondary"
                            onClick={() =>
                              setDetailUserId(student.id)
                            }
                            label={`Lihat detail ${student.name}`}
                            title="Lihat detail"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                              className="size-4.5"
                            >
                              <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </IconButton>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={student.isActive}
                            aria-busy={
                              updatingStatusId === student.id
                            }
                            aria-label={`${
                              student.isActive
                                ? "Nonaktifkan"
                                : "Aktifkan"
                            } akun ${student.name}`}
                            title={
                              student.isActive
                                ? "Nonaktifkan"
                                : "Aktifkan"
                            }
                            onClick={() =>
                              handleToggleStatus(student)
                            }
                            disabled={
                              updatingStatusId === student.id
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none ${
                              updatingStatusId === student.id
                                ? "animate-pulse "
                                : ""
                            }${
                              student.isActive
                                ? "bg-success-fg hover:ring-2 hover:ring-success-border"
                                : "bg-fg-placeholder hover:ring-2 hover:ring-border-strong"
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block size-5 rounded-full bg-surface shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none ${
                                student.isActive
                                  ? "translate-x-[1.375rem]"
                                  : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {students.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-3 max-md:px-4">
              <p className="text-xs text-fg-subtle">
                Menampilkan {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, totalItems)} dari{" "}
                {totalItems} mahasiswa
              </p>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setPage((current) => current - 1)
                    }
                    disabled={page <= 1}
                  >
                    ← Sebelumnya
                  </Button>

                  <span className="px-1 text-xs font-medium tabular-nums text-fg-muted">
                    Halaman {page} dari {totalPages}
                  </span>

                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setPage((current) => current + 1)
                    }
                    disabled={page >= totalPages}
                  >
                    Berikutnya →
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Suspense fallback={null}>
        {isCreateOpen && (
          <CreateStudentModal
            open
            onClose={() => setIsCreateOpen(false)}
            onCreated={() => setReloadKey((key) => key + 1)}
          />
        )}

        {detailUserId !== null && (
          <StudentDetailModal
            open
            onClose={() => setDetailUserId(null)}
            onUpdated={() => setReloadKey((key) => key + 1)}
            studentId={detailUserId}
          />
        )}
      </Suspense>
    </div>
  );
}
