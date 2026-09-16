export interface CreateStudentRequest {
  nim: string;
  name: string;
  email: string;
  password: string;
}

export interface StudentListParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface StudentListItem {
  id: number;
  nim: string;
  name: string;
  email: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface StudentDetail {
  id: number;
  nim: string;
  name: string;
  email: string;
  isActive: boolean;
  progressPercentage: number;
  totalMissionCompleted: number;
  averageScore: number | null;
}

export interface UpdateStudentRequest {
  nim: string;
  name: string;
  email: string;
}

export interface UpdateStudentResponse {
  message: string;
}

export interface ResetStudentPasswordRequest {
  newPassword: string;
}

export interface ResetStudentPasswordResponse {
  message: string;
}

export interface UpdateStudentStatusResponse {
  message: string;
}
