import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  resetStudentPassword,
  updateStudent,
} from "../../services/studentApi";
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
  onSaved?: (message: string) => void;
  student: StudentDetail | null;
}

export default function StudentEditModal({
  open,
  onClose,
  onSaved,
  student,
}: StudentEditModalProps) {
  const [nim, setNim] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [resetting, setResetting] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    if (open && student) {
      setNim(student.nim);
      setName(student.name);
      setEmail(student.email);
      setError("");
      setNewPassword("");
      setPasswordError("");
      setPasswordMessage("");
    }
  }, [open, student]);

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
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError("");

      const result = await updateStudent(student.id, {
        nim,
        name,
        email,
      });

      onSaved?.(
        result.message ||
          "Data mahasiswa berhasil diperbarui."
      );
    } catch (error) {
      console.error(error);
      setError("Gagal memperbarui data mahasiswa.");
    } finally {
      setSaving(false);
    }
  }

  const dirty = Boolean(
    student &&
      (nim !== student.nim ||
        name !== student.name ||
        email !== student.email ||
        Boolean(newPassword))
  );

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!student) {
      return;
    }

    const validationError = validateStudentPassword(newPassword);

    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    try {
      setResetting(true);
      setPasswordError("");

      const result = await resetStudentPassword(student.id, {
        newPassword,
      });

      setNewPassword("");
      setPasswordMessage(
        result.message ||
          "Password mahasiswa berhasil direset."
      );
    } catch (error) {
      console.error(error);
      setPasswordError("Gagal mereset password mahasiswa.");
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
      description={student ? student.nim : undefined}
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

        {error && (
          <div className="rounded-lg border border-danger-border bg-danger-surface px-4 py-3">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}
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

          {passwordError && (
            <div className="rounded-lg border border-danger-border bg-danger-surface px-4 py-3">
              <p className="text-sm text-danger">
                {passwordError}
              </p>
            </div>
          )}

          {passwordMessage && (
            <div className="rounded-lg border border-success-border bg-success-surface px-4 py-3">
              <p className="text-sm text-success-fg">
                {passwordMessage}
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              form="reset-password-form"
              variant="secondary"
              loading={resetting}
            >
              Reset Password
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
