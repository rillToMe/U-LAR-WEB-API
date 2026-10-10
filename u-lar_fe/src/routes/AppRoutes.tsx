import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Skeleton from "../components/ui/Skeleton";

const LoginPage = lazy(() => import("../pages/admin/LoginPage"));
const DashboardPage = lazy(() => import("../pages/admin/DashboardPage"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const ProtectedRoute = lazy(() => import("./ProtectedRoute"));
const SuperAdminRoute = lazy(() => import("./SuperAdminRoute"));
const StudentsPage = lazy(() => import("../pages/admin/StudentsPage"));
const ExamsPage = lazy(() => import("../pages/admin/ExamsPage"));
const ExamDetailPage = lazy(() => import("../pages/admin/ExamDetailPage"));
const MaterialEditorPage = lazy(
  () => import("../pages/admin/MaterialEditorPage")
);
const MaterialsPage = lazy(() => import("../pages/admin/MaterialsPage"));
const DocsPage = lazy(() => import("../pages/admin/DocsPage"));
const AdminsPage = lazy(() => import("../pages/admin/AdminsPage"));

// Halaman depan publik - dibuka tanpa login, termasuk oleh pengunjung umum.
// Tema terang/gelap dan menu atasnya diatur PublicLayout.
const PublicLayout = lazy(() => import("../layouts/PublicLayout"));
const HomePage = lazy(() => import("../pages/public/HomePage"));

// Halaman materi - dibuka WebView game tanpa login, jadi berada di luar
// ProtectedRoute. Daftar di /materi, isi satu modul di /materi/{slug}.
const MaterialReaderPage = lazy(
  () => import("../pages/material/MaterialReaderPage")
);

// Web ujian — dipakai mahasiswa dari HP, terpisah dari web admin.
const ExamLayout = lazy(() => import("../layouts/ExamLayout"));
const ExamProtectedRoute = lazy(() => import("./ExamProtectedRoute"));
const ExamLoginPage = lazy(() => import("../pages/exam/ExamLoginPage"));
const ExamListPage = lazy(() => import("../pages/exam/ExamListPage"));
const ExamSessionPage = lazy(
  () => import("../pages/exam/ExamSessionPage")
);
const ExamResultPage = lazy(
  () => import("../pages/exam/ExamResultPage")
);

function RouteFallback() {
  return (
    <div
      className="mx-auto min-h-dvh w-full max-w-6xl space-y-4 bg-surface-muted p-6 md:p-8"
      role="status"
      aria-label="Memuat halaman"
    >
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <span className="sr-only">Memuat halaman...</span>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Halaman depan publik. Sebelumnya alamat "/" langsung dilempar ke
              /login lewat aturan "*" di bawah; sekarang pengunjung umum
              mendarat di sini dulu dan memilih sendiri mau ke mana. */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="exams" element={<ExamsPage />} />
              <Route path="exams/:examId" element={<ExamDetailPage />} />
              <Route path="materials" element={<MaterialsPage />} />
              <Route path="materials/new" element={<MaterialEditorPage />} />
            <Route
              path="materials/:materialId"
              element={<MaterialEditorPage />}
            />
            <Route path="docs" element={<DocsPage />} />
            <Route element={<SuperAdminRoute />}>
              <Route path="admins" element={<AdminsPage />} />
            </Route>
          </Route>
          </Route>

          {/* Web ujian: halaman sesi sengaja di luar ExamLayout karena punya
              header dan bilah navigasi sendiri yang menempel di layar. */}
          <Route path="/ujian" element={<ExamLayout />}>
            <Route path="login" element={<ExamLoginPage />} />

            <Route element={<ExamProtectedRoute />}>
              <Route index element={<ExamListPage />} />
              <Route
                path="hasil/:resultId"
                element={<ExamResultPage />}
              />
            </Route>
          </Route>

          <Route element={<ExamProtectedRoute />}>
            <Route
              path="/ujian/sesi/:resultId"
              element={<ExamSessionPage />}
            />
          </Route>

          {/* Materi pembelajaran: daftar di /materi, isi satu modul di
              /materi/{slug}. Tanpa login karena dibaca mahasiswa dari WebView
              game yang tidak punya sesi web admin. */}
          <Route path="/materi" element={<MaterialReaderPage />} />
          <Route path="/materi/:slug" element={<MaterialReaderPage />} />

          {/* Alamat yang tidak dikenal dikembalikan ke halaman depan, bukan
              lagi ke halaman login: pengunjung umum tidak punya akun dan
              tidak akan mengerti kenapa diminta masuk. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
