import LandingIcon from "./LandingIcon";

interface WordmarkProps {
  tone?: "ink" | "inverse";
  showSubtitle?: boolean;
}

/**
 * Penanda teks U-LAR untuk halaman depan.
 *
 * Berkas logo `public/Logo.webp` sengaja tidak dipakai: isinya hanya
 * одну pita di tengah gambar persegi, hurufnya hitam (hilang di ubin
 * gelap), dan bagian putih sapuannya hilang di latar terang. Tulisan
 * biasa selalu tajam, ikut warna tema, dan tidak bergantung pada ukuran
 * tampilan.
 *
 * Ikon reticle-nya adalah cidik sudut ala penanda AR sesuai arahan PRD:
 * "U-LAR wordmark + minimalist AR corner reticle logo".
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
            ? "bg-landing-brand-pale text-landing-brand"
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