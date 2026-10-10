import type { LandingIconName } from "./LandingIcon";

/* Seluruh teks halaman depan dikumpulkan di sini supaya komponen hanya
   mengurus tampilan. Isinya hanya fakta dari dokumen aplikasi dan
   rules/PRD — tanpa statistik karangan, testimoni, maupun tautan unduh. */

/** Tautan menu. Dipakai LandingNav sekaligus sasaran scroll-spy. */
export const NAV_ITEMS = [
  { id: "tentang", label: "Tentang" },
  { id: "fitur", label: "Fitur" },
  { id: "materi", label: "Materi" },
  { id: "faq", label: "FAQ" },
  { id: "kontak", label: "Kontak" },
] as const;

export const SECTION_IDS: string[] = NAV_ITEMS.map((item) => item.id);

/* Warna konduktor mengikuti urutan pin T568B dari dokumen aplikasi
   (STORYLINE, Langkah 7): putih-oranye, oranye, putih-hijau, biru,
   putih-biru, hijau, putih-cokelat, cokelat. Konduktor "putih-*" digambar
   berstrip: alas krem + garis warna di atasnya. */
export interface PinoutWire {
  pin: number;
  name: string;
  base: string;
  stripe: string | null;
}

export const T568B_PINS: PinoutWire[] = [
  { pin: 1, name: "Putih-oranye", base: "#f5f1e6", stripe: "#e08a3c" },
  { pin: 2, name: "Oranye", base: "#e08a3c", stripe: null },
  { pin: 3, name: "Putih-hijau", base: "#f5f1e6", stripe: "#4e9e6a" },
  { pin: 4, name: "Biru", base: "#3e6fb0", stripe: null },
  { pin: 5, name: "Putih-biru", base: "#f5f1e6", stripe: "#6e9bd8" },
  { pin: 6, name: "Hijau", base: "#4e9e6a", stripe: null },
  { pin: 7, name: "Putih-cokelat", base: "#f5f1e6", stripe: "#8a6a4f" },
  { pin: 8, name: "Cokelat", base: "#8a6a4f", stripe: null },
];

/* Kelas ubin ikon ditulis penuh di sini (bukan disusun dinamis) supaya
   Tailwind ikut menghasilkan utilitasnya saat memindai berkas ini. */
export type IconTone =
  | "bg-landing-rose-pale text-landing-rose-ink"
  | "bg-landing-surface-high text-landing-ink"
  | "bg-landing-sage-pale text-landing-sage-ink"
  | "bg-landing-beige text-landing-ink";

export interface Challenge {
  icon: LandingIconName;
  tone: IconTone;
  title: string;
  body: string;
  tag: string;
}

export const CHALLENGES: Challenge[] = [
  {
    icon: "inventory",
    tone: "bg-landing-rose-pale text-landing-rose-ink",
    title: "Keterbatasan alat praktik",
    body: "Kabel UTP dan konektor RJ45 bersifat sekali pakai. Setiap percobaan menghabiskan bahan, sehingga latihan mandiri di luar jam laboratorium jarang terjadi.",
    tag: "Bahan habis pakai",
  },
  {
    icon: "eye-off",
    tone: "bg-landing-surface-high text-landing-ink",
    title: "Ukuran yang sulit diamati",
    body: "Konduktor tembaga berdiameter sekitar 0,5 mm dan delapan urutan warnanya harus tepat. Demonstrasi klasikal menyulitkan siswa memeriksa detail sekecil itu.",
    tag: "Detail 0,5 mm",
  },
  {
    icon: "timer",
    tone: "bg-landing-sage-pale text-landing-sage-ink",
    title: "Waktu latihan terbatas",
    body: "Jam praktikum yang singkat tidak cukup untuk mengulang prosedur sampai terbentuk ketelitian warna dan memori motorik crimping.",
    tag: "Perlu pengulangan",
  },
];

export interface Keyword {
  icon: LandingIconName;
  word: string;
  caption: string;
}

export const KEYWORDS: Keyword[] = [
  { icon: "compass", word: "Explore", caption: "Anatomi objek" },
  { icon: "route", word: "Simulate", caption: "Alur prosedur" },
  { icon: "school", word: "Learn", caption: "Evaluasi mandiri" },
];

export interface Feature {
  icon: LandingIconName;
  tone: IconTone;
  module: string;
  title: string;
  body: string;
  foot: string;
}

export const FEATURES: Feature[] = [
  {
    icon: "ar",
    tone: "bg-landing-sage-pale text-landing-sage-ink",
    module: "Modul 01",
    title: "Eksplorasi objek AR",
    body: "Enam marker menampilkan model tiga dimensi alat dan bahan instalasi. Putar, perbesar, dan kenali fungsinya sebelum masuk ke inventaris virtual.",
    foot: "Enam objek 3D",
  },
  {
    icon: "drag",
    tone: "bg-landing-rose-pale text-landing-rose-ink",
    module: "Modul 02",
    title: "Simulasi interaktif",
    body: "Susun delapan konduktor sesuai urutan warna, ratakan ujungnya, masukkan ke konektor RJ45, lalu kunci dengan crimping — langkah demi langkah.",
    foot: "Dua belas langkah",
  },
  {
    icon: "list",
    tone: "bg-landing-surface-high text-landing-ink",
    module: "Modul 03",
    title: "Latihan terbimbing",
    body: "Setiap langkah diperiksa saat terjadi: alat yang salah, susunan warna yang keliru, atau crimping yang kurang tepat langsung diberi umpan balik bertingkat.",
    foot: "Umpan balik bertingkat",
  },
  {
    icon: "chart",
    tone: "bg-landing-beige text-landing-ink",
    module: "Modul 04",
    title: "Evaluasi hasil",
    body: "Kabel diuji dengan cable tester virtual. Penilaian melihat proses — pemilihan alat, urutan prosedur, susunan warna — bukan hanya kabel jadinya.",
    foot: "Dinilai dari proses",
  },
];

export interface JourneyStep {
  no: string;
  phase: string;
  title: string;
  body: string;
}

export const JOURNEY: JourneyStep[] = [
  {
    no: "01",
    phase: "Tahap 1",
    title: "Kenali",
    body: "Pahami nama dan fungsi alat serta bahan: kabel UTP, konektor RJ45, stripping tool, cable cutter, crimping tool, dan cable tester.",
  },
  {
    no: "02",
    phase: "Tahap 2",
    title: "Eksplorasi",
    body: "Pelajari perbedaan standar T568A dan T568B serta pemetaan delapan warna konduktor pada tiap pin.",
  },
  {
    no: "03",
    phase: "Tahap 3",
    title: "Simulasikan",
    body: "Jalankan dua belas langkah pemasangan: kupas jaket, susun warna, ratakan ujung, pasang RJ45, lalu crimping.",
  },
  {
    no: "04",
    phase: "Tahap 4",
    title: "Evaluasi",
    body: "Uji kabel dengan cable tester virtual, analisis kesalahan sambungan, dan perbaiki instalasi yang gagal.",
  },
];

export interface CurriculumModule {
  icon: LandingIconName;
  tone: IconTone;
  kicker: string;
  title: string;
  body: string;
  points: string[];
  focus: string;
}

export const CURRICULUM: CurriculumModule[] = [
  {
    icon: "cable",
    tone: "bg-landing-sage-pale text-landing-sage-ink",
    kicker: "Komponen & perkakas",
    title: "Kabel UTP & peralatan",
    body: "Karakteristik kabel UTP dan fungsi tiap perkakas sebelum menyentuh konektor.",
    points: [
      "Unshielded twisted pair dan kategorinya",
      "Anatomi pin konektor 8P8C",
      "Stripping tool, cable cutter, crimping tool",
    ],
    focus: "Fokus: keamanan & fungsi alat",
  },
  {
    icon: "palette",
    tone: "bg-landing-rose-pale text-landing-rose-ink",
    kicker: "Standar internasional",
    title: "Standar pengawatan",
    body: "Susunan delapan kode warna konduktor menurut T568A dan T568B.",
    points: [
      "Urutan warna pin 1 sampai 8",
      "Perbedaan T568A dan T568B",
      "Standar yang sama di kedua ujung",
    ],
    focus: "Fokus: akurasi urutan pinout",
  },
  {
    icon: "shuffle",
    tone: "bg-landing-beige text-landing-ink",
    kicker: "Konfigurasi jaringan",
    title: "Straight-through & cross-over",
    body: "Kapan memakai susunan yang sama, dan kapan ujungnya disilangkan.",
    points: [
      "Straight-through: T568B–T568B",
      "Cross-over: T568A–T568B",
      "Uji hasil dengan cable tester",
    ],
    focus: "Fokus: penerapan topologi",
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: "Apa itu U-LAR?",
    answer:
      "U-LAR adalah singkatan dari Ubiquitous Learning Assisted by Augmented Reality: media pembelajaran instalasi media transmisi jaringan. Ia menampilkan alat dan bahan sebagai objek tiga dimensi lewat pemindaian marker, lalu memandu simulasi pemasangan kabel UTP langkah demi langkah.",
  },
  {
    question: "Siapa yang dapat memakai U-LAR?",
    answer:
      "Media ini dirancang untuk mahasiswa praktik instalasi jaringan komputer — khususnya program Pendidikan Teknik Informatika — serta siswa dan guru SMK bidang komputer dan jaringan yang mempelajari pengawatan kabel.",
  },
  {
    question: "Bagaimana Augmented Reality membantu proses belajar?",
    answer:
      "Marker yang dipindai menampilkan objek alat dan bahan dalam tiga dimensi, sehingga bagian yang terlalu kecil untuk diamati — seperti pin tembaga konektor dan urutan warna konduktor — dapat diputar dan diperbesar. Latihan berulang pun tidak menghabiskan kabel maupun konektor fisik.",
  },
  {
    question: "Materi apa saja yang dicakup?",
    answer:
      "Enam modul: konsep media transmisi, kabel UTP, alat dan bahan, standar pengawatan T568A dan T568B, serta kabel straight-through dan cross-over.",
  },
  {
    question: "Apakah U-LAR menggantikan praktikum di laboratorium?",
    answer:
      "Tidak. U-LAR adalah media pelengkap yang menguatkan pemahaman prosedural sebelum dan sesudah siswa memegang perkakas yang sebenarnya di laboratorium.",
  },
  {
    question: "Bagaimana cara mengakses materi dan ujiannya?",
    answer:
      "Materi, misi AR, simulasi, dan ujian dijalankan dari aplikasi Android U-LAR memakai akun yang diberikan laboratorium. Panel admin — untuk pengelola mengatur akun, materi, dan soal — dibuka lewat peramban.",
  },
];

export const CONTACT = {
  heading: "Kolaborasi akademik & riset",
  body: "U-LAR dikembangkan sebagai luaran penelitian dosen. Kami menyambut masukan pendidik, laboran, dan institusi pendidikan teknik.",
  address:
    "Pendidikan Teknik Informatika, Departemen Teknik Elektronika, Fakultas Teknik, Universitas Negeri Padang",
  email: "admin@u-lar.ac.id",
  research: "Penelitian Dosen Pemula (PDP) 2025",
  statusLabel: "Status pengembangan",
  status:
    "Media ajar untuk keperluan penelitian dan pembelajaran praktik instalasi jaringan komputer.",
};

export const FOOTER = {
  description:
    "Ubiquitous Learning Assisted by Augmented Reality — media pembelajaran instalasi media transmisi jaringan.",
  navHeading: "Navigasi edukasi",
  navLinks: [
    { href: "#tentang", label: "Tentang platform" },
    { href: "#fitur", label: "Fitur pembelajaran" },
    { href: "#materi", label: "Standar kurikulum" },
    { href: "#faq", label: "Pertanyaan umum" },
  ],
  infoHeading: "Pusat informasi",
  infoBody:
    "Media ajar untuk institusi kejuruan dan politeknik bidang komputer dan jaringan.",
  copyright: "© 2025 U-LAR · Penelitian Dosen Pemula, Universitas Negeri Padang",
};
