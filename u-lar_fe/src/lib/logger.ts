/**
 * Logger berkonteks untuk membantu debugging di Development.
 *
 * Setiap entri diberi label `[scope] pesan` supaya dari console langsung
 * terlihat operasi mana yang gagal (contoh: `[StudentsPage] load gagal`).
 * `debug`/`info` hanya tampil saat Development; `warn`/`error` tetap jalan
 * di production karena penting untuk diagnosa lapangan.
 *
 * Ganti pola `console.error(error)` telanjang dengan:
 *   logger.error("StudentsPage", "load daftar mahasiswa gagal", error);
 */

type Scope = string;

const isDev = import.meta.env.DEV;

function tag(scope: Scope, message: string): string {
  return `[${scope}] ${message}`;
}

export const logger = {
  debug(scope: Scope, message: string, ...args: unknown[]): void {
    if (isDev) {
      console.debug(tag(scope, message), ...args);
    }
  },

  info(scope: Scope, message: string, ...args: unknown[]): void {
    if (isDev) {
      console.info(tag(scope, message), ...args);
    }
  },

  warn(scope: Scope, message: string, ...args: unknown[]): void {
    console.warn(tag(scope, message), ...args);
  },

  error(scope: Scope, message: string, ...args: unknown[]): void {
    console.error(tag(scope, message), ...args);
  },
};
