import { useState, type ReactNode } from "react";

/**
 * Halaman panduan untuk admin.
 *
 * Isinya sengaja ditulis mengikuti apa yang benar-benar ada di form dan alur
 * di aplikasi - batas panjang, nilai default, syarat wajib - bukan
 * penjelasan umum. Kalau aturan di `src/config/validation.ts` atau di form
 * berubah, dokumen ini ikut perlu disesuaikan.
 *
 * Admin sering bingung apakah yang ditanyakan soal materi atau soal ujian,
 * jadi halaman ini tidak langsung menampilkan semua panduan. Ia meminta
 * memilih kategori dulu, lalu hanya memuat panduan kategori itu.
 */

type View = "materi" | "ujian" | "mahasiswa" | "akses";

interface Category {
  id: View;
  title: string;
  summary: string;
  /** Kategori=rujukan tampil lebih kecil, bukan pilihan utama. */
  reference?: boolean;
}

const categories: Category[] = [
  {
    id: "materi",
    title: "Tambah Materi",
    summary:
      "Menyusun materi yang dibaca mahasiswa lewat halaman materi di dalam game.",
  },
  {
    id: "ujian",
    title: "Tambah Ujian",
    summary:
      "Membuat ujian, menambahkan soal, lalu mengaktifkannya agar bisa dijemput mahasiswa.",
  },
  {
    id: "mahasiswa",
    title: "Data Mahasiswa",
    summary: "NIM dan password yang dipakai mahasiswa untuk masuk web ujian.",
    reference: true,
  },
  {
    id: "akses",
    title: "Tempat Mahasiswa Mengakses",
    summary: "Halaman mana yang dibuka mahasiswa, dan isinya apa.",
    reference: true,
  },
];

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      {children}
    </div>
  );
}

function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-3">
      {steps.map((step, index) => (
        <li key={step} className="flex gap-3">
          <span
            aria-hidden="true"
            className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-surface text-xs font-semibold text-accent"
          >
            {index + 1}
          </span>

          <span className="text-sm leading-6 text-fg-muted">{step}</span>
        </li>
      ))}
    </ol>
  );
}

/** Tabel aturan isian: nama field, apakah wajib, dan batasnya. */
function FieldTable({ rows }: { rows: [string, boolean, string][] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-muted text-xs uppercase tracking-wider text-fg-subtle">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-semibold">
              Isian
            </th>
            <th scope="col" className="px-4 py-2.5 font-semibold">
              Wajib
            </th>
            <th scope="col" className="px-4 py-2.5 font-semibold">
              Batas
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {rows.map(([label, required, limit]) => (
            <tr key={label}>
              <th
                scope="row"
                className="px-4 py-2.5 font-medium text-fg"
              >
                {label}
              </th>
              <td className="px-4 py-2.5 text-fg-muted">
                {required ? (
                  <span className="text-danger">Ya</span>
                ) : (
                  <span className="text-fg-subtle">Tidak</span>
                )}
              </td>
              <td className="px-4 py-2.5 text-fg-muted">{limit}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Note({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-accent-border bg-accent-surface p-4">
      <p className="text-sm font-semibold text-accent">{title}</p>

      <div className="mt-1.5 text-sm leading-6 text-fg-muted">
        {children}
      </div>
    </div>
  );
}

function SubHead({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-fg">{children}</h3>
  );
}

function BlockList({ items }: { items: [string, string][] }) {
  return (
    <dl className="space-y-3">
      {items.map(([term, description]) => (
        <div key={term}>
          <dt className="text-sm font-semibold text-fg">{term}</dt>
          <dd className="text-sm leading-6 text-fg-muted">
            {description}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Isi tiap kategori ---------- */

function MateriGuide() {
  return (
    <>
      <Card>
        <StepList
          steps={[
            "Buka menu Bank Materi, lalu klik + Tambah Materi.",
            "Isi identitas modul pada panel kiri: judul, kode modul, deskripsi singkat, estimasi waktu baca, dan urutan tampil.",
            "Susun isi di kanvas tengah. Tambahkan blok memakai tombol Tambah Poin Penting, Catatan Kunci, Diagram, atau Materi Tambahan.",
            "Urutkan blok dengan tombol panah atas dan bawah di tiap blok.",
            "Klik Publikasikan supaya mahasiswa bisa membacanya, atau Simpan Draft untuk menyimpan tanpa menampilkannya.",
          ]}
        />
      </Card>

      <div className="space-y-3">
        <SubHead>Identitas modul</SubHead>

        <FieldTable
          rows={[
            ["Judul", true, "Maksimal 150 karakter"],
            ["Deskripsi singkat", true, "Maksimal 300 karakter"],
            ["Kode modul", true, "Maksimal 40 karakter"],
            ["Estimasi waktu baca", false, "1-120 menit, bawaan 5"],
            ["Urutan tampil", false, "Angka 0 atau lebih, bawaan 1"],
          ]}
        />
      </div>

      <div className="space-y-3">
        <SubHead>Jenis blok</SubHead>

        <Card>
          <BlockList
            items={[
              [
                "Poin Penting",
                "Daftar ringkas dengan ikon di tiap baris. Cocok untuk hal yang wajib diingat mahasiswa.",
              ],
              [
                "Catatan Kunci",
                "Kotak catatan penting dengan warna sesuai nada yang dipilih. Judul dan isi keduanya wajib diisi.",
              ],
              [
                "Diagram",
                "Gambar dari URL beserta keterangan. Kalau hanya sebagian diisi, bagian yang kurang akan ditandai.",
              ],
              [
                "Materi Tambahan",
                "Blok yang bisa dibuka dan ditutup (accordion). Cocok untuk glosarium, FAQ, atau penjelasan tambahan.",
              ],
            ]}
          />
        </Card>
      </div>

      <Note title="Yang perlu diperhatikan">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            Maksimal <strong>20 baris</strong> untuk tiap jenis blok.
          </li>
          <li>
            Blok yang seluruh isiannya kosong{" "}
            <strong>dibuang otomatis</strong> saat disimpan, jadi tidak
            perlu dihapus manual.
          </li>
          <li>
            Alamat halaman dibuat otomatis dari judul. Judul yang
            seluruhnya simbol memakai alamat cadangan{" "}
            <code className="rounded bg-surface-muted px-1 py-0.5 text-xs">
              /materi/materi
            </code>
            .
          </li>
          <li>
            Ada dua tombol simpan:{" "}
            <strong>Simpan Draft</strong> (tersimpan, mahasiswa belum
            melihat) dan <strong>Publikasikan</strong> (langsung tampil).
          </li>
          <li>
            Keluar halaman saat masih ada perubahan yang belum disimpan
            akan memunculkan peringatan.
          </li>
        </ul>
      </Note>
    </>
  );
}

function UjianGuide() {
  return (
    <>
      <Card>
        <StepList
          steps={[
            "Buka menu Bank Soal, lalu klik Buat Ujian Baru.",
            "Isi identitas ujian dan simpan. Soal ditambahkan setelah identitas tersimpan.",
            "Buka halaman ujian tersebut, lalu klik Tambah Soal.",
            "Tambahkan soal satu per satu. Setiap soal dipilih tipenya: Pilihan Ganda atau Uraian.",
            "Setelah semua soal siap, klik Aktifkan supaya mahasiswa bisa menjemput ujian.",
          ]}
        />
      </Card>

      <div className="space-y-3">
        <SubHead>Identitas ujian</SubHead>

        <FieldTable
          rows={[
            ["Judul Ujian", true, "Maksimal 150 karakter"],
            [
              "Deskripsi",
              false,
              "Maksimal 500 karakter, tampil sebagai petunjuk",
            ],
            ["Nilai Kelulusan", true, "0-100, bawaan 70"],
            ["Durasi (menit)", true, "1-600 menit, bawaan 30"],
          ]}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <SubHead>Soal Pilihan Ganda</SubHead>

          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-fg-muted">
            <li>
              Minimal <strong>2</strong> dan maksimal <strong>10</strong>{" "}
              pilihan jawaban.
            </li>
            <li>Teks tiap pilihan maksimal 500 karakter.</li>
            <li>
              Tepat <strong>satu</strong> pilihan ditandai sebagai jawaban
              benar. Kalau semua dilepas, pilihan pertama otomatis ditandai.
            </li>
            <li>Isi URL Gambar untuk soal bergambar (opsional).</li>
          </ul>
        </Card>

        <Card>
          <SubHead>Soal Uraian</SubHead>

          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-fg-muted">
            <li>
              Isi <strong>Jawaban Acuan</strong> - dipakai sebagai kunci
              penilaian, maksimal 2000 karakter.
            </li>
            <li>
              Boleh dikosongkan, tapi lebih baik diisi supaya penilaian
              antar dosen konsisten.
            </li>
            <li>
              Jawaban mahasiswa dinilai dari halaman ujian lewat tombol
              penilaian.
            </li>
          </ul>
        </Card>
      </div>

      <Note title="Status ujian">
        <ul className="list-disc space-y-1.5 pl-5">
          <li>
            <strong>Nonaktif</strong> (bawaan) - ujian tidak muncul di
            web ujian mahasiswa.
          </li>
          <li>
            <strong>Aktif</strong> - ujian muncul di daftar pilihan
            mahasiswa.
          </li>
          <li>
            Perubahan nilai kelulusan dan durasi berlaku untuk percobaan
            berikutnya.
          </li>
        </ul>
      </Note>
    </>
  );
}

function MahasiswaGuide() {
  return (
    <>
      <Card>
        <StepList
          steps={[
            "Buka menu Mahasiswa. Halaman ini menampilkan seluruh akun mahasiswa U-LAR beserta NIM, email, dan status aktif.",
            "Cari mahasiswa lewat kolom pencarian (mencocokkan NIM, nama, atau email) dan saring lewat filter status: Semua, Aktif, atau Nonaktif.",
            "Klik + Tambah Mahasiswa untuk membuat akun baru.",
            "Klik salah satu baris untuk membuka detail, tempat progress, misi selesai, dan skor rata-rata mahasiswa bisa dilihat.",
            "Ubah data, reset password, atau ubah status dari dalam panel detail tersebut.",
          ]}
        />
      </Card>

      <div className="space-y-3">
        <SubHead>Tambah mahasiswa</SubHead>

        <Card>
          <StepList
            steps={[
              "Klik + Tambah Mahasiswa.",
              "Isi NIM, nama, email, dan password. Keempatnya wajib diisi.",
              "Email harus berupa alamat email yang valid, bukan sekadar teks bebas.",
              "Klik Simpan Mahasiswa. Akun langsung aktif dan bisa dipakai mahasiswa untuk masuk ke web ujian.",
            ]}
          />
        </Card>

        <FieldTable
          rows={[
            ["NIM", true, "8–20 karakter, dipakai sebagai username"],
            ["Nama", true, "2–100 karakter"],
            ["Email", true, "Maksimal 150 karakter, harus format email yang valid"],
            ["Password", true, "Minimal 8 karakter"],
          ]}
        />
      </div>

      <div className="space-y-3">
        <SubHead>Ubah data mahasiswa</SubHead>

        <Card>
          <p className="text-sm leading-6 text-fg-muted">
            Buka panel detail mahasiswa, lalu tekan tombol ubah. Yang bisa
            diganti: <strong>NIM</strong>, <strong>nama</strong>,{" "}
            <strong>email</strong>, dan <strong>password</strong>.
          </p>

          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-fg-muted">
            <li>
              NIM bisa diganti, tapi mahasiswa harus diberi tahu - NIM adalah
              identitas masuknya.
            </li>
            <li>
              Password baru bersifat opsional. Kalau dikosongkan, password
              lama tetap berlaku.
            </li>
            <li>
              NIM, nama, dan email tetap wajib diisi saat disimpan - email
              juga harus tetap berupa alamat yang valid.
            </li>
            <li>
              Password juga bisa diganti sendiri lewat tombol{" "}
              <strong>Reset Password</strong> tanpa membuka form ubah.
            </li>
          </ul>
        </Card>
      </div>

      <div className="space-y-3">
        <SubHead>Aktif dan nonaktifkan</SubHead>

        <Card>
          <p className="text-sm leading-6 text-fg-muted">
            Toggle status di baris mahasiswa mengubah apakah akunnya boleh
            masuk ke web ujian.
          </p>

          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-6 text-fg-muted">
            <li>
              <strong>Aktif</strong> - mahasiswa bisa login dan menjemput
              ujian.
            </li>
            <li>
              <strong>Nonaktif</strong> - login ditolak, tapi seluruh data
              dan hasil ujiannya tetap utuh.
            </li>
            <li>
              Gunakan nonaktif, bukan hapus, untuk mahasiswa yang sedang cuti
              atau sudah lulus.
            </li>
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <SubHead>Hapus mahasiswa</SubHead>

          <p className="mt-3 text-sm leading-6 text-fg-muted">
            Penghapusan tidak bisa dibatalkan dan fitur ini meminta Anda{" "}
            <strong>mengetik NIM</strong> mahasiswa sebagai konfirmasi.
            Mahasiswa beserta <strong>seluruh hasil ujiannya</strong> ikut
            terhapus.
          </p>
        </Card>

        <Card>
          <SubHead>Yang tidak bisa dihapus</SubHead>

          <p className="mt-3 text-sm leading-6 text-fg-muted">
            Materi dan soal ujian milik U-LAR tidak terpengaruh penghapusan
            mahasiswa, jadi aman dihapus tanpa kehilangan data penting.
          </p>
        </Card>
      </div>

      <Note title="Ingat soal data mahasiswa">
        Hapus mahasiswa berarti menghapus identitas dan hasil ujiannya secara
        permanen. Kalau hanya ingin mencegah mahasiswa masuk, nonaktifkan saja
        lewat toggle status.
      </Note>
    </>
  );
}

function AksesGuide() {
  return (
    <>
      <Card>
        <BlockList
          items={[
            [
              "Halaman materi - /materi",
              "Dibaca mahasiswa tanpa login. Hanya materi yang sudah dipublikasikan yang tampil, diurutkan sesuai urutan tampil.",
            ],
            [
              "Web ujian - /ujian",
              "Mahasiswa masuk memakai NIM dan password, lalu memilih ujian yang berstatus aktif untuk dikerjakan.",
            ],
          ]}
        />
      </Card>

      <Note title="Mengecek tampilan mahasiswa">
        Aktifkan dulu satu materi atau satu ujian, lalu buka halamannya dari
        game. Kalau masih terlihat kosong, biasanya karena materinya masih
        berupa draft atau ujiannya masih nonaktif.
      </Note>
    </>
  );
}

/* ---------- Halaman ---------- */

export default function DocsPage() {
  const [view, setView] = useState<View | null>(null);

  const current = categories.find((item) => item.id === view);

  if (view === null) {
    const utama = categories.filter((item) => !item.reference);
    const rujukan = categories.filter((item) => item.reference);

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-fg">Cara Pakai</h1>

          <p className="mt-1 text-sm text-fg-subtle">
            Pilih dulu yang ingin kamu kerjakan, supaya tidak menampilkan
            panduan yang tidak dibutuhkan.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-fg">
            Mau buat apa?
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {utama.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className="group flex flex-col rounded-xl border border-border bg-surface p-6 text-left transition-colors duration-150 hover:border-accent-border hover:bg-accent-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="text-base font-semibold text-fg">
                  {item.title}
                </span>

                <span className="mt-1.5 text-sm leading-6 text-fg-muted">
                  {item.summary}
                </span>

                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  Buka panduan
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="size-4 transition-transform duration-150 group-hover:translate-x-0.5"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-fg">Referensi</h2>

          <div className="grid gap-4 md:grid-cols-2">
            {rujukan.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setView(item.id)}
                className="flex flex-col rounded-xl border border-border bg-surface p-5 text-left transition-colors duration-150 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <span className="text-sm font-semibold text-fg">
                  {item.title}
                </span>

                <span className="mt-1 text-sm leading-6 text-fg-muted">
                  {item.summary}
                </span>
              </button>
            ))}
          </div>
        </section>

        <Note title="Sebelum mulai">
          Konten yang baru dibuat belum terlihat mahasiswa selama masih
          berstatus draft atau nonaktif. Materi harus{" "}
          <strong>dipublikasikan</strong>, ujian harus{" "}
          <strong>diaktifkan</strong>.
        </Note>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => setView(null)}
          className="-ml-2 mb-3 inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-fg-muted transition-colors duration-150 hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="size-4"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Ganti kategori
        </button>

        <h1 className="text-2xl font-bold text-fg">{current?.title}</h1>

        {current && (
          <p className="mt-1 text-sm text-fg-subtle">
            {current.summary}
          </p>
        )}
      </div>

      {view === "materi" && <MateriGuide />}
      {view === "ujian" && <UjianGuide />}
      {view === "mahasiswa" && <MahasiswaGuide />}
      {view === "akses" && <AksesGuide />}
    </div>
  );
}
