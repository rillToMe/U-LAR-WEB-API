import { api } from "./api";
import type {
  MaterialCreatedResponse,
  MaterialDetail,
  MaterialImageUploadResponse,
  MaterialMessageResponse,
  MaterialSummaryItem,
  SaveMaterialRequest,
} from "../types/materialBank";

export async function getMaterials(): Promise<MaterialSummaryItem[]> {
  const response = await api.get<MaterialSummaryItem[]>("/MaterialBank");

  return response.data;
}

export async function getMaterialDetail(
  materialId: number
): Promise<MaterialDetail> {
  const response = await api.get<MaterialDetail>(
    `/MaterialBank/${materialId}`
  );

  return response.data;
}

export async function createMaterial(
  request: SaveMaterialRequest
): Promise<MaterialCreatedResponse> {
  const response = await api.post<MaterialCreatedResponse>(
    "/MaterialBank",
    request
  );

  return response.data;
}

export async function updateMaterial(
  materialId: number,
  request: SaveMaterialRequest
): Promise<MaterialMessageResponse> {
  const response = await api.put<MaterialMessageResponse>(
    `/MaterialBank/${materialId}`,
    request
  );

  return response.data;
}

export async function updateMaterialStatus(
  materialId: number,
  isActive: boolean
): Promise<MaterialMessageResponse> {
  const response = await api.patch<MaterialMessageResponse>(
    `/MaterialBank/${materialId}/status`,
    { isActive }
  );

  return response.data;
}

export async function deleteMaterial(
  materialId: number
): Promise<MaterialMessageResponse> {
  const response = await api.delete<MaterialMessageResponse>(
    `/MaterialBank/${materialId}`
  );

  return response.data;
}

/** Mengunggah gambar diagram ke API; hasilnya path relatif yang siap dipakai
 * sebagai `imageUrl` blok diagram. */
export async function uploadMaterialImage(
  file: File
): Promise<MaterialImageUploadResponse> {
  const form = new FormData();

  form.append("file", file);

  const response = await api.post<MaterialImageUploadResponse>(
    "/MediaBank/materials/images",
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return response.data;
}
