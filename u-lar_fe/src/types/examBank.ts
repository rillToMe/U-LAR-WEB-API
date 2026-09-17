import type { ExamQuestionType } from "./exam";

export interface ExamSummaryItem {
  id: number;
  title: string;
  description: string | null;
  passingScore: number;
  durationMinutes: number;
  isActive: boolean;
  questionCount: number;
  studentCount: number;
  createdAt: string;
}

export interface ExamOptionItem {
  id: number;
  optionText: string;
  isCorrect: boolean;
}

export interface ExamQuestionItem {
  id: number;
  orderNumber: number;
  type: ExamQuestionType;
  questionText: string;
  image: string | null;
  /** Jawaban acuan soal uraian untuk admin; null untuk pilihan ganda. */
  answerKey: string | null;
  options: ExamOptionItem[];
}

export interface ExamDetail {
  id: number;
  title: string;
  description: string | null;
  passingScore: number;
  durationMinutes: number;
  isActive: boolean;
  studentCount: number;
  questions: ExamQuestionItem[];
}

export interface SaveExamRequest {
  title: string;
  description: string | null;
  passingScore: number;
  durationMinutes: number;
}

export interface SaveOptionRequest {
  optionText: string;
  isCorrect: boolean;
}

export interface SaveQuestionRequest {
  type: ExamQuestionType;
  questionText: string;
  image: string | null;
  /** Hanya dipakai soal uraian; server mengabaikannya untuk pilihan ganda. */
  answerKey: string | null;
  /** Diabaikan server untuk soal uraian. */
  options: SaveOptionRequest[] | null;
}

export interface ExamMessageResponse {
  message: string;
}

export interface ExamCreatedResponse extends ExamMessageResponse {
  id: number;
}

/* Penilaian manual jawaban uraian. */

export interface EssayAnswerItem {
  questionId: number;
  orderNumber: number;
  questionText: string;
  /** Kunci jawaban sebagai acuan penilaian, null kalau tidak diisi. */
  answerKey: string | null;
  /** null berarti soal ini tidak dijawab mahasiswa. */
  answerText: string | null;
  /** Nilai 0-100 kalau sudah dinilai, null jika masih menunggu. */
  score: number | null;
}

export interface EssayStudentGroup {
  resultId: number;
  studentName: string;
  studentNim: string;
  attempt: number;
  submittedAt: string;
  answers: EssayAnswerItem[];
}

export interface EssayGradingResponse {
  examId: number;
  examTitle: string;
  students: EssayStudentGroup[];
}

export interface GradeEssayRequest {
  questionId: number;
  score: number;
}

export interface EssayGradingResultResponse {
  resultId: number;
  studentName: string;
  studentNim: string;
  score: number;
  passed: boolean;
  message: string;
}
