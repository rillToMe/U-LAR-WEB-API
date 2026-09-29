import { useState } from "react";
import type { FormEvent } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { useToast } from "../common/toastContext";
import { describeApiError } from "../../services/apiError";
import { createAdmin } from "../../services/adminUserApi";
import { VALIDATION } from "../../config/validation";

const rules = VALIDATION.admin;

interface CreateAdminModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (username: string) => void;
}

export default function CreateAdminModal({
  open,
  onClose,
  onSaved,
}: CreateAdminModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  function handleClose() {
    if (loading) {
      return;
    }

    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      toast.error("Username wajib diisi.");
      return;
    }

    if (password.length < rules.password.minLength) {
      toast.error(
        `Password minimal ${rules.password.minLength} karakter.`
      );
      return;
    }

    try {
      setLoading(true);

      const created = await createAdmin({
        username: trimmedUsername,
        password
      });

      onSaved(created.username);
      onClose();
    } catch (error) {
      toast.error(
        describeApiError("CreateAdminModal", error, "Gagal membuat admin.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      dirty={Boolean(username || password)}
      title="Tambah Admin"
      description="Admin baru bisa mengelola materi, soal, dan mahasiswa, tapi tidak bisa menambah atau menghapus admin lain."
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
            form="create-admin-form"
            loading={loading}
          >
            Simpan Admin
          </Button>
        </>
      }
    >
      <form
        id="create-admin-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Input
          id="admin-username"
          label="Username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="Contoh: admin.dosen"
          autoComplete="off"
          required
          minLength={rules.username.minLength}
          maxLength={rules.username.maxLength}
        />

        <Input
          id="admin-password"
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={`Minimal ${rules.password.minLength} karakter`}
          autoComplete="new-password"
          required
          minLength={rules.password.minLength}
          maxLength={rules.password.maxLength}
        />
      </form>
    </Modal>
  );
}
