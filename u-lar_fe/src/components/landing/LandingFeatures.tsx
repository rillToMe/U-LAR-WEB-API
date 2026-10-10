import { FEATURES } from "./landingData";
import LandingIcon from "./LandingIcon";
import SectionHeading from "./SectionHeading";

/** Kemampuan instruksional: empat modul 2x2 di desktop. */
export default function LandingFeatures() {
  return (
    <section
      id="fitur"
      aria-label="Fitur pembelajaran"
      className="ld-section scroll-mt-24 bg-landing-surface-low"
    >
      <div className="ld-container">
        <SectionHeading
          align="center"
          eyebrow="Modul pembelajaran"
          eyebrowClassName="text-landing-sage-deep"
          title="Belajar lebih dari sekadar melihat."
          lead="Empat tahap yang membimbing dari pengenalan komponen sampai menemukan penyebab kabel gagal diuji."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:mt-12">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="ld-card ld-card-hover flex flex-col p-7 md:p-8"
            >
              <div>
                <span className={`ld-icon-tile ${feature.tone}`}>
                  <LandingIcon name={feature.icon} className="size-6" />
                </span>

                <p className="ld-tag mt-5 uppercase text-landing-sage">
                  {feature.module}
                </p>
                <h3 className="ld-h3 mt-1 text-landing-ink">
                  {feature.title}
                </h3>
                <p className="ld-body mt-2 text-landing-ink-soft">
                  {feature.body}
                </p>
              </div>

              <p className="mt-auto flex items-center justify-between pt-6">
                <span className="ld-small text-landing-ink-soft">
                  {feature.foot}
                </span>
                <LandingIcon
                  name="arrow-right"
                  className="size-5 text-landing-sage"
                />
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
