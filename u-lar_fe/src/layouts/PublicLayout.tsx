import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import LandingFooter from "../components/landing/LandingFooter";
import LandingNav from "../components/landing/LandingNav";

/**
 * Kerangka halaman publik (halaman depan).
 *
 * Berdiri sendiri: tidak memakai ThemeProvider maupun token desain lama
 * karena halaman depan punya design system terang tersendiri
 * (`styles/landing.css`). Kelas `landing-page` dipasang di <html> selama
 * halaman ini tampil — polanya sama seperti `material-reader` dan
 * `exam-fit` — untuk gulir jangkar yang halus, offset menu, dan latar
 * dokumen yang selaras.
 *
 * Halaman materi dan web ujian TIDAK memakai layout ini - keduanya dibuka
 * mahasiswa dari WebView game dan punya aturan tampilannya sendiri.
 */
export default function PublicLayout() {
  useEffect(() => {
    document.documentElement.classList.add("landing-page");

    return () => {
      document.documentElement.classList.remove("landing-page");
    };
  }, []);

  return (
    <div className="landing flex min-h-dvh flex-col">
      {/* Jalan pintas ke isi: pengguna keyboard dan pembaca layar tidak
          perlu melewati seluruh menu di setiap halaman. Tersembunyi sampai
          benar-benar difokus. */}
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-landing focus:bg-landing-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-landing-ink focus:shadow-landing-card-hover"
      >
        Lompat ke konten
      </a>

      <LandingNav />

      <main id="konten" className="flex-1">
        <Outlet />
      </main>

      <LandingFooter />
    </div>
  );
}
