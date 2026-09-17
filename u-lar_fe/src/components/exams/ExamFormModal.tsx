import { useState } from "react";
import type { FormEvent } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { useToast } from "../common/toastContext";
import { getApiErrorMessage } from "../../services/apiError";
import { createExam, updateExam } from "../../services/examBankApi";
import { VALIDATION } from "../../config/validation";

const rules = VALIDATION.exam;

export interface ExamFormInitial {
  id: number;
  title: string;
  description: string | null;
  passingScore: number;
  durationMinutes: number;
}

interface ExamFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
  /** Kosong berarti membuat ujian baru. */
  initial?: ExamFormInitial | null;
}

export default function ExamFormModal({
  open,
  onClose,
  onSaved,
  initial = null,
}: ExamFormModalProps) {
  // Isian dimulai dari data yang diberikan. Pemanggil hanya memasang modal ini
  // saat benar-benar terbuka, jadi tiap kali dibuka state-nya dibuat ulang dan
  // tidak ada sisa editan dari sesi sebelumnya.
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(
    initial?.description ?? ""
  );
  const [passingScore, setPassingScore] = useState(
    String(initial?.passingScore ?? rules.passingScore.default)
  );
  const [durationMinutes, setDurationMinutes] = useState(
    String(initial?.durationMinutes ?? rules.durationMinutes.default)
  );
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  function handleClose() {
    if (loading) {
      return;
    }

    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const score = Number(passingScore);
    const duration = Number(durationMinutes);

    if (!trimmedTitle) {
      toast.error("Judul ujian wajib diisi.");
      return;
    }

    if (
      !Number.isInteger(score) ||
      score < rules.passingScore.min ||
      score > rules.passingScore.max
    ) {
      toast.error(
        `Nilai kelulusan harus angka ${rules.passingScore.min}–${rules.passingScore.max}.`
      );
      return;
    }

    if (
      !Number.isInteger(duration) ||
      duration < rules.durationMinutes.min ||
      duration > rules.durationMinutes.max
    ) {
      toast.error(
        `Durasi harus angka ${rules.durationMinutes.min}–${rules.durationMinutes.max} menit.`
      );
      return;
    }

    const request = {
      title: trimmedTitle,
      description: description.trim() === "" ? null : description.trim(),
      passingScore: score,
      durationMinutes: duration,
    };

    try {
      setLoading(true);

      const message = initial
        ? (await updateExam(initial.id, request)).message
        : (
            await createExam(request)
          ).message;

      onSaved(message);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(
        getApiErrorMessage(error, "Gagal menyimpan ujian.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={initial ? "Ubah Ujian" : "Buat Ujian Baru"}
      description={
        initial
          ? "Perubahan berlaku untuk percobaan berikutnya."
          : "Isi identitas ujian dulu, soalnya ditambahkan setelah ini."
      }
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
            form="exam-form"
            loading={loading}
          >
            {initial ? "Simpan Perubahan" : "Buat Ujian"}
          </Button>
        </>
      }
    >
      <form
        id="exam-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <Input
          id="exam-title"
          label="Judul Ujian"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Contoh: Ujian Akhir Instalasi Kabel"
          maxLength={rules.title.maxLength}
          required
        />

        <div className="space-y-1.5">
          <label
            htmlFor="exam-description"
            className="block text-sm font-medium text-fg-muted"
          >
            Deskripsi
          </label>

          <textarea
            id="exam-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            maxLength={rules.description.maxLength}
            placeholder="Petunjuk singkat ujian (opsional)"
            className="w-full resize-y rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-sm text-fg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent-border"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="exam-passing-score"
            label="Nilai Kelulusan"
            type="number"
            value={passingScore}
            onChange={(event) => setPassingScore(event.target.value)}
            min={rules.passingScore.min}
            max={rules.passingScore.max}
            helperText={`${rules.passingScore.min}–${rules.passingScore.max}`}
            required
          />

          <Input
            id="exam-duration"
            label="Durasi (menit)"
            type="number"
            value={durationMinutes}
            onChange={(event) =>
              setDurationMinutes(event.target.value)
            }
            min={rules.durationMinutes.min}
            max={rules.durationMinutes.max}
            helperText={`${rules.durationMinutes.min}–${rules.durationMinutes.max} menit`}
            required
          />
        </div>
      </form>
    </Modal>
  );
}
