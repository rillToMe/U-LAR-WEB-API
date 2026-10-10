import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { NAV_ITEMS, SECTION_IDS } from "./landingData";
import LandingIcon from "./LandingIcon";
import Wordmark from "./Wordmark";

/* Menandai tautan bagian yang sedang terlihat. Berjalan di id stabil dari
   `landingData` supaya observer tidak dipasang ulang tiap render. */
function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        }
      },
      { rootMargin: "-35% 0px -60% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [ids]);

  return active;
}

const linkClass = (isActive: boolean) =>
  `rounded-lg px-3 py-2 text-[15px] font-semibold transition-colors duration-150 ${
    isActive
      ? "bg-landing-surface-high text-landing-ink"
      : "text-landing-ink-soft hover:text-landing-ink"
  }`;

/**
 * Menu halaman depan: menempel di atas, menaut ke jangkar tiap bagian.
 *
 * Satu-satunya pintu operasional yang dipertahankan di sini adalah panel
 * admin (lingkaran ikon orang, seperti rancangan stitch): halaman materi
 * dan web ujian tetap tidak ditautkan karena dibuka dari dalam game.
 */
export default function LandingNav() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection(SECTION_IDS);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <header className="sticky top-0 z-50 border-b border-landing-line bg-landing-page/95 backdrop-blur-md">
      <div className="ld-container">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <a
            href="#beranda"
            aria-label="U-LAR — kembali ke atas"
            className="shrink-0 rounded-landing focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <Wordmark showSubtitle={false} />
          </a>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={active === item.id ? "page" : undefined}
                className={linkClass(active === item.id)}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#fitur"
              className="ld-btn ld-btn-primary hidden h-11 px-5 sm:inline-flex md:h-12 md:px-6"
            >
              Jelajahi U-LAR
            </a>

            <Link
              to="/login"
              title="Masuk panel admin"
              aria-label="Masuk panel admin"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-landing-sage text-white transition-colors duration-150 hover:bg-landing-sage-deep"
            >
              <LandingIcon name="person" className="size-5" />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="menu-landing"
              aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
              className="grid size-11 shrink-0 place-items-center rounded-xl text-landing-ink transition-colors hover:bg-landing-surface-high lg:hidden"
            >
              <LandingIcon
                name={open ? "close" : "menu"}
                className="size-6"
              />
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          id="menu-landing"
          className="border-t border-landing-line bg-landing-page lg:hidden"
        >
          <nav aria-label="Menu seluler" className="ld-container py-3">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setOpen(false)}
                aria-current={active === item.id ? "page" : undefined}
                className={`block rounded-landing px-4 py-4 font-landing-display text-xl font-semibold transition-colors ${
                  active === item.id
                    ? "bg-landing-surface-high text-landing-ink"
                    : "text-landing-ink-soft hover:bg-landing-surface-low hover:text-landing-ink"
                }`}
              >
                {item.label}
              </a>
            ))}

            <Link
              to="/login"
              className="mt-2 flex items-center gap-3 rounded-landing px-4 py-4 font-landing-display text-xl font-semibold text-landing-ink-soft transition-colors hover:bg-landing-surface-low hover:text-landing-ink"
            >
              <LandingIcon name="person" className="size-5" />
              Masuk panel admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
