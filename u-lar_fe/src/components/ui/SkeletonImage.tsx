import { useState } from "react";

interface SkeletonImageProps {
  src: string;
  alt?: string;
  /**
   * Rasio aspek placeholder sebelum gambar selesai dimuat, mis. "4 / 3".
   * Begitu gambar termuat, rasio mengikuti ukuran aslinya supaya layout
   * tidak melompat jauh. Diabaikan kalau tinggi & lebar sudah diset lewat
   * className.
   */
  aspectRatio?: string;
  className?: string;
}

/**
 * Gambar dengan placeholder skeleton: blok pulse sampai gambar benar-benar
 * selesai dimuat, lalu memudar masuk. Status dilacak per src sehingga
 * berganti gambar (mis. pindah soal) selalu menampilkan skeleton lagi.
 */
export default function SkeletonImage({
  src,
  alt = "",
  aspectRatio = "4 / 3",
  className = "",
}: SkeletonImageProps) {
  /** src yang sudah termuat beserta rasio aslinya. */
  const [loadedImage, setLoadedImage] = useState<{
    src: string;
    ratio: string;
  } | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const isLoaded = loadedImage?.src === src;
  const isFailed = failedSrc === src;
  const status = isFailed ? "error" : isLoaded ? "loaded" : "loading";
  const ratio =
    loadedImage?.src === src ? loadedImage.ratio : aspectRatio;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {status === "loading" && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-surface-hover motion-reduce:animate-none"
        />
      )}

      {status === "error" ? (
        <div
          role="status"
          className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-surface-muted px-3 text-center"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden="true"
            className="size-5 text-fg-subtle"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
          </svg>

          <p className="text-xs text-fg-subtle">
            Gambar gagal dimuat
          </p>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={(event) => {
            const image = event.currentTarget;

            setLoadedImage({
              src,
              ratio:
                image.naturalWidth > 0 && image.naturalHeight > 0
                  ? `${image.naturalWidth} / ${image.naturalHeight}`
                  : aspectRatio,
            });
          }}
          onError={() => setFailedSrc(src)}
          className={`relative h-full w-full object-contain transition-opacity duration-300 motion-reduce:transition-none ${
            status === "loaded" ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
