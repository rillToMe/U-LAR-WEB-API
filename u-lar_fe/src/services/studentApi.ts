import { api } from "./api";
import type {
  CreateStudentRequest,
  PagedResult,
  ResetStudentPasswordRequest,
  ResetStudentPasswordResponse,
  StudentDetail,
  StudentListItem,
  StudentListParams,
  UpdateStudentRequest,
  UpdateStudentResponse,
  UpdateStudentStatusResponse,
} from "../types/student";

export async function getStudents(
  params: StudentListParams = {},
  signal?: AbortSignal
): Promise<PagedResult<StudentListItem>> {
  const response = await api.get<PagedResult<StudentListItem>>(
    "/Admin/students",
    { params, signal }
  );

  return response.data;
}

export async function getStudentDetail(
  userId: number
): Promise<StudentDetail> {
  const response = await api.get<StudentDetail>(
    `/Admin/students/${userId}`
  );

  return response.data;
}

export async function updateStudent(
  userId: number,
  request: UpdateStudentRequest
): Promise<UpdateStudentResponse> {
  const response = await api.put<UpdateStudentResponse>(
    `/Admin/students/${userId}`,
    request
  );

  return response.data;
}

export async function createStudent(
  request: CreateStudentRequest
): Promise<void> {
  await api.post("/Admin/students", request);
}

export async function resetStudentPassword(
  userId: number,
  request: ResetStudentPasswordRequest
): Promise<ResetStudentPasswordResponse> {
  const response = await api.post<ResetStudentPasswordResponse>(
    `/Admin/students/${userId}/reset-password`,
    request
  );

  return response.data;
}

export async function updateStudentStatus(
  id: number,
  isActive: boolean
): Promise<UpdateStudentStatusResponse> {
  const response = await api.patch<UpdateStudentStatusResponse>(
    `/Admin/students/${id}/status`,
    { isActive }
  );

  return response.data;
}