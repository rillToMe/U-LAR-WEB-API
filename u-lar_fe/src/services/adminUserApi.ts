import { api } from "./api";
import type {
  AdminListItem,
  CreateAdminRequest,
  UpdateAdminRequest,
} from "../types/admin";

export async function getAdmins(
  signal?: AbortSignal
): Promise<AdminListItem[]> {
  const response = await api.get<AdminListItem[]>("/AdminUser", { signal });

  return response.data;
}

export async function createAdmin(
  request: CreateAdminRequest
): Promise<AdminListItem> {
  const response = await api.post<AdminListItem>("/AdminUser", request);

  return response.data;
}

export async function updateAdmin(
  id: number,
  request: UpdateAdminRequest
): Promise<AdminListItem> {
  const response = await api.patch<AdminListItem>(
    `/AdminUser/${id}`,
    request
  );

  return response.data;
}

export async function deleteAdmin(
  id: number
): Promise<{ message: string }> {
  const response = await api.delete<{ message: string }>(
    `/AdminUser/${id}`
  );

  return response.data;
}
