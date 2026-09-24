import type { MaterialCalloutTone } from "./material";

/** Satu baris pada daftar Bank Materi di web admin. */
export interface MaterialSummaryItem {
  id: number;
  slug: string;
  moduleCode: string;
  title: string;
  subtitle: string;
  readMinutes: number;
  orderNumber: number;
  isActive: boolean;
  keyPointCount: number;
  calloutCount: number;
  accordionCount: number;
  updatedAt: string;
}

export interface MaterialKeyPointItem {
  icon: string;
  text: string;
}

export interface MaterialCalloutItem {
  tone: MaterialCalloutTone;
  label: string;
  body: string;
}

export interface MaterialDiagramItem {
  imageUrl: string | null;
  caption: string;
}

export interface MaterialAccordionEntry {
  title: string;
  body: string;
}

/** Isi lengkap satu materi untuk halaman kelola admin. */
export interface MaterialDetail {
  id: number;
  slug: string;
  moduleCode: string;
  title: string;
  subtitle: string;
  readMinutes: number;
  orderNumber: number;
  isActive: boolean;
  keyPoints: MaterialKeyPointItem[];
  callouts: MaterialCalloutItem[];
  diagrams: MaterialDiagramItem[];
  accordion: MaterialAccordionEntry[];
  updatedAt: string;
}

/** Isi materi yang dikirim saat menyimpan. Slug tidak ikut dikirim: alamat
 * halaman materi diturunkan server dari judul materi. */
export interface SaveMaterialRequest {
  moduleCode: string;
  title: string;
  subtitle: string;
  readMinutes: number;
  orderNumber: number;
  keyPoints: MaterialKeyPointItem[];
  callouts: MaterialCalloutItem[];
  diagrams: MaterialDiagramItem[];
  accordion: MaterialAccordionEntry[];
}

export interface MaterialMessageResponse {
  message: string;
}

export interface MaterialCreatedResponse extends MaterialMessageResponse {
  id: number;
}

/** Hasil unggahan gambar diagram (blok diagram di editor materi). URL-nya
 * path relatif ke API, mis. "/uploads/materials/xxx.png". */
export interface MaterialImageUploadResponse {
  url: string;
  fileName: string;
  sizeBytes: number;
}
