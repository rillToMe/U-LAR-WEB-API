import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { logger } from "../../lib/logger";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Menangkap crash render React supaya pengguna melihat kartu kesalahan yang
 * bisa dimengerti, bukan layar putih. Detail lengkap tetap masuk console
 * lewat logger untuk debugging.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error("ErrorBoundary", "Render crash tak terduga", error, info);
  }

  handleReset = (): void => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error === null) {
      return this.props.children;
    }

    return (
      <div
        role="alert"
        className="flex min-h-dvh items-center justify-center bg-surface-muted p-6"
      >
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-link">
            Kesalahan
          </p>

          <h1 className="mt-2 text-xl font-bold text-fg">
            Terjadi kesalahan tak terduga
          </h1>

          <p className="mt-3 text-sm leading-6 text-fg-subtle">
            Halaman ini gagal ditampilkan. Coba muat ulang; kalau masih
            berlanjut, hubungi pengelola laboratorium.
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg transition-colors hover:bg-primary-hover"
            >
              Muat ulang halaman
            </button>

            <button
              type="button"
              onClick={this.handleReset}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-surface-hover"
            >
              Coba lagi
            </button>
          </div>
        </div>
      </div>
    );
  }
}
