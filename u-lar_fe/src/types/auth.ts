export interface LoginRequest {
  nim: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  nim: string;
  name: string;
  email: string;
  role: string;
  accessToken: string;
}