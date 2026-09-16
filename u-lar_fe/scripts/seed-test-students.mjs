/**
 * Menambahkan mahasiswa random untuk mengetes pencarian & filter.
 *
 * Data dibuat lewat API (POST /Admin/students), bukan INSERT langsung, supaya
 * password tetap di-hash oleh backend dan aturan validasi tetap terpakai.
 *
 * Pakai:
 *   node scripts/seed-test-students.mjs                 # 100 mahasiswa baru
 *   node scripts/seed-test-students.mjs 250 0.3         # 250 mahasiswa, 30% nonaktif
 *   node scripts/seed-test-students.mjs --no-create 0 0.3   # hanya rapikan status
 *
 * Environment (opsional):
 *   API_BASE_URL=http://localhost:5116/api/v1
 *   SEED_ADMIN_USERNAME=admin
 *   SEED_ADMIN_PASSWORD=Admin123!
 *   SEED_STUDENT_PASSWORD=Student123!
 *
 * Semua data yang dibuat memakai NIM berawalan 24 dan email
 * mahasiswa24XXXXXX@test.com, supaya gampang dibedakan dari data asli.
 * Hapus lagi kalau sudah selesai:
 *   DELETE FROM students WHERE email LIKE 'mahasiswa24%@test.com';
 */

const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://localhost:5116/api/v1";
const ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "Admin123!";
const STUDENT_PASSWORD =
  process.env.SEED_STUDENT_PASSWORD ?? "Student123!";

/** Penanda data hasil script ini. */
const SEED_EMAIL_PATTERN = /^mahasiswa24\d{6}@test\.com$/i;

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith("--")));
const positional = args.filter((arg) => !arg.startsWith("--"));

const count = Number(positional[0] ?? 100);
const inactiveRatio = Number(positional[1] ?? 0.3);
const skipCreate = flags.has("--no-create");

if (!Number.isInteger(count) || count < 0) {
  console.error("Jumlah mahasiswa harus angka bulat (0 atau lebih).");
  process.exit(1);
}

const FIRST_NAMES = [
  "Budi", "Siti", "Ahmad", "Dewi", "Rizky", "Putri", "Agus", "Nur",
  "Fajar", "Indah", "Bayu", "Rina", "Hendra", "Maya", "Iqbal", "Lestari",
  "Yoga", "Wulan", "Doni", "Anisa", "Reza", "Fitri", "Arif", "Salma",
  "Taufik", "Citra", "Bambang", "Ratna", "Eko", "Mega", "Dian", "Rudi",
];

const MIDDLE_NAMES = [
  "", "", "", "Dwi", "Tri", "Ayu", "Nur", "Bagus",
];

const LAST_NAMES = [
  "Santoso", "Wijaya", "Nugroho", "Pratama", "Hidayat", "Saputra",
  "Ramadhan", "Kusuma", "Maulana", "Purnama", "Anggraini", "Setiawan",
  "Halim", "Firdaus", "Utami", "Susanto", "Rahmawati", "Hartono",
  "Siregar", "Simanjuntak", "Nasution", "Prasetyo", "Wibowo", "Handoko",
  "Gunawan",
];

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomDigits(length) {
  let digits = "";

  for (let index = 0; index < length; index += 1) {
    digits += Math.floor(Math.random() * 10);
  }

  return digits;
}

function makeNim() {
  return `24${randomDigits(6)}`;
}

function makeName() {
  return [pick(FIRST_NAMES), pick(MIDDLE_NAMES), pick(LAST_NAMES)]
    .filter(Boolean)
    .join(" ");
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  return { status: response.status, body };
}

async function login() {
  const { status, body } = await request("/Auth/admin/login", {
    method: "POST",
    body: JSON.stringify({
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
    }),
  });

  if (status !== 200 || !body?.accessToken) {
    throw new Error(
      `Login admin gagal (status ${status}): ${JSON.stringify(body)}. ` +
        "Periksa SEED_ADMIN_* dan pastikan backend berjalan."
    );
  }

  return body.accessToken;
}

async function createStudents(token, total) {
  const created = [];
  const failed = [];
  const usedNims = new Set();

  console.log(`Membuat ${total} mahasiswa lewat ${API_BASE_URL} ...`);

  for (let index = 1; index <= total; index += 1) {
    let nim = makeNim();

    while (usedNims.has(nim)) {
      nim = makeNim();
    }

    usedNims.add(nim);

    const student = {
      nim,
      name: makeName(),
      email: `mahasiswa${nim}@test.com`,
    };

    let result = await request("/Admin/students", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...student, password: STUDENT_PASSWORD }),
    });

    // NIM bisa saja sudah dipakai data dari run sebelumnya.
    if (result.status === 409) {
      nim = makeNim();
      usedNims.add(nim);
      student.nim = nim;
      student.email = `mahasiswa${nim}@test.com`;

      result = await request("/Admin/students", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...student, password: STUDENT_PASSWORD }),
      });
    }

    if (result.status === 200) {
      created.push(result.body);
    } else {
      failed.push({ student, status: result.status, body: result.body });
    }

    if (index % 10 === 0 || index === total) {
      console.log(
        `  ${index}/${total} — berhasil ${created.length}, gagal ${failed.length}`
      );
    }
  }

  if (failed.length > 0) {
    console.log(`  contoh gagal: ${JSON.stringify(failed[0]).slice(0, 300)}`);
  }

  return created.length;
}

/**
 * Endpoint create selalu membuat mahasiswa aktif, jadi sebagian data seed
 * dinonaktifkan supaya filter status punya data untuk diuji. Dihitung ulang
 * dari daftar di server, jadi aman dijalankan berkali-kali.
 */
async function rebalanceStatus(token, ratio) {
  const { status, body } = await request("/Admin/students", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (status !== 200 || !Array.isArray(body)) {
    throw new Error(
      `Gagal mengambil daftar mahasiswa (status ${status}): ${JSON.stringify(body)}`
    );
  }

  const seeded = body.filter((student) =>
    SEED_EMAIL_PATTERN.test(student.email)
  );

  if (seeded.length === 0) {
    console.log("Belum ada data seed untuk dirapikan statusnya.");
    return { total: 0, inactive: 0 };
  }

  const active = seeded.filter((student) => student.isActive);
  const inactiveCount = seeded.length - active.length;
  const target = Math.round(seeded.length * ratio);

  if (target <= inactiveCount) {
    console.log(
      `Status sudah sesuai: ${active.length} aktif, ${inactiveCount} nonaktif.`
    );

    return { total: seeded.length, inactive: inactiveCount };
  }

  const toDeactivate = [...active]
    .sort(() => Math.random() - 0.5)
    .slice(0, target - inactiveCount);

  let deactivated = 0;

  for (const student of toDeactivate) {
    const result = await request(
      `/Admin/students/${student.id}/status`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: false }),
      }
    );

    if (result.status === 200) {
      deactivated += 1;
    }
  }

  return {
    total: seeded.length,
    inactive: inactiveCount + deactivated,
  };
}

async function main() {
  const token = await login();

  if (!skipCreate) {
    await createStudents(token, count);
  } else {
    console.log("Mode --no-create: hanya merapikan status data seed.");
  }

  const { total, inactive } = await rebalanceStatus(
    token,
    inactiveRatio
  );

  console.log("");
  console.log(`Total data seed di database: ${total}`);
  console.log(`  aktif    : ${total - inactive}`);
  console.log(`  nonaktif : ${inactive}`);
  console.log(`  password : ${STUDENT_PASSWORD}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
