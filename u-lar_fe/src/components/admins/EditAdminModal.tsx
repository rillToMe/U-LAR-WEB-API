import { useState } from "react";
import type { FormEvent } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { useToast } from "../common/toastContext";
import { describeApiError } from "../../services/apiError";
import { updateAdmin } from "../../services/adminUserApi";
import { VALIDATION } from "../../config/validation";
import type { AdminListItem } from "../../types/admin";

const rules = VALIDATION.admin;

interface EditAdminModalProps {
  admin: AdminListItem | null;
  /** True kalau admin yang diedit adalah akun yang sedang login. */
  isSelf: boolean;
  onClose: () => void;
  onSaved: (username: string) => void;
}

export default function EditAdminModal({
  admin,
  isSelf,
  onClose,
  onSaved,
}: EditAdminModalProps) {
  // Username awal diambil dari akun yang sedang diedit. Pemanggil memasang
  // modal dengan key={id}, jadi state ikut ter-reset tiap kali target berubah.
  const [username, setUsername] = useState(() => admin?.username ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const target = admin;

  function handleClose() {
    if (loading) {
      return;
    }

    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (target === null) {
      return;
    }

    const trimmedUsername = username.trim();
    const wantsPassword = password !== "";

    if (!wantsPassword && trimmedUsername === target.username) {
      toast.error("Tidak ada yang diubah.");
      return;
    }

    if (!wantsPassword && trimmedUsername === "") {
      toast.error("Username tidak boleh dikosongkan.");
      return;
    }

    try {
      setLoading(true);

      const updated = await updateAdmin(target.id, {
        username: trimmedUsername,
        password: wantsPassword ? password : undefined,
      });

      onSaved(updated.username);
      onClose();
    } catch (error) {
      toast.error(
        describeApiError("EditAdminModal", error, "Gagal mengubah admin.")
      );
    } finally {
      setLoading(false);
    }
  }

  if (target === null) {
    return null;
  }

  return (
    <Modal
      open={admin !== null}
      onClose={handleClose}
      title={isSelf ? "Ubah Akun Anda" : `Ubah ${target.username}`}
      description={
        isSelf
          ? "Ganti username atau password yang dipakai untuk masuk ke panel admin."
          : "Kosongkan password kalau hanya ingin mengganti username."
      }
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
            form="edit-admin-form"
            loading={loading}
          >
            Simpan Perubahan
          </Button>
        </>
      }
    >
      <form
        id="edit-admin-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Input
          id="edit-admin-username"
          label="Username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="off"
          minLength={rules.username.minLength}
          maxLength={rules.username.maxLength}
        />

        <Input
          id="edit-admin-password"
          label="Password Baru"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Kosongkan untuk mempertahankan password lama"
          autoComplete="new-password"
          minLength={rules.password.minLength}
          maxLength={rules.password.maxLength}
        />
      </form>
    </Modal>
  );
}
