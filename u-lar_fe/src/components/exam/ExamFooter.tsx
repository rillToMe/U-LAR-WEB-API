/**
 * Footer web ujian untuk halaman "statis" (daftar ujian, hasil).
 * Sesi pengerjaan sengaja tidak memakainya — di tengah ujian tidak boleh ada
 * tautan keluar yang menggoda, dan bilah bawah layarnya sudah terpakai
 * navigasi soal.
 *
 * Isinya profesional dan seminimal mungkin: identitas dan hak cipta. Memakai
 * token warna biasa supaya rapi di mode terang maupun gelap.
 */
export default function ExamFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-md px-4 py-8 lg:max-w-5xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* Identitas */}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-fg">Web Ujian</p>

            <p className="mt-1.5 max-w-xs text-xs leading-5 text-fg-subtle">
              Ujian online untuk mahasiswa - jawaban tersimpan otomatis
              dan waktu pengerjaan diatur oleh server.
            </p>
          </div>
        </div>

        <div className="mt-7 border-t border-border pt-4">
          <p className="text-[11px] leading-5 text-fg-subtle">
            © {year} U-LAR. Semua jawaban tersimpan otomatis ke
            server - pastikan koneksi internet stabil saat mengerjakan.
          </p>
        </div>
      </div>
    </footer>
  );
}
