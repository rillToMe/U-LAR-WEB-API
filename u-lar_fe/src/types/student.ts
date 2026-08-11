export interface CreateStudentRequest {
  nim: string;
  name: string;
  email: string;
  password: string;
}

export interface StudentListItem {
  userId: number;
  nim: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}
