import { Outlet } from "react-router-dom";
import { ThemeProvider } from "../components/common/theme";
import ExamFooter from "../components/exam/ExamFooter";

/**
 * Kerangka web ujian: tanpa sidebar, satu kolom sempit di tengah layar,
 * ditutup footer di dasar halaman. Halaman sesi ujian sengaja tidak memakai
 * layout ini karena punya header dan bilah bawah sendiri yang menempel di
 * layar — dan di tengah ujian footer hanya menggoda keluar.
 */
export default function ExamLayout() {
  return (
    <ThemeProvider>
      <div className="exam-theme flex min-h-dvh flex-col bg-surface-muted">
        <div className="mx-auto w-full max-w-md flex-1 px-4 py-6 lg:max-w-5xl">
          <Outlet />
        </div>

        <ExamFooter />
      </div>
    </ThemeProvider>
  );
}
