import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useToast } from "../../components/common/toastContext";
import { getApiErrorMessage } from "../../services/apiError";
import {
  getExamToken,
  loginStudent,
  saveExamSession,
} from "../../services/examApi";

export default function ExamLoginPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Sudah punya sesi? Langsung ke daftar ujian, tidak perlu login dua kali.
  if (getExamToken()) {
    return <Navigate to="/ujian" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedNim = nim.trim();

    if (!trimmedNim || !password) {
      toast.error("NIM dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const result = await loginStudent({
        nim: trimmedNim,
        password,
      });

      saveExamSession(result);
      toast.success(`Selamat mengerjakan, ${result.name}.`);
      navigate("/ujian", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(
        getApiErrorMessage(
          error,
          "Gagal masuk. Periksa NIM dan password Anda."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100dvh-3rem)] flex-col justify-center">
      <div className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-fg">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="size-7"
          >
            <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5Z" />
            <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5Z" />
            <path d="M8.5 9.5h.01M15.5 9.5h.01" />
          </svg>
        </div>

        <h1 className="mt-4 text-2xl font-bold text-fg">
          Web Ujian U-LAR
        </h1>

        <p className="mt-2 text-sm leading-6 text-fg-subtle">
          Masuk dengan NIM Anda untuk mulai mengerjakan ujian.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-sm"
      >
        <Input
          id="exam-nim"
          label="NIM"
          type="text"
          value={nim}
          onChange={(event) => setNim(event.target.value)}
          placeholder="Contoh: 23076052"
          autoComplete="username"
          inputMode="numeric"
          autoFocus
          required
        />

        <Input
          id="exam-password"
          label="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password akun mahasiswa"
          autoComplete="current-password"
          required
        />

        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="w-full"
        >
          Masuk
        </Button>
      </form>

      <p className="mt-6 text-center text-xs leading-5 text-fg-subtle">
        Sulit masuk? Hubungi dosen atau admin laboratorium untuk
        memeriksa akun Anda.
      </p>
    </div>
  );
}
