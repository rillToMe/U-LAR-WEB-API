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