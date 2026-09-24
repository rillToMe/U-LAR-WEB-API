import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";
import Skeleton from "../../components/ui/Skeleton";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useToast } from "../../components/common/toastContext";
import { getApiErrorMessage } from "../../services/apiError";
import {
  deleteMaterial,
  getMaterials,
  updateMaterialStatus,
} from "../../services/materialBankApi";
import type { MaterialSummaryItem } from "../../types/materialBank";

function MaterialsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Memuat daftar materi"
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

      <span className="sr-only">Memuat daftar materi...</span>
    </div>
  );
}

export default function MaterialsPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const [materials, setMaterials] = useState<MaterialSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<MaterialSummaryItem | null>(
    null
  );
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getMaterials()
      .then((data) => {
        if (cancelled) {
          return;
        }

        setMaterials(data);
        setError("");
      })
      .catch((loadError) => {
        if (cancelled) {
          return;
        }

        console.error(loadError);
        setError(
          getApiErrorMessage(loadError, "Gagal mengambil daftar materi.")
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
    navigate("/admin/materials/new");
  }

  function openEdit(material: MaterialSummaryItem) {
    navigate(`/admin/materials/${material.id}`);
  }

  async function handleToggleStatus(material: MaterialSummaryItem) {
    setStatusBusyId(material.id);

    try {
      const response = await updateMaterialStatus(
        material.id,
        !material.isActive
      );

      reload(response.message);
    } catch (statusError) {
      console.error(statusError);
      toast.error(
        getApiErrorMessage(
          statusError,
          `Gagal mengubah status ${material.title}.`
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
      const response = await deleteMaterial(deleting.id);

      setDeleting(null);
      reload(response.message);
    } catch (deleteError) {
      console.error(deleteError);
      toast.error(
        getApiErrorMessage(deleteError, "Gagal menghapus materi.")
      );
    } finally {
      setDeletingBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg">Bank Materi</h1>

        <p className="mt-1 text-sm text-fg-subtle">
          Susun materi pembelajaran. Materi yang aktif bisa dibuka
          mahasiswa di halaman materi.
        </p>
      </div>

      {loading && <MaterialsSkeleton />}

      {!loading && (
        <div className="overflow-hidden rounded-xl border bg-surface">
          <div className="flex items-center justify-between border-b px-6 py-4 max-md:flex-col max-md:items-stretch max-md:gap-3 max-md:px-4">
            <div>
              <h2 className="font-semibold text-fg">Daftar Materi</h2>

              <p className="mt-1 text-sm text-fg-subtle">
                Total {materials.length} materi
              </p>
            </div>

            <Button
              type="button"
              className="max-md:w-full"
              onClick={openCreate}
            >
              + Tambah Materi
            </Button>
          </div>

          {error !== "" && materials.length === 0 && (
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

          {materials.length === 0 && error === "" && (
            <div className="px-6 py-12 text-center">
              <p className="font-medium text-fg">Belum ada materi</p>

              <p className="mt-1 text-sm text-fg-subtle">
                Tambahkan materi pertama untuk dibaca mahasiswa.
              </p>

              <Button
                type="button"
                size="sm"
                className="mt-4"
                onClick={openCreate}
              >
                + Tambah Materi
              </Button>
            </div>
          )}

          {materials.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm max-md:min-w-[960px]">
                <thead className="border-b bg-surface-muted">
                  <tr>
                    <th className="px-6 py-3 font-medium text-fg-subtle max-md:px-3">
                      Judul
                    </th>
                    <th className="px-6 py-3 font-medium text-fg-subtle max-md:px-3">
                      Modul
                    </th>
                    <th className="px-6 py-3 font-medium text-fg-subtle max-md:px-3">
                      Isi
                    </th>
                    <th className="px-6 py-3 font-medium text-fg-subtle max-md:px-3">
                      Urutan
                    </th>
                    <th className="px-6 py-3 font-medium text-fg-subtle max-md:px-3">
                      Estimasi
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
                  {materials.map((material) => (
                    <tr
                      key={material.id}
                      className="hover:bg-surface-muted"
                    >
                      <td className="px-6 py-4 max-md:px-3">
                        <p className="font-medium text-fg">
                          {material.title}
                        </p>

                        <p className="mt-0.5 font-mono text-xs text-fg-subtle">
                          {material.slug}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-fg-muted max-md:px-3">
                        {material.moduleCode}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-xs text-fg-subtle max-md:px-3">
                        {material.keyPointCount} poin
                        {" · "}
                        {material.calloutCount} catatan
                        {" · "}
                        {material.accordionCount} tambahan
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 tabular-nums text-fg-muted max-md:px-3">
                        {material.orderNumber}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-fg-muted max-md:px-3">
                        {material.readMinutes} menit
                      </td>

                      <td className="px-6 py-4 max-md:px-3">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={material.isActive}
                          aria-busy={statusBusyId === material.id}
                          aria-label={`${
                            material.isActive
                              ? "Nonaktifkan"
                              : "Aktifkan"
                          } materi ${material.title}`}
                          title={
                            material.isActive
                              ? "Nonaktifkan"
                              : "Aktifkan"
                          }
                          disabled={statusBusyId === material.id}
                          onClick={() => handleToggleStatus(material)}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none ${
                            statusBusyId === material.id
                              ? "animate-pulse "
                              : ""
                          }${
                            material.isActive
                              ? "bg-success-fg hover:ring-2 hover:ring-success-border"
                              : "bg-fg-placeholder hover:ring-2 hover:ring-border-strong"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block size-5 rounded-full bg-surface shadow-sm transition-transform duration-200 ease-out motion-reduce:transition-none ${
                              material.isActive
                                ? "translate-x-[1.375rem]"
                                : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </td>

                      <td className="px-6 py-4 max-md:px-3">
                        <div className="flex items-center gap-3">
                          <a
                            href={`/materi.html?slug=${encodeURIComponent(material.slug)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:border-border-strong hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                          >
                            Pratinjau
                          </a>

                          <IconButton
                            variant="secondary"
                            onClick={() => openEdit(material)}
                            label={`Ubah materi ${material.title}`}
                            title="Ubah materi"
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
                            onClick={() => setDeleting(material)}
                            label={`Hapus materi ${material.title}`}
                            title="Hapus materi"
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

      <ConfirmModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        loading={deletingBusy}
        title="Hapus materi ini?"
        description="Materi akan hilang dari halaman mahasiswa."
        confirmLabel="Hapus Materi"
      >
        <p className="text-sm text-fg-muted">
          Materi{" "}
          <span className="font-semibold text-fg">
            {deleting?.title}
          </span>{" "}
          akan dihapus permanen. Kalau hanya ingin menyembunyikannya
          sementara, nonaktifkan saja.
        </p>
      </ConfirmModal>
    </div>
  );
}
