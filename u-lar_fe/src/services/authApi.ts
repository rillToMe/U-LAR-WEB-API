import { api } from "./api";
import type { LoginRequest, LoginResponse } from "../types/auth";

export async function login(
  request: LoginRequest
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/Auth/admin/login",
    request
  );

  return response.data;
}

/**
 * Menyerahkan refresh token ke server supaya dicabut, sehingga sesi tidak
 * bisa diperpanjang lagi dari perangkat ini.
 *
 * Endpoint-nya anonim dan idempotent: access token kedaluwarsa tidak
 * membuat panggilan ini gagal, dan token yang sudah dicabut juga
 * dianggap sukses. Jadi hasilnya tidak pernah perlu dibedakan.
 */
export async function logout(refreshToken: string): Promise<void> {
  await api.post("/Auth/admin/logout", { refreshToken });
}
