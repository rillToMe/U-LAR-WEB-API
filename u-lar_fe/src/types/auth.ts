export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  adminId: number;
  username: string;
  role: string;
  accessToken: string;
}
