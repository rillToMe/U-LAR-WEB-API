export interface AdminListItem {
  id: number;
  username: string;
  /** "ADMIN" atau "SUPER_ADMIN" — sama dengan ADMIN_ROLE di lib/session. */
  role: string;
  createdAt: string;
}

export interface CreateAdminRequest {
  username: string;
  password: string;
}

export interface UpdateAdminRequest {
  username?: string;
  /** Kosong atau tidak diisi berarti password lama dipertahankan. */
  password?: string;
}
