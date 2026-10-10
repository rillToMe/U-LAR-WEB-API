import { CHALLENGES } from "./landingData";
import LandingIcon from "./LandingIcon";
import SectionHeading from "./SectionHeading";

/** Ruang masalah: tiga kendala praktikum di laboratorium vokasi. */
export default function LandingChallenges() {
  return (
    <section aria-label="Tantangan laboratorium" className="ld-section bg-landing-surface-low">
      <div className="ld-container">
        <SectionHeading
          eyebrow="Tantangan laboratorium"
          eyebrowClassName="text-landing-rose"
          title="Praktikum jaringan seharusnya lebih mudah diakses."
          lead="Keterbatasan alat, tempat, dan waktu membuat latihan instalasi kabel sulit diulang sebanyak yang dibutuhkan."
        />

        <div className="mt-10 grid gap-6 md:grid-cols-3 lg:mt-12">
          {CHALLENGES.map((challenge) => (
            <article
              key={challenge.title}
              className="ld-card ld-card-hover flex flex-col p-7"
            >
              <div>
                <span className={`ld-icon-tile ${challenge.tone}`}>
                  <LandingIcon name={challenge.icon} className="size-6" />
                </span>

                <h3 className="ld-h4 mt-5 text-landing-ink">
                  {challenge.title}
                </h3>
                <p className="ld-body mt-2 text-landing-ink-soft">
                  {challenge.body}
                </p>
              </div>

              <p className="mt-auto flex items-center gap-2 pt-6 text-landing-ink-soft">
                <LandingIcon name="check" className="size-[18px] text-landing-rose" />
                <span className="ld-tag">{challenge.tag}</span>
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
