import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authApi";
import { getApiErrorMessage } from "../../services/apiError";
import { useToast } from "../../components/common/toastContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function LoginPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setLoading(true);

      const result = await login({ username, password });

      localStorage.setItem(
        "accessToken",
        result.accessToken
      );

      localStorage.setItem(
        "user",
        JSON.stringify({
          adminId: result.adminId,
          username: result.username,
          role: result.role,
        })
      );

      toast.success(`Berhasil masuk sebagai ${result.username}.`);
      navigate("/admin", { replace: true });
    } catch (error) {
      console.error(error);
      toast.error(
        getApiErrorMessage(
          error,
          "Gagal masuk. Periksa ID admin dan password."
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh bg-surface lg:grid-cols-[minmax(360px,0.9fr)_minmax(520px,1.1fr)]">
      <aside className="relative hidden overflow-hidden bg-[#101a2d] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div className="absolute -right-32 -top-32 size-96 rounded-full border border-cyan-300/20" />
        <div className="absolute -bottom-44 -left-24 size-[30rem] rounded-full border border-blue-200/10" />
        <div className="absolute right-16 top-1/3 size-2 rounded-full bg-cyan-300 shadow-[0_0_0_8px_rgba(103,232,249,0.1)]" />

        <div className="relative">
          <div className="h-24 w-52 overflow-hidden">
            <img
              src="/Logo2.png"
              alt="U-LAR"
              className="h-40 w-52 -translate-y-8 object-contain"
            />
          </div>
        </div>

        <div className="relative max-w-md py-16">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
            Laboratory administration ADMIN TEST 3 9999
          </p>
          <h2 className="text-4xl font-semibold leading-[1.08] tracking-tight xl:text-5xl">
            Kelola laboratorium dengan lebih terarah.
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-6 text-slate-300">
            Satu ruang kerja untuk mengatur data mahasiswa dan aktivitas laboratorium U-LAR.
          </p>
        </div>

        <div className="relative flex items-center gap-3 text-xs text-slate-400">
          <span className="size-2 rounded-full bg-emerald-400" />
          Sistem administrasi internal
        </div>
      </aside>

      <main className="flex min-h-dvh flex-col px-6 py-8 md:px-16 lg:px-20 xl:px-28">
        <div className="flex items-center gap-2.5 lg:hidden">
          <img
            src="/Logo.png"
            alt="U-LAR"
            className="h-12 w-36 object-contain object-left"
          />
        </div>

        <div className="flex flex-1 items-center py-12 max-md:py-16">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-link">
                Admin portal
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">
                Selamat datang kembali
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-fg-subtle">
                Masuk untuk melanjutkan pengelolaan administrasi laboratorium.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="username"
                label="Username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Masukkan username"
                autoComplete="username"
                autoFocus
                required
              />

              <Input
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
              />

              <Button type="submit" size="lg" loading={loading} className="mt-2 w-full shadow-sm">
                Masuk ke dashboard
              </Button>
            </form>
          </div>
        </div>

        <p className="text-sm text-fg-subtle">
          Butuh bantuan?{" "}
          <a
            href="mailto:admin@u-lar.ac.id"
            className="font-medium text-link underline-offset-4 hover:text-link-hover hover:underline"
          >
            Hubungi pengelola laboratorium
          </a>
        </p>
      </main>
    </div>
  );
}
