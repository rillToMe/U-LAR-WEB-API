/** Nada kotak sorotan. Sama dengan konstanta di backend. */
export type MaterialCalloutTone = "info" | "tip" | "warn" | "formula";

export interface MaterialKeyPoint {
  /** Nama ikon yang dikenal halaman; nama asing tetap tampil sebagai titik. */
  icon: string;
  text: string;
}

export interface MaterialCallout {
  tone: MaterialCalloutTone;
  label: string;
  body: string;
}

export interface MaterialDiagram {
  imageUrl: string | null;
  caption: string;
}

export interface MaterialAccordionItem {
  title: string;
  body: string;
}

export interface Material {
  slug: string;
  moduleCode: string;
  title: string;
  subtitle: string;
  readMinutes: number;
  keyPoints: MaterialKeyPoint[];
  callouts: MaterialCallout[];
  diagrams: MaterialDiagram[];
  accordion: MaterialAccordionItem[];
}

export interface MaterialListItem {
  slug: string;
  moduleCode: string;
  title: string;
  subtitle: string;
  readMinutes: number;
}

declare global {
  interface Window {
    /**
     * Jembatan yang disuntikkan game ke WebView. Tombol "Selesai Membaca"
     * memakainya untuk memberi tahu Unity bahwa materi sudah dibaca.
     */
    Unity?: { call: (eventName: string) => void };
  }
}
