import { CURRICULUM, T568B_PINS } from "./landingData";
import LandingIcon from "./LandingIcon";
import SectionHeading from "./SectionHeading";

/* Panduan warna mini untuk kartu standar pengawatan: fakta pin T568B
   dari dokumen aplikasi, bukan hiasan. */
function PinoutGuide() {
  const first = T568B_PINS.slice(0, 4);
  const second = T568B_PINS.slice(4);

  const row = (pins: typeof first, label: string) => (
    <div className="flex items-baseline justify-between gap-3">
      <span className="ld-tag shrink-0 text-landing-ink-soft">{label}</span>
      <span className="ld-tag text-right text-landing-ink">
        {pins.map((pin) => pin.name).join(", ")}
      </span>
    </div>
  );

  return (
    <div className="mb-5 flex flex-col gap-1.5 rounded-landing-md bg-landing-surface-container p-3.5">
      {row(first, "Pin 1–4:")}
      {row(second, "Pin 5–8:")}
    </div>
  );
}

/** Kurikulum: tiga kartu fondasi instalasi kabel jaringan. */
export default function LandingCurriculum() {
  return (
    <section
      id="materi"
      aria-label="Materi kurikulum"
      className="ld-section scroll-mt-24 bg-landing-surface-low"
    >
      <div className="ld-container">
        <SectionHeading
          eyebrow="Cakupan materi"
          eyebrowClassName="text-landing-brand-deep"
          title="Fondasi instalasi kabel jaringan."
          lead="Enam modul yang disusun dari konsep sampai pengujian, mengikuti dokumen aplikasi."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:mt-12">
          {CURRICULUM.map((module, index) => (
            <article
              key={module.title}
              className="ld-card ld-card-hover flex flex-col p-7"
            >
              <div>
                <p className="flex items-center gap-2 text-landing-brand-deep">
                  <LandingIcon name={module.icon} className="size-6" />
                  <span className="ld-tag uppercase">{module.kicker}</span>
                </p>

                <h3 className="ld-h3 mt-3 text-landing-ink">
                  {module.title}
                </h3>
                <p className="ld-body mt-2 text-landing-ink-soft">
                  {module.body}
                </p>

                {index === 1 && <div className="mt-5"><PinoutGuide /></div>}

                <ul className="ld-small mt-5 flex flex-col gap-2.5 text-landing-ink-soft">
                  {module.points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-[7px] size-1.5 shrink-0 rounded-full bg-landing-brand"
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-auto pt-6">
                <span className="ld-tag block rounded-landing-md bg-landing-surface-container px-3.5 py-2.5 text-center text-landing-ink">
                  {module.focus}
                </span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
