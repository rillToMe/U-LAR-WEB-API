import IconButton from "../ui/IconButton";
import Input from "../ui/Input";
import { useToast } from "../common/toastContext";
import { VALIDATION } from "../../config/validation";
import { problemFor } from "./materialDraft";
import type { DraftProblem, MaterialDraft } from "../../types/materialEditor";

const rules = VALIDATION.material;

interface MaterialEditorSidebarProps {
  draft: MaterialDraft;
  onChange: (patch: Partial<MaterialDraft>) => void;
  problems: DraftProblem[];
  /** Alamat halaman materi yang akan berlaku setelah disimpan. */
  slugPreview: string;
  /** Slug yang sudah tersimpan; kosong berarti materi belum pernah disimpan. */
  savedSlug: string;
  /** true = dipublikasikan, false = draft, null = belum pernah disimpan. */
  published: boolean | null;
  updatedAt: string | null;
  onHide: () => void;
}

const statusStyles = {
  empty: "border-border bg-surface-hover text-fg-subtle",
  draft: "border-warning-border bg-warning-surface text-warning",
  published: "border-success-border bg-success-surface text-success-fg",
};

/** Panel metadata: hal-hal yang tidak ditulis di badan dokumen. */
export default function MaterialEditorSidebar({
  draft,
  onChange,
  problems,
  slugPreview,
  savedSlug,
  published,
  updatedAt,
  onHide,
}: MaterialEditorSidebarProps) {
  const toast = useToast();

  const statusKey =
    published === null ? "empty" : published ? "published" : "draft";
  const statusLabel =
    published === null ? "Belum disimpan" : published ? "Dipublikasikan" : "Draft";

  const previewHref =
    savedSlug === ""
      ? ""
      : new URL(
          `/materi.html?slug=${encodeURIComponent(savedSlug)}`,
          window.location.origin
        ).toString();

  async function copyAddress() {
    if (previewHref === "") {
      return;
    }

    try {
      await navigator.clipboard.writeText(previewHref);
      toast.success("Alamat halaman materi disalin.");
    } catch (error) {
      console.error(error);
      toast.error("Alamat gagal disalin. Salin manual dari kotak alamat.");
    }
  }

  return (
    <aside className="w-80 shrink-0 space-y-5 max-lg:w-full">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-fg">Detail materi</h2>

        <IconButton
          size="sm"
          onClick={onHide}
          label="Sembunyikan detail materi"
          title="Sembunyikan panel detail"
        >
          {/* Ikon sama dengan tombol toggle di topbar supaya hubungan
              "tutup panel ↔ buka panel" langsung terlihat. */}
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
        </IconButton>
      </div>

      <div
        className={`rounded-xl border px-3.5 py-3 ${statusStyles[statusKey]}`}
      >
        <p className="text-xs font-semibold uppercase tracking-wider">
          Status
        </p>

        <p className="mt-1 text-sm font-medium">{statusLabel}</p>

        <p className="mt-1 text-xs opacity-80">
          {published === null
            ? "Materi baru belum punya status. Simpan dulu sebagai draft, atau langsung publikasikan."
            : published
              ? "Materi bisa dibaca mahasiswa di halaman materi."
              : "Materi belum tampil di halaman mahasiswa sampai dipublikasikan."}
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-surface p-3.5">
        <Input
          id="material-module-code"
          label="Kode Modul"
          type="text"
          value={draft.moduleCode}
          maxLength={rules.moduleCode.maxLength}
          placeholder="MODUL 01"
          helperText="Badge kecil di atas judul halaman materi."
          error={problemFor(problems, "moduleCode") || undefined}
          onChange={(event) => onChange({ moduleCode: event.target.value })}
        />

        <Input
          id="material-read-minutes"
          label="Estimasi Waktu (menit)"
          type="number"
          value={draft.readMinutes}
          min={rules.readMinutes.min}
          max={rules.readMinutes.max}
          helperText={`${rules.readMinutes.min}-${rules.readMinutes.max} menit`}
          error={problemFor(problems, "readMinutes") || undefined}
          onChange={(event) => onChange({ readMinutes: event.target.value })}
        />

        <Input
          id="material-order"
          label="Urutan Tampil"
          type="number"
          value={draft.orderNumber}
          min={0}
          helperText="Angka kecil tampil lebih dulu di daftar materi."
          error={problemFor(problems, "orderNumber") || undefined}
          onChange={(event) => onChange({ orderNumber: event.target.value })}
        />
      </div>

      <div className="rounded-xl border border-border bg-surface p-3.5">
        <p className="text-xs font-medium text-fg-muted">Alamat halaman</p>

        <p className="mt-1.5 break-all font-mono text-sm text-fg">
          {slugPreview === "" ? "-" : `/materi.html?slug=${slugPreview}`}
        </p>

        <p className="mt-1.5 text-xs text-fg-subtle">
          Dibuat otomatis dari judul dan ikut berubah saat judulnya diubah.
          Angka ditambahkan sendiri bila alamat itu sudah dipakai materi lain.
        </p>

        <div className="mt-3 flex items-center gap-3">
          <IconButton
            size="sm"
            variant="secondary"
            onClick={() => void copyAddress()}
            disabled={previewHref === ""}
            label="Salin alamat halaman materi"
            title="Salin alamat"
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
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V6a2 2 0 0 1 2-2h9" />
            </svg>
          </IconButton>

          {previewHref !== "" && (
            <a
              href={previewHref}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-accent transition-colors hover:text-accent-hover"
            >
              Buka halaman materi
            </a>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-3.5">
        <p className="text-xs font-medium text-fg-muted">Isi materi</p>

        <ul className="mt-2 space-y-1 text-xs text-fg-subtle">
          <li>{draft.keyPoints.length} poin penting</li>
          <li>{draft.callouts.length} catatan kunci</li>
          <li>{draft.diagrams.length} diagram</li>
          <li>{draft.accordion.length} materi tambahan</li>
        </ul>

        {updatedAt !== null && (
          <p className="mt-3 border-t border-border pt-2 text-xs text-fg-placeholder">
            Terakhir disimpan {updatedAt}
          </p>
        )}
      </div>
    </aside>
  );
}
