export const VALIDATION = {
  student: {
    nim: {
      minLength: 8,
      maxLength: 20,
    },

    name: {
      minLength: 2,
      maxLength: 100,
    },

    email: {
      maxLength: 150,
    },

    password: {
      minLength: 8,
      maxLength: 100,
    },
  },

  /* Harus sama dengan batas di ExamBankService supaya pesan dari server
     benar-benar jarang muncul. */
  exam: {
    title: {
      maxLength: 150,
    },

    description: {
      maxLength: 500,
    },

    passingScore: {
      min: 0,
      max: 100,
      default: 70,
    },

    durationMinutes: {
      min: 1,
      max: 600,
      default: 30,
    },

    question: {
      maxLength: 1000,
    },

    answerKey: {
      maxLength: 2000,
    },

    option: {
      maxLength: 500,
      minCount: 2,
      maxCount: 10,
    },
  },

  /* Harus sama dengan batas di MaterialBankService. */
  material: {
    /* Slug diisi otomatis dari judul (di server). Batasnya di sini hanya
       dipakai untuk menampilkan pratinjau alamat di form. */
    slug: {
      maxLength: 80,
      /* Sama dengan FallbackSlug di MaterialBankService: judul yang seluruhnya
         simbol tetap butuh alamat halaman. */
      fallback: "materi",
    },

    moduleCode: {
      maxLength: 40,
    },

    title: {
      maxLength: 150,
    },

    subtitle: {
      maxLength: 300,
    },

    readMinutes: {
      min: 1,
      max: 120,
      default: 5,
    },

    maxRowsPerSection: 20,

    keyPoint: {
      iconMaxLength: 40,
      textMaxLength: 300,
    },

    callout: {
      labelMaxLength: 60,
      bodyMaxLength: 500,
    },

    diagram: {
      imageUrlMaxLength: 300,
      captionMaxLength: 200,
    },

    accordion: {
      titleMaxLength: 150,
      bodyMaxLength: 2000,
    },
  },
} as const;

export function validateStudentNim(
  nim: string
): string | null {
  const rules = VALIDATION.student.nim;

  if (!nim.trim()) {
    return "NIM wajib diisi.";
  }

  if (nim.length < rules.minLength) {
    return `NIM minimal ${rules.minLength} karakter.`;
  }

  if (nim.length > rules.maxLength) {
    return `NIM maksimal ${rules.maxLength} karakter.`;
  }

  return null;
}

export function validateStudentName(
  name: string
): string | null {
  const rules = VALIDATION.student.name;

  if (!name.trim()) {
    return "Nama wajib diisi.";
  }

  if (name.length < rules.minLength) {
    return `Nama minimal ${rules.minLength} karakter.`;
  }

  if (name.length > rules.maxLength) {
    return `Nama maksimal ${rules.maxLength} karakter.`;
  }

  return null;
}

export function validateStudentEmail(
  email: string
): string | null {
  const rules = VALIDATION.student.email;

  if (!email.trim()) {
    return "Email wajib diisi.";
  }

  if (email.length > rules.maxLength) {
    return `Email maksimal ${rules.maxLength} karakter.`;
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return "Format email tidak valid.";
  }

  return null;
}

export function validateStudentPassword(
  password: string
): string | null {
  const rules = VALIDATION.student.password;

  if (!password) {
    return "Password wajib diisi.";
  }

  if (password.length < rules.minLength) {
    return `Password minimal ${rules.minLength} karakter.`;
  }

  if (password.length > rules.maxLength) {
    return `Password maksimal ${rules.maxLength} karakter.`;
  }

  return null;
}