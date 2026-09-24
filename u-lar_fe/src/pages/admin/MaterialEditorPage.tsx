import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Skeleton from "../../components/ui/Skeleton";
import MaterialEditorCanvas from "../../components/materials/MaterialEditorCanvas";
import MaterialEditorSidebar from "../../components/materials/MaterialEditorSidebar";
import {
  createEmptyDraft,
  draftFromDetail,
  draftToSaveRequest,
  pruneEmptyDraft,
  validateDraft,
} from "../../components/materials/materialDraft";
import { previewMaterialSlug } from "../../components/materials/materialSlug";
import { useToast } from "../../components/common/toastContext";
import { getApiErrorMessage } from "../../services/apiError";
import {
  createMaterial,
  getMaterialDetail,
  updateMaterial,
  updateMaterialStatus,
} from "../../services/materialBankApi";
import type { DraftProblem, MaterialDraft } from "../../types/materialEditor";

/** Keadaan materi yang sudah tersimpan - dipisah dari draft supaya angka di
 * panel kanan tidak ikut berubah saat admin masih mengetik. */
interface SavedState {
  slug: string;
  published: boolean;
  updatedAt: string | null;
}

/** Waktu dari server diubah jadi teks pendek yang enak dibaca. */
function formatUpdatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/**
 * Editor materi gaya dokumen: judul dan isi ditulis langsung di canvas,
 * metadata tinggal di panel kanan. Satu halaman ini dipakai untuk materi baru
 * dan materi yang sudah ada - dibedakan dari ada/tidaknya id di URL.
 */
export default function MaterialEditorPage() {
  const { materialId: materialIdParam } = useParams<{ materialId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const parsedId =
    materialIdParam === undefined ? null : Number(materialIdParam);
  const materialId =
    parsedId !== null && Number.isInteger(parsedId) && parsedId > 0
      ? parsedId
      : null;
  const invalidId = materialIdParam !== undefined && materialId === null;

  /** Materi baru sudah punya dokumen kosong sejak awal; materi lama menunggu
   * hasil muat. Karena itu isian awal dibuat di sini, bukan lewat effect. */
  const [initialDraft] = useState<MaterialDraft | null>(() =>
    materialId === null ? createEmptyDraft() : null
  );
  const [draft, setDraft] = useState<MaterialDraft | null>(initialDraft);
  const [snapshot, setSnapshot] = useState(() =>
    initialDraft === null ? "" : JSON.stringify(initialDraft)
  );
  const [original, setOriginal] = useState<{
    title: string;
    slug: string;
  } | null>(null);
  const [saved, setSaved] = useState<SavedState | null>(null);
  /** Id materi yang isinya sudah selesai dimuat; dipakai menandai pemuatan. */
  const [loadedId, setLoadedId] = useState<number | null>(null);
  const [problems, setProblems] = useState<DraftProblem[]>([]);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [loadError, setLoadError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const loading = materialId !== null && loadedId !== materialId;

  useEffect(() => {
    if (materialId === null) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const detail = await getMaterialDetail(materialId);

        if (cancelled) {
          return;
        }

        const loaded = draftFromDetail(detail);
        const updatedText = formatUpdatedAt(detail.updatedAt);

        setDraft(loaded);
        setSnapshot(JSON.stringify(loaded));
        setOriginal({ title: detail.title, slug: detail.slug });
        setSaved({
          slug: detail.slug,
          published: detail.isActive,
          updatedAt: updatedText === "" ? null : updatedText,
        });
        setLoadError("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);
        setLoadError(getApiErrorMessage(error, "Materi gagal dimuat."));
      } finally {
        if (!cancelled) {
          setLoadedId(materialId);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [materialId, reloadKey]);

  const dirty =
    draft !== null && snapshot !== "" && JSON.stringify(draft) !== snapshot;

  const slugPreview =
    draft === null ? "" : previewMaterialSlug(draft.title, original);

  // Perubahan yang belum disimpan tidak boleh hilang tanpa peringatan saat
  // halaman ditutup atau dimuat ulang.
  useEffect(() => {
    if (!dirty) {
      return;
    }

    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", warn);

    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function patchDraft(patch: Partial<MaterialDraft>) {
    setDraft((current) =>
      current === null ? current : { ...current, ...patch }
    );
  }

  /**
   * Menyimpan dokumen. Dua tombol di topbar memakai jalur yang sama, bedanya
   * hanya status akhirnya: "Simpan Draft" menyimpan sebagai nonaktif,
   * "Publikasikan" sekalian menampilkannya ke mahasiswa.
   */
  async function handleSave(publish: boolean) {
    if (draft === null || saving !== null) {
      return;
    }

    // Blok yang belum diisi dibuang sebelum diperiksa, supaya admin tidak
    // dihentikan oleh blok kosong yang tidak sengaja ditambahkan.
    const pruned = pruneEmptyDraft(draft);
    const found = validateDraft(pruned);

    setProblems(found);

    if (found.length > 0) {
      toast.error(found[0].message);
      return;
    }

    setSaving(publish ? "publish" : "draft");

    try {
      const request = draftToSaveRequest(pruned);
      let id = materialId;

      if (id === null) {
        id = (await createMaterial(request)).id;
      } else {
        await updateMaterial(id, request);
      }

      // Status aktif punya endpoint sendiri: menyimpan isi tidak boleh
      // diam-diam mengubah keterlihatannya ke mahasiswa.
      if (saved?.published !== publish) {
        await updateMaterialStatus(id, publish);
      }

      // Diambil ulang supaya slug (yang ikut berubah saat judul berubah) dan
      // waktu simpan yang ditampilkan selalu yang tersimpan di server.
      const detail = await getMaterialDetail(id);
      const updatedText = formatUpdatedAt(detail.updatedAt);

      setDraft(pruned);
      setSnapshot(JSON.stringify(pruned));
      setProblems([]);
      setOriginal({ title: detail.title, slug: detail.slug });
      setSaved({
        slug: detail.slug,
        published: detail.isActive,
        updatedAt: updatedText === "" ? null : updatedText,
      });

      toast.success(
        publish ? "Materi dipublikasikan." : "Draft materi disimpan."
      );

      if (materialId === null) {
        navigate(`/admin/materials/${id}`, { replace: true });
      }
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Gagal menyimpan materi."));
    } finally {
      setSaving(null);
    }
  }

  function handleBack() {
    if (dirty) {
      setLeaveOpen(true);
      return;
    }

    navigate("/admin/materials");
  }

  if (invalidId) {
    return (
      <div className="space-y-4">
        <p
          role="alert"
          className="rounded-xl border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger"
        >
          Materi tidak ditemukan. Alamat halamannya mungkin salah.
        </p>

        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate("/admin/materials")}
        >
          Kembali ke Bank Materi
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="-mx-8 -mt-8 max-md:-mx-4 max-md:-mt-4">
        <div className="border-b border-border bg-surface px-8 py-4 max-md:px-4">
          <Skeleton className="h-9 w-64" />
        </div>

        <div className="mx-auto w-full max-w-6xl px-8 py-8 max-md:px-4">
          <div className="max-w-3xl space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (loadError !== "") {
    return (
      <div className="space-y-4">
        <div
          role="alert"
          className="rounded-xl border border-danger-border bg-danger-surface px-4 py-3"
        >
          <p className="text-sm font-semibold text-danger">
            Materi gagal dimuat
          </p>

          <p className="mt-0.5 text-sm text-danger">{loadError}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Coba lagi
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/admin/materials")}
          >
            Kembali ke Bank Materi
          </Button>
        </div>
      </div>
    );
  }

  // Dua cabang di atas sudah menutup materi salah alamat dan pemuatan yang
  // gagal, jadi sampai sini draft pasti ada.
  if (draft === null) {
    return null;
  }

  const statusChip =
    saved === null
      ? {
          className: "border-border bg-surface-hover text-fg-subtle",
          label: "Belum disimpan",
        }
      : saved.published
        ? {
            className:
              "border-success-border bg-success-surface text-success-fg",
            label: "Dipublikasikan",
          }
        : {
            className: "border-warning-border bg-warning-surface text-warning",
            label: "Draft",
          };

  return (
    <div className="-mx-8 -mt-8 max-md:-mx-4 max-md:-mt-4">
      {/* Topbar: tombol kembali, status, dan dua aksi simpan. */}
      <div className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2 px-8 py-3 max-md:px-4">
          <IconButton
            variant="secondary"
            onClick={handleBack}
            label="Kembali ke Bank Materi"
            title="Kembali"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="size-5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </IconButton>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-fg">
              {materialId === null
                ? "Materi Baru"
                : draft.title.trim() === ""
                  ? "Ubah Materi"
                  : draft.title.trim()}
            </p>

            <p className="text-xs text-fg-subtle">
              {dirty
                ? "Ada perubahan belum disimpan"
                : saved === null
                  ? "Belum disimpan"
                  : "Tersimpan"}
            </p>
          </div>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusChip.className}`}
          >
            {statusChip.label}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {/* Panel tersembunyi → tombol diberi teks "Detail materi" agar
                jelas cara membukanya kembali; saat terbuka cukup ikon. */}
            {sidebarOpen ? (
              <IconButton
                variant="secondary"
                onClick={() => setSidebarOpen(false)}
                aria-expanded={sidebarOpen}
                label="Sembunyikan detail materi"
                title="Sembunyikan panel detail"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="size-5"
                >
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M15 4v16" />
                </svg>
              </IconButton>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                aria-expanded={sidebarOpen}
                className="gap-1.5"
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
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M15 4v16" />
                </svg>
                Detail materi
              </Button>
            )}

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void handleSave(false)}
              loading={saving === "draft"}
              disabled={saving !== null}
            >
              Simpan Draft
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => void handleSave(true)}
              loading={saving === "publish"}
              disabled={saving !== null}
            >
              Publikasikan
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-8 max-md:px-4">
        <div className="mx-auto flex w-full max-w-6xl items-start gap-8 max-lg:flex-col">
          <MaterialEditorCanvas
            draft={draft}
            onChange={patchDraft}
            problems={problems}
          />

          {sidebarOpen && (
            <MaterialEditorSidebar
              draft={draft}
              onChange={patchDraft}
              problems={problems}
              slugPreview={slugPreview}
              savedSlug={saved?.slug ?? ""}
              published={saved === null ? null : saved.published}
              updatedAt={saved?.updatedAt ?? null}
              onHide={() => setSidebarOpen(false)}
            />
          )}
        </div>
      </div>

      <ConfirmModal
        open={leaveOpen}
        onClose={() => setLeaveOpen(false)}
        onConfirm={() => {
          setLeaveOpen(false);
          navigate("/admin/materials");
        }}
        title="Keluar tanpa menyimpan?"
        description="Perubahan yang belum disimpan akan hilang."
        confirmLabel="Keluar tanpa menyimpan"
        cancelLabel="Lanjut mengedit"
      >
        <p className="text-sm text-fg-muted">
          Materi{" "}
          <span className="font-semibold text-fg">
            {draft.title.trim() === "" ? "baru" : draft.title.trim()}
          </span>{" "}
          masih punya perubahan yang belum disimpan.
        </p>
      </ConfirmModal>
    </div>
  );
}
