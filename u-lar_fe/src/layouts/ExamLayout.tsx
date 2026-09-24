import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import ExamFooter from "../components/exam/ExamFooter";

/**
 * Kerangka web ujian: tanpa sidebar, satu kolom sempit di tengah layar,
 * ditutup footer di dasar halaman. Halaman sesi ujian sengaja tidak memakai
 * layout ini karena punya header dan bilah bawah sendiri yang menempel di
 * layar — dan di tengah ujian footer hanya menggoda keluar.
 *
 * Web ujian selalu light mode: paksa hapus kelas "dark" (mis. sisa dari
 * web admin di browser yang sama) supaya token warna terang selalu dipakai.
 */
export default function ExamLayout() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";
    root.style.backgroundColor = "#f9fafb";
  }, []);

  return (
    <div className="exam-theme flex min-h-dvh flex-col bg-surface-muted">
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-6 lg:max-w-5xl">
        <Outlet />
      </div>

      <ExamFooter />
    </div>
  );
}
