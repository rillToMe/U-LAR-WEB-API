import { Outlet } from "react-router-dom";
import ExamFooter from "../components/exam/ExamFooter";
import BackToMenuButton from "../components/common/BackToMenuButton";

/**
 * Kerangka web ujian: tanpa sidebar, satu kolom sempit di tengah layar,
 * ditutup footer di dasar halaman. Halaman sesi ujian sengaja tidak memakai
 * layout ini karena punya header dan bilah bawah sendiri yang menempel di
 * layar — dan di tengah ujian footer hanya menggoda keluar.
 *
 * Light mode dan skala font root tidak diatur di sini, tapi di `index.html`.
 * Alasannya perpindahan antar halaman ujian terjadi di sisi SPA: kelas
 * `exam-fit` harus sudah ada sejak halaman dimuat dan tidak boleh ikut
 * dilepas ketika layout ini dilepas untuk masuk ke halaman sesi.
 */
export default function ExamLayout() {
  return (
    <div className="exam-theme flex min-h-dvh flex-col bg-surface-muted">
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-6 lg:max-w-5xl">
        <Outlet />
      </div>

      <ExamFooter />

      {/* Jalan keluar dari game. Tombolnya hilang sendiri di browser biasa,
          karena di sana tidak ada MainMenu untuk kembali. */}
      <div className="mx-auto w-full max-w-md px-4 pb-8 lg:max-w-5xl">
        <div className="flex justify-end border-t border-border pt-4">
          <BackToMenuButton />
        </div>
      </div>
    </div>
  );
}
