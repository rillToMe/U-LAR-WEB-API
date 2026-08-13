import { api } from "./api";
import type { AdminDashboard } from "../types/dashboard";

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const response = await api.get<AdminDashboard>(
    "/Admin/dashboard"
  );

  return response.data;
}
