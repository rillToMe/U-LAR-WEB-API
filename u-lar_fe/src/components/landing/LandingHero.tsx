import HeroVisual from "./HeroVisual";
import LandingIcon from "./LandingIcon";

/** Pahlawan: tata letak belah + visual pinout kabel dan konektor RJ45. */
export default function LandingHero() {
  return (
    <section id="beranda" aria-label="Pengantar U-LAR" className="ld-section overflow-hidden">
      <div className="ld-container grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-landing-surface-high px-3.5 py-1.5 shadow-landing-card">
            <span
              aria-hidden="true"
              className="ld-pulse-dot size-2 rounded-full bg-landing-sage"
            />
            <span className="ld-eyebrow text-landing-ink">
              Augmented Reality · Networking Education
            </span>
          </p>

          <h1 className="ld-display mt-5 text-landing-ink">
            Belajar jaringan, lebih nyata dengan{" "}
            <span className="text-landing-sage-deep">U-LAR.</span>
          </h1>

          <p className="ld-lead mt-5 max-w-xl text-landing-ink-soft">
            Kenali alat, pahami proses instalasi, dan latih pemasangan kabel
            UTP lewat visual tiga dimensi — tanpa menunggu jadwal
            laboratorium atau menghabiskan konektor.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a href="#fitur" className="ld-btn ld-btn-primary">
              Jelajahi fitur
            </a>
            <a href="#tentang" className="ld-btn ld-btn-secondary">
              Tentang U-LAR
            </a>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-lg bg-landing-surface px-3 py-2 text-landing-ink-soft shadow-landing-card">
              <LandingIcon name="cable" className="size-[18px] text-landing-sage" />
              <span className="ld-tag">Kabel UTP & konektor RJ45</span>
            </span>
            <span className="inline-flex items-center gap-2 rounded-lg bg-landing-surface px-3 py-2 text-landing-ink-soft shadow-landing-card">
              <LandingIcon name="tune" className="size-[18px] text-landing-rose" />
              <span className="ld-tag">Standar T568A / T568B</span>
            </span>
          </div>
        </div>

        <div className="lg:col-span-6">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
