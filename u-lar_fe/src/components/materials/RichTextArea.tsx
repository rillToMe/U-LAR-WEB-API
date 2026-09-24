import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { RichText } from "./richText";
import { toggleMarker } from "./richTextFormat";

const BOLD_MARKER = "**";
const ITALIC_MARKER = "*";

interface RichTextAreaProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Nama isian untuk screen reader, mis. "Teks poin penting nomor 2". */
  label: string;
  maxLength: number;
  placeholder?: string;
  autoFocus?: boolean;
  /** Isian ini belum benar, jadi kotaknya ditandai. */
  invalid?: boolean;
  /** Tekan Enter memanggil ini (mis. membuat poin berikutnya) alih-alih
   * menambah baris baru. */
  onSubmitShortcut?: () => void;
  /** Tombol daftar di toolbar; kosong berarti tombolnya tidak ditampilkan. */
  onAddSibling?: () => void;
}

const toolbarButtonClass =
  "rounded-md px-2 py-0.5 text-xs transition-colors hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring";

/**
 * Kotak tulis isi materi: borderless seperti dokumen, dengan penanda format
 * yang sama seperti yang dibaca halaman materi (`**tebal**`, `*miring*`).
 * Tingginya ikut panjang teks supaya blok terasa seperti paragraf biasa.
 */
export default function RichTextArea({
  id,
  value,
  onChange,
  label,
  maxLength,
  placeholder,
  autoFocus = false,
  invalid = false,
  onSubmitShortcut,
  onAddSibling,
}: RichTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  // Tinggi mengikuti isi: `auto` dulu supaya kotaknya ikut mengecil saat
  // teksnya dihapus, bukan hanya membesar.
  useEffect(() => {
    const element = textareaRef.current;

    if (element === null) {
      return;
    }

    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  }, [value, preview]);

  function applyMarker(marker: string) {
    const element = textareaRef.current;

    if (element === null) {
      return;
    }

    const next = toggleMarker(
      value,
      element.selectionStart,
      element.selectionEnd,
      marker
    );

    onChange(next.value);

    // Pilihan dikembalikan setelah React menggambar nilai barunya.
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(next.selectionStart, next.selectionEnd);
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const withModifier = event.ctrlKey || event.metaKey;

    if (withModifier && event.key.toLowerCase() === "b") {
      event.preventDefault();
      applyMarker(BOLD_MARKER);
      return;
    }

    if (withModifier && event.key.toLowerCase() === "i") {
      event.preventDefault();
      applyMarker(ITALIC_MARKER);
      return;
    }

    if (event.key === "Enter" && !event.shiftKey && onSubmitShortcut) {
      event.preventDefault();
      onSubmitShortcut();
    }
  }

  return (
    <div className="min-w-0 flex-1">
      {preview ? (
        <div className="min-h-8 whitespace-pre-wrap px-1 py-1.5 text-sm leading-6">
          {value.trim() === "" ? (
            <span className="text-fg-placeholder">{placeholder}</span>
          ) : (
            <span className="text-fg-muted">
              <RichText text={value} />
            </span>
          )}
        </div>
      ) : (
        <textarea
          id={id}
          ref={textareaRef}
          value={value}
          rows={1}
          maxLength={maxLength}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label={label}
          aria-invalid={invalid}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          className={`w-full resize-none overflow-hidden rounded-lg bg-transparent px-1 py-1.5 text-sm leading-6 text-fg outline-none transition placeholder:text-fg-placeholder focus:bg-surface-hover/40 ${
            invalid ? "ring-1 ring-danger-border" : ""
          }`}
        />
      )}

      <div className="mt-0.5 flex flex-wrap items-center gap-1 text-fg-subtle">
        <button
          type="button"
          onClick={() => applyMarker(BOLD_MARKER)}
          title="Tebal (Ctrl+B)"
          aria-label="Tebal"
          className={`${toolbarButtonClass} font-bold`}
        >
          B
        </button>

        <button
          type="button"
          onClick={() => applyMarker(ITALIC_MARKER)}
          title="Miring (Ctrl+I)"
          aria-label="Miring"
          className={`${toolbarButtonClass} italic`}
        >
          I
        </button>

        {onAddSibling !== undefined && (
          <button
            type="button"
            onClick={onAddSibling}
            title="Tambah poin setelah ini (Enter)"
            aria-label="Tambah poin setelah ini"
            className={toolbarButtonClass}
          >
            • Poin
          </button>
        )}

        <button
          type="button"
          onClick={() => setPreview((current) => !current)}
          aria-pressed={preview}
          title={preview ? "Kembali menulis" : "Lihat hasil formatnya"}
          className={toolbarButtonClass}
        >
          {preview ? "Tulis" : "Pratinjau"}
        </button>

        <span className="ml-auto pr-1 text-[11px] tabular-nums text-fg-placeholder">
          {value.length}/{maxLength}
        </span>
      </div>
    </div>
  );
}
