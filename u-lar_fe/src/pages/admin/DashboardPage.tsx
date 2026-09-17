import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { getAdminDashboard } from "../../services/dasboardApi";
import { getApiErrorMessage } from "../../services/apiError";
import { useToast } from "../../components/common/toastContext";
import Skeleton from "../../components/ui/Skeleton";
import type { AdminDashboard } from "../../types/dashboard";

const fullDateFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function getPercentage(value: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function DashboardSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Memuat dashboard"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-3 h-9 w-16" />
              </div>
              <Skeleton className="size-11 rounded-xl" />
            </div>
            <Skeleton className="mt-5 h-3 w-32" />
            <Skeleton className="mt-3 h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-6 py-5 max-md:px-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div>
              <Skeleton className="h-5 w-36" />
              <Skeleton className="mt-2 h-4 w-44" />
            </div>
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-border bg-surface-muted">
              <tr>
                {Array.from({ length: 5 }, (_, index) => (
                  <th key={index} className="px-6 py-3 max-md:px-4">
                    <Skeleton className="h-3.5 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from({ length: 5 }, (_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array.from({ length: 5 }, (_, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4 max-md:px-4">
                      <Skeleton
                        className={`h-4 ${
                          cellIndex === 1 ? "w-32" : "w-24"
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

type StatTone = "accent" | "success" | "danger" | "primary";

const statToneStyles: Record<
  StatTone,
  { icon: string; bar: string; glow: string }
> = {
  accent: {
    icon: "bg-accent-surface text-accent",
    bar: "bg-accent",
    glow: "bg-accent-surface",
  },
  success: {
    icon: "bg-success-surface text-success-fg",
    bar: "bg-success-fg",
    glow: "bg-success-surface",
  },
  danger: {
    icon: "bg-danger-surface text-danger",
    bar: "bg-danger",
    glow: "bg-danger-surface",
  },
  primary: {
    icon: "bg-primary text-primary-fg",
    bar: "bg-primary",
    glow: "bg-surface-hover",
  },
};

function StatCard({
  label,
  value,
  description,
  progress,
  tone,
  icon,
}: {
  label: string;
  value: number;
  description: string;
  progress: number;
  tone: StatTone;
  icon: ReactNode;
}) {
  const styles = statToneStyles[tone];
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 size-24 rounded-full opacity-70 blur-2xl transition-transform duration-300 group-hover:scale-125 motion-reduce:transform-none ${styles.glow}`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-fg-subtle">{label}</p>
          <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-fg">
            {value.toLocaleString("id-ID")}
          </p>
        </div>
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          {icon}
        </div>
      </div>

      <div className="relative mt-5 flex items-center justify-between gap-3 text-xs">
        <span className="truncate text-fg-subtle">{description}</span>
        <span className="shrink-0 font-semibold tabular-nums text-fg-muted">
          {normalizedProgress}%
        </span>
      </div>
      <div
        className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-surface-hover"
        role="progressbar"
        aria-label={description}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={normalizedProgress}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-500 motion-reduce:transition-none ${styles.bar}`}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const toast = useToast();

  useEffect(() => {
    getAdminDashboard()
      .then((result) => {
        setData(result);
        setError("");
      })
      .catch((error) => {
        console.error(error);

        const message = getApiErrorMessage(
          error,
          "Gagal mengambil data dashboard."
        );

        setError(message);
        toast.error(message);
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const currentDate = fullDateFormatter.format(new Date());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-accent-border bg-gradient-to-br from-accent-surface via-surface to-surface p-6 shadow-sm max-md:p-5">
        <div className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full border border-accent-border/70" />
        <div className="pointer-events-none absolute -right-6 -top-12 size-36 rounded-full bg-accent-surface/80" />

        <div className="relative flex items-center justify-between gap-6 max-md:flex-col max-md:items-start">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent-border bg-surface/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-accent-hover">
              <span className="size-1.5 rounded-full bg-accent" />
              U-LAR Admin
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-fg max-md:text-2xl">
              Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg-subtle">
              Pantau kondisi akun dan aktivitas mahasiswa dalam satu tampilan.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border bg-surface/80 px-4 py-3 shadow-sm backdrop-blur-sm max-md:w-full">
            <span className="flex size-9 items-center justify-center rounded-lg bg-accent-surface text-accent">
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
                <path d="M8 2v4M16 2v4M3 10h18" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
              </svg>
            </span>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-fg-placeholder">
                Hari ini
              </p>
              <p className="mt-0.5 text-sm font-semibold capitalize text-fg">
                {currentDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && <DashboardSkeleton />}

      {/* Error */}
      {!loading && error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-danger-border bg-danger-surface p-4"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-danger">
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
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </span>
          <div>
            <p className="font-semibold text-danger">Data gagal dimuat</p>
            <p className="mt-0.5 text-sm text-danger">{error}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      {!loading && !error && data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Mahasiswa"
              value={data.totalStudents}
              description="Seluruh akun terdaftar"
              progress={data.totalStudents > 0 ? 100 : 0}
              tone="accent"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="size-5"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
            />
            <StatCard
              label="Mahasiswa Aktif"
              value={data.activeStudents}
              description="Dari total mahasiswa"
              progress={getPercentage(
                data.activeStudents,
                data.totalStudents
              )}
              tone="success"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="size-5"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="m16 11 2 2 4-4" />
                </svg>
              }
            />
            <StatCard
              label="Mahasiswa Nonaktif"
              value={data.inactiveStudents}
              description="Dari Total Mahasiswa"
              progress={getPercentage(
                data.inactiveStudents,
                data.totalStudents
              )}
              tone="danger"
              icon={
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="size-5"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="m17 8 5 5M22 8l-5 5" />
                </svg>
              }
            />
          </div>

          {/* Recent Students */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-5 max-md:px-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent-surface text-accent">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="size-5"
                  >
                    <path d="m3 10 9-5 9 5-9 5-9-5Z" />
                    <path d="M7 12.5v4.25C7 18 9.24 19 12 19s5-1 5-2.25V12.5" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <h2 className="font-semibold text-fg">
                    Mahasiswa Terbaru
                  </h2>
                  <p className="mt-0.5 truncate text-sm text-fg-subtle">
                    {data.recentStudents.length} akun terakhir ditambahkan
                  </p>
                </div>
              </div>

              <Link
                to="/admin/students"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-link transition hover:bg-accent-surface hover:text-link-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Lihat semua
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
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Link>
            </div>

            {data.recentStudents.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-surface-muted text-fg-subtle">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="size-6"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M19 8v6M22 11h-6" />
                  </svg>
                </span>
                <p className="mt-4 font-semibold text-fg">
                  Belum ada mahasiswa
                </p>
                <p className="mt-1 text-sm text-fg-subtle">
                  Akun mahasiswa yang baru dibuat akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-border bg-surface-muted/70">
                    <tr>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-fg-subtle max-md:px-4">
                        NIM
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-fg-subtle max-md:px-4">
                        Mahasiswa
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-fg-subtle max-md:px-4">
                        Status
                      </th>
                      <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-fg-subtle max-md:px-4">
                        Dibuat
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {data.recentStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="transition-colors hover:bg-surface-muted/70"
                      >
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-semibold text-fg max-md:px-4">
                          {student.nim}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 max-md:px-4">
                          <div className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-surface text-xs font-bold text-accent-hover">
                              {getInitials(student.name)}
                            </span>
                            <span className="font-medium text-fg-muted">
                              {student.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 max-md:px-4">
                          {student.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-success-border bg-success-surface px-2.5 py-1 text-xs font-semibold text-success-fg">
                              <span className="size-1.5 rounded-full bg-success-fg" />
                              Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-hover px-2.5 py-1 text-xs font-semibold text-fg-subtle">
                              <span className="size-1.5 rounded-full bg-fg-placeholder" />
                              Nonaktif
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-fg-subtle max-md:px-4">
                          {dateTimeFormatter.format(
                            new Date(student.createdAt)
                          )}
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
