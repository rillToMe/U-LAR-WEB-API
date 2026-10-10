import { Link } from "react-router-dom";
import { FOOTER } from "./landingData";
import LandingIcon from "./LandingIcon";
import Wordmark from "./Wordmark";

/** Penutup: zona aksen gelap berisi ringkasan merek, direktori, kontak. */
export default function LandingFooter() {
  return (
    <footer className="bg-landing-dark text-landing-dark-ink">
      <div className="ld-container py-14 md:py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Wordmark tone="inverse" showSubtitle={false} />
            <p className="ld-small mt-5 max-w-sm text-landing-dark-ink-soft">
              {FOOTER.description}
            </p>
          </div>

          <nav
            aria-label="Navigasi edukasi"
            className="flex flex-col gap-4 md:col-span-3"
          >
            <p className="ld-eyebrow text-landing-dark-ink-soft">
              {FOOTER.navHeading}
            </p>
            <ul className="ld-small flex flex-col gap-2.5 text-landing-dark-ink-soft">
              {FOOTER.navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-colors duration-150 hover:text-landing-dark-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex flex-col gap-4 md:col-span-4">
            <p className="ld-eyebrow text-landing-dark-ink-soft">
              {FOOTER.infoHeading}
            </p>
            <p className="ld-small text-landing-dark-ink-soft">
              {FOOTER.infoBody}
            </p>
            <p className="ld-small text-landing-dark-ink-soft">
              Pendidikan Teknik Informatika, Universitas Negeri Padang
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-landing-dark-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="ld-small text-landing-dark-ink-soft">
            {FOOTER.copyright}
          </p>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-landing text-sm font-semibold text-landing-dark-ink-soft transition-colors duration-150 hover:text-landing-dark-ink"
          >
            <LandingIcon name="person" className="size-4" />
            Masuk panel admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
