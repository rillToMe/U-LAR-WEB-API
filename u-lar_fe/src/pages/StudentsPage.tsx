import { lazy, Suspense, useEffect, useState } from "react";
import {
  getStudents,
  updateStudentStatus,
} from "../services/studentApi";
import type { StudentListItem } from "../types/student";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";

const CreateStudentModal = lazy(
  () => import("../components/students/CreateStudentModal")
);
const StudentDetailModal = lazy(
  () => import("../components/students/StudentDetailModal")
);

function StudentsSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-xl border bg-surface"
      role="status"
      aria-label="Memuat daftar mahasiswa"
    >
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-2 h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-surface-muted">
            <tr>
              {Array.from({ length: 6 }, (_, index) => (
                <th key={index} className="px-6 py-3">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {Array.from({ length: 7 }, (_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: 6 }, (_, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4">
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
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState<number | null>(
    null
  );
  const [updatingStatusId, setUpdatingStatusId] = useState<
    number | null
  >(null);
  const [statusError, setStatusError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    getStudents()
      .then((data) => {
        setStudents(data);
        setError("");
      })
      .catch((error) => {
        console.error(error);
        setError("Gagal mengambil data mahasiswa.");
      })
      .finally(() => setLoading(false));
  }, [reloadKey]);

  async function handleToggleStatus(student: StudentListItem) {
    setStatusError("");
    setStatusMessage("");
    setUpdatingStatusId(student.id);

    try {
      const result = await updateStudentStatus(
        student.id,
        !student.isActive
      );
      setStatusMessage(result.message);
      setReloadKey((key) => key + 1);
    } catch (error) {
      console.error(error);
      setStatusError("Gagal memperbarui status mahasiswa.");
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

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-danger-border bg-danger-surface p-4">
          <p className="text-sm text-danger">
            {error}
          </p>
        </div>
      )}

      {/* Status message */}
      {statusMessage && (
        <div
          role="status"
          className="rounded-xl border border-success-border bg-success-surface p-4"
        >
          <p className="text-sm text-success-fg">
            {statusMessage}
          </p>
        </div>
      )}

      {/* Status error */}
      {statusError && (
        <div
          role="alert"
          className="rounded-xl border border-danger-border bg-danger-surface p-4"
        >
          <p className="text-sm text-danger">
            {statusError}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border bg-surface">
          {/* Table Header */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="font-semibold text-fg">
                Daftar Mahasiswa
              </h2>

              <p className="mt-1 text-sm text-fg-subtle">
                Total {students.length} mahasiswa
              </p>
            </div>

            <Button
              type="button"
              onClick={() => setIsCreateOpen(true)}
            >
              + Tambah Mahasiswa
            </Button>
          </div>

          {/* Empty State */}
          {students.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="font-medium text-fg">
                Belum ada mahasiswa
              </p>

              <p className="mt-1 text-sm text-fg-subtle">
                Belum ada akun mahasiswa yang dibuat.
              </p>
            </div>
          ) : (
            /* Data Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-surface-muted">
                  <tr>
                    <th className="px-6 py-3 font-medium text-fg-subtle">
                      NIM
                    </th>

                    <th className="px-6 py-3 font-medium text-fg-subtle">
                      Nama
                    </th>

                    <th className="px-6 py-3 font-medium text-fg-subtle">
                      Email
                    </th>

                    <th className="px-6 py-3 font-medium text-fg-subtle">
                      Status
                    </th>

                    <th className="px-6 py-3 font-medium text-fg-subtle">
                      Login Terakhir
                    </th>

                    <th className="px-6 py-3 font-medium text-fg-subtle">
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
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-fg">
                        {student.nim}
                      </td>

                      {/* Nama */}
                      <td className="whitespace-nowrap px-6 py-4 text-fg-muted">
                        {student.name}
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-fg-muted">
                        {student.email}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
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

                      {/* Last Login */}
                      <td className="whitespace-nowrap px-6 py-4 text-fg-subtle">
                        {student.lastLoginAt
                          ? new Date(
                              student.lastLoginAt
                            ).toLocaleString("id-ID")
                          : "Belum pernah login"}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() =>
                              setDetailUserId(student.id)
                            }
                            className="text-sm font-medium text-link hover:text-link-hover"
                          >
                            Detail
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(student)
                            }
                            disabled={
                              updatingStatusId === student.id
                            }
                            className={`text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                              student.isActive
                                ? "text-danger hover:text-danger-hover"
                                : "text-success-fg"
                            }`}
                          >
                            {updatingStatusId === student.id
                              ? "Memproses..."
                              : student.isActive
                                ? "Disable"
                                : "Enable"}
                          </button>
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
