import { KEYWORDS } from "./landingData";
import LandingIcon from "./LandingIcon";
import ProcedureVisual from "./ProcedureVisual";

/** Konsep solusi: dari alat fisik ke model spasial, Explore–Simulate–Learn. */
export default function LandingAbout() {
  return (
    <section id="tentang" aria-label="Tentang U-LAR" className="ld-section scroll-mt-24">
      <div className="ld-container grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-landing-surface-container px-3.5 py-1.5">
            <LandingIcon name="school" className="size-4 text-landing-brand" />
            <span className="ld-eyebrow text-landing-ink">
              Media belajar Augmented Reality
            </span>
          </p>

          <h2 className="ld-h2 mt-4 text-landing-ink">
            Kenali U-LAR, media belajar jaringan berbasis AR.
          </h2>

          <p className="ld-body mt-4 max-w-xl text-landing-ink-soft">
            U-LAR (Ubiquitous Learning Assisted by Augmented Reality)
            menjembatani peralatan laboratorium fisik dengan visualisasi
            spasial tiga dimensi. Marker yang dipindai menampilkan objek alat
            dan bahan, lalu latihan berlanjut ke simulasi dua belas langkah
            pemasangan kabel UTP — dari pengenalan sampai pengujian.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {KEYWORDS.map((keyword) => (
              <div
                key={keyword.word}
                className="rounded-landing-md bg-landing-surface p-4 text-center shadow-landing-card"
              >
                <p className="ld-h4 text-landing-brand-deep">
                  {keyword.word}
                </p>
                <p className="ld-small mt-1 text-landing-ink-soft">
                  {keyword.caption}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-landing-md bg-landing-surface-high p-4">
            <LandingIcon
              name="check"
              className="mt-0.5 size-5 shrink-0 text-landing-brand"
            />
            <p className="ld-small text-landing-ink">
              <strong className="font-semibold">Catatan pedagogis:</strong>{" "}
              U-LAR adalah media pelengkap. Ia menguatkan pemahaman prosedural
              sebelum dan sesudah siswa memegang perkakas laboratorium yang
              sebenarnya.
            </p>
          </div>
        </div>

        <div className="lg:col-span-6">
          <ProcedureVisual />
        </div>
      </div>
    </section>
  );
}
