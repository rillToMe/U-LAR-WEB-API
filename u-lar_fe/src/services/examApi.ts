import axios from "axios";
import { API_BASE_URL } from "./api";
import type {
  ExamListItem,
  ExamSession,
  ExamSummary,
  SaveAnswerRequest,
  SaveAnswerResponse,
  SaveQuestionFlagResponse,
  StudentLoginRequest,
  StudentLoginResponse,
  StudentUser,
} from "../types/exam";

/**
 * Sesi mahasiswa disimpan di kunci sendiri, terpisah dari sesi admin
 * ("accessToken" / "user"). Kalau memakai kunci yang sama, admin yang sedang
 * login di laptop yang sama bisa ikut terpakai di web ujian — dan sebaliknya
 * token mahasiswa menendang sesi admin.
 */
const TOKEN_KEY = "examAccessToken";
const REFRESH_TOKEN_KEY = "examRefreshToken";
const USER_KEY = "examUser";

export const EXAM_LOGIN_PATH = "/ujian/login";

export function getExamToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getExamUser(): StudentUser | null {
  const raw = localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StudentUser;
  } catch {
    return null;
  }
}

export function saveExamSession(response: StudentLoginResponse) {
  localStorage.setItem(TOKEN_KEY, response.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      userId: response.userId,
      nim: response.nim,
      name: response.name,
      email: response.email,
      role: response.role,
    } satisfies StudentUser)
  );
}

export function clearExamSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/** Instance axios khusus ujian: baseURL sama, token dan penanganan 401 beda. */
export const examApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

examApi.interceptors.request.use((config) => {
  const token = getExamToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

examApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token mahasiswa berlaku sangat lama (login dari perangkat sendiri), jadi
    // 401 hampir selalu berarti akun dinonaktifkan admin, bukan token kedaluwarsa.
    if (error.response?.status === 401 && getExamToken()) {
      clearExamSession();

      if (window.location.pathname !== EXAM_LOGIN_PATH) {
        window.location.href = EXAM_LOGIN_PATH;
      }
    }

    return Promise.reject(error);
  }
);

export async function loginStudent(
  request: StudentLoginRequest
): Promise<StudentLoginResponse> {
  const response = await examApi.post<StudentLoginResponse>(
    "/Auth/login",
    request
  );

  return response.data;
}

export async function getExams(): Promise<ExamListItem[]> {
  const response = await examApi.get<ExamListItem[]>("/Exam");

  return response.data;
}

export async function startExam(examId: number): Promise<ExamSession> {
  const response = await examApi.post<ExamSession>(
    `/Exam/${examId}/start`
  );

  return response.data;
}

export async function getExamSession(
  resultId: number
): Promise<ExamSession> {
  const response = await examApi.get<ExamSession>(
    `/Exam/sessions/${resultId}`
  );

  return response.data;
}

export async function saveExamAnswer(
  resultId: number,
  questionId: number,
  request: SaveAnswerRequest
): Promise<SaveAnswerResponse> {
  const response = await examApi.put<SaveAnswerResponse>(
    `/Exam/sessions/${resultId}/answers/${questionId}`,
    request
  );

  return response.data;
}

/**
 * Menandai / melepas tanda "ragu-ragu". Soal yang ditandai belum tentu sudah
 * dijawab, jadi endpoint-nya terpisah dari auto-save jawaban.
 */
export async function saveQuestionFlag(
  resultId: number,
  questionId: number,
  flagged: boolean
): Promise<SaveQuestionFlagResponse> {
  const response = await examApi.put<SaveQuestionFlagResponse>(
    `/Exam/sessions/${resultId}/answers/${questionId}/flag`,
    { flagged }
  );

  return response.data;
}

export async function submitExam(
  resultId: number
): Promise<ExamSummary> {
  const response = await examApi.post<ExamSummary>(
    `/Exam/sessions/${resultId}/submit`
  );

  return response.data;
}

export async function getExamSummary(
  resultId: number
): Promise<ExamSummary> {
  const response = await examApi.get<ExamSummary>(
    `/Exam/sessions/${resultId}/summary`
  );

  return response.data;
}

/**
 * Menyimpan jawaban tanpa menunggu balasan — dipakai saat halaman ditinggalkan
 * atau HP dipindah ke background, di mana `await` tidak lagi dijamin selesai.
 * `keepalive` membuat browser tetap mengirim request walau halaman ditutup.
 */
export function saveExamAnswerBeacon(
  resultId: number,
  questionId: number,
  request: SaveAnswerRequest
) {
  const token = getExamToken();

  if (!token) {
    return;
  }

  void fetch(
    `${API_BASE_URL}/Exam/sessions/${resultId}/answers/${questionId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(request),
      keepalive: true,
    }
  ).catch(() => {
    // Titik terakhir sebelum halaman hilang — tidak ada lagi yang bisa
    // ditampilkan ke mahasiswa kalau gagal.
  });
}
