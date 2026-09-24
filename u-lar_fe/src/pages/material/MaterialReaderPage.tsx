import { useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import { ThemeProvider } from "../../components/common/theme";
import { RichText } from "../../components/materials/richText";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import { getMaterial, getMaterials } from "../../services/materialApi";
import { resolveApiFileUrl } from "../../services/api";
import type {
  Material,
  MaterialAccordionItem,
  MaterialCallout,
  MaterialCalloutTone,
  MaterialDiagram,
  MaterialKeyPoint,
  MaterialListItem,
} from "../../types/material";

/**
 * Nama event jembatan Unity saat tombol "Selesai Membaca" ditekan. Kalau nama
 * di sisi Unity berubah, cukup ubah konstanta ini.
 */
const UNITY_DONE_EVENT = "OnMaterialFinished";

/** Gaya kartu yang dipakai berulang - sama dengan kartu di web ujian. */
const cardClass = "rounded-2xl border border-border bg-surface shadow-sm";

/* ---------- Ikon ---------- */

/**
 * Semua ikon memakai satu gaya supaya konsisten: kanvas 24px, garis 1.8,
 * ujung membulat - sama dengan ikon di halaman ujian.
 */
function LineIcon({
  className = "size-4",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

/**
 * Nama ikon datang dari isi materi di backend. Nama yang belum dikenal tetap
 * tampil sebagai titik supaya tidak ada baris yang kehilangan ikonnya.
 */
function KeyPointIcon({ name }: { name: string }) {
  switch (name) {
    case "wire":
      return (
        <LineIcon>
          <path d="M4 8h7a4 4 0 0 1 4 4 4 4 0 0 0 4 4h1" />
          <path d="M4 6v4M20 14v4" />
        </LineIcon>
      );

    case "check":
      return (
        <LineIcon>
          <path d="m5 13 4 4L19 7" />
        </LineIcon>
      );

    case "plug":
      return (
        <LineIcon>
          <rect x="4" y="3" width="16" height="10" rx="2" />
          <path d="M8 13v3M12 13v3M16 13v3M12 16v5" />
        </LineIcon>
      );

    case "target":
      return (
        <LineIcon>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="3" />
        </LineIcon>
      );

    default:
      return (
        <LineIcon>
          <circle cx="12" cy="12" r="3" />
        </LineIcon>
      );
  }
}

/* ---------- Bagian isi materi ---------- */

/** Warna kotak sorotan mengikuti token, bukan warna baru. */
const calloutTones: Record<MaterialCalloutTone, string> = {
  info: "border-accent-border bg-accent-surface",
  tip: "border-success-border bg-success-surface",
  warn: "border-danger-border bg-danger-surface",
  formula: "border-warning-border bg-warning-surface",
};

const calloutLabels: Record<MaterialCalloutTone, string> = {
  info: "text-accent",
  tip: "text-success-fg",
  warn: "text-danger",
  formula: "text-warning",
};

function Callout({ callout }: { callout: MaterialCallout }) {
  return (
    <div
      className={`rounded-2xl border px-4 py-3.5 ${calloutTones[callout.tone]}`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wider ${
          calloutLabels[callout.tone]
        }`}
      >
        {callout.label}
      </p>

      {/* Rumus ditulis dengan huruf mono di atas bidang putih supaya terbaca
          sebagai rumus, bukan sebagai kalimat biasa. */}
      {callout.tone === "formula" ? (
        <p className="mt-2 rounded-xl bg-surface px-3 py-2 font-mono text-sm leading-relaxed text-fg">
          <RichText text={callout.body} />
        </p>
      ) : (
        <p className="mt-1.5 text-sm leading-6 text-fg-muted">
          <RichText text={callout.body} />
        </p>
      )}
    </div>
  );
}

function KeyPointRow({ point }: { point: MaterialKeyPoint }) {
  return (
    <li className="flex items-start gap-3 px-4 py-3.5">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-hover text-fg-muted">
        <KeyPointIcon name={point.icon} />
      </span>

      <p className="min-w-0 text-sm leading-6 text-fg-muted">
        <RichText text={point.text} />
      </p>
    </li>
  );
}

function DiagramFigure({ diagram }: { diagram: MaterialDiagram }) {
  return (
    <figure className={`${cardClass} overflow-hidden`}>
      {diagram.imageUrl ? (
        <img
          src={resolveApiFileUrl(diagram.imageUrl)}
          alt={diagram.caption}
          loading="lazy"
          className="block w-full"
        />
      ) : (
        /* Diagram boleh belum punya gambar (misalnya materi baru). Yang tampil
           hanya keterangan kosong, bukan kotak bergaris putus-putus. */
        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
          <LineIcon className="size-5 text-fg-placeholder">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="m7 15 3.5-3.5 3 3L16 12l5 5" />
            <circle cx="15" cy="8.5" r="1.2" />
          </LineIcon>

          <p className="text-xs text-fg-subtle">Ilustrasi belum diunggah.</p>
        </div>
      )}

      {diagram.caption !== "" && (
        <figcaption className="border-t border-border px-4 py-3 text-xs leading-5 text-fg-subtle">
          {diagram.caption}
        </figcaption>
      )}
    </figure>
  );
}

function AccordionItem({ item }: { item: MaterialAccordionItem }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={`${cardClass} overflow-hidden`}>
      <h3>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-medium text-fg transition-colors duration-150 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {item.title}

          <LineIcon
            className={`size-4 shrink-0 text-fg-subtle transition-transform duration-200 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </LineIcon>
        </button>
      </h3>

      {open && (
        <div id={panelId} className="border-t border-border px-4 py-3.5">
          <p className="text-sm leading-6 text-fg-muted">
            <RichText text={item.body} />
          </p>
        </div>
      )}
    </div>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
        {label}
      </h2>

      {children}
    </section>
  );
}

/* ---------- Keadaan memuat / gagal ---------- */

function ReaderSkeleton() {
  return (
    <div className="space-y-5" role="status" aria-label="Memuat materi">
      <div className="space-y-3">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      <div className={`${cardClass} divide-y divide-border`}>
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-4">
            <Skeleton className="size-8 shrink-0 rounded-lg" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>

      <span className="sr-only">Memuat materi...</span>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-danger-border bg-danger-surface p-5"
    >
      <p className="text-sm font-semibold text-danger">Materi gagal dimuat</p>

      <p className="mt-1 text-sm leading-6 text-danger">{message}</p>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="mt-4"
        onClick={onRetry}
      >
        Coba lagi
      </Button>
    </div>
  );
}

/* ---------- Daftar materi (dibuka tanpa parameter slug) ---------- */

function MaterialList({ items }: { items: MaterialListItem[] }) {
  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-accent">
          Materi Pembelajaran
        </p>

        <h1 className="mt-1 text-xl font-bold text-fg">Daftar Modul</h1>

        <p className="mt-1 text-sm leading-6 text-fg-subtle">
          Pilih modul untuk membaca isinya.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="font-medium text-fg">Belum ada materi</p>

          <p className="mt-1 text-sm text-fg-subtle">
            Materi akan muncul di sini setelah dosen menambahkannya.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.slug}>
              <a
                href={`?slug=${encodeURIComponent(item.slug)}`}
                className={`${cardClass} block p-5 transition-colors duration-150 hover:border-border-strong hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-surface-hover px-2.5 py-1 text-[11px] font-medium text-fg-subtle">
                    {item.moduleCode}
                  </span>

                  <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-fg-subtle">
                    <LineIcon className="size-3.5">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7.5V12l3 1.8" />
                    </LineIcon>

                    <span className="tabular-nums">
                      {item.readMinutes} menit
                    </span>
                  </span>
                </div>

                <h2 className="mt-3 text-base font-semibold text-fg">
                  {item.title}
                </h2>

                {item.subtitle !== "" && (
                  <p className="mt-1 text-sm leading-6 text-fg-subtle">
                    {item.subtitle}
                  </p>
                )}

                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  Baca materi
                  <LineIcon className="size-4">
                    <path d="m9 18 6-6-6-6" />
                  </LineIcon>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- Isi satu materi ---------- */

function MaterialDocument({ material }: { material: Material }) {
  return (
    <div className="space-y-7">
      <a
        href="?"
        className="inline-flex items-center gap-1 text-sm font-medium text-link transition-colors duration-150 hover:text-link-hover hover:underline"
      >
        <LineIcon className="size-4">
          <path d="m15 18-6-6 6-6" />
        </LineIcon>
        Daftar materi
      </a>

      <header className="border-b border-border pb-5">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-accent-surface px-2.5 py-1 text-xs font-semibold text-accent">
            {material.moduleCode}
          </span>

          <p className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-fg-subtle">
            <LineIcon className="size-3.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7.5V12l3 1.8" />
            </LineIcon>

            <span className="tabular-nums">
              {material.readMinutes} menit baca
            </span>
          </p>
        </div>

        <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-fg">
          {material.title}
        </h1>

        {material.subtitle !== "" && (
          <p className="mt-2 text-sm leading-6 text-fg-muted">
            {material.subtitle}
          </p>
        )}
      </header>

      {material.keyPoints.length > 0 && (
        <Section label="Poin penting">
          <ul className={`${cardClass} divide-y divide-border`}>
            {material.keyPoints.map((point, index) => (
              <KeyPointRow key={`${point.icon}-${index}`} point={point} />
            ))}
          </ul>
        </Section>
      )}

      {material.callouts.length > 0 && (
        <Section label="Catatan">
          <div className="space-y-3">
            {material.callouts.map((callout, index) => (
              <Callout
                key={`${callout.tone}-${index}`}
                callout={callout}
              />
            ))}
          </div>
        </Section>
      )}

      {material.diagrams.length > 0 && (
        <Section label="Ilustrasi">
          <div className="space-y-4">
            {material.diagrams.map((diagram, index) => (
              <DiagramFigure
                key={`${diagram.caption}-${index}`}
                diagram={diagram}
              />
            ))}
          </div>
        </Section>
      )}

      {material.accordion.length > 0 && (
        <Section label="Penjelasan tambahan">
          <div className="space-y-3">
            {material.accordion.map((item, index) => (
              <AccordionItem
                key={`${item.title}-${index}`}
                item={item}
              />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

/* ---------- Tombol selesai ---------- */

function DoneBar({
  finished,
  onDone,
}: {
  finished: boolean;
  onDone: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-30 mt-8 border-t border-border bg-surface-muted/95 backdrop-blur">
      <div className="mr-safe-bottom mx-auto w-full max-w-md px-4 pt-3 lg:max-w-3xl">
        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={finished}
          onClick={onDone}
        >
          {finished ? "Sudah Ditandai Selesai" : "Selesai Membaca"}
        </Button>

        <p className="mt-2 text-center text-[11px] leading-5 text-fg-subtle">
          {finished
            ? "Materi sudah ditandai selesai. Halaman ini boleh ditutup."
            : "Tekan tombol setelah selesai membaca - game akan mencatatnya."}
        </p>
      </div>
    </div>
  );
}

/* ---------- Halaman ---------- */

/** Satu keadaan halaman: memuat, daftar modul, isi materi, atau gagal. */
type MaterialView =
  | { status: "loading" }
  | { status: "list"; materials: MaterialListItem[] }
  | { status: "material"; material: Material }
  | { status: "error"; message: string };

/** `materialApi` melempar Error berisi pesan yang sudah siap tampil. */
function describeError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Materi gagal dimuat. Periksa koneksi lalu coba lagi.";
}

/**
 * Halaman materi untuk WebView game.
 *
 * Tampilannya memakai token dan gaya yang sama dengan web ujian: satu kolom
 * sempit, kartu berbingkai tipis, dan aksen hanya untuk hal yang memang perlu
 * ditandai. Tanpa gradien dan tanpa efek cahaya.
 *
 * `slug` dibaca dari query string karena halaman ini dibuka langsung oleh
 * WebView tanpa router. Tanpa `slug`, halaman menampilkan daftar materi.
 */
export default function MaterialReaderPage() {
  const [slug] = useState(
    () =>
      new URLSearchParams(window.location.search).get("slug")?.trim() ?? ""
  );

  const [view, setView] = useState<MaterialView>({ status: "loading" });
  const [finished, setFinished] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    // Tanpa slug: yang dibuka adalah daftar modul. Dengan slug: isi satu materi.
    // `materialApi` memakai fetch biasa dan melempar Error berisi pesan yang
    // sudah siap tampil, jadi pesannya dipakai apa adanya.
    if (slug === "") {
      getMaterials()
        .then((data) => {
          if (!cancelled) {
            setView({ status: "list", materials: data });
          }
        })
        .catch((loadError: unknown) => {
          if (cancelled) {
            return;
          }

          console.error(loadError);
          setView({ status: "error", message: describeError(loadError) });
        });

      return () => {
        cancelled = true;
      };
    }

    getMaterial(slug)
      .then((data) => {
        if (!cancelled) {
          setView({ status: "material", material: data });
        }
      })
      .catch((loadError: unknown) => {
        if (cancelled) {
          return;
        }

        console.error(loadError);
        setView({ status: "error", message: describeError(loadError) });
      });

    return () => {
      cancelled = true;
    };
  }, [slug, reloadKey]);

  /** Tombol "Coba lagi": kembali ke keadaan memuat lalu ambil ulang data. */
  function handleRetry() {
    setView({ status: "loading" });
    setReloadKey((key) => key + 1);
  }

  /**
   * Menandai materi selesai dibaca. Di dalam game, jembatan Unity yang
   * meneruskannya ke Unity; kalau dibuka di browser biasa, halaman tetap
   * memberi tahu mahasiswa bahwa materinya sudah ditandai.
   */
  function handleDone() {
    setFinished(true);
    window.Unity?.call(UNITY_DONE_EVENT);
  }

  return (
    <ThemeProvider>
      <div className="exam-theme min-h-dvh bg-surface-muted">
        <div className="mr-safe-top mx-auto w-full max-w-md px-4 pb-6 lg:max-w-3xl">
          {view.status === "loading" && <ReaderSkeleton />}

          {view.status === "error" && (
            <ErrorState message={view.message} onRetry={handleRetry} />
          )}

          {view.status === "list" && <MaterialList items={view.materials} />}

          {view.status === "material" && (
            <MaterialDocument material={view.material} />
          )}
        </div>

        {view.status === "material" && (
          <DoneBar finished={finished} onDone={handleDone} />
        )}
      </div>
    </ThemeProvider>
  );
}
