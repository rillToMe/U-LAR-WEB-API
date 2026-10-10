import LandingIcon from "./LandingIcon";

interface WordmarkProps {
  tone?: "ink" | "inverse";
  showSubtitle?: boolean;
}

/**
 * Penanda U-LAR untuk halaman depan.
 *
 * Logo bidik sudut (corner reticle) mengikuti arahan PRD: "U-LAR wordmark
 * + minimalist AR corner reticle logo". Berkas `Logo.webp` sengaja tidak
 * dipakai — isinya persegi dengan tagline putih yang hilang di latar
 * terang.
 */
export default function Wordmark({
  tone = "ink",
  showSubtitle = true,
}: WordmarkProps) {
  const titleColor =
    tone === "ink" ? "text-landing-ink" : "text-landing-dark-ink";
  const subtitleColor =
    tone === "ink"
      ? "text-landing-ink-soft"
      : "text-landing-dark-ink-soft";

  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className={`ld-icon-tile size-9 ${
          tone === "ink"
            ? "bg-landing-sage-pale text-landing-sage-ink"
            : "bg-white/10 text-landing-dark-ink"
        }`}
      >
        <LandingIcon name="reticle" className="size-5" />
      </span>

      <span className="leading-none">
        <span
          className={`block font-landing-display text-lg font-bold tracking-tight ${titleColor}`}
        >
          U-LAR
        </span>

        {showSubtitle && (
          <span
            className={`mt-1 block text-xs font-medium ${subtitleColor}`}
          >
            Universitas Negeri Padang
          </span>
        )}
      </span>
    </span>
  );
}
