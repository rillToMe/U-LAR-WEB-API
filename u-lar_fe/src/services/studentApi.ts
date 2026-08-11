import { api } from "./api";
import type {
  CreateStudentRequest,
  StudentListItem,
} from "../types/student";

export async function getStudents(): Promise<StudentListItem[]> {
  const response = await api.get<StudentListItem[]>(
    "/Admin/students"
  );

  return response.data;
}

export async function createStudent(
  request: CreateStudentRequest
): Promise<void> {
  await api.post("/Admin/students", request);
}