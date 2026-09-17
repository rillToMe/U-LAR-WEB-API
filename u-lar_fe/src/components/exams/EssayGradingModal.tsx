import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../common/toastContext";
import { getApiErrorMessage } from "../../services/apiError";
import {
  getEssayGrading,
  gradeEssays,
} from "../../services/examBankApi";
import type {
  EssayAnswerItem,
  EssayGradingResponse,
  EssayStudentGroup,
  GradeEssayRequest,
} from "../../types/examBank";

interface EssayGradingModalProps {
  open: boolean;
  examId: number;
  onClose: () => void;
}

/** Kunci state isian nilai: pasangan (result, soal). */
function scoreKey(resultId: number, questionId: number) {
  return `${resultId}:${questionId}`;
}

/** Soal dianggap terjawab hanya kalau ada teks, bukan cuma baris kosong. */
function hasAnswer(
  answer: EssayAnswerItem
): answer is EssayAnswerItem & { answerText: string } {
  return (
    answer.answerText !== null && answer.answerText.trim() !== ""
  );
}

function ScoreInput({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-fg-subtle">
        {label}
      </label>

      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="w-20 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-sm tabular-nums text-fg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-border"
      />

      <span className="text-xs text-fg-subtle">/ 100</span>
    </div>
  );
}

/**
 * Penilaian manual jawaban uraian, dua tahap: pilih mahasiswa dulu, baru
 * semua soal uraiannya muncul. Soal yang tidak dijawab tetap ditampilkan
 * (dicoret) supaya dosen melihat mana yang kosong — bukan cuma yang terisi.
 */
export default function EssayGradingModal({
  open,
  examId,
  onClose,
}: EssayGradingModalProps) {
  const toast = useToast();

  const [data, setData] = useState<EssayGradingResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /** null = masih di daftar mahasiswa. */
  const [selectedResultId, setSelectedResultId] = useState<
    number | null
  >(null);

  /** Penanda awal isi modal, dipakai untuk mereset posisi gulir. */
  const topRef = useRef<HTMLDivElement>(null);

  // Karena tinggi modal tetap, area isinya yang menggulir. Pindah tahap
  // selalu mulai dari atas — jangan mewarisi posisi gulir tahap sebelumnya.
  useEffect(() => {
    topRef.current?.scrollIntoView({ block: "start" });
  }, [selectedResultId]);

  /** Isian nilai saat ini (string agar input kosong bisa diketik). */
  const [scores, setScores] = useState<Record<string, string>>({});

  /** Nilai akhir terbaru per resultId setelah menyimpan. */
  const [finalScores, setFinalScores] = useState<
    Record<number, { score: number; passed: boolean }>
  >({});
  const [savingResultId, setSavingResultId] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    getEssayGrading(examId)
      .then((response) => {
        if (cancelled) {
          return;
        }

        setData(response);
        setError("");

        const next: Record<string, string> = {};

        response.students.forEach((group) => {
          group.answers.forEach((answer) => {
            const key = scoreKey(group.resultId, answer.questionId);

            next[key] = answer.score === null ? "" : String(answer.score);
          });
        });

        setScores(next);
      })
      .catch((loadError) => {
        if (cancelled) {
          return;
        }

        console.error(loadError);
        setError(
          getApiErrorMessage(
            loadError,
            "Gagal memuat jawaban uraian."
          )
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
  }, [examId, open]);

  const selectedGroup =
    data?.students.find(
      (group) => group.resultId === selectedResultId
    ) ?? null;

  /** Jumlah soal yang benar-benar ada jawabannya pada grup terpilih. */
  const answerableCount = selectedGroup
    ? selectedGroup.answers.filter((answer) => hasAnswer(answer)).length
    : 0;

  function updateScore(resultId: number, questionId: number, value: string) {
    setScores((prev) => ({
      ...prev,
      [scoreKey(resultId, questionId)]: value,
    }));
  }

  async function handleSave(group: EssayStudentGroup) {
    const grades: GradeEssayRequest[] = [];

    for (const answer of group.answers) {
      // Soal yang tidak dijawab tidak punya isian, jadi otomatis dilewati.
      if (!hasAnswer(answer)) {
        continue;
      }

      const raw = scores[scoreKey(group.resultId, answer.questionId)];

      // Kosong berarti soal ini sengaja belum dinilai — lewati.
      if (raw === undefined || raw.trim() === "") {
        continue;
      }

      const value = Number(raw);

      if (!Number.isInteger(value) || value < 0 || value > 100) {
        toast.error(
          `Nilai soal ${answer.orderNumber} untuk ${group.studentName} harus bilangan 0-100.`
        );
        return;
      }

      grades.push({ questionId: answer.questionId, score: value });
    }

    if (grades.length === 0) {
      toast.error("Isi minimal satu nilai sebelum menyimpan.");
      return;
    }

    setSavingResultId(group.resultId);

    try {
      const result = await gradeEssays(group.resultId, grades);

      // Nilai tersimpan: perbarui tampilan tanpa memuat ulang seluruh data.
      setData((prev) =>
        prev
          ? {
              ...prev,
              students: prev.students.map((item) =>
                item.resultId === group.resultId
                  ? {
                      ...item,
                      answers: item.answers.map((answer) => {
                        const grade = grades.find(
                          (x) => x.questionId === answer.questionId
                        );

                        return grade
                          ? { ...answer, score: grade.score }
                          : answer;
                      }),
                    }
                  : item
              ),
            }
          : prev
      );

      setFinalScores((prev) => ({
        ...prev,
        [group.resultId]: { score: result.score, passed: result.passed },
      }));

      toast.success(
        `Nilai ${group.studentName} tersimpan. Nilai akhir: ${result.score}.`
      );
    } catch (saveError) {
      console.error(saveError);
      toast.error(
        getApiErrorMessage(saveError, "Gagal menyimpan nilai uraian.")
      );
    } finally {
      setSavingResultId(null);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        selectedGroup
          ? "Lembar Jawaban Uraian"
          : "Penilaian Jawaban Uraian"
      }
      description={
        selectedGroup
          ? `${selectedGroup.studentName} • NIM ${selectedGroup.studentNim} • Percobaan ke-${selectedGroup.attempt}`
          : data
            ? `${data.students.length} mahasiswa mengumpulkan ujian ini. Pilih satu untuk menilai.`
            : undefined
      }
      // Lebih lebar dari modal lain (max-w-3xl): isinya teks jawaban uraian
      // yang harus dibaca dosen, jadi jangan dibikin sempit.
      size="xl"
      // Tinggi tetap: pindah dari daftar mahasiswa ke lembar jawaban tidak
      // mengubah ukuran kotak modalnya, cuma isinya yang berganti.
      fixedHeight
      // Salah klik di luar modal tidak boleh langsung menutup penilaian —
      // admin harus memastikan dulu.
      confirmOnClose
      confirmOnCloseText={{
        title: "Tutup penilaian ini?",
        description:
          "Nilai yang sudah ditekan Simpan tetap tersimpan. Nilai yang belum disimpan akan hilang.",
        confirmLabel: "Ya, Tutup",
      }}
      footer={
        selectedGroup ? (
          <>
            <Button
              type="button"
              variant="secondary"
              disabled={savingResultId === selectedGroup.resultId}
              onClick={() => setSelectedResultId(null)}
            >
              Kembali ke Daftar
            </Button>

            <Button
              type="button"
              loading={savingResultId === selectedGroup.resultId}
              disabled={answerableCount === 0}
              onClick={() => void handleSave(selectedGroup)}
            >
              Simpan Nilai
            </Button>
          </>
        ) : undefined
      }
    >
      <div ref={topRef} aria-hidden="true" />

      {loading && (
        <div
          role="status"
          aria-label="Memuat jawaban uraian"
          className="space-y-3"
        >
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <span className="sr-only">Memuat jawaban uraian...</span>
        </div>
      )}

      {!loading && error !== "" && (
        <div
          role="alert"
          className="rounded-xl border border-danger-border bg-danger-surface p-4"
        >
          <p className="text-sm font-semibold text-danger">
            Jawaban gagal dimuat
          </p>

          <p className="mt-1 text-sm text-danger">{error}</p>
        </div>
      )}

      {!loading &&
        error === "" &&
        data &&
        data.students.length === 0 && (
          <div className="py-8 text-center">
            <p className="font-medium text-fg">
              Belum ada mahasiswa yang mengumpulkan
            </p>

            <p className="mt-1 text-sm text-fg-subtle">
              Mahasiswa muncul di sini setelah mengumpulkan ujian
              ini.
            </p>
          </div>
        )}

      {/* Tahap 1: daftar mahasiswa */}
      {!loading &&
        error === "" &&
        data &&
        data.students.length > 0 &&
        !selectedGroup && (
          <ul className="space-y-3">
            {data.students.map((group) => {
              const answeredCount = group.answers.filter(
                (answer) => hasAnswer(answer)
              ).length;

              const pendingCount = group.answers.filter(
                (answer) => hasAnswer(answer) && answer.score === null
              ).length;

              const final = finalScores[group.resultId];

              return (
                <li
                  key={group.resultId}
                  className="rounded-2xl border border-border bg-surface-muted p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-fg">
                        {group.studentName}
                      </p>

                      <p className="mt-0.5 text-xs text-fg-subtle">
                        NIM {group.studentNim} • Percobaan ke-
                        {group.attempt} •{" "}
                        {new Date(group.submittedAt).toLocaleString(
                          "id-ID"
                        )}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-medium text-fg-muted">
                          {answeredCount}/{group.answers.length} soal
                          dijawab
                        </span>

                        {answeredCount === 0 ? (
                          <span className="rounded-full bg-surface-hover px-2.5 py-0.5 text-[11px] font-medium text-fg-subtle">
                            Semua soal tidak dijawab
                          </span>
                        ) : pendingCount > 0 ? (
                          <span className="rounded-full bg-warning-surface px-2.5 py-0.5 text-[11px] font-medium text-warning">
                            {pendingCount} belum dinilai
                          </span>
                        ) : (
                          <span className="rounded-full bg-success-surface px-2.5 py-0.5 text-[11px] font-medium text-success-fg">
                            Sudah dinilai
                          </span>
                        )}

                        {final && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              final.passed
                                ? "bg-success-surface text-success-fg"
                                : "bg-danger-surface text-danger"
                            }`}
                          >
                            Nilai akhir {final.score}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setSelectedResultId(group.resultId)
                      }
                    >
                      Nilai Essay
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

      {/* Tahap 2: seluruh soal uraian mahasiswa terpilih */}
      {!loading && error === "" && selectedGroup && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-muted px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-fg">
                {selectedGroup.studentName}
              </p>

              <p className="mt-0.5 text-xs text-fg-subtle">
                Dikumpulkan{" "}
                {new Date(selectedGroup.submittedAt).toLocaleString(
                  "id-ID"
                )}
              </p>
            </div>

            {finalScores[selectedGroup.resultId] && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  finalScores[selectedGroup.resultId].passed
                    ? "bg-success-surface text-success-fg"
                    : "bg-danger-surface text-danger"
                }`}
              >
                Nilai akhir{" "}
                {finalScores[selectedGroup.resultId].score}
              </span>
            )}
          </div>

          {answerableCount === 0 && (
            <p className="rounded-xl border border-warning-border bg-warning-surface px-4 py-3 text-xs text-fg-muted">
              Mahasiswa ini tidak menjawab satu pun soal uraian, jadi
              tidak ada yang bisa dinilai. Soal kosong tetap
              ditampilkan di bawah sebagai bukti.
            </p>
          )}

          {selectedGroup.answers.map((answer) => (
            <div
              key={answer.questionId}
              className={`rounded-xl border p-4 ${
                hasAnswer(answer)
                  ? "border-border bg-surface"
                  : "border-dashed border-border-strong bg-surface-muted"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p
                  className={`text-xs font-semibold ${
                    hasAnswer(answer)
                      ? "text-fg-subtle"
                      : "text-fg-placeholder"
                  }`}
                >
                  Soal {answer.orderNumber}
                </p>

                {answer.score !== null ? (
                  <span className="rounded-full bg-accent-surface px-2.5 py-0.5 text-[11px] font-medium text-accent">
                    Sudah dinilai: {answer.score}
                  </span>
                ) : (
                  hasAnswer(answer) && (
                    <span className="rounded-full bg-warning-surface px-2.5 py-0.5 text-[11px] font-medium text-warning">
                      Belum dinilai
                    </span>
                  )
                )}
              </div>

              <p
                className={`mt-1.5 text-sm font-medium ${
                  hasAnswer(answer)
                    ? "text-fg"
                    : "text-fg-subtle line-through decoration-fg-placeholder"
                }`}
              >
                {answer.questionText}
              </p>

              {answer.answerKey && (
                <div className="mt-2 rounded-lg border border-accent-border bg-accent-surface px-3 py-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                    Kunci Jawaban
                  </p>

                  <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-fg-muted">
                    {answer.answerKey}
                  </p>
                </div>
              )}

              {hasAnswer(answer) ? (
                <>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-fg-placeholder">
                    Jawaban Mahasiswa
                  </p>

                  <p className="mt-1 whitespace-pre-line rounded-lg border border-border bg-surface-muted p-3 text-sm leading-relaxed text-fg-muted">
                    {answer.answerText}
                  </p>

                  <div className="mt-3">
                    <ScoreInput
                      label={`Nilai untuk ${selectedGroup.studentName}`}
                      value={
                        scores[
                          scoreKey(
                            selectedGroup.resultId,
                            answer.questionId
                          )
                        ] ?? ""
                      }
                      onChange={(value) =>
                        updateScore(
                          selectedGroup.resultId,
                          answer.questionId,
                          value
                        )
                      }
                    />
                  </div>
                </>
              ) : (
                <p className="mt-2 rounded-lg border border-dashed border-border-strong bg-surface px-3 py-2 text-xs font-medium text-fg-subtle">
                  Tidak dijawab mahasiswa - tidak ada jawaban yang bisa
                  dinilai.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
