import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import IconButton from "../ui/IconButton";
import Select from "../ui/Select";
import { useToast } from "../common/toastContext";
import { getApiErrorMessage } from "../../services/apiError";
import { resolveApiFileUrl } from "../../services/api";
import { uploadMaterialImage } from "../../services/materialBankApi";
import { VALIDATION } from "../../config/validation";
import type { MaterialCalloutTone } from "../../types/material";
import type {
  AccordionBlock,
  CalloutBlock,
  DiagramBlock,
  DraftProblem,
  KeyPointBlock,
  MaterialDraft,
} from "../../types/materialEditor";
import {
  createAccordionBlock,
  createCalloutBlock,
  createDiagramBlock,
  createKeyPointBlock,
  moveBlock,
  patchBlock,
  problemFor,
  removeBlock,
} from "./materialDraft";
import RichTextArea from "./RichTextArea";

const rules = VALIDATION.material;

/** Ikon poin yang dikenal halaman materi (lihat ICON_PATHS di halaman itu). */
const ICON_OPTIONS = [
  { value: "check", label: "Centang" },
  { value: "wire", label: "Kabel" },
  { value: "plug", label: "Konektor" },
  { value: "target", label: "Target" },
  { value: "book", label: "Buku" },
  { value: "alert", label: "Peringatan" },
  { value: "formula", label: "Rumus" },
  { value: "bulb", label: "Ide" },
];

const TONE_OPTIONS = [
  { value: "info", label: "Info (biru)" },
  { value: "tip", label: "Tips (hijau)" },
  { value: "warn", label: "Peringatan (merah)" },
  { value: "formula", label: "Rumus (kuning)" },
];

/** Warna kotak sorotan di editor dibuat sama dengan halaman materi, supaya
 * yang ditulis admin terlihat persis seperti yang dibaca mahasiswa. */
const TONE_STYLES: Record<
  MaterialCalloutTone,
  { box: string; text: string }
> = {
  info: {
    box: "border-accent-border bg-accent-surface",
    text: "text-accent",
  },
  tip: {
    box: "border-success-border bg-success-surface",
    text: "text-success-fg",
  },
  warn: {
    box: "border-danger-border bg-danger-surface",
    text: "text-danger",
  },
  formula: {
    box: "border-warning-border bg-warning-surface",
    text: "text-warning",
  },
};

/** Batas unggah disamakan dengan MediaStorageOptions di server supaya
 * penolakan paling sering terjadi di layar, bukan setelah berkas terkirim. */
const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;

interface MaterialEditorCanvasProps {
  draft: MaterialDraft;
  onChange: (patch: Partial<MaterialDraft>) => void;
  problems: DraftProblem[];
}

/** Tombol kecil di tiap blok: geser urutan dan hapus. */
function BlockActions({
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp,
  canMoveDown,
  removeLabel,
}: {
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  removeLabel: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100">
      <IconButton
        size="sm"
        onClick={onMoveUp}
        disabled={!canMoveUp}
        label="Pindah ke atas"
        title="Pindah ke atas"
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
          <path d="m12 19V5M5 12l7-7 7 7" />
        </svg>
      </IconButton>

      <IconButton
        size="sm"
        onClick={onMoveDown}
        disabled={!canMoveDown}
        label="Pindah ke bawah"
        title="Pindah ke bawah"
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
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </IconButton>

      <IconButton
        size="sm"
        variant="danger"
        onClick={onRemove}
        label={removeLabel}
        title="Hapus blok"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          aria-hidden="true"
          className="size-4"
        >
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </IconButton>
    </div>
  );
}

/** Judul satu bagian isi materi. Urutannya mengikuti halaman materi: poin
 * penting, catatan, ilustrasi, lalu penjelasan tambahan. */
function CanvasSection({
  label,
  hint,
  count,
  onAdd,
  addLabel,
  emptyText,
  children,
}: {
  label: string;
  hint: string;
  count: number;
  onAdd: () => void;
  addLabel: string;
  emptyText: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-fg">
            {label}

            <span className="ml-2 text-xs font-normal tabular-nums text-fg-placeholder">
              {count}
            </span>
          </h2>

          <p className="mt-0.5 text-xs text-fg-subtle">{hint}</p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium text-fg-subtle transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {addLabel}
        </button>
      </div>

      <div className="mt-2 space-y-1.5">
        {count === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-3 py-4 text-center text-xs text-fg-subtle">
            {emptyText}
          </p>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

function KeyPointRow({
  block,
  index,
  problem,
  autoFocus,
  canMoveUp,
  canMoveDown,
  onChange,
  onMove,
  onRemove,
  onAddAfter,
}: {
  block: KeyPointBlock;
  index: number;
  problem: string;
  autoFocus: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (patch: Partial<KeyPointBlock>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onAddAfter: () => void;
}) {
  return (
    <div
      className={`group rounded-xl border px-3 py-2 transition-colors ${
        problem !== ""
          ? "border-danger-border bg-danger-surface/40"
          : "border-transparent hover:border-border hover:bg-surface"
      }`}
    >
      <div className="flex items-start gap-2">
        <Select
          id={`kp-icon-${block.key}`}
          value={block.icon}
          options={ICON_OPTIONS}
          ariaLabel={`Ikon poin penting nomor ${index + 1}`}
          onChange={(value) => onChange({ icon: value })}
          className="w-28 shrink-0 py-1.5 text-xs"
        />

        <RichTextArea
          id={`kp-text-${block.key}`}
          value={block.text}
          onChange={(value) => onChange({ text: value })}
          label={`Teks poin penting nomor ${index + 1}`}
          maxLength={rules.keyPoint.textMaxLength}
          placeholder="Tulis satu poin penting. Enter membuat poin berikutnya."
          autoFocus={autoFocus}
          invalid={problem !== ""}
          onSubmitShortcut={onAddAfter}
          onAddSibling={onAddAfter}
        />

        <BlockActions
          onMoveUp={() => onMove(-1)}
          onMoveDown={() => onMove(1)}
          onRemove={onRemove}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          removeLabel={`Hapus poin nomor ${index + 1}`}
        />
      </div>

      {problem !== "" && (
        <p className="mt-1 pl-1 text-xs text-danger">{problem}</p>
      )}
    </div>
  );
}

function CalloutRow({
  block,
  index,
  problem,
  autoFocus,
  canMoveUp,
  canMoveDown,
  onChange,
  onMove,
  onRemove,
}: {
  block: CalloutBlock;
  index: number;
  problem: string;
  autoFocus: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (patch: Partial<CalloutBlock>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const tone = TONE_STYLES[block.tone];

  return (
    <div className={`group rounded-xl border px-3.5 py-3 ${tone.box}`}>
      <div className="flex items-center gap-2">
        <span
          aria-hidden="true"
          className={`flex size-6 shrink-0 items-center justify-center rounded-lg bg-surface/70 ${tone.text}`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4"
          >
            <path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.4.3.6.7.6 1.2v1h6v-1c0-.5.2-.9.6-1.2A6 6 0 0 0 12 3Z" />
          </svg>
        </span>

        <input
          value={block.label}
          maxLength={rules.callout.labelMaxLength}
          onChange={(event) => onChange({ label: event.target.value })}
          placeholder="Catatan kunci / rumus"
          aria-label={`Judul catatan nomor ${index + 1}`}
          className={`min-w-0 flex-1 bg-transparent text-xs font-semibold uppercase tracking-wider outline-none placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:opacity-70 ${tone.text}`}
        />

        <Select
          id={`co-tone-${block.key}`}
          value={block.tone}
          options={TONE_OPTIONS}
          ariaLabel={`Jenis catatan nomor ${index + 1}`}
          onChange={(value) =>
            onChange({ tone: value as MaterialCalloutTone })
          }
          className="w-36 shrink-0 py-1 text-xs"
        />

        <BlockActions
          onMoveUp={() => onMove(-1)}
          onMoveDown={() => onMove(1)}
          onRemove={onRemove}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          removeLabel={`Hapus catatan nomor ${index + 1}`}
        />
      </div>

      <div className="mt-1">
        <RichTextArea
          id={`co-body-${block.key}`}
          value={block.body}
          onChange={(value) => onChange({ body: value })}
          label={`Isi catatan nomor ${index + 1}`}
          maxLength={rules.callout.bodyMaxLength}
          placeholder="Tulis catatan atau rumusnya."
          autoFocus={autoFocus}
          invalid={problem !== ""}
        />
      </div>

      {problem !== "" && <p className="mt-1 text-xs text-danger">{problem}</p>}
    </div>
  );
}

function DiagramRow({
  block,
  index,
  problem,
  canMoveUp,
  canMoveDown,
  onChange,
  onMove,
  onRemove,
}: {
  block: DiagramBlock;
  index: number;
  problem: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (patch: Partial<DiagramBlock>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (file === undefined) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Format gambar harus PNG, JPG, atau WEBP.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Ukuran gambar maksimal 3 MB.");
      return;
    }

    setUploading(true);

    try {
      const uploaded = await uploadMaterialImage(file);

      onChange({ imageUrl: uploaded.url });
      toast.success("Gambar diagram terunggah.");
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Gagal mengunggah gambar."));
    } finally {
      setUploading(false);
    }
  }

  const uploadButtonClass =
    "rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:border-fg-placeholder hover:bg-surface-hover hover:text-fg disabled:pointer-events-none disabled:opacity-50";

  return (
    <div
      className={`group rounded-xl border px-3 py-3 transition-colors ${
        problem !== ""
          ? "border-danger-border bg-danger-surface/40"
          : "border-transparent hover:border-border hover:bg-surface"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-fg-subtle">
          Diagram {index + 1}
        </span>

        <BlockActions
          onMoveUp={() => onMove(-1)}
          onMoveDown={() => onMove(1)}
          onRemove={onRemove}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          removeLabel={`Hapus diagram nomor ${index + 1}`}
        />
      </div>

      {block.imageUrl === "" ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            void handleFile(event.dataTransfer.files[0]);
          }}
          className={`mt-2 rounded-xl border border-dashed px-4 py-8 text-center transition-colors ${
            dragActive
              ? "border-accent bg-accent-surface"
              : "border-border-strong"
          }`}
        >
          <p className="text-sm text-fg-muted">
            {uploading
              ? "Mengunggah gambar..."
              : "Tarik gambar diagram ke sini"}
          </p>

          <p className="mt-1 text-xs text-fg-subtle">
            PNG, JPG, atau WEBP - maksimal 3 MB
          </p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`mt-3 ${uploadButtonClass}`}
          >
            Pilih gambar
          </button>
        </div>
      ) : (
        <figure className="mt-2">
          <img
            src={resolveApiFileUrl(block.imageUrl)}
            alt={block.caption === "" ? `Diagram ${index + 1}` : block.caption}
            loading="lazy"
            className="block w-full rounded-lg border border-border"
          />

          <figcaption className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={uploadButtonClass}
            >
              Ganti gambar
            </button>

            <button
              type="button"
              onClick={() => onChange({ imageUrl: "" })}
              className={uploadButtonClass}
            >
              Hapus gambar
            </button>
          </figcaption>
        </figure>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(event) => {
          void handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <input
        value={block.caption}
        maxLength={rules.diagram.captionMaxLength}
        onChange={(event) => onChange({ caption: event.target.value })}
        placeholder="Keterangan gambar (opsional)"
        aria-label={`Keterangan diagram nomor ${index + 1}`}
        className="mt-2 w-full bg-transparent px-1 py-1 text-sm text-fg-muted outline-none placeholder:text-fg-placeholder"
      />

      <details className="mt-1 text-xs text-fg-subtle">
        <summary className="cursor-pointer select-none px-1 py-0.5 hover:text-fg">
          Pakai alamat gambar
        </summary>

        <input
          value={block.imageUrl}
          onChange={(event) => onChange({ imageUrl: event.target.value })}
          placeholder="https://..."
          aria-label={`Alamat gambar diagram nomor ${index + 1}`}
          className="mt-1 w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-xs text-fg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-border"
        />

        <p className="px-1 py-1">
          Gambar yang diunggah disimpan server sebagai alamat relatif
          (/uploads/...), jadi tetap terbuka dari perangkat mana pun.
        </p>
      </details>

      {problem !== "" && <p className="mt-1 text-xs text-danger">{problem}</p>}
    </div>
  );
}

function AccordionRow({
  block,
  index,
  problem,
  autoFocus,
  canMoveUp,
  canMoveDown,
  onChange,
  onMove,
  onRemove,
}: {
  block: AccordionBlock;
  index: number;
  problem: string;
  autoFocus: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onChange: (patch: Partial<AccordionBlock>) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className={`group rounded-xl border bg-surface ${
        problem !== "" ? "border-danger-border" : "border-border"
      }`}
    >
      <div className="flex items-center gap-1 px-2 py-2">
        <IconButton
          size="sm"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          label={
            open
              ? `Tutup materi tambahan nomor ${index + 1}`
              : `Buka materi tambahan nomor ${index + 1}`
          }
          title={open ? "Tutup isi" : "Buka isi"}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`size-4 transition-transform duration-200 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </IconButton>

        <input
          value={block.title}
          maxLength={rules.accordion.titleMaxLength}
          onChange={(event) => onChange({ title: event.target.value })}
          placeholder="Judul materi tambahan / glosarium"
          aria-label={`Judul materi tambahan nomor ${index + 1}`}
          className="min-w-0 flex-1 bg-transparent px-1 text-sm font-medium text-fg outline-none placeholder:font-normal placeholder:text-fg-placeholder"
        />

        <BlockActions
          onMoveUp={() => onMove(-1)}
          onMoveDown={() => onMove(1)}
          onRemove={onRemove}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          removeLabel={`Hapus materi tambahan nomor ${index + 1}`}
        />
      </div>

      {open && (
        <div className="border-t border-border px-3 py-2">
          <RichTextArea
            id={`ac-body-${block.key}`}
            value={block.body}
            onChange={(value) => onChange({ body: value })}
            label={`Isi materi tambahan nomor ${index + 1}`}
            maxLength={rules.accordion.bodyMaxLength}
            placeholder="Tulis penjelasan tambahan atau arti istilahnya."
            autoFocus={autoFocus}
            invalid={problem !== ""}
          />
        </div>
      )}

      {problem !== "" && (
        <p className="px-3 pb-2 text-xs text-danger">{problem}</p>
      )}
    </div>
  );
}

/** Menyisipkan blok baru tepat setelah blok lain - dipakai saat admin menekan
 * Enter atau tombol "+ Poin" di dalam satu blok. */
function insertAfter<T extends { key: number }>(
  blocks: T[],
  key: number,
  block: T
): T[] {
  const index = blocks.findIndex((item) => item.key === key);

  if (index === -1) {
    return [...blocks, block];
  }

  return [...blocks.slice(0, index + 1), block, ...blocks.slice(index + 1)];
}

type BlockType = "keyPoint" | "callout" | "diagram" | "accordion";

/** Pilihan blok di tombol "Tambah blok". Urutan tampilnya di halaman materi
 * ditentukan bagiannya, bukan urutan penambahan. */
const BLOCK_TYPE_OPTIONS: { type: BlockType; label: string; hint: string }[] = [
  {
    type: "keyPoint",
    label: "Poin penting",
    hint: "Butir ringkas dengan ikonnya sendiri",
  },
  {
    type: "callout",
    label: "Catatan kunci / rumus",
    hint: "Kotak sorotan: info, tips, peringatan, atau rumus",
  },
  {
    type: "diagram",
    label: "Diagram",
    hint: "Unggah gambar - bisa juga ditarik ke bloknya",
  },
  {
    type: "accordion",
    label: "Materi tambahan",
    hint: "Glosarium atau penjelasan yang bisa dibuka-tutup",
  },
];

/** Menu kecil di bawah canvas: memilih jenis blok yang mau ditambahkan. */
function AddBlockMenu({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function close() {
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("click", close);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    // Klik di dalam menu tidak boleh ikut menutup menunya.
    <div
      className="relative mt-10"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong px-4 py-3 text-sm font-medium text-fg-subtle transition-colors hover:border-accent hover:bg-accent-surface hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        + Tambah blok
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-20 mb-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          {BLOCK_TYPE_OPTIONS.map((option) => (
            <button
              key={option.type}
              type="button"
              onClick={() => {
                onAdd(option.type);
                setOpen(false);
              }}
              className="flex w-full flex-col items-start gap-0.5 border-b border-border px-4 py-2.5 text-left transition-colors last:border-b-0 hover:bg-surface-hover"
            >
              <span className="text-sm font-medium text-fg">
                {option.label}
              </span>

              <span className="text-xs text-fg-subtle">{option.hint}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Canvas dokumen materi: judul, deskripsi, lalu bagian-bagian isi yang sama
 * seperti yang dibaca mahasiswa. Semua isian ditulis langsung di tempatnya -
 * tidak ada form terpisah per blok.
 */
export default function MaterialEditorCanvas({
  draft,
  onChange,
  problems,
}: MaterialEditorCanvasProps) {
  /** Blok yang baru ditambahkan langsung siap diketik. */
  const [autoFocusKey, setAutoFocusKey] = useState<number | null>(null);

  const titleProblem = problemFor(problems, "title");
  const subtitleProblem = problemFor(problems, "subtitle");

  function addKeyPoint(afterKey?: number) {
    const block = createKeyPointBlock();

    setAutoFocusKey(block.key);

    onChange({
      keyPoints:
        afterKey === undefined
          ? [...draft.keyPoints, block]
          : insertAfter(draft.keyPoints, afterKey, block),
    });
  }

  function addCallout() {
    const block = createCalloutBlock();

    setAutoFocusKey(block.key);
    onChange({ callouts: [...draft.callouts, block] });
  }

  function addDiagram() {
    onChange({ diagrams: [...draft.diagrams, createDiagramBlock()] });
  }

  function addAccordion() {
    const block = createAccordionBlock();

    setAutoFocusKey(block.key);
    onChange({ accordion: [...draft.accordion, block] });
  }

  function addBlock(type: BlockType) {
    if (type === "keyPoint") {
      addKeyPoint();
      return;
    }

    if (type === "callout") {
      addCallout();
      return;
    }

    if (type === "diagram") {
      addDiagram();
      return;
    }

    addAccordion();
  }

  return (
    <div className="min-w-0 flex-1">
      <div className="mx-auto w-full max-w-3xl">
        {/* Judul dan deskripsi: dua baris pertama dokumen, tanpa kotak. */}
        <div className="px-1">
          <label htmlFor="material-title" className="sr-only">
            Judul materi
          </label>

          <input
            id="material-title"
            value={draft.title}
            maxLength={rules.title.maxLength}
            onChange={(event) => onChange({ title: event.target.value })}
            placeholder="Judul materi"
            aria-invalid={titleProblem !== ""}
            className={`w-full bg-transparent text-3xl font-bold leading-tight tracking-tight text-fg outline-none placeholder:text-fg-placeholder max-md:text-2xl ${
              titleProblem === "" ? "" : "rounded-lg ring-1 ring-danger-border"
            }`}
          />

          {titleProblem !== "" && (
            <p className="mt-1 text-xs text-danger">{titleProblem}</p>
          )}

          <label htmlFor="material-subtitle" className="sr-only">
            Deskripsi singkat
          </label>

          <input
            id="material-subtitle"
            value={draft.subtitle}
            maxLength={rules.subtitle.maxLength}
            onChange={(event) => onChange({ subtitle: event.target.value })}
            placeholder="Satu kalimat ringkasan materi"
            aria-invalid={subtitleProblem !== ""}
            className={`mt-2 w-full bg-transparent text-base leading-6 text-fg-muted outline-none placeholder:text-fg-placeholder ${
              subtitleProblem === ""
                ? ""
                : "rounded-lg ring-1 ring-danger-border"
            }`}
          />

          {subtitleProblem !== "" && (
            <p className="mt-1 text-xs text-danger">{subtitleProblem}</p>
          )}
        </div>

        <div className="mt-10 space-y-9">
          <CanvasSection
            label="Poin penting"
            hint="Butir ringkas yang dibaca mahasiswa lebih dulu."
            count={draft.keyPoints.length}
            onAdd={() => addKeyPoint()}
            addLabel="+ Poin"
            emptyText="Belum ada poin penting."
          >
            {draft.keyPoints.map((block, index) => (
              <KeyPointRow
                key={block.key}
                block={block}
                index={index}
                problem={problemFor(problems, `kp:${block.key}`)}
                autoFocus={autoFocusKey === block.key}
                canMoveUp={index > 0}
                canMoveDown={index < draft.keyPoints.length - 1}
                onChange={(patch) =>
                  onChange({
                    keyPoints: patchBlock(draft.keyPoints, block.key, patch),
                  })
                }
                onMove={(direction) =>
                  onChange({
                    keyPoints: moveBlock(
                      draft.keyPoints,
                      block.key,
                      direction
                    ),
                  })
                }
                onRemove={() =>
                  onChange({
                    keyPoints: removeBlock(draft.keyPoints, block.key),
                  })
                }
                onAddAfter={() => addKeyPoint(block.key)}
              />
            ))}
          </CanvasSection>

          <CanvasSection
            label="Catatan kunci & rumus"
            hint="Kotak sorotan yang menarik perhatian pembaca."
            count={draft.callouts.length}
            onAdd={addCallout}
            addLabel="+ Catatan"
            emptyText="Belum ada catatan kunci."
          >
            {draft.callouts.map((block, index) => (
              <CalloutRow
                key={block.key}
                block={block}
                index={index}
                problem={problemFor(problems, `co:${block.key}`)}
                autoFocus={autoFocusKey === block.key}
                canMoveUp={index > 0}
                canMoveDown={index < draft.callouts.length - 1}
                onChange={(patch) =>
                  onChange({
                    callouts: patchBlock(draft.callouts, block.key, patch),
                  })
                }
                onMove={(direction) =>
                  onChange({
                    callouts: moveBlock(draft.callouts, block.key, direction),
                  })
                }
                onRemove={() =>
                  onChange({
                    callouts: removeBlock(draft.callouts, block.key),
                  })
                }
              />
            ))}
          </CanvasSection>

          <CanvasSection
            label="Ilustrasi"
            hint="Gambar diagram di sela-sela penjelasan."
            count={draft.diagrams.length}
            onAdd={addDiagram}
            addLabel="+ Diagram"
            emptyText="Belum ada diagram."
          >
            {draft.diagrams.map((block, index) => (
              <DiagramRow
                key={block.key}
                block={block}
                index={index}
                problem={problemFor(problems, `dg:${block.key}`)}
                canMoveUp={index > 0}
                canMoveDown={index < draft.diagrams.length - 1}
                onChange={(patch) =>
                  onChange({
                    diagrams: patchBlock(draft.diagrams, block.key, patch),
                  })
                }
                onMove={(direction) =>
                  onChange({
                    diagrams: moveBlock(draft.diagrams, block.key, direction),
                  })
                }
                onRemove={() =>
                  onChange({
                    diagrams: removeBlock(draft.diagrams, block.key),
                  })
                }
              />
            ))}
          </CanvasSection>

          <CanvasSection
            label="Penjelasan tambahan"
            hint="Glosarium atau penjelasan yang bisa dibuka-tutup mahasiswa."
            count={draft.accordion.length}
            onAdd={addAccordion}
            addLabel="+ Materi"
            emptyText="Belum ada materi tambahan."
          >
            {draft.accordion.map((block, index) => (
              <AccordionRow
                key={block.key}
                block={block}
                index={index}
                problem={problemFor(problems, `ac:${block.key}`)}
                autoFocus={autoFocusKey === block.key}
                canMoveUp={index > 0}
                canMoveDown={index < draft.accordion.length - 1}
                onChange={(patch) =>
                  onChange({
                    accordion: patchBlock(draft.accordion, block.key, patch),
                  })
                }
                onMove={(direction) =>
                  onChange({
                    accordion: moveBlock(draft.accordion, block.key, direction),
                  })
                }
                onRemove={() =>
                  onChange({
                    accordion: removeBlock(draft.accordion, block.key),
                  })
                }
              />
            ))}
          </CanvasSection>
        </div>

        <AddBlockMenu onAdd={addBlock} />
      </div>
    </div>
  );
}
