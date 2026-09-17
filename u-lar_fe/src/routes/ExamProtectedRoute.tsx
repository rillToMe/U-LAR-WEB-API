import { Navigate, Outlet } from "react-router-dom";
import {
  EXAM_LOGIN_PATH,
  getExamToken,
  getExamUser,
} from "../services/examApi";

/**
 * Penjaga route web ujian. Token dan datanya sengaja terpisah dari sesi admin,
 * jadi admin yang sedang login di browser yang sama tidak bisa membuka halaman
 * ujian — dan sebaliknya.
 */
export default function ExamProtectedRoute() {
  const token = getExamToken();
  const user = getExamUser();

  if (!token || !user || user.role !== "student") {
    return <Navigate to={EXAM_LOGIN_PATH} replace />;
  }

  return <Outlet />;
}
