import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";
import StudentsPage from "../pages/StudentsPage";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route
              index
              element={<DashboardPage />}
            />

            <Route
              path="students"
              element={<StudentsPage />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}