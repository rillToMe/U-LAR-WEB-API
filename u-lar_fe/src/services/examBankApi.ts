import { api } from "./api";
import type {
  EssayGradingResponse,
  EssayGradingResultResponse,
  ExamCreatedResponse,
  ExamDetail,
  ExamMessageResponse,
  ExamSummaryItem,
  GradeEssayRequest,
  SaveExamRequest,
  SaveQuestionRequest,
} from "../types/examBank";

export async function getExams(): Promise<ExamSummaryItem[]> {
  const response = await api.get<ExamSummaryItem[]>("/ExamBank");

  return response.data;
}

export async function getExamDetail(
  examId: number
): Promise<ExamDetail> {
  const response = await api.get<ExamDetail>(`/ExamBank/${examId}`);

  return response.data;
}

export async function createExam(
  request: SaveExamRequest
): Promise<ExamCreatedResponse> {
  const response = await api.post<ExamCreatedResponse>(
    "/ExamBank",
    request
  );

  return response.data;
}

export async function updateExam(
  examId: number,
  request: SaveExamRequest
): Promise<ExamMessageResponse> {
  const response = await api.put<ExamMessageResponse>(
    `/ExamBank/${examId}`,
    request
  );

  return response.data;
}

export async function updateExamStatus(
  examId: number,
  isActive: boolean
): Promise<ExamMessageResponse> {
  const response = await api.patch<ExamMessageResponse>(
    `/ExamBank/${examId}/status`,
    { isActive }
  );

  return response.data;
}

export async function deleteExam(
  examId: number
): Promise<ExamMessageResponse> {
  const response = await api.delete<ExamMessageResponse>(
    `/ExamBank/${examId}`
  );

  return response.data;
}

export async function createQuestion(
  examId: number,
  request: SaveQuestionRequest
): Promise<ExamCreatedResponse> {
  const response = await api.post<ExamCreatedResponse>(
    `/ExamBank/${examId}/questions`,
    request
  );

  return response.data;
}

export async function updateQuestion(
  questionId: number,
  request: SaveQuestionRequest
): Promise<ExamMessageResponse> {
  const response = await api.put<ExamMessageResponse>(
    `/ExamBank/questions/${questionId}`,
    request
  );

  return response.data;
}

export async function deleteQuestion(
  questionId: number
): Promise<ExamMessageResponse> {
  const response = await api.delete<ExamMessageResponse>(
    `/ExamBank/questions/${questionId}`
  );

  return response.data;
}

export async function getEssayGrading(
  examId: number
): Promise<EssayGradingResponse> {
  const response = await api.get<EssayGradingResponse>(
    `/ExamBank/${examId}/essay-grading`
  );

  return response.data;
}

export async function gradeEssays(
  resultId: number,
  grades: GradeEssayRequest[]
): Promise<EssayGradingResultResponse> {
  const response = await api.post<EssayGradingResultResponse>(
    `/ExamBank/results/${resultId}/essay-grading`,
    { grades }
  );

  return response.data;
}
