import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";
import Skeleton from "../../components/ui/Skeleton";
import DangerConfirmModal from "../../components/ui/DangerConfirmModal";
import CreateAdminModal from "../../components/admins/CreateAdminModal";
import EditAdminModal from "../../components/admins/EditAdminModal";
import { useToast } from "../../components/common/toastContext";
import { describeApiError } from "../../services/apiError";
import { deleteAdmin, getAdmins } from "../../services/adminUserApi";
import { currentAdminId, ADMIN_ROLE } from "../../lib/session";
import type { AdminListItem } from "../../types/admin";

function AdminsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Memuat daftar admin"
      className="space-y-3 rounded-xl border border-border bg-surface p-6"
    >
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />

      <span className="sr-only">Memuat daftar admin...</span>
    </div>
  );
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminListItem | null>(null);
  const [deleting, setDeleting] = useState<AdminListItem | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [selfId] = useState(currentAdminId);
  const toast = useToast();

  const [reloadToken, setReloadToken] = useState(0);

  function reload() {
    setReloadToken((current) => current + 1);
  }

  useEffect(() => {
    const controller = new AbortController();

    getAdmins(controller.signal)
      .then((data) => {
        setAdmins(data);
        setError("");
      })
      .catch((loadError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          describeApiError(
            "AdminsPage",
            loadError,
            "Gagal memuat daftar admin."
          )
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [reloadToken]);

  async function handleDelete() {
    if (deleting === null) {
      return;
    }

    try {
      setDeletingBusy(true);

      const result = await deleteAdmin(deleting.id);

      setAdmins((current) =>
        current.filter((item) => item.id !== deleting.id)
      );
      setDeleting(null);
      toast.success(result.message);
    } catch (deleteError) {
      toast.error(
        describeApiError(
          "AdminsPage",
          deleteError,
          "Gagal menghapus admin."
        )
      );
    } finally {
      setDeletingBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">Kelola Admin</h1>

        <p className="mt-1 text-sm text-fg-subtle">
          Tambah atau hapus akun admin. Admin yang dibuat di sini tidak bisa
          menambah admin lain - itu hanya hak superadmin bawaan.
        </p>
      </div>

      {loading && <AdminsSkeleton />}

      {!loading && (
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b px-6 py-4 max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4">
            <div>
              <h2 className="font-semibold text-fg">Daftar Admin</h2>

              <p className="mt-1 text-sm text-fg-subtle">
                Total {admins.length} admin
              </p>
            </div>

            <Button
              type="button"
              className="max-md:w-full"
              onClick={() => setIsCreateOpen(true)}
            >
              + Tambah Admin
            </Button>
          </div>

          {error !== "" && (
            <div className="border-b px-6 py-4 max-md:px-4">
              <p className="text-sm text-danger">{error}</p>

              <Button
                type="button"
                variant="secondary"
                className="mt-3"
                onClick={() => {
                  setLoading(true);
                  reload();
                }}
              >
                Coba lagi
              </Button>
            </div>
          )}

          {admins.length === 0 && error === "" ? (
            <p className="px-6 py-8 text-center text-sm text-fg-muted max-md:px-4">
              Belum ada admin lain selain superadmin bawaan.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {admins.map((admin) => {
                const isSelf = admin.id === selfId;
                const isSuperAdmin = admin.role === ADMIN_ROLE.superAdmin;

                return (
                  <li
                    key={admin.id}
                    className="flex items-center gap-4 px-6 py-4 max-md:px-4"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium text-fg">
                          {admin.username}
                        </p>

                        {isSuperAdmin && (
                          <span className="rounded-full bg-accent-surface px-2 py-0.5 text-xs font-semibold text-accent">
                            Superadmin
                          </span>
                        )}

                        {isSelf && (
                          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-fg-subtle">
                            Akun Anda
                          </span>
                        )}
                      </div>

                      <p className="mt-0.5 text-sm text-fg-subtle">
                        {isSuperAdmin
                          ? "Bisa menambah dan menghapus admin."
                          : "Hanya bisa mengelola materi, soal, dan mahasiswa."}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <IconButton
                        variant="ghost"
                        onClick={() => setEditing(admin)}
                        label={`Ubah ${admin.username}`}
                        title="Ubah username atau password"
                      >
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
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
                        </svg>
                      </IconButton>

                      {!isSuperAdmin && !isSelf && (
                        <IconButton
                          variant="danger"
                          onClick={() => setDeleting(admin)}
                          label={`Hapus admin ${admin.username}`}
                          title="Hapus admin"
                        >
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
                            <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
                          </svg>
                        </IconButton>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <EditAdminModal
        key={editing?.id ?? "closed"}
        admin={editing}
        isSelf={editing !== null && editing.id === selfId}
        onClose={() => setEditing(null)}
        onSaved={(username) => {
          toast.success(
            `Akun ${username} berhasil diperbarui.`
          );
          reload();
        }}
      />

      <CreateAdminModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSaved={(username) => {
          toast.success(`Admin ${username} berhasil dibuat.`);
          reload();
        }}
      />

        <DangerConfirmModal
          open={deleting !== null}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          loading={deletingBusy}
          title="Hapus admin"
          confirmPhrase={deleting?.username ?? ""}
          summary={
            <p className="text-sm leading-6 text-fg-muted">
              Akun{" "}
              <strong className="text-fg">{deleting?.username}</strong>{" "}
              akan dihapus permanen dari daftar admin U-LAR.
            </p>
          }
          effects={
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Akun <strong>{deleting?.username}</strong> tidak bisa
                login lagi dan harus dibuat ulang dari nol.
              </li>
              <li>
                Password lama langsung tidak berlaku, tidak ada cara
                memulihkannya.
              </li>
              <li>
                Materi, soal, dan hasil ujian yang pernah dibuat akun ini{" "}
                <strong>tidak ikut terhapus</strong> dan tetap milik U-LAR.
              </li>
            </ul>
          }
          confirmLabel="Hapus permanen"
        />
    </div>
  );
}
