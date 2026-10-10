import { JOURNEY } from "./landingData";
import SectionHeading from "./SectionHeading";

/* Alur pembelajaran: empat tahap berurutan dengan indikator bernomor
   biru yang seragam. Desktop memakai garis hubung putus-putus di
   belakang lingkaran nomor; seluler memakai tangga vertikal dengan rel
   di kiri. Satu markup untuk keduanya. */
export default function LandingJourney() {
  return (
    <section aria-label="Alur pembelajaran" className="ld-section">
      <div className="ld-container">
        <SectionHeading
          eyebrow="Alur pembelajaran"
          eyebrowClassName="text-landing-brand-deep"
          title="Dari mengenal alat hingga menguji kabel."
          lead="Urutan belajar yang runut, sesuai tahapan simulasi di aplikasi."
        />

        <div className="relative mt-10 lg:mt-12">
          <div
            aria-hidden="true"
            className="absolute left-[12%] right-[12%] top-7 hidden border-t-2 border-dashed border-landing-line-strong lg:block"
          />

          <ol className="relative grid gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {JOURNEY.map((step, index) => (
              <li key={step.no} className="flex gap-4 lg:flex-col lg:gap-5">
                {/* Rel nomor: garis vertikal di seluler, lingkaran di semua ukuran */}
                <div className="flex flex-col items-center">
                  <span
                    aria-hidden="true"
                    className="grid size-14 shrink-0 place-items-center rounded-full bg-landing-brand font-landing-display text-lg font-bold text-white shadow-landing-card"
                  >
                    {step.no}
                  </span>

                  {index < JOURNEY.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="my-1 w-0.5 flex-1 border-l-2 border-dashed border-landing-line-strong lg:hidden"
                    />
                  )}
                </div>

                <div className="ld-card flex-1 p-6">
                  <p className="ld-tag uppercase text-landing-brand-deep">
                    {step.phase}
                  </p>
                  <h3 className="ld-h4 mt-1 text-landing-ink">
                    {step.title}
                  </h3>
                  <p className="ld-small mt-2 text-landing-ink-soft">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
