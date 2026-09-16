import { useState } from "react";
import type { FormEvent } from "react";
import {
  resetStudentPassword,
  updateStudent,
} from "../../services/studentApi";
import { getApiErrorMessage } from "../../services/apiError";
import { useToast } from "../common/toastContext";
import {
  VALIDATION,
  validateStudentEmail,
  validateStudentName,
  validateStudentNim,
  validateStudentPassword,
} from "../../config/validation";
import type { StudentDetail } from "../../types/student";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";

interface StudentEditModalProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  student: StudentDetail | null;
}

export default function StudentEditModal({
  open,
  onClose,
  onSaved,
  student,
}: StudentEditModalProps) {
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const toast = useToast();

  // State form diinisialisasi langsung dari props: komponen ini hanya
  // di-mount saat modal terbuka (pemanggil memberi `key` per mahasiswa),
  // jadi tidak perlu effect untuk menyalin props ke state.
  const [nim, setNim] = useState(student?.nim ?? "");
  const [name, setName] = useState(student?.name ?? "");
  const [email, setEmail] = useState(student?.email ?? "");

  if (!open || !student) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!student) {
      return;
    }

    const validationError =
      validateStudentNim(nim) ??
      validateStudentName(name) ??
      validateStudentEmail(email);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setSaving(true);

      const result = await updateStudent(student.id, {
        nim,
        name,
        email,
      });

      toast.success(
        result.message ||
          "Data mahasiswa berhasil diperbarui."
      );
      onSaved?.();
    } catch (error) {
      console.error(error);
      toast.error(
        getApiErrorMessage(
          error,
          "Gagal memperbarui data mahasiswa."
        )
      );
    } finally {
      setSaving(false);
    }
  }

  const dirty =
    nim !== student.nim ||
    name !== student.name ||
    email !== student.email ||
    Boolean(newPassword);

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!student) {
      return;
    }

    const validationError = validateStudentPassword(newPassword);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setResetting(true);

      const result = await resetStudentPassword(student.id, {
        newPassword,
      });

      setNewPassword("");
      toast.success(
        result.message ||
          "Password mahasiswa berhasil direset."
      );
    } catch (error) {
      console.error(error);
      toast.error(
        getApiErrorMessage(
          error,
          "Gagal mereset password mahasiswa."
        )
      );
    } finally {
      setResetting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dirty={dirty}
      title="Edit Mahasiswa"
      description={student.nim}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Batal
          </Button>

          <Button
            type="submit"
            form="edit-student-form"
            loading={saving}
          >
            Simpan Perubahan
          </Button>
        </>
      }
    >
      <form
        id="edit-student-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Input
          id="edit-nim"
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
          id="edit-name"
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
          id="edit-email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="mahasiswa@example.com"
          required
          maxLength={VALIDATION.student.email.maxLength}
        />

      </form>

      <div className="mt-6 border-t pt-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-fg">
              Reset Password
            </h3>

            <p className="mt-0.5 text-xs text-fg-subtle">
              Buat kata sandi baru untuk mahasiswa ini.
            </p>
          </div>
        </div>

        <form
          id="reset-password-form"
          onSubmit={handleResetPassword}
          className="mt-4 space-y-4"
        >
          <Input
            id="reset-password"
            label="Password Baru"
            type="password"
            value={newPassword}
            onChange={(event) =>
              setNewPassword(event.target.value)
            }
            placeholder="Password baru mahasiswa"
            required
            minLength={VALIDATION.student.password.minLength}
            maxLength={VALIDATION.student.password.maxLength}
            helperText={`Minimal ${VALIDATION.student.password.minLength} karakter.`}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              form="reset-password-form"
              variant="secondary"
              loading={resetting}
              className="max-md:w-full"
            >
              Reset Password
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
