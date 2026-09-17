export type ExamQuestionType = "multiple_choice" | "essay";

/** Sama dengan konstanta ExamSessionStatuses di backend. */
export type ExamSessionStatus =
  | "not_started"
  | "in_progress"
  | "finished";

export interface StudentLoginRequest {
  nim: string;
  password: string;
}

export interface StudentUser {
  userId: number;
  nim: string;
  name: string;
  email: string;
  role: string;
}

export interface StudentLoginResponse extends StudentUser {
  accessToken: string;
  refreshToken: string;
}

/**
 * Status satu soal untuk navigasi & ringkasan sebelum mengumpulkan. Dihitung
 * dari jawaban yang sudah tersimpan, jadi bisa dipakai halaman mana pun.
 */
export interface QuestionMarker {
  id: number;
  number: number;
  answered: boolean;
  /** Ditandai "ragu-ragu" oleh mahasiswa untuk ditinjau ulang. */
  flagged: boolean;
}

export interface ExamListItem {
  id: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  passingScore: number;
  questionCount: number;
  status: ExamSessionStatus;
  resultId: number | null;
  attempt: number | null;
  /** Terisi hanya saat sesi masih berjalan. */
  remainingSeconds: number | null;
  score: number | null;
  passed: boolean | null;
}

/** Tanpa flag benar/salah — kunci jawaban hanya ada di server. */
export interface ExamSessionOption {
  id: number;
  optionText: string;
}

export interface ExamSessionQuestion {
  id: number;
  orderNumber: number;
  type: ExamQuestionType;
  questionText: string;
  image: string | null;
  options: ExamSessionOption[];
  selectedOptionId: number | null;
  answerText: string | null;
  isFlagged: boolean;
}

export interface ExamSession {
  resultId: number;
  examId: number;
  examTitle: string;
  durationMinutes: number;
  passingScore: number;
  attempt: number;
  remainingSeconds: number;
  totalQuestions: number;
  answeredCount: number;
  questions: ExamSessionQuestion[];
}

export interface SaveAnswerRequest {
  selectedOptionId: number | null;
  answerText: string | null;
}

export interface SaveQuestionFlagResponse {
  questionId: number;
  flagged: boolean;
  flaggedCount: number;
}

export interface SaveAnswerResponse {
  questionId: number;
  answeredCount: number;
  totalQuestions: number;
  remainingSeconds: number;
  savedAt: string;
}

export interface SubmitExamItem {
  questionId: number;
  orderNumber: number;
  type: ExamQuestionType;
  questionText: string;
  answered: boolean;
  isCorrect: boolean | null;
}

export interface ExamSummary {
  resultId: number;
  examId: number;
  examTitle: string;
  score: number;
  passingScore: number;
  passed: boolean;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  totalQuestions: number;
  pendingEssayCount: number;
  durationSeconds: number;
  startedAt: string;
  finishedAt: string;
  items: SubmitExamItem[];
}
