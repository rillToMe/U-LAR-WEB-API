import type { MaterialCalloutTone } from "./material";

/**
 * Editor materi menyimpan satu dokumen sebagai empat daftar blok - sama
 * dengan yang dipahami API dan yang ditampilkan halaman materi. `key` hanya
 * untuk React; nilainya tidak pernah dikirim ke server.
 */
export interface KeyPointBlock {
  key: number;
  icon: string;
  text: string;
}

export interface CalloutBlock {
  key: number;
  tone: MaterialCalloutTone;
  label: string;
  body: string;
}

export interface DiagramBlock {
  key: number;
  imageUrl: string;
  caption: string;
}

export interface AccordionBlock {
  key: number;
  title: string;
  body: string;
}

/** Isi editor: judul, deskripsi, metadata sidebar, dan blok-bloknya. */
export interface MaterialDraft {
  title: string;
  subtitle: string;
  moduleCode: string;
  readMinutes: string;
  orderNumber: string;
  keyPoints: KeyPointBlock[];
  callouts: CalloutBlock[];
  diagrams: DiagramBlock[];
  accordion: AccordionBlock[];
}

/**
 * Satu isian yang belum benar. `target` menunjuk field yang perlu ditandai di
 * layar: "title", "subtitle", "moduleCode", "readMinutes", "orderNumber",
 * atau blok dengan awalan "kp:" (poin), "co:" (catatan), "dg:" (diagram),
 * "ac:" (materi tambahan) diikuti key bloknya.
 */
export interface DraftProblem {
  target: string;
  message: string;
}
