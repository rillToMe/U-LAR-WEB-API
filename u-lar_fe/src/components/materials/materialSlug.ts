import { VALIDATION } from "../../config/validation";

/**
 * Menirukan pembuatan slug di server (lihat Slugify di MaterialBankService):
 * huruf kecil, aksen dibuang, dan apa pun selain huruf/angka jadi tanda
 * hubung. Nilai sebenarnya tetap dibuat server - fungsi ini hanya untuk
 * menampilkan alamat halaman materi di form admin.
 */
export function slugifyMaterialTitle(title: string): string {
  const trimmed = title.trim();

  if (trimmed === "") {
    return "";
  }

  const slug = trimmed
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, VALIDATION.material.slug.maxLength)
    .replace(/-+$/g, "");

  return slug === "" ? VALIDATION.material.slug.fallback : slug;
}

/**
 * Alamat halaman materi yang akan berlaku setelah disimpan. Judul yang tidak
 * diubah mempertahankan slug lama (server tidak menggantinya supaya tautan
 * yang sudah dibagikan tidak mati), judul baru diturunkan dari judulnya.
 */
export function previewMaterialSlug(
  title: string,
  original: { title: string; slug: string } | null
): string {
  if (
    original !== null &&
    original.slug !== "" &&
    title.trim() === original.title
  ) {
    return original.slug;
  }

  return slugifyMaterialTitle(title);
}
