import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const ProtectedRoute = lazy(() => import("./ProtectedRoute"));
const StudentsPage = lazy(() => import("../pages/StudentsPage"));

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
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
