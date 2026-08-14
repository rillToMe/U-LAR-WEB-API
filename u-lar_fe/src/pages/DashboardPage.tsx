import { useEffect, useState } from "react";
import { getAdminDashboard } from "../services/dasboardApi";
import Skeleton from "../components/ui/Skeleton";
import type { AdminDashboard } from "../types/dashboard";

function DashboardSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Memuat dashboard"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl border bg-surface p-6"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-3 h-9 w-16" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-surface">
        <div className="border-b px-6 py-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-2 h-4 w-44" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-surface-muted">
              <tr>
                {Array.from({ length: 5 }, (_, index) => (
                  <th key={index} className="px-6 py-3">
                    <Skeleton className="h-4 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {Array.from({ length: 5 }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: 5 }, (_, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4">
                      <Skeleton
                        className={`h-4 ${
                          cellIndex === 1 ? "w-28" : "w-24"
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <span className="sr-only">Memuat data dashboard...</span>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-surface p-6">
      <p className="text-sm text-fg-subtle">{label}</p>
      <p className="mt-2 text-3xl font-bold text-fg">
        {value}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminDashboard()
      .then((result) => {
        setData(result);
        setError("");
      })
      .catch((error) => {
        console.error(error);
        setError("Gagal mengambil data dashboard.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-fg">Dashboard</h1>
        <p className="mt-1 text-sm text-fg-subtle">
          Ringkasan aktivitas mahasiswa U-LAR.
        </p>
      </div>

      {/* Loading */}
      {loading && <DashboardSkeleton />}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-danger-border bg-danger-surface p-4">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Stats */}
      {!loading && !error && data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Mahasiswa" value={data.totalStudents} />
            <StatCard label="Mahasiswa Aktif" value={data.activeStudents} />
            <StatCard
              label="Mahasiswa Nonaktif"
              value={data.inactiveStudents}
            />
            <StatCard
              label="Sudah Pernah Login"
              value={data.studentsWhoHaveLoggedIn}
            />
          </div>

          {/* Recent Students */}
          <div className="overflow-hidden rounded-xl border bg-surface">
            <div className="border-b px-6 py-4">
              <h2 className="font-semibold text-fg">
                Mahasiswa Terbaru
              </h2>
              <p className="mt-1 text-sm text-fg-subtle">
                {data.recentStudents.length} mahasiswa terakhir
              </p>
            </div>

            {data.recentStudents.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-medium text-fg">
                  Belum ada mahasiswa
                </p>
                <p className="mt-1 text-sm text-fg-subtle">
                  Belum ada akun mahasiswa yang dibuat.
                </p>
              </div>
            ) : (
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
                        Status
                      </th>
                      <th className="px-6 py-3 font-medium text-fg-subtle">
                        Dibuat
                      </th>
                      <th className="px-6 py-3 font-medium text-fg-subtle">
                        Login Terakhir
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {data.recentStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-surface-muted"
                      >
                        <td className="whitespace-nowrap px-6 py-4 font-medium text-fg">
                          {student.nim}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-fg-muted">
                          {student.name}
                        </td>
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
                        <td className="whitespace-nowrap px-6 py-4 text-fg-subtle">
                          {new Date(student.createdAt).toLocaleString(
                            "id-ID"
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-fg-subtle">
                          {student.lastLoginAt
                            ? new Date(
                                student.lastLoginAt
                              ).toLocaleString("id-ID")
                            : "Belum pernah login"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
