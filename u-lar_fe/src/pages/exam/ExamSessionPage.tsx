import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ThemeProvider } from "../../components/common/theme";
import { useToast } from "../../components/common/toastContext";
import ExamHeader from "../../components/exam/ExamHeader";
import QuestionCard from "../../components/exam/QuestionCard";
import type { SaveState } from "../../components/exam/QuestionCard";
import QuestionNavigator, {
  QuestionGrid,
  QuestionLegend,
} from "../../components/exam/QuestionNavigator";
import SubmitConfirmModal from "../../components/exam/SubmitConfirmModal";
import Button from "../../components/ui/Button";
import IconButton from "../../components/ui/IconButton";
import Skeleton from "../../components/ui/Skeleton";
import { useCountdownTimer } from "../../hooks/useCountdownTimer";
import { useExamSecurity, useFullscreen } from "../../hooks/useExamSecurity";
import { getApiErrorMessage } from "../../services/apiError";
import {
  getExamSession,
  saveExamAnswer,
  saveExamAnswerBeacon,
  saveQuestionFlag,
  submitExam,
} from "../../services/examApi";
import type {
  ExamQuestionType,
  ExamSession,
  QuestionMarker,
  SaveAnswerRequest,
} from "../../types/exam";

/**
 * Jeda sebelum jawaban uraian disimpan. Tanpa jeda ini, satu halaman jawaban
 * berarti puluhan request ke server.
 */
const ESSAY_SAVE_DELAY_MS = 900;

function ChevronLeftIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`size-4 shrink-0 ${className}`}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`size-4 shrink-0 ${className}`}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

interface AnswerDraft {
  selectedOptionId: number | null;
  answerText: string;
}

function buildDrafts(session: ExamSession): Record<number, AnswerDraft> {
  const drafts: Record<number, AnswerDraft> = {};

  session.questions.forEach((question) => {
    drafts[question.id] = {
      selectedOptionId: question.selectedOptionId,
      answerText: question.answerText ?? "",
    };
  });

  return drafts;
}

function buildFlags(session: ExamSession): Record<number, boolean> {
  const flags: Record<number, boolean> = {};

  session.questions.forEach((question) => {
    flags[question.id] = question.isFlagged;
  });

  return flags;
}

function isAnswered(
  draft: AnswerDraft | undefined,
  type: ExamQuestionType
): boolean {
  if (!draft) {
    return false;
  }

  return type === "essay"
    ? draft.answerText.trim().length > 0
    : draft.selectedOptionId !== null;
}

function SessionSkeleton() {
  return (
    <div
      role="status"
      aria-label="Menyiapkan soal ujian"
      className="space-y-4"
    >
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="rounded-2xl border border-border bg-surface p-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="mt-4 h-5 w-full" />
        <Skeleton className="mt-2 h-5 w-4/5" />
        <div className="mt-5 space-y-2.5">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <span className="sr-only">Menyiapkan soal ujian...</span>
    </div>
  );
}

export default function ExamSessionPage() {
  const { resultId: resultIdParam } = useParams<{
    resultId: string;
  }>();
  const resultId = Number(resultIdParam);
  const navigate = useNavigate();
  const toast = useToast();

  const [session, setSession] = useState<ExamSession | null>(null);
  const [drafts, setDrafts] = useState<Record<number, AnswerDraft>>({});
  const [saveStates, setSaveStates] = useState<
    Record<number, SaveState>
  >({});
  /** Tanda "ragu-ragu" per soal, tersimpan di server juga. */
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  /** Soal yang tandanya sedang dikirim  tombolnya dikunci sementara. */
  const [flagging, setFlagging] = useState<Record<number, boolean>>(
    {}
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [fullscreenNoticeHidden, setFullscreenNoticeHidden] =
    useState(false);

  /** Menjaga supaya pengumpulan (manual maupun otomatis) tidak jalan dua kali. */
  const submitGuardRef = useRef(false);
  const essayTimersRef = useRef<
    Record<number, ReturnType<typeof setTimeout>>
  >({});
  /** Nilai terbaru jawaban uraian yang belum terkirim ke server. */
  const essayPendingRef = useRef<Record<number, string>>({});

  const { remainingSeconds, sync, syncFromServer } =
    useCountdownTimer(() => {
      void handleSubmit(true);
    });

  /** Ujian benar-benar sedang dikerjakan: bukan memuat, bukan mengumpulkan. */
  const examRunning = !loading && session !== null && !submitting;

  useExamSecurity(examRunning);
  const fullscreen = useFullscreen();

  /**
   * Ujian sudah dikumpulkan di server (termasuk kasus waktu habis) sementara
   * klien belum tahu. Mengumpulkan ulang aman karena endpoint submit
   * idempotent  hasilnya yang tersimpan, bukan error.
   */
  const recoverToResult = useCallback(async () => {
    try {
      const summary = await submitExam(resultId);
      navigate(`/ujian/hasil/${summary.resultId}`, { replace: true });
    } catch {
      navigate(`/ujian/hasil/${resultId}`, { replace: true });
    }
  }, [navigate, resultId]);

  useEffect(() => {
    let cancelled = false;

    getExamSession(resultId)
      .then((data) => {
        if (cancelled) {
          return;
        }

        setSession(data);
        setDrafts(buildDrafts(data));
        setFlags(buildFlags(data));
        setSaveStates({});
        setCurrentIndex(0);
        setLoadError("");

        // Sisa waktu dari server inilah yang dipakai berjalan.
        sync(data.remainingSeconds);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        if (isAxiosError(error) && error.response?.status === 409) {
          void recoverToResult();
          return;
        }

        console.error(error);
        setLoadError(
          getApiErrorMessage(error, "Gagal memuat soal ujian.")
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [resultId, sync, recoverToResult]);

  const persist = useCallback(
    async (questionId: number, request: SaveAnswerRequest) => {
      setSaveStates((prev) => ({ ...prev, [questionId]: "saving" }));

      try {
        const saved = await saveExamAnswer(
          resultId,
          questionId,
          request
        );

        setSaveStates((prev) => ({ ...prev, [questionId]: "saved" }));

        // Jam di layar hanya boleh mendekat ke angka server, tidak mundur.
        syncFromServer(saved.remainingSeconds);
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 409) {
          setSaveStates((prev) => ({ ...prev, [questionId]: "idle" }));

          // Kalau pengumpulan sedang berjalan, biarkan proses itu yang
          // mengarahkan ke halaman hasil  jangan lomba navigasi.
          if (!submitGuardRef.current) {
            void recoverToResult();
          }

          return;
        }

        console.error(error);
        setSaveStates((prev) => ({ ...prev, [questionId]: "error" }));
        toast.error(
          getApiErrorMessage(
            error,
            "Jawaban gagal disimpan ke server. Periksa koneksi lalu pilih ulang jawabannya."
          )
        );
      }
    },
    [recoverToResult, resultId, syncFromServer, toast]
  );

  /** Mengirim jawaban uraian yang masih menunggu jeda ketik. */
  const flushEssays = useCallback(async () => {
    const pending = Object.entries(essayPendingRef.current);

    Object.values(essayTimersRef.current).forEach(clearTimeout);
    essayTimersRef.current = {};
    essayPendingRef.current = {};

    await Promise.all(
      pending.map(([questionId, text]) =>
        persist(Number(questionId), {
          selectedOptionId: null,
          answerText: text,
        })
      )
    );
  }, [persist]);

  /**
   * Mengirim draf uraian yang belum terkirim tanpa menunggu balasan. Dipakai
   * saat halaman disembunyikan, ditinggalkan, atau mau ditutup  momen-momen
   * yang tidak sempat menunggu request biasa.
   */
  const flushWithBeacon = useCallback(() => {
    Object.entries(essayPendingRef.current).forEach(
      ([questionId, text]) =>
        saveExamAnswerBeacon(resultId, Number(questionId), {
          selectedOptionId: null,
          answerText: text,
        })
    );
  }, [resultId]);

  // HP dikunci / aplikasi ditaruh ke background: jawaban uraian terakhir yang
  // belum terkirim tetap disimpan tanpa menunggu balasan.
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        flushWithBeacon();
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange
      );

      Object.values(essayTimersRef.current).forEach(clearTimeout);
      flushWithBeacon();
    };
  }, [flushWithBeacon]);

  async function handleSubmit(auto: boolean) {
    if (!session || submitGuardRef.current) {
      return;
    }

    submitGuardRef.current = true;
    setSubmitting(true);

    try {
      await flushEssays();

      const summary = await submitExam(session.resultId);

      toast.success(
        auto
          ? "Waktu habis  jawaban Anda dikumpulkan otomatis."
          : "Ujian berhasil dikumpulkan."
      );

      navigate(`/ujian/hasil/${summary.resultId}`, { replace: true });
    } catch (error) {
      console.error(error);
      submitGuardRef.current = false;
      setSubmitting(false);
      setConfirmOpen(false);

      toast.error(
        getApiErrorMessage(
          error,
          "Gagal mengumpulkan ujian. Periksa koneksi lalu coba lagi."
        )
      );
    }
  }

  function handleSelectOption(questionId: number, optionId: number) {
    // Simpan ke state dulu: tampilan tidak boleh menunggu jaringan.
    setDrafts((prev) => ({
      ...prev,
      [questionId]: { selectedOptionId: optionId, answerText: "" },
    }));

    void persist(questionId, {
      selectedOptionId: optionId,
      answerText: null,
    });
  }

  function handleChangeAnswerText(questionId: number, value: string) {
    setDrafts((prev) => ({
      ...prev,
      [questionId]: { selectedOptionId: null, answerText: value },
    }));

    essayPendingRef.current[questionId] = value;

    const existing = essayTimersRef.current[questionId];

    if (existing) {
      clearTimeout(existing);
    }

    essayTimersRef.current[questionId] = setTimeout(() => {
      delete essayTimersRef.current[questionId];
      delete essayPendingRef.current[questionId];

      void persist(questionId, {
        selectedOptionId: null,
        answerText: value,
      });
    }, ESSAY_SAVE_DELAY_MS);
  }

  async function handleToggleFlag(questionId: number) {
    if (flagging[questionId]) {
      return;
    }

    const next = !flags[questionId];

    // Tanda langsung berubah di layar: ini penanda untuk diri sendiri, tidak
    // perlu menunggu jaringan untuk terasa responsif.
    setFlags((prev) => ({ ...prev, [questionId]: next }));
    setFlagging((prev) => ({ ...prev, [questionId]: true }));

    try {
      const saved = await saveQuestionFlag(resultId, questionId, next);

      // Server yang menentukan hasil akhirnya (mis. waktu kebetulan habis).
      setFlags((prev) => ({ ...prev, [questionId]: saved.flagged }));
    } catch (error) {
      // Layar tidak boleh menampilkan tanda yang tidak tersimpan.
      setFlags((prev) => ({ ...prev, [questionId]: !next }));
      console.error(error);

      if (isAxiosError(error) && error.response?.status === 409) {
        void recoverToResult();
        return;
      }

      toast.error(
        getApiErrorMessage(
          error,
          "Tanda ragu-ragu gagal disimpan. Periksa koneksi lalu coba lagi."
        )
      );
    } finally {
      setFlagging((prev) => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    }
  }

  const questions = session?.questions ?? [];
  const currentQuestion = questions[currentIndex];
  const currentDraft = currentQuestion
    ? drafts[currentQuestion.id]
    : undefined;

  const markers: QuestionMarker[] = questions.map(
    (question, index) => ({
      id: question.id,
      number: index + 1,
      answered: isAnswered(drafts[question.id], question.type),
      flagged: flags[question.id] ?? false,
    })
  );

  const answeredCount = markers.filter(
    (marker) => marker.answered
  ).length;

  const flaggedCount = markers.filter(
    (marker) => marker.flagged
  ).length;

  const unansweredCount = questions.length - answeredCount;

  const pendingEssayCount = questions.filter(
    (question) =>
      question.type === "essay" &&
      isAnswered(drafts[question.id], question.type)
  ).length;

  function goToIndex(index: number) {
    setCurrentIndex(
      Math.min(Math.max(index, 0), questions.length - 1)
    );
  }

  function handleMarkerSelect(questionId: number) {
    const index = questions.findIndex(
      (question) => question.id === questionId
    );

    if (index >= 0) {
      goToIndex(index);
    }

    setNavigatorOpen(false);
    setConfirmOpen(false);
  }

  function openConfirm() {
    setNavigatorOpen(false);
    setConfirmOpen(true);
  }

  return (
    <ThemeProvider>
      <div className="exam-theme flex min-h-dvh flex-col bg-surface-muted">
        {loading && (
          <div className="mx-auto w-full max-w-md px-4 py-6">
            <SessionSkeleton />
          </div>
        )}

        {!loading && loadError !== "" && (
          <div className="mx-auto w-full max-w-md px-4 py-8">
            <div
              role="alert"
              className="rounded-2xl border border-danger-border bg-danger-surface p-5"
            >
              <p className="text-sm font-semibold text-danger">
                Soal ujian gagal dimuat
              </p>

              <p className="mt-1 text-sm text-danger">{loadError}</p>

              <div className="mt-4 flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={() => window.location.reload()}
                >
                  Coba Lagi
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/ujian")}
                >
                  Kembali ke Daftar Ujian
                </Button>
              </div>
            </div>
          </div>
        )}

        {!loading && session && currentQuestion && (
          <>
            <ExamHeader
              examTitle={session.examTitle}
              questionNumber={currentIndex + 1}
              totalQuestions={questions.length}
              answeredCount={answeredCount}
              remainingSeconds={remainingSeconds}
            />

            {fullscreen.supported &&
              !fullscreen.active &&
              !fullscreenNoticeHidden &&
              !submitting && (
                <div className="border-b border-warning-border bg-warning-surface">
                  <div className="mx-auto flex w-full max-w-md items-center gap-3 px-4 py-2.5">
                    <p className="flex-1 text-xs text-fg-muted">
                      Sebaiknya kerjakan ujian dalam mode layar
                      penuh.
                    </p>

                    <Button
                      type="button"
                      size="sm"
                      onClick={fullscreen.enter}
                    >
                      Layar Penuh
                    </Button>

                    <IconButton
                      size="sm"
                      label="Tutup pengingat layar penuh"
                      onClick={() => setFullscreenNoticeHidden(true)}
                      className="text-fg-subtle"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        aria-hidden="true"
                        className="size-4"
                      >
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </IconButton>
                  </div>
                </div>
              )}

            {/* Desktop: soal di kiri, panel navigasi di kanan. Mobile: satu
                kolom seperti semula. */}
            <div className="mx-auto flex w-full flex-1 items-start gap-6 lg:max-w-7xl lg:px-6 lg:py-6">
              <main className="mx-auto w-full max-w-md flex-1 px-4 py-4 pb-28 lg:max-w-3xl lg:px-0 lg:pb-6 lg:pt-2">
                <QuestionCard
                question={currentQuestion}
                number={currentIndex + 1}
                selectedOptionId={currentDraft?.selectedOptionId ?? null}
                answerText={currentDraft?.answerText ?? ""}
                saveState={saveStates[currentQuestion.id] ?? "idle"}
                flagged={flags[currentQuestion.id] ?? false}
                flagging={flagging[currentQuestion.id] ?? false}
                onSelectOption={(optionId) =>
                  handleSelectOption(currentQuestion.id, optionId)
                }
                onChangeAnswerText={(value) =>
                  handleChangeAnswerText(currentQuestion.id, value)
                }
                onToggleFlag={() =>
                  void handleToggleFlag(currentQuestion.id)
                }
              />

                {/* Tombol kumpulkan sengaja TIDAK ada di sini  hanya di
                    soal terakhir, supaya tidak ada jalan pintas mengumpulkan
                    sebelum semua soal dilewati. */}
                <p className="mt-4 text-center text-xs leading-5 text-fg-subtle">
                  Jawaban tersimpan otomatis setiap kali Anda memilih
                  jawaban. Ujian dikumpulkan dari soal terakhir.
                </p>

                {/* Navigasi desktop: bilah bawah hanya ada di layar sempit. */}
                <div className="mt-5 hidden items-center gap-3 lg:flex">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    disabled={currentIndex === 0 || submitting}
                    onClick={() => goToIndex(currentIndex - 1)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {/* translate-y-px: penyelarasan optik  tanpa ini chevron
                          terlihat sedikit melayang di atas garis teks. */}
                      <ChevronLeftIcon className="translate-y-px" />
                      Sebelumnya
                    </span>
                  </Button>

                  {currentIndex === questions.length - 1 ? (
                    <Button
                      type="button"
                      className="flex-1"
                      disabled={submitting}
                      onClick={openConfirm}
                    >
                      Kumpulkan
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      disabled={submitting}
                      onClick={() => goToIndex(currentIndex + 1)}
                    >
                      <span className="inline-flex items-center gap-1">
                        Berikutnya
                        <ChevronRightIcon className="translate-y-px" />
                      </span>
                    </Button>
                  )}
                </div>
              </main>

              {/* Kanan: panel navigasi permanen (desktop saja)  versi layar
                  lebar dari bottom sheet "Navigasi Soal": seluruh status
                  ujian terlihat sekaligus tanpa membuka apa pun. */}
              <aside
                aria-label="Navigasi soal"
                className="sticky top-28 hidden w-80 shrink-0 self-start rounded-2xl border border-border bg-surface p-5 shadow-sm lg:block"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-subtle">
                    Navigasi Soal
                  </h2>

                  <span className="text-sm font-semibold tabular-nums text-fg">
                    {currentIndex + 1}
                    <span className="text-fg-subtle">
                      /{questions.length}
                    </span>
                  </span>
                </div>

                <div className="mt-3">
                  <QuestionLegend />
                </div>

                <div className="mt-3">
                  <QuestionGrid
                    markers={markers}
                    currentId={currentQuestion.id}
                    onSelect={handleMarkerSelect}
                  />
                </div>

                {(flaggedCount > 0 || unansweredCount > 0) && (
                  <div className="mt-4 space-y-1 rounded-xl border border-warning-border bg-warning-surface px-3 py-2.5 text-xs text-fg-muted">
                    {flaggedCount > 0 && (
                      <p>
                        <span className="font-semibold text-warning">
                          {flaggedCount} soal
                        </span>{" "}
                        ditandai ragu-ragu.
                      </p>
                    )}

                    {unansweredCount > 0 && (
                      <p>
                        <span className="font-semibold text-warning">
                          {unansweredCount} soal
                        </span>{" "}
                        belum dijawab.
                      </p>
                    )}
                  </div>
                )}

                {/* Aturan yang sama dengan mobile: kumpulkan hanya dari
                    soal terakhir. */}
                {currentIndex === questions.length - 1 ? (
                  <Button
                    type="button"
                    className="mt-4 w-full"
                    disabled={submitting}
                    onClick={openConfirm}
                  >
                    Kumpulkan Ujian
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-4 w-full"
                    disabled={submitting}
                    onClick={() => goToIndex(questions.length - 1)}
                  >
                    <span className="inline-flex items-center gap-1">
                      Ke Soal Terakhir
                      <ChevronRightIcon className="translate-y-px" />
                    </span>
                  </Button>
                )}
              </aside>
            </div>

            <nav
              aria-label="Navigasi soal"
              className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
            >
              <div className="mx-auto flex w-full max-w-md items-center gap-2 px-3 py-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  disabled={currentIndex === 0 || submitting}
                  onClick={() => goToIndex(currentIndex - 1)}
                >
                  <span className="inline-flex items-center gap-1">
                    <ChevronLeftIcon className="translate-y-px" />
                    Sebelumnya
                  </span>
                </Button>

                <button
                  type="button"
                  onClick={() => setNavigatorOpen(true)}
                  aria-label={`Buka navigasi soal, sekarang di soal ${
                    currentIndex + 1
                  } dari ${questions.length}`}
                  className="flex h-11 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-border-strong bg-surface px-3.5 text-fg transition-colors duration-150 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-fg-subtle">
                    Soal
                  </span>

                  <span className="text-sm font-semibold tabular-nums leading-none">
                    {currentIndex + 1}
                    <span className="text-fg-subtle">
                      /{questions.length}
                    </span>
                  </span>
                </button>

                {currentIndex === questions.length - 1 ? (
                  <Button
                    type="button"
                    className="flex-1"
                    disabled={submitting}
                    onClick={openConfirm}
                  >
                    Kumpulkan
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    disabled={submitting}
                    onClick={() => goToIndex(currentIndex + 1)}
                  >
                    <span className="inline-flex items-center gap-1">
                      Berikutnya
                      <ChevronRightIcon className="translate-y-px" />
                    </span>
                  </Button>
                )}
              </div>
            </nav>

            <QuestionNavigator
              open={navigatorOpen}
              onClose={() => setNavigatorOpen(false)}
              markers={markers}
              currentId={currentQuestion.id}
              answeredCount={answeredCount}
              flaggedCount={flaggedCount}
              totalQuestions={questions.length}
              onSelect={handleMarkerSelect}
              onSubmit={openConfirm}
            />

            <SubmitConfirmModal
              open={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              onConfirm={() => void handleSubmit(false)}
              submitting={submitting}
              markers={markers}
              currentId={currentQuestion.id}
              totalQuestions={questions.length}
              answeredCount={answeredCount}
              pendingEssayCount={pendingEssayCount}
              remainingSeconds={remainingSeconds}
              onSelect={handleMarkerSelect}
            />
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
