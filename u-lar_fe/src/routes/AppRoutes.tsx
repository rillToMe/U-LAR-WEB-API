import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

const LoginPage = lazy(() => import("../pages/admin/LoginPage"));
const DashboardPage = lazy(() => import("../pages/admin/DashboardPage"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const ProtectedRoute = lazy(() => import("./ProtectedRoute"));
const StudentsPage = lazy(() => import("../pages/admin/StudentsPage"));
const ExamsPage = lazy(() => import("../pages/admin/ExamsPage"));
const ExamDetailPage = lazy(() => import("../pages/admin/ExamDetailPage"));

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
      className="flex min-h-dvh items-center justify-center bg-surface-muted"
      role="status"
    >
      <div className="flex items-center gap-3 text-sm text-fg-subtle">
        <span className="size-5 animate-spin rounded-full border-2 border-border-strong border-t-accent motion-reduce:animate-none" />
        Memuat halaman...
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="students" element={<StudentsPage />} />
              <Route path="exams" element={<ExamsPage />} />
              <Route path="exams/:examId" element={<ExamDetailPage />} />
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

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
