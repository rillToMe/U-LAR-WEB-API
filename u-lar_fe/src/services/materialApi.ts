import { API_BASE_URL } from "./api";
import type { Material, MaterialListItem } from "../types/material";

/**
 * Materi dibuka WebView tanpa login, jadi dipakai `fetch` biasa - bukan
 * instance `api`/`examApi` yang menempelkan token dan menendang ke /login
 * saat menerima 401. Halaman materi harus tetap tampil walau sesi kosong.
 */
export async function getMaterials(): Promise<MaterialListItem[]> {
  const response = await fetch(`${API_BASE_URL}/Material`);

  if (!response.ok) {
    throw new Error("Daftar materi gagal dimuat.");
  }

  return (await response.json()) as MaterialListItem[];
}

export async function getMaterial(slug: string): Promise<Material> {
  const response = await fetch(
    `${API_BASE_URL}/Material/${encodeURIComponent(slug)}`
  );

  if (response.status === 404) {
    throw new Error(`Materi "${slug}" tidak ditemukan.`);
  }

  if (!response.ok) {
    throw new Error(
      "Materi gagal dimuat. Periksa koneksi lalu coba lagi."
    );
  }

  return (await response.json()) as Material;
}
