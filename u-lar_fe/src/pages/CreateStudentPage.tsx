import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createStudent } from "../services/studentApi";
import { getApiErrorMessage } from "../services/apiError";
import { useToast } from "../components/common/toastContext";
import {
  VALIDATION,
  validateStudentEmail,
  validateStudentName,
  validateStudentNim,
  validateStudentPassword,
} from "../config/validation";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function CreateStudentPage() {
  const navigate = useNavigate();

  const [nim, setNim] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const validationError =
      validateStudentNim(nim) ??
      validateStudentName(name) ??
      validateStudentEmail(email) ??
      validateStudentPassword(password);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setLoading(true);

      await createStudent({
        nim,
        name,
        email,
        password,
      });

      toast.success(`Akun mahasiswa ${name} berhasil dibuat.`);
      navigate("/admin/students");
    } catch (error) {
      console.error(error);
      toast.error(
        getApiErrorMessage(
          error,
          "Gagal membuat akun mahasiswa."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <button
          type="button"
          onClick={() => navigate("/admin/students")}
          className="-ml-2 mb-3 inline-flex items-center rounded-lg px-2 py-1 text-sm text-fg-subtle transition-colors duration-150 hover:bg-surface-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          ← Kembali
        </button>

        <h1 className="text-2xl font-bold text-fg">
          Tambah Mahasiswa
        </h1>

        <p className="mt-1 text-sm text-fg-subtle">
          Buat akun baru untuk mahasiswa U-LAR.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-xl border bg-surface p-6 max-md:p-4"
      >
        <Input
          id="nim"
          label="NIM"
          type="text"
          value={nim}
          onChange={(event) => setNim(event.target.value)}
          placeholder="Contoh: 23076052"
          required
          minLength={VALIDATION.student.nim.minLength}
          maxLength={VALIDATION.student.nim.maxLength}
        />

        <Input
          id="name"
          label="Nama"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nama lengkap mahasiswa"
          required
          minLength={VALIDATION.student.name.minLength}
          maxLength={VALIDATION.student.name.maxLength}
        />

        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="mahasiswa@example.com"
          required
          maxLength={VALIDATION.student.email.maxLength}
        />

        <Input
          id="password"
          label="Password Awal"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="Password awal mahasiswa"
          required
          minLength={VALIDATION.student.password.minLength}
          maxLength={VALIDATION.student.password.maxLength}
          helperText={`Minimal ${VALIDATION.student.password.minLength} karakter.`}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t pt-5 max-md:flex-col-reverse max-md:[&>button]:w-full">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/students")}
            disabled={loading}
          >
            Batal
          </Button>

          <Button type="submit" loading={loading}>
            Simpan Mahasiswa
          </Button>
        </div>
      </form>
    </div>
  );
}