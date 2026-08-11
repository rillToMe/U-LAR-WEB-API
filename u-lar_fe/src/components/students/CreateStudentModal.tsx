import { useState } from "react";
import type { FormEvent } from "react";
import { createStudent } from "../../services/studentApi";
import {
  VALIDATION,
  validateStudentEmail,
  validateStudentName,
  validateStudentNim,
  validateStudentPassword,
} from "../../config/validation";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface CreateStudentModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateStudentModal({
  open,
  onClose,
  onCreated,
}: CreateStudentModalProps) {
  const [nim, setNim] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setNim("");
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  }

  function handleClose() {
    if (loading) {
      return;
    }

    resetForm();
    onClose();
  }

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
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      await createStudent({
        nim,
        name,
        email,
        password,
      });

      resetForm();
      onCreated();
      onClose();
    } catch (error) {
      console.error(error);
      setError("Gagal membuat akun mahasiswa.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Tambah Mahasiswa"
      description="Buat akun baru untuk mahasiswa U-LAR."
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Batal
          </Button>

          <Button
            type="submit"
            form="create-student-form"
            loading={loading}
          >
            Simpan Mahasiswa
          </Button>
        </>
      }
    >
      <form
        id="create-student-form"
        onSubmit={handleSubmit}
        className="space-y-4"
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

        {error && (
          <div className="rounded-lg border border-danger-border bg-danger-surface px-4 py-3">
            <p className="text-sm text-danger">
              {error}
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
}
