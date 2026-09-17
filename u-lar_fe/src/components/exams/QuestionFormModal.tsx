import { useState } from "react";
import type { FormEvent } from "react";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { useToast } from "../common/toastContext";
import { getApiErrorMessage } from "../../services/apiError";
import {
  createQuestion,
  updateQuestion,
} from "../../services/examBankApi";
import { VALIDATION } from "../../config/validation";
import type { ExamQuestionItem } from "../../types/examBank";
import type { ExamQuestionType } from "../../types/exam";

const rules = VALIDATION.exam;

interface OptionDraft {
  optionText: string;
  isCorrect: boolean;
}

interface QuestionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
  examId: number;
  /** Kosong berarti menambah soal baru. */
  question?: ExamQuestionItem | null;
}

function createEmptyOptions(): OptionDraft[] {
  return [
    { optionText: "", isCorrect: true },
    { optionText: "", isCorrect: false },
  ];
}

const typeOptions = [
  { value: "multiple_choice", label: "Pilihan Ganda" },
  { value: "essay", label: "Uraian" },
] as const;

export default function QuestionFormModal({
  open,
  onClose,
  onSaved,
  examId,
  question = null,
}: QuestionFormModalProps) {
  // Isian dimulai dari soal yang diberikan. Pemanggil hanya memasang modal ini
  // saat terbuka, jadi membuka soal lain selalu menghasilkan form yang bersih.
  const [type, setType] = useState<ExamQuestionType>(
    question?.type ?? "multiple_choice"
  );
  const [questionText, setQuestionText] = useState(
    question?.questionText ?? ""
  );
  const [image, setImage] = useState(question?.image ?? "");
  const [answerKey, setAnswerKey] = useState(question?.answerKey ?? "");
  const [options, setOptions] = useState<OptionDraft[]>(() =>
    question && question.options.length >= rules.option.minCount
      ? question.options.map((option) => ({
          optionText: option.optionText,
          isCorrect: option.isCorrect,
        }))
      : createEmptyOptions()
  );
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  function handleClose() {
    if (loading) {
      return;
    }

    onClose();
  }

  function markCorrect(index: number) {
    setOptions((current) =>
      current.map((option, optionIndex) => ({
        ...option,
        isCorrect: optionIndex === index,
      }))
    );
  }

  function updateOptionText(index: number, value: string) {
    setOptions((current) =>
      current.map((option, optionIndex) =>
        optionIndex === index
          ? { ...option, optionText: value }
          : option
      )
    );
  }

  function addOption() {
    setOptions((current) => [
      ...current,
      { optionText: "", isCorrect: false },
    ]);
  }

  function removeOption(index: number) {
    setOptions((current) => {
      const next = current.filter(
        (_, optionIndex) => optionIndex !== index
      );

      // Pilihan yang dibuang bisa saja pilihan yang ditandai benar.
      if (!next.some((option) => option.isCorrect) && next.length > 0) {
        next[0] = { ...next[0], isCorrect: true };
      }

      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = questionText.trim();

    if (!trimmedQuestion) {
      toast.error("Teks soal wajib diisi.");
      return;
    }

    let payloadOptions: OptionDraft[] | null = null;

    if (type === "multiple_choice") {
      const trimmedOptions = options.map((option) => ({
        ...option,
        optionText: option.optionText.trim(),
      }));

      if (trimmedOptions.length < rules.option.minCount) {
        toast.error(
          `Soal pilihan ganda minimal ${rules.option.minCount} pilihan jawaban.`
        );
        return;
      }

      if (trimmedOptions.some((option) => option.optionText === "")) {
        toast.error("Teks pilihan jawaban tidak boleh kosong.");
        return;
      }

      if (trimmedOptions.filter((option) => option.isCorrect).length !== 1) {
        toast.error(
          "Tandai tepat satu pilihan jawaban sebagai jawaban benar."
        );
        return;
      }

      payloadOptions = trimmedOptions;
    }

    const request = {
      type,
      questionText: trimmedQuestion,
      image: image.trim() === "" ? null : image.trim(),
      answerKey:
        type === "essay" && answerKey.trim() !== ""
          ? answerKey.trim()
          : null,
      options: payloadOptions,
    };

    try {
      setLoading(true);

      const message = question
        ? (await updateQuestion(question.id, request)).message
        : (await createQuestion(examId, request)).message;

      onSaved(message);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        getApiErrorMessage(error, "Gagal menyimpan soal.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={question ? "Ubah Soal" : "Tambah Soal"}
      description={
        question
          ? `Soal nomor ${question.orderNumber}.`
          : "Soal baru ditaruh di urutan paling akhir."
      }
      size="lg"
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Batal
          </Button>

          <Button
            type="submit"
            form="question-form"
            loading={loading}
          >
            Simpan Soal
          </Button>
        </>
      }
    >
      <form
        id="question-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div
          role="group"
          aria-label="Tipe soal"
          className="flex items-center gap-1 rounded-lg border border-border bg-surface-muted p-1"
        >
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setType(option.value)}
              aria-pressed={type === option.value}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                type === option.value
                  ? "bg-surface text-fg shadow-sm"
                  : "text-fg-subtle hover:bg-surface hover:text-fg"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="question-text"
            className="block text-sm font-medium text-fg-muted"
          >
            Teks Soal
          </label>

          <textarea
            id="question-text"
            value={questionText}
            onChange={(event) =>
              setQuestionText(event.target.value)
            }
            rows={4}
            maxLength={rules.question.maxLength}
            placeholder="Tulis pertanyaan di sini..."
            className="w-full resize-y rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-border"
            required
          />

          <p className="text-xs text-fg-subtle">
            {questionText.length}/{rules.question.maxLength} karakter
          </p>
        </div>

        <Input
          id="question-image"
          label="URL Gambar (opsional)"
          type="text"
          value={image}
          onChange={(event) => setImage(event.target.value)}
          placeholder="https://..."
          helperText="Kosongkan kalau soal tidak memakai gambar."
        />

        {type === "multiple_choice" ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-fg-muted">
                Pilihan Jawaban
              </p>

              <p className="mt-0.5 text-xs text-fg-subtle">
                Pilih satu radio di sebelah kiri untuk menandai
                jawaban benar.
              </p>
            </div>

            <div className="space-y-2">
              {options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2"
                >
                  <label className="mt-3 flex shrink-0 items-center">
                    <input
                      type="radio"
                      name="correct-option"
                      checked={option.isCorrect}
                      onChange={() => markCorrect(index)}
                      className="size-4 accent-[var(--color-accent)]"
                    />

                    <span className="sr-only">
                      Tandai pilihan {index + 1} sebagai jawaban benar
                    </span>
                  </label>

                  <input
                    type="text"
                    value={option.optionText}
                    onChange={(event) =>
                      updateOptionText(index, event.target.value)
                    }
                    maxLength={rules.option.maxLength}
                    placeholder={`Pilihan ${index + 1}`}
                    aria-label={`Teks pilihan ${index + 1}`}
                    className="w-full rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm text-fg outline-none transition placeholder:text-fg-placeholder focus:border-accent focus:ring-2 focus:ring-accent-border"
                  />

                  <IconButton
                    variant="danger"
                    label={`Hapus pilihan ${index + 1}`}
                    title="Hapus pilihan"
                    disabled={
                      options.length <= rules.option.minCount
                    }
                    onClick={() => removeOption(index)}
                    className="mt-1"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="size-4"
                    >
                      <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
                    </svg>
                  </IconButton>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={options.length >= rules.option.maxCount}
              onClick={addOption}
            >
              + Tambah Pilihan
            </Button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label
              htmlFor="question-answer-key"
              className="block text-sm font-medium text-fg-muted"
            >
              Kunci Jawaban (opsional)
            </label>

            <textarea
              id="question-answer-key"
              value={answerKey}
              onChange={(event) =>
                setAnswerKey(event.target.value)
              }
              rows={4}
              maxLength={rules.answerKey.maxLength}
              placeholder="Tulis jawaban acuan di sini, misalnya poin-poin yang harus muncul di jawaban mahasiswa..."
              className="w-full resize-y rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm leading-relaxed text-fg outline-none transition placeholder:text-fg-placeholder focus:border-accent focus:ring-2 focus:ring-accent-border"
            />

            <p className="text-xs text-fg-subtle">
              Hanya dilihat admin sebagai pengingat saat menilai —
              tidak tampil di web ujian mahasiswa. Jawaban uraian tetap
              dinilai manual. {answerKey.length}/
              {rules.answerKey.maxLength} karakter
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
}
