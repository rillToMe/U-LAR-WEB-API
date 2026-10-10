import LandingAbout from "../../components/landing/LandingAbout";
import LandingChallenges from "../../components/landing/LandingChallenges";
import LandingCurriculum from "../../components/landing/LandingCurriculum";
import LandingFaq from "../../components/landing/LandingFaq";
import LandingFeatures from "../../components/landing/LandingFeatures";
import LandingHero from "../../components/landing/LandingHero";
import LandingJourney from "../../components/landing/LandingJourney";

/**
 * Halaman depan.
 *
 * Halaman informasi publik yang berdiri sendiri dengan design system-nya
 * sendiri (`styles/landing.css`). Urutan sembilan bagiannya mengikuti
 * rules/PRD.md: navigasi, pahlawan, tantangan, tentang, fitur, alur,
 * kurikulum, FAQ + kontak, penutup.
 *
 * Isinya hanya fakta dari dokumen aplikasi — tanpa tautan unduh, tanpa
 * formulir akun, tanpa tangkapan layar game. Satu-satunya pintu
 * operasional dari sini adalah panel admin (tautan "Masuk panel admin"
 * di menu dan penutup). Halaman materi dan web ujian sengaja TIDAK
 * ditautkan: keduanya dibuka mahasiswa dari dalam game.
 */
export default function HomePage() {
  return (
    <>
      <LandingHero />
      <LandingChallenges />
      <LandingAbout />
      <LandingFeatures />
      <LandingJourney />
      <LandingCurriculum />
      <LandingFaq />
    </>
  );
}
