export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  adminId: number;
  username: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  /** Umur access token dalam detik, dipakai client untuk menjadwalkan
   *  refresh senyap sendiri. */
  expiresInSeconds: number;
}

/** Bagian sesi yang diganti setiap kali token diperpanjang. */
export type SessionTokens = Pick<
  LoginResponse,
  "accessToken" | "refreshToken" | "expiresInSeconds"
>;
