import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authApi";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import heroImage from "../assets/hero.png";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

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

      navigate("/admin", { replace: true });
    } catch (error) {
      console.error(error);
      setError("ID admin atau password salah.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-dvh bg-surface lg:grid-cols-2">
      {/* Form panel — brand atas, form tengah, footer bawah */}
      <div className="flex flex-col px-6 py-8 sm:px-12 lg:px-16">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-md bg-primary text-xs font-bold tracking-tight text-primary-fg">
            UL
          </span>

          <span className="font-semibold tracking-tight text-fg">
            U-LAR
          </span>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center py-12">
          <div className="w-full max-w-sm">
            <h1 className="text-3xl font-bold tracking-tight text-fg">
              Masuk sebagai Admin
            </h1>

            <p className="mt-2 text-sm text-fg-subtle">
              Halaman ini khusus admin laboratorium.
              Mahasiswa tidak memiliki akses.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >
              <Input
                id="username"
                label="Username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                placeholder="Masukkan Username"
                autoComplete="username"
                autoFocus
                required
              />

              <Input
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Masukkan password"
                autoComplete="current-password"
                required
              />

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-danger-border bg-danger-surface px-4 py-3"
                >
                  <p className="text-sm text-danger">
                    {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="w-full"
              >
                Masuk
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-fg-subtle">
          Butuh Bantuan?{" "}
          <a
            href="mailto:admin@u-lar.ac.id"
            className="font-medium text-link underline-offset-4 hover:text-link-hover hover:underline"
          >
            Hubungi pengelola laboratorium
          </a>
        </p>
      </div>

      {/* Visual panel */}
      <div className="relative hidden overflow-hidden bg-surface-dark lg:block">
        <img
          src={heroImage}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover opacity-60 grayscale"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/50 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-16">
          <p className="max-w-sm text-3xl font-semibold leading-tight tracking-tight text-fg-inverse">
            Sistem manajemen laboratorium U-LAR.
          </p>

          <p className="mt-4 max-w-sm text-sm leading-relaxed text-fg-inverse/60">
            Kelola akun mahasiswa, jadwal praktikum, dan
            data laboratorium dalam satu tempat.
          </p>
        </div>
      </div>
    </div>
  );
}
